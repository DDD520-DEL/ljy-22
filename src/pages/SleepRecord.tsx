import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  X,
  Edit2,
  Trash2,
  Moon,
  Sun,
  AlertCircle,
  CheckCircle,
  Calendar,
  Clock,
  Eye,
  FileText,
  TrendingDown,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { SleepRecord } from '@/types';
import { formatDate, getToday } from '@/utils/dateUtils';

const AGE_SLEEP_REFERENCE: { maxMonth: number; reference: number; label: string }[] = [
  { maxMonth: 3, reference: 10, label: '0-3月' },
  { maxMonth: 11, reference: 10, label: '4-11月' },
  { maxMonth: 24, reference: 11, label: '1-2岁' },
  { maxMonth: 60, reference: 10, label: '3-5岁' },
  { maxMonth: 999, reference: 9, label: '6岁以上' },
];

function getReferenceSleep(monthAge: number) {
  return AGE_SLEEP_REFERENCE.find((r) => monthAge <= r.maxMonth) || AGE_SLEEP_REFERENCE[AGE_SLEEP_REFERENCE.length - 1];
}

function calculateSleepDuration(bedtime: string, wakeTime: string): number {
  const [bh, bm] = bedtime.split(':').map(Number);
  const [wh, wm] = wakeTime.split(':').map(Number);
  const bedMinutes = bh * 60 + bm;
  let wakeMinutes = wh * 60 + wm;
  if (wakeMinutes <= bedMinutes) {
    wakeMinutes += 24 * 60;
  }
  return Math.max(0, (wakeMinutes - bedMinutes) / 60);
}

