import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { DiaryProvider } from '../src/application/context/DiaryContext';
import { ThemeProvider, useTheme } from '../src/application/context/ThemeContext';
import {
  loadNotificationTime,
  scheduleDailyNotification,
  requestNotificationPermission,
} from '../src/utils/notification';
import { seedDummyData } from '../src/utils/seedData';

const HEADER_STYLE = {
  headerStyle:         { backgroundColor: '#25282b' },
  headerTintColor:     '#ffffff',
  headerTitleStyle:    { fontWeight: '700' as const, fontSize: 15, letterSpacing: 0.5 },
  headerShadowVisible: false,
};

function AppStack() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: '#25282b' }}>
      <Stack screenOptions={{ contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="(tabs)"     options={{ headerShown: false }} />
        <Stack.Screen name="write"      options={{ ...HEADER_STYLE, title: '일기 쓰기' }} />
        <Stack.Screen name="diary/[id]" options={{ ...HEADER_STYLE, title: '' }} />
        <Stack.Screen name="records"    options={{ ...HEADER_STYLE, title: '과거 일기 기록' }} />
        <Stack.Screen name="favorites"  options={{ ...HEADER_STYLE, title: '즐겨찾기' }} />
        <Stack.Screen name="calendar"   options={{ ...HEADER_STYLE, title: '캘린더' }} />
        <Stack.Screen name="settings"   options={{ ...HEADER_STYLE, title: '설정' }} />
        <Stack.Screen name="profile"    options={{ ...HEADER_STYLE, title: '프로필' }} />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  useEffect(() => {
    (async () => {
      // 알림 초기화
      const granted = await requestNotificationPermission();
      if (granted) {
        const { hour, minute } = await loadNotificationTime();
        await scheduleDailyNotification(hour, minute);
      }

      // 첫 실행 시 더미 데이터 자동 삽입
      const existing = await AsyncStorage.getItem('@morning_pages:diaries');
      const parsed   = existing ? JSON.parse(existing) : [];
      if (!existing || parsed.length === 0) {
        await seedDummyData();
      }
    })();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <ThemeProvider>
        <DiaryProvider>
          <AppStack />
        </DiaryProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
