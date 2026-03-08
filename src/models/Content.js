import mongoose from 'mongoose';

const ContentSchema = new mongoose.Schema({
    global: {
        contact: {
            address: { type: String, default: "85, Tilottama Plaza, Kolkata 700082" },
            phone: { type: String, default: "+91 82400 54002" },
            email: { type: String, default: "santrarony9@gmail.com" }
        },
        social: {
            instagram: { type: String, default: "" },
            facebook: { type: String, default: "" },
            youtube: { type: String, default: "" }
        },
        company: {
            registrationNo: { type: String, default: "WB-PR-00XXXXXX" },
            establishedYear: { type: String, default: "2010" }
        },
        seo: {
            title: { type: String, default: "Dreamline Production | Cinematic Weddings & Commercials" },
            description: { type: String, default: "Kolkata's premium cinematic video production house specializing in luxury weddings and commercial storytelling." },
            keywords: { type: String, default: "wedding photography, cinematic wedding video, kolkata, production house, commercial video" },
            ogImage: { type: String, default: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200" },
            favicon: { type: String, default: "/favicon.ico" }
        }
    },
    home: {
        hero: {
            titleLine1: { type: String, default: "Visionary" },
            titleLine2: { type: String, default: "Cinema." },
            subtitle: { type: String, default: "EST. 2010 • DREAMLINE PRODUCTION" },
            backgroundImage: { type: String, default: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1920&q=80" },
            cta1Text: { type: String, default: "Explore Weddings" },
            cta1Link: { type: String, default: "luxury.html" },
            cta2Text: { type: String, default: "Commercial Works" },
            cta2Link: { type: String, default: "commercial.html" }
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
            priceHint: String
        }],
        motionArchive: {
            title: { type: String, default: "The Motion" },
            subtitle: { type: String, default: "Archive." },
            description: { type: String, default: "15+ Years of Frames" }
        },
        reviews: {
            sectionSubtitle: { type: String, default: "The Reputation" },
            averageRating: { type: String, default: "4.9" },
            totalReviewsText: { type: String, default: "Average Rating (150+ Reviews on Google & Justdial)" },
            list: [{
                author: String,
                role: String,
                text: String,
                rating: { type: Number, default: 5 },
                initial: String
            }]
        }
    },
    luxury: {
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
        hero: {
            titleLine1: { type: String, default: "Commercial" },
            titleLine2: { type: String, default: "Stories." },
            description: { type: String, default: "Elevating brands through cinematic narratives. From high-fashion edits to corporate documentaries, we craft visuals that sell." }
        }
    },
    about: {
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
        id: Number,
        title: String,
        type: String, // 'commercial', 'wedding', 'music'
        img: String,
        hoverVideo: String
    }],
    partners: [{
        name: String,
        letter: String,
        image: String
    }],
    splitGallery: [String]
}, { timestamps: true });

export default mongoose.models.Content || mongoose.model('Content', ContentSchema);
