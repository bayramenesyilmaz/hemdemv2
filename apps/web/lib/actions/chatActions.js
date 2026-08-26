"use server";

import { fetchChatList } from "@hemdem/core/usecases/chat/fetchChatList";
import { fetchChatMessages } from "@hemdem/core/usecases/chat/fetchChatMessages";
import { sendMessage } from "@hemdem/core/usecases/chat/sendMessage";
import { repositories } from "@/lib/repositories";
import { getAuthUserId } from "@/lib/session";

export async function fetchChatListAction() {
  const userId = await getAuthUserId();
  if (!userId) {
    return { status: "error", message: "not_authenticated" };
  }
  return fetchChatList(repositories, userId);
}

/**
 * @param {number} chatId
 */
export async function fetchChatMessagesAction(chatId) {
  const userId = await getAuthUserId();
  if (!userId) {
    return { status: "error", message: "not_authenticated" };
  }
  return fetchChatMessages(repositories, userId, chatId);
}

/**
 * @param {string} recipientId
 * @param {string} content
 */
export async function sendMessageAction(recipientId, content) {
  const userId = await getAuthUserId();
  if (!userId) {
    return { status: "error", message: "not_authenticated" };
  }
  return sendMessage(repositories, userId, recipientId, content);
}
