import mongoose from 'mongoose';

const ContentSchema = new mongoose.Schema({
    global: {
        contact: {
            address: { type: String, default: "85, Tilottama Plaza, Tower 2, First Floor, Karunamoyee Ghat Road, Kolkata, West Bengal 700082" },
            phone: { type: String, default: "+91 82400 54002" },
            email: { type: String, default: "support@dreamlineproduction.com" }
        },
        social: {
            instagram: { type: String, default: "" },
            facebook: { type: String, default: "" },
            youtube: { type: String, default: "" }
        },
        company: {
            name: { type: String, default: "Dreamline Production" },
            registrationNo: { type: String, default: "WB-PR-00XXXXXX" },
            establishedYear: { type: String, default: "2010" }
        },
        seo: {
            title: { type: String, default: "Dreamline Production | Cinematic Weddings & Commercials" },
            description: { type: String, default: "Kolkata's premium cinematic video production house specializing in luxury weddings and commercial storytelling." },
            keywords: { type: String, default: "wedding photography, cinematic wedding video, kolkata, production house, commercial video" },
            ogImage: { type: String, default: "https://dreamlineproduction.com/logo-banner.png" },
            favicon: { type: String, default: "/favicon.ico" }
        },
        google: {
            businessName: { type: String, default: "Dreamline Production" },
            profileUrl: { type: String, default: "https://maps.app.goo.gl/xRnnVxWCbLFWo8oT9" },
            mapsUrl: { type: String, default: "https://www.google.com/maps/place/Dreamline+Production/@22.4850486,88.3313873,17z/data=!4m6!3m5!1s0x3a027090db628e8f:0x3b8514dce7da523b!8m2!3d22.4850486!4d88.3339622!16s%2Fg%2F11hb2thsvp" },
            embedCode: { type: String, default: "" },
            directionsUrl: { type: String, default: "https://www.google.com/maps/dir/?api=1&destination=Dreamline+Production,+85,+Tilottama+Plaza,+Tower+2,+First+Floor,+Karunamoyee+Ghat+Road,+Kolkata,+West+Bengal+700082&destination_place_id=ChIJj45i25BwAjoRO1La59wUhTs" },
            reviewsUrl: { type: String, default: "https://search.google.com/local/writereview?placeid=ChIJj45i25BwAjoRO1La59wUhTs" },
            mapEnabled: { type: Boolean, default: true },
            analyticsId: { type: String, default: "" },
            searchConsoleId: { type: String, default: "" },
            mapsApiKey: { type: String, default: "" },
            placeId: { type: String, default: "ChIJj45i25BwAjoRO1La59wUhTs" },
            clientId: { type: String, default: "" },
            clientSecret: { type: String, default: "" },
            adsConversionId: { type: String, default: "" },
            adsConversionLabel: { type: String, default: "" }
        },
        announcement: {
            enabled: { type: Boolean, default: true },
            badge: { type: String, default: "STUDIO HQ" },
            text: { type: String, default: "85, Tilottama Plaza, Tower 2, First Floor, Karunamoyee Ghat Road, Kolkata 700082" },
            lines: {
                type: [String],
                default: [
                    "85, Tilottama Plaza, Tower 2, First Floor",
                    "Karunamoyee Ghat Road, Kolkata 700082",
                    "Dreamline Production Studio • Kolkata, West Bengal"
                ]
            },
            link: { type: String, default: "https://maps.app.goo.gl/xRnnVxWCbLFWo8oT9" }
        },
        navigation: {
            cta: {
                label: { type: String, default: "INQUIRE NOW" },
                href: { type: String, default: "/contact" },
                enabled: { type: Boolean, default: true }
            },
            items: [{
                label: String,
                href: String,
                order: Number
            }]
        }
    },
    home: {
        sections: {
            hero: { type: Boolean, default: true },
            marquee: { type: Boolean, default: true },
            stats: { type: Boolean, default: true },
            partners: { type: Boolean, default: true },
            quote: { type: Boolean, default: true },
            expertise: { type: Boolean, default: true },
            services: { type: Boolean, default: true },
            motionArchive: { type: Boolean, default: true },
            videoVault: { type: Boolean, default: true },
            splitGallery: { type: Boolean, default: true },
            projects: { type: Boolean, default: true },
            journal: { type: Boolean, default: true },
            reviews: { type: Boolean, default: true },
            letsCreate: { type: Boolean, default: true }
        },
        seo: {
            title: { type: String, default: "" },
            description: { type: String, default: "" },
            keywords: { type: String, default: "" },
            ogImage: { type: String, default: "" }
        },
        hero: {
            titleLine1: { type: String, default: "Photography & Videography" },
            titleLine2: { type: String, default: "Production House in Kolkata" },
            subtitle: { type: String, default: "EST. 2010 • DREAMLINE PRODUCTION" },
            backgroundImage: { type: String, default: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1920&q=80" },
            cta1Text: { type: String, default: "Explore Weddings" },
            cta1Link: { type: String, default: "/luxury" },
            cta2Text: { type: String, default: "Commercial Works" },
            cta2Link: { type: String, default: "/commercial" }
        },
        expertise: {
            title: { type: String, default: "Expertise Focus" },
            heading: { type: String, default: "Luxury<br>Emotion<br>Storytelling." },
            description: { type: String, default: "Dreamline Production moves away from \"standard shots.\" We build cinematic experiences that preserve the soul of the event, treated with high-end color grading and sound design." },
            image: { type: String, default: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800" },
            yearsExperience: { type: String, default: "15" },
            servicesList: [{
                name: String,
                number: String
            }]
        },
        marquee: [String],
        stats: [{
            value: String,
            label: String,
            suffix: { type: String, default: "+" }
        }],
        services: [{
            title: String,
            description: String,
            number: String,
            priceHint: String,
            category: { type: String, enum: ['wedding', 'commercial', 'tech', 'other'], default: 'wedding' },
            subcategories: [String]
        }],
        motionArchive: {
            title: { type: String, default: "The Motion" },
            subtitle: { type: String, default: "Archive." },
            description: { type: String, default: "15+ Years of Frames" },
            images: [String]
        },
        reviews: {
            sectionSubtitle: { type: String, default: "The Reputation" },
            sectionTitle: { type: String, default: "Reviews." },
            averageRating: { type: String, default: "4.9" },
            totalReviewsText: { type: String, default: "Average Rating (150+ Reviews on Google & Justdial)" },
            list: [{
                author: String,
                role: String,
                text: String,
                rating: { type: Number, default: 5 },
                initial: String
            }]
        },
        quote: {
            text: { type: String, default: "We don't take pictures with a camera. We bring to the act of photography all the books we have read, the movies we have seen, the music we have heard." },
            backgroundImage: { type: String, default: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1920&q=80" }
        },
        partners: [{
            name: String,
            image: String
        }]
    },
    luxury: {
        seo: {
            title: { type: String, default: "" },
            description: { type: String, default: "" },
            keywords: { type: String, default: "" },
            ogImage: { type: String, default: "" }
        },
        hero: {
            titleLine1: { type: String, default: "The Heritage" },
            titleLine2: { type: String, default: "Collection." },
            description: { type: String, default: "We don't just photograph; we archive emotions. Specializing in luxury Bengali weddings and destination cinematic films across India." }
        },
        testimonial: {
            quote: { type: String, default: "\"THEY DON'T JUST RECORD EVENTS; THEY CRAFT MEMORIES. WORKING WITH DREAMLINE WAS THE BEST DECISION FOR OUR BRAND IDENTITY.\"" },
            author: { type: String, default: "Priyanka Sen" },
            role: { type: String, default: "Marketing Head, Kolkata Retailers" },
            image: { type: String, default: "" }
        },
        sparkCarousel: [String]
    },
    commercial: {
        seo: {
            title: { type: String, default: "" },
            description: { type: String, default: "" },
            keywords: { type: String, default: "" },
            ogImage: { type: String, default: "" }
        },
        hero: {
            titleLine1: { type: String, default: "Commercial" },
            titleLine2: { type: String, default: "Stories." },
            description: { type: String, default: "Elevating brands through cinematic narratives. From high-fashion edits to corporate documentaries, we craft visuals that sell." }
        }
    },
    about: {
        seo: {
            title: { type: String, default: "" },
            description: { type: String, default: "" },
            keywords: { type: String, default: "" },
            ogImage: { type: String, default: "" }
        },
        hero: {
            subtitle: { type: String, default: "Est. 2010 • Govt. Registered" },
            titleLine1: { type: String, default: "TRUSTED PRODUCTION" },
            titleLine2: { type: String, default: "HOUSE IN KOLKATA." },
            description: { type: String, default: "Dreamline Production is a leading production house in Kolkata delivering cinematic video production, photography, and digital content solutions for brands, businesses, and individuals. Known for creativity, professionalism, and storytelling excellence, we transform ideas into visually powerful content that creates emotional impact and brand value." }
        },
        logoHistory: { type: String, default: "/logo.svg" },
        details: {
            heading: { type: String, default: "About Us" },
            text1: { type: String, default: "Dreamline Production is a Kolkata-based creative production company dedicated to producing high-quality visual content with strong storytelling and cinematic aesthetics. We combine creative direction, modern equipment, and industry experience to deliver professional results across multiple industries." },
            text2: { type: String, default: "We work with corporate brands, startups, agencies, influencers, and families who want premium visuals that communicate authenticity and excellence." },
            vision: { type: String, default: "To become one of the most trusted and innovative production houses in Kolkata recognized for cinematic storytelling and professional execution." },
            mission: { type: String, default: "To help brands and individuals communicate their stories through powerful visuals, strategic content, and high-quality production." }
        },
        founder: {
            subtitle: { type: String, default: "The Visionary" },
            heading: { type: String, default: "Capturing<br>The Unseen." },
            note: { type: String, default: "\"At Dreamline, we don't just record events; we archive feelings. My journey began with a simple belief: that every brand and every couple has a story that deserves to be told with cinematic grandeur. Over the last decade, we've refined our craft to ensure that when you look back at our work 20 years from now, you don't just see what happened — you feel it.\"" },
            name: { type: String, default: "Aditya Singh" },
            role: { type: String, default: "Founder & Creative Director" },
            image: { type: String, default: "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=800" }
        },
        timeline: [{
            year: String,
            title: String,
            description: String
        }],
        team: {
            sectionSubtitle: { type: String, default: "The Creators" },
            heading: { type: String, default: "Meet The <br>Team." },
            description: { type: String, default: "A collective of cinematographers, editors, and creative directors united by a passion for visual perfection." },
            members: [{
                name: String,
                role: String,
                image: String
            }]
        },
        bts: {
            sectionSubtitle: { type: String, default: "By The Numbers" },
            heading: { type: String, default: "Proven<br>Excellence." },
            videoImage: { type: String, default: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=1600" },
            videoUrl: String
        },
        whyUs: {
            sectionSubtitle: { type: String, default: "Why Us" },
            heading: { type: String, default: "THE DREAMLINE<br>DIFFERENCE." },
            description: { type: String, default: "We don't just record events; we craft stories that emotionally connect with audiences." },
            points: [{
                title: String,
                description: String
            }],
            processHeading: { type: String, default: "Our Process" },
            processSteps: [String]
        },
        productionServices: [{
            title: String,
            description: String
        }]
    },

    // Kept for backward compatibility during transition or specific uses
    videoVault: [{
        title: String,
        category: String,
        image: String,
        videoUrl: String
    }],
    projects: [{
        title: String,
        type: { type: String }, // 'commercial', 'wedding', 'music'
        img: String,
        hoverVideo: String,
        videoUrl: String // Full video URL for the player
    }],
    // Promotional & Page Banners
    banners: [{
        title: { type: String, default: "" },
        subtitle: { type: String, default: "" },
        description: { type: String, default: "" },
        image: { type: String, default: "" },
        videoUrl: { type: String, default: "" },
        ctaText: { type: String, default: "" },
        ctaLink: { type: String, default: "" },
        badge: { type: String, default: "" },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true }
    }],
    splitGallery: [String]
}, { timestamps: true });

export default mongoose.models.Content || mongoose.model('Content', ContentSchema);
