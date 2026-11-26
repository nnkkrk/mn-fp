"use client";

import { useState, useEffect } from "react";
import { useGoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiShield,
  FiZap,
  FiActivity,
  FiCheckCircle,
  FiAlertCircle,
  FiLock,
  FiMail,
  FiShieldOff,
  FiPhone,
  FiArrowRight,
} from "react-icons/fi";
import { useSearchParams } from "next/navigation";
import api from "@/lib/axios";
import { Suspense, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { LoadingSpinner } from "@/components/common";
import { BuffyMascot, type BuffyMood } from "@/components/mascots";

const COUNTRY_CODES = [
  { label: "India (+91)", code: "+91", flag: "🇮🇳" },
  { label: "Indonesia (+62)", code: "+62", flag: "🇮🇩" },
  { label: "Philippines (+63)", code: "+63", flag: "🇵🇭" },
  { label: "Malaysia (+60)", code: "+60", flag: "🇲🇾" },
  { label: "Bangladesh (+880)", code: "+880", flag: "🇧🇩" },
  { label: "Nepal (+977)", code: "+977", flag: "🇳🇵" },
  { label: "Pakistan (+92)", code: "+92", flag: "🇵🇰" },
  { label: "USA / Canada (+1)", code: "+1", flag: "🇺🇸" },
  { label: "United Kingdom (+44)", code: "+44", flag: "🇬🇧" },
  { label: "UAE (+971)", code: "+971", flag: "🇦🇪" },
  { label: "Saudi Arabia (+966)", code: "+966", flag: "🇸🇦" },
  { label: "Singapore (+65)", code: "+65", flag: "🇸🇬" },
  { label: "Myanmar (+95)", code: "+95", flag: "🇲🇲" },
  { label: "Vietnam (+84)", code: "+84", flag: "🇻🇳" },
  { label: "Thailand (+66)", code: "+66", flag: "🇹🇭" },
  { label: "Brazil (+55)", code: "+55", flag: "🇧🇷" },
  { label: "Germany (+49)", code: "+49", flag: "🇩🇪" },
  { label: "France (+33)", code: "+33", flag: "🇫🇷" },
  { label: "Russia (+7)", code: "+7", flag: "🇷🇺" },
];

function AuthContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showOtpField, setShowOtpField] = useState(false);
  const [showPhonePrompt, setShowPhonePrompt] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pendingAuth, setPendingAuth] = useState<{ token: string; user: any } | null>(null);
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedData = value.slice(0, 6).split("");
      const newOtp = [...otp];
      pastedData.forEach((char, i) => {
        if (index + i < 6) newOtp[index + i] = char;
      });
      setOtp(newOtp);
      // Focus last filled or next input
      const nextIndex = Math.min(index + pastedData.length, 5);
      otpInputs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  const handleAuthSuccess = (data: any) => {
    if (!data?.user?.phone) {
      // Prompt for 10-digit phone number if missing
      setPendingAuth(data);
      setShowPhonePrompt(true);
      setError("");
      setSuccess("");
      setLoading(false);
    } else {
      saveSession(data);
    }
  };

  const handleGoogleLogin = async (credential: string) => {
    if (loading) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const { data } = await api.post("/api/auth/google", { token: credential, access_token: credential });
      if (!data.success) {
        setError(data.message || "Login failed. Please try again.");
        setLoading(false);
        return;
      }
      handleAuthSuccess(data);
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      if (tokenResponse?.access_token) {
        handleGoogleLogin(tokenResponse.access_token);
      }
    },
    onError: () => {
      setError("Google sign in was cancelled or failed");
      setLoading(false);
    },
  });

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      setError("Please enter your Gmail address");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/api/auth/otp/send", { email });
      if (data.success) {
        setSuccess("Check your Gmail for the code");
        setShowOtpField(true);
      } else {
        setError(data.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Could not send code. Try again.";
      setError(errorMessage);
    }
    setLoading(false);
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/api/auth/otp/verify", { email, otp: otp.join("") });
      if (data.success) {
        handleAuthSuccess(data);
      } else {
        setError(data.message);
        setLoading(false);
      }
    } catch {
      setError("Authentication failed");
      setLoading(false);
    }
  };

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^\d+]/g, "");
    if (!val.startsWith("+")) {
      val = "+" + val.replace(/\+/g, "");
    } else {
      val = "+" + val.slice(1).replace(/\+/g, "");
    }
    const newCode = val.slice(0, 5);
    setCountryCode(newCode);
    if (newCode === "+91" && phoneNumber.length > 10) {
      setPhoneNumber(phoneNumber.slice(0, 10));
    }
    if (error) setError("");
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maxLen = countryCode === "+91" ? 10 : 15;
    const val = e.target.value.replace(/\D/g, "").slice(0, maxLen);
    setPhoneNumber(val);
    if (error) setError("");
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingAuth) return;

    const cleanCode = countryCode.trim();
    if (!/^\+[0-9]{1,4}$/.test(cleanCode)) {
      setError("Please enter a valid country code (e.g. +91, +1, +44)");
      return;
    }

    const cleanDigits = phoneNumber.replace(/\D/g, "");
    if (cleanCode === "+91" && cleanDigits.length !== 10) {
      setError("India (+91) phone number must be exactly 10 digits");
      return;
    }

    if (cleanDigits.length < 6 || cleanDigits.length > 15) {
      setError("Please enter a valid phone number (6-15 digits)");
      return;
    }

    const fullPhone = `${cleanCode}${cleanDigits}`;

    setLoading(true);
    setError("");
    try {
      const { data } = await api.post(
        "/api/auth/update-phone",
        { phone: fullPhone },
        { headers: { Authorization: `Bearer ${pendingAuth.token}` } }
      );

      if (data.success) {
        const updatedData = {
          ...pendingAuth,
          user: {
            ...pendingAuth.user,
            phone: fullPhone,
          },
        };
        saveSession(updatedData);
      } else {
        setError(data.message || "Failed to update phone number");
        setLoading(false);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to update phone number";
      setError(msg);
      setLoading(false);
    }
  };

  const saveSession = async (data: any) => {
    useAuthStore.getState().login(data.token, data.user);
    setUserName(data.user.name);
    setSuccess("done");

    // Prompt for notification permission on login/register if not already denied
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission !== "denied"
    ) {
      try {
        const { subscribeToPush } = await import("@/lib/pushNotification");
        await subscribeToPush(data.user?.userId);
      } catch (err) {
        console.warn("Auth notification prompt non-blocking error:", err);
      }
    }

    setTimeout(() => window.location.replace(redirectPath), 1200);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  };

  const buffyMood: BuffyMood =
    success === "done"
      ? "happy"
      : error
      ? "error"
      : loading
      ? "loading"
      : showOtpField || showPhonePrompt
      ? "thinking"
      : "idle";

  return (
    <section suppressHydrationWarning className="relative min-h-screen flex flex-col items-center justify-center py-8 sm:py-16 px-4 overflow-hidden bg-[var(--background)]">
      {/* AMBIENT BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(var(--accent-rgb),0.15),transparent_70%)] opacity-40" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] opacity-20" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[390px] md:max-w-4xl md:bg-[var(--card)]/50 md:backdrop-blur-xl md:border md:border-[var(--border)]/60 md:rounded-3xl md:shadow-2xl md:p-6 lg:p-10"
      >
        <div className="w-full grid grid-cols-1 md:grid-cols-2 md:gap-8 lg:gap-12 items-center">
          {/* DESKTOP LEFT SIDE BRANDING (Hidden on Mobile) */}
          <div className="hidden md:flex flex-col items-center justify-center text-center p-6 lg:p-10 relative border-b md:border-b-0 md:border-r border-[var(--border)]/50">
            <motion.div
              variants={itemVariants}
              className="relative flex flex-col items-center justify-center py-2"
            >
              <div className="absolute inset-0 bg-[var(--accent)] blur-3xl opacity-20 rounded-full scale-125 pointer-events-none" />
              <BuffyMascot
                mood={buffyMood}
                className="relative z-10 w-36 h-36 lg:w-44 lg:h-44"
              >
                <Image
                  src="/logo.png"
                  alt="MLBB TOPUP Logo"
                  width={260}
                  height={260}
                  priority
                  className="w-auto h-11 lg:h-14 object-contain logo-light-theme"
                />
                <Image
                  src="/logo-dark.png"
                  alt="MLBB TOPUP Logo"
                  width={260}
                  height={260}
                  priority
                  className="w-auto h-11 lg:h-14 object-contain logo-dark-theme"
                />
              </BuffyMascot>
            </motion.div>
          </div>

          {/* RIGHT SIDE FORM (Mobile + Desktop) */}
          <div className="w-full relative">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="px-2 pb-2 sm:px-6 sm:pb-4 md:px-2 md:pb-2"
            >
              {/* HEADER */}
              <div className="flex flex-col items-center text-center mb-3 sm:mb-4">
                {/* Mobile Logo + Mascot */}
                <motion.div
                  variants={itemVariants}
                  className="relative -mt-4 sm:-mt-5 mb-2.5 sm:mb-3 md:hidden flex flex-col items-center"
                >
                  <div className="absolute inset-0 bg-[var(--accent)] blur-2xl opacity-10" />
                  <BuffyMascot
                    mood={buffyMood}
                    className="relative z-10 w-24 h-24 sm:w-28 sm:h-28"
                  >
                    <Image
                      src="/logo.png"
                      alt="Logo"
                      width={160}
                      height={160}
                      priority
                      className="w-auto h-9 sm:h-10 object-contain logo-light-theme"
                    />
                    <Image
                      src="/logo-dark.png"
                      alt="Logo"
                      width={160}
                      height={160}
                      priority
                      className="w-auto h-9 sm:h-10 object-contain logo-dark-theme"
                    />
                  </BuffyMascot>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-1">
                  <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-[var(--foreground)]">
                    {showPhonePrompt
                      ? "Add your phone"
                      : showOtpField
                      ? "Check your inbox"
                      : "Welcome back"}
                  </h1>
                  <p className="text-xs sm:text-[13px] font-normal text-[var(--muted)]">
                    {showPhonePrompt
                      ? "Enter your mobile number to continue"
                      : showOtpField
                      ? "Enter the 6-digit code sent to your email"
                      : "Sign in or create your account in seconds"}
                  </p>
                </motion.div>
              </div>

            <AnimatePresence mode="wait">
              {success && success !== "done" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 sm:mb-6 p-2.5 sm:p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center gap-2 text-center"
                >
                  <FiCheckCircle className="text-emerald-500 flex-shrink-0" size={14} />
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{success}</span>
                </motion.div>
              )}

              {success === "done" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-emerald-500 text-white flex items-center justify-center gap-2 text-center shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                >
                  <FiCheckCircle size={18} />
                  <span className="text-xs sm:text-sm font-black uppercase tracking-widest">You're In! Redirecting...</span>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 sm:mb-6 p-2.5 sm:p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center gap-2 text-center"
                >
                  <FiAlertCircle className="text-red-500 flex-shrink-0" size={14} />
                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ACTION AREA */}
            {success !== "done" && (
              <motion.div variants={containerVariants} className="space-y-3 sm:space-y-4">
                {showPhonePrompt ? (
                  /* PHONE NUMBER PROMPT FORM */
                  <motion.form
                    variants={itemVariants}
                    onSubmit={handlePhoneSubmit}
                    className="space-y-3 sm:space-y-4"
                  >
                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="flex gap-2">
                        {/* Country Code Picker & Editable Input */}
                        <div className="relative w-24 sm:w-28 flex-shrink-0 group">
                          <input
                            type="text"
                            value={countryCode}
                            onChange={handleCountryCodeChange}
                            placeholder="+91"
                            maxLength={5}
                            className="w-full h-11 bg-[var(--background)]/70 border border-[var(--border)] rounded-xl px-2 sm:px-3 text-center text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] transition-all placeholder:text-[var(--muted)]/50 placeholder:font-normal cursor-pointer"
                          />
                          <select
                            value={COUNTRY_CODES.some((c) => c.code === countryCode) ? countryCode : "custom"}
                            onChange={(e) => {
                              if (e.target.value !== "custom") {
                                setCountryCode(e.target.value);
                              }
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            title="Select Country"
                          >
                            {COUNTRY_CODES.map((c) => (
                              <option key={c.code} value={c.code} className="bg-[var(--card)] text-[var(--foreground)]">
                                {c.flag} {c.label}
                              </option>
                            ))}
                            <option value="custom" className="bg-[var(--card)] text-[var(--foreground)]">
                              ✏️ Custom Code
                            </option>
                          </select>
                        </div>

                        {/* Phone Number Input */}
                        <div className="relative flex-1 min-w-0 group">
                          <div className="absolute inset-y-0 left-3 flex items-center text-[var(--muted)] pointer-events-none group-focus-within:text-[var(--accent)] transition-colors">
                            <FiPhone size={15} />
                          </div>
                          <input
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={countryCode === "+91" ? 10 : 15}
                            placeholder={countryCode === "+91" ? "10-digit number" : "Mobile number"}
                            value={phoneNumber}
                            onChange={handlePhoneChange}
                            required
                            autoFocus
                            className="w-full h-11 bg-[var(--background)]/70 border border-[var(--border)] rounded-xl pl-8 sm:pl-9 pr-3 sm:pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] transition-all placeholder:text-[var(--muted)]/50 placeholder:font-normal"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center px-1 text-[10px] sm:text-[11px] text-[var(--muted)]/70 font-medium">
                        <span>Click code to change country</span>
                        <span>{countryCode === "+91" ? `${phoneNumber.length}/10 digits` : `${phoneNumber.length} digits`}</span>
                      </div>
                    </div>

                    <button
                      aria-label="button"
                      type="submit"
                      disabled={loading || (countryCode === "+91" ? phoneNumber.length !== 10 : phoneNumber.length < 6)}
                      className="w-full h-11 relative overflow-hidden group/btn bg-gradient-to-b from-[var(--accent)] to-blue-600 text-white font-semibold tracking-tight rounded-xl hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_6px_16px_-4px_rgba(var(--accent-rgb),0.45)] text-sm"
                    >
                      {loading ? (
                        <LoadingSpinner size="md" color="white" />
                      ) : (
                        <span className="relative z-10 flex items-center gap-2">
                          Continue <FiCheckCircle className="text-base sm:text-lg" />
                        </span>
                      )}
                    </button>
                  </motion.form>
                ) : (
                  <>

                {/* GMAIL OTP SECTION */}
                <motion.form
                  variants={itemVariants}
                  onSubmit={showOtpField ? handleOtpVerify : handleSendOtp}
                  className="space-y-4"
                >
                  <div className="space-y-4">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-4 flex items-center text-[var(--muted)] pointer-events-none group-focus-within:text-[var(--accent)] transition-colors">
                        <FiMail size={18} />
                      </div>
                      <input
                        type="email"
                        placeholder="yourname@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={showOtpField}
                        className={`w-full h-11 bg-[var(--background)]/70 border border-[var(--border)] rounded-xl pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] transition-all placeholder:text-[var(--muted)]/50 placeholder:font-normal shadow-[0_1px_2px_rgba(0,0,0,0.03)] ${showOtpField ? "opacity-50" : ""}`}
                      />
                      {showOtpField && (
                        <button aria-label="button"
                          type="button"
                          onClick={() => { setShowOtpField(false); setOtp(["", "", "", "", "", ""]); setSuccess(""); }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-[var(--accent)] hover:underline"
                        >
                          Change
                        </button>
                      )}
                    </div>

                    <AnimatePresence>
                      {showOtpField && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: -10 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -10 }}
                          className="overflow-hidden space-y-4"
                        >
                          <div className="grid grid-cols-6 gap-2">
                            {otp.map((digit, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                              >
                                <input
                                  ref={(el) => {
                                    otpInputs.current[idx] = el;
                                  }}
                                  type="text"
                                  maxLength={1}
                                  value={digit}
                                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                                  onKeyDown={(e) => handleKeyDown(idx, e)}
                                  required
                                  autoFocus={idx === 0}
                                  className="w-full aspect-square text-center bg-[var(--background)]/70 border border-[var(--border)] rounded-xl text-lg font-bold focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                                />
                              </motion.div>
                            ))}
                          </div>
                          <div className="flex justify-between items-center px-1">
                            <p className="text-[10px] text-[var(--muted)]/60 font-medium italic">Didn't get it?</p>
                            <button aria-label="button" type="button" onClick={() => handleSendOtp()} className="text-[10px] font-black uppercase text-[var(--accent)] hover:text-[var(--foreground)] transition-colors">Resend Code</button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                    <button aria-label="button"
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 relative overflow-hidden group/btn bg-gradient-to-b from-[var(--accent)] to-blue-600 text-white font-semibold tracking-tight rounded-xl hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_6px_16px_-4px_rgba(var(--accent-rgb),0.45)] text-sm"
                    >
                    {loading ? (
                      <LoadingSpinner size="md" color="white" />
                    ) : (
                      <>
                        <span className="relative z-10 flex items-center gap-2">
                          {showOtpField ? (
                            <>Verify & Login <FiCheckCircle className="text-lg" /></>
                          ) : (
                            <>Continue with Email <FiArrowRight className="text-base group-hover/btn:translate-x-0.5 transition-transform" /></>
                          )}
                        </span>
                      </>
                    )}
                  </button>
                </motion.form>

                {/* DIVIDER */}
                <div className="relative flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--border)] to-[var(--border)]" />
                  <span className="text-[11px] font-medium text-[var(--muted)]">or</span>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[var(--border)] to-[var(--border)]" />
                </div>

                {/* GOOGLE SECTION (Always Available) */}
                <motion.div variants={itemVariants} className="w-full">
                  <button
                    type="button"
                    onClick={() => {
                      if (!loading) {
                        setError("");
                        loginWithGoogle();
                      }
                    }}
                    disabled={loading}
                    className="w-full h-11 bg-[var(--background)]/80 hover:bg-[var(--foreground)]/[0.04] border border-[var(--border)] hover:border-[var(--foreground)]/20 rounded-xl flex items-center justify-center gap-2.5 text-sm font-semibold text-[var(--foreground)] transition-all active:scale-[0.99] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-sm group disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </motion.div>

                {/* TERMS & CONDITIONS */}
                <motion.div variants={itemVariants} className="pt-6 text-center">
                  <p className="text-[10px] text-[var(--muted)]/60 font-medium">
                    By logging in or registering, you agree to our <br className="sm:hidden" />
                    <Link href="/terms" className="text-[var(--foreground)] hover:text-[var(--accent)] transition-colors font-bold">Terms & Conditions</Link>
                    {" "}and{" "}
                    <Link href="/privacy" className="text-[var(--foreground)] hover:text-[var(--accent)] transition-colors font-bold">Privacy Policy</Link>
                  </p>
                </motion.div>
                </>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  </section>
);
}

export default function AuthPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <Suspense fallback={null}>
        <AuthContent />
      </Suspense>
    </GoogleOAuthProvider>
  );
}
