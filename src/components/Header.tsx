import React from 'react';
import { Calendar, Heart, History, Settings, PlusCircle, Sparkles, Download, Upload } from 'lucide-react';

interface HeaderProps {
  onOpenTodayLog: () => void;
  onOpenSettings: () => void;
  activeTab: 'calendar' | 'history' | 'stats' | 'tips';
  setActiveTab: (tab: 'calendar' | 'history' | 'stats' | 'tips') => void;
  onExportData: () => void;
  onImportData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenTodayLog,
  onOpenSettings,
  activeTab,
  setActiveTab,
  onExportData,
  onImportData,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#FFE4E9] shadow-xs">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Top row on mobile: Logo + Quick actions */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          {/* Brand logo & Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-11 sm:h-11 bg-pink-400 rounded-2xl flex items-center justify-center text-white text-xl sm:text-2xl shadow-md shadow-pink-200 shrink-0">
              🌙
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent">
                  Luna Bloom
                </h1>
                <span className="px-2 py-0.5 text-[10px] sm:text-xs font-bold bg-[#FFF0F3] text-rose-500 rounded-full border border-pink-200">
                  Nhật Ký Cute
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 hidden sm:block">Theo dõi chu kỳ & thụ thai cá nhân thông minh</p>
            </div>
          </div>

          {/* Quick Action Button on mobile (visible < md) */}
          <div className="flex items-center gap-1 md:hidden shrink-0">
            <button
              onClick={onOpenTodayLog}
              className="flex items-center gap-1 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-bold text-xs shadow-md shadow-rose-200 transition-all active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Ghi chép</span>
            </button>
            <button
              onClick={onOpenSettings}
              title="Cài đặt chu kỳ"
              className="p-1.5 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-[#FFF0F3] transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Scrollable horizontally on mobile) */}
        <div className="w-full md:w-auto overflow-x-auto scrollbar-none pb-0.5 md:pb-0">
          <nav className="flex items-center gap-1 bg-[#FFF0F3] p-1 sm:p-1.5 rounded-2xl border border-[#FFE4E9] min-w-max mx-auto md:mx-0">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'calendar'
                  ? 'bg-white text-rose-500 shadow-xs'
                  : 'text-slate-600 hover:text-rose-500'
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Lịch của tôi</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'history'
                  ? 'bg-white text-rose-500 shadow-xs'
                  : 'text-slate-600 hover:text-rose-500'
              }`}
            >
              <History className="w-4 h-4 shrink-0" />
              <span>Lịch sử</span>
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'stats'
                  ? 'bg-white text-rose-500 shadow-xs'
                  : 'text-slate-600 hover:text-rose-500'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Thống kê</span>
            </button>

            <button
              onClick={() => setActiveTab('tips')}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'tips'
                  ? 'bg-white text-rose-500 shadow-xs'
                  : 'text-slate-600 hover:text-rose-500'
              }`}
            >
              <Heart className="w-4 h-4 text-pink-400 fill-pink-400 shrink-0" />
              <span>Chăm sóc</span>
            </button>
          </nav>
        </div>

        {/* Action Buttons on Desktop (hidden < md) */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenTodayLog}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-bold text-xs sm:text-sm shadow-lg shadow-rose-200 transition-all active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Ghi chép mới</span>
          </button>

          <div className="flex items-center gap-1 border-l border-rose-200 pl-2">
            <button
              onClick={onExportData}
              title="Sao lưu / Xuất dữ liệu"
              className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-[#FFF0F3] transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onImportData}
              title="Phục hồi / Nhập dữ liệu"
              className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-[#FFF0F3] transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenSettings}
              title="Cài đặt chu kỳ"
              className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-[#FFF0F3] transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
