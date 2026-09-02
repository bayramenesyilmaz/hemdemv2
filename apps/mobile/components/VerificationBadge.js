import { Ionicons } from "@expo/vector-icons";
import { colors } from "../lib/theme";

/**
 * `verificationStatus === "approved"` olan profillerin isminin yanında
 * gösterilen küçük rozet — web'deki VerificationBadge ile aynı yerlerde
 * kullanılıyor (profil hero'su, herkese açık profil, sohbet başlığı).
 */
export function VerificationBadge({ size = 16, color = colors.primary }) {
  return <Ionicons name="shield-checkmark" size={size} color={color} />;
}
