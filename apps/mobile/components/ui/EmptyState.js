import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "../../lib/theme";

/**
 * Boş liste durumları için tek tip görünüm — web'deki EmptyState'in RN
 * karşılığı (kesikli kenarlık + hafif gradyan-benzeri yüzey rengi).
 */
export function EmptyState({ icon, title, description, action }) {
  return (
    <View style={styles.container}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    backgroundColor: colors.primarySoft,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  icon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.foreground,
    fontWeight: "700",
    fontSize: 15,
    textAlign: "center",
  },
  description: {
    color: colors.mutedForeground,
    fontSize: 13,
    textAlign: "center",
    maxWidth: 280,
  },
});
