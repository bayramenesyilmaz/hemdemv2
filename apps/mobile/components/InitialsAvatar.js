import { StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { gradients } from "../lib/theme";

/**
 * Mock seed verisindeki `avatarUrl` bir `data:image/svg+xml` URI'dir —
 * React Native'in `Image` bileşeni SVG data URI'lerini native olarak
 * render edemez (web'deki gibi çalışmaz). Bir SVG kütüphanesi eklemek
 * yerine "baş harfler + gradyan" fikrini gerçek bir LinearGradient ile
 * karşılıyoruz — web'deki --gradient-primary ile aynı iki tonlu geçiş.
 */
export function InitialsAvatar({ name, size = 48 }) {
  const initials = (name ?? "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <LinearGradient
      colors={gradients.primary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Text style={[styles.text, { fontSize: size * 0.38 }]}>{initials}</Text>
    </LinearGradient>
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
});
