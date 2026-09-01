import { validateRequest } from "../../domain/entities/request.js";

/**
 * Belirli bir kullanıcıyı hedef alan şikayet — genel destek formuyla
 * (`submitRequest`) aynı `requests` tablosuna yazar, sadece `targetUserId`
 * ve sabit `type: "complaint"` ile. App Store'un UGC/kullanıcı-kullanıcı
 * iletişimi olan app'ler için zorunlu tuttuğu "şikayet et" akışı budur.
 *
 * @param {object} repositories
 * @param {{ reporterId?: string, targetUserId: string, subject: string, description: string, email?: string }} input
 */
export async function reportUser(repositories, input) {
  const { valid, errors } = validateRequest({
    type: "complaint",
    subject: input.subject,
    description: input.description,
    userId: input.reporterId,
    email: input.email,
  });
  if (!valid) {
    return { status: "error", message: errors[0] };
  }
  if (!input.targetUserId) {
    return { status: "error", message: "target_user_required" };
  }

  const request = await repositories.request.create({
    userId: input.reporterId ?? null,
    type: "complaint",
    subject: input.subject,
    description: input.description,
    email: input.email ?? null,
    targetUserId: input.targetUserId,
  });

  return { status: "success", data: request };
}
