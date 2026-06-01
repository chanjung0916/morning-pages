import { Diary } from '../entities/Diary';
import { IDiaryRepository } from '../../data/repositories/IDiaryRepository';

/**
 * UseCase: 일기 목록 조회
 */
export class GetDiariesUseCase {
  constructor(private readonly repo: IDiaryRepository) {}

  async execute(): Promise<Diary[]> {
    const diaries = await this.repo.findAll();
    // 날짜 내림차순 정렬 (최신 일기가 위)
    return diaries.sort((a, b) => b.date.localeCompare(a.date));
  }

  async executeByDate(date: string): Promise<Diary | null> {
    return this.repo.findByDate(date);
  }
}
