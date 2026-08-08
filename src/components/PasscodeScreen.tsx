import React, { useState } from 'react';
import { Lock, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

interface PasscodeScreenProps {
  onUnlock: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

export const PasscodeScreen: React.FC<PasscodeScreenProps> = ({ 
  onUnlock, 
  onCancel, 
  showCancel = false 
}) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await api.verifyPasscode(passcode);

      if (data.valid) {
        onUnlock();
      } else {
        setError(data.error || 'Mã passcode không đúng');
        setPasscode('');
      }
    } catch (err) {
      setError('Lỗi kết nối đến server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDigitClick = (digit: string) => {
    if (passcode.length < 6) {
      setPasscode(passcode + digit);
    }
  };

  const handleDelete = () => {
    setPasscode(passcode.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPasscode('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-gradient-to-br from-rose-100 to-pink-100">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto bg-rose-100 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">
            Nhập mã passcode
          </h2>
          <p className="text-sm text-slate-500">
            Vui lòng nhập mã passcode để truy cập
          </p>
        </div>

        {/* Passcode Display */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div
              key={index}
              className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-lg font-bold transition-all ${
                showPasscode && passcode[index]
                  ? 'bg-rose-50 border-rose-300 text-rose-600'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              {showPasscode ? passcode[index] || '' : passcode[index] ? '•' : ''}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm text-center py-2 px-4 rounded-xl">
            {error}
          </div>
        )}

        {/* Toggle Show/Hide */}
        <button
          type="button"
          onClick={() => setShowPasscode(!showPasscode)}
          className="w-full flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          {showPasscode ? (
            <>
              <EyeOff className="w-4 h-4" />
              <span>Ẩn passcode</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              <span>Hiện passcode</span>
            </>
          )}
        </button>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigitClick(digit)}
              className="w-full aspect-square rounded-2xl bg-slate-50 hover:bg-rose-50 text-2xl font-bold text-slate-700 hover:text-rose-600 transition-all active:scale-95 border border-slate-200 hover:border-rose-200"
            >
              {digit}
            </button>
          ))}
          
          <button
            type="button"
            onClick={handleClear}
            className="w-full aspect-square rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-all active:scale-95 border border-slate-200"
          >
            <RefreshCw className="w-5 h-5 text-slate-500" />
          </button>
          
          <button
            type="button"
            onClick={() => handleDigitClick('0')}
            className="w-full aspect-square rounded-2xl bg-slate-50 hover:bg-rose-50 text-2xl font-bold text-slate-700 hover:text-rose-600 transition-all active:scale-95 border border-slate-200 hover:border-rose-200"
          >
            0
          </button>
          
          <button
            type="button"
            onClick={handleDelete}
            disabled={passcode.length === 0}
            className="w-full aspect-square rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-all active:scale-95 border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-slate-500 text-lg">⌫</span>
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={passcode.length !== 6 || isLoading}
          className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl shadow-lg shadow-rose-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Đang xác thực...</span>
            </>
          ) : (
            <span>Mở khóa</span>
          )}
        </button>

        {/* Cancel Button */}
        {showCancel && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
          >
            Hủy
          </button>
        )}
      </div>
    </div>
  );
};
