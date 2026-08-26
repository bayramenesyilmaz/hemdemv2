"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/locales/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";

const ALL = "all";

export function DiscoverFilters({ locale, initialGender, initialCountry, initialMinAge, initialMaxAge }) {
  const t = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [gender, setGender] = useState(initialGender ?? ALL);
  const [country, setCountry] = useState(initialCountry ?? "");
  const [minAge, setMinAge] = useState(initialMinAge ?? "");
  const [maxAge, setMaxAge] = useState(initialMaxAge ?? "");

  function applyFilters() {
    const params = new URLSearchParams();
    if (gender !== ALL) params.set("gender", gender);
    if (country) params.set("country", country);
    if (minAge) params.set("minAge", minAge);
    if (maxAge) params.set("maxAge", maxAge);

    const query = params.toString();
    router.push(`/${locale}/discover${query ? `?${query}` : ""}`);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          {t("discover.filter")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{t("discover.filterTitle")}</DialogTitle>

        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted-foreground">{t("discover.genderLabel")}</label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{t("discover.anyGender")}</SelectItem>
                <SelectItem value="male">{t("auth.onboarding.genderMale")}</SelectItem>
                <SelectItem value="female">{t("auth.onboarding.genderFemale")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="country" className="text-sm text-muted-foreground">
              {t("profile.countryLabel")}
            </label>
            <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="TR" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="minAge" className="text-sm text-muted-foreground">
                {t("discover.minAgeLabel")}
              </label>
              <Input id="minAge" type="number" min={18} value={minAge} onChange={(e) => setMinAge(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="maxAge" className="text-sm text-muted-foreground">
                {t("discover.maxAgeLabel")}
              </label>
              <Input id="maxAge" type="number" min={18} value={maxAge} onChange={(e) => setMaxAge(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {t("profile.cancel")}
            </Button>
          </DialogClose>
          <Button type="button" variant="confirm" onClick={applyFilters}>
            {t("tests.applyFilters")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
