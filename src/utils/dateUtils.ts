import type { VaccineSchedule, CheckupSchedule, Reminder } from '@/types';
import { VACCINE_DEFINITIONS } from '@/data/vaccines';
import { CHECKUP_DEFINITIONS } from '@/data/checkups';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export function addMonths(date: Date | string, months: number): string {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  const targetMonth = d.getMonth() + months;
  const yearAdjust = Math.floor(targetMonth / 12);
  const monthAdjust = targetMonth % 12;
  
  const newDate = new Date(d.getFullYear() + yearAdjust, monthAdjust, 1);
  const daysInMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
  const day = Math.min(d.getDate(), daysInMonth);
  
  newDate.setDate(day);
  return formatDate(newDate);
}

export function addDays(date: Date | string, days: number): string {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

export function addHours(date: Date | string, hours: number): string {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  d.setHours(d.getHours() + hours);
  return d.toISOString();
}

export function getHoursBetween(date1: string | Date, date2: string | Date): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : new Date(date1);
  const d2 = typeof date2 === 'string' ? new Date(date2) : new Date(date2);
  const diffMs = d2.getTime() - d1.getTime();
  return diffMs / (1000 * 60 * 60);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}年${month}月${day}日 ${hours}:${minutes}`;
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatDate(date: Date | string, format: 'YYYY-MM-DD' | 'YYYY年MM月DD日' | 'MM/DD' = 'YYYY-MM-DD'): string {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  switch (format) {
    case 'YYYY年MM月DD日':
      return `${year}年${month}月${day}日`;
    case 'MM/DD':
      return `${month}/${day}`;
    default:
      return `${year}-${month}-${day}`;
  }
}

export function getToday(): string {
  return formatDate(new Date());
}

export function getDaysBetween(date1: string | Date, date2: string | Date): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : new Date(date1);
  const d2 = typeof date2 === 'string' ? new Date(date2) : new Date(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function calculateMonthAge(birthDate: string | Date, targetDate?: string | Date): number {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : new Date(birthDate);
  const target = targetDate 
    ? (typeof targetDate === 'string' ? new Date(targetDate) : new Date(targetDate))
    : new Date();
  
  let months = (target.getFullYear() - birth.getFullYear()) * 12 + (target.getMonth() - birth.getMonth());
  
  if (target.getDate() < birth.getDate()) {
    months--;
  }
  
  return Math.max(0, months);
}

export function formatMonthAge(months: number): string {
  if (months < 12) {
    return `${months}月龄`;
  }
  const years = Math.floor(months / 12);
  const remainMonths = months % 12;
  if (remainMonths === 0) {
    return `${years}岁`;
  }
  return `${years}岁${remainMonths}月`;
}

export function generateVaccineSchedules(childId: string, birthDate: string): VaccineSchedule[] {
  const schedules: VaccineSchedule[] = [];
  
  for (const vaccine of VACCINE_DEFINITIONS) {
    for (const dose of vaccine.doses) {
      const plannedDate = addMonths(birthDate, dose.recommendedMonthAge);
      
      schedules.push({
        id: generateId(),
        childId,
        vaccineCode: vaccine.code,
        vaccineName: vaccine.name,
        vaccineShortName: vaccine.shortName,
        doseNumber: dose.doseNumber,
        preventDisease: vaccine.preventDisease,
        monthAge: dose.recommendedMonthAge,
        plannedDate,
        status: '待接种',
        route: vaccine.route,
        site: dose.site,
        contraindications: vaccine.contraindications.join('；'),
        category: vaccine.category,
        notes: undefined,
      });
    }
  }
  
  schedules.sort((a, b) => a.monthAge - b.monthAge);
  updateScheduleStatus(schedules);
  return schedules;
}

export function generateCheckupSchedules(childId: string, birthDate: string): CheckupSchedule[] {
  const schedules: CheckupSchedule[] = [];
  
  for (const checkup of CHECKUP_DEFINITIONS) {
    const plannedDate = addMonths(birthDate, checkup.monthAge);
    
    schedules.push({
      id: generateId(),
      childId,
      monthAge: checkup.monthAge,
      plannedDate,
      status: '待体检',
      items: checkup.items,
      milestones: checkup.milestones,
      notes: checkup.notes.join('；'),
    });
  }
  
  schedules.sort((a, b) => a.monthAge - b.monthAge);
  updateCheckupStatus(schedules);
  return schedules;
}

export function updateScheduleStatus<T extends { status: string; plannedDate: string }>(schedules: T[]): void {
  const today = getToday();
  for (const schedule of schedules) {
    if (schedule.status === '待接种' || schedule.status === '待体检') {
      const daysDiff = getDaysBetween(today, schedule.plannedDate);
      if (daysDiff < -30) {
        schedule.status = schedule.status === '待接种' ? '已错过' : '已错过';
      }
    }
  }
}

export function updateCheckupStatus<T extends { status: string; plannedDate: string }>(schedules: T[]): void {
  updateScheduleStatus(schedules);
}

export function generateReminders(
  childId: string,
  vaccineSchedules: VaccineSchedule[],
  checkupSchedules: CheckupSchedule[],
  daysBefore: number = 3
): Reminder[] {
  const reminders: Reminder[] = [];
  const today = getToday();
  
  for (const vs of vaccineSchedules) {
    if (vs.status === '待接种') {
      const remindDate = addDays(vs.plannedDate, -daysBefore);
      const daysToDue = getDaysBetween(today, vs.plannedDate);
      
      if (daysToDue <= daysBefore && daysToDue >= 0) {
        reminders.push({
          id: generateId(),
          childId,
          type: 'vaccine',
          relatedId: vs.id,
          title: `${vs.vaccineShortName} (第${vs.doseNumber}剂) 接种提醒`,
          dueDate: vs.plannedDate,
          remindDate,
          status: getDaysBetween(today, remindDate) <= 0 ? '已提醒' : '待提醒',
          daysBefore,
        });
      }
    }
  }
  
  for (const cs of checkupSchedules) {
    if (cs.status === '待体检') {
      const remindDate = addDays(cs.plannedDate, -daysBefore);
      const daysToDue = getDaysBetween(today, cs.plannedDate);
      
      if (daysToDue <= daysBefore && daysToDue >= 0) {
        reminders.push({
          id: generateId(),
          childId,
          type: 'checkup',
          relatedId: cs.id,
          title: `${formatMonthAge(cs.monthAge)} 儿保体检提醒`,
          dueDate: cs.plannedDate,
          remindDate,
          status: getDaysBetween(today, remindDate) <= 0 ? '已提醒' : '待提醒',
          daysBefore,
        });
      }
    }
  }
  
  reminders.sort((a, b) => getDaysBetween(today, a.dueDate) - getDaysBetween(today, b.dueDate));
  return reminders;
}

export function isDateInFuture(date: string): boolean {
  return getDaysBetween(getToday(), date) > 0;
}

export function isDateToday(date: string): boolean {
  return formatDate(date) === getToday();
}
