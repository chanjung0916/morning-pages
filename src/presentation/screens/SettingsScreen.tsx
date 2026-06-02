import React, { useState, useEffect } from 'react';
import {
  View, Text, Switch, TouchableOpacity,
  StyleSheet, ScrollView, Platform, Alert,
} from 'react-native';
import {
  loadNotificationTime,
  saveNotificationTime,
  scheduleDailyNotification,
  cancelAllNotifications,
  requestNotificationPermission,
} from '../../utils/notification';
import { useTheme, FontSize } from '../../application/context/ThemeContext';
import { CustomTopicRepository, CustomTopic } from '../../data/repositories/CustomTopicRepository';

const topicRepo = new CustomTopicRepository();

export default function SettingsScreen() {
  const { isDark, fontSize, colors, fontScale, toggleDark, setFontSize } = useTheme();

  // 알림
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(0);
  const [timeSaved, setTimeSaved] = useState(false);

  // 저장된 주제
  const [topics, setTopics] = useState<CustomTopic[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const time = await loadNotificationTime();
      setHour(time.hour);
      setMinute(time.minute);
      if (Platform.OS !== 'web') {
        const { status } = await (await import('expo-notifications')).getPermissionsAsync();
        setNotifEnabled(status === 'granted');
      }
      const all = await topicRepo.findAll();
      setTopics(all);
    })();
  }, []);

  // ── 알림 ──────────────────────────────────────
  const handleNotifToggle = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) { Alert.alert('알림 권한 필요', '설정에서 알림 권한을 허용해주세요.'); return; }
      await scheduleDailyNotification(hour, minute);
    } else {
      await cancelAllNotifications();
    }
    setNotifEnabled(value);
  };

  const handleTimeSave = async () => {
    await saveNotificationTime(hour, minute);
    if (notifEnabled) await scheduleDailyNotification(hour, minute);
    setTimeSaved(true);
    setTimeout(() => setTimeSaved(false), 2000);
  };

  // ── 저장된 주제 삭제 ──────────────────────────
  const handleDeleteTopic = (id: string) => {
    Alert.alert('주제 삭제', '이 주제를 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제', style: 'destructive',
        onPress: async () => {
          const all = await topicRepo.findAll();
          const filtered = all.filter(t => t.id !== id);
          const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
          await AsyncStorage.setItem('@morning_pages:custom_topics', JSON.stringify(filtered));
          setTopics(filtered);
        },
      },
    ]);
  };

  // ── 카테고리 그룹핑 ────────────────────────────
  const categories = [...new Set(topics.map(t => t.category).filter(Boolean))];

  const s = makeStyles(colors, fontScale);

  return (
    <ScrollView style={[s.container]} contentContainerStyle={s.content}>

      {/* ── 알림 ── */}
      <Text style={s.sectionTitle}>알림</Text>
      <View style={s.card}>
        <View style={s.row}>
          <View>
            <Text style={s.rowLabel}>매일 알림</Text>
            <Text style={s.rowSub}>설정한 시간에 일기 작성 알림</Text>
          </View>
          <Switch value={notifEnabled} onValueChange={handleNotifToggle}
            trackColor={{ true: colors.accent }} thumbColor="#fff" />
        </View>

        {notifEnabled && (
          <View style={s.timeSection}>
            <Text style={s.rowSub}>알림 시간</Text>
            <View style={s.timePicker}>
              <View style={s.timeUnit}>
                <TouchableOpacity style={s.timeBtn} onPress={() => setHour(h => (h + 1) % 24)}>
                  <Text style={s.timeBtnText}>▲</Text>
                </TouchableOpacity>
                <Text style={s.timeValue}>{String(hour).padStart(2, '0')}</Text>
                <TouchableOpacity style={s.timeBtn} onPress={() => setHour(h => (h - 1 + 24) % 24)}>
                  <Text style={s.timeBtnText}>▼</Text>
                </TouchableOpacity>
              </View>
              <Text style={s.timeSep}>:</Text>
              <View style={s.timeUnit}>
                <TouchableOpacity style={s.timeBtn} onPress={() => setMinute(m => (m + 5) % 60)}>
                  <Text style={s.timeBtnText}>▲</Text>
                </TouchableOpacity>
                <Text style={s.timeValue}>{String(minute).padStart(2, '0')}</Text>
                <TouchableOpacity style={s.timeBtn} onPress={() => setMinute(m => (m - 5 + 60) % 60)}>
                  <Text style={s.timeBtnText}>▼</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity style={s.saveBtn} onPress={handleTimeSave}>
              <Text style={s.saveBtnText}>{timeSaved ? '✓ 저장됐습니다!' : '알림 시간 저장'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── 화면 설정 ── */}
      <Text style={s.sectionTitle}>화면</Text>
      <View style={s.card}>

        {/* 다크모드 */}
        <View style={s.row}>
          <View>
            <Text style={s.rowLabel}>다크 모드</Text>
            <Text style={s.rowSub}>어두운 화면으로 전환</Text>
          </View>
          <Switch value={isDark} onValueChange={toggleDark}
            trackColor={{ true: colors.accent }} thumbColor="#fff" />
        </View>

        {/* 폰트 크기 */}
        <View style={[s.row, { flexDirection: 'column', alignItems: 'flex-start', gap: 12 }]}>
          <Text style={s.rowLabel}>글씨 크기</Text>
          <View style={s.fontRow}>
            {(['small', 'medium', 'large'] as FontSize[]).map((size) => (
              <TouchableOpacity
                key={size}
                style={[s.fontBtn, fontSize === size && s.fontBtnActive]}
                onPress={() => setFontSize(size)}
              >
                <Text style={[s.fontBtnText, fontSize === size && s.fontBtnTextActive]}>
                  {size === 'small' ? '작게' : size === 'medium' ? '보통' : '크게'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* ── 저장된 주제 관리 ── */}
      <Text style={s.sectionTitle}>저장된 주제</Text>
      <View style={s.card}>
        {categories.length === 0 ? (
          <View style={s.emptyBox}>
            <Text style={s.emptyText}>저장된 주제가 없어요</Text>
            <Text style={s.rowSub}>홈 화면에서 주제를 생성해보세요</Text>
          </View>
        ) : (
          categories.map((cat) => {
            const catTopics = topics.filter(t => t.category === cat);
            const isOpen = expandedCategory === cat;
            return (
              <View key={cat}>
                {/* 카테고리 헤더 */}
                <TouchableOpacity
                  style={s.catHeader}
                  onPress={() => setExpandedCategory(isOpen ? null : cat)}
                >
                  <View>
                    <Text style={s.catTitle}>{cat}</Text>
                    <Text style={s.rowSub}>{catTopics.length}개의 주제</Text>
                  </View>
                  <Text style={[s.rowSub, { fontSize: 18 }]}>{isOpen ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                {/* 주제 목록 */}
                {isOpen && catTopics.map((topic) => (
                  <View key={topic.id} style={s.topicRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.topicTitle}>{topic.topic}</Text>
                      <Text style={s.rowSub} numberOfLines={1}>
                        {topic.prompts.join(' · ')}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={s.deleteBtn}
                      onPress={() => handleDeleteTopic(topic.id)}
                    >
                      <Text style={s.deleteBtnText}>삭제</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            );
          })
        )}
      </View>

      {/* ── 앱 정보 ── */}
      <Text style={s.sectionTitle}>앱 정보</Text>
      <View style={s.card}>
        <View style={s.row}>
          <Text style={s.rowLabel}>버전</Text>
          <Text style={s.rowSub}>v1.0.0</Text>
        </View>
        <View style={[s.row, { borderBottomWidth: 0 }]}>
          <Text style={s.rowLabel}>저장 방식</Text>
          <Text style={s.rowSub}>기기 로컬 (오프라인)</Text>
        </View>
      </View>

    </ScrollView>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors'], fontScale: ReturnType<typeof useTheme>['fontScale']) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 20, paddingBottom: 40, gap: 8 },

    sectionTitle: {
      fontSize: fontScale.xs,
      fontWeight: '700',
      color: colors.accent,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      marginTop: 16,
      marginBottom: 6,
      paddingHorizontal: 4,
    },

    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },

    rowLabel: { fontSize: fontScale.md, color: colors.text, fontWeight: '500' },
    rowSub:   { fontSize: fontScale.sm, color: colors.subText, marginTop: 2 },

    // 알림 시간
    timeSection: { padding: 16, alignItems: 'center', gap: 16 },
    timePicker:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
    timeUnit:    { alignItems: 'center', gap: 8 },
    timeBtn: {
      width: 44, height: 36,
      backgroundColor: colors.border,
      borderRadius: 8, alignItems: 'center', justifyContent: 'center',
    },
    timeBtnText: { fontSize: fontScale.sm, color: colors.subText },
    timeValue:   { fontSize: 36, fontWeight: '700', color: colors.text, width: 64, textAlign: 'center' },
    timeSep:     { fontSize: 32, fontWeight: '700', color: colors.text, marginTop: -8 },
    saveBtn: {
      backgroundColor: colors.accent, borderRadius: 10,
      paddingVertical: 12, alignSelf: 'stretch', alignItems: 'center',
    },
    saveBtnText: { fontSize: fontScale.md, fontWeight: '700', color: '#fff' },

    // 폰트 크기
    fontRow: { flexDirection: 'row', gap: 8 },
    fontBtn: {
      flex: 1, paddingVertical: 10,
      borderRadius: 8, borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
    },
    fontBtnActive:     { borderColor: colors.accent, backgroundColor: colors.accent + '18' },
    fontBtnText:       { fontSize: fontScale.sm, color: colors.subText, fontWeight: '600' },
    fontBtnTextActive: { color: colors.accent },

    // 저장된 주제
    emptyBox: { padding: 24, alignItems: 'center', gap: 6 },
    emptyText: { fontSize: fontScale.md, color: colors.subText },

    catHeader: {
      flexDirection: 'row', alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    catTitle: { fontSize: fontScale.md, fontWeight: '700', color: colors.text },

    topicRow: {
      flexDirection: 'row', alignItems: 'center',
      paddingVertical: 12, paddingHorizontal: 16,
      borderBottomWidth: 1, borderBottomColor: colors.border,
      gap: 12,
    },
    topicTitle: { fontSize: fontScale.sm, fontWeight: '600', color: colors.text, marginBottom: 2 },

    deleteBtn: {
      paddingHorizontal: 12, paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: '#FEE2E2',
    },
    deleteBtnText: { fontSize: fontScale.xs, fontWeight: '700', color: '#DC2626' },
  });
}
