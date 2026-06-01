import React, { createContext, useContext, useEffect } from 'react';
import { useDiaryViewModel } from '../viewmodels/DiaryViewModel';

/**
 * Application Layer: DiaryContext
 * 여러 화면에서 일기 데이터를 공유하기 위한 전역 상태
 * ADR-0006 참조: useState + useContext 방식
 */

type DiaryContextType = ReturnType<typeof useDiaryViewModel>;

const DiaryContext = createContext<DiaryContextType | null>(null);

export function DiaryProvider({ children }: { children: React.ReactNode }) {
  const vm = useDiaryViewModel();

  useEffect(() => {
    vm.loadDiaries();
  }, []);

  return <DiaryContext.Provider value={vm}>{children}</DiaryContext.Provider>;
}

export function useDiary(): DiaryContextType {
  const ctx = useContext(DiaryContext);
  if (!ctx) throw new Error('useDiary must be used within DiaryProvider');
  return ctx;
}
