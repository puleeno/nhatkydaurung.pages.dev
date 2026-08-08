import React from 'react';
import { DailyLog, PeriodCycle, CycleSettings } from '../types';
import { getCurrentCycleSummary } from '../utils/cycleCalculations';
import { Calendar, Sparkles, Droplets, Heart, ArrowRight, Info } from 'lucide-react';

interface PredictionsProps {
  cycles: PeriodCycle[];
  logs: Record<string, DailyLog>;
  settings: CycleSettings;
}

export const Predictions: React.FC<PredictionsProps> = ({
  cycles,
  logs,
  settings,
}) => {
  const summary = getCurrentCycleSummary(cycles, logs, settings);

  const formatVietnameseDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long' });
  };

  return (
    <div className="space-y-4">
      {/* Predictions Card */}
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-4 border border-rose-100 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Dự đoán chu kỳ</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Next Period */}
          <div className="bg-white rounded-xl p-3 border border-rose-100">
            <div className="flex items-center gap-1.5 mb-1">
              <Droplets className="w-3.5 h-3.5 text-rose-500" />
              <span className="text-[11px] font-semibold text-slate-600">Kinh tiếp</span>
            </div>
            <div className="text-base font-bold text-rose-600">
              {formatVietnameseDate(summary.nextPeriodStartDate)}
            </div>
            <div className="text-[10px] text-slate-400">
              {summary.daysUntilNextPeriod} ngày nữa
            </div>
          </div>

          {/* Ovulation */}
          <div className="bg-white rounded-xl p-3 border border-sky-100">
            <div className="flex items-center gap-1.5 mb-1">
              <Heart className="w-3.5 h-3.5 text-sky-500" />
              <span className="text-[11px] font-semibold text-slate-600">Rụng trứng</span>
            </div>
            <div className="text-base font-bold text-sky-600">
              {formatVietnameseDate(summary.ovulationDate)}
            </div>
            <div className="text-[10px] text-slate-400">
              Dễ thụ thai
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="mt-3 bg-white rounded-xl p-3 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-600 mb-0.5">
                Ngày thứ {summary.currentDayInCycle} trong chu kỳ
              </div>
              <div className="text-sm font-bold text-slate-800">
                {summary.currentPhaseNameVi}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-rose-500" />
            </div>
          </div>
        </div>

        {/* Pregnancy Chance */}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[11px] text-slate-600">Khả năng thụ thai hôm nay:</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
            {summary.pregnancyChanceToday}
          </span>
        </div>
      </div>

      {/* Legend Card */}
      <div className="bg-[#FFF0F3] rounded-2xl p-3 sm:p-4 border border-[#FFE4E9] shadow-2xs">
        <div className="flex items-center justify-between gap-2 mb-2 sm:mb-2.5">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-rose-500 shrink-0" />
            Chú thích màu sắc Calendar
          </span>
          <span className="text-[10px] sm:text-[11px] text-slate-400 hidden xs:inline">Nhấp vào ngày để ghi nhật ký</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 text-[11px] sm:text-xs">
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-rose-500 text-white font-bold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-white shrink-0" />
            <span>Kinh nguyệt</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-dashed border-rose-300 font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
            <span>Dự đoán kinh</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-sky-200 text-sky-900 border border-amber-300 font-bold shadow-2xs">
            <span>🥚 Rụng trứng</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-sky-100 text-sky-800 border border-sky-200 font-semibold">
            <span>🩵 Thụ thai cao</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-white text-slate-600 border border-slate-200">
            <span>⚪ Bình thường</span>
          </div>
        </div>
      </div>
    </div>
  );
};
