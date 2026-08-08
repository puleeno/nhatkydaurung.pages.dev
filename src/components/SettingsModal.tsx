import React, { useState } from 'react';
import { CycleSettings } from '../types';
import { X, Settings, Check, RotateCcw, Trash2, Heart, Shield, Lock } from 'lucide-react';
import { PasscodeSettings } from './PasscodeSettings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CycleSettings;
  onSaveSettings: (settings: CycleSettings) => void;
  onResetToSampleData: () => void;
  onClearAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetToSampleData,
  onClearAllData,
}) => {
  const [avgCycle, setAvgCycle] = useState<number>(settings.averageCycleLength);
  const [avgPeriod, setAvgPeriod] = useState<number>(settings.averagePeriodLength);
  const [luteal, setLuteal] = useState<number>(settings.lutealPhaseLength || 14);
  const [activeTab, setActiveTab] = useState<'cycle' | 'passcode' | 'data'>('cycle');
  const [showPasscodeSettings, setShowPasscodeSettings] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      averageCycleLength: Number(avgCycle) || 28,
      averagePeriodLength: Number(avgPeriod) || 5,
      lutealPhaseLength: Number(luteal) || 14,
    });
    onClose();
  };

  const handlePasscodeSave = (enabled: boolean, passcode: string | null) => {
    onSaveSettings({
      ...settings,
      passcodeEnabled: enabled,
      passcode: passcode,
    });
    setShowPasscodeSettings(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-[32px] p-6 sm:p-7 border border-[#FFE4E9] shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#FFE4E9] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF0F3] text-rose-500 flex items-center justify-center font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-800">
              Cài đặt
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-rose-50 text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('cycle')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'cycle'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Chu kỳ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('passcode')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              activeTab === 'passcode'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Lock className="w-3 h-3" />
            Passcode
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('data')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'data'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Dữ liệu
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'cycle' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Độ dài chu kỳ trung bình (ngày):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="20"
                  max="45"
                  value={avgCycle}
                  onChange={(e) => setAvgCycle(parseInt(e.target.value) || 28)}
                  className="w-full p-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-400 font-bold text-slate-800"
                />
                <span className="text-xs text-slate-500 shrink-0">ngày (mặc định 28)</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Số ngày có kinh trung bình (ngày):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={avgPeriod}
                  onChange={(e) => setAvgPeriod(parseInt(e.target.value) || 5)}
                  className="w-full p-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-400 font-bold text-slate-800"
                />
                <span className="text-xs text-slate-500 shrink-0">ngày (mặc định 5)</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Độ dài giai đoạn hoàng thể (ngày rụng trứng đến kinh tiếp):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="10"
                  max="16"
                  value={luteal}
                  onChange={(e) => setLuteal(parseInt(e.target.value) || 14)}
                  className="w-full p-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-400 font-bold text-slate-800"
                />
                <span className="text-xs text-slate-500 shrink-0">ngày (mặc định 14)</span>
              </div>
            </div>

            {/* Privacy Note */}
            <div className="bg-rose-50 p-3 rounded-2xl border border-rose-100 flex items-start gap-2 text-xs text-rose-800">
              <Shield className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <p>
                <strong>Bảo mật cá nhân:</strong> Mọi dữ liệu nhật ký của bạn được lưu trên Cloudflare D1 database, an toàn và không chia sẻ ra bên ngoài.
              </p>
            </div>

            {/* Footer Submit */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs sm:text-sm font-bold rounded-full shadow-lg shadow-rose-200 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Lưu thay đổi</span>
              </button>
            </div>
          </form>
        )}

        {activeTab === 'passcode' && (
          <PasscodeSettings
            passcodeEnabled={settings.passcodeEnabled || false}
            currentPasscode={settings.passcode || null}
            onSave={handlePasscodeSave}
            onCancel={() => setShowPasscodeSettings(false)}
          />
        )}

        {activeTab === 'data' && (
          <div className="space-y-4">
            {/* Privacy Note */}
            <div className="bg-rose-50 p-3 rounded-2xl border border-rose-100 flex items-start gap-2 text-xs text-rose-800">
              <Shield className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <p>
                <strong>Bảo mật cá nhân:</strong> Mọi dữ liệu nhật ký của bạn được lưu trên Cloudflare D1 database, an toàn và không chia sẻ ra bên ngoài.
              </p>
            </div>

            {/* Management Buttons */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Khôi phục dữ liệu mẫu sẽ cập nhật nhật ký lịch minh họa. Bạn có muốn tiếp tục?')) {
                    onResetToSampleData();
                    onClose();
                  }
                }}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <span>Nạp lại dữ liệu mẫu minh họa</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Bạn có chắc chắn muốn XÓA SẠCH toàn bộ dữ liệu nhật ký không?')) {
                    onClearAllData();
                    onClose();
                  }
                }}
                className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-rose-500" />
                <span>Xóa sạch toàn bộ dữ liệu cá nhân</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
