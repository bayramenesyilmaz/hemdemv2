"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/locales/client";
import { SectionCard } from "@/components/SectionCard";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { createPostAction } from "@/lib/actions/postActions";

const NO_TAG = "none";

export function PostComposer({ tests }) {
  const t = useI18n();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [taggedTestId, setTaggedTestId] = useState(NO_TAG);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const result = await createPostAction({
      content,
      taggedTestId: taggedTestId === NO_TAG ? undefined : taggedTestId,
    });
    setLoading(false);

    if (result.status === "error") {
      setError(t(`posts.errors.${result.message}`));
      return;
    }

    setContent("");
    setTaggedTestId(NO_TAG);
    router.refresh();
  }

  return (
    <SectionCard>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Textarea
          required
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t("posts.composerPlaceholder")}
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">{t("posts.taggedTestLabel")}</label>
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
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" variant="add" disabled={loading || !content.trim()} className="self-end">
          {t("posts.publish")}
        </Button>
      </form>
    </SectionCard>
  );
}
