import { Dimensions, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { colors } from "../lib/theme";
import { InitialsAvatar } from "./InitialsAvatar";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

/**
 * Web'deki SwipeCard/SwipeDeck'in (framer-motion sürükleme) mobil
 * karşılığı — aynı ürün mantığı (kart sürüklenip belirli bir eşiği
 * geçince beğeni/geçme tetiklenir), gesture-handler + reanimated ile.
 */
export function SwipeCard({ candidate, onSwiped, isTop }) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

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

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = `${(translateX.value / SCREEN_WIDTH) * 20}deg`;
    return {
      transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { rotate }],
    };
  });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <View style={styles.avatarWrap}>
          <InitialsAvatar name={candidate.name} size={96} />
        </View>
        <Text style={styles.name}>{candidate.name}</Text>
        {candidate.bio && (
          <Text style={styles.bio} numberOfLines={4}>
            {candidate.bio}
          </Text>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    width: SCREEN_WIDTH - 40,
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 420,
  },
  avatarWrap: {
    marginBottom: 16,
  },
  name: {
    color: colors.foreground,
    fontSize: 22,
    fontWeight: "800",
  },
  bio: {
    marginTop: 8,
    color: colors.muted,
    fontSize: 14,
    textAlign: "center",
  },
});
