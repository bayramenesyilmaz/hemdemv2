import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { likeUser } from "@hemdem/core/usecases/discover/likeUser";
import { sendMessage } from "@hemdem/core/usecases/chat/sendMessage";
import { repositories } from "../../../lib/repositories";
import { useSession } from "../../../lib/session";
import { colors } from "../../../lib/theme";
import { InitialsAvatar } from "../../../components/InitialsAvatar";

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
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>‹ Geri</Text>
      </Pressable>

      <View style={styles.header}>
        <InitialsAvatar name={profile.name} size={88} />
        <Text style={styles.name}>{profile.name}</Text>
        {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.likeButton} onPress={handleLike}>
          <Text style={styles.likeButtonText}>❤️ Beğen</Text>
        </Pressable>
        <Pressable style={styles.messageButton} onPress={() => setShowMessageBox((v) => !v)}>
          <Text style={styles.messageButtonText}>💬 Mesaj</Text>
        </Pressable>
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
          <Pressable style={styles.sendButton} onPress={handleSendMessage} disabled={sending}>
            {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendButtonText}>Gönder</Text>}
          </Pressable>
          {messageStatus && <Text style={styles.error}>{messageStatus}</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  back: {
    color: colors.muted,
    fontSize: 15,
    marginBottom: 12,
  },
  header: {
    alignItems: "center",
    gap: 6,
    marginBottom: 24,
  },
  name: {
    color: colors.foreground,
    fontSize: 22,
    fontWeight: "800",
    marginTop: 8,
  },
  bio: {
    color: colors.muted,
    fontSize: 14,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  likeButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  likeButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  messageButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  messageButtonText: {
    color: colors.foreground,
    fontWeight: "700",
  },
  status: {
    marginTop: 12,
    color: colors.primary,
    textAlign: "center",
    fontWeight: "600",
  },
  error: {
    marginTop: 12,
    color: colors.danger,
    textAlign: "center",
  },
  messageBox: {
    marginTop: 16,
    gap: 8,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.foreground,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
