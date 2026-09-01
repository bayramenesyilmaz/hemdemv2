import { useEffect, useState } from "react";
import { ActivityIndicator, Modal, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { updateProfile } from "@hemdem/core/usecases/profile/updateProfile";
import { deleteAccount } from "@hemdem/core/usecases/auth/deleteAccount";
import { repositories } from "../../../lib/repositories";
import { useSession } from "../../../lib/session";
import { colors, radii, spacing } from "../../../lib/theme";
import { Button } from "../../../components/ui/Button";
import { ScreenHeader } from "../../../components/ui/ScreenHeader";
import { Screen } from "../../../components/ui/Screen";

/**
 * Web'deki profil düzenleme formunun sadeleştirilmiş mobil hali —
 * cinsiyet/ülke/kapı testi/fotoğraf gibi alanlar bu ilk sürümde yok,
 * sadece isim ve biyografi (updateProfile aynı usecase, sadece
 * gönderilen alanlar kısıtlı).
 */
export default function EditProfileScreen() {
  const router = useRouter();
  const { userId, setUserId } = useSession();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    repositories.user.findById(userId).then((profile) => {
      if (cancelled || !profile) return;
      setName(profile.name);
      setBio(profile.bio ?? "");
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const result = await updateProfile(repositories, userId, { name, bio });
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
      <Screen style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  return (
    <Screen contentStyle={styles.content}>
      <ScreenHeader title="Profili Düzenle" back />

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
          placeholderTextColor={colors.mutedDark}
        />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Button variant="primary" onPress={handleSave} loading={saving}>
        Kaydet
      </Button>

      <Button variant="delete" onPress={() => setDeleteOpen(true)}>
        Hesabımı Sil
      </Button>

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
  field: {
    gap: spacing.xs,
  },
  label: {
    color: colors.mutedForeground,
    fontSize: 13,
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
