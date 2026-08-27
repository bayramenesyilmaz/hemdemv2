"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TEST_CATEGORIES } from "@hemdem/core/domain/entities/test";
import { COIN_COSTS } from "@hemdem/core/domain/entities/coin";
import { useI18n } from "@/locales/client";
import { SectionCard } from "@/components/SectionCard";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { TestQuestionsBuilder, newQuestion } from "@/components/TestQuestionsBuilder";
import { SparkIcon, CloseIcon } from "@/components/icons";
import { createPostAction, createPostWithTestAction } from "@/lib/actions/postActions";

const NO_TAG = "none";

/** Test bölümünün üç hâli: kapalı, var olan bir testi etiketle, yeni test yaz. */
const MODE = { none: "none", existing: "existing", create: "create" };

export function PostComposer({ locale, tests, author }) {
  const t = useI18n();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [mode, setMode] = useState(MODE.none);
  const [taggedTestId, setTaggedTestId] = useState(NO_TAG);
  const [testTitle, setTestTitle] = useState("");
  const [categoryId, setCategoryId] = useState(String(TEST_CATEGORIES[0].id));
  const [questions, setQuestions] = useState([newQuestion()]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function reset() {
    setContent("");
    setMode(MODE.none);
    setTaggedTestId(NO_TAG);
    setTestTitle("");
    setQuestions([newQuestion()]);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const result =
      mode === MODE.create
        ? await createPostWithTestAction({
            content,
            test: {
              title: testTitle,
              categoryId: Number(categoryId),
              language: locale,
              questions: questions.map((q) => ({
                id: q.id,
                text: q.text,
                options: q.options.map((o) => ({ id: o.id, text: o.text })),
              })),
            },
          })
        : await createPostAction({
            content,
            taggedTestId: mode === MODE.existing && taggedTestId !== NO_TAG ? taggedTestId : undefined,
          });

    setLoading(false);

    if (result.status === "error") {
      setError(t(`posts.errors.${result.message}`));
      return;
    }

    reset();
    router.refresh();
  }

  return (
    <SectionCard className="!p-3">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex gap-3">
          {author && <Avatar src={author.avatarUrl} name={author.name} size="sm" />}
          <Textarea
            required
            rows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("posts.composerPlaceholder")}
            className="flex-1"
          />
        </div>

        {mode === MODE.none ? (
          <div className="flex flex-wrap gap-2">
            {tests.length > 0 && (
              <Button type="button" variant="outline" onClick={() => setMode(MODE.existing)}>
                {t("posts.tagExisting")}
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => setMode(MODE.create)}>
              <SparkIcon className="size-4" />
              {t("posts.createNew")}
            </Button>
          </div>
        ) : (
          <div className="flex animate-fade-in flex-col gap-3 rounded-2xl bg-gradient-surface p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-foreground">
                {mode === MODE.existing ? t("posts.taggedTestLabel") : t("posts.createNew")}
              </p>
              <button
                type="button"
                onClick={() => setMode(MODE.none)}
                aria-label={t("posts.removeNewTest")}
                className="flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
              >
                <CloseIcon className="size-4" />
              </button>
            </div>

            {mode === MODE.existing ? (
              <Select value={taggedTestId} onValueChange={setTaggedTestId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_TAG}>{t("posts.noTag")}</SelectItem>
                  {tests.map((test) => (
                    <SelectItem key={test.id} value={test.id}>
                      {test.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  {t("posts.newTestNotice", { cost: COIN_COSTS.createTest })}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    required
                    value={testTitle}
                    onChange={(e) => setTestTitle(e.target.value)}
                    placeholder={t("posts.newTestTitleLabel")}
                  />
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
                <TestQuestionsBuilder compact questions={questions} onChange={setQuestions} />
              </>
            )}
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" variant="add" loading={loading} disabled={!content.trim()} className="self-end">
          {t("posts.publish")}
        </Button>
      </form>
    </SectionCard>
  );
}
