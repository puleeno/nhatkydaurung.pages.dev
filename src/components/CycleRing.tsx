import React from 'react';
import { CurrentCycleSummary, PREGNANCY_CHANCE_LABELS, PHASE_ADVICE } from '../utils/cycleCalculations';
import { Play, CheckCircle2, Sparkles, Calendar, Zap, AlertCircle, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CycleRingProps {
  summary: CurrentCycleSummary;
  onStartPeriodToday: () => void;
  onEndPeriodToday: () => void;
  onOpenLogForDate: (dateStr: string) => void;
}

export const CycleRing: React.FC<CycleRingProps> = ({
  summary,
  onStartPeriodToday,
  onEndPeriodToday,
  onOpenLogForDate,
}) => {
  const {
    currentDayInCycle,
    totalCycleLength,
    daysUntilNextPeriod,
    nextPeriodStartDate,
    ovulationDate,
    isCurrentlyInPeriod,
    currentPhase,
    pregnancyChanceToday,
  } = summary;

  const handleStartPeriod = () => {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#f43f5e', '#fb7185', '#fda4af'],
    });
    onStartPeriodToday();
  };

  const handleEndPeriod = () => {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#a855f7', '#ec4899', '#3b82f6'],
    });
    onEndPeriodToday();
  };

  const progressPercent = Math.min(100, Math.max(5, (currentDayInCycle / totalCycleLength) * 100));
  const pregChance = PREGNANCY_CHANCE_LABELS[pregnancyChanceToday];
  const advice = PHASE_ADVICE[currentPhase];

  return (
    <div className="bg-[#FFF0F3] rounded-2xl sm:rounded-[32px] p-4 sm:p-7 border border-[#FFE4E9] shadow-xs relative overflow-hidden">
      {/* Soft background decorative blur circles */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-rose-200/30 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-sky-200/30 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-center">
        {/* Left Column: Interactive Visual Ring */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center text-center">
          <div className="relative w-44 h-44 sm:w-56 sm:h-56 flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-rose-100"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-rose-500 transition-all duration-1000 ease-out"
                strokeWidth="8"
                strokeDasharray="263.89"
                strokeDashoffset={263.89 - (263.89 * progressPercent) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Inner Ring Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
              <span className="text-xl sm:text-3xl font-black text-slate-800">
                {isCurrentlyInPeriod ? (
                  <span className="text-rose-500 flex items-center gap-1">
                    Ngày {currentDayInCycle} 🩸
                  </span>
                ) : (
                  <span>Ngày {currentDayInCycle}</span>
                )}
              </span>
              <span className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
                Chu kỳ {totalCycleLength} ngày
              </span>

              <div className="mt-2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold bg-white/90 shadow-xs border border-rose-200 text-rose-500">
                {isCurrentlyInPeriod ? 'Đang có kinh nguyệt' : `Kinh tiếp: ${daysUntilNextPeriod} ngày`}
              </div>
            </div>
          </div>

          {/* Quick Start / End Period Button */}
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
            {!isCurrentlyInPeriod ? (
              <button
                onClick={handleStartPeriod}
                className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-bold text-xs sm:text-sm shadow-md shadow-rose-200 transition-all active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white shrink-0" />
                <span>Bắt đầu kỳ kinh hôm nay</span>
              </button>
            ) : (
              <button
                onClick={handleEndPeriod}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-xs sm:text-sm shadow-md shadow-emerald-200 transition-all active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Kỳ kinh đã kết thúc</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Key Details & Predictions */}
        <div className="lg:col-span-7 space-y-3.5 sm:space-y-4">
          {/* Header Row */}
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-rose-500 border border-pink-200 shadow-2xs">
                {advice.title}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${pregChance.bg} ${pregChance.textCol} ${pregChance.border}`}>
                Thụ thai: {pregChance.text}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium leading-relaxed">{advice.subtitle}</p>
          </div>

          {/* Key Dates Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
            <button
              onClick={() => onOpenLogForDate(nextPeriodStartDate)}
              className="p-3 sm:p-3.5 bg-white hover:bg-rose-50/80 rounded-2xl border border-[#FFE4E9] text-left transition-colors cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 mb-1">
                <Calendar className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>Dự kiến kinh tiếp</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800">{nextPeriodStartDate}</p>
              <p className="text-[10px] sm:text-[11px] text-rose-500 font-medium mt-0.5">Còn {daysUntilNextPeriod} ngày nữa</p>
            </button>

            <button
              onClick={() => onOpenLogForDate(ovulationDate)}
              className="p-3 sm:p-3.5 bg-[#F0FAFF] hover:bg-sky-100/80 rounded-2xl border border-sky-200 text-left transition-colors cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-sky-700 mb-1 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                <span>Ngày rụng trứng</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-sky-900">{ovulationDate}</p>
              <p className="text-[10px] sm:text-[11px] text-sky-600 font-medium mt-0.5">Thụ thai đỉnh điểm ✨</p>
            </button>

            <div className="p-3 sm:p-3.5 bg-white rounded-2xl border border-pink-100 col-span-2 sm:col-span-1 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 mb-1">
                <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Khả năng thụ thai</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800">{pregChance.text}</p>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Theo chu kỳ hiện tại</p>
            </div>
          </div>

          {/* Smart Tip for Current Phase */}
          <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#FFE4E9] text-xs text-slate-700 flex items-start gap-2.5 sm:gap-3 shadow-2xs">
            <span className="text-xl sm:text-2xl leading-none shrink-0">{advice.icon}</span>
            <div>
              <span className="font-bold text-slate-800">Lời khuyên giai đoạn: </span>
              <span className="text-slate-600">{advice.nutrition}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
