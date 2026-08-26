"use client";

import { useEffect } from "react";

/**
 * Service worker'ı yalnızca üretimde kaydeder. Geliştirmede kaydetmek,
 * Next'in HMR isteklerinin araya girmesine ve eski varlıkların
 * sunulmasına yol açtığı için bilerek atlanır.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Kayıt başarısız olursa uygulama normal (çevrimiçi) çalışmaya devam eder.
      });
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register);
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
