import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { fetchFeed } from "@hemdem/core/usecases/posts/fetchFeed";
import { createPost } from "@hemdem/core/usecases/posts/createPost";
import { repositories } from "../../lib/repositories";
import { useSession } from "../../lib/session";
import { colors } from "../../lib/theme";
import { InitialsAvatar } from "../../components/InitialsAvatar";

export default function PostsScreen() {
  const router = useRouter();
  const { userId } = useSession();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const result = await fetchFeed(repositories);
    if (result.status === "success") setPosts(result.data);
    setLoading(false);
  }

  async function handlePost() {
    const content = draft.trim();
    if (!content) return;
    setPosting(true);
    const result = await createPost(repositories, userId, { content });
    setPosting(false);
    if (result.status === "success") {
      setDraft("");
      load();
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gönderiler</Text>

      <View style={styles.composer}>
        <TextInput
          style={styles.composerInput}
          value={draft}
          onChangeText={setDraft}
          placeholder="Aklından ne geçiyor?"
          placeholderTextColor={colors.mutedDark}
          multiline
        />
        <Pressable style={styles.postButton} onPress={handlePost} disabled={posting || !draft.trim()}>
          {posting ? <ActivityIndicator color="#fff" /> : <Text style={styles.postButtonText}>Paylaş</Text>}
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => String(item.post.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Pressable style={styles.author} onPress={() => router.push(`/u/${item.author.id}`)}>
                <InitialsAvatar name={item.author.name} size={32} />
                <Text style={styles.authorName}>{item.author.name}</Text>
              </Pressable>
              <Text style={styles.content}>{item.post.content}</Text>
              {item.taggedTest && (
                <View style={styles.testBadge}>
                  <Text style={styles.testBadgeText}>📋 {item.taggedTest.title}</Text>
                </View>
              )}
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
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.foreground,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  composer: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  composerInput: {
    color: colors.foreground,
    minHeight: 40,
  },
  postButton: {
    alignSelf: "flex-end",
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  postButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  author: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  authorName: {
    color: colors.foreground,
    fontWeight: "700",
  },
  content: {
    color: colors.foreground,
  },
  testBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.cardAlt,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  testBadgeText: {
    color: colors.muted,
    fontSize: 12,
  },
});
