import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Baby,
  Calendar,
  Check,
  Pencil,
  Plus,
  X,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { formatDate, calculateMonthAge, formatMonthAge, getToday } from '@/utils/dateUtils';

export default function ChildInfo() {
  const navigate = useNavigate();
  const {
    children,
    currentChildId,
    addChild,
    updateChild,
    deleteChild,
    switchChild,
    vaccineSchedules,
    checkupSchedules,
    reminders,
  } = useAppStore();

  const [editingChild, setEditingChild] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    gender: '男' as '男' | '女',
    birthDate: '',
  });

  const currentChild = children.find((c) => c.id === currentChildId) || null;

  const openEdit = (child: typeof children[0]) => {
    setFormData({
      name: child.name,
      gender: child.gender,
      birthDate: child.birthDate,
    });
    setEditingChild(child.id);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.birthDate) {
      alert('请填写完整信息');
      return;
    }
    if (editingChild) {
      updateChild(editingChild, formData);
      setEditingChild(null);
    }
  };

  const handleAddChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.birthDate) {
      alert('请填写完整信息');
      return;
    }
    addChild(formData);
    setShowAddModal(false);
    setFormData({ name: '', gender: '男', birthDate: '' });
    if (children.length === 0) {
      navigate('/');
    }
  };

  const handleDeleteChild = (id: string, name: string) => {
    if (window.confirm(`确定要删除宝宝「${name}」吗？所有相关数据将被清除，此操作不可恢复！`)) {
      deleteChild(id);
    }
  };

  const handleSwitchChild = (id: string) => {
    switchChild(id);
  };

  const maxDate = getToday();

  const getGenderEmoji = (gender: '男' | '女') => {
    return gender === '男' ? '👦' : '👧';
  };

  const getChildStats = (childId: string) => {
    const vs = vaccineSchedules.filter((s) => s.childId === childId);
    const cs = checkupSchedules.filter((s) => s.childId === childId);
    const rs = reminders.filter((r) => r.childId === childId);
    return {
      vaccineTotal: vs.length,
      checkupTotal: cs.length,
      reminderTotal: rs.length,
    };
  };

  if (children.length === 0) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-mint-300 to-coral-300 text-6xl mb-4 animate-float shadow-soft-lg">
            <Baby className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-display text-slate-800">欢迎使用育儿管家 👋</h1>
          <p className="text-slate-500 mt-2">
            请先录入宝宝的基本信息，我们将为您自动生成全套疫苗接种和儿保体检计划
          </p>
        </div>

        <form onSubmit={handleAddChild} className="card space-y-6">
          <div>
            <label className="label-field">
              <span className="text-red-400">*</span> 宝宝姓名
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="请输入宝宝的名字"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              maxLength={20}
            />
          </div>

          <div>
            <label className="label-field">
              <span className="text-red-400">*</span> 性别
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, gender: '男' })}
                className={`p-5 rounded-2xl border-2 transition-all duration-300 ${
                  formData.gender === '男'
                    ? 'border-mint-400 bg-mint-50 shadow-glow-mint'
                    : 'border-gray-100 bg-gray-50 hover:border-mint-200'
                }`}
              >
                <div className="text-4xl mb-2">👦</div>
                <p className={`font-semibold ${formData.gender === '男' ? 'text-mint-600' : 'text-slate-600'}`}>
                  男宝宝
                </p>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, gender: '女' })}
                className={`p-5 rounded-2xl border-2 transition-all duration-300 ${
                  formData.gender === '女'
                    ? 'border-coral-400 bg-coral-50 shadow-lg'
                    : 'border-gray-100 bg-gray-50 hover:border-coral-200'
                }`}
              >
                <div className="text-4xl mb-2">👧</div>
                <p className={`font-semibold ${formData.gender === '女' ? 'text-coral-600' : 'text-slate-600'}`}>
                  女宝宝
                </p>
              </button>
            </div>
          </div>

          <div>
            <label className="label-field">
              <span className="text-red-400">*</span> 出生日期
            </label>
            <input
              type="date"
              className="input-field"
              value={formData.birthDate}
              max={maxDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
            />
            <p className="text-xs text-slate-400 mt-2">
              系统将根据出生日期自动计算国家免疫规划的接种时间和体检节点
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="submit" className="flex-1 btn-primary flex items-center justify-center gap-2">
              <Check className="w-5 h-5" />
              开始使用
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display text-slate-800 flex items-center gap-3">
            <span className="text-4xl">👶</span>
            宝宝管理
          </h1>
          <p className="text-slate-500 mt-1">管理您的所有宝宝，切换查看不同宝宝的信息</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          添加宝宝
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {children.map((child) => {
          const isActive = child.id === currentChildId;
          const monthAge = calculateMonthAge(child.birthDate);
          const stats = getChildStats(child.id);

          if (editingChild === child.id) {
            return (
              <div key={child.id} className="card border-2 border-mint-300">
                <h3 className="font-semibold text-lg text-slate-800 mb-4 flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-mint-500" />
                  编辑宝宝信息
                </h3>
                <form onSubmit={handleSaveEdit} className="space-y-4">
                  <div>
                    <label className="label-field text-sm">宝宝姓名</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      maxLength={20}
                    />
                  </div>
                  <div>
                    <label className="label-field text-sm">性别</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, gender: '男' })}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          formData.gender === '男'
                            ? 'border-mint-400 bg-mint-50'
                            : 'border-gray-100 bg-gray-50'
                        }`}
                      >
                        <div className="text-2xl mb-1">👦</div>
                        <p className={`text-sm font-medium ${formData.gender === '男' ? 'text-mint-600' : 'text-slate-600'}`}>
                          男宝宝
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, gender: '女' })}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          formData.gender === '女'
                            ? 'border-coral-400 bg-coral-50'
                            : 'border-gray-100 bg-gray-50'
                        }`}
                      >
                        <div className="text-2xl mb-1">👧</div>
                        <p className={`text-sm font-medium ${formData.gender === '女' ? 'text-coral-600' : 'text-slate-600'}`}>
                          女宝宝
                        </p>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="label-field text-sm">出生日期</label>
                    <input
                      type="date"
                      className="input-field"
                      value={formData.birthDate}
                      max={maxDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingChild(null)}
                      className="flex-1 btn-outline text-sm py-2"
                    >
                      取消
                    </button>
                    <button type="submit" className="flex-1 btn-primary text-sm py-2">
                      保存
                    </button>
                  </div>
                </form>
              </div>
            );
          }

          return (
            <div
              key={child.id}
              className={`card card-hover cursor-pointer transition-all duration-300 ${
                isActive ? 'ring-2 ring-mint-400 ring-offset-2' : ''
              }`}
              onClick={() => handleSwitchChild(child.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-mint-300 via-coral-200 to-coral-300 flex items-center justify-center text-3xl shadow-soft">
                    {getGenderEmoji(child.gender)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{child.name}</h3>
                    <p className="text-sm text-slate-500">
                      {child.gender} · {formatMonthAge(monthAge)}
                    </p>
                  </div>
                </div>
                {isActive && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-mint-100 text-mint-600">
                    当前选中
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="p-2 rounded-xl bg-mint-50 text-center">
                  <p className="text-lg font-bold text-mint-600">{stats.vaccineTotal}</p>
                  <p className="text-xs text-slate-500">疫苗剂次</p>
                </div>
                <div className="p-2 rounded-xl bg-coral-50 text-center">
                  <p className="text-lg font-bold text-coral-600">{stats.checkupTotal}</p>
                  <p className="text-xs text-slate-500">体检次数</p>
                </div>
                <div className="p-2 rounded-xl bg-amber-50 text-center">
                  <p className="text-lg font-bold text-amber-600">{stats.reminderTotal}</p>
                  <p className="text-xs text-slate-500">提醒数</p>
                </div>
              </div>

              <div className="text-xs text-slate-400 mb-3 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(child.birthDate, 'YYYY年MM月DD日')}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEdit(child);
                  }}
                  className="flex-1 btn-outline text-sm py-2 flex items-center justify-center gap-1"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  编辑
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChild(child.id, child.name);
                  }}
                  className="w-10 h-10 rounded-xl border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors"
                  title="删除宝宝"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {!isActive && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSwitchChild(child.id);
                      navigate('/');
                    }}
                    className="w-full btn-primary text-sm py-2 flex items-center justify-center gap-1"
                  >
                    切换到此宝宝
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        <div
          className="card card-hover border-2 border-dashed border-slate-200 flex flex-col items-center justify-center min-h-[280px] cursor-pointer hover:border-mint-300 hover:bg-mint-50/30 transition-all"
          onClick={() => setShowAddModal(true)}
        >
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-3 group-hover:bg-mint-100 transition-colors">
            <Plus className="w-8 h-8 text-slate-400" />
          </div>
          <p className="font-medium text-slate-600">添加宝宝</p>
          <p className="text-xs text-slate-400 mt-1">添加另一个孩子的信息</p>
        </div>
      </div>

      {currentChild && (
        <div className="card card-hover">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              {currentChild.name} 的详细信息
            </h3>
            <button onClick={() => openEdit(currentChild)} className="btn-outline text-sm py-1.5 flex items-center gap-1.5">
              <Pencil className="w-3.5 h-3.5" />
              编辑信息
            </button>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-mint-300 via-coral-200 to-coral-300 flex items-center justify-center text-7xl shadow-soft-lg animate-float">
              {getGenderEmoji(currentChild.gender)}
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              <div className="p-4 rounded-2xl bg-mint-50/50 border border-mint-100">
                <p className="text-xs text-mint-600 font-medium uppercase tracking-wider mb-1">姓名</p>
                <p className="text-2xl font-semibold text-slate-800">{currentChild.name}</p>
              </div>

              <div className="p-4 rounded-2xl bg-coral-50/50 border border-coral-100">
                <p className="text-xs text-coral-600 font-medium uppercase tracking-wider mb-1">性别</p>
                <p className="text-2xl font-semibold text-slate-800">{currentChild.gender}</p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
                <p className="text-xs text-purple-600 font-medium uppercase tracking-wider mb-1">当前月龄</p>
                <p className="text-2xl font-semibold gradient-text">
                  {formatMonthAge(calculateMonthAge(currentChild.birthDate))}
                </p>
              </div>

              <div className="md:col-span-2 p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                <p className="text-xs text-blue-600 font-medium uppercase tracking-wider mb-1">出生日期</p>
                <p className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  {formatDate(currentChild.birthDate, 'YYYY年MM月DD日')}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
                <p className="text-xs text-amber-600 font-medium uppercase tracking-wider mb-1">成长天数</p>
                <p className="text-2xl font-semibold text-slate-800">
                  {Math.floor((new Date().getTime() - new Date(currentChild.birthDate).getTime()) / (1000 * 60 * 60 * 24))}+
                  <span className="text-base text-slate-500"> 天</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-soft-lg max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-mint-400 to-coral-400 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display">添加宝宝</h2>
                    <p className="text-white/80 text-sm">录入新宝宝的基本信息</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({ name: '', gender: '男', birthDate: '' });
                  }}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddChild} className="p-6 space-y-5">
              <div>
                <label className="label-field">
                  <span className="text-red-400">*</span> 宝宝姓名
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="请输入宝宝的名字"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  maxLength={20}
                />
              </div>

              <div>
                <label className="label-field">
                  <span className="text-red-400">*</span> 性别
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: '男' })}
                    className={`p-5 rounded-2xl border-2 transition-all duration-300 ${
                      formData.gender === '男'
                        ? 'border-mint-400 bg-mint-50 shadow-glow-mint'
                        : 'border-gray-100 bg-gray-50 hover:border-mint-200'
                    }`}
                  >
                    <div className="text-4xl mb-2">👦</div>
                    <p className={`font-semibold ${formData.gender === '男' ? 'text-mint-600' : 'text-slate-600'}`}>
                      男宝宝
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: '女' })}
                    className={`p-5 rounded-2xl border-2 transition-all duration-300 ${
                      formData.gender === '女'
                        ? 'border-coral-400 bg-coral-50 shadow-lg'
                        : 'border-gray-100 bg-gray-50 hover:border-coral-200'
                    }`}
                  >
                    <div className="text-4xl mb-2">👧</div>
                    <p className={`font-semibold ${formData.gender === '女' ? 'text-coral-600' : 'text-slate-600'}`}>
                      女宝宝
                    </p>
                  </button>
                </div>
              </div>

              <div>
                <label className="label-field">
                  <span className="text-red-400">*</span> 出生日期
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={formData.birthDate}
                  max={maxDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
                <p className="text-xs text-slate-400 mt-2">
                  系统将根据出生日期自动计算国家免疫规划的接种时间和体检节点
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({ name: '', gender: '男', birthDate: '' });
                  }}
                  className="flex-1 btn-outline"
                >
                  取消
                </button>
                <button type="submit" className="flex-1 btn-primary flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" />
                  添加宝宝
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
