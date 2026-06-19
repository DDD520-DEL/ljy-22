import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  BellRing,
  CheckCircle,
  Syringe,
  Stethoscope,
  Calendar,
  Settings,
  ChevronRight,
  Check,
  Clock,
  AlertCircle,
  Baby,
  AlertOctagon,
  ShieldCheck,
  Archive,
  BookOpen,
  Lightbulb,
  AlertTriangle,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { Reminder, AbnormalItem, VaccineSchedule } from '@/types';
import {
  formatDate,
  getDaysBetween,
  getToday,
} from '@/utils/dateUtils';
import { VACCINE_DEFINITIONS } from '@/data/vaccines';
import VaccineKnowledgeCard from '@/components/VaccineKnowledgeCard';

type FilterType = 'all' | 'pending' | 'notified' | 'completed';
type BabyFilterType = 'all' | 'current';

export default function RemindersPage() {
  const navigate = useNavigate();
  const {
    children,
    currentChildId,
    reminders,
    abnormalItems,
    settings,
    vaccineSchedules,
    updateSettings,
    markReminderComplete,
    resolveAbnormalItem,
    refreshReminders,
    switchChild,
  } = useAppStore();

  const [filter, setFilter] = useState<FilterType>('all');
  const [babyFilter, setBabyFilter] = useState<BabyFilterType>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [tempDays, setTempDays] = useState(settings.reminderDaysBefore);
  const [notificationGranted, setNotificationGranted] = useState(false);
  const [knowledgeVaccineCode, setKnowledgeVaccineCode] = useState<string | null>(null);
  const [knowledgeDoseNumber, setKnowledgeDoseNumber] = useState<number | undefined>(undefined);
  const [knowledgePlannedDate, setKnowledgePlannedDate] = useState<string | undefined>(undefined);

  const currentChild = children.find((c) => c.id === currentChildId) || null;

  useEffect(() => {
    if (children.length === 0) navigate('/child-info');
    refreshReminders();

    if ('Notification' in window) {
      setNotificationGranted(Notification.permission === 'granted');
    }
  }, [children.length, navigate, refreshReminders]);

  if (children.length === 0) return null;

  const today = getToday();

  const getChildById = (childId: string) => {
    return children.find((c) => c.id === childId);
  };

  const getGenderEmoji = (gender: '男' | '女') => {
    return gender === '男' ? '👦' : '👧';
  };

  const filteredReminders = reminders.filter((r) => {
    if (babyFilter === 'current' && r.childId !== currentChildId) return false;
    if (filter === 'pending') return r.status === '待提醒';
    if (filter === 'notified') return r.status === '已提醒';
    if (filter === 'completed') return r.status === '已完成';
    return true;
  });

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      const result = await Notification.requestPermission();
      setNotificationGranted(result === 'granted');
      updateSettings({ notificationEnabled: result === 'granted' });
    }
  };

  const getReminderStyle = (reminder: Reminder) => {
    const daysToDue = getDaysBetween(today, reminder.dueDate);
    if (reminder.status === '已完成') {
      return {
        bg: 'bg-mint-50 border-mint-200',
        badge: 'bg-mint-100 text-mint-600',
        icon: CheckCircle,
        label: '已完成',
      };
    }
    if (daysToDue < 0) {
      return {
        bg: 'bg-red-50 border-red-200',
        badge: 'bg-red-100 text-red-600',
        icon: AlertCircle,
        label: '已过期',
      };
    }
    if (daysToDue === 0) {
      return {
        bg: 'bg-coral-50 border-coral-200',
        badge: 'bg-coral-100 text-coral-600 animate-pulse-soft',
        icon: BellRing,
        label: '今天到期',
      };
    }
    if (daysToDue <= 3) {
      return {
        bg: 'bg-amber-50 border-amber-200',
        badge: 'bg-amber-100 text-amber-600 animate-pulse-soft',
        icon: Bell,
        label: `${daysToDue}天后`,
      };
    }
    return {
      bg: 'bg-white border-slate-200',
      badge: 'bg-slate-100 text-slate-500',
      icon: Clock,
      label: `${daysToDue}天后`,
    };
  };

  const displayReminders = babyFilter === 'all' ? reminders : reminders.filter((r) => r.childId === currentChildId);

  const displayAbnormalItems = babyFilter === 'all'
    ? abnormalItems.filter((a) => a.status !== '已归档')
    : abnormalItems.filter((a) => a.childId === currentChildId && a.status !== '已归档');

  const stats = {
    total: displayReminders.length,
    pending: displayReminders.filter((r) => r.status === '待提醒').length,
    notified: displayReminders.filter((r) => r.status === '已提醒').length,
    completed: displayReminders.filter((r) => r.status === '已完成').length,
  };

  const handleReminderClick = (reminder: Reminder) => {
    if (reminder.childId !== currentChildId) {
      switchChild(reminder.childId);
    }
    if (reminder.type === 'abnormal') {
      navigate('/checkup-schedule');
    } else {
      navigate(reminder.type === 'vaccine' ? '/vaccine-schedule' : '/checkup-schedule');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display text-slate-800 flex items-center gap-3">
            <span className="text-4xl">🔔</span>
            提醒中心
          </h1>
          <p className="text-slate-500 mt-1">
            系统自动在到期前 {settings.reminderDaysBefore} 天提醒您
            {babyFilter === 'all' ? (
              <span>，共 {reminders.length} 条提醒（{children.length} 个宝宝）</span>
            ) : (
              <span>，当前宝宝共 {displayReminders.length} 条提醒</span>
            )}
          </p>
        </div>

        <button
          onClick={() => {
            setTempDays(settings.reminderDaysBefore);
            setShowSettings(true);
          }}
          className="btn-outline flex items-center justify-center gap-2"
        >
          <Settings className="w-4 h-4" />
          提醒设置
        </button>
      </div>

      {children.length > 1 && (
        <div className="flex bg-white rounded-xl p-1 shadow-soft border border-slate-100 w-fit">
          {[
            { key: 'all' as BabyFilterType, label: '全部宝宝', count: reminders.length, icon: Baby },
            { key: 'current' as BabyFilterType, label: currentChild?.name || '当前宝宝', count: displayReminders.length },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <button
                key={f.key}
                onClick={() => setBabyFilter(f.key)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  babyFilter === f.key
                    ? 'bg-gradient-to-r from-mint-400 to-coral-400 text-white'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {f.label}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    babyFilter === f.key ? 'bg-white/20' : 'bg-slate-100'
                  }`}
                >
                  {f.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {!notificationGranted && (
        <div className="card border-2 border-amber-200 bg-amber-50/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <BellRing className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">开启浏览器通知</h3>
                <p className="text-sm text-slate-600 mt-1">
                  开启浏览器通知权限后，系统会在到期前主动向您推送桌面提醒，不错过每一次接种和体检。
                </p>
              </div>
            </div>
            <button onClick={requestNotificationPermission} className="btn-secondary">
              开启通知
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card card-hover text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-100 flex items-center justify-center mb-3">
            <Bell className="w-7 h-7 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
          <p className="text-sm text-slate-500">提醒总数</p>
        </div>
        <div className="card card-hover text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
            <Clock className="w-7 h-7 text-slate-500" />
          </div>
          <p className="text-3xl font-bold text-slate-800">{stats.pending}</p>
          <p className="text-sm text-slate-500">待提醒</p>
        </div>
        <div className="card card-hover text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 flex items-center justify-center mb-3">
            <BellRing className="w-7 h-7 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-slate-800">{stats.notified}</p>
          <p className="text-sm text-slate-500">已提醒</p>
        </div>
        <div className="card card-hover text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-mint-100 flex items-center justify-center mb-3">
            <CheckCircle className="w-7 h-7 text-mint-500" />
          </div>
          <p className="text-3xl font-bold text-slate-800">{stats.completed}</p>
          <p className="text-sm text-slate-500">已完成</p>
        </div>
      </div>

      {displayAbnormalItems.length > 0 && (
        <div className="card border-2 border-red-200 bg-gradient-to-br from-red-50 to-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-red-700 flex items-center gap-2">
              <AlertOctagon className="w-6 h-6 text-red-500" />
              体检异常项追踪
              <span className="ml-1 text-sm font-normal text-red-400">
                ({displayAbnormalItems.filter((a) => a.status === '待复查').length} 项待复查)
              </span>
            </h3>
          </div>
          <div className="space-y-3">
            {displayAbnormalItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                  item.status === '待复查'
                    ? 'bg-white border-red-200 hover:shadow-soft'
                    : 'bg-mint-50 border-mint-200'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    item.status === '待复查'
                      ? 'bg-gradient-to-br from-red-200 to-red-400 animate-pulse-soft'
                      : 'bg-gradient-to-br from-mint-200 to-mint-400'
                  }`}
                >
                  {item.status === '待复查' ? (
                    <AlertOctagon className="w-6 h-6 text-white" />
                  ) : (
                    <ShieldCheck className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-800">{item.itemName}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      item.status === '待复查' ? 'bg-red-100 text-red-600' : 'bg-mint-100 text-mint-600'
                    }`}>
                      {item.status}
                    </span>
                    {babyFilter === 'all' && (() => {
                      const c = children.find((ch) => ch.id === item.childId);
                      return c ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">
                          {c.gender === '男' ? '👦' : '👧'} {c.name}
                        </span>
                      ) : null;
                    })()}
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{item.abnormalDetail}</p>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    建议复查日期：{formatDate(item.recheckRemindDate, 'YYYY年MM月DD日')}
                  </p>
                </div>
                {item.status === '待复查' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      resolveAbnormalItem(item.id);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-mint-100 hover:bg-mint-200 text-mint-700 font-medium text-sm transition-colors flex-shrink-0"
                    title="标记为已复查正常"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    已复查正常
                  </button>
                )}
                {item.status === '已复查正常' && (
                  <div className="flex items-center gap-1 text-mint-500 text-xs font-medium flex-shrink-0">
                    <Archive className="w-3.5 h-3.5" />
                    自动归档中…
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex bg-white rounded-xl p-1 shadow-soft border border-slate-100 w-fit">
        {[
          { key: 'all' as FilterType, label: '全部', count: stats.total },
          { key: 'pending' as FilterType, label: '待提醒', count: stats.pending },
          { key: 'notified' as FilterType, label: '已提醒', count: stats.notified },
          { key: 'completed' as FilterType, label: '已完成', count: stats.completed },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              filter === f.key
                ? 'bg-gradient-to-r from-mint-400 to-mint-500 text-white'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {f.label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                filter === f.key ? 'bg-white/20' : 'bg-slate-100'
              }`}
            >
              {f.count}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredReminders.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-slate-500">当前没有提醒事项</p>
            <p className="text-slate-400 text-sm mt-1">
              {filter !== 'all' ? '切换筛选条件查看更多' : '系统会在到期前自动生成提醒'}
            </p>
          </div>
        ) : (
          filteredReminders.map((reminder, index) => {
            const style = getReminderStyle(reminder);
            const StatusIcon = style.icon;
            const daysToDue = getDaysBetween(today, reminder.dueDate);
            const child = getChildById(reminder.childId);

            const vaccineSchedule = reminder.type === 'vaccine'
              ? vaccineSchedules.find((s: VaccineSchedule) => s.id === reminder.relatedId)
              : null;
            const vaccineDefinition = vaccineSchedule
              ? VACCINE_DEFINITIONS.find((v) => v.code === vaccineSchedule.vaccineCode)
              : null;
            const vaccineKnowledge = vaccineDefinition?.knowledge;

            return (
              <div
                key={reminder.id}
                className={`card card-hover border-2 ${style.bg} animate-slide-in cursor-pointer`}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => handleReminderClick(reminder)}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 ${
                      reminder.type === 'vaccine'
                        ? 'bg-gradient-to-br from-mint-200 to-mint-400'
                        : reminder.type === 'abnormal'
                        ? 'bg-gradient-to-br from-red-200 to-red-400'
                        : 'bg-gradient-to-br from-coral-200 to-coral-400'
                    } ${daysToDue <= 1 && reminder.status !== '已完成' ? 'animate-pulse-soft' : ''}`}
                  >
                    {reminder.type === 'vaccine' ? (
                      <Syringe className="w-7 h-7 text-white" />
                    ) : reminder.type === 'abnormal' ? (
                      <AlertOctagon className="w-7 h-7 text-white" />
                    ) : (
                      <Stethoscope className="w-7 h-7 text-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-lg text-slate-800 truncate">{reminder.title}</h3>
                          {reminder.type === 'vaccine' && vaccineDefinition && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setKnowledgeVaccineCode(vaccineDefinition.code);
                                setKnowledgeDoseNumber(vaccineSchedule?.doseNumber);
                                setKnowledgePlannedDate(
                                  vaccineSchedule
                                    ? formatDate(vaccineSchedule.plannedDate, 'YYYY年MM月DD日')
                                    : undefined
                                );
                              }}
                              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-mint-100 hover:bg-mint-200 text-mint-600 text-xs font-medium transition-colors flex-shrink-0"
                              title="查看疫苗科普知识"
                            >
                              <BookOpen className="w-3 h-3" />
                              疫苗知识
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          到期日：{formatDate(reminder.dueDate, 'YYYY年MM月DD日')}
                          {reminder.status !== '已完成' && (
                            <span className="text-slate-300">·</span>
                          )}
                          {reminder.status !== '已完成' && daysToDue > 0 && (
                            <span className="text-slate-600">距离现在还有 {daysToDue} 天</span>
                          )}
                          {reminder.status !== '已完成' && daysToDue === 0 && (
                            <span className="text-coral-600 font-medium">就是今天！</span>
                          )}
                          {reminder.status !== '已完成' && daysToDue < 0 && (
                            <span className="text-red-500 font-medium">已过期 {Math.abs(daysToDue)} 天</span>
                          )}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-slate-400">
                            {reminder.type === 'vaccine' ? '💉 疫苗接种' : reminder.type === 'abnormal' ? '⚠️ 异常复查' : '🏥 儿保体检'}
                            {reminder.status === '待提醒' && (
                              <> · {reminder.daysBefore}天前开始提醒</>
                            )}
                          </p>
                          {babyFilter === 'all' && child && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">
                              {getGenderEmoji(child.gender)} {child.name}
                            </span>
                          )}
                        </div>

                        {reminder.type === 'vaccine' && vaccineKnowledge && reminder.status !== '已完成' && (
                          <div className="mt-3 space-y-2">
                            {vaccineDefinition && (
                              <div className="flex items-start gap-1.5 p-2.5 rounded-xl bg-gradient-to-r from-blue-50/70 to-mint-50/70 border border-blue-100/60">
                                <ShieldCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-slate-600 leading-relaxed">
                                  <span className="font-semibold text-blue-700">预防：</span>
                                  {vaccineDefinition.preventDisease}
                                </p>
                              </div>
                            )}
                            {vaccineKnowledge.tips.length > 0 && (
                              <div className="flex items-start gap-1.5 p-2.5 rounded-xl bg-gradient-to-r from-amber-50/70 to-coral-50/70 border border-amber-100/60">
                                <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <div className="text-xs text-slate-600 leading-relaxed min-w-0">
                                  <span className="font-semibold text-amber-700">接种前注意：</span>
                                  <span className="line-clamp-2">
                                    {vaccineKnowledge.tips[0]}
                                  </span>
                                </div>
                              </div>
                            )}
                            {vaccineDefinition.contraindications.length > 0 && (
                              <div className="flex items-start gap-1.5 p-2.5 rounded-xl bg-gradient-to-r from-red-50/70 to-coral-50/50 border border-red-100/60">
                                <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                                <div className="text-xs text-slate-600 leading-relaxed min-w-0">
                                  <span className="font-semibold text-red-600">禁忌症：</span>
                                  <span className="line-clamp-2">
                                    {vaccineDefinition.contraindications.slice(0, 3).join('；')}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className={`status-badge ${style.badge}`}>
                          <StatusIcon className="w-3.5 h-3.5 mr-1" />
                          {style.label}
                        </span>

                        {reminder.status !== '已完成' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markReminderComplete(reminder.id);
                            }}
                            className="w-10 h-10 rounded-xl bg-mint-100 hover:bg-mint-200 text-mint-600 flex items-center justify-center transition-colors"
                            title="标记为已完成"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        )}

                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-soft-lg max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-mint-400 to-coral-400 p-6 text-white">
              <div className="flex items-center gap-3">
                <Settings className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-display">提醒设置</h2>
                  <p className="text-white/80 text-sm">自定义您的提醒偏好</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="label-field">提前提醒天数</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="7"
                    value={tempDays}
                    onChange={(e) => setTempDays(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-mint-400"
                  />
                  <div className="w-20 h-12 rounded-xl bg-gradient-to-br from-mint-100 to-coral-100 flex items-center justify-center font-bold text-xl text-slate-700">
                    {tempDays}天
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  系统会在到期日前 {tempDays} 天开始提醒您（推荐设置3天）
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <BellRing className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-blue-700">浏览器桌面通知</p>
                    <p className="text-blue-600 mt-1">
                      当前状态：
                      {notificationGranted ? (
                        <span className="font-bold text-mint-600">已开启 ✅</span>
                      ) : (
                        <span className="font-bold text-amber-600">未开启</span>
                      )}
                    </p>
                    {!notificationGranted && (
                      <button
                        onClick={requestNotificationPermission}
                        className="mt-2 text-blue-600 hover:text-blue-700 underline underline-offset-2"
                      >
                        点击开启通知权限
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 btn-outline"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    updateSettings({ reminderDaysBefore: tempDays });
                    setShowSettings(false);
                  }}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  保存设置
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {knowledgeVaccineCode && (
        <VaccineKnowledgeCard
          vaccineCode={knowledgeVaccineCode}
          doseNumber={knowledgeDoseNumber}
          plannedDate={knowledgePlannedDate}
          onClose={() => {
            setKnowledgeVaccineCode(null);
            setKnowledgeDoseNumber(undefined);
            setKnowledgePlannedDate(undefined);
          }}
        />
      )}
    </div>
  );
}
