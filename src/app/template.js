// Template — no animation wrapper.
// Previously used framer-motion with initial={{ opacity: 0 }} which hid all page
// content from the accessibility tree during the first paint, causing the
// agent-accessibility-tree audit to fail (Agentic Browsing 2/3).
// A simple pass-through keeps content visible immediately.

export default function Template({ children }) {
    return <>{children}</>;
}
