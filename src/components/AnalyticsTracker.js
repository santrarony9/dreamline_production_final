"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";
import Script from "next/script";

export default function AnalyticsTracker({ gaId, adsId, adsLabel }) {
    const pathname = usePathname();

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
        if (gaId && typeof window !== "undefined" && window.gtag) {
            window.gtag('config', gaId, {
                page_path: pathname,
            });
        }

        reportView();
    }, [pathname, gaId]);

    if (!gaId) return null;

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${gaId}', {
                        page_path: window.location.pathname,
                    });
                    ${adsId ? `gtag('config', '${adsId}');` : ''}
                    
                    // Global helper for conversions
                    window.reportConversion = function() {
                        if ('${adsId}' && '${adsLabel}') {
                            gtag('event', 'conversion', {
                                'send_to': '${adsId}/${adsLabel}',
                                'value': 1.0,
                                'currency': 'INR'
                            });
                        }
                    };
                `}
            </Script>
        </>
    );
}
