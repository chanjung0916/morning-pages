import React, { useMemo, useRef, useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView, Animated,
} from 'react-native';
import { Diary } from '../../domain/entities/Diary';

interface Props {
  diaries: Diary[];
  onDayPress: (date: string) => void;
}

const CELL    = 15;
const GAP     = 3;
const MONTH_H = 18;
const GRID_H  = CELL * 7 + GAP * 6;
const MONTHS  = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
const DAYS    = ['일','월','화','수','목','금','토'];

function fmt(d: Date): string { return d.toISOString().slice(0, 10); }

/** 날짜 문자열 → '5월 26일' */
function toKorDate(dateStr: string): string {
  const [, m, d] = dateStr.split('-');
  return `${parseInt(m, 10)}월 ${parseInt(d, 10)}일`;
}

function getColor(inYear: boolean, hasDiary: boolean): string {
  if (!inYear)  return 'transparent';
  if (hasDiary) return '#F59E0B';   // 기록 있음 → 황금
  return '#EDE8E3';                  // 기록 없음 → 연한 회색
}

interface CellData {
  col: number; row: number; date: string;
  hasDiary: boolean; isToday: boolean;
  isFuture: boolean; inYear: boolean;
  diaryContent?: string;
}

interface Tooltip { x: number; y: number; row: number; date: string; content?: string; }

