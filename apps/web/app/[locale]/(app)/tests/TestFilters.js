"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TEST_CATEGORIES } from "@hemdem/core/domain/entities/test";
import { useI18n } from "@/locales/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";

const ALL = "all";

export function TestFilters({ locale, initialCategory, initialLanguage, initialSearch }) {
  const t = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(initialCategory ?? ALL);
  const [language, setLanguage] = useState(initialLanguage ?? ALL);
  const [search, setSearch] = useState(initialSearch ?? "");

  function applyFilters() {
    const params = new URLSearchParams();
    if (category !== ALL) params.set("category", category);
    // Dil her zaman set edilir (ALL dahil) — böylece sayfa "hiç
    // dokunulmadı" (varsayılan olarak kullanıcının dilini göster) ile
    // "kullanıcı bilinçli olarak Tüm dilleri seçti" durumunu ayırt
    // edebiliyor, bkz. page.js'teki selectedLanguage hesabı.
    params.set("language", language);
    if (search) params.set("search", search);

    const query = params.toString();
    router.push(`/${locale}/tests${query ? `?${query}` : ""}`);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          {t("tests.filter")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{t("tests.filterTitle")}</DialogTitle>

        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted-foreground">{t("tests.categoryLabel")}</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{t("tests.allCategories")}</SelectItem>
                {TEST_CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {t(`testCategories.${c.key}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted-foreground">{t("tests.languageLabel")}</label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{t("tests.allLanguages")}</SelectItem>
                <SelectItem value="tr">Türkçe</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="search" className="text-sm text-muted-foreground">
              {t("tests.searchLabel")}
            </label>
            <Input id="search" value={search} onChange={(e) => setSearch(e.target.value)} />
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
