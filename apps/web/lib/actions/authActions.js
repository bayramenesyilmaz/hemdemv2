"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { registerUser } from "@hemdem/core/usecases/auth/registerUser";
import { completeOnboarding } from "@hemdem/core/usecases/auth/completeOnboarding";
import { deleteAccount } from "@hemdem/core/usecases/auth/deleteAccount";
import { loginUser } from "@hemdem/core/usecases/auth/loginUser";
import { isProfileComplete } from "@hemdem/core/domain/entities/user";
import { repositories, USE_MOCK_DATA } from "@/lib/repositories";
import { getAuthUserId } from "@/lib/session";
import { MOCK_SESSION_COOKIE } from "@/lib/constants";

/**
 * Yasaklı bir hesap girişten sonra fark edilirse (bkz.
 * getPostLoginDestinationAction), Supabase Auth/mock oturumu zaten
 * kurulmuş olur — burada o oturumu geri alıp gerçekten çıkış yapılmasını
 * sağlıyoruz, sadece hata mesajı döndürmek yetmiyor.
 */
async function signOutCurrentSession() {
  const cookieStore = await cookies();

  if (USE_MOCK_DATA) {
    cookieStore.delete(MOCK_SESSION_COOKIE);
    return;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        },
      },
    }
  );
  await supabase.auth.signOut();
}

/**
 * Supabase Auth (client tarafında, anon key ile) auth.users satırını
 * zaten oluşturdu; bu action sadece 1:1 public.profiles satırını açar.
 *
 * @param {{ id: string, name?: string, language?: string }} input
 */
export async function registerProfileAction(input) {
  return registerUser(repositories, input);
}

/**
 * @param {{ name: string, gender: string, birthdate: string, interestedIn: string }} input
 */
export async function completeOnboardingAction(input) {
  const userId = await getAuthUserId();
  if (!userId) {
    return { status: "error", message: "not_authenticated" };
  }
  return completeOnboarding(repositories, userId, input);
}

export async function deleteAccountAction() {
  const userId = await getAuthUserId();
  if (!userId) {
    return { status: "error", message: "not_authenticated" };
  }
  return deleteAccount(repositories, userId);
}

/**
 * Girişten sonra kullanıcının nereye yönlendirileceğine karar verir:
 * profil tamamlanmamışsa onboarding, tamamlanmışsa keşfet.
 *
 * @returns {Promise<{ status: "success", data: { next: "onboarding" | "discover" } } | { status: "error", message: string }>}
 */
export async function getPostLoginDestinationAction() {
  const userId = await getAuthUserId();
  if (!userId) {
    return { status: "error", message: "not_authenticated" };
  }

  const loginResult = await loginUser(repositories, userId);
  if (loginResult.status === "error") {
    await signOutCurrentSession();
    return loginResult;
  }

  if (loginResult.data.role === "admin") {
    return { status: "success", data: { next: "admin" } };
  }

  const next = isProfileComplete(loginResult.data) ? "discover" : "onboarding";
  return { status: "success", data: { next } };
}