export default function ContributionGraph({ diaries, onDayPress }: Props) {
  const scrollRef   = useRef<ScrollView>(null);
  const scrollX     = useRef(0);
  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  const year     = new Date().getFullYear();
  const todayStr = fmt(new Date());

  const { cells, monthPositions, todayCol, totalWeeks } = useMemo(() => {
    const jan1  = new Date(year, 0, 1);
    const start = new Date(jan1);
    start.setDate(jan1.getDate() - jan1.getDay());

    const dec31 = new Date(year, 11, 31);
    const end   = new Date(dec31);
    end.setDate(dec31.getDate() + (6 - dec31.getDay()));

    const tw = Math.round((end.getTime() - start.getTime()) / (7 * 86400000)) + 1;

    const diaryMap = new Map(diaries.map((d) => [d.date, d.content]));
    const today    = new Date(); today.setHours(0, 0, 0, 0);

    const cellArr: CellData[] = [];
    const monthPos: Record<number, number> = {};
    let todayColIdx = 0;

    for (let w = 0; w < tw; w++) {
      for (let d = 0; d < 7; d++) {
        const cur     = new Date(start);
        cur.setDate(start.getDate() + w * 7 + d);
        const dateStr = fmt(cur);
        const inYear  = cur.getFullYear() === year;
        const mo      = cur.getMonth();

        if (inYear && d === 0 && !(mo in monthPos)) monthPos[mo] = w;
        if (dateStr === todayStr) todayColIdx = w;

        cellArr.push({
          col: w, row: d, date: dateStr,
          hasDiary:     diaryMap.has(dateStr),
          diaryContent: diaryMap.get(dateStr),
          isToday:  dateStr === todayStr,
          isFuture: cur > today,
          inYear,
        });
      }
    }
    return { cells: cellArr, monthPositions: monthPos, todayCol: todayColIdx, totalWeeks: tw };
  }, [diaries, year]);

  useEffect(() => {
    const offset = Math.max(0, (todayCol - 8) * (CELL + GAP));
    setTimeout(() => scrollRef.current?.scrollTo({ x: offset, animated: false }), 200);
  }, [todayCol]);

  const showTooltip = (c: CellData) => {
    // 화면 기준 x 위치 = 셀 왼쪽 - 현재 스크롤 오프셋
    const rawX = c.col * (CELL + GAP) - scrollX.current;
    const x    = Math.max(4, rawX);
    const y    = MONTH_H + 4 + c.row * (CELL + GAP);

    setTooltip({ x, y, row: c.row, date: c.date, content: c.diaryContent });
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.delay(2200),
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setTooltip(null));
  };

  const totalW = totalWeeks * (CELL + GAP) - GAP;

  return (
    <View style={styles.wrapper}>
      <View style={styles.outerRow}>
        {/* 고정 요일 레이블 */}
        <View style={styles.dayLabelCol}>
          <View style={{ height: MONTH_H + 4 }} />
          {DAYS.map((d, i) => (
            <View
              key={d}
              style={{
                height: CELL, marginBottom: i < 6 ? GAP : 0,
                justifyContent: 'center', alignItems: 'flex-end', paddingRight: 3,
              }}
            >
              <Text style={[styles.dayLabel, { opacity: i % 2 === 0 ? 0 : 1 }]}>{d}</Text>
            </View>
          ))}
        </View>

        {/* 스크롤 영역 (절대 위치 기반 렌더링) */}
        <View style={{ flex: 1, overflow: 'hidden' }}>
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => { scrollX.current = e.nativeEvent.contentOffset.x; }}
            scrollEventThrottle={16}
            style={{ flex: 1 }}
            contentContainerStyle={{ width: totalW }}
          >
            <View style={{ width: totalW, height: MONTH_H + 4 + GRID_H }}>
              {/* 월 레이블 */}
              {Object.entries(monthPositions).map(([mo, col]) => (
                <Text
                  key={mo}
                  style={[styles.monthLabel, { left: col * (CELL + GAP), top: 0 }]}
                >
                  {MONTHS[Number(mo)]}
                </Text>
              ))}

              {/* 셀 */}
              {cells.map((c) => (
                <TouchableOpacity
                  key={c.date}
                  onPress={() => {}}
                  onLongPress={() => c.inYear && showTooltip(c)}
                  delayLongPress={400}
                  activeOpacity={!c.inYear ? 1 : 0.7}
                  style={[
                    styles.cell,
                    {
                      left: c.col * (CELL + GAP),
                      top:  MONTH_H + 4 + c.row * (CELL + GAP),
                      backgroundColor: getColor(c.inYear, c.hasDiary),
                    },
                    c.isToday && styles.todayCell,
                  ]}
                />
              ))}
            </View>
          </ScrollView>

          {/* 말풍선 툴팁 */}
          {tooltip && (() => {
            const TOOLTIP_W = 180;
            const TOOLTIP_H = 62;
            // row 4~6(하단)이면 툴팁을 위에, 나머지는 아래에
            const showAbove = tooltip.row >= 4;
            // 셀 중앙 x (스크린 기준)
            const cellCenterX = tooltip.x + CELL / 2;
            // 툴팁 left: 셀 중앙에 맞추되 4px 이상 유지
            const tooltipLeft = Math.max(4, cellCenterX - TOOLTIP_W / 2);
            // 화살표 left: 툴팁 내부에서 셀 중앙을 가리키도록, 양 끝 8px 여백
            const arrowLeft = Math.max(8, Math.min(cellCenterX - tooltipLeft - 7, TOOLTIP_W - 22));

            return (
              <Animated.View
                style={[
                  styles.tooltip,
                  {
                    opacity: fadeAnim,
                    left: tooltipLeft,
                    top: showAbove
                      ? tooltip.y - TOOLTIP_H - 8   // 셀 위에 표시
                      : tooltip.y + CELL + 6,        // 셀 아래 표시
                  },
                ]}
                pointerEvents="none"
              >
                <Text style={styles.tooltipDate}>{toKorDate(tooltip.date)}</Text>
                <Text style={styles.tooltipBody} numberOfLines={2}>
                  {tooltip.content
                    ? tooltip.content.slice(0, 40) + (tooltip.content.length > 40 ? '…' : '')
                    : '기록 없음'}
                </Text>
                {/* 말풍선 꼬리 — 방향 + 위치 동적 적용 */}
                <View
                  style={[
                    styles.tooltipArrowBase,
                    showAbove
                      ? styles.tooltipArrowDown   // ↓ 아래 화살표 (툴팁이 위에 있을 때)
                      : styles.tooltipArrowUp,    // ↑ 위 화살표  (툴팁이 아래에 있을 때)
                    { left: arrowLeft },
                  ]}
                />
              </Animated.View>
            );
          })()}
        </View>
      </View>

      {/* 범례 */}
      <View style={styles.legend}>
        <Text style={styles.legendText}>없음</Text>
        {['#EDE8E3','#F59E0B'].map((c) => (
          <View key={c} style={[styles.legendCell, { backgroundColor: c }]} />
        ))}
        <Text style={styles.legendText}>있음</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper:     { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 6 },
  outerRow:    { flexDirection: 'row' },
  dayLabelCol: { flexDirection: 'column', width: 20 },
  dayLabel:    { fontSize: 9, color: '#78716C' },
  monthLabel:  { position: 'absolute', fontSize: 10, color: '#78716C' },

  cell: {
    position: 'absolute',
    width: CELL, height: CELL,
    borderRadius: 3,
  },
  todayCell: { borderWidth: 2, borderColor: '#D97706' },

  // 말풍선
  tooltip: {
    position: 'absolute',
    backgroundColor: '#1C1917',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: 180,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
  tooltipDate: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F5F5F4',
    marginBottom: 3,
  },
  tooltipBody: {
    fontSize: 12,
    color: '#D6D3D1',
    lineHeight: 17,
  },
  // 화살표 공통 베이스
  tooltipArrowBase: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  // ↓ 아래 화살표 (툴팁이 셀 위에 있을 때)
  tooltipArrowDown: {
    bottom: -7,
    borderTopWidth: 7,
    borderTopColor: '#1C1917',
    borderBottomWidth: 0,
  },
  // ↑ 위 화살표 (툴팁이 셀 아래에 있을 때)
  tooltipArrowUp: {
    top: -7,
    borderBottomWidth: 7,
    borderBottomColor: '#1C1917',
    borderTopWidth: 0,
  },

  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  legendCell: { width: 10, height: 10, borderRadius: 2 },
  legendText: { fontSize: 10, color: '#78716C' },
});
