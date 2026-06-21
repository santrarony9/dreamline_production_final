"use client";

import { motion } from "framer-motion";

export default function Template({ children }) {
    return (
        <>
            {/* 
              SEO Fix: Ensure content is visible to crawlers.
              framer-motion sets initial opacity:0 in SSR HTML which hides content from Googlebot.
              This noscript style ensures crawlers (which don't run JS) see full content.
            */}
            <noscript>
                <style>{`
                    .template-motion { opacity: 1 !important; transform: none !important; }
                `}</style>
            </noscript>
            <motion.div
                className="template-motion"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ ease: "easeInOut", duration: 0.75 }}
            >
                {children}
            </motion.div>
        </>
    );
}
