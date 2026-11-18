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

  return (
    <motion.div
      key={pathname}
      initial={{
        opacity: 0,
        x: slideDir === 1 ? 36 : slideDir === -1 ? -36 : 0,
        y: slideDir === 0 ? 6 : 0,
      }}
      animate={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      transition={{
        duration: 0.26,
        ease: [0.22, 1, 0.36, 1], // Google Material FastOutSlowIn
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
