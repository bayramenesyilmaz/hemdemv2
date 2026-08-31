import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { likeUser } from "@hemdem/core/usecases/discover/likeUser";
import { sendMessage } from "@hemdem/core/usecases/chat/sendMessage";
import { repositories } from "../../../lib/repositories";
import { useSession } from "../../../lib/session";
import { colors, radii, spacing } from "../../../lib/theme";
import { InitialsAvatar } from "../../../components/InitialsAvatar";
import { Button } from "../../../components/ui/Button";
import { Screen } from "../../../components/ui/Screen";

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { userId } = useSession();
  const [profile, setProfile] = useState(null);
  const [likeStatus, setLikeStatus] = useState(null);
  const [messageDraft, setMessageDraft] = useState("");
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [sending, setSending] = useState(false);
  const [messageStatus, setMessageStatus] = useState(null);

  useEffect(() => {
    let cancelled = false;
    repositories.user.findById(id).then((found) => {
      if (!cancelled) setProfile(found);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleLike() {
    const result = await likeUser(repositories, userId, id, "like");
    if (result.status === "error") {
      setLikeStatus(result.message);
      return;
    }
    setLikeStatus(result.data.matched ? "matched" : "liked");
  }

  async function handleSendMessage() {
    const content = messageDraft.trim();
    if (!content) return;
    setSending(true);
    const result = await sendMessage(repositories, userId, id, content);
    setSending(false);
    if (result.status === "error") {
      setMessageStatus(result.message);
      return;
    }
    router.push(`/messages/${result.data.chat.id}`);
  }

  if (!profile) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  return (
    <Screen contentStyle={styles.content}>
      <Button variant="ghost" style={styles.backButton} onPress={() => router.back()}>
        ‹ Geri
      </Button>

      <View style={styles.header}>
        <InitialsAvatar name={profile.name} size={96} />
        <Text style={styles.name}>{profile.name}</Text>
        {profile.country && <Text style={styles.country}>{profile.country}</Text>}
        {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
      </View>

      <View style={styles.actions}>
        <Button variant="primary" style={styles.actionButton} onPress={handleLike}>
          ❤️ Beğen
        </Button>
        <Button variant="outline" style={styles.actionButton} onPress={() => setShowMessageBox((v) => !v)}>
          💬 Mesaj
        </Button>
      </View>

      {likeStatus === "matched" && <Text style={styles.status}>🎉 Eşleştiniz!</Text>}
      {likeStatus === "liked" && <Text style={styles.status}>Beğenin gönderildi.</Text>}
      {likeStatus && likeStatus !== "matched" && likeStatus !== "liked" && (
        <Text style={styles.error}>{likeStatus}</Text>
      )}

      {showMessageBox && (
        <View style={styles.messageBox}>
          <TextInput
            style={styles.messageInput}
            value={messageDraft}
            onChangeText={setMessageDraft}
            placeholder="Mesajını yaz..."
            placeholderTextColor={colors.mutedDark}
          />
          <Button variant="primary" onPress={handleSendMessage} loading={sending} disabled={!messageDraft.trim()}>
            Gönder
          </Button>
          {messageStatus && <Text style={styles.error}>{messageStatus}</Text>}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    gap: spacing.lg,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 0,
  },
  header: {
    alignItems: "center",
    gap: 6,
  },
  name: {
    color: colors.foreground,
    fontSize: 22,
    fontWeight: "800",
    marginTop: 8,
  },
  country: {
    color: colors.mutedForeground,
    fontSize: 13,
  },
  bio: {
    color: colors.mutedForeground,
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  status: {
    color: colors.primary,
    textAlign: "center",
    fontWeight: "600",
  },
  error: {
    color: colors.danger,
    textAlign: "center",
  },
  messageBox: {
    gap: spacing.sm,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.foreground,
    backgroundColor: colors.card,
  },
});
