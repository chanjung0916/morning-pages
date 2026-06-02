import { Stack } from 'expo-router';
import { DiaryProvider } from '../src/application/context/DiaryContext';

export default function RootLayout() {
  return (
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
      </Stack>
    </DiaryProvider>
  );
}
