import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import HealthBadge from "./HealthBadge";

const STATS_META = [
  { label: "Total", key: "total", color: "#e2e8f0", glow: "rgba(226,232,240,0.08)" },
  { label: "Fresh",      key: "fresh",     color: "#22c55e", glow: "rgba(34,197,94,0.12)"   },
  { label: "Aging",      key: "aging",     color: "#f59e0b", glow: "rgba(245,158,11,0.12)"  },
  { label: "Stale",      key: "stale",     color: "#f97316", glow: "rgba(249,115,22,0.12)"  },
  { label: "Very Stale", key: "veryStale", color: "#ef4444", glow: "rgba(239,68,68,0.12)"   },
];

export default function BranchStats({ branches, defaultBranch }) {
  const counts = {
    total:     branches.length,
    fresh:     branches.filter((b) => b.stale_level === "fresh").length,
    aging:     branches.filter((b) => b.stale_level === "aging").length,
    stale:     branches.filter((b) => b.stale_level === "stale").length,
    veryStale: branches.filter((b) => b.stale_level === "very_stale").length,
  };

  return (
    <div className="flex flex-col sm:flex-row gap-5 mb-8 items-start">
      {/* Health badge card */}
      <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} glareEnable glareMaxOpacity={0.08} transitionSpeed={500}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="glass rounded-2xl p-5 flex-shrink-0 flex flex-col items-center gap-2"
          style={{
            boxShadow: "0 0 12px rgba(34,197,94,0.06), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <p className="text-[9px] text-gray-600 uppercase tracking-widest font-bold">Repo Health</p>
          <HealthBadge branches={branches} defaultBranch={defaultBranch} />
        </motion.div>
      </Tilt>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 flex-1">
        {STATS_META.map((s, i) => (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}
          >
            <Tilt tiltMaxAngleX={12} tiltMaxAngleY={12} glareEnable glareMaxOpacity={0.06} transitionSpeed={500}>
              <div
                className="glass rounded-2xl p-4 text-center"
                style={{
                  borderColor: `${s.color}20`,
                  boxShadow: `0 0 10px ${s.glow}, inset 0 1px 0 rgba(255,255,255,0.03)`,
                }}
              >
                <div
                  className="text-3xl font-black tracking-tight"
                  style={{ color: s.color, textShadow: `0 0 8px ${s.glow}` }}
                >
                  {counts[s.key]}
                </div>
                <div className="text-gray-600 text-[10px] uppercase tracking-widest mt-1 font-semibold">
                  {s.label}
                </div>
              </div>
            </Tilt>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
