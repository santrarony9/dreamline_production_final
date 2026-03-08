"use client";

import { useEffect, useState } from "react";

export default function CustomCursor() {
    useEffect(() => {
        const cursor = document.getElementById("cursor-dot");
        const outline = document.getElementById("cursor-outline");

        if (!cursor || !outline) return;

        const moveCursor = (e) => {
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;

            outline.animate({
                left: `${e.clientX}px`,
                top: `${e.clientY}px`
            }, { duration: 500, fill: "forwards" });
        };

        const handleMouseEnter = () => {
            cursor.classList.add("scale-[4]", "opacity-20");
            outline.classList.add("scale-150", "border-[#c5a059]");
        };

        const handleMouseLeave = () => {
            cursor.classList.remove("scale-[4]", "opacity-20");
            outline.classList.remove("scale-150", "border-[#c5a059]");
        };

        window.addEventListener("mousemove", moveCursor);

        const interatables = document.querySelectorAll(".interactive");
        interatables.forEach((el) => {
            el.addEventListener("mouseenter", handleMouseEnter);
            el.addEventListener("mouseleave", handleMouseLeave);
        });

        // Premium Global Intersection Observer for Animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in-view");
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

        // Auto-attach reveal animation to majestic elements
        const majesticElements = document.querySelectorAll("h1, h2, .premium-card, section");
        majesticElements.forEach(el => {
            // Don't override elements that already have complex inner animations
            if (!el.classList.contains("reveal-inner") && !el.querySelector('.reveal-inner')) {
                el.classList.add("reveal-up");
                observer.observe(el);
            }
        });

        return () => {
            window.removeEventListener("mousemove", moveCursor);
            observer.disconnect();
            interatables.forEach((el) => {
                el.removeEventListener("mouseenter", handleMouseEnter);
                el.removeEventListener("mouseleave", handleMouseLeave);
            });
        };
    }, []);

    return null; // The elements are in layout.js
}
