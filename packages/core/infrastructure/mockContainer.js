import { getMockStore } from "./mock/mockStore.js";
import { createMockUserRepository } from "./mock/mockUserRepository.js";
import { createMockTestRepository } from "./mock/mockTestRepository.js";
import { createMockSwipeRepository } from "./mock/mockSwipeRepository.js";
import { createMockMatchRepository } from "./mock/mockMatchRepository.js";
import { createMockChatRepository } from "./mock/mockChatRepository.js";
import { createMockPostRepository } from "./mock/mockPostRepository.js";
import { createMockNoteRepository } from "./mock/mockNoteRepository.js";
import { createMockProfileViewRepository } from "./mock/mockProfileViewRepository.js";
import { createMockCoinRepository } from "./mock/mockCoinRepository.js";
import { createMockPointRepository } from "./mock/mockPointRepository.js";
import { createMockRequestRepository } from "./mock/mockRequestRepository.js";
import { createMockAuthAdminRepository } from "./mock/mockAuthAdminRepository.js";
import { createMockAuthRepository } from "./mock/mockAuthRepository.js";
import { createMockNotificationRepository } from "./mock/mockNotificationRepository.js";

/**
 * `createRepositories` (container.js) ile birebir aynı şekli döndürür,
 * ama Supabase yerine bellek içi seed veriyle çalışır. Gerçek bir
 * Supabase projesi bağlanana kadar `apps/web`'i uçtan uca test edebilmek
 * için — bkz. `apps/web/lib/repositories.js`'teki `USE_MOCK_DATA` anahtarı.
 *
 * Ekstra olarak `mockAuth` döndürür: bu gerçek repository sözleşmelerinin
 * parçası değildir, sadece mock modda Supabase Auth'un (signUp/signIn)
 * yerini tutar.
 */
export function createMockRepositories() {
  const store = getMockStore();

  return {
    user: createMockUserRepository(store),
    test: createMockTestRepository(store),
    swipe: createMockSwipeRepository(store),
    match: createMockMatchRepository(store),
    chat: createMockChatRepository(store),
    post: createMockPostRepository(store),
    note: createMockNoteRepository(store),
    profileView: createMockProfileViewRepository(store),
    coin: createMockCoinRepository(store),
    point: createMockPointRepository(store),
    request: createMockRequestRepository(store),
    notification: createMockNotificationRepository(store),
    authAdmin: createMockAuthAdminRepository(store),
    mockAuth: createMockAuthRepository(store),
  };
}
