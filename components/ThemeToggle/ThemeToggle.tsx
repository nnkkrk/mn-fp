"use client";

import { useEffect, useState, useRef, ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Check, Sparkles, RotateCcw, ChevronDown, X, Hash, Lock } from "lucide-react";
import { useUIStore, ThemeEffect } from "@/store/useUIStore";

interface ColorPreset {
  id: string;
  name: string;
  hex: string;
  hoverHex: string;
}

const COLOR_PRESETS: ColorPreset[] = [
  { id: "blue", name: "Royal Blue", hex: "#2563eb", hoverHex: "#1d4ed8" },
  { id: "sky", name: "Ocean Cobalt", hex: "#0284c7", hoverHex: "#0369a1" },
  { id: "cyan", name: "Arctic Cyan", hex: "#0891b2", hoverHex: "#0e7490" },
  { id: "teal", name: "Deep Teal", hex: "#0d9488", hoverHex: "#0f766e" },
  { id: "emerald", name: "Rich Emerald", hex: "#059669", hoverHex: "#047857" },
  { id: "indigo", name: "Royal Indigo", hex: "#4f46e5", hoverHex: "#4338ca" },
  { id: "purple", name: "Velvet Violet", hex: "#7c3aed", hoverHex: "#6d28d9" },
  { id: "pink", name: "Berry Plum", hex: "#c026d3", hoverHex: "#a21caf" },
  { id: "rose", name: "Crimson Rose", hex: "#e11d48", hoverHex: "#be123c" },
  { id: "orange", name: "Burnt Coral", hex: "#ea580c", hoverHex: "#c2410c" },
  { id: "amber", name: "Warm Gold", hex: "#d97706", hoverHex: "#b45309" },
  { id: "slate", name: "Graphite", hex: "#334155", hoverHex: "#1e293b" },
];

const SEASONS: { id: ThemeEffect; name: string; icon: string }[] = [
  { id: "none", name: "None", icon: "🚫" },
  { id: "christmas", name: "Christmas", icon: "🎄" },
  { id: "valentine", name: "Valentine", icon: "💖" },
  { id: "holi", name: "Holi", icon: "🎨" },
  { id: "diwali", name: "Diwali", icon: "🪔" },
  { id: "monsoon", name: "Monsoon", icon: "☔" },
  { id: "eid", name: "Eid", icon: "🌙" },
];

function hexToRgb(hex: string): string {
  let cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split("").map((c) => c + c).join("");
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return "59, 130, 246";
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `${r}, ${g}, ${b}`;
}

