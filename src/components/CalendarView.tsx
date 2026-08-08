import React, { useState } from 'react';
import { DailyLog, PeriodCycle, CycleSettings } from '../types';
import { getDayStatus, FLOW_LABELS, MOOD_LABELS, SYMPTOM_LABELS, PREGNANCY_CHANCE_LABELS } from '../utils/cycleCalculations';
import { formatDateKey, addDaysToDate } from '../utils/initialData';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles, Droplets, Heart, Edit3, Plus, Info } from 'lucide-react';

interface CalendarViewProps {
  cycles: PeriodCycle[];
  logs: Record<string, DailyLog>;
  settings: CycleSettings;
  onSelectDateToLog: (dateStr: string) => void;
}

const WEEKDAYS_VI = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const MONTHS_VI = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

export const CalendarView: React.FC<CalendarViewProps> = ({
  cycles,
  logs,
  settings,
  onSelectDateToLog,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(formatDateKey(new Date()));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of current month
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Day of week offset for Monday start (0: Mon, 6: Sun)
  let startDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6;

  // Total days in month
  const daysInMonth = lastDayOfMonth.getDate();

  // Previous month trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const prevMonthDays: string[] = [];
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i);
    prevMonthDays.push(formatDateKey(d));
  }

  // Current month days
  const currentMonthDays: string[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    currentMonthDays.push(formatDateKey(dateObj));
  }

  // Next month leading days to complete grid (42 cells total)
  const remainingCells = 42 - (prevMonthDays.length + currentMonthDays.length);
  const nextMonthDays: string[] = [];
  for (let d = 1; d <= remainingCells; d++) {
    const dateObj = new Date(year, month + 1, d);
    nextMonthDays.push(formatDateKey(dateObj));
  }

  const allCalendarGridDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleGoToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(formatDateKey(today));
  };

  const todayStr = formatDateKey(new Date());
  const selectedDayStatus = getDayStatus(selectedDateStr, cycles, logs, settings);
  const selectedLog = logs[selectedDateStr];

  return (
    <div className="space-y-4">
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

      {/* Main Calendar Card */}
      <div className="bg-white rounded-2xl sm:rounded-[32px] p-2.5 sm:p-6 border border-[#FFE4E9] shadow-sm">
        {/* Calendar Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-3 sm:mb-5">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#FFF0F3] text-rose-500 flex items-center justify-center font-bold shrink-0">
              <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-extrabold text-slate-800">
                {MONTHS_VI[month]} năm {year}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">Bấm vào bất kỳ ngày nào để xem & sửa nhật ký</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleGoToday}
              className="px-3.5 py-1.5 bg-[#FFF0F3] hover:bg-rose-100 text-rose-500 rounded-full text-xs font-bold transition-colors cursor-pointer"
            >
              Hôm nay
            </button>
            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-xl text-slate-600 hover:bg-white transition-colors cursor-pointer"
                title="Tháng trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-xl text-slate-600 hover:bg-white transition-colors cursor-pointer"
                title="Tháng sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Weekday Labels */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1.5 text-center">
          {WEEKDAYS_VI.map((day, idx) => (
            <div
              key={day}
              className={`text-[11px] sm:text-xs font-bold py-1 ${
                idx >= 5 ? 'text-rose-400' : 'text-slate-400'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {allCalendarGridDays.map((dateStr) => {
            const dateObj = new Date(dateStr + 'T00:00:00');
            const dayNum = dateObj.getDate();
            const isCurrentMonth = dateObj.getMonth() === month;
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDateStr;

            const dayStatus = getDayStatus(dateStr, cycles, logs, settings);
            const dayLog = logs[dateStr];

            // Background styling logic
            let bgStyle = 'bg-[#FFF8F9] hover:bg-rose-50 text-slate-700 border border-pink-100/40';
            if (dayStatus.isPeriodRecorded) {
              bgStyle = 'bg-rose-500 text-white font-bold shadow-xs';
            } else if (dayStatus.isOvulationDay) {
              bgStyle = 'bg-sky-200 text-sky-900 font-bold border-2 border-amber-300 shadow-sm relative scale-[1.02] z-10';
            } else if (dayStatus.isPredictedPeriod) {
              bgStyle = 'bg-[#FFF0F3] text-rose-800 border-2 border-dashed border-rose-300 font-medium';
            } else if (dayStatus.isFertileWindow) {
              bgStyle = 'bg-sky-100/90 text-sky-900 border border-sky-200 font-medium';
            }

            if (!isCurrentMonth) {
              bgStyle += ' opacity-35';
            }

            return (
              <button
                key={dateStr}
                onClick={() => {
                  setSelectedDateStr(dateStr);
                }}
                onDoubleClick={() => onSelectDateToLog(dateStr)}
                className={`relative min-h-[52px] sm:min-h-[74px] p-1 sm:p-2 rounded-xl sm:rounded-2xl flex flex-col justify-between transition-all cursor-pointer text-left ${bgStyle} ${
                  isSelected ? 'ring-2 sm:ring-3 ring-rose-500 ring-offset-1 sm:ring-offset-2 scale-[1.02] z-20 shadow-md' : ''
                }`}
              >
                {/* Cell Header: Date Number & Badges */}
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-[11px] sm:text-sm font-bold ${
                      isToday
                        ? dayStatus.isPeriodRecorded
                          ? 'bg-white text-rose-600 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-[11px]'
                          : 'bg-rose-500 text-white px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-[11px]'
                        : ''
                    }`}
                  >
                    {dayNum}
                  </span>

                  {dayStatus.isOvulationDay && (
                    <span className="text-[10px] sm:text-xs" title="Ngày rụng trứng">🥚</span>
                  )}
                </div>

                {/* Micro indicators for logs */}
                <div className="flex items-center flex-wrap gap-0.5 mt-0.5">
                  {dayLog?.flow && dayLog.flow !== 'none' && (
                    <span className="text-[9px] sm:text-[10px]" title={`Lượng kinh: ${FLOW_LABELS[dayLog.flow].name}`}>
                      {FLOW_LABELS[dayLog.flow].emoji}
                    </span>
                  )}

                  {dayLog?.symptoms && dayLog.symptoms.length > 0 && (
                    <span className="text-[8px] sm:text-[9px] px-1 py-0.2 rounded-full bg-amber-200/80 text-amber-900 font-bold" title={`${dayLog.symptoms.length} triệu chứng`}>
                      ⚡{dayLog.symptoms.length}
                    </span>
                  )}

                  {dayLog?.waterGlasses && dayLog.waterGlasses > 0 && (
                    <span className="text-[8px] sm:text-[9px] text-sky-500" title={`${dayLog.waterGlasses} ly nước`}>
                      💧
                    </span>
                  )}

                  {dayLog?.intimate && (
                    <span className="text-[8px] sm:text-[9px]" title="Quan hệ">
                      ❤️
                    </span>
                  )}

                  {dayLog?.notes && (
                    <span className="text-[8px] sm:text-[9px] text-slate-500" title="Có ghi chú">
                      📝
                    </span>
                  )}
                </div>

                {/* Subtext for cycle day */}
                {dayStatus.cycleDayNumber && isCurrentMonth && (
                  <div className="text-[8px] sm:text-[9px] opacity-75 font-mono text-right w-full mt-0.5">
                    N{dayStatus.cycleDayNumber}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Detail Card */}
      <div className="bg-[#FFF0F3] rounded-[28px] p-4 sm:p-5 border border-[#FFE4E9] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-extrabold text-slate-800">
              Ngày {selectedDateStr}
            </span>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-white text-rose-600 border border-pink-200 shadow-2xs">
              {selectedDayStatus.phaseNameVi}
            </span>
            <span className={`px-3 py-0.5 rounded-full text-xs font-bold border ${PREGNANCY_CHANCE_LABELS[selectedDayStatus.pregnancyChance].bg} ${PREGNANCY_CHANCE_LABELS[selectedDayStatus.pregnancyChance].textCol}`}>
              Khả năng mang thai: {PREGNANCY_CHANCE_LABELS[selectedDayStatus.pregnancyChance].text}
            </span>
          </div>

          {/* Quick Log Highlights */}
          {selectedLog ? (
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 pt-1">
              {selectedLog.flow && (
                <span className="bg-white px-2.5 py-1 rounded-full border border-pink-100 font-medium shadow-2xs">
                  Lượng kinh: {FLOW_LABELS[selectedLog.flow].emoji} {FLOW_LABELS[selectedLog.flow].name}
                </span>
              )}

              {selectedLog.moods && selectedLog.moods.length > 0 && (
                <span className="bg-white px-2.5 py-1 rounded-full border border-pink-100 shadow-2xs">
                  Tâm trạng: {selectedLog.moods.map(m => MOOD_LABELS[m]?.emoji).join(' ')}
                </span>
              )}

              {selectedLog.symptoms && selectedLog.symptoms.length > 0 && (
                <span className="bg-white px-2.5 py-1 rounded-full border border-pink-100 shadow-2xs">
                  Triệu chứng: {selectedLog.symptoms.map(s => SYMPTOM_LABELS[s]?.name).join(', ')}
                </span>
              )}

              {selectedLog.waterGlasses !== undefined && (
                <span className="bg-white px-2.5 py-1 rounded-full border border-pink-100 shadow-2xs">
                  💧 {selectedLog.waterGlasses} ly nước
                </span>
              )}

              {selectedLog.notes && (
                <p className="w-full text-xs text-slate-600 italic mt-1 bg-white p-2.5 rounded-2xl border border-pink-100">
                  "{selectedLog.notes}"
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Chưa có ghi chép nào cho ngày này.</p>
          )}
        </div>

        <button
          onClick={() => onSelectDateToLog(selectedDateStr)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full text-xs sm:text-sm font-bold shadow-md shadow-rose-200 transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Edit3 className="w-4 h-4" />
          <span>{selectedLog ? 'Sửa nhật ký ngày này' : '+ Ghi nhật ký ngày này'}</span>
        </button>
      </div>
    </div>
  );
};
