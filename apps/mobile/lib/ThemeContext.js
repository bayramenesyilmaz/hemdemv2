import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { colors as darkColors, gradients as darkGradients, lightColors, lightGradients } from "./theme";

const THEME_STORAGE_KEY = "hemdem_theme_preference";

/**
 * Koyu tema varsayılan (bkz. lib/theme.js) — bu sadece opsiyonel açık
 * temayı `SecureStore`'da saklayıp en çok kullanılan kabuk bileşenlerine
 * (AppTopBar, alt sekme çubuğu, Button, Card, Screen) dağıtıyor. Web'deki
 * gibi tam bir CSS değişken sistemi RN'de yok — bu bileşenler `StyleSheet`
 * nesnelerini artık modül kapsamında sabit değil, `useTheme()`'den gelen
 * `colors`'a göre `useMemo` ile render sırasında kuruyor.
 */
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("dark");

  useEffect(() => {
    let cancelled = false;
    SecureStore.getItemAsync(THEME_STORAGE_KEY)
      .then((stored) => {
        if (!cancelled && stored === "light") setThemeState("light");
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  function setTheme(next) {
    setThemeState(next);
    SecureStore.setItemAsync(THEME_STORAGE_KEY, next).catch(() => {});
  }

  const value = useMemo(() => {
    const isLight = theme === "light";
    return {
      theme,
      isLight,
      setTheme,
      colors: isLight ? lightColors : darkColors,
      gradients: isLight ? lightGradients : darkGradients,
    };
  }, [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme, ThemeProvider içinde kullanılmalı");
  }
  return context;
}
