import { useEffect, useRef } from "react";
import {
  Animated, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";
import type { Notif } from "../lib/useNotifications";
import { EXPLORER_BASE } from "../lib/constants";

const ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  trade:  "flash-outline",
  budget: "warning-outline",
  agent:  "hardware-chip-outline",
  info:   "information-circle-outline",
};

interface Props {
  notifs:      Notif[];
  unread:      number;
  open:        boolean;
  onOpen:      () => void;
  onClose:     () => void;
  onMarkAll:   () => void;
  onClear:     () => void;
  onMarkRead:  (id: string) => void;
}

export function NotificationBell({ notifs, unread, open, onOpen, onClose, onMarkAll, onClear, onMarkRead }: Props) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (open) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      const t = setTimeout(onMarkAll, 1200);
      return () => clearTimeout(t);
    } else {
      Animated.timing(fadeAnim, { toValue: 0, duration: 140, useNativeDriver: true }).start();
    }
  }, [open]);

  function openLink(hash?: string) {
    if (!hash) return;
    const url = hash.startsWith("http") ? hash : `${EXPLORER_BASE}/${hash}`;
    Linking.openURL(url);
  }

  return (
    <>
      {/* Bell button */}
      <Pressable
        onPress={onOpen}
        style={[s.bellBtn, { backgroundColor: colors.bgSoft }]}
        hitSlop={8}
      >
        <Ionicons name={unread > 0 ? "notifications" : "notifications-outline"} size={20} color={unread > 0 ? colors.accent : colors.text2} />
        {unread > 0 && (
          <View style={[s.badge, { backgroundColor: colors.accent }]}>
            <Text style={s.badgeText}>{unread > 9 ? "9+" : unread}</Text>
          </View>
        )}
      </Pressable>

      {/* Notification panel as modal sheet */}
      <Modal
        visible={open}
        transparent
        animationType="none"
        onRequestClose={onClose}
        statusBarTranslucent
      >
        <Pressable style={s.backdrop} onPress={onClose} />
        <Animated.View
          style={[
            s.panel,
            { backgroundColor: colors.bg3, borderColor: colors.border2, opacity: fadeAnim },
          ]}
        >
          {/* Panel header */}
          <View style={[s.panelHead, { borderBottomColor: colors.border }]}>
            <View style={s.headLeft}>
              <Text style={[s.panelTitle, { color: colors.text }]}>Notifications</Text>
              {unread > 0 && (
                <View style={[s.unreadBadge, { backgroundColor: colors.accentDim }]}>
                  <Text style={[s.unreadText, { color: colors.accent }]}>{unread} unread</Text>
                </View>
              )}
            </View>
            <View style={s.headRight}>
              {notifs.length > 0 && (
                <Pressable onPress={onClear} hitSlop={8} style={s.headBtn}>
                  <Text style={[s.headBtnText, { color: colors.text3 }]}>Clear</Text>
                </Pressable>
              )}
              <Pressable onPress={onClose} hitSlop={8} style={s.headBtn}>
                <Ionicons name="close" size={18} color={colors.text2} />
              </Pressable>
            </View>
          </View>

          <ScrollView style={s.list} showsVerticalScrollIndicator={false}>
            {notifs.length === 0 ? (
              <View style={s.empty}>
                <Ionicons name="notifications-off-outline" size={36} color={colors.text4} />
                <Text style={[s.emptyTitle, { color: colors.text2 }]}>No notifications yet</Text>
                <Text style={[s.emptySub, { color: colors.text3 }]}>
                  Trade executions, budget warnings and agent events will appear here.
                </Text>
              </View>
            ) : (
              notifs.map((n, i) => (
                <Pressable
                  key={n.id}
                  onPress={() => { onMarkRead(n.id); if (n.link) openLink(n.link); }}
                  style={[
                    s.item,
                    !n.read && { backgroundColor: colors.accentDim },
                    i < notifs.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                  ]}
                >
                  <View style={[s.itemIco, { backgroundColor: colors.bgSoft2 }]}>
                    <Ionicons name={ICON[n.type] ?? "information-circle-outline"} size={16} color={n.read ? colors.text3 : colors.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={s.itemTop}>
                      <Text style={[s.itemTitle, { color: colors.text }]} numberOfLines={1}>{n.title}</Text>
                      <Text style={[s.itemTime, { color: colors.text3 }]}>{n.time}</Text>
                    </View>
                    <Text style={[s.itemBody, { color: colors.text2 }]} numberOfLines={2}>{n.body}</Text>
                    {n.link && (
                      <Text style={[s.itemLink, { color: colors.accent }]}>View on explorer →</Text>
                    )}
                  </View>
                </Pressable>
              ))
            )}
            <View style={{ height: 16 }} />
          </ScrollView>
        </Animated.View>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  bellBtn:    { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  badge:      { position: "absolute", top: 3, right: 3, minWidth: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center", paddingHorizontal: 3 },
  badgeText:  { color: "#fff", fontSize: 9, fontWeight: "700" },

  backdrop:   { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  panel:      { position: "absolute", top: 90, right: 12, width: 340, maxHeight: 460, borderRadius: 18, borderWidth: 1, overflow: "hidden", elevation: 24, shadowColor: "#000", shadowOpacity: 0.4, shadowRadius: 20, shadowOffset: { width: 0, height: 8 } },

  panelHead:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  headLeft:   { flexDirection: "row", alignItems: "center", gap: 8 },
  headRight:  { flexDirection: "row", alignItems: "center", gap: 4 },
  panelTitle: { fontSize: 15, fontWeight: "700" },
  unreadBadge:{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 100 },
  unreadText: { fontSize: 11, fontWeight: "700" },
  headBtn:    { padding: 4 },
  headBtnText:{ fontSize: 13 },

  list:       { maxHeight: 400 },
  item:       { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14 },
  itemIco:    { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 },
  itemTop:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 3 },
  itemTitle:  { fontSize: 13, fontWeight: "600", flex: 1 },
  itemTime:   { fontSize: 11, marginLeft: 8 },
  itemBody:   { fontSize: 13, lineHeight: 18 },
  itemLink:   { fontSize: 12, marginTop: 4, fontWeight: "500" },

  empty:      { paddingVertical: 40, alignItems: "center", gap: 8, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 15, fontWeight: "600" },
  emptySub:   { fontSize: 13, textAlign: "center", lineHeight: 19 },
});
