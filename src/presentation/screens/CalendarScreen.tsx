import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { useDiary } from '../../application/context/DiaryContext';
import { useTheme } from '../../application/context/ThemeContext';
import { today } from '../../utils/date';

export default function CalendarScreen() {
  const router = useRouter();
  const { diaries } = useDiary();
  const { colors, isDark } = useTheme();

  const markedDates = useMemo(() => {
    const marks: Record<string, { marked: boolean; dotColor: string }> = {};
    diaries.forEach((d) => {
      marks[d.date] = { marked: true, dotColor: colors.accent };
    });
    return marks;
  }, [diaries, colors.accent]);

  const handleDayPress = (day: { dateString: string }) => {
    const diary = diaries.find((d) => d.date === day.dateString);
    if (diary) router.push(`/diary/${diary.id}`);
    else if (day.dateString <= today()) router.push(`/write?date=${day.dateString}`);
  };

  const s = makeStyles(colors);

  return (
    <View style={s.container}>
      {/* 캘린더 */}
      <View style={s.calendarWrap}>
        <Calendar
          markedDates={markedDates}
          onDayPress={handleDayPress}
          maxDate={today()}
          theme={{
            backgroundColor:            colors.bg,
            calendarBackground:         colors.bg,
            selectedDayBackgroundColor: colors.accent,
            selectedDayTextColor:       '#ffffff',
            todayTextColor:             colors.accent,
            dayTextColor:               colors.text,
            textDisabledColor:          colors.subText,
            dotColor:                   colors.accent,
            selectedDotColor:           '#ffffff',
            arrowColor:                 colors.accent,
            monthTextColor:             colors.text,
            textDayFontWeight:          '400',
            textMonthFontWeight:        '800',
            textDayHeaderFontWeight:    '600',
            textMonthFontSize:          16,
          }}
        />
      </View>

      {/* 범례 */}
      <View style={s.legend}>
        <View style={s.legendItem}>
          <View style={s.dot} />
          <Text style={s.legendText}>일기가 있는 날</Text>
        </View>
        <Text style={s.legendSub}>날짜를 탭하면 일기를 보거나 새로 작성할 수 있어요</Text>
      </View>
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },

    calendarWrap: { borderBottomWidth: 1, borderBottomColor: colors.border },

    legend:     { padding: 20, gap: 8 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    dot:        { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
    legendText: { fontSize: 13, fontWeight: '600', color: colors.text },
    legendSub:  { fontSize: 12, color: colors.subText, lineHeight: 18 },
  });
}
