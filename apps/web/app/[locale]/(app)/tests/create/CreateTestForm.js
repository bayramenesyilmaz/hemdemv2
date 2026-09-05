"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TEST_CATEGORIES } from "@hemdem/core/domain/entities/test";
import { useI18n } from "@/locales/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { TestQuestionsBuilder, newQuestion } from "@/components/TestQuestionsBuilder";
import { createTestAction } from "@/lib/actions/testActions";

export function CreateTestForm({ locale }) {
  const t = useI18n();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState(String(TEST_CATEGORIES[0].id));
  const [language, setLanguage] = useState(locale);
  const [questions, setQuestions] = useState([newQuestion()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      setError(result);
      setLoading(false);
      return;
    }

    router.push(`/${locale}/tests/${result.data.test.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium text-muted-foreground">
          {t("tests.titleLabel")}
        </label>
        <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-muted-foreground">{t("tests.categoryLabel")}</label>
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
          <label className="text-sm font-medium text-muted-foreground">{t("tests.languageLabel")}</label>
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

      <TestQuestionsBuilder questions={questions} onChange={setQuestions} />

      {error && (
        <p className="text-sm text-destructive">
          {error.message === "inappropriate_content"
            ? t("tests.errors.inappropriate_content", { words: (error.data?.flaggedWords ?? []).join(", ") })
            : t(`tests.errors.${error.message}`)}
        </p>
      )}

      <Button type="submit" variant="confirm" loading={loading}>
        {t("tests.submitCreate")}
      </Button>
    </form>
  );
}
