import { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { fetchDiscoverCandidates } from "@hemdem/core/usecases/discover/fetchDiscoverCandidates";
import { likeUser } from "@hemdem/core/usecases/discover/likeUser";
import { sendMessage } from "@hemdem/core/usecases/chat/sendMessage";
import { repositories } from "../../lib/repositories";
import { useSession } from "../../lib/session";
import { colors, gradients, radii, spacing } from "../../lib/theme";
import { SwipeCard } from "../../components/SwipeCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { Button } from "../../components/ui/Button";
import { AppTopBar } from "../../components/nav/AppTopBar";
import { DiscoverFiltersModal } from "../../components/discover/DiscoverFiltersModal";

export default function DiscoverScreen() {
  const router = useRouter();
  const { userId } = useSession();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matchName, setMatchName] = useState(null);
  const [filters, setFilters] = useState({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [messageTarget, setMessageTarget] = useState(null);
  const [messageDraft, setMessageDraft] = useState("");
  const [messageSending, setMessageSending] = useState(false);
  const [messageError, setMessageError] = useState(null);

  useEffect(() => {
    if (!userId) return;
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
  }, [userId, filters]);

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
          <Text style={styles.filterButtonText}>⚙️ Filtrele</Text>
          {hasActiveFilter && <View style={styles.filterDot} />}
        </Pressable>
      </View>

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

      <Modal visible={Boolean(messageTarget)} transparent animationType="fade" onRequestClose={() => setMessageTarget(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{messageTarget?.name}'e mesaj gönder</Text>
            <TextInput
              style={styles.messageInput}
              value={messageDraft}
              onChangeText={setMessageDraft}
              placeholder="Mesajını yaz..."
              placeholderTextColor={colors.mutedDark}
              multiline
              autoFocus
            />
            {messageError && <Text style={styles.error}>{messageError}</Text>}
            <View style={styles.modalActions}>
              <Button variant="outline" style={styles.modalActionButton} onPress={() => setMessageTarget(null)}>
                Vazgeç
              </Button>
              <Button
                variant="primary"
                style={styles.modalActionButton}
                onPress={handleSendMessage}
                loading={messageSending}
                disabled={!messageDraft.trim()}
              >
                Gönder
              </Button>
            </View>
          </View>
        </View>
      </Modal>

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
    paddingTop: spacing.sm,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: colors.card,
  },
  filterButtonText: {
    color: colors.foreground,
    fontSize: 12,
    fontWeight: "600",
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
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
  messageInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.foreground,
    minHeight: 70,
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  modalActionButton: {
    flex: 1,
  },
});
