import { useState, useEffect, Suspense, lazy } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import BranchStats from "../components/BranchStats";
import ExportButton from "../components/ExportButton";

// Lazy-load the heavy 3D graph (Three.js)
const BranchGraph = lazy(() => import("../components/BranchGraph"));

const FILTER_OPTIONS = [
  { label: "All",        value: "all" },
  { label: "Fresh",      value: "fresh" },
  { label: "Aging",      value: "aging" },
  { label: "Stale",      value: "stale" },
  { label: "Very Stale", value: "very_stale" },
];

const STALE_META = {
  fresh:      { text: "text-green-400",  border: "border-green-900/60" },
  aging:      { text: "text-yellow-400", border: "border-yellow-900/60" },
  stale:      { text: "text-orange-400", border: "border-orange-900/60" },
  very_stale: { text: "text-red-400",    border: "border-red-900/60" },
};

export default function RepoView() {
  const { owner, repo } = useParams();
  const navigate = useNavigate();

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [filter,  setFilter]  = useState("all");
  const [search,  setSearch]  = useState("");
  const [view,    setView]    = useState("graph");

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios
      .get(`/api/github/repos/${owner}/${repo}/branches`, { withCredentials: true })
      .then((res) => setData(res.data))
      .catch((err) =>
        setError("Failed to load branches. " + (err.response?.data?.error || ""))
      )
      .finally(() => setLoading(false));
  }, [owner, repo]);

  const filteredBranches =
    data?.branches?.filter((b) => {
      const matchFilter = filter === "all" || b.stale_level === filter;
      const matchSearch = b.name.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    }) ?? [];

  return (
    <div className="w-full min-h-screen mesh-bg">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ── Header ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigate("/dashboard")}
              className="dark:text-gray-600 text-gray-500 hover:text-green-400 transition-colors text-sm flex items-center gap-1 group"
            >
              <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span>
              Back
            </button>
            <span className="dark:text-gray-800 text-gray-400">/</span>
            <h1 className="dark:text-gray-100 text-gray-900 font-black text-xl">
              {owner}/<span className="text-green-400">{repo}</span>
            </h1>
            {data && (
              <span className="dark:glass dark:text-gray-500 dark:border-white/5 bg-white/60 backdrop-blur-sm text-gray-600 border border-gray-200 text-[11px] px-3 py-1 rounded-full">
                {data.total} branches
              </span>
            )}
          </div>

          {data && (
            <ExportButton
              snapshotTargetId="repo-snapshot"
              exportData={data}
              filename={`${owner}_${repo}`}
            />
          )}
        </motion.div>

        {/* ── Loading ─────────────────────────────────────────── */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 gap-4"
            >
              <div
                className="w-12 h-12 rounded-full border-2 border-green-500/20 border-t-green-400 animate-spin"
                style={{ filter: "drop-shadow(0 0 8px rgba(34,197,94,0.4))" }}
              />
              <p className="text-gray-500 text-sm">Fetching branches & commit data…</p>
              <p className="text-gray-700 text-xs">This may take a moment for large repos</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Error ───────────────────────────────────────────── */}
        {error && (
          <div className="glass border border-red-500/30 rounded-xl p-6 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* ── Main content ────────────────────────────────────── */}
        {data && !loading && (
          <div id="repo-snapshot">
            <BranchStats branches={data.branches} defaultBranch={data.default_branch} />

            {/* Controls */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center gap-3 mb-4"
            >
              {/* Search */}
              <div className="relative flex-1 min-w-48">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search branches..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full glass rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder-gray-700 focus:outline-none border-transparent focus:border-green-500/20 transition-all"
                />
              </div>

              {/* Filter pills */}
              <div className="flex gap-1.5 flex-wrap">
                {FILTER_OPTIONS.map((f) => (
                  <motion.button
                    key={f.value}
                    onClick={() => setFilter(f.value)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      filter === f.value
                        ? "bg-green-500/20 text-green-400 border border-green-500/40 glow-green"
                        : "glass text-gray-600 border border-white/5 hover:border-white/10"
                    }`}
                  >
                    {f.label}
                  </motion.button>
                ))}
              </div>

              {/* View toggle */}
              <div className="flex gap-1 glass border border-white/5 rounded-xl p-1">
                {[
                  { k: "graph", label: "⎇ Graph" },
                  { k: "list",  label: "☰ List" },
                ].map(({ k, label }) => (
                  <motion.button
                    key={k}
                    onClick={() => setView(k)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      view === k
                        ? "bg-white/10 text-white"
                        : "text-gray-600 hover:text-gray-400"
                    }`}
                  >
                    {label}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            <p className="text-[11px] text-gray-700 mb-4">
              Showing {filteredBranches.length} of {data.total} branches
            </p>

            {/* ── 3D Graph (lazy) ──────────────────────────────── */}
            {view === "graph" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center py-20 glass rounded-2xl">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-400" />
                    </div>
                  }
                >
                  <BranchGraph
                    branches={filteredBranches}
                    defaultBranch={data.default_branch}
                    owner={owner}
                    repo={repo}
                  />
                </Suspense>
              </motion.div>
            )}

            {/* ── List view ────────────────────────────────────── */}
            {view === "list" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2"
              >
                {filteredBranches.map((branch, i) => {
                  const meta = STALE_META[branch.stale_level] || STALE_META.fresh;
                  const githubUrl = `https://github.com/${owner}/${repo}/tree/${encodeURIComponent(branch.name)}`;

                  return (
                    <motion.div
                      key={branch.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`glass border ${meta.border} rounded-xl px-4 py-3 flex flex-wrap items-center gap-4`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-mono font-semibold text-white text-sm truncate">
                          {branch.name}
                          {branch.name === data.default_branch && (
                            <span className="ml-2 text-[10px] text-green-400 font-normal px-1.5 py-0.5 rounded-full border border-green-500/30">
                              default
                            </span>
                          )}
                        </p>
                        <p className="text-gray-600 text-xs mt-0.5 truncate">
                          {branch.last_commit.message}
                        </p>
                      </div>
                      <span className="text-xs text-gray-600">👤 {branch.last_commit.author}</span>
                      <span className={`text-xs font-bold ${meta.text}`}>
                        🕐 {branch.last_commit.days_ago}d ago
                      </span>
                      {branch.is_stale && (
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${meta.text} ${meta.border}`}>
                          ⚠ {branch.stale_level.replace("_", " ")}
                        </span>
                      )}
                      <a
                        href={githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-xs text-gray-600 hover:text-green-400 transition-colors"
                        title="Open on GitHub"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        GitHub
                      </a>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {filteredBranches.length === 0 && (
              <div className="text-center text-gray-700 py-16">
                No branches match your current filters.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
