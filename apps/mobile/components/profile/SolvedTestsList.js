import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../../lib/theme";

/**
 * u/[id].js'in "Çözdüğü Testler" bloğu — sayfadan ayrıştırıldı.
 */
export function SolvedTestsList({ tests, onPressTest }) {
  if (tests.length === 0) return null;

  return (
    <View style={styles.solvedSection}>
      <Text style={styles.solvedTitle}>Çözdüğü Testler</Text>
      {tests.map((test) => (
        <Pressable key={test.id} style={styles.solvedRow} onPress={() => onPressTest(test)}>
          <Text style={styles.solvedRowText} numberOfLines={1}>
            {test.title}
          </Text>
          <Text style={styles.solvedRowChevron}>›</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  solvedSection: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  solvedTitle: {
    color: colors.foreground,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  solvedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  solvedRowText: {
    flex: 1,
    color: colors.foreground,
    fontSize: 14,
    fontWeight: "500",
  },
  solvedRowChevron: {
    color: colors.mutedForeground,
    fontSize: 16,
  },
});
