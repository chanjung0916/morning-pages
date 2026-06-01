import { Diary } from '../../domain/entities/Diary';

/**
 * Repository Interface (추상)
 * Domain이 Data 구현에 직접 의존하지 않도록 인터페이스로 분리
 */
export interface IDiaryRepository {
  save(diary: Diary): Promise<void>;
  update(diary: Diary): Promise<void>;
  findAll(): Promise<Diary[]>;
  findById(id: string): Promise<Diary | null>;
  findByDate(date: string): Promise<Diary | null>;
  delete(id: string): Promise<void>;
  toggleFavorite(id: string): Promise<void>;
}
