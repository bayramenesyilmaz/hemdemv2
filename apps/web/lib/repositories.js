import { createRepositories } from "@hemdem/core/infrastructure/container";

/**
 * Composition root singleton. Sunucu tarafı (Server Actions / Route
 * Handlers) her zaman `service role` key ile çalışır — tarayıcıya hiçbir
 * Supabase anahtarı sızmaz.
 */
export const repositories = createRepositories({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
});
