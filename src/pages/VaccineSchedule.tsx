import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  CalendarClock,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Apple,
  Pill,
  TreePine,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { VaccineSchedule as VaccineScheduleType, VaccineRecord } from '@/types';
import {
  formatDate,
  formatMonthAge,
  getDaysBetween,
  getToday,
  addDays,
} from '@/utils/dateUtils';
import VaccineKnowledgeCard from '@/components/VaccineKnowledgeCard';

type FilterType = 'all' | 'pending' | 'completed' | 'missed';
type CategoryType = 'all' | '一类' | '二类';

const ALLERGY_CATEGORY_CONFIG: Record<string, { icon: typeof Apple; color: string; bg: string; border: string }> = {
  '食物': { icon: Apple, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  '药物': { icon: Pill, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  '环境': { icon: TreePine, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
};

export default function VaccineSchedulePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    children,
    currentChildId,
    vaccineSchedules,
    vaccineRecords,
    reactionDiaries,
    allergyRecords,
    addVaccineRecord,
    postponeVaccineSchedule,
  } = useAppStore();

  const child = children.find((c) => c.id === currentChildId) || null;
  const currentVaccineSchedules = vaccineSchedules.filter((s) => s.childId === currentChildId);
  const currentVaccineRecords = vaccineRecords.filter((r) => r.childId === currentChildId);
  const currentAllergyRecords = allergyRecords.filter((r) => r.childId === currentChildId);

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

  const [showPostponeModal, setShowPostponeModal] = useState(false);
  const [postponeSchedule, setPostponeSchedule] = useState<VaccineScheduleType | null>(null);
  const [postponeForm, setPostponeForm] = useState({
    newDate: getToday(),
    reason: '生病',
  });

  const [highlightVaccineCode, setHighlightVaccineCode] = useState<string | null>(null);
  const [highlightInfo, setHighlightInfo] = useState<{ name: string; doses: number } | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const commonReasons = ['生病', '发热', '腹泻', '湿疹', '用药中', '其他原因'];

  useEffect(() => {
    if (!child) navigate('/child-info');
  }, [child, navigate]);

  useEffect(() => {
    const state = location.state as { highlightVaccineCode?: string } | null;
    const code = state?.highlightVaccineCode;
    if (!code) return;

    const matchingSchedules = currentVaccineSchedules.filter((s) => s.vaccineCode === code);
    if (matchingSchedules.length === 0) return;

    const vaccineName = matchingSchedules[0].vaccineName;
    setHighlightInfo({ name: vaccineName, doses: matchingSchedules.length });
    setHighlightVaccineCode(code);
    setFilter('all');
    setCategory('all');

    const handle = setTimeout(() => {
      const firstSchedule = matchingSchedules.sort((a, b) => a.doseNumber - b.doseNumber)[0];
      const element = cardRefs.current[firstSchedule.id];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 400);

    const clearHandle = setTimeout(() => {
      setHighlightVaccineCode(null);
      setHighlightInfo(null);
    }, 10000);

    return () => {
      clearTimeout(handle);
      clearTimeout(clearHandle);
    };
  }, [location.state, currentVaccineSchedules]);

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

  const openPostponeModal = (schedule: VaccineScheduleType) => {
    setPostponeSchedule(schedule);
    setPostponeForm({
      newDate: addDays(schedule.plannedDate, 7),
      reason: '生病',
    });
    setShowPostponeModal(true);
  };

  const handleSubmitPostpone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postponeSchedule) return;

    postponeVaccineSchedule(
      postponeSchedule.id,
      postponeForm.newDate,
      postponeForm.reason
    );

    setShowPostponeModal(false);
    setPostponeSchedule(null);
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
          {highlightInfo && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-mint-100 to-coral-100 rounded-xl border border-mint-200 animate-fade-in">
              <span className="text-lg">🎯</span>
              <span className="text-sm font-medium text-slate-700">
                已定位到 <strong className="text-mint-600">{highlightInfo.name}</strong>（共 {highlightInfo.doses} 剂），10 秒后取消高亮
              </span>
              <button
                onClick={() => {
                  setHighlightVaccineCode(null);
                  setHighlightInfo(null);
                }}
                className="ml-2 text-xs text-slate-500 hover:text-slate-700 px-2 py-0.5 rounded-lg hover:bg-white/60 transition-colors"
              >
                取消高亮
              </button>
            </div>
          )}
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

      {currentAllergyRecords.length > 0 && (
        <div className="card border-2 border-red-300 bg-gradient-to-br from-red-50 to-amber-50 animate-pulse-soft">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-red-700 flex items-center gap-2">
                ⚠️ 过敏原提醒
                <span className="text-xs font-normal text-red-500">接种前请务必告知医护</span>
              </h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {currentAllergyRecords.map((record) => {
                  const config = ALLERGY_CATEGORY_CONFIG[record.category];
                  const Icon = config?.icon || AlertTriangle;
                  return (
                    <span
                      key={record.id}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold ${config?.bg || 'bg-red-50'} ${config?.border || 'border-red-200'} border ${config?.color || 'text-red-600'}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {record.allergenName}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        <div className="absolute left-6 md:left-10 top-0 bottom-0 w-1 bg-gradient-to-b from-mint-200 via-coral-200 to-purple-200 rounded-full"></div>

        <div className="space-y-6">
          {filteredSchedules.map((schedule, index) => {
            const config = getStatusConfig(schedule);
            const StatusIcon = config.icon;
            const record = getRecordForSchedule(schedule.id);
            const isHighlighted = highlightVaccineCode === schedule.vaccineCode;

            return (
              <div
                key={schedule.id}
                ref={(el) => {
                  cardRefs.current[schedule.id] = el;
                }}
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

                <div
                  className={`card card-hover border-l-4 ${config.bg} ${
                    schedule.isAdjusted ? 'relative ring-2 ring-amber-300 ring-offset-2' : ''
                  } ${isHighlighted ? 'highlight-vaccine' : ''}`}
                >
                  {schedule.isAdjusted && (
                    <div className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold rounded-full shadow-md z-10">
                      <Sparkles className="w-3 h-3" />
                      已调整
                    </div>
                  )}
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
                          {schedule.isAdjusted && schedule.adjustedFrom ? (
                            <div className="flex items-center gap-2">
                              <span className="line-through text-slate-400 text-sm">
                                {formatDate(schedule.adjustedFrom, 'YYYY年MM月DD日')}
                              </span>
                              <ArrowRight className="w-3 h-3 text-amber-500" />
                              <span className="font-medium text-amber-600">
                                {formatDate(schedule.plannedDate, 'YYYY年MM月DD日')}
                              </span>
                            </div>
                          ) : (
                            formatDate(schedule.plannedDate, 'YYYY年MM月DD日')
                          )}
                        </div>
                      </div>

                      {schedule.isAdjusted && schedule.adjustReason && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-lg w-fit">
                          <CalendarClock className="w-3.5 h-3.5" />
                          <span>调整原因：{schedule.adjustReason}</span>
                        </div>
                      )}

                      {schedule.contraindications && (
                        <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-700">
                          <strong>⚠️ 禁忌症：</strong>
                          {schedule.contraindications}
                        </div>
                      )}

                      {currentAllergyRecords.length > 0 && (
                        <div className="mt-3 p-3 rounded-xl bg-red-50 border-2 border-red-200 text-xs">
                          <strong className="text-red-600 flex items-center gap-1 mb-2">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            宝宝过敏原（医护请注意）
                          </strong>
                          <div className="flex flex-wrap gap-1.5">
                            {currentAllergyRecords.map((record) => {
                              const config = ALLERGY_CATEGORY_CONFIG[record.category];
                              const Icon = config?.icon || AlertTriangle;
                              return (
                                <span
                                  key={record.id}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config?.bg || 'bg-red-50'} ${config?.border || 'border-red-200'} border ${config?.color || 'text-red-600'}`}
                                  title={record.reaction}
                                >
                                  <Icon className="w-3 h-3" />
                                  {record.allergenName}
                                </span>
                              );
                            })}
                          </div>
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
                      {(schedule.status === '待接种' || schedule.status === '已错过') && !record && (
                        <>
                          <button
                            onClick={() => openRecordModal(schedule)}
                            className="btn-primary flex items-center justify-center gap-2 lg:w-full"
                          >
                            <Plus className="w-4 h-4" />
                            录入记录
                          </button>
                          <button
                            onClick={() => openPostponeModal(schedule)}
                            className="btn-outline lg:w-full flex items-center justify-center gap-2"
                          >
                            <CalendarClock className="w-4 h-4" />
                            推迟接种
                          </button>
                        </>
                      )}
                      {schedule.status === '已推迟' && !record && (
                        <>
                          <button
                            onClick={() => openRecordModal(schedule)}
                            className="btn-primary flex items-center justify-center gap-2 lg:w-full"
                          >
                            <Plus className="w-4 h-4" />
                            录入记录
                          </button>
                          <button
                            onClick={() => openPostponeModal(schedule)}
                            className="btn-outline lg:w-full flex items-center justify-center gap-2"
                          >
                            <RotateCcw className="w-4 h-4" />
                            再次调整
                          </button>
                        </>
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

      {showPostponeModal && postponeSchedule && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-soft-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-amber-400 to-orange-400 p-6 text-white rounded-t-3xl flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-display flex items-center gap-2">
                  <CalendarClock className="w-6 h-6" />
                  调整接种计划
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  {postponeSchedule.vaccineName} · 第{postponeSchedule.doseNumber}剂
                </p>
              </div>
              <button
                onClick={() => {
                  setShowPostponeModal(false);
                  setPostponeSchedule(null);
                }}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPostpone} className="p-6 space-y-5">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
                <p className="text-sm text-amber-700">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                  推迟此针次后，系统将自动计算后续同疫苗针次的最小间隔日期并调整计划时间线。
                </p>
              </div>

              <div>
                <label className="label-field">当前计划日期</label>
                <div className="input-field bg-slate-50 text-slate-500 flex items-center gap-2">
                  <span className="line-through">{formatDate(postponeSchedule.plannedDate, 'YYYY年MM月DD日')}</span>
                </div>
              </div>

              <div>
                <label className="label-field">
                  <span className="text-red-400">*</span> 新的接种日期
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={postponeForm.newDate}
                  min={addDays(postponeSchedule.plannedDate, 1)}
                  onChange={(e) => setPostponeForm({ ...postponeForm, newDate: e.target.value })}
                  required
                />
                <p className="text-xs text-slate-400 mt-2">
                  请选择在原计划日期之后的日期
                </p>
              </div>

              <div>
                <label className="label-field">
                  <span className="text-red-400">*</span> 推迟原因
                </label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {commonReasons.map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setPostponeForm({ ...postponeForm, reason })}
                      className={`py-2 px-3 rounded-xl text-sm font-medium transition-all border-2 ${
                        postponeForm.reason === reason
                          ? 'border-amber-400 bg-amber-50 text-amber-600'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
                {postponeForm.reason === '其他原因' && (
                  <input
                    type="text"
                    className="input-field"
                    placeholder="请说明具体原因"
                    value={postponeForm.reason === '其他原因' ? '' : postponeForm.reason}
                    onChange={(e) => setPostponeForm({ ...postponeForm, reason: e.target.value || '其他原因' })}
                    required
                  />
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPostponeModal(false);
                    setPostponeSchedule(null);
                  }}
                  className="flex-1 btn-outline"
                >
                  取消
                </button>
                <button type="submit" className="flex-1 btn-primary bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  确认调整
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
