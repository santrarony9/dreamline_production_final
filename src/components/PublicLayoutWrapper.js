"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Preloader from "./Preloader";
import VideoModal from "./VideoModal";

export default function PublicLayoutWrapper({ children, siteContent }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    if (isAdmin) {
        return <>{children}</>;
    }

    return (
        <>
            <Preloader />
            <VideoModal />
            <Navbar initialServices={siteContent?.services || siteContent?.home?.services} />
            {children}
            <Footer siteContent={siteContent} />
        </>
    );
}
