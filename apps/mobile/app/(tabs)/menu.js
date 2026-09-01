import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSession } from "../../lib/session";
import { colors, radii, spacing } from "../../lib/theme";
import { Button } from "../../components/ui/Button";
import { useScreenInsets } from "../../components/ui/Screen";

// Profil/Bildirimler/Coin zaten üst bardan (avatar/zil/coin rozeti)
// erişiliyor, Liderlik Tablosu Testler ekranına taşındı — burada
// tekrarlanmıyorlar. Profili Düzenle/Profilimi Görüntüleyenler kendi
// bağlamı (profil) içinde daha anlamlı olduğu için Profil sayfasında.
const ITEMS = [
  { href: "/tests/mine", label: "Testlerim", icon: "📋" },
  { href: "/tests/history", label: "Test Geçmişim", icon: "🕓" },
];

/**
 * Web'deki tam ekran "Menü" sayfasının mobil karşılığı — alt bar sadece
 * 5 sekmeye sığdığı için (Keşfet/Testler/Gönderiler/Mesajlar/Diğer),
 * üst bar veya profil sayfasında olmayan rotalar burada listelenir.
 */
export default function MenuScreen() {
  const insets = useScreenInsets();
  const router = useRouter();
  const { setUserId } = useSession();

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
            <Text style={styles.itemIcon}>{item.icon}</Text>
            <Text style={styles.itemLabel}>{item.label}</Text>
            <Text style={styles.itemChevron}>›</Text>
          </Pressable>
        ))}
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
  itemIcon: {
    fontSize: 18,
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
