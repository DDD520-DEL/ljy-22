import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  X,
  Check,
  Pill,
  Clock,
  Calendar,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  SkipForward,
  Edit3,
  ChevronRight,
  AlertTriangle,
  Baby,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { MedicationReminder, MedicationDose, MedicationDoseStatus } from '@/types';
import { formatDate, getToday, getDaysBetween } from '@/utils/dateUtils';

type FilterType = 'active' | 'completed' | 'cancelled' | 'all';
type BabyFilterType = 'all' | 'current';

const MEDICATION_TYPES = ['退烧药', '感冒药', '消炎药', '维生素', '益生菌', '止咳药', '止泻药', '过敏药', '其他'];
const DOSAGE_UNITS = ['ml', 'mg', '片', '袋', '粒', '滴', '勺', '包'];
const DEFAULT_TIMES: Record<number, string[]> = {
  1: ['08:00'],
  2: ['08:00', '20:00'],
  3: ['08:00', '14:00', '20:00'],
  4: ['08:00', '12:00', '16:00', '20:00'],
};

export default function MedicationRemindersPage() {
  const navigate = useNavigate();
  const {
    children,
    currentChildId,
    medicationReminders,
    addMedicationReminder,
    updateMedicationReminder,
    deleteMedicationReminder,
    updateMedicationDoseStatus,
    cancelMedicationReminder,
    refreshMedicationDoseStatus,
  } = useAppStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState<MedicationReminder | null>(null);
  const [filter, setFilter] = useState<FilterType>('active');
  const [babyFilter, setBabyFilter] = useState<BabyFilterType>('current');
  const [selectedReminder, setSelectedReminder] = useState<MedicationReminder | null>(null);

  const currentChild = children.find((c) => c.id === currentChildId) || null;

  useEffect(() => {
    if (children.length === 0) navigate('/child-info');
    refreshMedicationDoseStatus();
  }, [children.length, navigate, refreshMedicationDoseStatus]);

  if (children.length === 0) return null;

  const today = getToday();

  const getChildById = (childId: string) => children.find((c) => c.id === childId);
  const getGenderEmoji = (gender: '男' | '女') => (gender === '男' ? '👦' : '👧');

  const filteredReminders = medicationReminders.filter((r) => {
    if (babyFilter === 'current' && r.childId !== currentChildId) return false;
    if (filter === 'active') return r.status === '进行中';
    if (filter === 'completed') return r.status === '已完成';
    if (filter === 'cancelled') return r.status === '已取消';
    return true;
  });

  const displayReminders = babyFilter === 'all'
    ? medicationReminders
    : medicationReminders.filter((r) => r.childId === currentChildId);

  const stats = {
    active: displayReminders.filter((r) => r.status === '进行中').length,
    completed: displayReminders.filter((r) => r.status === '已完成').length,
    cancelled: displayReminders.filter((r) => r.status === '已取消').length,
    todayPending: displayReminders
      .filter((r) => r.status === '进行中')
      .reduce(
        (count, r) =>
          count +
          r.doses.filter(
            (d) => d.date === today && (d.status === '待服用' || d.status === '已过期')
          ).length,
        0
      ),
  };

  const handleSubmit = (data: FormData) => {
    if (editingReminder) {
      updateMedicationReminder(editingReminder.id, data);
    } else {
      addMedicationReminder(data);
    }
    setShowAddModal(false);
    setEditingReminder(null);
  };

  const handleEdit = (reminder: MedicationReminder) => {
    setEditingReminder(reminder);
    setShowAddModal(true);
  };

  const getDoseStyle = (dose: MedicationDose): { bg: string; text: string; border: string; iconBg: string } => {
    if (dose.status === '已服用') {
      return { bg: 'bg-mint-50', text: 'text-mint-600', border: 'border-mint-200', iconBg: 'bg-mint-100' };
    }
    if (dose.status === '已跳过') {
      return { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', iconBg: 'bg-slate-100' };
    }
    if (dose.status === '已过期') {
      return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', iconBg: 'bg-red-100' };
    }
    const isNow = dose.date === today;
    if (isNow) {
      return { bg: 'bg-coral-50', text: 'text-coral-600', border: 'border-coral-300', iconBg: 'bg-coral-100' };
    }
    return { bg: 'bg-white', text: 'text-slate-600', border: 'border-slate-200', iconBg: 'bg-slate-100' };
  };

  const groupDosesByDate = (doses: MedicationDose[]) => {
    const groups: Record<string, MedicationDose[]> = {};
    for (const dose of doses) {
      if (!groups[dose.date]) groups[dose.date] = [];
      groups[dose.date].push(dose);
    }
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display text-slate-800 flex items-center gap-3">
            <span className="text-4xl">💊</span>
            用药提醒
          </h1>
          <p className="text-slate-500 mt-1">
            添加短期用药任务，按时提醒宝宝服药
            {babyFilter === 'all' ? (
              <span>，共 {medicationReminders.length} 个提醒（{children.length} 个宝宝）</span>
            ) : (
              <span>，当前宝宝共 {displayReminders.length} 个提醒</span>
            )}
          </p>
        </div>

        <button
          onClick={() => {
            setEditingReminder(null);
            setShowAddModal(true);
          }}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          添加用药
        </button>
      </div>

      {children.length > 1 && (
        <div className="flex bg-white rounded-xl p-1 shadow-soft border border-slate-100 w-fit">
          {[
            { key: 'all' as BabyFilterType, label: '全部宝宝', count: medicationReminders.length, icon: Baby },
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

      {stats.todayPending > 0 && (
        <div className="card border-2 border-coral-200 bg-gradient-to-br from-coral-50 to-white animate-pulse-soft">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-coral-200 to-coral-400 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-slate-800">今日用药待办</h3>
              <p className="text-slate-600 mt-1">
                还有 <span className="font-bold text-coral-600 text-xl">{stats.todayPending}</span> 次服药需要完成
              </p>
            </div>
            <button
              onClick={() => setFilter('active')}
              className="btn-secondary flex items-center gap-2"
            >
              立即处理
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card card-hover text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-coral-100 flex items-center justify-center mb-3">
            <Pill className="w-7 h-7 text-coral-500" />
          </div>
          <p className="text-3xl font-bold text-slate-800">{stats.active}</p>
          <p className="text-sm text-slate-500">进行中</p>
        </div>
        <div className="card card-hover text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 flex items-center justify-center mb-3">
            <Clock className="w-7 h-7 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-slate-800">{stats.todayPending}</p>
          <p className="text-sm text-slate-500">今日待服</p>
        </div>
        <div className="card card-hover text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-mint-100 flex items-center justify-center mb-3">
            <CheckCircle className="w-7 h-7 text-mint-500" />
          </div>
          <p className="text-3xl font-bold text-slate-800">{stats.completed}</p>
          <p className="text-sm text-slate-500">已完成</p>
        </div>
        <div className="card card-hover text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
            <XCircle className="w-7 h-7 text-slate-500" />
          </div>
          <p className="text-3xl font-bold text-slate-800">{stats.cancelled}</p>
          <p className="text-sm text-slate-500">已取消</p>
        </div>
      </div>

      <div className="flex bg-white rounded-xl p-1 shadow-soft border border-slate-100 w-fit">
        {[
          { key: 'active' as FilterType, label: '进行中', count: stats.active },
          { key: 'completed' as FilterType, label: '已完成', count: stats.completed },
          { key: 'cancelled' as FilterType, label: '已取消', count: stats.cancelled },
          { key: 'all' as FilterType, label: '全部', count: filteredReminders.length === 0 ? displayReminders.length : filteredReminders.length },
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

      <div className="space-y-4">
        {filteredReminders.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">💊</div>
            <p className="text-slate-500">当前没有用药提醒</p>
            <p className="text-slate-400 text-sm mt-1">点击上方「添加用药」按钮创建新的用药计划</p>
          </div>
        ) : (
          filteredReminders.map((reminder) => {
            const child = getChildById(reminder.childId);
            const todayDoses = reminder.doses.filter((d) => d.date === today);
            const totalDoses = reminder.doses.length;
            const completedDoses = reminder.doses.filter(
              (d) => d.status === '已服用' || d.status === '已跳过' || d.status === '已过期'
            ).length;
            const progress = totalDoses > 0 ? Math.round((completedDoses / totalDoses) * 100) : 0;
            const todayCompleted = todayDoses.filter((d) => d.status === '已服用').length;

            const statusBadge =
              reminder.status === '进行中'
                ? { bg: 'bg-coral-100 text-coral-600', label: '进行中' }
                : reminder.status === '已完成'
                ? { bg: 'bg-mint-100 text-mint-600', label: '已完成' }
                : { bg: 'bg-slate-100 text-slate-500', label: '已取消' };

            return (
              <div
                key={reminder.id}
                className="card card-hover border-2 overflow-hidden"
              >
                <div className={`p-5 ${
                  reminder.status === '进行中'
                    ? 'bg-gradient-to-r from-coral-50/80 to-mint-50/50'
                    : reminder.status === '已完成'
                    ? 'bg-mint-50/50'
                    : 'bg-slate-50/50'
                }`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        reminder.status === '进行中'
                          ? 'bg-gradient-to-br from-coral-200 to-coral-400'
                          : reminder.status === '已完成'
                          ? 'bg-gradient-to-br from-mint-200 to-mint-400'
                          : 'bg-gradient-to-br from-slate-200 to-slate-400'
                      }`}>
                        <Pill className="w-7 h-7 text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-lg text-slate-800">{reminder.medicationName}</h3>
                          <span className={`status-badge text-xs ${statusBadge.bg}`}>
                            {statusBadge.label}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {reminder.medicationType}
                          </span>
                          {babyFilter === 'all' && child && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-600">
                              {getGenderEmoji(child.gender)} {child.name}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-600 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(reminder.startDate, 'MM月DD日')} ~ {formatDate(reminder.endDate, 'MM月DD日')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Pill className="w-4 h-4" />
                            {reminder.dosage} {reminder.unit} · 每日{reminder.timesPerDay}次
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {reminder.times.join('、')}
                          </span>
                        </div>

                        {reminder.notes && (
                          <p className="text-xs text-slate-500 mt-2 bg-white/60 rounded-lg px-3 py-2 inline-block">
                            📝 {reminder.notes}
                          </p>
                        )}

                        <div className="mt-4">
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                            <span>
                              总进度：{completedDoses}/{totalDoses} 次
                              {todayDoses.length > 0 && (
                                <span className="ml-2 text-coral-600">
                                  （今日 {todayCompleted}/{todayDoses.length}）
                                </span>
                              )}
                            </span>
                            <span className="font-medium text-slate-700">{progress}%</span>
                          </div>
                          <div className="h-2 bg-white rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                reminder.status === '已完成'
                                  ? 'bg-gradient-to-r from-mint-400 to-mint-500'
                                  : 'bg-gradient-to-r from-coral-400 to-mint-400'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {reminder.status === '进行中' && (
                        <>
                          <button
                            onClick={() => handleEdit(reminder)}
                            className="w-10 h-10 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-500 flex items-center justify-center transition-colors"
                            title="编辑"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('确定要取消这个用药提醒吗？')) {
                                cancelMedicationReminder(reminder.id);
                              }
                            }}
                            className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-colors"
                            title="取消计划"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => {
                          if (window.confirm('确定要删除这个用药提醒吗？此操作不可恢复。')) {
                            deleteMedicationReminder(reminder.id);
                          }
                        }}
                        className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSelectedReminder(reminder)}
                        className="w-10 h-10 rounded-xl bg-mint-50 hover:bg-mint-100 text-mint-500 flex items-center justify-center transition-colors"
                        title="查看详情"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {reminder.status === '进行中' && todayDoses.length > 0 && (
                  <div className="p-5 border-t border-slate-100 bg-white">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <span className="text-lg">📅</span>
                      今日服药 ({todayCompleted}/{todayDoses.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {todayDoses.map((dose) => {
                        const style = getDoseStyle(dose);
                        return (
                          <div
                            key={dose.id}
                            className={`p-4 rounded-2xl border-2 ${style.bg} ${style.border} transition-all ${
                              dose.status === '待服用' && dose.date === today ? 'animate-pulse-soft' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className={`w-10 h-10 rounded-xl ${style.iconBg} flex items-center justify-center`}>
                                <Clock className={`w-5 h-5 ${style.text}`} />
                              </div>
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${style.iconBg} ${style.text}`}>
                                {dose.status === '已服用' && '✓ 已服用'}
                                {dose.status === '已跳过' && '已跳过'}
                                {dose.status === '已过期' && '已错过'}
                                {dose.status === '待服用' && '待服用'}
                              </span>
                            </div>
                            <p className={`text-2xl font-bold ${style.text} mb-1`}>
                              {dose.time}
                            </p>
                            <p className="text-xs text-slate-500 mb-3">
                              {reminder.dosage} {reminder.unit}
                            </p>
                            {dose.status === '待服用' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => updateMedicationDoseStatus(reminder.id, dose.id, '已服用')}
                                  className="flex-1 py-2 rounded-xl bg-mint-500 hover:bg-mint-600 text-white text-xs font-medium transition-colors flex items-center justify-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  已服药
                                </button>
                                <button
                                  onClick={() => updateMedicationDoseStatus(reminder.id, dose.id, '已跳过')}
                                  className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition-colors"
                                  title="跳过"
                                >
                                  <SkipForward className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                            {dose.status === '已过期' && (
                              <button
                                onClick={() => updateMedicationDoseStatus(reminder.id, dose.id, '已服用')}
                                className="w-full py-2 rounded-xl bg-coral-100 hover:bg-coral-200 text-coral-700 text-xs font-medium transition-colors flex items-center justify-center gap-1"
                              >
                                <AlertCircle className="w-3.5 h-3.5" />
                                标记为已补服
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {showAddModal && (
        <AddMedicationModal
          onClose={() => {
            setShowAddModal(false);
            setEditingReminder(null);
          }}
          onSubmit={handleSubmit}
          editingReminder={editingReminder}
        />
      )}

      {selectedReminder && (
        <MedicationDetailModal
          reminder={selectedReminder}
          childName={getChildById(selectedReminder.childId)?.name || ''}
          childGender={getChildById(selectedReminder.childId)?.gender || '男'}
          onClose={() => setSelectedReminder(null)}
          onUpdateDose={(doseId, status) => {
            updateMedicationDoseStatus(selectedReminder.id, doseId, status);
          }}
          groupDosesByDate={groupDosesByDate}
          getDoseStyle={getDoseStyle}
          formatDate={formatDate}
        />
      )}
    </div>
  );
}

interface FormData {
  medicationName: string;
  medicationType: string;
  dosage: string;
  unit: string;
  startDate: string;
  endDate: string;
  timesPerDay: number;
  times: string[];
  notes?: string;
}

function AddMedicationModal({
  onClose,
  onSubmit,
  editingReminder,
}: {
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  editingReminder: MedicationReminder | null;
}) {
  const today = getToday();
  const [formData, setFormData] = useState<FormData>({
    medicationName: editingReminder?.medicationName || '',
    medicationType: editingReminder?.medicationType || MEDICATION_TYPES[0],
    dosage: editingReminder?.dosage || '',
    unit: editingReminder?.unit || DOSAGE_UNITS[0],
    startDate: editingReminder?.startDate || today,
    endDate: editingReminder?.endDate || today,
    timesPerDay: editingReminder?.timesPerDay || 3,
    times: editingReminder?.times || DEFAULT_TIMES[3],
    notes: editingReminder?.notes || '',
  });

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...formData.times];
    newTimes[index] = value;
    setFormData({ ...formData, times: newTimes });
  };

  const handleTimesPerDayChange = (num: number) => {
    const currentTimes = [...formData.times];
    const defaultTimes = DEFAULT_TIMES[num] || [];
    const newTimes: string[] = [];
    for (let i = 0; i < num; i++) {
      newTimes.push(currentTimes[i] || defaultTimes[i] || '08:00');
    }
    setFormData({ ...formData, timesPerDay: num, times: newTimes });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.medicationName.trim()) {
      alert('请填写药品名称');
      return;
    }
    if (!formData.dosage.trim()) {
      alert('请填写剂量');
      return;
    }
    if (getDaysBetween(formData.endDate, formData.startDate) > 0) {
      alert('结束日期不能早于开始日期');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-soft-lg max-w-2xl w-full overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-coral-400 to-mint-400 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Pill className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-display">
                  {editingReminder ? '编辑用药提醒' : '添加用药提醒'}
                </h2>
                <p className="text-white/80 text-sm">为宝宝设置短期用药计划</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label-field">
                <span className="text-red-400">*</span> 药品名称
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="如：布洛芬混悬液"
                value={formData.medicationName}
                onChange={(e) => setFormData({ ...formData, medicationName: e.target.value })}
                maxLength={50}
              />
            </div>

            <div>
              <label className="label-field">
                <span className="text-red-400">*</span> 药品类型
              </label>
              <select
                className="input-field"
                value={formData.medicationType}
                onChange={(e) => setFormData({ ...formData, medicationType: e.target.value })}
              >
                {MEDICATION_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label-field">
                <span className="text-red-400">*</span> 每次剂量
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  className="input-field"
                  placeholder="如：5"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  maxLength={20}
                />
                <select
                  className="input-field"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                >
                  {DOSAGE_UNITS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label-field">
                <span className="text-red-400">*</span> 每日次数
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleTimesPerDayChange(n)}
                    className={`py-3 rounded-xl border-2 font-semibold transition-all ${
                      formData.timesPerDay === n
                        ? 'border-coral-400 bg-coral-50 text-coral-600'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {n}次
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="label-field">
              <span className="text-red-400">*</span> 服药时间
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {formData.times.map((time, i) => (
                <div key={i} className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    第{i + 1}次
                  </span>
                  <input
                    type="time"
                    className="input-field pl-16"
                    value={time}
                    onChange={(e) => handleTimeChange(i, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label-field">
                <span className="text-red-400">*</span> 开始日期
              </label>
              <input
                type="date"
                className="input-field"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div>
              <label className="label-field">
                <span className="text-red-400">*</span> 结束日期
              </label>
              <input
                type="date"
                className="input-field"
                value={formData.endDate}
                min={formData.startDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
              <Calendar className="w-4 h-4" />
              用药周期预览
            </div>
            <p className="text-slate-700 font-medium">
              从 {formatDate(formData.startDate, 'YYYY年MM月DD日')} 到 {formatDate(formData.endDate, 'YYYY年MM月DD日')}
              ，共 {Math.max(0, getDaysBetween(formData.startDate, formData.endDate) + 1)} 天
              ，合计 {Math.max(0, (getDaysBetween(formData.startDate, formData.endDate) + 1) * formData.timesPerDay)} 次服药
            </p>
          </div>

          <div>
            <label className="label-field">备注说明（可选）</label>
            <textarea
              className="input-field min-h-[80px]"
              placeholder="如：饭后服用、多喝水、冷藏保存等"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              maxLength={200}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-outline"
            >
              取消
            </button>
            <button type="submit" className="flex-1 btn-primary flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" />
              {editingReminder ? '保存修改' : '创建用药计划'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MedicationDetailModal({
  reminder,
  childName,
  childGender,
  onClose,
  onUpdateDose,
  groupDosesByDate,
  getDoseStyle,
  formatDate,
}: {
  reminder: MedicationReminder;
  childName: string;
  childGender: '男' | '女';
  onClose: () => void;
  onUpdateDose: (doseId: string, status: MedicationDoseStatus) => void;
  groupDosesByDate: (doses: MedicationDose[]) => [string, MedicationDose[]][];
  getDoseStyle: (dose: MedicationDose) => { bg: string; text: string; border: string; iconBg: string };
  formatDate: (d: string, f?: 'YYYY-MM-DD' | 'YYYY年MM月DD日' | 'MM/DD' | 'MM月DD日') => string;
}) {
  const today = getToday();
  const groupedDoses = groupDosesByDate(reminder.doses);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-soft-lg max-w-3xl w-full overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-mint-400 to-coral-400 p-6 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Pill className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-display">{reminder.medicationName}</h2>
                <p className="text-white/80 text-sm">
                  {childGender === '男' ? '👦' : '👧'} {childName} · 用药详情
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 text-center">
              <p className="text-xs text-slate-500 mb-1">类型</p>
              <p className="font-semibold text-slate-800">{reminder.medicationType}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 text-center">
              <p className="text-xs text-slate-500 mb-1">剂量</p>
              <p className="font-semibold text-slate-800">{reminder.dosage} {reminder.unit}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 text-center">
              <p className="text-xs text-slate-500 mb-1">每日</p>
              <p className="font-semibold text-slate-800">{reminder.timesPerDay}次</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 text-center">
              <p className="text-xs text-slate-500 mb-1">状态</p>
              <p className={`font-semibold ${
                reminder.status === '进行中' ? 'text-coral-600' :
                reminder.status === '已完成' ? 'text-mint-600' : 'text-slate-500'
              }`}>{reminder.status}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
            <p className="text-sm text-blue-700">
              <span className="font-semibold">周期：</span>
              {formatDate(reminder.startDate, 'YYYY年MM月DD日')} ~ {formatDate(reminder.endDate, 'YYYY年MM月DD日')}
              &nbsp;&nbsp;|&nbsp;&nbsp;
              <span className="font-semibold">时间：</span>
              {reminder.times.join('、')}
            </p>
            {reminder.notes && (
              <p className="text-sm text-blue-600 mt-2">
                <span className="font-semibold">备注：</span>{reminder.notes}
              </p>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-lg text-slate-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-coral-500" />
              服药记录日历
            </h3>
            <div className="space-y-4">
              {groupedDoses.map(([date, doses]) => {
                const isToday = date === today;
                const completedCount = doses.filter(
                  (d) => d.status === '已服用' || d.status === '已跳过'
                ).length;
                const allDone = completedCount === doses.length;
                const dateDiff = getDaysBetween(today, date);

                return (
                  <div
                    key={date}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      isToday
                        ? 'border-coral-300 bg-coral-50/50'
                        : allDone
                        ? 'border-mint-200 bg-mint-50/30'
                        : dateDiff < 0
                        ? 'border-slate-200 bg-slate-50/30'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                          isToday
                            ? 'bg-coral-400 text-white animate-pulse-soft'
                            : allDone
                            ? 'bg-mint-400 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {isToday ? '今' : new Date(date).getDate()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {formatDate(date, 'MM月DD日')}
                            {dateDiff < 0 && <span className="text-xs text-slate-400 ml-2">（{Math.abs(dateDiff)}天前）</span>}
                            {dateDiff === 0 && <span className="text-xs text-coral-500 ml-2 font-medium">今天</span>}
                            {dateDiff > 0 && <span className="text-xs text-slate-400 ml-2">（{dateDiff}天后）</span>}
                          </p>
                          <p className="text-xs text-slate-500">
                            {completedCount}/{doses.length} 已完成
                            {allDone && <span className="text-mint-600 font-medium ml-2">✓ 全部完成</span>}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {doses.map((dose) => {
                        const style = getDoseStyle(dose);
                        return (
                          <div
                            key={dose.id}
                            className={`p-3 rounded-xl border ${style.border} ${style.bg}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-sm font-bold ${style.text}`}>{dose.time}</span>
                              {dose.status === '已服用' && <CheckCircle className="w-4 h-4 text-mint-500" />}
                              {dose.status === '已跳过' && <SkipForward className="w-4 h-4 text-slate-400" />}
                              {dose.status === '已过期' && <AlertCircle className="w-4 h-4 text-red-500" />}
                              {dose.status === '待服用' && <Clock className="w-4 h-4 text-coral-500" />}
                            </div>
                            <p className="text-xs text-slate-500 mb-2">{reminder.dosage} {reminder.unit}</p>
                            {dose.status === '待服用' && reminder.status === '进行中' && (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => onUpdateDose(dose.id, '已服用')}
                                  className="flex-1 py-1.5 rounded-lg bg-mint-500 hover:bg-mint-600 text-white text-xs font-medium transition-colors"
                                >
                                  ✓ 已服
                                </button>
                                <button
                                  onClick={() => onUpdateDose(dose.id, '已跳过')}
                                  className="py-1.5 px-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-600 text-xs transition-colors"
                                >
                                  跳过
                                </button>
                              </div>
                            )}
                            {dose.status === '已过期' && reminder.status === '进行中' && (
                              <button
                                onClick={() => onUpdateDose(dose.id, '已服用')}
                                className="w-full py-1.5 rounded-lg bg-coral-100 hover:bg-coral-200 text-coral-700 text-xs font-medium transition-colors"
                              >
                                标记补服
                              </button>
                            )}
                            {dose.status === '已服用' && dose.takenAt && (
                              <p className="text-[10px] text-mint-500 mt-1">
                                {new Date(dose.takenAt).toLocaleString('zh-CN', {
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
