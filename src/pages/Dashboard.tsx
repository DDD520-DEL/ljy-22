import { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Syringe,
  Stethoscope,
  Bell,
  FileText,
  Printer,
  Calendar,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  Shield,
  AlertOctagon,
  Thermometer,
  Pill,
  Moon,
  Check,
  SkipForward,
  Wallet,
} from 'lucide-react';
import { useAppStore } from '@/store';
import {
  formatDate,
  calculateMonthAge,
  formatMonthAge,
  getDaysBetween,
  getHoursBetween,
  getToday,
} from '@/utils/dateUtils';
import { GrowthSummaryCard } from '@/components/GrowthSummaryCard';
import { TemperatureCard } from '@/components/TemperatureCard';

const quickLinks = [
  { path: '/vaccine-schedule', icon: Syringe, label: '疫苗接种', color: 'from-mint-400 to-mint-500', emoji: '💉' },
  { path: '/vaccine-certificate', icon: Shield, label: '电子接种证', color: 'from-emerald-400 to-emerald-500', emoji: '📘' },
  { path: '/checkup-schedule', icon: Stethoscope, label: '儿保体检', color: 'from-coral-400 to-coral-500', emoji: '🏥' },
  { path: '/medication', icon: Pill, label: '用药提醒', color: 'from-purple-400 to-purple-500', emoji: '💊' },
  { path: '/temperature', icon: Thermometer, label: '体温记录', color: 'from-rose-400 to-rose-500', emoji: '🌡️' },
  { path: '/sleep', icon: Moon, label: '睡眠记录', color: 'from-indigo-400 to-purple-500', emoji: '🌙' },
  { path: '/reaction-diary', icon: Activity, label: '反应日记', color: 'from-teal-400 to-teal-500', emoji: '📝' },
  { path: '/expense', icon: Wallet, label: '费用记账', color: 'from-amber-400 to-orange-500', emoji: '💰' },
  { path: '/reminders', icon: Bell, label: '提醒中心', color: 'from-amber-400 to-amber-500', emoji: '🔔' },
  { path: '/records', icon: FileText, label: '记录管理', color: 'from-blue-400 to-blue-500', emoji: '📋' },
  { path: '/export', icon: Printer, label: '导出打印', color: 'from-indigo-400 to-indigo-500', emoji: '🖨️' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    children,
    currentChildId,
    vaccineSchedules,
    checkupSchedules,
    reminders,
    vaccineRecords,
    checkupRecords,
    reactionDiaries,
    abnormalItems,
    temperatureRecords,
    medicationReminders,
    sleepRecords,
    expenseRecords,
    refreshReminders,
    refreshMedicationDoseStatus,
    updateMedicationDoseStatus,
  } = useAppStore();

  const child = children.find((c) => c.id === currentChildId) || null;
  const currentVaccineSchedules = vaccineSchedules.filter((s) => s.childId === currentChildId);
  const currentCheckupSchedules = checkupSchedules.filter((s) => s.childId === currentChildId);
  const currentVaccineRecords = vaccineRecords.filter((r) => r.childId === currentChildId);
  const currentCheckupRecords = checkupRecords.filter((r) => r.childId === currentChildId);
  const currentReminders = reminders.filter((r) => r.childId === currentChildId);
  const currentReactionDiaries = reactionDiaries.filter((d) => d.childId === currentChildId);
  const currentAbnormalItems = abnormalItems.filter((a) => a.childId === currentChildId && a.status === '待复查');
  const currentTemperatureRecords = temperatureRecords.filter((r) => r.childId === currentChildId);
  const currentMedicationReminders = medicationReminders.filter(
    (m) => m.childId === currentChildId && m.status === '进行中'
  );
  const currentSleepRecords = sleepRecords.filter((r) => r.childId === currentChildId);
  const currentExpenseRecords = expenseRecords.filter((r) => r.childId === currentChildId);
  const activeDiaries = currentReactionDiaries.filter((d) => d.status === '观察中');

  const currentMonthExpense = useMemo(() => {
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    return currentExpenseRecords
      .filter((r) => r.expenseDate.startsWith(currentMonth))
      .reduce((sum, r) => sum + r.amount, 0);
  }, [currentExpenseRecords]);

  const sleepWarning = useMemo(() => {
    if (!child || currentSleepRecords.length < 3) return null;
    const monthAge = calculateMonthAge(child.birthDate);
    const ageRef = [
      { maxMonth: 3, reference: 10 },
      { maxMonth: 11, reference: 10 },
      { maxMonth: 24, reference: 11 },
      { maxMonth: 60, reference: 10 },
      { maxMonth: 999, reference: 9 },
    ];
    const ref = (ageRef.find((r) => monthAge <= r.maxMonth) || ageRef[ageRef.length - 1]).reference;

    const sorted = [...currentSleepRecords].sort((a, b) => a.date.localeCompare(b.date));
    let consecutiveCount = 0;
    let startDate = '';
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (sorted[i].duration < ref) {
        consecutiveCount++;
        startDate = sorted[i].date;
      } else {
        break;
      }
    }
    if (consecutiveCount >= 3) {
      return { consecutiveCount, ref, startDate };
    }
    return null;
  }, [child, currentSleepRecords]);

  useEffect(() => {
    if (!child) {
      navigate('/child-info');
      return;
    }
    refreshReminders();
    refreshMedicationDoseStatus();
  }, [child, navigate, refreshReminders, refreshMedicationDoseStatus]);

  if (!child) return null;

  const today = getToday();

  const todayMedicationDoses = currentMedicationReminders.flatMap((reminder) =>
    reminder.doses
      .filter((d) => d.date === today && (d.status === '待服用' || d.status === '已过期'))
      .map((dose) => ({
        ...dose,
        reminderId: reminder.id,
        medicationName: reminder.medicationName,
        dosage: reminder.dosage,
        unit: reminder.unit,
        medicationType: reminder.medicationType,
      }))
  ).sort((a, b) => a.time.localeCompare(b.time));
  const monthAge = calculateMonthAge(child.birthDate);

  const totalVaccines = currentVaccineSchedules.length;
  const completedVaccines = currentVaccineSchedules.filter((v) => v.status === '已接种').length;
  const vaccineProgress = totalVaccines > 0 ? Math.round((completedVaccines / totalVaccines) * 100) : 0;

  const totalCheckups = currentCheckupSchedules.length;
  const completedCheckups = currentCheckupSchedules.filter((c) => c.status === '已体检').length;
  const checkupProgress = totalCheckups > 0 ? Math.round((completedCheckups / totalCheckups) * 100) : 0;

  const upcomingReminders = currentReminders.filter((r) => r.status !== '已完成').slice(0, 4);

  const getStatusStyle = (days: number) => {
    if (days < 0) return { bg: 'bg-red-100', text: 'text-red-600', icon: AlertCircle, label: '已过期' };
    if (days === 0) return { bg: 'bg-coral-100', text: 'text-coral-600', icon: Bell, label: '今天' };
    if (days <= 3) return { bg: 'bg-amber-100', text: 'text-amber-600', icon: Clock, label: `${days}天后` };
    return { bg: 'bg-mint-100', text: 'text-mint-600', icon: CheckCircle, label: `${days}天后` };
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="card overflow-hidden p-0">
        <div className="bg-gradient-to-r from-mint-400 via-mint-300 to-coral-300 p-8 text-white relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/10 rounded-full translate-y-24"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-3xl bg-white/30 backdrop-blur flex items-center justify-center text-5xl shadow-xl animate-float">
                {child.gender === '男' ? '👦' : '👧'}
              </div>
              <div>
                <h1 className="text-4xl font-display mb-1">你好，{child.name}！</h1>
                <p className="text-white/90 text-lg">
                  当前 <span className="font-bold">{formatMonthAge(monthAge)}</span> · 健康成长每一天 🌱
                </p>
                <p className="text-white/70 text-sm mt-1">
                  出生于 {formatDate(child.birthDate, 'YYYY年MM月DD日')}
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold">{vaccineProgress}%</div>
                <p className="text-white/80 text-sm mt-1">疫苗进度</p>
              </div>
              <div className="w-px bg-white/30"></div>
              <div className="text-center">
                <div className="text-4xl font-bold">{checkupProgress}%</div>
                <p className="text-white/80 text-sm mt-1">体检进度</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {currentAbnormalItems.length > 0 && (
        <div className="card border-2 border-red-200 bg-gradient-to-br from-red-50 to-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-red-700 flex items-center gap-2">
              <AlertOctagon className="w-6 h-6 text-red-500" />
              体检异常项
              <span className="ml-2 text-2xl font-bold text-red-600">{currentAbnormalItems.length}</span>
              <span className="text-sm font-normal text-red-400">项待复查</span>
            </h3>
            <Link to="/reminders" className="text-red-500 text-sm font-medium flex items-center hover:text-red-600">
              查看详情 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentAbnormalItems.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-white border border-red-100 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => navigate('/checkup-schedule')}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-200 to-red-400 flex items-center justify-center flex-shrink-0 animate-pulse-soft">
                  <AlertOctagon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-700 text-sm truncate">{item.itemName}</p>
                  <p className="text-xs text-slate-400 truncate">{item.abnormalDetail}</p>
                  <p className="text-xs text-red-400 mt-0.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    复查：{formatDate(item.recheckRemindDate, 'MM/DD')}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {currentAbnormalItems.length > 4 && (
            <p className="text-xs text-red-400 mt-3 text-center">
              还有 {currentAbnormalItems.length - 4} 项异常，请前往提醒中心查看
            </p>
          )}
        </div>
      )}

      {sleepWarning && (
        <div className="card border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-indigo-700 flex items-center gap-2">
              <Moon className="w-6 h-6 text-indigo-500" />
              睡眠不足提醒
              <span className="ml-2 text-2xl font-bold text-indigo-600">{sleepWarning.consecutiveCount}</span>
              <span className="text-sm font-normal text-indigo-400">天连续不足</span>
            </h3>
            <Link to="/sleep" className="text-indigo-500 text-sm font-medium flex items-center hover:text-indigo-600">
              查看详情 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-indigo-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-200 to-purple-300 flex items-center justify-center flex-shrink-0 animate-pulse-soft">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-slate-700">
                  宝宝已连续 <span className="text-indigo-600 font-bold">{sleepWarning.consecutiveCount}</span> 天夜间睡眠不足 <span className="text-indigo-600 font-bold">{sleepWarning.ref}小时</span>
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  睡眠不足可能影响宝宝的生长发育和免疫力，建议关注作息规律、优化睡眠环境，如有疑虑请咨询医生。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {todayMedicationDoses.length > 0 && (
        <div className="card border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-purple-700 flex items-center gap-2">
              <Pill className="w-6 h-6 text-purple-500" />
              今日用药提醒
              <span className="ml-2 text-2xl font-bold text-purple-600">{todayMedicationDoses.length}</span>
              <span className="text-sm font-normal text-purple-400">次待服用</span>
            </h3>
            <Link to="/medication" className="text-purple-500 text-sm font-medium flex items-center hover:text-purple-600">
              管理用药 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {todayMedicationDoses.map((dose) => {
              const isOverdue = dose.status === '已过期';
              return (
                <div
                  key={dose.id}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    isOverdue
                      ? 'bg-red-50 border-red-200'
                      : 'bg-white border-purple-100 hover:shadow-sm animate-pulse-soft'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isOverdue ? 'bg-red-100' : 'bg-purple-100'
                    }`}>
                      <Clock className={`w-5 h-5 ${isOverdue ? 'text-red-500' : 'text-purple-500'}`} />
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      isOverdue
                        ? 'bg-red-100 text-red-600'
                        : 'bg-purple-100 text-purple-600'
                    }`}>
                      {isOverdue ? '已错过' : '待服用'}
                    </span>
                  </div>
                  <p className={`text-xl font-bold mb-1 ${isOverdue ? 'text-red-700' : 'text-slate-800'}`}>
                    {dose.time}
                  </p>
                  <p className="font-medium text-slate-700 text-sm mb-1 truncate">
                    {dose.medicationName}
                  </p>
                  <p className="text-xs text-slate-500 mb-3">
                    {dose.dosage} {dose.unit} · {dose.medicationType}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateMedicationDoseStatus(dose.reminderId, dose.id, '已服用')}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                        isOverdue
                          ? 'bg-coral-500 hover:bg-coral-600 text-white'
                          : 'bg-mint-500 hover:bg-mint-600 text-white'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      {isOverdue ? '已补服' : '已服药'}
                    </button>
                    {!isOverdue && (
                      <button
                        onClick={() => updateMedicationDoseStatus(dose.reminderId, dose.id, '已跳过')}
                        className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs transition-colors"
                        title="跳过"
                      >
                        <SkipForward className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {todayMedicationDoses.length > 4 && (
            <p className="text-xs text-purple-400 mt-3 text-center">
              还有 {todayMedicationDoses.length - 4} 次用药，请前往用药提醒页面查看
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card card-hover">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
              <span className="text-2xl">💉</span>
              疫苗接种进度
            </h3>
            <Link to="/vaccine-schedule" className="text-mint-500 text-sm font-medium flex items-center hover:text-mint-600">
              查看详情 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="relative pt-2">
            <div className="h-4 bg-mint-50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-mint-400 to-mint-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${vaccineProgress}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-3 text-sm">
              <span className="text-slate-500">
                已完成 <span className="font-bold text-mint-600">{completedVaccines}</span> 剂
              </span>
              <span className="text-slate-500">
                共 <span className="font-bold text-slate-700">{totalVaccines}</span> 剂
              </span>
            </div>
          </div>
        </div>

        <div className="card card-hover">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
              <span className="text-2xl">🏥</span>
              儿保体检进度
            </h3>
            <Link to="/checkup-schedule" className="text-coral-500 text-sm font-medium flex items-center hover:text-coral-600">
              查看详情 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="relative pt-2">
            <div className="h-4 bg-coral-50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-coral-400 to-coral-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${checkupProgress}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-3 text-sm">
              <span className="text-slate-500">
                已完成 <span className="font-bold text-coral-600">{completedCheckups}</span> 次
              </span>
              <span className="text-slate-500">
                共 <span className="font-bold text-slate-700">{totalCheckups}</span> 次
              </span>
            </div>
          </div>
        </div>

        <TemperatureCard records={currentTemperatureRecords} />

        <div className="card card-hover bg-gradient-to-br from-amber-50 to-yellow-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
              <span className="text-2xl">💰</span>
              本月育儿支出
            </h3>
            <Link to="/expense" className="text-amber-500 text-sm font-medium flex items-center hover:text-amber-600">
              记账 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-400 flex items-center justify-center shadow-soft">
              <Wallet className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-700">
                ¥{currentMonthExpense.toFixed(2)}
              </p>
              <p className="text-xs text-amber-600 mt-1">
                已记录 {currentExpenseRecords.filter((r) => {
                  const today = new Date();
                  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
                  return r.expenseDate.startsWith(currentMonth);
                }).length} 笔支出
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
            <span className="text-2xl">📈</span>
            成长发育概览
          </h3>
          <Link to="/records" className="text-coral-500 text-sm font-medium flex items-center hover:text-coral-600">
            查看成长曲线 <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GrowthSummaryCard
            child={child}
            checkupRecords={currentCheckupRecords}
            metric="weight"
            label="体重"
            icon="⚖️"
            color="bg-gradient-to-br from-blue-100 to-blue-200"
          />
          <GrowthSummaryCard
            child={child}
            checkupRecords={currentCheckupRecords}
            metric="height"
            label="身高"
            icon="📏"
            color="bg-gradient-to-br from-mint-100 to-mint-200"
          />
          <GrowthSummaryCard
            child={child}
            checkupRecords={currentCheckupRecords}
            metric="headCircumference"
            label="头围"
            icon="🧠"
            color="bg-gradient-to-br from-purple-100 to-purple-200"
          />
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
            <Bell className="w-6 h-6 text-amber-500" />
            近期提醒
          </h3>
          <Link to="/reminders" className="text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center">
            全部提醒 <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {upcomingReminders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-slate-500">近期没有需要提醒的事项</p>
            <p className="text-slate-400 text-sm mt-1">系统将在到期前3天自动提醒您</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingReminders.map((reminder) => {
              const daysToDue = getDaysBetween(today, reminder.dueDate);
              const style = getStatusStyle(daysToDue);
              const StatusIcon = style.icon;
              return (
                <div
                  key={reminder.id}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-soft transition-all duration-300 group cursor-pointer"
                  onClick={() =>
                    navigate(reminder.type === 'vaccine' ? '/vaccine-schedule' : '/checkup-schedule')
                  }
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${style.bg} flex items-center justify-center flex-shrink-0 ${
                      daysToDue <= 1 ? 'animate-pulse-soft' : ''
                    }`}
                  >
                    <StatusIcon className={`w-6 h-6 ${style.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">{reminder.title}</p>
                    <p className="text-sm text-slate-500 flex items-center gap-2 mt-0.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(reminder.dueDate, 'YYYY年MM月DD日')}
                      <span className="text-slate-300">·</span>
                      <span className={reminder.type === 'vaccine' ? 'text-mint-600' : 'text-coral-600'}>
                        {reminder.type === 'vaccine' ? '疫苗接种' : '儿保体检'}
                      </span>
                    </p>
                  </div>
                  <div className={`status-badge ${style.bg} ${style.text}`}>
                    {style.label}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {activeDiaries.length > 0 && (
        <div className="card bg-gradient-to-br from-coral-50 to-mint-50 border-coral-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
              <span className="text-2xl">📝</span>
              反应观察中
            </h3>
            <Link to="/reaction-diary" className="text-coral-500 text-sm font-medium flex items-center hover:text-coral-600">
              全部日记 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {activeDiaries.map((diary) => {
              const progress = Math.min(Math.max((getHoursBetween(diary.startTime, new Date().toISOString()) / 72) * 100, 0), 100);
              const remaining = Math.max(0, Math.ceil(72 - getHoursBetween(diary.startTime, new Date().toISOString())));
              return (
                <div
                  key={diary.id}
                  className="p-4 rounded-2xl bg-white/70 hover:bg-white cursor-pointer transition-all hover:shadow-sm"
                  onClick={() => navigate(`/reaction-diary/${diary.id}`)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-coral-500" />
                      <span className="font-medium text-slate-700">{diary.vaccineName}</span>
                      <span className="text-xs text-slate-400">第{diary.doseNumber}剂</span>
                    </div>
                    <span className="text-xs text-coral-600 font-medium animate-pulse-soft">
                      观察中
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-mint-400 to-coral-400 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>已记录 {diary.logs.length} 条</span>
                    <span className="text-coral-600 font-medium">还剩 {remaining}h</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold text-lg text-slate-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">🚀</span>
          快捷入口
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className="card card-hover text-center group"
              >
                <div
                  className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${link.color} flex items-center justify-center mb-3 shadow-soft group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <p className="font-medium text-slate-700 text-sm">{link.label}</p>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-lg text-slate-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">📝</span>
            最近记录
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {[...currentVaccineRecords, ...currentCheckupRecords]
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5)
              .map((record) => (
                <div
                  key={record.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-mint-50/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-mint-100 flex items-center justify-center text-xl">
                    {'vaccinationDate' in record ? '💉' : '🏥'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-700 text-sm truncate">
                      {'vaccineName' in record ? record.vaccineName : `${formatMonthAge(record.monthAge)}体检`}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatDate(
                        'vaccinationDate' in record ? record.vaccinationDate : record.checkupDate,
                        'YYYY年MM月DD日'
                      )}
                    </p>
                  </div>
                </div>
              ))}
            {currentVaccineRecords.length === 0 && currentCheckupRecords.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">
                还没有记录，完成接种后记得添加哦~
              </div>
            )}
          </div>
        </div>

        <div className="card bg-gradient-to-br from-mint-50 to-coral-50 border-mint-100">
          <h3 className="font-semibold text-lg text-slate-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            温馨提示
          </h3>
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/70">
              <span className="text-xl">⏰</span>
              <p>系统会在每个接种和体检节点前 <span className="font-bold text-coral-500">3天</span> 自动提醒您</p>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/70">
              <span className="text-xl">💉</span>
              <p>接种后请及时记录 <span className="font-bold text-mint-500">疫苗批号、厂家和反应</span>，便于后续查询</p>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/70">
              <span className="text-xl">📋</span>
              <p>入托/入学前可在 <span className="font-bold text-purple-500">导出打印</span> 页面一键生成格式化表格</p>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/70">
              <span className="text-xl">🔒</span>
              <p>所有数据保存在 <span className="font-bold text-blue-500">本地浏览器</span>，请定期导出备份</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
