import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { updateProfile } from "@hemdem/core/usecases/profile/updateProfile";
import { uploadAvatar } from "@hemdem/core/usecases/profile/uploadAvatar";
import { deleteAccount } from "@hemdem/core/usecases/auth/deleteAccount";
import { repositories } from "../../../lib/repositories";
import { useSession } from "../../../lib/session";
import { colors, radii, spacing } from "../../../lib/theme";
import { COUNTRIES } from "../../../lib/countries";
import { Button } from "../../../components/ui/Button";
import { ScreenHeader } from "../../../components/ui/ScreenHeader";
import { useScreenInsets } from "../../../components/ui/Screen";
import { InitialsAvatar } from "../../../components/InitialsAvatar";
import { CountryPickerModal } from "../../../components/CountryPickerModal";
import { TestPickerModal } from "../../../components/TestPickerModal";
import { isRenderableImageUri } from "../../../lib/avatar";

const AVATAR_SIZE = 88;
const GENDER_OPTIONS = [
  { value: "male", label: "Erkek" },
  { value: "female", label: "Kadın" },
];
const INTERESTED_IN_OPTIONS = [
  { value: "male", label: "Erkekler" },
  { value: "female", label: "Kadınlar" },
  { value: "both", label: "İkisi de" },
];
const LANGUAGE_OPTIONS = [
  { value: "tr", label: "Türkçe" },
  { value: "en", label: "English" },
];
const BIRTHDATE_PATTERN = /^(\d{2})\.(\d{2})\.(\d{4})$/;

function isoToDisplayDate(iso) {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return "";
  return `${day}.${month}.${year}`;
}

function displayDateToIso(display) {
  const match = BIRTHDATE_PATTERN.exec(display.trim());
  if (!match) return undefined;
  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
}

/**
 * Web'deki ProfileEditForm ile aynı kapsam: cinsiyet/ilgi alanı/ülke/doğum
 * tarihi/kapı testi/misafir beğenisi/sosyal linkler artık burada da
 * düzenlenebiliyor. Dil alanı web formunda yok — mobilde henüz bir kayıt
 * ekranı olmadığı için "dil seçimi" isteği buraya eklendi.
 */
