import React, { useRef, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Animated, ScrollView,
} from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useDiary } from '../../application/context/DiaryContext';
import { useTheme } from '../../application/context/ThemeContext';
import { formatDate } from '../../utils/date';
import { Diary } from '../../domain/entities/Diary';
import { CustomTopicRepository, CustomTopic } from '../../data/repositories/CustomTopicRepository';

const topicRepo = new CustomTopicRepository();

type Group = { month: string; data: Diary[] };

function formatMonth(ym: string) {
  const [year, month] = ym.split('-');
  return `${year}년 ${parseInt(month, 10)}월`;
}

export default function RecordsScreen() {
  const router = useRouter();
  const { diaries } = useDiary();
  const { colors } = useTheme();
  const listRef    = useRef<FlatList>(null);
  const scrollY    = useRef(0);
  const btnAnim    = useRef(new Animated.Value(0)).current;
  const panelAnim  = useRef(new Animated.Value(0)).current;

  const [btnVisible,    setBtnVisible]    = useState(false);
  const [topicMap,      setTopicMap]      = useState<Record<string, string>>({});
  const [panelOpen,     setPanelOpen]     = useState(false);
  const [selectedYear,  setSelectedYear]  = useState<string>('전체');
  const [selectedMonth, setSelectedMonth] = useState<string>('전체');

  useFocusEffect(useCallback(() => {
    topicRepo.findAll().then((topics: CustomTopic[]) => {
      const map: Record<string, string> = {};
      topics.forEach((t) => { map[t.id] = t.topic; });
      setTopicMap(map);
    });
  }, []));

  // 연도 목록
  const years = ['전체', ...Array.from(
    new Set(diaries.map((d) => d.date.slice(0, 4)))
  ).sort((a, b) => b.localeCompare(a))];

  // 선택된 연도의 월 목록
  const months = selectedYear === '전체' ? [] : [
    '전체',
    ...Array.from(
      new Set(
        diaries
          .filter((d) => d.date.startsWith(selectedYear))
          .map((d) => d.date.slice(5, 7))
      )
    ).sort().map((m) => `${parseInt(m, 10)}월`),
  ];

  const togglePanel = () => {
    const toValue = panelOpen ? 0 : 1;
    setPanelOpen(!panelOpen);
    Animated.spring(panelAnim, { toValue, useNativeDriver: true, tension: 80, friction: 10 }).start();
  };

  const closePanel = () => {
    setPanelOpen(false);
    Animated.spring(panelAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }).start();
  };

  const handleSelectYear = (year: string) => {
    setSelectedYear(year);
    setSelectedMonth('전체');
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  };

  const handleSelectMonth = (month: string) => {
    setSelectedMonth(month);
    closePanel();
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  };

  // 필터 레이블
  const filterLabel = selectedYear === '전체'
    ? '전체'
    : selectedMonth === '전체'
      ? `${selectedYear}년`
      : `${selectedYear}년 ${selectedMonth}`;

  // 필터 적용
  const filtered = diaries.filter((d) => {
    if (selectedYear !== '전체' && !d.date.startsWith(selectedYear)) return false;
    if (selectedYear !== '전체' && selectedMonth !== '전체') {
      const mm = String(parseInt(selectedMonth)).padStart(2, '0');
      if (d.date.slice(5, 7) !== mm) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));
  const groups: Group[] = [];
  for (const diary of sorted) {
    const month = diary.date.slice(0, 7);
    const last  = groups[groups.length - 1];
    if (last && last.month === month) last.data.push(diary);
    else groups.push({ month, data: [diary] });
  }

  const showBtn = (show: boolean) => {
    setBtnVisible(show);
    Animated.timing(btnAnim, { toValue: show ? 1 : 0, duration: 200, useNativeDriver: true }).start();
  };

  const onScroll = (e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    scrollY.current = y;
    if (y > 350 && !btnVisible) showBtn(true);
    if (y <= 350 && btnVisible)  showBtn(false);
  };

  const scrollToTop = () => listRef.current?.scrollToOffset({ offset: 0, animated: true });

  const s = makeStyles(colors);

  if (diaries.length === 0) {
    return (
      <View style={s.empty}>
        <Text style={s.emptyEmoji}>📖</Text>
        <Text style={s.emptyTitle}>아직 작성한 일기가 없어요</Text>
        <Text style={s.emptySub}>첫 일기를 써보세요</Text>
      </View>
    );
  }

  const renderDiary = (diary: Diary) => {
    const topicName = diary.topicId ? topicMap[diary.topicId] : undefined;
    return (
      <TouchableOpacity
        key={diary.id}
        style={s.item}
        onPress={() => router.push(`/diary/${diary.id}`)}
        activeOpacity={0.7}
      >
        <View style={{ flex: 1 }}>
          <View style={s.itemTopRow}>
            <Text style={s.itemDate}>{formatDate(diary.date)}</Text>
            {topicName && (
              <View style={s.topicBadge}>
                <Text style={s.topicText}>{topicName}</Text>
              </View>
            )}
          </View>
          <Text style={s.itemContent} numberOfLines={1}>{diary.content}</Text>
        </View>
        {diary.favorite && <Text style={s.star}>★</Text>}
        <Text style={s.arrow}>›</Text>
      </TouchableOpacity>
    );
  };

  const renderGroup = ({ item }: { item: Group }) => (
    <View>
      <View style={s.monthRow}>
        <Text style={s.monthHeader}>{formatMonth(item.month)}</Text>
        <Text style={s.monthCount}>{item.data.length}편</Text>
      </View>
      {item.data.map(renderDiary)}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity
              onPress={togglePanel}
              style={{ marginRight: 4, paddingHorizontal: 8, paddingVertical: 4 }}
            >
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>
                {filterLabel} {panelOpen ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />

      <FlatList
        ref={listRef}
        style={s.container}
        data={groups}
        keyExtractor={(item) => item.month}
        renderItem={renderGroup}
        ListEmptyComponent={
          <View style={s.emptyFiltered}>
            <Text style={s.emptyFilteredText}>{filterLabel} 일기가 없어요</Text>
            <TouchableOpacity style={s.resetBtn} onPress={() => { setSelectedYear('전체'); setSelectedMonth('전체'); }}>
              <Text style={s.resetBtnText}>전체 보기</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 80 }}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />

      {/* 필터 드롭다운 패널 */}
      {panelOpen && (
        <>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            onPress={closePanel}
            activeOpacity={0}
          />
          <Animated.View
            style={[
              s.panel,
              {
                opacity: panelAnim,
                transform: [{ translateY: panelAnim.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) }],
              },
            ]}
          >
            {/* 연도 선택 */}
            <Text style={s.panelLabel}>연도</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}
              contentContainerStyle={{ gap: 8, paddingRight: 4 }}>
              {years.map((y) => (
                <TouchableOpacity
                  key={y}
                  style={[s.chip, selectedYear === y && s.chipActive]}
                  onPress={() => handleSelectYear(y)}
                >
                  <Text style={[s.chipText, selectedYear === y && s.chipTextActive]}>{y}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* 월 선택 — 연도 선택 시에만 표시 */}
            {selectedYear !== '전체' && (
              <>
                <View style={s.divider} />
                <Text style={[s.panelLabel, { marginTop: 12 }]}>월</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8, paddingRight: 4 }}>
                  {months.map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={[s.chip, selectedMonth === m && s.chipActive]}
                      onPress={() => handleSelectMonth(m)}
                    >
                      <Text style={[s.chipText, selectedMonth === m && s.chipTextActive]}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}
          </Animated.View>
        </>
      )}

      {/* 맨 위로 버튼 */}
      <Animated.View
        style={[
          s.topBtn,
          {
            opacity: btnAnim,
            transform: [{ scale: btnAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }],
          },
        ]}
        pointerEvents={btnVisible ? 'auto' : 'none'}
      >
        <TouchableOpacity style={s.topBtnInner} onPress={scrollToTop} activeOpacity={0.8}>
          <Text style={s.topBtnIcon}>↑</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },

    monthRow: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 16, paddingTop: 24, paddingBottom: 8,
    },
    monthHeader: { fontSize: 11, fontWeight: '800', color: colors.accent, letterSpacing: 1, textTransform: 'uppercase' },
    monthCount:  { fontSize: 12, color: colors.subText },

    item: {
      backgroundColor: colors.card, marginHorizontal: 16, marginBottom: 8,
      borderRadius: 6, padding: 14, flexDirection: 'row', alignItems: 'center',
      gap: 12, borderWidth: 1, borderColor: colors.border,
    },
    itemTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
    itemDate:   { fontSize: 11, color: colors.subText },
    topicBadge: { backgroundColor: colors.accent + '22', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 },
    topicText:  { fontSize: 10, color: colors.accent, fontWeight: '600' },
    itemContent:{ fontSize: 14, color: colors.text },
    star:       { fontSize: 14, color: colors.accent },
    arrow:      { fontSize: 20, color: colors.subText },

    // 필터 패널
    panel: {
      position: 'absolute',
      top: 8, right: 12,
      backgroundColor: colors.bg,
      borderRadius: 10, padding: 14,
      shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 }, elevation: 12,
      zIndex: 999, borderWidth: 1, borderColor: colors.border,
      minWidth: 260,
    },
    panelLabel: { fontSize: 10, fontWeight: '800', color: colors.accent, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
    divider:    { height: 1, backgroundColor: colors.border },
    chip: {
      paddingHorizontal: 14, paddingVertical: 8,
      borderRadius: 32, borderWidth: 1.5,
      borderColor: colors.border, backgroundColor: colors.bg,
    },
    chipActive:     { borderColor: colors.accent, backgroundColor: colors.accent + '18' },
    chipText:       { fontSize: 13, color: colors.subText, fontWeight: '600' },
    chipTextActive: { color: colors.accent },

    topBtn: { position: 'absolute', bottom: 28, right: 20 },
    topBtnInner: {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: colors.accent,
      justifyContent: 'center', alignItems: 'center',
      shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, elevation: 6,
    },
    topBtnIcon: { fontSize: 20, color: '#fff', fontWeight: '700', lineHeight: 22 },

    empty:         { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, backgroundColor: colors.bg },
    emptyEmoji:    { fontSize: 44 },
    emptyTitle:    { fontSize: 16, fontWeight: '700', color: colors.text },
    emptySub:      { fontSize: 13, color: colors.subText },
    emptyFiltered: { alignItems: 'center', paddingTop: 60, gap: 12 },
    emptyFilteredText: { fontSize: 15, color: colors.subText },
    resetBtn:      { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 60, borderWidth: 1.5, borderColor: colors.accent },
    resetBtnText:  { fontSize: 13, color: colors.accent, fontWeight: '700' },
  });
}
