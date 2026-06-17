import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Printer,
  Download,
  FileText,
  GraduationCap,
  Baby,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  TrendingUp,
} from 'lucide-react';
import { useAppStore } from '@/store';
import {
  formatDate,
  formatMonthAge,
} from '@/utils/dateUtils';
import GrowthChart from '@/components/GrowthChart';
import { calculatePercentileRank, getGrowthData, getGrowthStatus } from '@/data/growthStandards';

type TemplateType = 'nursery' | 'school' | 'full';

const templateInfo: Record<TemplateType, { name: string; desc: string; icon: JSX.Element }> = {
  nursery: {
    name: '入托版',
    desc: '适合幼儿园入园，包含0-3岁核心疫苗和体检记录',
    icon: <Baby className="w-6 h-6" />,
  },
  school: {
    name: '入学版',
    desc: '适合小学入学，包含国家规定全部一类疫苗接种记录',
    icon: <GraduationCap className="w-6 h-6" />,
  },
  full: {
    name: '完整版',
    desc: '完整接种与体检记录，适合存档和查阅',
    icon: <ClipboardList className="w-6 h-6" />,
  },
};

export default function ExportPrintPage() {
  const navigate = useNavigate();
  const {
    child,
    vaccineSchedules,
    vaccineRecords,
    checkupRecords,
  } = useAppStore();

  const [template, setTemplate] = useState<TemplateType>('nursery');
  const [showPreview, setShowPreview] = useState(true);
  const [includeGrowth, setIncludeGrowth] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    vaccine: true,
    checkup: true,
    growth: true,
  });

  const filterRecordsByTemplate = () => {
    let filteredVaccineRecords = [...vaccineRecords];
    let filteredCheckupRecords = [...checkupRecords];
    let maxMonthAge = Infinity;

    if (template === 'nursery') {
      maxMonthAge = 36;
      filteredVaccineRecords = filteredVaccineRecords.filter((r) => {
        const schedule = vaccineSchedules.find((s) => s.id === r.scheduleId);
        return schedule && schedule.monthAge <= maxMonthAge;
      });
      filteredCheckupRecords = filteredCheckupRecords.filter((r) => r.monthAge <= maxMonthAge);
    } else if (template === 'school') {
      maxMonthAge = 84;
      filteredVaccineRecords = filteredVaccineRecords.filter((r) => {
        const schedule = vaccineSchedules.find((s) => s.id === r.scheduleId);
        return schedule && schedule.category === '一类' && schedule.monthAge <= maxMonthAge;
      });
      filteredCheckupRecords = filteredCheckupRecords.filter((r) => r.monthAge <= maxMonthAge);
    }

    filteredVaccineRecords.sort((a, b) => {
      const sa = vaccineSchedules.find((s) => s.id === a.scheduleId);
      const sb = vaccineSchedules.find((s) => s.id === b.scheduleId);
      return (sa?.monthAge || 0) - (sb?.monthAge || 0);
    });

    filteredCheckupRecords.sort((a, b) => a.monthAge - b.monthAge);

    return { filteredVaccineRecords, filteredCheckupRecords };
  };

  const getPendingVaccines = () => {
    if (template === 'full') return [];
    const maxMonthAge = template === 'nursery' ? 36 : 84;
    const category = template === 'school' ? '一类' : undefined;

    return vaccineSchedules.filter((s) => {
      if (s.status === '已接种') return false;
      if (s.monthAge > maxMonthAge) return false;
      if (category && s.category !== category) return false;
      return true;
    });
  };

  const { filteredVaccineRecords, filteredCheckupRecords } = filterRecordsByTemplate();
  const pendingVaccines = getPendingVaccines();

  const maxGrowthMonthAge = template === 'nursery' ? 36 : template === 'school' ? 84 : 84;

  const growthDataPoints = useMemo(() => {
    const weight: { monthAge: number; value: number }[] = [];
    const height: { monthAge: number; value: number }[] = [];
    const headCircumference: { monthAge: number; value: number }[] = [];

    for (const record of filteredCheckupRecords) {
      if (record.weight !== undefined) {
        weight.push({ monthAge: record.monthAge, value: record.weight });
      }
      if (record.height !== undefined) {
        height.push({ monthAge: record.monthAge, value: record.height });
      }
      if (record.headCircumference !== undefined) {
        headCircumference.push({ monthAge: record.monthAge, value: record.headCircumference });
      }
    }

    return {
      weight: weight.sort((a, b) => a.monthAge - b.monthAge),
      height: height.sort((a, b) => a.monthAge - b.monthAge),
      headCircumference: headCircumference.sort((a, b) => a.monthAge - b.monthAge),
    };
  }, [filteredCheckupRecords]);

  const hasGrowthData =
    growthDataPoints.weight.length > 0 ||
    growthDataPoints.height.length > 0 ||
    growthDataPoints.headCircumference.length > 0;

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const exportData: Record<string, unknown> = {
      child,
      exportedAt: new Date().toISOString(),
      template,
      vaccineRecords: filteredVaccineRecords,
      checkupRecords: filteredCheckupRecords,
    };

    if (includeGrowth && hasGrowthData) {
      exportData.growthReport = {
        weight: growthDataPoints.weight,
        height: growthDataPoints.height,
        headCircumference: growthDataPoints.headCircumference,
        standard: 'WHO Child Growth Standards',
      };
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${child?.name || '宝宝'}_${templateInfo[template].name}_接种记录_${formatDate(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!child) {
    return (
      <div className="card text-center py-16 animate-fade-in-up">
        <Baby className="w-16 h-16 mx-auto text-mint-400 mb-4" />
        <h2 className="text-2xl font-display text-slate-700 mb-2">请先录入宝宝信息</h2>
        <p className="text-slate-500 mb-6">录入宝宝出生日期后，即可生成和导出接种与体检记录</p>
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
      <div className="no-print">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display text-slate-800 flex items-center gap-3">
              <span className="text-4xl">🖨️</span>
              导出与打印
            </h1>
            <p className="text-slate-500 mt-1">按入托/入学要求格式化导出和打印接种记录</p>
          </div>
        </div>
      </div>

      <div className="no-print">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.keys(templateInfo) as TemplateType[]).map((key) => {
            const info = templateInfo[key];
            const active = template === key;
            return (
              <div
                key={key}
                className={`card card-hover cursor-pointer border-2 transition-all duration-300 ${
                  active
                    ? 'border-mint-400 bg-gradient-to-br from-mint-50 to-white'
                    : 'border-transparent'
                }`}
                onClick={() => setTemplate(key)}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      active ? 'bg-mint-400 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {info.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-display text-lg ${active ? 'text-mint-600' : 'text-slate-700'}`}>
                        {info.name}
                      </h3>
                      {active && (
                        <CheckCircle2 className="w-5 h-5 text-mint-500" />
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{info.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="no-print">
        <div className="card bg-gradient-to-r from-mint-50 via-coral-50 to-cream-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3">
              <div className="text-3xl font-display text-mint-600">{filteredVaccineRecords.length}</div>
              <div className="text-sm text-slate-500 mt-1">已接种记录</div>
            </div>
            <div className="text-center p-3">
              <div className="text-3xl font-display text-coral-500">{filteredCheckupRecords.length}</div>
              <div className="text-sm text-slate-500 mt-1">已体检记录</div>
            </div>
            <div className="text-center p-3">
              <div className="text-3xl font-display text-amber-500">{pendingVaccines.length}</div>
              <div className="text-sm text-slate-500 mt-1">待接种/未完成</div>
            </div>
            <div className="text-center p-3">
              <div className="text-3xl font-display text-blue-500">
                {filteredVaccineRecords.length + pendingVaccines.length > 0
                  ? Math.round(
                      (filteredVaccineRecords.length /
                        (filteredVaccineRecords.length + pendingVaccines.length)) *
                        100
                    )
                  : 0}
                %
              </div>
              <div className="text-sm text-slate-500 mt-1">完成进度</div>
            </div>
          </div>
        </div>
      </div>

      <div className="no-print">
        <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
          <button
            className="btn-primary flex items-center justify-center gap-2 flex-1 sm:flex-none"
            onClick={() => setShowPreview(!showPreview)}
          >
            <FileText className="w-5 h-5" />
            {showPreview ? '收起预览' : '预览文档'}
          </button>
          <button
            className="btn-secondary flex items-center justify-center gap-2 flex-1 sm:flex-none"
            onClick={handlePrint}
          >
            <Printer className="w-5 h-5" />
            打印文档
          </button>
          <button
            className="btn-outline flex items-center justify-center gap-2 flex-1 sm:flex-none"
            onClick={handleExportJSON}
          >
            <Download className="w-5 h-5" />
            导出 JSON
          </button>
          <button
            className={`flex items-center justify-center gap-2 flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-medium transition-all ${
              includeGrowth
                ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-soft'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
            onClick={() => setIncludeGrowth(!includeGrowth)}
          >
            <TrendingUp className="w-5 h-5" />
            {includeGrowth ? '✓ 含成长曲线' : '含成长曲线'}
          </button>
        </div>
      </div>

      {showPreview && (
        <div className="print-container bg-white border border-slate-200 rounded-2xl shadow-soft-lg overflow-hidden">
          <div className="print-content p-8 md:p-12">
            <div className="text-center border-b-2 border-slate-300 pb-6 mb-8">
              <h1 className="text-3xl md:text-4xl font-display text-slate-800 mb-2">
                {template === 'nursery' && '儿童入托预防接种证查验证明'}
                {template === 'school' && '儿童入学预防接种证查验证明'}
                {template === 'full' && '儿童疫苗接种与健康体检档案'}
              </h1>
              <p className="text-slate-500">
                {template === 'nursery' && '（附 0-3 岁儿童健康检查记录）'}
                {template === 'school' && '（附国家免疫规划一类疫苗接种清单）'}
                {template === 'full' && '（完整版 · 全程记录）'}
              </p>
              <div className="text-sm text-slate-400 mt-4">
                生成日期：{formatDate(new Date(), 'YYYY年MM月DD日')}
              </div>
            </div>

            <div className="mb-10">
              <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-mint-400 rounded-full"></span>
                儿童基本信息
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border border-slate-200 rounded-lg p-3">
                  <div className="text-xs text-slate-400">姓名</div>
                  <div className="font-semibold text-slate-700 mt-1">{child.name}</div>
                </div>
                <div className="border border-slate-200 rounded-lg p-3">
                  <div className="text-xs text-slate-400">性别</div>
                  <div className="font-semibold text-slate-700 mt-1">{child.gender}</div>
                </div>
                <div className="border border-slate-200 rounded-lg p-3">
                  <div className="text-xs text-slate-400">出生日期</div>
                  <div className="font-semibold text-slate-700 mt-1">
                    {formatDate(child.birthDate, 'YYYY年MM月DD日')}
                  </div>
                </div>
                <div className="border border-slate-200 rounded-lg p-3">
                  <div className="text-xs text-slate-400">当前月龄</div>
                  <div className="font-semibold text-slate-700 mt-1">
                    {formatMonthAge(
                      Math.floor(
                        (new Date().getTime() - new Date(child.birthDate).getTime()) /
                          (1000 * 60 * 60 * 24 * 30.44)
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <div
                className="no-print flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => toggleSection('vaccine')}
              >
                <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2">
                  <span className="w-1 h-6 bg-coral-400 rounded-full"></span>
                  疫苗接种记录
                </h2>
                {expandedSections.vaccine ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <h2 className="print-only text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-coral-400 rounded-full"></span>
                疫苗接种记录
              </h2>

              {(expandedSections.vaccine) && (
                <>
                  {filteredVaccineRecords.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">暂无接种记录</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600">序号</th>
                            <th className="border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600">疫苗名称</th>
                            <th className="border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600">剂次</th>
                            <th className="border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600">接种月龄</th>
                            <th className="border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600">接种日期</th>
                            <th className="border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600">接种部位</th>
                            <th className="border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600">生产厂家</th>
                            <th className="border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600">疫苗批号</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredVaccineRecords.map((r, idx) => {
                            const schedule = vaccineSchedules.find((s) => s.id === r.scheduleId);
                            return (
                              <tr key={r.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                <td className="border border-slate-300 px-3 py-2 text-sm text-slate-600 text-center">
                                  {idx + 1}
                                </td>
                                <td className="border border-slate-300 px-3 py-2 text-sm text-slate-700">
                                  {r.vaccineName}
                                  {schedule?.category === '二类' && (
                                    <span className="text-xs text-slate-400 ml-1">(二类)</span>
                                  )}
                                </td>
                                <td className="border border-slate-300 px-3 py-2 text-sm text-slate-600 text-center">
                                  {schedule ? `第${schedule.doseNumber}剂` : '-'}
                                </td>
                                <td className="border border-slate-300 px-3 py-2 text-sm text-slate-600 text-center">
                                  {schedule ? formatMonthAge(schedule.monthAge) : '-'}
                                </td>
                                <td className="border border-slate-300 px-3 py-2 text-sm text-slate-600 text-center">
                                  {formatDate(r.vaccinationDate, 'YYYY年MM月DD日')}
                                </td>
                                <td className="border border-slate-300 px-3 py-2 text-sm text-slate-600 text-center">
                                  {r.site}
                                </td>
                                <td className="border border-slate-300 px-3 py-2 text-sm text-slate-600">
                                  {r.manufacturer || '-'}
                                </td>
                                <td className="border border-slate-300 px-3 py-2 text-sm text-slate-600">
                                  {r.batchNumber || '-'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {pendingVaccines.length > 0 && (
                    <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h3 className="font-semibold text-amber-700 mb-2">⚠️ 待补种疫苗（未完成）</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {pendingVaccines.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between bg-white border border-amber-100 rounded px-3 py-2"
                          >
                            <span className="text-sm text-slate-700">
                              {p.vaccineName}（第{p.doseNumber}剂）
                            </span>
                            <span className="text-xs text-amber-600">
                              建议 {formatDate(p.plannedDate, 'YYYY年MM月DD日')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="mb-10">
              <div
                className="no-print flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => toggleSection('checkup')}
              >
                <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2">
                  <span className="w-1 h-6 bg-blue-400 rounded-full"></span>
                  儿保体检记录
                </h2>
                {expandedSections.checkup ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <h2 className="print-only text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-400 rounded-full"></span>
                儿保体检记录
              </h2>

              {(expandedSections.checkup) && (
                <>
                  {filteredCheckupRecords.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">暂无体检记录</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600">序号</th>
                            <th className="border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600">体检月龄</th>
                            <th className="border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600">体检日期</th>
                            <th className="border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600">体重(kg)</th>
                            <th className="border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600">身高(cm)</th>
                            <th className="border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600">头围(cm)</th>
                            <th className="border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600">BMI</th>
                            <th className="border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600">发育评估</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCheckupRecords.map((r, idx) => (
                            <tr key={r.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                              <td className="border border-slate-300 px-3 py-2 text-sm text-slate-600 text-center">
                                {idx + 1}
                              </td>
                              <td className="border border-slate-300 px-3 py-2 text-sm text-slate-600 text-center">
                                {formatMonthAge(r.monthAge)}
                              </td>
                              <td className="border border-slate-300 px-3 py-2 text-sm text-slate-600 text-center">
                                {formatDate(r.checkupDate, 'YYYY年MM月DD日')}
                              </td>
                              <td className="border border-slate-300 px-3 py-2 text-sm text-slate-600 text-center">
                                {r.weight || '-'}
                              </td>
                              <td className="border border-slate-300 px-3 py-2 text-sm text-slate-600 text-center">
                                {r.height || '-'}
                              </td>
                              <td className="border border-slate-300 px-3 py-2 text-sm text-slate-600 text-center">
                                {r.headCircumference || '-'}
                              </td>
                              <td className="border border-slate-300 px-3 py-2 text-sm text-slate-600 text-center">
                                {r.bmi || '-'}
                              </td>
                              <td className="border border-slate-300 px-3 py-2 text-sm text-slate-600">
                                {r.development || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>

            {includeGrowth && hasGrowthData && (
              <div className="mb-10 page-break-before">
                <div
                  className="no-print flex items-center justify-between mb-4 cursor-pointer"
                  onClick={() => toggleSection('growth')}
                >
                  <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2">
                    <span className="w-1 h-6 bg-purple-400 rounded-full"></span>
                    成长发育曲线图
                  </h2>
                  {expandedSections.growth ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <h2 className="print-only text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-purple-400 rounded-full"></span>
                  成长发育曲线图
                </h2>
                <p className="text-xs text-slate-400 mb-4">基于世界卫生组织（WHO）儿童生长标准绘制</p>

                {(expandedSections.growth) && (
                  <div className="space-y-8">
                    {growthDataPoints.weight.length > 0 && (
                      <div className="border border-slate-200 rounded-xl p-4">
                        <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                          <span>⚖️</span>
                          体重生长曲线
                        </h3>
                        <GrowthChart
                          metric="weight"
                          gender={child.gender}
                          dataPoints={growthDataPoints.weight}
                          maxMonthAge={maxGrowthMonthAge}
                          height={240}
                          showLegend={true}
                        />
                      </div>
                    )}

                    {growthDataPoints.height.length > 0 && (
                      <div className="border border-slate-200 rounded-xl p-4">
                        <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                          <span>📏</span>
                          身高生长曲线
                        </h3>
                        <GrowthChart
                          metric="height"
                          gender={child.gender}
                          dataPoints={growthDataPoints.height}
                          maxMonthAge={maxGrowthMonthAge}
                          height={240}
                          showLegend={true}
                        />
                      </div>
                    )}

                    {growthDataPoints.headCircumference.length > 0 && (
                      <div className="border border-slate-200 rounded-xl p-4">
                        <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                          <span>🧠</span>
                          头围生长曲线
                        </h3>
                        <GrowthChart
                          metric="headCircumference"
                          gender={child.gender}
                          dataPoints={growthDataPoints.headCircumference}
                          maxMonthAge={Math.min(maxGrowthMonthAge, 60)}
                          height={240}
                          showLegend={true}
                        />
                      </div>
                    )}

                    {filteredCheckupRecords.length > 0 && (
                      <div className="border border-slate-200 rounded-xl p-4">
                        <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                          <span>📊</span>
                          百分位评价汇总
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse text-sm">
                            <thead>
                              <tr className="bg-slate-50">
                                <th className="border border-slate-200 px-3 py-2 text-left">月龄</th>
                                <th className="border border-slate-200 px-3 py-2 text-center">体重(kg)</th>
                                <th className="border border-slate-200 px-3 py-2 text-center">体重百分位</th>
                                <th className="border border-slate-200 px-3 py-2 text-center">身高(cm)</th>
                                <th className="border border-slate-200 px-3 py-2 text-center">身高百分位</th>
                                <th className="border border-slate-200 px-3 py-2 text-center">头围(cm)</th>
                                <th className="border border-slate-200 px-3 py-2 text-center">头围百分位</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredCheckupRecords
                                .filter((r) => r.weight !== undefined || r.height !== undefined || r.headCircumference !== undefined)
                                .map((r, idx) => {
                                  const wData = getGrowthData('weight', child.gender);
                                  const hData = getGrowthData('height', child.gender);
                                  const hcData = getGrowthData('headCircumference', child.gender);
                                  
                                  const wPct = r.weight !== undefined ? calculatePercentileRank(r.weight, r.monthAge, wData) : null;
                                  const hPct = r.height !== undefined ? calculatePercentileRank(r.height, r.monthAge, hData) : null;
                                  const hcPct = r.headCircumference !== undefined ? calculatePercentileRank(r.headCircumference, r.monthAge, hcData) : null;
                                  
                                  const wStatus = wPct !== null ? getGrowthStatus(wPct) : null;
                                  const hStatus = hPct !== null ? getGrowthStatus(hPct) : null;
                                  const hcStatus = hcPct !== null ? getGrowthStatus(hcPct) : null;

                                  return (
                                    <tr key={r.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                      <td className="border border-slate-200 px-3 py-2">{formatMonthAge(r.monthAge)}</td>
                                      <td className="border border-slate-200 px-3 py-2 text-center">{r.weight || '-'}</td>
                                      <td className="border border-slate-200 px-3 py-2 text-center">
                                        {wPct !== null ? (
                                          <span className={wStatus!.color}>
                                            P{wPct.toFixed(0)} {wStatus!.label}
                                          </span>
                                        ) : '-'}
                                      </td>
                                      <td className="border border-slate-200 px-3 py-2 text-center">{r.height || '-'}</td>
                                      <td className="border border-slate-200 px-3 py-2 text-center">
                                        {hPct !== null ? (
                                          <span className={hStatus!.color}>
                                            P{hPct.toFixed(0)} {hStatus!.label}
                                          </span>
                                        ) : '-'}
                                      </td>
                                      <td className="border border-slate-200 px-3 py-2 text-center">{r.headCircumference || '-'}</td>
                                      <td className="border border-slate-200 px-3 py-2 text-center">
                                        {hcPct !== null ? (
                                          <span className={hcStatus!.color}>
                                            P{hcPct.toFixed(0)} {hcStatus!.label}
                                          </span>
                                        ) : '-'}
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="mt-16 pt-8 border-t border-slate-200">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-sm text-slate-500 mb-8">家长签字：</div>
                  <div className="border-b border-slate-300 w-full"></div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-2">出具单位（盖章）：</div>
                  <div className="text-xs text-slate-400 mb-6">
                    注：本证明由系统自动生成，具体接种信息以接种单位档案为准。
                  </div>
                  <div className="text-sm text-slate-500 text-right">
                    日期：{formatDate(new Date(), 'YYYY年MM月DD日')}
                  </div>
                </div>
              </div>
            </div>

            <div className="print-only mt-12 pt-8 border-t border-dashed border-slate-300 text-center text-xs text-slate-400">
              — 婴幼儿疫苗接种与儿保体检全程管家 · 自动生成 —
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
