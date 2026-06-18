import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  ChevronDown,
  ChevronUp,
  Printer,
  Shield,
  CheckCircle2,
  XCircle,
  Baby,
  Calendar,
  Package,
  Factory,
  ArrowLeft,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { formatDate, formatMonthAge } from '@/utils/dateUtils';

interface GroupedRecord {
  vaccineName: string;
  vaccineShortName: string;
  category: '一类' | '二类';
  preventDisease: string;
  doses: Array<{
    doseNumber: number;
    monthAge: number;
    status: '已接种' | '待接种' | '已推迟' | '已错过';
    record?: {
      id: string;
      vaccinationDate: string;
      manufacturer: string;
      batchNumber: string;
      site: string;
      doctor?: string;
    };
    scheduleId: string;
  }>;
}

export default function VaccineCertificatePage() {
  const navigate = useNavigate();
  const { children, currentChildId, vaccineSchedules, vaccineRecords } = useAppStore();

  const child = children.find((c) => c.id === currentChildId) || null;
  const currentVaccineSchedules = vaccineSchedules.filter((s) => s.childId === currentChildId);
  const currentVaccineRecords = vaccineRecords.filter((r) => r.childId === currentChildId);

  const [expandedVaccines, setExpandedVaccines] = useState<Record<string, boolean>>({});
  const [filterCategory, setFilterCategory] = useState<'全部' | '一类' | '二类'>('全部');
  const [showOnlyCompleted, setShowOnlyCompleted] = useState(false);

  const toggleVaccine = (vaccineName: string) => {
    setExpandedVaccines((prev) => ({ ...prev, [vaccineName]: !prev[vaccineName] }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    groupedRecords.forEach((g) => {
      allExpanded[g.vaccineName] = true;
    });
    setExpandedVaccines(allExpanded);
  };

  const collapseAll = () => {
    setExpandedVaccines({});
  };

  const groupedRecords = useMemo<GroupedRecord[]>(() => {
    const groups: Record<string, GroupedRecord> = {};

    currentVaccineSchedules.forEach((schedule) => {
      if (!groups[schedule.vaccineName]) {
        groups[schedule.vaccineName] = {
          vaccineName: schedule.vaccineName,
          vaccineShortName: schedule.vaccineShortName,
          category: schedule.category,
          preventDisease: schedule.preventDisease,
          doses: [],
        };
      }

      const record = currentVaccineRecords.find((r) => r.scheduleId === schedule.id);

      groups[schedule.vaccineName].doses.push({
        doseNumber: schedule.doseNumber,
        monthAge: schedule.monthAge,
        status: schedule.status,
        scheduleId: schedule.id,
        record: record
          ? {
              id: record.id,
              vaccinationDate: record.vaccinationDate,
              manufacturer: record.manufacturer,
              batchNumber: record.batchNumber,
              site: record.site,
              doctor: record.doctor,
            }
          : undefined,
      });
    });

    const result = Object.values(groups).map((group) => ({
      ...group,
      doses: group.doses.sort((a, b) => a.doseNumber - b.doseNumber),
    }));

    return result.sort((a, b) => {
      const minMonthA = Math.min(...a.doses.map((d) => d.monthAge));
      const minMonthB = Math.min(...b.doses.map((d) => d.monthAge));
      return minMonthA - minMonthB;
    });
  }, [currentVaccineSchedules, currentVaccineRecords]);

  const filteredGroups = useMemo(() => {
    return groupedRecords.filter((group) => {
      if (filterCategory !== '全部' && group.category !== filterCategory) {
        return false;
      }
      if (showOnlyCompleted) {
        const hasCompleted = group.doses.some((d) => d.status === '已接种');
        if (!hasCompleted) return false;
      }
      return true;
    });
  }, [groupedRecords, filterCategory, showOnlyCompleted]);

  const stats = useMemo(() => {
    const totalDoses = groupedRecords.reduce((sum, g) => sum + g.doses.length, 0);
    const completedDoses = groupedRecords.reduce(
      (sum, g) => sum + g.doses.filter((d) => d.status === '已接种').length,
      0
    );
    const pendingDoses = totalDoses - completedDoses;
    const category1Count = groupedRecords.filter((g) => g.category === '一类').length;
    const category2Count = groupedRecords.filter((g) => g.category === '二类').length;

    return {
      totalDoses,
      completedDoses,
      pendingDoses,
      category1Count,
      category2Count,
      progress: totalDoses > 0 ? Math.round((completedDoses / totalDoses) * 100) : 0,
    };
  }, [groupedRecords]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case '已接种':
        return <CheckCircle2 className="w-5 h-5 text-mint-500" />;
      case '待接种':
        return <XCircle className="w-5 h-5 text-slate-300" />;
      case '已推迟':
        return <XCircle className="w-5 h-5 text-amber-500" />;
      case '已错过':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <XCircle className="w-5 h-5 text-slate-300" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClass = 'px-2 py-0.5 rounded-full text-xs font-medium';
    switch (status) {
      case '已接种':
        return <span className={`${baseClass} bg-mint-100 text-mint-700`}>已接种</span>;
      case '待接种':
        return <span className={`${baseClass} bg-slate-100 text-slate-500`}>待接种</span>;
      case '已推迟':
        return <span className={`${baseClass} bg-amber-100 text-amber-700`}>已推迟</span>;
      case '已错过':
        return <span className={`${baseClass} bg-red-100 text-red-700`}>已错过</span>;
      default:
        return <span className={`${baseClass} bg-slate-100 text-slate-500`}>未知</span>;
    }
  };

  if (!child) {
    return (
      <div className="card text-center py-16 animate-fade-in-up">
        <Baby className="w-16 h-16 mx-auto text-mint-400 mb-4" />
        <h2 className="text-2xl font-display text-slate-700 mb-2">请先录入宝宝信息</h2>
        <p className="text-slate-500 mb-6">录入宝宝出生日期后，即可生成电子接种证</p>
        <button className="btn-primary" onClick={() => navigate('/child-info')}>
          去录入宝宝信息
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-4 no-print">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-display text-slate-800 flex items-center gap-3">
            <span className="text-4xl">📘</span>
            电子接种证
          </h1>
          <p className="text-slate-500 mt-1">国家预防接种证格式 · 疫苗接种记录一览表</p>
        </div>
      </div>

      <div className="card bg-gradient-to-r from-mint-50 via-coral-50 to-cream-50 no-print">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3">
            <div className="text-3xl font-display text-mint-600">{stats.completedDoses}</div>
            <div className="text-sm text-slate-500 mt-1">已接种剂次</div>
          </div>
          <div className="text-center p-3">
            <div className="text-3xl font-display text-slate-600">{stats.totalDoses}</div>
            <div className="text-sm text-slate-500 mt-1">总剂次</div>
          </div>
          <div className="text-center p-3">
            <div className="text-3xl font-display text-coral-500">{stats.pendingDoses}</div>
            <div className="text-sm text-slate-500 mt-1">待接种</div>
          </div>
          <div className="text-center p-3">
            <div className="text-3xl font-display text-blue-500">{stats.progress}%</div>
            <div className="text-sm text-slate-500 mt-1">完成进度</div>
          </div>
        </div>
      </div>

      <div className="card no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-mint-500" />
            <div>
              <h2 className="font-semibold text-lg text-slate-800">儿童基本信息</h2>
              <p className="text-sm text-slate-500">预防接种证电子化备案</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              className="btn-outline flex items-center gap-2"
              onClick={expandAll}
            >
              展开全部
            </button>
            <button
              className="btn-outline flex items-center gap-2"
              onClick={collapseAll}
            >
              收起全部
            </button>
            <button
              className="btn-primary flex items-center gap-2"
              onClick={() => navigate('/export?template=certificate')}
            >
              <Printer className="w-4 h-4" />
              打印接种证
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
            <div className="text-xs text-slate-400">姓名</div>
            <div className="font-semibold text-slate-700 mt-1">{child.name}</div>
          </div>
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
            <div className="text-xs text-slate-400">性别</div>
            <div className="font-semibold text-slate-700 mt-1">{child.gender}</div>
          </div>
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
            <div className="text-xs text-slate-400">出生日期</div>
            <div className="font-semibold text-slate-700 mt-1">
              {formatDate(child.birthDate, 'YYYY年MM月DD日')}
            </div>
          </div>
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
            <div className="text-xs text-slate-400">疫苗类别</div>
            <div className="font-semibold text-slate-700 mt-1">
              一类 {stats.category1Count} 种 · 二类 {stats.category2Count} 种
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 no-print">
        <div className="flex gap-2">
          {(['全部', '一类', '二类'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                filterCategory === cat
                  ? 'bg-mint-400 text-white shadow-soft'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {cat === '全部' ? '全部疫苗' : cat + '疫苗'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyCompleted}
              onChange={(e) => setShowOnlyCompleted(e.target.checked)}
              className="w-4 h-4 text-mint-400 rounded focus:ring-mint-400"
            />
            <span className="text-sm text-slate-600">仅显示已接种</span>
          </label>
        </div>
      </div>

      <div className="space-y-3">
        {filteredGroups.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">暂无符合条件的疫苗记录</p>
          </div>
        ) : (
          filteredGroups.map((group) => {
            const isExpanded = expandedVaccines[group.vaccineName];
            const completedCount = group.doses.filter((d) => d.status === '已接种').length;
            const allCompleted = completedCount === group.doses.length;

            return (
              <div key={group.vaccineName} className="card overflow-hidden p-0">
                <div
                  className={`p-5 cursor-pointer transition-colors ${
                    isExpanded ? 'bg-mint-50/50' : 'hover:bg-slate-50'
                  }`}
                  onClick={() => toggleVaccine(group.vaccineName)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          allCompleted
                            ? 'bg-gradient-to-br from-mint-400 to-mint-500'
                            : 'bg-gradient-to-br from-slate-200 to-slate-300'
                        }`}
                      >
                        <Shield
                          className={`w-6 h-6 ${
                            allCompleted ? 'text-white' : 'text-slate-500'
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg text-slate-800">
                            {group.vaccineName}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              group.category === '一类'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {group.category}
                          </span>
                          {allCompleted && (
                            <CheckCircle2 className="w-5 h-5 text-mint-500" />
                          )}
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">
                          预防：{group.preventDisease} · 共 {group.doses.length} 剂 · 已完成{' '}
                          {completedCount}/{group.doses.length}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-mint-400 to-mint-500 rounded-full transition-all"
                          style={{
                            width: `${(completedCount / group.doses.length) * 100}%`,
                          }}
                        />
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600 w-20">
                              剂次
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600 w-24">
                              接种月龄
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                接种日期
                              </span>
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">
                              <span className="flex items-center gap-1">
                                <Factory className="w-4 h-4" />
                                生产厂家
                              </span>
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">
                              <span className="flex items-center gap-1">
                                <Package className="w-4 h-4" />
                                疫苗批号
                              </span>
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600 w-28">
                              接种部位
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600 w-20">
                              状态
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.doses.map((dose, idx) => (
                            <tr
                              key={dose.scheduleId}
                              className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(dose.status)}
                                  <span className="font-medium text-slate-700">
                                    第{dose.doseNumber}剂
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-slate-600">
                                {formatMonthAge(dose.monthAge)}
                              </td>
                              <td className="px-4 py-3 text-slate-700">
                                {dose.record ? (
                                  <span className="font-medium">
                                    {formatDate(dose.record.vaccinationDate, 'YYYY年MM月DD日')}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-slate-700">
                                {dose.record?.manufacturer || (
                                  <span className="text-slate-400">-</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-slate-700 font-mono text-sm">
                                {dose.record?.batchNumber || (
                                  <span className="text-slate-400">-</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-slate-600">
                                {dose.record?.site || (
                                  <span className="text-slate-400">-</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {getStatusBadge(dose.status)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="card border-amber-200 bg-amber-50/50 print-only">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-800">说明</h3>
            <p className="text-sm text-amber-700 mt-1">
              1. 本电子接种证由系统根据接种记录自动生成，具体接种信息以接种单位档案为准。<br />
              2. 疫苗批号和生产厂家由接种时录入，如信息不全请联系接种单位补充。<br />
              3. 入托、入学时可凭此打印件或前往接种单位开具正式查验证明。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
