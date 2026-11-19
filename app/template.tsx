"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useRef, useEffect, useState } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);
  const [slideDir, setSlideDir] = useState(0);

  useEffect(() => {
    if (prevPathRef.current !== pathname && pathname) {
      if (pathname.startsWith("/idsonsell") && prevPathRef.current === "/") {
        // Switching to Trade / Marketplace -> slide in from right
        setSlideDir(1);
      } else if (pathname === "/" && prevPathRef.current?.startsWith("/idsonsell")) {
        // Switching back to Top Up -> slide in from left
        setSlideDir(-1);
      } else {
        setSlideDir(0);
      }
      prevPathRef.current = pathname;
    }
  }, [pathname]);

  if (pathname?.startsWith("/owner-panal")) {
    return <>{children}</>;
  }

  return (
    <motion.div
      key={pathname}
      initial={{
        opacity: 0,
        x: slideDir === 1 ? 20 : slideDir === -1 ? -20 : 0,
        y: slideDir === 0 ? 4 : 0,
      }}
      animate={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      transition={{
        duration: 0.22,
        ease: [0.16, 1, 0.3, 1], // Apple fluid easing: instant, snappy & smooth
      }}
      style={{ willChange: "transform, opacity" }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
