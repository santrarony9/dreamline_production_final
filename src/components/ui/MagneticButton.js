"use client";

import { useRef, useState } from "react";
import { motion, useSpring } from "framer-motion";

export default function MagneticButton({ children, className = "" }) {
    const ref = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
    const x = useSpring(0, springConfig);
    const y = useSpring(0, springConfig);

    const handleMouseMove = (e) => {
        if (!ref.current) return;
        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current.getBoundingClientRect();

        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);

        // Pull strength (0.3 means it moves 30% of the distance from center)
        x.set(middleX * 0.3);
        y.set(middleY * 0.3);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            style={{ x, y }}
            className={`relative inline-flex items-center justify-center cursor-pointer ${className}`}
            data-cursor="CLICK"
        >
            <motion.div
                style={{
                    x: useSpring(isHovered ? x.get() * 0.5 : 0, springConfig),
                    y: useSpring(isHovered ? y.get() * 0.5 : 0, springConfig)
                }}
            >
                {children}
            </motion.div>
        </motion.div>
    );
}
