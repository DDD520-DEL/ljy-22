interface RadarDataPoint {
  label: string;
  value: number;
}

interface RadarChartProps {
  data: RadarDataPoint[];
  size?: number;
  max?: number;
  levels?: number;
  showValues?: boolean;
  totalScore?: number;
}

function getScoreColor(value: number): string {
  if (value >= 80) return '#10b981';
  if (value >= 60) return '#f59e0b';
  if (value >= 40) return '#f97316';
  return '#ef4444';
}

export default function RadarChart({
  data,
  size = 300,
  max = 100,
  levels = 5,
  showValues = true,
  totalScore,
}: RadarChartProps) {
  const n = data.length;
  const cx = size / 2;
  const cy = size / 2;
  const labelPadding = 48;
  const maxRadius = size / 2 - labelPadding;

  const angleFor = (i: number) => (-90 + (360 / n) * i) * (Math.PI / 180);

  const pointFor = (i: number, radius: number) => {
    const angle = angleFor(i);
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  };

  const valueRadius = (value: number) => (Math.min(Math.max(value, 0), max) / max) * maxRadius;

  const gridLevels = Array.from({ length: levels }, (_, i) => (i + 1) / levels);

  const gridPolygons = gridLevels.map((level) => {
    const r = level * maxRadius;
    const points = data
      .map((_, i) => {
        const p = pointFor(i, r);
        return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
      })
      .join(' ');
    return points;
  });

  const dataPoints = data.map((d, i) => {
    const r = valueRadius(d.value);
    return { ...pointFor(i, r), value: d.value, label: d.label };
  });

  const dataPolygon = dataPoints
    .map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(' ');

  const displayScore =
    totalScore !== undefined
      ? totalScore
      : n > 0
        ? data.reduce((sum, d) => sum + d.value, 0) / n
        : 0;

  return (
    <div className="w-full flex flex-col items-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full" style={{ maxWidth: `${size}px` }}>
        <defs>
          <linearGradient id="radarFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {gridPolygons.map((points, i) => (
          <polygon
            key={`grid-${i}`}
            points={points}
            fill={i === gridPolygons.length - 1 ? '#f8fafc' : 'none'}
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        ))}

        {data.map((_, i) => {
          const p = pointFor(i, maxRadius);
          return (
            <line
              key={`axis-${i}`}
              x1={cx}
              y1={cy}
              x2={p.x}
              y2={p.y}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          );
        })}

        {gridLevels.map((level, i) => {
          const r = level * maxRadius;
          const labelP = pointFor(0, r);
          return (
            <text
              key={`level-label-${i}`}
              x={cx + 4}
              y={labelP.y + 3}
              fontSize="9"
              fill="#cbd5e1"
            >
              {Math.round(level * max)}
            </text>
          );
        })}

        <polygon
          points={dataPolygon}
          fill="url(#radarFill)"
          stroke="#f97316"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {dataPoints.map((p, i) => (
          <g key={`point-${i}`}>
            <circle cx={p.x} cy={p.y} r="4.5" fill="white" stroke={getScoreColor(p.value)} strokeWidth="2" />
            <circle cx={p.x} cy={p.y} r="2" fill={getScoreColor(p.value)} />
          </g>
        ))}

        {data.map((d, i) => {
          const labelRadius = maxRadius + 22;
          const p = pointFor(i, labelRadius);
          const angle = angleFor(i);
          const cosA = Math.cos(angle);
          const sinA = Math.sin(angle);

          let textAnchor: 'start' | 'middle' | 'end' = 'middle';
          if (cosA > 0.3) textAnchor = 'start';
          else if (cosA < -0.3) textAnchor = 'end';

          const labelOffsetY = sinA > 0.3 ? 14 : sinA < -0.3 ? -2 : 6;

          return (
            <g key={`label-${i}`}>
              <text
                x={p.x}
                y={p.y}
                textAnchor={textAnchor}
                fontSize="13"
                fontWeight="600"
                fill="#475569"
              >
                {d.label}
              </text>
              {showValues && (
                <text
                  x={p.x}
                  y={p.y + labelOffsetY}
                  textAnchor={textAnchor}
                  fontSize="11"
                  fontWeight="700"
                  fill={getScoreColor(d.value)}
                >
                  {Math.round(d.value)}分
                </text>
              )}
            </g>
          );
        })}

        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          fontSize="11"
          fill="#94a3b8"
        >
          综合得分
        </text>
        <text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          fontSize="20"
          fontWeight="700"
          fill={getScoreColor(displayScore)}
        >
          {Math.round(displayScore)}
        </text>
      </svg>
    </div>
  );
}