function formatDuration(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}小时`;
  return `${h}小时${m}分钟`;
}

export default function SleepRecordPage() {
  const navigate = useNavigate();
  const { children, currentChildId, sleepRecords, addSleepRecord, updateSleepRecord, deleteSleepRecord } =
    useAppStore();

  const child = children.find((c) => c.id === currentChildId) || null;

  useEffect(() => {
    if (!child) {
      navigate('/child-info');
    }
  }, [child, navigate]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SleepRecord | null>(null);
  const [formData, setFormData] = useState({
    date: getToday(),
    bedtime: '21:00',
    wakeTime: '07:00',
    nightWakings: 0,
    notes: '',
  });

  const currentRecords = useMemo(
    () =>
      sleepRecords
        .filter((r) => r.childId === currentChildId)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [sleepRecords, currentChildId]
  );

  const calculatedDuration = useMemo(
    () => calculateSleepDuration(formData.bedtime, formData.wakeTime),
    [formData.bedtime, formData.wakeTime]
  );

  const monthAge = child ? Math.floor(
    (new Date().getTime() - new Date(child.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  ) : 0;
  const reference = getReferenceSleep(monthAge);

  const stats = useMemo(() => {
    const total = currentRecords.length;
    const last7 = currentRecords.slice(0, 7);
    const avgDuration = last7.length > 0
      ? last7.reduce((sum, r) => sum + r.duration, 0) / last7.length
      : 0;
    const insufficientCount = currentRecords.filter((r) => r.duration < reference.reference).length;
    const latest = currentRecords[0];
    return { total, avgDuration, insufficientCount, latest };
  }, [currentRecords, reference.reference]);

  const heatmapData = useMemo(() => {
    const today = new Date();
    const data: { date: string; duration: number; isFuture: boolean }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = formatDate(d);
      const record = currentRecords.find((r) => r.date === dateStr);
      data.push({
        date: dateStr,
        duration: record?.duration || 0,
        isFuture: false,
      });
    }
    return data;
  }, [currentRecords]);

  const heatmapColor = (duration: number) => {
    if (duration === 0) return 'bg-slate-100';
    if (duration < reference.reference - 2) return 'bg-red-300';
    if (duration < reference.reference - 1) return 'bg-amber-300';
    if (duration < reference.reference) return 'bg-amber-200';
    if (duration < reference.reference + 1) return 'bg-mint-200';
    return 'bg-mint-400';
  };

  const handleOpenAddModal = () => {
    setFormData({
      date: getToday(),
      bedtime: '21:00',
      wakeTime: '07:00',
      nightWakings: 0,
      notes: '',
    });
    setEditingRecord(null);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (record: SleepRecord) => {
    setFormData({
      date: record.date,
      bedtime: record.bedtime,
      wakeTime: record.wakeTime,
      nightWakings: record.nightWakings,
      notes: record.notes || '',
    });
    setEditingRecord(record);
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const duration = calculateSleepDuration(formData.bedtime, formData.wakeTime);

    if (editingRecord) {
      updateSleepRecord(editingRecord.id, { ...formData, duration });
    } else {
      addSleepRecord({ ...formData, duration });
    }

    setShowAddModal(false);
    setEditingRecord(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这条睡眠记录吗？此操作不可恢复。')) {
      deleteSleepRecord(id);
    }
  };

  if (!child) return null;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display gradient-text mb-2 flex items-center gap-3">
            <span className="text-4xl">🌙</span>
            睡眠记录
          </h1>
          <p className="text-slate-500">
            记录宝宝的睡眠情况，关注睡眠质量
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="btn-primary flex items-center justify-center gap-2 w-full md:w-auto"
        >
          <Plus className="w-5 h-5" />
          记录睡眠
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Moon className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-sm text-slate-500">总记录</span>
          </div>
          <div className="text-3xl font-bold text-slate-800">{stats.total}</div>
          <p className="text-xs text-slate-400 mt-1">晚睡眠记录</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-mint-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-mint-600" />
            </div>
            <span className="text-sm text-slate-500">近7天均睡</span>
          </div>
          <div className={`text-3xl font-bold ${stats.avgDuration >= reference.reference ? 'text-slate-800' : 'text-amber-600'}`}>
            {stats.avgDuration > 0 ? stats.avgDuration.toFixed(1) : '--'}
          </div>
          <p className="text-xs text-slate-400 mt-1">小时/晚</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-coral-100 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-coral-600" />
            </div>
            <span className="text-sm text-slate-500">不足参考</span>
          </div>
          <div className={`text-3xl font-bold ${stats.insufficientCount > 0 ? 'text-coral-600' : 'text-slate-800'}`}>
            {stats.insufficientCount}
          </div>
          <p className="text-xs text-slate-400 mt-1">晚低于{reference.reference}h</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Sun className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-slate-500">参考时长</span>
          </div>
          <div className="text-3xl font-bold text-slate-800">{reference.reference}h</div>
          <p className="text-xs text-slate-400 mt-1">{reference.label}夜间参考</p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
            <span className="text-2xl">🗓️</span>
            近30天睡眠热力图
          </h3>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-red-300 inline-block"></span> 不足
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-amber-200 inline-block"></span> 接近
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-mint-200 inline-block"></span> 达标
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-mint-400 inline-block"></span> 充足
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-slate-100 inline-block"></span> 无记录
            </span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['一', '二', '三', '四', '五', '六', '日'].map((d) => (
            <div key={d} className="text-center text-xs text-slate-400 font-medium pb-1">
              {d}
            </div>
          ))}
          {(() => {
            const firstDate = new Date(heatmapData[0].date);
            const startDayOfWeek = (firstDate.getDay() + 6) % 7;
            const blanks: JSX.Element[] = [];
            for (let i = 0; i < startDayOfWeek; i++) {
              blanks.push(
                <div key={`blank-${i}`} className="aspect-square"></div>
              );
            }
            return blanks;
          })()}
          {heatmapData.map((item) => {
            const dayLabel = new Date(item.date).getDate();
            const isToday = item.date === getToday();
            return (
              <div
                key={item.date}
                className={`aspect-square rounded-lg ${heatmapColor(item.duration)} flex flex-col items-center justify-center cursor-default transition-all hover:scale-110 relative group ${
                  isToday ? 'ring-2 ring-indigo-400' : ''
                }`}
              >
                <span className={`text-[10px] ${item.duration > 0 ? 'text-slate-700' : 'text-slate-400'} font-medium`}>
                  {dayLabel}
                </span>
                {item.duration > 0 && (
                  <span className="text-[9px] text-slate-600 font-bold">{item.duration.toFixed(1)}</span>
                )}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {formatDate(item.date, 'MM月DD日')} {item.duration > 0 ? `${item.duration.toFixed(1)}h` : '无记录'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
            <span className="text-2xl">📋</span>
            历史记录
          </h3>
          <span className="text-sm text-slate-500">
            共 {currentRecords.length} 条记录
          </span>
        </div>

        {currentRecords.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌙</div>
            <p className="text-slate-500 mb-2">还没有睡眠记录</p>
            <p className="text-slate-400 text-sm mb-6">点击上方「记录睡眠」按钮添加第一条记录</p>
            <button
              onClick={handleOpenAddModal}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              记录睡眠
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {currentRecords.map((record) => {
              const isInsufficient = record.duration < reference.reference;
              return (
                <div
                  key={record.id}
                  className={`flex items-start gap-4 p-4 rounded-2xl transition-all hover:shadow-soft ${
                    isInsufficient
                      ? 'bg-amber-50 border border-amber-100'
                      : 'bg-slate-50 border border-transparent hover:bg-white hover:border-slate-100'
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
                      isInsufficient
                        ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white'
                        : 'bg-gradient-to-br from-indigo-400 to-purple-400 text-white'
                    }`}
                  >
                    <span className="text-lg font-bold">{record.duration.toFixed(1)}</span>
                    <span className="text-[10px] opacity-80">小时</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {isInsufficient ? (
                        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-mint-500 flex-shrink-0" />
                      )}
                      <span
                        className={`font-medium ${
                          isInsufficient ? 'text-amber-700' : 'text-slate-700'
                        }`}
                      >
                        {isInsufficient ? '⚠️ 睡眠不足' : '✅ 睡眠达标'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(record.date, 'YYYY年MM月DD日')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Moon className="w-3.5 h-3.5" />
                        入睡 {record.bedtime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Sun className="w-3.5 h-3.5" />
                        起床 {record.wakeTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        夜醒 {record.nightWakings} 次
                      </span>
                      {record.notes && (
                        <span className="flex items-center gap-1 truncate">
                          <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{record.notes}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleOpenEditModal(record)}
                      className="w-9 h-9 rounded-lg hover:bg-white hover:shadow-soft flex items-center justify-center text-slate-400 hover:text-mint-600 transition-colors"
                      title="编辑"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="w-9 h-9 rounded-lg hover:bg-white hover:shadow-soft flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-soft-lg max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-400 to-purple-400 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Moon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display">
                      {editingRecord ? '编辑睡眠记录' : '记录睡眠'}
                    </h2>
                    <p className="text-white/80 text-sm">
                      {editingRecord ? '修改睡眠记录信息' : '录入宝宝的睡眠数据'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="label-field">
                  <span className="text-red-400">*</span> 睡眠日期
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={formData.date}
                  max={getToday()}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">
                    <span className="text-red-400">*</span> 入睡时间
                  </label>
                  <input
                    type="time"
                    className="input-field"
                    value={formData.bedtime}
                    onChange={(e) => setFormData({ ...formData, bedtime: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label-field">
                    <span className="text-red-400">*</span> 起床时间
                  </label>
                  <input
                    type="time"
                    className="input-field"
                    value={formData.wakeTime}
                    onChange={(e) => setFormData({ ...formData, wakeTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-500" />
                    <span className="text-sm font-medium text-indigo-700">睡眠总时长</span>
                  </div>
                  <span className={`text-2xl font-bold ${
                    calculatedDuration >= reference.reference ? 'text-mint-600' : 'text-amber-600'
                  }`}>
                    {formatDuration(calculatedDuration)}
                  </span>
                </div>
                {calculatedDuration < reference.reference && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    低于参考时长 {reference.reference} 小时（{reference.label}）
                  </p>
                )}
                {calculatedDuration >= reference.reference && (
                  <p className="text-xs text-mint-600 mt-2 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    达到参考时长 {reference.reference} 小时，睡眠充足 👍
                  </p>
                )}
              </div>

              <div>
                <label className="label-field">
                  <span className="text-red-400">*</span> 夜间醒来次数
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, nightWakings: Math.max(0, formData.nightWakings - 1) })}
                    className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xl transition-colors"
                  >
                    -
                  </button>
                  <div className="flex-1 text-center">
                    <span className="text-4xl font-bold text-slate-800">{formData.nightWakings}</span>
                    <p className="text-xs text-slate-400 mt-1">次</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, nightWakings: Math.min(20, formData.nightWakings + 1) })}
                    className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xl transition-colors"
                  >
                    +
                  </button>
                </div>
                {formData.nightWakings >= 3 && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    夜醒频繁，建议关注宝宝睡眠环境与作息
                  </p>
                )}
              </div>

              <div>
                <label className="label-field">备注</label>
                <textarea
                  className="input-field resize-none"
                  rows={3}
                  placeholder="可选：记录睡眠质量、入睡困难原因等"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  maxLength={200}
                />
                <p className="text-xs text-slate-400 mt-1 text-right">
                  {formData.notes.length}/200
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 btn-outline"
                >
                  取消
                </button>
                <button type="submit" className="flex-1 btn-primary flex items-center justify-center gap-2">
                  {editingRecord ? (
                    <>
                      <Edit2 className="w-5 h-5" />
                      保存修改
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      添加记录
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
