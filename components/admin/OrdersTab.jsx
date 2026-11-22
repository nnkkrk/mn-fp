"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCcw,
  Clock,
  User,
  Gamepad2,
  IndianRupee,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  X,
  Filter,
  CreditCard,
  Hash,
  Loader2,
  Calendar,
  ChevronDown,
  ShoppingBag,
  Smartphone,
  ExternalLink
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { StatusBadge, SearchInput, EmptyState, Pagination, InfoTooltip, SectionTitle, CopyButton } from "@/components/common";
import { formatCurrency, formatDate, formatTime, formatDateTime } from "@/utils";

const ORDER_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "success", label: "Success" },
  { value: "failed", label: "Failed" },
  { value: "refund", label: "Refund" },
  { value: "refund_wallet", label: "Refund to Wallet" },
];

export default function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(30);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    gameSlug: "",
    from: "",
    to: "",
  });

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchOrdersList();
  }, [page, limit, search, filters]);

  /* ================= FETCH ORDERS LIST ================= */
  const fetchOrdersList = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const token = localStorage.getItem("token");

      const params = new URLSearchParams({
        page,
        limit,
        search,
        ...(filters.status && { status: filters.status }),
        ...(filters.gameSlug && { gameSlug: filters.gameSlug }),
        ...(filters.from && { from: filters.from }),
        ...(filters.to && { to: filters.to }),
      });

      const res = await fetch(
        `/api/admin/orders/data?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();
      setOrders(data?.data || []);
      setPagination(
        data?.pagination || { total: 0, page: 1, totalPages: 1 }
      );
    } catch (err) {
      console.error("Fetch orders list failed", err);
      if (!silent) setOrders([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  /* ================= UPDATE ORDER STATUS ================= */
  const updateOrderStatus = async (orderId, status) => {
    try {
      if (
        status === "refund_wallet" &&
        !window.confirm(
          "Are you sure you want to refund this order and credit the amount to the user's wallet?"
        )
      ) {
        return;
      }

      setUpdatingId(orderId);

      // 1. Optimistic update in local state so UI responds instantly
      setOrders((prev) =>
        prev.map((ord) => (ord.orderId === orderId ? { ...ord, status } : ord))
      );
      if (selectedOrder?.orderId === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status } : null));
      }

      const token = localStorage.getItem("token");

      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId, status }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to update order");
        fetchOrdersList(true);
        return;
      }

      if (status === "refund_wallet") {
        alert(data.message || "Successfully refunded to user wallet!");
      }

      // Merge server response data silently without full-page re-render
      if (data?.data) {
        setOrders((prev) =>
          prev.map((ord) => (ord.orderId === orderId ? { ...ord, ...data.data } : ord))
        );
        if (selectedOrder?.orderId === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, ...data.data } : null));
        }
      }
    } catch (err) {
      console.error("Update order status failed:", err);
      alert("Network error updating order");
      fetchOrdersList(true);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="w-full space-y-3 pb-8">
      {/* ================= HEADER & SEARCH BAR ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[var(--border)]/70">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-[var(--foreground)]/[0.04] text-[11px] font-bold text-[var(--foreground)] tabular-nums flex items-center gap-1 border border-[var(--border)]">
            <span>{pagination.total}</span>
            <span className="text-[10px] text-[var(--muted)] font-medium">Orders</span>
          </span>
          <button
            type="button"
            aria-label="Refresh Orders"
            onClick={() => { fetchOrdersList(); }}
            className="w-7 h-7 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06] active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          >
            <RefreshCcw size={13} className={loading ? "animate-spin text-[var(--accent)]" : ""} />
          </button>
        </div>

        {/* Search & Filter Trigger */}
        <div className="flex items-center gap-2 max-w-md w-full sm:w-auto">
          <SearchInput
            value={search}
            onChange={(val) => {
              setPage(1);
              setSearch(val);
            }}
            placeholder="Search by Order ID, Email, Method..."
            loading={loading}
            className="flex-1"
            rightElement={
              <button
                type="button"
                aria-label="Filter Orders"
                onClick={() => setShowFilters(true)}
                className={`h-7 w-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  filters.status || filters.gameSlug || filters.from || filters.to
                    ? "bg-[var(--accent)] text-white shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.08]"
                }`}
                title="Filter Orders"
              >
                <Filter size={13} />
              </button>
            }
          />
          
          {(search || filters.status || filters.gameSlug || filters.from || filters.to) && (
            <button aria-label="Clear Filters"
              onClick={() => {
                setSearch("");
                setFilters({ status: "", gameSlug: "", from: "", to: "" });
              }}
              className="px-2.5 h-8 rounded-full text-rose-500 hover:bg-rose-500/10 text-[10px] font-bold uppercase tracking-wider transition-all shrink-0 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <AnimatePresence>
        {loading && orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-20 flex flex-col items-center justify-center space-y-3"
          >
            <Loader2 className="animate-spin text-[var(--accent)]" size={24} />
            <p className="text-xs text-[var(--muted)] font-medium">Loading Orders...</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* DESKTOP TABLE */}
            <div className="hidden lg:block rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--card)]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--foreground)]/[0.02] border-b border-[var(--border)]">
                  <tr className="text-[11px] uppercase font-bold tracking-wider text-[var(--muted)]">
                    <th className="px-4 py-2.5">Game</th>
                    <th className="px-4 py-2.5">Time</th>
                    <th className="px-4 py-2.5">Item Details</th>
                    <th className="px-4 py-2.5">Method</th>
                    <th className="px-4 py-2.5">Price</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]/60">
                  {orders.map((o, idx) => {
                    return (
                      <motion.tr
                        key={o._id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.015 }}
                        onClick={() => setSelectedOrder(o)}
                        className="group hover:bg-[var(--foreground)]/[0.015] transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-2.5">
                          <div className="flex flex-col">
                            <span className="text-[var(--foreground)] font-bold text-xs uppercase">{o.gameSlug}</span>
                            <span className="text-[10px] text-[var(--muted)] font-medium truncate max-w-[150px] lowercase">{o.email}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex flex-col">
                            <span className="text-[var(--foreground)] font-medium text-xs">{formatDate(o.createdAt)}</span>
                            <span className="text-[10px] text-[var(--muted)]">{formatTime(o.createdAt)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 max-w-xs">
                          <span className="text-[var(--foreground)] font-bold truncate block text-xs">{o.itemName}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-[var(--muted)] font-mono uppercase tracking-tight truncate">
                              {o.playerId}{o.zoneId ? ` (${o.zoneId})` : ""} {o.playerName ? `• ${o.playerName}` : ""}
                            </span>
                            {o.playerId && (
                              <CopyButton
                                text={o.zoneId ? `${o.playerId} ${o.zoneId}` : o.playerId}
                                size="xs"
                                variant="ghost"
                                className="!p-0.5"
                                title="Copy Player ID & Zone"
                              />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-[10px] font-bold text-[var(--muted)] uppercase border border-[var(--border)] px-1.5 py-0.5 rounded bg-[var(--foreground)]/[0.02]">
                            {o.paymentMethod || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-sm font-bold text-emerald-500 tabular-nums">
                            {formatCurrency(o.price)}
                          </span>
                        </td>
                        <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                          <StatusDropdown
                            value={o.status}
                            disabled={updatingId === o.orderId}
                            onChange={(v) => updateOrderStatus(o.orderId, v)}
                            options={ORDER_STATUS_OPTIONS}
                          />
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE LIST */}
            <div className="lg:hidden space-y-1.5">
              {orders.map((o, idx) => {
                return (
                  <motion.div
                    key={o._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => setSelectedOrder(o)}
                    className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] active:bg-[var(--foreground)]/[0.05] hover:border-[var(--accent)]/30 transition-all cursor-pointer"
                  >
                    {/* Top Row: Game Slug & Email on Left, Price / Method / Date on Right */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex flex-col min-w-0 flex-1">
                        <p className="font-bold text-[var(--foreground)] uppercase text-[10px] leading-tight truncate mb-0.5">
                          {o.gameSlug}
                        </p>
                        <p className="text-[8.5px] text-[var(--muted)] font-medium truncate lowercase leading-tight">
                          {o.email}
                        </p>
                      </div>

                      <div className="flex flex-col items-end shrink-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[13px] font-black text-emerald-500 tabular-nums leading-none">
                            {formatCurrency(o.price)}
                          </span>
                          <span className="text-[7.5px] font-bold text-[var(--muted)] uppercase opacity-70 tracking-tight px-1 py-0.2 rounded bg-[var(--foreground)]/[0.04]">
                            {o.paymentMethod || "N/A"}
                          </span>
                        </div>
                        <span className="text-[8px] font-medium text-[var(--muted)]/55 leading-tight mt-1 tabular-nums">
                          {formatDate(o.createdAt)} • {formatTime(o.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Row: Item & Player Details on Left, Status Dropdown on Right */}
                    <div className="flex items-center justify-between gap-2 pt-1.5 mt-1.5 border-t border-[var(--border)]/30">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[var(--foreground)]/85 text-[10px] leading-tight truncate">
                          "{o.itemName}"
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <p className="text-[8.5px] font-mono text-[var(--muted)] uppercase tracking-tight truncate">
                            {o.playerId}{o.zoneId ? ` (${o.zoneId})` : ""} {o.playerName ? `• ${o.playerName}` : ""}
                          </p>
                          {o.playerId && (
                            <CopyButton
                              text={o.zoneId ? `${o.playerId} ${o.zoneId}` : o.playerId}
                              size="xs"
                              variant="ghost"
                              className="!p-0.5"
                              title="Copy Player ID & Zone"
                            />
                          )}
                        </div>
                      </div>

                      <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                        <StatusDropdown
                          value={o.status}
                          disabled={updatingId === o.orderId}
                          onChange={(v) => updateOrderStatus(o.orderId, v)}
                          compact
                          options={ORDER_STATUS_OPTIONS}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {!orders.length && (
              <EmptyState
                icon={ShoppingBag}
                title="No Orders Found"
                description="Try clearing your search or adjusting the filters."
              />
            )}

            {/* ================= PAGINATION ================= */}
            <Pagination
              page={page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              itemLabel="Orders"
              onPageChange={setPage}
              variant="numbered"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-[var(--background)] border-l border-[var(--border)] z-[1110] flex flex-col"
            >
              <div className="p-3 sm:p-4 border-b border-[var(--border)] bg-[var(--card)]/30">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[8.5px] font-mono font-bold text-[var(--accent)] uppercase tracking-wider opacity-85">
                        #{selectedOrder.orderId.toUpperCase()}
                      </p>
                      <CopyButton
                        text={selectedOrder.orderId}
                        size="xs"
                        variant="ghost"
                        className="!p-0.5"
                        title="Copy Order ID"
                      />
                    </div>
                    <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-[var(--foreground)] leading-tight">Order Details</h3>
                  </div>
                  <button aria-label="Close"
                    onClick={() => setSelectedOrder(null)}
                    className="w-6 h-6 rounded-md bg-[var(--foreground)]/[0.05] hover:bg-[var(--foreground)]/[0.1] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] transition-all cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)]">
                  <div>
                    <p className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-wider">Settlement</p>
                    <span className="text-lg sm:text-xl font-black text-emerald-500 tabular-nums leading-tight">{formatCurrency(selectedOrder.price)}</span>
                  </div>
                  <StatusDropdown
                    value={selectedOrder.status}
                    compact
                    disabled={updatingId === selectedOrder.orderId}
                    onChange={(v) => {
                      updateOrderStatus(selectedOrder.orderId, v);
                    }}
                    options={ORDER_STATUS_OPTIONS}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
                <DrawerSection icon={<Gamepad2 size={12} />} title="Item Info">
                  <DrawerDetail label="Game" value={selectedOrder.gameSlug} emphasize />
                  <DrawerDetail label="Item Name" value={selectedOrder.itemName} />
                  <DrawerDetail label="Item Code" value={selectedOrder.itemSlug} />
                </DrawerSection>

                <DrawerSection icon={<Smartphone size={12} />} title="Player ID Info">
                  <DrawerDetail
                    label="Player Name"
                    value={selectedOrder.playerName || "Unknown"}
                    copyText={selectedOrder.playerName}
                  />
                  <DrawerDetail
                    label="Player ID"
                    value={selectedOrder.playerId}
                    emphasize
                    copyText={selectedOrder.playerId}
                  />
                  <DrawerDetail
                    label="Server/Zone"
                    value={selectedOrder.zoneId || "GLOBAL"}
                    copyText={selectedOrder.zoneId}
                  />
                </DrawerSection>

                <DrawerSection icon={<CreditCard size={12} />} title="Payment Info">
                  <DrawerDetail label="Payment Method" value={selectedOrder.paymentMethod} />
                  <DrawerDetail label="Platform" value={selectedOrder.platform?.toLowerCase() === "pwa" ? "📱 Installed PWA" : "🌐 Web Browser"} />
                  <div className="flex items-center justify-between gap-1 group w-full py-0.5">
                    <span className="text-[9px] font-bold text-[var(--muted)]/70 uppercase tracking-wider">Payment Status</span>
                    <StatusBadge status={selectedOrder.paymentStatus} size="xs" />
                  </div>
                  <div className="flex items-center justify-between gap-1 group w-full py-0.5">
                    <span className="text-[9px] font-bold text-[var(--muted)]/70 uppercase tracking-wider">Product Status</span>
                    <StatusBadge status={selectedOrder.topupStatus} size="xs" />
                  </div>
                </DrawerSection>

                <DrawerSection icon={<User size={12} />} title="Buyer Info">
                  <DrawerDetail
                    label="Email"
                    value={selectedOrder.email || "GUEST"}
                    copyText={selectedOrder.email}
                  />
                  <DrawerDetail
                    label="Phone"
                    value={selectedOrder.phone || "N/A"}
                    copyText={selectedOrder.phone}
                    whatsappUrl={selectedOrder.phone ? getWhatsAppUrl(selectedOrder.phone, selectedOrder) : null}
                  />
                  <DrawerDetail label="Time" value={formatDateTime(selectedOrder.createdAt)} />

                  {selectedOrder.phone && (
                    <a
                      href={getWhatsAppUrl(selectedOrder.phone, selectedOrder)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 font-bold text-xs transition-all active:scale-[0.98] group"
                    >
                      <FaWhatsapp size={13} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span>Chat with Buyer on WhatsApp</span>
                      <ExternalLink size={10} className="opacity-60" />
                    </a>
                  )}
                </DrawerSection>

                <div className="pb-4" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ================= FILTER MODAL ================= */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-[var(--background)] border-l border-[var(--border)] z-[1110] flex flex-col"
            >
              <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
                <h3 className="text-xl font-black uppercase tracking-tight text-[var(--foreground)]">Find Orders</h3>
                <button aria-label="button"
                  onClick={() => setShowFilters(false)}
                  className="w-10 h-10 rounded-full bg-[var(--foreground)]/[0.05] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* GAME SLUG */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] ml-1">Game Filter</label>
                  <div className="relative">
                    <Gamepad2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]/40" size={18} />
                    <input
                      placeholder="e.g. mlbb, bgmi..."
                      value={filters.gameSlug}
                      onChange={(e) => {
                        setPage(1);
                        setFilters({ ...filters, gameSlug: e.target.value });
                      }}
                      className="w-full h-14 pl-12 pr-4 rounded-2xl border border-[var(--border)] bg-[var(--foreground)]/[0.04] text-[var(--foreground)] text-sm font-bold focus:border-[var(--accent)]/50 outline-none uppercase transition-all placeholder:text-[var(--muted)]/40"
                    />
                  </div>
                </div>

                {/* STATUS FILTER */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] ml-1">Process Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "pending", label: "Pending" },
                      { value: "success", label: "Success" },
                      { value: "failed", label: "Failed" },
                      { value: "refund", label: "Refund" },
                      { value: "refund_wallet", label: "Wallet Refund" },
                    ].map((item) => (
                      <button aria-label="button"
                        key={item.value}
                        onClick={() => {
                          setPage(1);
                          setFilters({ ...filters, status: filters.status === item.value ? "" : item.value });
                        }}
                        className={`
                          py-3.5 px-2 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all truncate
                          ${item.value === "refund_wallet" ? "col-span-2" : ""}
                          ${filters.status === item.value
                            ? "bg-[var(--accent)] border-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20"
                            : "border-[var(--border)] bg-[var(--foreground)]/[0.04] text-[var(--muted)] hover:text-[var(--foreground)]"}
                        `}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-[var(--border)]/50" />

                {/* DATE RANGE */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] ml-1">From</label>
                    <input
                      type="date"
                      value={filters.from}
                      onChange={(e) => {
                        setPage(1);
                        setFilters({ ...filters, from: e.target.value });
                      }}
                      className="w-full h-12 px-4 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.04] text-[var(--foreground)] text-[10px] font-black focus:border-[var(--accent)]/50 outline-none transition-all [color-scheme:dark]"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] ml-1">To</label>
                    <input
                      type="date"
                      value={filters.to}
                      onChange={(e) => {
                        setPage(1);
                        setFilters({ ...filters, to: e.target.value });
                      }}
                      className="w-full h-12 px-4 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.04] text-[var(--foreground)] text-[10px] font-black focus:border-[var(--accent)]/50 outline-none transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-[var(--foreground)]/[0.02] border-t border-[var(--border)]">
                <button aria-label="button"
                  onClick={() => setShowFilters(false)}
                  className="w-full py-4 rounded-2xl bg-[var(--foreground)] text-[var(--background)] font-black uppercase tracking-[0.2em] text-xs hover:scale-[0.98] transition-all"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div >
  );
}

/* ================= CUSTOM DROPDOWN ================= */
function StatusDropdown({ value, onChange, options, disabled, compact }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find((o) => o.value === value) || {
    value,
    label: value === "refund_wallet" ? "Refund to Wallet" : value,
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const styles = {
    pending: "text-amber-500",
    success: "text-emerald-500",
    failed: "text-rose-500",
    refund: "text-blue-500",
    refund_wallet: "text-purple-400",
    REFUND_WALLET: "text-purple-400",
    refund_to_wallet: "text-purple-400",
  };

  const optionStyles = {
    pending: "hover:text-amber-500",
    success: "hover:text-emerald-500",
    failed: "hover:text-rose-500",
    refund: "hover:text-blue-500",
    refund_wallet: "hover:text-purple-400",
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-label="Status selection"
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) setIsOpen((prev) => !prev);
        }}
        disabled={disabled}
        className={`
          flex items-center justify-between gap-1 px-2 
          ${compact ? "h-6.5 min-w-[85px] text-[8px]" : "h-10 min-w-[130px] text-[10px] px-3"}
          rounded-lg border border-[var(--border)] bg-[var(--foreground)]/[0.04] 
          font-black uppercase transition-all cursor-pointer
          ${disabled ? "opacity-40 cursor-not-allowed pointer-events-none" : "hover:bg-[var(--foreground)]/[0.08]"}
          ${isOpen ? "border-[var(--accent)] ring-1 ring-[var(--accent)]/30" : ""}
        `}
      >
        <div className="flex items-center gap-1.5 truncate">
          <div className={`w-1.5 h-1.5 rounded-full bg-current shrink-0 ${styles[value] || "text-[var(--foreground)]"}`} />
          <span className={`truncate ${styles[value] || "text-[var(--foreground)]"}`}>{selectedOption?.label}</span>
        </div>
        <ChevronDown size={compact ? 10 : 12} className={`shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 4 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            className="absolute z-[1200] right-0 min-w-[145px] w-max max-w-[190px] rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl p-1 overflow-hidden backdrop-blur-xl"
          >
            {options.map((option) => (
              <button
                type="button"
                aria-label={option.label}
                key={option.value}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full px-2.5 py-1.5 text-left text-[9px] font-black uppercase rounded-lg transition-all flex items-center gap-2 cursor-pointer
                  ${option.value === value
                    ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20"
                    : `text-[var(--foreground)]/70 hover:bg-[var(--foreground)]/[0.05] ${optionStyles[option.value] || "hover:text-[var(--foreground)]"}`}
                `}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    option.value === value
                      ? "bg-white"
                      : styles[option.value]
                      ? `bg-current ${styles[option.value]}`
                      : "bg-neutral-400"
                  }`}
                />
                <span className="truncate">{option.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================= HELPERS Interface ================= */

function getWhatsAppUrl(phone, order) {
  if (!phone) return null;
  let clean = phone.toString().replace(/[^0-9]/g, "");
  if (clean.length === 10) {
    clean = "91" + clean;
  }
  const orderId = order?.orderId || (order?._id ? String(order._id).slice(-8).toUpperCase() : "");
  const itemName = order?.itemName || "Diamond Top-up";
  const text = `Hello! Regarding your order #${orderId} (${itemName}) on BlueBuff...`;
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
}

function DrawerSection({ icon, title, children }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-[var(--foreground)]">
        <div className="p-1.5 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] shadow-[0_0_10px_rgba(var(--accent-rgb),0.1)]">{icon}</div>
        <h4 className="text-[10px] font-black uppercase tracking-widest">{title}</h4>
        <div className="h-px flex-1 bg-gradient-to-r from-[var(--border)] to-transparent ml-2" />
      </div>
      <div className="flex flex-col gap-3 px-1 mt-1">{children}</div>
    </div>
  );
}

function DrawerDetail({ label, value, emphasize, copyText, whatsappUrl }) {
  return (
    <div className="flex items-end justify-between gap-1 group w-full">
      <span className="text-[10px] font-bold text-[var(--muted)]/60 uppercase tracking-widest whitespace-nowrap mb-0.5">{label}</span>
      <div className="flex-1 border-b-2 border-dotted border-[var(--border)]/30 mx-2 mb-1.5 opacity-50 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-center gap-1.5 justify-end max-w-[65%]">
        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs md:text-sm font-black text-right truncate text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 transition-colors"
            title="Open WhatsApp chat with buyer"
          >
            <span className="truncate">{value || "N/A"}</span>
            <FaWhatsapp size={12} className="text-emerald-400 shrink-0 inline-block ml-0.5" />
          </a>
        ) : (
          <span className={`text-xs md:text-sm font-black text-right truncate ${emphasize ? "text-[var(--accent)] drop-shadow-[0_0_5px_rgba(var(--accent-rgb),0.3)] italic uppercase" : "text-[var(--foreground)]"}`}>
            {value || "N/A"}
          </span>
        )}
        {copyText && (
          <CopyButton
            text={copyText}
            size="xs"
            variant="ghost"
            className="!p-0.5"
            title={`Copy ${label}`}
          />
        )}
      </div>
    </div>
  );
}

function InsightCard({ label, value, color, pulse, compact }) {
  const colors = {
    blue: "text-blue-500 border-blue-500/10 bg-blue-500/5",
    amber: "text-amber-500 border-amber-500/10 bg-amber-500/5",
    purple: "text-purple-500 border-purple-500/10 bg-purple-500/5",
    emerald: "text-emerald-500 border-emerald-500/10 bg-emerald-500/5",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl border ${colors[color]} flex flex-col items-center justify-center text-center relative overflow-hidden`}
    >
      {pulse && (
        <span className="absolute top-1 right-1 w-1 h-1 rounded-full bg-current animate-ping" />
      )}
      <span className="text-[7px] sm:text-[8px] font-bold uppercase tracking-tight opacity-60 mb-0.5">{label}</span>
      <span className="text-xs sm:text-sm font-black tabular-nums whitespace-nowrap">{value}</span>
    </motion.div>
  );
}
