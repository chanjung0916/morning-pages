import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDiary } from '../../application/context/DiaryContext';
import { Mood } from '../../domain/entities/Diary';
import { CustomTopicRepository, CustomTopic } from '../../data/repositories/CustomTopicRepository';
import { today } from '../../utils/date';
import { Colors } from '../theme/colors';

const MOODS: Mood[] = ['😊', '😐', '😢', '😡', '😴'];
const customRepo = new CustomTopicRepository();

export default function WriteScreen() {
  const router  = useRouter();
  const params  = useLocalSearchParams<{ date?: string; editId?: string }>();
  const { saveDiary, updateDiary, diaries } = useDiary();

  const isEditMode = !!params.editId;

  const [content,          setContent]         = useState('');
  const [selectedMood,     setSelectedMood]     = useState<Mood | undefined>();
  const [categories,       setCategories]       = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [todayTopic,       setTodayTopic]       = useState<CustomTopic | null>(null);
  const [topicLoading,     setTopicLoading]     = useState(true);

  const todayStr = today();

  /** 수정 모드: 기존 일기 내용/기분 불러오기 */
  useEffect(() => {
    if (isEditMode && params.editId) {
      const existing = diaries.find((d) => d.id === params.editId);
      if (existing) {
        setContent(existing.content);
        setSelectedMood(existing.mood);
      }
    }
  }, [isEditMode, params.editId, diaries]);

  /** 카테고리 목록 + 첫 카테고리 자동 선택 */
  const loadCategories = useCallback(async () => {
    const cats = await customRepo.getCategories();
    setCategories(cats);
    if (cats.length > 0 && !selectedCategory) {
      setSelectedCategory(cats[0]);
    }
    return cats;
  }, [selectedCategory]);

  /** 선택된 카테고리의 오늘 주제 로드 */
  const loadTodayTopic = useCallback(async (category: string) => {
    if (!category) { setTopicLoading(false); setTodayTopic(null); return; }
    setTopicLoading(true);
    const all    = await customRepo.findAll();
    const picked = await customRepo.getTodayTopic(all, todayStr, category);
    setTodayTopic(picked);
    setTopicLoading(false);
  }, [todayStr]);

  /** 카테고리 변경 시 주제 재로드 */
  const handleSelectCategory = async (cat: string) => {
    setSelectedCategory(cat);
    await loadTodayTopic(cat);
  };

  /** 🔄 새로고침 */
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
    if (!content.trim()) {
      Alert.alert('저장 실패', '내용을 입력해주세요.');
      return;
    }

    if (isEditMode && params.editId) {
      // 수정 모드: 기존 일기 업데이트
      const existing = diaries.find((d) => d.id === params.editId);
      if (!existing) return;
      await updateDiary({ ...existing, content, mood: selectedMood });
      router.back();
    } else {
      // 신규 작성
      const success = await saveDiary({
        date:    params.date ?? todayStr,
        content,
        mood:    selectedMood,
        topicId: todayTopic?.id,
      });
      if (success) router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">

        {/* 수정 모드 배너 */}
        {isEditMode && (
          <View style={styles.editBanner}>
            <Text style={styles.editBannerText}>✏️ 일기를 수정하고 있어요</Text>
          </View>
        )}

        {/* 카테고리 탭 (신규 작성만) */}
        {!isEditMode && categories.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
                onPress={() => handleSelectCategory(cat)}
              >
                <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* 오늘의 주제 카드 (신규 작성만) */}
        {!isEditMode && (
          <View style={styles.topicCard}>
            <View style={styles.topicCardHeader}>
              <Text style={styles.topicCardLabel}>📌 오늘의 주제</Text>
              <TouchableOpacity onPress={handleRefresh} style={styles.refreshBtn} disabled={topicLoading}>
                <Text style={styles.refreshBtnText}>🔄</Text>
              </TouchableOpacity>
            </View>

            {topicLoading ? (
              <ActivityIndicator color={Colors.primary} style={{ marginVertical: 12 }} />
            ) : todayTopic ? (
              <>
                <Text style={styles.topicName}>{todayTopic.topic}</Text>
                {todayTopic.prompts.length > 0 && (
                  <Text style={styles.topicPrompt}>{todayTopic.prompts[0]}</Text>
                )}
              </>
            ) : (
              <Text style={styles.topicEmpty}>
                {categories.length === 0
                  ? '메뉴 → ✨ 주제 프롬프트 생성에서\nAI 주제를 추가해보세요'
                  : `"${selectedCategory}" 카테고리에 주제가 없어요`}
              </Text>
            )}
          </View>
        )}

        {/* 기분 선택 */}
        <Text style={styles.label}>오늘 기분</Text>
        <View style={styles.moodRow}>
          {MOODS.map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.moodBtn, selectedMood === m && styles.moodBtnActive]}
              onPress={() => setSelectedMood(selectedMood === m ? undefined : m)}
            >
              <Text style={styles.moodEmoji}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 일기 본문 */}
        <TextInput
          style={styles.input}
          multiline
          placeholder="오늘의 이야기를 적어보세요..."
          placeholderTextColor={Colors.muted}
          value={content}
          onChangeText={setContent}
          textAlignVertical="top"
        />

        {/* 저장 */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>{isEditMode ? '수정 완료' : '저장'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 16 },

  editBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  editBannerText: { fontSize: 13, color: '#92400E', fontWeight: '600' },

  // 카테고리 탭
  categoryRow: { marginBottom: 12 },
  categoryChip: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.card,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  categoryChipActive:     { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoryChipText:       { fontSize: 14, fontWeight: '600', color: Colors.text },
  categoryChipTextActive: { color: '#fff' },

  // 오늘의 주제 카드
  topicCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  topicCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  topicCardLabel: { fontSize: 12, fontWeight: '700', color: '#92400E', letterSpacing: 0.5 },
  refreshBtn:     { padding: 4 },
  refreshBtnText: { fontSize: 18 },
  topicName:      { fontSize: 16, fontWeight: '700', color: '#1C1917', marginBottom: 8 },
  topicPrompt:    { fontSize: 14, color: '#78350F', lineHeight: 22 },
  topicEmpty:     { fontSize: 13, color: '#A8A29E', lineHeight: 20, textAlign: 'center', paddingVertical: 8 },

  // 기분
  label:   { fontSize: 14, fontWeight: '600', color: Colors.muted, marginBottom: 8 },
  moodRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  moodBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.card,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'transparent',
  },
  moodBtnActive: { borderColor: Colors.primary },
  moodEmoji:     { fontSize: 24 },

  // 입력
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    minHeight: 200,
    lineHeight: 26,
    marginBottom: 20,
  },

  // 저장
  saveButton:     { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 40 },
  saveButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
