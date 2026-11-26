"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Icons } from "@/components/icons";
import { FaWhatsapp } from "react-icons/fa";
import { LoadingSpinner, SlideToPayButton } from "@/components/common";

import AuthGuard from "@/components/AuthGuard";
import RecentVerifiedPlayers from "../../../../region/RecentVerifiedPlayers";
import { saveVerifiedPlayer } from "@/utils/storage/verifiedPlayerStorage";
import { BuyFlowSkeleton } from "@/components/Skeleton/BuyFlowSkeleton";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useBuyStore } from "@/store/useBuyStore";
import OrderDeliveryPushPrompt from "@/components/Order/OrderDeliveryPushPrompt";

function BuyFlowContent() {
  const { slug, itemSlug } = useParams();
  const params = useSearchParams();
  const router = useRouter();

  /* ================= STATE ================= */
  const [playerId, setPlayerId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [verifiedAccount, setVerifiedAccount] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showMorePacks, setShowMorePacks] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const { walletBalance, setWalletBalance, user, token } = useAuthStore();

  /* ================= GAME & ITEMS STATE ================= */
  const [game, setGame] = useState(null);
  const [item, setItem] = useState(null);
  const [otherItems, setOtherItems] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  /* ================= FALLBACK DISPLAY PARAMS ================= */
  const selectedBuyItem = useBuyStore((s) => s.selectedBuyItem);
  const storePreview = selectedBuyItem && selectedBuyItem.itemSlug === itemSlug ? selectedBuyItem : null;
  const fallbackName = storePreview?.name || params.get("name");
  const fallbackImage = storePreview?.image || params.get("image");

  /* ================= LOAD USER DATA & WALLET ================= */
  useEffect(() => {
    window.scrollTo(0, 0);
    if (user) {
      setUserEmail(user.email || "");
      setUserPhone(user.phone || "");
    }

    // Always fetch latest wallet balance if logged in
    if (token) {
      api.get("/api/auth/me")
        .then(({ data }) => {
          if (data?.success && typeof data?.user?.wallet === "number") {
            setWalletBalance(data.user.wallet);
          }
        })
        .catch(() => {});
    }
  }, [user, token, setWalletBalance]);

  /* ================= FETCH GAME & ITEMS ================= */
  useEffect(() => {
    if (!slug || !itemSlug) return;

    setIsFetching(true);
    api.get(`/api/games/${slug}`)
      .then((res) => res.data)
      .then((data) => {
        const gameData = data?.data;
        if (!gameData) {
          setIsFetching(false);
          return;
        }

        const foundItem = gameData.itemId.find(
          (i) => i.itemSlug === itemSlug
        );

        if (!foundItem) {
          setError("This item was not found.");
          setIsFetching(false);
          return;
        }

        setGame(gameData);
        setItem(foundItem);
        setOtherItems(gameData.itemId);
        setIsFetching(false);
      })
      .catch(() => setIsFetching(false));
  }, [slug, itemSlug]);

  /* ================= LABELS & OPTIONS ================= */
  const fieldOneLabel = game?.inputFieldOne || "Player ID";
  const fieldTwoLabel = game?.inputFieldTwo || "Zone ID";

  const gameWithOptions = useMemo(() => {
    if (!game) return null;
    return {
      ...game,
      inputFieldTwoOptions: game?.inputFieldTwoOptions?.length > 0
        ? game.inputFieldTwoOptions
        : (slug?.includes("genshin-impact")
          ? [
            { label: "America", value: "america" },
            { label: "Asia", value: "asia" },
            { label: "Europe", value: "europe" },
            { label: "TW_HK_MO", value: "tw_hk_mo" },
          ]
          : slug?.includes("wuthering-of-waves")
            ? [
              { label: "America", value: "america" },
              { label: "Asia", value: "asia" },
              { label: "Europe", value: "europe" },
              { label: "SEA", value: "sea" },
            ]
            : [])
    };
  }, [game, slug]);

  /* ================= VALIDATION LOGIC ================= */
  const handleValidate = async () => {
    setError("");
    if (!playerId || (gameWithOptions?.inputFieldTwo && !zoneId)) {
      setError(`Please enter your ${fieldOneLabel}${gameWithOptions?.inputFieldTwo ? ` and ${fieldTwoLabel}` : ""}`);
      return;
    }

    setLoading(true);

    const name = game?.gameName?.toLowerCase() || "";
    const isMLBB = slug.includes("mlbb") || name.includes("mlbb") || slug.includes("legends988") || slug.includes("weeklymonthly-bundle");

    if (game?.isValidationRequired === false && !isMLBB) {
      setVerifiedAccount({
        userName: game?.gameName || "Player",
        region: "Global",
        playerId,
        zoneId,
      });
      setLoading(false);
      return;
    }

    try {
      const baseGameId = game?.gameId || slug;
      const productId = `${baseGameId}_${item?.itemId || itemSlug}`;

      const { data: nameData } = await api.post("/api/check-region/namecheck", {
        productId,
        playerId,
        zoneId: zoneId || "NA",
      });

      if (
        (nameData?.success === 200 || nameData?.success === true) &&
        (nameData?.data?.username || nameData?.data?.name) &&
        nameData?.data?.valid !== false
      ) {
        const username = nameData?.data?.username || nameData?.data?.name || "Unknown";
        const region = nameData?.data?.region || "Global";

        if (isMLBB) {
          const restrictedRegions = ["INDO", "ID", "PH", "SG", "RU", "MY", "MM"];
          if (restrictedRegions.includes(region.toUpperCase())) {
            setError(`Sorry, we don't support orders from ${region} region for this item.`);
            setLoading(false);
            return;
          }
        }

        saveVerifiedPlayer({ playerId, zoneId, username, region, savedAt: Date.now() });
        setVerifiedAccount({ userName: username, region, playerId, zoneId });
        setLoading(false);
      } else {
        const serverMsg = nameData?.message || "Player not found";
        setError(serverMsg.toLowerCase().includes("success") ? "Player ID not found." : serverMsg);
        setLoading(false);
      }
    } catch (err) {
      console.error("Validation Error:", err);
      setError("Validation failed. Please try again.");
      setLoading(false);
    }
  };

  /* ================= PAYMENT LOGIC ================= */
  const handleProceed = async () => {
    if (!verifiedAccount) {
      setError("Please verify your account first.");
      return;
    }
    if (!paymentMethod) {
      setError("Please select a payment method.");
      return;
    }

    setIsProcessing(true);

    try {
      const orderPayload = {
        gameSlug: slug,
        itemSlug,
        itemName: item?.itemName || fallbackName,
        playerId: verifiedAccount.playerId,
        playerName: verifiedAccount.userName || "Unknown",
        zoneId: verifiedAccount.zoneId,
        paymentMethod,
        email: userEmail || null,
        phone: userPhone || localStorage.getItem("phone"),
        currency: "INR",
        platform: typeof window !== "undefined" && (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true) ? "pwa" : "web",
      };

      const { data } = await api.post("/api/order/create-gateway-order", orderPayload);

      if (!data.success) {
        setError(data.message || "Order creation failed.");
        setIsProcessing(false);
        return;
      }

      if (data.walletPayment) {
        setWalletBalance(data.newWalletBalance);
        localStorage.setItem("pending_topup_order", data.orderId);
        window.location.href = `/payment/topup-complete?orderId=${data.orderId}&wallet=true`;
        return;
      }

      localStorage.setItem("pending_topup_order", data.orderId);
      window.location.href = data.paymentUrl;
    } catch (err) {
      console.error("Order Error:", err);
      setError("Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  };

  if (isFetching) {
    return (
      <section className="min-h-screen bg-[var(--background)] pt-12">
        <BuyFlowSkeleton />
      </section>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
        <div className="max-w-md w-full bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20">
            <Icons.check className="text-4xl text-white" />
          </div>
          <h2 className="text-3xl font-[900] text-[var(--foreground)] mb-2 uppercase tracking-tight">Order Placed!</h2>
          <p className="text-[var(--muted)] mb-4 font-medium">Your request is being processed. We&apos;ll top up your account soon.</p>
          <OrderDeliveryPushPrompt userId={user?.userId} />
          <button aria-label="button" onClick={() => router.push("/")} className="w-full py-4 bg-[var(--accent)] text-black font-[900] uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_var(--accent)] transition-all">Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <section className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pt-4 pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">

          {/* BACK BUTTON */}
          <button aria-label="Back"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:opacity-80 transition-opacity mb-2 uppercase tracking-wider"
          >
            <Icons.arrowLeft className="text-xs" /> Back
          </button>

          {/* HERO PRODUCT INFO (FLAT & CLEAN, NO CARD CONTAINER) */}
          <div className="pb-5 mb-5 border-b border-[var(--border)]">
            <div className="flex items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="relative w-14 h-14 shrink-0 rounded-2xl bg-[var(--card)] p-2 flex items-center justify-center">
                  <img
                    src={item?.itemImageId?.image || fallbackImage || ""}
                    alt={item?.itemName || fallbackName}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Instant Delivery</span>
                  </div>
                  <h1 className="text-base sm:text-lg font-black text-[var(--foreground)] uppercase tracking-tight truncate">
                    {item?.itemName || fallbackName}
                  </h1>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <span className="text-2xl sm:text-3xl font-black text-[var(--accent)] tracking-tight">
                  ₹{item?.sellingPrice || 0}
                </span>
              </div>
            </div>

            {/* MORE PACKS (COLLAPSIBLE SECTION) */}
            {otherItems.length > 0 && (
              <div className="mt-4 pt-3 border-t border-[var(--border)]/40">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Icons.shoppingBag className="text-[var(--accent)] w-3.5 h-3.5 shrink-0" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">More packs you may like</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMorePacks(!showMorePacks)}
                    className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider hover:opacity-75"
                  >
                    {showMorePacks ? "Hide" : "Show"}
                  </button>
                </div>
                {showMorePacks && (
                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide no-scrollbar pb-1 animate-in fade-in">
                    {otherItems.map((oi) => {
                      const isActive = oi.itemSlug === itemSlug;
                      return (
                        <button
                          key={oi._id}
                          aria-label={oi.itemName}
                          onClick={() => router.push(`/games/${slug}/buy/${oi.itemSlug}`)}
                          className={`
                            py-2 px-3 rounded-xl shrink-0 transition-all flex items-center gap-2.5
                            ${isActive
                              ? "bg-[var(--accent)] text-white shadow-sm"
                              : "bg-[var(--card)] hover:bg-[var(--card)]/80 text-[var(--foreground)]"}
                          `}
                        >
                          <span className={`text-xs font-bold uppercase truncate max-w-[120px] ${isActive ? "text-white" : "text-[var(--foreground)]"}`}>
                            {oi.itemName}
                          </span>
                          <span className={`text-xs font-black ${isActive ? "text-white/95" : "text-[var(--accent)]"}`}>
                            ₹{oi.sellingPrice}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 1. PLAYER INFO (OPEN CLEAN SECTION) */}
          <div className="pb-6 mb-6 border-b border-[var(--border)]">
            <div className="flex items-center gap-2 mb-3.5">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              <h2 className="text-sm font-bold text-[var(--foreground)] tracking-tight">
                1. Player Info
              </h2>
            </div>

            <div className="space-y-2.5">
              <div className={`grid gap-2 ${gameWithOptions?.inputFieldTwo ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none">
                    <Icons.user className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder={fieldOneLabel}
                    value={playerId}
                    onChange={(e) => {
                      setPlayerId(e.target.value);
                      if (verifiedAccount) setVerifiedAccount(null);
                    }}
                    className="w-full bg-[var(--card)] border-none focus:ring-1.5 focus:ring-[var(--accent)]/30 rounded-xl py-2 pl-12 pr-3 font-semibold text-[var(--foreground)] outline-none transition-all placeholder:text-[var(--muted)] text-xs sm:text-sm h-10"
                  />
                </div>

                {gameWithOptions?.inputFieldTwo && (
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] z-10 pointer-events-none">
                      <Icons.globe className="w-4 h-4" />
                    </div>
                    {gameWithOptions?.inputFieldTwoOptions?.length > 0 ? (
                      <select
                        value={zoneId}
                        onChange={(e) => {
                          setZoneId(e.target.value);
                          if (verifiedAccount) setVerifiedAccount(null);
                        }}
                        className="w-full bg-[var(--card)] border-none focus:ring-1.5 focus:ring-[var(--accent)]/30 rounded-xl py-2 pl-12 pr-7 font-semibold text-[var(--foreground)] outline-none transition-all appearance-none cursor-pointer text-xs sm:text-sm h-10"
                      >
                        <option value="">{fieldTwoLabel}</option>
                        {gameWithOptions.inputFieldTwoOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder={fieldTwoLabel}
                        value={zoneId}
                        onChange={(e) => {
                          setZoneId(e.target.value);
                          if (verifiedAccount) setVerifiedAccount(null);
                        }}
                        className="w-full bg-[var(--card)] border-none focus:ring-1.5 focus:ring-[var(--accent)]/30 rounded-xl py-2 pl-12 pr-3 font-semibold text-[var(--foreground)] outline-none transition-all placeholder:text-[var(--muted)] text-xs sm:text-sm h-10"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* CHECK NAME BUTTON */}
              <button
                aria-label="Check Name"
                onClick={handleValidate}
                disabled={loading || !playerId}
                className="w-full h-10 bg-[var(--accent)] text-white font-bold tracking-wide text-xs uppercase rounded-xl shadow-sm hover:opacity-95 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <LoadingSpinner size="xs" color="current" />
                ) : (
                  <>
                    <Icons.search className="text-xs" />
                    <span>Check Name</span>
                  </>
                )}
              </button>

              {/* ERROR MESSAGE */}
              {error && (
                <div className="flex items-center gap-1.5 text-rose-500 text-xs font-semibold px-1">
                  <Icons.info className="text-xs shrink-0" /> <span>{error}</span>
                </div>
              )}

              {/* VERIFIED DISPLAY */}
              {verifiedAccount && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between animate-in fade-in">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-emerald-500 text-white rounded-full flex items-center justify-center">
                      <Icons.check className="text-xs stroke-[3]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider leading-none mb-0.5">Account Verified</p>
                      <p className="text-xs sm:text-sm font-bold text-[var(--foreground)] leading-tight">{verifiedAccount.userName}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* RECENT PLAYERS */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Icons.userCheck className="text-[var(--accent)] w-3.5 h-3.5 shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Recent Players</span>
                  </div>
                  <button
                    aria-label={showSuggestions ? "Hide recent players" : "Show recent players"}
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider hover:opacity-75"
                  >
                    {showSuggestions ? "Hide" : "Show"}
                  </button>
                </div>

                {showSuggestions && (
                  <div className="space-y-1.5 animate-in fade-in">
                    <RecentVerifiedPlayers
                      limit={3}
                      onSelect={(p) => {
                        setPlayerId(p.playerId);
                        setZoneId(p.zoneId);
                        setVerifiedAccount(null);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. PAYMENT (OPEN CLEAN SECTION) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              <h2 className="text-sm font-bold text-[var(--foreground)] tracking-tight">
                2. Payment
              </h2>
            </div>

            <div className="space-y-2.5">
              {/* UPI SELECTION TILE */}
              <div
                onClick={() => setPaymentMethod("upi")}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2.5
                  ${paymentMethod === "upi"
                    ? "bg-[var(--accent)]/[0.06] border-[var(--accent)] shadow-[0_6px_18px_-8px_rgba(var(--accent-rgb),0.32)]"
                    : "bg-[var(--card)]/70 border-[var(--border)]/70 hover:border-[var(--accent)]/40"}
                `}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-7 h-7 shrink-0"
                      aria-hidden="true"
                    >
                      <rect x="3" y="3" width="8" height="8" rx="2" fill="#2563eb" fillOpacity="0.18" stroke="#2563eb" strokeWidth="1.8" />
                      <rect x="5.5" y="5.5" width="3" height="3" rx="0.7" fill="#2563eb" />
                      <rect x="13" y="3" width="8" height="8" rx="2" fill="#38bdf8" fillOpacity="0.22" stroke="#0284c7" strokeWidth="1.8" />
                      <rect x="15.5" y="5.5" width="3" height="3" rx="0.7" fill="#0284c7" />
                      <rect x="3" y="13" width="8" height="8" rx="2" fill="#38bdf8" fillOpacity="0.22" stroke="#0284c7" strokeWidth="1.8" />
                      <rect x="5.5" y="15.5" width="3" height="3" rx="0.7" fill="#0284c7" />
                      <path d="M16.5 13L14 17H17L16.5 21L20 16.5H17L16.5 13Z" fill="#2563eb" />
                    </svg>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-[var(--foreground)] text-xs sm:text-sm">UPI Gateway</h4>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--accent)]/12 text-[var(--accent)]">
                          Instant
                        </span>
                      </div>
                      <p className="text-[10.5px] text-[var(--muted)] mt-0.5">PhonePe, Paytm, Other UPI Apps</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                    ${paymentMethod === "upi" ? "bg-[var(--accent)] border-[var(--accent)] text-white" : "border-[var(--border)]"}
                  `}>
                    {paymentMethod === "upi" && <Icons.check className="text-[10px] stroke-[3]" />}
                  </div>
                </div>

                {/* GPAY WARNING NOTICE */}
                <div className="flex items-start gap-2 px-2.5 py-2 rounded-lg bg-amber-500/[0.06] border border-amber-500/20 text-[10px] leading-snug font-medium text-amber-700 dark:text-amber-300/90">
                  <span className="shrink-0 text-amber-500">⚠️</span>
                  <span>
                    Avoid <strong className="font-bold">GPay</strong>. Pay via PhonePe, Paytm or other UPI apps.
                  </span>
                </div>
              </div>

              {/* WALLET SELECTION TILE */}
              <div
                onClick={() => setPaymentMethod("wallet")}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3
                  ${paymentMethod === "wallet"
                    ? "bg-[var(--accent)]/[0.06] border-[var(--accent)] shadow-[0_6px_18px_-8px_rgba(var(--accent-rgb),0.32)]"
                    : "bg-[var(--card)]/70 border-[var(--border)]/70 hover:border-[var(--accent)]/40"}
                `}
              >
                <div className="flex items-center gap-3">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-7 h-7 shrink-0"
                    aria-hidden="true"
                  >
                    <rect x="2.5" y="5.5" width="19" height="14" rx="3.5" fill="#10b981" fillOpacity="0.16" />
                    <path
                      d="M4.5 5.5H17.5C18.88 5.5 20 6.62 20 8V9.5H15.5C14.12 9.5 13 10.62 13 12C13 13.38 14.12 14.5 15.5 14.5H20V16C20 17.38 18.88 18.5 17.5 18.5H4.5C3.12 18.5 2 17.38 2 16V8C2 6.62 3.12 5.5 4.5 5.5Z"
                      fill="#059669"
                    />
                    <rect x="13.5" y="10" width="8" height="4" rx="2" fill="#34d399" />
                    <circle cx="16" cy="12" r="1" fill="#ffffff" />
                  </svg>
                  <div>
                    <h4 className="font-bold text-[var(--foreground)] text-xs sm:text-sm">My Wallet</h4>
                    <p className="text-[10.5px] text-[var(--muted)] mt-0.5">
                      Available Balance:{" "}
                      <strong className={walletBalance >= (item?.sellingPrice || 0) ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--foreground)]"}>
                        ₹{walletBalance || 0}
                      </strong>
                      {walletBalance < (item?.sellingPrice || 0) && (
                        <span className="text-amber-500 ml-1.5 font-medium">(Low Balance)</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                  ${paymentMethod === "wallet" ? "bg-[var(--accent)] border-[var(--accent)] text-white" : "border-[var(--border)]"}
                `}>
                  {paymentMethod === "wallet" && <Icons.check className="text-[10px] stroke-[3]" />}
                </div>
              </div>

              {/* TOTAL & CONFIRM BUTTON */}
              <div className="pt-2 space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-semibold text-[var(--muted)]">Total Amount</span>
                  <span className="text-2xl font-black text-[var(--foreground)] tracking-tight">₹{item?.sellingPrice || 0}</span>
                </div>

                <SlideToPayButton
                  onConfirm={handleProceed}
                  loading={isProcessing}
                  disabled={!verifiedAccount || (paymentMethod === "wallet" && walletBalance < (item?.sellingPrice || 0))}
                  label={`Slide to Pay · ₹${item?.sellingPrice || 0}`}
                  disabledLabel={
                    paymentMethod === "wallet" && walletBalance < (item?.sellingPrice || 0)
                      ? "Insufficient Wallet Balance"
                      : "Verify Player to Pay"
                  }
                />

                {!verifiedAccount && (
                  <p className="text-center text-[11px] font-medium text-[var(--muted)]">
                    Please verify your player account above to proceed
                  </p>
                )}

                {/* WHATSAPP RECHARGE ASSISTANCE BANNER (ONE LINE) */}
                <div className="pt-1.5">
                  <a
                    href={`https://wa.me/${process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || ""}?text=${encodeURIComponent(
                      `Hi, I am facing difficulty recharging ${item?.itemName ? `${item.itemName} (₹${item?.sellingPrice})` : "my order"}${verifiedAccount?.playerId ? ` for Player ID: ${verifiedAccount.playerId}` : ""}. Please help me with manual purchase.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/[0.06] hover:bg-emerald-500/[0.1] border border-emerald-500/20 text-[var(--foreground)]/80 transition-colors whitespace-nowrap"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3.5 h-3.5 shrink-0"
                      aria-hidden="true"
                    >
                      <path
                        d="M12 2C6.48 2 2 6.32 2 11.64C2 13.47 2.53 15.18 3.45 16.64L2.27 21.13L6.93 19.95C8.35 20.73 9.99 21.18 11.75 21.18H12C17.52 21.18 22 16.86 22 11.54C22 6.27 17.52 2 12 2Z"
                        fill="#25D366"
                      />
                      <path
                        d="M16.58 14.42C16.33 14.3 15.11 13.7 14.88 13.62C14.65 13.53 14.49 13.49 14.32 13.74C14.16 13.99 13.68 14.54 13.54 14.71C13.39 14.87 13.25 14.89 13 14.77C12.75 14.65 11.95 14.38 11 13.54C10.26 12.88 9.76 12.07 9.61 11.82C9.47 11.57 9.6 11.44 9.72 11.32C9.83 11.2 9.97 11.02 10.09 10.88C10.22 10.74 10.26 10.63 10.34 10.46C10.42 10.3 10.38 10.15 10.32 10.03C10.26 9.91 9.76 8.69 9.55 8.19C9.35 7.71 9.15 7.77 9 7.76H8.53C8.37 7.76 8.1 7.82 7.87 8.07C7.64 8.32 7 8.91 7 10.13C7 11.35 7.89 12.53 8.01 12.7C8.14 12.86 9.76 15.37 12.25 16.44C12.84 16.7 13.31 16.85 13.67 16.96C14.27 17.15 14.81 17.12 15.24 17.06C15.72 16.99 16.72 16.46 16.93 15.88C17.14 15.3 17.14 14.8 17.07 14.7C17.01 14.6 16.83 14.54 16.58 14.42Z"
                        fill="#ffffff"
                      />
                    </svg>
                    <span className="text-[10px] font-medium">
                      Need help?{" "}
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 underline">
                        Chat on WhatsApp
                      </span>
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .animate-in {
          animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </AuthGuard>
  );
}

export default function BuyFlowPage() {
  return (
    <Suspense fallback={
      <section className="min-h-screen bg-[var(--background)] pt-12">
        <BuyFlowSkeleton />
      </section>
    }>
      <BuyFlowContent />
    </Suspense>
  );
}
