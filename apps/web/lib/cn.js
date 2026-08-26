import clsx from "clsx";

/**
 * Bileşenlerde koşullu class birleştirme için ince bir sarmalayıcı.
 */
export function cn(...inputs) {
  return clsx(...inputs);
}
