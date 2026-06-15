import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Animated,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useDiary } from '../../application/context/DiaryContext';
import { useTheme } from '../../application/context/ThemeContext';
import { formatDate } from '../../utils/date';
import { Diary } from '../../domain/entities/Diary';
import { CustomTopicRepository, CustomTopic } from '../../data/repositories/CustomTopicRepository';

const topicRepo = new CustomTopicRepository();

type DiaryFilter = 'all' | string;

export default function FavoritesScreen() {
  const router = useRouter();
  const { diaries } = useDiary();
  const { colors } = useTheme();

  const [allTopics,   setAllTopics]   = useState<CustomTopic[]>([]);
  const [categories,  setCategories]  = useState<string[]>([]);
  const [topicMap,    setTopicMap]    = useState<Record<string, string>>({});
  const [filter,      setFilter]      = useState<DiaryFilter>('all');
  const [filterOpen,  setFilterOpen]  = useState(false);
  const [filterBtnY,  setFilterBtnY]  = useState(0);
  const filterBtnRef = useRef<View>(null);
  const filterAnim   = useRef(new Animated.Value(0)).current;

  useFocusEffect(useCallback(() => {
    topicRepo.findAll().then((topics: CustomTopic[]) => {
      const map: Record<string, string> = {};
      topics.forEach((t) => { map[t.id] = t.topic; });
      setTopicMap(map);
      setAllTopics(topics);
      setCategories([...new Set(topics.map((t) => t.category).filter(Boolean))]);
    });
  }, []));

  const filterOptions = [
    { key: 'all', label: '전체' },
    ...categories.map((cat) => ({ key: cat, label: cat })),
  ];

  const toggleFilter = () => {
    const toValue = filterOpen ? 0 : 1;
    setFilterOpen(!filterOpen);
    Animated.spring(filterAnim, { toValue, useNativeDriver: true, tension: 80, friction: 10 }).start();
  };

  const selectFilter = (key: string) => {
    setFilter(key);
    setFilterOpen(false);
    Animated.spring(filterAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }).start();
  };

  const filterLabel = filterOptions.find((o) => o.key === filter)?.label ?? '전체';

  const favorites = [...diaries]
    .filter((d) => d.favorite)
    .filter((d) => {
      if (filter === 'all') return true;
      const ids = allTopics.filter((t) => t.category === filter).map((t) => t.id);
      return !!d.topicId && ids.includes(d.topicId);
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const allFavorites = diaries.filter((d) => d.favorite);
  const s = makeStyles(colors);

  if (allFavorites.length === 0) {
    return (
      <View style={s.empty}>
        <Text style={s.emptyEmoji}>★</Text>
        <Text style={s.emptyTitle}>즐겨찾기한 일기가 없어요</Text>
        <Text style={s.emptySub}>
          일기 상세 화면에서 ☆ 를 탭해{'\n'}즐겨찾기에 추가해보세요
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Diary }) => {
    const topicName = item.topicId ? topicMap[item.topicId] : undefined;
    return (
      <TouchableOpacity
        style={s.item}
        onPress={() => router.push(`/diary/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={{ flex: 1 }}>
          <View style={s.itemTopRow}>
            <Text style={s.itemDate}>{formatDate(item.date)}</Text>
            {topicName && (
              <View style={s.topicBadge}>
                <Text style={s.topicText}>{topicName}</Text>
              </View>
            )}
          </View>
          <Text style={s.itemContent} numberOfLines={2}>{item.content}</Text>
        </View>
        <Text style={s.arrow}>›</Text>
      </TouchableOpacity>
    );
  };

  const ListHeader = (
    <View style={s.filterRow}>
      <TouchableOpacity
        ref={filterBtnRef}
        style={s.filterBtn}
        onPress={() => {
          filterBtnRef.current?.measureInWindow((_x, y, _w, h) => {
            setFilterBtnY(y + h + 4);
          });
          toggleFilter();
        }}
        activeOpacity={0.7}
      >
        <Text style={s.sectionTitle}>
          {filter === 'all' ? '전체' : filterLabel}
        </Text>
        <Text style={s.filterChevron}>{filterOpen ? ' ▲' : ' ▼'}</Text>
      </TouchableOpacity>
      <Text style={s.filterCount}>{favorites.length}편</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        style={s.container}
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <View style={s.emptyFiltered}>
            <Text style={s.emptyFilteredText}>'{filterLabel}' 조건에 맞는 일기가 없어요</Text>
            <TouchableOpacity style={s.resetBtn} onPress={() => selectFilter('all')}>
              <Text style={s.resetBtnText}>전체 보기</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      {/* 필터 플로팅 패널 */}
      {filterOpen && (
        <>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            onPress={() => selectFilter(filter)}
            activeOpacity={0}
          />
          <Animated.View
            style={[
              s.filterPanel,
              {
                top: filterBtnY,
                opacity: filterAnim,
                transform: [{
                  translateY: filterAnim.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }),
                }],
              },
            ]}
          >
            {filterOptions.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[s.filterChip, filter === opt.key && s.filterChipActive]}
                onPress={() => selectFilter(opt.key)}
              >
                <Text style={[s.filterChipText, filter === opt.key && s.filterChipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </>
      )}
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },

    filterRow: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4,
    },
    filterBtn:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 2 },
    sectionTitle: { fontSize: 11, fontWeight: '800', color: colors.accent, letterSpacing: 1, textTransform: 'uppercase' },
    filterChevron:{ fontSize: 11, color: colors.accent, fontWeight: '700' },
    filterCount:  { fontSize: 12, color: colors.subText },

    filterPanel: {
      position: 'absolute', left: 16,
      backgroundColor: colors.bg, borderRadius: 6,
      padding: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 8,
      shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 }, elevation: 10,
      zIndex: 999, minWidth: 260,
      borderWidth: 1, borderColor: colors.border,
    },
    filterChip: {
      paddingHorizontal: 14, paddingVertical: 7,
      borderRadius: 32, borderWidth: 1.5,
      borderColor: colors.border, backgroundColor: colors.bg,
    },
    filterChipActive:     { borderColor: colors.accent, backgroundColor: colors.accent + '18' },
    filterChipText:       { fontSize: 13, color: colors.subText, fontWeight: '600' },
    filterChipTextActive: { color: colors.accent },

    item: {
      backgroundColor: colors.card,
      marginHorizontal: 16, marginBottom: 8, borderRadius: 6,
      padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12,
      borderWidth: 1, borderColor: colors.border,
      borderLeftWidth: 3, borderLeftColor: colors.accent,
    },
    itemTopRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
    itemDate:    { fontSize: 11, color: colors.subText },
    topicBadge:  { backgroundColor: colors.accent + '22', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 },
    topicText:   { fontSize: 10, color: colors.accent, fontWeight: '600' },
    itemContent: { fontSize: 14, color: colors.text, lineHeight: 20 },
    arrow:       { fontSize: 20, color: colors.subText },

    empty:         { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 32 },
    emptyEmoji:    { fontSize: 48, color: colors.accent },
    emptyTitle:    { fontSize: 16, fontWeight: '700', color: colors.text },
    emptySub:      { fontSize: 13, color: colors.subText, textAlign: 'center', lineHeight: 22 },

    emptyFiltered:     { alignItems: 'center', paddingTop: 48, gap: 12 },
    emptyFilteredText: { fontSize: 15, color: colors.subText },
    resetBtn:          { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 60, borderWidth: 1.5, borderColor: colors.accent },
    resetBtnText:      { fontSize: 13, color: colors.accent, fontWeight: '700' },
  });
}
