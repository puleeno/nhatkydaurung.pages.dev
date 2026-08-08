import React, { useState } from 'react';
import { PeriodCycle, CycleSettings } from '../types';
import { getSortedCycles, getAverageCycleLength, getAveragePeriodLength, diffDays } from '../utils/cycleCalculations';
import { formatDateKey, addDaysToDate } from '../utils/initialData';
import { History, Plus, Trash2, Calendar, Activity, Check, Sparkles } from 'lucide-react';

interface CycleHistoryProps {
  cycles: PeriodCycle[];
  settings: CycleSettings;
  onAddCycle: (cycle: PeriodCycle) => void;
  onDeleteCycle: (cycleId: string) => void;
}

export const CycleHistory: React.FC<CycleHistoryProps> = ({
  cycles,
  settings,
  onAddCycle,
  onDeleteCycle,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string>(formatDateKey(new Date()));
  const [endDate, setEndDate] = useState<string>(addDaysToDate(formatDateKey(new Date()), 4));

  const sortedCycles = getSortedCycles(cycles);
  const avgCycleLength = getAverageCycleLength(cycles, settings.averageCycleLength);
  const avgPeriodLength = getAveragePeriodLength(cycles, settings.averagePeriodLength);

  // Shortest & longest cycle calculation
  let shortest = 999;
  let longest = 0;
  for (let i = 0; i < sortedCycles.length - 1; i++) {
    const gap = diffDays(sortedCycles[i].startDate, sortedCycles[i + 1].startDate);
    if (gap > 0) {
      if (gap < shortest) shortest = gap;
      if (gap > longest) longest = gap;
    }
  }
  if (shortest === 999) shortest = avgCycleLength;
  if (longest === 0) longest = avgCycleLength;

  const handleCreateCycle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) return;

    const duration = diffDays(endDate, startDate) + 1;
    const newCycle: PeriodCycle = {
      id: 'cycle-' + Date.now(),
      startDate,
      endDate: endDate >= startDate ? endDate : startDate,
      lengthInDays: duration > 0 ? duration : 5,
    };

    onAddCycle(newCycle);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-[#FFF0F3] p-3.5 sm:p-4.5 rounded-2xl border border-[#FFE4E9] shadow-2xs">
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium">Chu kỳ trung bình</p>
          <p className="text-lg sm:text-2xl font-black text-rose-500 mt-1">
            {avgCycleLength} <span className="text-xs text-slate-400 font-normal">ngày</span>
          </p>
        </div>

        <div className="bg-[#FFF0F3] p-3.5 sm:p-4.5 rounded-2xl border border-[#FFE4E9] shadow-2xs">
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium">Số ngày có kinh TB</p>
          <p className="text-lg sm:text-2xl font-black text-pink-500 mt-1">
            {avgPeriodLength} <span className="text-xs text-slate-400 font-normal">ngày</span>
          </p>
        </div>

        <div className="bg-[#F0FAFF] p-3.5 sm:p-4.5 rounded-2xl border border-sky-200 shadow-2xs">
          <p className="text-[11px] sm:text-xs text-sky-700 font-medium">Chu kỳ ngắn nhất</p>
          <p className="text-lg sm:text-2xl font-black text-sky-900 mt-1">
            {shortest} <span className="text-xs text-sky-600 font-normal">ngày</span>
          </p>
        </div>

        <div className="bg-[#F0FAFF] p-3.5 sm:p-4.5 rounded-2xl border border-sky-200 shadow-2xs">
          <p className="text-[11px] sm:text-xs text-sky-700 font-medium">Chu kỳ dài nhất</p>
          <p className="text-lg sm:text-2xl font-black text-sky-900 mt-1">
            {longest} <span className="text-xs text-sky-600 font-normal">ngày</span>
          </p>
        </div>
      </div>

      {/* Main List Section */}
      <div className="bg-white rounded-2xl sm:rounded-[32px] p-4 sm:p-6 border border-[#FFE4E9] shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-rose-500" />
            <h3 className="text-base sm:text-lg font-extrabold text-slate-800">
              Danh sách các kỳ kinh nguyệt
            </h3>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full text-xs sm:text-sm font-bold transition-all shadow-md shadow-rose-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm kỳ kinh quá khứ</span>
          </button>
        </div>

        {/* Cycles Table / List */}
        {sortedCycles.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Chưa có thông tin chu kỳ nào. Hãy nhấn "+ Thêm kỳ kinh" để ghi nhận!
          </div>
        ) : (
          <div className="space-y-2.5">
            {sortedCycles.map((cycle, idx) => {
              const periodDuration = cycle.lengthInDays || (diffDays(cycle.endDate, cycle.startDate) + 1);
              const nextCycleInList = sortedCycles[idx + 1];
              const gapToPrevious = nextCycleInList
                ? diffDays(cycle.startDate, nextCycleInList.startDate)
                : null;

              return (
                <div
                  key={cycle.id}
                  className="p-4 bg-slate-50 hover:bg-rose-50/50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span className="text-sm font-bold text-slate-800">
                        {cycle.startDate} đến {cycle.endDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 pl-4">
                      <span>Thời gian có kinh: <strong className="text-rose-600">{periodDuration} ngày</strong></span>
                      {gapToPrevious && (
                        <span>• Chu kỳ: <strong className="text-purple-600">{gapToPrevious} ngày</strong></span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Bạn có chắc muốn xóa bản ghi chu kỳ ngày ${cycle.startDate}?`)) {
                        onDeleteCycle(cycle.id);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-100/50 rounded-xl transition-colors cursor-pointer"
                    title="Xóa kỳ kinh này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Add Cycle */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 border border-rose-100 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-rose-500" />
              Ghi nhận kỳ kinh trong quá khứ
            </h3>

            <form onSubmit={handleCreateCycle} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Ngày bắt đầu:
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-400"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Ngày kết thúc:
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-400"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-500 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Thêm vào lịch sử
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
