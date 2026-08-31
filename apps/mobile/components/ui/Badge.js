import { StyleSheet, Text, View } from "react-native";
import { colors, radii } from "../../lib/theme";

const TONES = {
  primary: { backgroundColor: colors.primarySoft, color: colors.primary },
  muted: { backgroundColor: colors.cardAlt, color: colors.mutedForeground },
  danger: { backgroundColor: "rgba(221,85,85,0.14)", color: colors.danger },
};

/** Küçük durum etiketleri — "Onay bekliyor", "Aynı cevap" vb. */
export function Badge({ children, tone = "muted", style }) {
  const { backgroundColor, color } = TONES[tone] ?? TONES.muted;
  return (
    <View style={[styles.badge, { backgroundColor }, style]}>
      <Text style={[styles.text, { color }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: "700",
  },
});
