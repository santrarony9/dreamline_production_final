"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";

export default function AnalyticsTracker() {
    const pathname = usePathname();
    const [gaId, setGaId] = useState("");

    useEffect(() => {
        // Fetch GA ID from global settings
        const fetchGaId = async () => {
            try {
                const res = await axios.get("/api/content");
                if (res.data?.global?.google?.analyticsId) {
                    setGaId(res.data.global.google.analyticsId);
                }
            } catch (err) {
                console.error("Failed to fetch analytics ID");
            }
        };
        fetchGaId();
    }, []);

    useEffect(() => {
        if (!gaId) return;

        // Initialize GA4
        const script1 = document.createElement("script");
        script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        script1.async = true;
        document.head.appendChild(script1);

        const script2 = document.createElement("script");
        script2.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
                page_path: window.location.pathname,
            });
        `;
        document.head.appendChild(script2);

        return () => {
            document.head.removeChild(script1);
            document.head.removeChild(script2);
        };
    }, [gaId]);

    useEffect(() => {
        // Report view on route change to custom tracking
        const reportView = async () => {
            try {
                await axios.post("/api/tracking/view", { 
                    path: pathname,
                    referrer: document.referrer 
                });
            } catch (err) {
                // Silently fail
            }
        };

        // Also trigger GA pageview manually if GA is loaded
        if (gaId && window.gtag) {
            window.gtag('config', gaId, {
                page_path: pathname,
            });
        }

        reportView();
    }, [pathname, gaId]);

    return null;
}
