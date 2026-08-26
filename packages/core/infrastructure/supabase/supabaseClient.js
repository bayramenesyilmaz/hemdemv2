import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client. Service role key ile çalışır, RLS'i bypass
 * eder. Bu dosya asla tarayıcıya bundle edilmemelidir — sadece Next.js
 * Server Actions / Route Handlers / React Native (Node ortamı) içinde
 * import edilir.
 *
 * @param {{ url: string, serviceRoleKey: string }} config
 */
export function createSupabaseServerClient(config) {
  if (!config?.url || !config?.serviceRoleKey) {
    throw new Error("supabase_server_client_missing_config");
  }

  return createClient(config.url, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
