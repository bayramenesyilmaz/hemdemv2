"use client";

import { useState } from "react";
import { useI18n } from "@/locales/client";
import { SectionCard } from "@/components/SectionCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { submitRequestAction } from "@/lib/actions/supportActions";

export function SupportForm({ isAuthenticated }) {
  const t = useI18n();
  const [type, setType] = useState("request");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const result = await submitRequestAction({
      type,
      subject,
      description,
      email: isAuthenticated ? undefined : email,
    });
    setLoading(false);

    if (result.status === "error") {
      setError(t(`support.errors.${result.message}`));
      return;
    }

    setSuccess(true);
    setSubject("");
    setDescription("");
    setEmail("");
  }

  if (success) {
    return <SectionCard>{t("support.success")}</SectionCard>;
  }

  return (
    <SectionCard>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">{t("support.typeLabel")}</label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="request">{t("support.typeRequest")}</SelectItem>
              <SelectItem value="complaint">{t("support.typeComplaint")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="subject" className="text-sm text-muted-foreground">
            {t("support.subjectLabel")}
          </label>
          <Input id="subject" required value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="text-sm text-muted-foreground">
            {t("support.descriptionLabel")}
          </label>
          <Textarea
            id="description"
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {!isAuthenticated && (
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm text-muted-foreground">
              {t("auth.emailLabel")}
            </label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" variant="send" loading={loading} className="self-end">
          {t("support.submit")}
        </Button>
      </form>
    </SectionCard>
  );
}
