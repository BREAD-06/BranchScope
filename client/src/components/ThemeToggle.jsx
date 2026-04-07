import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500/50"
      style={{
        background: isDark
          ? "linear-gradient(135deg, #1e293b, #0f172a)"
          : "linear-gradient(135deg, #bfdbfe, #93c5fd)",
        border: isDark ? "1px solid #334155" : "1px solid #60a5fa",
      }}
    >
      <span
        className="absolute top-0.5 transition-all duration-300 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-md"
        style={{
          left: isDark ? "calc(100% - 1.625rem)" : "0.125rem",
          background: isDark ? "#1e293b" : "#fef3c7",
        }}
      >
        {isDark ? "🌙" : "☀️"}
      </span>
    </button>
  );
}
