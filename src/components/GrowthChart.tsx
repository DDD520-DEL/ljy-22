import { useMemo } from 'react';
import type { PercentileData, GrowthMetric, Gender } from '@/data/growthStandards';
import { getGrowthData, calculatePercentileRank, getGrowthStatus } from '@/data/growthStandards';
import { formatMonthAge } from '@/utils/dateUtils';

interface GrowthChartProps {
  metric: GrowthMetric;
  gender: Gender;
  dataPoints: { monthAge: number; value: number }[];
  maxMonthAge?: number;
  height?: number;
  showLegend?: boolean;
  title?: string;
}

const PERCENTILE_COLORS: Record<string, string> = {
  P3: '#f87171',
  P15: '#fbbf24',
  P50: '#34d399',
  P85: '#60a5fa',
  P97: '#a78bfa',
};

const PERCENTILE_LABELS: Record<string, string> = {
  P3: '第3百分位',
  P15: '第15百分位',
  P50: '第50百分位（中位）',
  P85: '第85百分位',
  P97: '第97百分位',
};

export default function GrowthChart({
  metric,
  gender,
  dataPoints,
  maxMonthAge = 84,
  height = 320,
  showLegend = true,
  title,
}: GrowthChartProps) {
  const growthData = useMemo(() => getGrowthData(metric, gender), [metric, gender]);

  const { chartData, yMin, yMax, xMin, xMax } = useMemo(() => {
    const filteredData = growthData.filter((d) => d.monthAge <= maxMonthAge);
    const xMinVal = 0;
    const xMaxVal = maxMonthAge;

    let yMinVal = Infinity;
    let yMaxVal = -Infinity;

    for (const d of filteredData) {
      yMinVal = Math.min(yMinVal, d.P3);
      yMaxVal = Math.max(yMaxVal, d.P97);
    }

    for (const dp of dataPoints) {
      if (dp.monthAge <= maxMonthAge) {
        yMinVal = Math.min(yMinVal, dp.value);
        yMaxVal = Math.max(yMaxVal, dp.value);
      }
    }

    const yPadding = (yMaxVal - yMinVal) * 0.1;
    yMinVal -= yPadding;
    yMaxVal += yPadding;

    return {
      chartData: filteredData,
      yMin: yMinVal,
      yMax: yMaxVal,
      xMin: xMinVal,
      xMax: xMaxVal,
    };
  }, [growthData, maxMonthAge, dataPoints]);

  const width = 700;
  const padding = { top: 20, right: 40, bottom: 40, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const xScale = (monthAge: number) =>
    padding.left + ((monthAge - xMin) / (xMax - xMin)) * chartWidth;

  const yScale = (value: number) =>
    padding.top + chartHeight - ((value - yMin) / (yMax - yMin)) * chartHeight;

  const generatePath = (key: keyof PercentileData) => {
    return chartData
      .map((d, i) => {
        const x = xScale(d.monthAge);
        const y = yScale(d[key] as number);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(' ');
  };

  const xTicks = useMemo(() => {
    const ticks: number[] = [];
    const step = maxMonthAge <= 24 ? 3 : maxMonthAge <= 48 ? 6 : 12;
    for (let i = 0; i <= maxMonthAge; i += step) {
      ticks.push(i);
    }
    return ticks;
  }, [maxMonthAge]);

  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    const range = yMax - yMin;
    const step = range / 5;
    const roundedStep = Math.ceil(step * 10) / 10;
    const start = Math.floor(yMin * 10) / 10;
    for (let i = 0; i <= 6; i++) {
      ticks.push(parseFloat((start + roundedStep * i).toFixed(1)));
    }
    return ticks;
  }, [yMin, yMax]);

  const unit = metric === 'weight' ? 'kg' : metric === 'height' ? 'cm' : 'cm';

  const latestDataPoint = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1] : null;
  const latestPercentile = latestDataPoint
    ? calculatePercentileRank(latestDataPoint.value, latestDataPoint.monthAge, growthData)
    : null;
  const latestStatus = latestPercentile ? getGrowthStatus(latestPercentile) : null;

  return (
    <div className="w-full">
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-slate-800">{title}</h3>
          {latestStatus && latestDataPoint && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">最新：</span>
              <span className="font-bold text-slate-700">
                {latestDataPoint.value} {unit}
              </span>
              <span className={`text-sm font-medium ${latestStatus.color}`}>
                ({latestStatus.label} · P{latestPercentile?.toFixed(0)})
              </span>
            </div>
          )}
        </div>
      )}

      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          style={{ minWidth: '500px' }}
        >
          <defs>
            <linearGradient id="normalZoneGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.05" />
            </linearGradient>
          </defs>

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

          {xTicks.map((tick, i) => (
            <line
              key={`grid-v-${i}`}
              x1={xScale(tick)}
              y1={padding.top}
              x2={xScale(tick)}
              y2={height - padding.bottom}
              stroke="#f1f5f9"
              strokeWidth="1"
            />
          ))}

          <path
            d={`
              M ${xScale(chartData[0].monthAge)} ${yScale(chartData[0].P15)}
              ${chartData.map((d) => `L ${xScale(d.monthAge)} ${yScale(d.P85)}`).join(' ')}
              L ${xScale(chartData[chartData.length - 1].monthAge)} ${yScale(chartData[chartData.length - 1].P85)}
              ${[...chartData].reverse().map((d) => `L ${xScale(d.monthAge)} ${yScale(d.P15)}`).join(' ')}
              Z
            `}
            fill="url(#normalZoneGradient)"
          />

          {(['P3', 'P15', 'P50', 'P85', 'P97'] as const).map((p) => (
            <path
              key={p}
              d={generatePath(p)}
              fill="none"
              stroke={PERCENTILE_COLORS[p]}
              strokeWidth={p === 'P50' ? 2 : 1}
              strokeDasharray={p === 'P3' || p === 'P97' ? '4 4' : 'none'}
              opacity={0.8}
            />
          ))}

          {dataPoints.length > 0 && (
            <>
              {dataPoints.length > 1 && (
                <path
                  d={dataPoints
                    .filter((dp) => dp.monthAge <= maxMonthAge)
                    .map((dp, i) => {
                      const x = xScale(dp.monthAge);
                      const y = yScale(dp.value);
                      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {dataPoints
                .filter((dp) => dp.monthAge <= maxMonthAge)
                .map((dp, i) => {
                  const percentile = calculatePercentileRank(dp.value, dp.monthAge, growthData);
                  const status = getGrowthStatus(percentile);
                  return (
                    <g key={`point-${i}`}>
                      <circle
                        cx={xScale(dp.monthAge)}
                        cy={yScale(dp.value)}
                        r="6"
                        fill="white"
                        stroke="#f97316"
                        strokeWidth="2.5"
                      />
                      <circle
                        cx={xScale(dp.monthAge)}
                        cy={yScale(dp.value)}
                        r="3"
                        fill="#f97316"
                      />
                      <title>
                        {formatMonthAge(dp.monthAge)}: {dp.value}
                        {unit} (P{percentile.toFixed(0)} · {status.label})
                      </title>
                    </g>
                  );
                })}
            </>
          )}

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

          {xTicks.map((tick, i) => (
            <g key={`x-tick-${i}`}>
              <line
                x1={xScale(tick)}
                y1={height - padding.bottom}
                x2={xScale(tick)}
                y2={height - padding.bottom + 5}
                stroke="#94a3b8"
                strokeWidth="1"
              />
              <text
                x={xScale(tick)}
                y={height - padding.bottom + 20}
                textAnchor="middle"
                fontSize="11"
                fill="#64748b"
              >
                {tick < 12 ? `${tick}月` : `${tick / 12}岁`}
              </text>
            </g>
          ))}

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
                {tick}
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
            月龄
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
            {metric === 'weight' ? '体重(kg)' : metric === 'height' ? '身高(cm)' : '头围(cm)'}
          </text>
        </svg>
      </div>

      {showLegend && (
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4 pt-4 border-t border-slate-100">
          {(['P3', 'P15', 'P50', 'P85', 'P97'] as const).map((p) => (
            <div key={p} className="flex items-center gap-2">
              <div
                className="w-6 h-0.5"
                style={{
                  backgroundColor: PERCENTILE_COLORS[p],
                  borderStyle: p === 'P3' || p === 'P97' ? 'dashed' : 'solid',
                }}
              />
              <span className="text-xs text-slate-500">{PERCENTILE_LABELS[p]}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500 border-2 border-white shadow" />
            <span className="text-xs text-slate-500">宝宝数据</span>
          </div>
        </div>
      )}
    </div>
  );
}
