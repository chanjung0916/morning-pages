import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const NOTIFICATION_TIME_KEY = '@morning_pages:notification_time';
const DEFAULT_HOUR = 8;
const DEFAULT_MINUTE = 0;

// 알림 핸들러 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// 알림 권한 요청
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// 저장된 알림 시간 불러오기
export async function loadNotificationTime(): Promise<{ hour: number; minute: number }> {
  try {
    const json = await AsyncStorage.getItem(NOTIFICATION_TIME_KEY);
    if (json) return JSON.parse(json);
  } catch {}
  return { hour: DEFAULT_HOUR, minute: DEFAULT_MINUTE };
}

// 알림 시간 저장
export async function saveNotificationTime(hour: number, minute: number): Promise<void> {
  await AsyncStorage.setItem(NOTIFICATION_TIME_KEY, JSON.stringify({ hour, minute }));
}

// 매일 반복 알림 스케줄 등록
export async function scheduleDailyNotification(hour: number, minute: number): Promise<void> {
  if (Platform.OS === 'web') return;

  // 기존 알림 모두 취소
  await Notifications.cancelAllScheduledNotificationsAsync();

  const granted = await requestNotificationPermission();
  if (!granted) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '☀️ Morning Pages',
      body: '오늘 하루를 기록해볼까요?',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

// 알림 취소
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
