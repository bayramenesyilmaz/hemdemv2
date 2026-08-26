/**
 * Gerçek Supabase Auth'un (client tarafında anon key ile çalışan
 * `supabase.auth.signUp`/`signInWithPassword`) yerini tutan minimal
 * bellek içi eşleme. Bu, gerçek repository sözleşmelerinin (bkz.
 * `domain/repositories/`) bir parçası DEĞİLDİR — sadece mock modda
 * `apps/web`'in kendi Supabase Auth'u taklit eden server action'ları
 * tarafından kullanılır.
 *
 * @param {ReturnType<import("./mockStore.js").getMockStore>} store
 */
export function createMockAuthRepository(store) {
  return {
    async signUp({ email, password }) {
      if (store.authUsers.has(email)) {
        return { error: "email_already_registered" };
      }
      const id = `mock-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
      store.authUsers.set(email, { id, password });
      return { userId: id };
    },

    async signIn({ email, password }) {
      const user = store.authUsers.get(email);
      if (!user || user.password !== password) {
        return { error: "invalid_credentials" };
      }
      return { userId: user.id };
    },
  };
}
