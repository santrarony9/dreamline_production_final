"use client";

import { usePathname } from "next/navigation";
import { ReactLenis } from "@studio-freight/react-lenis";

export default function SmoothScroll({ children }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    if (isAdmin) {
        return <>{children}</>;
    }

    return (
        <ReactLenis root options={{ lerp: 0.1, duration: 1.2, smoothTouch: false }}>
            {children}
        </ReactLenis>
    );
}
