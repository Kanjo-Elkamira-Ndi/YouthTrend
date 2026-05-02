import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-border hover:bg-secondary transition-colors"
    >
      <motion.span
        key={theme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </motion.span>
    </button>
  );
};

export const LanguageToggle = () => {
  const { lang, toggleLang } = useTheme();
  return (
    <button
      onClick={toggleLang}
      aria-label="Toggle language"
      className="h-9 px-3 inline-flex items-center justify-center rounded-lg border border-border hover:bg-secondary transition-colors text-xs font-semibold"
    >
      {lang === "en" ? "🇬🇧 EN" : "🇫🇷 FR"}
    </button>
  );
};
