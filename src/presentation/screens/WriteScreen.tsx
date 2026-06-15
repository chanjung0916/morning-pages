import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDiary } from '../../application/context/DiaryContext';
import { useTheme } from '../../application/context/ThemeContext';
import { CustomTopicRepository, CustomTopic } from '../../data/repositories/CustomTopicRepository';
import { today, formatDate } from '../../utils/date';
import { Colors } from '../theme/colors';

const customRepo = new CustomTopicRepository();

export default function WriteScreen() {
  const router  = useRouter();
  const params  = useLocalSearchParams<{ date?: string; editId?: string }>();
  const { saveDiary, updateDiary, diaries } = useDiary();
  const { colors } = useTheme();

  const isEditMode = !!params.editId;

  const [content,          setContent]         = useState('');
  const [categories,       setCategories]       = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [todayTopic,       setTodayTopic]       = useState<CustomTopic | null>(null);
  const [topicLoading,     setTopicLoading]     = useState(true);

  const todayStr = today();
  const displayDate = params.date ?? todayStr;

  useEffect(() => {
    if (isEditMode && params.editId) {
      const existing = diaries.find((d) => d.id === params.editId);
      if (existing) {
        setContent(existing.content);
      }
    }
  }, [isEditMode, params.editId, diaries]);

  const loadCategories = useCallback(async () => {
    const cats = await customRepo.getCategories();
    setCategories(cats);
    if (cats.length > 0 && !selectedCategory) setSelectedCategory(cats[0]);
    return cats;
  }, [selectedCategory]);

  const loadTodayTopic = useCallback(async (category: string) => {
    if (!category) { setTopicLoading(false); setTodayTopic(null); return; }
    setTopicLoading(true);
    const all    = await customRepo.findAll();
    const picked = await customRepo.getTodayTopic(all, todayStr, category);
    setTodayTopic(picked);
    setTopicLoading(false);
  }, [todayStr]);

  const handleSelectCategory = async (cat: string) => {
    setSelectedCategory(cat);
    await loadTodayTopic(cat);
  };

  const handleRefresh = async () => {
    if (!selectedCategory) return;
    setTopicLoading(true);
    const all    = await customRepo.findAll();
    const picked = await customRepo.refreshTodayTopic(all, todayStr, selectedCategory);
    setTodayTopic(picked);
    setTopicLoading(false);
  };

  useEffect(() => {
    (async () => {
      const cats = await loadCategories();
      if (cats.length > 0) await loadTodayTopic(cats[0]);
      else setTopicLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    if (!content.trim()) { Alert.alert('저장 실패', '내용을 입력해주세요.'); return; }
    if (isEditMode && params.editId) {
      const existing = diaries.find((d) => d.id === params.editId);
      if (!existing) return;
      await updateDiary({ ...existing, content });
      router.back();
    } else {
      const success = await saveDiary({
        date:    displayDate,
        content,
        topicId: todayTopic?.id,
      });
      if (success) router.back();
    }
  };

  const dateObj  = new Date(displayDate);
  const dayNames = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
  const dayName  = dayNames[dateObj.getDay()];
  const mm       = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd       = String(dateObj.getDate()).padStart(2, '0');

  const s = makeStyles(colors);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={s.container} keyboardShouldPersistTaps="handled" stickyHeaderIndices={[0]}>

        {/* ── 다크 헤더 (항상 다크) ── */}
        <View style={s.header}>
          <Text style={s.dateDisplay}>
            <Text style={s.dateRed}>{mm}</Text>.{dd}
          </Text>
          <Text style={s.dayName}>{dayName}</Text>
          <Text style={s.dateSub}>{formatDate(displayDate)}</Text>
          {isEditMode && (
            <View style={s.editBanner}>
              <Text style={s.editBannerText}>✏️ 수정 모드</Text>
            </View>
          )}
        </View>

        <View style={s.body}>
          {/* 카테고리 탭 */}
          {!isEditMode && categories.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              style={s.categoryRow} contentContainerStyle={{ gap: 8 }}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[s.categoryChip, selectedCategory === cat && s.categoryChipActive]}
                  onPress={() => handleSelectCategory(cat)}
                >
                  <Text style={[s.categoryChipText, selectedCategory === cat && s.categoryChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* 오늘의 주제 */}
          {!isEditMode && (
            <View style={s.topicCard}>
              <View style={s.topicCardHeader}>
                <Text style={s.topicCardLabel}>오늘의 주제</Text>
                <TouchableOpacity onPress={handleRefresh} disabled={topicLoading} style={s.refreshBtn}>
                  <Text style={s.refreshBtnText}>↻</Text>
                </TouchableOpacity>
              </View>
              {topicLoading ? (
                <ActivityIndicator color={colors.accent} style={{ marginVertical: 10 }} />
              ) : todayTopic ? (
                <>
                  <Text style={s.topicName}>{todayTopic.topic}</Text>
                  {todayTopic.prompts.length > 0 && (
                    <Text style={s.topicPrompt}>{todayTopic.prompts[0]}</Text>
                  )}
                </>
              ) : (
                <Text style={s.topicEmpty}>
                  {categories.length === 0
                    ? '메뉴 → ✨ 주제 생성에서 AI 주제를 추가해보세요'
                    : `"${selectedCategory}" 카테고리에 주제가 없어요`}
                </Text>
              )}
            </View>
          )}

          {/* 일기 본문 */}
          <TextInput
            style={s.input}
            multiline
            placeholder="오늘의 이야기를 적어보세요..."
            placeholderTextColor={colors.subText}
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
          />

          {/* 저장 버튼 */}
          <TouchableOpacity style={s.saveButton} onPress={handleSave}>
            <Text style={s.saveButtonText}>{isEditMode ? '수정 완료' : '저장'}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },

    header: {
      backgroundColor: Colors.ink,   // 히어로는 항상 다크
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 24,
    },
    dateDisplay: { fontSize: 52, fontWeight: '800', color: Colors.onDark, letterSpacing: -1, lineHeight: 56 },
    dateRed:  { color: Colors.primary },
    dayName:  { fontSize: 18, fontWeight: '300', color: 'rgba(255,255,255,0.6)', marginTop: 2 },
    dateSub:  { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 },
    editBanner: {
      marginTop: 12, backgroundColor: 'rgba(230,0,0,0.15)',
      borderRadius: 6, borderLeftWidth: 3, borderLeftColor: Colors.primary,
      paddingVertical: 8, paddingHorizontal: 12,
    },
    editBannerText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },

    body: { padding: 16 },

    categoryRow: { marginBottom: 14 },
    categoryChip: {
      borderRadius: 32, paddingHorizontal: 16, paddingVertical: 8,
      backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border,
    },
    categoryChipActive:     { backgroundColor: colors.accent, borderColor: colors.accent },
    categoryChipText:       { fontSize: 14, fontWeight: '600', color: colors.text },
    categoryChipTextActive: { color: '#fff' },

    topicCard: {
      backgroundColor: colors.card, borderRadius: 6, padding: 14,
      marginBottom: 20, borderLeftWidth: 3, borderLeftColor: colors.accent,
    },
    topicCardHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    topicCardLabel:   { fontSize: 11, fontWeight: '800', color: colors.accent, letterSpacing: 1, textTransform: 'uppercase' },
    refreshBtn:       { padding: 4 },
    refreshBtnText:   { fontSize: 20, color: colors.accent, fontWeight: '700' },
    topicName:        { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 6 },
    topicPrompt:      { fontSize: 14, color: colors.subText, lineHeight: 22 },
    topicEmpty:       { fontSize: 13, color: colors.subText, lineHeight: 20, textAlign: 'center', paddingVertical: 8 },

    input: {
      backgroundColor: colors.card, borderRadius: 6, padding: 16,
      fontSize: 16, color: colors.text, minHeight: 200,
      lineHeight: 28, marginBottom: 20,
      borderWidth: 1, borderColor: colors.border,
    },

    saveButton: {
      backgroundColor: colors.accent, borderRadius: 60,
      paddingVertical: 16, alignItems: 'center', marginBottom: 40,
    },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  });
}
