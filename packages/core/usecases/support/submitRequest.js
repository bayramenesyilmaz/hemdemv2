import { validateRequest } from "../../domain/entities/request.js";

/**
 * Talep/şikayet formu — hem misafirler (e-posta zorunlu) hem de üyeler
 * gönderebilir.
 *
 * @param {object} repositories
 * @param {{ userId?: string, type: "complaint" | "request", subject: string, description: string, email?: string }} input
 */
export async function submitRequest(repositories, input) {
  const { valid, errors } = validateRequest(input);
  if (!valid) {
    return { status: "error", message: errors[0] };
  }

  const request = await repositories.request.create({
    userId: input.userId ?? null,
    type: input.type,
    subject: input.subject,
    description: input.description,
    email: input.email ?? null,
  });

  return { status: "success", data: request };
}
