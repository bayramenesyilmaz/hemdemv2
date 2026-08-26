"use server";

import { cookies } from "next/headers";
import { registerUser } from "@hemdem/core/usecases/auth/registerUser";
import { repositories } from "@/lib/repositories";
import { MOCK_SESSION_COOKIE } from "@/lib/constants";

/**
 * Gerçek bir Supabase projesi bağlanana kadar `supabase.auth.signUp`'ın
 * yerini tutar: `mockAuth.signUp` ile sahte bir "auth.users" satırı
 * açar, profili oluşturur ve basit bir oturum cookie'si yazar. Gerçek
 * modda e-posta onayı gerekebilirken, mock modda her zaman anında
 * "giriş yapılmış" sayılır.
 *
 * @param {{ email: string, password: string, name: string, language: string }} input
 */
export async function mockSignUpAction(input) {
  const authResult = await repositories.mockAuth.signUp({
    email: input.email,
    password: input.password,
  });
  if (authResult.error) {
    return { status: "error", message: authResult.error };
  }

  const registerResult = await registerUser(repositories, {
    id: authResult.userId,
    name: input.name,
    language: input.language,
  });
  if (registerResult.status === "error" && registerResult.message !== "profile_already_exists") {
    return registerResult;
  }

  const cookieStore = await cookies();
  cookieStore.set(MOCK_SESSION_COOKIE, authResult.userId, { httpOnly: true, sameSite: "lax", path: "/" });

  return { status: "success", data: { userId: authResult.userId } };
}

/**
 * @param {{ email: string, password: string }} input
 */
export async function mockSignInAction(input) {
  const authResult = await repositories.mockAuth.signIn(input);
  if (authResult.error) {
    return { status: "error", message: authResult.error };
  }

  const cookieStore = await cookies();
  cookieStore.set(MOCK_SESSION_COOKIE, authResult.userId, { httpOnly: true, sameSite: "lax", path: "/" });

  return { status: "success", data: { userId: authResult.userId } };
}

export async function mockSignOutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(MOCK_SESSION_COOKIE);
  return { status: "success" };
}
