import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Thermometer,
  Droplets,
  Smile,
  Frown,
  Meh,
  Moon,
  Plus,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  Edit,
  Trash2,
  FileText,
  Syringe,
  Activity,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { VaccineReactionDiary, RednessLevel, MentalStatus, ReactionLogEntry } from '@/types';
import {
  formatDate,
  formatDateTime,
  formatTime,
  getHoursBetween,
  getToday,
} from '@/utils/dateUtils';

export default function ReactionDiaryPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    children,
    currentChildId,
    reactionDiaries,
    addReactionLog,
    updateReactionLog,
    deleteReactionLog,
    completeDiary,
  } = useAppStore();

  const child = children.find((c) => c.id === currentChildId) || null;
  const currentDiaries = reactionDiaries.filter((d) => d.childId === currentChildId);

  const [selectedDiary, setSelectedDiary] = useState<VaccineReactionDiary | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLog, setEditingLog] = useState<ReactionLogEntry | null>(null);
  const [logForm, setLogForm] = useState({
    timestamp: '',
    temperature: '' as string,
    rednessLevel: '' as RednessLevel | '',
    rednessSize: '',
    mentalStatus: '' as MentalStatus | '',
    otherSymptoms: '',
    notes: '',
  });

  useEffect(() => {
    if (!child) navigate('/child-info');
  }, [child, navigate]);

  useEffect(() => {
    if (id) {
      const diary = currentDiaries.find((d) => d.id === id);
      if (diary) {
        setSelectedDiary(diary);
      }
    }
  }, [id, currentDiaries]);

  useEffect(() => {
    if (selectedDiary) {
      const updated = currentDiaries.find((d) => d.id === selectedDiary.id);
      if (updated) {
        setSelectedDiary(updated);
      }
    }
  }, [reactionDiaries, selectedDiary?.id]);

  if (!child) return null;

  const activeDiaries = currentDiaries.filter((d) => d.status === '观察中');
  const completedDiaries = currentDiaries.filter((d) => d.status === '已结束');

  const getProgressPercent = (diary: VaccineReactionDiary) => {
    const totalHours = 72;
    const elapsed = getHoursBetween(diary.startTime, new Date().toISOString());
    return Math.min(Math.max((elapsed / totalHours) * 100, 0), 100);
  };

  const getRemainingHours = (diary: VaccineReactionDiary) => {
    const remaining = getHoursBetween(new Date().toISOString(), diary.endTime);
    if (remaining <= 0) return 0;
    return Math.ceil(remaining);
  };

  const openAddModal = () => {
    const now = new Date();
    now.setSeconds(0, 0);
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setLogForm({
      timestamp: localIso,
      temperature: '',
      rednessLevel: '',
      rednessSize: '',
      mentalStatus: '',
      otherSymptoms: '',
      notes: '',
    });
    setShowAddModal(true);
  };

  const openEditModal = (log: ReactionLogEntry) => {
    setEditingLog(log);
    const date = new Date(log.timestamp);
    const localIso = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setLogForm({
      timestamp: localIso,
      temperature: log.temperature?.toString() || '',
      rednessLevel: log.rednessLevel || '',
      rednessSize: log.rednessSize || '',
      mentalStatus: log.mentalStatus || '',
      otherSymptoms: log.otherSymptoms || '',
      notes: log.notes || '',
    });
    setShowAddModal(true);
  };

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDiary) return;

    const timestamp = new Date(logForm.timestamp).toISOString();

    const logData = {
      timestamp,
      temperature: logForm.temperature ? parseFloat(logForm.temperature) : undefined,
      rednessLevel: logForm.rednessLevel || undefined,
      rednessSize: logForm.rednessSize || undefined,
      mentalStatus: logForm.mentalStatus || undefined,
      otherSymptoms: logForm.otherSymptoms || undefined,
      notes: logForm.notes || undefined,
    };

    if (editingLog) {
      updateReactionLog(selectedDiary.id, editingLog.id, logData);
    } else {
      addReactionLog(selectedDiary.id, logData as any);
    }

    setShowAddModal(false);
    setEditingLog(null);
  };

  const handleDeleteLog = (logId: string) => {
    if (!selectedDiary) return;
    if (window.confirm('确定要删除这条记录吗？')) {
      deleteReactionLog(selectedDiary.id, logId);
    }
  };

  const handleCompleteDiary = () => {
    if (!selectedDiary) return;
    if (window.confirm('确定要结束观察并生成反应小结吗？')) {
      completeDiary(selectedDiary.id);
    }
  };

  const getTemperatureColor = (temp?: number) => {
    if (!temp) return 'text-slate-400';
    if (temp >= 39) return 'text-red-500';
    if (temp >= 38) return 'text-orange-500';
    if (temp >= 37.5) return 'text-amber-500';
    return 'text-mint-500';
  };

  const getRednessColor = (level?: RednessLevel) => {
    switch (level) {
      case '严重': return 'text-red-500';
      case '中度': return 'text-orange-500';
      case '轻微': return 'text-amber-500';
      default: return 'text-slate-400';
    }
  };

  const getMentalIcon = (status?: MentalStatus) => {
    switch (status) {
      case '良好': return Smile;
      case '一般': return Meh;
      case '较差': return Frown;
      case '嗜睡': return Moon;
      default: return Meh;
    }
  };

  const getMentalColor = (status?: MentalStatus) => {
    switch (status) {
      case '良好': return 'text-mint-500';
      case '一般': return 'text-amber-500';
      case '较差': return 'text-orange-500';
      case '嗜睡': return 'text-red-500';
      default: return 'text-slate-400';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case '严重': return 'text-red-600 bg-red-100';
      case '中度': return 'text-orange-600 bg-orange-100';
      case '轻微': return 'text-amber-600 bg-amber-100';
      default: return 'text-mint-600 bg-mint-100';
    }
  };

  const renderDiaryCard = (diary: VaccineReactionDiary, index: number) => {
    const isActive = diary.status === '观察中';
    const progress = getProgressPercent(diary);
    const remaining = getRemainingHours(diary);

    return (
      <div
        key={diary.id}
        className={`card card-hover cursor-pointer animate-fade-in-up ${
          selectedDiary?.id === diary.id ? 'ring-2 ring-mint-400' : ''
        }`}
        style={{ animationDelay: `${index * 50}ms` }}
        onClick={() => {
          setSelectedDiary(diary);
          navigate(`/reaction-diary/${diary.id}`);
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isActive ? 'bg-gradient-to-br from-coral-100 to-coral-200' : 'bg-gradient-to-br from-mint-100 to-mint-200'
            }`}>
              <Syringe className={`w-6 h-6 ${isActive ? 'text-coral-600' : 'text-mint-600'}`} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">{diary.vaccineName}</h3>
              <p className="text-sm text-slate-500">第{diary.doseNumber}剂</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            isActive ? 'bg-coral-100 text-coral-600 animate-pulse-soft' : 'bg-mint-100 text-mint-600'
          }`}>
            {isActive ? '观察中' : '已结束'}
          </span>
        </div>

        <div className="text-sm text-slate-500 mb-3">
          接种日期：{formatDate(diary.vaccinationDate, 'YYYY年MM月DD日')}
        </div>

        {isActive ? (
          <>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-mint-400 to-coral-400 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">已观察 {progress.toFixed(0)}%</span>
              <span className="text-coral-500 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                还剩 {remaining} 小时
              </span>
            </div>
          </>
        ) : (
          diary.summary && (
            <div className={`p-3 rounded-xl ${getSeverityColor(diary.summary.overallSeverity)}`}>
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                总体反应：{diary.summary.overallSeverity}
              </div>
            </div>
          )
        )}

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
          <span className="text-slate-400 flex items-center gap-1">
            <Activity className="w-4 h-4" />
            {diary.logs.length} 条记录
          </span>
          <span className="text-mint-500 font-medium">查看详情 →</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-4">
        {selectedDiary && (
          <button
            onClick={() => {
              setSelectedDiary(null);
              navigate('/reaction-diary');
            }}
            className="w-10 h-10 rounded-xl bg-white shadow-soft flex items-center justify-center text-slate-500 hover:text-mint-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-3xl font-display text-slate-800 flex items-center gap-3">
            <span className="text-4xl">📝</span>
            {selectedDiary ? '反应观察日记' : '接种反应日记'}
          </h1>
          <p className="text-slate-500 mt-1">
            {selectedDiary
              ? `${selectedDiary.vaccineName} 第${selectedDiary.doseNumber}剂 · 72小时观察记录`
              : '记录和追踪宝宝接种疫苗后的反应情况'}
          </p>
        </div>
      </div>

      {!selectedDiary ? (
        <div className="space-y-6">
          {activeDiaries.length > 0 && (
            <div>
              <h2 className="text-xl font-display text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-coral-400 animate-pulse-soft" />
                正在观察 ({activeDiaries.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeDiaries.map((diary, idx) => renderDiaryCard(diary, idx))}
              </div>
            </div>
          )}

          {completedDiaries.length > 0 && (
            <div>
              <h2 className="text-xl font-display text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-mint-400" />
                已完成 ({completedDiaries.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedDiaries.map((diary, idx) => renderDiaryCard(diary, idx))}
              </div>
            </div>
          )}

          {currentDiaries.length === 0 && (
            <div className="card text-center py-16">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-slate-500 text-lg">暂无反应观察日记</p>
              <p className="text-slate-400 text-sm mt-2">
                完成疫苗接种记录后，系统会自动创建72小时反应观察卡片
              </p>
              <button
                onClick={() => navigate('/vaccine-schedule')}
                className="btn-primary mt-6"
              >
                去查看疫苗接种
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-display text-slate-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-coral-500" />
                  观察时间线
                </h3>
                {selectedDiary.status === '观察中' && (
                  <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    添加记录
                  </button>
                )}
              </div>

              {selectedDiary.logs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">📝</div>
                  <p className="text-slate-500">还没有记录</p>
                  <p className="text-slate-400 text-sm mt-1">
                    点击上方按钮开始记录宝宝的反应
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-mint-200 via-coral-200 to-purple-200 rounded-full" />

                  <div className="space-y-4">
                    {selectedDiary.logs.map((log, index) => {
                      const hoursAfter = getHoursBetween(selectedDiary.startTime, log.timestamp);
                      const MentalIcon = getMentalIcon(log.mentalStatus);

                      return (
                        <div
                          key={log.id}
                          className="relative pl-12 animate-fade-in-up"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="absolute left-2 top-4 w-6 h-6 rounded-full bg-white border-2 border-mint-300 flex items-center justify-center z-10 shadow-sm">
                            <div className="w-2 h-2 rounded-full bg-mint-400" />
                          </div>

                          <div className="bg-slate-50 rounded-2xl p-4 hover:bg-slate-100/80 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-slate-700">
                                  {formatDateTime(log.timestamp)}
                                </span>
                                <span className="text-xs text-coral-500 bg-coral-50 px-2 py-0.5 rounded-full">
                                  接种后 {hoursAfter.toFixed(1)}h
                                </span>
                              </div>
                              {selectedDiary.status === '观察中' && (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => openEditModal(log)}
                                    className="w-8 h-8 rounded-lg hover:bg-white text-slate-400 hover:text-mint-500 flex items-center justify-center transition-colors"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLog(log.id)}
                                    className="w-8 h-8 rounded-lg hover:bg-white text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {log.temperature !== undefined && (
                                <div className="flex items-center gap-2">
                                  <div className={`w-8 h-8 rounded-lg bg-white flex items-center justify-center ${getTemperatureColor(log.temperature)}`}>
                                    <Thermometer className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-400">体温</p>
                                    <p className={`font-medium ${getTemperatureColor(log.temperature)}`}>
                                      {log.temperature}℃
                                    </p>
                                  </div>
                                </div>
                              )}

                              {log.rednessLevel && (
                                <div className="flex items-center gap-2">
                                  <div className={`w-8 h-8 rounded-lg bg-white flex items-center justify-center ${getRednessColor(log.rednessLevel)}`}>
                                    <Droplets className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-400">红肿</p>
                                    <p className={`font-medium ${getRednessColor(log.rednessLevel)}`}>
                                      {log.rednessLevel}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {log.mentalStatus && (
                                <div className="flex items-center gap-2">
                                  <div className={`w-8 h-8 rounded-lg bg-white flex items-center justify-center ${getMentalColor(log.mentalStatus)}`}>
                                    <MentalIcon className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-400">精神</p>
                                    <p className={`font-medium ${getMentalColor(log.mentalStatus)}`}>
                                      {log.mentalStatus}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {log.rednessSize && (
                              <p className="text-sm text-slate-500 mt-2">
                                红肿范围：{log.rednessSize}
                              </p>
                            )}

                            {log.otherSymptoms && (
                              <div className="mt-2 p-2 rounded-lg bg-amber-50 text-amber-700 text-sm">
                                <span className="font-medium">其他症状：</span>
                                {log.otherSymptoms}
                              </div>
                            )}

                            {log.notes && (
                              <p className="text-sm text-slate-500 mt-2 italic">
                                💬 {log.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-display text-slate-800 mb-4 flex items-center gap-2">
                <Syringe className="w-5 h-5 text-mint-500" />
                观察概览
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">疫苗名称</p>
                  <p className="font-medium text-slate-800">{selectedDiary.vaccineName}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">剂次</p>
                    <p className="font-medium text-slate-800">第{selectedDiary.doseNumber}剂</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">状态</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      selectedDiary.status === '观察中'
                        ? 'bg-coral-100 text-coral-600'
                        : 'bg-mint-100 text-mint-600'
                    }`}>
                      {selectedDiary.status}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">接种日期</p>
                  <p className="font-medium text-slate-800">
                    {formatDate(selectedDiary.vaccinationDate, 'YYYY年MM月DD日')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">观察周期</p>
                  <p className="font-medium text-slate-800">72小时</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">记录条数</p>
                  <p className="font-medium text-slate-800">{selectedDiary.logs.length} 条</p>
                </div>
              </div>
            </div>

            {selectedDiary.status === '观察中' && (
              <div className="card bg-gradient-to-br from-coral-50 to-mint-50">
                <h3 className="text-lg font-display text-slate-800 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-coral-500" />
                  观察进度
                </h3>
                <div className="w-full h-3 bg-white/60 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-mint-400 to-coral-400 rounded-full transition-all duration-500"
                    style={{ width: `${getProgressPercent(selectedDiary)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{getProgressPercent(selectedDiary).toFixed(0)}%</span>
                  <span className="text-coral-600 font-medium">
                    还剩 {getRemainingHours(selectedDiary)} 小时
                  </span>
                </div>

                {getProgressPercent(selectedDiary) >= 100 && (
                  <button
                    onClick={handleCompleteDiary}
                    className="w-full btn-primary mt-4 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    结束观察，生成小结
                  </button>
                )}
              </div>
            )}

            {selectedDiary.status === '已结束' && selectedDiary.summary && (
              <div className="card">
                <h3 className="text-lg font-display text-slate-800 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-mint-500" />
                  反应小结
                </h3>

                <div className="space-y-4">
                  <div className={`p-4 rounded-2xl ${getSeverityColor(selectedDiary.summary.overallSeverity)}`}>
                    <p className="text-sm font-medium mb-1">总体反应程度</p>
                    <p className="text-2xl font-bold">{selectedDiary.summary.overallSeverity}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {selectedDiary.summary.maxTemperature && (
                      <div className="p-3 rounded-xl bg-slate-50">
                        <p className="text-xs text-slate-400 mb-1">最高体温</p>
                        <p className={`font-bold ${getTemperatureColor(selectedDiary.summary.maxTemperature)}`}>
                          {selectedDiary.summary.maxTemperature}℃
                        </p>
                      </div>
                    )}
                    {selectedDiary.summary.maxRednessLevel && (
                      <div className="p-3 rounded-xl bg-slate-50">
                        <p className="text-xs text-slate-400 mb-1">最严重红肿</p>
                        <p className={`font-bold ${getRednessColor(selectedDiary.summary.maxRednessLevel)}`}>
                          {selectedDiary.summary.maxRednessLevel}
                        </p>
                      </div>
                    )}
                    {selectedDiary.summary.worstMentalStatus && (
                      <div className="p-3 rounded-xl bg-slate-50">
                        <p className="text-xs text-slate-400 mb-1">最差精神</p>
                        <p className={`font-bold ${getMentalColor(selectedDiary.summary.worstMentalStatus)}`}>
                          {selectedDiary.summary.worstMentalStatus}
                        </p>
                      </div>
                    )}
                    <div className="p-3 rounded-xl bg-slate-50">
                      <p className="text-xs text-slate-400 mb-1">症状数</p>
                      <p className="font-bold text-slate-700">
                        {selectedDiary.summary.symptomCount} 项
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-mint-50 border border-mint-100">
                    <p className="text-sm font-medium text-mint-700 mb-2 flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      小结
                    </p>
                    <p className="text-sm text-mint-800">{selectedDiary.summary.conclusion}</p>
                  </div>

                  <p className="text-xs text-slate-400 text-center">
                    完成于 {formatDateTime(selectedDiary.summary.completedAt)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-soft-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-coral-400 to-mint-400 p-6 text-white rounded-t-3xl flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-display">
                  {editingLog ? '编辑记录' : '添加反应记录'}
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  {selectedDiary?.vaccineName} · 第{selectedDiary?.doseNumber}剂
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingLog(null);
                }}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLog} className="p-6 space-y-5">
              <div>
                <label className="label-field">
                  <span className="text-red-400">*</span> 记录时间
                </label>
                <input
                  type="datetime-local"
                  className="input-field"
                  value={logForm.timestamp}
                  onChange={(e) => setLogForm({ ...logForm, timestamp: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="label-field">体温 (℃)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="input-field"
                    placeholder="如：36.5"
                    value={logForm.temperature}
                    onChange={(e) => setLogForm({ ...logForm, temperature: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label-field">局部红肿程度</label>
                  <select
                    className="input-field"
                    value={logForm.rednessLevel}
                    onChange={(e) => setLogForm({ ...logForm, rednessLevel: e.target.value as RednessLevel | '' })}
                  >
                    <option value="">请选择</option>
                    <option value="无">无</option>
                    <option value="轻微">轻微</option>
                    <option value="中度">中度</option>
                    <option value="严重">严重</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label-field">红肿范围描述</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="如：直径约2cm硬结，轻微发红"
                  value={logForm.rednessSize}
                  onChange={(e) => setLogForm({ ...logForm, rednessSize: e.target.value })}
                />
              </div>

              <div>
                <label className="label-field">精神状态</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['良好', '一般', '较差', '嗜睡'] as MentalStatus[]).map((s) => {
                    const Icon = getMentalIcon(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setLogForm({ ...logForm, mentalStatus: s })}
                        className={`py-3 rounded-xl text-sm font-medium transition-all border-2 flex flex-col items-center gap-1 ${
                          logForm.mentalStatus === s
                            ? s === '良好'
                              ? 'border-mint-400 bg-mint-50 text-mint-600'
                              : s === '一般'
                              ? 'border-amber-400 bg-amber-50 text-amber-600'
                              : s === '较差'
                              ? 'border-orange-400 bg-orange-50 text-orange-600'
                              : 'border-red-400 bg-red-50 text-red-600'
                            : 'border-gray-100 bg-gray-50 text-slate-500 hover:border-slate-200'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="label-field">其他症状</label>
                <textarea
                  className="input-field min-h-[80px] resize-none"
                  placeholder="如：哭闹、食欲不振、呕吐、腹泻等..."
                  value={logForm.otherSymptoms}
                  onChange={(e) => setLogForm({ ...logForm, otherSymptoms: e.target.value })}
                />
              </div>

              <div>
                <label className="label-field">备注</label>
                <textarea
                  className="input-field min-h-[70px] resize-none"
                  placeholder="其他需要记录的信息..."
                  value={logForm.notes}
                  onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingLog(null);
                  }}
                  className="flex-1 btn-outline"
                >
                  取消
                </button>
                <button type="submit" className="flex-1 btn-primary flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  {editingLog ? '保存修改' : '保存记录'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
