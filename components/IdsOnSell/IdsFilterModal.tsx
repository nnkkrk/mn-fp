"use client";

import { FiX, FiCheck, FiSliders, FiRotateCcw } from "react-icons/fi";
import { Zap } from "lucide-react";

export type SortOption = "default" | "buy-asc" | "buy-desc" | "rent-asc" | "rent-desc";

export interface GameOption {
  id: string;
  label: string;
  icon: string;
}

export const GAME_CATEGORIES: GameOption[] = [
  { id: "all", label: "All Games", icon: "🎮" },
  { id: "coc", label: "Clash of Clans", icon: "⚔️" },
  { id: "mlbb", label: "Mobile Legends", icon: "🛡️" },
  { id: "bgmi", label: "BGMI / PUBG", icon: "🎯" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  selectedGame: string;
  setSelectedGame: (v: string) => void;
  rentOnly: boolean;
  setRentOnly: (v: boolean) => void;
  sortBy: SortOption;
  setSortBy: (v: SortOption) => void;
}

export default function IdsFilterModal({
  open,
  onClose,
  selectedGame,
  setSelectedGame,
  rentOnly,
  setRentOnly,
  sortBy,
  setSortBy,
}: Props) {
  if (!open) return null;

  const handleClear = () => {
    setSelectedGame("all");
    setRentOnly(false);
    setSortBy("default");
  };

  const sortOptions: { id: SortOption; group: string; label: string }[] = [
    { id: "default", group: "General", label: "Recommended" },
    { id: "buy-asc", group: "Buy Price", label: "Buy: Low → High" },
    { id: "buy-desc", group: "Buy Price", label: "Buy: High → Low" },
    { id: "rent-asc", group: "Rent Price", label: "Rent: Low → High" },
    { id: "rent-desc", group: "Rent Price", label: "Rent: High → Low" },
  ];

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl bg-[var(--card)] border-t sm:border border-[var(--border)] shadow-2xl p-5 pb-[max(1.75rem,env(safe-area-inset-bottom))] sm:pb-5 space-y-4 animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MOBILE DRAG HANDLE */}
        <div className="sm:hidden w-10 h-1 rounded-full bg-[var(--muted)]/30 mx-auto -mt-1 mb-2" />

        {/* HEADER */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <FiSliders className="text-[var(--accent)]" size={16} />
            <h2 className="text-sm font-black uppercase tracking-wider text-[var(--foreground)]">
              Filter & Sort
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="p-1.5 rounded-full text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-colors cursor-pointer"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* SECTION 1: GAME */}
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">
            Game
          </span>
          <div className="grid grid-cols-2 gap-2">
            {GAME_CATEGORIES.map((g) => {
              const isActive = selectedGame === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedGame(g.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-xs"
                      : "bg-[var(--foreground)]/[0.02] border-[var(--border)] text-[var(--foreground)]/80 hover:text-[var(--foreground)] hover:border-[var(--accent)]/40"
                  }`}
                >
                  <span className="text-sm shrink-0">{g.icon}</span>
                  <span className="truncate">{g.label}</span>
                  {isActive && <FiCheck className="ml-auto shrink-0" size={13} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: AVAILABILITY (RENT) */}
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">
            Availability
          </span>
          <button
            type="button"
            onClick={() => setRentOnly(!rentOnly)}
            className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              rentOnly
                ? "bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--foreground)] shadow-xs"
                : "bg-[var(--foreground)]/[0.02] border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  rentOnly
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--foreground)]/5 text-[var(--muted)]"
                }`}
              >
                <Zap size={14} />
              </div>
              <div className="text-left">
                <div className="font-bold text-xs text-[var(--foreground)]">
                  Rent Available Only
                </div>
                <div className="text-[10px] text-[var(--muted)]">
                  Show accounts eligible for 24h rental
                </div>
              </div>
            </div>
            <div
              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                rentOnly
                  ? "bg-[var(--accent)] border-[var(--accent)] text-white"
                  : "border-[var(--border)] bg-transparent"
              }`}
            >
              {rentOnly && <FiCheck size={11} />}
            </div>
          </button>
        </div>

        {/* SECTION 2: SORT BY */}
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">
            Sort By
          </span>

          {/* Quick chip options */}
          <div className="space-y-2">
            {/* Buy Price Group */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
                Buy Price
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSortBy(sortBy === "buy-asc" ? "default" : "buy-asc")}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                    sortBy === "buy-asc"
                      ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-xs"
                      : "bg-[var(--foreground)]/[0.02] border-[var(--border)] text-[var(--foreground)]/80 hover:text-[var(--foreground)] hover:border-[var(--accent)]/40"
                  }`}
                >
                  Low → High
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy(sortBy === "buy-desc" ? "default" : "buy-desc")}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                    sortBy === "buy-desc"
                      ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-xs"
                      : "bg-[var(--foreground)]/[0.02] border-[var(--border)] text-[var(--foreground)]/80 hover:text-[var(--foreground)] hover:border-[var(--accent)]/40"
                  }`}
                >
                  High → Low
                </button>
              </div>
            </div>

            {/* Rent Price Group */}
            <div className="space-y-1 pt-1">
              <div className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
                Rent Price
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSortBy(sortBy === "rent-asc" ? "default" : "rent-asc")}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                    sortBy === "rent-asc"
                      ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-xs"
                      : "bg-[var(--foreground)]/[0.02] border-[var(--border)] text-[var(--foreground)]/80 hover:text-[var(--foreground)] hover:border-[var(--accent)]/40"
                  }`}
                >
                  Low → High
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy(sortBy === "rent-desc" ? "default" : "rent-desc")}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                    sortBy === "rent-desc"
                      ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-xs"
                      : "bg-[var(--foreground)]/[0.02] border-[var(--border)] text-[var(--foreground)]/80 hover:text-[var(--foreground)] hover:border-[var(--accent)]/40"
                  }`}
                >
                  High → Low
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <FiRotateCcw size={13} />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 max-w-[130px] py-2 text-xs text-center rounded-xl bg-[var(--accent)] text-white font-bold hover:brightness-110 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
