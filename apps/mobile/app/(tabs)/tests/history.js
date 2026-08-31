import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { repositories } from "../../../lib/repositories";
import { useSession } from "../../../lib/session";
import { colors } from "../../../lib/theme";

export default function TestHistoryScreen() {
  const router = useRouter();
  const { userId } = useSession();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    async function load() {
      const answers = await repositories.test.findAnswersByUser(userId);
      const tests = await Promise.all(answers.map((a) => repositories.test.findById(a.testId)));
      if (cancelled) return;
      setEntries(answers.map((answer, index) => ({ answer, test: tests[index] })).filter((e) => e.test));
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
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>‹ Testler</Text>
      </Pressable>

      <Text style={styles.title}>Geçmiş</Text>

      {entries.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.empty}>Henüz hiç test çözmedin.</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.answer.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => router.push(`/tests/${item.test.id}/result`)}>
              <Text style={styles.testTitle}>{item.test.title}</Text>
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
    paddingHorizontal: 20,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  back: {
    color: colors.muted,
    fontSize: 15,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.foreground,
    marginBottom: 12,
  },
  empty: {
    color: colors.muted,
  },
  list: {
    paddingBottom: 40,
    gap: 10,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
  },
  testTitle: {
    color: colors.foreground,
    fontWeight: "700",
    fontSize: 15,
  },
});
