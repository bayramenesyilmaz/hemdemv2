import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { compareAnswers } from "@hemdem/core/usecases/tests/compareAnswers";
import { repositories } from "../../../../../lib/repositories";
import { useSession } from "../../../../../lib/session";
import { colors } from "../../../../../lib/theme";
import { InitialsAvatar } from "../../../../../components/InitialsAvatar";

export default function CompareAnswersScreen() {
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.push(`/tests/${test.id}/result`)}>
        <Text style={styles.back}>‹ Sonuçlara dön</Text>
      </Pressable>

      <Text style={styles.title}>{test.title}</Text>
      <Text style={styles.subtitle}>
        {matchCount}/{rows.length} soruda aynı cevabı verdiniz
      </Text>

      <View style={styles.matchHeader}>
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
      </View>

      {rows.map((row, index) => (
        <View key={row.questionId} style={[styles.questionCard, row.isMatch && styles.questionCardMatch]}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionText}>
              {index + 1}. {row.questionText}
            </Text>
            {row.isMatch && <Text style={styles.matchBadge}>Aynı cevap</Text>}
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
        </View>
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 60,
    gap: 14,
  },
  back: {
    color: colors.muted,
    fontSize: 15,
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.foreground,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    marginBottom: 4,
  },
  error: {
    color: colors.danger,
  },
  matchHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 4,
  },
  matchPerson: {
    alignItems: "center",
    gap: 6,
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
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  questionCardMatch: {
    borderWidth: 1,
    borderColor: "rgba(225,29,72,0.4)",
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  questionText: {
    flex: 1,
    color: colors.foreground,
    fontWeight: "700",
    fontSize: 14,
  },
  matchBadge: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "700",
  },
  answerRow: {
    flexDirection: "row",
    gap: 8,
  },
  answerCell: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
  },
  answerLabel: {
    color: colors.muted,
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
