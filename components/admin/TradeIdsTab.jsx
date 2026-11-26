"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Search,
  Plus,
  RefreshCw,
  Edit3,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  ShoppingBag,
  Crown,
  Image as ImageIcon,
  X,
  Check,
  Layers,
  Info,
  Upload,
} from "lucide-react";

/* ================= HELPER FUNCTIONS ================= */

function formatRemainingTime(targetDate) {
  if (!targetDate) return null;
  const target = new Date(targetDate).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    return { expired: true, text: "Rent Expired (Due now)" };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remHours = hours % 24;
    return {
      expired: false,
      text: `${days}d ${remHours}h remaining`,
      short: `${days}d ${remHours}h`,
    };
  }

  return {
    expired: false,
    text: `${hours}h ${minutes}m remaining`,
    short: `${hours}h ${minutes}m`,
  };
}

function toLocalDatetimeString(date) {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const SUPPORTED_GAMES = [
  {
    id: "mlbb",
    name: "Mobile Legends: Bang Bang",
    short: "MLBB",
    icon: "🛡️",
    badgeColor: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    defaultLogin: "Moonton (Clean)",
    defaultServer: "India",
    sampleSpecs: [
      { label: "Heroes", value: "124 Heroes", subtext: "All Meta Unlocked" },
      { label: "Skins", value: "280+ Skins", subtext: "Collector & Aspirants" },
      { label: "Rank", value: "Mythic Immortal", subtext: "Peak 100+ Stars" },
      { label: "Emblems", value: "All Lv.60 Max", subtext: "Full Maxed" },
    ],
    presets: [
      { label: "Heroes", value: "120+ Heroes" },
      { label: "Skins", value: "250+ Skins" },
      { label: "Rank", value: "Mythic Glory" },
      { label: "Collector Skins", value: "6 Collector Skins" },
      { label: "Emblems", value: "All Lv.60 Max" },
      { label: "Winrate", value: "68% Overall WR" },
    ],
  },
  {
    id: "coc",
    name: "Clash of Clans",
    short: "COC",
    icon: "⚔️",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    defaultLogin: "Supercell ID (Clean)",
    defaultServer: "Global",
    sampleSpecs: [
      { label: "Town Hall", value: "TH 16 Max", subtext: "100% Maxed Defenses" },
      { label: "Hero Levels", value: "95 / 95 / 70 / 45", subtext: "BK / AQ / GW / RC" },
      { label: "Builder Hall", value: "BH 10 Max", subtext: "6th Builder Unlocked" },
      { label: "Gems & Sceneries", value: "5,400+ Gems", subtext: "8 Custom Sceneries" },
    ],
    presets: [
      { label: "Town Hall", value: "TH 16 Max" },
      { label: "Hero Levels", value: "95 / 95 / 70 / 45" },
      { label: "Builder Hall", value: "BH 10 Max" },
      { label: "Builders", value: "6/6 Builders" },
      { label: "Gems", value: "5,000+ Gems" },
      { label: "Sceneries", value: "6 Sceneries" },
      { label: "War Stars", value: "1,800+ War Stars" },
      { label: "Name Change", value: "Free / Available" },
    ],
  },
  {
    id: "bgmi",
    name: "Battlegrounds Mobile India (BGMI)",
    short: "BGMI",
    icon: "🎯",
    badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    defaultLogin: "Single Twitter Link (Clean)",
    defaultServer: "India",
    sampleSpecs: [
      { label: "Evo / Account Level", value: "Lv. 78 / Evo 66", subtext: "High KD & Popularity" },
      { label: "Gun Labs", value: "M416 Glacier Lv.7 Max", subtext: "Kill Feed & Loot Crate" },
      { label: "X-Suits / Outfits", value: "Pharaoh 6★ + 42 Mythics", subtext: "Mummy & Vampire Sets" },
      { label: "Peak Tier", value: "Conqueror C1S2", subtext: "Ace Dominator Active" },
    ],
    presets: [
      { label: "Evo / Level", value: "Lv. 76 / Evo 65" },
      { label: "Gun Labs", value: "M416 Glacier Max Lv.7" },
      { label: "Second Gun Lab", value: "Fool M416 Lv.4" },
      { label: "X-Suits", value: "Pharaoh 6-Star Max" },
      { label: "Mythic Outfits", value: "45+ Mythics (Mummy Set)" },
      { label: "Peak Tier", value: "Conqueror C1S2" },
      { label: "Popularity", value: "1.2 Million" },
      { label: "Links Status", value: "Single Link (Safe Unlink)" },
    ],
  },
  {
    id: "freefire",
    name: "Free Fire",
    short: "Free Fire",
    icon: "🔥",
    badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    defaultLogin: "Google Clean (Single)",
    defaultServer: "India",
    sampleSpecs: [
      { label: "Account Level", value: "Level 76", subtext: "18k+ Likes" },
      { label: "Evo Guns", value: "AK Draco Lv.7 + MP40 Max", subtext: "5 Evo Guns Maxed" },
      { label: "Rare Bundles", value: "Hip Hop + Red Criminal", subtext: "Old Season Passes" },
      { label: "Rank", value: "Grandmaster", subtext: "Heroic Current" },
    ],
    presets: [
      { label: "Level & Likes", value: "Lv. 75 / 15k Likes" },
      { label: "Evo Guns", value: "AK Draco Max Lv.7" },
      { label: "Rare Bundles", value: "Hip Hop & Red Criminal" },
      { label: "Rank Tier", value: "Grandmaster" },
      { label: "Elite Passes", value: "Season 1-10 Badges" },
    ],
  },
  {
    id: "valorant",
    name: "Valorant",
    short: "Valorant",
    icon: "⚡",
    badgeColor: "bg-red-500/10 text-red-400 border-red-500/20",
    defaultLogin: "Riot Clean (Mail Change)",
    defaultServer: "Mumbai (India)",
    sampleSpecs: [
      { label: "Current Rank", value: "Immortal 2", subtext: "Peak Immortal 3" },
      { label: "Premium Skins", value: "Kuronami Vandal + Prime", subtext: "Reaver & Champions" },
      { label: "VP / Radianite", value: "1,450 VP / 180 RP", subtext: "Battlepass Active" },
      { label: "Region", value: "India / APAC", subtext: "Low Ping Mumbai" },
    ],
    presets: [
      { label: "Current Rank", value: "Immortal 2" },
      { label: "Peak Rank", value: "Immortal 3" },
      { label: "Top Skins", value: "Kuronami + Reaver Vandal" },
      { label: "VP / RP", value: "1,850 VP / 160 RP" },
      { label: "Account Region", value: "Mumbai (India)" },
      { label: "Email Change", value: "Clean Mail Changeable" },
    ],
  },
  {
    id: "other",
    name: "Other Game",
    short: "Custom",
    icon: "🎮",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    defaultLogin: "Email / ID Login",
    defaultServer: "Global",
    sampleSpecs: [
      { label: "Account Level", value: "Level 80", subtext: "Endgame Account" },
      { label: "Key Items", value: "Top Tier Items", subtext: "Exclusive Inventory" },
    ],
    presets: [
      { label: "Account Level", value: "Level 80" },
      { label: "Primary Rank", value: "Top Tier" },
      { label: "Key Items", value: "Exclusive Inventory" },
      { label: "Login Type", value: "Clean Login Single Link" },
    ],
  },
];

function specsToBulletText(specs, bulletPoints) {
  if (Array.isArray(bulletPoints) && bulletPoints.length > 0) {
    return bulletPoints.join("\n");
  }
  if (Array.isArray(specs) && specs.length > 0) {
    return specs
      .map((s) => {
        if (typeof s === "string") return s;
        if (s && typeof s === "object") {
          const l = s.label || "";
          const v = s.value || "";
          const sub = s.subtext ? ` (${s.subtext})` : "";
          if (l && v) return `${l}: ${v}${sub}`;
          return v || l;
        }
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }
  return "";
}

const DEFAULT_FORM = {
  id: "",
  slug: "",
  title: "",
  price: 1999,
  currency: "INR",
  stockStatus: "in_stock",
  game: "coc",
  gameName: "Clash of Clans",
  bulletPointsText: "TH 16 Max (100% Defenses)\nHero Levels: BK95 / AQ95 / GW70 / RC45\n6/6 Builders Unlocked\n5,400+ Gems & 8 Sceneries\nSupercell ID Clean Single Link",
  bulletPoints: [],
  specs: [],
  rent: {
    available: false,
    price: 199,
    durationHours: 24,
    isRented: false,
    rentedAt: null,
    availableAgainAt: null,
    renterContact: "",
    renterNotes: "",
    conditions: [
      "No login email rebind",
      "Login only, no changes allowed",
      "Auto logout after rental period",
    ],
  },
  rank: {
    current: "TH 16 Max",
    highest: "5,800+ Trophies",
    stars: 0,
  },
  account: {
    game: "Clash of Clans",
    server: "Global",
    accountAgeYears: 2,
    loginType: "Supercell ID Clean",
    rebindable: true,
  },
  heroes: { total: 0 },
  skins: { total: 0 },
  collection: {
    tier: "",
    points: 0,
  },
  tags: [],
  details: "",
  dealer: {
    owner: "TK",
    contact: {
      whatsapp: "",
      telegram: "",
      instagram: "",
    },
  },
  media: {
    images: ["/logo.png"],
    fallbackImage: "/logo.png",
  },
  meta: {
    featured: false,
    verifiedByAdmin: true,
  },
};

export default function TradeIdsTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // "all" | "in_stock" | "unstocked" | "on_rent" | "rent_available"
  const [filterGame, setFilterGame] = useState("all"); // "all" | "mlbb" | "coc" | "bgmi" | "freefire" | "valorant" | "other"

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [modalTab, setModalTab] = useState("basic"); // "basic" | "rent"
  const [saving, setSaving] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");

  const handleGameSelect = (gameId) => {
    const selected = SUPPORTED_GAMES.find((g) => g.id === gameId);
    if (!selected) return;

    setFormData((prev) => {
      const isSwitchingGame = prev.game !== gameId;
      const defaultBullets = (selected.presets || [])
        .map((p) => p.value || p.label)
        .slice(0, 5)
        .join("\n");

      return {
        ...prev,
        game: gameId,
        gameName: selected.name,
        bulletPointsText: isSwitchingGame ? defaultBullets : (prev.bulletPointsText || defaultBullets),
        account: {
          ...prev.account,
          game: selected.name,
          server: isSwitchingGame ? selected.defaultServer : (prev.account?.server || selected.defaultServer),
          loginType: isSwitchingGame ? selected.defaultLogin : (prev.account?.loginType || selected.defaultLogin),
        },
      };
    });
  };

  // Quick Rent Modal / Popover state
  const [rentActionItem, setRentActionItem] = useState(null);
  const [rentHoursPreset, setRentHoursPreset] = useState(24);
  const [customReturnDate, setCustomReturnDate] = useState("");
  const [rentNotes, setRentNotes] = useState("");
  const [rentContact, setRentContact] = useState("");

  // Toast state
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const getAuthToken = () => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("token") || "";
  };

  /* ================= FETCH ACCOUNTS ================= */
  const fetchItems = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/admin/trade-ids", {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setItems(data.data || []);
      } else {
        showToast(data.message || "Failed to load accounts", "error");
      }
    } catch (err) {
      console.error("Fetch trade IDs error:", err);
      showToast("Error connecting to server", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  /* ================= STOCK / UNSTOCK QUICK TOGGLE ================= */
  const toggleStockStatus = async (item) => {
    const newStatus = item.stockStatus === "in_stock" ? "unstocked" : "in_stock";
    
    // Optimistic UI update
    setItems((prev) =>
      prev.map((i) => (i._id === item._id ? { ...i, stockStatus: newStatus } : i))
    );

    try {
      const res = await fetch(`/api/admin/trade-ids/${item._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ stockStatus: newStatus }),
      });
      const data = await res.json();

      if (data.success) {
        showToast(
          `ID ${item.id} is now ${newStatus === "in_stock" ? "IN STOCK" : "UNSTOCKED"}`,
          "success"
        );
      } else {
        // Rollback
        setItems((prev) =>
          prev.map((i) => (i._id === item._id ? { ...i, stockStatus: item.stockStatus } : i))
        );
        showToast(data.message || "Failed to update stock", "error");
      }
    } catch (err) {
      // Rollback
      setItems((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, stockStatus: item.stockStatus } : i))
      );
      showToast("Server error updating stock status", "error");
    }
  };

  /* ================= RENT ACTIONS ("HOW MUCH LATER AGAIN") ================= */

  // Mark Rent Returned (Available again right now)
  const handleMarkRentReturned = async (item) => {
    try {
      const updatedRent = {
        ...item.rent,
        isRented: false,
        availableAgainAt: null,
        rentedAt: null,
      };

      // Optimistic update
      setItems((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, rent: updatedRent } : i))
      );

      const res = await fetch(`/api/admin/trade-ids/${item._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ rent: updatedRent }),
      });
      const data = await res.json();

      if (data.success) {
        showToast(`ID ${item.id} rent marked returned! Now available for rent.`, "success");
      } else {
        showToast(data.message || "Failed to return rent", "error");
        fetchItems();
      }
    } catch (err) {
      showToast("Error updating rent status", "error");
      fetchItems();
    }
  };

  // Open Quick Rent Modal
  const openRentActionModal = (item) => {
    setRentActionItem(item);
    setRentHoursPreset(item.rent?.durationHours || 24);
    const returnTime = new Date(Date.now() + (item.rent?.durationHours || 24) * 3600 * 1000);
    setCustomReturnDate(toLocalDatetimeString(returnTime));
    setRentNotes(item.rent?.renterNotes || "");
    setRentContact(item.rent?.renterContact || "");
  };

  // Apply Quick Rent / Set "How much later available again"
  const handleApplyRentAction = async () => {
    if (!rentActionItem) return;

    let targetDate = null;
    if (customReturnDate) {
      targetDate = new Date(customReturnDate);
    } else {
      targetDate = new Date(Date.now() + rentHoursPreset * 3600 * 1000);
    }

    const updatedRent = {
      ...rentActionItem.rent,
      available: true,
      isRented: true,
      rentedAt: new Date(),
      availableAgainAt: targetDate,
      renterContact: rentContact,
      renterNotes: rentNotes,
    };

    try {
      const res = await fetch(`/api/admin/trade-ids/${rentActionItem._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ rent: updatedRent }),
      });
      const data = await res.json();

      if (data.success) {
        showToast(
          `ID ${rentActionItem.id} marked as RENTED. Available again at ${targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${targetDate.toLocaleDateString()})`,
          "success"
        );
        setRentActionItem(null);
        fetchItems();
      } else {
        showToast(data.message || "Failed to update rent", "error");
      }
    } catch (err) {
      showToast("Server error setting rent duration", "error");
    }
  };

  // Quick preset hour click
  const handlePresetHourChange = (hours) => {
    setRentHoursPreset(hours);
    const target = new Date(Date.now() + hours * 3600 * 1000);
    setCustomReturnDate(toLocalDatetimeString(target));
  };

  /* ================= EDIT / CREATE ACCOUNT MODAL ================= */

  const handleOpenCreateModal = (gameId = "coc") => {
    setEditingItem(null);
    const selectedGame = SUPPORTED_GAMES.find((g) => g.id === gameId) || SUPPORTED_GAMES[0];
    const prefix = selectedGame.short.toUpperCase();
    const randomCode = Math.floor(1000 + Math.random() * 9000);

    const defaultBullets = (selectedGame.presets || [])
      .map((p) => p.value || p.label)
      .slice(0, 5)
      .join("\n");

    setFormData({
      ...DEFAULT_FORM,
      id: `${prefix}-${randomCode}`,
      slug: `${selectedGame.id}-account-${randomCode}`,
      game: selectedGame.id,
      gameName: selectedGame.name,
      bulletPointsText: defaultBullets,
      bulletPoints: defaultBullets.split("\n"),
      specs: defaultBullets.split("\n"),
      account: {
        ...DEFAULT_FORM.account,
        game: selectedGame.name,
        server: selectedGame.defaultServer,
        loginType: selectedGame.defaultLogin,
      },
    });
    setModalTab("basic");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    const itemGame = item.game || "mlbb";
    const selectedGame = SUPPORTED_GAMES.find((g) => g.id === itemGame) || SUPPORTED_GAMES[0];

    const bulletText = specsToBulletText(item.specs, item.bulletPoints) ||
      (item.heroes?.total || item.skins?.total
        ? `${item.heroes?.total || 0} Heroes\n${item.skins?.total || 0} Skins\n${item.rank?.current || "Mythic"}`
        : "");

    setFormData({
      ...DEFAULT_FORM,
      ...item,
      game: itemGame,
      gameName: item.gameName || item.account?.game || selectedGame.name,
      bulletPointsText: bulletText,
      rent: {
        ...DEFAULT_FORM.rent,
        ...(item.rent || {}),
        availableAgainAt: item.rent?.availableAgainAt ? toLocalDatetimeString(item.rent.availableAgainAt) : "",
      },
      account: { ...DEFAULT_FORM.account, ...(item.account || {}) },
      media: { ...DEFAULT_FORM.media, ...(item.media || {}) },
      tags: Array.isArray(item.tags) ? item.tags : [],
    });
    setModalTab("basic");
    setIsModalOpen(true);
  };

  const handleSaveModal = async (e) => {
    e.preventDefault();

    if (!formData.id || !formData.title || formData.price === undefined) {
      showToast("Please provide ID code, title, and price", "error");
      return;
    }

    setSaving(true);
    try {
      const bulletList = (formData.bulletPointsText || "")
        .split("\n")
        .map((l) => l.replace(/^[•\-\*]\s*/, "").trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        game: formData.game || "coc",
        gameName: formData.gameName || formData.account?.game || "Gaming Account",
        specs: bulletList,
        bulletPoints: bulletList,
        price: Number(formData.price),
        rent: {
          ...formData.rent,
          price: Number(formData.rent?.price) || 0,
          durationHours: Number(formData.rent?.durationHours) || 24,
          availableAgainAt: formData.rent?.availableAgainAt ? new Date(formData.rent.availableAgainAt) : null,
        },
      };

      const url = editingItem
        ? `/api/admin/trade-ids/${editingItem._id}`
        : "/api/admin/trade-ids";
      const method = editingItem ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        showToast(
          editingItem ? "Account updated successfully!" : "New game ID added to marketplace!",
          "success"
        );
        setIsModalOpen(false);
        fetchItems();
      } else {
        showToast(data.message || "Failed to save account", "error");
      }
    } catch (err) {
      console.error("Save account error:", err);
      showToast("Failed to connect to server", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ================= DELETE ACCOUNT ================= */
  const handleDeleteItem = async (item) => {
    if (!confirm(`Are you sure you want to permanently delete "${item.title}" (${item.id})?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/trade-ids/${item._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      const data = await res.json();

      if (data.success) {
        showToast(`Account ${item.id} deleted`, "success");
        setItems((prev) => prev.filter((i) => i._id !== item._id));
      } else {
        showToast(data.message || "Failed to delete account", "error");
      }
    } catch (err) {
      showToast("Server error deleting account", "error");
    }
  };

  /* ================= FILTER & SEARCH LOGIC ================= */
  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();

    return items.filter((item) => {
      // Game Filter
      if (filterGame !== "all" && (item.game || "mlbb") !== filterGame) {
        return false;
      }

      // Search matching
      const matchesSearch =
        !q ||
        item.id?.toLowerCase().includes(q) ||
        item.title?.toLowerCase().includes(q) ||
        item.gameName?.toLowerCase().includes(q) ||
        item.game?.toLowerCase().includes(q) ||
        item.account?.server?.toLowerCase().includes(q) ||
        item.tags?.some((t) => t.toLowerCase().includes(q)) ||
        item.specs?.some(
          (s) => s.label?.toLowerCase().includes(q) || s.value?.toLowerCase().includes(q)
        );

      if (!matchesSearch) return false;

      // Status matching
      if (filterStatus === "in_stock") return item.stockStatus === "in_stock";
      if (filterStatus === "unstocked") return item.stockStatus === "unstocked";
      if (filterStatus === "on_rent") return Boolean(item.rent?.isRented);
      if (filterStatus === "rent_available")
        return Boolean(item.rent?.available) && !item.rent?.isRented;

      return true;
    });
  }, [items, search, filterStatus, filterGame]);

  // Overall Stats
  const stats = useMemo(() => {
    const total = items.length;
    const inStock = items.filter((i) => i.stockStatus === "in_stock").length;
    const unstocked = items.filter((i) => i.stockStatus === "unstocked").length;
    const onRent = items.filter((i) => i.rent?.isRented).length;
    const rentAvailable = items.filter((i) => i.rent?.available && !i.rent?.isRented).length;
    return { total, inStock, unstocked, onRent, rentAvailable };
  }, [items]);

  return (
    <div className="space-y-6">
      {/* ================= TOAST NOTIFICATION ================= */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl text-xs font-bold ${
              toast.type === "error"
                ? "bg-red-950/90 border-red-500/50 text-red-200"
                : "bg-emerald-950/90 border-emerald-500/50 text-emerald-200"
            }`}
          >
            {toast.type === "error" ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= HEADER & STATS ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchItems}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--foreground)]/5 text-xs font-bold transition-all cursor-pointer"
            title="Refresh accounts"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white text-xs font-black uppercase tracking-wider shadow-md transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>Add New ID</span>
          </button>
        </div>
      </div>

      {/* ================= KPI CARDS ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          {
            label: "Total",
            value: stats.total,
            icon: Layers,
            cls: "bg-[var(--card)] border-[var(--border)] text-[var(--foreground)]",
            labelCls: "text-[var(--muted)]",
          },
          {
            label: "In Stock",
            value: stats.inStock,
            icon: CheckCircle2,
            cls: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
          },
          {
            label: "Unstocked",
            value: stats.unstocked,
            icon: XCircle,
            cls: "bg-red-500/10 border-red-500/30 text-red-400",
          },
          {
            label: "On Rent",
            value: stats.onRent,
            icon: Zap,
            cls: "bg-amber-500/10 border-amber-500/30 text-amber-400",
          },
          {
            label: "Rent Ready",
            value: stats.rentAvailable,
            icon: Clock,
            cls: "bg-sky-500/10 border-sky-500/30 text-sky-400 col-span-2 sm:col-span-1",
          },
        ].map(({ label, value, icon: Icon, cls, labelCls }) => (
          <div
            key={label}
            className={`px-3 py-2 rounded-xl border flex items-center justify-between gap-2 ${cls}`}
          >
            <div className={`flex items-center gap-1.5 min-w-0 text-[10px] font-black uppercase tracking-wider ${labelCls || ""}`}>
              <Icon size={12} className="shrink-0" />
              <span className="truncate">{label}</span>
            </div>
            <div className="text-base font-black tracking-tight tabular-nums shrink-0">{value}</div>
          </div>
        ))}
      </div>

      {/* ================= FILTER & SEARCH BAR ================= */}
      <div className="flex flex-col gap-2.5 p-2.5 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 flex items-center px-2.5">
            <Search size={14} className="text-[var(--muted)] shrink-0 mr-2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search accounts by code, title, tags, server..."
              className="w-full bg-transparent text-xs py-1.5 focus:outline-none placeholder:text-[var(--muted)]/60"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-[var(--muted)] hover:text-white p-1"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar px-1">
            {[
              { id: "all", label: `All (${stats.total})` },
              { id: "in_stock", label: `In Stock (${stats.inStock})` },
              { id: "unstocked", label: `Unstocked (${stats.unstocked})` },
              { id: "on_rent", label: `On Rent (${stats.onRent})` },
              { id: "rent_available", label: `Rent Ready (${stats.rentAvailable})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  filterStatus === tab.id
                    ? "bg-[var(--accent)] text-white shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Game Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-[var(--border)]/60 px-1">
          {[
            { id: "all", label: "All Games", icon: "🎮" },
            { id: "coc", label: "Clash of Clans (COC)", icon: "⚔️" },
            { id: "mlbb", label: "Mobile Legends (MLBB)", icon: "🛡️" },
            { id: "bgmi", label: "BGMI / PUBG", icon: "🎯" },
          ].map((g) => {
            const isActive = filterGame === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setFilterGame(g.id)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  isActive
                    ? "bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)] shadow-xs"
                    : "bg-[var(--background)]/50 text-[var(--muted)] hover:text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--foreground)]/5"
                }`}
              >
                <span>{g.icon}</span>
                <span>{g.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= ACCOUNTS LIST ================= */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[var(--muted)] flex items-center justify-center gap-2">
          <RefreshCw size={16} className="animate-spin text-[var(--accent)]" />
          <span>Loading trade accounts...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 rounded-3xl border border-dashed border-[var(--border)] text-center space-y-3">
          <Package size={36} className="mx-auto text-[var(--muted)]/50" />
          <div className="text-sm font-bold">No accounts found</div>
          <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
            {search || filterStatus !== "all" || filterGame !== "all"
              ? "No accounts match your search or filter. Try clearing your filters."
              : "No accounts have been created in the database yet. Click 'Add New ID' to create your first game account listing."}
          </p>
          {(search || filterStatus !== "all" || filterGame !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setFilterStatus("all");
                setFilterGame("all");
              }}
              className="px-4 py-1.5 rounded-full border border-[var(--border)] text-xs font-bold"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const isStock = item.stockStatus === "in_stock";
            const rentInfo = item.rent || {};
            const isRented = Boolean(rentInfo.isRented);
            const countdown = isRented ? formatRemainingTime(rentInfo.availableAgainAt) : null;
            const coverImage = item.media?.images?.[0] || item.media?.fallbackImage || "/logo.png";

            return (
              <div
                key={item._id || item.id}
                className={`relative rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                  isStock
                    ? "bg-[var(--card)] border-[var(--border)] hover:border-[var(--accent)]/40 shadow-sm"
                    : "bg-[var(--card)]/60 border-red-500/20 opacity-85"
                }`}
              >
                {/* ── CARD TOP ── */}
                <div className="p-3 sm:p-3.5 space-y-2.5">
                  {/* Image & Header Badges */}
                  <div className="flex gap-3 items-start">
                    <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden bg-black/40 shrink-0 border border-[var(--border)]">
                      <img
                        src={coverImage}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      {item.collection?.tier && (
                        <div className="absolute bottom-0.5 left-0.5 right-0.5 px-1 py-0.5 rounded bg-black/80 backdrop-blur-xs text-[8px] font-black uppercase text-amber-400 truncate flex items-center gap-0.5">
                          <Crown size={8} className="shrink-0" />
                          <span className="truncate">{item.collection.tier}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      {/* Code, Game & Server Badges */}
                      <div className="flex items-center gap-1 flex-wrap">
                        {/* Game Badge */}
                        {(() => {
                          const gMeta = SUPPORTED_GAMES.find((g) => g.id === (item.game || "mlbb")) || SUPPORTED_GAMES[0];
                          return (
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border flex items-center gap-1 ${gMeta.badgeColor}`}>
                              <span>{gMeta.icon}</span>
                              <span>{gMeta.short}</span>
                            </span>
                          );
                        })()}
                        <span className="px-1.5 py-0.5 rounded bg-[var(--foreground)]/5 border border-[var(--border)] text-[9px] font-black uppercase tracking-wider text-[var(--accent)]">
                          {item.id}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-[var(--foreground)]/5 text-[9px] font-bold text-[var(--muted)]">
                          {item.account?.server || "Server"}
                        </span>
                        {item.rank?.current && (
                          <span className="px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] font-bold">
                            {item.rank.current}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-xs sm:text-sm font-black tracking-tight leading-snug line-clamp-1">
                        {item.title}
                      </h3>

                      {/* Price display */}
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-black text-[var(--accent)] tabular-nums">
                          ₹{Number(item.price).toLocaleString("en-IN")}
                        </span>
                        {rentInfo.available && (
                          <span className="text-[10px] font-bold text-amber-500 dark:text-amber-400">
                            • Rent: ₹{rentInfo.price}/{rentInfo.durationHours || 24}h
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── BULLET POINTS / SPECS DISPLAY ── */}
                  {(() => {
                    const bullets = (item.bulletPoints && item.bulletPoints.length > 0)
                      ? item.bulletPoints
                      : Array.isArray(item.specs) && item.specs.length > 0
                      ? item.specs.map((s) => (typeof s === "string" ? s : `${s.label ? s.label + ": " : ""}${s.value || ""}`))
                      : [];

                    if (bullets.length > 0) {
                      return (
                        <div className="px-2.5 py-1.5 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] flex flex-wrap items-center gap-x-3 gap-y-0.5">
                          {bullets.slice(0, 3).map((bullet, bIdx) => (
                            <div key={bIdx} className="flex items-center gap-1 text-[11px] text-[var(--foreground)] max-w-full">
                              <span className="text-[var(--accent)] font-black shrink-0">•</span>
                              <span className="font-semibold truncate">{bullet}</span>
                            </div>
                          ))}
                          {bullets.length > 3 && (
                            <span className="text-[10px] font-bold text-[var(--muted)]">
                              +{bullets.length - 3} more
                            </span>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div className="px-2.5 py-1 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-[10px] text-[var(--muted)]">
                        No specs listed
                      </div>
                    );
                  })()}

                  {/* ── STOCK & RENT STATUS CARDS ── */}
                  <div className="space-y-1.5">
                    {/* 1. STOCK / UNSTOCK STATUS & QUICK TOGGLE */}
                    <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            isStock ? "bg-emerald-400 animate-pulse" : "bg-red-500"
                          }`}
                        />
                        <span
                          className={`text-[11px] font-black truncate ${
                            isStock ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {isStock ? "In Stock" : "Unstocked"}
                        </span>
                      </div>

                      {/* Instant Toggle Button */}
                      <button
                        type="button"
                        onClick={() => toggleStockStatus(item)}
                        className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                          isStock
                            ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-emerald-500 hover:bg-emerald-600 text-black border border-emerald-400"
                        }`}
                        title={isStock ? "Click to unstock account" : "Click to put back in stock"}
                      >
                        {isStock ? "Unstock" : "Stock Now"}
                      </button>
                    </div>

                    {/* 2. RENT STATUS & "HOW MUCH LATER AGAIN" CONTROLS */}
                    <div className="px-2.5 py-1.5 rounded-xl bg-[var(--background)] border border-[var(--border)] space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                          <Clock size={11} className="text-amber-400 shrink-0" />
                          <span>Rental</span>
                        </div>

                        {!rentInfo.available ? (
                          <span className="px-2 py-0.5 rounded-full bg-[var(--foreground)]/5 text-[9px] font-bold text-[var(--muted)]">
                            Disabled
                          </span>
                        ) : isRented ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                            Rented
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[9px] font-black uppercase tracking-wider">
                            Available
                          </span>
                        )}
                      </div>

                      {/* When Rent is enabled */}
                      {rentInfo.available && (
                        <div>
                          {isRented ? (
                            <div className="space-y-1.5">
                              {/* Countdown & Return Time */}
                              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-0.5">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center justify-between">
                                  <span>Available in:</span>
                                  <span className="font-mono font-black text-[11px]">
                                    {countdown?.text || "Calculating..."}
                                  </span>
                                </div>

                                {rentInfo.availableAgainAt && (
                                  <div className="text-[10px] text-[var(--muted)]">
                                    Return:{" "}
                                    <span className="font-bold text-[var(--foreground)]">
                                      {new Date(rentInfo.availableAgainAt).toLocaleString()}
                                    </span>
                                  </div>
                                )}

                                {rentInfo.renterContact && (
                                  <div className="text-[10px] text-[var(--muted)]">
                                    Renter:{" "}
                                    <span className="font-bold text-amber-200">
                                      {rentInfo.renterContact}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Action Buttons for Rented Account */}
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleMarkRentReturned(item)}
                                  className="flex-1 py-1 px-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer text-center"
                                >
                                  Mark Returned
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openRentActionModal(item)}
                                  className="py-1 px-2.5 rounded-lg bg-[var(--card)] hover:bg-[var(--foreground)]/5 border border-[var(--border)] text-[10px] font-bold transition-all cursor-pointer"
                                  title="Extend or edit rent period"
                                >
                                  Extend
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-[11px] text-[var(--muted)] font-medium">
                                Rate:{" "}
                                <span className="font-black text-emerald-400">
                                  ₹{rentInfo.price}
                                </span>{" "}
                                / {rentInfo.durationHours || 24}h
                              </div>
                              <button
                                type="button"
                                onClick={() => openRentActionModal(item)}
                                className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                              >
                                Mark Rented
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── CARD FOOTER ACTIONS ── */}
                <div className="px-3 py-2 bg-[var(--background)]/80 border-t border-[var(--border)] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {/* View in Store */}
                    <a
                      href={`/marketplace/${item.slug || item.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-colors"
                      title="View public marketplace page"
                    >
                      <ExternalLink size={13} />
                    </a>

                    {/* Delete Account */}
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item)}
                      className="p-1.5 rounded-lg text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Delete account"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Edit Full Details Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(item)}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[var(--card)] hover:bg-[var(--foreground)]/10 border border-[var(--border)] text-[11px] font-bold transition-all cursor-pointer"
                  >
                    <Edit3 size={11} className="text-[var(--accent)]" />
                    <span>Edit Details</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= QUICK RENT SETTINGS MODAL ("HOW MUCH LATER AGAIN") ================= */}
      <AnimatePresence>
        {rentActionItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-3xl bg-[var(--card)] border border-[var(--border)] p-5 sm:p-6 space-y-4 shadow-2xl text-[var(--foreground)]"
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="text-amber-400" size={18} />
                  <h3 className="text-base font-black uppercase tracking-tight">
                    Rent Status: {rentActionItem.id}
                  </h3>
                </div>
                <button
                  onClick={() => setRentActionItem(null)}
                  className="p-1 rounded-full text-[var(--muted)] hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Mark this ID as currently rented and set{" "}
                  <strong className="text-amber-400">how much later</strong> it will be available again for users.
                </p>

                {/* Duration Presets */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                    Quick Duration Preset
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { hours: 12, label: "12 Hours" },
                      { hours: 24, label: "24 Hours" },
                      { hours: 48, label: "48 Hours" },
                      { hours: 72, label: "3 Days" },
                    ].map((preset) => (
                      <button
                        key={preset.hours}
                        type="button"
                        onClick={() => handlePresetHourChange(preset.hours)}
                        className={`py-2 px-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border cursor-pointer ${
                          rentHoursPreset === preset.hours
                            ? "bg-amber-400 text-black border-amber-300 shadow-sm"
                            : "bg-[var(--background)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Return Date & Time */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                    Exact Return Time (Available Again At)
                  </label>
                  <input
                    type="datetime-local"
                    value={customReturnDate}
                    onChange={(e) => {
                      setCustomReturnDate(e.target.value);
                      setRentHoursPreset(0);
                    }}
                    className="w-full p-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-bold focus:outline-none focus:border-amber-400"
                  />
                  {customReturnDate && (
                    <div className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                      <Clock size={11} />
                      <span>
                        Available again in: {formatRemainingTime(customReturnDate)?.text || "Set"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Optional Renter Info */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                    Renter Phone / Contact (Optional)
                  </label>
                  <input
                    type="text"
                    value={rentContact}
                    onChange={(e) => setRentContact(e.target.value)}
                    placeholder="e.g. +91 9876543210 (WhatsApp)"
                    className="w-full p-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                    Admin Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={rentNotes}
                    onChange={(e) => setRentNotes(e.target.value)}
                    placeholder="e.g. Rented via WhatsApp group"
                    className="w-full p-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRentActionItem(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-xs font-bold hover:bg-[var(--foreground)]/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyRentAction}
                  className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  Confirm Rental Period
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= EDIT / CREATE ACCOUNT MODAL ================= */}
      <AnimatePresence>
        {isModalOpen && (
          <div
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="w-full max-w-2xl max-h-[90vh] sm:max-h-[88vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-[var(--card)] border-t sm:border border-[var(--border)] shadow-2xl text-[var(--foreground)] overflow-hidden"
            >
              {/* Mobile Bottom-Sheet Handle */}
              <div className="sm:hidden flex justify-center pt-2.5 pb-0.5 shrink-0">
                <div className="w-10 h-1 rounded-full bg-[var(--foreground)]/15" />
              </div>

              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-[var(--border)] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                    <Edit3 size={18} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black uppercase tracking-tight">
                      {editingItem ? `Edit Account: ${formData.id}` : "Add New Game Account"}
                    </h3>
                    <p className="text-[11px] text-[var(--muted)]">
                      Configure account specs, pricing, stock availability, and rent conditions.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-full text-[var(--muted)] hover:text-white hover:bg-[var(--foreground)]/5"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation Tabs (Simpler 2-Tab Layout) */}
              <div className="grid grid-cols-2 px-4 sm:px-5 pt-2 border-b border-[var(--border)] shrink-0">
                {[
                  { id: "basic", label: "1. Account Specs" },
                  { id: "rent", label: "2. Rent & Media" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setModalTab(t.id)}
                    className={`px-2 py-2 border-b-2 text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer truncate text-center ${
                      modalTab === t.id
                        ? "border-[var(--accent)] text-[var(--accent)]"
                        : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Form Body (Scrollable) */}
              <form onSubmit={handleSaveModal} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
                {/* ── TAB 1: DETAILS & BULLET SPECS ── */}
                {modalTab === "basic" && (
                  <div className="space-y-4">
                    {/* Game Selector */}
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                        Select Game *
                      </label>
                      <select
                        value={formData.game || "coc"}
                        onChange={(e) => handleGameSelect(e.target.value)}
                        className="w-full mt-1 p-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] font-bold text-xs focus:outline-none focus:border-[var(--accent)]"
                      >
                        {SUPPORTED_GAMES.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.short === g.name ? g.name : `${g.short} — ${g.name}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                          Account ID Code *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.id}
                          onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                          placeholder="e.g. COC-1001, BGMI-2002, MLBB-3003"
                          className="w-full mt-1 p-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] font-bold text-xs focus:outline-none focus:border-[var(--accent)]"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                          URL Slug (unique)
                        </label>
                        <input
                          type="text"
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                          placeholder="e.g. coc-th16-max-1001"
                          className="w-full mt-1 p-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] font-mono text-xs focus:outline-none focus:border-[var(--accent)]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                        Account Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder={
                          formData.game === "coc"
                            ? "e.g. COC TH16 100% Max – 6 Builders, 5.4k Gems, All Heroes Max"
                            : formData.game === "bgmi"
                            ? "e.g. BGMI Conqueror C1S2 – M416 Glacier Max Lv.7 + Pharaoh X-Suit"
                            : "e.g. Premium Game Account – Top Tier Skins & High Rank"
                        }
                        className="w-full mt-1 p-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] font-bold text-xs focus:outline-none focus:border-[var(--accent)]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                          Buy Price (₹ INR) *
                        </label>
                        <input
                          type="number"
                          required
                          min={0}
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="w-full mt-1 p-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] font-black text-sm text-[var(--accent)] focus:outline-none focus:border-[var(--accent)]"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                          Stock Availability Status *
                        </label>
                        <select
                          value={formData.stockStatus}
                          onChange={(e) => setFormData({ ...formData, stockStatus: e.target.value })}
                          className="w-full mt-1 p-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] font-bold text-xs focus:outline-none focus:border-[var(--accent)]"
                        >
                          <option value="in_stock">In Stock (Visible & Purchasable)</option>
                          <option value="unstocked">Unstocked (Marked Out of Stock)</option>
                          <option value="sold">Sold (Marked Sold)</option>
                          <option value="reserved">Reserved (On Hold)</option>
                        </select>
                      </div>
                    </div>

                    {/* ── PURE SIMPLER BULLET POINTS SPECS INPUT ── */}
                    <div className="space-y-2.5 p-3.5 rounded-2xl bg-[var(--background)] border border-[var(--border)]">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-black uppercase tracking-wider text-[var(--foreground)] flex items-center gap-1.5">
                          <CheckCircle2 size={14} className="text-emerald-400" />
                          <span>Account Specs (Bullet Points — One Per Line) *</span>
                        </label>
                        <span className="text-[10px] text-[var(--muted)]">Type each spec on a new line</span>
                      </div>

                      {/* Quick preset chips to click and append */}
                      {(() => {
                        const activeGame = SUPPORTED_GAMES.find((g) => g.id === (formData.game || "coc")) || SUPPORTED_GAMES[0];
                        return (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold text-[var(--muted)]">Quick add:</span>
                            {activeGame.presets.map((preset, pIdx) => (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => {
                                  const toAdd = preset.value || preset.label;
                                  setFormData((prev) => {
                                    const current = (prev.bulletPointsText || "").trim();
                                    const next = current ? `${current}\n${toAdd}` : toAdd;
                                    return { ...prev, bulletPointsText: next };
                                  });
                                }}
                                className="px-2 py-0.5 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)] hover:text-[var(--accent)] text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Plus size={10} />
                                <span>{preset.label}</span>
                              </button>
                            ))}
                          </div>
                        );
                      })()}

                      <textarea
                        rows={6}
                        required
                        value={formData.bulletPointsText || ""}
                        onChange={(e) => setFormData({ ...formData, bulletPointsText: e.target.value })}
                        placeholder={
                          formData.game === "coc"
                            ? "TH 16 Max (100% Defenses)\nHero Levels: BK95 / AQ95 / GW70 / RC45\n6/6 Builders Unlocked\n5,400+ Gems & 8 Sceneries\nSupercell ID Clean Single Link"
                            : formData.game === "bgmi"
                            ? "Account Level 78 / Evo 66\nM416 Glacier Max Lv.7 (Kill Message + Crate)\nPharaoh X-Suit 6-Star Max\nPeak Rank: Conqueror C1S2\nSingle Twitter Link (Clean)"
                            : "Account Level 100\nFull Meta Items Unlocked\nSingle Link Clean Login"
                        }
                        className="w-full p-3 rounded-2xl bg-[var(--card)] border border-[var(--border)] font-mono text-xs focus:outline-none focus:border-[var(--accent)] leading-relaxed"
                      />

                      {/* Live Bullet Points Preview */}
                      {formData.bulletPointsText && (
                        <div className="p-3 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] space-y-1.5">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                            Live Bullet Points Preview:
                          </div>
                          <div className="space-y-1">
                            {formData.bulletPointsText
                              .split("\n")
                              .map((line) => line.replace(/^[•\-\*]\s*/, "").trim())
                              .filter(Boolean)
                              .map((line, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs font-semibold text-[var(--foreground)]">
                                  <span className="text-[var(--accent)] font-bold shrink-0">•</span>
                                  <span>{line}</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Server & Login info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                          Server / Region
                        </label>
                        <input
                          type="text"
                          value={formData.account?.server || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              account: { ...formData.account, server: e.target.value },
                            })
                          }
                          placeholder="e.g. India, Global, Mumbai"
                          className="w-full mt-1 p-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-bold focus:outline-none focus:border-[var(--accent)]"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                          Login / Binding Method
                        </label>
                        <input
                          type="text"
                          value={formData.account?.loginType || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              account: { ...formData.account, loginType: e.target.value },
                            })
                          }
                          placeholder="e.g. Supercell ID Clean / Single Twitter Link"
                          className="w-full mt-1 p-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-bold focus:outline-none focus:border-[var(--accent)]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 2: RENT SETTINGS ("HOW MUCH LATER AGAIN") ── */}
                {modalTab === "rent" && (
                  <div className="space-y-4">
                    {/* Enable Rent Toggle */}
                    <div className="p-3.5 rounded-2xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-between">
                      <div>
                        <div className="font-black text-xs uppercase tracking-tight flex items-center gap-1.5">
                          <Zap size={14} className="text-amber-400" />
                          <span>Enable Account Rental</span>
                        </div>
                        <div className="text-[10px] text-[var(--muted)]">
                          Allow users to rent this account for specific hours.
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.rent?.available || false}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            rent: { ...formData.rent, available: e.target.checked },
                          })
                        }
                        className="w-5 h-5 accent-amber-400 cursor-pointer"
                      />
                    </div>

                    {formData.rent?.available && (
                      <div className="space-y-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                              Rental Price (₹ INR)
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={formData.rent.price}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  rent: { ...formData.rent, price: e.target.value },
                                })
                              }
                              className="w-full mt-1 p-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] font-bold text-xs focus:outline-none focus:border-amber-400"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                              Duration (Hours)
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={formData.rent.durationHours}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  rent: { ...formData.rent, durationHours: e.target.value },
                                })
                              }
                              placeholder="24"
                              className="w-full mt-1 p-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] font-bold text-xs focus:outline-none focus:border-amber-400"
                            />
                          </div>
                        </div>

                        {/* Rented Status & Return Date */}
                        <div className="pt-2 border-t border-amber-500/20 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-bold text-xs text-amber-300">
                                Is this account currently on rent?
                              </div>
                              <div className="text-[10px] text-[var(--muted)]">
                                Toggle if account is currently lent out to a customer.
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={formData.rent?.isRented || false}
                              onChange={(e) => {
                                const isRented = e.target.checked;
                                const defaultReturn = isRented
                                  ? toLocalDatetimeString(
                                      new Date(
                                        Date.now() +
                                          (Number(formData.rent.durationHours) || 24) * 3600 * 1000
                                      )
                                    )
                                  : "";
                                setFormData({
                                  ...formData,
                                  rent: {
                                    ...formData.rent,
                                    isRented,
                                    availableAgainAt: defaultReturn,
                                  },
                                });
                              }}
                              className="w-5 h-5 accent-amber-400 cursor-pointer"
                            />
                          </div>

                          {formData.rent?.isRented && (
                            <div className="p-3 rounded-xl bg-[var(--background)] border border-amber-500/30 space-y-3">
                              <label className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                                When will it be available for rent again?
                              </label>

                              {/* Quick Presets */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {[
                                  { label: "+12h", hours: 12 },
                                  { label: "+24h (1 Day)", hours: 24 },
                                  { label: "+48h (2 Days)", hours: 48 },
                                  { label: "+72h (3 Days)", hours: 72 },
                                ].map((p) => (
                                  <button
                                    key={p.hours}
                                    type="button"
                                    onClick={() => {
                                      const target = new Date(Date.now() + p.hours * 3600 * 1000);
                                      setFormData({
                                        ...formData,
                                        rent: {
                                          ...formData.rent,
                                          availableAgainAt: toLocalDatetimeString(target),
                                        },
                                      });
                                    }}
                                    className="px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-amber-400 hover:text-black text-[10px] font-bold transition-all"
                                  >
                                    {p.label}
                                  </button>
                                ))}
                              </div>

                              <input
                                type="datetime-local"
                                value={formData.rent?.availableAgainAt || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    rent: { ...formData.rent, availableAgainAt: e.target.value },
                                  })
                                }
                                className="w-full p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] font-bold text-xs focus:outline-none focus:border-amber-400"
                              />

                              {formData.rent?.availableAgainAt && (
                                <div className="text-[11px] font-black text-amber-400">
                                  Countdown:{" "}
                                  {formatRemainingTime(formData.rent.availableAgainAt)?.text || "Set"}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Rental Conditions */}
                        <div className="space-y-1.5 pt-2 border-t border-amber-500/20">
                          <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                            Rental Conditions (one per line)
                          </label>
                          <textarea
                            rows={3}
                            value={(formData.rent?.conditions || []).join("\n")}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                rent: {
                                  ...formData.rent,
                                  conditions: e.target.value.split("\n").filter(Boolean),
                                },
                              })
                            }
                            placeholder="No email / Moonton rebind&#10;Login only, no changes allowed"
                            className="w-full p-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
                    )}

                    {/* Account Screenshots / Images */}
                    <div className="space-y-3 p-3.5 rounded-2xl bg-[var(--background)] border border-[var(--border)]">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-[var(--foreground)] flex items-center gap-1.5">
                          <ImageIcon size={13} className="text-[var(--accent)]" />
                          <span>Account Images</span>
                        </label>
                        <span className="text-[10px] text-[var(--muted)]">First image is cover</span>
                      </div>

                      {/* Simplified Add by URL or File */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex flex-1 gap-1.5">
                          <input
                            type="url"
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const trimmed = newImageUrl.trim();
                                if (!trimmed) return;
                                setFormData({
                                  ...formData,
                                  media: {
                                    ...formData.media,
                                    images: [...(formData.media?.images || []), trimmed],
                                  },
                                });
                                setNewImageUrl("");
                              }
                            }}
                            placeholder="Paste image URL..."
                            className="flex-1 px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs focus:outline-none focus:border-[var(--accent)]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const trimmed = newImageUrl.trim();
                              if (!trimmed) return;
                              setFormData({
                                ...formData,
                                media: {
                                  ...formData.media,
                                  images: [...(formData.media?.images || []), trimmed],
                                },
                              });
                              setNewImageUrl("");
                            }}
                            className="px-3 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:opacity-90 transition-opacity shrink-0 flex items-center gap-1 cursor-pointer"
                          >
                            <Plus size={13} />
                            <span>Add</span>
                          </button>
                        </div>

                        <label className="px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)]/50 text-xs font-bold text-[var(--foreground)] cursor-pointer flex items-center justify-center gap-1.5 shrink-0 transition-colors">
                          <Upload size={13} className="text-[var(--accent)]" />
                          <span>Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              if (files.length === 0) return;
                              Promise.all(
                                files.map(
                                  (file) =>
                                    new Promise((resolve) => {
                                      const reader = new FileReader();
                                      reader.onload = () => resolve(String(reader.result || ""));
                                      reader.onerror = () => resolve("");
                                      reader.readAsDataURL(file);
                                    })
                                )
                              ).then((dataUrls) => {
                                const valid = dataUrls.filter(Boolean);
                                if (valid.length === 0) return;
                                setFormData((prev) => ({
                                  ...prev,
                                  media: {
                                    ...prev.media,
                                    images: [...(prev.media?.images || []), ...valid],
                                  },
                                }));
                              });
                              e.target.value = "";
                            }}
                          />
                        </label>
                      </div>

                      {/* Preview thumbnails with 1-click remove */}
                      {formData.media?.images?.length > 0 && (
                        <div className="flex items-center gap-2.5 overflow-x-auto p-2 bg-[var(--card)] rounded-xl border border-[var(--border)]">
                          {formData.media.images.map((img, idx) => (
                            <div
                              key={idx}
                              className="relative w-16 h-16 rounded-lg overflow-hidden bg-black/40 border border-[var(--border)] shrink-0 group"
                            >
                              <img src={img} alt="preview" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData({
                                    ...formData,
                                    media: {
                                      ...formData.media,
                                      images: formData.media.images.filter((_, i) => i !== idx),
                                    },
                                  })
                                }
                                className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/80 text-white flex items-center justify-center hover:bg-red-500 transition-colors cursor-pointer"
                                title="Remove image"
                              >
                                <X size={10} />
                              </button>
                              <span className="absolute bottom-0 left-0 right-0 px-1 py-0.5 text-[8px] text-center bg-black/75 text-white font-bold">
                                {idx === 0 ? "Cover" : `#${idx + 1}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Additional Details & Highlights */}
                    <div className="space-y-3 p-3.5 rounded-2xl bg-[var(--background)] border border-[var(--border)]">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                          Tags / Badges (comma separated)
                        </label>
                        <input
                          type="text"
                          value={(formData.tags || []).join(", ")}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                            })
                          }
                          placeholder="e.g. TH16 Max, 6 Builders, Glacier Max, Clean Link"
                          className="w-full mt-1 p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs font-bold focus:outline-none focus:border-[var(--accent)]"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                          Additional Notes / Description (Optional)
                        </label>
                        <textarea
                          rows={3}
                          value={formData.details || ""}
                          onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                          placeholder="Extra information for the buyer or renter..."
                          className="w-full mt-1 p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs focus:outline-none focus:border-[var(--accent)]"
                        />
                      </div>

                      {/* Dealer / Owner Contact */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[var(--border)]">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                            Dealer / Owner Name
                          </label>
                          <input
                            type="text"
                            value={formData.dealer?.owner || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                dealer: { ...formData.dealer, owner: e.target.value },
                              })
                            }
                            placeholder="e.g. TK"
                            className="w-full mt-1 p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                            Support WhatsApp
                          </label>
                          <input
                            type="text"
                            value={formData.dealer?.contact?.whatsapp || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                dealer: {
                                  ...formData.dealer,
                                  contact: { ...formData.dealer.contact, whatsapp: e.target.value },
                                },
                              })
                            }
                            placeholder="918118090547"
                            className="w-full mt-1 p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
                    <Info size={12} />
                    <span>All changes update store & public API immediately</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-bold hover:bg-[var(--foreground)]/5 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
                    >
                      {saving && <RefreshCw size={13} className="animate-spin" />}
                      <span>{editingItem ? "Save Changes" : "Create Account Listing"}</span>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
