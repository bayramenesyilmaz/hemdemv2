"use server";

import { registerUser } from "@hemdem/core/usecases/auth/registerUser";
import { completeOnboarding } from "@hemdem/core/usecases/auth/completeOnboarding";
import { deleteAccount } from "@hemdem/core/usecases/auth/deleteAccount";
import { isProfileComplete } from "@hemdem/core/domain/entities/user";
import { repositories } from "@/lib/repositories";
import { getAuthUserId } from "@/lib/session";

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

  const profile = await repositories.user.findById(userId);
  const next = isProfileComplete(profile) ? "discover" : "onboarding";
  return { status: "success", data: { next } };
}
