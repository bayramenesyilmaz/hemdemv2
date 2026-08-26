function toProfile(row) {
  if (!row) return null;
  return {
    id: row.id,
    createdAt: row.created_at,
    name: row.name,
    avatarUrl: row.avatar_url,
    bio: row.bio,
    gender: row.gender,
    country: row.country,
    interestedIn: row.interested_in,
    birthdate: row.birthdate,
    language: row.language,
    role: row.role,
    isBanned: row.is_banned,
    gateTestId: row.gate_test_id,
    gateTestThreshold: row.gate_test_threshold,
    allowGuestLikes: row.allow_guest_likes,
    socialLinks: row.social_links ?? {},
  };
}

function toRow(profile) {
  const row = {};
  if (profile.id !== undefined) row.id = profile.id;
  if (profile.name !== undefined) row.name = profile.name;
  if (profile.avatarUrl !== undefined) row.avatar_url = profile.avatarUrl;
  if (profile.bio !== undefined) row.bio = profile.bio;
  if (profile.gender !== undefined) row.gender = profile.gender;
  if (profile.country !== undefined) row.country = profile.country;
  if (profile.interestedIn !== undefined) row.interested_in = profile.interestedIn;
  if (profile.birthdate !== undefined) row.birthdate = profile.birthdate;
  if (profile.language !== undefined) row.language = profile.language;
  if (profile.role !== undefined) row.role = profile.role;
  if (profile.isBanned !== undefined) row.is_banned = profile.isBanned;
  if (profile.gateTestId !== undefined) row.gate_test_id = profile.gateTestId;
  if (profile.gateTestThreshold !== undefined) row.gate_test_threshold = profile.gateTestThreshold;
  if (profile.allowGuestLikes !== undefined) row.allow_guest_likes = profile.allowGuestLikes;
  if (profile.socialLinks !== undefined) row.social_links = profile.socialLinks;
  return row;
}

/**
 * @param {import("@supabase/supabase-js").SupabaseClient} client
 * @returns {import("../../domain/repositories/userRepository.js").UserRepository}
 */
export function createSupabaseUserRepository(client) {
  return {
    async findById(id) {
      const { data, error } = await client
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return toProfile(data);
    },

    async create(profile) {
      const { data, error } = await client
        .from("profiles")
        .insert(toRow(profile))
        .select("*")
        .single();
      if (error) throw error;
      return toProfile(data);
    },

    async update(id, patch) {
      const { data, error } = await client
        .from("profiles")
        .update(toRow(patch))
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      return toProfile(data);
    },

    async delete(id) {
      const { error } = await client.from("profiles").delete().eq("id", id);
      if (error) throw error;
    },

    async findDiscoverCandidates(filters, excludeUserId) {
      let query = client
        .from("profiles")
        .select("*")
        .neq("id", excludeUserId)
        .eq("is_banned", false);

      if (filters?.gender) query = query.eq("gender", filters.gender);
      if (filters?.country) query = query.eq("country", filters.country);

      const { data, error } = await query.limit(filters?.limit ?? 50);
      if (error) throw error;
      return (data ?? []).map(toProfile);
    },
  };
}
