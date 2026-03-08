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
                    setTimeout(() => setIsLoading(false), 800); // Give it a moment to sit at 100%
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

        return () => {
            clearInterval(interval);
            window.removeEventListener('load', handleLoad);
        };
    }, []);

    if (!isLoading) return null;

    return (
        <div
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center transition-all duration-1000 ease-[cubic-bezier(0.85,0,0.15,1)]"
            style={{
                opacity: progress === 100 ? 0 : 1,
                pointerEvents: progress === 100 ? 'none' : 'auto',
                transform: progress === 100 ? 'translateY(-10vh)' : 'translateY(0)'
            }}
        >
            <div className="text-center">
                <h2 className="font-heading font-black text-4xl mb-2 text-white tracking-widest">DREAMLINE</h2>
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
    );
}
