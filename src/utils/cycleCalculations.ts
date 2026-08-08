import { 
  DailyLog, 
  PeriodCycle, 
  CycleSettings, 
  DayStatus, 
  CyclePhase, 
  FlowLevel, 
  MoodType, 
  SymptomType, 
  DischargeType 
} from '../types';
import { formatDateKey, addDaysToDate } from './initialData';

export function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00');
}

export function diffDays(dateStr1: string, dateStr2: string): number {
  const d1 = parseDate(dateStr1);
  const d2 = parseDate(dateStr2);
  const diffTime = d1.getTime() - d2.getTime();
  return Math.round(diffTime / (1000 * 3600 * 24));
}

// Get sorted list of period cycles descending by start date
export function getSortedCycles(cycles: PeriodCycle[]): PeriodCycle[] {
  return [...cycles].sort((a, b) => diffDays(b.startDate, a.startDate));
}

export function getAverageCycleLength(cycles: PeriodCycle[], defaultLength: number = 28): number {
  if (cycles.length < 2) return defaultLength;
  const sorted = getSortedCycles(cycles);
  let totalGap = 0;
  let count = 0;

  for (let i = 0; i < sorted.length - 1; i++) {
    const currentStart = sorted[i].startDate;
    const previousStart = sorted[i + 1].startDate;
    const gap = diffDays(currentStart, previousStart);
    if (gap >= 20 && gap <= 45) {
      totalGap += gap;
      count++;
    }
  }

  if (count === 0) return defaultLength;
  return Math.round(totalGap / count);
}

export function getAveragePeriodLength(cycles: PeriodCycle[], defaultLength: number = 5): number {
  if (cycles.length === 0) return defaultLength;
  let totalDays = 0;
  let count = 0;

  cycles.forEach(c => {
    if (c.lengthInDays && c.lengthInDays > 0 && c.lengthInDays <= 12) {
      totalDays += c.lengthInDays;
      count++;
    } else if (c.endDate) {
      const duration = diffDays(c.endDate, c.startDate) + 1;
      if (duration > 0 && duration <= 12) {
        totalDays += duration;
        count++;
      }
    }
  });

  if (count === 0) return defaultLength;
  return Math.round(totalDays / count);
}

export interface PredictedCycle {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  ovulationDate: string; // YYYY-MM-DD
  fertileWindowStart: string; // YYYY-MM-DD
  fertileWindowEnd: string; // YYYY-MM-DD
}

export function predictFutureCycles(
  lastPeriodStart: string,
  avgCycleLength: number,
  avgPeriodLength: number,
  lutealPhaseLength: number = 14,
  count: number = 6
): PredictedCycle[] {
  const predictions: PredictedCycle[] = [];
  let currentStart = lastPeriodStart;

  for (let i = 0; i < count; i++) {
    const nextStart = addDaysToDate(currentStart, avgCycleLength);
    const periodEnd = addDaysToDate(nextStart, avgPeriodLength - 1);
    const ovulation = addDaysToDate(nextStart, avgCycleLength - lutealPhaseLength);
    const fertileStart = addDaysToDate(ovulation, -5);
    const fertileEnd = addDaysToDate(ovulation, 1);

    predictions.push({
      startDate: nextStart,
      endDate: periodEnd,
      ovulationDate: ovulation,
      fertileWindowStart: fertileStart,
      fertileWindowEnd: fertileEnd,
    });

    currentStart = nextStart;
  }

  return predictions;
}

// Check if a date falls inside a recorded period cycle
export function isDateInRecordedPeriod(dateStr: string, cycles: PeriodCycle[]): boolean {
  return cycles.some(c => {
    const start = c.startDate;
    const end = c.endDate || addDaysToDate(c.startDate, (c.lengthInDays || 5) - 1);
    return dateStr >= start && dateStr <= end;
  });
}

