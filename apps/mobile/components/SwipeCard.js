import { Dimensions, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { calculateAge } from "@hemdem/core/domain/entities/user";
import { colors, gradients, radii } from "../lib/theme";
import { Badge } from "./ui/Badge";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

/**
 * Web'deki SwipeCard/SwipeDeck'in (tam ekran fotoğraf + alt gradyan bilgi
 * paneli, sürüklenince LIKE/NOPE damgaları) mobil karşılığı —
 * gesture-handler + reanimated ile aynı ürün mantığı.
 */
export function SwipeCard({ candidate, onSwiped, isTop }) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const initials = (candidate.name ?? "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const age = candidate.birthdate ? calculateAge(candidate.birthdate) : null;

  function handleSwiped(action) {
    onSwiped(candidate.id, action);
  }

  const pan = Gesture.Pan()
    .enabled(isTop)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        const action = event.translationX > 0 ? "like" : "dislike";
        translateX.value = withTiming(event.translationX > 0 ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5, {
          duration: 250,
        });
        runOnJS(handleSwiped)(action);
        return;
      }
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = `${(translateX.value / SCREEN_WIDTH) * 20}deg`;
    return {
      transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { rotate }],
    };
  });

  const likeStampStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [20, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
  }));
  const nopeStampStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, -20], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, cardStyle]}>
        <LinearGradient colors={gradients.primary} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={styles.photo}>
          <Text style={styles.initials}>{initials}</Text>
        </LinearGradient>

        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.55)", "rgba(0,0,0,0.9)"]}
          style={styles.infoOverlay}
        >
          <Text style={styles.name} numberOfLines={1}>
            {candidate.name}
            {age ? `, ${age}` : ""}
          </Text>
          {candidate.country && <Text style={styles.country}>{candidate.country}</Text>}
          {candidate.bio && (
            <Text style={styles.bio} numberOfLines={2}>
              {candidate.bio}
            </Text>
          )}
          {candidate.gateTestId && (
            <Badge tone="primary" style={styles.gateBadge}>
              🔒 Kapı testi var
            </Badge>
          )}
        </LinearGradient>

        {isTop && (
          <>
            <Animated.View style={[styles.stamp, styles.likeStamp, likeStampStyle]}>
              <Text style={[styles.stampText, styles.likeStampText]}>BEĞEN</Text>
            </Animated.View>
            <Animated.View style={[styles.stamp, styles.nopeStamp, nopeStampStyle]}>
              <Text style={[styles.stampText, styles.nopeStampText]}>GEÇ</Text>
            </Animated.View>
          </>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    width: SCREEN_WIDTH - 40,
    height: "100%",
    borderRadius: radii.xl,
    overflow: "hidden",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  photo: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 96,
    fontWeight: "800",
  },
  infoOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    gap: 4,
  },
  name: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
  },
  country: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
  },
  bio: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    marginTop: 4,
  },
  gateBadge: {
    marginTop: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  stamp: {
    position: "absolute",
    top: 24,
    borderWidth: 3,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "rgba(18,16,20,0.7)",
  },
  likeStamp: {
    left: 20,
    borderColor: colors.primary,
    transform: [{ rotate: "-12deg" }],
  },
  nopeStamp: {
    right: 20,
    borderColor: colors.mutedForeground,
    transform: [{ rotate: "12deg" }],
  },
  stampText: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 1,
  },
  likeStampText: {
    color: colors.primary,
  },
  nopeStampText: {
    color: colors.mutedForeground,
  },
});
