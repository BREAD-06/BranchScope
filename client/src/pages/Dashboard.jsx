import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRepos } from "../hooks/useRepos";
import RepoCard from "../components/RepoCard";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

export default function Dashboard() {
  const { repos, loading, error, hasMore, loadMore } = useRepos();
  const [search, setSearch] = useState("");

  const filtered = repos.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen mesh-bg">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-black dark:text-white text-gray-900 mb-1">
            Your <span className="text-green-400">Repositories</span>
          </h1>
          <p className="dark:text-gray-500 text-gray-500">Select a repo to explore its branch structure</p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative mb-8"
        >
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-600"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search repositories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full dark:glass dark:text-white dark:placeholder-gray-600 light:bg-white text-gray-900 placeholder-gray-400 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none border dark:border-white/5 border-gray-200 bg-white/60 backdrop-blur-sm transition-all focus:border-green-500/30"
          />
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass border border-red-500/30 rounded-xl p-4 text-red-400 text-sm mb-6"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skeleton */}
        {loading && repos.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="glass rounded-2xl p-5 animate-pulse">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-full bg-white/5" />
                  <div className="h-2 bg-white/5 rounded w-16" />
                </div>
                <div className="h-4 bg-white/5 rounded w-2/3 mb-2" />
                <div className="h-3 bg-white/5 rounded w-full mb-1" />
                <div className="h-3 bg-white/5 rounded w-4/5 mb-4" />
                <div className="h-px bg-white/5 mb-3" />
                <div className="h-2 bg-white/5 rounded w-1/3" />
              </div>
            ))}
          </div>
        )}

        {/* Repo grid */}
        {(!loading || repos.length > 0) && (
          <>
            {filtered.length === 0 && !loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-gray-600 py-20"
              >
                No repositories found matching "{search}"
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {filtered.map((repo, i) => (
                  <RepoCard key={repo.id} repo={repo} index={i} />
                ))}
              </motion.div>
            )}

            {hasMore && !search && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center mt-10"
              >
                <motion.button
                  onClick={loadMore}
                  disabled={loading}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="glass border border-white/10 text-gray-300 px-8 py-2.5 rounded-xl hover:border-green-500/30 hover:text-green-400 transition-all text-sm disabled:opacity-50 font-medium"
                >
                  {loading ? "Loading…" : "Load more"}
                </motion.button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
