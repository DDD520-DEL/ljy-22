import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  X,
  Check,
  Trash2,
  Edit3,
  AlertTriangle,
  Apple,
  Pill,
  TreePine,
  ChevronDown,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { AllergyRecord, AllergyCategory } from '@/types';
import { formatDate, getToday } from '@/utils/dateUtils';

type FilterType = 'all' | '食物' | '药物' | '环境';

const CATEGORY_CONFIG: Record<AllergyCategory, { icon: typeof Apple; label: string; color: string; bg: string; border: string; iconBg: string }> = {
  '食物': {
    icon: Apple,
    label: '食物过敏',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    iconBg: 'bg-orange-100',
  },
  '药物': {
    icon: Pill,
    label: '药物过敏',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconBg: 'bg-red-100',
  },
  '环境': {
    icon: TreePine,
    label: '环境过敏',
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    iconBg: 'bg-green-100',
  },
};

const ALLERGY_CATEGORIES: AllergyCategory[] = ['食物', '药物', '环境'];

const COMMON_ALLERGENS: Record<AllergyCategory, string[]> = {
  '食物': ['牛奶', '鸡蛋', '花生', '坚果', '海鲜', '小麦', '大豆', '芒果', '猕猴桃', '草莓'],
  '药物': ['青霉素', '头孢类', '磺胺类', '阿司匹林', '布洛芬', '破伤风抗毒素', '链霉素'],
  '环境': ['花粉', '尘螨', '宠物毛发', '霉菌', '冷空气', '蚊虫叮咬'],
};

