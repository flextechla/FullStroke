"use client";

import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("fs-theme");
    if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("fs-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("fs-theme", "light");
    }
  }

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      className="flex items-center justify-between gap-3 w-full"
      type="button"
    >
      <span className="text-sm" style={{ color: "var(--color-text-primary)" }}>
        {dark ? "Dark Mode" : "Light Mode"}
      </span>
      <div
        className="relative h-7 w-12 rounded-full transition-colors duration-200"
        style={{
          background: dark ? "var(--color-brand)" : "var(--color-surface-3)",
        }}
      >
        <div
          className="absolute top-0.5 h-6 w-6 rounded-full shadow-sm transition-transform duration-200"
          style={{
            background: dark ? "#000" : "#fff",
            transform: dark ? "translateX(22px)" : "translateX(2px)",
          }}
        >
          <span className="flex h-full w-full items-center justify-center text-xs">
            {dark ? "🌙" : "☀️"}
          </span>
        </div>
      </div>
    </button>
  );
}