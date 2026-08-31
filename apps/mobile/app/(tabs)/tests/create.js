import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { TEST_CATEGORIES, TEST_LIMITS } from "@hemdem/core/domain/entities/test";
import { createTest } from "@hemdem/core/usecases/tests/createTest";
import { repositories } from "../../../lib/repositories";
import { useSession } from "../../../lib/session";
import { colors } from "../../../lib/theme";

const CATEGORY_LABELS = {
  love: "Aşk",
  personality: "Kişilik",
  fun: "Eğlence",
  career: "Kariyer",
};

const ERROR_MESSAGES = {
  title_required: "Başlık gerekli.",
  category_required: "Kategori seç.",
  invalid_category: "Geçersiz kategori.",
  questions_required: "En az bir soru ekle.",
  too_many_questions: `En fazla ${TEST_LIMITS.maxQuestions} soru olabilir.`,
  invalid_question: "Her sorunun metni ve en az iki şıkkı olmalı.",
  too_many_options: `Bir soruda en fazla ${TEST_LIMITS.maxOptions} şık olabilir.`,
  invalid_option: "Boş şık bırakma.",
  insufficient_coins: "Test oluşturmak için yeterli coin'in yok.",
};

let idSeq = 0;
function localId(prefix) {
  idSeq += 1;
  return `${prefix}-${Date.now()}-${idSeq}`;
}

function newQuestion() {
  return {
    id: localId("q"),
    text: "",
    options: [
      { id: localId("o"), text: "" },
      { id: localId("o"), text: "" },
    ],
  };
}

export default function CreateTestScreen() {
  const router = useRouter();
  const { userId } = useSession();
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState(TEST_CATEGORIES[0].id);
  const [questions, setQuestions] = useState([newQuestion()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function updateQuestionText(questionId, text) {
    setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, text } : q)));
  }

  function updateOptionText(questionId, optionId, text) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, options: q.options.map((o) => (o.id === optionId ? { ...o, text } : o)) }
          : q
      )
    );
  }

  function addOption(questionId) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId && q.options.length < TEST_LIMITS.maxOptions
          ? { ...q, options: [...q.options, { id: localId("o"), text: "" }] }
          : q
      )
    );
  }

  function removeOption(questionId, optionId) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId && q.options.length > TEST_LIMITS.minOptions
          ? { ...q, options: q.options.filter((o) => o.id !== optionId) }
          : q
      )
    );
  }

  function addQuestion() {
    setQuestions((prev) => (prev.length < TEST_LIMITS.maxQuestions ? [...prev, newQuestion()] : prev));
  }

  function removeQuestion(questionId) {
    setQuestions((prev) => (prev.length > 1 ? prev.filter((q) => q.id !== questionId) : prev));
  }

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    const result = await createTest(repositories, userId, {
      title,
      categoryId,
      language: "tr",
      questions,
    });
    setLoading(false);

    if (result.status === "error") {
      setError(ERROR_MESSAGES[result.message] ?? result.message);
      return;
    }

    router.replace(`/tests/${result.data.test.id}`);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>‹ Testler</Text>
      </Pressable>

      <Text style={styles.title}>Test Oluştur</Text>

      <Text style={styles.label}>Başlık</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Örn. Hangi film türünü seversin?"
        placeholderTextColor={colors.mutedDark}
      />

      <Text style={styles.label}>Kategori</Text>
      <View style={styles.categoryRow}>
        {TEST_CATEGORIES.map((c) => (
          <Pressable
            key={c.id}
            style={[styles.categoryChip, categoryId === c.id && styles.categoryChipSelected]}
            onPress={() => setCategoryId(c.id)}
          >
            <Text
              style={[styles.categoryChipText, categoryId === c.id && styles.categoryChipTextSelected]}
            >
              {CATEGORY_LABELS[c.key]}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Sorular ({questions.length}/{TEST_LIMITS.maxQuestions})</Text>
      {questions.map((question, qIndex) => (
        <View key={question.id} style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionIndex}>Soru {qIndex + 1}</Text>
            {questions.length > 1 && (
              <Pressable onPress={() => removeQuestion(question.id)}>
                <Text style={styles.removeText}>Soruyu sil</Text>
              </Pressable>
            )}
          </View>
          <TextInput
            style={styles.input}
            value={question.text}
            onChangeText={(text) => updateQuestionText(question.id, text)}
            placeholder="Soru metni"
            placeholderTextColor={colors.mutedDark}
          />

          {question.options.map((option, oIndex) => (
            <View key={option.id} style={styles.optionRow}>
              <TextInput
                style={[styles.input, styles.optionInput]}
                value={option.text}
                onChangeText={(text) => updateOptionText(question.id, option.id, text)}
                placeholder={`Şık ${oIndex + 1}`}
                placeholderTextColor={colors.mutedDark}
              />
              {question.options.length > TEST_LIMITS.minOptions && (
                <Pressable onPress={() => removeOption(question.id, option.id)} style={styles.removeOptionButton}>
                  <Text style={styles.removeText}>✕</Text>
                </Pressable>
              )}
            </View>
          ))}

          {question.options.length < TEST_LIMITS.maxOptions && (
            <Pressable onPress={() => addOption(question.id)}>
              <Text style={styles.addLink}>+ Şık ekle</Text>
            </Pressable>
          )}
        </View>
      ))}

      {questions.length < TEST_LIMITS.maxQuestions && (
        <Pressable style={styles.addQuestionButton} onPress={addQuestion}>
          <Text style={styles.addQuestionButtonText}>+ Soru ekle</Text>
        </Pressable>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Testi Oluştur</Text>}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 60,
    gap: 10,
  },
  back: {
    color: colors.muted,
    fontSize: 15,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.foreground,
    marginBottom: 4,
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.foreground,
    fontSize: 14,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  categoryChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    color: colors.foreground,
    fontSize: 13,
    fontWeight: "600",
  },
  categoryChipTextSelected: {
    color: "#fff",
  },
  questionCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    gap: 8,
    marginTop: 4,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  questionIndex: {
    color: colors.foreground,
    fontWeight: "700",
    fontSize: 13,
  },
  removeText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "600",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  optionInput: {
    flex: 1,
  },
  removeOptionButton: {
    padding: 6,
  },
  addLink: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
  addQuestionButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  addQuestionButtonText: {
    color: colors.foreground,
    fontWeight: "700",
    fontSize: 14,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
