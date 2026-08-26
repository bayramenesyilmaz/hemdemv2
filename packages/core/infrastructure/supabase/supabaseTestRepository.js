function toTest(row) {
  if (!row) return null;
  return {
    id: row.id,
    createdAt: row.created_at,
    createdBy: row.created_by,
    title: row.title,
    categoryId: row.category_id,
    language: row.language,
    questions: row.questions,
    point: row.point,
    approved: row.approved,
    isDeleted: row.is_deleted,
  };
}

function toTestRow(test) {
  const row = {};
  if (test.createdBy !== undefined) row.created_by = test.createdBy;
  if (test.title !== undefined) row.title = test.title;
  if (test.categoryId !== undefined) row.category_id = test.categoryId;
  if (test.language !== undefined) row.language = test.language;
  if (test.questions !== undefined) row.questions = test.questions;
  if (test.point !== undefined) row.point = test.point;
  if (test.approved !== undefined) row.approved = test.approved;
  if (test.isDeleted !== undefined) row.is_deleted = test.isDeleted;
  return row;
}

function toAnswer(row) {
  if (!row) return null;
  return {
    id: row.id,
    createdAt: row.created_at,
    userId: row.user_id,
    testId: row.test_id,
    userAnswers: row.user_answers,
  };
}

/**
 * @param {import("@supabase/supabase-js").SupabaseClient} client
 * @returns {import("../../domain/repositories/testRepository.js").TestRepository}
 */
export function createSupabaseTestRepository(client) {
  return {
    async findById(id) {
      const { data, error } = await client
        .from("tests")
        .select("*")
        .eq("id", id)
        .eq("is_deleted", false)
        .maybeSingle();
      if (error) throw error;
      return toTest(data);
    },

    async findMany(filters = {}) {
      let query = client.from("tests").select("*").eq("is_deleted", false).eq("approved", true);

      if (filters.categoryId != null) query = query.eq("category_id", filters.categoryId);
      if (filters.language) query = query.eq("language", filters.language);
      if (filters.search) query = query.ilike("title", `%${filters.search}%`);

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(toTest);
    },

    async create(test) {
      const { data, error } = await client
        .from("tests")
        .insert(toTestRow(test))
        .select("*")
        .single();
      if (error) throw error;
      return toTest(data);
    },

    async update(id, patch) {
      const { data, error } = await client
        .from("tests")
        .update(toTestRow(patch))
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      return toTest(data);
    },

    async softDelete(id) {
      const { error } = await client
        .from("tests")
        .update({ is_deleted: true })
        .eq("id", id);
      if (error) throw error;
    },

    async findCreatedByUser(userId) {
      const { data, error } = await client
        .from("tests")
        .select("*")
        .eq("created_by", userId)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(toTest);
    },

    async findAnswer(userId, testId) {
      const { data, error } = await client
        .from("answers")
        .select("*")
        .eq("user_id", userId)
        .eq("test_id", testId)
        .maybeSingle();
      if (error) throw error;
      return toAnswer(data);
    },

    async saveAnswer(answer) {
      const { data, error } = await client
        .from("answers")
        .upsert(
          {
            user_id: answer.userId,
            test_id: answer.testId,
            user_answers: answer.userAnswers,
          },
          { onConflict: "user_id,test_id" }
        )
        .select("*")
        .single();
      if (error) throw error;
      return toAnswer(data);
    },

    async findAnswersByUser(userId) {
      const { data, error } = await client
        .from("answers")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(toAnswer);
    },

    async findAnswersByTest(testId) {
      const { data, error } = await client
        .from("answers")
        .select("*")
        .eq("test_id", testId);
      if (error) throw error;
      return (data ?? []).map(toAnswer);
    },

    async findLeaderboard(limit = 20) {
      const { data, error } = await client
        .from("user_points")
        .select("user_id, point")
        .order("point", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []).map((row) => ({ userId: row.user_id, point: row.point }));
    },
  };
}
