import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_KEY = '@morning_pages:user_profile';

export const DEFAULT_SLOGAN = 'morning pages';

export type Gender = 'male' | 'female' | 'other' | '';

export interface UserProfile {
  nickname:  string;
  gender:    Gender;
  birthday:  string;   // YYYY-MM-DD
  bio:       string;   // 한줄 소개
  slogan:    string;
  avatar:    string;   // emoji
}

const DEFAULT_PROFILE: UserProfile = {
  nickname:  '',
  gender:    '',
  birthday:  '',
  bio:       '',
  slogan:    DEFAULT_SLOGAN,
  avatar:    '🙂',
};

export class UserProfileRepository {
  async getProfile(): Promise<UserProfile> {
    try {
      const raw = await AsyncStorage.getItem(PROFILE_KEY);
      if (!raw) return { ...DEFAULT_PROFILE };
      const parsed = JSON.parse(raw) as Partial<UserProfile>;
      return { ...DEFAULT_PROFILE, ...parsed };
    } catch {
      return { ...DEFAULT_PROFILE };
    }
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }

  // 슬로건만 업데이트 (HomeScreen 호환)
  async updateSlogan(slogan: string): Promise<void> {
    const current = await this.getProfile();
    await this.saveProfile({ ...current, slogan });
  }
}
