import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { CheckupRecord, Child } from '@/types';
import type { GrowthMetric } from '@/data/growthStandards';
import {
  getGrowthData,
  calculatePercentileRank,
  getGrowthStatus,
  getDeviationFromMedian,
} from '@/data/growthStandards';

interface GrowthSummaryCardProps {
  child: Child;
  checkupRecords: CheckupRecord[];
  metric: GrowthMetric;
  label: string;
  icon: string;
  color: string;
}

export function GrowthSummaryCard({
  child,
  checkupRecords,
  metric,
  label,
  icon,
  color,
}: GrowthSummaryCardProps) {
  const { latestRecord, previousRecord, percentile, status, deviation } = useMemo(() => {
    const recordsWithData = checkupRecords
      .filter((r) => {
        if (metric === 'weight') return r.weight !== undefined;
        if (metric === 'height') return r.height !== undefined;
        if (metric === 'headCircumference') return r.headCircumference !== undefined;
        return false;
      })
      .sort((a, b) => a.monthAge - b.monthAge);

    if (recordsWithData.length === 0) {
      return {
        latestRecord: null,
        previousRecord: null,
        percentile: null,
        status: null,
        deviation: null,
      };
    }

    const latest = recordsWithData[recordsWithData.length - 1];
    const previous = recordsWithData.length > 1 ? recordsWithData[recordsWithData.length - 2] : null;
    const growthData = getGrowthData(metric, child.gender);

    let value: number;
    if (metric === 'weight') value = latest.weight!;
    else if (metric === 'height') value = latest.height!;
    else value = latest.headCircumference!;

    const pct = calculatePercentileRank(value, latest.monthAge, growthData);
    const st = getGrowthStatus(pct);
    const dev = getDeviationFromMedian(value, latest.monthAge, growthData);

    return {
      latestRecord: latest,
      previousRecord: previous,
      percentile: pct,
      status: st,
      deviation: dev,
    };
  }, [checkupRecords, metric, child.gender]);

  if (!latestRecord || percentile === null || !status || !deviation) {
    return (
      <div className="card card-hover">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-xl`}>
            {icon}
          </div>
          <h4 className="font-semibold text-slate-700">{label}</h4>
        </div>
        <div className="text-center py-4">
          <p className="text-slate-400 text-sm">暂无数据</p>
          <p className="text-slate-300 text-xs mt-1">完成体检后自动生成</p>
        </div>
      </div>
    );
  }

  const value =
    metric === 'weight'
      ? latestRecord.weight
      : metric === 'height'
      ? latestRecord.height
      : latestRecord.headCircumference;
  const unit = metric === 'weight' ? 'kg' : 'cm';

  let trend: 'up' | 'down' | 'stable' = 'stable';
  let trendText = '';
  if (previousRecord) {
    const prevValue =
      metric === 'weight'
        ? previousRecord.weight
        : metric === 'height'
        ? previousRecord.height
        : previousRecord.headCircumference;
    if (prevValue !== undefined && value !== undefined) {
      const diff = value - prevValue;
      if (diff > 0) trend = 'up';
      else if (diff < 0) trend = 'down';
      trendText = `${diff > 0 ? '+' : ''}${diff.toFixed(1)}${unit}`;
    }
  }

  return (
    <div className="card card-hover">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-xl`}>
            {icon}
          </div>
          <h4 className="font-semibold text-slate-700">{label}</h4>
        </div>
        <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
      </div>

      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="text-3xl font-bold text-slate-800">
            {value?.toFixed(1)}
            <span className="text-sm font-normal text-slate-400 ml-1">{unit}</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {latestRecord.monthAge < 12
              ? `${latestRecord.monthAge}月龄`
              : `${Math.floor(latestRecord.monthAge / 12)}岁${latestRecord.monthAge % 12}月`}
          </div>
        </div>
        {previousRecord && (
          <div className="flex items-center gap-1 text-xs">
            {trend === 'up' && <TrendingUp className="w-4 h-4 text-mint-500" />}
            {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
            {trend === 'stable' && <Minus className="w-4 h-4 text-slate-400" />}
            <span className={trend === 'up' ? 'text-mint-600' : trend === 'down' ? 'text-red-600' : 'text-slate-500'}>
              {trendText}
            </span>
          </div>
        )}
      </div>

      <div className="bg-slate-50 rounded-xl p-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-slate-500">百分位</span>
          <span className="text-xs font-semibold text-slate-700">P{percentile.toFixed(0)}</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(Math.max(percentile, 3), 97)}%`,
              background: status.level === 'normal'
                ? 'linear-gradient(90deg, #34d399, #10b981)'
                : status.level === 'low'
                ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                : 'linear-gradient(90deg, #60a5fa, #3b82f6)',
            }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-slate-400">P3</span>
          <span className="text-[10px] text-slate-400">P50</span>
          <span className="text-[10px] text-slate-400">P97</span>
        </div>
      </div>

      <div className="mt-3 text-xs text-slate-500">
        <span>与中位值偏差：</span>
        <span className={deviation.deviation >= 0 ? 'text-mint-600 font-medium' : 'text-amber-600 font-medium'}>
          {deviation.deviation >= 0 ? '+' : ''}
          {deviation.deviation.toFixed(1)}
          {unit} ({deviation.deviationPercent >= 0 ? '+' : ''}
          {deviation.deviationPercent.toFixed(1)}%)
        </span>
      </div>
    </div>
  );
}
