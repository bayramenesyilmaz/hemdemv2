import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSession } from "../../lib/session";
import { colors, radii, spacing } from "../../lib/theme";
import { useTheme } from "../../lib/ThemeContext";
import { Button } from "../../components/ui/Button";
import { useScreenInsets } from "../../components/ui/Screen";

// Profil/Bildirimler/Coin zaten üst bardan (avatar/zil/coin rozeti)
// erişiliyor, Liderlik Tablosu Testler ekranına taşındı — burada
// tekrarlanmıyorlar. Profili Düzenle/Profilimi Görüntüleyenler kendi
// bağlamı (profil) içinde daha anlamlı olduğu için Profil sayfasında.
const ITEMS = [
  { href: "/tests/mine", label: "Testlerim", icon: "clipboard-outline" },
  { href: "/tests/history", label: "Test Geçmişim", icon: "time-outline" },
  { href: "/privacy", label: "Gizlilik Politikası", icon: "lock-closed-outline" },
];

/**
 * Web'deki tam ekran "Menü" sayfasının mobil karşılığı — alt bar sadece
 * 5 sekmeye sığdığı için (Keşfet/Testler/Gönderiler/Mesajlar/Diğer),
 * üst bar veya profil sayfasında olmayan rotalar burada listelenir.
 *
 * Tema anahtarı da burada — web'deki Menü sayfasındaki ThemeSwitcher'ın
 * mobil karşılığı (bkz. lib/ThemeContext.js).
 */
export default function MenuScreen() {
  const insets = useScreenInsets();
  const router = useRouter();
  const { setUserId } = useSession();
  const { isLight, setTheme } = useTheme();

  function handleLogout() {
    setUserId(null);
    router.replace("/");
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={[insets, styles.content]}>
      <Text style={styles.title}>Diğer</Text>

      <View style={styles.list}>
        {ITEMS.map((item) => (
          <Pressable
            key={item.href}
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
            onPress={() => router.push(item.href)}
          >
            <Ionicons name={item.icon} size={18} color={colors.primary} />
            <Text style={styles.itemLabel}>{item.label}</Text>
            <Text style={styles.itemChevron}>›</Text>
          </Pressable>
        ))}

        <View style={styles.item}>
          <Ionicons name="color-palette-outline" size={18} color={colors.primary} />
          <Text style={styles.itemLabel}>Açık tema</Text>
          <Switch
            value={isLight}
            onValueChange={(next) => setTheme(next ? "light" : "dark")}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <Button variant="delete" onPress={handleLogout}>
        Çıkış Yap
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    gap: spacing.lg,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.foreground,
  },
  list: {
    gap: spacing.xs,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  itemPressed: {
    backgroundColor: colors.cardAlt,
  },
  itemLabel: {
    flex: 1,
    color: colors.foreground,
    fontWeight: "600",
  },
  itemChevron: {
    color: colors.mutedForeground,
    fontSize: 18,
  },
});
