import "server-only";
import { cache } from "react";
import { getAuthUserId } from "@/lib/session";
import { repositories } from "@/lib/repositories";

/**
 * Giriş yapmış kullanıcının profilini request başına tek sorguyla
 * çözer. Uygulama kabuğu layout'u profili (avatar, admin rolü) ister,
 * sayfaların çoğu da aynı profili tekrar sorgular; `cache()` olmadan
 * her gezinmede aynı satır 2-3 kez veritabanından çekiliyordu.
 *
 * @returns {Promise<import("@hemdem/core/domain/entities/user").Profile|null>}
 */
export const getCurrentProfile = cache(async function getCurrentProfile() {
  const userId = await getAuthUserId();
  if (!userId) return null;
  return repositories.user.findById(userId);
});

/** Aynı gerekçeyle coin bakiyesi de request başına tek kez okunur. */
export const getCurrentCoinBalance = cache(async function getCurrentCoinBalance() {
  const userId = await getAuthUserId();
  if (!userId) return null;
  return repositories.coin.getBalance(userId);
});
