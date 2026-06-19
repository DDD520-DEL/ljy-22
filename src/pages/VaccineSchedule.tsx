import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  X,
  Shield,
  MapPin,
  AlertCircle,
  Info,
  Activity,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { VaccineSchedule as VaccineScheduleType, VaccineRecord } from '@/types';
import {
  formatDate,
  formatMonthAge,
  getDaysBetween,
  getToday,
} from '@/utils/dateUtils';
import VaccineKnowledgeCard from '@/components/VaccineKnowledgeCard';
import { VACCINE_DEFINITIONS } from '@/data/vaccines';

type FilterType = 'all' | 'pending' | 'completed' | 'missed';
type CategoryType = 'all' | '一类' | '二类';

export default function VaccineSchedulePage() {
  const navigate = useNavigate();
  const {
    children,
    currentChildId,
    vaccineSchedules,
    vaccineRecords,
    reactionDiaries,
    addVaccineRecord,
    updateVaccineScheduleStatus,
  } = useAppStore();

  const child = children.find((c) => c.id === currentChildId) || null;
  const currentVaccineSchedules = vaccineSchedules.filter((s) => s.childId === currentChildId);
  const currentVaccineRecords = vaccineRecords.filter((r) => r.childId === currentChildId);

  const [filter, setFilter] = useState<FilterType>('all');
  const [category, setCategory] = useState<CategoryType>('all');
  const [selectedSchedule, setSelectedSchedule] = useState<VaccineScheduleType | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [knowledgeVaccineCode, setKnowledgeVaccineCode] = useState<string | null>(null);
  const [knowledgeDoseNumber, setKnowledgeDoseNumber] = useState<number | undefined>(undefined);
  const [knowledgePlannedDate, setKnowledgePlannedDate] = useState<string | undefined>(undefined);
  const [recordForm, setRecordForm] = useState({
    manufacturer: '',
    batchNumber: '',
    vaccinationDate: getToday(),
    site: '',
    doctor: '',
    reaction: '',
    reactionSeverity: '无' as VaccineRecord['reactionSeverity'],
    notes: '',
  });

  useEffect(() => {
    if (!child) navigate('/child-info');
  }, [child, navigate]);

  if (!child) return null;

  const today = getToday();

  const filteredSchedules = currentVaccineSchedules.filter((s) => {
    if (category !== 'all' && s.category !== category) return false;
    if (filter === 'pending') return s.status === '待接种' || s.status === '已推迟';
    if (filter === 'completed') return s.status === '已接种';
    if (filter === 'missed') return s.status === '已错过';
    return true;
  });

  const getStatusConfig = (schedule: VaccineScheduleType) => {
    const daysToDue = getDaysBetween(today, schedule.plannedDate);
    switch (schedule.status) {
      case '已接种':
        return {
          variant: 'completed' as const,
          bg: 'bg-mint-50 border-mint-200',
          badge: 'bg-mint-100 text-mint-600',
          icon: CheckCircle,
          label: '已完成',
        };
      case '已错过':
        return {
          variant: 'missed' as const,
          bg: 'bg-red-50 border-red-200',
          badge: 'bg-red-100 text-red-600',
          icon: AlertTriangle,
          label: '已错过',
        };
      default:
        if (daysToDue < 0) {
          return {
            variant: 'missed' as const,
            bg: 'bg-red-50 border-red-200',
            badge: 'bg-red-100 text-red-600',
            icon: AlertTriangle,
            label: '已过期',
          };
        }
        if (daysToDue <= 3) {
          return {
            variant: 'urgent' as const,
            bg: 'bg-coral-50 border-coral-200',
            badge: 'bg-coral-100 text-coral-600 animate-pulse-soft',
            icon: AlertCircle,
            label: daysToDue === 0 ? '今天' : `${daysToDue}天后`,
          };
        }
        return {
          variant: 'pending' as const,
          bg: 'bg-white border-slate-200',
          badge: 'bg-slate-100 text-slate-500',
          icon: Clock,
          label: `${daysToDue}天后`,
        };
    }
  };

  const openRecordModal = (schedule: VaccineScheduleType) => {
    setSelectedSchedule(schedule);
    setRecordForm({
      manufacturer: '',
      batchNumber: '',
      vaccinationDate: getToday(),
      site: schedule.site || '',
      doctor: '',
      reaction: '',
      reactionSeverity: '无',
      notes: '',
    });
    setShowRecordModal(true);
  };

  const handleSubmitRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule) return;

    addVaccineRecord({
      ...recordForm,
      scheduleId: selectedSchedule.id,
      vaccineName: selectedSchedule.vaccineName,
      vaccineShortName: selectedSchedule.vaccineShortName,
    });

    setShowRecordModal(false);
    setSelectedSchedule(null);
  };

  const getRecordForSchedule = (scheduleId: string) => {
    return currentVaccineRecords.find((r) => r.scheduleId === scheduleId);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display text-slate-800 flex items-center gap-3">
            <span className="text-4xl">💉</span>
            疫苗接种时间表
          </h1>
          <p className="text-slate-500 mt-1">
            按照国家免疫规划自动生成，共 {currentVaccineSchedules.length} 剂次
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex bg-white rounded-xl p-1 shadow-soft border border-slate-100">
            {(['all', '一类', '二类'] as CategoryType[]).map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  category === c
                    ? 'bg-mint-400 text-white'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {c === 'all' ? '全部' : c}
              </button>
            ))}
          </div>

          <div className="flex bg-white rounded-xl p-1 shadow-soft border border-slate-100">
            {[
              { key: 'all' as FilterType, label: '全部' },
              { key: 'pending' as FilterType, label: '待接种' },
              { key: 'completed' as FilterType, label: '已完成' },
              { key: 'missed' as FilterType, label: '已错过' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === f.key
                    ? 'bg-coral-500 text-white'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-6 md:left-10 top-0 bottom-0 w-1 bg-gradient-to-b from-mint-200 via-coral-200 to-purple-200 rounded-full"></div>

        <div className="space-y-6">
          {filteredSchedules.map((schedule, index) => {
            const config = getStatusConfig(schedule);
            const StatusIcon = config.icon;
            const record = getRecordForSchedule(schedule.id);

            return (
              <div
                key={schedule.id}
                className={`relative pl-16 md:pl-24 animate-fade-in-up`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className={`absolute left-2 md:left-6 top-6 w-8 h-8 rounded-full border-4 border-white shadow-soft flex items-center justify-center z-10 ${
                    config.variant === 'completed'
                      ? 'bg-mint-400'
                      : config.variant === 'missed'
                      ? 'bg-red-400'
                      : config.variant === 'urgent'
                      ? 'bg-coral-400 animate-pulse-soft'
                      : 'bg-slate-300'
                  }`}
                >
                  <StatusIcon className="w-4 h-4 text-white" />
                </div>

                <div className={`card card-hover border-l-4 ${config.bg}`}>
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className="px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-mint-100 to-coral-100 text-slate-700">
                          {formatMonthAge(schedule.monthAge)}
                        </span>
                        <button
                          onClick={() => {
                            setKnowledgeVaccineCode(schedule.vaccineCode);
                            setKnowledgeDoseNumber(schedule.doseNumber);
                            setKnowledgePlannedDate(formatDate(schedule.plannedDate, 'YYYY年MM月DD日'));
                          }}
                          className="group flex items-center gap-1.5 hover:bg-gradient-to-r hover:from-mint-50 hover:to-coral-50 px-2 -mx-2 py-0.5 rounded-lg transition-all"
                          title="点击查看疫苗科普知识"
                        >
                          <h3 className="text-xl font-bold text-slate-800 group-hover:gradient-text transition-all">
                            {schedule.vaccineName}
                            <span className="text-sm font-normal text-slate-500 ml-2">
                              (第{schedule.doseNumber}剂)
                            </span>
                          </h3>
                          <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-mint-500 transition-colors flex-shrink-0 mt-0.5" />
                        </button>
                        <span
                          className={`px-2.5 py-0.5 rounded text-xs font-medium ${
                            schedule.category === '一类'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-purple-100 text-purple-600'
                          }`}
                        >
                          {schedule.category}
                        </span>
                        <span className={`status-badge ${config.badge}`}>{config.label}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Shield className="w-4 h-4 text-mint-500" />
                          <span className="text-slate-400">预防：</span>
                          {schedule.preventDisease}
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin className="w-4 h-4 text-coral-500" />
                          <span className="text-slate-400">部位：</span>
                          {schedule.site}
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Info className="w-4 h-4 text-blue-500" />
                          <span className="text-slate-400">接种：</span>
                          {formatDate(schedule.plannedDate, 'YYYY年MM月DD日')}
                        </div>
                      </div>

                      {schedule.contraindications && (
                        <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-700">
                          <strong>⚠️ 禁忌症：</strong>
                          {schedule.contraindications}
                        </div>
                      )}

                      {record && (
                        <div className="mt-4 p-4 rounded-2xl bg-mint-50 border border-mint-200">
                          <p className="text-xs font-bold text-mint-600 mb-2 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            接种记录
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                            <div>
                              <span className="text-slate-400">实际接种：</span>
                              <span className="text-slate-700 font-medium">
                                {formatDate(record.vaccinationDate, 'YYYY年MM月DD日')}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400">生产厂家：</span>
                              <span className="text-slate-700 font-medium">{record.manufacturer || '-'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">疫苗批号：</span>
                              <span className="text-slate-700 font-medium">{record.batchNumber || '-'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">反应程度：</span>
                              <span
                                className={`font-medium ${
                                  record.reactionSeverity === '无'
                                    ? 'text-mint-600'
                                    : record.reactionSeverity === '轻微'
                                    ? 'text-blue-600'
                                    : record.reactionSeverity === '中度'
                                    ? 'text-amber-600'
                                    : 'text-red-600'
                                }`}
                              >
                                {record.reactionSeverity}
                              </span>
                            </div>
                          </div>
                          {record.reaction && (
                            <p className="mt-2 text-xs text-slate-600">
                              <span className="text-slate-400">当日反应：</span>
                              {record.reaction}
                            </p>
                          )}

                          {(() => {
                            const diary = reactionDiaries.find((d) => d.vaccineRecordId === record.id);
                            if (!diary) return null;
                            return (
                              <div
                                className="mt-3 p-2.5 rounded-xl bg-gradient-to-r from-mint-50 to-coral-50 border border-mint-200 cursor-pointer hover:shadow-sm transition-all"
                                onClick={() => navigate(`/reaction-diary/${diary.id}`)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-mint-600" />
                                    <span className="text-xs font-medium text-mint-700">72小时反应观察日记</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-slate-500">
                                    {diary.status === '观察中'
                                      ? `${diary.logs.length}条记录`
                                      : diary.summary?.overallSeverity || '无反应'}
                                    <ExternalLink className="w-3.5 h-3.5 text-mint-500" />
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>

                    <div className="flex lg:flex-col gap-2 lg:min-w-[140px]">
                      {schedule.status === '待接种' && !record && (
                        <button
                          onClick={() => openRecordModal(schedule)}
                          className="btn-primary flex items-center justify-center gap-2 lg:w-full"
                        >
                          <Plus className="w-4 h-4" />
                          录入记录
                        </button>
                      )}
                      {schedule.status === '已错过' && (
                        <button
                          onClick={() => updateVaccineScheduleStatus(schedule.id, '已推迟')}
                          className="btn-outline lg:w-full"
                        >
                          标记为已推迟
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredSchedules.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-slate-500">没有找到符合条件的疫苗</p>
            </div>
          )}
        </div>
      </div>

      {showRecordModal && selectedSchedule && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-soft-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-mint-400 to-mint-500 p-6 text-white rounded-t-3xl flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-display">录入接种记录</h2>
                <p className="text-white/80 text-sm mt-1">
                  {selectedSchedule.vaccineName} · 第{selectedSchedule.doseNumber}剂
                </p>
              </div>
              <button
                onClick={() => {
                  setShowRecordModal(false);
                  setSelectedSchedule(null);
                }}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRecord} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="label-field">
                    <span className="text-red-400">*</span> 实际接种日期
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={recordForm.vaccinationDate}
                    max={getToday()}
                    onChange={(e) => setRecordForm({ ...recordForm, vaccinationDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label-field">
                    <span className="text-red-400">*</span> 接种部位
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="如：左上臂三角肌"
                    value={recordForm.site}
                    onChange={(e) => setRecordForm({ ...recordForm, site: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="label-field">
                    <span className="text-red-400">*</span> 生产厂家
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="如：北京生物、科兴等"
                    value={recordForm.manufacturer}
                    onChange={(e) => setRecordForm({ ...recordForm, manufacturer: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label-field">
                    <span className="text-red-400">*</span> 疫苗批号
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="请输入疫苗包装上的批号"
                    value={recordForm.batchNumber}
                    onChange={(e) => setRecordForm({ ...recordForm, batchNumber: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="label-field">接种医生（选填）</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="医生姓名或工号"
                    value={recordForm.doctor}
                    onChange={(e) => setRecordForm({ ...recordForm, doctor: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label-field">
                    <span className="text-red-400">*</span> 反应程度
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['无', '轻微', '中度', '严重'] as VaccineRecord['reactionSeverity'][]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRecordForm({ ...recordForm, reactionSeverity: s })}
                        className={`py-2 rounded-xl text-sm font-medium transition-all border-2 ${
                          recordForm.reactionSeverity === s
                            ? s === '无'
                              ? 'border-mint-400 bg-mint-50 text-mint-600'
                              : s === '轻微'
                              ? 'border-blue-400 bg-blue-50 text-blue-600'
                              : s === '中度'
                              ? 'border-amber-400 bg-amber-50 text-amber-600'
                              : 'border-red-400 bg-red-50 text-red-600'
                            : 'border-gray-100 bg-gray-50 text-slate-500 hover:border-slate-200'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="label-field">孩子当日反应详情</label>
                <textarea
                  className="input-field min-h-[90px] resize-none"
                  placeholder="如：轻微发热37.5℃，局部红肿，持续1天好转等..."
                  value={recordForm.reaction}
                  onChange={(e) => setRecordForm({ ...recordForm, reaction: e.target.value })}
                />
              </div>

              <div>
                <label className="label-field">备注</label>
                <textarea
                  className="input-field min-h-[70px] resize-none"
                  placeholder="其他需要记录的信息..."
                  value={recordForm.notes}
                  onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRecordModal(false);
                    setSelectedSchedule(null);
                  }}
                  className="flex-1 btn-outline"
                >
                  取消
                </button>
                <button type="submit" className="flex-1 btn-primary flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  保存记录
                </button>
              </div>
            </form>
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
