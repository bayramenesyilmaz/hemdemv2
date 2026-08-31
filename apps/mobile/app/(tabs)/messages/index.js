import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { fetchChatList } from "@hemdem/core/usecases/chat/fetchChatList";
import { repositories } from "../../../lib/repositories";
import { useSession } from "../../../lib/session";
import { colors } from "../../../lib/theme";
import { InitialsAvatar } from "../../../components/InitialsAvatar";

export default function MessagesScreen() {
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
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mesajlar</Text>

      {chats.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.empty}>Henüz bir sohbetin yok.</Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => String(item.chat.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable style={styles.row} onPress={() => router.push(`/messages/${item.chat.id}`)}>
              <InitialsAvatar name={item.otherUser.name} size={48} />
              <View style={styles.rowText}>
                <Text style={styles.name}>{item.otherUser.name}</Text>
                <Text style={styles.preview} numberOfLines={1}>
                  {item.lastMessage ? item.lastMessage.content : "Henüz mesaj yok"}
                </Text>
              </View>
            </Pressable>
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
  empty: {
    color: colors.muted,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
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
