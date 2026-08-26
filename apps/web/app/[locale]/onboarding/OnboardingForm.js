"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/locales/client";
import { completeOnboardingAction } from "@/lib/actions/authActions";

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
        <label htmlFor="gender" className="text-sm text-muted-foreground">
          {t("auth.onboarding.genderLabel")}
        </label>
        <select
          id="gender"
          required
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-foreground"
        >
          <option value="" disabled>
            —
          </option>
          <option value="male">{t("auth.onboarding.genderMale")}</option>
          <option value="female">{t("auth.onboarding.genderFemale")}</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="birthdate" className="text-sm text-muted-foreground">
          {t("auth.onboarding.birthdateLabel")}
        </label>
        <input
          id="birthdate"
          type="date"
          required
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-foreground"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="interestedIn" className="text-sm text-muted-foreground">
          {t("auth.onboarding.interestedInLabel")}
        </label>
        <select
          id="interestedIn"
          required
          value={interestedIn}
          onChange={(e) => setInterestedIn(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-foreground"
        >
          <option value="" disabled>
            —
          </option>
          <option value="male">{t("auth.onboarding.interestedMale")}</option>
          <option value="female">{t("auth.onboarding.interestedFemale")}</option>
          <option value="both">{t("auth.onboarding.interestedBoth")}</option>
        </select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground disabled:opacity-60"
      >
        {t("auth.onboarding.submit")}
      </button>
    </form>
  );
}
