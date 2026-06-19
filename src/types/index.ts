export interface Child {
  id: string;
  name: string;
  gender: '男' | '女';
  birthDate: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VaccineKnowledge {
  preventionPrinciple: string;
  contraindicationDetails: string[];
  nursingMethods: string[];
  tips: string[];
}

export interface VaccineDefinition {
  code: string;
  name: string;
  shortName: string;
  preventDisease: string;
  doses: DoseInfo[];
  route: string;
  contraindications: string[];
  commonReactions: string[];
  category: '一类' | '二类';
  knowledge: VaccineKnowledge;
}

export interface DoseInfo {
  doseNumber: number;
  monthAgeMin: number;
  monthAgeMax: number;
  recommendedMonthAge: number;
  site: string;
  intervalAfterPrevious?: number;
}

export interface VaccineSchedule {
  id: string;
  childId: string;
  vaccineCode: string;
  vaccineName: string;
  vaccineShortName: string;
  doseNumber: number;
  preventDisease: string;
  monthAge: number;
  plannedDate: string;
  originalPlannedDate: string;
  status: '待接种' | '已接种' | '已推迟' | '已错过';
  route: string;
  site: string;
  contraindications: string;
  notes?: string;
  category: '一类' | '二类';
  isAdjusted?: boolean;
  adjustReason?: string;
  adjustedAt?: string;
  adjustedFrom?: string;
}

export interface VaccineRecord {
  id: string;
  childId: string;
  scheduleId: string;
  vaccineName: string;
  vaccineShortName: string;
  manufacturer: string;
  batchNumber: string;
  vaccinationDate: string;
  site: string;
  doctor?: string;
  reaction: string;
  reactionSeverity: '无' | '轻微' | '中度' | '严重';
  notes?: string;
  createdAt: string;
}

export interface CheckupDefinition {
  monthAge: number;
  items: CheckupItem[];
  milestones: string[];
  notes: string[];
}

export interface CheckupItem {
  name: string;
  category: '体格测量' | '全身检查' | '发育评估' | '辅助检查' | '其他';
  description: string;
}

export interface CheckupSchedule {
  id: string;
  childId: string;
  monthAge: number;
  plannedDate: string;
  status: '待体检' | '已体检' | '已错过';
  items: CheckupItem[];
  milestones: string[];
  notes: string;
}

export interface CheckupRecord {
  id: string;
  childId: string;
  scheduleId: string;
  monthAge: number;
  checkupDate: string;
  weight?: number;
  height?: number;
  headCircumference?: number;
  bmi?: string;
  development?: string;
  itemsResult?: string;
  doctorAdvice?: string;
  notes?: string;
  createdAt: string;
}

export type DevelopmentDimension = '大运动' | '精细动作' | '语言' | '社交';

export interface MilestoneChecklistDefinition {
  monthAge: number;
  title: string;
  dimensions: Record<DevelopmentDimension, string[]>;
}

export interface MilestoneAssessment {
  id: string;
  childId: string;
  monthAge: number;
  checklistMonthAge: number;
  checkedItems: Record<DevelopmentDimension, string[]>;
  scores: Record<DevelopmentDimension, number>;
  totalScore: number;
  level: '优秀' | '良好' | '需关注' | '建议复查';
  summary: string;
  assessmentDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  childId: string;
  type: 'vaccine' | 'checkup' | 'abnormal' | 'backup' | 'schedule_adjust';
  relatedId: string;
  title: string;
  dueDate: string;
  remindDate: string;
  status: '待提醒' | '已提醒' | '已完成';
  daysBefore: number;
  notifiedAt?: string;
  adjustDetail?: {
    vaccineName: string;
    doseNumber: number;
    oldDate: string;
    newDate: string;
    reason: string;
    affectedCount: number;
  };
}

export interface BackupData {
  version: number;
  exportedAt: string;
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
  settings: AppSettings;
}

export interface AbnormalItem {
  id: string;
  childId: string;
  checkupRecordId: string;
  itemName: string;
  category: CheckupItem['category'];
  abnormalDetail: string;
  status: '待复查' | '已复查正常' | '已归档';
  createdAt: string;
  resolvedAt?: string;
  archivedAt?: string;
  recheckRemindDate: string;
}

export interface AppSettings {
  reminderDaysBefore: number;
  notificationEnabled: boolean;
  lastBackupAt?: string;
}

export type RednessLevel = '无' | '轻微' | '中度' | '严重';
export type MentalStatus = '良好' | '一般' | '较差' | '嗜睡';
export type DiaryStatus = '观察中' | '已结束';

export interface ReactionLogEntry {
  id: string;
  timestamp: string;
  temperature?: number;
  rednessLevel?: RednessLevel;
  rednessSize?: string;
  mentalStatus?: MentalStatus;
  otherSymptoms?: string;
  notes?: string;
  createdAt: string;
}

export interface ReactionSummary {
  maxTemperature?: number;
  maxRednessLevel?: RednessLevel;
  worstMentalStatus?: MentalStatus;
  overallSeverity: '无' | '轻微' | '中度' | '严重';
  symptomCount: number;
  conclusion: string;
  recoveryDays?: number;
  completedAt: string;
}

export interface VaccineReactionDiary {
  id: string;
  childId: string;
  vaccineRecordId: string;
  scheduleId: string;
  vaccineName: string;
  vaccineShortName: string;
  doseNumber: number;
  vaccinationDate: string;
  startTime: string;
  endTime: string;
  status: DiaryStatus;
  logs: ReactionLogEntry[];
  summary?: ReactionSummary;
  createdAt: string;
  updatedAt: string;
}

export type TemperatureSite = '腋下' | '口腔' | '额温' | '耳温' | '肛温';

export interface TemperatureRecord {
  id: string;
  childId: string;
  temperature: number;
  site: TemperatureSite;
  measureDate: string;
  measureTime: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export function isFever(temperature: number, site: TemperatureSite): boolean {
  const thresholds: Record<TemperatureSite, number> = {
    '腋下': 37.2,
    '口腔': 37.5,
    '额温': 37.2,
    '耳温': 37.5,
    '肛温': 38.0,
  };
  return temperature >= thresholds[site];
}
