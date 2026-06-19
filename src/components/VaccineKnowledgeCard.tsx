import { useState, useEffect } from 'react';
import {
  X,
  Shield,
  AlertTriangle,
  HeartHandshake,
  Lightbulb,
  BookOpen,
  Syringe,
  Baby,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { VaccineDefinition } from '@/types';
import { VACCINE_DEFINITIONS } from '@/data/vaccines';

interface VaccineKnowledgeCardProps {
  vaccineCode: string;
  onClose: () => void;
  doseNumber?: number;
  plannedDate?: string;
}

type TabKey = 'principle' | 'contraindications' | 'nursing' | 'tips';

interface SectionItem {
  title: string;
  icon: typeof Shield;
  colorClass: string;
  bgClass: string;
  items?: string[];
  content?: string;
}

export default function VaccineKnowledgeCard({
  vaccineCode,
  onClose,
  doseNumber,
  plannedDate,
}: VaccineKnowledgeCardProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('principle');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const vaccine = VACCINE_DEFINITIONS.find((v) => v.code === vaccineCode);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!vaccine || !vaccine.knowledge) return null;

  const tabs: { key: TabKey; label: string; icon: typeof Shield }[] = [
    { key: 'principle', label: '预防原理', icon: BookOpen },
    { key: 'contraindications', label: '接种禁忌', icon: AlertTriangle },
    { key: 'nursing', label: '反应护理', icon: HeartHandshake },
    { key: 'tips', label: '温馨提示', icon: Lightbulb },
  ];

  const toggleItem = (key: string) => {
    setExpandedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const categoryGradient =
    vaccine.category === '一类'
      ? 'from-blue-400 to-blue-500'
      : 'from-purple-400 to-purple-500';

  const headerGradient = `bg-gradient-to-r from-mint-400 via-coral-400 ${categoryGradient}`;

  const renderSection = () => {
    const { knowledge } = vaccine;

    if (activeTab === 'principle') {
      return (
        <div className="animate-fade-in-up">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-mint-50 border border-blue-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-mint-400 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg text-slate-800 mb-3">它是如何保护宝宝的？</h4>
                <p className="text-slate-600 leading-relaxed text-[15px]">
                  {knowledge.preventionPrinciple}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-coral-50 border border-amber-100">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-coral-500 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-semibold text-coral-700 mb-1">预防的疾病</h5>
                <p className="text-slate-700 text-sm">{vaccine.preventDisease}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'contraindications') {
      return (
        <div className="space-y-3 animate-fade-in-up">
          <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-100 mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-red-700">重要提醒</h5>
                <p className="text-red-600 text-sm mt-1">
                  以下情况的宝宝严禁或需暂缓接种，请务必如实告知接种医生宝宝的健康状况！
                </p>
              </div>
            </div>
          </div>

          {knowledge.contraindicationDetails.map((item, index) => {
            const key = `contra-${index}`;
            const isExpanded = expandedItems[key] ?? true;
            return (
              <div
                key={key}
                className="rounded-2xl border-2 border-red-50 bg-white overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleItem(key)}
                  className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-red-50/50 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-red-100 text-red-600 font-bold text-sm flex items-center justify-center">
                      {index + 1}
                    </span>
                    <p className="text-slate-700 font-medium text-sm leading-relaxed line-clamp-2">
                      {item.split('：')[0]}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 pl-14">
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {item.includes('：') ? item.split('：').slice(1).join('：') : item}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    if (activeTab === 'nursing') {
      return (
        <div className="space-y-3 animate-fade-in-up">
          <div className="p-4 rounded-2xl bg-mint-50 border-2 border-mint-100 mb-4">
            <div className="flex items-start gap-3">
              <HeartHandshake className="w-5 h-5 text-mint-600 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-mint-700">家庭护理指南</h5>
                <p className="text-mint-600 text-sm mt-1">
                  接种前后做好这些，让宝宝更舒适地度过疫苗反应期
                </p>
              </div>
            </div>
          </div>

          {knowledge.nursingMethods.map((item, index) => {
            const key = `nursing-${index}`;
            const isExpanded = expandedItems[key] ?? true;
            const isWarning = item.includes('⚠️') || item.includes('就医') || item.includes('立即');
            return (
              <div
                key={key}
                className={`rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
                  isWarning
                    ? 'border-coral-100 bg-gradient-to-br from-white to-coral-50/30'
                    : 'border-mint-50 bg-white'
                }`}
              >
                <button
                  onClick={() => toggleItem(key)}
                  className={`w-full flex items-start justify-between gap-3 p-4 text-left transition-colors ${
                    isWarning ? 'hover:bg-coral-50/50' : 'hover:bg-mint-50/50'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span
                      className={`flex-shrink-0 w-7 h-7 rounded-full font-bold text-sm flex items-center justify-center ${
                        isWarning
                          ? 'bg-coral-100 text-coral-600'
                          : 'bg-mint-100 text-mint-600'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <p
                      className={`font-medium text-sm leading-relaxed ${
                        isWarning ? 'text-coral-700' : 'text-slate-700'
                      }`}
                    >
                      {item.substring(0, Math.min(item.length, 50))}
                      {item.length > 50 && !isExpanded && '...'}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        isWarning ? 'text-coral-400' : 'text-mint-400'
                      }`}
                    />
                  ) : (
                    <ChevronDown
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        isWarning ? 'text-coral-400' : 'text-mint-400'
                      }`}
                    />
                  )}
                </button>
                {isExpanded && item.length > 50 && (
                  <div className="px-4 pb-4 pl-14">
                    <p className="text-slate-600 text-sm leading-relaxed">{item}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    if (activeTab === 'tips') {
      return (
        <div className="space-y-3 animate-fade-in-up">
          <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-100 mb-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-amber-700">专家小贴士</h5>
                <p className="text-amber-600 text-sm mt-1">
                  这些实用经验能帮您少走弯路，从容应对疫苗接种
                </p>
              </div>
            </div>
          </div>

          {knowledge.tips.map((item, index) => (
            <div
              key={`tip-${index}`}
              className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-br from-white to-amber-50/30 border-2 border-amber-50 hover:border-amber-100 transition-colors"
            >
              <span className="flex-shrink-0 w-8 h-8 rounded-2xl bg-gradient-to-br from-amber-300 to-coral-400 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                {index + 1}
              </span>
              <p className="text-slate-700 text-sm leading-relaxed flex-1 pt-0.5">{item}</p>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-soft-lg max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`${headerGradient} p-5 md:p-6 text-white relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-8 w-20 h-20 bg-white/5 rounded-full translate-y-1/2"></div>

          <div className="relative z-10 flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium">
                  <Syringe className="w-3.5 h-3.5" />
                  {vaccine.route}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${
                    vaccine.category === '一类'
                      ? 'bg-blue-400/30 text-white'
                      : 'bg-purple-400/30 text-white'
                  }`}
                >
                  {vaccine.category}疫苗
                </span>
                {doseNumber !== undefined && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium">
                    <Baby className="w-3.5 h-3.5" />
                    第{doseNumber}剂
                  </span>
                )}
              </div>
              <h2 className="text-2xl md:text-3xl font-display mb-1 leading-tight">
                {vaccine.name}
              </h2>
              <p className="text-white/85 text-sm">
                预防 <span className="font-semibold text-white">{vaccine.preventDisease}</span>
              </p>
              {plannedDate && (
                <p className="text-white/80 text-xs mt-2 flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-white/60"></span>
                  计划接种日：{plannedDate}
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors flex-shrink-0"
              aria-label="关闭"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="border-b border-slate-100 px-2 md:px-4 pt-3 md:pt-4 bg-slate-50/50">
          <div className="flex gap-1 md:gap-2 overflow-x-auto pb-0 scrollbar-hide">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 md:px-4 py-2.5 rounded-t-2xl text-sm font-medium transition-all duration-300 border-b-3 ${
                    isActive
                      ? 'text-mint-600 bg-white border-mint-400 -mb-px relative z-10 shadow-[0_-2px_8px_rgba(16,185,129,0.08)]'
                      : 'text-slate-500 hover:text-slate-700 border-transparent hover:bg-white/50'
                  }`}
                  style={{ borderBottomWidth: isActive ? '3px' : '3px' }}
                >
                  <TabIcon className={`w-4 h-4 ${isActive ? 'text-mint-500' : ''}`} />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 md:p-6">{renderSection()}</div>

        <div className="border-t border-slate-100 p-4 bg-slate-50/50 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            内容仅供科普参考，具体请遵医嘱
          </p>
          <button
            onClick={onClose}
            className="btn-primary flex items-center justify-center gap-2 px-5 py-2"
          >
            我知道了
          </button>
        </div>
      </div>
    </div>
  );
}
