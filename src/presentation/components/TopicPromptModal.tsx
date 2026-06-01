import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, ScrollView, Platform, Share, Alert,
} from 'react-native';
import { Colors } from '../theme/colors';
import { CustomTopicRepository } from '../../data/repositories/CustomTopicRepository';

const customRepo = new CustomTopicRepository();

interface Props {
  visible: boolean;
  onClose: () => void;
}

function buildPrompt(keyword: string): string {
  return (
    `일기 앱에서 사용할 '${keyword}'와 관련된 아침 일기 주제를 5가지 만들어줘.\n\n` +
    `조건:\n` +
    `• 매일 아침 2~3분 안에 쓸 수 있는 분량\n` +
    `• 구체적이고 성찰적인 질문·안내 형태\n` +
    `• 한국어로 작성\n\n` +
    `형식 (콜론으로 구분):\n` +
    `주제 제목: 안내 문장\n` +
    `주제 제목: 안내 문장\n` +
    `(5개, 번호 없이)`
  );
}

/** "제목: 프롬프트" 형식 텍스트를 파싱 */
function parseAIResult(text: string): { topic: string; prompts: string[] }[] {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const result: { topic: string; prompts: string[] }[] = [];

  for (const line of lines) {
    // 번호 제거: "1. ", "1) " 등
    const cleaned = line.replace(/^\d+[\.\)]\s*/, '');
    const colonIdx = cleaned.indexOf(':');
    if (colonIdx <= 0) continue;

    const title  = cleaned.slice(0, colonIdx).trim();
    const prompt = cleaned.slice(colonIdx + 1).trim();
    if (title && prompt) {
      result.push({ topic: title, prompts: [prompt] });
    }
  }
  return result;
}

