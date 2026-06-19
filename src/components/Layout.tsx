import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Home,
  Baby,
  Syringe,
  Stethoscope,
  Bell,
  FileText,
  Printer,
  LogOut,
  Plus,
  ChevronDown,
  X,
  UserPlus,
  Activity,
  Shield,
  Download,
  Upload,
  HardDrive,
  AlertTriangle,
  CheckCircle2,
  Settings,
  ArrowLeftRight,
  Thermometer,
  Pill,
  Moon,
  Check,
  SkipForward,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { formatDateTime, getToday, getDaysBetween } from '@/utils/dateUtils';
import { getBackupSummary } from '@/utils/backup';
import type { BackupData } from '@/types';

const navItems = [
  { path: '/', icon: Home, label: '首页概览' },
  { path: '/child-info', icon: Baby, label: '宝宝信息' },
  { path: '/vaccine-schedule', icon: Syringe, label: '疫苗接种' },
  { path: '/vaccine-certificate', icon: Shield, label: '电子接种证' },
  { path: '/checkup-schedule', icon: Stethoscope, label: '儿保体检' },
  { path: '/temperature', icon: Thermometer, label: '体温记录' },
  { path: '/sleep', icon: Moon, label: '睡眠记录' },
  { path: '/allergy', icon: ShieldAlert, label: '过敏原记录' },
  { path: '/timeline', icon: Sparkles, label: '宝宝大事件' },
  { path: '/reaction-diary', icon: Activity, label: '反应日记' },
  { path: '/medication', icon: Pill, label: '用药提醒' },
  { path: '/reminders', icon: Bell, label: '提醒中心' },
  { path: '/records', icon: FileText, label: '记录管理' },
  { path: '/checkup-compare', icon: ArrowLeftRight, label: '体检对比' },
  { path: '/export', icon: Printer, label: '导出打印' },
];

