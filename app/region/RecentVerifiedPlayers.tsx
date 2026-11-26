"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiChevronRight } from "react-icons/fi";
import { getVerifiedPlayers } from "@/utils/storage/verifiedPlayerStorage";

export default function RecentVerifiedPlayers({
  onSelect,
  limit = 10,
}: {
  onSelect: (player: any) => void;
  limit?: number;
}) {
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    setPlayers(getVerifiedPlayers(limit));
  }, [limit]);

  if (!players.length) return null;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 gap-2">
        <AnimatePresence>
          {players.map((p, index) => {
            const cleanName = p.username?.trim();
            const showName =
              Boolean(cleanName) &&
              cleanName.toLowerCase() !== "player" &&
              cleanName.toLowerCase() !== "unknown player";

            return (
              <motion.button
                key={`${p.playerId}-${p.zoneId}-${index}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSelect(p)}
                className="w-full text-left rounded-xl bg-[var(--card)] hover:bg-[var(--card)]/70 transition-all duration-200 p-2.5 sm:p-3 group flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[var(--background)] flex items-center justify-center text-[var(--muted)] group-hover:text-[var(--accent)] transition-all shrink-0">
                    <FiUser size={15} />
                  </div>
                  <div className="min-w-0">
                    {showName && (
                      <p className="text-xs font-extrabold truncate text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors leading-none mb-1">
                        {cleanName}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--foreground)]/85 tabular-nums">
                      <span>ID: {p.playerId}</span>
                      {p.zoneId && (
                        <>
                          <span className="opacity-40">·</span>
                          <span>Server: {p.zoneId}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <FiChevronRight className="text-xs text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-transform shrink-0" />
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
