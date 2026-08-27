"use client";

import { useCurrentLocale } from "@/locales/client";
import { COUNTRIES } from "@/lib/countries";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";

/**
 * Ülke serbest metin yerine sabit veri listesinden seçilir — hem yazım
 * hatalarını önler hem de filtrelerle (aynı kodu) tutarlı eşleşir.
 */
export function CountrySelect({ value, onValueChange, placeholder, allowClear, clearLabel }) {
  const locale = useCurrentLocale();
  const sorted = [...COUNTRIES].sort((a, b) => a[locale === "en" ? "en" : "tr"].localeCompare(b[locale === "en" ? "en" : "tr"], locale));

  return (
    <Select value={value || undefined} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allowClear && (
          <SelectItem value="__any__">{clearLabel}</SelectItem>
        )}
        {sorted.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            {locale === "en" ? country.en : country.tr}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
