import { useMemo } from "react";

function getColor(score) {
  if (score >= 80) return "#22c55e"; // green
  if (score >= 50) return "#f59e0b"; // yellow/amber
  return "#ef4444"; // red
}

function getLabel(score) {
  if (score >= 80) return "Healthy";
  if (score >= 50) return "Moderate";
  return "At Risk";
}

/**
 * Compute a simple health score (0–100) based on branch data.
 * Factors:
 *   - Freshness: more fresh branches = better
 *   - Default branch activity: recent commit on default = good
 *   - Stale ratio: fewer stale/very stale = better
 */
export function computeHealthScore(branches, defaultBranch) {
  if (!branches || branches.length === 0) return 0;

  const total = branches.length;
  const fresh = branches.filter((b) => b.stale_level === "fresh").length;
  const aging = branches.filter((b) => b.stale_level === "aging").length;
  const stale = branches.filter((b) => b.stale_level === "stale").length;
  const veryStale = branches.filter((b) => b.stale_level === "very_stale").length;

  // Freshness score (0-40): % of branches that are fresh
  const freshnessScore = Math.round((fresh / total) * 40);

  // Aging score (0-20): aging gets partial credit
  const agingScore = Math.round((aging / total) * 20 * 0.5);

  // Stale penalty (0-20): penalize stale and very stale branches
  const stalePenalty = Math.round(((stale + veryStale * 2) / total) * 20);

  // Default branch freshness (0-20): how recently the default branch was committed to
  const defaultB = branches.find((b) => b.name === defaultBranch);
  let defaultScore = 10;
  if (defaultB) {
    const days = defaultB.last_commit.days_ago;
    if (days <= 3) defaultScore = 20;
    else if (days <= 7) defaultScore = 16;
    else if (days <= 14) defaultScore = 12;
    else if (days <= 30) defaultScore = 8;
    else defaultScore = 4;
  }

  const score = Math.max(0, Math.min(100, freshnessScore + agingScore + defaultScore + 20 - stalePenalty));
  return score;
}

export default function HealthBadge({ branches, defaultBranch }) {
  const score = useMemo(
    () => computeHealthScore(branches, defaultBranch),
    [branches, defaultBranch]
  );

  const color = getColor(score);
  const label = getLabel(score);

  const size = 90;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          className="text-gray-800 dark:text-gray-700"
          strokeWidth={stroke}
          fill="none"
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        {/* Score number */}
        <text
          x="50%"
          y="46%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize="22"
          fontWeight="700"
          fill={color}
        >
          {score}
        </text>
        {/* /100 label */}
        <text
          x="50%"
          y="68%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize="9"
          fill="#6b7280"
        >
          / 100
        </text>
      </svg>
      <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color }}>
        {label}
      </span>
    </div>
  );
}
