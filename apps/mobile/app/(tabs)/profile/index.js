import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { repositories } from "../../../lib/repositories";
import { useSession } from "../../../lib/session";
import { colors, gradients, radii, spacing } from "../../../lib/theme";
import { InitialsAvatar } from "../../../components/InitialsAvatar";
import { isRenderableImageUri } from "../../../lib/avatar";
import { Button } from "../../../components/ui/Button";
import { ScreenHeader } from "../../../components/ui/ScreenHeader";
import { Screen } from "../../../components/ui/Screen";

// Bildirimler/Gönderiler/Liderlik artık üst bar veya "Diğer" menüsünden
// erişiliyor; burada sadece doğrudan profille ilgili kısayollar kalıyor.
const LINKS = [
  { href: "/profile/edit", label: "Profili Düzenle", icon: "✏️" },
  { href: "/profile/viewers", label: "Profilimi Görüntüleyenler", icon: "👁️" },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { userId, setUserId } = useSession();
  const [profile, setProfile] = useState(null);
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    async function load() {
      const [found, balance] = await Promise.all([
        repositories.user.findById(userId),
        repositories.coin.getBalance(userId),
      ]);
      if (cancelled) return;
      setProfile(found);
      setCoins(balance);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  function handleLogout() {
    setUserId(null);
    router.replace("/");
  }

  if (!profile) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  return (
    <Screen contentStyle={styles.content}>
      <ScreenHeader title="Profil" back />

      <View style={styles.header}>
        {isRenderableImageUri(profile.avatarUrl) ? (
          <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
        ) : (
          <InitialsAvatar name={profile.name} size={80} />
        )}
        <Text style={styles.name}>{profile.name}</Text>
        {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
      </View>

      <Pressable onPress={() => router.push("/coins")}>
        <LinearGradient colors={gradients.surface} style={styles.coinCard}>
          <View>
            <Text style={styles.coinLabel}>Bakiye</Text>
            <Text style={styles.coinValue}>{coins} coin</Text>
          </View>
          <Text style={styles.coinChevron}>›</Text>
        </LinearGradient>
      </Pressable>

      <View style={styles.linkList}>
        {LINKS.map((link) => (
          <Pressable
            key={link.href}
            style={({ pressed }) => [styles.link, pressed && styles.linkPressed]}
            onPress={() => router.push(link.href)}
          >
            <Text style={styles.linkIcon}>{link.icon}</Text>
            <Text style={styles.linkText}>{link.label}</Text>
            <Text style={styles.linkChevron}>›</Text>
          </Pressable>
        ))}
      </View>

      <Button variant="delete" onPress={handleLogout}>
        Çıkış Yap
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    gap: spacing.lg,
  },
  header: {
    alignItems: "center",
    gap: 6,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  name: {
    color: colors.foreground,
    fontSize: 20,
    fontWeight: "800",
    marginTop: 8,
  },
  bio: {
    color: colors.mutedForeground,
    fontSize: 14,
    textAlign: "center",
  },
  coinCard: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  coinLabel: {
    color: colors.mutedForeground,
    fontSize: 13,
  },
  coinValue: {
    color: colors.foreground,
    fontWeight: "800",
    fontSize: 18,
    marginTop: 2,
  },
  coinChevron: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "700",
  },
  linkList: {
    gap: spacing.xs,
  },
  link: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  linkPressed: {
    backgroundColor: colors.cardAlt,
  },
  linkIcon: {
    fontSize: 18,
  },
  linkText: {
    flex: 1,
    color: colors.foreground,
    fontWeight: "600",
  },
  linkChevron: {
    color: colors.mutedForeground,
    fontSize: 18,
  },
});
