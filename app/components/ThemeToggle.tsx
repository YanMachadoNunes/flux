"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={theme === "dark" ? "Tema claro" : "Tema escuro"}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
        borderRadius: "8px",
        padding: "0.4rem",
        cursor: "pointer",
        color: "var(--text-muted)",
        transition: "all 0.2s ease",
      }}
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
