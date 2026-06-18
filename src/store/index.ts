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
  children: Child[];
  currentChildId: string | null;
  vaccineSchedules: VaccineSchedule[];
  vaccineRecords: VaccineRecord[];
  checkupSchedules: CheckupSchedule[];
  checkupRecords: CheckupRecord[];
  reminders: Reminder[];
  settings: AppSettings;

  get currentChild(): Child | null;

  addChild: (child: Omit<Child, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateChild: (id: string, data: Partial<Child>) => void;
  deleteChild: (id: string) => void;
  switchChild: (id: string) => void;

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
      children: [],
      currentChildId: null,
      vaccineSchedules: [],
      vaccineRecords: [],
      checkupSchedules: [],
      checkupRecords: [],
      reminders: [],
      settings: initialSettings,

      get currentChild() {
        const state = get();
        return state.children.find((c) => c.id === state.currentChildId) || null;
      },

      addChild: (data) => {
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

        set((state) => ({
          children: [...state.children, child],
          currentChildId: state.currentChildId || child.id,
          vaccineSchedules: [...state.vaccineSchedules, ...vaccineSchedules],
          checkupSchedules: [...state.checkupSchedules, ...checkupSchedules],
          reminders: [...state.reminders, ...reminders],
        }));
      },

      updateChild: (id, data) => {
        const state = get();
        const childIndex = state.children.findIndex((c) => c.id === id);
        if (childIndex === -1) return;

        const child = {
          ...state.children[childIndex],
          ...data,
          updatedAt: new Date().toISOString(),
        };

        const newChildren = [...state.children];
        newChildren[childIndex] = child;

        let vaccineSchedules = state.vaccineSchedules;
        let checkupSchedules = state.checkupSchedules;
        let reminders = state.reminders;

        if (data.birthDate && data.birthDate !== state.children[childIndex].birthDate) {
          vaccineSchedules = [
            ...state.vaccineSchedules.filter((s) => s.childId !== id),
            ...generateVaccineSchedules(id, data.birthDate),
          ];
          checkupSchedules = [
            ...state.checkupSchedules.filter((s) => s.childId !== id),
            ...generateCheckupSchedules(id, data.birthDate),
          ];
          const childVaccineSchedules = vaccineSchedules.filter((s) => s.childId === id);
          const childCheckupSchedules = checkupSchedules.filter((s) => s.childId === id);
          const childReminders = generateReminders(id, childVaccineSchedules, childCheckupSchedules, state.settings.reminderDaysBefore);
          reminders = [
            ...state.reminders.filter((r) => r.childId !== id),
            ...childReminders,
          ];
        }

        set({ children: newChildren, vaccineSchedules, checkupSchedules, reminders });
      },

      deleteChild: (id) => {
        set((state) => {
          const newChildren = state.children.filter((c) => c.id !== id);
          const newVaccineSchedules = state.vaccineSchedules.filter((s) => s.childId !== id);
          const newCheckupSchedules = state.checkupSchedules.filter((s) => s.childId !== id);
          const newVaccineRecords = state.vaccineRecords.filter((r) => r.childId !== id);
          const newCheckupRecords = state.checkupRecords.filter((r) => r.childId !== id);
          const newReminders = state.reminders.filter((r) => r.childId !== id);

          let newCurrentChildId = state.currentChildId;
          if (state.currentChildId === id) {
            newCurrentChildId = newChildren.length > 0 ? newChildren[0].id : null;
          }

          return {
            children: newChildren,
            currentChildId: newCurrentChildId,
            vaccineSchedules: newVaccineSchedules,
            checkupSchedules: newCheckupSchedules,
            vaccineRecords: newVaccineRecords,
            checkupRecords: newCheckupRecords,
            reminders: newReminders,
          };
        });
      },

      switchChild: (id) => {
        const state = get();
        if (state.children.some((c) => c.id === id)) {
          set({ currentChildId: id });
        }
      },

      addVaccineRecord: (record) => {
        const state = get();
        if (!state.currentChildId) return;

        const newRecord: VaccineRecord = {
          ...record,
          id: generateId(),
          childId: state.currentChildId,
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
        if (!state.currentChildId) return;

        const newRecord: CheckupRecord = {
          ...record,
          id: generateId(),
          childId: state.currentChildId,
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
        if (state.children.length === 0) return;

        const allReminders: Reminder[] = [];
        for (const child of state.children) {
          const childVaccineSchedules = state.vaccineSchedules.filter((s) => s.childId === child.id);
          const childCheckupSchedules = state.checkupSchedules.filter((s) => s.childId === child.id);
          const childReminders = generateReminders(
            child.id,
            childVaccineSchedules,
            childCheckupSchedules,
            state.settings.reminderDaysBefore
          );
          allReminders.push(...childReminders);
        }

        set({ reminders: allReminders });
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

        if (state.children.length > 0 && settings.reminderDaysBefore !== undefined) {
          const allReminders: Reminder[] = [];
          for (const child of state.children) {
            const childVaccineSchedules = state.vaccineSchedules.filter((s) => s.childId === child.id);
            const childCheckupSchedules = state.checkupSchedules.filter((s) => s.childId === child.id);
            const childReminders = generateReminders(
              child.id,
              childVaccineSchedules,
              childCheckupSchedules,
              newSettings.reminderDaysBefore
            );
            allReminders.push(...childReminders);
          }
          set({ settings: newSettings, reminders: allReminders });
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
