"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/axios";
import { FiUser, FiMail, FiPhone, FiShield, FiSave, FiEdit2, FiCheckCircle, FiClock, FiArrowRight, FiAward, FiCalendar, FiCopy, FiCheck } from "react-icons/fi";
import { LoadingSpinner } from "@/components/common";
import { formatDate } from "@/utils";
import Link from "next/link";
import Image from "next/image";

export default function MyProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState(user?.phone || "");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const handleUpdatePhone = async () => {
    if (!phoneInput) {
      alert("Phone number cannot be empty");
      return;
    }
    
    setLoading(true);
    try {
      const { data } = await api.post("/api/user/update-phone", { phone: phoneInput });
      if (data.success) {
        updateUser({ phone: data.phone });
        setIsEditingPhone(false);
        alert("Phone number updated successfully!");
      } else {
        alert(data.message || "Failed to update phone number");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyId = () => {
    if (!user?.userId) return;
    navigator.clipboard.writeText(user.userId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64 text-[var(--muted)]">
        <LoadingSpinner size="lg" color="accent" />
      </div>
    );
  }

  const isLifetime = user.userType === "owner" || user.userType === "user";
  const displayExpiry = isLifetime ? "Lifetime" : (user.membershipExpiry ? formatDate(user.membershipExpiry) : "Lifetime");
  const displayRole = user.userType === "user" ? "Normal User" : user.userType === "admin" ? "Reseller" : user.userType;
  const memberSince = user.createdAt ? formatDate(user.createdAt, { style: "medium" }) : "Member";

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-20 px-2 sm:px-4 pt-1">
      
      {/* ── SIMPLE PROFILE HEADER (NO CARD) ── */}
      <div className="flex flex-col gap-3">
        {/* Top row: Avatar left, Name and ID right */}
        <div className="flex items-center gap-3.5 sm:gap-4">
          {/* Avatar on left */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border border-[var(--border)] bg-[var(--card)] flex items-center justify-center text-[var(--accent)] text-2xl font-black shrink-0 overflow-hidden shadow-xs">
            {user.avatar ? (
              <Image src={user.avatar} alt={user.name} fill unoptimized className="object-cover" />
            ) : (
              user.name?.charAt(0)?.toUpperCase() || <FiUser />
            )}
          </div>

          {/* Name & ID on right */}
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-black text-[var(--foreground)] tracking-tight break-words leading-tight">
              {user.name || "User"}
            </h2>
            {user.userId && (
              <button
                onClick={handleCopyId}
                className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-lg text-[9.5px] font-mono text-[var(--muted)] hover:text-[var(--foreground)] bg-[var(--card)] border border-[var(--border)] transition-colors cursor-pointer"
                title="Click to copy User ID"
              >
                <span>{user.userId}</span>
                {copiedId ? <FiCheck size={10} className="text-emerald-500" /> : <FiCopy size={9} />}
              </button>
            )}
          </div>
        </div>

        {/* Compact stats row below (low height) */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400 text-[8.5px] font-black uppercase tracking-wider">
            <FiShield size={11} />
            {displayRole}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 text-[8.5px] font-black uppercase tracking-wider">
            <FiCalendar size={11} />
            Since {memberSince}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-500 dark:text-purple-400 text-[8.5px] font-black uppercase tracking-wider">
            <FiClock size={11} />
            Expiry: {displayExpiry}
          </span>
        </div>
      </div>

      {/* ── ACCOUNT DETAILS ── */}
      <div className="space-y-2 pt-1">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]/60 flex items-center gap-2 px-1">
          <FiUser size={13} /> Account Details
        </h3>

        <div className="space-y-2">
          {/* EMAIL */}
          <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] shrink-0">
                <FiMail size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black text-[var(--muted)] uppercase tracking-wider mb-0.5">Email Address</p>
                <p className="text-xs sm:text-sm font-bold text-[var(--foreground)] truncate">{user.email || "Not provided"}</p>
              </div>
            </div>
            {user.email && <FiCheckCircle className="text-emerald-500 shrink-0" size={18} />}
          </div>

          {/* PHONE */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xs">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] shrink-0">
                <FiPhone size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-black text-[var(--muted)] uppercase tracking-wider mb-0.5">Phone Number</p>
                
                {isEditingPhone ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="Enter phone number"
                      className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-1.5 text-xs font-bold text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                    />
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm font-bold text-[var(--foreground)] truncate">{user.phone || "Not set"}</p>
                )}
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2 pl-[3rem] sm:pl-0">
              {isEditingPhone ? (
                <>
                  <button 
                    onClick={handleUpdatePhone}
                    disabled={loading}
                    className="px-3 py-1.5 bg-[var(--accent)] text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {loading ? <LoadingSpinner size="xs" color="white" /> : <FiSave size={11} />}
                    Save
                  </button>
                  <button 
                    onClick={() => {
                      setIsEditingPhone(false);
                      setPhoneInput(user.phone || "");
                    }}
                    className="px-3 py-1.5 bg-[var(--background)] border border-[var(--border)] text-[var(--muted)] text-[10px] font-bold uppercase tracking-wider rounded-xl hover:text-[var(--foreground)] transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsEditingPhone(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-[var(--background)] border border-[var(--border)] text-[var(--accent)] text-[10px] font-black uppercase tracking-wider hover:border-[var(--accent)] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <FiEdit2 size={11} /> {user.phone ? "Edit" : "Add"}
                </button>
              )}
            </div>
          </div>

          {/* MEMBER SINCE ROW */}
          <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] shrink-0">
                <FiCalendar size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black text-[var(--muted)] uppercase tracking-wider mb-0.5">Member Since</p>
                <p className="text-xs sm:text-sm font-bold text-[var(--foreground)] truncate">
                  {user.createdAt ? formatDate(user.createdAt, { style: "long" }) : "Active Member"}
                </p>
              </div>
            </div>
            <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
              Verified
            </span>
          </div>
        </div>
      </div>

      {/* UPGRADE PROMPT FOR NORMAL USERS */}
      {user.userType === "user" && (
        <div className="relative overflow-hidden bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm group hover:border-[var(--accent)]/50 transition-colors">
          {/* Subtle ambient glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/5 blur-[60px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left relative z-10 w-full sm:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-[var(--background)] border border-[var(--border)] text-[var(--accent)] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500">
              <FiAward size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-[1000] text-[var(--foreground)] uppercase tracking-widest mb-1.5">Upgrade to Member</h3>
              <p className="text-xs sm:text-sm font-bold text-[var(--muted)] max-w-sm leading-relaxed">
                Unlock exclusive tier discounts, reseller privileges, and premium priority support.
              </p>
            </div>
          </div>

          <Link 
            href="/games/membership/silver-membership" 
            className="w-full sm:w-auto shrink-0 px-6 py-4 bg-[var(--foreground)] text-[var(--background)] font-[1000] uppercase tracking-[0.2em] text-[10px] rounded-xl hover:bg-[var(--accent)] hover:text-white transition-all flex items-center justify-center gap-2 relative z-10 shadow-md hover:shadow-lg"
          >
            View Memberships <FiArrowRight size={14} />
          </Link>
        </div>
      )}

    </div>
  );
}
