"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Dynamic import for the heavy overlay component
const Maintaince = dynamic(() => import("@/components/Seasonal/Maintaince"), {
    ssr: false, // Only load on client
});

export default function MaintenanceWrapper({ maintenanceMode }) {
    const pathname = usePathname();
    const [userType, setUserType] = useState(null);

    useEffect(() => {
        if (!maintenanceMode) return;
        // 1. Check localStorage for an immediate hint
        const cachedRole = localStorage.getItem("userType");
        if (cachedRole) setUserType(cachedRole);

        // 2. Verified check from API
        const token = localStorage.getItem("token");
        if (token) {
            fetch("/api/auth/me", {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.user?.userType) {
                        setUserType(data.user.userType);
                        localStorage.setItem("userType", data.user.userType);
                    }
                })
                .catch(err => console.error("Role verify failed", err));
        }
    }, [maintenanceMode]);

    // If maintenance is OFF, do nothing
    if (!maintenanceMode) return null;

    // Owners ALWAYS bypass maintenance
    if (userType === "owner") return null;

    // List of paths that should NEVER show the maintenance overlay
    // We must allow /login so they can log in as owner
    // We must allow /api/auth so the login requests work
    const allowedPaths = ["/login", "/api/auth"];

    if (pathname && allowedPaths.some(path => pathname.startsWith(path))) {
        return null;
    }

    // Show maintenance overlay for everyone else
    return <Maintaince />;
}
