import type {
  BackupData,
  Child,
  VaccineSchedule,
  VaccineRecord,
  CheckupSchedule,
  CheckupRecord,
  Reminder,
  VaccineReactionDiary,
  MilestoneAssessment,
  AbnormalItem,
  AppSettings,
  TemperatureRecord,
  MedicationReminder,
} from '@/types';
import { formatDate, formatDateTime } from './dateUtils';

const BACKUP_VERSION = 2;
const BACKUP_FILENAME_PREFIX = '宝宝数据备份';

interface BackupState {
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
  settings: AppSettings;
}

export function createBackupData(state: BackupState): BackupData {
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    children: state.children,
    currentChildId: state.currentChildId,
    vaccineSchedules: state.vaccineSchedules,
    vaccineRecords: state.vaccineRecords,
    checkupSchedules: state.checkupSchedules,
    checkupRecords: state.checkupRecords,
    reminders: state.reminders,
    reactionDiaries: state.reactionDiaries,
    milestoneAssessments: state.milestoneAssessments,
    abnormalItems: state.abnormalItems,
    temperatureRecords: state.temperatureRecords,
    medicationReminders: state.medicationReminders || [],
    settings: state.settings,
  };
}

export function validateBackupData(data: unknown): data is BackupData {
  if (typeof data !== 'object' || data === null) return false;

  const d = data as Record<string, unknown>;

  if (typeof d.version !== 'number') return false;
  if (typeof d.exportedAt !== 'string') return false;
  if (!Array.isArray(d.children)) return false;
  if (!Array.isArray(d.vaccineSchedules)) return false;
  if (!Array.isArray(d.vaccineRecords)) return false;
  if (!Array.isArray(d.checkupSchedules)) return false;
  if (!Array.isArray(d.checkupRecords)) return false;
  if (!Array.isArray(d.reminders)) return false;
  if (!Array.isArray(d.reactionDiaries)) return false;
  if (!Array.isArray(d.milestoneAssessments)) return false;
  if (!Array.isArray(d.abnormalItems)) return false;
  if (!Array.isArray(d.temperatureRecords)) return false;
  if (!Array.isArray(d.medicationReminders) && d.version >= 2) return false;
  if (typeof d.settings !== 'object' || d.settings === null) return false;

  return true;
}

export function exportBackupToFile(data: BackupData): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${BACKUP_FILENAME_PREFIX}_${formatDate(new Date())}_v${data.version}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importBackupFromFile(file: File): Promise<BackupData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);
        if (!validateBackupData(data)) {
          reject(new Error('备份文件格式不正确或已损坏'));
          return;
        }
        resolve(data);
      } catch {
        reject(new Error('文件解析失败，请确保这是有效的 JSON 备份文件'));
      }
    };
    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };
    reader.readAsText(file);
  });
}

export function getBackupSummary(data: BackupData): string {
  const childCount = data.children.length;
  const vaccineRecordCount = data.vaccineRecords.length;
  const checkupRecordCount = data.checkupRecords.length;
  const milestoneCount = data.milestoneAssessments.length;
  const temperatureCount = data.temperatureRecords?.length || 0;
  const medicationCount = data.medicationReminders?.length || 0;
  const exportDate = formatDateTime(data.exportedAt);

  return `备份时间：${exportDate}
宝宝数量：${childCount}
接种记录：${vaccineRecordCount} 条
体检记录：${checkupRecordCount} 条
发育评估：${milestoneCount} 次
体温记录：${temperatureCount} 条
用药提醒：${medicationCount} 个
版本：v${data.version}`;
}
