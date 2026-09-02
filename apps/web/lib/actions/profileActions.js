"use server";

import { updateProfile } from "@hemdem/core/usecases/profile/updateProfile";
import { unlockProfileViewers } from "@hemdem/core/usecases/profile/unlockProfileViewers";
import { uploadAvatar } from "@hemdem/core/usecases/profile/uploadAvatar";
import { touchLastSeen } from "@hemdem/core/usecases/profile/touchLastSeen";
import { activateBoost } from "@hemdem/core/usecases/profile/activateBoost";
import { submitVerificationPhoto } from "@hemdem/core/usecases/profile/submitVerificationPhoto";
import { repositories } from "@/lib/repositories";
import { getAuthUserId } from "@/lib/session";

/**
 * @param {object} input
 */
export async function updateProfileAction(input) {
  const userId = await getAuthUserId();
  if (!userId) {
    return { status: "error", message: "not_authenticated" };
  }
  return updateProfile(repositories, userId, input);
}

export async function unlockProfileViewersAction() {
  const userId = await getAuthUserId();
  if (!userId) {
    return { status: "error", message: "not_authenticated" };
  }
  return unlockProfileViewers(repositories, userId);
}

/**
 * @param {FormData} formData - tek bir "avatar" alanı (File) içerir.
 */
export async function uploadAvatarAction(formData) {
  const userId = await getAuthUserId();
  if (!userId) {
    return { status: "error", message: "not_authenticated" };
  }

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "invalid_file_type" };
  }

  const extension = file.name.split(".").pop();
  return uploadAvatar(repositories, userId, file, { type: file.type, size: file.size, extension });
}

/**
 * AppShell'deki heartbeat tarafından düzenli aralıklarla çağrılır —
 * çevrimiçi durumu buradan türetilir (bkz. `isOnline`).
 */
export async function touchLastSeenAction() {
  const userId = await getAuthUserId();
  if (!userId) return;
  await touchLastSeen(repositories, userId);
}

export async function activateBoostAction() {
  const userId = await getAuthUserId();
  if (!userId) {
    return { status: "error", message: "not_authenticated" };
  }
  return activateBoost(repositories, userId);
}

/**
 * @param {FormData} formData - tek bir "photo" alanı (File) içerir.
 */
export async function submitVerificationPhotoAction(formData) {
  const userId = await getAuthUserId();
  if (!userId) {
    return { status: "error", message: "not_authenticated" };
  }

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "invalid_file_type" };
  }

  const extension = file.name.split(".").pop();
  return submitVerificationPhoto(repositories, userId, file, {
    type: file.type,
    size: file.size,
    extension,
  });
}