// Compute comprehensive day status for calendar & day details
export function getDayStatus(
  dateStr: string,
  cycles: PeriodCycle[],
  logs: Record<string, DailyLog>,
  settings: CycleSettings
): DayStatus {
  const log = logs[dateStr];
  const sortedCycles = getSortedCycles(cycles);
  const avgCycle = getAverageCycleLength(cycles, settings.averageCycleLength);
  const avgPeriod = getAveragePeriodLength(cycles, settings.averagePeriodLength);
  const luteal = settings.lutealPhaseLength || 14;

  const isPeriodRecorded = (log?.isPeriod) || isDateInRecordedPeriod(dateStr, cycles);

  const lastRecordedStart = sortedCycles.length > 0 ? sortedCycles[0].startDate : null;

  let isPredictedPeriod = false;
  let isOvulationDay = false;
  let isFertileWindow = false;
  let pregnancyChance: DayStatus['pregnancyChance'] = 'rất_thấp';
  let phase: CyclePhase = 'follicular';
  let phaseNameVi = 'Giai đoạn nang trứng';
  let cycleDayNumber: number | undefined = undefined;

  if (lastRecordedStart) {
    const predictions = predictFutureCycles(lastRecordedStart, avgCycle, avgPeriod, luteal, 8);
    
    // Check if in predicted period
    isPredictedPeriod = predictions.some(p => dateStr >= p.startDate && dateStr <= p.endDate);

    // Check if ovulation day or fertile window in predicted cycles
    predictions.forEach(p => {
      if (dateStr === p.ovulationDate) {
        isOvulationDay = true;
      }
      if (dateStr >= p.fertileWindowStart && dateStr <= p.fertileWindowEnd) {
        isFertileWindow = true;
      }
    });

    // Also check ovulation and fertile window for the CURRENT cycle starting from lastRecordedStart
    const currentOvulation = addDaysToDate(lastRecordedStart, avgCycle - luteal);
    const currentFertileStart = addDaysToDate(currentOvulation, -5);
    const currentFertileEnd = addDaysToDate(currentOvulation, 1);

    if (dateStr === currentOvulation) isOvulationDay = true;
    if (dateStr >= currentFertileStart && dateStr <= currentFertileEnd) isFertileWindow = true;

    // Calculate cycle day number from the most recent past start date relative to dateStr
    const pastStarts = sortedCycles
      .map(c => c.startDate)
      .concat(predictions.map(p => p.startDate))
      .filter(s => s <= dateStr)
      .sort((a, b) => diffDays(b, a));

    if (pastStarts.length > 0) {
      const currentStart = pastStarts[0];
      cycleDayNumber = diffDays(dateStr, currentStart) + 1;
    }

    // Pregnancy chance determination
    if (isOvulationDay) {
      pregnancyChance = 'rất_cao';
    } else if (isFertileWindow) {
      const daysFromOvulation = Math.abs(diffDays(dateStr, currentOvulation));
      pregnancyChance = daysFromOvulation <= 1 ? 'cao' : 'trung_bình';
    } else if (isPeriodRecorded || isPredictedPeriod) {
      pregnancyChance = 'rất_thấp';
    } else {
      pregnancyChance = 'thấp';
    }

    // Phase determination
    if (isPeriodRecorded || isPredictedPeriod) {
      phase = 'menstrual';
      phaseNameVi = 'Giai đoạn kinh nguyệt 🩸';
    } else if (isOvulationDay) {
      phase = 'ovulation';
      phaseNameVi = 'Ngày rụng trứng 🥚✨';
    } else if (isFertileWindow) {
      phase = 'ovulation';
      phaseNameVi = 'Giai đoạn rụng trứng / Dễ thụ thai 🌸';
    } else if (cycleDayNumber && cycleDayNumber > (avgCycle - luteal)) {
      phase = 'luteal';
      phaseNameVi = 'Giai đoạn hoàng thể 🌙';
    } else {
      phase = 'follicular';
      phaseNameVi = 'Giai đoạn nang trứng 🌱';
    }
  }

  return {
    date: dateStr,
    isPeriodRecorded,
    isPredictedPeriod,
    isOvulationDay,
    isFertileWindow,
    pregnancyChance,
    phase,
    phaseNameVi,
    cycleDayNumber,
    log,
  };
}

export interface CurrentCycleSummary {
  currentDayInCycle: number;
  totalCycleLength: number;
  daysUntilNextPeriod: number;
  nextPeriodStartDate: string;
  ovulationDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  isCurrentlyInPeriod: boolean;
  currentPhase: CyclePhase;
  currentPhaseNameVi: string;
  pregnancyChanceToday: DayStatus['pregnancyChance'];
  lastPeriodStartDate: string | null;
}

