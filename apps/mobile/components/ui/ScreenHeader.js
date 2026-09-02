import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing } from "../../lib/theme";

/**
 * Ekran başlığı satırı: geri butonu (opsiyonel), başlık, sağda tek bir
 * aksiyon (opsiyonel). `onBack` verilmezse router.back() kullanılır.
 * Sabit `paddingTop: 60` yerine SafeAreaView zaten dış Screen bileşeninde
 * uygulandığı için burada ekstra bir üst boşluk gerekmiyor.
 */
export function ScreenHeader({ title, titleExtra, subtitle, back = false, onBack, action }) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.titleGroup}>
          {back && (
            <Pressable onPress={onBack ?? (() => router.back())} hitSlop={8} style={styles.backButton}>
              <Text style={styles.backText}>‹</Text>
            </Pressable>
          )}
          <View style={styles.textGroup}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              {titleExtra}
            </View>
            {subtitle && (
              <Text style={styles.subtitle} numberOfLines={2}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        {action}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    color: colors.foreground,
    fontSize: 20,
    fontWeight: "700",
    marginTop: -2,
  },
  textGroup: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  title: {
    color: colors.foreground,
    fontSize: 22,
    fontWeight: "800",
    flexShrink: 1,
  },
  subtitle: {
    color: colors.mutedForeground,
    fontSize: 13,
    marginTop: 2,
  },
});
