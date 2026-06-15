/**
 * 개발용 더미 데이터 시드
 * 설정 화면에서 "더미 데이터 삽입" 버튼으로 호출
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Diary } from '../domain/entities/Diary';
import { CustomTopic } from '../data/repositories/CustomTopicRepository';

const DIARY_KEY  = '@morning_pages:diaries';
const TOPICS_KEY = '@morning_pages:custom_topics';

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function iso(dateStr: string): string {
  return new Date(dateStr + 'T08:00:00').toISOString();
}

// ── 커스텀 주제 ─────────────────────────────────────────
const SEED_TOPICS: CustomTopic[] = [
  // 감사
  {
    id: 'topic-1', topic: '오늘의 감사', category: '감사',
    prompts: ['오늘 감사했던 작은 일은 무엇인가요?', '누군가에게 고마운 마음이 들었던 순간은?'],
    createdAt: iso('2026-01-01'), updatedAt: iso('2026-01-01'),
  },
  {
    id: 'topic-2', topic: '감사한 사람', category: '감사',
    prompts: ['오늘 내 삶에 긍정적인 영향을 준 사람은 누구인가요?'],
    createdAt: iso('2026-01-01'), updatedAt: iso('2026-01-01'),
  },
  {
    id: 'topic-3', topic: '일상의 기적', category: '감사',
    prompts: ['당연하게 여겼지만 사실은 소중한 것은 무엇인가요?'],
    createdAt: iso('2026-01-01'), updatedAt: iso('2026-01-01'),
  },

  // 성장
  {
    id: 'topic-4', topic: '오늘의 배움', category: '성장',
    prompts: ['오늘 새롭게 배우거나 깨달은 것은 무엇인가요?'],
    createdAt: iso('2026-02-01'), updatedAt: iso('2026-02-01'),
  },
  {
    id: 'topic-5', topic: '도전과 극복', category: '성장',
    prompts: ['오늘 어려웠던 순간과 어떻게 넘겼는지 적어보세요', '내가 한 단계 성장한 것 같은 경험은?'],
    createdAt: iso('2026-02-01'), updatedAt: iso('2026-02-01'),
  },
  {
    id: 'topic-6', topic: '나의 목표', category: '성장',
    prompts: ['이번 주 이루고 싶은 작은 목표는 무엇인가요?'],
    createdAt: iso('2026-02-01'), updatedAt: iso('2026-02-01'),
  },
  {
    id: 'topic-7', topic: '루틴 점검', category: '성장',
    prompts: ['오늘 지킨 좋은 습관은? 개선하고 싶은 점은?'],
    createdAt: iso('2026-03-01'), updatedAt: iso('2026-03-01'),
  },

  // 일상
  {
    id: 'topic-8', topic: '오늘의 하루', category: '일상',
    prompts: ['오늘 하루를 한 문장으로 표현한다면?', '가장 기억에 남는 장면은 무엇인가요?'],
    createdAt: iso('2026-03-01'), updatedAt: iso('2026-03-01'),
  },
  {
    id: 'topic-9', topic: '소소한 즐거움', category: '일상',
    prompts: ['오늘 작은 행복을 느꼈던 순간은?'],
    createdAt: iso('2026-03-01'), updatedAt: iso('2026-03-01'),
  },
  {
    id: 'topic-10', topic: '날씨와 계절', category: '일상',
    prompts: ['오늘 날씨나 계절이 기분에 어떤 영향을 미쳤나요?'],
    createdAt: iso('2026-04-01'), updatedAt: iso('2026-04-01'),
  },

  // 감정
  {
    id: 'topic-11', topic: '감정 탐구', category: '감정',
    prompts: ['오늘 가장 강하게 느낀 감정은 무엇인가요?', '그 감정은 어디서 왔을까요?'],
    createdAt: iso('2026-04-01'), updatedAt: iso('2026-04-01'),
  },
  {
    id: 'topic-12', topic: '마음 돌봄', category: '감정',
    prompts: ['지금 내 마음 상태를 솔직하게 표현해본다면?'],
    createdAt: iso('2026-04-01'), updatedAt: iso('2026-04-01'),
  },
];

// ── 일기 더미 데이터 ────────────────────────────────────
const CONTENTS = [
  '오늘 오랜만에 공원을 산책했다. 봄바람이 부드럽게 불어오고 벚꽃이 흩날리는 모습이 너무 아름다웠다. 이런 평범한 순간이 사실 가장 소중한 것 같다.',
  '프로젝트 마감이 다가오면서 마음이 조금 무거웠지만, 팀원들과 함께 끝까지 해냈다. 서로 격려하는 말 한마디가 큰 힘이 됐다.',
  '늦은 밤 조용한 카페에서 커피 한 잔을 마시며 책을 읽었다. 오래간만에 혼자만의 시간을 가지니 머릿속이 정리되는 느낌이었다.',
  '새벽 운동을 시작한 지 일주일째. 처음엔 힘들었지만 이제는 하루를 시작하는 루틴이 생긴 것 같아 뿌듯하다.',
  '오늘은 별다른 일이 없었다. 그냥 평범한 하루였는데, 이런 평온함도 감사한 일이라는 생각이 들었다.',
  '친구와 오랜만에 만나 밥을 먹었다. 시간이 많이 흘렀는데도 대화가 끊이지 않았다. 좋은 사람 곁에 있다는 것이 얼마나 큰 행복인지.',
  '업무 중 실수를 해서 마음이 좋지 않았다. 하지만 실수를 통해 더 배울 수 있다고 스스로를 다독였다. 내일은 더 잘할 수 있을 것이다.',
  '요즘 너무 바빠서 나 자신을 돌보지 못한 것 같다. 오늘은 일찍 자고 내일부터 조금씩 여유를 만들어봐야겠다.',
  '처음으로 요리를 제대로 해봤다. 레시피를 보면서 따라 만든 파스타가 생각보다 맛있게 완성되어서 스스로 놀랐다.',
  '비 오는 날 창가에 앉아 빗소리를 들으며 일기를 쓰고 있다. 이런 순간이 너무 좋다. 마음이 차분해지고 생각이 정리된다.',
  '오늘은 감사한 일이 많았다. 작은 것들 — 따뜻한 햇살, 맛있는 점심, 동료의 미소 — 이런 것들이 모여 좋은 하루를 만든다.',
  '명상을 처음 해봤다. 10분 동안 눈을 감고 호흡에 집중하는 것이 처음엔 어색했지만 끝나고 나서 마음이 한결 가벼워졌다.',
  '가족과 통화를 오래 했다. 멀리 있어도 목소리만 들어도 힘이 난다. 더 자주 연락해야겠다고 다짐했다.',
  '새로운 취미를 시작해볼까 고민 중이다. 그림 그리기, 기타 배우기, 수영 — 어떤 것이든 즐겁게 할 수 있을 것 같다.',
  '오늘 읽은 책에서 마음에 드는 구절을 발견했다. "모든 것은 지나간다." 힘든 순간도, 좋은 순간도. 그래서 지금 이 순간에 충실해야 한다.',
  '운동 후 샤워하고 따뜻한 차를 마시는 이 시간이 하루 중 가장 좋다. 몸도 마음도 개운하다.',
  '오늘 발표가 있었는데 생각보다 잘 됐다. 준비한 만큼 나온 것 같아서 뿌듯했다.',
  '친구가 힘들다고 연락이 왔다. 옆에서 들어주는 것 외에 딱히 해줄 수 있는 게 없어서 미안했지만, 그 친구가 나한테 먼저 연락해줬다는 것이 고마웠다.',
  '오늘 길을 걷다가 고양이를 만났다. 잠시 쪼그려 앉아서 쓰다듬었는데 기분이 너무 좋아졌다. 작은 것에 행복을 느끼는 능력을 잃지 말아야겠다.',
  '올해가 벌써 반이나 지났다. 연초에 세웠던 목표들을 돌아봤다. 잘 된 것도 있고 아직 부족한 것도 있지만, 그냥 이 과정 자체가 성장이라고 생각하기로 했다.',
];

// 날짜 목록 생성 (2026년 올해 기준 불규칙하게)
function buildDates(): string[] {
  const result: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 2026년 1월부터 오늘까지 60% 확률로 작성
  const start = new Date(today.getFullYear(), 0, 1);
  let cur = new Date(start);
  while (cur <= today) {
    // 주말 70%, 평일 55% 확률
    const isWeekend = cur.getDay() === 0 || cur.getDay() === 6;
    const prob = isWeekend ? 0.70 : 0.55;
    if (Math.random() < prob) {
      result.push(cur.toISOString().slice(0, 10));
    }
    cur.setDate(cur.getDate() + 1);
  }
  return result;
}

// 즐겨찾기로 찍을 인덱스 (30% 확률)
function isFav(i: number, total: number): boolean {
  // 골고루 분포되도록 결정론적으로
  return (i * 7 + 3) % 10 < 3;
}

export async function seedDummyData(): Promise<void> {
  // 1. 주제 저장
  await AsyncStorage.setItem(TOPICS_KEY, JSON.stringify(SEED_TOPICS));

  // 2. 일기 생성
  const dates = buildDates();
  const topicIds = SEED_TOPICS.map((t) => t.id);

  const diaries: Diary[] = dates.map((date, i) => {
    const content  = CONTENTS[i % CONTENTS.length];
    const topicId  = topicIds[i % topicIds.length];
    const favorite = isFav(i, dates.length);

    return {
      id:        `diary-${i}-${uid()}`,
      date,
      content,
      topicId,
      favorite,
      createdAt: iso(date),
      updatedAt: iso(date),
    };
  });

  await AsyncStorage.setItem(DIARY_KEY, JSON.stringify(diaries));
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([DIARY_KEY, TOPICS_KEY]);
}
