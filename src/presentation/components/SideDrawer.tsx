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
  { icon: '👤', label: '프로필',         route: '/profile' },
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
        Animated.timing(translateX, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(overlayOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, { toValue: -DRAWER_W, duration: 160, useNativeDriver: true }),
        Animated.timing(overlayOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
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
          <Text style={styles.drawerAppName}>Morning{'\n'}Pages</Text>
          <Text style={styles.drawerAppSub}>매일의 기록</Text>
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
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  drawer: {
    position: 'absolute',
    top: 0, left: 0, bottom: 0,
    width: DRAWER_W,
    backgroundColor: '#25282b',   // Ink — 다크 드로어
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 20,
  },
  drawerHeader: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  drawerAppName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  drawerAppSub: {
    fontSize: 12,
    fontWeight: '300',
    color: 'rgba(255,255,255,0.35)',
  },
  closeBtn:     { position: 'absolute', top: 56, right: 20, padding: 4 },
  closeBtnText: { fontSize: 18, color: 'rgba(255,255,255,0.5)' },

  menuList: { paddingTop: 8 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  menuIcon:          { fontSize: 18 },
  menuLabel:         { fontSize: 15, color: '#ffffff', fontWeight: '500' },
  menuItemDisabled:  { opacity: 0.3 },
  menuLabelDisabled: { color: 'rgba(255,255,255,0.4)' },
  menuSub:           { fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 },
  divider:           { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: 20, marginVertical: 6 },

  version: {
    position: 'absolute',
    bottom: 32,
    left: 20,
    fontSize: 11,
    color: 'rgba(255,255,255,0.2)',
    fontWeight: '600',
    letterSpacing: 1,
  },
});
