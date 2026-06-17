import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Child,
  VaccineSchedule,
  VaccineRecord,
  CheckupSchedule,
  CheckupRecord,
  Reminder,
  AppSettings,
} from '@/types';
import {
  generateVaccineSchedules,
  generateCheckupSchedules,
  generateReminders,
  generateId,
} from '@/utils/dateUtils';

interface AppState {
  child: Child | null;
  vaccineSchedules: VaccineSchedule[];
  vaccineRecords: VaccineRecord[];
  checkupSchedules: CheckupSchedule[];
  checkupRecords: CheckupRecord[];
  reminders: Reminder[];
  settings: AppSettings;

  setChild: (child: Omit<Child, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateChild: (data: Partial<Child>) => void;
  clearChild: () => void;

  addVaccineRecord: (record: Omit<VaccineRecord, 'id' | 'childId' | 'createdAt'>) => void;
  updateVaccineRecord: (id: string, data: Partial<VaccineRecord>) => void;
  deleteVaccineRecord: (id: string) => void;

  addCheckupRecord: (record: Omit<CheckupRecord, 'id' | 'childId' | 'createdAt'>) => void;
  updateCheckupRecord: (id: string, data: Partial<CheckupRecord>) => void;
  deleteCheckupRecord: (id: string) => void;

  refreshReminders: () => void;
  markReminderComplete: (id: string) => void;

  updateSettings: (settings: Partial<AppSettings>) => void;

  updateVaccineScheduleStatus: (scheduleId: string, status: VaccineSchedule['status']) => void;
  updateCheckupScheduleStatus: (scheduleId: string, status: CheckupSchedule['status']) => void;
}

const initialSettings: AppSettings = {
  reminderDaysBefore: 3,
  notificationEnabled: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      child: null,
      vaccineSchedules: [],
      vaccineRecords: [],
      checkupSchedules: [],
      checkupRecords: [],
      reminders: [],
      settings: initialSettings,

      setChild: (data) => {
        const now = new Date().toISOString();
        const child: Child = {
          ...data,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        const vaccineSchedules = generateVaccineSchedules(child.id, child.birthDate);
        const checkupSchedules = generateCheckupSchedules(child.id, child.birthDate);
        const reminders = generateReminders(child.id, vaccineSchedules, checkupSchedules, get().settings.reminderDaysBefore);

        set({
          child,
          vaccineSchedules,
          checkupSchedules,
          reminders,
          vaccineRecords: [],
          checkupRecords: [],
        });
      },

      updateChild: (data) => {
        const state = get();
        if (!state.child) return;

        const child = {
          ...state.child,
          ...data,
          updatedAt: new Date().toISOString(),
        };

        let vaccineSchedules = state.vaccineSchedules;
        let checkupSchedules = state.checkupSchedules;
        let reminders = state.reminders;

        if (data.birthDate && data.birthDate !== state.child.birthDate) {
          vaccineSchedules = generateVaccineSchedules(child.id, data.birthDate);
          checkupSchedules = generateCheckupSchedules(child.id, data.birthDate);
          reminders = generateReminders(child.id, vaccineSchedules, checkupSchedules, state.settings.reminderDaysBefore);
        }

        set({ child, vaccineSchedules, checkupSchedules, reminders });
      },

      clearChild: () => {
        set({
          child: null,
          vaccineSchedules: [],
          vaccineRecords: [],
          checkupSchedules: [],
          checkupRecords: [],
          reminders: [],
        });
      },

      addVaccineRecord: (record) => {
        const state = get();
        if (!state.child) return;

        const newRecord: VaccineRecord = {
          ...record,
          id: generateId(),
          childId: state.child.id,
          createdAt: new Date().toISOString(),
        };

        const vaccineSchedules = state.vaccineSchedules.map((s) =>
          s.id === record.scheduleId ? { ...s, status: '已接种' as const } : s
        );

        set({
          vaccineRecords: [...state.vaccineRecords, newRecord],
          vaccineSchedules,
        });

        get().refreshReminders();
      },

      updateVaccineRecord: (id, data) => {
        set((state) => ({
          vaccineRecords: state.vaccineRecords.map((r) =>
            r.id === id ? { ...r, ...data } : r
          ),
        }));
      },

      deleteVaccineRecord: (id) => {
        const state = get();
        const record = state.vaccineRecords.find((r) => r.id === id);

        const vaccineSchedules = state.vaccineSchedules.map((s) =>
          record && s.id === record.scheduleId ? { ...s, status: '待接种' as const } : s
        );

        set({
          vaccineRecords: state.vaccineRecords.filter((r) => r.id !== id),
          vaccineSchedules,
        });

        get().refreshReminders();
      },

      addCheckupRecord: (record) => {
        const state = get();
        if (!state.child) return;

        const newRecord: CheckupRecord = {
          ...record,
          id: generateId(),
          childId: state.child.id,
          createdAt: new Date().toISOString(),
        };

        const checkupSchedules = state.checkupSchedules.map((s) =>
          s.id === record.scheduleId ? { ...s, status: '已体检' as const } : s
        );

        set({
          checkupRecords: [...state.checkupRecords, newRecord],
          checkupSchedules,
        });

        get().refreshReminders();
      },

      updateCheckupRecord: (id, data) => {
        set((state) => ({
          checkupRecords: state.checkupRecords.map((r) =>
            r.id === id ? { ...r, ...data } : r
          ),
        }));
      },

      deleteCheckupRecord: (id) => {
        const state = get();
        const record = state.checkupRecords.find((r) => r.id === id);

        const checkupSchedules = state.checkupSchedules.map((s) =>
          record && s.id === record.scheduleId ? { ...s, status: '待体检' as const } : s
        );

        set({
          checkupRecords: state.checkupRecords.filter((r) => r.id !== id),
          checkupSchedules,
        });

        get().refreshReminders();
      },

      refreshReminders: () => {
        const state = get();
        if (!state.child) return;

        const reminders = generateReminders(
          state.child.id,
          state.vaccineSchedules,
          state.checkupSchedules,
          state.settings.reminderDaysBefore
        );

        set({ reminders });
      },

      markReminderComplete: (id) => {
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id ? { ...r, status: '已完成' as const } : r
          ),
        }));
      },

      updateSettings: (settings) => {
        const state = get();
        const newSettings = { ...state.settings, ...settings };

        if (state.child && settings.reminderDaysBefore !== undefined) {
          const reminders = generateReminders(
            state.child.id,
            state.vaccineSchedules,
            state.checkupSchedules,
            newSettings.reminderDaysBefore
          );
          set({ settings: newSettings, reminders });
        } else {
          set({ settings: newSettings });
        }
      },

      updateVaccineScheduleStatus: (scheduleId, status) => {
        set((state) => ({
          vaccineSchedules: state.vaccineSchedules.map((s) =>
            s.id === scheduleId ? { ...s, status } : s
          ),
        }));
        get().refreshReminders();
      },

      updateCheckupScheduleStatus: (scheduleId, status) => {
        set((state) => ({
          checkupSchedules: state.checkupSchedules.map((s) =>
            s.id === scheduleId ? { ...s, status } : s
          ),
        }));
        get().refreshReminders();
      },
    }),
    {
      name: 'vaccine-checkup-storage',
    }
  )
);
