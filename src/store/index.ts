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
} from '@/types';
import {
  generateVaccineSchedules,
  generateCheckupSchedules,
  generateReminders,
  generateId,
  addHours,
} from '@/utils/dateUtils';

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

  saveMilestoneAssessment: (assessment: Omit<MilestoneAssessment, 'id' | 'childId' | 'createdAt' | 'updatedAt'>) => void;
  deleteMilestoneAssessment: (id: string) => void;

  refreshReminders: () => void;
  markReminderComplete: (id: string) => void;

  updateSettings: (settings: Partial<AppSettings>) => void;

  updateVaccineScheduleStatus: (scheduleId: string, status: VaccineSchedule['status']) => void;
  updateCheckupScheduleStatus: (scheduleId: string, status: CheckupSchedule['status']) => void;

  addReactionLog: (diaryId: string, log: Omit<ReactionLogEntry, 'id' | 'createdAt'>) => void;
  updateReactionLog: (diaryId: string, logId: string, data: Partial<ReactionLogEntry>) => void;
  deleteReactionLog: (diaryId: string, logId: string) => void;
  getDiaryByRecordId: (recordId: string) => VaccineReactionDiary | undefined;
  completeDiary: (diaryId: string) => void;
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
    }),
    {
      name: 'vaccine-checkup-storage',
    }
  )
);
