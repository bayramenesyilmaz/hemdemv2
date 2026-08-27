"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/locales/client";
import { completeOnboardingAction } from "@/lib/actions/authActions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";

export function OnboardingForm({ locale }) {
  const t = useI18n();
  const router = useRouter();
  const [gender, setGender] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [interestedIn, setInterestedIn] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const result = await completeOnboardingAction({ gender, birthdate, interestedIn });
    if (result.status === "error") {
      setError(result.message);
      setLoading(false);
      return;
    }

    router.push(`/${locale}/discover`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm text-muted-foreground">{t("auth.onboarding.genderLabel")}</label>
        <Select value={gender} onValueChange={setGender} required>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">{t("auth.onboarding.genderMale")}</SelectItem>
            <SelectItem value="female">{t("auth.onboarding.genderFemale")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="birthdate" className="text-sm text-muted-foreground">
          {t("auth.onboarding.birthdateLabel")}
        </label>
        <Input
          id="birthdate"
          type="date"
          required
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-muted-foreground">{t("auth.onboarding.interestedInLabel")}</label>
        <Select value={interestedIn} onValueChange={setInterestedIn} required>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">{t("auth.onboarding.interestedMale")}</SelectItem>
            <SelectItem value="female">{t("auth.onboarding.interestedFemale")}</SelectItem>
            <SelectItem value="both">{t("auth.onboarding.interestedBoth")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" variant="confirm" loading={loading} disabled={!gender || !interestedIn}>
        {t("auth.onboarding.submit")}
      </Button>
    </form>
  );
}
