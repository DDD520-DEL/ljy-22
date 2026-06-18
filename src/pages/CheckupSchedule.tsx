import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  X,
  Stethoscope,
  Ruler,
  Scale,
  Brain,
  Sparkles,
  AlertCircle,
  FileText,
  Heart,
  Target,
  AlertOctagon,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { CheckupSchedule as CheckupScheduleType, CheckupRecord, CheckupItem } from '@/types';
import {
  formatDate,
  formatMonthAge,
  getDaysBetween,
  getToday,
  calculateMonthAge,
  addDays,
} from '@/utils/dateUtils';
import {
  MILESTONE_CHECKLISTS,
  getNearestMilestoneChecklist,
  getMilestoneChecklist,
} from '@/data/milestones';
import MilestoneAssessmentForm from '@/components/MilestoneAssessmentForm';

type FilterType = 'all' | 'pending' | 'completed' | 'missed';

export default function CheckupSchedulePage() {
  const navigate = useNavigate();
  const {
    children,
    currentChildId,
    checkupSchedules,
    checkupRecords,
    addCheckupRecord,
    addAbnormalItems,
    abnormalItems,
    milestoneAssessments,
    saveMilestoneAssessment,
    deleteMilestoneAssessment,
  } = useAppStore();

  const child = children.find((c) => c.id === currentChildId) || null;
  const currentCheckupSchedules = checkupSchedules.filter((s) => s.childId === currentChildId);
  const currentCheckupRecords = checkupRecords.filter((r) => r.childId === currentChildId);
  const currentMilestoneAssessments = milestoneAssessments.filter((a) => a.childId === currentChildId);

  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedSchedule, setSelectedSchedule] = useState<CheckupScheduleType | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [recordForm, setRecordForm] = useState<Omit<CheckupRecord, 'id' | 'childId' | 'createdAt' | 'scheduleId' | 'monthAge'>>({
    checkupDate: getToday(),
    weight: undefined,
    height: undefined,
    headCircumference: undefined,
    bmi: '',
    development: '',
    itemsResult: '',
    doctorAdvice: '',
    notes: '',
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [stageOverride, setStageOverride] = useState<number | null>(null);
  const [showMilestone, setShowMilestone] = useState(false);
  const [abnormalSelections, setAbnormalSelections] = useState<Record<string, { checked: boolean; detail: string }>>({});

  useEffect(() => {
    if (!child) navigate('/child-info');
  }, [child, navigate]);

  useEffect(() => {
    setStageOverride(null);
  }, [currentChildId]);

  if (!child) return null;

  const currentMonthAge = calculateMonthAge(child.birthDate);
  const nearestChecklist = getNearestMilestoneChecklist(currentMonthAge);
  const activeChecklistMonthAge = stageOverride ?? nearestChecklist.monthAge;
  const activeChecklist = getMilestoneChecklist(activeChecklistMonthAge) ?? nearestChecklist;
  const existingAssessment = currentMilestoneAssessments.find(
    (a) => a.checklistMonthAge === activeChecklist.monthAge
  );
  const nearestMonthAgeDiff = Math.abs(currentMonthAge - nearestChecklist.monthAge);

  const today = getToday();

  const filteredSchedules = currentCheckupSchedules.filter((s) => {
    if (filter === 'pending') return s.status === '待体检';
    if (filter === 'completed') return s.status === '已体检';
    if (filter === 'missed') return s.status === '已错过';
    return true;
  });

  const getStatusConfig = (schedule: CheckupScheduleType) => {
    const daysToDue = getDaysBetween(today, schedule.plannedDate);
    switch (schedule.status) {
      case '已体检':
        return {
          bg: 'bg-mint-50 border-mint-200',
          badge: 'bg-mint-100 text-mint-600',
          icon: CheckCircle,
          label: '已完成',
        };
      case '已错过':
        return {
          bg: 'bg-red-50 border-red-200',
          badge: 'bg-red-100 text-red-600',
          icon: AlertTriangle,
          label: '已错过',
        };
      default:
        if (daysToDue < 0) {
          return {
            bg: 'bg-red-50 border-red-200',
            badge: 'bg-red-100 text-red-600',
            icon: AlertTriangle,
            label: '已过期',
          };
        }
        if (daysToDue <= 3) {
          return {
            bg: 'bg-coral-50 border-coral-200',
            badge: 'bg-coral-100 text-coral-600 animate-pulse-soft',
            icon: AlertCircle,
            label: daysToDue === 0 ? '今天' : `${daysToDue}天后`,
          };
        }
        return {
          bg: 'bg-white border-slate-200',
          badge: 'bg-slate-100 text-slate-500',
          icon: Clock,
          label: `${daysToDue}天后`,
        };
    }
  };

  const openRecordModal = (schedule: CheckupScheduleType) => {
    setSelectedSchedule(schedule);
    const existing = currentCheckupRecords.find((r) => r.scheduleId === schedule.id);
    setRecordForm({
      checkupDate: getToday(),
      weight: existing?.weight,
      height: existing?.height,
      headCircumference: existing?.headCircumference,
      bmi: existing?.bmi || '',
      development: existing?.development || '',
      itemsResult: existing?.itemsResult || '',
      doctorAdvice: existing?.doctorAdvice || '',
      notes: existing?.notes || '',
    });
    setAbnormalSelections({});
    setShowRecordModal(true);
  };

  const handleSubmitRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule) return;

    const newRecord = addCheckupRecord({
      ...recordForm,
      scheduleId: selectedSchedule.id,
      monthAge: selectedSchedule.monthAge,
    });

    const abnormalEntries = Object.entries(abnormalSelections).filter(
      ([, v]) => v.checked && v.detail.trim()
    );
    if (abnormalEntries.length > 0 && newRecord) {
      const recheckDate = addDays(recordForm.checkupDate, 30);
      const items = abnormalEntries.map(([itemName, v]) => {
        const matchedItem = selectedSchedule.items.find((i) => i.name === itemName);
        return {
          checkupRecordId: newRecord.id,
          itemName,
          category: (matchedItem?.category || '其他') as CheckupItem['category'],
          abnormalDetail: v.detail.trim(),
          status: '待复查' as const,
          recheckRemindDate: recheckDate,
        };
      });
      addAbnormalItems(items);
    }

    setShowRecordModal(false);
    setSelectedSchedule(null);
  };

  const getRecordForSchedule = (scheduleId: string) => {
    return currentCheckupRecords.find((r) => r.scheduleId === scheduleId);
  };

  const categoryIcons: Record<string, typeof Heart> = {
    '体格测量': Ruler,
    '全身检查': Heart,
    '发育评估': Brain,
    '辅助检查': FileText,
    '其他': Sparkles,
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display text-slate-800 flex items-center gap-3">
            <span className="text-4xl">🏥</span>
            儿保体检时间表
          </h1>
          <p className="text-slate-500 mt-1">
            按国家儿童保健规范，共 {currentCheckupSchedules.length} 次体检
          </p>
        </div>

        <div className="flex bg-white rounded-xl p-1 shadow-soft border border-slate-100">
          {[
            { key: 'all' as FilterType, label: '全部' },
            { key: 'pending' as FilterType, label: '待体检' },
            { key: 'completed' as FilterType, label: '已完成' },
            { key: 'missed' as FilterType, label: '已错过' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-all ${
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

      <div className="card border-2 border-purple-100 bg-gradient-to-br from-purple-50/50 to-white overflow-hidden">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setShowMilestone((v) => !v)}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-soft">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                发育里程碑评估
                {existingAssessment && (
                  <span className="status-badge bg-mint-100 text-mint-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    已评估 · {existingAssessment.totalScore}分
                  </span>
                )}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                宝宝当前 {formatMonthAge(currentMonthAge)}
                {nearestMonthAgeDiff > 0 && (
                  <span className="text-purple-500"> · 匹配 {formatMonthAge(activeChecklist.monthAge)} 自查表</span>
                )}
                ，逐项勾选宝宝已掌握的能力
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={activeChecklist.monthAge}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setStageOverride(Number(e.target.value))}
              className="px-3 py-1.5 rounded-lg border-2 border-slate-100 bg-white text-sm text-slate-600 focus:border-purple-300 outline-none cursor-pointer"
            >
              {MILESTONE_CHECKLISTS.map((c) => (
                <option key={c.monthAge} value={c.monthAge}>
                  {formatMonthAge(c.monthAge)} 自查表
                </option>
              ))}
            </select>
            <span className="text-slate-400 text-sm px-2">
              {showMilestone ? '收起 ▲' : '展开 ▼'}
            </span>
          </div>
        </div>

        {showMilestone && (
          <div className="mt-6 pt-6 border-t border-purple-100 animate-fade-in">
            <MilestoneAssessmentForm
              key={activeChecklist.monthAge}
              checklist={activeChecklist}
              childMonthAge={currentMonthAge}
              existing={existingAssessment}
              onSave={saveMilestoneAssessment}
              onDelete={deleteMilestoneAssessment}
            />
          </div>
        )}
      </div>

      <div className="grid gap-6">
        {filteredSchedules.map((schedule, index) => {
          const config = getStatusConfig(schedule);
          const StatusIcon = config.icon;
          const record = getRecordForSchedule(schedule.id);
          const isExpanded = expandedId === schedule.id;

          return (
            <div
              key={schedule.id}
              className={`card card-hover border-2 ${config.bg} animate-fade-in-up`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex flex-col lg:flex-row gap-4">
                <div
                  className="w-full lg:w-48 flex-shrink-0 flex lg:flex-col items-center lg:items-start gap-4 p-4 rounded-2xl bg-white/60"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-soft ${
                      schedule.status === '已体检'
                        ? 'bg-gradient-to-br from-mint-300 to-mint-500'
                        : 'bg-gradient-to-br from-coral-300 to-coral-500'
                    }`}
                  >
                    <Stethoscope className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 lg:flex-none lg:w-full text-center lg:text-left">
                    <p className="text-2xl font-bold gradient-text">{formatMonthAge(schedule.monthAge)}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatDate(schedule.plannedDate, 'YYYY年MM月DD日')}
                    </p>
                    <span className={`status-badge ${config.badge} mt-2`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {config.label}
                    </span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">
                        {formatMonthAge(schedule.monthAge)} 儿童保健体检
                      </h3>
                      {schedule.milestones.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {schedule.milestones.slice(0, 4).map((m, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-full text-xs bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 border border-purple-100"
                            >
                              ✨ {m}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {schedule.status === '待体检' && !record && (
                      <button
                        onClick={() => openRecordModal(schedule)}
                        className="btn-primary flex items-center gap-2 flex-shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        录入记录
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                      <div className="flex items-center gap-1.5 text-blue-600 text-xs font-medium mb-1">
                        <Scale className="w-3.5 h-3.5" />
                        项目数
                      </div>
                      <p className="text-xl font-bold text-blue-700">{schedule.items.length}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-mint-50 border border-mint-100">
                      <div className="flex items-center gap-1.5 text-mint-600 text-xs font-medium mb-1">
                        <Ruler className="w-3.5 h-3.5" />
                        体格测量
                      </div>
                      <p className="text-xl font-bold text-mint-700">
                        {schedule.items.filter((i) => i.category === '体格测量').length}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-coral-50 border border-coral-100">
                      <div className="flex items-center gap-1.5 text-coral-600 text-xs font-medium mb-1">
                        <Heart className="w-3.5 h-3.5" />
                        全身检查
                      </div>
                      <p className="text-xl font-bold text-coral-700">
                        {schedule.items.filter((i) => i.category === '全身检查').length}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                      <div className="flex items-center gap-1.5 text-purple-600 text-xs font-medium mb-1">
                        <Brain className="w-3.5 h-3.5" />
                        发育评估
                      </div>
                      <p className="text-xl font-bold text-purple-700">
                        {schedule.items.filter((i) => i.category === '发育评估').length}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                      <div className="flex items-center gap-1.5 text-amber-600 text-xs font-medium mb-1">
                        <FileText className="w-3.5 h-3.5" />
                        辅助检查
                      </div>
                      <p className="text-xl font-bold text-amber-700">
                        {schedule.items.filter((i) => i.category === '辅助检查').length}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : schedule.id)}
                    className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-sm text-slate-600 flex items-center justify-between"
                  >
                    <span className="font-medium">
                      {isExpanded ? '收起' : '查看'} 详细体检项目和注意事项
                    </span>
                    <span className="text-xs">{isExpanded ? '▲' : '▼'}</span>
                  </button>

                  {isExpanded && (
                    <div className="mt-4 p-5 rounded-2xl bg-white border border-slate-100 animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                            <span className="text-lg">📋</span>
                            体检项目明细
                          </h4>
                          <div className="space-y-2">
                            {schedule.items.map((item, i) => {
                              const CatIcon = categoryIcons[item.category] || Sparkles;
                              return (
                                <div
                                  key={i}
                                  className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 hover:bg-white transition-colors"
                                >
                                  <CatIcon className="w-4 h-4 text-coral-500 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="font-medium text-sm text-slate-700">{item.name}</p>
                                    <p className="text-xs text-slate-500">{item.description}</p>
                                  </div>
                                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-white text-slate-500 flex-shrink-0">
                                    {item.category}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                            <span className="text-lg">🌟</span>
                            发育里程碑
                          </h4>
                          <div className="flex flex-wrap gap-2 mb-5">
                            {schedule.milestones.map((m, i) => (
                              <div
                                key={i}
                                className="px-3 py-2 rounded-xl bg-gradient-to-r from-mint-50 to-coral-50 border border-mint-100 text-sm text-slate-700"
                              >
                                ✅ {m}
                              </div>
                            ))}
                          </div>

                          <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                            <span className="text-lg">💡</span>
                            温馨提示
                          </h4>
                          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 space-y-2">
                            {schedule.notes.split('；').map((note, i) => (
                              <p key={i} className="text-sm text-amber-800 flex items-start gap-2">
                                <span>•</span>
                                {note}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {record && (
                    <div className="mt-4 p-5 rounded-2xl bg-mint-50 border border-mint-200">
                      <p className="text-sm font-bold text-mint-600 mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        体检记录 · {formatDate(record.checkupDate, 'YYYY年MM月DD日')}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        {record.weight !== undefined && (
                          <div className="p-3 rounded-xl bg-white text-center">
                            <p className="text-xs text-slate-400">体重</p>
                            <p className="text-lg font-bold text-slate-700">
                              {record.weight} <span className="text-xs text-slate-400">kg</span>
                            </p>
                          </div>
                        )}
                        {record.height !== undefined && (
                          <div className="p-3 rounded-xl bg-white text-center">
                            <p className="text-xs text-slate-400">身高</p>
                            <p className="text-lg font-bold text-slate-700">
                              {record.height} <span className="text-xs text-slate-400">cm</span>
                            </p>
                          </div>
                        )}
                        {record.headCircumference !== undefined && (
                          <div className="p-3 rounded-xl bg-white text-center">
                            <p className="text-xs text-slate-400">头围</p>
                            <p className="text-lg font-bold text-slate-700">
                              {record.headCircumference} <span className="text-xs text-slate-400">cm</span>
                            </p>
                          </div>
                        )}
                        {record.bmi && (
                          <div className="p-3 rounded-xl bg-white text-center">
                            <p className="text-xs text-slate-400">BMI评价</p>
                            <p className="text-lg font-bold text-mint-600">{record.bmi}</p>
                          </div>
                        )}
                      </div>
                      {record.development && (
                        <p className="text-sm text-slate-600 mb-2">
                          <strong>发育评估：</strong>
                          {record.development}
                        </p>
                      )}
                      {record.doctorAdvice && (
                        <p className="text-sm text-slate-600">
                          <strong>医生建议：</strong>
                          {record.doctorAdvice}
                        </p>
                      )}
                      {(() => {
                        const relatedAbnormals = abnormalItems.filter(
                          (a) => a.checkupRecordId === record.id && a.status !== '已归档'
                        );
                        if (relatedAbnormals.length === 0) return null;
                        return (
                          <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200">
                            <p className="text-sm font-bold text-red-600 mb-3 flex items-center gap-2">
                              <AlertOctagon className="w-4 h-4" />
                              异常项追踪
                            </p>
                            <div className="space-y-2">
                              {relatedAbnormals.map((ab) => (
                                <div key={ab.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-red-100">
                                  <div>
                                    <span className="font-medium text-sm text-slate-700">{ab.itemName}</span>
                                    <span className="text-xs text-slate-400 ml-2">{ab.abnormalDetail}</span>
                                  </div>
                                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    ab.status === '待复查' ? 'bg-red-100 text-red-600' : 'bg-mint-100 text-mint-600'
                                  }`}>
                                    {ab.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredSchedules.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-slate-500">没有找到符合条件的体检记录</p>
          </div>
        )}
      </div>

      {showRecordModal && selectedSchedule && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-soft-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-coral-400 to-coral-500 p-6 text-white rounded-t-3xl flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-display">录入体检记录</h2>
                <p className="text-white/80 text-sm mt-1">
                  {formatMonthAge(selectedSchedule.monthAge)} 儿童保健体检
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
              <div>
                <label className="label-field">
                  <span className="text-red-400">*</span> 体检日期
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={recordForm.checkupDate}
                  max={getToday()}
                  onChange={(e) => setRecordForm({ ...recordForm, checkupDate: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label-field">体重 (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    placeholder="如：10.5"
                    value={recordForm.weight ?? ''}
                    onChange={(e) =>
                      setRecordForm({
                        ...recordForm,
                        weight: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="label-field">身高 (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="input-field"
                    placeholder="如：75.0"
                    value={recordForm.height ?? ''}
                    onChange={(e) =>
                      setRecordForm({
                        ...recordForm,
                        height: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="label-field">头围 (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="input-field"
                    placeholder="如：46.0"
                    value={recordForm.headCircumference ?? ''}
                    onChange={(e) =>
                      setRecordForm({
                        ...recordForm,
                        headCircumference: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="label-field">BMI评价</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="如：正常、偏瘦、偏胖等"
                  value={recordForm.bmi}
                  onChange={(e) => setRecordForm({ ...recordForm, bmi: e.target.value })}
                />
              </div>

              <div>
                <label className="label-field">发育评估结果</label>
                <textarea
                  className="input-field min-h-[80px] resize-none"
                  placeholder="大运动、精细动作、语言、社交等方面的评估..."
                  value={recordForm.development}
                  onChange={(e) => setRecordForm({ ...recordForm, development: e.target.value })}
                />
              </div>

              <div>
                <label className="label-field">各项体检结果</label>
                <textarea
                  className="input-field min-h-[80px] resize-none"
                  placeholder="视力、听力、心肺、血常规等检查结果..."
                  value={recordForm.itemsResult}
                  onChange={(e) => setRecordForm({ ...recordForm, itemsResult: e.target.value })}
                />
              </div>

              <div>
                <label className="label-field">医生建议</label>
                <textarea
                  className="input-field min-h-[80px] resize-none"
                  placeholder="医生给出的喂养、护理、发育指导建议..."
                  value={recordForm.doctorAdvice}
                  onChange={(e) => setRecordForm({ ...recordForm, doctorAdvice: e.target.value })}
                />
              </div>

              <div>
                <label className="label-field">备注</label>
                <textarea
                  className="input-field min-h-[60px] resize-none"
                  placeholder="其他需要记录的信息..."
                  value={recordForm.notes}
                  onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                />
              </div>

              <div className="p-5 rounded-2xl bg-red-50 border border-red-200">
                <div className="flex items-center gap-2 mb-3">
                  <AlertOctagon className="w-5 h-5 text-red-500" />
                  <h3 className="font-bold text-red-700">异常项标记</h3>
                  <span className="text-xs text-red-400">勾选需要复查的异常检查项</span>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {selectedSchedule.items.map((item, idx) => {
                    const sel = abnormalSelections[item.name];
                    const isChecked = sel?.checked || false;
                    return (
                      <div key={idx} className="rounded-xl bg-white border border-red-100 overflow-hidden">
                        <label className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-red-50/50 transition-colors">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-red-300 text-red-500 focus:ring-red-400 accent-red-500"
                            checked={isChecked}
                            onChange={(e) =>
                              setAbnormalSelections({
                                ...abnormalSelections,
                                [item.name]: { checked: e.target.checked, detail: sel?.detail || '' },
                              })
                            }
                          />
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-sm text-slate-700">{item.name}</span>
                            <span className="ml-2 text-xs text-slate-400">{item.category}</span>
                          </div>
                        </label>
                        {isChecked && (
                          <div className="px-4 pb-3">
                            <input
                              type="text"
                              className="input-field text-sm border-red-200 focus:border-red-400"
                              placeholder={`描述${item.name}的异常情况，如"血红蛋白偏低"…`}
                              value={sel?.detail || ''}
                              onChange={(e) =>
                                setAbnormalSelections({
                                  ...abnormalSelections,
                                  [item.name]: { checked: true, detail: e.target.value },
                                })
                              }
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {Object.values(abnormalSelections).some((v) => v.checked) && (
                  <p className="mt-3 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    已标记 {Object.values(abnormalSelections).filter((v) => v.checked).length} 项异常，保存后将自动生成复查提醒
                  </p>
                )}
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
    </div>
  );
}