export function getCurrentCycleSummary(
  cycles: PeriodCycle[],
  logs: Record<string, DailyLog>,
  settings: CycleSettings
): CurrentCycleSummary {
  const todayStr = formatDateKey(new Date());
  const sortedCycles = getSortedCycles(cycles);
  const avgCycle = getAverageCycleLength(cycles, settings.averageCycleLength);
  const avgPeriod = getAveragePeriodLength(cycles, settings.averagePeriodLength);
  const luteal = settings.lutealPhaseLength || 14;

  const todayStatus = getDayStatus(todayStr, cycles, logs, settings);

  if (sortedCycles.length === 0) {
    const ovulation = addDaysToDate(todayStr, avgCycle - luteal);
    return {
      currentDayInCycle: 1,
      totalCycleLength: avgCycle,
      daysUntilNextPeriod: avgCycle,
      nextPeriodStartDate: addDaysToDate(todayStr, avgCycle),
      ovulationDate: ovulation,
      fertileWindowStart: addDaysToDate(ovulation, -5),
      fertileWindowEnd: addDaysToDate(ovulation, 1),
      isCurrentlyInPeriod: false,
      currentPhase: 'follicular',
      currentPhaseNameVi: 'Giai đoạn nang trứng 🌱',
      pregnancyChanceToday: 'thấp',
      lastPeriodStartDate: null,
    };
  }

  const lastStart = sortedCycles[0].startDate;
  const daysSinceStart = diffDays(todayStr, lastStart);

  let nextPeriodStart = addDaysToDate(lastStart, avgCycle);
  // If today is past nextPeriodStart, project forward
  while (nextPeriodStart < todayStr) {
    nextPeriodStart = addDaysToDate(nextPeriodStart, avgCycle);
  }

  const daysUntilNext = diffDays(nextPeriodStart, todayStr);
  const ovulationDate = addDaysToDate(nextPeriodStart, -luteal);
  const fertileStart = addDaysToDate(ovulationDate, -5);
  const fertileEnd = addDaysToDate(ovulationDate, 1);

  return {
    currentDayInCycle: (daysSinceStart >= 0 ? daysSinceStart : 0) + 1,
    totalCycleLength: avgCycle,
    daysUntilNextPeriod: daysUntilNext,
    nextPeriodStartDate: nextPeriodStart,
    ovulationDate,
    fertileWindowStart: fertileStart,
    fertileWindowEnd: fertileEnd,
    isCurrentlyInPeriod: todayStatus.isPeriodRecorded,
    currentPhase: todayStatus.phase,
    currentPhaseNameVi: todayStatus.phaseNameVi,
    pregnancyChanceToday: todayStatus.pregnancyChance,
    lastPeriodStartDate: lastStart,
  };
}

// Translations & UI label mappings
export const FLOW_LABELS: Record<FlowLevel, { name: string; emoji: string; color: string }> = {
  none: { name: 'Không có', emoji: '⚪', color: 'bg-slate-100 text-slate-600' },
  spotting: { name: 'Vết lốm đốm', emoji: '💧', color: 'bg-rose-50 text-rose-600' },
  light: { name: 'Kinh nhẹ', emoji: '🩸', color: 'bg-rose-100 text-rose-700' },
  medium: { name: 'Trung bình', emoji: '🩸🩸', color: 'bg-rose-200 text-rose-800' },
  heavy: { name: 'Kinh nhiều', emoji: '🩸🩸🩸', color: 'bg-rose-500 text-white' },
};

export const MOOD_LABELS: Record<MoodType, { name: string; emoji: string }> = {
  happy: { name: 'Vui vẻ', emoji: '😊' },
  calm: { name: 'Bình yên', emoji: '😌' },
  sensitive: { name: 'Nhạy cảm', emoji: '🥺' },
  sad: { name: 'U buồn', emoji: '😢' },
  irritable: { name: 'Bực bội', emoji: '😤' },
  tired: { name: 'Mệt mỏi', emoji: '😴' },
  anxious: { name: 'Lo âu', emoji: '😰' },
  energetic: { name: 'Tràn năng lượng', emoji: '✨' },
};

export const SYMPTOM_LABELS: Record<SymptomType, { name: string; emoji: string }> = {
  cramps: { name: 'Đau bụng', emoji: '⚡' },
  backache: { name: 'Đau lưng', emoji: '🪵' },
  headache: { name: 'Đau đầu', emoji: '🤕' },
  bloating: { name: 'Đầy hơi', emoji: '🎈' },
  acne: { name: 'Nổi mụn', emoji: '🌋' },
  breast_tenderness: { name: 'Căng ngực', emoji: '🍈' },
  cravings: { name: 'Thèm ăn', emoji: '🧁' },
  fatigue: { name: 'Uể uải', emoji: '🛋️' },
  nausea: { name: 'Buồn nôn', emoji: '🤢' },
  insomnia: { name: 'Mất ngủ', emoji: '🌙' },
  dizziness: { name: 'Chóng mặt', emoji: '🌀' },
  mood_swings: { name: 'Thất thường', emoji: '🎭' },
};

