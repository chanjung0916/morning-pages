import { SaveDiaryUseCase } from '../SaveDiaryUseCase';
import { IDiaryRepository } from '../../../data/repositories/IDiaryRepository';
import { Diary } from '../../entities/Diary';

// Mock Repository
const mockRepo: IDiaryRepository = {
  save: jest.fn(),
  update: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  findByDate: jest.fn(),
  delete: jest.fn(),
  toggleFavorite: jest.fn(),
};

describe('SaveDiaryUseCase', () => {
  beforeEach(() => jest.clearAllMocks());

  it('내용이 없으면 저장하지 않는다', async () => {
    const useCase = new SaveDiaryUseCase(mockRepo);
    const result = await useCase.execute({ date: '2026-05-26', content: '' });
    expect(result.success).toBe(false);
    expect(result.error).toBe('내용을 입력해주세요.');
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('공백만 있는 내용도 저장하지 않는다', async () => {
    const useCase = new SaveDiaryUseCase(mockRepo);
    const result = await useCase.execute({ date: '2026-05-26', content: '   ' });
    expect(result.success).toBe(false);
  });

  it('내용이 있으면 저장에 성공한다', async () => {
    const useCase = new SaveDiaryUseCase(mockRepo);
    const result = await useCase.execute({
      date: '2026-05-26',
      content: '오늘 좋은 하루였다',
    });
    expect(result.success).toBe(true);
    expect(result.diary).toBeDefined();
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('저장된 일기에 날짜가 올바르게 설정된다', async () => {
    const useCase = new SaveDiaryUseCase(mockRepo);
    const result = await useCase.execute({
      date: '2026-05-26',
      content: '테스트 일기',
    });
    expect(result.diary?.date).toBe('2026-05-26');
  });
});
