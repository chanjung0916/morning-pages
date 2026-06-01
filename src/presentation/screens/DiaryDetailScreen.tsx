import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDiary } from '../../application/context/DiaryContext';
import { Diary } from '../../domain/entities/Diary';
import { Colors } from '../theme/colors';
import { formatDate } from '../../utils/date';

export default function DiaryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { diaries, deleteDiary, toggleFavorite } = useDiary();
  const [diary,             setDiary]             = useState<Diary | null>(null);
  const [confirmingDelete,  setConfirmingDelete]  = useState(false);
  const [deleting,          setDeleting]          = useState(false);

  useEffect(() => {
    const found = diaries.find((d) => d.id === id) ?? null;
    setDiary(found);
  }, [id, diaries]);

  const handleDelete = async () => {
    setDeleting(true);
    await deleteDiary(id!);
    router.back();
  };

  const handleToggleFavorite = async () => {
    if (!diary) return;
    await toggleFavorite(diary.id);
  };

  if (!diary) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 날짜 & 기분 & 즐겨찾기 */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.date}>{formatDate(diary.date)}</Text>
          <Text style={styles.dateYear}>{diary.date.slice(0, 4)}년</Text>
        </View>
        {diary.mood && <Text style={styles.mood}>{diary.mood}</Text>}
        <TouchableOpacity onPress={handleToggleFavorite} style={styles.starBtn}>
          <Text style={styles.starText}>{diary.favorite ? '⭐' : '☆'}</Text>
        </TouchableOpacity>
      </View>

      {/* 본문 */}
      <View style={styles.contentCard}>
        <Text style={styles.content}>{diary.content}</Text>
      </View>

      {/* 메타 정보 */}
      <Text style={styles.meta}>
        작성: {new Date(diary.createdAt).toLocaleString('ko-KR')}
      </Text>

      {/* 삭제 확인 인라인 UI */}
      {confirmingDelete ? (
        <View style={styles.confirmBox}>
          <Text style={styles.confirmText}>정말 이 일기를 삭제할까요?{'\n'}삭제하면 되돌릴 수 없어요.</Text>
          <View style={styles.confirmBtns}>
            <TouchableOpacity
              style={styles.confirmCancelBtn}
              onPress={() => setConfirmingDelete(false)}
            >
              <Text style={styles.confirmCancelText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmDeleteBtn}
              onPress={handleDelete}
              disabled={deleting}
            >
              <Text style={styles.confirmDeleteText}>
                {deleting ? '삭제 중…' : '삭제'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* 수정 / 삭제 버튼 */
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.editBtn]}
            onPress={() => router.push(`/write?editId=${diary.id}`)}
          >
            <Text style={styles.editBtnText}>✏️  수정</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => setConfirmingDelete(true)}
          >
            <Text style={styles.deleteBtnText}>🗑  삭제</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  date:     { fontSize: 24, fontWeight: '700', color: Colors.text },
  dateYear: { fontSize: 13, color: Colors.muted, marginTop: 2 },
  mood:     { fontSize: 36 },

  starBtn:  { padding: 6 },
  starText: { fontSize: 28 },

  contentCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  content: { fontSize: 16, color: Colors.text, lineHeight: 28 },

  meta: { fontSize: 12, color: Colors.muted, marginBottom: 24 },

  actions: { flexDirection: 'row', gap: 12, marginBottom: 40 },
  actionBtn: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  editBtn:   { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  editBtnText:   { fontSize: 15, color: Colors.text, fontWeight: '600' },
  deleteBtn:     { backgroundColor: '#FEE2E2' },
  deleteBtnText: { fontSize: 15, color: '#DC2626', fontWeight: '600' },

  // 인라인 삭제 확인
  confirmBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 14,
    padding: 18,
    marginBottom: 40,
  },
  confirmText: { fontSize: 15, color: '#1C1917', lineHeight: 24, marginBottom: 16 },
  confirmBtns: { flexDirection: 'row', gap: 10 },
  confirmCancelBtn: {
    flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center',
    backgroundColor: '#E7E5E4',
  },
  confirmCancelText: { fontWeight: '600', color: '#78716C', fontSize: 15 },
  confirmDeleteBtn: {
    flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center',
    backgroundColor: '#DC2626',
  },
  confirmDeleteText: { fontWeight: '700', color: '#fff', fontSize: 15 },
});
