/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DailyLog, PeriodCycle, CycleSettings } from './types';
import { getInitialData, formatDateKey, addDaysToDate } from './utils/initialData';
import { getCurrentCycleSummary, getDayStatus, diffDays } from './utils/cycleCalculations';
import { Header } from './components/Header';
import { CycleRing } from './components/CycleRing';
import { CalendarView } from './components/CalendarView';
import { LogModal } from './components/LogModal';
import { CycleHistory } from './components/CycleHistory';
import { HealthTips } from './components/HealthTips';
import { StatsView } from './components/StatsView';
import { SettingsModal } from './components/SettingsModal';
import { PasscodeScreen } from './components/PasscodeScreen';
import { Predictions } from './components/Predictions';
import { api } from './services/api';

export default function App() {
  const [logs, setLogs] = useState<Record<string, DailyLog>>({});
  const [cycles, setCycles] = useState<PeriodCycle[]>([]);
  const [settings, setSettings] = useState<CycleSettings>({
    averageCycleLength: 28,
    averagePeriodLength: 5,
    lutealPhaseLength: 14,
    reminderEnabled: true,
    reminderDaysBefore: 2,
  });

  const [activeTab, setActiveTab] = useState<'calendar' | 'history' | 'stats' | 'tips'>('calendar');
  const [selectedDateForLog, setSelectedDateForLog] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showPasscodeScreen, setShowPasscodeScreen] = useState<boolean>(false);

  // Initialize data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [logsData, cyclesData, settingsData] = await Promise.all([
          api.getLogs(),
          api.getCycles(),
          api.getSettings()
        ]);

        console.log('Loaded data:', { logsData, cyclesData, settingsData });

        // Convert logs array to record
        const logsRecord: Record<string, DailyLog> = {};
        logsData.forEach((log: any) => {
          // Convert database format to app format
          logsRecord[log.date] = {
            date: log.date,
            isPeriod: log.is_period === 1,
            flow: log.flow as any,
            moods: log.moods ? JSON.parse(log.moods) : [],
            symptoms: log.symptoms ? JSON.parse(log.symptoms) : [],
            discharge: log.discharge as any,
            bbt: log.bbt,
            waterGlasses: log.water_glasses,
            intimate: log.intimate === 1,
            protectedIntimate: log.protected_intimate === 1,
            pillTaken: log.pill_taken === 1,
            notes: log.notes,
          };
        });

        // Convert cycles database format to app format
        const cyclesArray: PeriodCycle[] = cyclesData.map((cycle: any) => ({
          id: cycle.id,
          startDate: cycle.start_date,
          endDate: cycle.end_date,
          lengthInDays: cycle.length_in_days,
          cycleLength: cycle.cycle_length,
        }));

        // Convert settings database format to app format
        const settingsObj: CycleSettings = {
          averageCycleLength: settingsData.average_cycle_length,
          averagePeriodLength: settingsData.average_period_length,
          lutealPhaseLength: settingsData.luteal_phase_length,
          reminderEnabled: settingsData.reminder_enabled,
          reminderDaysBefore: settingsData.reminder_days_before,
          passcodeEnabled: settingsData.passcode_enabled || false,
          passcode: settingsData.passcode || null,
        };

        setLogs(logsRecord);
        setCycles(cyclesArray);
        setSettings(settingsObj);
      } catch (error) {
        console.error('Failed to load data from API:', error);
        // Load sample data as fallback
        const initial = getInitialData();
        setLogs(initial.logs);
        setCycles(initial.cycles);
        setSettings(initial.settings);
      }
    };

    loadData();
  }, []);

  // Check authentication when settings are loaded
  useEffect(() => {
    // Always require passcode if enabled, no persistent session
    if (settings.passcodeEnabled) {
      setShowPasscodeScreen(true);
      setIsAuthenticated(false);
    } else {
      setShowPasscodeScreen(false);
      setIsAuthenticated(true);
    }
  }, [settings.passcodeEnabled]);

  const handleUnlock = () => {
    // Set authentication for current session only (no localStorage)
    setIsAuthenticated(true);
    setShowPasscodeScreen(false);
  };

  // Clear authentication when tab is closed
  useEffect(() => {
    const handleBeforeUnload = () => {
      setIsAuthenticated(false);
      setShowPasscodeScreen(true);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const todayStr = formatDateKey(new Date());
  const cycleSummary = getCurrentCycleSummary(cycles, logs, settings);

  // Quick Action: Start period today
  const handleStartPeriodToday = async () => {
    // 1. Update or create today's log
    const existingLog = logs[todayStr] || { date: todayStr };
    const updatedLog: DailyLog = {
      ...existingLog,
      isPeriod: true,
      flow: existingLog.flow && existingLog.flow !== 'none' ? existingLog.flow : 'medium',
    };

    setLogs(prev => ({ ...prev, [todayStr]: updatedLog }));

    // Sync to API
    try {
      await api.saveLog({
        date: todayStr,
        is_period: true,
        flow: updatedLog.flow || 'medium',
      });
    } catch (error) {
      console.error('Failed to save log to API:', error);
    }

    // 2. Check if there's already a cycle starting today
    const existingCycleToday = cycles.find(c => c.startDate === todayStr);
    if (!existingCycleToday) {
      const newCycle: PeriodCycle = {
        id: 'cycle-' + Date.now(),
        startDate: todayStr,
        endDate: addDaysToDate(todayStr, (settings.averagePeriodLength || 5) - 1),
        lengthInDays: settings.averagePeriodLength || 5,
      };
      setCycles(prev => [newCycle, ...prev]);

      // Sync to API
      try {
        await api.createCycle({
          start_date: newCycle.startDate,
          end_date: newCycle.endDate,
          length_in_days: newCycle.lengthInDays,
        });
      } catch (error) {
        console.error('Failed to create cycle in API:', error);
      }
    }
  };

  // Quick Action: End period
  const handleEndPeriodToday = async () => {
    // Set endDate for latest active cycle to yesterday or today
    if (cycles.length > 0) {
      const sorted = [...cycles].sort((a, b) => b.startDate.localeCompare(a.startDate));
      const latest = sorted[0];
      const duration = diffDays(todayStr, latest.startDate) + 1;

      const updatedCycle: PeriodCycle = {
        ...latest,
        endDate: todayStr,
        lengthInDays: duration > 0 ? duration : 1,
      };

      setCycles(prev => prev.map(c => (c.id === latest.id ? updatedCycle : c)));

      // Sync to API
      try {
        await api.updateCycle(latest.id, {
          end_date: updatedCycle.endDate,
          length_in_days: updatedCycle.lengthInDays,
        });
      } catch (error) {
        console.error('Failed to update cycle in API:', error);
      }
    }
  };

  // Save Daily Log
  const handleSaveLog = async (savedLog: DailyLog) => {
    setLogs(prev => ({ ...prev, [savedLog.date]: savedLog }));

    // Sync to API
    try {
      const result = await api.saveLog({
        date: savedLog.date,
        is_period: savedLog.isPeriod,
        flow: savedLog.flow,
        moods: savedLog.moods,
        symptoms: savedLog.symptoms,
        discharge: savedLog.discharge,
        bbt: savedLog.bbt,
        water_glasses: savedLog.waterGlasses,
        intimate: savedLog.intimate,
        protected_intimate: savedLog.protectedIntimate,
        pill_taken: savedLog.pillTaken,
        notes: savedLog.notes,
      });
      console.log('Log saved successfully:', result);
    } catch (error) {
      console.error('Failed to save log to API:', error);
    }

    // If marked as period, ensure corresponding period cycle exists or is updated
    if (savedLog.isPeriod) {
      const dateStr = savedLog.date;
      const matchingCycle = cycles.find(
        c => dateStr >= c.startDate && dateStr <= (c.endDate || c.startDate)
      );

      if (!matchingCycle) {
        // Create new cycle starting on dateStr
        const newCycle: PeriodCycle = {
          id: 'cycle-' + Date.now(),
          startDate: dateStr,
          endDate: dateStr,
          lengthInDays: 1,
        };
        setCycles(prev => [newCycle, ...prev]);

        // Sync to API
        try {
          await api.createCycle({
            start_date: newCycle.startDate,
            end_date: newCycle.endDate,
            length_in_days: newCycle.lengthInDays,
          });
        } catch (error) {
          console.error('Failed to create cycle in API:', error);
        }
      }
    }
  };

  // Delete Daily Log
  const handleDeleteLog = async (dateStr: string) => {
    setLogs(prev => {
      const copy = { ...prev };
      delete copy[dateStr];
      return copy;
    });

    // Sync to API
    try {
      await api.deleteLog(dateStr);
    } catch (error) {
      console.error('Failed to delete log from API:', error);
    }
  };

  // Add Cycle Record manually
  const handleAddCycle = async (newCycle: PeriodCycle) => {
    setCycles(prev => [newCycle, ...prev]);

    // Sync to API
    try {
      await api.createCycle({
        start_date: newCycle.startDate,
        end_date: newCycle.endDate,
        length_in_days: newCycle.lengthInDays,
        cycle_length: newCycle.cycleLength,
      });
    } catch (error) {
      console.error('Failed to create cycle in API:', error);
    }
  };

  // Delete Cycle Record
  const handleDeleteCycle = async (cycleId: string) => {
    setCycles(prev => prev.filter(c => c.id !== cycleId));

    // Sync to API
    try {
      await api.deleteCycle(cycleId);
    } catch (error) {
      console.error('Failed to delete cycle from API:', error);
    }
  };

  // Export JSON backup
  const handleExportData = () => {
    const dataToExport = {
      logs,
      cycles,
      settings,
      exportDate: new Date().toISOString(),
    };
    const jsonStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `nhat_ky_kinh_nguyet_${todayStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.logs && parsed.cycles) {
            setLogs(parsed.logs);
            setCycles(parsed.cycles);
            if (parsed.settings) {
              setSettings(parsed.settings);
              
              // Sync settings to API
              try {
                await api.saveSettings({
                  average_cycle_length: parsed.settings.averageCycleLength,
                  average_period_length: parsed.settings.averagePeriodLength,
                  luteal_phase_length: parsed.settings.lutealPhaseLength,
                  reminder_enabled: parsed.settings.reminderEnabled,
                  reminder_days_before: parsed.settings.reminderDaysBefore,
                });
              } catch (error) {
                console.error('Failed to save settings to API:', error);
              }
            }
            
            // Sync logs to API
            for (const [date, log] of Object.entries(parsed.logs)) {
              try {
                await api.saveLog({
                  date,
                  is_period: log.isPeriod,
                  flow: log.flow,
                  moods: log.moods,
                  symptoms: log.symptoms,
                  discharge: log.discharge,
                  bbt: log.bbt,
                  water_glasses: log.waterGlasses,
                  intimate: log.intimate,
                  protected_intimate: log.protectedIntimate,
                  pill_taken: log.pillTaken,
                  notes: log.notes,
                });
              } catch (error) {
                console.error(`Failed to save log ${date} to API:`, error);
              }
            }
            
            // Sync cycles to API
            for (const cycle of parsed.cycles) {
              try {
                await api.createCycle({
                  start_date: cycle.startDate,
                  end_date: cycle.endDate,
                  length_in_days: cycle.lengthInDays,
                  cycle_length: cycle.cycleLength,
                });
              } catch (error) {
                console.error(`Failed to save cycle ${cycle.id} to API:`, error);
              }
            }
            
            alert('Nhập dữ liệu thành công! ✨');
          } else {
            alert('File không hợp lệ.');
          }
        } catch (err) {
          alert('Không thể đọc file JSON.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // Reset to initial sample data
  const handleResetToSampleData = () => {
    const initial = getInitialData();
    setLogs(initial.logs);
    setCycles(initial.cycles);
    setSettings(initial.settings);
  };

  // Clear all data
  const handleClearAllData = async () => {
    setLogs({});
    setCycles([]);
    
    // Clear from API - note: this would need to be implemented as a bulk delete
    // For now, we'll just clear local state
    console.warn('Clear all data - API deletion not implemented');
  };

  // Show passcode screen if authentication is required
  if (showPasscodeScreen && !isAuthenticated) {
    return <PasscodeScreen onUnlock={handleUnlock} />;
  }

  return (
    <div className="min-h-screen bg-[#FFF8F9] text-[#4A4A4A] font-sans antialiased pb-12">
      {/* Header Bar */}
      <Header
        onOpenTodayLog={() => setSelectedDateForLog(todayStr)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExportData={handleExportData}
        onImportData={handleImportData}
      />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6 space-y-4 sm:space-y-6">
        {/* Top Status Ring Overview Card */}
        <CycleRing
          summary={cycleSummary}
          onStartPeriodToday={handleStartPeriodToday}
          onEndPeriodToday={handleEndPeriodToday}
          onOpenLogForDate={(dateStr) => setSelectedDateForLog(dateStr)}
        />

        {/* Tab Content */}
        {activeTab === 'calendar' && (
          <>
            {/* Predictions Card */}
            <Predictions
              cycles={cycles}
              logs={logs}
              settings={settings}
            />

            {/* Calendar View */}
            <CalendarView
              cycles={cycles}
              logs={logs}
              settings={settings}
              onSelectDateToLog={(dateStr) => setSelectedDateForLog(dateStr)}
            />
          </>
        )}

        {activeTab === 'history' && (
          <CycleHistory
            cycles={cycles}
            settings={settings}
            onAddCycle={handleAddCycle}
            onDeleteCycle={handleDeleteCycle}
          />
        )}

        {activeTab === 'stats' && (
          <StatsView
            logs={logs}
            cycles={cycles}
            settings={settings}
          />
        )}

        {activeTab === 'tips' && (
          <HealthTips
            currentPhase={cycleSummary.currentPhase}
          />
        )}
      </main>

      {/* Daily Log Modal */}
      {selectedDateForLog && (
        <LogModal
          dateStr={selectedDateForLog}
          existingLog={logs[selectedDateForLog]}
          isOpen={!!selectedDateForLog}
          onClose={() => setSelectedDateForLog(null)}
          onSaveLog={handleSaveLog}
          onDeleteLog={handleDeleteLog}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={async (s) => {
          setSettings(s);
          // Sync to API
          try {
            await api.saveSettings({
              average_cycle_length: s.averageCycleLength,
              average_period_length: s.averagePeriodLength,
              luteal_phase_length: s.lutealPhaseLength,
              reminder_enabled: s.reminderEnabled,
              reminder_days_before: s.reminderDaysBefore,
              passcode_enabled: s.passcodeEnabled,
              passcode: s.passcode,
            });
            
            // If passcode was just enabled, require authentication immediately
            if (s.passcodeEnabled && !settings.passcodeEnabled) {
              setIsAuthenticated(false);
              setShowPasscodeScreen(true);
            }
          } catch (error) {
            console.error('Failed to save settings to API:', error);
          }
        }}
        onResetToSampleData={handleResetToSampleData}
        onClearAllData={handleClearAllData}
      />
    </div>
  );
}
