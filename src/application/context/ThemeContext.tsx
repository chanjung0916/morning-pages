import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@morning_pages:theme';

export type FontSize = 'small' | 'medium' | 'large';

interface ThemeValues {
  isDark: boolean;
  fontSize: FontSize;
  // 컬러 팔레트
  colors: {
    bg: string;
    card: string;
    text: string;
    subText: string;
    border: string;
    accent: string;
  };
  // 폰트 크기 배율
  fontScale: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  toggleDark: () => void;
  setFontSize: (size: FontSize) => void;
}

const FONT_SCALES: Record<FontSize, ThemeValues['fontScale']> = {
  small:  { xs: 10, sm: 12, md: 14, lg: 17, xl: 22 },
  medium: { xs: 11, sm: 13, md: 16, lg: 19, xl: 26 },
  large:  { xs: 13, sm: 15, md: 18, lg: 22, xl: 30 },
};

const LIGHT_COLORS: ThemeValues['colors'] = {
  bg:      '#ffffff',   // Canvas
  card:    '#f2f2f2',   // Canvas Soft
  text:    '#25282b',   // Ink
  subText: '#7e7e7e',   // Body
  border:  '#e5e5e5',   // Hairline
  accent:  '#d97706',   // Warm Amber
};

const DARK_COLORS: ThemeValues['colors'] = {
  bg:      '#1e2124',   // 더 깊은 다크
  card:    '#2c2f33',   // 카드
  text:    '#d4d4d4',   // 눈 편한 오프화이트
  subText: '#8a8a8a',   // 서브텍스트
  border:  '#3a3d42',   // 구분선
  accent:  '#f59e0b',   // Amber (다크 위에서 밝게)
};

const ThemeContext = createContext<ThemeValues>({} as ThemeValues);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [fontSize, setFontSizeState] = useState<FontSize>('medium');

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((raw) => {
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.isDark !== undefined) setIsDark(saved.isDark);
      if (saved.fontSize) setFontSizeState(saved.fontSize);
    });
  }, []);

  const save = (dark: boolean, size: FontSize) => {
    AsyncStorage.setItem(THEME_KEY, JSON.stringify({ isDark: dark, fontSize: size }));
  };

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    save(next, fontSize);
  };

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    save(isDark, size);
  };

  const value: ThemeValues = {
    isDark,
    fontSize,
    colors: isDark ? DARK_COLORS : LIGHT_COLORS,
    fontScale: FONT_SCALES[fontSize],
    toggleDark,
    setFontSize,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
