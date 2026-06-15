import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useDiary } from '../../application/context/DiaryContext';
import { useTheme } from '../../application/context/ThemeContext';
import { today, formatDate } from '../../utils/date';
import { Colors } from '../theme/colors';
import { Diary } from '../../domain/entities/Diary';
import ContributionGraph from '../components/ContributionGraph';
import SideDrawer from '../components/SideDrawer';
import TopicPromptModal from '../components/TopicPromptModal';
import { UserProfileRepository, DEFAULT_SLOGAN } from '../../data/repositories/UserProfileRepository';
import { CustomTopicRepository, CustomTopic } from '../../data/repositories/CustomTopicRepository';

const profileRepo = new UserProfileRepository();
const topicRepo   = new CustomTopicRepository();

type DiaryFilter = 'all' | 'favorite' | string;

export default function HomeScreen() {
  const router = useRouter();
  const { diaries, isLoading, loadDiaries } = useDiary();
  const { colors } = useTheme();
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [promptOpen,  setPromptOpen]  = useState(false);
  const [slogan,      setSlogan]      = useState(DEFAULT_SLOGAN);
  const [topicMap,    setTopicMap]    = useState<Record<string, string>>({});
  const [allTopics,   setAllTopics]   = useState<CustomTopic[]>([]);
  const [categories,  setCategories]  = useState<string[]>([]);
  const [filter,      setFilter]      = useState<DiaryFilter>('all');
  const [filterOpen,  setFilterOpen]  = useState(false);
  const [filterBtnY,  setFilterBtnY]  = useState(0);
  const filterBtnRef = useRef<View>(null);
  const filterAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => { loadDiaries(); }, []);

  useFocusEffect(
    useCallback(() => {
      profileRepo.getProfile().then((p) => setSlogan(p.slogan));
      topicRepo.findAll().then((topics: CustomTopic[]) => {
        const map: Record<string, string> = {};
        topics.forEach((t) => { map[t.id] = t.topic; });
        setTopicMap(map);
        setAllTopics(topics);
        setCategories([...new Set(topics.map((t) => t.category).filter(Boolean))]);
      });
    }, [])
  );

  const filterOptions = [
    { key: 'all',      label: '전체' },
    { key: 'favorite', label: '★ 즐겨찾기' },
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

  const pastDiaries = [...diaries]
    .filter((d) => d.date !== today())
    .filter((d) => {
      if (filter === 'all')      return true;
      if (filter === 'favorite') return !!d.favorite;
      const ids = allTopics.filter((t) => t.category === filter).map((t) => t.id);
      return !!d.topicId && ids.includes(d.topicId);
    })
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 30);

  const todayDiary = diaries.find((d) => d.date === today()) ?? null;
  const styles = makeStyles(colors);

  const handleDayPress = useCallback((date: string) => {
    const diary = diaries.find((d) => d.date === date);
    if (diary) router.push(`/diary/${diary.id}`);
    else        router.push(`/write?date=${date}`);
  }, [diaries]);

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>;
  }

  const renderItem = ({ item }: { item: Diary }) => {
    const topicName = item.topicId ? topicMap[item.topicId] : undefined;
    return (
      <TouchableOpacity
        style={styles.diaryItem}
        onPress={() => router.push(`/diary/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={{ flex: 1 }}>
          <View style={styles.diaryTopRow}>
            <Text style={styles.diaryDate}>{formatDate(item.date)}</Text>
            {topicName && (
              <View style={styles.topicBadge}>
                <Text style={styles.topicText}>{topicName}</Text>
              </View>
            )}
          </View>
          <Text style={styles.diaryContent} numberOfLines={1}>{item.content}</Text>
        </View>
        {item.favorite && <Text style={styles.star}>★</Text>}
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
    );
  };

  const ListHeader = (
    <View>
      {/* ─── 다크 히어로 밴드 ─── */}
      <SafeAreaView style={styles.hero}>
        <View style={styles.heroTop}>
          <TouchableOpacity style={styles.menuBtn} onPress={() => setDrawerOpen(true)}>
            <View style={styles.menuLine} />
            <View style={[styles.menuLine, { width: 16 }]} />
            <View style={styles.menuLine} />
          </TouchableOpacity>
        </View>
        <Text style={styles.heroTitle}>{slogan}</Text>
        {todayDiary ? (
          <TouchableOpacity
            style={styles.todayDoneBtn}
            onPress={() => router.push(`/diary/${todayDiary.id}`)}
          >
            <Text style={styles.todayMood}>{todayDiary.mood ?? '📝'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.todayDoneLabel}>오늘 일기 완료 ✓</Text>
              <Text style={styles.todayDoneContent} numberOfLines={1}>{todayDiary.content}</Text>
            </View>
            <Text style={{ color: Colors.primary, fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.writeBtn} onPress={() => router.push('/write')}>
            <Text style={styles.writeBtnEmoji}>✍️</Text>
            <Text style={styles.writeBtnText}>오늘 일기 쓰기</Text>
            <Text style={styles.writeBtnDate}>{formatDate(today())}</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>

      {/* ─── 기록 그래프 ─── */}
      <View style={styles.graphSection}>
        <View style={styles.graphTitleRow}>
          <Text style={styles.graphTitle}>이번 해 기록 — {new Date().getFullYear()}</Text>
          <Text style={styles.graphCount}>{diaries.length}일 작성</Text>
        </View>
        <ContributionGraph diaries={diaries} onDayPress={handleDayPress} />
      </View>

      {/* ─── 지난 일기 섹션 헤더 + 필터 버튼 ─── */}
      {diaries.filter((d) => d.date !== today()).length > 0 && (
        <View style={styles.filterRow}>
          <TouchableOpacity
            ref={filterBtnRef}
            style={styles.filterBtn}
            onPress={() => {
              filterBtnRef.current?.measureInWindow((_x, y, _w, h) => {
                setFilterBtnY(y + h + 4);
              });
              toggleFilter();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.sectionTitle}>
              {filter === 'all' ? '지난 일기' : filterLabel}
            </Text>
            <Text style={styles.filterChevron}>{filterOpen ? ' ▲' : ' ▼'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={pastDiaries}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {diaries.length === 0
                ? '첫 일기를 써서 기록을 시작해보세요!'
                : `'${filterLabel}' 조건에 맞는 일기가 없어요`}
            </Text>
            {filter !== 'all' && (
              <TouchableOpacity style={styles.resetFilterBtn} onPress={() => selectFilter('all')}>
                <Text style={styles.resetFilterText}>전체 보기</Text>
              </TouchableOpacity>
            )}
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
              styles.filterPanel,
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
                style={[styles.filterChip, filter === opt.key && styles.filterChipActive]}
                onPress={() => selectFilter(opt.key)}
              >
                <Text style={[styles.filterChipText, filter === opt.key && styles.filterChipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </>
      )}

      <SideDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onTopicPrompt={() => setPromptOpen(true)}
      />
      <TopicPromptModal visible={promptOpen} onClose={() => setPromptOpen(false)} />
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },

    hero: {
      backgroundColor: Colors.ink,
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 24,
    },
    heroTop: {
      flexDirection: 'row', alignItems: 'center',
      justifyContent: 'space-between', marginBottom: 20,
    },
    menuBtn:  { padding: 4, gap: 5, justifyContent: 'center' },
    menuLine: { width: 22, height: 2, backgroundColor: Colors.onDark, borderRadius: 1 },
    heroTitle: {
      fontSize: 32, fontWeight: '800', color: Colors.onDark,
      letterSpacing: -0.5, lineHeight: 40, marginTop: 8, marginBottom: 28,
    },

    writeBtn: {
      backgroundColor: Colors.primary, borderRadius: 60,
      paddingVertical: 14, paddingHorizontal: 24,
      flexDirection: 'row', alignItems: 'center', gap: 10,
    },
    writeBtnEmoji: { fontSize: 20 },
    writeBtnText:  { flex: 1, fontSize: 16, fontWeight: '600', color: '#fff' },
    writeBtnDate:  { fontSize: 12, color: 'rgba(255,255,255,0.75)' },

    todayDoneBtn: {
      backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 60,
      paddingVertical: 14, paddingHorizontal: 20,
      flexDirection: 'row', alignItems: 'center', gap: 12,
      borderWidth: 1, borderColor: Colors.primary,
    },
    todayMood:        { fontSize: 22 },
    todayDoneLabel:   { fontSize: 13, fontWeight: '700', color: Colors.primary },
    todayDoneContent: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

    graphSection: {
      backgroundColor: colors.card, paddingTop: 16, paddingBottom: 12,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    graphTitleRow: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'center', paddingHorizontal: 16, marginBottom: 6,
    },
    graphTitle: {
      fontSize: 11, fontWeight: '800', color: Colors.primary,
      letterSpacing: 1, textTransform: 'uppercase',
    },
    graphCount: { fontSize: 12, color: colors.subText },

    filterRow: {
      paddingHorizontal: 16, paddingTop: 16, marginBottom: 4,
      zIndex: 10, overflow: 'visible',
    },
    filterBtn: {
      flexDirection: 'row', alignItems: 'center',
      alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 2,
    },
    sectionTitle: {
      fontSize: 11, fontWeight: '800', color: Colors.primary,
      letterSpacing: 1, textTransform: 'uppercase',
    },
    filterChevron: { fontSize: 11, color: Colors.primary, fontWeight: '700' },
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

    diaryItem: {
      backgroundColor: colors.card, marginHorizontal: 16, marginBottom: 8,
      borderRadius: 6, padding: 14, flexDirection: 'row', alignItems: 'center',
      gap: 12, borderWidth: 1, borderColor: colors.border,
    },
    diaryTopRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
    diaryDate:    { fontSize: 11, color: colors.subText },
    topicBadge:   { backgroundColor: colors.accent + '22', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 },
    topicText:    { fontSize: 10, color: colors.accent, fontWeight: '600' },
    diaryContent: { fontSize: 14, color: colors.text },
    star:         { fontSize: 14 },
    arrow:        { fontSize: 20, color: colors.subText },

    empty: { alignItems: 'center', paddingTop: 48, gap: 12 },
    emptyText: { fontSize: 15, color: colors.subText, textAlign: 'center', paddingHorizontal: 24 },
    resetFilterBtn: {
      marginTop: 4, paddingHorizontal: 24, paddingVertical: 10,
      borderRadius: 60, borderWidth: 1.5, borderColor: colors.accent,
    },
    resetFilterText: { fontSize: 13, color: colors.accent, fontWeight: '700' },
  });
}
