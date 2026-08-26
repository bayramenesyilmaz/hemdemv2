"use client";

import { createBrowserClient } from "@supabase/ssr";

let client;

/**
 * `@supabase/ssr`'ın browser client'ı oturumu cookie'de tutar (localStorage
 * değil) — bu sayede sunucu tarafı (`lib/session.js`) aynı cookie'yi okuyup
 * hangi kullanıcının giriş yaptığını çözebilir. Login/register/reset-password
 * formları dışında kullanılmaz; gerçek veri erişimi her zaman service-role
 * repository'ler üzerinden sunucuda yapılır.
 */
export function getSupabaseBrowserClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return client;
}
