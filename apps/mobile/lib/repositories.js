import { createMockRepositories } from "@hemdem/core/infrastructure/mockContainer";

/**
 * Bu, apps/web/lib/repositories.js'in mobil karşılığı — aynı composition
 * root deseni. `packages/core` framework'ten bağımsız olduğu için burada
 * hiçbir uyarlama gerekmedi, sadece aynı fonksiyon çağrılıyor.
 *
 * İskelet aşamasında sadece mock repository'ler bağlı; gerçek Supabase
 * bağlantısı (apps/web'deki `createRepositories` + service-role key) ileride
 * eklenecek — mobilde service-role key'in cihazda taşınamayacağı için bu,
 * web'deki gibi bir API/route handler katmanı gerektirecek.
 */
export const repositories = createMockRepositories();
