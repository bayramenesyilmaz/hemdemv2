import { validatePost } from "../../domain/entities/post.js";
import { validateTest } from "../../domain/entities/test.js";
import { COIN_COSTS } from "../../domain/entities/coin.js";

/**
 * Gönderiyi paylaşırken o an yeni bir test oluşturur ve gönderiyi bu teste
 * etiketler. "Aynı diziyi izleyeni bulmak" akışının en kısa yolu: kullanıcı
 * bir şey paylaşır, aynı ekranda 2-3 soruluk bir uyum testi ekler.
 *
 * Sıra bilinçli: önce iki girdi de doğrulanır (geçersiz bir gönderi için
 * coin harcanmamalı), sonra test oluşturulur, en son gönderi. Gönderi
 * oluşturma patlarsa test geri alınır ve coin iade edilir; aksi hâlde
 * kullanıcı hem coin'ini hem gönderisini kaybederdi.
 *
 * @param {object} repositories
 * @param {string} userId
 * @param {{ content: string, test: object }} input
 */
export async function createPostWithTest(repositories, userId, input) {
  const postCheck = validatePost({ content: input.content });
  if (!postCheck.valid) {
    return { status: "error", message: postCheck.errors[0] };
  }

  const testCheck = validateTest(input.test);
  if (!testCheck.valid) {
    return { status: "error", message: testCheck.errors[0] };
  }

  const { ok, newBalance } = await repositories.coin.decrementIfSufficient(
    userId,
    COIN_COSTS.createTest
  );
  if (!ok) {
    return { status: "error", message: "insufficient_coins" };
  }

  let test;
  try {
    test = await repositories.test.create({ ...input.test, createdBy: userId, approved: false });
  } catch (error) {
    await repositories.coin.increment(userId, COIN_COSTS.createTest);
    throw error;
  }

  try {
    const post = await repositories.post.create({
      userId,
      content: input.content,
      taggedTestId: test.id,
    });
    return { status: "success", data: { post, test, remainingCoins: newBalance } };
  } catch (error) {
    await repositories.test.softDelete(test.id);
    await repositories.coin.increment(userId, COIN_COSTS.createTest);
    throw error;
  }
}
