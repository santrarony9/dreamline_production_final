"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    // Smooth trailing effect
    const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
    const outlineX = useSpring(cursorX, springConfig);
    const outlineY = useSpring(cursorY, springConfig);

    const [cursorVariant, setCursorVariant] = useState("default");
    const [cursorText, setCursorText] = useState("");

    useEffect(() => {
        const moveCursor = (e) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
        };

        const handleMouseEnter = (e) => {
            const cursorData = e.target.closest('[data-cursor]')?.getAttribute('data-cursor');
            if (cursorData) {
                setCursorVariant("text");
                setCursorText(cursorData);
            } else {
                setCursorVariant("hover");
            }
        };

        const handleMouseLeave = () => {
            setCursorVariant("default");
            setCursorText("");
        };

        window.addEventListener("mousemove", moveCursor);

        // Attach to all elements using MutationObserver or just live query
        const attachListeners = () => {
            const interatables = document.querySelectorAll("a, button, .interactive, [data-cursor]");
            interatables.forEach((el) => {
                el.removeEventListener("mouseenter", handleMouseEnter);
                el.removeEventListener("mouseleave", handleMouseLeave);
                el.addEventListener("mouseenter", handleMouseEnter);
                el.addEventListener("mouseleave", handleMouseLeave);
            });
        };

        // Premium Global Intersection Observer for Animations (keep existing logic)
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in-view");
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

        const attachObserver = () => {
            const majesticElements = document.querySelectorAll("h1, h2, .premium-card, section");
            majesticElements.forEach(el => {
                if (!el.classList.contains("reveal-inner") && !el.querySelector('.reveal-inner') && !el.classList.contains("reveal-up")) {
                    el.classList.add("reveal-up");
                    observer.observe(el);
                }
            });
        };

        attachListeners();
        attachObserver();

        // Setup MutationObserver to catch dynamically added interactive elements
        const mutationObserver = new MutationObserver(() => {
            attachListeners();
            attachObserver();
        });

        mutationObserver.observe(document.body, { childList: true, subtree: true });

        return () => {
            window.removeEventListener("mousemove", moveCursor);
            observer.disconnect();
            mutationObserver.disconnect();
            const interatables = document.querySelectorAll("a, button, .interactive, [data-cursor]");
            interatables.forEach((el) => {
                el.removeEventListener("mouseenter", handleMouseEnter);
                el.removeEventListener("mouseleave", handleMouseLeave);
            });
        };
    }, [cursorX, cursorY]);

    const variants = {
        default: {
            opacity: 1,
            height: 12,
            width: 12,
            backgroundColor: "#c5a059",
            mixBlendMode: "normal"
        },
        hover: {
            opacity: 0.5,
            height: 48,
            width: 48,
            backgroundColor: "#c5a059",
            mixBlendMode: "difference"
        },
        text: {
            opacity: 1,
            height: 80,
            width: 80,
            backgroundColor: "#c5a059",
            mixBlendMode: "normal"
        }
    };

    const outlineVariants = {
        default: { height: 40, width: 40, opacity: 1, borderColor: "rgba(197, 160, 89, 0.5)" },
        hover: { height: 64, width: 64, opacity: 0, borderColor: "rgba(197, 160, 89, 0)" },
        text: { height: 96, width: 96, opacity: 0, borderColor: "rgba(197, 160, 89, 0)" },
    };

    return (
        <div className="pointer-events-none fixed top-0 left-0 w-full h-full z-[9999] hidden md:block mix-blend-difference">
            {/* Outline */}
            <motion.div
                className="fixed border rounded-full flex items-center justify-center translate-x-[-50%] translate-y-[-50%]"
                style={{ x: outlineX, y: outlineY, pointerEvents: "none" }}
                variants={outlineVariants}
                animate={cursorVariant}
                transition={{ duration: 0.3 }}
            />

            {/* Dot / Text Container */}
            <motion.div
                className="fixed rounded-full flex items-center justify-center translate-x-[-50%] translate-y-[-50%] overflow-hidden"
                style={{ x: cursorX, y: cursorY, pointerEvents: "none" }}
                variants={variants}
                animate={cursorVariant}
                transition={{ duration: 0.2 }}
            >
                {cursorVariant === "text" && (
                    <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-black font-black text-[10px] uppercase tracking-widest text-center whitespace-nowrap leading-none"
                    >
                        {cursorText}
                    </motion.span>
                )}
            </motion.div>
        </div>
    );
}
