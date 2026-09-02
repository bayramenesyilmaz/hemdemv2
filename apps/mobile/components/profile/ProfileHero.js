import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { isOnline } from "@hemdem/core/domain/entities/user";
import { colors, gradients, spacing } from "../../lib/theme";

function initialsOf(name) {
  return (name ?? "")
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * u/[id].js'in üst fotoğraf/gradyan/geri-butonu bloğu — sayfadan
 * ayrıştırıldı (dosya çok uzamıştı), tamamen sunum amaçlı (state yok).
 */
export function ProfileHero({ profile, age, onBack }) {
  return (
    <View style={styles.hero}>
      <LinearGradient colors={gradients.primary} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={styles.heroPhoto}>
        <Text style={styles.heroInitials}>{initialsOf(profile.name)}</Text>
      </LinearGradient>

      <LinearGradient colors={["transparent", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.92)"]} style={styles.heroOverlay}>
        <View style={styles.heroNameRow}>
          <Text style={styles.heroName}>
            {profile.name}
            {age ? `, ${age}` : ""}
          </Text>
          {isOnline(profile.lastSeenAt) && <View style={styles.onlineDot} />}
        </View>
        {profile.country && <Text style={styles.heroCountry}>{profile.country}</Text>}
        {profile.bio && <Text style={styles.heroBio}>{profile.bio}</Text>}
      </LinearGradient>

      <Pressable style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>‹</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 340,
    width: "100%",
  },
  heroPhoto: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  heroInitials: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 88,
    fontWeight: "800",
  },
  heroOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: "35%",
    justifyContent: "flex-end",
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: 2,
  },
  heroNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heroName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#34d399",
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.5)",
  },
  heroCountry: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
  },
  heroBio: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    marginTop: 4,
  },
  backButton: {
    position: "absolute",
    top: 54,
    left: spacing.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(18,16,20,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: -2,
  },
});