export const DISCHARGE_LABELS: Record<DischargeType, { name: string; emoji: string; desc: string }> = {
  dry: { name: 'Khô ráo', emoji: '🌵', desc: 'Ít hoặc không có dịch' },
  sticky: { name: 'Hơi dính', emoji: '🍯', desc: 'Dịch đục, hơi dính' },
  creamy: { name: 'Dạng kem', emoji: '🍦', desc: 'Màu trắng sữa/dày' },
  egg_white: { name: 'Lòng trắng trứng', emoji: '🥚', desc: 'Dai, trong suốt (Thụ thai cao)' },
  watery: { name: 'Lỏng như nước', emoji: '💧', desc: 'Lỏng trong suốt' },
  spotting: { name: 'Có vệt máu', emoji: '🍓', desc: 'Thường đầu/cuối kỳ' },
};

export const PREGNANCY_CHANCE_LABELS: Record<DayStatus['pregnancyChance'], { text: string; bg: string; textCol: string; border: string }> = {
  rất_thấp: { text: 'Rất thấp', bg: 'bg-emerald-50', textCol: 'text-emerald-700', border: 'border-emerald-200' },
  thấp: { text: 'Thấp', bg: 'bg-teal-50', textCol: 'text-teal-700', border: 'border-teal-200' },
  trung_bình: { text: 'Trung bình', bg: 'bg-amber-50', textCol: 'text-amber-800', border: 'border-amber-200' },
  cao: { text: 'Cao 🌸', bg: 'bg-sky-100', textCol: 'text-sky-800', border: 'border-sky-300' },
  rất_cao: { text: 'Rất cao 🥚✨', bg: 'bg-sky-200', textCol: 'text-sky-900', border: 'border-sky-400' },
};

// Phase Self-Care Advice
export const PHASE_ADVICE: Record<CyclePhase, { title: string; subtitle: string; icon: string; nutrition: string; exercise: string; moodTip: string }> = {
  menstrual: {
    title: 'Giai đoạn Kinh Nguyệt 🩸',
    subtitle: 'Hãy nghỉ ngơi và nạp ấm cho cơ thể',
    icon: '☕',
    nutrition: 'Ăn đồ ấm, thực phẩm giàu sắt (thịt đỏ, rau chân vịt), uống trà gừng hoặc sô-cô-la nóng.',
    exercise: 'Nên tập yoga nhẹ nhàng, đi bộ thong thả hoặc thiền định thả lỏng bụng.',
    moodTip: 'Lắng nghe cơ thể, không ngần ngại từ chối các buổi tụ tập quá sức để nghỉ ngơi.',
  },
  follicular: {
    title: 'Giai đoạn Nang Trứng 🌱',
    subtitle: 'Năng lượng tươi mới & sáng tạo bùng nổ',
    icon: '🌿',
    nutrition: 'Bổ sung thực phẩm lên men (sữa chua, kimchi), trái cây tươi giàu vitamin C và protein nhẹ.',
    exercise: 'Thích hợp cho các bài tập cường độ cao (HIIT, chạy bộ, khiêu vũ, gym).',
    moodTip: 'Thời điểm lý tưởng để lên kế hoạch mới, học kỹ năng mới hoặc bắt đầu dự án sáng tạo.',
  },
  ovulation: {
    title: 'Giai đoạn Rụng Trứng 🥚✨',
    subtitle: 'Thời điểm vàng thụ thai & giao tiếp tự tin',
    icon: '🌸',
    nutrition: 'Ăn rau xanh tươi, các loại hạt (hạnh nhân, óc chó), bơ và nhiều nước hoa quả.',
    exercise: 'Luyện tập thể thao sôi động, khiêu vũ hoặc cardio tăng độ dẻo dai.',
    moodTip: 'Tự tin cuốn hút nhất trong tháng! Thích hợp cho các buổi hẹn hò hoặc đàm phán quan trọng.',
  },
  luteal: {
    title: 'Giai đoạn Hoàng Thể 🌙',
    subtitle: 'Duy trì sự bình an & lắng nghe cảm xúc',
    icon: '🧸',
    nutrition: 'Bổ sung thực phẩm giàu Magie (chuối, sô-cô-la đen, yến mạch) giúp bớt thèm ngọt và giảm căng thẳng.',
    exercise: 'Tập Pilates, giãn cơ, đi bộ hoặc tập thở thư giãn.',
    moodTip: 'Hormone thay đổi dễ gây nhạy cảm. Hãy tự ôm lấy bản thân và dành thời gian tắm nước ấm.',
  },
};
