import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, gradients } from "../lib/theme";

/**
 * Mock seed verisindeki `avatarUrl` bir `data:image/svg+xml` URI'dir —
 * React Native'in `Image` bileşeni SVG data URI'lerini native olarak
 * render edemez (web'deki gibi çalışmaz). Bir SVG kütüphanesi eklemek
 * yerine "baş harfler + gradyan" fikrini gerçek bir LinearGradient ile
 * karşılıyoruz — web'deki --gradient-primary ile aynı iki tonlu geçiş.
 *
 * `online` verilirse köşede küçük bir yeşil nokta gösterir (bkz.
 * `isOnline` — `packages/core/domain/entities/user.js`).
 */
export function InitialsAvatar({ name, size = 48, online = false }) {
  const initials = (name ?? "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const dotSize = Math.max(size * 0.28, 10);

  return (
    <View style={{ width: size, height: size }}>
      <LinearGradient
        colors={gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <Text style={[styles.text, { fontSize: size * 0.38 }]}>{initials}</Text>
      </LinearGradient>
      {online && (
        <View
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              borderWidth: Math.max(dotSize * 0.18, 1.5),
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#fff",
    fontWeight: "700",
  },
  dot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#34d399",
    borderColor: colors.background,
  },
});
