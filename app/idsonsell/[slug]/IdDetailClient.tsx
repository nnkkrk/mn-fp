"use client";

import { useState, useEffect } from "react";
import { IdDetailSkeleton } from "@/components/Skeleton/Skeleton";

export default function IdDetailClient({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Brief smooth skeleton shimmer on initial mount/navigation
    const timer = setTimeout(() => {
      setLoading(false);
    }, 280);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <IdDetailSkeleton />;
  }

  return <>{children}</>;
}
