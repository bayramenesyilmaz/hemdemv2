"use server";

import { submitRequest } from "@hemdem/core/usecases/support/submitRequest";
import { repositories } from "@/lib/repositories";
import { getAuthUserId } from "@/lib/session";

/**
 * @param {{ type: "complaint" | "request", subject: string, description: string, email?: string }} input
 */
export async function submitRequestAction(input) {
  const userId = await getAuthUserId();
  return submitRequest(repositories, { ...input, userId: userId ?? undefined });
}
