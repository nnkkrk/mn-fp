"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import {
  FiInstagram,
  FiTwitter,
  FiLinkedin,
  FiChevronUp,
  FiShield,
  FiExternalLink,
  FiHome,
  FiShoppingBag,
  FiServer,
  FiGlobe,
  FiBookOpen,
  FiUsers,
  FiInfo,
  FiLock,
  FiFileText,
  FiHeadphones,
  FiRotateCcw,
} from "react-icons/fi";

const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME || "mlbbtopup.in";
const SITE_DOMAIN = "mlbbtopup.in";
const PARENT_DOMAIN = "bluebuff.in";
const PARENT_URL = "https://bluebuff.in";
const TRUSTPILOT_URL = "https://www.trustpilot.com/evaluate/mlbbtopup.in";
const INSTAGRAM_URL = "https://instagram.com/mlbbtopup.in";
const TWITTER_URL = "https://x.com/tk_dev_";
const LINKEDIN_URL = "https://www.linkedin.com/company/bluebuffesports";

const FOOTER_LINKS = [
  {
    title: "Pages",
    links: [
      { label: "Home", href: "/", icon: FiHome },
      { label: "Store", href: "/games", icon: FiShoppingBag },
      { label: "Services", href: "/services", icon: FiServer },
      { label: "Region", href: "/region", icon: FiGlobe },
      { label: "Blog", href: "/blog", icon: FiBookOpen },
      { label: "Partner With Us", href: "/partner", icon: FiUsers },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "About Us", href: "/about", icon: FiInfo },
      { label: "Privacy", href: "/privacy-policy", icon: FiLock },
      { label: "Terms", href: "/terms-and-conditions", icon: FiFileText },
      { label: "Support", href: "/contact", icon: FiHeadphones },
      { label: "Refunds", href: "/refund-policy", icon: FiRotateCcw },
    ],
  },
];

