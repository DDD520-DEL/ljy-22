import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Home,
  Baby,
  Syringe,
  Stethoscope,
  Bell,
  FileText,
  Printer,
  LogOut,
  Plus,
  ChevronDown,
  X,
  UserPlus,
} from 'lucide-react';
import { useAppStore } from '@/store';

const navItems = [
  { path: '/', icon: Home, label: '首页概览' },
  { path: '/child-info', icon: Baby, label: '宝宝信息' },
  { path: '/vaccine-schedule', icon: Syringe, label: '疫苗接种' },
  { path: '/checkup-schedule', icon: Stethoscope, label: '儿保体检' },
  { path: '/reminders', icon: Bell, label: '提醒中心' },
  { path: '/records', icon: FileText, label: '记录管理' },
  { path: '/export', icon: Printer, label: '导出打印' },
];

export default function Layout() {
  const navigate = useNavigate();
  const { children, currentChildId, switchChild, deleteChild, reminders } = useAppStore();
  const [showChildList, setShowChildList] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const currentChild = children.find((c) => c.id === currentChildId) || null;
  const pendingReminders = reminders.filter((r) => r.status !== '已完成').length;

  const handleSwitchChild = (id: string) => {
    switchChild(id);
    setShowChildList(false);
  };

  const handleDeleteChild = (id: string, name: string) => {
    if (window.confirm(`确定要删除宝宝「${name}」吗？所有相关数据将被清除，此操作不可恢复！`)) {
      deleteChild(id);
      if (children.length <= 1) {
        setShowChildList(false);
        navigate('/child-info');
      }
    }
  };

  const handleClearData = () => {
    if (window.confirm('确定要清除所有数据吗？此操作不可恢复！')) {
      children.forEach((c) => deleteChild(c.id));
      navigate('/child-info');
    }
  };

  const getGenderEmoji = (gender: '男' | '女') => {
    return gender === '男' ? '👦' : '👧';
  };

  return (
    <div className="min-h-screen flex">
      <aside className="no-print w-64 bg-white/80 backdrop-blur-xl border-r border-mint-100 flex flex-col fixed h-screen z-50">
        <div className="p-6 border-b border-mint-50">
          <h1 className="font-display text-2xl gradient-text flex items-center gap-2">
            <span className="text-3xl">👶</span>
            育儿管家
          </h1>
          <p className="text-xs text-slate-400 mt-1">疫苗接种 · 儿保体检 全程管理</p>
        </div>

        {currentChild && (
          <div className="relative p-4 mx-4 mt-4">
            <div
              className="rounded-2xl bg-gradient-to-br from-mint-50 to-coral-50 cursor-pointer hover:shadow-soft transition-all duration-300 p-4"
              onClick={() => setShowChildList(!showChildList)}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mint-300 to-coral-300 flex items-center justify-center text-2xl shadow-soft">
                  {getGenderEmoji(currentChild.gender)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-700 truncate">{currentChild.name}</p>
                  <p className="text-xs text-slate-500">
                    {currentChild.gender} · {new Date(currentChild.birthDate).toLocaleDateString('zh-CN')}
                  </p>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform ${showChildList ? 'rotate-180' : ''}`}
                />
              </div>
            </div>

            {showChildList && (
              <div className="absolute top-full left-4 right-4 mt-2 bg-white rounded-2xl shadow-soft-lg border border-slate-100 overflow-hidden z-50 animate-fade-in">
                <div className="max-h-64 overflow-y-auto">
                  {children.map((child) => (
                    <div
                      key={child.id}
                      className={`flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors ${
                        child.id === currentChildId ? 'bg-mint-50' : ''
                      }`}
                      onClick={() => handleSwitchChild(child.id)}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-mint-200 to-coral-200 flex items-center justify-center text-xl flex-shrink-0">
                        {getGenderEmoji(child.gender)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-700 truncate text-sm">{child.name}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(child.birthDate).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                      {child.id === currentChildId && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-mint-100 text-mint-600 font-medium">
                          当前
                        </span>
                      )}
                      {children.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChild(child.id, child.name);
                          }}
                          className="w-7 h-7 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors"
                          title="删除宝宝"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-100 p-2">
                  <button
                    onClick={() => {
                      setShowChildList(false);
                      setShowAddModal(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-mint-600 hover:bg-mint-50 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    添加宝宝
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''} relative`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.path === '/reminders' && pendingReminders > 0 && (
                  <span className="min-w-5 h-5 px-1.5 bg-coral-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {pendingReminders}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-mint-50">
          <button
            onClick={handleClearData}
            className="sidebar-link w-full text-slate-400 hover:text-red-500 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
            <span>清除数据</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 min-h-screen">
        <div className="container py-8 max-w-7xl animate-fade-in">
          <Outlet />
        </div>
      </main>

      {showAddModal && (
        <AddChildModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => setShowAddModal(false)}
        />
      )}

      {showChildList && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowChildList(false)}
        />
      )}
    </div>
  );
}

function AddChildModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { addChild } = useAppStore();
  const [formData, setFormData] = useState({
    name: '',
    gender: '男' as '男' | '女',
    birthDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.birthDate) {
      alert('请填写完整信息');
      return;
    }
    addChild(formData);
    onSuccess();
  };

  const maxDate = new Date().toISOString().split('T')[0];

  return (
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
              onClick={onClose}
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
  );
}
