import { Text, View } from "react-native";

/**
 * Mock seed verisindeki `avatarUrl` bir `data:image/svg+xml` URI'dir —
 * React Native'in `Image` bileşeni SVG data URI'lerini native olarak
 * render edemez (web'deki gibi çalışmaz). Bir SVG kütüphanesi eklemek
 * yerine, iskelet aşamasında aynı "baş harfler + gradyan" fikrini düz
 * View/Text ile karşılıyoruz.
 */
export function InitialsAvatar({ name, size = 48 }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#e11d48",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "700", fontSize: size * 0.38 }}>{initials}</Text>
    </View>
  );
}
