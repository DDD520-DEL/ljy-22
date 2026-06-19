import { useMemo } from 'react';
import type { TemperatureRecord, TemperatureSite } from '@/types';
import { isFever } from '@/types';
import { formatDate } from '@/utils/dateUtils';

interface TemperatureChartProps {
  records: TemperatureRecord[];
  height?: number;
  title?: string;
}

export default function TemperatureChart({
  records,
  height = 320,
  title,
}: TemperatureChartProps) {
  const { chartRecords, yMin, yMax, xLabels, feverThresholds } = useMemo(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const filtered = records
      .filter((r) => {
        const recordDate = new Date(`${r.measureDate}T${r.measureTime}`);
        return recordDate >= sevenDaysAgo;
      })
      .sort(
        (a, b) =>
          new Date(`${a.measureDate}T${a.measureTime}`).getTime() -
          new Date(`${b.measureDate}T${b.measureTime}`).getTime()
      );

    let yMinVal = 36.0;
    let yMaxVal = 38.5;

    for (const r of filtered) {
      yMinVal = Math.min(yMinVal, r.temperature - 0.2);
      yMaxVal = Math.max(yMaxVal, r.temperature + 0.2);
    }

    const xLbls: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(sevenDaysAgo.getDate() + i);
      xLbls.push(formatDate(d, 'MM/DD'));
    }

    const thresholds: Record<TemperatureSite, number> = {
      '腋下': 37.2,
      '口腔': 37.5,
      '额温': 37.2,
      '耳温': 37.5,
      '肛温': 38.0,
    };

    return {
      chartRecords: filtered,
      yMin: yMinVal,
      yMax: yMaxVal,
      xLabels: xLbls,
      feverThresholds: thresholds,
    };
  }, [records]);

  const width = 700;
  const padding = { top: 20, right: 40, bottom: 50, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  const sevenDaysLater = new Date(today);
  sevenDaysLater.setDate(today.getDate() + 0);
  sevenDaysLater.setHours(23, 59, 59, 999);

  const xScale = (date: Date) => {
    const totalMs = sevenDaysLater.getTime() - sevenDaysAgo.getTime();
    const pointMs = date.getTime() - sevenDaysAgo.getTime();
    const ratio = Math.min(Math.max(pointMs / totalMs, 0), 1);
    return padding.left + ratio * chartWidth;
  };

  const yScale = (value: number) =>
    padding.top + chartHeight - ((value - yMin) / (yMax - yMin)) * chartHeight;

  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    const range = yMax - yMin;
    const step = Math.max(0.2, Math.round((range / 5) * 10) / 10);
    const start = Math.floor(yMin * 5) / 5;
    for (let i = 0; i <= 6; i++) {
      const val = parseFloat((start + step * i).toFixed(1));
      if (val <= yMax + 0.1) {
        ticks.push(val);
      }
    }
    return ticks;
  }, [yMin, yMax]);

  if (chartRecords.length === 0) {
    return (
      <div className="card">
        {title && (
          <h3 className="font-semibold text-lg text-slate-800 mb-4">{title}</h3>
        )}
        <div className="text-center py-12">
          <div className="text-5xl mb-3">🌡️</div>
          <p className="text-slate-400">近一周暂无体温记录</p>
          <p className="text-slate-300 text-sm mt-1">添加体温记录后自动生成趋势图</p>
        </div>
      </div>
    );
  }

  const mostCommonSite = chartRecords.reduce((acc, curr) => {
    acc[curr.site] = (acc[curr.site] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const dominantSite = Object.entries(mostCommonSite).sort((a, b) => b[1] - a[1])[0][0] as TemperatureSite;
  const feverThreshold = feverThresholds[dominantSite];

  return (
    <div className="card">
      {title && (
        <h3 className="font-semibold text-lg text-slate-800 mb-4">{title}</h3>
      )}

      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          style={{ minWidth: '500px' }}
        >
          <defs>
            <linearGradient id="feverZoneGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f87171" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#f87171" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="normalLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
          </defs>

          {feverThreshold < yMax && feverThreshold > yMin && (
            <>
              <rect
                x={padding.left}
                y={padding.top}
                width={chartWidth}
                height={yScale(feverThreshold) - padding.top}
                fill="url(#feverZoneGradient)"
              />
              <line
                x1={padding.left}
                y1={yScale(feverThreshold)}
                x2={width - padding.right}
                y2={yScale(feverThreshold)}
                stroke="#f87171"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.6"
              />
              <text
                x={width - padding.right - 5}
                y={yScale(feverThreshold) - 5}
                textAnchor="end"
                fontSize="10"
                fill="#ef4444"
                fontWeight="500"
              >
                发热阈值 {feverThreshold}°C
              </text>
            </>
          )}

          {yTicks.map((tick, i) => (
            <line
              key={`grid-h-${i}`}
              x1={padding.left}
              y1={yScale(tick)}
              x2={width - padding.right}
              y2={yScale(tick)}
              stroke="#f1f5f9"
              strokeWidth="1"
            />
          ))}

          {xLabels.map((label, i) => {
            const d = new Date(sevenDaysAgo);
            d.setDate(sevenDaysAgo.getDate() + i);
            d.setHours(12, 0, 0, 0);
            return (
              <line
                key={`grid-v-${i}`}
                x1={xScale(d)}
                y1={padding.top}
                x2={xScale(d)}
                y2={height - padding.bottom}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
            );
          })}

          {chartRecords.length > 1 && (
            <path
              d={chartRecords
                .map((r, i) => {
                  const date = new Date(`${r.measureDate}T${r.measureTime}`);
                  const x = xScale(date);
                  const y = yScale(r.temperature);
                  return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
                })
                .join(' ')}
              fill="none"
              stroke="url(#normalLineGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {chartRecords.map((r, i) => {
            const date = new Date(`${r.measureDate}T${r.measureTime}`);
            const x = xScale(date);
            const y = yScale(r.temperature);
            const hasFever = isFever(r.temperature, r.site);
            return (
              <g key={`point-${i}`}>
                {hasFever && (
                  <circle
                    cx={x}
                    cy={y}
                    r="12"
                    fill="#fecaca"
                    opacity="0.4"
                    className="animate-pulse-soft"
                  />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r="7"
                  fill="white"
                  stroke={hasFever ? '#ef4444' : '#34d399'}
                  strokeWidth="2.5"
                />
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill={hasFever ? '#ef4444' : '#34d399'}
                />
                <title>
                  {formatDate(r.measureDate, 'MM月DD日')} {r.measureTime}
                  {'\n'}体温：{r.temperature}°C ({r.site})
                  {'\n'}状态：{hasFever ? '⚠️ 发热' : '✅ 正常'}
                  {r.notes && `\n备注：${r.notes}`}
                </title>
              </g>
            );
          })}

          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke="#cbd5e1"
            strokeWidth="1"
          />
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={height - padding.bottom}
            stroke="#cbd5e1"
            strokeWidth="1"
          />

          {xLabels.map((label, i) => {
            const d = new Date(sevenDaysAgo);
            d.setDate(sevenDaysAgo.getDate() + i);
            d.setHours(12, 0, 0, 0);
            const isToday = formatDate(d) === formatDate(new Date());
            return (
              <g key={`x-tick-${i}`}>
                <line
                  x1={xScale(d)}
                  y1={height - padding.bottom}
                  x2={xScale(d)}
                  y2={height - padding.bottom + 5}
                  stroke="#94a3b8"
                  strokeWidth="1"
                />
                <text
                  x={xScale(d)}
                  y={height - padding.bottom + 20}
                  textAnchor="middle"
                  fontSize="11"
                  fill={isToday ? '#0ea5e9' : '#64748b'}
                  fontWeight={isToday ? '600' : '400'}
                >
                  {label}
                  {isToday && ' (今天)'}
                </text>
              </g>
            );
          })}

          {yTicks.map((tick, i) => (
            <g key={`y-tick-${i}`}>
              <line
                x1={padding.left - 5}
                y1={yScale(tick)}
                x2={padding.left}
                y2={yScale(tick)}
                stroke="#94a3b8"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={yScale(tick) + 4}
                textAnchor="end"
                fontSize="11"
                fill="#64748b"
              >
                {tick.toFixed(1)}
              </text>
            </g>
          ))}

          <text
            x={width / 2}
            y={height - 8}
            textAnchor="middle"
            fontSize="12"
            fill="#64748b"
            fontWeight="500"
          >
            测量日期
          </text>

          <text
            x={15}
            y={height / 2}
            textAnchor="middle"
            fontSize="12"
            fill="#64748b"
            fontWeight="500"
            transform={`rotate(-90, 15, ${height / 2})`}
          >
            体温 (°C)
          </text>
        </svg>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-mint-400 border-2 border-white shadow" />
          <span className="text-xs text-slate-500">正常体温</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow" />
          <span className="text-xs text-slate-500">发热状态</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-red-400" style={{ borderStyle: 'dashed' }} />
          <span className="text-xs text-slate-500">
            发热阈值（{dominantSite}）{feverThreshold}°C
          </span>
        </div>
      </div>
    </div>
  );
}
