import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { useDiary } from '../../application/context/DiaryContext';
import { Colors } from '../theme/colors';
import { today } from '../../utils/date';

export default function CalendarScreen() {
  const router = useRouter();
  const { diaries } = useDiary();

  // 일기 작성일을 캘린더 마크 형식으로 변환
  const markedDates = useMemo(() => {
    const marks: Record<string, { marked: boolean; dotColor: string }> = {};
    diaries.forEach((d) => {
      marks[d.date] = { marked: true, dotColor: Colors.primary };
    });
    return marks;
  }, [diaries]);

  const handleDayPress = async (day: { dateString: string }) => {
    const diary = diaries.find((d) => d.date === day.dateString);
    if (diary) {
      router.push(`/diary/${diary.id}`);
    } else if (day.dateString <= today()) {
      router.push(`/write?date=${day.dateString}`);
    }
  };

  return (
    <View style={styles.container}>
      <Calendar
        markedDates={markedDates}
        onDayPress={handleDayPress}
        maxDate={today()}
        theme={{
          backgroundColor: Colors.background,
          calendarBackground: Colors.background,
          selectedDayBackgroundColor: Colors.primary,
          todayTextColor: Colors.primary,
          dotColor: Colors.primary,
          arrowColor: Colors.primary,
        }}
      />

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={styles.dot} />
          <Text style={styles.legendText}>일기가 있는 날</Text>
        </View>
        <Text style={styles.legendText}>날짜를 탭하면 일기를 보거나 새로 작성할 수 있어요</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  legend: { padding: 20, gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  legendText: { fontSize: 13, color: Colors.muted },
});
