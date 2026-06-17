import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Baby, Calendar, Check, Pencil } from 'lucide-react';
import { useAppStore } from '@/store';
import { formatDate, calculateMonthAge, formatMonthAge, getToday } from '@/utils/dateUtils';

export default function ChildInfo() {
  const navigate = useNavigate();
  const { child, setChild, updateChild } = useAppStore();
  const [isEditing, setIsEditing] = useState(!child);
  const [formData, setFormData] = useState({
    name: child?.name || '',
    gender: (child?.gender as '男' | '女') || '男',
    birthDate: child?.birthDate || '',
  });

  useEffect(() => {
    if (child) {
      setFormData({
        name: child.name,
        gender: child.gender,
        birthDate: child.birthDate,
      });
    }
  }, [child]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.birthDate) {
      alert('请填写完整信息');
      return;
    }

    if (child) {
      updateChild(formData);
    } else {
      setChild(formData);
    }
    setIsEditing(false);
    if (!child) {
      navigate('/');
    }
  };

  const maxDate = getToday();

  if (child && !isEditing) {
    const monthAge = calculateMonthAge(child.birthDate);
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display text-slate-800 flex items-center gap-3">
              <span className="text-4xl">👶</span>
              宝宝信息
            </h1>
            <p className="text-slate-500 mt-1">查看和管理宝宝的基本信息</p>
          </div>
          <button onClick={() => setIsEditing(true)} className="btn-outline flex items-center gap-2">
            <Pencil className="w-4 h-4" />
            编辑信息
          </button>
        </div>

        <div className="card card-hover">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-mint-300 via-coral-200 to-coral-300 flex items-center justify-center text-7xl shadow-soft-lg animate-float">
              {child.gender === '男' ? '👦' : '👧'}
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              <div className="p-4 rounded-2xl bg-mint-50/50 border border-mint-100">
                <p className="text-xs text-mint-600 font-medium uppercase tracking-wider mb-1">姓名</p>
                <p className="text-2xl font-semibold text-slate-800">{child.name}</p>
              </div>

              <div className="p-4 rounded-2xl bg-coral-50/50 border border-coral-100">
                <p className="text-xs text-coral-600 font-medium uppercase tracking-wider mb-1">性别</p>
                <p className="text-2xl font-semibold text-slate-800">{child.gender}</p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
                <p className="text-xs text-purple-600 font-medium uppercase tracking-wider mb-1">当前月龄</p>
                <p className="text-2xl font-semibold gradient-text">{formatMonthAge(monthAge)}</p>
              </div>

              <div className="md:col-span-2 p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                <p className="text-xs text-blue-600 font-medium uppercase tracking-wider mb-1">出生日期</p>
                <p className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  {formatDate(child.birthDate, 'YYYY年MM月DD日')}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
                <p className="text-xs text-amber-600 font-medium uppercase tracking-wider mb-1">成长天数</p>
                <p className="text-2xl font-semibold text-slate-800">
                  {calculateMonthAge(child.birthDate) * 30}+ <span className="text-base text-slate-500">天</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card card-hover flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-mint-100 flex items-center justify-center text-3xl">💉</div>
            <div>
              <p className="text-sm text-slate-500">疫苗总剂次</p>
              <p className="text-2xl font-bold text-slate-800">{useAppStore.getState().vaccineSchedules.length}</p>
            </div>
          </div>

          <div className="card card-hover flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-coral-100 flex items-center justify-center text-3xl">🏥</div>
            <div>
              <p className="text-sm text-slate-500">体检次数</p>
              <p className="text-2xl font-bold text-slate-800">{useAppStore.getState().checkupSchedules.length}</p>
            </div>
          </div>

          <div className="card card-hover flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center text-3xl">⏰</div>
            <div>
              <p className="text-sm text-slate-500">近期提醒</p>
              <p className="text-2xl font-bold text-slate-800">{useAppStore.getState().reminders.length}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-mint-300 to-coral-300 text-6xl mb-4 animate-float shadow-soft-lg">
          <Baby className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl font-display text-slate-800">{child ? '编辑宝宝信息' : '欢迎使用育儿管家 👋'}</h1>
        <p className="text-slate-500 mt-2">
          {child ? '更新宝宝的基本资料' : '请先录入宝宝的基本信息，我们将为您自动生成全套疫苗接种和儿保体检计划'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
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
          {child && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex-1 btn-outline"
            >
              取消
            </button>
          )}
          <button type="submit" className="flex-1 btn-primary flex items-center justify-center gap-2">
            <Check className="w-5 h-5" />
            {child ? '保存修改' : '开始使用'}
          </button>
        </div>
      </form>
    </div>
  );
}
