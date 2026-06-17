import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Syringe,
  Stethoscope,
  Search,
  Edit,
  Trash2,
  X,
  CheckCircle,
  Eye,
  ChevronDown,
  TrendingUp,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { VaccineRecord, CheckupRecord } from '@/types';
import {
  formatDate,
  formatMonthAge,
} from '@/utils/dateUtils';
import GrowthChart from '@/components/GrowthChart';
import type { GrowthMetric } from '@/data/growthStandards';
import { calculatePercentileRank, getGrowthData, getGrowthStatus } from '@/data/growthStandards';

type TabType = 'all' | 'vaccine' | 'checkup' | 'growth';
type CombinedRecord = (VaccineRecord | CheckupRecord) & { recordType: 'vaccine' | 'checkup' };

export default function RecordsPage() {
  const navigate = useNavigate();
  const {
    child,
    vaccineSchedules,
    checkupSchedules,
    vaccineRecords,
    checkupRecords,
    updateVaccineRecord,
    deleteVaccineRecord,
    updateCheckupRecord,
    deleteCheckupRecord,
  } = useAppStore();

  const [tab, setTab] = useState<TabType>('all');
  const [search, setSearch] = useState('');
  const [viewingRecord, setViewingRecord] = useState<CombinedRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<CombinedRecord | null>(null);
  const [editForm, setEditForm] = useState<Partial<VaccineRecord & CheckupRecord & { recordType?: string }>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [growthMetric, setGrowthMetric] = useState<GrowthMetric>('weight');
  const [growthMaxAge, setGrowthMaxAge] = useState<number>(84);

  useEffect(() => {
    if (!child) navigate('/child-info');
  }, [child, navigate]);

  const growthDataPoints = useMemo(() => {
    const points: { monthAge: number; value: number }[] = [];
    for (const record of checkupRecords) {
      let value: number | undefined;
      if (growthMetric === 'weight') value = record.weight;
      else if (growthMetric === 'height') value = record.height;
      else value = record.headCircumference;
      
      if (value !== undefined) {
        points.push({ monthAge: record.monthAge, value });
      }
    }
    return points.sort((a, b) => a.monthAge - b.monthAge);
  }, [checkupRecords, growthMetric]);

  if (!child) return null;

  const combinedRecords: CombinedRecord[] = [
    ...vaccineRecords.map((r) => ({ ...r, recordType: 'vaccine' as const })),
    ...checkupRecords.map((r) => ({ ...r, recordType: 'checkup' as const })),
  ].sort((a, b) => {
    const dateA = 'vaccinationDate' in a ? a.vaccinationDate : a.checkupDate;
    const dateB = 'vaccinationDate' in b ? b.vaccinationDate : b.checkupDate;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  const filteredRecords = combinedRecords.filter((r) => {
    if (tab === 'vaccine' && r.recordType !== 'vaccine') return false;
    if (tab === 'checkup' && r.recordType !== 'checkup') return false;
    if (search.trim()) {
      const keyword = search.trim().toLowerCase();
      if (r.recordType === 'vaccine') {
        const vr = r as VaccineRecord;
        return (
          vr.vaccineName.toLowerCase().includes(keyword) ||
          vr.manufacturer.toLowerCase().includes(keyword) ||
          vr.batchNumber.toLowerCase().includes(keyword)
        );
      } else {
        const cr = r as CheckupRecord;
        return (
          formatMonthAge(cr.monthAge).includes(keyword) ||
          (cr.development && cr.development.toLowerCase().includes(keyword)) ||
          (cr.doctorAdvice && cr.doctorAdvice.toLowerCase().includes(keyword))
        );
      }
    }
    return true;
  });

  const stats = {
    total: combinedRecords.length,
    vaccines: vaccineRecords.length,
    checkups: checkupRecords.length,
  };

  const openView = (record: CombinedRecord) => {
    setViewingRecord(record);
  };

  const openEdit = (record: CombinedRecord) => {
    setEditingRecord(record);
    if (record.recordType === 'vaccine') {
      setEditForm({ ...record });
    } else {
      setEditForm({ ...record });
    }
  };

  const handleDelete = (record: CombinedRecord) => {
    if (window.confirm('确定要删除这条记录吗？')) {
      if (record.recordType === 'vaccine') {
        deleteVaccineRecord(record.id);
      } else {
        deleteCheckupRecord(record.id);
      }
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    if (editingRecord.recordType === 'vaccine') {
      updateVaccineRecord(editingRecord.id, editForm);
    } else {
      updateCheckupRecord(editingRecord.id, editForm);
    }
    setEditingRecord(null);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display text-slate-800 flex items-center gap-3">
            <span className="text-4xl">📋</span>
            记录管理
          </h1>
          <p className="text-slate-500 mt-1">查看和管理所有疫苗接种和儿保体检记录</p>
        </div>

        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            className="input-field pl-12 pr-4 w-full md:w-72"
            placeholder="搜索疫苗名称、厂家、批号..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card card-hover">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center text-white text-2xl shadow-soft">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm text-slate-500">总记录数</p>
              <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="card card-hover">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-mint-200 to-mint-400 flex items-center justify-center text-white text-2xl shadow-soft">
              <Syringe className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm text-slate-500">接种记录</p>
              <p className="text-3xl font-bold text-slate-800">{stats.vaccines}</p>
            </div>
          </div>
        </div>
        <div className="card card-hover">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-coral-200 to-coral-400 flex items-center justify-center text-white text-2xl shadow-soft">
              <Stethoscope className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm text-slate-500">体检记录</p>
              <p className="text-3xl font-bold text-slate-800">{stats.checkups}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex bg-white rounded-xl p-1 shadow-soft border border-slate-100 w-fit flex-wrap">
        {[
          { key: 'all' as TabType, label: '全部记录', count: stats.total },
          { key: 'vaccine' as TabType, label: '接种记录', count: stats.vaccines, icon: Syringe },
          { key: 'checkup' as TabType, label: '体检记录', count: stats.checkups, icon: Stethoscope },
          { key: 'growth' as TabType, label: '成长曲线', icon: TrendingUp },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                tab === t.key
                  ? 'bg-gradient-to-r from-mint-400 to-coral-400 text-white'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {t.label}
              {t.count !== undefined && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    tab === t.key ? 'bg-white/20' : 'bg-slate-100'
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {tab === 'growth' ? (
        <div className="card animate-fade-in-up">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-display text-slate-800 flex items-center gap-2">
                <span className="text-2xl">📈</span>
                宝宝成长曲线图
              </h3>
              <p className="text-sm text-slate-500 mt-1">基于WHO儿童生长标准，实时追踪宝宝发育情况</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex bg-slate-100 rounded-lg p-1">
                {[
                  { key: 'weight' as GrowthMetric, label: '体重' },
                  { key: 'height' as GrowthMetric, label: '身高' },
                  { key: 'headCircumference' as GrowthMetric, label: '头围' },
                ].map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setGrowthMetric(m.key)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                      growthMetric === m.key
                        ? 'bg-white text-coral-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <div className="flex bg-slate-100 rounded-lg p-1">
                {[
                  { key: 24, label: '0-2岁' },
                  { key: 36, label: '0-3岁' },
                  { key: 60, label: '0-5岁' },
                  { key: 84, label: '0-7岁' },
                ].map((a) => (
                  <button
                    key={a.key}
                    onClick={() => setGrowthMaxAge(a.key)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      growthMaxAge === a.key
                        ? 'bg-white text-mint-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {growthDataPoints.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-slate-500">暂无成长数据</p>
              <p className="text-slate-400 text-sm mt-1">完成儿保体检记录后自动生成成长曲线</p>
              <button
                onClick={() => navigate('/checkup-schedule')}
                className="btn-primary mt-6"
              >
                去录入体检记录
              </button>
            </div>
          ) : (
            <>
              <GrowthChart
                metric={growthMetric}
                gender={child!.gender}
                dataPoints={growthDataPoints}
                maxMonthAge={growthMaxAge}
                height={360}
                showLegend={true}
              />

              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {growthDataPoints
                  .slice(-4)
                  .reverse()
                  .map((dp, idx) => {
                    const growthData = getGrowthData(growthMetric, child!.gender);
                    const percentile = calculatePercentileRank(dp.value, dp.monthAge, growthData);
                    const status = getGrowthStatus(percentile);
                    return (
                      <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-xs text-slate-400 mb-1">{formatMonthAge(dp.monthAge)}</div>
                        <div className="text-xl font-bold text-slate-700">
                          {dp.value}
                          <span className="text-xs font-normal text-slate-400 ml-1">
                            {growthMetric === 'weight' ? 'kg' : 'cm'}
                          </span>
                        </div>
                        <div className={`text-xs font-medium mt-1 ${status.color}`}>
                          P{percentile.toFixed(0)} · {status.label}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-slate-500">暂无记录</p>
            <p className="text-slate-400 text-sm mt-1">
              {search ? '没有找到匹配的记录，请尝试其他关键词' : '完成接种或体检后记得添加记录哦~'}
            </p>
            <div className="flex gap-3 justify-center mt-6">
              <button onClick={() => navigate('/vaccine-schedule')} className="btn-primary">
                去录入接种记录
              </button>
              <button onClick={() => navigate('/checkup-schedule')} className="btn-secondary">
                去录入体检记录
              </button>
            </div>
          </div>
        ) : (
          filteredRecords.map((record, index) => {
            const isExpanded = expandedId === record.id;
            const isVaccine = record.recordType === 'vaccine';
            const vr = isVaccine ? (record as VaccineRecord) : null;
            const cr = !isVaccine ? (record as CheckupRecord) : null;
            const date = isVaccine ? vr!.vaccinationDate : cr!.checkupDate;
            const relatedVaccineSchedule = isVaccine
              ? vaccineSchedules.find((s) => s.id === vr!.scheduleId)
              : undefined;
            const relatedCheckupSchedule = !isVaccine
              ? checkupSchedules.find((s) => s.id === cr!.scheduleId)
              : undefined;

            return (
              <div
                key={record.id}
                className="card card-hover overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div
                  className="flex items-center gap-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : record.id)}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      isVaccine
                        ? 'bg-gradient-to-br from-mint-100 to-mint-200'
                        : 'bg-gradient-to-br from-coral-100 to-coral-200'
                    }`}
                  >
                    {isVaccine ? (
                      <Syringe className="w-7 h-7 text-mint-600" />
                    ) : (
                      <Stethoscope className="w-7 h-7 text-coral-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span
                        className={`px-2.5 py-0.5 rounded text-xs font-medium ${
                          isVaccine
                            ? 'bg-mint-100 text-mint-700'
                            : 'bg-coral-100 text-coral-700'
                        }`}
                      >
                        {isVaccine ? '接种记录' : '体检记录'}
                      </span>
                      {relatedVaccineSchedule && isVaccine && (
                        <span className="text-xs text-slate-400">
                          {formatMonthAge(relatedVaccineSchedule.monthAge)} · 第{relatedVaccineSchedule.doseNumber}剂
                        </span>
                      )}
                      {relatedCheckupSchedule && !isVaccine && (
                        <span className="text-xs text-slate-400">
                          {formatMonthAge(relatedCheckupSchedule.monthAge)}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 truncate">
                      {isVaccine ? vr!.vaccineName : `${formatMonthAge(cr!.monthAge)} 儿童保健体检`}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {formatDate(date, 'YYYY年MM月DD日')}
                      {isVaccine && vr!.manufacturer && ` · ${vr!.manufacturer}`}
                      {!isVaccine && cr!.weight !== undefined && ` · 体重${cr!.weight}kg`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openView(record);
                      }}
                      className="w-10 h-10 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-500 flex items-center justify-center transition-colors"
                      title="查看详情"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(record);
                      }}
                      className="w-10 h-10 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-500 flex items-center justify-center transition-colors"
                      title="编辑"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(record);
                      }}
                      className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-5 pt-5 border-t border-slate-100 animate-fade-in">
                    {isVaccine ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 rounded-xl bg-mint-50">
                          <p className="text-xs text-mint-600 font-medium mb-1">生产厂家</p>
                          <p className="font-medium text-slate-700">{vr!.manufacturer || '-'}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-50">
                          <p className="text-xs text-blue-600 font-medium mb-1">疫苗批号</p>
                          <p className="font-medium text-slate-700">{vr!.batchNumber || '-'}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-coral-50">
                          <p className="text-xs text-coral-600 font-medium mb-1">接种部位</p>
                          <p className="font-medium text-slate-700">{vr!.site || '-'}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-purple-50">
                          <p className="text-xs text-purple-600 font-medium mb-1">反应程度</p>
                          <p className="font-medium text-slate-700">{vr!.reactionSeverity || '-'}</p>
                        </div>
                        {vr!.reaction && (
                          <div className="md:col-span-4 p-3 rounded-xl bg-amber-50">
                            <p className="text-xs text-amber-600 font-medium mb-1">当日反应详情</p>
                            <p className="text-sm text-slate-700">{vr!.reaction}</p>
                          </div>
                        )}
                        {vr!.notes && (
                          <div className="md:col-span-4 p-3 rounded-xl bg-slate-50">
                            <p className="text-xs text-slate-500 font-medium mb-1">备注</p>
                            <p className="text-sm text-slate-700">{vr!.notes}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {cr!.weight !== undefined && (
                          <div className="p-3 rounded-xl bg-blue-50 text-center">
                            <p className="text-xs text-blue-600 font-medium mb-1">体重</p>
                            <p className="font-bold text-lg text-slate-700">{cr!.weight}<span className="text-xs text-slate-400">kg</span></p>
                          </div>
                        )}
                        {cr!.height !== undefined && (
                          <div className="p-3 rounded-xl bg-mint-50 text-center">
                            <p className="text-xs text-mint-600 font-medium mb-1">身高</p>
                            <p className="font-bold text-lg text-slate-700">{cr!.height}<span className="text-xs text-slate-400">cm</span></p>
                          </div>
                        )}
                        {cr!.headCircumference !== undefined && (
                          <div className="p-3 rounded-xl bg-coral-50 text-center">
                            <p className="text-xs text-coral-600 font-medium mb-1">头围</p>
                            <p className="font-bold text-lg text-slate-700">{cr!.headCircumference}<span className="text-xs text-slate-400">cm</span></p>
                          </div>
                        )}
                        {cr!.bmi && (
                          <div className="p-3 rounded-xl bg-purple-50 text-center">
                            <p className="text-xs text-purple-600 font-medium mb-1">BMI评价</p>
                            <p className="font-bold text-lg text-slate-700">{cr!.bmi}</p>
                          </div>
                        )}
                        {cr!.development && (
                          <div className="md:col-span-2 p-3 rounded-xl bg-blue-50">
                            <p className="text-xs text-blue-600 font-medium mb-1">发育评估</p>
                            <p className="text-sm text-slate-700">{cr!.development}</p>
                          </div>
                        )}
                        {cr!.doctorAdvice && (
                          <div className="md:col-span-2 p-3 rounded-xl bg-mint-50">
                            <p className="text-xs text-mint-600 font-medium mb-1">医生建议</p>
                            <p className="text-sm text-slate-700">{cr!.doctorAdvice}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      )}

      {viewingRecord && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-soft-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div
              className={`sticky top-0 p-6 text-white rounded-t-3xl flex items-center justify-between ${
                viewingRecord.recordType === 'vaccine'
                  ? 'bg-gradient-to-r from-mint-400 to-mint-500'
                  : 'bg-gradient-to-r from-coral-400 to-coral-500'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                  {viewingRecord.recordType === 'vaccine' ? (
                    <Syringe className="w-7 h-7" />
                  ) : (
                    <Stethoscope className="w-7 h-7" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-display">
                    {viewingRecord.recordType === 'vaccine'
                      ? (viewingRecord as VaccineRecord).vaccineName
                      : `${formatMonthAge((viewingRecord as CheckupRecord).monthAge)}体检`}
                  </h2>
                  <p className="text-white/80 text-sm mt-1">记录详情</p>
                </div>
              </div>
              <button
                onClick={() => setViewingRecord(null)}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {viewingRecord.recordType === 'vaccine' ? (
                <>
                  {Object.entries({
                    '接种日期': formatDate((viewingRecord as VaccineRecord).vaccinationDate, 'YYYY年MM月DD日'),
                    '疫苗名称': (viewingRecord as VaccineRecord).vaccineName,
                    '生产厂家': (viewingRecord as VaccineRecord).manufacturer || '-',
                    '疫苗批号': (viewingRecord as VaccineRecord).batchNumber || '-',
                    '接种部位': (viewingRecord as VaccineRecord).site || '-',
                    '接种医生': (viewingRecord as VaccineRecord).doctor || '-',
                    '反应程度': (viewingRecord as VaccineRecord).reactionSeverity,
                  }).map(([label, value]) => (
                    <div key={label} className="flex py-3 border-b border-slate-100 last:border-0">
                      <span className="w-28 text-sm text-slate-500 flex-shrink-0">{label}</span>
                      <span className="font-medium text-slate-700">{value}</span>
                    </div>
                  ))}
                  {(viewingRecord as VaccineRecord).reaction && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                      <p className="text-xs font-bold text-amber-600 mb-2">孩子当日反应</p>
                      <p className="text-sm text-amber-800">{(viewingRecord as VaccineRecord).reaction}</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {Object.entries({
                    '体检日期': formatDate((viewingRecord as CheckupRecord).checkupDate, 'YYYY年MM月DD日'),
                    '体检月龄': formatMonthAge((viewingRecord as CheckupRecord).monthAge),
                    '体重': (viewingRecord as CheckupRecord).weight ? `${(viewingRecord as CheckupRecord).weight} kg` : '-',
                    '身高': (viewingRecord as CheckupRecord).height ? `${(viewingRecord as CheckupRecord).height} cm` : '-',
                    '头围': (viewingRecord as CheckupRecord).headCircumference ? `${(viewingRecord as CheckupRecord).headCircumference} cm` : '-',
                    'BMI评价': (viewingRecord as CheckupRecord).bmi || '-',
                  }).map(([label, value]) => (
                    <div key={label} className="flex py-3 border-b border-slate-100 last:border-0">
                      <span className="w-28 text-sm text-slate-500 flex-shrink-0">{label}</span>
                      <span className="font-medium text-slate-700">{value}</span>
                    </div>
                  ))}
                  {(viewingRecord as CheckupRecord).development && (
                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                      <p className="text-xs font-bold text-blue-600 mb-2">发育评估</p>
                      <p className="text-sm text-blue-800">{(viewingRecord as CheckupRecord).development}</p>
                    </div>
                  )}
                  {(viewingRecord as CheckupRecord).doctorAdvice && (
                    <div className="p-4 rounded-2xl bg-mint-50 border border-mint-100">
                      <p className="text-xs font-bold text-mint-600 mb-2">医生建议</p>
                      <p className="text-sm text-mint-800">{(viewingRecord as CheckupRecord).doctorAdvice}</p>
                    </div>
                  )}

                  {child && ((viewingRecord as CheckupRecord).weight !== undefined || 
                              (viewingRecord as CheckupRecord).height !== undefined ||
                              (viewingRecord as CheckupRecord).headCircumference !== undefined) && (
                    <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-blue-50 via-mint-50 to-coral-50 border border-blue-100">
                      <p className="text-xs font-bold text-blue-600 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        发育百分位分析
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {(viewingRecord as CheckupRecord).weight !== undefined && (() => {
                          const growthData = getGrowthData('weight', child.gender);
                          const pct = calculatePercentileRank((viewingRecord as CheckupRecord).weight!, (viewingRecord as CheckupRecord).monthAge, growthData);
                          const status = getGrowthStatus(pct);
                          return (
                            <div className="text-center p-2 rounded-xl bg-white/70">
                              <p className="text-xs text-slate-400">体重</p>
                              <p className="text-lg font-bold text-slate-700">{(viewingRecord as CheckupRecord).weight}<span className="text-xs font-normal">kg</span></p>
                              <p className={`text-xs font-medium ${status.color}`}>P{pct.toFixed(0)} · {status.label}</p>
                            </div>
                          );
                        })()}
                        {(viewingRecord as CheckupRecord).height !== undefined && (() => {
                          const growthData = getGrowthData('height', child.gender);
                          const pct = calculatePercentileRank((viewingRecord as CheckupRecord).height!, (viewingRecord as CheckupRecord).monthAge, growthData);
                          const status = getGrowthStatus(pct);
                          return (
                            <div className="text-center p-2 rounded-xl bg-white/70">
                              <p className="text-xs text-slate-400">身高</p>
                              <p className="text-lg font-bold text-slate-700">{(viewingRecord as CheckupRecord).height}<span className="text-xs font-normal">cm</span></p>
                              <p className={`text-xs font-medium ${status.color}`}>P{pct.toFixed(0)} · {status.label}</p>
                            </div>
                          );
                        })()}
                        {(viewingRecord as CheckupRecord).headCircumference !== undefined && (() => {
                          const growthData = getGrowthData('headCircumference', child.gender);
                          const pct = calculatePercentileRank((viewingRecord as CheckupRecord).headCircumference!, (viewingRecord as CheckupRecord).monthAge, growthData);
                          const status = getGrowthStatus(pct);
                          return (
                            <div className="text-center p-2 rounded-xl bg-white/70">
                              <p className="text-xs text-slate-400">头围</p>
                              <p className="text-lg font-bold text-slate-700">{(viewingRecord as CheckupRecord).headCircumference}<span className="text-xs font-normal">cm</span></p>
                              <p className={`text-xs font-medium ${status.color}`}>P{pct.toFixed(0)} · {status.label}</p>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-6 pt-0">
              <button
                onClick={() => setViewingRecord(null)}
                className="w-full btn-outline"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {editingRecord && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-soft-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div
              className={`sticky top-0 p-6 text-white rounded-t-3xl flex items-center justify-between ${
                editingRecord.recordType === 'vaccine'
                  ? 'bg-gradient-to-r from-mint-400 to-mint-500'
                  : 'bg-gradient-to-r from-coral-400 to-coral-500'
              }`}
            >
              <h2 className="text-2xl font-display">编辑记录</h2>
              <button
                onClick={() => setEditingRecord(null)}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              {editingRecord.recordType === 'vaccine' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-field">接种日期</label>
                    <input
                      type="date"
                      className="input-field"
                      value={editForm.vaccinationDate || ''}
                      onChange={(e) => setEditForm({ ...editForm, vaccinationDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label-field">接种部位</label>
                    <input
                      type="text"
                      className="input-field"
                      value={editForm.site || ''}
                      onChange={(e) => setEditForm({ ...editForm, site: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label-field">生产厂家</label>
                    <input
                      type="text"
                      className="input-field"
                      value={editForm.manufacturer || ''}
                      onChange={(e) => setEditForm({ ...editForm, manufacturer: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label-field">疫苗批号</label>
                    <input
                      type="text"
                      className="input-field"
                      value={editForm.batchNumber || ''}
                      onChange={(e) => setEditForm({ ...editForm, batchNumber: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label-field">反应程度</label>
                    <select
                      className="input-field"
                      value={editForm.reactionSeverity || '无'}
                      onChange={(e) => setEditForm({ ...editForm, reactionSeverity: e.target.value as '无' | '轻微' | '中度' | '严重' })}
                    >
                      <option value="无">无</option>
                      <option value="轻微">轻微</option>
                      <option value="中度">中度</option>
                      <option value="严重">严重</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="label-field">当日反应详情</label>
                    <textarea
                      className="input-field min-h-[80px] resize-none"
                      value={editForm.reaction || ''}
                      onChange={(e) => setEditForm({ ...editForm, reaction: e.target.value })}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <label className="label-field">体检日期</label>
                    <input
                      type="date"
                      className="input-field"
                      value={editForm.checkupDate || ''}
                      onChange={(e) => setEditForm({ ...editForm, checkupDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label-field">体重 (kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input-field"
                      value={editForm.weight ?? ''}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
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
                      value={editForm.height ?? ''}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
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
                      value={editForm.headCircumference ?? ''}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          headCircumference: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="label-field">发育评估</label>
                    <textarea
                      className="input-field min-h-[80px] resize-none"
                      value={editForm.development || ''}
                      onChange={(e) => setEditForm({ ...editForm, development: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="label-field">医生建议</label>
                    <textarea
                      className="input-field min-h-[80px] resize-none"
                      value={editForm.doctorAdvice || ''}
                      onChange={(e) => setEditForm({ ...editForm, doctorAdvice: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="flex-1 btn-outline"
                >
                  取消
                </button>
                <button type="submit" className="flex-1 btn-primary flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  保存修改
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
