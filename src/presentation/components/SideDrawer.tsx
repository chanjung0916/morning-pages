import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Pressable, useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';

interface MenuItem {
  icon: string;
  label: string;
  route?: string;
  onPress?: () => void;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onTopicPrompt: () => void;
}

const MENU_ITEMS: MenuItem[] = [
  { icon: '📅', label: '캘린더',         route: '/calendar' },
  { icon: '📚', label: '과거 일기 기록', route: '/records' },
  { icon: '⭐', label: '즐겨찾기',       route: '/favorites' },
  { icon: '👤', label: '프로필',         route: undefined },
  { icon: '⚙️', label: '설정',          route: '/settings' },
];

const DRAWER_W = 260;

export default function SideDrawer({ visible, onClose, onTopicPrompt }: Props) {
  const { width } = useWindowDimensions();
  const translateX = useRef(new Animated.Value(-DRAWER_W)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }),
        Animated.timing(overlayOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, { toValue: -DRAWER_W, duration: 220, useNativeDriver: true }),
        Animated.timing(overlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible && (translateX as any)._value === -DRAWER_W) return null;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents={visible ? 'auto' : 'none'}>
      {/* 어두운 오버레이 */}
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
      </Animated.View>

      {/* 드로어 패널 */}
      <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
        {/* 앱 이름 헤더 */}
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerAppName}>Morning Pages ☀️</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* 메뉴 항목 */}
        <View style={styles.menuList}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, !item.route && styles.menuItemDisabled]}
              onPress={() => {
                if (!item.route) return;
                onClose();
                router.push(item.route as any);
              }}
              activeOpacity={item.route ? 0.7 : 1}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={[styles.menuLabel, !item.route && styles.menuLabelDisabled]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}

          {/* 구분선 */}
          <View style={styles.divider} />

          {/* 주제 프롬프트 생성 (임시 기능) */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => { onClose(); onTopicPrompt(); }}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>✨</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>주제 프롬프트 생성</Text>
              <Text style={styles.menuSub}>AI에게 보낼 주제 생성 프롬프트</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 하단 버전 */}
        <Text style={styles.version}>v1.0.0</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  drawer: {
    position: 'absolute',
    top: 0, left: 0, bottom: 0,
    width: DRAWER_W,
    backgroundColor: '#FFFBF5',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5E4',
  },
  drawerAppName: { fontSize: 17, fontWeight: '700', color: '#1C1917' },
  closeBtn: { padding: 4 },
  closeBtnText: { fontSize: 16, color: '#78716C' },
  menuList: { paddingTop: 12 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 15,
    paddingHorizontal: 22,
  },
  menuIcon:         { fontSize: 20 },
  menuLabel:        { fontSize: 16, color: '#1C1917', fontWeight: '500' },
  menuItemDisabled: { opacity: 0.35 },
  menuLabelDisabled:{ color: '#A8A29E' },
  menuSub:   { fontSize: 12, color: '#A8A29E', marginTop: 2 },
  divider:   { height: 1, backgroundColor: '#E7E5E4', marginHorizontal: 22, marginVertical: 8 },
  version: { position: 'absolute', bottom: 32, left: 22, fontSize: 12, color: '#A8A29E' },
});
