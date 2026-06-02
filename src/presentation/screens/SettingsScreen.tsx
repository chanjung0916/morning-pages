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

export default function SettingsScreen() {
  const [enabled, setEnabled] = useState(false);
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const time = await loadNotificationTime();
      setHour(time.hour);
      setMinute(time.minute);

      if (Platform.OS !== 'web') {
        const { status } = await import('expo-notifications')
          .then(n => n.getPermissionsAsync());
        setEnabled(status === 'granted');
      }
    })();
  }, []);

  const handleToggle = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert('알림 권한 필요', '설정에서 알림 권한을 허용해주세요.');
        return;
      }
      await scheduleDailyNotification(hour, minute);
    } else {
      await cancelAllNotifications();
    }
    setEnabled(value);
  };

  const handleSave = async () => {
    await saveNotificationTime(hour, minute);
    if (enabled) {
      await scheduleDailyNotification(hour, minute);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const adjustHour = (delta: number) => {
    setHour(h => (h + delta + 24) % 24);
  };

  const adjustMinute = (delta: number) => {
    setMinute(m => (m + delta + 60) % 60);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* 알림 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>알림</Text>

        {/* 알림 ON/OFF */}
        <View style={styles.row}>
          <View>
            <Text style={styles.rowLabel}>매일 알림</Text>
            <Text style={styles.rowSub}>설정한 시간에 일기 작성 알림</Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={handleToggle}
            trackColor={{ true: '#CC785C' }}
            thumbColor="#fff"
          />
        </View>

        {/* 시간 선택 */}
        {enabled && (
          <View style={styles.timeSection}>
            <Text style={styles.timeLabel}>알림 시간</Text>

            <View style={styles.timePicker}>
              {/* 시 */}
              <View style={styles.timeUnit}>
                <TouchableOpacity style={styles.timeBtn} onPress={() => adjustHour(1)}>
                  <Text style={styles.timeBtnText}>▲</Text>
                </TouchableOpacity>
                <Text style={styles.timeValue}>
                  {String(hour).padStart(2, '0')}
                </Text>
                <TouchableOpacity style={styles.timeBtn} onPress={() => adjustHour(-1)}>
                  <Text style={styles.timeBtnText}>▼</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.timeSep}>:</Text>

              {/* 분 */}
              <View style={styles.timeUnit}>
                <TouchableOpacity style={styles.timeBtn} onPress={() => adjustMinute(5)}>
                  <Text style={styles.timeBtnText}>▲</Text>
                </TouchableOpacity>
                <Text style={styles.timeValue}>
                  {String(minute).padStart(2, '0')}
                </Text>
                <TouchableOpacity style={styles.timeBtn} onPress={() => adjustMinute(-5)}>
                  <Text style={styles.timeBtnText}>▼</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 저장 버튼 */}
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>
                {saved ? '✓ 저장됐습니다!' : '알림 시간 저장'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 앱 정보 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>앱 정보</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>버전</Text>
          <Text style={styles.rowSub}>v1.0.0</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>저장 방식</Text>
          <Text style={styles.rowSub}>기기 로컬 저장 (오프라인)</Text>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F5' },
  content: { padding: 20, gap: 24 },

  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CC785C',
    padding: 16,
    paddingBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F0EC',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F0EC',
  },

  rowLabel: { fontSize: 15, color: '#1C1917', fontWeight: '500' },
  rowSub:   { fontSize: 13, color: '#78716C', marginTop: 2 },

  timeSection: {
    padding: 16,
    alignItems: 'center',
    gap: 16,
  },

  timeLabel: {
    fontSize: 13,
    color: '#78716C',
    alignSelf: 'flex-start',
  },

  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  timeUnit: { alignItems: 'center', gap: 8 },

  timeBtn: {
    width: 44,
    height: 36,
    backgroundColor: '#F3F0EC',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  timeBtnText: { fontSize: 14, color: '#78716C' },

  timeValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1C1917',
    width: 64,
    textAlign: 'center',
  },

  timeSep: { fontSize: 32, fontWeight: '700', color: '#1C1917', marginTop: -8 },

  saveBtn: {
    backgroundColor: '#CC785C',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignSelf: 'stretch',
    alignItems: 'center',
  },

  saveBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
