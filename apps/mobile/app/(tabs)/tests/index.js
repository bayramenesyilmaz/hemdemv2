import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { TEST_CATEGORIES } from "@hemdem/core/domain/entities/test";
import { repositories } from "../../../lib/repositories";
import { colors, radii, spacing } from "../../../lib/theme";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { EmptyState } from "../../../components/ui/EmptyState";
import { useScreenInsets } from "../../../components/ui/Screen";

const CATEGORY_LABELS = {
  love: "Aşk",
  personality: "Kişilik",
  fun: "Eğlence",
  career: "Kariyer",
};

function categoryLabelOf(categoryId) {
  const key = TEST_CATEGORIES.find((c) => c.id === categoryId)?.key ?? "personality";
  return CATEGORY_LABELS[key];
}

export default function TestsScreen() {
  const insets = useScreenInsets();
  const router = useRouter();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const result = await repositories.test.findMany({});
      if (cancelled) return;
      setTests(result);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

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
        data={tests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[insets, styles.list]}
        ListHeaderComponent={
          <>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Testler</Text>
              <Button variant="primary" onPress={() => router.push("/tests/create")}>
                + Oluştur
              </Button>
            </View>

            <View style={styles.linkRow}>
              <Button variant="outline" style={styles.linkChip} onPress={() => router.push("/tests/mine")}>
                Testlerim
              </Button>
              <Button variant="outline" style={styles.linkChip} onPress={() => router.push("/tests/history")}>
                Geçmiş
              </Button>
            </View>
          </>
        }
        ListEmptyComponent={
          <EmptyState icon="📋" title="Henüz test yok" description="İlk testi sen oluştur." />
        }
        renderItem={({ item }) => (
          <Card onPress={() => router.push(`/tests/${item.id}`)} style={styles.card}>
            <View style={styles.cardMain}>
              <Text style={styles.testTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.testMeta}>
                {categoryLabelOf(item.categoryId)} · {item.language.toUpperCase()}
              </Text>
            </View>
            <View style={styles.countPill}>
              <Text style={styles.countPillText}>{item.questions.length} soru</Text>
            </View>
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
    alignItems: "center",
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.foreground,
  },
  linkRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  linkChip: {
    flex: 1,
  },
  list: {
    gap: spacing.sm,
    paddingBottom: 40,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  cardMain: {
    flex: 1,
    minWidth: 0,
  },
  testTitle: {
    color: colors.foreground,
    fontWeight: "700",
    fontSize: 16,
  },
  testMeta: {
    color: colors.mutedForeground,
    fontSize: 13,
    marginTop: 4,
  },
  countPill: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  countPillText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 12,
  },
});
