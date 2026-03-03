"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";

export default function AnalyticsTracker() {
    const pathname = usePathname();

    useEffect(() => {
        // Report view on route change
        const reportView = async () => {
            try {
                await axios.post("/api/tracking/view", { path: pathname });
            } catch (err) {
                // Silently fail to not affect UX
            }
        };

        reportView();
    }, [pathname]);

    return null;
}
