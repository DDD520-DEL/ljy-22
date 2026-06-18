import { useState, useMemo } from 'react';
import {
  Activity,
  Hand,
  MessageCircle,
  Users,
  Save,
  RotateCcw,
  CheckCircle2,
  Circle,
  Trash2,
  Award,
} from 'lucide-react';
import type {
  MilestoneChecklistDefinition,
  MilestoneAssessment,
  DevelopmentDimension,
} from '@/types';
import {
  DEVELOPMENT_DIMENSIONS,
  computeDimensionScores,
  computeTotalScore,
  getAssessmentLevel,
  buildAssessmentSummary,
  createEmptyCheckedItems,
} from '@/data/milestones';
import RadarChart from '@/components/RadarChart';
import { getToday } from '@/utils/dateUtils';

interface MilestoneAssessmentFormProps {
  checklist: MilestoneChecklistDefinition;
  childMonthAge: number;
  existing?: MilestoneAssessment;
  onSave: (data: Omit<MilestoneAssessment, 'id' | 'childId' | 'createdAt' | 'updatedAt'>) => void;
  onDelete?: (id: string) => void;
}

const dimensionConfig: Record<DevelopmentDimension, { icon: typeof Activity; color: string; bg: string; text: string }> = {
  '大运动': { icon: Activity, color: 'border-mint-300', bg: 'bg-mint-50', text: 'text-mint-600' },
  '精细动作': { icon: Hand, color: 'border-coral-300', bg: 'bg-coral-50', text: 'text-coral-600' },
  '语言': { icon: MessageCircle, color: 'border-blue-300', bg: 'bg-blue-50', text: 'text-blue-600' },
  '社交': { icon: Users, color: 'border-purple-300', bg: 'bg-purple-50', text: 'text-purple-600' },
};

function getScoreColor(value: number): string {
  if (value >= 80) return 'text-mint-600';
  if (value >= 60) return 'text-amber-500';
  if (value >= 40) return 'text-orange-500';
  return 'text-red-500';
}

export default function MilestoneAssessmentForm({
  checklist,
  childMonthAge,
  existing,
  onSave,
  onDelete,
}: MilestoneAssessmentFormProps) {
  const [checkedItems, setCheckedItems] = useState<Record<DevelopmentDimension, string[]>>(
    existing?.checkedItems ?? createEmptyCheckedItems()
  );
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [savedFlash, setSavedFlash] = useState(false);

  const scores = useMemo(
    () => computeDimensionScores(checklist, checkedItems),
    [checklist, checkedItems]
  );
  const totalScore = useMemo(
    () => computeTotalScore(checklist, checkedItems),
    [checklist, checkedItems]
  );
  const level = getAssessmentLevel(totalScore);

  const radarData = DEVELOPMENT_DIMENSIONS.map((dim) => ({
    label: dim,
    value: scores[dim],
  }));

  const toggleItem = (dim: DevelopmentDimension, itemText: string) => {
    setCheckedItems((prev) => {
      const current = prev[dim];
      const exists = current.includes(itemText);
      return {
        ...prev,
        [dim]: exists ? current.filter((t) => t !== itemText) : [...current, itemText],
      };
    });
  };

  const toggleDimensionAll = (dim: DevelopmentDimension) => {
    setCheckedItems((prev) => {
      const allItems = checklist.dimensions[dim];
      const allChecked = prev[dim].length === allItems.length;
      return {
        ...prev,
        [dim]: allChecked ? [] : [...allItems],
      };
    });
  };

  const handleReset = () => {
    setCheckedItems(createEmptyCheckedItems());
    setNotes('');
  };

  const handleSave = () => {
    const summary = buildAssessmentSummary(scores, totalScore);
    onSave({
      monthAge: childMonthAge,
      checklistMonthAge: checklist.monthAge,
      checkedItems,
      scores,
      totalScore,
      level,
      summary,
      assessmentDate: getToday(),
      notes: notes.trim() || undefined,
    });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  const levelColor =
    level === '优秀'
      ? 'bg-mint-100 text-mint-700'
      : level === '良好'
      ? 'bg-blue-100 text-blue-700'
      : level === '需关注'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-red-100 text-red-700';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        {DEVELOPMENT_DIMENSIONS.map((dim) => {
          const config = dimensionConfig[dim];
          const DimIcon = config.icon;
          const items = checklist.dimensions[dim];
          const checkedCount = checkedItems[dim].length;
          const allChecked = checkedCount === items.length && items.length > 0;
          const dimScore = scores[dim];

          return (
            <div key={dim} className={`rounded-2xl border-2 ${config.color} ${config.bg} p-4`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg bg-white flex items-center justify-center ${config.text}`}>
                    <DimIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">{dim}</p>
                    <p className="text-xs text-slate-500">
                      已达成 {checkedCount}/{items.length} 项
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-bold ${getScoreColor(dimScore)}`}>
                    {dimScore}
                    <span className="text-xs font-normal text-slate-400">分</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleDimensionAll(dim)}
                    className="text-xs px-2 py-1 rounded-lg bg-white/70 hover:bg-white text-slate-500 transition-colors"
                  >
                    {allChecked ? '取消全选' : '全选'}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                {items.map((item) => {
                  const isChecked = checkedItems[dim].includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleItem(dim, item)}
                      className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-all ${
                        isChecked ? 'bg-white shadow-soft' : 'bg-white/40 hover:bg-white/70'
                      }`}
                    >
                      {isChecked ? (
                        <CheckCircle2 className="w-5 h-5 text-mint-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${isChecked ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                        {item}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-4">
        <div className="card bg-gradient-to-br from-white to-slate-50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-display text-lg text-slate-700 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              四维发育雷达图
            </h4>
            <span className={`status-badge ${levelColor}`}>
              <Award className="w-3.5 h-3.5 mr-1" />
              {level}
            </span>
          </div>

          <RadarChart data={radarData} size={280} />

          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">综合达成率</span>
              <span className={`text-2xl font-bold ${getScoreColor(totalScore)}`}>
                {totalScore}
                <span className="text-sm font-normal text-slate-400"> / 100</span>
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${totalScore}%`,
                  background:
                    totalScore >= 80
                      ? 'linear-gradient(90deg, #6ee7b7, #10b981)'
                      : totalScore >= 60
                      ? 'linear-gradient(90deg, #fcd34d, #f59e0b)'
                      : 'linear-gradient(90deg, #fb923c, #ef4444)',
                }}
              />
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-100">
            <p className="text-xs text-slate-500 mb-1">💡 评估说明</p>
            <p className="text-sm text-slate-600 leading-relaxed">
              {buildAssessmentSummary(scores, totalScore)}
            </p>
          </div>
        </div>

        <div>
          <label className="label-field">评估备注（可选）</label>
          <textarea
            className="input-field min-h-[70px] resize-none"
            placeholder="记录宝宝本次评估的特别表现或需要关注的细节..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="btn-outline flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            重置
          </button>
          <button
            type="button"
            onClick={handleSave}
            className={`flex-1 btn-primary flex items-center justify-center gap-2 ${
              savedFlash ? 'animate-pulse-soft' : ''
            }`}
          >
            {savedFlash ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            {savedFlash ? '已保存评估' : '保存评估结果'}
          </button>
          {existing && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(existing.id)}
              className="px-4 py-2 rounded-full border-2 border-red-200 text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              删除
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
