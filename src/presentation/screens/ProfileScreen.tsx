import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { useTheme } from '../../application/context/ThemeContext';
import { UserProfileRepository, DEFAULT_SLOGAN, Gender } from '../../data/repositories/UserProfileRepository';

const profileRepo = new UserProfileRepository();

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male',   label: '남성' },
  { value: 'female', label: '여성' },
  { value: 'other',  label: '기타' },
];

export default function ProfileScreen() {
  const { colors } = useTheme();

  const [savedName,     setSavedName]     = useState('');
  const [savedBirthday, setSavedBirthday] = useState('');
  const [saved,         setSaved]         = useState(false);

  const [name,     setName]     = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender,   setGender]   = useState<Gender>('');
  const [slogan,   setSlogan]   = useState('');

  useEffect(() => {
    (async () => {
      const p = await profileRepo.getProfile();
      setName(p.nickname);
      setBirthday(p.birthday);
      setGender(p.gender);
      setSlogan(p.slogan);
      setSavedName(p.nickname);
      setSavedBirthday(p.birthday);
    })();
  }, []);

  const calcAge = (bd: string): number | null => {
    if (!bd || !/^\d{4}-\d{2}-\d{2}$/.test(bd)) return null;
    const [y, m, d] = bd.split('-').map(Number);
    const today = new Date();
    let age = today.getFullYear() - y;
    if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age--;
    return age >= 0 ? age : null;
  };

  const calcNextBirthday = (bd: string): string => {
    if (!bd || !/^\d{4}-\d{2}-\d{2}$/.test(bd)) return '';
    const [, m, d] = bd.split('-').map(Number);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let next = new Date(today.getFullYear(), m - 1, d);
    if (next < today) next = new Date(today.getFullYear() + 1, m - 1, d);
    const diff = Math.round((next.getTime() - today.getTime()) / 86400000);
    return diff === 0 ? '🎂 오늘 생일이에요!' : `생일까지 D-${diff}`;
  };

  const handleSave = async () => {
    if (birthday && !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
      Alert.alert('형식 오류', '생년월일을 YYYY-MM-DD 형식으로 입력해주세요\n예: 2000-03-15');
      return;
    }
    const current = await profileRepo.getProfile();
    await profileRepo.saveProfile({
      ...current,
      nickname: name.trim(),
      birthday: birthday.trim(),
      gender,
      slogan: slogan.trim() || DEFAULT_SLOGAN,
    });
    setSavedName(name.trim());
    setSavedBirthday(birthday.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSloganReset = () => {
    Alert.alert('슬로건 초기화', '기본 슬로건으로 되돌릴까요?', [
      { text: '취소', style: 'cancel' },
      { text: '초기화', style: 'destructive', onPress: () => setSlogan(DEFAULT_SLOGAN) },
    ]);
  };

  const age = calcAge(savedBirthday);
  const displayGender = GENDER_OPTIONS.find(g => g.value === gender)?.label ?? '';
  const s = makeStyles(colors);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

      {/* ── 다크 히어로 ── */}
      <View style={s.hero}>
        <View style={s.avatarCircle}>
          <Text style={s.avatarText}>
            {savedName ? savedName.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
        <Text style={s.heroName}>{savedName || '이름을 입력해주세요'}</Text>
        <View style={s.heroBadgeRow}>
          {age !== null && (
            <View style={s.heroBadge}>
              <Text style={s.heroBadgeText}>만 {age}세</Text>
            </View>
          )}
          {displayGender ? (
            <View style={s.heroBadge}>
              <Text style={s.heroBadgeText}>{displayGender}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* ── 기본 정보 ── */}
      <Text style={s.sectionLabel}>기본 정보</Text>
      <View style={s.card}>
        <View style={s.fieldRow}>
          <Text style={s.fieldLabel}>이름</Text>
          <TextInput
            style={s.fieldInput}
            value={name}
            onChangeText={setName}
            placeholder="이름을 입력하세요"
            placeholderTextColor={colors.subText}
            returnKeyType="done"
            maxLength={20}
          />
        </View>

        <View style={[s.fieldRow, s.fieldRowBorder]}>
          <Text style={s.fieldLabel}>생년월일</Text>
          <View style={s.fieldRight}>
            <TextInput
              style={[s.fieldInput, { flex: 0, minWidth: 130 }]}
              value={birthday}
              onChangeText={setBirthday}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.subText}
              keyboardType="numeric"
              maxLength={10}
              returnKeyType="done"
            />
            {calcAge(birthday) !== null && (
              <Text style={s.ageTag}>만 {calcAge(birthday)}세</Text>
            )}
          </View>
        </View>

        <View style={[s.fieldRow, s.fieldRowBorder, { borderBottomWidth: 0 }]}>
          <Text style={s.fieldLabel}>성별</Text>
          <View style={s.genderRow}>
            {GENDER_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[s.genderPill, gender === opt.value && s.genderPillActive]}
                onPress={() => setGender(gender === opt.value ? '' : opt.value)}
                activeOpacity={0.7}
              >
                <Text style={[s.genderPillText, gender === opt.value && s.genderPillTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {calcNextBirthday(birthday) ? (
        <Text style={s.dday}>{calcNextBirthday(birthday)}</Text>
      ) : null}

      {/* ── 나의 슬로건 ── */}
      <Text style={s.sectionLabel}>나의 슬로건</Text>
      <View style={s.card}>
        <View style={s.sloganHeader}>
          <Text style={s.fieldLabel}>홈 화면 슬로건</Text>
          <TouchableOpacity onPress={handleSloganReset}>
            <Text style={s.resetBtn}>초기화</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={s.sloganInput}
          value={slogan}
          onChangeText={setSlogan}
          multiline
          numberOfLines={3}
          placeholder="나만의 슬로건을 입력하세요"
          placeholderTextColor={colors.subText}
          textAlignVertical="top"
        />
      </View>

      {/* ── 저장 버튼 ── */}
      <TouchableOpacity style={s.saveBtn} onPress={handleSave} activeOpacity={0.85}>
        <Text style={s.saveBtnText}>{saved ? '✓ 저장됐습니다' : '저장'}</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    content:   { paddingBottom: 56 },

    hero: {
      backgroundColor: Colors.ink,
      paddingHorizontal: 20, paddingTop: 32, paddingBottom: 32,
      alignItems: 'center',
    },
    avatarCircle: {
      width: 80, height: 80, borderRadius: 40,
      backgroundColor: Colors.primary,
      alignItems: 'center', justifyContent: 'center', marginBottom: 14,
    },
    avatarText:  { fontSize: 32, fontWeight: '800', color: '#fff' },
    heroName:    { fontSize: 22, fontWeight: '700', color: Colors.onDark, letterSpacing: -0.3, marginBottom: 10 },
    heroBadgeRow: { flexDirection: 'row', gap: 8 },
    heroBadge: {
      paddingHorizontal: 12, paddingVertical: 4, borderRadius: 60,
      backgroundColor: 'rgba(255,255,255,0.12)',
    },
    heroBadgeText: { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },

    sectionLabel: {
      fontSize: 11, fontWeight: '800', color: colors.accent,
      letterSpacing: 1, textTransform: 'uppercase',
      paddingHorizontal: 20, marginTop: 28, marginBottom: 8,
    },

    card: {
      backgroundColor: colors.card, marginHorizontal: 16,
      borderRadius: 6, borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
    },

    fieldRow: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 16, paddingVertical: 14, gap: 12,
    },
    fieldRowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
    fieldLabel: { fontSize: 14, fontWeight: '600', color: colors.text, width: 68 },
    fieldRight: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
    fieldInput: {
      flex: 1, fontSize: 14, color: colors.text,
      paddingVertical: 6, paddingHorizontal: 10,
      borderRadius: 6, borderWidth: 1, borderColor: colors.border,
      backgroundColor: colors.bg,
    },
    ageTag: { fontSize: 12, color: colors.accent, fontWeight: '700' },

    genderRow: { flex: 1, flexDirection: 'row', gap: 8 },
    genderPill: {
      paddingHorizontal: 16, paddingVertical: 7, borderRadius: 60,
      borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.bg,
    },
    genderPillActive:     { borderColor: colors.accent, backgroundColor: colors.accent },
    genderPillText:       { fontSize: 13, color: colors.subText, fontWeight: '600' },
    genderPillTextActive: { color: '#fff' },

    dday: { fontSize: 12, color: colors.accent, fontWeight: '600', textAlign: 'center', marginTop: 8 },

    sloganHeader: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10,
    },
    resetBtn:    { fontSize: 12, color: colors.subText, fontWeight: '600' },
    sloganInput: {
      fontSize: 14, color: colors.text,
      paddingHorizontal: 16, paddingBottom: 16, lineHeight: 22, minHeight: 72,
    },

    saveBtn: {
      marginHorizontal: 16, marginTop: 32,
      backgroundColor: colors.accent, borderRadius: 60,
      paddingVertical: 16, alignItems: 'center',
    },
    saveBtnText: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  });
}
