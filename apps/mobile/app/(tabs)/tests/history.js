import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { repositories } from "../../../lib/repositories";
import { useSession } from "../../../lib/session";
import { colors, spacing } from "../../../lib/theme";
import { Card } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { ScreenHeader } from "../../../components/ui/ScreenHeader";
import { useScreenInsets } from "../../../components/ui/Screen";

export default function TestHistoryScreen() {
  const insets = useScreenInsets();
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
      <FlatList
        data={entries}
        keyExtractor={(item) => item.answer.id}
        contentContainerStyle={[insets, styles.list]}
        ListHeaderComponent={<ScreenHeader title="Geçmiş" back />}
        ListEmptyComponent={
          <EmptyState icon="🕓" title="Henüz hiç test çözmedin" description="Çözdüğün testler burada listelenecek." />
        }
        renderItem={({ item }) => (
          <Card onPress={() => router.push(`/tests/${item.test.id}/result`)}>
            <Text style={styles.testTitle}>{item.test.title}</Text>
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
  list: {
    gap: spacing.sm,
    paddingBottom: 40,
  },
  testTitle: {
    color: colors.foreground,
    fontWeight: "700",
    fontSize: 15,
  },
});
