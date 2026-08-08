import React from 'react';
import { DailyLog, PeriodCycle, CycleSettings } from '../types';
import { SYMPTOM_LABELS, MOOD_LABELS, FLOW_LABELS, getAverageCycleLength, getAveragePeriodLength } from '../utils/cycleCalculations';
import { Sparkles, Activity, PieChart, BarChart2, Droplets, Heart } from 'lucide-react';

interface StatsViewProps {
  logs: Record<string, DailyLog>;
  cycles: PeriodCycle[];
  settings: CycleSettings;
}

export const StatsView: React.FC<StatsViewProps> = ({ logs, cycles, settings }) => {
  const allLogsArray: DailyLog[] = Object.values(logs);

  // Symptom counts
  const symptomCounts: Record<string, number> = {};
  // Mood counts
  const moodCounts: Record<string, number> = {};
  // Total water intake recorded
  let totalWater = 0;
  let waterDaysCount = 0;

  allLogsArray.forEach(log => {
    if (log.symptoms) {
      log.symptoms.forEach(s => {
        symptomCounts[s] = (symptomCounts[s] || 0) + 1;
      });
    }
    if (log.moods) {
      log.moods.forEach(m => {
        moodCounts[m] = (moodCounts[m] || 0) + 1;
      });
    }
    if (log.waterGlasses !== undefined && log.waterGlasses > 0) {
      totalWater += log.waterGlasses;
      waterDaysCount++;
    }
  });

  const topSymptoms = Object.entries(symptomCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const topMoods = Object.entries(moodCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const avgWater = waterDaysCount > 0 ? Math.round((totalWater / waterDaysCount) * 10) / 10 : 0;
  const avgCycle = getAverageCycleLength(cycles, settings.averageCycleLength);
  const avgPeriod = getAveragePeriodLength(cycles, settings.averagePeriodLength);

  const maxSymptomVal = topSymptoms.length > 0 ? topSymptoms[0][1] : 1;
  const maxMoodVal = topMoods.length > 0 ? topMoods[0][1] : 1;

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FFF0F3] p-5 rounded-[28px] border border-[#FFE4E9] shadow-2xs">
          <div className="flex items-center gap-2 text-rose-500 font-bold text-xs mb-1">
            <Activity className="w-4 h-4" />
            <span>Tổng số nhật ký đã ghi</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-800">
            {allLogsArray.length} <span className="text-xs font-normal text-slate-500">ngày</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Dữ liệu cá nhân được lưu trên trình duyệt</p>
        </div>

        <div className="bg-[#FFF0F3] p-5 rounded-[28px] border border-[#FFE4E9] shadow-2xs">
          <div className="flex items-center gap-2 text-pink-500 font-bold text-xs mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Độ đều đặn chu kỳ</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-800">
            {cycles.length >= 2 ? 'Rất đều ✨' : 'Đang theo dõi'}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Trung bình {avgCycle} ngày/chu kỳ</p>
        </div>

        <div className="bg-[#F0FAFF] p-5 rounded-[28px] border border-sky-200 shadow-2xs">
          <div className="flex items-center gap-2 text-sky-600 font-bold text-xs mb-1">
            <Droplets className="w-4 h-4" />
            <span>Uống nước trung bình</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-800">
            {avgWater} <span className="text-xs font-normal text-slate-500">ly/ngày</span>
          </p>
          <p className="text-[11px] text-sky-700 mt-1">Tương đương ~{Math.round(avgWater * 250)} ml</p>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Symptoms Chart */}
        <div className="bg-white p-6 rounded-[32px] border border-[#FFE4E9] shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-extrabold text-slate-800">
              Triệu chứng hay gặp nhất ⚡
            </h3>
          </div>

          {topSymptoms.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Chưa có dữ liệu triệu chứng.</p>
          ) : (
            <div className="space-y-3">
              {topSymptoms.map(([sKey, count]) => {
                const label = SYMPTOM_LABELS[sKey as keyof typeof SYMPTOM_LABELS];
                const pct = Math.round((count / maxSymptomVal) * 100);

                return (
                  <div key={sKey} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <span>{label?.emoji}</span>
                        <span>{label?.name || sKey}</span>
                      </span>
                      <span className="font-bold text-rose-600">{count} lần</span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Moods Chart */}
        <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-pink-500" />
            <h3 className="text-base font-bold text-slate-800">
              Phân bố tâm trạng 😊
            </h3>
          </div>

          {topMoods.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Chưa có dữ liệu tâm trạng.</p>
          ) : (
            <div className="space-y-3">
              {topMoods.map(([mKey, count]) => {
                const label = MOOD_LABELS[mKey as keyof typeof MOOD_LABELS];
                const pct = Math.round((count / maxMoodVal) * 100);

                return (
                  <div key={mKey} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <span>{label?.emoji}</span>
                        <span>{label?.name || mKey}</span>
                      </span>
                      <span className="font-bold text-pink-600">{count} lần</span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-pink-400 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
