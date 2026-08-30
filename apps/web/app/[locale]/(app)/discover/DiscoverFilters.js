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

export const DISCOVER_FILTERS_STORAGE_KEY = "hemdem:discoverFilters";

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

  // Filtre önceki bir ziyaretten (localStorage) sessizce geri
  // yükleniyor olabilir — kullanıcı bunu görmezse, kime bakmadığını
  // hiç fark etmeden aramaya devam eder. Bu yüzden aktif bir filtre
  // varken buton üzerinde her zaman görünür bir işaret gösterilir.
  const hasActiveFilter =
    Boolean(initialGender) || Boolean(initialCountry) || Boolean(initialMinAge) || Boolean(initialMaxAge);

  function applyFilters() {
    const params = new URLSearchParams();
    if (gender !== ALL) params.set("gender", gender);
    if (country !== ANY_COUNTRY) params.set("country", country);
    if (ageRange[0] > AGE_MIN) params.set("minAge", String(ageRange[0]));
    if (ageRange[1] < AGE_MAX) params.set("maxAge", String(ageRange[1]));

    const query = params.toString();
    // Filtreler bir dahaki girişte tekrar seçilmesin diye kalıcı olarak
    // hatırlanır — boş sorgu da (kasıtlı "filtresiz" tercihi) saklanır.
    try {
      localStorage.setItem(DISCOVER_FILTERS_STORAGE_KEY, query);
    } catch {
      // localStorage kapalıysa (gizli sekme vb.) sessizce yok say.
    }
    router.push(`/${locale}/discover${query ? `?${query}` : ""}`);
    setOpen(false);
  }

  function clearFilters() {
    setGender(ALL);
    setCountry(ANY_COUNTRY);
    setAgeRange([AGE_MIN, AGE_MAX]);
    try {
      localStorage.setItem(DISCOVER_FILTERS_STORAGE_KEY, "");
    } catch {
      // localStorage kapalıysa (gizli sekme vb.) sessizce yok say.
    }
    router.push(`/${locale}/discover`);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="relative">
          {t("discover.filter")}
          {hasActiveFilter && (
            <span
              className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-primary"
              title={t("discover.filterActiveHint")}
            />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{t("discover.filterTitle")}</DialogTitle>

        {hasActiveFilter && (
          <p className="mt-2 rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary">
            {t("discover.activeFilterNotice")}
          </p>
        )}

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

        <div className="mt-6 flex items-center justify-between gap-3">
          {hasActiveFilter ? (
            <Button type="button" variant="ghost" onClick={clearFilters} className="text-destructive">
              {t("discover.clearFilters")}
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-3">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("profile.cancel")}
              </Button>
            </DialogClose>
            <Button type="button" variant="confirm" onClick={applyFilters}>
              {t("tests.applyFilters")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
