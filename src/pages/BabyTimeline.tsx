import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  X,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  Syringe,
  Stethoscope,
  Star,
  Camera,
  Image as ImageIcon,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { MilestoneEvent } from '@/types';
import { formatDate, getToday, formatMonthAge } from '@/utils/dateUtils';

const PRESET_CATEGORIES = [
  '大运动',
  '精细动作',
  '语言',
  '社交',
  '认知',
  '生活技能',
  '其他',
];

const PRESET_MILESTONES: Record<string, string[]> = {
  '大运动': ['第一次翻身', '第一次独坐', '第一次爬行', '第一次扶站', '第一次独站', '第一次独走', '第一次跑步', '第一次双脚跳', '第一次骑三轮车'],
  '精细动作': ['第一次抓握玩具', '第一次拇指食指对捏', '第一次叠积木', '第一次握笔涂鸦', '第一次用勺子吃饭'],
  '语言': ['第一次发出元音', '第一次咿呀学语', '第一次喊妈妈', '第一次喊爸爸', '第一次说词语', '第一次说句子'],
  '社交': ['第一次微笑', '第一次认人', '第一次做再见', '第一次分享玩具', '第一次交朋友'],
  '认知': ['第一次找藏起的玩具', '第一次指认物品', '第一次认识颜色', '第一次数数'],
  '生活技能': ['第一次吃辅食', '第一次自己吃饭', '第一次自己穿衣服', '第一次如厕训练', '第一次刷牙'],
  '其他': ['第一次理发', '第一次游泳', '第一次坐飞机', '第一次上幼儿园'],
};

interface TimelineItem {
  id: string;
  type: 'vaccine' | 'checkup' | 'custom';
  title: string;
  date: string;
  description?: string;
  photo?: string;
  category?: string;
  sourceId?: string;
  isAuto: boolean;
}

function getMonthKey(date: string): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  return `${year}年${parseInt(month)}月`;
}

