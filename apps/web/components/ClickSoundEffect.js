"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE_SELECTOR =
  'button, a[href], [role="button"], input[type="submit"], input[type="checkbox"], input[type="radio"]';

/**
 * Etkileşimli öğelere (buton, link, vb.) tıklanınca duyulan çok kısa,
 * kısık bir "tık" sesi — dosya indirmek yerine Web Audio API ile anlık
 * sentezleniyor (ağ isteği yok, PWA offline modunda da çalışır).
 * `AudioContext` tarayıcı politikası gereği ilk kullanıcı jestinden önce
 * oluşturulamaz, bu yüzden ilk tıklamada tembel (lazy) olarak kurulur.
 */
export function ClickSoundEffect() {
  const audioCtxRef = useRef(null);

  useEffect(() => {
    function playClick() {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(720, now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.05);
    }

    function handleClick(event) {
      if (event.target instanceof Element && event.target.closest(INTERACTIVE_SELECTOR)) {
        playClick();
      }
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
