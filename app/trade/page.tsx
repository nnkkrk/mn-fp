"use client";

import { Icons } from "@/components/icons";
import { SectionTitle } from "@/components/common";
import AAdsBanner from "@/components/Ads/AAdsBanner";

const SECTIONS = [
  {
    title: "I am a Buyer",
    desc: "Browse and buy premium game IDs with ease. Verified accounts with full security.",
    icon: <Icons.shoppingBag className="w-8 h-8" />,
    color: "from-blue-500/20 to-blue-600/5",
    accent: "text-blue-400",
    helpText: "Hi, I am interested in buying a game ID. Please show me available IDs.",
  },
  {
    title: "I am a Seller",
    desc: "Sell your game ID at the best market price. Instant payment and secure handover.",
    icon: <Icons.rupee className="w-8 h-8" />,
    color: "from-green-500/20 to-green-600/5",
    accent: "text-green-400",
    helpText: "Hi, I want to sell my game ID. Please guide me through the process.",
  },
  {
    title: "Take Rent",
    desc: "Rent premium IDs starting @ ₹15. Low rates and instant access to top skins.",
    icon: <Icons.clock className="w-8 h-8" />,
    color: "from-purple-500/20 to-purple-600/5",
    accent: "text-purple-400",
    helpText: "Hi, I am looking to rent a game ID. What are the rates and available IDs?",
  },
  {
    title: "Give Rent",
    desc: "Earn passive income by putting your game ID on rent. We handle the security.",
    icon: <Icons.key className="w-8 h-8" />,
    color: "from-orange-500/20 to-orange-600/5",
    accent: "text-orange-400",
    helpText: "Hi, I want to put my game ID on rent. Please let me know how it works.",
  },
];

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP;

export default function TradeLandingPage() {
  const handleRedirect = (text: string) => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-4 md:p-8 lg:p-12 relative overflow-hidden flex items-start pt-8 md:pt-16 lg:pt-20">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--accent)]/10 blur-[120px] -z-10 rounded-full" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/10 blur-[100px] -z-10 rounded-full" />

      <div className="max-w-5xl mx-auto space-y-6 md:space-y-10 relative z-10 w-full">
        <div className="pb-2">
          <SectionTitle
            align="center"
            as="h1"
            subtitle="LIVE MARKETPLACE"
            title="ANY GAME ANY ID"
            highlight="ANY ID"
            description="Get premium IDs with the skins and heroes you want. Value for money transactions with absolute security."
            pulse
          />
        </div>

        {/* 2x2 GRID FOR ALL SCREENS */}
        <div className="grid grid-cols-2 gap-3 md:gap-5">
          {SECTIONS.map((section, idx) => (
            <button aria-label="button"
              key={idx}
              onClick={() => handleRedirect(section.helpText)}
              className={`group relative flex flex-col items-start p-4 md:p-7 rounded-xl md:rounded-3xl border border-[var(--foreground)]/5 bg-gradient-to-br ${section.color} hover:border-[var(--accent)]/30 transition-all duration-500 text-left overflow-hidden hover:scale-[1.01] active:scale-[0.98] shadow-lg md:shadow-xl`}
            >
              <div className={`mb-3 md:mb-5 p-2.5 md:p-4 rounded-xl md:rounded-2xl bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 ${section.accent} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-md relative overflow-hidden`}>
                <div className="absolute inset-0 bg-[var(--foreground)]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="scale-75 md:scale-90">{section.icon}</div>
              </div>
              
              <h3 className="text-sm md:text-2xl font-black mb-1 md:mb-2 group-hover:text-[var(--accent)] transition-colors italic uppercase tracking-tighter">
                {section.title}
              </h3>
              
              <p className="text-[8px] md:text-[11px] text-[var(--muted)] font-bold leading-relaxed mb-3 md:mb-6 opacity-60 group-hover:opacity-100 transition-opacity line-clamp-2 md:line-clamp-3">
                {section.desc}
              </p>
              
              <div className="mt-auto flex items-center gap-1 md:gap-2 text-[7px] md:text-[9px] font-black uppercase tracking-[0.2em] text-[var(--accent)] group-hover:gap-4 transition-all italic">
                Get Started <Icons.chevronRight className="text-[8px] md:text-xs" />
              </div>

              {/* Decorative elements */}
              <div className="absolute -bottom-6 -right-6 w-20 md:w-32 h-20 md:h-32 bg-[var(--foreground)]/5 blur-3xl rounded-full group-hover:bg-[var(--accent)]/10 transition-colors duration-700" />
              
              {/* Border shine effect */}
              <div className="absolute inset-0 border border-transparent group-hover:border-[var(--foreground)]/5 rounded-xl md:rounded-3xl transition-colors duration-500" />
            </button>
          ))}
        </div>

        <div className="pt-2 md:pt-4 flex flex-col items-center gap-4">
            <div className="flex items-center gap-4 text-[var(--muted)]/20">
                <div className="h-[1px] w-8 md:w-10 bg-current" />
                <p className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.4em] italic">
                    Blue Buff Core Marketplace
                </p>
                <div className="h-[1px] w-8 md:w-10 bg-current" />
            </div>

            <div className="w-full flex justify-center py-2 mb-10 md:mb-4">
              <AAdsBanner adId="2462703" />
            </div>
        </div>
      </div>
    </div>
  );
}
