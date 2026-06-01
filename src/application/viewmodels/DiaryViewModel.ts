import { useState, useCallback } from 'react';
import { Diary, DiaryDraft } from '../../domain/entities/Diary';
import { DiaryRepository } from '../../data/repositories/DiaryRepository';
import { SaveDiaryUseCase } from '../../domain/usecases/SaveDiaryUseCase';
import { GetDiariesUseCase } from '../../domain/usecases/GetDiariesUseCase';
import { DeleteDiaryUseCase } from '../../domain/usecases/DeleteDiaryUseCase';

const repo = new DiaryRepository();
const saveUseCase = new SaveDiaryUseCase(repo);
const getUseCase = new GetDiariesUseCase(repo);
const deleteUseCase = new DeleteDiaryUseCase(repo);

/**
 * Application Layer: Diary ViewModel
 * UseCase를 호출하고 화면에 필요한 상태를 관리
 */
export function useDiaryViewModel() {
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDiaries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getUseCase.execute();
      setDiaries(data);
    } catch (e) {
      setError('일기를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveDiary = useCallback(async (draft: DiaryDraft): Promise<boolean> => {
    const result = await saveUseCase.execute(draft);
    if (result.success) {
      await loadDiaries();
      return true;
    }
    setError(result.error ?? '저장에 실패했습니다.');
    return false;
  }, [loadDiaries]);

  const updateDiary = useCallback(async (diary: Diary): Promise<void> => {
    await repo.update(diary);
    await loadDiaries();
  }, [loadDiaries]);

  const deleteDiary = useCallback(async (id: string): Promise<void> => {
    await deleteUseCase.execute(id);
    await loadDiaries();
  }, [loadDiaries]);

  const toggleFavorite = useCallback(async (id: string): Promise<void> => {
    await repo.toggleFavorite(id);
    await loadDiaries();
  }, [loadDiaries]);

  const getDiaryByDate = useCallback(async (date: string): Promise<Diary | null> => {
    return getUseCase.executeByDate(date);
  }, []);

  return {
    diaries,
    isLoading,
    error,
    loadDiaries,
    saveDiary,
    updateDiary,
    deleteDiary,
    toggleFavorite,
    getDiaryByDate,
  };
}
