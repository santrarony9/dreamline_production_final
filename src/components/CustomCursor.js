"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { usePathname } from "next/navigation";

export default function CustomCursor() {
    const pathname = usePathname();
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

        // Event delegation for interactive hovers - 100% CPU-safe, zero loop!
        const handleMouseOver = (e) => {
            const target = e.target.closest(".interactive, [data-cursor]");
            if (target) {
                const cursorData = target.getAttribute("data-cursor");
                if (cursorData) {
                    setCursorVariant("text");
                    setCursorText(cursorData);
                }
            }
        };

        const handleMouseOut = (e) => {
            const target = e.target.closest(".interactive, [data-cursor]");
            if (target) {
                setCursorVariant("default");
                setCursorText("");
            }
        };

        window.addEventListener("mousemove", moveCursor);
        window.addEventListener("mouseover", handleMouseOver);
        window.addEventListener("mouseout", handleMouseOut);

        // Premium Global Intersection Observer for Animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in-view");
                }
            });
        }, { threshold: 0, rootMargin: "0px 0px -50px 0px" });

        const attachObserver = () => {
            const majesticElements = document.querySelectorAll("h1, h2, .premium-card, .blog-card, .reveal");
            majesticElements.forEach(el => {
                if (!el.classList.contains("reveal-inner") && !el.querySelector('.reveal-inner') && !el.classList.contains("reveal-up")) {
                    el.classList.add("reveal-up");
                    observer.observe(el);
                }
            });
        };

        // Run once on page mount / navigation path change
        attachObserver();

        return () => {
            window.removeEventListener("mousemove", moveCursor);
            window.removeEventListener("mouseover", handleMouseOver);
            window.removeEventListener("mouseout", handleMouseOut);
            observer.disconnect();
        };
    }, [pathname, cursorX, cursorY]);

    const variants = {
        default: {
            opacity: 0,
            height: 0,
            width: 0,
            backgroundColor: "transparent",
            mixBlendMode: "normal"
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
        default: { height: 0, width: 0, opacity: 0, borderColor: "transparent" },
        text: { height: 0, width: 0, opacity: 0, borderColor: "transparent" },
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
