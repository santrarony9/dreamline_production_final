"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";
import Script from "next/script";

export default function AnalyticsTracker({ gaId, adsId, adsLabel }) {
    const pathname = usePathname();
    const fbPixelId = ""; // USER: Add your Facebook Pixel ID here (e.g., "123456789012345")

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

        // Trigger FB Pixel pageview manually if FB is loaded
        if (fbPixelId && typeof window !== "undefined" && window.fbq) {
            window.fbq('track', 'PageView');
        }

        reportView();
    }, [pathname, gaId, fbPixelId]);

    return (
        <>
            {/* Google Analytics */}
            {gaId && (
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
                            
                            // Global helper for conversions (Leads)
                            window.reportConversion = function() {
                                if ('${adsId}' && '${adsLabel}') {
                                    gtag('event', 'conversion', {
                                        'send_to': '${adsId}/${adsLabel}',
                                        'value': 1.0,
                                        'currency': 'INR'
                                    });
                                }
                                if ('${fbPixelId}' && typeof fbq !== 'undefined') {
                                    fbq('track', 'Lead');
                                }
                            };
                        `}
                    </Script>
                </>
            )}

            {/* Meta (Facebook) Pixel */}
            {fbPixelId && (
                <Script id="facebook-pixel" strategy="afterInteractive">
                    {`
                        !function(f,b,e,v,n,t,s)
                        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                        n.queue=[];t=b.createElement(e);t.async=!0;
                        t.src=v;s=b.getElementsByTagName(e)[0];
                        s.parentNode.insertBefore(t,s)}(window, document,'script',
                        'https://connect.facebook.net/en_US/fbevents.js');
                        fbq('init', '${fbPixelId}');
                        fbq('track', 'PageView');
                    `}
                </Script>
            )}
        </>
    );
}
