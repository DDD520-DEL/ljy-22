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
  const { child, clearChild, reminders } = useAppStore();
  const pendingReminders = reminders.filter((r) => r.status !== '已完成').length;

  const handleClearData = () => {
    if (window.confirm('确定要清除所有数据吗？此操作不可恢复！')) {
      clearChild();
      navigate('/child-info');
    }
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

        {child && (
          <div className="p-4 mx-4 mt-4 rounded-2xl bg-gradient-to-br from-mint-50 to-coral-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mint-300 to-coral-300 flex items-center justify-center text-2xl">
                {child.gender === '男' ? '👦' : '👧'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-700 truncate">{child.name}</p>
                <p className="text-xs text-slate-500">
                  {child.gender} · {new Date(child.birthDate).toLocaleDateString('zh-CN')}
                </p>
              </div>
            </div>
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
    </div>
  );
}
