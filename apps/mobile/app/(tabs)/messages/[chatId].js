import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { fetchChatMessages } from "@hemdem/core/usecases/chat/fetchChatMessages";
import { sendMessage } from "@hemdem/core/usecases/chat/sendMessage";
import { repositories } from "../../../lib/repositories";
import { useSession } from "../../../lib/session";
import { colors, gradients, radii, spacing } from "../../../lib/theme";
import { ScreenHeader } from "../../../components/ui/ScreenHeader";
import { useScreenInsets } from "../../../components/ui/Screen";
import { SafetyMenu } from "../../../components/SafetyMenu";

const POLL_INTERVAL_MS = 3000;

export default function ChatThreadScreen() {
  const insets = useScreenInsets();
  const router = useRouter();
  const { chatId } = useLocalSearchParams();
  const { userId } = useSession();
  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    async function load() {
      const result = await fetchChatMessages(repositories, userId, Number(chatId));
      if (cancelled || result.status !== "success") return;
      setOtherUser(result.data.otherUser);
      setMessages(result.data.messages);
      setLoading(false);
    }

    load();
    // Web'deki ChatThread.js ile aynı desen: gerçek zamanlı altyapı
    // (Supabase Realtime/WebSocket) yerine kısa aralıklı polling. App
    // arka plandayken (AppState !== "active") tik atlanır — kilit ekranında
    // duran bir cihaz sonsuza kadar 3sn'de bir istek atmasın diye. Öne
    // dönünce hemen bir kez tazelenir.
    const interval = setInterval(() => {
      if (AppState.currentState === "active") load();
    }, POLL_INTERVAL_MS);
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") load();
    });
    return () => {
      cancelled = true;
      clearInterval(interval);
      subscription.remove();
    };
  }, [userId, chatId]);

  async function handleSend() {
    const content = draft.trim();
    if (!content || !otherUser) return;
    setDraft("");
    setSending(true);
    const result = await sendMessage(repositories, userId, otherUser.id, content);
    setSending(false);
    if (result.status === "success") {
      setMessages((prev) => [...prev, result.data.message]);
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={60}
    >
      <View style={[insets, styles.headerWrap]}>
        <ScreenHeader
          title={otherUser?.name ?? ""}
          back
          action={
            otherUser && (
              <SafetyMenu
                targetUserId={otherUser.id}
                targetName={otherUser.name}
                onBlocked={() => router.replace("/messages")}
              />
            )
          }
        />
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => {
          const mine = item.senderId === userId;
          if (mine) {
            return (
              <LinearGradient colors={gradients.primary} style={[styles.bubble, styles.bubbleMine]}>
                <Text style={styles.bubbleTextMine}>{item.content}</Text>
              </LinearGradient>
            );
          }
          return (
            <View style={[styles.bubble, styles.bubbleTheirs]}>
              <Text style={styles.bubbleText}>{item.content}</Text>
            </View>
          );
        }}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder="Mesaj yaz..."
          placeholderTextColor={colors.mutedDark}
        />
        <Pressable
          style={({ pressed }) => [styles.sendButton, pressed && styles.sendButtonPressed]}
          onPress={handleSend}
          disabled={sending || !draft.trim()}
        >
          <LinearGradient
            colors={sending || !draft.trim() ? [colors.cardAlt, colors.cardAlt] : gradients.primary}
            style={styles.sendButtonFill}
          >
            {sending ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.sendButtonText}>➤</Text>}
          </LinearGradient>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  headerWrap: {
    paddingBottom: 0,
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  bubbleMine: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    alignSelf: "flex-start",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    color: colors.foreground,
  },
  bubbleTextMine: {
    color: "#fff",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    color: colors.foreground,
    backgroundColor: colors.card,
  },
  sendButton: {
    borderRadius: radii.full,
    overflow: "hidden",
  },
  sendButtonPressed: {
    opacity: 0.85,
  },
  sendButtonFill: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