export default function TopicPromptModal({ visible, onClose }: Props) {
  const [keyword,    setKeyword]    = useState('');
  const [prompt,     setPrompt]     = useState('');
  const [copied,     setCopied]     = useState(false);
  const [aiResult,   setAiResult]   = useState('');
  const [saving,     setSaving]     = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [confirming, setConfirming] = useState(false);  // 인라인 확인 UI 표시 여부

  const handleGenerate = () => {
    if (!keyword.trim()) return;
    setPrompt(buildPrompt(keyword.trim()));
    setCopied(false);
    setAiResult('');
    setSavedCount(0);
  };

  const handleCopy = async () => {
    if (!prompt) return;
    try {
      if (Platform.OS === 'web') {
        await (navigator as any).clipboard.writeText(prompt);
      } else {
        await Share.share({ message: prompt });
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      Alert.alert('알림', '텍스트를 직접 길게 눌러 복사해주세요.');
    }
  };

  const handleSaveTopics = () => {
    if (!aiResult.trim()) return;
    const parsed = parseAIResult(aiResult);
    if (parsed.length === 0) {
      Alert.alert('파싱 실패', '"주제 제목: 안내 문장" 형식으로 붙여넣어 주세요.');
      return;
    }
    // 인라인 확인 UI 표시
    setConfirming(true);
  };

  const handleConfirmSave = async () => {
    const parsed       = parseAIResult(aiResult);
    const categoryName = keyword.trim() || '기타';
    setSaving(true);
    setConfirming(false);
    await customRepo.saveMany(parsed, categoryName);
    setSaving(false);
    setSavedCount(parsed.length);
    setAiResult('');
  };

  const handleClose = () => {
    setKeyword('');
    setPrompt('');
    setCopied(false);
    setAiResult('');
    setSavedCount(0);
    setConfirming(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <ScrollView
          style={{ width: '100%' }}
          contentContainerStyle={styles.sheetContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sheet}>

            {/* 헤더 */}
            <View style={styles.header}>
              <Text style={styles.title}>✨ 주제 프롬프트 생성</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* STEP 1 */}
            <Text style={styles.stepLabel}>STEP 1  프롬프트 생성 후 복사</Text>
            <Text style={styles.desc}>
              주제 단어를 입력해 프롬프트를 만들고, 복사 후 ChatGPT·Claude에 붙여넣으세요.
            </Text>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="예: 감사, 성장, 일상, 목표…"
                placeholderTextColor="#A8A29E"
                value={keyword}
                onChangeText={setKeyword}
                returnKeyType="done"
                onSubmitEditing={handleGenerate}
              />
              <TouchableOpacity
                style={[styles.genBtn, !keyword.trim() && styles.genBtnOff]}
                onPress={handleGenerate}
                disabled={!keyword.trim()}
                activeOpacity={0.75}
              >
                <Text style={styles.genBtnText}>생성</Text>
              </TouchableOpacity>
            </View>

            {prompt ? (
              <>
                <ScrollView style={styles.promptBox} showsVerticalScrollIndicator={false} nestedScrollEnabled>
                  <Text style={styles.promptText} selectable>{prompt}</Text>
                </ScrollView>
                <TouchableOpacity
                  style={[styles.copyBtn, copied && styles.copyBtnDone]}
                  onPress={handleCopy}
                  activeOpacity={0.8}
                >
                  <Text style={styles.copyBtnText}>
                    {copied ? '✓  복사 완료' : '📋  클립보드에 복사'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>🖊️</Text>
                <Text style={styles.emptyText}>주제 단어를 입력하고 [생성]을 눌러보세요</Text>
              </View>
            )}

            {/* STEP 2 */}
            <View style={styles.divider} />
            <Text style={styles.stepLabel}>STEP 2  AI 결과 붙여넣기 → 저장</Text>
            <Text style={styles.desc}>
              AI가 만들어준 주제 목록을 아래에 붙여넣으면{'\n'}
              일기 쓰기 화면의 오늘의 주제로 사용돼요.
            </Text>

            <TextInput
              style={styles.pasteBox}
              multiline
              placeholder={
                '여기에 AI 결과를 붙여넣으세요.\n\n예시:\n오늘의 한 걸음: 오늘 실천할 작고 구체적인 행동은?\n어제의 배움: 어제 배운 점은 무엇인가요?'
              }
              placeholderTextColor="#A8A29E"
              value={aiResult}
              onChangeText={setAiResult}
              textAlignVertical="top"
            />

            {savedCount > 0 && (
              <Text style={styles.savedMsg}>✓ {savedCount}개 주제 저장 완료!</Text>
            )}

            {/* 인라인 확인 UI */}
            {confirming ? (
              <View style={styles.confirmBox}>
                <Text style={styles.confirmText}>
                  선택한 주제가 {'\n'}
                  <Text style={styles.confirmKeyword}>"{keyword.trim() || '기타'}"</Text> 맞나요?
                </Text>
                <View style={styles.confirmBtns}>
                  <TouchableOpacity
                    style={styles.confirmCancelBtn}
                    onPress={() => setConfirming(false)}
                  >
                    <Text style={styles.confirmCancelText}>취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmSaveBtn}
                    onPress={handleConfirmSave}
                    disabled={saving}
                  >
                    <Text style={styles.confirmSaveText}>
                      {saving ? '저장 중…' : '저장'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.saveBtn, (!aiResult.trim() || saving) && styles.saveBtnOff]}
                onPress={handleSaveTopics}
                disabled={!aiResult.trim() || saving}
                activeOpacity={0.8}
              >
                <Text style={styles.saveBtnText}>📌  주제 저장하기</Text>
              </TouchableOpacity>
            )}

          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.48)',
    justifyContent: 'flex-end',
  },
  sheetContainer: { justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#FFFBF5',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 44,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title:        { fontSize: 18, fontWeight: '700', color: '#1C1917' },
  closeBtn:     { padding: 4 },
  closeBtnText: { fontSize: 18, color: '#78716C' },

  stepLabel: { fontSize: 12, fontWeight: '700', color: Colors.primary, marginBottom: 6, letterSpacing: 0.5 },
  desc: { fontSize: 13, color: '#78716C', lineHeight: 19, marginBottom: 14 },

  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E7E5E4',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1C1917',
    backgroundColor: '#fff',
  },
  genBtn:    { backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center' },
  genBtnOff: { backgroundColor: '#D6D3D1' },
  genBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  promptBox: { backgroundColor: '#F5F5F4', borderRadius: 12, padding: 14, maxHeight: 160, marginBottom: 12 },
  promptText: { fontSize: 14, color: '#1C1917', lineHeight: 22 },

  copyBtn:     { backgroundColor: '#1C1917', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 4 },
  copyBtnDone: { backgroundColor: '#16A34A' },
  copyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  empty:      { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyEmoji: { fontSize: 32 },
  emptyText:  { fontSize: 13, color: '#A8A29E', textAlign: 'center' },

  divider: { height: 1, backgroundColor: '#E7E5E4', marginVertical: 22 },

  pasteBox: {
    borderWidth: 1.5,
    borderColor: '#E7E5E4',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#1C1917',
    backgroundColor: '#fff',
    minHeight: 160,
    lineHeight: 22,
    marginBottom: 12,
  },

  savedMsg: { fontSize: 13, color: '#16A34A', fontWeight: '600', marginBottom: 10, textAlign: 'center' },

  saveBtn:     { backgroundColor: Colors.primary, borderRadius: 12, padding: 15, alignItems: 'center' },
  saveBtnOff:  { backgroundColor: '#D6D3D1' },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // 인라인 확인 UI
  confirmBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 14,
    padding: 16,
    marginBottom: 4,
  },
  confirmText:    { fontSize: 15, color: '#1C1917', lineHeight: 24, marginBottom: 14 },
  confirmKeyword: { fontWeight: '700', color: Colors.primary },
  confirmBtns:    { flexDirection: 'row', gap: 10 },
  confirmCancelBtn: {
    flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center',
    backgroundColor: '#E7E5E4',
  },
  confirmCancelText: { fontWeight: '600', color: '#78716C', fontSize: 15 },
  confirmSaveBtn: {
    flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  confirmSaveText: { fontWeight: '700', color: '#fff', fontSize: 15 },
});
