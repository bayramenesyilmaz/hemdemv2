"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

/**
 * `path` sitenin kökünden itibaren (ör. `/tr/tests/123`) — paylaşım
 * linki `window.location.origin`'den türetilir, böylece hangi ortamda
 * (localhost, preview, gerçek domain) çalışıldığı fark etmez, sabit bir
 * domain kodlanmasına gerek kalmaz. Web Share API varsa (çoğunlukla
 * mobil tarayıcılar) native paylaşım sayfası açılır; yoksa (çoğu masaüstü
 * tarayıcı) link panoya kopyalanır ve kısa bir onay gösterilir.
 */
export function ShareButton({ path, title, text, label, copiedLabel, className }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}${path}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // Kullanıcı paylaşım sayfasını iptal etti — sessizce geç.
      }
      return;
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button type="button" variant="outline" onClick={handleShare} className={className}>
      {copied ? copiedLabel : label}
    </Button>
  );
}