function getHoverColor(hex: string): string {
  let cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split("").map((c) => c + c).join("");
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return hex;
  const r = Math.max(0, Math.min(255, ((num >> 16) & 255) - 25));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 255) - 25));
  const b = Math.max(0, Math.min(255, (num & 255) - 25));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function isValidHex(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [accentColor, setAccentColor] = useState<string>("");
  const [hexInput, setHexInput] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const { activeThemeEffect, setActiveThemeEffect } = useUIStore();

  // Initialize on mount
  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem("theme");
    const validTheme = storedTheme === "light" ? "light" : "dark";
    setTheme(validTheme);
    document.documentElement.setAttribute("data-theme", validTheme);

    const storedAccent = localStorage.getItem("theme-accent");
    if (storedAccent) {
      setAccentColor(storedAccent);
      setHexInput(storedAccent);
      applyAccent(storedAccent, localStorage.getItem("theme-accent-hover") || getHoverColor(storedAccent));
    }
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const applyAccent = (hex: string, hoverHex?: string) => {
    const hover = hoverHex || getHoverColor(hex);
    const rgb = hexToRgb(hex);
    document.documentElement.style.setProperty("--accent", hex);
    document.documentElement.style.setProperty("--accent-hover", hover);
    document.documentElement.style.setProperty("--accent-rgb", rgb);
  };

  const clearCustomAccent = () => {
    document.documentElement.style.removeProperty("--accent");
    document.documentElement.style.removeProperty("--accent-hover");
    document.documentElement.style.removeProperty("--accent-rgb");
    localStorage.removeItem("theme-accent");
    localStorage.removeItem("theme-accent-hover");
    localStorage.removeItem("theme-accent-rgb");
    setAccentColor("");
    setHexInput("");
  };

  const handleModeChange = (newMode: "dark" | "light") => {
    setTheme(newMode);
    localStorage.setItem("theme", newMode);
    document.documentElement.setAttribute("data-theme", newMode);
  };

  const handleColorSelect = (hex: string, hoverHex?: string) => {
    const formattedHex = hex.startsWith("#") ? hex : `#${hex}`;
    setAccentColor(formattedHex);
    setHexInput(formattedHex);
    const hover = hoverHex || getHoverColor(formattedHex);
    const rgb = hexToRgb(formattedHex);
    localStorage.setItem("theme-accent", formattedHex);
    localStorage.setItem("theme-accent-hover", hover);
    localStorage.setItem("theme-accent-rgb", rgb);
    applyAccent(formattedHex, hover);
  };

  const handleHexInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.trim();
    if (!val.startsWith("#") && val.length > 0) {
      val = `#${val}`;
    }
    setHexInput(val);
    if (isValidHex(val)) {
      handleColorSelect(val);
    }
  };

  const currentAccentDisplay = accentColor || "#059669";

  return (
    <>
      {/* Header Button - Clean, compact, matches header action buttons */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="relative flex items-center justify-center w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full border border-[var(--border)]/60 bg-[var(--foreground)]/[0.04] hover:bg-[var(--foreground)]/[0.08] hover:border-[var(--accent)]/40 transition-all duration-200 cursor-pointer group"
        title="Appearance & Theme"
        aria-label="Theme Settings"
        aria-expanded={isOpen}
      >
        <motion.div
          key={theme}
          initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="z-10 flex items-center justify-center text-[13px] sm:text-sm select-none"
        >
          {theme === "light" ? "☀️" : "🌙"}
        </motion.div>

        {/* SPINNING ORBIT RING */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border border-dashed border-[var(--foreground)]/20 pointer-events-none"
        />
      </motion.button>

      {/* POPUP / MODAL CUSTOMIZATION STUDIO - PORTAL DIRECTLY TO BODY (COMPACT & SMOOTH) */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <div 
                className="fixed inset-0 flex items-center justify-center p-3 sm:p-4"
                style={{ zIndex: 2147483647 }}
              >
                {/* BACKDROP */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => setIsOpen(false)}
                  className="fixed inset-0 bg-black/80 backdrop-blur-xl cursor-pointer"
                  style={{ zIndex: 2147483646 }}
                />

                {/* COMPACT FLAT PREMIUM MODAL CARD */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className="relative w-full max-w-[330px] sm:max-w-[355px] rounded-2xl border border-[var(--border)] p-4 sm:p-5 text-[var(--foreground)] select-none max-h-[92vh] overflow-y-auto"
                  style={{
                    backgroundColor: theme === "dark" ? "#0c0c0f" : "#ffffff",
                    zIndex: 2147483647,
                    opacity: 1,
                    transition: "background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease",
                  }}
                >
                  {/* STUDIO HEADER */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border)] mb-3.5">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-5.5 h-5.5 rounded-md flex items-center justify-center transition-colors duration-300"
                        style={{ backgroundColor: `rgba(var(--accent-rgb), 0.12)`, color: currentAccentDisplay }}
                      >
                        <Palette size={12} />
                      </div>
                      <div>
                        <h3 className="text-[10.5px] font-black uppercase tracking-wider italic leading-none">
                          Appearance
                        </h3>
                        <p className="text-[8px] text-[var(--muted)] mt-0.5 leading-none">Mode & Accent</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-5.5 h-5.5 rounded-md bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                      aria-label="Close"
                    >
                      <X size={11} />
                    </button>
                  </div>

                  {/* SECTION 1: THEME MODE */}
                  <div className="mb-3.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[8.5px] font-black uppercase tracking-widest text-[var(--muted)]">
                        Mode
                      </span>
                      <span className="text-[7.5px] font-bold uppercase tracking-wider" style={{ color: currentAccentDisplay }}>
                        {theme === "dark" ? "Dark Active" : "Light Active"}
                      </span>
                    </div>

                    {/* Ultra-compact Mode Selector */}
                    <div className="grid grid-cols-2 gap-1 p-0.5 rounded-lg bg-[var(--foreground)]/[0.03] border border-[var(--border)]">
                      {/* Light Button */}
                      <button
                        onClick={() => handleModeChange("light")}
                        className={`relative z-10 flex items-center justify-center gap-1 py-1 px-1.5 rounded-md font-bold text-[10px] transition-all duration-200 cursor-pointer ${
                          theme === "light"
                            ? "text-[var(--foreground)] font-extrabold bg-[var(--card)] border border-[var(--border)]"
                            : "text-[var(--muted)] hover:text-[var(--foreground)]"
                        }`}
                        style={theme === "light" ? { borderColor: currentAccentDisplay } : {}}
                      >
                        <span className="text-[11px] leading-none">☀️</span>
                        <span className="uppercase text-[9px] tracking-wide">Light</span>
                        {theme === "light" && (
                          <Check size={9.5} strokeWidth={3} className="ml-auto" style={{ color: currentAccentDisplay }} />
                        )}
                      </button>

                      {/* Dark Button */}
                      <button
                        onClick={() => handleModeChange("dark")}
                        className={`relative z-10 flex items-center justify-center gap-1 py-1 px-1.5 rounded-md font-bold text-[10px] transition-all duration-200 cursor-pointer ${
                          theme === "dark"
                            ? "text-[var(--foreground)] font-extrabold bg-[var(--card)] border border-[var(--border)]"
                            : "text-[var(--muted)] hover:text-[var(--foreground)]"
                        }`}
                        style={theme === "dark" ? { borderColor: currentAccentDisplay } : {}}
                      >
                        <span className="text-[11px] leading-none">🌙</span>
                        <span className="uppercase text-[9px] tracking-wide">Dark</span>
                        {theme === "dark" && (
                          <Check size={9.5} strokeWidth={3} className="ml-auto" style={{ color: currentAccentDisplay }} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* SECTION 2: ACCENT COLOR */}
                  <div className="mb-3.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[8.5px] font-black uppercase tracking-widest text-[var(--muted)]">
                        Accent Color
                      </span>
                      {accentColor && (
                        <button
                          onClick={clearCustomAccent}
                          className="flex items-center gap-0.5 text-[7.5px] font-bold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                          title="Reset to default theme color"
                        >
                          <RotateCcw size={7.5} />
                          <span>Reset</span>
                        </button>
                      )}
                    </div>

                    {/* Ultra-compact Interactive Color Input Bar */}
                    <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--foreground)]/[0.03] border border-[var(--border)] mb-1">
                      <div
                        onClick={() => colorInputRef.current?.click()}
                        className="relative w-5.5 h-5.5 rounded flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 border border-white/20 overflow-hidden flex-shrink-0"
                        style={{ backgroundColor: currentAccentDisplay }}
                        title="Click to open color picker wheel"
                      >
                        <Palette size={10} className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                        <input
                          ref={colorInputRef}
                          type="color"
                          value={currentAccentDisplay}
                          onChange={(e) => handleColorSelect(e.target.value)}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                      </div>

                      <div 
                        className="flex-1 flex items-center gap-1 px-1.5 py-0.5 rounded border border-[var(--border)] transition-colors duration-200"
                        style={{ backgroundColor: theme === "dark" ? "#141419" : "#f1f5f9" }}
                      >
                        <Hash size={8.5} className="text-[var(--muted)]" />
                        <input
                          type="text"
                          maxLength={7}
                          value={hexInput || currentAccentDisplay}
                          onChange={handleHexInputChange}
                          placeholder="#38BDF8"
                          className="w-full bg-transparent text-[9px] font-mono font-bold uppercase text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]/50"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => colorInputRef.current?.click()}
                        className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-[var(--foreground)]/10 hover:bg-[var(--foreground)]/15 text-[var(--foreground)] transition-colors cursor-pointer"
                      >
                        Custom
                      </button>
                    </div>

                    {/* Compact Square Preset Swatches */}
                    <div className="grid grid-cols-6 gap-1.5 place-items-center">
                      {COLOR_PRESETS.map((color) => {
                        const isSelected = currentAccentDisplay.toLowerCase() === color.hex.toLowerCase();
                        return (
                          <button
                            key={color.id}
                            onClick={() => handleColorSelect(color.hex, color.hoverHex)}
                            className={`group relative w-6.5 h-6.5 rounded-md flex items-center justify-center transition-all duration-150 cursor-pointer border ${
                              isSelected
                                ? "ring-2 ring-[var(--foreground)] ring-offset-1 ring-offset-[var(--background)] scale-105 border-white/50 z-10"
                                : "border-black/10 dark:border-white/10 opacity-80 hover:opacity-100 hover:scale-105"
                            }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                          >
                            {isSelected && (
                              <Check size={10} strokeWidth={3} className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* SECTION 3: SEASONAL EFFECTS (DISABLED) */}
                  <div className="pt-1.5 border-t border-[var(--border)]">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <Sparkles size={9.5} className="text-[var(--muted)]" />
                        <span className="text-[8.5px] font-black uppercase tracking-widest text-[var(--muted)]">
                          Seasonal Effects
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-[var(--foreground)]/5 border border-[var(--border)] text-[7px] font-bold uppercase tracking-wider text-[var(--muted)]">
                        <Lock size={7} />
                        Disabled
                      </span>
                    </div>

                    {/* Disabled Seasonal Grid */}
                    <div className="p-1 rounded-lg bg-[var(--foreground)]/[0.02] border border-[var(--border)]/50 opacity-40 pointer-events-none select-none">
                      <div className="grid grid-cols-4 gap-0.5">
                        {SEASONS.map((season) => (
                          <div
                            key={season.id}
                            className="flex flex-col items-center justify-center gap-0.5 py-0.5 px-0.5 rounded bg-[var(--foreground)]/5 text-[var(--muted)]"
                          >
                            <span className="text-[10px] leading-none">{season.icon}</span>
                            <span className="text-[7px] uppercase tracking-tight truncate max-w-full">
                              {season.name}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="text-[6.5px] text-[var(--muted)]/80 text-center mt-0.5 italic">
                        Holiday themes activate automatically during seasonal periods.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
