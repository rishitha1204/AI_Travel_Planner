import { getScoreTier } from '../../utils/scoreColor.js';

const SIZE = 140;
const STROKE = 10;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function OverallScoreRing({ score }) {
  const { color, label } = getScoreTier(score);
  const offset = CIRCUMFERENCE * (1 - score / 100);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="#D8E0DF" strokeWidth={STROKE} />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono tabular text-4xl font-semibold text-ink">{score}</span>
          <span className="text-xs text-ink-muted">/ 100</span>
        </div>
      </div>
      <span
        className="mt-3 rounded-full px-3 py-1 text-xs font-medium"
        style={{ backgroundColor: `${color}1A`, color }}
      >
        {label}
      </span>
    </div>
  );
}