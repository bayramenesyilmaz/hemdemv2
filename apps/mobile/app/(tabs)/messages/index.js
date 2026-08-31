import { useRef, useState } from "react";
import { Animated, Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "../../../lib/theme";
import { AppTopBar } from "../../../components/nav/AppTopBar";
import { ChatsList } from "../../../components/messages/ChatsList";
import { LikesList } from "../../../components/messages/LikesList";

const SCREEN_WIDTH = Dimensions.get("window").width;
const TABS = ["Sohbetler", "İstekler"];

/**
 * Mesajlar artık kaydırmalı iki alt sekme içeriyor: Sohbetler ve
 * İstekler (eskiden ayrı bir "Beğenenler" alt bar sekmesiydi — hem
 * anlamsal olarak mesajlaşma öncesi bir adım olduğu hem de alt barı 5
 * sekmeye indirmek için buraya taşındı).
 */
export default function MessagesScreen() {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [likesCount, setLikesCount] = useState(0);

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
            <Text style={[styles.segmentText, activeIndex === index && styles.segmentTextActive]}>
              {label}
            </Text>
            {index === 1 && likesCount > 0 && (
              <View style={styles.segmentBadge}>
                <Text style={styles.segmentBadgeText}>{likesCount > 9 ? "9+" : likesCount}</Text>
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
