import { validateProfile } from "../../domain/entities/user.js";

/**
 * Supabase Auth (client tarafında, anon key ile) auth.users satırını
 * zaten oluşturdu; bu usecase sadece 1:1 public.profiles satırını açar.
 *
 * @param {object} repositories
 * @param {{ id: string, name?: string, language?: string }} input
 */
export async function registerUser(repositories, input) {
  if (!input?.id) {
    return { status: "error", message: "user_id_required" };
  }

  const { valid, errors } = validateProfile({ language: input.language });
  if (!valid) {
    return { status: "error", message: errors[0] };
  }

  const existing = await repositories.user.findById(input.id);
  if (existing) {
    return { status: "error", message: "profile_already_exists" };
  }

  const profile = await repositories.user.create({
    id: input.id,
    name: input.name ?? null,
    language: input.language ?? "tr",
  });

  return { status: "success", data: profile };
}
