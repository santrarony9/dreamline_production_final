"use client";

import { useEffect } from "react";

export default function MediaProtection() {
    useEffect(() => {
        // Prevent right-click context menu on images and videos
        const handleContextMenu = (e) => {
            if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
                e.preventDefault();
            }
        };

        // Prevent dragging of images and videos
        const handleDragStart = (e) => {
            if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
                e.preventDefault();
            }
        };

        // Prevent common keyboard shortcuts for "Save As", "Inspect Element", etc.
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
    }, []);

    return null; // Invisible global utility component
}
