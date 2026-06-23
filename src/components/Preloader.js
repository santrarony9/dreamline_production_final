'use client';
import { useEffect, useState } from 'react';

export default function Preloader() {
    const [progress, setProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Increment progress randomly to simulate loading
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setIsLoading(false);
                    }, 500); // Short transition
                    return 100;
                }
                return prev + Math.floor(Math.random() * 15) + 5;
            });
        }, 150);

        // If window is fully loaded, force it to 100
        const handleLoad = () => {
            setProgress(100);
        };

        if (document.readyState === 'complete') {
            handleLoad();
        } else {
            window.addEventListener('load', handleLoad);
        }

        // Fail-safe: never show loader for more than 1.5 seconds
        const failSafe = setTimeout(() => {
            setProgress(100);
            setTimeout(() => setIsLoading(false), 500);
        }, 1500);

        return () => {
            clearInterval(interval);
            clearTimeout(failSafe);
            window.removeEventListener('load', handleLoad);
        };
    }, []);

    if (!isLoading) return null;

    return (
        <>
            {/* 
              SEO Fix: Hide preloader overlay for crawlers/noscript agents.
              Googlebot may not execute JS, so the preloader stays visible forever,
              covering all page content with a black screen. This ensures crawlers
              see through to the actual content underneath.
            */}
            <noscript>
                <style>{`
                    .preloader-overlay { display: none !important; }
                `}</style>
            </noscript>
            <div
                className="preloader-overlay fixed inset-0 z-[100] bg-black flex items-center justify-center transition-all duration-1000 ease-[cubic-bezier(0.85,0,0.15,1)]"
                aria-hidden="true"
                role="presentation"
                style={{
                    opacity: progress === 100 ? 0 : 1,
                    pointerEvents: progress === 100 ? 'none' : 'auto',
                    transform: progress === 100 ? 'translateY(-10vh)' : 'translateY(0)'
                }}
            >
                <div className="text-center">
                    <h2 className="font-heading font-black text-4xl mb-2 text-white tracking-widest relative inline-block">
                        DREAMLINE<span className="absolute -top-3 -right-6 text-[18px] text-[#c5a059] font-bold">®</span>
                    </h2>
                    <div className="w-48 h-[2px] bg-gray-800 mx-auto overflow-hidden">
                        <div
                            className="h-full bg-[#c5a059] transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-[10px] tracking-[0.5em] mt-4 uppercase text-gray-500">
                        Preparing Experience
                    </p>
                </div>
            </div>
        </>
    );
}
