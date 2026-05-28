import dbConnect from "@/lib/mongodb";
import Content from "@/models/Content";
import ContactForm from "./ContactForm";
import StructuredData from "@/components/seo/StructuredData";

export async function generateMetadata() {
    return {
        title: "Contact & Book — Dreamline Production Kolkata",
        description: "Book your luxury wedding photography or commercial film project with Dreamline Production. Call +91 82400 54002 or visit our studio at Tilottama Plaza, Kolkata.",
        alternates: {
            canonical: 'https://dreamlineproduction.com/contact',
        },
    };
}

export const dynamic = 'force-dynamic';

export default async function ContactPage() {
    let globalData = null;
    try {
        await dbConnect();
        const content = await Content.findOne().lean();
        globalData = content?.global || null;
    } catch (e) {
        console.error("Contact page data fetch error:", e);
    }

    const contactSchema = {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "name": "Contact Dreamline Production",
        "description": "Book your photography experience with Dreamline Production, Kolkata's premier cinematic studio.",
        "url": "https://dreamlineproduction.com/contact",
        "mainEntity": {
            "@type": "ProfessionalService",
            "name": "Dreamline Production",
            "telephone": globalData?.contact?.phone || "+91 82400 54002",
            "email": globalData?.contact?.email || "support@dreamlineproduction.com",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": (globalData?.contact?.address || "").includes(", Kolkata") ? globalData.contact.address.split(", Kolkata")[0] : "85, Tilottama Plaza, Tower 2, First Floor, Karunamoyee Ghat Road",
                "addressLocality": "Kolkata",
                "addressRegion": "West Bengal",
                "postalCode": "700082",
                "addressCountry": "IN"
            }
        }
    };

    return (
        <>
            <StructuredData data={contactSchema} />
            <ContactForm globalData={globalData} />
        </>
    );
}
