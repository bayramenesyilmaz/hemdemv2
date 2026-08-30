import { createContext, useContext, useMemo, useState } from "react";

/**
 * Web'deki gibi cookie tabanlı bir oturum yok — bu iskelet aşamasında
 * oturum sadece bellekte tutuluyor (uygulama kapanınca sıfırlanır).
 * Kalıcı oturum (AsyncStorage/SecureStore) sonraki bir adım.
 */
const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [userId, setUserId] = useState(null);
  const value = useMemo(() => ({ userId, setUserId }), [userId]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession, SessionProvider içinde kullanılmalı");
  }
  return context;
}
