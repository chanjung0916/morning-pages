/**
 * 날짜 유틸리티
 */

/** 오늘 날짜를 'YYYY-MM-DD' 형식으로 반환 */
export function today(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

/** UUID v4 간단 구현 (crypto 없는 환경 대응) */
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** 'YYYY-MM-DD' → '5월 26일' 형식 */
export function formatDate(dateStr: string): string {
  const [, month, day] = dateStr.split('-');
  return `${parseInt(month, 10)}월 ${parseInt(day, 10)}일`;
}
