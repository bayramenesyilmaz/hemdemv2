import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";

const SESSION_STORAGE_KEY = "hemdem_session_user_id";

/**
 * Web'deki gibi cookie tabanlı bir oturum yok — userId, cihazda
 * expo-secure-store (şifreli, uygulamaya özel depolama) ile saklanır ki
 * app kapanıp açılınca kullanıcı tekrar login ekranına düşmesin. `hydrated`,
 * bu ilk okuma tamamlanana kadar yönlendirme kararlarının (_layout.js)
 * erken ve yanlış bir "oturum yok" varsayımıyla login'e atmasını önler.
 */
const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [userId, setUserIdState] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    SecureStore.getItemAsync(SESSION_STORAGE_KEY)
      .then((stored) => {
        if (!cancelled && stored) setUserIdState(stored);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function setUserId(nextUserId) {
    setUserIdState(nextUserId);
    if (nextUserId) {
      SecureStore.setItemAsync(SESSION_STORAGE_KEY, nextUserId).catch(() => {});
    } else {
      SecureStore.deleteItemAsync(SESSION_STORAGE_KEY).catch(() => {});
    }
  }

  const value = useMemo(() => ({ userId, setUserId, hydrated }), [userId, hydrated]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession, SessionProvider içinde kullanılmalı");
  }
  return context;
}
