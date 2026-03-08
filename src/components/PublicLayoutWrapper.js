"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Preloader from "./Preloader";
import CustomCursor from "./CustomCursor";
import VideoModal from "./VideoModal";

export default function PublicLayoutWrapper({ children }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    if (isAdmin) {
        return <>{children}</>;
    }

    return (
        <>
            <Preloader />
            <CustomCursor />
            <VideoModal />
            <Navbar />
            {children}
            <Footer />
        </>
    );
}
