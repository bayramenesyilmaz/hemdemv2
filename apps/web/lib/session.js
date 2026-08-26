import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Sadece tarayıcıdan gelen oturum çerezini okuyup hangi kullanıcının
 * giriş yaptığını çözer (anon key ile) — hiçbir veri yazmaz/okumaz.
 * Gerçek veri erişimi her zaman `lib/repositories.js` (service role)
 * üzerinden yapılır.
 *
 * @returns {Promise<string|null>}
 */
export async function getAuthUserId() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}