export default function AllergyRecordPage() {
  const navigate = useNavigate();
  const {
    children,
    currentChildId,
    allergyRecords,
    addAllergyRecord,
    updateAllergyRecord,
    deleteAllergyRecord,
  } = useAppStore();

  const child = children.find((c) => c.id === currentChildId) || null;
  const currentAllergyRecords = allergyRecords.filter((r) => r.childId === currentChildId);

  const [filter, setFilter] = useState<FilterType>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AllergyRecord | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!child) navigate('/child-info');
  }, [child, navigate]);

  if (!child) return null;

  const filteredRecords = currentAllergyRecords.filter((r) => {
    if (filter !== 'all' && r.category !== filter) return false;
    return true;
  });

  const stats = {
    total: currentAllergyRecords.length,
    food: currentAllergyRecords.filter((r) => r.category === '食物').length,
    drug: currentAllergyRecords.filter((r) => r.category === '药物').length,
    env: currentAllergyRecords.filter((r) => r.category === '环境').length,
  };

  const handleSubmit = (data: FormDataType) => {
    if (editingRecord) {
      updateAllergyRecord(editingRecord.id, data);
    } else {
      addAllergyRecord(data);
    }
    setShowAddModal(false);
    setEditingRecord(null);
  };

  const handleEdit = (record: AllergyRecord) => {
    setEditingRecord(record);
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display text-slate-800 flex items-center gap-3">
            <span className="text-4xl">⚠️</span>
            过敏原记录
          </h1>
          <p className="text-slate-500 mt-1">
            记录宝宝已确认的过敏原，接种和体检时自动提醒医护注意
          </p>
        </div>

        <button
          onClick={() => {
            setEditingRecord(null);
            setShowAddModal(true);
          }}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          添加过敏原
        </button>
      </div>

      {currentAllergyRecords.length > 0 && (
        <div className="card border-2 border-red-200 bg-gradient-to-br from-red-50/80 to-amber-50/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-300 to-red-500 flex items-center justify-center flex-shrink-0 animate-pulse-soft">
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-slate-800">过敏信息概览</h3>
              <p className="text-slate-600 mt-1">
                共 <span className="font-bold text-red-600 text-xl">{stats.total}</span> 项已确认过敏原
                {stats.food > 0 && <span className="ml-2 text-orange-600">🍎 食物 {stats.food}</span>}
                {stats.drug > 0 && <span className="ml-2 text-red-600">💊 药物 {stats.drug}</span>}
                {stats.env > 0 && <span className="ml-2 text-green-600">🌿 环境 {stats.env}</span>}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {currentAllergyRecords.map((record) => {
              const config = CATEGORY_CONFIG[record.category];
              return (
                <span
                  key={record.id}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${config.bg} ${config.border} border ${config.color}`}
                >
                  <config.icon className="w-3.5 h-3.5" />
                  {record.allergenName}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card card-hover text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-100 flex items-center justify-center mb-3">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
          <p className="text-sm text-slate-500">过敏原总数</p>
        </div>
        <div className="card card-hover text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-100 flex items-center justify-center mb-3">
            <Apple className="w-7 h-7 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-slate-800">{stats.food}</p>
          <p className="text-sm text-slate-500">食物过敏</p>
        </div>
        <div className="card card-hover text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-100 flex items-center justify-center mb-3">
            <Pill className="w-7 h-7 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-slate-800">{stats.drug}</p>
          <p className="text-sm text-slate-500">药物过敏</p>
        </div>
        <div className="card card-hover text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-green-100 flex items-center justify-center mb-3">
            <TreePine className="w-7 h-7 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-slate-800">{stats.env}</p>
          <p className="text-sm text-slate-500">环境过敏</p>
        </div>
      </div>

      <div className="flex bg-white rounded-xl p-1 shadow-soft border border-slate-100 w-fit">
        {[
          { key: 'all' as FilterType, label: '全部', count: stats.total },
          { key: '食物' as FilterType, label: '🍎 食物', count: stats.food },
          { key: '药物' as FilterType, label: '💊 药物', count: stats.drug },
          { key: '环境' as FilterType, label: '🌿 环境', count: stats.env },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              filter === f.key
                ? 'bg-gradient-to-r from-red-400 to-amber-400 text-white'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {f.label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                filter === f.key ? 'bg-white/20' : 'bg-slate-100'
              }`}
            >
              {f.count}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">🛡️</div>
            <p className="text-slate-500">
              {filter === 'all' ? '暂无过敏原记录' : `暂无${filter}过敏记录`}
            </p>
            <p className="text-slate-400 text-sm mt-1">
              {filter === 'all'
                ? '如果宝宝有已确认的过敏原，请点击「添加过敏原」进行记录'
                : '点击上方「添加过敏原」按钮录入新的过敏原'}
            </p>
          </div>
        ) : (
          filteredRecords.map((record) => {
            const config = CATEGORY_CONFIG[record.category];
            const CategoryIcon = config.icon;
            const isExpanded = expandedId === record.id;

            return (
              <div
                key={record.id}
                className={`card card-hover border-2 ${config.border} overflow-hidden`}
              >
                <div className={`p-5 ${config.bg}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${config.iconBg}`}>
                        <CategoryIcon className={`w-7 h-7 ${config.color}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-lg text-slate-800">{record.allergenName}</h3>
                          <span className={`status-badge text-xs ${config.bg} ${config.color} border ${config.border}`}>
                            {record.category}过敏
                          </span>
                        </div>

                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-600 flex-wrap">
                          <span>📅 发现日期：{formatDate(record.discoveryDate, 'YYYY年MM月DD日')}</span>
                        </div>

                        {record.reaction && (
                          <p className="mt-2 text-sm text-slate-600 bg-white/60 rounded-lg px-3 py-2 inline-block">
                            🏥 {record.reaction.length > 50 && !isExpanded ? `${record.reaction.slice(0, 50)}...` : record.reaction}
                          </p>
                        )}

                        {record.reaction && record.reaction.length > 50 && (
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : record.id)}
                            className="ml-2 text-xs text-slate-400 hover:text-slate-600 inline-flex items-center gap-1"
                          >
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            {isExpanded ? '收起' : '展开'}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(record)}
                        className="w-10 h-10 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-500 flex items-center justify-center transition-colors"
                        title="编辑"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`确定要删除过敏原「${record.allergenName}」吗？`)) {
                            deleteAllergyRecord(record.id);
                          }
                        }}
                        className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showAddModal && (
        <AddAllergyModal
          onClose={() => {
            setShowAddModal(false);
            setEditingRecord(null);
          }}
          onSubmit={handleSubmit}
          editingRecord={editingRecord}
        />
      )}
    </div>
  );
}

interface FormDataType {
  allergenName: string;
  category: AllergyCategory;
  discoveryDate: string;
  reaction: string;
}

function AddAllergyModal({
  onClose,
  onSubmit,
  editingRecord,
}: {
  onClose: () => void;
  onSubmit: (data: FormDataType) => void;
  editingRecord: AllergyRecord | null;
}) {
  const today = getToday();
  const [formData, setFormData] = useState<FormDataType>({
    allergenName: editingRecord?.allergenName || '',
    category: editingRecord?.category || '食物',
    discoveryDate: editingRecord?.discoveryDate || today,
    reaction: editingRecord?.reaction || '',
  });

  const [showCommon, setShowCommon] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.allergenName.trim()) {
      alert('请填写过敏原名称');
      return;
    }
    if (!formData.discoveryDate) {
      alert('请选择发现日期');
      return;
    }
    if (!formData.reaction.trim()) {
      alert('请描述过敏反应表现');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-soft-lg max-w-2xl w-full overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-red-400 to-amber-400 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-display">
                  {editingRecord ? '编辑过敏原' : '添加过敏原'}
                </h2>
                <p className="text-white/80 text-sm">记录宝宝已确认的过敏原信息</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="label-field">
              <span className="text-red-400">*</span> 过敏原类别
            </label>
            <div className="grid grid-cols-3 gap-3">
              {ALLERGY_CATEGORIES.map((cat) => {
                const config = CATEGORY_CONFIG[cat];
                const Icon = config.icon;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat, allergenName: '' })}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                      formData.category === cat
                        ? `${config.border} ${config.bg} shadow-md`
                        : 'border-gray-100 bg-gray-50 hover:border-slate-200'
                    }`}
                  >
                    <Icon className={`w-7 h-7 ${formData.category === cat ? config.color : 'text-slate-400'}`} />
                    <span className={`font-semibold text-sm ${formData.category === cat ? config.color : 'text-slate-600'}`}>
                      {cat}过敏
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label-field mb-0">
                <span className="text-red-400">*</span> 过敏原名称
              </label>
              <button
                type="button"
                onClick={() => setShowCommon(!showCommon)}
                className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCommon ? 'rotate-180' : ''}`} />
                常见过敏原
              </button>
            </div>
            <input
              type="text"
              className="input-field"
              placeholder={
                formData.category === '食物' ? '如：牛奶、鸡蛋、花生等' :
                formData.category === '药物' ? '如：青霉素、头孢类等' :
                '如：花粉、尘螨等'
              }
              value={formData.allergenName}
              onChange={(e) => setFormData({ ...formData, allergenName: e.target.value })}
              maxLength={50}
            />

            {showCommon && (
              <div className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 animate-fade-in">
                <p className="text-xs text-slate-400 mb-2">点击快速选择常见过敏原：</p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_ALLERGENS[formData.category].map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setFormData({ ...formData, allergenName: name })}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border-2 ${
                        formData.allergenName === name
                          ? `${CATEGORY_CONFIG[formData.category].border} ${CATEGORY_CONFIG[formData.category].bg} ${CATEGORY_CONFIG[formData.category].color}`
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="label-field">
              <span className="text-red-400">*</span> 发现日期
            </label>
            <input
              type="date"
              className="input-field"
              value={formData.discoveryDate}
              max={today}
              onChange={(e) => setFormData({ ...formData, discoveryDate: e.target.value })}
            />
            <p className="text-xs text-slate-400 mt-2">
              记录首次发现该过敏原的日期
            </p>
          </div>

          <div>
            <label className="label-field">
              <span className="text-red-400">*</span> 反应表现
            </label>
            <textarea
              className="input-field min-h-[100px] resize-none"
              placeholder="描述宝宝接触该过敏原后的反应表现，如：皮肤红疹、呼吸困难、腹泻呕吐等..."
              value={formData.reaction}
              onChange={(e) => setFormData({ ...formData, reaction: e.target.value })}
              maxLength={500}
            />
            <p className="text-xs text-slate-400 mt-2">
              详细描述有助于医护评估风险 ({formData.reaction.length}/500)
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
            <p className="text-sm text-amber-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>过敏原信息将在疫苗接种页面和儿保体检页面以醒目标签形式展示，提醒医护注意。</span>
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-outline"
            >
              取消
            </button>
            <button type="submit" className="flex-1 btn-primary bg-gradient-to-r from-red-400 to-amber-400 hover:from-red-500 hover:to-amber-500 flex items-center justify-center gap-2">
              <Check className="w-5 h-5" />
              {editingRecord ? '保存修改' : '添加过敏原'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
