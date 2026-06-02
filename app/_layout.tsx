import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { DiaryProvider } from '../src/application/context/DiaryContext';
import { ThemeProvider } from '../src/application/context/ThemeContext';
import {
  loadNotificationTime,
  scheduleDailyNotification,
  requestNotificationPermission,
} from '../src/utils/notification';

export default function RootLayout() {
  useEffect(() => {
    (async () => {
      const granted = await requestNotificationPermission();
      if (granted) {
        const { hour, minute } = await loadNotificationTime();
        await scheduleDailyNotification(hour, minute);
      }
    })();
  }, []);

  return (
    <ThemeProvider>
    <DiaryProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="write"
          options={{ title: '일기 쓰기', presentation: 'modal' }}
        />
        <Stack.Screen
          name="diary/[id]"
          options={{ title: '일기 보기' }}
        />
        <Stack.Screen
          name="records"
          options={{ title: '과거 일기 기록' }}
        />
        <Stack.Screen
          name="favorites"
          options={{ title: '즐겨찾기' }}
        />
        <Stack.Screen
          name="calendar"
          options={{ title: '캘린더' }}
        />
        <Stack.Screen
          name="settings"
          options={{ title: '설정' }}
        />
      </Stack>
    </DiaryProvider>
    </ThemeProvider>
  );
}
