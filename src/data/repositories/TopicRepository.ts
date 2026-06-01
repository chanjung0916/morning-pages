import { Topic } from '../../domain/entities/Topic';
import topicsData from '../topics.json';

/**
 * Data Layer: 정적 JSON 기반 주제 저장소
 * 오프라인 완전 동작 — 네트워크 불필요
 */
export class TopicRepository {
  findAll(): Topic[] {
    return topicsData as Topic[];
  }

  findById(id: string): Topic | null {
    return (topicsData as Topic[]).find((t) => t.id === id) ?? null;
  }
}
