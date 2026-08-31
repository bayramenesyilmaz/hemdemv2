import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { updateProfile } from "@hemdem/core/usecases/profile/updateProfile";
import { repositories } from "../../../lib/repositories";
import { useSession } from "../../../lib/session";
import { colors } from "../../../lib/theme";

/**
 * Web'deki profil düzenleme formunun sadeleştirilmiş mobil hali —
 * cinsiyet/ülke/kapı testi/fotoğraf gibi alanlar bu ilk sürümde yok,
 * sadece isim ve biyografi (updateProfile aynı usecase, sadece
 * gönderilen alanlar kısıtlı).
 */
export default function EditProfileScreen() {
  const router = useRouter();
  const { userId } = useSession();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

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

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>‹ Geri</Text>
      </Pressable>
      <Text style={styles.title}>Profili Düzenle</Text>

      <Text style={styles.label}>Ad</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Hakkında</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        value={bio}
        onChangeText={setBio}
        multiline
        numberOfLines={4}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={styles.saveButton} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Kaydet</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  back: {
    color: colors.muted,
    fontSize: 15,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.foreground,
    marginBottom: 20,
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.foreground,
    fontSize: 15,
  },
  textarea: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  error: {
    color: colors.danger,
    marginTop: 12,
  },
  saveButton: {
    marginTop: 24,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
