"use client";

import { cn } from "@/lib/cn";

/**
 * Çift uçlu (min/max) aralık kaydırıcısı. Tek bir native `<input
 * type="range">` iki tutamacı desteklemediği için aynı izde üst üste iki
 * tanesi kullanılır; hangisinin üstte kalacağı değere göre değişir ki iki
 * tutamaç birbirine değince ikisi de sürüklenebilir kalsın.
 */
export function RangeSlider({ min, max, step = 1, value, onChange, className }) {
  const [valueMin, valueMax] = value;

  function handleMinChange(event) {
    const next = Math.min(Number(event.target.value), valueMax);
    onChange([next, valueMax]);
  }

  function handleMaxChange(event) {
    const next = Math.max(Number(event.target.value), valueMin);
    onChange([valueMin, next]);
  }

  const range = max - min || 1;
  const minPercent = ((valueMin - min) / range) * 100;
  const maxPercent = ((valueMax - min) / range) * 100;
  const minOnTop = valueMin >= max - (max - min) / 2;

  return (
    <div className={cn("relative flex h-6 w-full items-center", className)}>
      <div className="absolute inset-x-0 h-1 rounded-full bg-muted" />
      <div
        className="absolute h-1 rounded-full bg-primary"
        style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valueMin}
        onChange={handleMinChange}
        className="range-thumb pointer-events-none absolute inset-x-0 h-6 w-full bg-transparent"
        style={{ zIndex: minOnTop ? 4 : 3 }}
        aria-label="min"
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valueMax}
        onChange={handleMaxChange}
        className="range-thumb pointer-events-none absolute inset-x-0 h-6 w-full bg-transparent"
        style={{ zIndex: minOnTop ? 3 : 4 }}
        aria-label="max"
      />
    </div>
  );
}
