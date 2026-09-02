"use client";

import { useState } from "react";

const STORAGE_KEY = "hemdem-theme";

function readIsLight() {
  if (typeof document === "undefined") return false;
  return document.documentElement.getAttribute("data-theme") === "light";
}

/**
 * Koyu tema varsayılan ve tek CSS kaynağı `:root` — bu sadece opsiyonel
 * açık temayı `<html data-theme="light">` ile açıp kapatıyor. Sunucu
 * tarafında hangi tema seçili olduğu bilinmiyor (localStorage'a bağlı);
 * ThemeScript.js ilk boyamadan önce `<html>`a doğru `data-theme`'i zaten
 * uyguladığı için burada gerçek görsel bir uyuşmazlık yok, ama React'ın
 * hydration karşılaştırması sunucudaki "bilinmiyor" değeriyle tarayıcıdaki
 * gerçek değeri farklı bulabilir — `<html>`daki gibi (layout.js) burada da
 * suppressHydrationWarning ile bu zararsız uyarı susturuluyor.
 */
export function ThemeSwitcher() {
  const [isLight, setIsLight] = useState(readIsLight);

  function toggle() {
    const next = !isLight;
    setIsLight(next);
    if (next) {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem(STORAGE_KEY, "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem(STORAGE_KEY, "dark");
    }
  }

  return (
    <div className="flex items-center gap-1 text-sm" role="group" aria-label="Tema" suppressHydrationWarning>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={!isLight}
        suppressHydrationWarning
        className={
          !isLight
            ? "rounded-md px-2 py-1 font-semibold text-foreground"
            : "rounded-md px-2 py-1 text-muted-foreground hover:text-foreground"
        }
      >
        Koyu
      </button>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={isLight}
        suppressHydrationWarning
        className={
          isLight
            ? "rounded-md px-2 py-1 font-semibold text-foreground"
            : "rounded-md px-2 py-1 text-muted-foreground hover:text-foreground"
        }
      >
        Açık
      </button>
    </div>
  );
}
