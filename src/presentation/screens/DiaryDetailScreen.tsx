import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDiary } from '../../application/context/DiaryContext';
import { useTheme } from '../../application/context/ThemeContext';
import { Diary } from '../../domain/entities/Diary';
import { Colors } from '../theme/colors';
import { formatDate } from '../../utils/date';
import { CustomTopicRepository, CustomTopic } from '../../data/repositories/CustomTopicRepository';

const topicRepo = new CustomTopicRepository();

export default function DiaryDetailScreen() {
  const router = useRouter();
  const { id }  = useLocalSearchParams<{ id: string }>();
  const { diaries, deleteDiary, toggleFavorite } = useDiary();
  const { colors } = useTheme();
  const [diary,            setDiary]            = useState<Diary | null>(null);
  const [topic,            setTopic]            = useState<CustomTopic | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting,         setDeleting]         = useState(false);

  useEffect(() => {
    const found = diaries.find((d) => d.id === id) ?? null;
    setDiary(found);
    if (found?.topicId) {
      topicRepo.findAll().then((all) => {
        setTopic(all.find((t) => t.id === found.topicId) ?? null);
      });
    } else {
      setTopic(null);
    }
  }, [id, diaries]);

  const handleDelete = async () => {
    setDeleting(true);
    await deleteDiary(id!);
    router.back();
  };

  const s = makeStyles(colors);

  if (!diary) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const dateObj  = new Date(diary.date);
  const dayNames = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
  const mm  = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd  = String(dateObj.getDate()).padStart(2, '0');
  const day = dayNames[dateObj.getDay()];

  return (
    <ScrollView style={s.container}>

      {/* ── 다크 헤더 ── */}
      <SafeAreaView style={s.hero}>
        <View style={s.heroTop}>
          {/* 날짜 + 기분 이모지 */}
          <View style={{ flex: 1 }}>
            <View style={s.dateRow}>
              <Text style={s.dateDisplay}>
                <Text style={s.dateRed}>{mm}</Text>.{dd}
              </Text>
            </View>
            <Text style={s.dayName}>{day}</Text>
            <Text style={s.dateSub}>{formatDate(diary.date)}</Text>
          </View>

          {/* 즐겨찾기 버튼 */}
          <TouchableOpacity onPress={() => toggleFavorite(diary.id)} style={s.starBtn}>
            <Text style={s.starText}>{diary.favorite ? '★' : '☆'}</Text>
          </TouchableOpacity>
        </View>

        {/* 주제 질문 */}
        {topic && (
          <View style={s.topicBox}>
            <Text style={s.topicCategory}>{topic.topic}</Text>
            <Text style={s.topicQuestion}>{topic.prompts[0]}</Text>
          </View>
        )}
      </SafeAreaView>

      {/* ── 본문 ── */}
      <View style={s.body}>
        <Text style={s.contentLabel}>일기</Text>
        <View style={s.contentCard}>
          <Text style={s.content}>{diary.content}</Text>
        </View>

        <Text style={s.meta}>
          작성: {new Date(diary.createdAt).toLocaleString('ko-KR')}
        </Text>

        {confirmingDelete ? (
          <View style={s.confirmBox}>
            <Text style={s.confirmText}>이 일기를 삭제할까요?{'\n'}삭제하면 되돌릴 수 없어요.</Text>
            <View style={s.confirmBtns}>
              <TouchableOpacity style={s.confirmCancelBtn} onPress={() => setConfirmingDelete(false)}>
                <Text style={s.confirmCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.confirmDeleteBtn} onPress={handleDelete} disabled={deleting}>
                <Text style={s.confirmDeleteText}>{deleting ? '삭제 중…' : '삭제'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={s.actions}>
            <TouchableOpacity
              style={s.editBtn}
              onPress={() => router.push(`/write?editId=${diary.id}`)}
            >
              <Text style={s.editBtnText}>✏️  수정</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.deleteBtn}
              onPress={() => setConfirmingDelete(true)}
            >
              <Text style={s.deleteBtnText}>삭제</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    center:    { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },

    hero: {
      backgroundColor: Colors.ink,
      paddingHorizontal: 20,
      paddingBottom: 24,
    },
    heroTop:    { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
    dateRow:    { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
    dateDisplay:{ fontSize: 52, fontWeight: '800', color: Colors.onDark, letterSpacing: -1, lineHeight: 56 },
    dateRed:    { color: Colors.primary },
    dayName:    { fontSize: 16, fontWeight: '300', color: 'rgba(255,255,255,0.55)', marginTop: 4 },
    dateSub:    { fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4 },
    starBtn:    { padding: 4 },
    starText:   { fontSize: 28, color: Colors.primary },

    // 주제 질문 박스
    topicBox: {
      backgroundColor: 'rgba(255,255,255,0.07)',
      borderRadius: 8,
      padding: 14,
      borderLeftWidth: 3,
      borderLeftColor: Colors.primary,
    },
    topicCategory: {
      fontSize: 10, fontWeight: '700', color: Colors.primary,
      letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6,
    },
    topicQuestion: {
      fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 22, fontWeight: '500',
    },

    body: { padding: 20 },
    contentLabel: {
      fontSize: 11, fontWeight: '800', color: colors.accent,
      letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10,
    },
    contentCard: {
      backgroundColor: colors.card, borderRadius: 6,
      padding: 20, marginBottom: 12,
      borderWidth: 1, borderColor: colors.border,
    },
    content: { fontSize: 16, color: colors.text, lineHeight: 28 },
    meta:    { fontSize: 12, color: colors.subText, marginBottom: 28 },

    actions:   { flexDirection: 'row', gap: 12, marginBottom: 40 },
    editBtn: {
      flex: 1, borderRadius: 60, paddingVertical: 14, alignItems: 'center',
      borderWidth: 1.5, borderColor: colors.border,
    },
    editBtnText:   { fontSize: 15, color: colors.text, fontWeight: '600' },
    deleteBtn: {
      flex: 1, borderRadius: 60, paddingVertical: 14, alignItems: 'center',
      backgroundColor: colors.accent,
    },
    deleteBtnText: { fontSize: 15, color: '#fff', fontWeight: '700' },

    confirmBox: {
      backgroundColor: colors.card, borderRadius: 6,
      padding: 18, marginBottom: 40,
      borderLeftWidth: 3, borderLeftColor: colors.accent,
      borderWidth: 1, borderColor: colors.border,
    },
    confirmText:      { fontSize: 15, color: colors.text, lineHeight: 24, marginBottom: 16 },
    confirmBtns:      { flexDirection: 'row', gap: 10 },
    confirmCancelBtn: {
      flex: 1, borderRadius: 60, paddingVertical: 12, alignItems: 'center',
      borderWidth: 1.5, borderColor: colors.border,
    },
    confirmCancelText: { fontWeight: '600', color: colors.subText, fontSize: 15 },
    confirmDeleteBtn: {
      flex: 1, borderRadius: 60, paddingVertical: 12, alignItems: 'center',
      backgroundColor: colors.accent,
    },
    confirmDeleteText: { fontWeight: '700', color: '#fff', fontSize: 15 },
  });
}
