import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Check, X } from 'lucide-react';

interface PasscodeSettingsProps {
  passcodeEnabled: boolean;
  currentPasscode: string | null;
  onSave: (enabled: boolean, passcode: string | null) => void;
  onCancel: () => void;
}

export const PasscodeSettings: React.FC<PasscodeSettingsProps> = ({
  passcodeEnabled,
  currentPasscode,
  onSave,
  onCancel,
}) => {
  const [enabled, setEnabled] = useState(passcodeEnabled);
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState('');

  const handleSave = () => {
    setError('');

    if (enabled) {
      if (!newPasscode || newPasscode.length !== 6) {
        setError('Passcode phải có 6 chữ số');
        return;
      }

      if (newPasscode !== confirmPasscode) {
        setError('Passcode không khớp');
        return;
      }

      if (!/^\d+$/.test(newPasscode)) {
        setError('Passcode chỉ được chứa chữ số');
        return;
      }

      onSave(true, newPasscode);
    } else {
      onSave(false, null);
    }
  };

  const handleDisable = () => {
    if (confirm('Bạn có chắc muốn tắt passcode?')) {
      setEnabled(false);
      setNewPasscode('');
      setConfirmPasscode('');
      onSave(false, null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
            <Lock className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800">Bật passcode</h4>
            <p className="text-xs text-slate-500">
              {enabled ? 'Passcode đang bật' : 'Passcode đang tắt'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            if (!enabled) {
              setEnabled(true);
            } else {
              handleDisable();
            }
          }}
          className={`relative w-12 h-7 rounded-full transition-colors ${
            enabled ? 'bg-rose-500' : 'bg-slate-300'
          }`}
        >
          <div
            className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              enabled ? 'left-6' : 'left-1'
            }`}
          />
        </button>
      </div>

      {/* Passcode Input Fields */}
      {enabled && (
        <div className="space-y-3 p-4 bg-rose-50 rounded-2xl border border-rose-100">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Mã passcode mới (6 chữ số):
            </label>
            <div className="relative">
              <input
                type={showPasscode ? 'text' : 'password'}
                value={newPasscode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setNewPasscode(value);
                  setError('');
                }}
                placeholder="------"
                maxLength={6}
                className="w-full p-3 text-lg bg-white rounded-xl border border-rose-200 focus:outline-none focus:border-rose-400 font-bold text-center tracking-widest"
              />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPasscode ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Xác nhận mã passcode:
            </label>
            <div className="relative">
              <input
                type={showPasscode ? 'text' : 'password'}
                value={confirmPasscode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setConfirmPasscode(value);
                  setError('');
                }}
                placeholder="------"
                maxLength={6}
                className="w-full p-3 text-lg bg-white rounded-xl border border-rose-200 focus:outline-none focus:border-rose-400 font-bold text-center tracking-widest"
              />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPasscode ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm text-center py-2 px-4 rounded-xl flex items-center justify-center gap-2">
              <X className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Status Indicators */}
          {newPasscode.length === 6 && (
            <div className="flex items-center gap-2 text-xs text-green-600">
              <Check className="w-4 h-4" />
              <span>Độ dài passcode hợp lệ</span>
            </div>
          )}

          {newPasscode.length === 6 && confirmPasscode.length === 6 && (
            <div className={`flex items-center gap-2 text-xs ${
              newPasscode === confirmPasscode ? 'text-green-600' : 'text-red-600'
            }`}>
              {newPasscode === confirmPasscode ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Passcode khớp</span>
                </>
              ) : (
                <>
                  <X className="w-4 h-4" />
                  <span>Passcode không khớp</span>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Info Message */}
      <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 flex items-start gap-2 text-xs text-amber-800">
        <Lock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p>
          <strong>Lưu ý bảo mật:</strong> Passcode giúp bảo vệ dữ liệu cá nhân của bạn. 
          Vui lòng nhớ passcode vì không có cách nào khôi phục nếu quên.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={enabled && (!newPasscode || newPasscode.length !== 6 || newPasscode !== confirmPasscode)}
          className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs sm:text-sm font-bold rounded-full shadow-lg shadow-rose-200 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check className="w-4 h-4" />
          <span>Lưu thay đổi</span>
        </button>
      </div>
    </div>
  );
};
