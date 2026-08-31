import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { fetchIncomingLikes } from "@hemdem/core/usecases/discover/fetchIncomingLikes";
import { likeUser } from "@hemdem/core/usecases/discover/likeUser";
import { repositories } from "../../lib/repositories";
import { useSession } from "../../lib/session";
import { colors } from "../../lib/theme";
import { InitialsAvatar } from "../../components/InitialsAvatar";

export default function LikesScreen() {
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
      setEntries(enriched.filter((e) => e.fromUser));
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function respond(fromUserId, name, action) {
    setEntries((prev) => prev.filter((e) => e.fromUser.id !== fromUserId));
    const result = await likeUser(repositories, userId, fromUserId, action);
    if (result.status === "success" && result.data.matched) {
      setMatchName(name);
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Beğenenler</Text>

      {matchName && (
        <View style={styles.matchBanner}>
          <Text style={styles.matchText}>🎉 {matchName} ile eşleştin!</Text>
        </View>
      )}

      {entries.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.empty}>Şu an bekleyen beğenin yok.</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.fromUser.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <InitialsAvatar name={item.fromUser.name} size={48} />
              <Text style={styles.name}>{item.fromUser.name}</Text>
              <View style={styles.actions}>
                <Pressable
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => respond(item.fromUser.id, item.fromUser.name, "dislike")}
                >
                  <Text style={styles.rejectText}>Geç</Text>
                </Pressable>
                <Pressable
                  style={[styles.actionButton, styles.acceptButton]}
                  onPress={() => respond(item.fromUser.id, item.fromUser.name, "like")}
                >
                  <Text style={styles.acceptText}>Beğen</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.foreground,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  matchBanner: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 12,
  },
  matchText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
  },
  empty: {
    color: colors.muted,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 10,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  name: {
    color: colors.foreground,
    fontWeight: "700",
    fontSize: 15,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  rejectButton: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  rejectText: {
    color: colors.muted,
    fontWeight: "600",
  },
  acceptButton: {
    backgroundColor: colors.primary,
  },
  acceptText: {
    color: "#fff",
    fontWeight: "700",
  },
});
