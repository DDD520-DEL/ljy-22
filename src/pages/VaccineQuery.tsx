import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Syringe,
  Calendar,
  Pill,
  AlertCircle,
  Tag,
  ExternalLink,
  X,
  Sparkles,
  Baby,
} from 'lucide-react';
import { VACCINE_DEFINITIONS } from '@/data/vaccines';
import { formatMonthAge } from '@/utils/dateUtils';
import type { VaccineDefinition } from '@/types';

export default function VaccineQueryPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVaccine, setSelectedVaccine] = useState<VaccineDefinition | null>(null);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return VACCINE_DEFINITIONS.filter((vaccine) => {
      const nameMatch =
        vaccine.name.toLowerCase().includes(query) ||
        vaccine.shortName.toLowerCase().includes(query) ||
        vaccine.code.toLowerCase().includes(query);
      const diseaseMatch = vaccine.preventDisease.toLowerCase().includes(query);
      return nameMatch || diseaseMatch;
    });
  }, [searchQuery]);

  const getAgeRange = (vaccine: VaccineDefinition) => {
    const minAge = Math.min(...vaccine.doses.map((d) => d.monthAgeMin));
    const maxAge = Math.max(...vaccine.doses.map((d) => d.monthAgeMax));
    return `${formatMonthAge(minAge)} - ${formatMonthAge(maxAge)}`;
  };

  const getDoseCount = (vaccine: VaccineDefinition) => {
    return vaccine.doses.length;
  };

  const handleGoToSchedule = (vaccine: VaccineDefinition) => {
    navigate('/vaccine-schedule', { state: { highlightVaccineCode: vaccine.code } });
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedVaccine(null);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-display text-slate-800 flex items-center gap-3">
          <span className="text-4xl">🔍</span>
          疫苗查询
        </h1>
        <p className="text-slate-500 mt-1">
          搜索疫苗名称或预防疾病名称，快速了解疫苗详细信息
        </p>
      </div>

      <div className="card">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            className="input-field pl-12 pr-12 py-4 text-lg"
            placeholder="输入疫苗名称或预防疾病名称，如：乙肝、肺炎、麻疹..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          )}
        </div>

        {searchQuery && (
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>
              找到 <strong className="text-mint-600">{searchResults.length}</strong> 个相关疫苗
            </span>
          </div>
        )}
      </div>

      {!searchQuery && (
        <div className="card text-center py-16">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-mint-100 to-coral-100 flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-mint-500" />
          </div>
          <h2 className="text-xl font-display text-slate-700 mb-2">输入关键词开始搜索</h2>
          <p className="text-slate-500 mb-6">
            您可以搜索疫苗名称（如：乙肝疫苗、五联疫苗）<br />
            或预防疾病名称（如：肺炎、脑膜炎、水痘）
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['乙肝', '肺炎', '百白破', '麻腮风', '水痘', '轮状病毒'].map((keyword) => (
              <button
                key={keyword}
                onClick={() => setSearchQuery(keyword)}
                className="px-4 py-2 rounded-full bg-mint-50 hover:bg-mint-100 text-mint-700 text-sm font-medium transition-colors"
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>
      )}

      {searchQuery && searchResults.length === 0 && (
        <div className="card text-center py-16">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-xl font-display text-slate-700 mb-2">未找到相关疫苗</h2>
          <p className="text-slate-500">
            没有找到与「<span className="font-semibold text-slate-700">{searchQuery}</span>」相关的疫苗
            <br />
            请尝试使用其他关键词搜索
          </p>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-4">
          {searchResults.map((vaccine) => (
            <div
              key={vaccine.code}
              className="card card-hover cursor-pointer transition-all duration-300"
              onClick={() => setSelectedVaccine(selectedVaccine?.code === vaccine.code ? null : vaccine)}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    vaccine.category === '一类'
                      ? 'bg-gradient-to-br from-blue-100 to-blue-200'
                      : 'bg-gradient-to-br from-amber-100 to-amber-200'
                  }`}
                >
                  <Syringe
                    className={`w-7 h-7 ${
                      vaccine.category === '一类' ? 'text-blue-600' : 'text-amber-600'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-lg text-slate-800 flex items-center gap-2">
                        {vaccine.name}
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            vaccine.category === '一类'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {vaccine.category}
                        </span>
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        <span className="font-medium text-slate-600">预防：</span>
                        {vaccine.preventDisease}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGoToSchedule(vaccine);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-mint-400 to-mint-500 text-white text-sm font-medium shadow-soft hover:shadow-lg transition-all flex-shrink-0"
                    >
                      <Baby className="w-4 h-4" />
                      查看接种计划
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-slate-50 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                        <Calendar className="w-3.5 h-3.5" />
                        接种月龄
                      </div>
                      <div className="font-semibold text-slate-700">{getAgeRange(vaccine)}</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                        <Pill className="w-3.5 h-3.5" />
                        剂次数
                      </div>
                      <div className="font-semibold text-slate-700">{getDoseCount(vaccine)} 剂</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                        <Tag className="w-3.5 h-3.5" />
                        接种途径
                      </div>
                      <div className="font-semibold text-slate-700">{vaccine.route}</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        常见反应
                      </div>
                      <div className="font-semibold text-slate-700 text-sm truncate">
                        {vaccine.commonReactions[0]}
                      </div>
                    </div>
                  </div>

                  {selectedVaccine?.code === vaccine.code && (
                    <div className="mt-4 pt-4 border-t border-slate-100 animate-fade-in">
                      <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-coral-500" />
                        常见不良反应
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {vaccine.commonReactions.map((reaction, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 px-3 py-2 bg-coral-50 rounded-lg text-sm text-coral-700"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-coral-400 flex-shrink-0" />
                            {reaction}
                          </div>
                        ))}
                      </div>

                      {vaccine.doses.length > 0 && (
                        <div className="mt-6">
                          <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-mint-500" />
                            接种程序
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="bg-slate-50">
                                  <th className="border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 text-center w-20">
                                    剂次
                                  </th>
                                  <th className="border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 text-center">
                                    推荐月龄
                                  </th>
                                  <th className="border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 text-center">
                                    月龄范围
                                  </th>
                                  <th className="border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600">
                                    接种部位
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {vaccine.doses.map((dose) => (
                                  <tr key={dose.doseNumber} className="hover:bg-slate-50/50">
                                    <td className="border border-slate-200 px-4 py-3 text-center font-semibold text-slate-700">
                                      第 {dose.doseNumber} 剂
                                    </td>
                                    <td className="border border-slate-200 px-4 py-3 text-center text-slate-700">
                                      {formatMonthAge(dose.recommendedMonthAge)}
                                    </td>
                                    <td className="border border-slate-200 px-4 py-3 text-center text-slate-600">
                                      {formatMonthAge(dose.monthAgeMin)} -{' '}
                                      {formatMonthAge(dose.monthAgeMax)}
                                    </td>
                                    <td className="border border-slate-200 px-4 py-3 text-slate-600">
                                      {dose.site}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {vaccine.contraindications.length > 0 && (
                        <div className="mt-6">
                          <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            禁忌症
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {vaccine.contraindications.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg text-sm text-red-700"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
