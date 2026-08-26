import { createRepositories } from "@hemdem/core/infrastructure/container";
import { createMockRepositories } from "@hemdem/core/infrastructure/mockContainer";

export const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

/**
 * Composition root singleton. Sunucu tarafı (Server Actions / Route
 * Handlers) her zaman `service role` key ile çalışır — tarayıcıya hiçbir
 * Supabase anahtarı sızmaz.
 *
 * Gerçek bir Supabase projesi bağlanana kadar `NEXT_PUBLIC_USE_MOCK_DATA=true`
 * ile bellek içi seed veriye (bkz. `@hemdem/core/infrastructure/mock`)
 * geçilebilir — uygulamanın geri kalanı bu anahtarı bilmez, sadece
 * `repositories` nesnesini kullanır.
 */
export const repositories = USE_MOCK_DATA
  ? createMockRepositories()
  : createRepositories({
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    });
