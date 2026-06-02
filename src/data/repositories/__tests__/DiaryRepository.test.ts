import { DiaryRepository } from '../DiaryRepository';
import { Diary } from '../../../domain/entities/Diary';

// AsyncStorage Mock
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';

const mockGetItem = AsyncStorage.getItem as jest.Mock;
const mockSetItem = AsyncStorage.setItem as jest.Mock;

// 테스트용 일기 샘플
const makeDiary = (override?: Partial<Diary>): Diary => ({
  id: 'test-id-1',
  date: '2026-06-01',
  content: '오늘 좋은 하루였다',
  createdAt: '2026-06-01T09:00:00.000Z',
  updatedAt: '2026-06-01T09:00:00.000Z',
  ...override,
});

describe('DiaryRepository', () => {
  let repo: DiaryRepository;

  beforeEach(() => {
    repo = new DiaryRepository();
    jest.clearAllMocks();
    mockSetItem.mockResolvedValue(undefined);
  });

  // ─── save ───────────────────────────────
  it('일기를 저장하면 AsyncStorage에 기록된다', async () => {
    mockGetItem.mockResolvedValue(null); // 기존 데이터 없음
    const diary = makeDiary();

    await repo.save(diary);

    expect(mockSetItem).toHaveBeenCalledTimes(1);
    const saved = JSON.parse(mockSetItem.mock.calls[0][1]);
    expect(saved).toHaveLength(1);
    expect(saved[0].id).toBe('test-id-1');
  });

  // ─── findAll ────────────────────────────
  it('저장된 일기 전체를 불러올 수 있다', async () => {
    const diaries = [makeDiary(), makeDiary({ id: 'test-id-2', date: '2026-06-02' })];
    mockGetItem.mockResolvedValue(JSON.stringify(diaries));

    const result = await repo.findAll();

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('test-id-1');
    expect(result[1].id).toBe('test-id-2');
  });

  // ─── findById ───────────────────────────
  it('id로 특정 일기를 찾을 수 있다', async () => {
    const diaries = [makeDiary(), makeDiary({ id: 'test-id-2' })];
    mockGetItem.mockResolvedValue(JSON.stringify(diaries));

    const result = await repo.findById('test-id-2');

    expect(result).not.toBeNull();
    expect(result?.id).toBe('test-id-2');
  });

  it('없는 id로 조회하면 null을 반환한다', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify([makeDiary()]));

    const result = await repo.findById('없는-id');

    expect(result).toBeNull();
  });

  // ─── delete ─────────────────────────────
  it('일기를 삭제하면 목록에서 사라진다', async () => {
    const diaries = [makeDiary(), makeDiary({ id: 'test-id-2' })];
    mockGetItem.mockResolvedValue(JSON.stringify(diaries));

    await repo.delete('test-id-1');

    const saved = JSON.parse(mockSetItem.mock.calls[0][1]);
    expect(saved).toHaveLength(1);
    expect(saved[0].id).toBe('test-id-2');
  });

  // ─── toggleFavorite ─────────────────────
  it('즐겨찾기 토글 — false에서 true로 변경된다', async () => {
    const diary = makeDiary({ favorite: false });
    mockGetItem.mockResolvedValue(JSON.stringify([diary]));

    await repo.toggleFavorite('test-id-1');

    const saved = JSON.parse(mockSetItem.mock.calls[0][1]);
    expect(saved[0].favorite).toBe(true);
  });

  it('즐겨찾기 토글 — true에서 false로 변경된다', async () => {
    const diary = makeDiary({ favorite: true });
    mockGetItem.mockResolvedValue(JSON.stringify([diary]));

    await repo.toggleFavorite('test-id-1');

    const saved = JSON.parse(mockSetItem.mock.calls[0][1]);
    expect(saved[0].favorite).toBe(false);
  });
});
