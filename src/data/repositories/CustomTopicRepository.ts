import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '../../utils/date';

export interface CustomTopic {
  id: string;
  topic: string;
  prompts: string[];
  category: string;   // 프롬프트 생성 시 입력한 키워드 (예: 감사, 성장, 사랑)
  createdAt: string;
  updatedAt?: string; // 통합 시 업데이트 시간
}

const TOPICS_KEY = '@morning_pages:custom_topics';
const ASSIGN_KEY = '@morning_pages:daily_topic_assignments'; // { "[category]|[date]": topicId }

export class CustomTopicRepository {

  // ── 커스텀 주제 CRUD ──────────────────────────

  async findAll(): Promise<CustomTopic[]> {
    try {
      const raw = await AsyncStorage.getItem(TOPICS_KEY);
      return raw ? (JSON.parse(raw) as CustomTopic[]) : [];
    } catch { return []; }
  }

  /** 카테고리별 주제 조회 */
  async findByCategory(category: string): Promise<CustomTopic[]> {
    const all = await this.findAll();
    return all.filter((t) => t.category === category);
  }

  /** 저장된 카테고리 목록 (category 없는 레거시 데이터 제외) */
  async getCategories(): Promise<string[]> {
    const all = await this.findAll();
    return [...new Set(all.map((t) => t.category).filter((c) => !!c))];
  }

  /** AI 파싱 결과를 카테고리 태그와 함께 한 번에 저장 */
  async saveMany(items: { topic: string; prompts: string[] }[], category: string): Promise<CustomTopic[]> {
    const all = await this.findAll();
    const result: CustomTopic[] = [...all];
    const merged: CustomTopic[] = [];

    for (const item of items) {
      const existing = result.find(
        (t) => t.topic === item.topic && t.category === category
      );

      if (existing) {
        // 같은 이름 주제가 있으면 프롬프트 통합 (중복 제거)
        const mergedPrompts = [...new Set([...existing.prompts, ...item.prompts])];
        existing.prompts = mergedPrompts;
        existing.updatedAt = new Date().toISOString();
        merged.push(existing);
      } else {
        // 새 주제 추가
        const newTopic: CustomTopic = {
          id:        generateId(),
          topic:     item.topic,
          prompts:   item.prompts,
          category,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        result.push(newTopic);
        merged.push(newTopic);
      }
    }

    await AsyncStorage.setItem(TOPICS_KEY, JSON.stringify(result));
    return merged;
  }

  // ── 오늘의 주제 배정 (카테고리별) ────────────

  private async getAssignments(): Promise<Record<string, string>> {
    try {
      const raw = await AsyncStorage.getItem(ASSIGN_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  }

  private async setAssignments(a: Record<string, string>): Promise<void> {
    await AsyncStorage.setItem(ASSIGN_KEY, JSON.stringify(a));
  }

  /**
   * 오늘+카테고리에 배정된 주제 반환.
   * 미배정이면 미사용 주제 중 랜덤으로 뽑아 배정.
   */
  async getTodayTopic(
    allTopics: CustomTopic[],
    todayStr: string,
    category: string,
  ): Promise<CustomTopic | null> {
    const pool = allTopics.filter((t) => t.category === category);
    if (pool.length === 0) return null;

    const assignments = await this.getAssignments();
    const key = `${category}|${todayStr}`;

    // 이미 오늘+카테고리에 배정된 경우
    if (assignments[key]) {
      const found = pool.find((t) => t.id === assignments[key]);
      if (found) return found;
    }

    // 해당 카테고리에서 미사용 주제 추출
    const usedIds = new Set(
      Object.entries(assignments)
        .filter(([k]) => k.startsWith(`${category}|`))
        .map(([, v]) => v),
    );
    let available = pool.filter((t) => !usedIds.has(t.id));

    // 모두 사용됐으면 해당 카테고리 배정 초기화
    if (available.length === 0) {
      const reset = Object.fromEntries(
        Object.entries(assignments).filter(([k]) => !k.startsWith(`${category}|`)),
      );
      await this.setAssignments(reset);
      available = pool;
    }

    const picked = available[Math.floor(Math.random() * available.length)];
    await this.setAssignments({ ...assignments, [key]: picked.id });
    return picked;
  }

  /**
   * 오늘 주제 새로고침 — 현재 주제 제외한 미사용 주제 중 랜덤 배정.
   */
  async refreshTodayTopic(
    allTopics: CustomTopic[],
    todayStr: string,
    category: string,
  ): Promise<CustomTopic | null> {
    const pool = allTopics.filter((t) => t.category === category);
    if (pool.length <= 1) return pool[0] ?? null;

    const assignments = await this.getAssignments();
    const key       = `${category}|${todayStr}`;
    const currentId = assignments[key];

    const usedIds = new Set(
      Object.entries(assignments)
        .filter(([k]) => k.startsWith(`${category}|`))
        .map(([, v]) => v),
    );
    let available = pool.filter((t) => !usedIds.has(t.id) && t.id !== currentId);

    if (available.length === 0) {
      const reset = Object.fromEntries(
        Object.entries(assignments).filter(([k]) => !k.startsWith(`${category}|`)),
      );
      await this.setAssignments(reset);
      available = pool.filter((t) => t.id !== currentId);
    }

    if (available.length === 0) return pool.find((t) => t.id !== currentId) ?? pool[0];

    const picked = available[Math.floor(Math.random() * available.length)];
    await this.setAssignments({ ...assignments, [key]: picked.id });
    return picked;
  }
}
