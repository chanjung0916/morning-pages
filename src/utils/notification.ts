import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const NOTIFICATION_TIME_KEY = '@morning_pages:notification_time';
const DEFAULT_HOUR   = 8;
const DEFAULT_MINUTE = 0;

/**
 * Expo Go(SDK 53+)에서는 expo-notifications 모듈 로드 자체가
 * 원격 푸시 경고를 발생시키므로 동적 import로 우회.
 */
const isExpoGo = Constants.appOwnership === 'expo';

async function getNotifications() {
  if (isExpoGo) return null;
  return await import('expo-notifications');
}

// 앱 시작 시 알림 핸들러 초기화 (Expo Go에서는 skip)
(async () => {
  const N = await getNotifications();
  if (!N) return;
  N.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
})();

// 알림 권한 요청
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const N = await getNotifications();
  if (!N) return false;

  try {
    const { status: existing } = await N.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await N.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
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
  const N = await getNotifications();
  if (!N) return;

  try {
    await N.cancelAllScheduledNotificationsAsync();

    const granted = await requestNotificationPermission();
    if (!granted) return;

    await N.scheduleNotificationAsync({
      content: {
        title: '☀️ Morning Pages',
        body: '오늘 하루를 기록해볼까요?',
        sound: true,
      },
      trigger: {
        type: N.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  } catch {}
}

// 알림 취소
export async function cancelAllNotifications(): Promise<void> {
  const N = await getNotifications();
  if (!N) return;
  try {
    await N.cancelAllScheduledNotificationsAsync();
  } catch {}
}
