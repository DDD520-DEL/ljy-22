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
  VaccineReactionDiary,
  ReactionLogEntry,
  ReactionSummary,
  MilestoneAssessment,
  AbnormalItem,
  BackupData,
  TemperatureRecord,
  MedicationReminder,
  MedicationDoseStatus,
  SleepRecord,
  AllergyRecord,
} from '@/types';
import {
  generateVaccineSchedules,
  generateCheckupSchedules,
  generateReminders,
  generateId,
  addHours,
  getToday,
  addDays,
  getDaysBetween,
  recalculateSubsequentDoses,
  formatDate,
} from '@/utils/dateUtils';
import {
  createBackupData,
  exportBackupToFile,
  importBackupFromFile,
} from '@/utils/backup';

interface AppState {
  children: Child[];
  currentChildId: string | null;
  vaccineSchedules: VaccineSchedule[];
  vaccineRecords: VaccineRecord[];
  checkupSchedules: CheckupSchedule[];
  checkupRecords: CheckupRecord[];
  reminders: Reminder[];
  reactionDiaries: VaccineReactionDiary[];
  milestoneAssessments: MilestoneAssessment[];
  abnormalItems: AbnormalItem[];
  temperatureRecords: TemperatureRecord[];
  medicationReminders: MedicationReminder[];
  sleepRecords: SleepRecord[];
  allergyRecords: AllergyRecord[];
  settings: AppSettings;

  get currentChild(): Child | null;

