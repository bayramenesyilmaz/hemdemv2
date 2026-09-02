import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { radii, spacing } from "../../lib/theme";
import { useTheme } from "../../lib/ThemeContext";

/**
 * Web'deki SectionCard karşılığı — profil, test, gönderi kartlarında aynı
 * çerçeve/boşluk dilini korumak için. `onPress` verilirse dokunma geri
 * bildirimli (Pressable), verilmezse düz View. Renkler `useTheme()`'den
 * geliyor (açık/koyu tema).
 */
export function Card({ children, onPress, style, ...props }) {
  const { colors } = useTheme();
  const styles = useMemo(() => buildStyles(colors), [colors]);

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
        {...props}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

function buildStyles(colors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
    },
    pressed: {
      opacity: 0.85,
      borderColor: "rgba(217,72,97,0.35)",
    },
  });
}
