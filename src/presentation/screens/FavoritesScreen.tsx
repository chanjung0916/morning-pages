import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDiary } from '../../application/context/DiaryContext';
import { formatDate } from '../../utils/date';
import { Colors } from '../theme/colors';
import { Diary } from '../../domain/entities/Diary';

export default function FavoritesScreen() {
  const router = useRouter();
  const { diaries } = useDiary();

  const favorites = [...diaries]
    .filter((d) => d.favorite)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (favorites.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>⭐</Text>
        <Text style={styles.emptyTitle}>즐겨찾기한 일기가 없어요</Text>
        <Text style={styles.emptySub}>
          일기 상세 화면에서 ☆ 를 눌러{'\n'}즐겨찾기에 추가해보세요
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Diary }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => router.push(`/diary/${item.id}`)}
      activeOpacity={0.7}
    >
      <Text style={styles.itemMood}>{item.mood ?? '📝'}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemDate}>{formatDate(item.date)}</Text>
        <Text style={styles.itemContent} numberOfLines={2}>{item.content}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      style={styles.container}
      data={favorites}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={
        <Text style={styles.header}>⭐ {favorites.length}개의 즐겨찾기</Text>
      }
      contentContainerStyle={{ paddingBottom: 40 }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.muted,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },

  item: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  itemMood:    { fontSize: 22 },
  itemDate:    { fontSize: 11, color: Colors.muted, marginBottom: 2 },
  itemContent: { fontSize: 14, color: Colors.text, lineHeight: 20 },
  arrow:       { fontSize: 20, color: Colors.muted },

  empty: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    gap: 12, padding: 32,
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  emptySub:   { fontSize: 13, color: Colors.muted, textAlign: 'center', lineHeight: 22 },
});
