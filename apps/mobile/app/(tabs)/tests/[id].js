import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { submitAnswers } from "@hemdem/core/usecases/tests/submitAnswers";
import { repositories } from "../../../lib/repositories";
import { useSession } from "../../../lib/session";
import { colors } from "../../../lib/theme";

export default function SolveTestScreen() {
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
      const found = await repositories.test.findById(id);
      if (!cancelled) setTest(found);
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
    router.back();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{test.title}</Text>

      {test.questions.map((question, index) => (
        <View key={question.id} style={styles.questionCard}>
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
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option.text}</Text>
              </Pressable>
            );
          })}
        </View>
      ))}

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable
        style={[styles.submitButton, (!allAnswered || submitting) && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={!allAnswered || submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Cevapları Gönder</Text>
        )}
      </Pressable>
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
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.foreground,
  },
  questionCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  questionText: {
    color: colors.foreground,
    fontWeight: "700",
    marginBottom: 4,
  },
  option: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: "rgba(225,29,72,0.15)",
  },
  optionText: {
    color: colors.foreground,
    fontSize: 14,
  },
  optionTextSelected: {
    fontWeight: "700",
  },
  error: {
    color: colors.danger,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
