import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  X,
  Edit2,
  Trash2,
  Thermometer,
  AlertCircle,
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  FileText,
} from 'lucide-react';
import { useAppStore } from '@/store';
import TemperatureChart from '@/components/TemperatureChart';
import type { TemperatureSite, TemperatureRecord } from '@/types';
import { isFever } from '@/types';
import { formatDate, formatTime, getToday } from '@/utils/dateUtils';

const MEASUREMENT_SITES: { value: TemperatureSite; label: string; threshold: number }[] = [
  { value: '腋下', label: '腋下', threshold: 37.2 },
  { value: '额温', label: '额温', threshold: 37.2 },
  { value: '耳温', label: '耳温', threshold: 37.5 },
  { value: '口腔', label: '口腔', threshold: 37.5 },
  { value: '肛温', label: '肛温', threshold: 38.0 },
];

export default function TemperatureRecordPage() {
  const navigate = useNavigate();
  const { children, currentChildId, temperatureRecords, addTemperatureRecord, updateTemperatureRecord, deleteTemperatureRecord } =
    useAppStore();

  const child = children.find((c) => c.id === currentChildId) || null;

  useEffect(() => {
    if (!child) {
      navigate('/child-info');
    }
  }, [child, navigate]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TemperatureRecord | null>(null);
  const [formData, setFormData] = useState({
    temperature: 36.5,
    site: '腋下' as TemperatureSite,
    measureDate: getToday(),
    measureTime: new Date().toTimeString().slice(0, 5),
    notes: '',
  });

  const currentRecords = useMemo(
    () =>
      temperatureRecords
        .filter((r) => r.childId === currentChildId)
        .sort(
          (a, b) =>
            new Date(`${b.measureDate}T${b.measureTime}`).getTime() -
            new Date(`${a.measureDate}T${a.measureTime}`).getTime()
        ),
    [temperatureRecords, currentChildId]
  );

  const groupedRecords = useMemo(() => {
    const groups: Record<string, TemperatureRecord[]> = {};
    for (const r of currentRecords) {
      if (!groups[r.measureDate]) {
        groups[r.measureDate] = [];
      }
      groups[r.measureDate].push(r);
    }
    return groups;
  }, [currentRecords]);

  const stats = useMemo(() => {
    const total = currentRecords.length;
    const today = getToday();
    const todayRecords = currentRecords.filter((r) => r.measureDate === today);
    const feverCount = currentRecords.filter((r) => isFever(r.temperature, r.site)).length;
    const latest = currentRecords[0];
    const hasFever = latest ? isFever(latest.temperature, latest.site) : false;
    const maxTemp = total > 0 ? Math.max(...currentRecords.map((r) => r.temperature)) : null;

    return { total, todayCount: todayRecords.length, feverCount, hasFever, maxTemp };
  }, [currentRecords]);

  const handleOpenAddModal = () => {
    setFormData({
      temperature: 36.5,
      site: '腋下',
      measureDate: getToday(),
      measureTime: new Date().toTimeString().slice(0, 5),
      notes: '',
    });
    setEditingRecord(null);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (record: TemperatureRecord) => {
    setFormData({
      temperature: record.temperature,
      site: record.site,
      measureDate: record.measureDate,
      measureTime: record.measureTime,
      notes: record.notes || '',
    });
    setEditingRecord(record);
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.temperature < 35 || formData.temperature > 42) {
      alert('体温值不在合理范围内（35°C - 42°C）');
      return;
    }

    if (editingRecord) {
      updateTemperatureRecord(editingRecord.id, formData);
    } else {
      addTemperatureRecord(formData);
    }

    setShowAddModal(false);
    setEditingRecord(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这条体温记录吗？此操作不可恢复。')) {
      deleteTemperatureRecord(id);
    }
  };

  if (!child) return null;

  const maxDate = getToday();

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display gradient-text mb-2 flex items-center gap-3">
            <span className="text-4xl">🌡️</span>
            体温记录
          </h1>
          <p className="text-slate-500">
            记录宝宝的体温变化，关注健康状况
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="btn-primary flex items-center justify-center gap-2 w-full md:w-auto"
        >
          <Plus className="w-5 h-5" />
          记录体温
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-mint-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-mint-600" />
            </div>
            <span className="text-sm text-slate-500">总记录</span>
          </div>
          <div className="text-3xl font-bold text-slate-800">{stats.total}</div>
          <p className="text-xs text-slate-400 mt-1">次体温测量</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-slate-500">今日测量</span>
          </div>
          <div className="text-3xl font-bold text-slate-800">{stats.todayCount}</div>
          <p className="text-xs text-slate-400 mt-1">次</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm text-slate-500">发热记录</span>
          </div>
          <div className={`text-3xl font-bold ${stats.feverCount > 0 ? 'text-red-500' : 'text-slate-800'}`}>
            {stats.feverCount}
          </div>
          <p className="text-xs text-slate-400 mt-1">次异常</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stats.hasFever ? 'bg-red-100' : 'bg-mint-100'}`}>
              <Thermometer className={`w-5 h-5 ${stats.hasFever ? 'text-red-600' : 'text-mint-600'}`} />
            </div>
            <span className="text-sm text-slate-500">最高体温</span>
          </div>
          <div className={`text-3xl font-bold ${stats.hasFever ? 'text-red-500' : 'text-slate-800'}`}>
            {stats.maxTemp ? `${stats.maxTemp.toFixed(1)}°C` : '--'}
          </div>
          <p className="text-xs text-slate-400 mt-1">{stats.hasFever ? '⚠️ 有发热' : '正常'}</p>
        </div>
      </div>

      <TemperatureChart records={currentRecords} title="近一周体温趋势" />

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
            <div className="text-6xl mb-4">🌡️</div>
            <p className="text-slate-500 mb-2">还没有体温记录</p>
            <p className="text-slate-400 text-sm mb-6">点击上方「记录体温」按钮添加第一条记录</p>
            <button
              onClick={handleOpenAddModal}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              记录体温
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedRecords).map(([date, records]) => {
              const isToday = date === getToday();
              const hasFeverToday = records.some((r) => isFever(r.temperature, r.site));
              return (
                <div key={date}>
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`text-sm font-medium ${
                        isToday ? 'text-mint-600' : 'text-slate-600'
                      }`}
                    >
                      {formatDate(date, 'YYYY年MM月DD日')}
                      {isToday && ' (今天)'}
                    </span>
                    {hasFeverToday && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
                        有发热
                      </span>
                    )}
                    <div className="flex-1 h-px bg-slate-100"></div>
                    <span className="text-xs text-slate-400">
                      {records.length} 次测量
                    </span>
                  </div>
                  <div className="space-y-3">
                    {records.map((record) => {
                      const hasFever = isFever(record.temperature, record.site);
                      return (
                        <div
                          key={record.id}
                          className={`flex items-start gap-4 p-4 rounded-2xl transition-all hover:shadow-soft ${
                            hasFever
                              ? 'bg-red-50 border border-red-100'
                              : 'bg-slate-50 border border-transparent hover:bg-white hover:border-slate-100'
                          }`}
                        >
                          <div
                            className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
                              hasFever
                                ? 'bg-gradient-to-br from-red-400 to-red-500 text-white'
                                : 'bg-gradient-to-br from-mint-300 to-mint-400 text-white'
                            }`}
                          >
                            <span className="text-xl font-bold">
                              {record.temperature.toFixed(1)}
                            </span>
                            <span className="text-[10px] opacity-80">°C</span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {hasFever ? (
                                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                              ) : (
                                <CheckCircle className="w-4 h-4 text-mint-500 flex-shrink-0" />
                              )}
                              <span
                                className={`font-medium ${
                                  hasFever ? 'text-red-700' : 'text-slate-700'
                                }`}
                              >
                                {hasFever ? '⚠️ 发热' : '✅ 正常体温'}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {formatTime(record.measureTime)}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {record.site}
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
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-soft-lg max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-coral-400 to-mint-400 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Thermometer className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display">
                      {editingRecord ? '编辑体温记录' : '记录体温'}
                    </h2>
                    <p className="text-white/80 text-sm">
                      {editingRecord ? '修改体温记录信息' : '录入新的体温测量数据'}
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
                  <span className="text-red-400">*</span> 体温值 (°C)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="35"
                    max="42"
                    className="input-field text-2xl font-bold text-center"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) || 36.5 })}
                    required
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-normal text-base">
                    °C
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, temperature: Math.max(35, +(formData.temperature - 0.1).toFixed(1)) })}
                    className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-medium text-slate-600 transition-colors"
                  >
                    - 0.1
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, temperature: Math.min(42, +(formData.temperature + 0.1).toFixed(1)) })}
                    className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-medium text-slate-600 transition-colors"
                  >
                    + 0.1
                  </button>
                </div>
                {isFever(formData.temperature, formData.site) && (
                  <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    体温超过 {MEASUREMENT_SITES.find((s) => s.value === formData.site)?.threshold}°C，属于发热状态
                  </p>
                )}
              </div>

              <div>
                <label className="label-field">
                  <span className="text-red-400">*</span> 测量部位
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {MEASUREMENT_SITES.map((site) => (
                    <button
                      key={site.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, site: site.value })}
                      className={`p-3 rounded-xl border-2 transition-all duration-300 text-center ${
                        formData.site === site.value
                          ? 'border-coral-400 bg-coral-50 text-coral-700 shadow-soft'
                          : 'border-gray-100 bg-gray-50 hover:border-coral-200 text-slate-600'
                      }`}
                    >
                      <div className="text-sm font-medium">{site.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        ≥{site.threshold}°C
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">
                    <span className="text-red-400">*</span> 测量日期
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={formData.measureDate}
                    max={maxDate}
                    onChange={(e) => setFormData({ ...formData, measureDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label-field">
                    <span className="text-red-400">*</span> 测量时间
                  </label>
                  <input
                    type="time"
                    className="input-field"
                    value={formData.measureTime}
                    onChange={(e) => setFormData({ ...formData, measureTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label-field">备注</label>
                <textarea
                  className="input-field resize-none"
                  rows={3}
                  placeholder="可选：记录用药情况、症状表现等"
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
