import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { TEST_CATEGORIES } from "@hemdem/core/domain/entities/test";
import { repositories } from "../../../lib/repositories";
import { useSession } from "../../../lib/session";
import { colors, radii, spacing } from "../../../lib/theme";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { EmptyState } from "../../../components/ui/EmptyState";
import { AppTopBar } from "../../../components/nav/AppTopBar";

const CATEGORY_LABELS = {
  love: "Aşk",
  personality: "Kişilik",
  fun: "Eğlence",
  career: "Kariyer",
};

const LANGUAGE_OPTIONS = [
  { value: undefined, label: "Tümü" },
  { value: "tr", label: "Türkçe" },
  { value: "en", label: "English" },
];

function categoryLabelOf(categoryId) {
  const key = TEST_CATEGORIES.find((c) => c.id === categoryId)?.key ?? "personality";
  return CATEGORY_LABELS[key];
}

export default function TestsScreen() {
  const router = useRouter();
  const { userId } = useSession();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState(undefined);
  const [languageReady, setLanguageReady] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Web'deki gibi: filtreye hiç dokunulmadıysa varsayılan olarak
  // kullanıcının kendi dilindeki testler gösterilir, "Tümü" ayrı bir
  // bilinçli seçimdir — bu yüzden ilk yüklemede önce profil.language
  // okunup filtre ona göre tohumlanıyor, sonra test listesi çekiliyor.
  useEffect(() => {
    if (!userId) {
      setLanguageReady(true);
      return;
    }
    let cancelled = false;
    repositories.user.findById(userId).then((profile) => {
      if (cancelled) return;
      setLanguage(profile?.language);
      setLanguageReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!languageReady) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      const result = await repositories.test.findMany({ language });
      if (cancelled) return;
      setTests(result);
      setLoading(false);
      setInitialLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [languageReady, language]);

  if (initialLoading) {
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
        data={tests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
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
              <Button variant="outline" style={styles.linkChip} onPress={() => router.push("/leaderboard")}>
                🏆 Liderlik
              </Button>
            </View>

            <View style={styles.languageRow}>
              {LANGUAGE_OPTIONS.map((option) => (
                <Pressable
                  key={option.label}
                  style={[styles.languageChip, language === option.value && styles.languageChipActive]}
                  onPress={() => setLanguage(option.value)}
                >
                  <Text
                    style={[styles.languageChipText, language === option.value && styles.languageChipTextActive]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
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
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
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
  languageRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  languageChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  languageChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  languageChipText: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontWeight: "600",
  },
  languageChipTextActive: {
    color: colors.primary,
  },
  list: {
    paddingHorizontal: spacing.xl,
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
