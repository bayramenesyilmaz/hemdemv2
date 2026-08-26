/**
 * `proxy.js` (middleware) ve sunucu tarafı kod (`lib/session.js`,
 * `lib/actions/mockAuthActions.js`) arasında paylaşılan sabitler.
 * Bağımlılığı minimumda tutmak için bu dosya `next/headers` gibi
 * sadece-sunucu API'leri import etmez — proxy.js da güvenle kullanabilsin.
 */
export const MOCK_SESSION_COOKIE = "mock-session";
