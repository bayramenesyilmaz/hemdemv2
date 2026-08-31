import { Stack } from "expo-router";

/**
 * "Testler" sekmesi kendi içinde liste -> çözme akışı olduğu için ayrı
 * bir Stack'e ihtiyaç duyuyor (sekme çubuğu görünür kalırken push/pop
 * çalışsın diye).
 */
export default function TestsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
