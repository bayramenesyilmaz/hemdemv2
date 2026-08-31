import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { submitAnswers } from "@hemdem/core/usecases/tests/submitAnswers";
import { repositories } from "../../../../lib/repositories";
import { useSession } from "../../../../lib/session";
import { colors, radii, spacing } from "../../../../lib/theme";
import { Card } from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import { ScreenHeader } from "../../../../components/ui/ScreenHeader";
import { useScreenInsets } from "../../../../components/ui/Screen";

export default function SolveTestScreen() {
  const insets = useScreenInsets();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { userId } = useSession();
  const [test, setTest] = useState(null);
  const [choices, setChoices] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [found, existingAnswer] = await Promise.all([
        repositories.test.findById(id),
        repositories.test.findAnswer(userId, id),
      ]);
      if (cancelled) return;
      if (existingAnswer) {
        router.replace(`/tests/${id}/result`);
        return;
      }
      setTest(found);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!test) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const answeredCount = Object.keys(choices).length;
  const allAnswered = test.questions.every((q) => choices[q.id]);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const userAnswers = test.questions.map((q) => ({ questionId: q.id, choiceId: choices[q.id] }));
    const result = await submitAnswers(repositories, userId, id, userAnswers);
    setSubmitting(false);
    if (result.status === "error") {
      setError(result.message);
      return;
    }
    router.replace(`/tests/${id}/result`);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={[insets, styles.content]}>
      <ScreenHeader
        title={test.title}
        back
        subtitle={`${answeredCount}/${test.questions.length} soru cevaplandı`}
      />

      <View style={styles.progressTrack}>
        <View
          style={[styles.progressFill, { width: `${(answeredCount / test.questions.length) * 100}%` }]}
        />
      </View>

      {test.questions.map((question, index) => (
        <Card key={question.id} style={styles.questionCard}>
          <Text style={styles.questionText}>
            {index + 1}. {question.text}
          </Text>
          {question.options.map((option) => {
            const selected = choices[question.id] === option.id;
            return (
              <Pressable
                key={option.id}
                style={[styles.option, selected && styles.optionSelected]}
                onPress={() => setChoices((prev) => ({ ...prev, [question.id]: option.id }))}
              >
                <View style={[styles.radio, selected && styles.radioSelected]} />
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option.text}</Text>
              </Pressable>
            );
          })}
        </Card>
      ))}

      {error && <Text style={styles.error}>{error}</Text>}

      <Button variant="primary" onPress={handleSubmit} disabled={!allAnswered} loading={submitting}>
        Cevapları Gönder
      </Button>
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
    gap: spacing.lg,
  },
  progressTrack: {
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.cardAlt,
    overflow: "hidden",
    marginTop: -spacing.sm,
  },
  progressFill: {
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
  },
  questionCard: {
    gap: spacing.sm,
  },
  questionText: {
    color: colors.foreground,
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 4,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.border,
  },
  radioSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  optionText: {
    flex: 1,
    color: colors.foreground,
    fontSize: 14,
  },
  optionTextSelected: {
    fontWeight: "700",
  },
  error: {
    color: colors.danger,
    fontSize: 13,
  },
});