export default function BabyTimeline() {
  const navigate = useNavigate();
  const {
    children,
    currentChildId,
    vaccineSchedules,
    vaccineRecords,
    checkupRecords,
    milestoneEvents,
    addMilestoneEvent,
    updateMilestoneEvent,
    deleteMilestoneEvent,
  } = useAppStore();

  const child = children.find((c) => c.id === currentChildId) || null;

  useEffect(() => {
    if (!child) {
      navigate('/child-info');
    }
  }, [child, navigate]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<MilestoneEvent | null>(null);
  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(new Set());
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    date: getToday(),
    category: '其他',
    description: '',
    photo: '' as string,
  });

  const timelineItems = useMemo(() => {
    const items: TimelineItem[] = [];

    for (const vr of vaccineRecords) {
      if (vr.childId !== currentChildId) continue;
      const schedule = vaccineSchedules.find((s) => s.id === vr.scheduleId);
      const doseNum = schedule?.doseNumber || 1;
      const preventDisease = schedule?.preventDisease || '';
      items.push({
        id: `vaccine-${vr.id}`,
        type: 'vaccine',
        title: `${vr.vaccineName}（第${doseNum}剂）`,
        date: vr.vaccinationDate.split('T')[0],
        description: `${preventDisease ? '预防' + preventDisease : ''} ${vr.manufacturer} | 批号: ${vr.batchNumber}${vr.reaction && vr.reaction !== '无' ? ' | 反应: ' + vr.reaction : ''}`.trim(),
        sourceId: vr.id,
        isAuto: true,
      });
    }

    for (const cr of checkupRecords) {
      if (cr.childId !== currentChildId) continue;
      const parts: string[] = [];
      if (cr.weight) parts.push(`体重: ${cr.weight}kg`);
      if (cr.height) parts.push(`身高: ${cr.height}cm`);
      if (cr.headCircumference) parts.push(`头围: ${cr.headCircumference}cm`);
      if (cr.doctorAdvice) parts.push(cr.doctorAdvice);
      items.push({
        id: `checkup-${cr.id}`,
        type: 'checkup',
        title: `${formatMonthAge(cr.monthAge)}儿保体检`,
        date: cr.checkupDate.split('T')[0],
        description: parts.join(' | '),
        sourceId: cr.id,
        isAuto: true,
      });
    }

    for (const me of milestoneEvents) {
      if (me.childId !== currentChildId) continue;
      items.push({
        id: `custom-${me.id}`,
        type: me.type,
        title: me.title,
        date: me.date,
        description: me.description,
        photo: me.photo,
        category: me.category,
        sourceId: me.id,
        isAuto: false,
      });
    }

    items.sort((a, b) => b.date.localeCompare(a.date));

    return items;
  }, [vaccineSchedules, vaccineRecords, checkupRecords, milestoneEvents, currentChildId]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, TimelineItem[]> = {};
    for (const item of timelineItems) {
      const key = getMonthKey(item.date);
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    }
    const sortedKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    return sortedKeys.map((key) => ({
      monthKey: key,
      label: formatMonthLabel(key),
      items: groups[key],
    }));
  }, [timelineItems]);

  const toggleMonth = (monthKey: string) => {
    setCollapsedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(monthKey)) {
        next.delete(monthKey);
      } else {
        next.add(monthKey);
      }
      return next;
    });
  };

  const handleOpenAddModal = () => {
    setFormData({
      title: '',
      date: getToday(),
      category: '其他',
      description: '',
      photo: '',
    });
    setEditingEvent(null);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (event: MilestoneEvent) => {
    setFormData({
      title: event.title,
      date: event.date,
      category: event.category || '其他',
      description: event.description || '',
      photo: event.photo || '',
    });
    setEditingEvent(event);
    setShowAddModal(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setFormData((prev) => ({ ...prev, photo: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('请填写事件标题');
      return;
    }

    if (editingEvent) {
      updateMilestoneEvent(editingEvent.id, {
        title: formData.title,
        date: formData.date,
        category: formData.category,
        description: formData.description || undefined,
        photo: formData.photo || undefined,
      });
    } else {
      addMilestoneEvent({
        type: 'custom',
        title: formData.title,
        date: formData.date,
        category: formData.category,
        description: formData.description || undefined,
        photo: formData.photo || undefined,
      });
    }

    setShowAddModal(false);
    setEditingEvent(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这条大事件记录吗？此操作不可恢复。')) {
      deleteMilestoneEvent(id);
    }
  };

  const getTypeIcon = (type: TimelineItem['type']) => {
    switch (type) {
      case 'vaccine':
        return <Syringe className="w-5 h-5" />;
      case 'checkup':
        return <Stethoscope className="w-5 h-5" />;
      case 'custom':
        return <Star className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: TimelineItem['type']) => {
    switch (type) {
      case 'vaccine':
        return { bg: 'bg-gradient-to-br from-blue-400 to-cyan-400', light: 'bg-blue-50 border-blue-100', text: 'text-blue-700', dot: 'bg-blue-400', badge: 'bg-blue-100 text-blue-700' };
      case 'checkup':
        return { bg: 'bg-gradient-to-br from-mint-400 to-emerald-400', light: 'bg-mint-50 border-mint-100', text: 'text-mint-700', dot: 'bg-mint-400', badge: 'bg-mint-100 text-mint-700' };
      case 'custom':
        return { bg: 'bg-gradient-to-br from-amber-400 to-orange-400', light: 'bg-amber-50 border-amber-100', text: 'text-amber-700', dot: 'bg-amber-400', badge: 'bg-amber-100 text-amber-700' };
    }
  };

  const getTypeLabel = (type: TimelineItem['type']) => {
    switch (type) {
      case 'vaccine': return '疫苗接种';
      case 'checkup': return '儿保体检';
      case 'custom': return '自定义里程碑';
    }
  };

  if (!child) return null;

  const totalVaccine = timelineItems.filter((i) => i.type === 'vaccine').length;
  const totalCheckup = timelineItems.filter((i) => i.type === 'checkup').length;
  const totalCustom = timelineItems.filter((i) => i.type === 'custom').length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display gradient-text mb-2 flex items-center gap-3">
            <span className="text-4xl">🌟</span>
            宝宝大事件
          </h1>
          <p className="text-slate-500">
            聚合接种记录与体检记录，记录宝宝成长中的每一个里程碑
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="btn-primary flex items-center justify-center gap-2 w-full md:w-auto"
        >
          <Plus className="w-5 h-5" />
          添加里程碑
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Syringe className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-slate-500">接种记录</span>
          </div>
          <div className="text-3xl font-bold text-slate-800">{totalVaccine}</div>
          <p className="text-xs text-slate-400 mt-1">已接种</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-mint-100 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-mint-600" />
            </div>
            <span className="text-sm text-slate-500">体检记录</span>
          </div>
          <div className="text-3xl font-bold text-slate-800">{totalCheckup}</div>
          <p className="text-xs text-slate-400 mt-1">已完成</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-sm text-slate-500">里程碑</span>
          </div>
          <div className="text-3xl font-bold text-slate-800">{totalCustom}</div>
          <p className="text-xs text-slate-400 mt-1">自定义</p>
        </div>
      </div>

      <div className="card">
        {timelineItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌟</div>
            <p className="text-slate-500 mb-2">还没有大事件记录</p>
            <p className="text-slate-400 text-sm mb-6">完成疫苗接种或儿保体检后，相关记录会自动出现在这里</p>
            <button
              onClick={handleOpenAddModal}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              添加第一条里程碑
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {groupedItems.map((group) => {
              const isCollapsed = collapsedMonths.has(group.monthKey);
              return (
                <div key={group.monthKey}>
                  <button
                    onClick={() => toggleMonth(group.monthKey)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-slate-50 to-white hover:from-slate-100 hover:to-slate-50 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-mint-300 to-coral-300 flex items-center justify-center text-white shadow-soft">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span className="font-display text-lg text-slate-700">{group.label}</span>
                    <span className="text-sm text-slate-400">{group.items.length} 条事件</span>
                    <div className="flex-1" />
                    {isCollapsed ? (
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-mint-500 transition-colors" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-mint-500 transition-colors" />
                    )}
                  </button>

                  {!isCollapsed && (
                    <div className="relative ml-4 pl-8 pt-2 pb-4">
                      <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-mint-200 via-slate-200 to-coral-200" />
                      <div className="space-y-4">
                        {group.items.map((item) => {
                          const color = getTypeColor(item.type);
                          return (
                            <div key={item.id} className="relative">
                              <div className={`absolute -left-8 top-4 w-4 h-4 rounded-full ${color.dot} ring-4 ring-white z-10`} />
                              <div className={`rounded-2xl border ${color.light} p-5 hover:shadow-soft transition-all`}>
                                <div className="flex items-start gap-4">
                                  <div className={`w-12 h-12 rounded-xl ${color.bg} flex items-center justify-center text-white flex-shrink-0 shadow-soft`}>
                                    {getTypeIcon(item.type)}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                      <span className={`status-badge ${color.badge}`}>
                                        {getTypeLabel(item.type)}
                                      </span>
                                      {item.category && item.type === 'custom' && (
                                        <span className="status-badge bg-slate-100 text-slate-600">
                                          {item.category}
                                        </span>
                                      )}
                                      <span className="text-xs text-slate-400 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {formatDate(item.date, 'YYYY年MM月DD日')}
                                      </span>
                                    </div>

                                    <h4 className="font-semibold text-slate-800 text-lg mb-1">
                                      {item.title}
                                    </h4>

                                    {item.description && (
                                      <p className="text-sm text-slate-500 leading-relaxed mb-2">
                                        {item.description}
                                      </p>
                                    )}

                                    {item.photo && (
                                      <div className="mt-3">
                                        <img
                                          src={item.photo}
                                          alt={item.title}
                                          className="max-w-xs max-h-48 rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity shadow-soft"
                                          onClick={() => setPhotoPreview(item.photo)}
                                        />
                                      </div>
                                    )}
                                  </div>

                                  {!item.isAuto && (
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      <button
                                        onClick={() => {
                                          const customEvent = milestoneEvents.find((e) => e.id === item.sourceId);
                                          if (customEvent) handleOpenEditModal(customEvent);
                                        }}
                                        className="w-9 h-9 rounded-lg hover:bg-white hover:shadow-soft flex items-center justify-center text-slate-400 hover:text-mint-600 transition-colors"
                                        title="编辑"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (item.sourceId) handleDelete(item.sourceId);
                                        }}
                                        className="w-9 h-9 rounded-lg hover:bg-white hover:shadow-soft flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                                        title="删除"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
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
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-soft-lg max-w-lg w-full overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-amber-400 to-orange-400 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display">
                      {editingEvent ? '编辑里程碑' : '添加里程碑'}
                    </h2>
                    <p className="text-white/80 text-sm">
                      {editingEvent ? '修改里程碑事件' : '记录宝宝的成长瞬间'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="label-field">
                  <span className="text-red-400">*</span> 事件标题
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="例如：第一次翻身、第一次喊妈妈"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  maxLength={50}
                  required
                />
                <p className="text-xs text-slate-400 mt-1 text-right">
                  {formData.title.length}/50
                </p>
              </div>

              <div>
                <label className="label-field">
                  <span className="text-red-400">*</span> 事件日期
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={formData.date}
                  max={getToday()}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label-field">分类</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat })}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        formData.category === cat
                          ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-soft'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {formData.category && PRESET_MILESTONES[formData.category] && (
                <div>
                  <label className="label-field">快捷选择</label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_MILESTONES[formData.category].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setFormData({ ...formData, title: preset })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          formData.title === preset
                            ? 'bg-amber-100 text-amber-700 border border-amber-300'
                            : 'bg-white text-slate-500 border border-slate-200 hover:border-amber-300 hover:text-amber-600'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="label-field">描述</label>
                <textarea
                  className="input-field resize-none"
                  rows={3}
                  placeholder="可选：记录更多细节"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  maxLength={500}
                />
                <p className="text-xs text-slate-400 mt-1 text-right">
                  {formData.description.length}/500
                </p>
              </div>

              <div>
                <label className="label-field">配图</label>
                <div className="flex items-center gap-4">
                  {formData.photo ? (
                    <div className="relative group">
                      <img
                        src={formData.photo}
                        alt="预览"
                        className="w-24 h-24 rounded-xl object-cover shadow-soft"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, photo: '' })}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-200 hover:border-amber-300 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-amber-500 transition-colors"
                    >
                      <Camera className="w-6 h-6" />
                      <span className="text-xs">添加照片</span>
                    </button>
                  )}
                  <div className="text-xs text-slate-400 space-y-1">
                    <p className="flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5" />
                      支持 JPG、PNG 格式
                    </p>
                    <p>图片大小不超过 5MB</p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 btn-outline"
                >
                  取消
                </button>
                <button type="submit" className="flex-1 btn-primary flex items-center justify-center gap-2">
                  {editingEvent ? (
                    <>
                      <Edit2 className="w-5 h-5" />
                      保存修改
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      添加里程碑
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {photoPreview && (
        <div
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in cursor-pointer"
          onClick={() => setPhotoPreview(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img
              src={photoPreview}
              alt="大图预览"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
            />
            <button
              onClick={() => setPhotoPreview(null)}
              className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-slate-600 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
