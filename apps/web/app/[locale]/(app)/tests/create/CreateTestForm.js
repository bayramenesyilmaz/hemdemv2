"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TEST_CATEGORIES } from "@hemdem/core/domain/entities/test";
import { useI18n } from "@/locales/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SectionCard } from "@/components/SectionCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { createTestAction } from "@/lib/actions/testActions";

function newOption() {
  return { id: crypto.randomUUID(), text: "" };
}

function newQuestion() {
  return { id: crypto.randomUUID(), text: "", options: [newOption(), newOption()] };
}

export function CreateTestForm({ locale }) {
  const t = useI18n();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState(String(TEST_CATEGORIES[0].id));
  const [language, setLanguage] = useState(locale);
  const [questions, setQuestions] = useState([newQuestion()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function updateQuestionText(qIndex, text) {
    setQuestions((prev) => prev.map((q, i) => (i === qIndex ? { ...q, text } : q)));
  }

  function updateOptionText(qIndex, oIndex, text) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex ? { ...q, options: q.options.map((o, j) => (j === oIndex ? { ...o, text } : o)) } : q
      )
    );
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, newQuestion()]);
  }

  function removeQuestion(qIndex) {
    setQuestions((prev) => prev.filter((_, i) => i !== qIndex));
  }

  function addOption(qIndex) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIndex ? { ...q, options: [...q.options, newOption()] } : q))
    );
  }

  function removeOption(qIndex, oIndex) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIndex ? { ...q, options: q.options.filter((_, j) => j !== oIndex) } : q))
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const result = await createTestAction({
      title,
      categoryId: Number(categoryId),
      language,
      questions: questions.map((q) => ({
        id: q.id,
        text: q.text,
        options: q.options.map((o) => ({ id: o.id, text: o.text })),
      })),
    });

    if (result.status === "error") {
      setError(result.message);
      setLoading(false);
      return;
    }

    router.push(`/${locale}/tests/${result.data.test.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm text-muted-foreground">
          {t("tests.titleLabel")}
        </label>
        <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">{t("tests.categoryLabel")}</label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TEST_CATEGORIES.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {t(`testCategories.${c.key}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">{t("tests.languageLabel")}</label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tr">Türkçe</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {questions.map((question, qIndex) => (
          <SectionCard key={question.id} className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <Input
                required
                placeholder={t("tests.questionPlaceholder", { number: qIndex + 1 })}
                value={question.text}
                onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                className="flex-1"
              />
              {questions.length > 1 && (
                <Button type="button" variant="delete" onClick={() => removeQuestion(qIndex)}>
                  {t("tests.removeQuestion")}
                </Button>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {question.options.map((option, oIndex) => (
                <div key={option.id} className="flex items-center gap-2">
                  <Input
                    required
                    placeholder={t("tests.optionPlaceholder", { number: oIndex + 1 })}
                    value={option.text}
                    onChange={(e) => updateOptionText(qIndex, oIndex, e.target.value)}
                    className="flex-1"
                  />
                  {question.options.length > 2 && (
                    <Button type="button" variant="ghost" onClick={() => removeOption(qIndex, oIndex)}>
                      {t("tests.removeOption")}
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => addOption(qIndex)} className="self-start">
                {t("tests.addOption")}
              </Button>
            </div>
          </SectionCard>
        ))}

        <Button type="button" variant="outline" onClick={addQuestion} className="self-start">
          {t("tests.addQuestion")}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{t(`tests.errors.${error}`)}</p>}

      <Button type="submit" variant="confirm" disabled={loading}>
        {t("tests.submitCreate")}
      </Button>
    </form>
  );
}
