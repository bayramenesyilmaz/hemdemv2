"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/locales/client";
import { Button } from "@/components/ui/Button";
import { SectionCard } from "@/components/SectionCard";
import { AdSlot } from "@/components/AdSlot";
import { cn } from "@/lib/cn";
import { submitAnswersAction } from "@/lib/actions/testActions";

const AD_SECONDS = 5;

/**
 * Test çözme akışı. Doğru cevap yoktur — amaç, aynı şıkları seçen
 * insanları bulmaktır; bu yüzden arayüz "sınav" değil "anket" gibi
 * davranır (puan/doğruluk göstergesi yok).
 *
 * Cevaplar gönderildikten sonra sonuç hesaplanırken geri sayımlı bir
 * reklam ekranı gösterilir, sonra sonuç sayfasına geçilir.
 */
export function SolveTestForm({ locale, test }) {
  const t = useI18n();
  const router = useRouter();
  const [choices, setChoices] = useState({});
  const [error, setError] = useState(null);
  const [phase, setPhase] = useState("answering");
  const [remaining, setRemaining] = useState(AD_SECONDS);

  const answeredCount = test.questions.filter((q) => choices[q.id]).length;
  const allAnswered = answeredCount === test.questions.length;
  const progress = Math.round((answeredCount / test.questions.length) * 100);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setPhase("submitting");

    const userAnswers = test.questions.map((q) => ({ questionId: q.id, choiceId: choices[q.id] }));

    let result;
    try {
      result = await submitAnswersAction(test.id, userAnswers);
    } catch (err) {
      // Beklenmedik bir sunucu hatası (örn. geçici bir bağlantı sorunu):
      // yakalanmazsa "Gönderiliyor…" durumunda sonsuza kadar takılı
      // kalıyordu — cevap aslında kaydedilmiş de olabilir, kullanıcı
      // tekrar denerse "already_answered" görüp anlar.
      console.error("[tests] cevap gönderilirken beklenmedik hata:", err);
      setError("unexpected_error");
      setPhase("answering");
      return;
    }

    if (result.status === "error") {
      if (result.message === "not_authenticated") {
        router.push(`/${locale}/login`);
        return;
      }
      setError(result.message);
      setPhase("answering");
      return;
    }

    // Cevap kaydedildi; sonucu göstermeden önce reklam süresini işlet.
    setPhase("ad");
    let left = AD_SECONDS;
    const interval = setInterval(() => {
      left -= 1;
      setRemaining(left);
      if (left <= 0) {
        clearInterval(interval);
        router.push(`/${locale}/tests/${test.id}/result`);
      }
    }, 1000);
  }

  if (phase === "ad") {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-muted border-t-primary" />
        <div>
          <p className="text-lg font-semibold text-foreground">{t("tests.calculating")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("tests.calculatingHint", { seconds: remaining })}
          </p>
        </div>
        <AdSlot label={t("ads.label")} className="h-48" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* İlerleme çubuğu: kısa testlerde bile "ne kadar kaldı" hissi verir. */}
      <div className="sticky top-14 z-10 -mx-4 bg-background/90 px-4 py-2 backdrop-blur lg:top-0">
        <div className="flex items-center justify-between pb-1.5 text-xs font-medium text-muted-foreground">
          <span>{t("tests.progress", { current: answeredCount, total: test.questions.length })}</span>
          <span className="tabular-nums">%{progress}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

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
        disabled={phase === "submitting" || !allAnswered}
        className="sticky bottom-4 shadow-float"
      >
        {phase === "submitting" ? t("tests.submitting") : t("tests.submitAnswers")}
      </Button>
    </form>
  );
}