export default function Layout() {
  const navigate = useNavigate();
  const {
    children,
    currentChildId,
    switchChild,
    deleteChild,
    reminders,
    reactionDiaries,
    medicationReminders,
    settings,
    exportBackup,
    importBackup,
    refreshBackupReminder,
    refreshMedicationDoseStatus,
    updateMedicationDoseStatus,
    updateSettings,
  } = useAppStore();
  const [showChildList, setShowChildList] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [tempDays, setTempDays] = useState(settings.reminderDaysBefore);
  const [notificationGranted, setNotificationGranted] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ data: BackupData; success: true } | { error: string; success: false } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentChild = children.find((c) => c.id === currentChildId) || null;
  const pendingReminders = reminders.filter((r) => r.status !== '已完成').length;
  const activeDiaries = reactionDiaries.filter((d) => d.childId === currentChildId && d.status === '观察中').length;
  const today = getToday();
  const pendingMedications = medicationReminders
    .filter((m) => m.childId === currentChildId && m.status === '进行中')
    .reduce(
      (count, m) =>
        count +
        m.doses.filter((d) => d.date === today && (d.status === '待服用' || d.status === '已过期')).length,
      0
    );

  const [notifiedDoseIds, setNotifiedDoseIds] = useState<Set<string>>(new Set());
  const [popupDose, setPopupDose] = useState<{
    id: string;
    reminderId: string;
    medicationName: string;
    dosage: string;
    unit: string;
    time: string;
    medicationType: string;
  } | null>(null);

  const handleSwitchChild = (id: string) => {
    switchChild(id);
    setShowChildList(false);
  };

  const handleDeleteChild = (id: string, name: string) => {
    if (window.confirm(`确定要删除宝宝「${name}」吗？所有相关数据将被清除，此操作不可恢复！`)) {
      deleteChild(id);
      if (children.length <= 1) {
        setShowChildList(false);
        navigate('/child-info');
      }
    }
  };

  const handleClearData = () => {
    if (window.confirm('确定要清除所有数据吗？此操作不可恢复！')) {
      children.forEach((c) => deleteChild(c.id));
      navigate('/child-info');
    }
  };

  useEffect(() => {
    refreshMedicationDoseStatus();

    const checkMedicationReminders = () => {
      const now = new Date();
      const todayStr = getToday();

      for (const reminder of medicationReminders) {
        if (reminder.childId !== currentChildId || reminder.status !== '进行中') continue;

        for (const dose of reminder.doses) {
          if (dose.date !== todayStr || dose.status !== '待服用') continue;

          const doseMinutes = parseInt(dose.time.split(':')[0]) * 60 + parseInt(dose.time.split(':')[1]);
          const nowMinutes = now.getHours() * 60 + now.getMinutes();
          const diff = nowMinutes - doseMinutes;

          if (diff >= 0 && diff <= 5 && !notifiedDoseIds.has(dose.id)) {
            setNotifiedDoseIds((prev) => new Set([...prev, dose.id]));
            setPopupDose({
              id: dose.id,
              reminderId: reminder.id,
              medicationName: reminder.medicationName,
              dosage: reminder.dosage,
              unit: reminder.unit,
              time: dose.time,
              medicationType: reminder.medicationType,
            });

            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(`💊 用药提醒：${reminder.medicationName}`, {
                body: `${dose.time} · ${reminder.dosage} ${reminder.unit} · ${reminder.medicationType}`,
                icon: '/favicon.svg',
              });
            }
            break;
          }
        }
      }
    };

    checkMedicationReminders();
    const interval = setInterval(() => {
      refreshMedicationDoseStatus();
      checkMedicationReminders();
    }, 60000);
    return () => clearInterval(interval);
  }, [refreshMedicationDoseStatus, medicationReminders, currentChildId, notifiedDoseIds]);

  const getGenderEmoji = (gender: '男' | '女') => {
    return gender === '男' ? '👦' : '👧';
  };

  const lastBackupAt = settings.lastBackupAt;
  const daysSinceBackup = lastBackupAt
    ? getDaysBetween(lastBackupAt.split('T')[0], today)
    : null;
  const backupOverdue = daysSinceBackup === null || daysSinceBackup >= 30;

  const handleExportBackup = () => {
    exportBackup();
    refreshBackupReminder();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    try {
      const data = await importBackup(file);
      setImportResult({ data, success: true });
      refreshBackupReminder();
    } catch (err) {
      setImportResult({ error: (err as Error).message, success: false });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      const result = await Notification.requestPermission();
      setNotificationGranted(result === 'granted');
      updateSettings({ notificationEnabled: result === 'granted' });
    }
  };

  return (
    <div className="min-h-screen flex">
      <aside className="no-print w-64 bg-white/80 backdrop-blur-xl border-r border-mint-100 flex flex-col fixed h-screen z-50">
        <div className="p-6 border-b border-mint-50">
          <h1 className="font-display text-2xl gradient-text flex items-center gap-2">
            <span className="text-3xl">👶</span>
            育儿管家
          </h1>
          <p className="text-xs text-slate-400 mt-1">疫苗接种 · 儿保体检 全程管理</p>
        </div>

        {currentChild && (
          <div className="relative p-4 mx-4 mt-4">
            <div
              className="rounded-2xl bg-gradient-to-br from-mint-50 to-coral-50 cursor-pointer hover:shadow-soft transition-all duration-300 p-4"
              onClick={() => setShowChildList(!showChildList)}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mint-300 to-coral-300 flex items-center justify-center text-2xl shadow-soft">
                  {getGenderEmoji(currentChild.gender)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-700 truncate">{currentChild.name}</p>
                  <p className="text-xs text-slate-500">
                    {currentChild.gender} · {new Date(currentChild.birthDate).toLocaleDateString('zh-CN')}
                  </p>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform ${showChildList ? 'rotate-180' : ''}`}
                />
              </div>
            </div>

            {showChildList && (
              <div className="absolute top-full left-4 right-4 mt-2 bg-white rounded-2xl shadow-soft-lg border border-slate-100 overflow-hidden z-50 animate-fade-in">
                <div className="max-h-64 overflow-y-auto">
                  {children.map((child) => (
                    <div
                      key={child.id}
                      className={`flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors ${
                        child.id === currentChildId ? 'bg-mint-50' : ''
                      }`}
                      onClick={() => handleSwitchChild(child.id)}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-mint-200 to-coral-200 flex items-center justify-center text-xl flex-shrink-0">
                        {getGenderEmoji(child.gender)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-700 truncate text-sm">{child.name}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(child.birthDate).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                      {child.id === currentChildId && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-mint-100 text-mint-600 font-medium">
                          当前
                        </span>
                      )}
                      {children.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChild(child.id, child.name);
                          }}
                          className="w-7 h-7 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors"
                          title="删除宝宝"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-100 p-2">
                  <button
                    onClick={() => {
                      setShowChildList(false);
                      setShowAddModal(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-mint-600 hover:bg-mint-50 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    添加宝宝
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const showBadge = item.path === '/reminders' && pendingReminders > 0;
            const showDiaryBadge = item.path === '/reaction-diary' && activeDiaries > 0;
            const showMedicationBadge = item.path === '/medication' && pendingMedications > 0;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''} relative`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {showBadge && (
                  <span className="min-w-5 h-5 px-1.5 bg-coral-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {pendingReminders}
                  </span>
                )}
                {showDiaryBadge && (
                  <span className="min-w-5 h-5 px-1.5 bg-mint-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse-soft">
                    {activeDiaries}
                  </span>
                )}
                {showMedicationBadge && (
                  <span className="min-w-5 h-5 px-1.5 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse-soft">
                    {pendingMedications}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-mint-50 space-y-2">
          {children.length > 0 && (
            <div
              className={`p-3 rounded-xl mb-2 cursor-pointer transition-all ${
                backupOverdue
                  ? 'bg-amber-50 border border-amber-200 hover:bg-amber-100'
                  : 'bg-mint-50 border border-mint-200 hover:bg-mint-100'
              }`}
              onClick={() => {
                setTempDays(settings.reminderDaysBefore);
                if ('Notification' in window) {
                  setNotificationGranted(Notification.permission === 'granted');
                }
                setImportResult(null);
                setShowSettingsModal(true);
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <HardDrive
                  className={`w-4 h-4 flex-shrink-0 ${
                    backupOverdue ? 'text-amber-600' : 'text-mint-600'
                  }`}
                />
                <span
                  className={`text-xs font-semibold ${
                    backupOverdue ? 'text-amber-700' : 'text-mint-700'
                  }`}
                >
                  数据备份
                </span>
                {backupOverdue && (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 ml-auto" />
                )}
                {!backupOverdue && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-mint-500 ml-auto" />
                )}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {lastBackupAt ? (
                  <>
                    上次备份：
                    <br />
                    <span className="font-medium text-slate-700">
                      {formatDateTime(lastBackupAt)}
                    </span>
                    {backupOverdue && (
                      <>
                        <br />
                        <span className="text-amber-600 font-medium">
                          已超过 {daysSinceBackup} 天未备份
                        </span>
                      </>
                    )}
                  </>
                ) : (
                  <span className="text-amber-600 font-medium">尚未备份，建议立即备份</span>
                )}
              </p>
            </div>
          )}

          <button
            onClick={() => {
              setTempDays(settings.reminderDaysBefore);
              if ('Notification' in window) {
                setNotificationGranted(Notification.permission === 'granted');
              }
              setImportResult(null);
              setShowSettingsModal(true);
            }}
            className="sidebar-link w-full"
          >
            <Settings className="w-5 h-5" />
            <span>设置与备份</span>
          </button>

          <button
            onClick={handleClearData}
            className="sidebar-link w-full text-slate-400 hover:text-red-500 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
            <span>清除数据</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 min-h-screen">
        <div className="container py-8 max-w-7xl animate-fade-in">
          <Outlet />
        </div>
      </main>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleFileChange}
      />

      {showAddModal && (
        <AddChildModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => setShowAddModal(false)}
        />
      )}

      {showChildList && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowChildList(false)}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          onClose={() => setShowSettingsModal(false)}
          tempDays={tempDays}
          setTempDays={setTempDays}
          notificationGranted={notificationGranted}
          requestNotificationPermission={requestNotificationPermission}
          lastBackupAt={lastBackupAt}
          daysSinceBackup={daysSinceBackup}
          backupOverdue={backupOverdue}
          onExportBackup={handleExportBackup}
          onImportClick={handleImportClick}
          importing={importing}
          importResult={importResult}
          updateSettings={updateSettings}
        />
      )}

      {popupDose && (
        <div className="fixed top-4 right-4 z-50 animate-bounce-in">
          <div className="bg-white rounded-3xl shadow-soft-lg border-2 border-purple-300 max-w-sm w-full overflow-hidden animate-pulse-soft">
            <div className="bg-gradient-to-r from-purple-400 to-coral-400 p-5 text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center animate-bounce">
                    <Pill className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display">⏰ 用药时间到！</h3>
                    <p className="text-white/90 text-sm mt-1">该给宝宝服药啦</p>
                  </div>
                </div>
                <button
                  onClick={() => setPopupDose(null)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-purple-500 font-medium">服药时间</p>
                  <span className="text-2xl font-bold text-purple-700">{popupDose.time}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">药品名称</span>
                    <span className="font-semibold text-slate-800">{popupDose.medicationName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">服用剂量</span>
                    <span className="font-semibold text-coral-600">{popupDose.dosage} {popupDose.unit}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">药品类型</span>
                    <span className="font-medium text-slate-700">{popupDose.medicationType}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    updateMedicationDoseStatus(popupDose.reminderId, popupDose.id, '已服用');
                    setPopupDose(null);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-mint-400 to-mint-500 text-white font-semibold shadow-soft hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  已服药 ✓
                </button>
                <button
                  onClick={() => {
                    updateMedicationDoseStatus(popupDose.reminderId, popupDose.id, '已跳过');
                    setPopupDose(null);
                  }}
                  className="py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium transition-colors flex items-center gap-2"
                >
                  <SkipForward className="w-4 h-4" />
                  跳过
                </button>
              </div>
              <p className="text-xs text-center text-slate-400">
                💡 请确保宝宝已安全服药后再标记完成
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AddChildModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { addChild } = useAppStore();
  const [formData, setFormData] = useState({
    name: '',
    gender: '男' as '男' | '女',
    birthDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.birthDate) {
      alert('请填写完整信息');
      return;
    }
    addChild(formData);
    onSuccess();
  };

  const maxDate = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-soft-lg max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-mint-400 to-coral-400 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-display">添加宝宝</h2>
                <p className="text-white/80 text-sm">录入新宝宝的基本信息</p>
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
          <div>
            <label className="label-field">
              <span className="text-red-400">*</span> 宝宝姓名
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="请输入宝宝的名字"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              maxLength={20}
            />
          </div>

          <div>
            <label className="label-field">
              <span className="text-red-400">*</span> 性别
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, gender: '男' })}
                className={`p-5 rounded-2xl border-2 transition-all duration-300 ${
                  formData.gender === '男'
                    ? 'border-mint-400 bg-mint-50 shadow-glow-mint'
                    : 'border-gray-100 bg-gray-50 hover:border-mint-200'
                }`}
              >
                <div className="text-4xl mb-2">👦</div>
                <p className={`font-semibold ${formData.gender === '男' ? 'text-mint-600' : 'text-slate-600'}`}>
                  男宝宝
                </p>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, gender: '女' })}
                className={`p-5 rounded-2xl border-2 transition-all duration-300 ${
                  formData.gender === '女'
                    ? 'border-coral-400 bg-coral-50 shadow-lg'
                    : 'border-gray-100 bg-gray-50 hover:border-coral-200'
                }`}
              >
                <div className="text-4xl mb-2">👧</div>
                <p className={`font-semibold ${formData.gender === '女' ? 'text-coral-600' : 'text-slate-600'}`}>
                  女宝宝
                </p>
              </button>
            </div>
          </div>

          <div>
            <label className="label-field">
              <span className="text-red-400">*</span> 出生日期
            </label>
            <input
              type="date"
              className="input-field"
              value={formData.birthDate}
              max={maxDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
            />
            <p className="text-xs text-slate-400 mt-2">
              系统将根据出生日期自动计算国家免疫规划的接种时间和体检节点
            </p>
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
              添加宝宝
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface SettingsModalProps {
  onClose: () => void;
  tempDays: number;
  setTempDays: (n: number) => void;
  notificationGranted: boolean;
  requestNotificationPermission: () => Promise<void>;
  lastBackupAt?: string;
  daysSinceBackup: number | null;
  backupOverdue: boolean;
  onExportBackup: () => void;
  onImportClick: () => void;
  importing: boolean;
  importResult: { data: BackupData; success: true } | { error: string; success: false } | null;
  updateSettings: (settings: Partial<import('@/types').AppSettings>) => void;
}

function SettingsModal(props: SettingsModalProps) {
  const {
    onClose,
    tempDays,
    setTempDays,
    notificationGranted,
    requestNotificationPermission,
    lastBackupAt,
    daysSinceBackup,
    backupOverdue,
    onExportBackup,
    onImportClick,
    importing,
    importResult,
    updateSettings,
  } = props;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-soft-lg max-w-lg w-full overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-mint-400 to-coral-400 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-display">设置与备份</h2>
                <p className="text-white/80 text-sm">提醒设置、数据备份与恢复</p>
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
                <Bell className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-sm flex-1">
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

          <div className="border-t border-slate-100 pt-6">
            <h3 className="font-display text-xl text-slate-800 mb-4 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-slate-500" />
              数据备份与恢复
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              所有数据保存在您的浏览器本地，建议定期导出备份以防数据丢失。
              超过 30 天未备份系统将自动提醒您。
            </p>

            <div
              className={`p-4 rounded-2xl mb-4 ${
                backupOverdue
                  ? 'bg-amber-50 border-2 border-amber-200'
                  : 'bg-mint-50 border-2 border-mint-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {backupOverdue ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-mint-600" />
                )}
                <span
                  className={`font-semibold ${
                    backupOverdue ? 'text-amber-700' : 'text-mint-700'
                  }`}
                >
                  {lastBackupAt ? '上次备份状态' : '尚未备份'}
                </span>
              </div>
              {lastBackupAt ? (
                <>
                  <p className="text-sm text-slate-700">
                    备份时间：<span className="font-medium">{formatDateTime(lastBackupAt)}</span>
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    距今：<span className="font-medium">{daysSinceBackup} 天</span>
                    {backupOverdue && (
                      <span className="text-amber-600 font-medium ml-2">（已超过30天建议立即备份）</span>
                    )}
                  </p>
                </>
              ) : (
                <p className="text-sm text-amber-600 font-medium">
                  还没有备份过，点击下方按钮立即备份您的数据
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onExportBackup}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-mint-400 to-mint-500 text-white font-medium shadow-soft hover:shadow-lg transition-all"
              >
                <Download className="w-5 h-5" />
                导出备份
              </button>
              <button
                onClick={onImportClick}
                disabled={importing}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-coral-400 to-coral-500 text-white font-medium shadow-soft hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-5 h-5" />
                {importing ? '导入中...' : '恢复备份'}
              </button>
            </div>

            {importResult && (
              <div
                className={`mt-4 p-4 rounded-2xl ${
                  importResult.success
                    ? 'bg-mint-50 border border-mint-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                {'data' in importResult ? (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-mint-600" />
                      <span className="font-semibold text-mint-700">数据恢复成功！</span>
                    </div>
                    <pre className="text-xs text-slate-600 whitespace-pre-wrap bg-white/60 p-3 rounded-lg">
                      {getBackupSummary(importResult.data)}
                    </pre>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-700">恢复失败</p>
                      <p className="text-sm text-red-600 mt-1">{importResult.error}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2 border-t border-slate-100">
            <button onClick={onClose} className="flex-1 btn-outline">
              关闭
            </button>
            <button
              onClick={() => {
                updateSettings({ reminderDaysBefore: tempDays });
                onClose();
              }}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              保存设置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
