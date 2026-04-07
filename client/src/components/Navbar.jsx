import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 glass border-b border-white/5 px-6 py-3 flex items-center justify-between"
    >
      {/* Logo */}
      <motion.button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            boxShadow: "0 0 10px rgba(34,197,94,0.2)",
          }}
        >
          <svg className="w-4.5 h-4.5 text-gray-950 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
        </div>
        <span className="font-black text-lg tracking-tight text-white">
          Branch<span className="text-green-400">Scope</span>
        </span>
      </motion.button>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <ThemeToggle />

        {user && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3 glass rounded-full pl-2 pr-4 py-1.5 border border-white/8"
          >
            <img
              src={user.avatar_url}
              alt={user.login}
              className="w-7 h-7 rounded-full border border-green-500/30"
            />
            <span className="text-gray-300 font-semibold text-sm hidden sm:block">{user.login}</span>
            <div className="w-px h-4 bg-white/10 hidden sm:block" />
            <motion.button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-400 text-sm font-medium transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              Logout
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
