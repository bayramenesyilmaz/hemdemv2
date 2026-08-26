import { redirect } from "next/navigation";
import { getAuthUserId } from "@/lib/session";
import { repositories } from "@/lib/repositories";

/**
 * Admin sayfalarının hepsinde tekrar eden yetki kontrolü: giriş yapmamışsa
 * login'e, giriş yapmış ama admin değilse ana sayfaya yönlendirir. Bu
 * sadece sayfa seviyesindeki (optimistic) kontroldür — her admin usecase'i
 * kendi içinde de `role === "admin"` doğrulaması yapar (defense-in-depth).
 *
 * @param {string} locale
 * @returns {Promise<string>} userId
 */
export async function requireAdmin(locale) {
  const userId = await getAuthUserId();
  if (!userId) {
    redirect(`/${locale}/login`);
  }

  const profile = await repositories.user.findById(userId);
  if (!profile || profile.role !== "admin") {
    redirect(`/${locale}`);
  }

  return userId;
}
