import { useRef, useState } from "react";
import { Animated, Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "../../../lib/theme";
import { AppTopBar } from "../../../components/nav/AppTopBar";
import { ChatsList } from "../../../components/messages/ChatsList";
import { LikesList } from "../../../components/messages/LikesList";
import { ViewersList } from "../../../components/messages/ViewersList";

const SCREEN_WIDTH = Dimensions.get("window").width;
const TABS = ["Sohbetler", "İstekler", "Görüntüleyenler"];

/**
 * Mesajlar artık kaydırmalı üç alt sekme içeriyor: Sohbetler, İstekler ve
 * Profiline Bakanlar (Beğenenler ve Profil Görüntüleyenler eskiden ayrı alt
 * bar sekmeleriydi/menü kısayoluydu — mesajlaşma öncesi adımlar oldukları
 * ve alt barı 5 sekmeye indirmek için buraya taşındı/eklendi). Profil
 * menüsündeki "Profilimi Görüntüleyenler" kısayolu da ayrıca duruyor.
 */
export default function MessagesScreen() {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [likesCount, setLikesCount] = useState(0);
  const [viewersCount, setViewersCount] = useState(0);

  function goToTab(index) {
    setActiveIndex(index);
    scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
  }

  function handleMomentumEnd(event) {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  }

  return (
    <View style={styles.container}>
      <AppTopBar />

      <View style={styles.segmentRow}>
        {TABS.map((label, index) => (
          <Pressable
            key={label}
            style={[styles.segment, activeIndex === index && styles.segmentActive]}
            onPress={() => goToTab(index)}
          >
            <Text
              style={[styles.segmentText, activeIndex === index && styles.segmentTextActive]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {label}
            </Text>
            {index === 1 && likesCount > 0 && (
              <View style={styles.segmentBadge}>
                <Text style={styles.segmentBadgeText}>{likesCount > 9 ? "9+" : likesCount}</Text>
              </View>
            )}
            {index === 2 && viewersCount > 0 && (
              <View style={styles.segmentBadge}>
                <Text style={styles.segmentBadgeText}>{viewersCount > 9 ? "9+" : viewersCount}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumEnd}
        style={styles.pager}
      >
        <View style={{ width: SCREEN_WIDTH }}>
          <ChatsList />
        </View>
        <View style={{ width: SCREEN_WIDTH }}>
          <LikesList onCountChange={setLikesCount} />
        </View>
        <View style={{ width: SCREEN_WIDTH }}>
          <ViewersList onCountChange={setViewersCount} />
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  segmentRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  segment: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  segmentText: {
    color: colors.mutedForeground,
    fontWeight: "700",
    fontSize: 13,
  },
  segmentTextActive: {
    color: colors.primary,
  },
  segmentBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  segmentBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },
  pager: {
    flex: 1,
  },
});
