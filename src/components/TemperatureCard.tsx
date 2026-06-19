import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Thermometer, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { TemperatureRecord } from '@/types';
import { isFever } from '@/types';
import { formatDate, formatTime } from '@/utils/dateUtils';

interface TemperatureCardProps {
  records: TemperatureRecord[];
}

export function TemperatureCard({ records }: TemperatureCardProps) {
  const { latest, previous, hasFever } = useMemo(() => {
    const sorted = [...records].sort(
      (a, b) =>
        new Date(`${b.measureDate}T${b.measureTime}`).getTime() -
        new Date(`${a.measureDate}T${a.measureTime}`).getTime()
    );

    if (sorted.length === 0) {
      return { latest: null, previous: null, hasFever: false };
    }

    const latestRecord = sorted[0];
    const previousRecord = sorted.length > 1 ? sorted[1] : null;
    const fever = isFever(latestRecord.temperature, latestRecord.site);

    return { latest: latestRecord, previous: previousRecord, hasFever: fever };
  }, [records]);

  if (!latest) {
    return (
      <div className="card card-hover">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
            <span className="text-2xl">🌡️</span>
            体温记录
          </h3>
          <Link
            to="/temperature"
            className="text-coral-500 text-sm font-medium flex items-center hover:text-coral-600"
          >
            查看详情 <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <Thermometer className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-400">暂无体温记录</p>
          <p className="text-slate-300 text-sm mt-1">点击记录第一次体温</p>
        </div>
      </div>
    );
  }

  let trend: 'up' | 'down' | 'stable' = 'stable';
  let trendText = '';
  if (previous) {
    const diff = latest.temperature - previous.temperature;
    if (diff > 0.1) trend = 'up';
    else if (diff < -0.1) trend = 'down';
    trendText = `${diff > 0 ? '+' : ''}${diff.toFixed(1)}°C`;
  }

  return (
    <div
      className={`card card-hover ${
        hasFever
          ? 'bg-gradient-to-br from-red-50 to-white border-red-200 border-2'
          : 'bg-gradient-to-br from-mint-50 to-white border-mint-100 border-2'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
          <span className="text-2xl">🌡️</span>
          最近体温
          {hasFever && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500 text-white font-medium animate-pulse-soft">
              发热中
            </span>
          )}
        </h3>
        <Link
          to="/temperature"
          className={`text-sm font-medium flex items-center ${
            hasFever ? 'text-red-500 hover:text-red-600' : 'text-mint-500 hover:text-mint-600'
          }`}
        >
          查看详情 <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-5xl font-bold ${
                hasFever ? 'text-red-500' : 'text-mint-600'
              }`}
            >
              {latest.temperature.toFixed(1)}
            </span>
            <span className="text-xl text-slate-400">°C</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">
              {latest.site}
            </span>
            <span>
              {formatDate(latest.measureDate, 'MM月DD日')} {formatTime(latest.measureTime)}
            </span>
          </div>
          {latest.notes && (
            <p className="text-xs text-slate-400 mt-2 truncate">备注：{latest.notes}</p>
          )}
        </div>

        {previous && (
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 text-sm">
              {trend === 'up' && (
                <TrendingUp className="w-5 h-5 text-red-500" />
              )}
              {trend === 'down' && (
                <TrendingDown className="w-5 h-5 text-mint-500" />
              )}
              {trend === 'stable' && (
                <Minus className="w-5 h-5 text-slate-400" />
              )}
              <span
                className={
                  trend === 'up'
                    ? 'text-red-500 font-medium'
                    : trend === 'down'
                    ? 'text-mint-500 font-medium'
                    : 'text-slate-500'
                }
              >
                {trendText}
              </span>
            </div>
            <span className="text-xs text-slate-400">较上次</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>本周共记录 {records.filter((r) => {
            const d = new Date();
            d.setDate(d.getDate() - 6);
            return new Date(r.measureDate) >= d;
          }).length} 次</span>
          <span>
            {hasFever ? (
              <span className="text-red-500 font-medium">⚠️ 请注意观察，及时就医</span>
            ) : (
              <span className="text-mint-500 font-medium">✅ 体温正常，继续保持</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
