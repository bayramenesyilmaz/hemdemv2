import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { fetchIncomingLikes } from "@hemdem/core/usecases/discover/fetchIncomingLikes";
import { likeUser } from "@hemdem/core/usecases/discover/likeUser";
import { repositories } from "../../lib/repositories";
import { useSession } from "../../lib/session";
import { colors, radii, spacing } from "../../lib/theme";
import { InitialsAvatar } from "../InitialsAvatar";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";

export function LikesList({ contentContainerStyle, onCountChange }) {
  const router = useRouter();
  const { userId } = useSession();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchName, setMatchName] = useState(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    async function load() {
      const result = await fetchIncomingLikes(repositories, userId);
      if (cancelled || result.status !== "success") return;
      const enriched = await Promise.all(
        result.data.map(async (swipe) => ({
          swipe,
          fromUser: await repositories.user.findById(swipe.fromUser),
        }))
      );
      const filtered = enriched.filter((e) => e.fromUser);
      setEntries(filtered);
      setLoading(false);
      onCountChange?.(filtered.length);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function respond(fromUserId, name, action) {
    setEntries((prev) => {
      const next = prev.filter((e) => e.fromUser.id !== fromUserId);
      onCountChange?.(next.length);
      return next;
    });
    const result = await likeUser(repositories, userId, fromUserId, action);
    if (result.status === "success" && result.data.matched) {
      setMatchName(name);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.fromUser.id}
        contentContainerStyle={[styles.list, contentContainerStyle]}
        ListEmptyComponent={
          <EmptyState icon="💌" title="Şu an bekleyen beğenin yok" description="Yeni beğeniler burada birikecek." />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Pressable style={styles.identity} onPress={() => router.push(`/u/${item.fromUser.id}`)}>
              <InitialsAvatar name={item.fromUser.name} size={52} />
              <Text style={styles.name}>{item.fromUser.name}</Text>
            </Pressable>
            <View style={styles.actions}>
              <Button
                variant="outline"
                style={styles.actionButton}
                onPress={() => respond(item.fromUser.id, item.fromUser.name, "dislike")}
              >
                Geç
              </Button>
              <Button
                variant="primary"
                style={styles.actionButton}
                onPress={() => respond(item.fromUser.id, item.fromUser.name, "like")}
              >
                Beğen
              </Button>
            </View>
          </Card>
        )}
      />

      <Modal visible={Boolean(matchName)} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEmoji}>🎉</Text>
            <Text style={styles.modalTitle}>Eşleştiniz!</Text>
            <Text style={styles.modalBody}>{matchName} ile eşleştin.</Text>
            <Button variant="primary" onPress={() => setMatchName(null)} style={styles.modalButton}>
              Tamam
            </Button>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  list: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    flexGrow: 1,
    paddingBottom: 40,
  },
  card: {
    alignItems: "center",
    gap: spacing.sm,
  },
  identity: {
    alignItems: "center",
    gap: spacing.sm,
  },
  name: {
    color: colors.foreground,
    fontWeight: "700",
    fontSize: 15,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xs,
    width: "100%",
  },
  actionButton: {
    flex: 1,
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
