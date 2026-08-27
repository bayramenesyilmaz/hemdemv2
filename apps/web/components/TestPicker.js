"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/locales/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/Dialog";
import { searchTestsAction } from "@/lib/actions/testActions";

const NONE_VALUE = "none";

/**
 * Kapı testi seçimi ve gönderi etiketleme için ortak, aranabilir test
 * seçici. Test sayısı arttıkça hepsini önceden tarayıcıya göndermek
 * yerine (eski davranış: düz bir `<Select>` içinde tüm testler)
 * yazdıkça sunucuda arayan, en fazla 20 sonuç döndüren bir liste
 * kullanır (bkz. `searchTestsAction`).
 */
export function TestPicker({ value, onValueChange, initialSelectedTest, noneLabel, placeholder }) {
  const t = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTest, setSelectedTest] = useState(initialSelectedTest ?? null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const result = await searchTestsAction(query);
      if (result.status === "success") setResults(result.data);
      setLoading(false);
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [query, open]);

  function handleQueryChange(nextQuery) {
    setQuery(nextQuery);
    setLoading(true);
  }

  function select(test) {
    setSelectedTest(test);
    onValueChange(test ? test.id : NONE_VALUE);
    setOpen(false);
    setQuery("");
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          setOpen(true);
          setLoading(true);
        }}
        className="w-full justify-between"
      >
        <span className="truncate">{value !== NONE_VALUE && selectedTest ? selectedTest.title : noneLabel}</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>{placeholder}</DialogTitle>
          <div className="mt-4 flex flex-col gap-3">
            <Input
              autoFocus
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder={t("tests.searchLabel")}
            />
            <div className="scrollbar-none flex max-h-[50dvh] flex-col gap-1 overflow-y-auto">
              {noneLabel && (
                <button
                  type="button"
                  onClick={() => select(null)}
                  className="rounded-lg px-3 py-2.5 text-left text-sm text-muted-foreground hover:bg-muted"
                >
                  {noneLabel}
                </button>
              )}
              {loading ? (
                <p className="px-3 py-2.5 text-sm text-muted-foreground">{t("tests.searchLoading")}</p>
              ) : results.length === 0 ? (
                <p className="px-3 py-2.5 text-sm text-muted-foreground">{t("tests.searchEmpty")}</p>
              ) : (
                results.map((test) => (
                  <button
                    key={test.id}
                    type="button"
                    onClick={() => select(test)}
                    className="truncate rounded-lg px-3 py-2.5 text-left text-sm text-foreground hover:bg-muted"
                  >
                    {test.title}
                  </button>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
