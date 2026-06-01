import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDiary } from '../../application/context/DiaryContext';
import { formatDate } from '../../utils/date';
import { Colors } from '../theme/colors';
import { Diary } from '../../domain/entities/Diary';

type Group = { month: string; data: Diary[] };

function formatMonth(ym: string) {
  const [year, month] = ym.split('-');
  return `${year}년 ${parseInt(month, 10)}월`;
}

export default function RecordsScreen() {
  const router = useRouter();
  const { diaries } = useDiary();

  // 날짜 내림차순 정렬
  const sorted = [...diaries].sort((a, b) => b.date.localeCompare(a.date));

  // 월별 그룹핑
  const groups: Group[] = [];
  for (const diary of sorted) {
    const month = diary.date.slice(0, 7); // 'YYYY-MM'
    const last  = groups[groups.length - 1];
    if (last && last.month === month) {
      last.data.push(diary);
    } else {
      groups.push({ month, data: [diary] });
    }
  }

  if (diaries.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>📖</Text>
        <Text style={styles.emptyText}>아직 작성한 일기가 없어요</Text>
      </View>
    );
  }

  const renderDiary = (diary: Diary) => (
    <TouchableOpacity
      key={diary.id}
      style={styles.item}
      onPress={() => router.push(`/diary/${diary.id}`)}
      activeOpacity={0.7}
    >
      <Text style={styles.itemMood}>{diary.mood ?? '📝'}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemDate}>{formatDate(diary.date)}</Text>
        <Text style={styles.itemContent} numberOfLines={1}>{diary.content}</Text>
      </View>
      {diary.favorite && <Text style={styles.star}>⭐</Text>}
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  const renderGroup = ({ item }: { item: Group }) => (
    <View>
      <View style={styles.monthRow}>
        <Text style={styles.monthHeader}>{formatMonth(item.month)}</Text>
        <Text style={styles.monthCount}>{item.data.length}편</Text>
      </View>
      {item.data.map(renderDiary)}
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      data={groups}
      keyExtractor={(item) => item.month}
      renderItem={renderGroup}
      contentContainerStyle={{ paddingBottom: 40 }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  monthHeader: { fontSize: 14, fontWeight: '700', color: Colors.text },
  monthCount:  { fontSize: 12, color: Colors.muted },

  item: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemMood:    { fontSize: 22 },
  itemDate:    { fontSize: 11, color: Colors.muted, marginBottom: 2 },
  itemContent: { fontSize: 14, color: Colors.text },
  star:        { fontSize: 14 },
  arrow:       { fontSize: 20, color: Colors.muted },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyEmoji: { fontSize: 44 },
  emptyText:  { fontSize: 15, color: Colors.muted },
});
