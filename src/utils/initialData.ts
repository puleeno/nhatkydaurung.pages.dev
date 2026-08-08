import { DailyLog, PeriodCycle, CycleSettings } from '../types';

// Format YYYY-MM-DD
export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDaysToDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return formatDateKey(d);
}

export const DEFAULT_SETTINGS: CycleSettings = {
  averageCycleLength: 28,
  averagePeriodLength: 5,
  lutealPhaseLength: 14,
  reminderEnabled: true,
  reminderDaysBefore: 2,
};

// Generate dynamic initial data relative to today so calendar is immediately rich
export function getInitialData(): { cycles: PeriodCycle[]; logs: Record<string, DailyLog>; settings: CycleSettings } {
  const today = new Date();
  
  // Previous period 1: started ~25 days ago
  const period1Start = new Date(today);
  period1Start.setDate(today.getDate() - 25);
  const period1StartStr = formatDateKey(period1Start);
  
  // Previous period 2: started ~53 days ago (~28 days before period 1)
  const period2Start = new Date(today);
  period2Start.setDate(today.getDate() - 53);
  const period2StartStr = formatDateKey(period2Start);

  const cycles: PeriodCycle[] = [
    {
      id: 'cycle-1',
      startDate: period1StartStr,
      endDate: addDaysToDate(period1StartStr, 4),
      lengthInDays: 5,
    },
    {
      id: 'cycle-2',
      startDate: period2StartStr,
      endDate: addDaysToDate(period2StartStr, 4),
      lengthInDays: 5,
      cycleLength: 28,
    }
  ];

  const logs: Record<string, DailyLog> = {};

  // Fill period 1 logs
  logs[addDaysToDate(period1StartStr, 0)] = {
    date: addDaysToDate(period1StartStr, 0),
    isPeriod: true,
    flow: 'medium',
    moods: ['tired', 'sensitive'],
    symptoms: ['cramps', 'backache'],
    waterGlasses: 6,
    notes: 'Ngày đầu tiên, hơi mệt và đau nhẹ bụng dưới.',
  };
  logs[addDaysToDate(period1StartStr, 1)] = {
    date: addDaysToDate(period1StartStr, 1),
    isPeriod: true,
    flow: 'heavy',
    moods: ['sensitive', 'tired'],
    symptoms: ['cramps', 'bloating', 'fatigue'],
    waterGlasses: 8,
    notes: 'Kinh ra nhiều hơn, uống trà gừng ấm thấy đỡ đau.',
  };
  logs[addDaysToDate(period1StartStr, 2)] = {
    date: addDaysToDate(period1StartStr, 2),
    isPeriod: true,
    flow: 'medium',
    moods: ['calm'],
    symptoms: ['backache'],
    waterGlasses: 7,
    notes: 'Đã bớt đau bụng, năng lượng bắt đầu hồi phục.',
  };
  logs[addDaysToDate(period1StartStr, 3)] = {
    date: addDaysToDate(period1StartStr, 3),
    isPeriod: true,
    flow: 'light',
    moods: ['happy', 'energetic'],
    symptoms: [],
    waterGlasses: 8,
    notes: 'Cảm thấy thoải mái hơn nhiều.',
  };
  logs[addDaysToDate(period1StartStr, 4)] = {
    date: addDaysToDate(period1StartStr, 4),
    isPeriod: true,
    flow: 'spotting',
    moods: ['happy'],
    symptoms: [],
    waterGlasses: 8,
  };

  // Fertile window days for period 1 (ovulation ~ day 14)
  const ovulation1 = addDaysToDate(period1StartStr, 13);
  logs[ovulation1] = {
    date: ovulation1,
    isPeriod: false,
    discharge: 'egg_white',
    moods: ['energetic', 'happy'],
    symptoms: ['breast_tenderness'],
    bbt: 36.8,
    waterGlasses: 8,
    notes: 'Dịch âm đạo trong như lòng trắng trứng, ngày rụng trứng dự đoán.',
  };

  // Recent day log (yesterday or today)
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = formatDateKey(yesterday);
  logs[yesterdayStr] = {
    date: yesterdayStr,
    isPeriod: false,
    moods: ['happy', 'calm'],
    symptoms: ['cravings'],
    waterGlasses: 7,
    notes: 'Thèm ăn đồ ngọt nhẹ, tâm trạng vui vẻ.',
  };

  return {
    cycles,
    logs,
    settings: DEFAULT_SETTINGS,
  };
}
