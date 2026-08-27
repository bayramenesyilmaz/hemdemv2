"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/locales/client";
import { Button } from "@/components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { RangeSlider } from "@/components/ui/RangeSlider";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { CountrySelect } from "@/components/CountrySelect";

const ALL = "all";
const ANY_COUNTRY = "__any__";
const AGE_MIN = 18;
const AGE_MAX = 80;

export function DiscoverFilters({ locale, initialGender, initialCountry, initialMinAge, initialMaxAge }) {
  const t = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [gender, setGender] = useState(initialGender ?? ALL);
  const [country, setCountry] = useState(initialCountry ?? ANY_COUNTRY);
  const [ageRange, setAgeRange] = useState([
    initialMinAge ? Number(initialMinAge) : AGE_MIN,
    initialMaxAge ? Number(initialMaxAge) : AGE_MAX,
  ]);

  function applyFilters() {
    const params = new URLSearchParams();
    if (gender !== ALL) params.set("gender", gender);
    if (country !== ANY_COUNTRY) params.set("country", country);
    if (ageRange[0] > AGE_MIN) params.set("minAge", String(ageRange[0]));
    if (ageRange[1] < AGE_MAX) params.set("maxAge", String(ageRange[1]));

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
            <label className="text-sm text-muted-foreground">{t("profile.countryLabel")}</label>
            <CountrySelect
              value={country}
              onValueChange={setCountry}
              allowClear
              clearLabel={t("discover.anyCountry")}
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("discover.ageRangeLabel")}</span>
              <span className="font-medium text-foreground">
                {ageRange[0]}–{ageRange[1]}
              </span>
            </div>
            <RangeSlider
              min={AGE_MIN}
              max={AGE_MAX}
              value={ageRange}
              onChange={setAgeRange}
              className="px-1"
            />
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
