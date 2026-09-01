import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { repositories } from "../lib/repositories";
import { useSession } from "../lib/session";
import { colors, gradients, radii, spacing } from "../lib/theme";
import { Button } from "../components/ui/Button";

const ERROR_MESSAGES = {
  invalid_credentials: "E-posta veya şifre hatalı.",
};

/**
 * Giriş ekranı. Bu iskelet aşamasında gerçek Supabase Auth yerine
 * `packages/core`'un mock auth'unu (web'in mock modunda kullandığı aynı
 * sahte kullanıcı listesi) doğrudan çağırıyor — mimarinin doğru
 * kurulduğunu göstermek için: aynı `@hemdem/core` kodu, hiç
 * değiştirilmeden, hem web'de hem burada çalışıyor.
 */
export default function LoginScreen() {
  const router = useRouter();
  const { userId, hydrated, setUserId } = useSession();
  const [email, setEmail] = useState("demo@hemdem.test");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Saklanmış (expo-secure-store) bir oturum varsa login ekranını hiç
    // göstermeden doğrudan içeri geç.
    if (hydrated && userId) router.replace("/discover");
  }, [hydrated, userId]);

  async function handleLogin() {
    setError(null);
    setLoading(true);
    const result = await repositories.mockAuth.signIn({ email, password });
    setLoading(false);

    if (result.error) {
      setError(ERROR_MESSAGES[result.error] ?? result.error);
      return;
    }

    setUserId(result.userId);
    router.replace("/discover");
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.logoBadge}>
        <LinearGradient colors={gradients.primary} style={styles.logoFill}>
          <Text style={styles.logoText}>H</Text>
        </LinearGradient>
      </View>
      <Text style={styles.title}>Hemdem</Text>
      <Text style={styles.subtitle}>Uyum testleriyle tanış.</Text>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>E-posta</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor={colors.mutedDark}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Şifre</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor={colors.mutedDark}
          />
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <Button variant="primary" onPress={handleLogin} loading={loading} style={styles.submitButton}>
          Giriş Yap
        </Button>

        <Text style={styles.hint}>Demo hesap otomatik dolduruldu.</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: radii.xl,
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  logoFill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "800",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.foreground,
  },
  subtitle: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginTop: 4,
    marginBottom: spacing.xxl,
  },
  form: {
    width: "100%",
    maxWidth: 360,
    gap: spacing.md,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 13,
    color: colors.mutedForeground,
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
  error: {
    color: colors.danger,
    fontSize: 13,
  },
  submitButton: {
    marginTop: spacing.xs,
  },
  hint: {
    marginTop: spacing.xs,
    textAlign: "center",
    color: colors.mutedDark,
    fontSize: 12,
  },
});
