import { Diary, DiaryDraft } from '../entities/Diary';
import { IDiaryRepository } from '../../data/repositories/IDiaryRepository';
import { generateId, today } from '../../utils/date';

export interface SaveResult {
  success: boolean;
  diary?: Diary;
  error?: string;
}

/**
 * UseCase: 일기 저장
 * 핵심 규칙: 내용이 비어 있으면 저장 불가
 */
export class SaveDiaryUseCase {
  constructor(private readonly repo: IDiaryRepository) {}

  async execute(draft: DiaryDraft): Promise<SaveResult> {
    if (!draft.content.trim()) {
      return { success: false, error: '내용을 입력해주세요.' };
    }

    const now = new Date().toISOString();
    const diary: Diary = {
      id: generateId(),
      date: draft.date || today(),
      content: draft.content.trim(),
      topicId: draft.topicId,
      createdAt: now,
      updatedAt: now,
    };

    await this.repo.save(diary);
    return { success: true, diary };
  }
}
