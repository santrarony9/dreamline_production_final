"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function MediaProtection() {
    const pathname = usePathname();

    useEffect(() => {
        // Disable media protection completely in admin or localhost to allow debugging & drag-and-drop
        if (typeof window !== "undefined") {
            const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
            const isAdmin = pathname?.startsWith("/admin");
            if (isLocal || isAdmin) return;
        }

        // Prevent right-click context menu on images and videos on public production pages
        const handleContextMenu = (e) => {
            if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
                e.preventDefault();
            }
        };

        // Prevent dragging of public images and videos
        const handleDragStart = (e) => {
            if (e.target.closest && e.target.closest('[draggable="true"]')) {
                return; // Allow intentional draggable elements
            }
            if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
                e.preventDefault();
            }
        };

        // NOTE: Keyboard shortcut blocking removed — it annoyed power users/developers
        // and provided zero real protection (JS can be disabled, curl still works).
        // Right-click on images is still blocked below for a minimal deterrent.

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('dragstart', handleDragStart);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('dragstart', handleDragStart);
        };
    }, [pathname]);

    return null; // Invisible global utility component
}
