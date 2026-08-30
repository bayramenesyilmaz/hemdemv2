import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { repositories } from "../lib/repositories";
import { useSession } from "../lib/session";

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
  const { setUserId } = useSession();
  const [email, setEmail] = useState("demo@hemdem.test");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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
    <View style={styles.container}>
      <Text style={styles.title}>Hemdem</Text>
      <Text style={styles.subtitle}>Uyum testleriyle tanış.</Text>

      <View style={styles.form}>
        <Text style={styles.label}>E-posta</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Şifre</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Giriş Yap</Text>}
        </Pressable>

        <Text style={styles.hint}>Demo hesap otomatik dolduruldu.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0f",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 24,
  },
  form: {
    width: "100%",
    maxWidth: 360,
    gap: 6,
  },
  label: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#fff",
    fontSize: 15,
  },
  error: {
    color: "#f87171",
    fontSize: 13,
    marginTop: 4,
  },
  button: {
    marginTop: 16,
    backgroundColor: "#e11d48",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  hint: {
    marginTop: 12,
    textAlign: "center",
    color: "#6b7280",
    fontSize: 12,
  },
});
