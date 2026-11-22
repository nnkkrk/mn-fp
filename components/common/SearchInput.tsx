"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";

export interface SearchInputProps {
  /** The controlled search value */
  value: string;
  /** Callback fired with the new search value (debounced if debounceMs > 0) */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Milliseconds to debounce the onChange call. Defaults to 300ms (set 0 to disable) */
  debounceMs?: number;
  /** Whether data is currently loading (shows a spinner) */
  loading?: boolean;
  /** Size variant */
  size?: "xs" | "sm" | "md" | "lg";
  /** Shape / radius variant */
  variant?: "pill" | "rounded";
  /** Auto focus on mount */
  autoFocus?: boolean;
  /** Custom class for outer container */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Key down handler for input */
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  /** Optional right element (e.g. filter button) rendered inside the input on the right */
  rightElement?: React.ReactNode;
}

const SIZE_STYLES = {
  xs: {
    container: "h-7 sm:h-8",
    input: "pl-7 pr-6 text-[10px] sm:text-xs",
    searchIcon: 11,
    searchIconLeft: "left-2.5",
    clearIcon: 10,
  },
  sm: {
    container: "h-9",
    input: "pl-9 pr-8 text-xs",
    searchIcon: 13,
    searchIconLeft: "left-3",
    clearIcon: 12,
  },
  md: {
    container: "h-10",
    input: "pl-10 pr-9 text-xs sm:text-sm",
    searchIcon: 15,
    searchIconLeft: "left-3.5",
    clearIcon: 14,
  },
  lg: {
    container: "h-11",
    input: "pl-11 pr-10 text-sm",
    searchIcon: 16,
    searchIconLeft: "left-4",
    clearIcon: 15,
  },
};

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  debounceMs = 300,
  loading = false,
  size = "sm",
  variant = "pill",
  autoFocus = false,
  className = "",
  disabled = false,
  onKeyDown,
  rightElement,
}: SearchInputProps) {
  // Local state for instant typing responsiveness
  const [localValue, setLocalValue] = useState(value);
  const isInitialMount = useRef(true);

  // Synchronize localValue when parent value changes externally (e.g. "Clear Filters" button)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce onChange callback
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (debounceMs <= 0) {
      onChange(localValue);
      return;
    }

    const handler = setTimeout(() => {
      onChange(localValue);
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [localValue, debounceMs]);

  const handleClear = () => {
    setLocalValue("");
    onChange("");
  };

  const currentSize = SIZE_STYLES[size] || SIZE_STYLES.sm;
  const roundedClass = variant === "pill" ? "rounded-2xl" : "rounded-xl";

  return (
    <div className={`relative w-full ${currentSize.container} ${className}`}>
      {/* SEARCH / LOADING ICON */}
      <div
        className={`absolute ${currentSize.searchIconLeft} top-1/2 -translate-y-1/2 text-[var(--muted)]/50 pointer-events-none flex items-center justify-center`}
      >
        {loading ? (
          <Loader2 size={currentSize.searchIcon} className="animate-spin text-[var(--accent)]" />
        ) : (
          <Search size={currentSize.searchIcon} />
        )}
      </div>

      {/* INPUT */}
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={`w-full h-full ${currentSize.input} ${rightElement ? (localValue ? "!pr-16" : "!pr-9") : ""} ${roundedClass} border border-[var(--border)] bg-[var(--foreground)]/[0.02] text-[var(--foreground)] outline-none transition-all placeholder:text-[var(--muted)]/40 focus:border-[var(--accent)]/50 focus:bg-[var(--background)] focus:ring-2 focus:ring-[var(--accent)]/10 font-sans disabled:opacity-50`}
      />

      {/* CLEAR (X) BUTTON */}
      {localValue && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={handleClear}
          className={`absolute ${rightElement ? "right-8" : "right-2.5"} top-1/2 -translate-y-1/2 p-1 rounded-full text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06] transition-colors`}
        >
          <X size={currentSize.clearIcon} />
        </button>
      )}

      {/* RIGHT ELEMENT (e.g. Filter button) */}
      {rightElement && (
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center">
          {rightElement}
        </div>
      )}
    </div>
  );
}
