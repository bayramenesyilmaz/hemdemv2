import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { fetchChatList } from "@hemdem/core/usecases/chat/fetchChatList";
import { repositories } from "../../lib/repositories";
import { useSession } from "../../lib/session";
import { colors, spacing } from "../../lib/theme";
import { InitialsAvatar } from "../InitialsAvatar";
import { EmptyState } from "../ui/EmptyState";

export function ChatsList({ contentContainerStyle }) {
  const router = useRouter();
  const { userId } = useSession();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    async function load() {
      const result = await fetchChatList(repositories, userId);
      if (cancelled) return;
      if (result.status === "success") setChats(result.data);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={chats}
      keyExtractor={(item) => String(item.chat.id)}
      contentContainerStyle={[styles.list, contentContainerStyle]}
      ListEmptyComponent={
        <EmptyState icon="💬" title="Henüz bir sohbetin yok" description="Eşleştiğin kişilerle burada mesajlaşabilirsin." />
      }
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          onPress={() => router.push(`/messages/${item.chat.id}`)}
        >
          <InitialsAvatar name={item.otherUser.name} size={52} />
          <View style={styles.rowText}>
            <Text style={styles.name}>{item.otherUser.name}</Text>
            <Text style={styles.preview} numberOfLines={1}>
              {item.lastMessage ? item.lastMessage.content : "Henüz mesaj yok"}
            </Text>
          </View>
        </Pressable>
      )}
    />
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
    paddingBottom: 40,
    flexGrow: 1,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  rowPressed: {
    backgroundColor: colors.card,
  },
  rowText: {
    flex: 1,
  },
  name: {
    color: colors.foreground,
    fontWeight: "700",
    fontSize: 15,
  },
  preview: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2,
  },
});
