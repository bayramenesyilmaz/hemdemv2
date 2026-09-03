import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { fetchDiscoverCandidates } from "@hemdem/core/usecases/discover/fetchDiscoverCandidates";
import { fetchDailyMatch } from "@hemdem/core/usecases/discover/fetchDailyMatch";
import { likeUser } from "@hemdem/core/usecases/discover/likeUser";
import { sendMessage } from "@hemdem/core/usecases/chat/sendMessage";
import { repositories } from "../../lib/repositories";
import { useSession } from "../../lib/session";
import { colors, gradients, radii, spacing } from "../../lib/theme";
import { SwipeCard } from "../../components/SwipeCard";
import { InitialsAvatar } from "../../components/InitialsAvatar";
import { EmptyState } from "../../components/ui/EmptyState";
import { Button } from "../../components/ui/Button";
import { AppTopBar } from "../../components/nav/AppTopBar";
import { DiscoverFiltersModal } from "../../components/discover/DiscoverFiltersModal";
import { MessageComposerModal } from "../../components/MessageComposerModal";
import { VerificationBadge } from "../../components/VerificationBadge";
import { isRenderableImageUri } from "../../lib/avatar";

export default function DiscoverScreen() {
  const router = useRouter();
  const { userId } = useSession();
  const [candidates, setCandidates] = useState([]);
  const [dailyMatch, setDailyMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matchName, setMatchName] = useState(null);
  const [filters, setFilters] = useState({});
  // Filtreler henüz kullanıcının kendi ülkesiyle tohumlanmadan bir kez
  // filtresiz sorgu atılmasın diye — bkz. aşağıdaki iki useEffect.
  const [filtersReady, setFiltersReady] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [messageTarget, setMessageTarget] = useState(null);
  const [messageDraft, setMessageDraft] = useState("");
  const [messageSending, setMessageSending] = useState(false);
  const [messageError, setMessageError] = useState(null);

  // Kullanıcının ülkesini varsayılan filtre olarak tohumlar — "yakınındaki
  // kişileri gör" beklentisi web'deki DiscoverFilterRedirect ile aynı
  // mantık. Bir kez çalışır; sonrasında kullanıcı filtre modalından
  // istediği gibi değiştirip "Herhangi"ye genişletebilir.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    repositories.user.findById(userId).then((profile) => {
      if (cancelled) return;
      setFilters((prev) => (profile?.country ? { ...prev, country: profile.country } : prev));
      setFiltersReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    fetchDailyMatch(repositories, userId).then((result) => {
      if (cancelled || result.status !== "success") return;
      setDailyMatch(result.data?.profile ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId || !filtersReady) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      const result = await fetchDiscoverCandidates(repositories, userId, filters);
      if (cancelled) return;
      setLoading(false);
      if (result.status === "error") {
        setError(result.message);
        return;
      }
      setCandidates(result.data);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [userId, filtersReady, filters]);

  async function handleSwiped(candidateId, action) {
    // Kartın kendisi hemen kaldırılır (akıcı his için) — beğeni isteği
    // arka planda gönderilir, gate-test gibi reddedilme durumları
    // (henüz mobilde ele alınmıyor) sessizce yutulur.
    const candidate = candidates.find((c) => c.id === candidateId);
    setCandidates((prev) => prev.filter((c) => c.id !== candidateId));

    const result = await likeUser(repositories, userId, candidateId, action);
    if (result.status === "success" && result.data.matched && candidate) {
      setMatchName(candidate.name);
    }
  }

  function handleButtonSwipe(action) {
    const current = candidates[0];
    if (current) handleSwiped(current.id, action);
  }

  function openMessage() {
    const current = candidates[0];
    if (current) {
      setMessageError(null);
      setMessageDraft("");
      setMessageTarget(current);
    }
  }

  async function handleSendMessage() {
    const content = messageDraft.trim();
    if (!content || !messageTarget) return;
    setMessageSending(true);
    setMessageError(null);
    const result = await sendMessage(repositories, userId, messageTarget.id, content);
    setMessageSending(false);
    if (result.status === "error") {
      setMessageError(result.message);
      return;
    }
    setMessageTarget(null);
    router.push(`/messages/${result.data.chat.id}`);
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <AppTopBar />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <AppTopBar />
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
        </View>
      </View>
    );
  }

  const hasActiveFilter = Boolean(filters.gender || filters.country || filters.minAge || filters.maxAge);

  return (
    <View style={styles.container}>
      <AppTopBar />

      <View style={styles.filterRow}>
        <Pressable style={styles.filterButton} onPress={() => setFiltersOpen(true)}>
          <Text style={styles.filterButtonText}>⚙️</Text>
          {hasActiveFilter && <View style={styles.filterDot} />}
        </Pressable>
      </View>

      {dailyMatch && (
        <Pressable style={styles.dailyMatchCard} onPress={() => router.push(`/u/${dailyMatch.id}`)}>
          {isRenderableImageUri(dailyMatch.avatarUrl) ? (
            <Image source={{ uri: dailyMatch.avatarUrl }} style={styles.dailyMatchAvatar} />
          ) : (
            <InitialsAvatar name={dailyMatch.name} size={40} />
          )}
          <View style={styles.dailyMatchBody}>
            <Text style={styles.dailyMatchLabel}>✨ Günün Eşleşmesi</Text>
            <View style={styles.dailyMatchNameRow}>
              <Text style={styles.dailyMatchName} numberOfLines={1}>
                {dailyMatch.name}
              </Text>
              {dailyMatch.verificationStatus === "approved" && <VerificationBadge size={14} />}
            </View>
          </View>
          <Text style={styles.dailyMatchCta}>Profiline bak</Text>
        </Pressable>
      )}

      <View style={styles.deck}>
        {candidates.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="Şu an gösterilecek kimse yok"
            description="Filtrelerini genişletmeyi dene ya da daha sonra tekrar bak."
          />
        ) : (
          candidates
            .slice(0, 2)
            .reverse()
            .map((candidate, index, arr) => (
              <SwipeCard
                key={candidate.id}
                candidate={candidate}
                isTop={index === arr.length - 1}
                onSwiped={handleSwiped}
              />
            ))
        )}
      </View>

      {candidates.length > 0 && (
        <View style={styles.actions}>
          <Pressable style={styles.nopeButton} onPress={() => handleButtonSwipe("dislike")}>
            <Text style={styles.nopeButtonText}>✕</Text>
          </Pressable>
          <Pressable style={styles.messageButton} onPress={openMessage}>
            <Text style={styles.messageButtonText}>💬</Text>
          </Pressable>
          <Pressable style={styles.likeButtonWrap} onPress={() => handleButtonSwipe("like")}>
            <LinearGradient colors={gradients.primary} style={styles.likeButton}>
              <Text style={styles.likeButtonText}>♥</Text>
            </LinearGradient>
          </Pressable>
        </View>
      )}

      <DiscoverFiltersModal
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onApply={setFilters}
      />

      <MessageComposerModal
        visible={Boolean(messageTarget)}
        recipientName={messageTarget?.name}
        draft={messageDraft}
        onChangeDraft={setMessageDraft}
        onCancel={() => setMessageTarget(null)}
        onSend={handleSendMessage}
        sending={messageSending}
        error={messageError}
      />

      <Modal visible={Boolean(matchName)} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEmoji}>🎉</Text>
            <Text style={styles.modalTitle}>Eşleştiniz!</Text>
            <Text style={styles.modalBody}>{matchName} ile eşleştin. Şimdi mesajlaşmaya başlayabilirsin.</Text>
            <Button variant="primary" onPress={() => setMatchName(null)} style={styles.modalButton}>
              Kaydırmaya Devam Et
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xs,
  },
  // AppTopBar'daki çıplak 34x34 ikon-buton (bell/coin) ile aynı ölçü ve
  // dokunma hedefi — üstündeki bardan görsel olarak kopmasın diye.
  filterButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  filterButtonText: {
    fontSize: 18,
  },
  filterDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.background,
  },
  dailyMatchCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginHorizontal: spacing.xl,
    marginTop: spacing.xs,
    padding: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: colors.primarySoft,
  },
  dailyMatchAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  dailyMatchBody: {
    flex: 1,
    minWidth: 0,
  },
  dailyMatchLabel: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "700",
  },
  dailyMatchNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dailyMatchName: {
    color: colors.foreground,
    fontSize: 14,
    fontWeight: "600",
    flexShrink: 1,
  },
  dailyMatchCta: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  deck: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    color: colors.danger,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  nopeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nopeButtonText: {
    color: colors.mutedForeground,
    fontSize: 24,
    fontWeight: "700",
  },
  messageButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageButtonText: {
    fontSize: 20,
  },
  likeButtonWrap: {
    borderRadius: 34,
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  likeButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  likeButtonText: {
    color: "#fff",
    fontSize: 28,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.xs,
  },
  modalEmoji: {
    fontSize: 40,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  modalTitle: {
    color: colors.foreground,
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  modalBody: {
    color: colors.mutedForeground,
    fontSize: 14,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  modalButton: {
    width: "100%",
  },
});