  addChild: (child: Omit<Child, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateChild: (id: string, data: Partial<Child>) => void;
  deleteChild: (id: string) => void;
  switchChild: (id: string) => void;

  addVaccineRecord: (record: Omit<VaccineRecord, 'id' | 'childId' | 'createdAt'>) => void;
  updateVaccineRecord: (id: string, data: Partial<VaccineRecord>) => void;
  deleteVaccineRecord: (id: string) => void;

  addCheckupRecord: (record: Omit<CheckupRecord, 'id' | 'childId' | 'createdAt'>) => CheckupRecord | null;
  updateCheckupRecord: (id: string, data: Partial<CheckupRecord>) => void;
  deleteCheckupRecord: (id: string) => void;

  saveMilestoneAssessment: (assessment: Omit<MilestoneAssessment, 'id' | 'childId' | 'createdAt' | 'updatedAt'>) => void;
  deleteMilestoneAssessment: (id: string) => void;

  refreshReminders: () => void;
  markReminderComplete: (id: string) => void;

  addAbnormalItems: (items: Omit<AbnormalItem, 'id' | 'childId' | 'createdAt'>[]) => void;
  resolveAbnormalItem: (id: string) => void;
  archiveResolvedAbnormalItems: () => void;

  addTemperatureRecord: (record: Omit<TemperatureRecord, 'id' | 'childId' | 'createdAt' | 'updatedAt'>) => void;
  updateTemperatureRecord: (id: string, data: Partial<TemperatureRecord>) => void;
  deleteTemperatureRecord: (id: string) => void;

  addMedicationReminder: (reminder: Omit<MedicationReminder, 'id' | 'childId' | 'createdAt' | 'updatedAt' | 'doses' | 'status'>) => void;
  updateMedicationReminder: (id: string, data: Partial<MedicationReminder>) => void;
  deleteMedicationReminder: (id: string) => void;
  updateMedicationDoseStatus: (reminderId: string, doseId: string, status: MedicationDoseStatus) => void;
  cancelMedicationReminder: (id: string) => void;
  refreshMedicationDoseStatus: () => void;

  addSleepRecord: (record: Omit<SleepRecord, 'id' | 'childId' | 'createdAt' | 'updatedAt'>) => void;
  updateSleepRecord: (id: string, data: Partial<SleepRecord>) => void;
  deleteSleepRecord: (id: string) => void;

  addAllergyRecord: (record: Omit<AllergyRecord, 'id' | 'childId' | 'createdAt' | 'updatedAt'>) => void;
  updateAllergyRecord: (id: string, data: Partial<AllergyRecord>) => void;
  deleteAllergyRecord: (id: string) => void;

  updateSettings: (settings: Partial<AppSettings>) => void;

  updateVaccineScheduleStatus: (scheduleId: string, status: VaccineSchedule['status']) => void;
  updateCheckupScheduleStatus: (scheduleId: string, status: CheckupSchedule['status']) => void;
  postponeVaccineSchedule: (scheduleId: string, newPlannedDate: string, reason: string) => void;

  addReactionLog: (diaryId: string, log: Omit<ReactionLogEntry, 'id' | 'createdAt'>) => void;
  updateReactionLog: (diaryId: string, logId: string, data: Partial<ReactionLogEntry>) => void;
  deleteReactionLog: (diaryId: string, logId: string) => void;
  getDiaryByRecordId: (recordId: string) => VaccineReactionDiary | undefined;
  completeDiary: (diaryId: string) => void;

  exportBackup: () => void;
  importBackup: (file: File) => Promise<BackupData>;
  refreshBackupReminder: () => void;
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
      reactionDiaries: [],
      milestoneAssessments: [],
      abnormalItems: [],
      temperatureRecords: [],
      medicationReminders: [],
      sleepRecords: [],
      allergyRecords: [],
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
          const newReactionDiaries = state.reactionDiaries.filter((d) => d.childId !== id);
          const newMilestoneAssessments = state.milestoneAssessments.filter((a) => a.childId !== id);
          const newAbnormalItems = state.abnormalItems.filter((a) => a.childId !== id);
          const newTemperatureRecords = state.temperatureRecords.filter((r) => r.childId !== id);
          const newMedicationReminders = state.medicationReminders.filter((m) => m.childId !== id);
          const newSleepRecords = state.sleepRecords.filter((r) => r.childId !== id);
          const newAllergyRecords = state.allergyRecords.filter((r) => r.childId !== id);

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
            reactionDiaries: newReactionDiaries,
            milestoneAssessments: newMilestoneAssessments,
            abnormalItems: newAbnormalItems,
            temperatureRecords: newTemperatureRecords,
            medicationReminders: newMedicationReminders,
            sleepRecords: newSleepRecords,
            allergyRecords: newAllergyRecords,
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

        const relatedSchedule = state.vaccineSchedules.find((s) => s.id === record.scheduleId);
        const startTime = new Date(record.vaccinationDate).toISOString();
        const endTime = addHours(startTime, 72);

        const newDiary: VaccineReactionDiary = {
          id: generateId(),
          childId: state.currentChildId,
          vaccineRecordId: newRecord.id,
          scheduleId: record.scheduleId,
          vaccineName: record.vaccineName,
          vaccineShortName: record.vaccineShortName,
          doseNumber: relatedSchedule?.doseNumber || 1,
          vaccinationDate: record.vaccinationDate,
          startTime,
          endTime,
          status: '观察中',
          logs: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set({
          vaccineRecords: [...state.vaccineRecords, newRecord],
          vaccineSchedules,
          reactionDiaries: [...state.reactionDiaries, newDiary],
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
          reactionDiaries: state.reactionDiaries.filter((d) => d.vaccineRecordId !== id),
        });

        get().refreshReminders();
      },

      addCheckupRecord: (record) => {
        const state = get();
        if (!state.currentChildId) return null;

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
        return newRecord;
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

      saveMilestoneAssessment: (assessment) => {
        const state = get();
        if (!state.currentChildId) return;

        const now = new Date().toISOString();
        const existing = state.milestoneAssessments.find(
          (a) => a.childId === state.currentChildId && a.checklistMonthAge === assessment.checklistMonthAge
        );

        if (existing) {
          set({
            milestoneAssessments: state.milestoneAssessments.map((a) =>
              a.id === existing.id
                ? { ...a, ...assessment, updatedAt: now }
                : a
            ),
          });
        } else {
          const newAssessment: MilestoneAssessment = {
            ...assessment,
            id: generateId(),
            childId: state.currentChildId,
            createdAt: now,
            updatedAt: now,
          };
          set({
            milestoneAssessments: [...state.milestoneAssessments, newAssessment],
          });
        }
      },

      deleteMilestoneAssessment: (id) => {
        set((state) => ({
          milestoneAssessments: state.milestoneAssessments.filter((a) => a.id !== id),
        }));
      },

      refreshReminders: () => {
        const state = get();
        if (state.children.length === 0) return;

        const allReminders: Reminder[] = [];
        const abnormalReminders = state.reminders.filter((r) => r.type === 'abnormal');
        const scheduleAdjustReminders = state.reminders.filter((r) => r.type === 'schedule_adjust');
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

        const childAbnormalReminders = abnormalReminders.filter((ar) =>
          state.children.some((c) => c.id === ar.childId)
        );

        const childScheduleAdjustReminders = scheduleAdjustReminders.filter((r) =>
          state.children.some((c) => c.id === r.childId)
        );

        const backupReminderId = 'system-backup-reminder';
        const existingBackupReminder = state.reminders.find((r) => r.relatedId === backupReminderId);

        const mergedReminders = [...childAbnormalReminders, ...childScheduleAdjustReminders, ...allReminders];
        if (existingBackupReminder) {
          mergedReminders.push(existingBackupReminder);
        }

        set({ reminders: mergedReminders });
        get().refreshBackupReminder();
      },

      markReminderComplete: (id) => {
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id ? { ...r, status: '已完成' as const } : r
          ),
        }));
      },

      addAbnormalItems: (items) => {
        const state = get();
        if (!state.currentChildId) return;

        const now = new Date().toISOString();
        const newItems: AbnormalItem[] = items.map((item) => ({
          ...item,
          id: generateId(),
          childId: state.currentChildId!,
          createdAt: now,
        }));

        const newReminders: Reminder[] = newItems.map((item) => ({
          id: generateId(),
          childId: state.currentChildId!,
          type: 'abnormal' as const,
          relatedId: item.id,
          title: `复查提醒：${item.itemName}`,
          dueDate: item.recheckRemindDate,
          remindDate: item.recheckRemindDate,
          status: '已提醒' as const,
          daysBefore: 0,
        }));

        set((state) => ({
          abnormalItems: [...state.abnormalItems, ...newItems],
          reminders: [...newReminders, ...state.reminders],
        }));
      },

      resolveAbnormalItem: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          abnormalItems: state.abnormalItems.map((a) =>
            a.id === id ? { ...a, status: '已复查正常' as const, resolvedAt: now } : a
          ),
          reminders: state.reminders.map((r) =>
            r.type === 'abnormal' && r.relatedId === id ? { ...r, status: '已完成' as const } : r
          ),
        }));

        setTimeout(() => get().archiveResolvedAbnormalItems(), 3000);
      },

      archiveResolvedAbnormalItems: () => {
        const now = new Date().toISOString();
        set((state) => ({
          abnormalItems: state.abnormalItems.map((a) =>
            a.status === '已复查正常' ? { ...a, status: '已归档' as const, archivedAt: now } : a
          ),
        }));
      },

      addTemperatureRecord: (record) => {
        const state = get();
        if (!state.currentChildId) return;

        const now = new Date().toISOString();
        const newRecord: TemperatureRecord = {
          ...record,
          id: generateId(),
          childId: state.currentChildId,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          temperatureRecords: [...state.temperatureRecords, newRecord],
        }));
      },

      updateTemperatureRecord: (id, data) => {
        const now = new Date().toISOString();
        set((state) => ({
          temperatureRecords: state.temperatureRecords.map((r) =>
            r.id === id ? { ...r, ...data, updatedAt: now } : r
          ),
        }));
      },

      deleteTemperatureRecord: (id) => {
        set((state) => ({
          temperatureRecords: state.temperatureRecords.filter((r) => r.id !== id),
        }));
      },

      addMedicationReminder: (reminderData) => {
        const state = get();
        if (!state.currentChildId) return;

        const now = new Date().toISOString();
        const doses = [];
        const start = new Date(reminderData.startDate);
        const end = new Date(reminderData.endDate);

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateStr = formatDate(d);
          for (const time of reminderData.times) {
            doses.push({
              id: generateId(),
              date: dateStr,
              time,
              status: '待服用' as const,
            });
          }
        }

        const newReminder: MedicationReminder = {
          ...reminderData,
          id: generateId(),
          childId: state.currentChildId,
          doses,
          status: '进行中',
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          medicationReminders: [...state.medicationReminders, newReminder],
        }));
      },

      updateMedicationReminder: (id, data) => {
        const now = new Date().toISOString();
        set((state) => ({
          medicationReminders: state.medicationReminders.map((r) =>
            r.id === id ? { ...r, ...data, updatedAt: now } : r
          ),
        }));
      },

      deleteMedicationReminder: (id) => {
        set((state) => ({
          medicationReminders: state.medicationReminders.filter((r) => r.id !== id),
        }));
      },

      updateMedicationDoseStatus: (reminderId, doseId, status) => {
        const now = new Date().toISOString();
        set((state) => {
          const updatedReminders = state.medicationReminders.map((r) => {
            if (r.id !== reminderId) return r;

            const updatedDoses = r.doses.map((d) =>
              d.id === doseId
                ? {
                    ...d,
                    status,
                    takenAt: status === '已服用' ? now : d.takenAt,
                  }
                : d
            );

            const allDosesCompleted = updatedDoses.every(
              (d) => d.status === '已服用' || d.status === '已跳过' || d.status === '已过期'
            );
            const hasAnyPending = updatedDoses.some((d) => d.status === '待服用');

            let newStatus = r.status;
            if (allDosesCompleted && r.status === '进行中') {
              newStatus = '已完成';
            } else if (!hasAnyPending && r.status === '进行中') {
              newStatus = '已完成';
            }

            return {
              ...r,
              doses: updatedDoses,
              status: newStatus,
              updatedAt: now,
            };
          });

          return { medicationReminders: updatedReminders };
        });
      },

      cancelMedicationReminder: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          medicationReminders: state.medicationReminders.map((r) =>
            r.id === id ? { ...r, status: '已取消', updatedAt: now } : r
          ),
        }));
      },

      refreshMedicationDoseStatus: () => {
        const today = getToday();
        const nowTime = new Date();
        const currentTimeStr = `${String(nowTime.getHours()).padStart(2, '0')}:${String(nowTime.getMinutes()).padStart(2, '0')}`;

        set((state) => ({
          medicationReminders: state.medicationReminders.map((r) => {
            if (r.status !== '进行中') return r;

            let hasChanges = false;
            const updatedDoses = r.doses.map((d) => {
              if (d.status !== '待服用') return d;

              const dateCompare = getDaysBetween(d.date, today);
              if (dateCompare > 0) return d;

              if (dateCompare < 0 || (dateCompare === 0 && d.time < currentTimeStr)) {
                hasChanges = true;
                return { ...d, status: '已过期' as const };
              }
              return d;
            });

            if (!hasChanges) return r;

            return {
              ...r,
              doses: updatedDoses,
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      addSleepRecord: (record) => {
        const state = get();
        if (!state.currentChildId) return;

        const now = new Date().toISOString();
        const newRecord: SleepRecord = {
          ...record,
          id: generateId(),
          childId: state.currentChildId,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          sleepRecords: [...state.sleepRecords, newRecord],
        }));
      },

      updateSleepRecord: (id, data) => {
        const now = new Date().toISOString();
        set((state) => ({
          sleepRecords: state.sleepRecords.map((r) =>
            r.id === id ? { ...r, ...data, updatedAt: now } : r
          ),
        }));
      },

      deleteSleepRecord: (id) => {
        set((state) => ({
          sleepRecords: state.sleepRecords.filter((r) => r.id !== id),
        }));
      },

      addAllergyRecord: (record) => {
        const state = get();
        if (!state.currentChildId) return;

        const now = new Date().toISOString();
        const newRecord: AllergyRecord = {
          ...record,
          id: generateId(),
          childId: state.currentChildId,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          allergyRecords: [...state.allergyRecords, newRecord],
        }));
      },

      updateAllergyRecord: (id, data) => {
        const now = new Date().toISOString();
        set((state) => ({
          allergyRecords: state.allergyRecords.map((r) =>
            r.id === id ? { ...r, ...data, updatedAt: now } : r
          ),
        }));
      },

      deleteAllergyRecord: (id) => {
        set((state) => ({
          allergyRecords: state.allergyRecords.filter((r) => r.id !== id),
        }));
      },

      updateSettings: (settings) => {
        const state = get();
        const newSettings = { ...state.settings, ...settings };

        if (state.children.length > 0 && settings.reminderDaysBefore !== undefined) {
          const allReminders: Reminder[] = [];
          const abnormalReminders = state.reminders.filter((r) => r.type === 'abnormal');
          const scheduleAdjustReminders = state.reminders.filter((r) => r.type === 'schedule_adjust');
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
          const childAbnormalReminders = abnormalReminders.filter((ar) =>
            state.children.some((c) => c.id === ar.childId)
          );
          const childScheduleAdjustReminders = scheduleAdjustReminders.filter((r) =>
            state.children.some((c) => c.id === r.childId)
          );
          set({ settings: newSettings, reminders: [...childAbnormalReminders, ...childScheduleAdjustReminders, ...allReminders] });
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

      postponeVaccineSchedule: (scheduleId, newPlannedDate, reason) => {
        const state = get();
        const child = state.currentChild;
        if (!child) return;

        const { updatedSchedules, affectedCount } = recalculateSubsequentDoses(
          state.vaccineSchedules,
          scheduleId,
          newPlannedDate,
          reason,
          child.birthDate
        );

        const adjustedSchedule = updatedSchedules.find(s => s.id === scheduleId);
        if (!adjustedSchedule) return;

        const adjustNotification: Reminder = {
          id: generateId(),
          childId: child.id,
          type: 'schedule_adjust',
          relatedId: scheduleId,
          title: `${adjustedSchedule.vaccineShortName}接种计划已调整`,
          dueDate: newPlannedDate,
          remindDate: getToday(),
          status: '已提醒',
          daysBefore: 0,
          notifiedAt: new Date().toISOString(),
          adjustDetail: {
            vaccineName: adjustedSchedule.vaccineName,
            doseNumber: adjustedSchedule.doseNumber,
            oldDate: adjustedSchedule.adjustedFrom || adjustedSchedule.originalPlannedDate,
            newDate: newPlannedDate,
            reason: reason,
            affectedCount: affectedCount,
          },
        };

        set((state) => ({
          vaccineSchedules: updatedSchedules,
          reminders: [adjustNotification, ...state.reminders],
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

      addReactionLog: (diaryId, log) => {
        set((state) => ({
          reactionDiaries: state.reactionDiaries.map((d) =>
            d.id === diaryId
              ? {
                  ...d,
                  logs: [...d.logs, { ...log, id: generateId(), createdAt: new Date().toISOString() }].sort(
                    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : d
          ),
        }));
      },

      updateReactionLog: (diaryId, logId, data) => {
        set((state) => ({
          reactionDiaries: state.reactionDiaries.map((d) =>
            d.id === diaryId
              ? {
                  ...d,
                  logs: d.logs.map((l) => (l.id === logId ? { ...l, ...data } : l)).sort(
                    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : d
          ),
        }));
      },

      deleteReactionLog: (diaryId, logId) => {
        set((state) => ({
          reactionDiaries: state.reactionDiaries.map((d) =>
            d.id === diaryId
              ? {
                  ...d,
                  logs: d.logs.filter((l) => l.id !== logId),
                  updatedAt: new Date().toISOString(),
                }
              : d
          ),
        }));
      },

      getDiaryByRecordId: (recordId) => {
        return get().reactionDiaries.find((d) => d.vaccineRecordId === recordId);
      },

      completeDiary: (diaryId) => {
        const state = get();
        const diary = state.reactionDiaries.find((d) => d.id === diaryId);
        if (!diary || diary.status === '已结束') return;

        const logs = diary.logs;
        const temps = logs.filter((l) => l.temperature !== undefined).map((l) => l.temperature!);
        const rednessLevels = logs.filter((l) => l.rednessLevel).map((l) => l.rednessLevel!);
        const mentalStatuses = logs.filter((l) => l.mentalStatus).map((l) => l.mentalStatus!);

        const maxTemperature = temps.length > 0 ? Math.max(...temps) : undefined;

        const rednessOrder: Record<string, number> = { '无': 0, '轻微': 1, '中度': 2, '严重': 3 };
        const maxRednessLevel = rednessLevels.length > 0
          ? rednessLevels.reduce((a, b) => (rednessOrder[a] >= rednessOrder[b] ? a : b))
          : undefined;

        const mentalOrder: Record<string, number> = { '良好': 0, '一般': 1, '较差': 2, '嗜睡': 3 };
        const worstMentalStatus = mentalStatuses.length > 0
          ? mentalStatuses.reduce((a, b) => (mentalOrder[a] >= mentalOrder[b] ? a : b))
          : undefined;

        let symptomCount = 0;
        if (maxTemperature && maxTemperature >= 37.5) symptomCount++;
        if (maxRednessLevel && maxRednessLevel !== '无') symptomCount++;
        if (worstMentalStatus && worstMentalStatus !== '良好') symptomCount++;
        if (logs.some((l) => l.otherSymptoms)) symptomCount++;

        let overallSeverity: '无' | '轻微' | '中度' | '严重' = '无';
        if (maxTemperature && maxTemperature >= 39) overallSeverity = '严重';
        else if (maxRednessLevel === '严重' || worstMentalStatus === '嗜睡') overallSeverity = '严重';
        else if (maxTemperature && maxTemperature >= 38) overallSeverity = '中度';
        else if (maxRednessLevel === '中度' || worstMentalStatus === '较差') overallSeverity = '中度';
        else if (maxTemperature && maxTemperature >= 37.5) overallSeverity = '轻微';
        else if (maxRednessLevel === '轻微' || worstMentalStatus === '一般') overallSeverity = '轻微';

        let conclusion = '观察期内无明显不良反应，宝宝状态良好。';
        if (overallSeverity === '严重') {
          conclusion = '观察期内出现较严重不良反应，建议及时就医并咨询医生。';
        } else if (overallSeverity === '中度') {
          conclusion = '观察期内出现中度不良反应，请注意观察护理，如症状持续加重请及时就医。';
        } else if (overallSeverity === '轻微') {
          conclusion = '观察期内出现轻微不良反应，属正常疫苗反应，一般可自行缓解。';
        }

        const summary: ReactionSummary = {
          maxTemperature,
          maxRednessLevel,
          worstMentalStatus,
          overallSeverity,
          symptomCount,
          conclusion,
          completedAt: new Date().toISOString(),
        };

        set((state) => ({
          reactionDiaries: state.reactionDiaries.map((d) =>
            d.id === diaryId
              ? {
                  ...d,
                  status: '已结束',
                  summary,
                  updatedAt: new Date().toISOString(),
                }
              : d
          ),
        }));
      },

      exportBackup: () => {
        const state = get();
        const backupData = createBackupData(state);
        exportBackupToFile(backupData);
        const now = new Date().toISOString();
        set((prevState) => ({
          settings: { ...prevState.settings, lastBackupAt: now },
        }));
        get().refreshBackupReminder();
      },

      importBackup: async (file: File) => {
        const data = await importBackupFromFile(file);
        set({
          children: data.children,
          currentChildId: data.currentChildId,
          vaccineSchedules: data.vaccineSchedules,
          vaccineRecords: data.vaccineRecords,
          checkupSchedules: data.checkupSchedules,
          checkupRecords: data.checkupRecords,
          reminders: data.reminders,
          reactionDiaries: data.reactionDiaries,
          milestoneAssessments: data.milestoneAssessments,
          abnormalItems: data.abnormalItems,
          temperatureRecords: data.temperatureRecords || [],
          medicationReminders: data.medicationReminders || [],
          sleepRecords: data.sleepRecords || [],
          allergyRecords: data.allergyRecords || [],
          settings: data.settings,
        });
        return data;
      },

      refreshBackupReminder: () => {
        const state = get();
        const today = getToday();
        const lastBackupAt = state.settings.lastBackupAt;
        const backupReminderId = 'system-backup-reminder';
        const BACKUP_INTERVAL_DAYS = 30;

        const otherReminders = state.reminders.filter((r) => r.relatedId !== backupReminderId);

        if (state.children.length === 0) {
          set({ reminders: otherReminders });
          return;
        }

        const firstChildId = state.children[0]?.id;
        if (!firstChildId) {
          set({ reminders: otherReminders });
          return;
        }

        let shouldShowReminder = false;
        let dueDate = today;

        if (!lastBackupAt) {
          shouldShowReminder = true;
          dueDate = today;
        } else {
          const lastBackupDate = lastBackupAt.split('T')[0];
          const diffDays = getDaysBetween(lastBackupDate, today);
          if (diffDays >= BACKUP_INTERVAL_DAYS) {
            shouldShowReminder = true;
            dueDate = addDays(lastBackupDate, BACKUP_INTERVAL_DAYS);
          }
        }

        if (shouldShowReminder) {
          const existingReminder = state.reminders.find((r) => r.relatedId === backupReminderId);
          if (existingReminder && existingReminder.status === '已完成') {
            set({ reminders: otherReminders });
            return;
          }

          const backupReminder: Reminder = {
            id: existingReminder?.id || generateId(),
            childId: firstChildId,
            type: 'backup',
            relatedId: backupReminderId,
            title: '数据备份提醒',
            dueDate,
            remindDate: dueDate,
            status: '已提醒',
            daysBefore: 0,
          };
          set({ reminders: [...otherReminders, backupReminder] });
        } else {
          set({ reminders: otherReminders });
        }
      },
    }),
    {
      name: 'vaccine-checkup-storage',
      migrate: (persistedState: unknown) => {
        const state = persistedState as Partial<AppState>;
        
        if (state.vaccineSchedules) {
          state.vaccineSchedules = state.vaccineSchedules.map(schedule => ({
            ...schedule,
            originalPlannedDate: schedule.originalPlannedDate || schedule.plannedDate,
          }));
        }

        if (!state.medicationReminders) {
          state.medicationReminders = [];
        }

        if (!state.sleepRecords) {
          state.sleepRecords = [];
        }

        if (!state.allergyRecords) {
          state.allergyRecords = [];
        }
        
        return state as AppState;
      },
    }
  )
);
