import React, { useState, useEffect } from 'react';
import { 
  DailyLog, 
  FlowLevel, 
  MoodType, 
  SymptomType, 
  DischargeType 
} from '../types';
import { 
  FLOW_LABELS, 
  MOOD_LABELS, 
  SYMPTOM_LABELS, 
  DISCHARGE_LABELS 
} from '../utils/cycleCalculations';
import { X, Heart, Droplet, Plus, Minus, Check, Trash2, Calendar, Pill, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LogModalProps {
  dateStr: string;
  existingLog?: DailyLog;
  isOpen: boolean;
  onClose: () => void;
  onSaveLog: (log: DailyLog) => void;
  onDeleteLog: (dateStr: string) => void;
}

export const LogModal: React.FC<LogModalProps> = ({
  dateStr,
  existingLog,
  isOpen,
  onClose,
  onSaveLog,
  onDeleteLog,
}) => {
  const [isPeriod, setIsPeriod] = useState<boolean>(false);
  const [flow, setFlow] = useState<FlowLevel>('medium');
  const [moods, setMoods] = useState<MoodType[]>([]);
  const [symptoms, setSymptoms] = useState<SymptomType[]>([]);
  const [discharge, setDischarge] = useState<DischargeType | undefined>(undefined);
  const [waterGlasses, setWaterGlasses] = useState<number>(6);
  const [bbt, setBbt] = useState<string>('');
  const [intimate, setIntimate] = useState<boolean>(false);
  const [protectedIntimate, setProtectedIntimate] = useState<boolean>(true);
  const [pillTaken, setPillTaken] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (existingLog) {
      setIsPeriod(existingLog.isPeriod || false);
      setFlow(existingLog.flow || (existingLog.isPeriod ? 'medium' : 'none'));
      setMoods(existingLog.moods || []);
      setSymptoms(existingLog.symptoms || []);
      setDischarge(existingLog.discharge);
      setWaterGlasses(existingLog.waterGlasses !== undefined ? existingLog.waterGlasses : 6);
      setBbt(existingLog.bbt ? String(existingLog.bbt) : '');
      setIntimate(existingLog.intimate || false);
      setProtectedIntimate(existingLog.protectedIntimate !== undefined ? existingLog.protectedIntimate : true);
      setPillTaken(existingLog.pillTaken || false);
      setNotes(existingLog.notes || '');
    } else {
      setIsPeriod(false);
      setFlow('none');
      setMoods([]);
      setSymptoms([]);
      setDischarge(undefined);
      setWaterGlasses(6);
      setBbt('');
      setIntimate(false);
      setProtectedIntimate(true);
      setPillTaken(false);
      setNotes('');
    }
  }, [existingLog, dateStr, isOpen]);

  if (!isOpen) return null;

  const toggleMood = (m: MoodType) => {
    if (moods.includes(m)) {
      setMoods(moods.filter(item => item !== m));
    } else {
      setMoods([...moods, m]);
    }
  };

  const toggleSymptom = (s: SymptomType) => {
    if (symptoms.includes(s)) {
      setSymptoms(symptoms.filter(item => item !== s));
    } else {
      setSymptoms([...symptoms, s]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const newLog: DailyLog = {
      date: dateStr,
      isPeriod: isPeriod,
      flow: isPeriod ? (flow === 'none' ? 'medium' : flow) : 'none',
      moods,
      symptoms,
      discharge,
      waterGlasses,
      bbt: bbt ? parseFloat(bbt) : undefined,
      intimate,
      protectedIntimate: intimate ? protectedIntimate : undefined,
      pillTaken,
      notes: notes.trim() || undefined,
    };

    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#a855f7', '#ec4899'],
    });

    onSaveLog(newLog);
    onClose();
  };

  const handleDelete = () => {
    if (confirm(`Bạn có chắc muốn xóa nhật ký ngày ${dateStr}?`)) {
      onDeleteLog(dateStr);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-xl max-h-[90vh] rounded-[32px] shadow-2xl border border-[#FFE4E9] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#FFF0F3] p-4 sm:p-5 text-slate-800 border-b border-[#FFE4E9] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-400 flex items-center justify-center font-bold text-lg shadow-sm overflow-hidden">
              <img src="/icon-192.png" alt="App Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-800">Ghi nhận nhật ký</h3>
              <p className="text-xs text-rose-500 font-bold">Ngày {dateStr}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-rose-100 text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Period Toggle & Flow */}
          <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-100 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPeriod}
                  onChange={(e) => {
                    setIsPeriod(e.target.checked);
                    if (e.target.checked && flow === 'none') setFlow('medium');
                  }}
                  className="w-5 h-5 text-rose-500 rounded-md border-rose-300 focus:ring-rose-400 cursor-pointer"
                />
                <span>Có kinh nguyệt hôm nay 🩸</span>
              </label>

              {isPeriod && (
                <span className="text-xs font-semibold text-rose-600 bg-white px-2.5 py-1 rounded-full border border-rose-200">
                  Đang theo dõi
                </span>
              )}
            </div>

            {isPeriod && (
              <div className="pt-2">
                <p className="text-xs font-semibold text-slate-600 mb-2">Mức độ lượng kinh:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['spotting', 'light', 'medium', 'heavy'] as FlowLevel[]).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFlow(f)}
                      className={`p-2 rounded-xl text-xs font-medium flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                        flow === f
                          ? 'bg-rose-500 text-white border-rose-500 font-bold shadow-xs'
                          : 'bg-white text-slate-700 border-rose-200 hover:bg-rose-100/50'
                      }`}
                    >
                      <span>{FLOW_LABELS[f].emoji}</span>
                      <span>{FLOW_LABELS[f].name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mood Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              😊 Tâm trạng hôm nay (chọn nhiều):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(MOOD_LABELS) as MoodType[]).map((m) => {
                const isSelected = moods.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleMood(m)}
                    className={`p-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-pink-100 text-pink-900 border-pink-300 font-bold shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{MOOD_LABELS[m].emoji}</span>
                    <span>{MOOD_LABELS[m].name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Symptom Tags */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              ⚡ Triệu chứng cơ thể (chọn nhiều):
            </label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(SYMPTOM_LABELS) as SymptomType[]).map((s) => {
                const isSelected = symptoms.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSymptom(s)}
                    className={`px-3 py-1.5 rounded-2xl text-xs font-medium flex items-center gap-1 border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-500 text-white border-purple-500 font-bold shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-purple-50'
                    }`}
                  >
                    <span>{SYMPTOM_LABELS[s].emoji}</span>
                    <span>{SYMPTOM_LABELS[s].name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Discharge Type */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              🥚 Dịch âm đạo / Khí hư:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(DISCHARGE_LABELS) as DischargeType[]).map((d) => {
                const isSelected = discharge === d;
                const info = DISCHARGE_LABELS[d];
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDischarge(isSelected ? undefined : d)}
                    className={`p-2.5 rounded-xl text-xs text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-300 font-bold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span>{info.emoji}</span>
                      <span className="font-semibold">{info.name}</span>
                    </div>
                    <p className="text-[10px] opacity-75 mt-0.5">{info.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Water Intake & BBT Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Water Tracker */}
            <div className="bg-blue-50/60 p-3.5 rounded-2xl border border-blue-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1">
                  <Droplet className="w-4 h-4 text-blue-500 fill-blue-500" />
                  Nước uống hôm nay
                </span>
                <span className="text-xs font-bold text-blue-700">{waterGlasses} ly (~{waterGlasses * 250}ml)</span>
              </div>

              <div className="flex items-center justify-center gap-3 bg-white p-2 rounded-xl border border-blue-200">
                <button
                  type="button"
                  onClick={() => setWaterGlasses(Math.max(0, waterGlasses - 1))}
                  className="w-7 h-7 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold flex items-center justify-center cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1 text-base">
                  {'💧'.repeat(Math.min(8, waterGlasses))}
                  {waterGlasses > 8 && <span className="text-xs text-blue-600 font-bold">+{waterGlasses - 8}</span>}
                </div>

                <button
                  type="button"
                  onClick={() => setWaterGlasses(waterGlasses + 1)}
                  className="w-7 h-7 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold flex items-center justify-center cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* BBT Temperature */}
            <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-100 space-y-2">
              <label className="text-xs font-bold text-amber-900 block">
                🌡️ Nhiệt độ cơ thể (BBT):
              </label>
              <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-amber-200">
                <input
                  type="number"
                  step="0.1"
                  min="35"
                  max="42"
                  placeholder="36.5"
                  value={bbt}
                  onChange={(e) => setBbt(e.target.value)}
                  className="w-full text-sm font-bold text-slate-800 bg-transparent focus:outline-none"
                />
                <span className="text-xs font-bold text-amber-700 shrink-0">°C</span>
              </div>
            </div>
          </div>

          {/* Intimate & Pill Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={intimate}
                onChange={(e) => setIntimate(e.target.checked)}
                className="w-4 h-4 text-pink-500 rounded border-slate-300"
              />
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                Có quan hệ tình dục
              </span>
            </label>

            {intimate && (
              <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={protectedIntimate}
                  onChange={(e) => setProtectedIntimate(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <span>Có dùng biện pháp an toàn</span>
              </label>
            )}

            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer border-l border-slate-300 pl-3">
              <input
                type="checkbox"
                checked={pillTaken}
                onChange={(e) => setPillTaken(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="flex items-center gap-1">
                <Pill className="w-4 h-4 text-indigo-500" />
                Đã uống thuốc / Vitamin
              </span>
            </label>
          </div>

          {/* Notes / Daily Journal */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              📝 Ghi chú & Nhật ký cá nhân:
            </label>
            <textarea
              rows={3}
              placeholder="Ghi lại cảm xúc, những việc đã làm hoặc triệu chứng đặc biệt trong ngày..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 text-xs sm:text-sm bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:border-rose-400 focus:ring-1 focus:ring-rose-400 focus:outline-none transition-all"
            />
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            {existingLog ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa nhật ký này</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs sm:text-sm font-bold rounded-full shadow-lg shadow-rose-200 transition-all active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Lưu nhật ký</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
