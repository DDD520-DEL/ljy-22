import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Edit2,
  X,
  ChevronLeft,
  ChevronRight,
  Wallet,
  PiggyBank,
  TrendingUp,
  Calendar,
  Check,
  Baby,
} from 'lucide-react';
import { useAppStore } from '@/store';
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_COLORS,
  EXPENSE_CATEGORY_ICONS,
  type ExpenseCategory,
  type ExpenseRecord,
} from '@/types';
import { formatDate, getToday, generateId } from '@/utils/dateUtils';

function calculatePieSlices(data: { category: ExpenseCategory; amount: number; color: string }[]) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  if (total === 0) return [];

  const slices: {
    category: ExpenseCategory;
    amount: number;
    percentage: number;
    color: string;
    startAngle: number;
    endAngle: number;
    largeArc: number;
    path: string;
  }[] = [];

  let currentAngle = -90;

  for (const item of data) {
    const percentage = (item.amount / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = 100 + 80 * Math.cos(startRad);
    const y1 = 100 + 80 * Math.sin(startRad);
    const x2 = 100 + 80 * Math.cos(endRad);
    const y2 = 100 + 80 * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    const path = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`;

    slices.push({
      category: item.category,
      amount: item.amount,
      percentage,
      color: item.color,
      startAngle,
      endAngle,
      largeArc,
      path,
    });

    currentAngle = endAngle;
  }

  return slices;
}

export default function ExpenseTracker() {
  const navigate = useNavigate();
  const { children, currentChildId, expenseRecords, addExpenseRecord, updateExpenseRecord, deleteExpenseRecord } =
    useAppStore();

  const child = children.find((c) => c.id === currentChildId) || null;
  const currentExpenseRecords = expenseRecords.filter((r) => r.childId === currentChildId);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ExpenseRecord | null>(null);
  const [formData, setFormData] = useState({
    category: '奶粉辅食' as ExpenseCategory,
    amount: '',
    description: '',
    expenseDate: getToday(),
    notes: '',
  });

  const monthRecords = useMemo(() => {
    return currentExpenseRecords
      .filter((r) => r.expenseDate.startsWith(selectedMonth))
      .sort((a, b) => b.expenseDate.localeCompare(a.expenseDate));
  }, [currentExpenseRecords, selectedMonth]);

  const monthlyTotal = useMemo(() => {
    return monthRecords.reduce((sum, r) => sum + r.amount, 0);
  }, [monthRecords]);

  const categorySummary = useMemo(() => {
    const summary: Record<ExpenseCategory, number> = {
      '疫苗费用': 0,
      '体检费用': 0,
      '奶粉辅食': 0,
      '纸尿裤': 0,
      '衣物玩具': 0,
      '医疗药品': 0,
      '教育娱乐': 0,
      '其他': 0,
    };

    for (const record of monthRecords) {
      summary[record.category] += record.amount;
    }

    return EXPENSE_CATEGORIES.map((category) => ({
      category,
      amount: summary[category],
      percentage: monthlyTotal > 0 ? (summary[category] / monthlyTotal) * 100 : 0,
      color: EXPENSE_CATEGORY_COLORS[category],
      icon: EXPENSE_CATEGORY_ICONS[category],
    })).filter((item) => item.amount > 0).sort((a, b) => b.amount - a.amount);
  }, [monthRecords, monthlyTotal]);

  const pieSlices = useMemo(() => {
    return calculatePieSlices(
      categorySummary.map((item) => ({
        category: item.category,
        amount: item.amount,
        color: item.color,
      }))
    );
  }, [categorySummary]);

  const changeMonth = (delta: number) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + delta, 1);
    setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('请输入有效的金额');
      return;
    }

    if (!formData.description.trim()) {
      alert('请填写支出描述');
      return;
    }

    const recordData = {
      category: formData.category,
      amount,
      description: formData.description.trim(),
      expenseDate: formData.expenseDate,
      notes: formData.notes.trim() || undefined,
    };

    if (editingRecord) {
      updateExpenseRecord(editingRecord.id, recordData);
    } else {
      addExpenseRecord(recordData);
    }

    resetForm();
  };

  const handleEdit = (record: ExpenseRecord) => {
    setEditingRecord(record);
    setFormData({
      category: record.category,
      amount: record.amount.toString(),
      description: record.description,
      expenseDate: record.expenseDate,
      notes: record.notes || '',
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这条支出记录吗？')) {
      deleteExpenseRecord(id);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingRecord(null);
    setFormData({
      category: '奶粉辅食' as ExpenseCategory,
      amount: '',
      description: '',
      expenseDate: getToday(),
      notes: '',
    });
  };

  const [year, month] = selectedMonth.split('-').map(Number);
  const monthDisplay = `${year}年${month}月`;

  if (!child) {
    return (
      <div className="card text-center py-16 animate-fade-in-up">
        <Baby className="w-16 h-16 mx-auto text-mint-400 mb-4" />
        <h2 className="text-2xl font-display text-slate-700 mb-2">请先录入宝宝信息</h2>
        <p className="text-slate-500 mb-6">录入宝宝出生日期后，即可记录育儿费用</p>
        <button className="btn-primary" onClick={() => navigate('/child-info')}>
          去录入宝宝信息
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display text-slate-800 flex items-center gap-3">
            <span className="text-4xl">💰</span>
            育儿费用记账
          </h1>
          <p className="text-slate-500 mt-1">按类别记录育儿开销，饼图展示支出占比</p>
        </div>
        <button
          className="btn-primary flex items-center justify-center gap-2"
          onClick={() => setShowForm(true)}
        >
          <Plus className="w-5 h-5" />
          记一笔支出
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-400 flex items-center justify-center shadow-soft">
              <Wallet className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-amber-600 font-medium">本月总支出</p>
              <p className="text-3xl font-bold text-amber-700">
                ¥{monthlyTotal.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center shadow-soft">
              <PiggyBank className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">支出笔数</p>
              <p className="text-3xl font-bold text-blue-700">{monthRecords.length} 笔</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-mint-50 border-green-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-mint-400 flex items-center justify-center shadow-soft">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">类别数量</p>
              <p className="text-3xl font-bold text-green-700">{categorySummary.length} 类</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              支出占比
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeMonth(-1)}
                className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <span className="font-medium text-slate-700 min-w-28 text-center">
                {monthDisplay}
              </span>
              <button
                onClick={() => changeMonth(1)}
                className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>

          {pieSlices.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-slate-500">本月还没有支出记录</p>
              <p className="text-slate-400 text-sm mt-1">点击右上角「记一笔支出」开始记录</p>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <svg width="200" height="200" viewBox="0 0 200 200">
                  {pieSlices.map((slice, index) => (
                    <path
                      key={index}
                      d={slice.path}
                      fill={slice.color}
                      className="transition-opacity hover:opacity-80 cursor-pointer"
                    />
                  ))}
                  <circle cx="100" cy="100" r="45" fill="white" />
                  <text
                    x="100"
                    y="95"
                    textAnchor="middle"
                    className="text-xs fill-slate-400"
                    fontSize="12"
                  >
                    本月
                  </text>
                  <text
                    x="100"
                    y="115"
                    textAnchor="middle"
                    className="font-bold fill-slate-700"
                    fontSize="18"
                  >
                    ¥{monthlyTotal.toFixed(0)}
                  </text>
                </svg>
              </div>

              <div className="flex-1 w-full space-y-3">
                {categorySummary.map((item) => (
                  <div key={item.category} className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-lg flex-shrink-0">{item.icon}</span>
                    <span className="flex-1 text-sm text-slate-700">{item.category}</span>
                    <span className="text-sm font-semibold text-slate-800">
                      ¥{item.amount.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-400 w-14 text-right">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
              <span className="text-2xl">📋</span>
              本月支出明细
            </h3>
          </div>

          {monthRecords.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">💸</div>
              <p className="text-slate-500">本月还没有支出记录</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {monthRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-soft transition-all group"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: EXPENSE_CATEGORY_COLORS[record.category] + '20' }}
                  >
                    {EXPENSE_CATEGORY_ICONS[record.category]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-800 truncate">{record.description}</p>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: EXPENSE_CATEGORY_COLORS[record.category] + '15',
                          color: EXPENSE_CATEGORY_COLORS[record.category],
                        }}
                      >
                        {record.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(record.expenseDate, 'MM月DD日')}
                      {record.notes && <span className="ml-2">· {record.notes}</span>}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-slate-800">
                      ¥{record.amount.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(record)}
                      className="w-8 h-8 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400 hover:text-blue-500 transition-colors"
                      title="编辑"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-soft-lg max-w-lg w-full overflow-hidden">
            <div className="bg-gradient-to-r from-amber-400 to-yellow-400 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display">
                      {editingRecord ? '编辑支出' : '新增支出'}
                    </h2>
                    <p className="text-white/80 text-sm">记录一笔育儿开销</p>
                  </div>
                </div>
                <button
                  onClick={resetForm}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="label-field">支出类别</label>
                <div className="grid grid-cols-4 gap-2">
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat })}
                      className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                        formData.category === cat
                          ? 'border-amber-400 bg-amber-50 shadow-soft'
                          : 'border-slate-100 bg-slate-50 hover:border-amber-200'
                      }`}
                    >
                      <div className="text-2xl mb-1">{EXPENSE_CATEGORY_ICONS[cat]}</div>
                      <p className={`text-xs font-medium ${
                        formData.category === cat ? 'text-amber-700' : 'text-slate-600'
                      }`}>
                        {cat}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label-field">
                  <span className="text-red-400">*</span> 支出金额（元）
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                    ¥
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="input-field pl-10"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label-field">
                  <span className="text-red-400">*</span> 支出描述
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="例如：购买XX品牌奶粉2罐"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  maxLength={50}
                  required
                />
              </div>

              <div>
                <label className="label-field">支出日期</label>
                <input
                  type="date"
                  className="input-field"
                  value={formData.expenseDate}
                  onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                  max={getToday()}
                />
              </div>

              <div>
                <label className="label-field">备注（可选）</label>
                <textarea
                  className="input-field resize-none"
                  placeholder="补充说明..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  maxLength={200}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm} className="flex-1 btn-outline">
                  取消
                </button>
                <button type="submit" className="flex-1 btn-primary flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" />
                  {editingRecord ? '保存修改' : '添加支出'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
