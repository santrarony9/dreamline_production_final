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

        // Prevent common keyboard shortcuts for "Save As", "Inspect Element" on public production pages
        const handleKeyDown = (e) => {
            // F12 (DevTools)
            if (e.keyCode === 123) {
                e.preventDefault();
            }
            // Ctrl+Shift+I / Cmd+Option+I (DevTools)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 73) {
                e.preventDefault();
            }
            // Ctrl+Shift+C / Cmd+Option+C (Inspect Element)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 67) {
                e.preventDefault();
            }
            // Ctrl+S / Cmd+S (Save As)
            if ((e.ctrlKey || e.metaKey) && e.keyCode === 83) {
                e.preventDefault();
            }
            // Ctrl+U / Cmd+Option+U (View Source)
            if ((e.ctrlKey || e.metaKey) && e.keyCode === 85) {
                e.preventDefault();
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('dragstart', handleDragStart);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('dragstart', handleDragStart);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [pathname]);

    return null; // Invisible global utility component
}
