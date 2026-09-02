import { useMemo } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { fontFamily, radii, spacing } from "../../lib/theme";
import { useTheme } from "../../lib/ThemeContext";

/**
 * Web'deki Button varyantlarının (confirm/add/send → gradyan, outline,
 * ghost, delete) RN karşılığı — tek bileşen, tutarlı dokunma geri
 * bildirimi (basılınca hafif küçülme, web'deki active:scale-[0.97]'nin
 * karşılığı).
 *
 * Devre dışıyken gradyan düz `cardAlt`'a düşüyordu — kart yüzeyiyle
 * neredeyse aynı tonda olduğu için buton sanki hiç yokmuş gibi
 * görünüyordu (ör. boş gönderi kutusunda "Paylaş" butonu). Devre
 * dışı durumda artık her zaman görünür bir kenarlık var.
 *
 * Renkler artık `useTheme()`'den geliyor (açık/koyu tema) — bu yüzden
 * varyant stilleri modül kapsamında sabit değil, render sırasında
 * `colors`'a göre kuruluyor.
 */
export function Button({
  variant = "primary",
  children,
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
  ...props
}) {
  const { colors, gradients } = useTheme();
  const { styles, variantStyles, textColors } = useMemo(() => buildTheme(colors), [colors]);

  const isDisabled = Boolean(disabled) || loading;
  const textColor =
    isDisabled && variant === "primary" ? colors.mutedForeground : textColors[variant] ?? colors.foreground;

  const inner = loading ? (
    <ActivityIndicator color={textColor} size="small" />
  ) : typeof children === "string" ? (
    <Text style={[styles.label, { color: textColor }, textStyle]} numberOfLines={1}>
      {children}
    </Text>
  ) : (
    children
  );

  if (variant === "primary") {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => [styles.wrap, pressed && !isDisabled && styles.pressed, style]}
        {...props}
      >
        <LinearGradient
          colors={isDisabled ? [colors.cardAlt, colors.cardAlt] : gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.content, isDisabled && styles.contentDisabledPrimary]}
        >
          {inner}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.wrap,
        styles.content,
        variantStyles[variant],
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      {inner}
    </Pressable>
  );
}

function buildTheme(colors) {
  const variantStyles = {
    outline: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
    ghost: { backgroundColor: "transparent" },
    delete: { borderWidth: 1, borderColor: "rgba(221,85,85,0.4)", backgroundColor: "rgba(221,85,85,0.12)" },
  };

  const textColors = {
    primary: "#fff",
    outline: colors.foreground,
    ghost: colors.mutedForeground,
    delete: colors.danger,
  };

  const styles = StyleSheet.create({
    wrap: {
      borderRadius: radii.md,
      overflow: "hidden",
    },
    content: {
      minHeight: 42,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
    },
    contentDisabledPrimary: {
      borderWidth: 1,
      borderColor: colors.border,
    },
    label: {
      fontSize: 14,
      fontFamily: fontFamily.semiBold,
    },
    pressed: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }],
    },
    disabled: {
      opacity: 0.5,
    },
  });

  return { styles, variantStyles, textColors };
}
