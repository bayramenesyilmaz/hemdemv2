import { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { fetchDiscoverCandidates } from "@hemdem/core/usecases/discover/fetchDiscoverCandidates";
import { likeUser } from "@hemdem/core/usecases/discover/likeUser";
import { repositories } from "../../lib/repositories";
import { useSession } from "../../lib/session";
import { colors, gradients, radii, spacing } from "../../lib/theme";
import { SwipeCard } from "../../components/SwipeCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { Button } from "../../components/ui/Button";
import { Screen } from "../../components/ui/Screen";

export default function DiscoverScreen() {
  const { userId } = useSession();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matchName, setMatchName] = useState(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      const result = await fetchDiscoverCandidates(repositories, userId);
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
  }, [userId]);

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

  if (loading) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </Screen>
    );
  }

  return (
    <Screen contentStyle={styles.screenContent}>
      <Text style={styles.title}>Keşfet</Text>

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
          <Pressable style={styles.likeButtonWrap} onPress={() => handleButtonSwipe("like")}>
            <LinearGradient colors={gradients.primary} style={styles.likeButton}>
              <Text style={styles.likeButtonText}>♥</Text>
            </LinearGradient>
          </Pressable>
        </View>
      )}

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
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  screenContent: {
    flex: 1,
    paddingBottom: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.foreground,
    marginBottom: spacing.md,
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
    gap: spacing.xl,
    paddingVertical: spacing.lg,
  },
  nopeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nopeButtonText: {
    color: colors.mutedForeground,
    fontSize: 26,
    fontWeight: "700",
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
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  likeButtonText: {
    color: "#fff",
    fontSize: 30,
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
    alignItems: "center",
    gap: spacing.xs,
  },
  modalEmoji: {
    fontSize: 40,
    marginBottom: spacing.xs,
  },
  modalTitle: {
    color: colors.foreground,
    fontSize: 20,
    fontWeight: "800",
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