const SOCIALS = [
  { label: "Instagram", href: INSTAGRAM_URL, icon: FiInstagram },
  { label: "Twitter", href: TWITTER_URL, icon: FiTwitter },
  { label: "LinkedIn", href: LINKEDIN_URL, icon: FiLinkedin },
];

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/owner-panal")) {
    return null;
  }

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="relative mt-4 bg-[var(--background)] border-t border-[var(--border)] pt-5 pb-3 overflow-hidden">
      {/* Subtle Ambient Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)]/20 to-transparent" />

      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-5">

          {/* BRAND BLOCK - COMPACT */}
          <div className="md:col-span-4 space-y-2.5">
            <div>
              <Link href="/" className="group inline-flex items-center gap-2.5">
                <div className="relative w-8 h-8 md:w-9 md:h-9 shrink-0 flex items-center justify-center transition-transform group-hover:scale-105">
                  <Image
                    src="/logoBB.png"
                    alt="mlbbtopup.in logo"
                    width={36}
                    height={36}
                    className="w-full h-full object-contain logo-light-theme"
                  />
                  <Image
                    src="/logoBB-dark.png"
                    alt="mlbbtopup.in logo"
                    width={36}
                    height={36}
                    className="w-full h-full object-contain logo-dark-theme"
                  />
                </div>
                <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter lowercase leading-none text-[var(--foreground)] transition-colors">
                  {SITE_DOMAIN}
                </h2>
              </Link>
              <div className="mt-1 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-[8px] font-black uppercase tracking-widest w-fit">
                <span>A Product From</span>
                <a href={PARENT_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--accent-hover)] font-black">
                  {PARENT_DOMAIN}
                </a>
              </div>
              <p className="mt-2 text-[9.5px] font-semibold opacity-70 leading-relaxed max-w-[280px]">
                India's #1 trusted platform for Mobile Legends top-ups. Instant delivery, secure payments & 24/7 support.
              </p>
            </div>

            {/* Trustpilot Card - Compact */}
            <a
              href={TRUSTPILOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)]/40 transition-all group"
            >
              <div className="bg-white p-0.5 rounded-md shrink-0">
                <QRCodeCanvas
                  value={TRUSTPILOT_URL}
                  size={26}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="Q"
                />
              </div>
              <div>
                <div className="flex items-center gap-0.5 text-[var(--accent)] mb-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <FiShield key={i} size={7.5} fill="currentColor" />
                  ))}
                </div>
                <p className="text-[7.5px] font-black uppercase tracking-wider text-[var(--muted)]">
                  VERIFIED BY TRUSTPILOT <FiExternalLink className="inline mb-0.5 opacity-40" size={7.5} />
                </p>
              </div>
            </a>
          </div>

          {/* LINKS GRID - SIMPLE & CLEAN */}
          <div className="md:col-span-5 grid grid-cols-2 gap-4">
            {FOOTER_LINKS.map((section) => (
              <div key={section.title} className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-[2px] bg-[var(--muted)]/60 rounded-full" />
                  <h3 className="text-xs font-semibold tracking-wider text-[var(--foreground)] uppercase">
                    {section.title}
                  </h3>
                </div>
                <ul className="space-y-1.5">
                  {section.links.map((link) => {
                    const Icon = link.icon;
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all flex items-center gap-1.5 group"
                        >
                          {Icon && <Icon size={12} className="opacity-60 group-hover:opacity-100 group-hover:text-[var(--accent)] transition-colors shrink-0" />}
                          <span>{link.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          {/* CONNECT & ACTION BLOCK - SIMPLE & CLEAN */}
          <div className="md:col-span-3 flex flex-row md:flex-col justify-between items-end md:justify-start md:items-end gap-3 md:gap-4">
            <div className="space-y-2 md:text-right">
              <h3 className="text-xs font-semibold tracking-wider text-[var(--foreground)] uppercase">
                Connect
              </h3>
              <div className="flex items-center justify-start md:justify-end gap-1.5">
                {SOCIALS.map(({ label, href, icon: Icon }) => (
                  <motion.a
                    key={label}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-8 h-8 rounded-lg bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--muted)]/40 transition-colors"
                  >
                    <Icon size={14} />
                  </motion.a>
                ))}
              </div>
            </div>

            <button aria-label="button"
              onClick={scrollToTop}
              className="mt-auto group flex items-center gap-2 text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-all cursor-pointer"
            >
              Back to Top
              <div className="w-7 h-7 rounded-lg bg-[var(--card)] border border-[var(--border)] flex items-center justify-center group-hover:border-[var(--border)] group-hover:bg-[var(--card)] group-hover:text-[var(--foreground)] transition-all">
                <FiChevronUp size={14} />
              </div>
            </button>
          </div>
        </div>

        {/* BOTTOM STRIP - COMPACT */}
        <div className="pt-3 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-2 opacity-80">
          <div className="flex items-center gap-2 group/india cursor-default">
            <div className="flex gap-0.5">
              <div className="w-1 h-2.5 bg-[#FF9933] rounded-full" />
              <div className="w-1 h-2.5 bg-white rounded-full" />
              <div className="w-1 h-2.5 bg-[#138808] rounded-full" />
            </div>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-[var(--foreground)]">
              MADE IN <span className="text-[#92400e] dark:text-[#fdba74]">IND</span><span className="text-[var(--foreground)]">I</span><span className="text-[#166534] dark:text-[#86efac]">A</span> 🇮🇳
            </span>
          </div>

          <div className="text-center md:text-right opacity-75">
            <span className="text-[9px] font-semibold uppercase tracking-wider text-[var(--muted)]">
              © {new Date().getFullYear()} {PARENT_DOMAIN.toUpperCase()} • ALL RIGHTS RESERVED
            </span>
          </div>
        </div>

        {/* 3RD PARTY SERVICE LEGAL DISCLAIMER */}
        <div className="mt-2 pt-2 border-t border-[var(--border)]/20 text-center opacity-60">
          <p className="text-[9px] font-normal text-[var(--muted)] leading-relaxed max-w-4xl mx-auto">
            {SITE_DOMAIN} is an independent 3rd-party service operated by {PARENT_DOMAIN}. Mobile Legends: Bang Bang and Moonton are registered trademarks of Shanghai Moonton Technology Co., Ltd. We are not officially affiliated with or endorsed by Moonton Games.
          </p>
        </div>
      </div>
    </footer>
  );
}
