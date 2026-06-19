import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight,
  ChevronDown,
  Printer,
  Camera,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowLeft,
  Baby,
  Scale,
  Ruler,
  CircleDot,
  Brain,
  Stethoscope,
  Activity,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { formatDate, formatMonthAge } from '@/utils/dateUtils';
import {
  calculatePercentileRank,
  getGrowthData,
} from '@/data/growthStandards';
import { DEVELOPMENT_DIMENSIONS } from '@/data/milestones';

type ChangeDirection = 'improve' | 'same' | 'decline';

interface CompareItem {
  label: string;
  unit?: string;
  value1: number | string | undefined;
  value2: number | string | undefined;
  change: number | undefined;
  direction: ChangeDirection;
  isNumeric: boolean;
  higherIsBetter: boolean;
  icon?: JSX.Element;
}

export default function CheckupComparePage() {
  const navigate = useNavigate();
  const { children, currentChildId, checkupRecords, milestoneAssessments } = useAppStore();
  const compareRef = useRef<HTMLDivElement>(null);

  const child = children.find((c) => c.id === currentChildId) || null;
  const currentCheckupRecords = useMemo(
    () =>
      checkupRecords
        .filter((r) => r.childId === currentChildId)
        .sort((a, b) => a.monthAge - b.monthAge),
    [checkupRecords, currentChildId]
  );
  const currentMilestoneAssessments = useMemo(
    () =>
      milestoneAssessments
        .filter((a) => a.childId === currentChildId)
        .sort((a, b) => a.checklistMonthAge - b.checklistMonthAge),
    [milestoneAssessments, currentChildId]
  );

  const [record1Id, setRecord1Id] = useState<string>(
    currentCheckupRecords[0]?.id || ''
  );
  const [record2Id, setRecord2Id] = useState<string>(
    currentCheckupRecords[currentCheckupRecords.length - 1]?.id || ''
  );
  const [showSelector1, setShowSelector1] = useState(false);
  const [showSelector2, setShowSelector2] = useState(false);

  const record1 = currentCheckupRecords.find((r) => r.id === record1Id);
  const record2 = currentCheckupRecords.find((r) => r.id === record2Id);

  const milestone1 = record1
    ? currentMilestoneAssessments.find(
        (a) => a.checklistMonthAge === record1.monthAge
      )
    : undefined;
  const milestone2 = record2
    ? currentMilestoneAssessments.find(
        (a) => a.checklistMonthAge === record2.monthAge
      )
    : undefined;

  const calculateChange = (
    v1: number | undefined,
    v2: number | undefined,
    higherIsBetter: boolean = true
  ): { change: number | undefined; direction: ChangeDirection } => {
    if (v1 === undefined || v2 === undefined) {
      return { change: undefined, direction: 'same' };
    }
    const diff = v2 - v1;
    if (diff === 0) return { change: 0, direction: 'same' };
    if (higherIsBetter) {
      return {
        change: diff,
        direction: diff > 0 ? 'improve' : 'decline',
      };
    } else {
      return {
        change: diff,
        direction: diff < 0 ? 'improve' : 'decline',
      };
    }
  };

  const physicalItems: CompareItem[] = useMemo(() => {
    if (!record1 || !record2) return [];

    const items: CompareItem[] = [];

    if (record1.weight !== undefined || record2.weight !== undefined) {
      const { change, direction } = calculateChange(
        record1.weight,
        record2.weight
      );
      items.push({
        label: '体重',
        unit: 'kg',
        value1: record1.weight,
        value2: record2.weight,
        change,
        direction,
        isNumeric: true,
        higherIsBetter: true,
        icon: <Scale className="w-5 h-5" />,
      });
    }

    if (record1.height !== undefined || record2.height !== undefined) {
      const { change, direction } = calculateChange(
        record1.height,
        record2.height
      );
      items.push({
        label: '身高',
        unit: 'cm',
        value1: record1.height,
        value2: record2.height,
        change,
        direction,
        isNumeric: true,
        higherIsBetter: true,
        icon: <Ruler className="w-5 h-5" />,
      });
    }

    if (
      record1.headCircumference !== undefined ||
      record2.headCircumference !== undefined
    ) {
      const { change, direction } = calculateChange(
        record1.headCircumference,
        record2.headCircumference
      );
      items.push({
        label: '头围',
        unit: 'cm',
        value1: record1.headCircumference,
        value2: record2.headCircumference,
        change,
        direction,
        isNumeric: true,
        higherIsBetter: true,
        icon: <CircleDot className="w-5 h-5" />,
      });
    }

    if (record1.bmi || record2.bmi) {
      items.push({
        label: 'BMI评价',
        value1: record1.bmi || '-',
        value2: record2.bmi || '-',
        change: undefined,
        direction: 'same',
        isNumeric: false,
        higherIsBetter: true,
        icon: <Activity className="w-5 h-5" />,
      });
    }

    return items;
  }, [record1, record2]);

  const percentileItems: CompareItem[] = useMemo(() => {
    if (!record1 || !record2 || !child) return [];

    const items: CompareItem[] = [];
    const metrics: Array<{
      key: 'weight' | 'height' | 'headCircumference';
      label: string;
    }> = [
      { key: 'weight', label: '体重百分位' },
      { key: 'height', label: '身高百分位' },
      { key: 'headCircumference', label: '头围百分位' },
    ];

    for (const { key, label } of metrics) {
      const v1 = record1[key];
      const v2 = record2[key];
      if (v1 === undefined && v2 === undefined) continue;

      const growthData = getGrowthData(key, child.gender);
      const pct1 =
        v1 !== undefined
          ? calculatePercentileRank(v1, record1.monthAge, growthData)
          : undefined;
      const pct2 =
        v2 !== undefined
          ? calculatePercentileRank(v2, record2.monthAge, growthData)
          : undefined;

      const { change, direction } = calculateChange(pct1, pct2);

      items.push({
        label,
        unit: '',
        value1: pct1 !== undefined ? `P${pct1.toFixed(0)}` : '-',
        value2: pct2 !== undefined ? `P${pct2.toFixed(0)}` : '-',
        change,
        direction,
        isNumeric: true,
        higherIsBetter: true,
      });
    }

    return items;
  }, [record1, record2, child]);

  const developmentItems: CompareItem[] = useMemo(() => {
    if (!record1 || !record2) return [];

    const items: CompareItem[] = [];

    if (record1.development || record2.development) {
      items.push({
        label: '发育评估',
        value1: record1.development || '-',
        value2: record2.development || '-',
        change: undefined,
        direction: 'same',
        isNumeric: false,
        higherIsBetter: true,
        icon: <Brain className="w-5 h-5" />,
      });
    }

    if (record1.doctorAdvice || record2.doctorAdvice) {
      items.push({
        label: '医生建议',
        value1: record1.doctorAdvice || '-',
        value2: record2.doctorAdvice || '-',
        change: undefined,
        direction: 'same',
        isNumeric: false,
        higherIsBetter: true,
        icon: <Stethoscope className="w-5 h-5" />,
      });
    }

    return items;
  }, [record1, record2]);

  const milestoneItems: CompareItem[] = useMemo(() => {
    if (!milestone1 || !milestone2) return [];

    const items: CompareItem[] = [];

    for (const dim of DEVELOPMENT_DIMENSIONS) {
      const { change, direction } = calculateChange(
        milestone1.scores[dim],
        milestone2.scores[dim]
      );
      items.push({
        label: dim,
        value1: milestone1.scores[dim],
        value2: milestone2.scores[dim],
        change,
        direction,
        isNumeric: true,
        higherIsBetter: true,
      });
    }

    const { change: totalChange, direction: totalDirection } = calculateChange(
      milestone1.totalScore,
      milestone2.totalScore
    );
    items.push({
      label: '综合得分',
      value1: milestone1.totalScore,
      value2: milestone2.totalScore,
      change: totalChange,
      direction: totalDirection,
      isNumeric: true,
      higherIsBetter: true,
    });

    items.push({
      label: '评估等级',
      value1: milestone1.level,
      value2: milestone2.level,
      change: undefined,
      direction: 'same',
      isNumeric: false,
      higherIsBetter: true,
    });

    return items;
  }, [milestone1, milestone2]);

  const getDirectionIcon = (direction: ChangeDirection) => {
    switch (direction) {
      case 'improve':
        return <TrendingUp className="w-4 h-4" />;
      case 'decline':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getDirectionColor = (direction: ChangeDirection) => {
    switch (direction) {
      case 'improve':
        return 'text-mint-600 bg-mint-50';
      case 'decline':
        return 'text-coral-600 bg-coral-50';
      default:
        return 'text-slate-500 bg-slate-50';
    }
  };

  const getDirectionLabel = (direction: ChangeDirection) => {
    switch (direction) {
      case 'improve':
        return '改善';
      case 'decline':
        return '退步';
      default:
        return '持平';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportImage = async () => {
    if (!compareRef.current) return;

    try {
      const canvas = await html2canvasFromElement(compareRef.current);
      const link = document.createElement('a');
      link.download = `${child?.name || '宝宝'}_体检对比报告_${formatDate(new Date())}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      alert('截图生成失败，请使用浏览器截图功能或打印功能');
    }
  };

  const html2canvasFromElement = (element: HTMLElement): Promise<HTMLCanvasElement> => {
    return new Promise((resolve, reject) => {
      const rect = element.getBoundingClientRect();
      const scale = window.devicePixelRatio || 2;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('无法获取画布上下文'));
        return;
      }

      canvas.width = rect.width * scale;
      canvas.height = rect.height * scale;
      ctx.scale(scale, scale);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, rect.width, rect.height);

      const svgData = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: 'Noto Sans SC', sans-serif;">
              ${element.outerHTML}
            </div>
          </foreignObject>
        </svg>
      `;

      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        URL.revokeObjectURL(url);
        resolve(canvas);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('图片加载失败'));
      };

      img.src = url;
    });
  };

  const handleSwap = () => {
    setRecord1Id(record2Id);
    setRecord2Id(record1Id);
  };

  if (!child) {
    return (
      <div className="card text-center py-16 animate-fade-in-up">
        <Baby className="w-16 h-16 mx-auto text-mint-400 mb-4" />
        <h2 className="text-2xl font-display text-slate-700 mb-2">请先录入宝宝信息</h2>
        <p className="text-slate-500 mb-6">录入宝宝信息后，即可进行体检记录对比</p>
        <button
          className="btn-primary"
          onClick={() => navigate('/child-info')}
        >
          去录入宝宝信息
        </button>
      </div>
    );
  }

  if (currentCheckupRecords.length < 2) {
    return (
      <div className="card text-center py-16 animate-fade-in-up">
        <Stethoscope className="w-16 h-16 mx-auto text-coral-400 mb-4" />
        <h2 className="text-2xl font-display text-slate-700 mb-2">体检记录不足</h2>
        <p className="text-slate-500 mb-6">
          至少需要2条体检记录才能进行对比，当前只有 {currentCheckupRecords.length} 条
        </p>
        <div className="flex gap-3 justify-center">
          <button
            className="btn-outline flex items-center gap-2"
            onClick={() => navigate('/records')}
          >
            <ArrowLeft className="w-4 h-4" />
            返回记录管理
          </button>
          <button
            className="btn-primary"
            onClick={() => navigate('/checkup-schedule')}
          >
            去录入体检记录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="no-print flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/records')}
            className="w-10 h-10 rounded-xl bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors shadow-soft"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-display text-slate-800 flex items-center gap-3">
              <span className="text-4xl">📊</span>
              体检报告对比
            </h1>
            <p className="text-slate-500 mt-1">
              并排对比两次体检记录，直观查看生长发育变化趋势
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            className="btn-secondary flex items-center gap-2"
            onClick={handleExportImage}
          >
            <Camera className="w-5 h-5" />
            截图分享
          </button>
          <button
            className="btn-primary flex items-center gap-2"
            onClick={handlePrint}
          >
            <Printer className="w-5 h-5" />
            打印报告
          </button>
        </div>
      </div>

      <div className="no-print card">
        <h3 className="font-display text-lg text-slate-800 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-coral-500" />
          选择要对比的两次体检记录
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          <div className="md:col-span-2">
            <label className="label-field">第一次体检</label>
            <div className="relative">
              <button
                onClick={() => {
                  setShowSelector1(!showSelector1);
                  setShowSelector2(false);
                }}
                className="w-full input-field flex items-center justify-between text-left"
              >
                <span className="font-medium text-slate-700">
                  {record1
                    ? `${formatMonthAge(record1.monthAge)} · ${formatDate(record1.checkupDate, 'YYYY-MM-DD')}`
                    : '请选择'}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform ${
                    showSelector1 ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {showSelector1 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-soft-lg border border-slate-100 max-h-64 overflow-y-auto z-20">
                  {currentCheckupRecords.map((r) => (
                    <div
                      key={r.id}
                      className={`px-4 py-3 cursor-pointer transition-colors hover:bg-mint-50 ${
                        r.id === record1Id ? 'bg-mint-50 text-mint-700' : 'text-slate-700'
                      }`}
                      onClick={() => {
                        setRecord1Id(r.id);
                        setShowSelector1(false);
                      }}
                    >
                      <div className="font-medium">{formatMonthAge(r.monthAge)}</div>
                      <div className="text-xs text-slate-400">
                        {formatDate(r.checkupDate, 'YYYY年MM月DD日')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleSwap}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-mint-400 to-coral-400 text-white flex items-center justify-center shadow-soft hover:shadow-glow-mint transition-all hover:scale-105 active:scale-95"
              title="交换对比"
            >
              <ArrowLeftRight className="w-5 h-5" />
            </button>
          </div>

          <div className="md:col-span-2">
            <label className="label-field">第二次体检</label>
            <div className="relative">
              <button
                onClick={() => {
                  setShowSelector2(!showSelector2);
                  setShowSelector1(false);
                }}
                className="w-full input-field flex items-center justify-between text-left"
              >
                <span className="font-medium text-slate-700">
                  {record2
                    ? `${formatMonthAge(record2.monthAge)} · ${formatDate(record2.checkupDate, 'YYYY-MM-DD')}`
                    : '请选择'}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform ${
                    showSelector2 ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {showSelector2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-soft-lg border border-slate-100 max-h-64 overflow-y-auto z-20">
                  {currentCheckupRecords.map((r) => (
                    <div
                      key={r.id}
                      className={`px-4 py-3 cursor-pointer transition-colors hover:bg-coral-50 ${
                        r.id === record2Id ? 'bg-coral-50 text-coral-700' : 'text-slate-700'
                      }`}
                      onClick={() => {
                        setRecord2Id(r.id);
                        setShowSelector2(false);
                      }}
                    >
                      <div className="font-medium">{formatMonthAge(r.monthAge)}</div>
                      <div className="text-xs text-slate-400">
                        {formatDate(r.checkupDate, 'YYYY年MM月DD日')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {record1 && record2 && (
        <div ref={compareRef} className="bg-white rounded-2xl shadow-soft border border-mint-50/50 overflow-hidden">
          <div className="p-6 md:p-8 bg-gradient-to-r from-mint-50 via-white to-coral-50 border-b border-slate-100">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-display text-slate-800 mb-2">
                宝宝体检对比报告
              </h2>
              <p className="text-slate-500">
                {child.name} · {child.gender} · 出生日期 {formatDate(child.birthDate, 'YYYY年MM月DD日')}
              </p>
              <div className="text-sm text-slate-400 mt-2">
                生成日期：{formatDate(new Date(), 'YYYY年MM月DD日')}
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            <div className="grid grid-cols-3 gap-4 items-stretch">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 text-center">
                <div className="text-xs text-blue-600 font-medium mb-1">第一次体检</div>
                <div className="text-xl font-bold text-blue-700 font-display">
                  {formatMonthAge(record1.monthAge)}
                </div>
                <div className="text-xs text-blue-500/80 mt-1">
                  {formatDate(record1.checkupDate, 'YYYY-MM-DD')}
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mint-400 to-coral-400 flex items-center justify-center text-white">
                  <ArrowLeftRight className="w-5 h-5" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-coral-50 to-coral-100/50 rounded-2xl p-5 text-center">
                <div className="text-xs text-coral-600 font-medium mb-1">第二次体检</div>
                <div className="text-xl font-bold text-coral-700 font-display">
                  {formatMonthAge(record2.monthAge)}
                </div>
                <div className="text-xs text-coral-500/80 mt-1">
                  {formatDate(record2.checkupDate, 'YYYY-MM-DD')}
                </div>
              </div>
            </div>

            {physicalItems.length > 0 && (
              <section>
                <h3 className="text-lg font-display text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-gradient-to-b from-mint-400 to-coral-400 rounded-full"></span>
                  体格测量对比
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-600 w-28">
                          项目
                        </th>
                        <th className="border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-blue-600">
                          {formatMonthAge(record1.monthAge)}
                        </th>
                        <th className="border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-coral-600">
                          {formatMonthAge(record2.monthAge)}
                        </th>
                        <th className="border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-600 w-28">
                          变化值
                        </th>
                        <th className="border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-600 w-24">
                          趋势
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {physicalItems.map((item, idx) => (
                        <tr key={item.label} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}>
                          <td className="border border-slate-200 px-4 py-3 font-medium text-slate-700">
                            {item.icon && <span className="mr-2 inline-flex">{item.icon}</span>}
                            {item.label}
                          </td>
                          <td className="border border-slate-200 px-4 py-3 text-center text-slate-700">
                            {item.value1 !== undefined && item.value1 !== '-' ? (
                              <span className="font-semibold text-lg">
                                {item.value1}
                                {item.unit && (
                                  <span className="text-sm font-normal text-slate-400 ml-0.5">
                                    {item.unit}
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="border border-slate-200 px-4 py-3 text-center text-slate-700">
                            {item.value2 !== undefined && item.value2 !== '-' ? (
                              <span className="font-semibold text-lg">
                                {item.value2}
                                {item.unit && (
                                  <span className="text-sm font-normal text-slate-400 ml-0.5">
                                    {item.unit}
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="border border-slate-200 px-4 py-3 text-center">
                            {item.change !== undefined ? (
                              <span
                                className={`font-semibold ${
                                  item.direction === 'improve'
                                    ? 'text-mint-600'
                                    : item.direction === 'decline'
                                    ? 'text-coral-600'
                                    : 'text-slate-500'
                                }`}
                              >
                                {item.change > 0 ? '+' : ''}
                                {item.change.toFixed(item.change % 1 === 0 ? 0 : 2)}
                                {item.unit && (
                                  <span className="text-xs font-normal ml-0.5">{item.unit}</span>
                                )}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="border border-slate-200 px-4 py-3 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getDirectionColor(
                                item.direction
                              )}`}
                            >
                              {getDirectionIcon(item.direction)}
                              {getDirectionLabel(item.direction)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {percentileItems.length > 0 && (
              <section>
                <h3 className="text-lg font-display text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full"></span>
                  生长百分位对比
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-600 w-32">
                          项目
                        </th>
                        <th className="border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-blue-600">
                          {formatMonthAge(record1.monthAge)}
                        </th>
                        <th className="border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-coral-600">
                          {formatMonthAge(record2.monthAge)}
                        </th>
                        <th className="border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-600 w-28">
                          变化
                        </th>
                        <th className="border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-600 w-24">
                          趋势
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {percentileItems.map((item, idx) => (
                        <tr key={item.label} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}>
                          <td className="border border-slate-200 px-4 py-3 font-medium text-slate-700">
                            {item.label}
                          </td>
                          <td className="border border-slate-200 px-4 py-3 text-center text-slate-700 font-semibold">
                            {item.value1}
                          </td>
                          <td className="border border-slate-200 px-4 py-3 text-center text-slate-700 font-semibold">
                            {item.value2}
                          </td>
                          <td className="border border-slate-200 px-4 py-3 text-center">
                            {item.change !== undefined ? (
                              <span
                                className={`font-semibold ${
                                  item.direction === 'improve'
                                    ? 'text-mint-600'
                                    : item.direction === 'decline'
                                    ? 'text-coral-600'
                                    : 'text-slate-500'
                                }`}
                              >
                                {item.change > 0 ? '+' : ''}
                                {item.change.toFixed(0)}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="border border-slate-200 px-4 py-3 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getDirectionColor(
                                item.direction
                              )}`}
                            >
                              {getDirectionIcon(item.direction)}
                              {getDirectionLabel(item.direction)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  基于世界卫生组织（WHO）儿童生长标准计算
                </p>
              </section>
            )}

            {milestoneItems.length > 0 && milestone1 && milestone2 && (
              <section>
                <h3 className="text-lg font-display text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-gradient-to-b from-pink-400 to-purple-400 rounded-full"></span>
                  发育里程碑评估对比
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-600 w-32">
                          维度
                        </th>
                        <th className="border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-blue-600">
                          {formatMonthAge(milestone1.checklistMonthAge)}
                        </th>
                        <th className="border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-coral-600">
                          {formatMonthAge(milestone2.checklistMonthAge)}
                        </th>
                        <th className="border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-600 w-28">
                          变化
                        </th>
                        <th className="border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-600 w-24">
                          趋势
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {milestoneItems.map((item, idx) => (
                        <tr
                          key={item.label}
                          className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'} ${
                            item.label === '综合得分' || item.label === '评估等级'
                              ? 'bg-mint-50/30 font-semibold'
                              : ''
                          }`}
                        >
                          <td className="border border-slate-200 px-4 py-3 font-medium text-slate-700">
                            {item.label}
                          </td>
                          <td className="border border-slate-200 px-4 py-3 text-center text-slate-700">
                            {item.value1}
                          </td>
                          <td className="border border-slate-200 px-4 py-3 text-center text-slate-700">
                            {item.value2}
                          </td>
                          <td className="border border-slate-200 px-4 py-3 text-center">
                            {item.change !== undefined ? (
                              <span
                                className={`font-semibold ${
                                  item.direction === 'improve'
                                    ? 'text-mint-600'
                                    : item.direction === 'decline'
                                    ? 'text-coral-600'
                                    : 'text-slate-500'
                                }`}
                              >
                                {item.change > 0 ? '+' : ''}
                                {item.change}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="border border-slate-200 px-4 py-3 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getDirectionColor(
                                item.direction
                              )}`}
                            >
                              {getDirectionIcon(item.direction)}
                              {getDirectionLabel(item.direction)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {developmentItems.length > 0 && (
              <section>
                <h3 className="text-lg font-display text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-gradient-to-b from-amber-400 to-orange-400 rounded-full"></span>
                  发育评估与建议
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {developmentItems.map((item) => (
                    <div
                      key={item.label}
                      className="grid grid-cols-2 gap-4 border border-slate-200 rounded-2xl overflow-hidden"
                    >
                      <div className="bg-blue-50 p-4">
                        <div className="text-xs text-blue-600 font-medium mb-2">
                          {formatMonthAge(record1.monthAge)}
                        </div>
                        <div className="text-sm font-semibold text-blue-700 mb-1">{item.label}</div>
                        <div className="text-sm text-slate-600 leading-relaxed">
                          {item.value1}
                        </div>
                      </div>
                      <div className="bg-coral-50 p-4">
                        <div className="text-xs text-coral-600 font-medium mb-2">
                          {formatMonthAge(record2.monthAge)}
                        </div>
                        <div className="text-sm font-semibold text-coral-700 mb-1">{item.label}</div>
                        <div className="text-sm text-slate-600 leading-relaxed">
                          {item.value2}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="p-5 rounded-2xl bg-gradient-to-r from-mint-50 via-white to-coral-50 border border-mint-100">
              <h4 className="font-display text-base text-slate-700 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-coral-500" />
                对比小结
              </h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-mint-600">
                    {
                      [...physicalItems, ...percentileItems, ...milestoneItems].filter(
                        (i) => i.direction === 'improve'
                      ).length
                    }
                  </div>
                  <div className="text-xs text-slate-500 mt-1">指标改善</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-500">
                    {
                      [...physicalItems, ...percentileItems, ...milestoneItems].filter(
                        (i) => i.direction === 'same' && i.change !== undefined
                      ).length
                    }
                  </div>
                  <div className="text-xs text-slate-500 mt-1">基本持平</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-coral-500">
                    {
                      [...physicalItems, ...percentileItems, ...milestoneItems].filter(
                        (i) => i.direction === 'decline'
                      ).length
                    }
                  </div>
                  <div className="text-xs text-slate-500 mt-1">需要关注</div>
                </div>
              </div>
              <p className="text-xs text-slate-400 text-center mt-4">
                两次体检间隔 {Math.abs(record2.monthAge - record1.monthAge)} 个月
              </p>
            </section>
          </div>

          <div className="p-6 border-t border-slate-100 bg-slate-50/50 text-center">
            <p className="text-xs text-slate-400">
              本报告由育儿管家系统自动生成，仅供参考，具体以医生诊断为准
            </p>
          </div>
        </div>
      )}

      <div className="no-print flex gap-3 justify-center">
        <button className="btn-outline flex items-center gap-2" onClick={() => navigate('/records')}>
          <ArrowLeft className="w-4 h-4" />
          返回记录管理
        </button>
      </div>
    </div>
  );
}
