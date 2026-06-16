import TechPage from "@/components/tech/TechPage";

export const metadata = {
    title: "Tech & Web Development",
    description: "Explore the digital product studio of Dreamline Production. We engineer high-performance, cinematic web experiences.",
    alternates: {
        canonical: 'https://dreamlineproduction.com/tech',
    },
    openGraph: {
        title: "Tech & Web Development",
        description: "Explore the digital product studio of Dreamline Production. We engineer high-performance, cinematic web experiences.",
        url: 'https://dreamlineproduction.com/tech',
        siteName: 'Dreamline Production',
        locale: 'en_IN',
        type: 'website',
        images: [{ url: '/logo-banner.png', width: 1200, height: 630 }],
    },
    twitter: {
        card: 'summary_large_image',
        title: "Tech & Web Development",
        description: "Explore the digital product studio of Dreamline Production. We engineer high-performance, cinematic web experiences.",
        images: ['/logo-banner.png'],
    },
};

export default function Page() {
    return <TechPage />;
}
