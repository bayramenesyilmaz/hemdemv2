"use client";

import { TEST_LIMITS } from "@hemdem/core/domain/entities/test";
import { useI18n } from "@/locales/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SectionCard } from "@/components/SectionCard";
import { TrashIcon, PlusIcon } from "@/components/icons";

export function newOption() {
  return { id: crypto.randomUUID(), text: "" };
}

export function newQuestion() {
  return { id: crypto.randomUUID(), text: "", options: [newOption(), newOption()] };
}

/**
 * Soru/şık editörü. Hem "Test Oluştur" sayfası hem de gönderi paylaşırken
 * açılan hızlı test bölümü aynı bileşeni kullanır; böylece limitler
 * (en fazla 10 soru, 2-4 şık) tek yerde uygulanır.
 */
export function TestQuestionsBuilder({ questions, onChange, compact = false }) {
  const t = useI18n();
  const canAddQuestion = questions.length < TEST_LIMITS.maxQuestions;

  function updateQuestionText(qIndex, text) {
    onChange(questions.map((q, i) => (i === qIndex ? { ...q, text } : q)));
  }

  function updateOptionText(qIndex, oIndex, text) {
    onChange(
      questions.map((q, i) =>
        i === qIndex ? { ...q, options: q.options.map((o, j) => (j === oIndex ? { ...o, text } : o)) } : q
      )
    );
  }

  function addQuestion() {
    if (!canAddQuestion) return;
    onChange([...questions, newQuestion()]);
  }

  function removeQuestion(qIndex) {
    onChange(questions.filter((_, i) => i !== qIndex));
  }

  function addOption(qIndex) {
    onChange(
      questions.map((q, i) =>
        i === qIndex && q.options.length < TEST_LIMITS.maxOptions
          ? { ...q, options: [...q.options, newOption()] }
          : q
      )
    );
  }

  function removeOption(qIndex, oIndex) {
    onChange(
      questions.map((q, i) => (i === qIndex ? { ...q, options: q.options.filter((_, j) => j !== oIndex) } : q))
    );
  }

  const Wrapper = compact ? "div" : SectionCard;
  const wrapperClass = compact
    ? "flex animate-list-in flex-col gap-3 rounded-2xl border border-border bg-background p-3"
    : "flex animate-list-in flex-col gap-3";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-gradient-surface px-4 py-3">
        <p className="text-xs text-muted-foreground">{t("tests.limitHint")}</p>
        <span className="shrink-0 rounded-full bg-background px-3 py-1 text-xs font-semibold text-primary shadow-soft">
          {t("tests.progress", { current: questions.length, total: TEST_LIMITS.maxQuestions })}
        </span>
      </div>

      {questions.map((question, qIndex) => {
        const canAddOption = question.options.length < TEST_LIMITS.maxOptions;
        const canRemoveOption = question.options.length > TEST_LIMITS.minOptions;

        return (
          <Wrapper key={question.id} className={wrapperClass}>
            <div className="flex items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground shadow-soft">
                {qIndex + 1}
              </span>
              <Input
                required
                placeholder={t("tests.questionPlaceholder", { number: qIndex + 1 })}
                value={question.text}
                onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                className="flex-1"
              />
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  aria-label={t("tests.removeQuestion")}
                  className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <TrashIcon className="size-4" />
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2 pl-11">
              {question.options.map((option, oIndex) => (
                <div key={option.id} className="flex items-center gap-2">
                  <span className="w-5 shrink-0 text-center text-xs font-semibold text-muted-foreground">
                    {String.fromCharCode(65 + oIndex)}
                  </span>
                  <Input
                    required
                    placeholder={t("tests.optionPlaceholder", { number: oIndex + 1 })}
                    value={option.text}
                    onChange={(e) => updateOptionText(qIndex, oIndex, e.target.value)}
                    className="flex-1"
                  />
                  {canRemoveOption && (
                    <button
                      type="button"
                      onClick={() => removeOption(qIndex, oIndex)}
                      aria-label={t("tests.removeOption")}
                      className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <TrashIcon className="size-4" />
                    </button>
                  )}
                </div>
              ))}
              {canAddOption ? (
                <Button type="button" variant="outline" onClick={() => addOption(qIndex)} className="self-start">
                  <PlusIcon className="size-4" />
                  {t("tests.addOption")}
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {t("tests.maxOptionsReached", { max: TEST_LIMITS.maxOptions })}
                </p>
              )}
            </div>
          </Wrapper>
        );
      })}

      {canAddQuestion ? (
        <Button type="button" variant="outline" onClick={addQuestion} className="self-start">
          <PlusIcon className="size-4" />
          {t("tests.addQuestion")}
        </Button>
      ) : (
        <p className="text-xs text-muted-foreground">
          {t("tests.maxQuestionsReached", { max: TEST_LIMITS.maxQuestions })}
        </p>
      )}
    </div>
  );
}
