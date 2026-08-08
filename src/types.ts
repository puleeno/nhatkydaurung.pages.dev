export type FlowLevel = 'none' | 'light' | 'medium' | 'heavy' | 'spotting';

export type MoodType = 
  | 'happy' 
  | 'calm' 
  | 'sensitive' 
  | 'sad' 
  | 'irritable' 
  | 'tired' 
  | 'anxious' 
  | 'energetic';

export type SymptomType = 
  | 'cramps' 
  | 'backache' 
  | 'headache' 
  | 'bloating' 
  | 'acne' 
  | 'breast_tenderness' 
  | 'cravings' 
  | 'fatigue' 
  | 'nausea' 
  | 'insomnia' 
  | 'dizziness' 
  | 'mood_swings';

export type DischargeType = 
  | 'dry' 
  | 'sticky' 
  | 'creamy' 
  | 'egg_white' 
  | 'watery' 
  | 'spotting';

export interface DailyLog {
  date: string; // YYYY-MM-DD
  isPeriod: boolean;
  flow?: FlowLevel;
  moods?: MoodType[];
  symptoms?: SymptomType[];
  discharge?: DischargeType;
  bbt?: number; // Body basal temperature in Celsius
  waterGlasses?: number; // Number of glasses
  intimate?: boolean;
  protectedIntimate?: boolean;
  pillTaken?: boolean;
  notes?: string;
}

export interface PeriodCycle {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  lengthInDays?: number; // Period duration
  cycleLength?: number; // Total cycle length from this start to next start
}

export interface CycleSettings {
  averageCycleLength: number; // default e.g. 28
  averagePeriodLength: number; // default e.g. 5
  lutealPhaseLength: number; // default 14
  reminderEnabled: boolean;
  reminderDaysBefore: number;
}

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export interface DayStatus {
  date: string; // YYYY-MM-DD
  isPeriodRecorded: boolean;
  isPredictedPeriod: boolean;
  isOvulationDay: boolean;
  isFertileWindow: boolean;
  pregnancyChance: 'rất_thấp' | 'thấp' | 'trung_bình' | 'cao' | 'rất_cao';
  phase: CyclePhase;
  phaseNameVi: string;
  cycleDayNumber?: number;
  log?: DailyLog;
}
