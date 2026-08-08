import React, { useState } from 'react';
import { CyclePhase } from '../types';
import { PHASE_ADVICE } from '../utils/cycleCalculations';
import { Heart, Utensils, Activity, Smile, Sparkles, Coffee } from 'lucide-react';

interface HealthTipsProps {
  currentPhase: CyclePhase;
}

export const HealthTips: React.FC<HealthTipsProps> = ({ currentPhase }) => {
  const [selectedPhase, setSelectedPhase] = useState<CyclePhase>(currentPhase);

  const advice = PHASE_ADVICE[selectedPhase];

  return (
    <div className="space-y-6">
      {/* Phase Selector Tabs */}
      <div className="overflow-x-auto scrollbar-none pb-1">
        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-[#FFE4E9] shadow-2xs min-w-max sm:min-w-0">
          {(Object.keys(PHASE_ADVICE) as CyclePhase[]).map((phaseKey) => {
            const isCurrent = phaseKey === currentPhase;
            const isSelected = phaseKey === selectedPhase;
            const info = PHASE_ADVICE[phaseKey];

            return (
              <button
                key={phaseKey}
                onClick={() => setSelectedPhase(phaseKey)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center relative whitespace-nowrap ${
                  isSelected
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-rose-50/60'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>{info.icon}</span>
                  <span>{info.title}</span>
                </div>
                {isCurrent && (
                  <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full text-[9px] bg-purple-600 text-white font-mono shadow-2xs">
                    Hiện tại
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Advice Card */}
      <div className="bg-[#FFF0F3] rounded-[32px] p-6 sm:p-8 border border-[#FFE4E9] shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white text-2xl flex items-center justify-center shadow-xs border border-pink-100">
            {advice.icon}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800">{advice.title}</h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">{advice.subtitle}</p>
          </div>
        </div>

        {/* Detailed Advice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Nutrition Card */}
          <div className="bg-white p-5 rounded-2xl border border-[#FFE4E9] shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
              <Utensils className="w-4 h-4" />
              <span>Dinh dưỡng phù hợp</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{advice.nutrition}</p>
          </div>

          {/* Exercise Card */}
          <div className="bg-white p-5 rounded-2xl border border-sky-200 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-sky-600 font-bold text-sm">
              <Activity className="w-4 h-4" />
              <span>Vận động & Thể thao</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{advice.exercise}</p>
          </div>

          {/* Mental Wellness Card */}
          <div className="bg-white p-5 rounded-2xl border border-[#FFE4E9] shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-pink-500 font-bold text-sm">
              <Smile className="w-4 h-4" />
              <span>Cảm xúc & Tâm lý</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{advice.moodTip}</p>
          </div>
        </div>

        {/* Bonus Self-care Tips */}
        <div className="bg-white p-4 rounded-2xl border border-[#FFE4E9] text-xs text-slate-700 space-y-1 shadow-2xs">
          <p className="font-bold flex items-center gap-1.5 text-rose-500">
            <Sparkles className="w-4 h-4" />
            Nhắc nhở yêu thương bản thân:
          </p>
          <p className="leading-relaxed text-slate-600">
            Mỗi cơ thể người phụ nữ đều là một kiệt tác tự nhiên kỳ diệu. Lắng nghe nhịp điệu của cơ thể bạn, uống đủ nước mỗi ngày và nhớ rằng việc nghỉ ngơi hợp lý chính là chìa khóa cho một chu kỳ khỏe mạnh! 🌸
          </p>
        </div>
      </div>
    </div>
  );
};
