import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { USE_MOCK_DATA } from "@/lib/repositories";
import { MOCK_SESSION_COOKIE } from "@/lib/constants";

/**
 * Sadece tarayıcıdan gelen oturum çerezini okuyup hangi kullanıcının
 * giriş yaptığını çözer (anon key ile) — hiçbir veri yazmaz/okumaz.
 * Gerçek veri erişimi her zaman `lib/repositories.js` (service role)
 * üzerinden yapılır.
 *
 * Mock modda (`NEXT_PUBLIC_USE_MOCK_DATA=true`) gerçek Supabase Auth
 * yerine `lib/actions/mockAuthActions.js`'in yazdığı basit bir cookie
 * okunur.
 *
 * @returns {Promise<string|null>}
 */
export async function getAuthUserId() {
  const cookieStore = await cookies();

  if (USE_MOCK_DATA) {
    return cookieStore.get(MOCK_SESSION_COOKIE)?.value ?? null;
  }

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
