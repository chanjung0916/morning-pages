import React, { useEffect, useCallback, useState } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDiary } from '../../application/context/DiaryContext';
import { useTheme } from '../../application/context/ThemeContext';
import { today, formatDate } from '../../utils/date';
import { Colors } from '../theme/colors';
import { Diary } from '../../domain/entities/Diary';
import ContributionGraph from '../components/ContributionGraph';
import SideDrawer from '../components/SideDrawer';
import TopicPromptModal from '../components/TopicPromptModal';

export default function HomeScreen() {
  const router = useRouter();
  const { diaries, isLoading, loadDiaries } = useDiary();
  const { colors, fontScale } = useTheme();
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [promptOpen,  setPromptOpen]  = useState(false);

  useEffect(() => { loadDiaries(); }, []);

  const todayDiary = diaries.find((d) => d.date === today()) ?? null;

  const handleDayPress = useCallback((date: string) => {
    const diary = diaries.find((d) => d.date === date);
    if (diary) router.push(`/diary/${diary.id}`);
    else router.push(`/write?date=${date}`);
  }, [diaries]);

  const renderItem = ({ item }: { item: Diary }) => (
    <TouchableOpacity style={styles.diaryItem} onPress={() => router.push(`/diary/${item.id}`)}>
      <Text style={styles.diaryMood}>{item.mood ?? '📝'}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.diaryDate}>{formatDate(item.date)}</Text>
        <Text style={styles.diaryContent} numberOfLines={1}>{item.content}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  const ListHeader = (
    <View>
      {/* ─── 커스텀 헤더 ─── */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity style={styles.menuBtn} onPress={() => setDrawerOpen(true)}>
          <View style={styles.menuLine} />
          <View style={[styles.menuLine, { width: 16 }]} />
          <View style={styles.menuLine} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Morning Pages ☀️</Text>
        <View style={styles.writeIconBtn} />
      </SafeAreaView>

      {/* ─── 기록 그래프 ─── */}
      <View style={styles.graphSection}>
        <View style={styles.graphTitleRow}>
          <Text style={styles.graphTitle}>나의 기록 — {new Date().getFullYear()}</Text>
          <Text style={styles.graphCount}>{diaries.length}일 작성</Text>
        </View>
        <ContributionGraph diaries={diaries} onDayPress={handleDayPress} />
      </View>

      {/* ─── 오늘 일기 버튼 ─── */}
      <View style={styles.todaySection}>
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
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.writeBtn} onPress={() => router.push('/write')}>
            <Text style={styles.writeBtnEmoji}>✍️</Text>
            <Text style={styles.writeBtnText}>오늘 일기 쓰기</Text>
            <Text style={styles.writeBtnDate}>{formatDate(today())}</Text>
          </TouchableOpacity>
        )}
      </View>

      {diaries.length > 0 && (
        <Text style={styles.sectionTitle}>지난 일기</Text>
      )}
    </View>
  );

  if (isLoading) {
    return <View style={[styles.center, { backgroundColor: colors.bg }]}><ActivityIndicator size="large" color={colors.accent} /></View>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={diaries.filter((d) => d.date !== today())}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          diaries.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📖</Text>
              <Text style={styles.emptyText}>첫 일기를 써서 기록을 시작해보세요!</Text>
            </View>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      {/* 사이드 드로어 */}
      <SideDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onTopicPrompt={() => setPromptOpen(true)}
      />

      {/* 주제 프롬프트 생성 모달 */}
      <TopicPromptModal visible={promptOpen} onClose={() => setPromptOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuBtn: { padding: 6, gap: 4, justifyContent: 'center' },
  menuLine: { width: 20, height: 2, backgroundColor: Colors.text, borderRadius: 1 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: Colors.text },
  writeIconBtn: { padding: 6 },
  writeIcon: { fontSize: 20 },

  // 그래프 섹션
  graphSection: {
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingTop: 12,
    paddingBottom: 8,
  },
  graphTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  graphTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  graphCount: { fontSize: 12, color: Colors.muted },

  // 오늘 버튼
  todaySection: { padding: 16 },
  writeBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  writeBtnEmoji: { fontSize: 26 },
  writeBtnText: { flex: 1, fontSize: 17, fontWeight: '700', color: '#fff' },
  writeBtnDate: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  todayDoneBtn: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  todayMood: { fontSize: 26 },
  todayDoneLabel: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  todayDoneContent: { fontSize: 14, color: Colors.text, marginTop: 2 },

  // 지난 일기 목록
  sectionTitle: { fontSize: 13, fontWeight: '600', color: Colors.muted, paddingHorizontal: 16, marginBottom: 8 },
  diaryItem: {
    backgroundColor: Colors.card,
    marginHorizontal: 16, marginBottom: 8,
    borderRadius: 12, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  diaryMood: { fontSize: 22 },
  diaryDate: { fontSize: 11, color: Colors.muted, marginBottom: 2 },
  diaryContent: { fontSize: 14, color: Colors.text },
  arrow: { fontSize: 20, color: Colors.muted },

  // 빈 상태
  empty: { alignItems: 'center', paddingTop: 40, gap: 12 },
  emptyEmoji: { fontSize: 44 },
  emptyText: { fontSize: 15, color: Colors.muted },
});
