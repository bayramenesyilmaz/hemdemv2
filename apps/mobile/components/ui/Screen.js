import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing } from "../../lib/theme";

/**
 * Tüm ekranların ortak dış çerçevesi: arka plan rengi + gerçek güvenli
 * alan (çentik/durum çubuğu) boşluğu. Önceki sabit `paddingTop: 60`
 * yerine `useSafeAreaInsets` kullanılıyor — farklı cihazlarda (Dynamic
 * Island, farklı durum çubuğu yükseklikleri) sabit değer ya fazla ya az
 * boşluk bırakıyordu. Sadece düz View sarmalayıcı; FlatList/ScrollView
 * kullanan ekranlar `useScreenInsets()` ile aynı boşluğu kendi
 * `contentContainerStyle`'ına uygular (children/data çakışmasını önlemek
 * için FlatList burada sarmalanmıyor).
 */
export function Screen({ children, contentStyle, style, ...props }) {
  const insets = useScreenInsets();

  return (
    <View style={[styles.container, insets, contentStyle, style]} {...props}>
      {children}
    </View>
  );
}

export function useScreenInsets() {
  const insets = useSafeAreaInsets();
  return { paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.xl };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
