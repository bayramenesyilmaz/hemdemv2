"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/locales/client";
import { Button } from "@/components/ui/Button";
import { SectionCard } from "@/components/SectionCard";
import { submitAnswersAction } from "@/lib/actions/testActions";

export function SolveTestForm({ locale, test }) {
  const t = useI18n();
  const router = useRouter();
  const [choices, setChoices] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const allAnswered = test.questions.every((q) => choices[q.id]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const userAnswers = test.questions.map((q) => ({ questionId: q.id, choiceId: choices[q.id] }));
    const result = await submitAnswersAction(test.id, userAnswers);

    if (result.status === "error") {
      if (result.message === "not_authenticated") {
        router.push(`/${locale}/login`);
        return;
      }
      setError(result.message);
      setLoading(false);
      return;
    }

    router.push(`/${locale}/tests/${test.id}/result`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {test.questions.map((question, index) => (
        <SectionCard key={question.id} className="flex flex-col gap-3">
          <p className="font-medium text-foreground">
            {index + 1}. {question.text}
          </p>
          <div className="flex flex-col gap-2">
            {question.options.map((option) => (
              <label key={option.id} className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="radio"
                  name={question.id}
                  value={option.id}
                  checked={choices[question.id] === option.id}
                  onChange={() => setChoices((prev) => ({ ...prev, [question.id]: option.id }))}
                />
                {option.text}
              </label>
            ))}
          </div>
        </SectionCard>
      ))}

      {error && <p className="text-sm text-destructive">{t(`tests.errors.${error}`)}</p>}

      <Button type="submit" variant="confirm" disabled={loading || !allAnswered}>
        {t("tests.submitAnswers")}
      </Button>
    </form>
  );
}
