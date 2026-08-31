import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { fetchNotifications } from "@hemdem/core/usecases/notifications/fetchNotifications";
import { markNotificationsRead } from "@hemdem/core/usecases/notifications/markNotificationsRead";
import { repositories } from "../../lib/repositories";
import { useSession } from "../../lib/session";
import { colors } from "../../lib/theme";
import { InitialsAvatar } from "../../components/InitialsAvatar";

function notificationText({ notification, actor, test }) {
  if (notification.type === "test_similarity" && test) {
    return `${actor.name}, ${test.title} testinde seninle uyumlu çıktı.`;
  }
  if (notification.type === "match") {
    return `${actor.name} ile eşleştin! Sohbete başla.`;
  }
  return `${actor.name} seni beğendi.`;
}

export default function NotificationsScreen() {
  const { userId } = useSession();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    async function load() {
      const result = await fetchNotifications(repositories, userId);
      if (cancelled || result.status !== "success") return;
      setEntries(result.data);
      setLoading(false);
      markNotificationsRead(repositories, userId);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bildirimler</Text>

      {entries.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.empty}>Henüz bildirimin yok.</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => String(item.notification.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.row, !item.notification.isRead && styles.rowUnread]}>
              <InitialsAvatar name={item.actor.name} size={40} />
              <Text style={styles.text}>{notificationText(item)}</Text>
              {item.notification.similarity != null && (
                <Text style={styles.badge}>%{item.notification.similarity}</Text>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.foreground,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  empty: {
    color: colors.muted,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
  },
  rowUnread: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  text: {
    flex: 1,
    color: colors.foreground,
    fontSize: 14,
  },
  badge: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 13,
  },
});
