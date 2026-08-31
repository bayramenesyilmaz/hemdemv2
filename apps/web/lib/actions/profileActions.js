"use server";

import { updateProfile } from "@hemdem/core/usecases/profile/updateProfile";
import { unlockProfileViewers } from "@hemdem/core/usecases/profile/unlockProfileViewers";
import { uploadAvatar } from "@hemdem/core/usecases/profile/uploadAvatar";
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
