import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { fetchFeed } from "@hemdem/core/usecases/posts/fetchFeed";
import { createPost } from "@hemdem/core/usecases/posts/createPost";
import { repositories } from "../../lib/repositories";
import { useSession } from "../../lib/session";
import { colors, radii, spacing } from "../../lib/theme";
import { InitialsAvatar } from "../../components/InitialsAvatar";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { AppTopBar } from "../../components/nav/AppTopBar";

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

  return (
    <View style={styles.container}>
      <AppTopBar />
      <FlatList
        data={posts}
        keyExtractor={(item) => String(item.post.id)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Gönderiler</Text>
            <Card style={styles.composer}>
              <TextInput
                style={styles.composerInput}
                value={draft}
                onChangeText={setDraft}
                placeholder="Aklından ne geçiyor?"
                placeholderTextColor={colors.mutedDark}
                multiline
              />
              <Button
                variant="primary"
                style={styles.postButton}
                onPress={handlePost}
                disabled={!draft.trim()}
                loading={posting}
              >
                Paylaş
              </Button>
            </Card>
          </>
        }
        ListEmptyComponent={
          <EmptyState icon="📝" title="Henüz gönderi yok" description="İlk gönderiyi sen paylaş." />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Pressable style={styles.author} onPress={() => router.push(`/u/${item.author.id}`)}>
              <InitialsAvatar name={item.author.name} size={36} />
              <Text style={styles.authorName}>{item.author.name}</Text>
            </Pressable>
            <Text style={styles.content}>{item.post.content}</Text>
            {item.taggedTest && (
              <Pressable onPress={() => router.push(`/tests/${item.taggedTest.id}`)}>
                <Badge>📋 {item.taggedTest.title}</Badge>
              </Pressable>
            )}
          </Card>
        )}
      />
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
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.foreground,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  composer: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  composerInput: {
    color: colors.foreground,
    minHeight: 40,
    fontSize: 14,
  },
  postButton: {
    alignSelf: "flex-end",
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 40,
    gap: spacing.md,
  },
  card: {
    gap: spacing.sm,
  },
  author: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  authorName: {
    color: colors.foreground,
    fontWeight: "700",
  },
  content: {
    color: colors.foreground,
  },
});
