import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] },
  }),
};

const floatVariants = {
  animate: {
    y: [0, -14, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
};

const FEATURES = [
  {
    icon: "⎇",
    title: "3D Branch Graph",
    desc: "Explore your entire branch tree as an interactive 3D force-directed network.",
    color: "from-green-500/15 to-green-600/5",
    glow: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.15)",
  },
  {
    icon: "🩺",
    title: "Health Score",
    desc: "A live 0–100 score tells you exactly how healthy each repo's branches are.",
    color: "from-blue-500/15 to-blue-600/5",
    glow: "rgba(59,130,246,0.12)",
    border: "rgba(59,130,246,0.15)",
  },
  {
    icon: "⚠️",
    title: "Stale Detection",
    desc: "Automatically flag aging, stale, and very stale branches with color-coded alerts.",
    color: "from-orange-500/15 to-orange-600/5",
    glow: "rgba(249,115,22,0.12)",
    border: "rgba(249,115,22,0.15)",
  },
  {
    icon: "📸",
    title: "Export Anywhere",
    desc: "Download a perfect PNG snapshot or raw JSON data for sharing or archiving.",
    color: "from-purple-500/15 to-purple-600/5",
    glow: "rgba(168,85,247,0.12)",
    border: "rgba(168,85,247,0.15)",
  },
];

const STATS = [
  { value: "100%", label: "Read-only access" },
  { value: "∞", label: "Branches supported" },
  { value: "3D", label: "Force-directed graph" },
  { value: "0ms", label: "Extra data stored" },
];

function GlowOrb({ className, color, size = 400, delay = 0 }) {
  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: "blur(40px)",
      }}
      animate={{
        scale: [1, 1.15, 0.95, 1],
        opacity: [0.25, 0.45, 0.25],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}

function FloatingBranchCard({ branch, delay, color }) {
  return (
    <motion.div
      variants={floatVariants}
      animate="animate"
      style={{ animationDelay: `${delay}s` }}
      className="glass rounded-2xl px-4 py-3 min-w-[200px]"
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: color }}
        />
        <span className="font-mono text-xs font-semibold text-gray-200">{branch}</span>
      </div>
      <div className="text-[10px] text-gray-500">last commit: 2d ago</div>
    </motion.div>
  );
}

export default function Home() {
  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || ""}/auth/github`;
  };

  return (
    <div className="relative min-h-screen mesh-bg dark:mesh-bg overflow-hidden flex flex-col">

      {/* ── Background Orbs ─────────────────────────────────────── */}
      <GlowOrb className="top-[-100px] left-[-100px]" color="rgba(34,197,94,0.12)" size={500} delay={0} />
      <GlowOrb className="top-[10%] right-[-150px]" color="rgba(59,130,246,0.1)" size={400} delay={2} />
      <GlowOrb className="bottom-[10%] left-[20%]" color="rgba(168,85,247,0.08)" size={350} delay={4} />
      <GlowOrb className="bottom-[-80px] right-[5%]" color="rgba(34,197,94,0.06)" size={300} delay={1.5} />

      {/* ── Grid overlay ────────────────────────────────────────── */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      {/* ── Hero section ────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 pt-24 pb-16 text-center">

        {/* Pill badge */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-medium text-green-400 mb-8 border border-green-500/20"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-glow" />
          Now with 3D interactive branch graphs
        </motion.div>

        {/* Logo */}
        <motion.div
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex items-center justify-center gap-4 mb-8"
        >
          <motion.div
            className="w-16 h-16 rounded-2xl flex items-center justify-center relative"
            style={{
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              boxShadow: "0 0 20px rgba(34,197,94,0.25), 0 6px 24px rgba(0,0,0,0.3)",
            }}
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg className="w-9 h-9 text-gray-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
          </motion.div>
          <span className="text-4xl font-black tracking-tight text-white">BranchScope</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-6xl sm:text-7xl font-black leading-[1.05] mb-6 max-w-3xl"
        >
          <span className="text-white">Visualize your</span>
          <br />
          <span className="shimmer-text">Git branches in 3D</span>
        </motion.h1>

        <motion.p
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-gray-400 text-xl max-w-xl mb-10 leading-relaxed"
        >
          Explore every repository branch as a live, interactive 3D network.
          Instantly spot stale branches, measure repo health, and dive deep — all in one view.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <motion.button
            onClick={handleLogin}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="relative group inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold text-gray-950 overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              boxShadow: "0 0 16px rgba(34,197,94,0.25), 0 6px 24px rgba(0,0,0,0.3)",
            }}
          >
            {/* shimmer sweep */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <svg className="w-5 h-5 relative z-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.3 9.42 7.88 10.95.58.1.79-.25.79-.56v-2.03c-3.2.7-3.88-1.54-3.88-1.54-.52-1.34-1.28-1.7-1.28-1.7-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.23-1.27-5.23-5.67 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.15 1.17A10.94 10.94 0 0 1 12 6.56c.97 0 1.95.13 2.86.39 2.19-1.48 3.15-1.17 3.15-1.17.62 1.57.23 2.73.11 3.02.73.8 1.18 1.82 1.18 3.07 0 4.41-2.69 5.38-5.25 5.66.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A10.51 10.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
            </svg>
            <span className="relative z-10">Continue with GitHub</span>
          </motion.button>

          <p className="text-gray-600 text-sm">Read-only · No data stored</p>
        </motion.div>

        {/* ── Floating branch cards ────────────────────────────── */}
        <motion.div
          custom={5}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-16 flex flex-wrap justify-center gap-4"
        >
          {[
            { branch: "main", color: "#22c55e", delay: 0 },
            { branch: "feat/3d-graph", color: "#3b82f6", delay: 0.6 },
            { branch: "fix/auth-bug", color: "#f59e0b", delay: 1.2 },
            { branch: "release/v2.0", color: "#a855f7", delay: 0.3 },
            { branch: "dev/ui-rewrite", color: "#ef4444", delay: 0.9 },
          ].map((item) => (
            <FloatingBranchCard key={item.branch} {...item} />
          ))}
        </motion.div>
      </div>

      {/* ── Stats bar ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="relative z-10 glass border-t border-white/5 py-6 px-6"
      >
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.4 + i * 0.1 }}
              className="flex flex-col gap-1"
            >
              <span className="text-2xl font-black text-green-400">{s.value}</span>
              <span className="text-xs text-gray-500 uppercase tracking-widest">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Feature cards ───────────────────────────────────────── */}
      <div className="relative z-10 max-w-6xl mx-auto w-full px-6 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center text-3xl font-bold text-white mb-12"
        >
          Everything you need to{" "}
          <span className="text-green-400">master your branches</span>
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="glass rounded-2xl p-6 cursor-default"
              style={{
                borderColor: f.border,
                boxShadow: `0 0 0 1px ${f.border}, 0 8px 24px rgba(0,0,0,0.25)`,
              }}
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl mb-4`}
                style={{ boxShadow: `0 0 10px ${f.glow}` }}
              >
                {f.icon}
              </div>
              <h3 className="font-bold text-white text-base mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Footer note ─────────────────────────────────────────── */}
      <div className="relative z-10 text-center py-8 text-gray-700 text-xs">
        BranchScope · GitHub OAuth · Read-only access · No data stored externally
      </div>
    </div>
  );
}
