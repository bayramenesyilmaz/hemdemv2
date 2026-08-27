import { createSupabaseServerClient } from "./supabase/supabaseClient.js";
import { createSupabaseUserRepository } from "./supabase/supabaseUserRepository.js";
import { createSupabaseTestRepository } from "./supabase/supabaseTestRepository.js";
import { createSupabaseSwipeRepository } from "./supabase/supabaseSwipeRepository.js";
import { createSupabaseMatchRepository } from "./supabase/supabaseMatchRepository.js";
import { createSupabaseChatRepository } from "./supabase/supabaseChatRepository.js";
import { createSupabasePostRepository } from "./supabase/supabasePostRepository.js";
import { createSupabaseNoteRepository } from "./supabase/supabaseNoteRepository.js";
import { createSupabaseProfileViewRepository } from "./supabase/supabaseProfileViewRepository.js";
import { createSupabaseCoinRepository } from "./supabase/supabaseCoinRepository.js";
import { createSupabasePointRepository } from "./supabase/supabasePointRepository.js";
import { createSupabaseRequestRepository } from "./supabase/supabaseRequestRepository.js";
import { createSupabaseAuthAdminRepository } from "./supabase/supabaseAuthAdminRepository.js";
import { createSupabaseNotificationRepository } from "./supabase/supabaseNotificationRepository.js";
import { createSupabaseLeaderboardRewardRepository } from "./supabase/supabaseLeaderboardRewardRepository.js";

/**
 * Composition root. `usecases/*` bu nesneyi parametre olarak alır ve
 * hiçbir zaman doğrudan Supabase'i bilmez. Farklı bir veritabanına
 * geçilirse sadece bu dosya ve infrastructure/supabase/* değişir.
 *
 * @param {{ url: string, serviceRoleKey: string }} supabaseConfig
 */
export function createRepositories(supabaseConfig) {
  const client = createSupabaseServerClient(supabaseConfig);

  return {
    user: createSupabaseUserRepository(client),
    test: createSupabaseTestRepository(client),
    swipe: createSupabaseSwipeRepository(client),
    match: createSupabaseMatchRepository(client),
    chat: createSupabaseChatRepository(client),
    post: createSupabasePostRepository(client),
    note: createSupabaseNoteRepository(client),
    profileView: createSupabaseProfileViewRepository(client),
    coin: createSupabaseCoinRepository(client),
    point: createSupabasePointRepository(client),
    leaderboardReward: createSupabaseLeaderboardRewardRepository(client),
    request: createSupabaseRequestRepository(client),
    notification: createSupabaseNotificationRepository(client),
    authAdmin: createSupabaseAuthAdminRepository(client),
  };
}
