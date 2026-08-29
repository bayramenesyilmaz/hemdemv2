"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/locales/client";
import { Button } from "@/components/ui/Button";
import { SectionCard } from "@/components/SectionCard";
import { InfoBanner } from "@/components/InfoBanner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/Dialog";
import { cn } from "@/lib/cn";
import { fetchTestByIdAction, submitAnswersAction } from "@/lib/actions/testActions";

/**
 * Bir "kapı testi" (gate test) olan kullanıcıyı beğenmeye çalışınca
 * `likeUser`'ın döndürdüğü `gate_test_not_completed` hatası burada
 * yakalanıp bu modal açılıyor: kullanıcı testi ayrı bir sayfaya gitmeden,
 * akışı bozmadan burada çözüyor. Cevap kaydedildikten sonra çağıran
 * bileşen `onSolved`'da beğeniyi otomatik tekrar dener — eşik geçildiyse
 * beğeni gönderilir, geçilmediyse `gate_test_threshold_not_met` hatası
 * normal akışta gösterilir.
 */
export function GateTestDialog({ open, onOpenChange, testId, targetName, onSolved }) {
  const t = useI18n();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [choices, setChoices] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !testId) return;
    let cancelled = false;

    async function load() {
      setTest(null);
      setChoices({});
      setError(null);
      setLoading(true);
      const result = await fetchTestByIdAction(testId);
      if (cancelled) return;
      setLoading(false);
      if (result.status === "success") {
        setTest(result.data);
      } else {
        setError(result.message);
      }
    }
    load();

    return () => {
      cancelled = true;
    };
  }, [open, testId]);

  const answeredCount = test ? test.questions.filter((q) => choices[q.id]).length : 0;
  const allAnswered = test ? answeredCount === test.questions.length : false;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!test || !allAnswered) return;
    setSubmitting(true);
    setError(null);

    const userAnswers = test.questions.map((q) => ({ questionId: q.id, choiceId: choices[q.id] }));
    const result = await submitAnswersAction(test.id, userAnswers);
    setSubmitting(false);

    if (result.status === "error") {
      setError(result.message);
      return;
    }

    onSolved();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="full">
        <DialogTitle>{targetName ? t("discover.gateTestModalTitle", { name: targetName }) : test?.title}</DialogTitle>

        <InfoBanner>{t("discover.gateTestExplainer")}</InfoBanner>

        {loading && (
          <div className="flex flex-1 items-center justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-muted border-t-primary" />
          </div>
        )}

        {test && (
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            <p className="text-xs font-medium text-muted-foreground">
              {t("tests.progress", { current: answeredCount, total: test.questions.length })}
            </p>

            {test.questions.map((question, index) => (
              <SectionCard key={question.id} className="flex flex-col gap-3">
                <p className="font-semibold text-foreground">
                  <span className="mr-2 text-primary">{index + 1}.</span>
                  {question.text}
                </p>

                <div className="flex flex-col gap-2">
                  {question.options.map((option) => {
                    const selected = choices[question.id] === option.id;
                    return (
                      <label
                        key={option.id}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all duration-150 active:scale-[0.99]",
                          selected
                            ? "border-primary bg-primary/10 font-medium text-foreground"
                            : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted"
                        )}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={option.id}
                          checked={selected}
                          onChange={() => setChoices((prev) => ({ ...prev, [question.id]: option.id }))}
                          className="sr-only"
                        />
                        <span
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                            selected ? "border-primary" : "border-border"
                          )}
                        >
                          {selected && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                        </span>
                        {option.text}
                      </label>
                    );
                  })}
                </div>
              </SectionCard>
            ))}

            {error && <p className="text-sm text-destructive">{t(`tests.errors.${error}`)}</p>}

            <Button
              type="submit"
              variant="confirm"
              loading={submitting}
              disabled={!allAnswered}
              className="sticky bottom-4 shadow-float"
            >
              {t("tests.submitAnswers")}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
