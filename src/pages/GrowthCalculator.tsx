import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Baby,
  Calculator,
  TrendingUp,
  TrendingDown,
  Minus,
  Save,
  Trash2,
  ChevronDown,
  ChevronUp,
  Ruler,
  Scale,
  AlertCircle,
  CheckCircle2,
  Info,
  BarChart3,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { formatMonthAge } from '@/utils/dateUtils';
import {
  calculatePercentileRank,
  getGrowthStatus,
  getGrowthData,
  interpolatePercentile,
  type Gender,
} from '@/data/growthStandards';

interface PercentileResult {
  value: number;
  percentile: number;
  status: ReturnType<typeof getGrowthStatus>;
  P3: number;
  P15: number;
  P50: number;
  P85: number;
  P97: number;
}

export default function GrowthCalculatorPage() {
  const navigate = useNavigate();
  const {
    children,
    currentChildId,
    growthCalculatorRecords,
    addGrowthCalculatorRecord,
    deleteGrowthCalculatorRecord,
  } = useAppStore();

  const child = children.find((c) => c.id === currentChildId) || null;
  const currentRecords = useMemo(
    () =>
      growthCalculatorRecords
        .filter((r) => r.childId === currentChildId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [growthCalculatorRecords, currentChildId]
  );

  const [gender, setGender] = useState<Gender>(child?.gender || '男');
  const [monthAge, setMonthAge] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [showHistory, setShowHistory] = useState(true);
  const [showDetail, setShowDetail] = useState<string | null>(null);

  const monthAgeNum = parseInt(monthAge) || 0;
  const weightNum = parseFloat(weight) || 0;
  const heightNum = parseFloat(height) || 0;

  const weightResult = useMemo<PercentileResult | null>(() => {
    if (!monthAgeNum || !weightNum || !gender) return null;
    const data = getGrowthData('weight', gender);
    const percentile = calculatePercentileRank(weightNum, monthAgeNum, data);
    const status = getGrowthStatus(percentile);
    const interp = interpolatePercentile(monthAgeNum, data);
    return { value: weightNum, percentile, status, ...interp };
  }, [weightNum, monthAgeNum, gender]);

  const heightResult = useMemo<PercentileResult | null>(() => {
    if (!monthAgeNum || !heightNum || !gender) return null;
    const data = getGrowthData('height', gender);
    const percentile = calculatePercentileRank(heightNum, monthAgeNum, data);
    const status = getGrowthStatus(percentile);
    const interp = interpolatePercentile(monthAgeNum, data);
    return { value: heightNum, percentile, status, ...interp };
  }, [heightNum, monthAgeNum, gender]);

  const hasResult = weightResult || heightResult;

  const buildConclusion = (): string => {
    const parts: string[] = [];
    if (weightResult) {
      parts.push(`体重P${weightResult.percentile.toFixed(0)}（${weightResult.status.label}）`);
    }
    if (heightResult) {
      parts.push(`身高P${heightResult.percentile.toFixed(0)}（${heightResult.status.label}）`);
    }
    if (parts.length === 0) return '';

    const hasLow = (weightResult && weightResult.status.level === 'low') || (heightResult && heightResult.status.level === 'low');
    const hasHigh = (weightResult && weightResult.status.level === 'high') || (heightResult && heightResult.status.level === 'high');

    if (!hasLow && !hasHigh) {
      return `${parts.join('，')}，生长发育在正常范围内，请继续保持良好生活习惯。`;
    }
    if (hasLow && hasHigh) {
      return `${parts.join('，')}，身高体重发展不均衡，建议咨询儿保医生评估。`;
    }
    if (hasLow) {
      return `${parts.join('，')}，部分指标偏低，建议关注营养摄入并咨询儿保医生。`;
    }
    return `${parts.join('，')}，部分指标偏高，建议关注饮食结构并咨询儿保医生。`;
  };

  const handleSave = () => {
    if (!hasResult) return;
    addGrowthCalculatorRecord({
      gender,
      monthAge: monthAgeNum,
      weight: weightNum || undefined,
      height: heightNum || undefined,
      weightPercentile: weightResult?.percentile,
      heightPercentile: heightResult?.percentile,
      weightStatus: weightResult?.status.label,
      heightStatus: heightResult?.status.label,
      conclusion: buildConclusion(),
    });
  };

  const handleReset = () => {
    setGender(child?.gender || '男');
    setMonthAge('');
    setWeight('');
    setHeight('');
  };

  const getTrendIcon = (current: number, previous?: number) => {
    if (previous === undefined) return <Minus className="w-3.5 h-3.5 text-slate-400" />;
    const diff = current - previous;
    if (diff > 3) return <TrendingUp className="w-3.5 h-3.5 text-mint-500" />;
    if (diff < -3) return <TrendingDown className="w-3.5 h-3.5 text-coral-500" />;
    return <Minus className="w-3.5 h-3.5 text-slate-400" />;
  };

  const getTrendLabel = (current: number, previous?: number) => {
    if (previous === undefined) return '首次';
    const diff = current - previous;
    if (diff > 3) return '上升';
    if (diff < -3) return '下降';
    return '持平';
  };

  const PercentileBar = ({ result, label, unit }: { result: PercentileResult; label: string; unit: string }) => {
    const pct = Math.max(0, Math.min(100, result.percentile));
    const barWidth = `${pct}%`;

    const getColor = () => {
      if (pct < 3) return 'bg-red-400';
      if (pct < 15) return 'bg-amber-400';
      if (pct <= 85) return 'bg-mint-400';
      if (pct <= 97) return 'bg-blue-400';
      return 'bg-purple-400';
    };

    const getBgColor = () => {
      if (pct < 3) return 'bg-red-100';
      if (pct < 15) return 'bg-amber-100';
      if (pct <= 85) return 'bg-mint-100';
      if (pct <= 97) return 'bg-blue-100';
      return 'bg-purple-100';
    };

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-700">{label}</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-slate-800">
              {result.value}
              <span className="text-sm font-normal text-slate-400 ml-0.5">{unit}</span>
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${result.status.color} ${getBgColor()}`}>
              P{result.percentile.toFixed(0)} {result.status.label}
            </span>
          </div>
        </div>
        <div className="relative">
          <div className={`h-4 rounded-full ${getBgColor()} overflow-hidden`}>
            <div
              className={`h-full rounded-full ${getColor()} transition-all duration-700 ease-out`}
              style={{ width: barWidth }}
            />
          </div>
          <div className="absolute top-0 left-[3%] w-px h-4 bg-slate-300" />
          <div className="absolute top-0 left-[15%] w-px h-4 bg-slate-300" />
          <div className="absolute top-0 left-[50%] w-px h-4 bg-slate-300" />
          <div className="absolute top-0 left-[85%] w-px h-4 bg-slate-300" />
          <div className="absolute top-0 left-[97%] w-px h-4 bg-slate-300" />
          <div
            className="absolute top-0 w-1 h-4 bg-slate-800 rounded-full transition-all duration-700 ease-out"
            style={{ left: `calc(${barWidth} - 2px)` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>P3</span>
          <span>P15</span>
          <span>P50</span>
          <span>P85</span>
          <span>P97</span>
        </div>
        <div className="grid grid-cols-5 gap-2 text-xs">
          <div className="text-center p-1.5 rounded-lg bg-slate-50">
            <div className="text-slate-400">P3</div>
            <div className="font-medium text-slate-600">{result.P3.toFixed(1)}</div>
          </div>
          <div className="text-center p-1.5 rounded-lg bg-slate-50">
            <div className="text-slate-400">P15</div>
            <div className="font-medium text-slate-600">{result.P15.toFixed(1)}</div>
          </div>
          <div className="text-center p-1.5 rounded-lg bg-mint-50">
            <div className="text-mint-500">P50</div>
            <div className="font-medium text-mint-700">{result.P50.toFixed(1)}</div>
          </div>
          <div className="text-center p-1.5 rounded-lg bg-slate-50">
            <div className="text-slate-400">P85</div>
            <div className="font-medium text-slate-600">{result.P85.toFixed(1)}</div>
          </div>
          <div className="text-center p-1.5 rounded-lg bg-slate-50">
            <div className="text-slate-400">P97</div>
            <div className="font-medium text-slate-600">{result.P97.toFixed(1)}</div>
          </div>
        </div>
      </div>
    );
  };

  if (!child) {
    return (
      <div className="card text-center py-16 animate-fade-in-up">
        <Baby className="w-16 h-16 mx-auto text-mint-400 mb-4" />
        <h2 className="text-2xl font-display text-slate-700 mb-2">请先录入宝宝信息</h2>
        <p className="text-slate-500 mb-6">录入宝宝信息后，即可使用身高体重百分位计算器</p>
        <button
          className="btn-primary"
          onClick={() => navigate('/child-info')}
        >
          去录入宝宝信息
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-display text-slate-800 flex items-center gap-3">
          <span className="text-4xl">📊</span>
          身高体重百分位计算器
        </h1>
        <p className="text-slate-500 mt-1">对照 WHO 儿童生长标准，评估宝宝身高体重发育水平</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-5">
          <div className="card">
            <h3 className="font-display text-lg text-slate-800 mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-mint-500" />
              输入测量数据
            </h3>

            <div className="space-y-4">
              <div>
                <label className="label-field">性别</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGender('男')}
                    className={`p-3 rounded-xl border-2 transition-all duration-300 text-center ${
                      gender === '男'
                        ? 'border-mint-400 bg-mint-50 shadow-glow-mint'
                        : 'border-slate-100 bg-slate-50 hover:border-mint-200'
                    }`}
                  >
                    <div className="text-2xl mb-1">👦</div>
                    <p className={`text-sm font-semibold ${gender === '男' ? 'text-mint-600' : 'text-slate-500'}`}>
                      男宝宝
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('女')}
                    className={`p-3 rounded-xl border-2 transition-all duration-300 text-center ${
                      gender === '女'
                        ? 'border-coral-400 bg-coral-50 shadow-lg'
                        : 'border-slate-100 bg-slate-50 hover:border-coral-200'
                    }`}
                  >
                    <div className="text-2xl mb-1">👧</div>
                    <p className={`text-sm font-semibold ${gender === '女' ? 'text-coral-600' : 'text-slate-500'}`}>
                      女宝宝
                    </p>
                  </button>
                </div>
              </div>

              <div>
                <label className="label-field">月龄</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="请输入月龄（0-84）"
                  min={0}
                  max={84}
                  value={monthAge}
                  onChange={(e) => setMonthAge(e.target.value)}
                />
                {monthAgeNum > 0 && (
                  <p className="text-xs text-slate-400 mt-1">{formatMonthAge(monthAgeNum)}</p>
                )}
              </div>

              <div>
                <label className="label-field">
                  <Scale className="w-4 h-4 inline mr-1 text-coral-400" />
                  体重（kg）
                </label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="请输入体重"
                  min={0}
                  max={50}
                  step={0.1}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>

              <div>
                <label className="label-field">
                  <Ruler className="w-4 h-4 inline mr-1 text-blue-400" />
                  身高（cm）
                </label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="请输入身高"
                  min={0}
                  max={150}
                  step={0.1}
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                className="flex-1 btn-outline"
                onClick={handleReset}
              >
                重置
              </button>
              <button
                className="flex-1 btn-primary flex items-center justify-center gap-2"
                onClick={handleSave}
                disabled={!hasResult}
              >
                <Save className="w-4 h-4" />
                保存结果
              </button>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-mint-50 to-coral-50 border border-mint-100">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-mint-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-slate-600 leading-relaxed">
                <p className="font-semibold text-slate-700 mb-1">百分位说明</p>
                <p>P3 以下：偏低，建议就医评估</p>
                <p>P3-P15：偏下，需关注营养</p>
                <p>P15-P85：正常范围 ✓</p>
                <p>P85-P97：偏上，需注意饮食</p>
                <p>P97 以上：偏高，建议咨询医生</p>
                <p className="mt-1 text-slate-400">数据基于 WHO 儿童生长标准（0-7 岁）</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-5">
          {hasResult ? (
            <>
              <div className="card">
                <h3 className="font-display text-lg text-slate-800 mb-5 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                  评估结果
                </h3>

                <div className="space-y-6">
                  {weightResult && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-coral-50/50 to-white border border-coral-100/50">
                      <PercentileBar result={weightResult} label="体重" unit="kg" />
                    </div>
                  )}

                  {heightResult && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/50 to-white border border-blue-100/50">
                      <PercentileBar result={heightResult} label="身高" unit="cm" />
                    </div>
                  )}
                </div>

                <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-mint-50 via-white to-coral-50 border border-mint-100">
                  <div className="flex items-start gap-3">
                    {weightResult?.status.level === 'normal' && heightResult?.status.level === 'normal' ? (
                      <CheckCircle2 className="w-6 h-6 text-mint-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-amber-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-1">评估结论</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">{buildConclusion()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="card flex flex-col items-center justify-center py-20 text-slate-400">
              <Calculator className="w-16 h-16 mb-4 text-slate-300" />
              <p className="text-lg font-display text-slate-500 mb-1">请输入测量数据</p>
              <p className="text-sm">输入月龄、身高和体重后自动计算百分位</p>
            </div>
          )}

          <div className="card">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowHistory(!showHistory)}
            >
              <h3 className="font-display text-lg text-slate-800 flex items-center gap-2">
                <span className="text-xl">📋</span>
                计算历史
                {currentRecords.length > 0 && (
                  <span className="min-w-5 h-5 px-1.5 bg-slate-200 text-slate-600 text-xs rounded-full flex items-center justify-center font-medium">
                    {currentRecords.length}
                  </span>
                )}
              </h3>
              {showHistory ? (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              )}
            </div>

            {showHistory && (
              <div className="mt-4">
                {currentRecords.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    <BarChart3 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-sm">暂无计算记录</p>
                    <p className="text-xs mt-1">保存计算结果后可在此查看历史趋势</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentRecords.map((record, idx) => {
                      const prevRecord = currentRecords[idx + 1];
                      const isExpanded = showDetail === record.id;

                      return (
                        <div
                          key={record.id}
                          className="border border-slate-200 rounded-xl overflow-hidden transition-all"
                        >
                          <div
                            className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                            onClick={() => setShowDetail(isExpanded ? null : record.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                                  record.gender === '男'
                                    ? 'bg-gradient-to-br from-mint-400 to-blue-400'
                                    : 'bg-gradient-to-br from-coral-400 to-pink-400'
                                }`}>
                                  {record.gender === '男' ? '♂' : '♀'}
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-700">
                                    {formatMonthAge(record.monthAge)}
                                    <span className="text-xs text-slate-400 ml-2">
                                      {new Date(record.createdAt).toLocaleDateString('zh-CN')}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 mt-0.5">
                                    {record.weightPercentile !== undefined && (
                                      <span className="text-xs text-slate-500">
                                        体重 P{record.weightPercentile.toFixed(0)}
                                        {getTrendIcon(record.weightPercentile, prevRecord?.weightPercentile)}
                                      </span>
                                    )}
                                    {record.heightPercentile !== undefined && (
                                      <span className="text-xs text-slate-500">
                                        身高 P{record.heightPercentile.toFixed(0)}
                                        {getTrendIcon(record.heightPercentile, prevRecord?.heightPercentile)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {record.weightPercentile !== undefined && prevRecord?.weightPercentile !== undefined && (
                                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                                    getTrendLabel(record.weightPercentile, prevRecord.weightPercentile) === '上升'
                                      ? 'bg-mint-50 text-mint-600'
                                      : getTrendLabel(record.weightPercentile, prevRecord.weightPercentile) === '下降'
                                      ? 'bg-coral-50 text-coral-600'
                                      : 'bg-slate-50 text-slate-500'
                                  }`}>
                                    {getTrendLabel(record.weightPercentile, prevRecord.weightPercentile)}
                                  </span>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm('确定删除此条计算记录？')) {
                                      deleteGrowthCalculatorRecord(record.id);
                                    }
                                  }}
                                  className="w-7 h-7 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 flex items-center justify-center transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="px-4 pb-4 border-t border-slate-100">
                              <div className="grid grid-cols-2 gap-3 mt-3">
                                {record.weight !== undefined && (
                                  <div className="p-3 rounded-xl bg-coral-50/50 border border-coral-100/50">
                                    <div className="text-xs text-coral-500 font-medium mb-1">体重</div>
                                    <div className="text-lg font-bold text-slate-800">
                                      {record.weight} kg
                                    </div>
                                    <div className="text-sm text-slate-600">
                                      P{record.weightPercentile?.toFixed(0)}（{record.weightStatus}）
                                    </div>
                                  </div>
                                )}
                                {record.height !== undefined && (
                                  <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100/50">
                                    <div className="text-xs text-blue-500 font-medium mb-1">身高</div>
                                    <div className="text-lg font-bold text-slate-800">
                                      {record.height} cm
                                    </div>
                                    <div className="text-sm text-slate-600">
                                      P{record.heightPercentile?.toFixed(0)}（{record.heightStatus}）
                                    </div>
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 mt-3 leading-relaxed bg-mint-50/50 p-2.5 rounded-lg">
                                {record.conclusion}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {currentRecords.length >= 2 && (
                      <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100/50">
                        <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-purple-500" />
                          趋势变化
                        </h4>
                        <div className="space-y-2">
                          {(() => {
                            const latest = currentRecords[0];
                            const oldest = currentRecords[currentRecords.length - 1];
                            const items: JSX.Element[] = [];

                            if (latest.weightPercentile !== undefined && oldest.weightPercentile !== undefined) {
                              const diff = latest.weightPercentile - oldest.weightPercentile;
                              items.push(
                                <div key="weight" className="flex items-center justify-between text-sm">
                                  <span className="text-slate-600">体重百分位</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-400">P{oldest.weightPercentile!.toFixed(0)} → P{latest.weightPercentile!.toFixed(0)}</span>
                                    <span className={`font-bold ${diff > 3 ? 'text-mint-600' : diff < -3 ? 'text-coral-600' : 'text-slate-500'}`}>
                                      {diff > 0 ? '+' : ''}{diff.toFixed(0)}
                                    </span>
                                  </div>
                                </div>
                              );
                            }

                            if (latest.heightPercentile !== undefined && oldest.heightPercentile !== undefined) {
                              const diff = latest.heightPercentile - oldest.heightPercentile;
                              items.push(
                                <div key="height" className="flex items-center justify-between text-sm">
                                  <span className="text-slate-600">身高百分位</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-400">P{oldest.heightPercentile!.toFixed(0)} → P{latest.heightPercentile!.toFixed(0)}</span>
                                    <span className={`font-bold ${diff > 3 ? 'text-mint-600' : diff < -3 ? 'text-coral-600' : 'text-slate-500'}`}>
                                      {diff > 0 ? '+' : ''}{diff.toFixed(0)}
                                    </span>
                                  </div>
                                </div>
                              );
                            }

                            return items.length > 0 ? items : <p className="text-xs text-slate-400">数据不足</p>;
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