export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useScreenInsets();
  const { userId, setUserId } = useSession();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [gender, setGender] = useState("male");
  const [interestedIn, setInterestedIn] = useState("both");
  const [country, setCountry] = useState(undefined);
  const [birthdateText, setBirthdateText] = useState("");
  const [language, setLanguage] = useState("tr");
  const [gateTest, setGateTest] = useState(null);
  const [gateTestThreshold, setGateTestThreshold] = useState("50");
  const [allowGuestLikes, setAllowGuestLikes] = useState(false);
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [gateTestPickerOpen, setGateTestPickerOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    repositories.user.findById(userId).then(async (profile) => {
      if (cancelled || !profile) return;
      setName(profile.name ?? "");
      setBio(profile.bio ?? "");
      setGender(profile.gender ?? "male");
      setInterestedIn(profile.interestedIn ?? "both");
      setCountry(profile.country ?? undefined);
      setBirthdateText(isoToDisplayDate(profile.birthdate));
      setLanguage(profile.language ?? "tr");
      setGateTestThreshold(String(profile.gateTestThreshold ?? 50));
      setAllowGuestLikes(Boolean(profile.allowGuestLikes));
      setInstagram(profile.socialLinks?.instagram ?? "");
      setTwitter(profile.socialLinks?.twitter ?? "");
      setTiktok(profile.socialLinks?.tiktok ?? "");
      setAvatarUrl(profile.avatarUrl ?? null);
      if (profile.gateTestId) {
        const test = await repositories.test.findById(profile.gateTestId);
        if (!cancelled) setGateTest(test ?? null);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function handlePickAvatar() {
    setAvatarError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setAvatarError("Fotoğraflara erişim izni verilmedi.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.6,
      allowsEditing: true,
      aspect: [1, 1],
      base64: true,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    // ImagePicker'ın base64 çıktısı seçilen dosyanın orijinal formatından
    // bağımsız olarak HER ZAMAN JPEG'dir (bkz. ImagePickerAsset.base64
    // dokümantasyonu) — asset.mimeType burada yanıltıcı olurdu.
    const mimeType = "image/jpeg";
    const extension = "jpg";
    const dataUri = `data:${mimeType};base64,${asset.base64}`;

    setAvatarUploading(true);
    const uploadResult = await uploadAvatar(repositories, userId, dataUri, {
      type: mimeType,
      size: asset.fileSize ?? dataUri.length,
      extension,
    });
    setAvatarUploading(false);

    if (uploadResult.status === "error") {
      setAvatarError(uploadResult.message);
      return;
    }
    setAvatarUrl(uploadResult.data.avatarUrl);
  }

  async function handleSave() {
    setError(null);

    let birthdate;
    if (birthdateText.trim() === "") {
      birthdate = null;
    } else {
      birthdate = displayDateToIso(birthdateText);
      if (!birthdate) {
        setError("Doğum tarihi GG.AA.YYYY formatında olmalı (ör. 15.03.1998).");
        return;
      }
    }

    const socialLinks = {};
    if (instagram) socialLinks.instagram = instagram;
    if (twitter) socialLinks.twitter = twitter;
    if (tiktok) socialLinks.tiktok = tiktok;

    setSaving(true);
    const result = await updateProfile(repositories, userId, {
      name,
      bio,
      gender,
      interestedIn,
      country,
      birthdate,
      language,
      gateTestId: gateTest?.id ?? null,
      gateTestThreshold: gateTest ? Number(gateTestThreshold) || 0 : null,
      allowGuestLikes,
      socialLinks,
    });
    setSaving(false);
    if (result.status === "error") {
      setError(result.message);
      return;
    }
    router.back();
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    setDeleteError(null);
    const result = await deleteAccount(repositories, userId);
    setDeleting(false);
    if (result.status === "error") {
      setDeleteError(result.message);
      return;
    }
    setDeleteOpen(false);
    setUserId(null);
    router.replace("/");
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const selectedCountryName = COUNTRIES.find((c) => c.code === country)?.tr;

  return (
    <ScrollView style={styles.container} contentContainerStyle={[insets, styles.content]}>
      <ScreenHeader title="Profili Düzenle" back />

      <Pressable style={styles.avatarRow} onPress={handlePickAvatar} disabled={avatarUploading}>
        {isRenderableImageUri(avatarUrl) ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
        ) : (
          <InitialsAvatar name={name} size={AVATAR_SIZE} />
        )}
        <View style={styles.avatarOverlay}>
          {avatarUploading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.avatarOverlayText}>Değiştir</Text>
          )}
        </View>
      </Pressable>
      {avatarError && <Text style={styles.error}>{avatarError}</Text>}

      <View style={styles.field}>
        <Text style={styles.label}>Ad</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor={colors.mutedDark} />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Hakkında</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={4}
          maxLength={1000}
          placeholderTextColor={colors.mutedDark}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.field, styles.flex1]}>
          <Text style={styles.label}>Cinsiyet</Text>
          <View style={styles.chipRow}>
            {GENDER_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                style={[styles.chip, gender === option.value && styles.chipActive]}
                onPress={() => setGender(option.value)}
              >
                <Text style={[styles.chipText, gender === option.value && styles.chipTextActive]}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>İlgi alanı</Text>
        <View style={styles.chipRow}>
          {INTERESTED_IN_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              style={[styles.chip, interestedIn === option.value && styles.chipActive]}
              onPress={() => setInterestedIn(option.value)}
            >
              <Text style={[styles.chipText, interestedIn === option.value && styles.chipTextActive]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.field, styles.flex1]}>
          <Text style={styles.label}>Doğum tarihi</Text>
          <TextInput
            style={styles.input}
            value={birthdateText}
            onChangeText={setBirthdateText}
            placeholder="GG.AA.YYYY"
            placeholderTextColor={colors.mutedDark}
            keyboardType="number-pad"
            maxLength={10}
          />
        </View>
        <View style={[styles.field, styles.flex1]}>
          <Text style={styles.label}>Ülke</Text>
          <Pressable style={styles.trigger} onPress={() => setCountryPickerOpen(true)}>
            <Text style={styles.triggerText} numberOfLines={1}>
              {selectedCountryName ?? "Herhangi"}
            </Text>
            <Text style={styles.triggerChevron}>›</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Uygulama dili</Text>
        <View style={styles.chipRow}>
          {LANGUAGE_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              style={[styles.chip, language === option.value && styles.chipActive]}
              onPress={() => setLanguage(option.value)}
            >
              <Text style={[styles.chipText, language === option.value && styles.chipTextActive]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Kapı testi</Text>
        <Text style={styles.hint}>
          Seçersen, keşfette seni beğenenler önce bu testi çözüp eşik puanını geçmeli.
        </Text>
        {gateTest ? (
          <Pressable style={styles.taggedChip} onPress={() => setGateTest(null)}>
            <Text style={styles.taggedChipText} numberOfLines={1}>
              📋 {gateTest.title}
            </Text>
            <Text style={styles.taggedChipRemove}>✕</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.trigger} onPress={() => setGateTestPickerOpen(true)}>
            <Text style={styles.triggerText}>Test seç</Text>
            <Text style={styles.triggerChevron}>›</Text>
          </Pressable>
        )}
      </View>

      {gateTest && (
        <View style={styles.field}>
          <Text style={styles.label}>Kapı testi eşiği (0-100)</Text>
          <TextInput
            style={styles.input}
            value={gateTestThreshold}
            onChangeText={setGateTestThreshold}
            keyboardType="number-pad"
            maxLength={3}
          />
        </View>
      )}

      <Pressable style={styles.switchRow} onPress={() => setAllowGuestLikes((prev) => !prev)}>
        <Text style={styles.switchLabel}>Misafir beğenisine izin ver</Text>
        <Switch
          value={allowGuestLikes}
          onValueChange={setAllowGuestLikes}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#fff"
        />
      </Pressable>

      <View style={styles.field}>
        <Text style={styles.label}>Sosyal medya linkleri</Text>
        <TextInput
          style={styles.input}
          value={instagram}
          onChangeText={setInstagram}
          placeholder="Instagram URL"
          placeholderTextColor={colors.mutedDark}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          value={twitter}
          onChangeText={setTwitter}
          placeholder="Twitter/X URL"
          placeholderTextColor={colors.mutedDark}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          value={tiktok}
          onChangeText={setTiktok}
          placeholder="TikTok URL"
          placeholderTextColor={colors.mutedDark}
          autoCapitalize="none"
        />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Button variant="primary" onPress={handleSave} loading={saving}>
        Kaydet
      </Button>

      <Button variant="delete" onPress={() => setDeleteOpen(true)}>
        Hesabımı Sil
      </Button>

      <CountryPickerModal
        visible={countryPickerOpen}
        onClose={() => setCountryPickerOpen(false)}
        onSelect={setCountry}
      />

      <TestPickerModal
        visible={gateTestPickerOpen}
        onClose={() => setGateTestPickerOpen(false)}
        onSelect={setGateTest}
        title="Kapı testi seç"
      />

      <Modal visible={deleteOpen} transparent animationType="fade" onRequestClose={() => setDeleteOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Hesabını silmek istediğine emin misin?</Text>
            <Text style={styles.modalBody}>
              Bu işlem geri alınamaz — profilin, testlerin, mesajların ve tüm verilerin kalıcı olarak silinir.
            </Text>
            {deleteError && <Text style={styles.error}>{deleteError}</Text>}
            <View style={styles.modalActions}>
              <Button variant="outline" style={styles.modalActionButton} onPress={() => setDeleteOpen(false)}>
                Vazgeç
              </Button>
              <Button
                variant="delete"
                style={styles.modalActionButton}
                onPress={handleDeleteAccount}
                loading={deleting}
              >
                Hesabımı Sil
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    gap: spacing.lg,
    paddingBottom: 40,
  },
  avatarRow: {
    alignSelf: "center",
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: "hidden",
  },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(18,16,20,0.45)",
  },
  avatarOverlayText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  flex1: {
    flex: 1,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    color: colors.mutedForeground,
    fontSize: 13,
  },
  hint: {
    color: colors.mutedForeground,
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.foreground,
    fontSize: 15,
    backgroundColor: colors.card,
  },
  textarea: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  chipRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  chip: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.full,
    paddingVertical: 8,
    alignItems: "center",
  },
  chipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontWeight: "600",
  },
  chipTextActive: {
    color: colors.primary,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.card,
  },
  triggerText: {
    color: colors.foreground,
    fontSize: 14,
    flexShrink: 1,
  },
  triggerChevron: {
    color: colors.mutedForeground,
  },
  taggedChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    alignSelf: "flex-start",
    backgroundColor: colors.primarySoft,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    maxWidth: "100%",
  },
  taggedChipText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
    flexShrink: 1,
  },
  taggedChipRemove: {
    color: colors.primary,
    fontSize: 11,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  switchLabel: {
    color: colors.foreground,
    fontSize: 14,
    flex: 1,
    paddingRight: spacing.md,
  },
  error: {
    color: colors.danger,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  modalTitle: {
    color: colors.foreground,
    fontSize: 16,
    fontWeight: "700",
  },
  modalBody: {
    color: colors.mutedForeground,
    fontSize: 14,
  },
  modalActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  modalActionButton: {
    flex: 1,
  },
});
