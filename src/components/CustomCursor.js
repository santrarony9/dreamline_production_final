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

        return () => {
            window.removeEventListener("mousemove", moveCursor);
            interatables.forEach((el) => {
                el.removeEventListener("mouseenter", handleMouseEnter);
                el.removeEventListener("mouseleave", handleMouseLeave);
            });
        };
    }, []);

    return null; // The elements are in layout.js
}
