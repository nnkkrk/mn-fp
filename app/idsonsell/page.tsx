"use client";

import { useState } from "react";
import ids from "@/data/idsOnSell";
import IdCard from "@/components/IdsOnSell/IdCard";
import IdsFilterModal from "@/components/IdsOnSell/IdsFilterModal";
import { SearchInput, EmptyState, SectionTitle } from "@/components/common";
import { Icons } from "@/components/icons";

export default function IdsOnSellPage() {
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  // filters (basic for now)
  const [rentOnly, setRentOnly] = useState(false);
  const [globalOnly, setGlobalOnly] = useState(false);

  /* ================= FILTER LOGIC ================= */
  const filteredIds = ids.filter((item: any) => {
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.tags?.some((t: string) => t.toLowerCase().includes(search.toLowerCase()));

    const matchRent =
      !rentOnly || item.rent?.available === true;

    const matchGlobal =
      !globalOnly ||
      item.tags?.some((t: string) => t.toLowerCase().includes("global")) ||
      (item.heroTitles?.global?.length ?? 0) > 0;

    return matchSearch && matchRent && matchGlobal;
  });

  return (
    <main className="min-h-screen p-6 max-w-7xl mx-auto space-y-6">
      <SectionTitle
        subtitle="VERIFIED MARKETPLACE"
        title="IDS ON SALE"
        description="Browse verified, competition-ready gaming accounts for sale & rent"
      />

      {/* ================= HEADER ================= */}
      <div className="flex items-center gap-3">
        {/* SEARCH */}
        <div className="flex-1 min-w-0">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search MLBB IDs..."
            size="md"
          />
        </div>

        {/* FILTER BUTTON */}
        <button aria-label="button"
          onClick={() => setShowFilter(true)}
          className="shrink-0 flex items-center gap-2
            px-4 py-2.5 rounded-xl border bg-[var(--card)]
            hover:border-[var(--accent)] text-xs font-black uppercase tracking-wider transition-colors"
        >
          <Icons.filter size={15} />
          <span className="hidden sm:inline">Filter</span>
        </button>
      </div>

      {/* ================= GRID ================= */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredIds.length > 0 ? (
          filteredIds.map((item: any) => (
            <IdCard key={item.id} item={item} />
          ))
        ) : (
          <div className="col-span-full py-8">
            <EmptyState
              icon={Icons.search}
              title="No MLBB IDs Found"
              description="Try adjusting your search terms or clearing active filters."
            />
          </div>
        )}
      </div>

      {/* ================= FILTER MODAL ================= */}
      {showFilter && (
        <IdsFilterModal
          open={showFilter}
          onClose={() => setShowFilter(false)}
          rentOnly={rentOnly}
          setRentOnly={setRentOnly}
          globalOnly={globalOnly}
          setGlobalOnly={setGlobalOnly}
        />
      )}
    </main>
  );
}
