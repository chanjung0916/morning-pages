import AsyncStorage from '@react-native-async-storage/async-storage';
import { Diary } from '../../domain/entities/Diary';
import { IDiaryRepository } from './IDiaryRepository';

const STORAGE_KEY = '@morning_pages:diaries';

/**
 * Data Layer: AsyncStorage 기반 일기 저장소
 * ADR-0002 참조: 오프라인 완전 동작, 로컬 키-값 저장
 */
export class DiaryRepository implements IDiaryRepository {
  private async loadAll(): Promise<Diary[]> {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return [];
    return JSON.parse(json) as Diary[];
  }

  private async saveAll(diaries: Diary[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(diaries));
  }

  async save(diary: Diary): Promise<void> {
    const diaries = await this.loadAll();
    diaries.push(diary);
    await this.saveAll(diaries);
  }

  async update(diary: Diary): Promise<void> {
    const diaries = await this.loadAll();
    const idx = diaries.findIndex((d) => d.id === diary.id);
    if (idx === -1) throw new Error(`Diary not found: ${diary.id}`);
    diaries[idx] = { ...diary, updatedAt: new Date().toISOString() };
    await this.saveAll(diaries);
  }

  async findAll(): Promise<Diary[]> {
    return this.loadAll();
  }

  async findById(id: string): Promise<Diary | null> {
    const diaries = await this.loadAll();
    return diaries.find((d) => d.id === id) ?? null;
  }

  async findByDate(date: string): Promise<Diary | null> {
    const diaries = await this.loadAll();
    return diaries.find((d) => d.date === date) ?? null;
  }

  async delete(id: string): Promise<void> {
    const diaries = await this.loadAll();
    await this.saveAll(diaries.filter((d) => d.id !== id));
  }

  async toggleFavorite(id: string): Promise<void> {
    const diaries = await this.loadAll();
    const idx = diaries.findIndex((d) => d.id === id);
    if (idx === -1) return;
    diaries[idx] = {
      ...diaries[idx],
      favorite: !diaries[idx].favorite,
      updatedAt: new Date().toISOString(),
    };
    await this.saveAll(diaries);
  }
}
