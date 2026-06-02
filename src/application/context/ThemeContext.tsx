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
  bg:      '#FAF9F5',
  card:    '#EFE9DE',
  text:    '#1C1917',
  subText: '#78716C',
  border:  '#E7E5E4',
  accent:  '#CC785C',
};

const DARK_COLORS: ThemeValues['colors'] = {
  bg:      '#1C1917',
  card:    '#292524',
  text:    '#FAF9F5',
  subText: '#A8A29E',
  border:  '#3F3A37',
  accent:  '#E8A55A',
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
