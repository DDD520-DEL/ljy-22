import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertTriangle,
  Ruler,
  Heart,
  Brain,
  FileText,
  Sparkles,
  Search,
  Scale,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Info,
  Lightbulb,
  Filter,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { CHECKUP_DEFINITIONS } from '@/data/checkups';
import {
  getGrowthData,
  interpolatePercentile,
  calculatePercentileRank,
  getGrowthStatus,
} from '@/data/growthStandards';
import type { CheckupDefinition, CheckupItem } from '@/types';
import { formatMonthAge, calculateMonthAge } from '@/utils/dateUtils';

const CATEGORY_CONFIG: Record<
  CheckupItem['category'],
  { icon: typeof Heart; color: string; bg: string; border: string; label: string }
> = {
  '体格测量': { icon: Ruler, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', label: '体格测量' },
  '全身检查': { icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', label: '全身检查' },
  '发育评估': { icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', label: '发育评估' },
  '辅助检查': { icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: '辅助检查' },
  '其他': { icon: Sparkles, color: 'text-mint-600', bg: 'bg-mint-50', border: 'border-mint-200', label: '其他' },
};

const NURSING_ADVICE: Record<string, { advice: string; severity: 'warning' | 'danger' }> = {
  '体重偏低': {
    advice: '增加喂养频次，保证奶量充足；添加辅食后注意含铁食物摄入；如持续偏低建议咨询儿童营养科。',
    severity: 'warning',
  },
  '体重偏高': {
    advice: '控制喂养量，避免过度喂养；减少高糖高脂辅食；增加活动量；定期监测体重趋势。',
    severity: 'warning',
  },
  '身长偏低': {
    advice: '保证充足奶量和维生素D补充；多做伸展运动和俯卧练习；如持续偏矮建议排查生长激素。',
    severity: 'warning',
  },
  '头围偏大': {
    advice: '关注有无呕吐、嗜睡、前囟隆起等表现；定期复查头围增长曲线；如增速过快需排除脑积水。',
    severity: 'danger',
  },
  '头围偏小': {
    advice: '关注发育里程碑是否达标；保证DHA等脑发育营养摄入；如伴发育迟缓需排查小头畸形。',
    severity: 'danger',
  },
  '贫血': {
    advice: '补充含铁丰富的食物（蛋黄、肝泥、肉泥）；搭配维生素C促进铁吸收；遵医嘱补充铁剂。',
    severity: 'warning',
  },
  '心率异常': {
    advice: '观察有无面色苍白、呼吸急促；避免剧烈哭闹；建议心内科就诊排查心律问题。',
    severity: 'danger',
  },
  '呼吸异常': {
    advice: '注意观察有无鼻塞、咳嗽；保持室内空气流通；如伴发热或呼吸费力需及时就诊。',
    severity: 'danger',
  },
  '视力异常': {
    advice: '控制电子产品使用时间；保证户外活动2小时/日；3岁后定期视力复查；必要时散瞳验光。',
    severity: 'warning',
  },
  '龋齿': {
    advice: '每日早晚刷牙，使用含氟牙膏米粒大小；减少夜间含奶瓶入睡；每3-6个月口腔检查涂氟。',
    severity: 'warning',
  },
  'O型腿': {
    advice: '保证维生素D 400IU/日；多做户外活动；避免过早站立行走；如2岁后无改善需骨科就诊。',
    severity: 'warning',
  },
  'X型腿': {
    advice: '避免W型坐姿；保证钙和维生素D摄入；如3岁后明显需骨科评估；多数可随发育自行纠正。',
    severity: 'warning',
  },
  '前囟早闭': {
    advice: '关注头围增长是否正常；监测发育里程碑；如头围正常增长一般无需特殊处理。',
    severity: 'warning',
  },
  '前囟迟闭': {
    advice: '排查维生素D缺乏性佝偻病；保证维生素D补充；如18月龄仍未闭合需内分泌科评估。',
    severity: 'warning',
  },
  '发育迟缓': {
    advice: '增加亲子互动和早教刺激；针对落后领域加强训练；建议儿童保健科专业评估和干预。',
    severity: 'danger',
  },
  '佝偻病体征': {
    advice: '增加维生素D补充至600-800IU/日；增加户外日照时间；补充钙剂；定期复查骨代谢指标。',
    severity: 'danger',
  },
  '斜颈': {
    advice: '尽早开始康复按摩和牵伸训练；喂奶和抱姿注意方向交替；如6月龄无改善需骨科评估手术。',
    severity: 'warning',
  },
  '髋关节异常': {
    advice: '使用宽尿布保持蛙式位；避免过度包裹下肢；遵医嘱使用Pavlik吊带；定期超声复查。',
    severity: 'danger',
  },
};

type FilterCategory = 'all' | CheckupItem['category'];

function getAbnormalTag(
  itemName: string,
  value: number | undefined,
  monthAge: number,
  gender: '男' | '女'
): { tag: string; key: string } | null {
  if (value === undefined) return null;

  if (itemName === '体重' || itemName === '身长' || itemName === '身高' || itemName === '头围') {
    const metric = itemName === '体重' ? 'weight' : itemName === '头围' ? 'headCircumference' : 'height';
    const data = getGrowthData(metric, gender);
    const percentile = calculatePercentileRank(value, monthAge, data);
    const status = getGrowthStatus(percentile);

    if (status.level === 'low') {
      return { tag: `${itemName}偏低 (P${Math.round(percentile)})`, key: `${itemName}偏低` };
    }
    if (status.level === 'high') {
      return { tag: `${itemName}偏高 (P${Math.round(percentile)})`, key: `${itemName}偏高` };
    }
  }

  return null;
}

function getReferenceRange(
  itemName: string,
  monthAge: number,
  gender: '男' | '女'
): string | null {
  if (itemName === '体重' || itemName === '身长' || itemName === '身高' || itemName === '头围') {
    const metric = itemName === '体重' ? 'weight' : itemName === '头围' ? 'headCircumference' : 'height';
    const data = getGrowthData(metric, gender);
    const percentiles = interpolatePercentile(monthAge, data);
    const unit = itemName === '体重' ? 'kg' : 'cm';
    return `参考范围: P3 ${percentiles.P3.toFixed(1)} ~ P97 ${percentiles.P97.toFixed(1)} ${unit}，中位数 P50 ${percentiles.P50.toFixed(1)} ${unit}`;
  }
  return null;
}

export default function CheckupQuickRef() {
  const navigate = useNavigate();
  const { children, currentChildId, checkupSchedules, checkupRecords, abnormalItems } = useAppStore();
  const child = children.find((c) => c.id === currentChildId) || null;

  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [showOnlyAbnormal, setShowOnlyAbnormal] = useState(false);

  useEffect(() => {
    if (!child) navigate('/child-info');
  }, [child, navigate]);

  if (!child) return null;

  const currentMonthAge = calculateMonthAge(child.birthDate);
  const gender = child.gender;
  const currentSchedules = checkupSchedules.filter((s) => s.childId === currentChildId);
  const currentRecords = checkupRecords.filter((r) => r.childId === currentChildId);
  const currentAbnormals = abnormalItems.filter((a) => a.childId === currentChildId && a.status !== '已归档');

  const getRecordForMonthAge = (monthAge: number) => {
    const schedule = currentSchedules.find((s) => s.monthAge === monthAge);
    if (!schedule) return null;
    return currentRecords.find((r) => r.scheduleId === schedule.id) || null;
  };

  const getScheduleForMonthAge = (monthAge: number) => {
    return currentSchedules.find((s) => s.monthAge === monthAge) || null;
  };

  const filteredDefinitions = CHECKUP_DEFINITIONS.filter((def) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = formatMonthAge(def.monthAge).includes(term);
      const matchItem = def.items.some(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.description.toLowerCase().includes(term) ||
          item.category.toLowerCase().includes(term)
      );
      const matchMilestone = def.milestones.some((m) => m.toLowerCase().includes(term));
      if (!matchName && !matchItem && !matchMilestone) return false;
    }

    if (filterCategory !== 'all') {
      if (!def.items.some((item) => item.category === filterCategory)) return false;
    }

    if (showOnlyAbnormal) {
      const record = getRecordForMonthAge(def.monthAge);
      if (!record) return false;
      const relatedAbnormals = currentAbnormals.filter(
        (a) => a.checkupRecordId === record.id
      );
      const hasGrowthAbnormal = ['体重', '身长', '身高', '头围'].some((name) => {
        const val = name === '体重' ? record.weight : name === '头围' ? record.headCircumference : record.height;
        return getAbnormalTag(name, val, def.monthAge, gender) !== null;
      });
      if (relatedAbnormals.length === 0 && !hasGrowthAbnormal) return false;
    }

    return true;
  });

  const getCategoryCount = (def: CheckupDefinition) => {
    if (filterCategory === 'all') return def.items.length;
    return def.items.filter((item) => item.category === filterCategory).length;
  };

  const filterCategories: { key: FilterCategory; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: '体格测量', label: '体格测量' },
    { key: '全身检查', label: '全身检查' },
    { key: '发育评估', label: '发育评估' },
    { key: '辅助检查', label: '辅助检查' },
    { key: '其他', label: '其他' },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display text-slate-800 flex items-center gap-3">
            <span className="text-4xl">📋</span>
            体检项目速查表
          </h1>
          <p className="text-slate-500 mt-1">
            按月龄速查每次体检的全部项目与参考标准，已完成记录自动对照异常高亮
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">
            宝宝当前 <strong className="text-coral-500">{formatMonthAge(currentMonthAge)}</strong>
          </span>
        </div>
      </div>

      <div className="card border-2 border-blue-100 bg-gradient-to-br from-blue-50/50 to-white">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              className="input-field pl-12"
              placeholder="搜索体检项目、月龄、里程碑..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex bg-white rounded-xl p-1 shadow-soft border border-slate-100">
              {filterCategories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setFilterCategory(cat.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filterCategory === cat.key
                      ? 'bg-blue-500 text-white'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowOnlyAbnormal(!showOnlyAbnormal)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-medium border-2 transition-all ${
                showOnlyAbnormal
                  ? 'bg-red-50 border-red-300 text-red-600'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-red-200 hover:text-red-400'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              仅看异常
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredDefinitions.map((def) => {
          const record = getRecordForMonthAge(def.monthAge);
          const schedule = getScheduleForMonthAge(def.monthAge);
          const isCompleted = !!record;
          const isCurrentOrPast = def.monthAge <= currentMonthAge;
          const isExpanded = expandedMonth === def.monthAge;

          const relatedAbnormals = record
            ? currentAbnormals.filter((a) => a.checkupRecordId === record.id)
            : [];
          const growthAbnormals: { tag: string; key: string; itemName: string }[] = [];
          if (record) {
            for (const name of ['体重', '身长', '身高', '头围'] as const) {
              const val =
                name === '体重'
                  ? record.weight
                  : name === '头围'
                  ? record.headCircumference
                  : record.height;
              const abnormal = getAbnormalTag(name, val, def.monthAge, gender);
              if (abnormal) {
                growthAbnormals.push({ ...abnormal, itemName: name });
              }
            }
          }
          const hasAbnormal = relatedAbnormals.length > 0 || growthAbnormals.length > 0;

          const filteredItems = filterCategory === 'all'
            ? def.items
            : def.items.filter((item) => item.category === filterCategory);

          const statusBorder = hasAbnormal
            ? 'border-red-300 bg-gradient-to-br from-red-50/30 to-white'
            : isCompleted
            ? 'border-mint-200 bg-gradient-to-br from-mint-50/30 to-white'
            : isCurrentOrPast
            ? 'border-amber-200 bg-gradient-to-br from-amber-50/20 to-white'
            : 'border-slate-100';

          return (
            <div
              key={def.monthAge}
              className={`card border-2 ${statusBorder} transition-all duration-300`}
            >
              <div
                className="flex items-center gap-4 cursor-pointer"
                onClick={() => setExpandedMonth(isExpanded ? null : def.monthAge)}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-soft flex-shrink-0 ${
                    hasAbnormal
                      ? 'bg-gradient-to-br from-red-300 to-red-400'
                      : isCompleted
                      ? 'bg-gradient-to-br from-mint-300 to-mint-500'
                      : isCurrentOrPast
                      ? 'bg-gradient-to-br from-amber-300 to-amber-400'
                      : 'bg-gradient-to-br from-slate-200 to-slate-300'
                  }`}
                >
                  <ClipboardList className="w-7 h-7 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-xl font-bold text-slate-800">
                      {formatMonthAge(def.monthAge)} 体检
                    </h3>
                    {isCompleted && (
                      <span className="status-badge bg-mint-100 text-mint-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        已完成
                      </span>
                    )}
                    {!isCompleted && isCurrentOrPast && (
                      <span className="status-badge bg-amber-100 text-amber-600">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        待体检
                      </span>
                    )}
                    {hasAbnormal && (
                      <span className="status-badge bg-red-100 text-red-600 animate-pulse-soft">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {relatedAbnormals.length + growthAbnormals.length}项异常
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    共 {getCategoryCount(def)} 项检查
                    {def.milestones.length > 0 && ` · ${def.milestones.length} 个里程碑`}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="hidden md:flex gap-2">
                    {Object.entries(CATEGORY_CONFIG).map(([cat, config]) => {
                      const count = def.items.filter((i) => i.category === cat).length;
                      if (count === 0) return null;
                      return (
                        <span
                          key={cat}
                          className={`text-xs px-2.5 py-1 rounded-full ${config.bg} ${config.color} border ${config.border}`}
                        >
                          {count} {config.label}
                        </span>
                      );
                    })}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {hasAbnormal && !isExpanded && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {growthAbnormals.map((ga, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      {ga.tag}
                    </span>
                  ))}
                  {relatedAbnormals.map((ab) => (
                    <span
                      key={ab.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      {ab.itemName}: {ab.abnormalDetail}
                    </span>
                  ))}
                </div>
              )}

              {isExpanded && (
                <div className="mt-6 animate-fade-in space-y-6">
                  {record && (
                    <div className="p-4 rounded-2xl bg-mint-50/80 border border-mint-200">
                      <p className="text-sm font-bold text-mint-600 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        实际体检记录 · 体检日期：{record.checkupDate}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {record.weight !== undefined && (
                          <MeasuredValueCard
                            label="体重"
                            value={record.weight}
                            unit="kg"
                            monthAge={def.monthAge}
                            gender={gender}
                            metric="weight"
                          />
                        )}
                        {record.height !== undefined && (
                          <MeasuredValueCard
                            label={def.monthAge >= 36 ? '身高' : '身长'}
                            value={record.height}
                            unit="cm"
                            monthAge={def.monthAge}
                            gender={gender}
                            metric="height"
                          />
                        )}
                        {record.headCircumference !== undefined && (
                          <MeasuredValueCard
                            label="头围"
                            value={record.headCircumference}
                            unit="cm"
                            monthAge={def.monthAge}
                            gender={gender}
                            metric="headCircumference"
                          />
                        )}
                        {record.bmi && (
                          <div className="p-3 rounded-xl bg-white text-center border border-mint-100">
                            <p className="text-xs text-slate-400">BMI评价</p>
                            <p className="text-lg font-bold text-mint-600">{record.bmi}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {hasAbnormal && (
                    <div className="p-5 rounded-2xl bg-red-50 border-2 border-red-200">
                      <p className="text-sm font-bold text-red-600 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        异常项目与护理建议
                      </p>
                      <div className="space-y-3">
                        {growthAbnormals.map((ga, i) => {
                          const advice = NURSING_ADVICE[ga.key];
                          return (
                            <div
                              key={i}
                              className={`p-4 rounded-xl border ${
                                advice?.severity === 'danger'
                                  ? 'bg-red-100/60 border-red-300'
                                  : 'bg-amber-50 border-amber-200'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                    advice?.severity === 'danger'
                                      ? 'bg-red-200 text-red-700'
                                      : 'bg-amber-200 text-amber-700'
                                  }`}
                                >
                                  {advice?.severity === 'danger' ? (
                                    <ArrowUpRight className="w-4 h-4" />
                                  ) : (
                                    <ArrowDownRight className="w-4 h-4" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-slate-800 text-sm">{ga.tag}</p>
                                  {advice && (
                                    <div className="mt-2 flex items-start gap-2">
                                      <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                      <p className="text-sm text-slate-700 leading-relaxed">
                                        {advice.advice}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {relatedAbnormals.map((ab) => {
                          const matchedKey = Object.keys(NURSING_ADVICE).find((k) =>
                            ab.itemName.includes(k.replace(/偏低|偏高/g, ''))
                          );
                          const advice = matchedKey ? NURSING_ADVICE[matchedKey] : null;
                          return (
                            <div
                              key={ab.id}
                              className={`p-4 rounded-xl border ${
                                advice?.severity === 'danger' || !advice
                                  ? 'bg-red-100/60 border-red-300'
                                  : 'bg-amber-50 border-amber-200'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                    advice?.severity === 'danger' || !advice
                                      ? 'bg-red-200 text-red-700'
                                      : 'bg-amber-200 text-amber-700'
                                  }`}
                                >
                                  <AlertTriangle className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-slate-800 text-sm">
                                    {ab.itemName}
                                    <span className="font-normal text-red-500 ml-2">
                                      {ab.abnormalDetail}
                                    </span>
                                  </p>
                                  {ab.status === '待复查' && (
                                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-600">
                                      待复查
                                    </span>
                                  )}
                                  {ab.status === '已复查正常' && (
                                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs bg-mint-100 text-mint-600">
                                      已复查正常
                                    </span>
                                  )}
                                  {advice && (
                                    <div className="mt-2 flex items-start gap-2">
                                      <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                      <p className="text-sm text-slate-700 leading-relaxed">
                                        {advice.advice}
                                      </p>
                                    </div>
                                  )}
                                  {!advice && (
                                    <div className="mt-2 flex items-start gap-2">
                                      <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                      <p className="text-sm text-slate-600 leading-relaxed">
                                        建议咨询医生获取专业指导，按医嘱复查和护理。
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-lg">
                      <span className="text-lg">🔍</span>
                      全部检查项目与参考标准
                    </h4>
                    <div className="space-y-2">
                      {filteredItems.map((item, idx) => {
                        const catConfig = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG['其他'];
                        const CatIcon = catConfig.icon;
                        const refRange = getReferenceRange(item.name, def.monthAge, gender);
                        const itemAbnormal = relatedAbnormals.find((a) => a.itemName === item.name);

                        return (
                          <div
                            key={idx}
                            className={`p-4 rounded-xl border transition-all ${
                              itemAbnormal
                                ? 'bg-red-50/80 border-red-200 hover:bg-red-50'
                                : 'bg-slate-50/80 border-slate-100 hover:bg-white'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${catConfig.bg} ${catConfig.color}`}
                              >
                                <CatIcon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full ${catConfig.bg} ${catConfig.color} border ${catConfig.border}`}
                                  >
                                    {item.category}
                                  </span>
                                  {itemAbnormal && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600 border border-red-200">
                                      <AlertTriangle className="w-3 h-3" />
                                      {itemAbnormal.abnormalDetail}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                                  {item.description}
                                </p>
                                {refRange && (
                                  <div className="mt-2 flex items-start gap-2 p-2.5 rounded-lg bg-blue-50 border border-blue-100">
                                    <Scale className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-blue-700 leading-relaxed">{refRange}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {def.milestones.length > 0 && (
                    <div>
                      <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-lg">
                        <span className="text-lg">🌟</span>
                        发育里程碑
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {def.milestones.map((m, i) => (
                          <div
                            key={i}
                            className="px-4 py-3 rounded-xl bg-gradient-to-r from-mint-50 to-coral-50 border border-mint-100 text-sm text-slate-700"
                          >
                            ✅ {m}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {def.notes.length > 0 && (
                    <div>
                      <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-lg">
                        <span className="text-lg">💡</span>
                        温馨提示
                      </h4>
                      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 space-y-2">
                        {def.notes.map((note, i) => (
                          <p key={i} className="text-sm text-amber-800 flex items-start gap-2">
                            <span>•</span>
                            {note}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {record?.doctorAdvice && (
                    <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
                      <p className="text-sm font-bold text-purple-600 mb-2 flex items-center gap-2">
                        <span className="text-base">👨‍⚕️</span>
                        医生建议
                      </p>
                      <p className="text-sm text-slate-700 leading-relaxed">{record.doctorAdvice}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filteredDefinitions.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-slate-500">
              {showOnlyAbnormal ? '没有找到异常项目，宝宝一切正常 🎉' : '没有找到符合条件的体检项目'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function MeasuredValueCard({
  label,
  value,
  unit,
  monthAge,
  gender,
  metric,
}: {
  label: string;
  value: number;
  unit: string;
  monthAge: number;
  gender: '男' | '女';
  metric: 'weight' | 'height' | 'headCircumference';
}) {
  const data = getGrowthData(metric, gender);
  const percentile = calculatePercentileRank(value, monthAge, data);
  const status = getGrowthStatus(percentile);
  const percentiles = interpolatePercentile(monthAge, data);

  const isAbnormal = status.level !== 'normal';
  const arrowIcon =
    status.level === 'low' ? ArrowDownRight : status.level === 'high' ? ArrowUpRight : Minus;
  const ArrowIcon = arrowIcon;

  return (
    <div
      className={`p-3 rounded-xl bg-white text-center border ${
        isAbnormal ? 'border-red-200 bg-red-50/30' : 'border-mint-100'
      }`}
    >
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <div className="flex items-baseline justify-center gap-1">
        <p className={`text-lg font-bold ${isAbnormal ? 'text-red-600' : 'text-slate-700'}`}>
          {value}
        </p>
        <span className="text-xs text-slate-400">{unit}</span>
      </div>
      <div className="flex items-center justify-center gap-1 mt-1">
        <ArrowIcon
          className={`w-3 h-3 ${
            status.level === 'low'
              ? 'text-amber-500'
              : status.level === 'high'
              ? 'text-purple-500'
              : 'text-mint-500'
          }`}
        />
        <span
          className={`text-xs font-medium ${
            isAbnormal ? (status.level === 'low' ? 'text-amber-600' : 'text-purple-600') : 'text-mint-600'
          }`}
        >
          P{Math.round(percentile)} · {status.label}
        </span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden relative">
        <div
          className="absolute top-0 h-full bg-mint-200 rounded-full"
          style={{ left: '3%', width: '94%' }}
        />
        <div
          className="absolute top-0 h-full bg-mint-400 rounded-full"
          style={{ left: '15%', width: '70%' }}
        />
        <div
          className={`absolute top-0 w-2.5 h-full rounded-full ${
            isAbnormal ? 'bg-red-500' : 'bg-mint-600'
          }`}
          style={{ left: `${Math.min(Math.max(percentile, 1), 99)}%`, transform: 'translateX(-50%)' }}
        />
      </div>
      <p className="text-[10px] text-slate-400 mt-1">
        P3={percentiles.P3.toFixed(1)} · P50={percentiles.P50.toFixed(1)} · P97={percentiles.P97.toFixed(1)}
      </p>
    </div>
  );
}
