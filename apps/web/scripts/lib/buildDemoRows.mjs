/**
 * Mock store verisini (mock anahtarlarıyla: "demo-user-1", "test-1", ...)
 * Supabase tablo satırlarına (gerçek uuid/bigint id'lerle) çeviren saf
 * fonksiyonlar. Hiçbir ağ çağrısı yapmaz — `seed-supabase-demo.mjs` bunları
 * id map'leri doldurduktan sonra çağırıp sonucu Supabase'e yazar.
 *
 * Ayrı bir dosyada olmasının nedeni: id eşleme mantığı (özellikle
 * `user_a < user_b` kısıtı) ağ çağrısı olmadan test edilebilsin.
 */

const DEMO_EMAIL_DOMAIN = "demo.hemdem.test";
const DEFAULT_PASSWORD = "Demo1234!";

export function slugify(name) {
  return name
    .toLowerCase()
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Bilinen demo kullanıcılara mock moddaki mevcut giriş bilgileri korunur. */
export function emailFor(profile) {
  if (profile.id === "demo-user-1") return "demo@hemdem.test";
  if (profile.id === "admin-user-1") return "admin@hemdem.test";
  return `${slugify(profile.name)}@${DEMO_EMAIL_DOMAIN}`;
}

export function passwordFor(profile) {
  if (profile.id === "demo-user-1") return "demo1234";
  if (profile.id === "admin-user-1") return "admin1234";
  return DEFAULT_PASSWORD;
}

export function buildProfileRows(store, userIdMap) {
  return [...store.profiles.values()].map((profile) => ({
    id: userIdMap.get(profile.id),
    created_at: profile.createdAt,
    name: profile.name,
    avatar_url: profile.avatarUrl,
    bio: profile.bio,
    gender: profile.gender,
    country: profile.country,
    interested_in: profile.interestedIn,
    birthdate: profile.birthdate,
    language: profile.language,
    role: profile.role,
    is_banned: profile.isBanned,
    gate_test_threshold: profile.gateTestThreshold,
    allow_guest_likes: profile.allowGuestLikes,
    social_links: profile.socialLinks ?? {},
  }));
}

export function buildTestRow(test, userIdMap) {
  return {
    created_at: test.createdAt,
    created_by: test.createdBy ? userIdMap.get(test.createdBy) : null,
    title: test.title,
    category_id: test.categoryId,
    language: test.language,
    questions: test.questions,
    point: test.point,
    approved: test.approved,
    is_deleted: test.isDeleted,
  };
}

export function buildAnswerRows(store, userIdMap, testIdMap) {
  return [...store.answers.values()].map((answer) => ({
    created_at: answer.createdAt,
    user_id: userIdMap.get(answer.userId),
    test_id: testIdMap.get(answer.testId),
    user_answers: answer.userAnswers,
  }));
}

export function buildSwipeRows(store, userIdMap) {
  return [...store.swipes.values()].map((swipe) => ({
    created_at: swipe.createdAt,
    from_user: userIdMap.get(swipe.fromUser),
    to_user: userIdMap.get(swipe.toUser),
    action: swipe.action,
  }));
}

/** `check (user_a < user_b)` kısıtına uysun diye gerçek uuid'lere göre sıralar. */
export function sortedPair(userIdMap, aKey, bKey) {
  const a = userIdMap.get(aKey);
  const b = userIdMap.get(bKey);
  return a < b ? [a, b] : [b, a];
}

export function buildMatchRows(store, userIdMap) {
  return [...store.matches.values()].map((match) => {
    const [userA, userB] = sortedPair(userIdMap, match.userA, match.userB);
    return { created_at: match.createdAt, user_a: userA, user_b: userB };
  });
}

export function buildChatRow(chat, userIdMap) {
  const [userA, userB] = sortedPair(userIdMap, chat.userA, chat.userB);
  return {
    created_at: chat.createdAt,
    last_message_at: chat.lastMessageAt,
    user_a: userA,
    user_b: userB,
    source: chat.source,
  };
}

export function buildMessageRows(store, userIdMap, chatIdMap) {
  return store.messages.map((message) => ({
    created_at: message.createdAt,
    chat_id: chatIdMap.get(message.chatId),
    sender_id: userIdMap.get(message.senderId),
    content: message.content,
  }));
}

export function buildPostRows(store, userIdMap, testIdMap) {
  return store.posts.map((post) => ({
    created_at: post.createdAt,
    user_id: userIdMap.get(post.userId),
    content: post.content,
    tagged_test_id: post.taggedTestId ? testIdMap.get(post.taggedTestId) : null,
  }));
}

export function buildNoteRows(store, userIdMap) {
  return [...store.notes.values()]
    .flat()
    .map((note) => ({ created_at: note.createdAt, user_id: userIdMap.get(note.userId), text: note.text }));
}

export function buildProfileViewRows(store, userIdMap) {
  return store.profileViews.map((view) => ({
    created_at: view.createdAt,
    viewer_id: userIdMap.get(view.viewerId),
    viewed_id: userIdMap.get(view.viewedId),
  }));
}

export function buildNotificationRows(store, userIdMap, testIdMap) {
  return store.notifications.map((n) => ({
    created_at: n.createdAt,
    user_id: userIdMap.get(n.userId),
    type: n.type,
    actor_id: n.actorId ? userIdMap.get(n.actorId) : null,
    test_id: n.testId ? testIdMap.get(n.testId) : null,
    similarity: n.similarity,
    is_read: n.isRead,
  }));
}

export function buildCoinRows(store, userIdMap) {
  return [...store.coins.entries()].map(([userId, coin]) => ({ user_id: userIdMap.get(userId), coin }));
}

export function buildPointRows(store, userIdMap) {
  return [...store.points.entries()].map(([userId, point]) => ({ user_id: userIdMap.get(userId), point }));
}
