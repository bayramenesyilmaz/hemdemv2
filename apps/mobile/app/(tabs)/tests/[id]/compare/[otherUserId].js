import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { compareAnswers } from "@hemdem/core/usecases/tests/compareAnswers";
import { repositories } from "../../../../../lib/repositories";
import { useSession } from "../../../../../lib/session";
import { colors, radii, spacing } from "../../../../../lib/theme";
import { InitialsAvatar } from "../../../../../components/InitialsAvatar";
import { Card } from "../../../../../components/ui/Card";
import { Badge } from "../../../../../components/ui/Badge";
import { ScreenHeader } from "../../../../../components/ui/ScreenHeader";
import { useScreenInsets } from "../../../../../components/ui/Screen";

export default function CompareAnswersScreen() {
  const insets = useScreenInsets();
  const { id, otherUserId } = useLocalSearchParams();
  const router = useRouter();
  const { userId } = useSession();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    async function load() {
      const result = await compareAnswers(repositories, userId, id, otherUserId);
      if (cancelled) return;
      setLoading(false);
      if (result.status === "error") {
        setError(result.message);
        return;
      }
      setData(result.data);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id, otherUserId, userId]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.error}>Karşılaştırma yüklenemedi.</Text>
      </View>
    );
  }

  const { test, otherProfile, rows, similarity } = data;
  const matchCount = rows.filter((row) => row.isMatch).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={[insets, styles.content]}>
      <ScreenHeader
        title={test.title}
        back
        onBack={() => router.push(`/tests/${test.id}/result`)}
        subtitle={`${matchCount}/${rows.length} soruda aynı cevabı verdiniz`}
      />

      <Card style={styles.matchHeader}>
        <View style={styles.matchPerson}>
          <InitialsAvatar name="Sen" size={56} />
          <Text style={styles.matchName}>Sen</Text>
        </View>
        <Text style={styles.matchSimilarity}>%{similarity}</Text>
        <View style={styles.matchPerson}>
          <InitialsAvatar name={otherProfile.name} size={56} />
          <Text style={styles.matchName} numberOfLines={1}>
            {otherProfile.name}
          </Text>
        </View>
      </Card>

      {rows.map((row, index) => (
        <Card key={row.questionId} style={[styles.questionCard, row.isMatch && styles.questionCardMatch]}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionText}>
              {index + 1}. {row.questionText}
            </Text>
            {row.isMatch && <Badge tone="primary">Aynı cevap</Badge>}
          </View>
          <View style={styles.answerRow}>
            <View style={styles.answerCell}>
              <Text style={styles.answerLabel}>SEN</Text>
              <Text style={styles.answerText}>{row.ownChoice ?? "—"}</Text>
            </View>
            <View style={styles.answerCell}>
              <Text style={styles.answerLabel} numberOfLines={1}>
                {otherProfile.name.toUpperCase()}
              </Text>
              <Text style={styles.answerText}>{row.otherChoice ?? "—"}</Text>
            </View>
          </View>
        </Card>
      ))}
    </ScrollView>
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
  content: {
    paddingBottom: 60,
    gap: spacing.md,
  },
  error: {
    color: colors.danger,
  },
  matchHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xl,
  },
  matchPerson: {
    alignItems: "center",
    gap: spacing.xs,
    maxWidth: 88,
  },
  matchName: {
    color: colors.foreground,
    fontSize: 12,
    fontWeight: "600",
  },
  matchSimilarity: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 18,
  },
  questionCard: {
    gap: spacing.sm,
  },
  questionCardMatch: {
    borderColor: "rgba(217,72,97,0.4)",
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  questionText: {
    flex: 1,
    color: colors.foreground,
    fontWeight: "700",
    fontSize: 14,
  },
  answerRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  answerCell: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.sm,
  },
  answerLabel: {
    color: colors.mutedForeground,
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 2,
  },
  answerText: {
    color: colors.foreground,
    fontSize: 13,
    fontWeight: "600",
  },
});
