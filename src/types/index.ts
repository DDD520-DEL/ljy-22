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
  medicationReminders: MedicationReminder[];
  sleepRecords: SleepRecord[];
  allergyRecords: AllergyRecord[];
  milestoneEvents: MilestoneEvent[];
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

export type MedicationDoseStatus = '待服用' | '已服用' | '已跳过' | '已过期';

export interface MedicationDose {
  id: string;
  date: string;
  time: string;
  status: MedicationDoseStatus;
  takenAt?: string;
  notes?: string;
}

export interface MedicationReminder {
  id: string;
  childId: string;
  medicationName: string;
  medicationType: string;
  dosage: string;
  unit: string;
  startDate: string;
  endDate: string;
  timesPerDay: number;
  times: string[];
  doses: MedicationDose[];
  notes?: string;
  status: '进行中' | '已完成' | '已取消';
  createdAt: string;
  updatedAt: string;
}

export type AllergyCategory = '食物' | '药物' | '环境';

export interface AllergyRecord {
  id: string;
  childId: string;
  allergenName: string;
  category: AllergyCategory;
  discoveryDate: string;
  reaction: string;
  createdAt: string;
  updatedAt: string;
}

export interface MilestoneEvent {
  id: string;
  childId: string;
  type: 'vaccine' | 'checkup' | 'custom';
  title: string;
  date: string;
  description?: string;
  photo?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SleepRecord {
  id: string;
  childId: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  nightWakings: number;
  duration: number;
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

export type ExpenseCategory =
  | '疫苗费用'
  | '体检费用'
  | '奶粉辅食'
  | '纸尿裤'
  | '衣物玩具'
  | '医疗药品'
  | '教育娱乐'
  | '其他';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  '疫苗费用',
  '体检费用',
  '奶粉辅食',
  '纸尿裤',
  '衣物玩具',
  '医疗药品',
  '教育娱乐',
  '其他',
];

export const EXPENSE_CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  '疫苗费用': '#4ADE80',
  '体检费用': '#FB7185',
  '奶粉辅食': '#FBBF24',
  '纸尿裤': '#60A5FA',
  '衣物玩具': '#A78BFA',
  '医疗药品': '#F472B6',
  '教育娱乐': '#2DD4BF',
  '其他': '#94A3B8',
};

export const EXPENSE_CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  '疫苗费用': '💉',
  '体检费用': '🏥',
  '奶粉辅食': '🍼',
  '纸尿裤': '🧷',
  '衣物玩具': '🧸',
  '医疗药品': '💊',
  '教育娱乐': '📚',
  '其他': '📦',
};

export interface ExpenseRecord {
  id: string;
  childId: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  expenseDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyExpenseSummary {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
}

export interface GrowthCalculatorRecord {
  id: string;
  childId: string;
  gender: '男' | '女';
  monthAge: number;
  weight?: number;
  height?: number;
  weightPercentile?: number;
  heightPercentile?: number;
  weightStatus?: string;
  heightStatus?: string;
  conclusion: string;
  createdAt: string;
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
  medicationReminders: MedicationReminder[];
  sleepRecords: SleepRecord[];
  allergyRecords: AllergyRecord[];
  milestoneEvents: MilestoneEvent[];
  expenseRecords: ExpenseRecord[];
  growthCalculatorRecords: GrowthCalculatorRecord[];
  settings: AppSettings;
}

export type AgeGroup = 'newborn' | '0-3months' | '4-6months' | '7-12months' | '1-2years' | '2-3years' | '3-6years';
export type ArticleTopic = '喂养' | '护理' | '发育' | '疾病' | '睡眠' | '安全' | '早教' | '心理';

export interface RelatedCheckup {
  monthAge: number;
  title: string;
  keyItems: string[];
}

export interface RelatedVaccine {
  vaccineCode: string;
  vaccineName: string;
  shortName: string;
  monthAge: number;
  category: '一类' | '二类';
}

export interface ParentingArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  coverEmoji: string;
  readTime: number;
  ageGroups: AgeGroup[];
  topics: ArticleTopic[];
  tags: string[];
  relatedCheckups: RelatedCheckup[];
  relatedVaccines: RelatedVaccine[];
}

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  newborn: '新生儿',
  '0-3months': '0-3月',
  '4-6months': '4-6月',
  '7-12months': '7-12月',
  '1-2years': '1-2岁',
  '2-3years': '2-3岁',
  '3-6years': '3-6岁',
};

export const ALL_TOPICS: ArticleTopic[] = ['喂养', '护理', '发育', '疾病', '睡眠', '安全', '早教', '心理'];
