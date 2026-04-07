import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";

const LANG_COLORS = {
  JavaScript: "#f59e0b",
  TypeScript: "#3b82f6",
  Python:     "#22c55e",
  Java:       "#f97316",
  "C++":      "#ec4899",
  Go:         "#06b6d4",
  Rust:       "#ef4444",
  default:    "#6b7280",
};

export default function RepoCard({ repo, index = 0 }) {
  const navigate = useNavigate();

  const langColor = LANG_COLORS[repo.language] || LANG_COLORS.default;
  const updatedAt = new Date(repo.updated_at).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <Tilt
        tiltMaxAngleX={8}
        tiltMaxAngleY={8}
        glareEnable={true}
        glareMaxOpacity={0.08}
        glareColor="#22c55e"
        glarePosition="all"
        glareBorderRadius="16px"
        transitionSpeed={600}
        scale={1.02}
      >
        <div
          onClick={() => navigate(`/repo/${repo.owner.login}/${repo.name}`)}
          className="glass rounded-2xl p-5 cursor-pointer group transition-all duration-300 relative overflow-hidden"
          style={{
            borderColor: "rgba(255,255,255,0.06)",
            minHeight: 160,
          }}
        >
          {/* Hover glow sweep */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: "radial-gradient(circle at 50% 0%, rgba(34,197,94,0.07) 0%, transparent 70%)",
            }}
          />

          {/* Top accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: `linear-gradient(90deg, transparent, ${langColor}80, transparent)`,
            }}
          />

          {/* Header row */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <img
                src={repo.owner.avatar_url}
                alt={repo.owner.login}
                className="w-5 h-5 rounded-full border border-white/10"
              />
              <span className="text-gray-500 text-xs font-medium">{repo.owner.login}/</span>
            </div>
            {repo.private && (
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-600 glass px-2 py-0.5 rounded-md">
                Private
              </span>
            )}
          </div>

          {/* Repo name */}
          <h3 className="text-base font-bold text-gray-200 group-hover:text-green-400 transition-colors mb-1.5 truncate">
            {repo.name}
          </h3>

          {repo.description && (
            <p className="text-gray-600 text-xs mb-3 line-clamp-2 leading-relaxed">
              {repo.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
            <div className="flex items-center gap-3 text-xs text-gray-600">
              {repo.language && (
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: langColor, boxShadow: `0 0 6px ${langColor}80` }}
                  />
                  <span className="text-gray-500">{repo.language}</span>
                </span>
              )}
              <span className="flex items-center gap-1">⭐ {repo.stargazers_count}</span>
            </div>
            <span className="text-[10px] text-gray-700">{updatedAt}</span>
          </div>
        </div>
      </Tilt>
    </motion.div>
  );
}
