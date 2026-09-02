import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { COIN_COSTS } from "@hemdem/core/domain/entities/coin";
import { activateBoost } from "@hemdem/core/usecases/profile/activateBoost";
import { submitVerificationPhoto } from "@hemdem/core/usecases/profile/submitVerificationPhoto";
import { repositories } from "../../../lib/repositories";
import { useSession } from "../../../lib/session";
import { colors, gradients, radii, spacing } from "../../../lib/theme";
import { InitialsAvatar } from "../../../components/InitialsAvatar";
import { isRenderableImageUri } from "../../../lib/avatar";
import { shareLink } from "../../../lib/share";
import { Button } from "../../../components/ui/Button";
import { ScreenHeader } from "../../../components/ui/ScreenHeader";
import { Screen } from "../../../components/ui/Screen";
import { VerificationBadge } from "../../../components/VerificationBadge";

// Bildirimler/Gönderiler/Liderlik artık üst bar veya "Diğer" menüsünden
// erişiliyor; burada sadece doğrudan profille ilgili kısayollar kalıyor.
const LINKS = [
  { href: "/profile/edit", label: "Profili Düzenle", icon: "✏️" },
  { href: "/profile/viewers", label: "Profilimi Görüntüleyenler", icon: "👁️" },
];

function minutesLeft(boostedUntil) {
  if (!boostedUntil) return 0;
  const diffMs = new Date(boostedUntil).getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / 60000));
}

export default function ProfileScreen() {
  const router = useRouter();
  const { userId, setUserId } = useSession();
  const [profile, setProfile] = useState(null);
  const [coins, setCoins] = useState(0);
  const [boostedUntil, setBoostedUntil] = useState(null);
  const [boostRemaining, setBoostRemaining] = useState(0);
  const [boosting, setBoosting] = useState(false);
  const [boostError, setBoostError] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState("none");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState(null);

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
      setBoostedUntil(found?.boostedUntil ?? null);
      setBoostRemaining(minutesLeft(found?.boostedUntil));
      setVerificationStatus(found?.verificationStatus ?? "none");
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!boostedUntil) return;
    const interval = setInterval(() => setBoostRemaining(minutesLeft(boostedUntil)), 30000);
    return () => clearInterval(interval);
  }, [boostedUntil]);

  async function handleBoost() {
    setBoostError(null);
    setBoosting(true);
    const result = await activateBoost(repositories, userId);
    setBoosting(false);
    if (result.status === "error") {
      setBoostError(result.message === "insufficient_coins" ? "Yeterli coin'in yok." : result.message);
      return;
    }
    setCoins(result.data.newBalance);
    setBoostedUntil(result.data.boostedUntil);
    setBoostRemaining(minutesLeft(result.data.boostedUntil));
  }

  // Web'in aksine mobilde galeri değil, gerçekten o an kamerayla çekim
  // zorunlu — `launchCameraAsync` (launchImageLibraryAsync değil).
  async function handleVerify() {
    setVerifyError(null);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setVerifyError("Kamera erişim izni verilmedi.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      cameraType: ImagePicker.CameraType.front,
      quality: 0.6,
      allowsEditing: true,
      aspect: [1, 1],
      base64: true,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const mimeType = "image/jpeg";
    const dataUri = `data:${mimeType};base64,${asset.base64}`;

    setVerifying(true);
    const uploadResult = await submitVerificationPhoto(repositories, userId, dataUri, {
      type: mimeType,
      size: asset.fileSize ?? dataUri.length,
      extension: "jpg",
    });
    setVerifying(false);

    if (uploadResult.status === "error") {
      setVerifyError(
        uploadResult.message === "verification_already_submitted"
          ? "Doğrulama isteğin zaten inceleniyor."
          : uploadResult.message
      );
      return;
    }
    setVerificationStatus("pending");
  }

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
      <ScreenHeader
        title="Profil"
        back
        action={
          <Pressable
            style={styles.shareButton}
            onPress={() => shareLink({ text: "Hemdem'de profilime göz at!", path: `/tr/u/${profile.id}` })}
          >
            <Text style={styles.shareButtonText}>🔗</Text>
          </Pressable>
        }
      />

      <View style={styles.header}>
        {isRenderableImageUri(profile.avatarUrl) ? (
          <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
        ) : (
          <InitialsAvatar name={profile.name} size={80} />
        )}
        <View style={styles.nameRow}>
          <Text style={styles.name}>{profile.name}</Text>
          {verificationStatus === "approved" && <VerificationBadge size={18} />}
        </View>
        {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
      </View>

      {profile.photos?.length > 1 && (
        <View style={styles.photoRow}>
          {profile.photos.slice(1).map((photo) => (
            <Image key={photo} source={{ uri: photo }} style={styles.photoThumb} />
          ))}
        </View>
      )}

      <Pressable onPress={() => router.push("/coins")}>
        <LinearGradient colors={gradients.surface} style={styles.coinCard}>
          <View>
            <Text style={styles.coinLabel}>Bakiye</Text>
            <Text style={styles.coinValue}>{coins} coin</Text>
          </View>
          <Text style={styles.coinChevron}>›</Text>
        </LinearGradient>
      </Pressable>

      {boostRemaining > 0 ? (
        <View style={styles.boostActiveRow}>
          <Text style={styles.boostActiveText}>Boost aktif: {boostRemaining} dk kaldı</Text>
        </View>
      ) : (
        <View style={styles.boostRow}>
          {boostError && <Text style={styles.boostError}>{boostError}</Text>}
          <Button variant="primary" onPress={handleBoost} loading={boosting}>
            {`Boost'la (${COIN_COSTS.boostProfile} coin)`}
          </Button>
        </View>
      )}

      {verificationStatus !== "approved" && (
        <View style={styles.verifyCard}>
          {verificationStatus === "pending" ? (
            <Text style={styles.verifyPendingText}>Doğrulama isteğin inceleniyor.</Text>
          ) : (
            <>
              {verificationStatus === "rejected" && (
                <Text style={styles.verifyPendingText}>Doğrulama isteğin reddedildi. Tekrar deneyebilirsin.</Text>
              )}
              <Text style={styles.verifyExplainer}>
                Profilinin gerçek olduğunu göstermek için kameranla bir selfie çek. Ekibimiz inceleyip onaylayacak.
              </Text>
              {verifyError && <Text style={styles.boostError}>{verifyError}</Text>}
              <Button variant="outline" onPress={handleVerify} loading={verifying}>
                Profilini Doğrula
              </Button>
            </>
          )}
        </View>
      )}

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
  shareButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  shareButtonText: {
    fontSize: 15,
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
  photoRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
  },
  photoThumb: {
    width: 72,
    height: 72,
    borderRadius: radii.lg,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  name: {
    color: colors.foreground,
    fontSize: 20,
    fontWeight: "800",
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
  boostRow: {
    gap: spacing.xs,
  },
  boostError: {
    color: colors.danger,
    fontSize: 12,
  },
  boostActiveRow: {
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  boostActiveText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  verifyCard: {
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  verifyPendingText: {
    color: colors.mutedForeground,
    fontSize: 13,
  },
  verifyExplainer: {
    color: colors.mutedForeground,
    fontSize: 13,
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
