"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import axios from "axios";
import ImageUploader from "@/components/admin/ImageUploader";

export default function JournalAdmin() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingPost, setEditingPost] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await axios.get("/api/journals");
            setPosts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingPost._id) {
                await axios.put("/api/journals", editingPost);
            } else {
                await axios.post("/api/journals", editingPost);
            }
            setEditingPost(null);
            fetchPosts();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Error saving journal post.");
        } finally {
            setSaving(false);
        }
    };

    const deletePost = async (id) => {
        if (!confirm("Is this story better left untold? Delete permanentely?")) return;
        try {
            await axios.delete(`/api/journals?id=${id}`);
            setPosts(posts.filter(p => p._id !== id));
        } catch (err) {
            alert("Error deleting post.");
        }
    };

    const startNewPost = () => {
        setEditingPost({
            title: "",
            date: new Date().toISOString().split('T')[0],
            category: "INSIGHT",
            image: "",
            content: "",
            excerpt: ""
        });
    };

    const [generationProgress, setGenerationProgress] = useState(0);

    const generate30DayStrategy = async () => {
        if (!confirm("This will generate 30 SEO-optimized content drafts for the next 30 days. Each post will have unique, rich content and full SEO metadata. Proceed?")) return;
        
        const posts = [
            {
                title: "Best Bengali Wedding Photography Trends in Kolkata 2026",
                category: "WEDDING",
                excerpt: "Discover the top Bengali wedding photography trends dominating Kolkata in 2026 — from drone aerials at Rajbari venues to moody editorial portraits. See how Dreamline Production is leading the shift toward cinematic storytelling.",
                content: `<h2>Bengali Wedding Photography Trends Shaping Kolkata in 2026</h2><p>The Bengali wedding landscape in Kolkata has undergone a dramatic transformation. Couples today demand more than standard posed photos — they want cinematic narratives that capture the raw emotion of each ritual, from the <strong>Gaye Holud</strong> to the <strong>Sindoor Daan</strong>.</p><h3>1. Drone Cinematography at Heritage Venues</h3><p>Rajbari and heritage venue weddings in Kolkata have skyrocketed in popularity. At Dreamline Production, we deploy DJI Inspire 3 drones to capture sweeping aerial shots that showcase the grandeur of these palatial settings — something no ground-level camera can achieve.</p><h3>2. Moody Editorial Portraits</h3><p>Gone are the days of overly bright, saturated portraits. The 2026 trend leans heavily into <strong>moody, desaturated color grading</strong> with deep shadows and warm skin tones, creating magazine-worthy images that feel timeless.</p><h3>3. Documentary-Style Storytelling</h3><p>We focus on capturing candid interactions between family members — the grandmother tearing up during the Kanyadaan, the cousins sharing a laugh during the Bor Jatri procession. These unscripted moments define a wedding film.</p><ul><li>Cinematic slow-motion captures during key rituals</li><li>Multi-camera setups for complete coverage</li><li>Same-day edits for reception screenings</li></ul><p>At <strong>Dreamline Production</strong>, we've been at the forefront of these trends since our establishment in 2010. <a href="/contact">Book a consultation</a> to discuss your wedding vision.</p>`,
                seo: { title: "Best Bengali Wedding Photography Trends in Kolkata 2026 | Dreamline Production", description: "Explore top Bengali wedding photography trends in Kolkata for 2026 including drone shots, editorial portraits & documentary filmmaking by Dreamline Production.", keywords: "bengali wedding photography kolkata, wedding trends 2026, kolkata wedding videographer, cinematic wedding kolkata, dreamline production" }
            },
            {
                title: "How to Choose the Best Wedding Videographer in Kolkata",
                category: "INSIGHT",
                excerpt: "Choosing a wedding videographer is one of the most important decisions you'll make. This guide covers what to look for — portfolio quality, equipment, storytelling style, and pricing — to ensure your special day is perfectly captured.",
                content: `<h2>The Complete Guide to Choosing a Wedding Videographer in Kolkata</h2><p>Your wedding video is the one investment that grows in value over time. Unlike flowers, décor, or catering, your film will be watched and rewatched for decades. Choosing the right videographer in Kolkata requires careful evaluation.</p><h3>What to Look For in a Portfolio</h3><p>Don't just look at highlight reels — ask to see <strong>full ceremony edits</strong>. A highlight reel can make anyone look good, but a complete film reveals the videographer's true ability to handle lighting changes, audio challenges, and continuous coverage.</p><h3>Equipment Matters</h3><p>Professional-grade equipment makes a significant difference. At Dreamline Production, we shoot on <strong>Sony FX6 and RED Komodo</strong> cinema cameras paired with cine lenses. This ensures your footage has that coveted cinematic depth-of-field and color science.</p><h3>Questions to Ask Before Booking</h3><ul><li>How many cameras will cover my ceremony?</li><li>Do you offer same-day edits?</li><li>What's your audio capture setup for vows and mantras?</li><li>How long until we receive the final film?</li><li>Do you shoot in LOG/RAW for maximum post-production flexibility?</li></ul><h3>Red Flags to Watch Out For</h3><p>Be wary of videographers who cannot show you recent work from Kolkata venues, those who rely on a single camera, or anyone unwilling to discuss their editing timeline upfront.</p><p>With over 15 years of experience filming Bengali weddings, <strong>Dreamline Production</strong> has the expertise to turn your wedding day into a cinematic masterpiece. <a href="/contact">Get in touch today</a>.</p>`,
                seo: { title: "How to Choose the Best Wedding Videographer in Kolkata | Expert Guide", description: "Complete guide to choosing the best wedding videographer in Kolkata. Learn what to look for in portfolios, equipment, pricing & storytelling from Dreamline Production.", keywords: "best wedding videographer kolkata, wedding videography kolkata, how to choose wedding videographer, kolkata wedding film, wedding cinematographer kolkata" }
            },
            {
                title: "Behind the Scenes: How We Film a Cinematic Bengali Wedding",
                category: "BEHIND THE SCENES",
                excerpt: "Ever wondered what goes into creating a cinematic Bengali wedding film? From pre-production planning to the final color grade, here's an exclusive behind-the-scenes look at our filmmaking process at Dreamline Production.",
                content: `<h2>Behind the Scenes: Creating Cinematic Bengali Wedding Films</h2><p>At Dreamline Production, every wedding film begins weeks before the actual event. Our approach is methodical, creative, and deeply personal — because your wedding film should feel like a feature film, not a home video.</p><h3>Pre-Production: The Planning Phase</h3><p>We start with a detailed meeting to understand your <strong>wedding timeline, venue layout, and personal story</strong>. We scout the venue in advance to identify the best angles, lighting conditions, and potential challenges.</p><h3>The Gear We Bring</h3><p>A typical Dreamline wedding shoot involves:</p><ul><li>3-4 Sony FX6 cinema cameras</li><li>1 DJI Inspire 3 drone for aerials</li><li>Wireless audio systems for vows and mantras</li><li>Gimbal stabilizers for smooth tracking shots</li><li>LED panels for supplemental lighting during indoor rituals</li></ul><h3>On the Day: Our Approach</h3><p>Our team of 5-7 crew members operates with military precision. Each camera operator has a specific assignment — one covers the couple, another captures family reactions, a third handles wide establishing shots, and the fourth focuses on details (jewelry, décor, food).</p><h3>Post-Production: Where Magic Happens</h3><p>We spend 4-6 weeks in post-production. This includes color grading in DaVinci Resolve, sound design with licensed music, and careful narrative editing that tells your love story in a compelling 15-20 minute film.</p><p><strong>Dreamline Production</strong> — Where every frame tells your story. <a href="/luxury">Explore our wedding portfolio</a>.</p>`,
                seo: { title: "Behind the Scenes: How Dreamline Production Films Cinematic Bengali Weddings", description: "Go behind the scenes of a cinematic Bengali wedding film by Dreamline Production. Learn about our camera gear, crew setup, planning process & post-production workflow.", keywords: "behind the scenes wedding film, cinematic wedding production, bengali wedding filmmaking, wedding film process, dreamline production bts" }
            },
            {
                title: "Top 10 Pre-Wedding Shoot Locations in Kolkata and West Bengal",
                category: "WEDDING",
                excerpt: "Planning your pre-wedding photoshoot? Discover the top 10 most stunning locations in Kolkata and West Bengal — from heritage mansions to serene tea gardens — perfect for creating breathtaking cinematic memories.",
                content: `<h2>Top 10 Pre-Wedding Shoot Locations in Kolkata & West Bengal</h2><p>A pre-wedding shoot is your opportunity to create artistic, personal images that tell your love story before the big day. Kolkata and West Bengal offer an incredible variety of backdrops, from colonial architecture to lush natural landscapes.</p><h3>1. Prinsep Ghat</h3><p>The iconic Palladian porch overlooking the Hooghly River provides a romantic European ambiance right in the heart of Kolkata. Golden hour here is unmatched.</p><h3>2. Marble Palace</h3><p>This 19th-century neoclassical mansion offers ornate interiors with antique mirrors, chandeliers, and marble sculptures — perfect for a regal pre-wedding theme.</p><h3>3. Shantiniketan</h3><p>The red laterite pathways, murals, and Tagore's legacy create a deeply artistic setting for couples who value culture and aesthetics.</p><h3>4. Botanical Garden, Howrah</h3><p>The Great Banyan Tree and lush greenery provide a magical, almost otherworldly backdrop for romantic portraits.</p><h3>5. Darjeeling Tea Gardens</h3><p>For couples willing to travel, the misty tea estates of Darjeeling with Kanchenjunga in the background are simply breathtaking.</p><h3>6-10: More Hidden Gems</h3><ul><li><strong>Jorasanko Thakur Bari</strong> — Heritage Bengali architecture</li><li><strong>Eco Park</strong> — Modern landscapes and lake reflections</li><li><strong>Belur Math</strong> — Spiritual serenity and symmetrical architecture</li><li><strong>Murshidabad</strong> — Royal Nawabi grandeur</li><li><strong>Mandarmani Beach</strong> — Coastal romance at sunset</li></ul><p>At <strong>Dreamline Production</strong>, we specialize in location-based pre-wedding cinematography. <a href="/contact">Book your shoot today</a>.</p>`,
                seo: { title: "Top 10 Pre-Wedding Shoot Locations in Kolkata & West Bengal 2026", description: "Discover the best pre-wedding photoshoot locations in Kolkata and West Bengal including Prinsep Ghat, Marble Palace, Darjeeling tea gardens & more. By Dreamline Production.", keywords: "pre wedding shoot locations kolkata, best pre wedding shoot places west bengal, kolkata pre wedding photography, pre wedding photoshoot kolkata, dreamline production pre wedding" }
            },
            {
                title: "Why Every Business in Kolkata Needs a Professional Corporate Video",
                category: "INSIGHT",
                excerpt: "In 2026, video content drives 82% of online engagement. Learn why Kolkata businesses — from startups to established brands — need professional corporate videos and how Dreamline Production delivers cinematic commercial content.",
                content: `<h2>Why Kolkata Businesses Need Professional Corporate Video in 2026</h2><p>Video is no longer optional for businesses — it's the primary medium through which consumers discover, evaluate, and choose brands. In Kolkata's competitive market, a professionally produced corporate video can be the difference between blending in and standing out.</p><h3>The Numbers Don't Lie</h3><ul><li>82% of all internet traffic in 2026 is video content</li><li>Businesses with video grow revenue 49% faster</li><li>Landing pages with video increase conversions by 80%</li><li>Social media posts with video get 48% more engagement</li></ul><h3>Types of Corporate Videos We Produce</h3><p>At Dreamline Production, we offer a full range of commercial video solutions:</p><ul><li><strong>Brand Films</strong> — Tell your company's story in 2-3 minutes</li><li><strong>Product Launch Videos</strong> — Create buzz for new offerings</li><li><strong>Testimonial Videos</strong> — Build trust with real customer stories</li><li><strong>Social Media Reels</strong> — Optimized for Instagram and YouTube Shorts</li><li><strong>Event Coverage</strong> — Document corporate events, launches, and conferences</li></ul><h3>Our Commercial Process</h3><p>We follow a structured 4-step approach: Brief → Script → Shoot → Deliver. Every commercial we produce goes through professional color grading and sound mixing to ensure broadcast-quality output.</p><p>Ready to elevate your brand? <a href="/commercial">See our commercial portfolio</a> or <a href="/contact">contact us for a quote</a>.</p>`,
                seo: { title: "Why Every Kolkata Business Needs Professional Corporate Video | Dreamline Production", description: "Discover why professional corporate video is essential for Kolkata businesses in 2026. Learn about brand films, product videos & social media content by Dreamline Production.", keywords: "corporate video production kolkata, commercial video kolkata, brand film kolkata, business video production, dreamline production commercial" }
            },
            {
                title: "The Ultimate Guide to Candid Wedding Photography in India",
                category: "WEDDING",
                excerpt: "Candid wedding photography captures the authentic emotions of your big day. This comprehensive guide explains the techniques, equipment, and artistic vision behind stunning candid wedding photos in India.",
                content: `<h2>The Ultimate Guide to Candid Wedding Photography in India</h2><p>Candid photography has revolutionized the Indian wedding industry. Unlike traditional posed shots, candid photography captures <strong>genuine emotions, spontaneous laughter, tearful moments, and joyful celebrations</strong> as they naturally unfold.</p><h3>What Makes Candid Photography Different?</h3><p>Traditional wedding photography puts the camera at the center — everyone looks at the lens, smiles, and holds still. Candid photography reverses this. The photographer becomes invisible, blending into the crowd to capture moments that would otherwise go unnoticed.</p><h3>Techniques We Use at Dreamline Production</h3><ul><li><strong>Long telephoto lenses (70-200mm)</strong> to capture intimate moments from a distance</li><li><strong>Fast prime lenses (35mm f/1.4, 85mm f/1.4)</strong> for beautiful bokeh in low-light rituals</li><li><strong>Dual camera bodies</strong> so we never miss a moment changing lenses</li><li><strong>Silent shutter mode</strong> to eliminate the click sound during emotional ceremonies</li></ul><h3>Why Indian Weddings Are Perfect for Candid Photography</h3><p>Indian weddings are inherently emotional, colorful, and chaotic — in the best way possible. The Haldi ceremony with turmeric-smeared faces, the Bidaai with tearful goodbyes, the Baraat with dancing relatives — every moment is a storytelling goldmine.</p><p>Book <strong>Dreamline Production</strong> for candid wedding photography that preserves the soul of your celebration. <a href="/contact">Connect with us</a>.</p>`,
                seo: { title: "The Ultimate Guide to Candid Wedding Photography in India | Dreamline Production", description: "Learn everything about candid wedding photography in India — techniques, equipment, and artistic approach. Expert guide by Dreamline Production, Kolkata.", keywords: "candid wedding photography india, candid photographer kolkata, wedding candid shots, natural wedding photography, dreamline production candid" }
            },
            {
                title: "Color Grading Secrets: How We Create the Dreamline Cinematic Look",
                category: "TECHNICAL",
                excerpt: "Color grading transforms raw footage into art. Learn the secrets behind Dreamline Production's signature cinematic look — from LOG profiles to DaVinci Resolve workflows and custom LUTs.",
                content: `<h2>Color Grading Secrets: The Dreamline Cinematic Look</h2><p>Color grading is perhaps the single most important post-production step that separates amateur footage from cinematic films. At Dreamline Production, our signature look has become recognized across Kolkata's wedding and commercial industry.</p><h3>Why We Shoot in LOG</h3><p>All our cameras — Sony FX6, RED Komodo, and Sony A7S III — shoot in <strong>LOG color profiles</strong> (S-Log3, REDWideGamutRGB). This captures maximum dynamic range, preserving detail in both shadows and highlights that would otherwise be lost in standard color profiles.</p><h3>Our DaVinci Resolve Workflow</h3><ol><li><strong>Conform & Organize</strong> — Multi-cam sync and timeline assembly</li><li><strong>Primary Correction</strong> — Exposure balancing, white balance, contrast</li><li><strong>Color Space Transform</strong> — Converting from camera-native to Rec. 709</li><li><strong>Creative Grade</strong> — Our signature warm tones, lifted blacks, and controlled saturation</li><li><strong>Skin Tone Qualification</strong> — Ensuring natural, flattering skin tones across Indian skin complexions</li><li><strong>Final Polish</strong> — Grain, vignetting, and subtle film emulation</li></ol><h3>The Dreamline Signature</h3><p>Our look is characterized by <strong>warm golden highlights, deep teal shadows, and rich skin tones</strong>. We avoid overly desaturated or overly punchy looks — our goal is timeless elegance that looks beautiful 20 years from now.</p><p>Want the Dreamline look for your wedding or commercial project? <a href="/contact">Let's talk</a>.</p>`,
                seo: { title: "Color Grading Secrets for Cinematic Wedding Films | Dreamline Production", description: "Discover the color grading secrets behind Dreamline Production's signature cinematic wedding look. Learn about LOG shooting, DaVinci Resolve workflows & custom LUTs.", keywords: "color grading wedding film, cinematic color grading, davinci resolve wedding, wedding film post production, dreamline production color grade" }
            },
            {
                title: "Wedding Photography Pricing in Kolkata: What to Expect in 2026",
                category: "INSIGHT",
                excerpt: "Confused about wedding photography pricing in Kolkata? This transparent guide breaks down costs, what's included, and how to choose the right package for your budget — from basic coverage to premium cinematic packages.",
                content: `<h2>Wedding Photography & Videography Pricing in Kolkata: 2026 Guide</h2><p>One of the most common questions we receive at Dreamline Production is about pricing. Wedding photography and videography costs in Kolkata vary dramatically, and understanding what you're paying for is essential to making the right choice.</p><h3>Factors That Affect Pricing</h3><ul><li><strong>Number of events</strong> — Single day vs. multi-day celebrations</li><li><strong>Crew size</strong> — Solo photographer vs. full 5-7 person team</li><li><strong>Equipment quality</strong> — DSLR vs. cinema-grade cameras</li><li><strong>Deliverables</strong> — Photos only vs. photos + cinematic film + same-day edit</li><li><strong>Post-production time</strong> — Basic editing vs. premium color grading and sound design</li></ul><h3>Kolkata Market Overview 2026</h3><p>Budget photography (single camera, basic editing): ₹25,000 - ₹50,000<br>Mid-range (2 cameras, good editing): ₹75,000 - ₹1,50,000<br>Premium cinematic (3-4 cameras, cinema-grade, full production): ₹2,00,000 - ₹5,00,000+</p><h3>What's Included in a Dreamline Premium Package?</h3><ul><li>Multi-camera cinematic coverage</li><li>Drone aerial photography and videography</li><li>Professional audio capture</li><li>400-500+ edited photographs</li><li>15-20 minute cinematic wedding film</li><li>2-3 minute highlight reel</li><li>Same-day edit for reception</li></ul><p>Every couple's needs are different. <a href="/contact">Contact us</a> for a personalized quote tailored to your wedding.</p>`,
                seo: { title: "Wedding Photography Pricing in Kolkata 2026 — Complete Guide | Dreamline Production", description: "Complete guide to wedding photography and videography pricing in Kolkata for 2026. Understand costs, packages & what to expect from Dreamline Production.", keywords: "wedding photography price kolkata, wedding videography cost kolkata, kolkata wedding photographer rates, wedding package kolkata 2026, dreamline production pricing" }
            },
            {
                title: "Monsoon Wedding Photography in Kolkata: Tips and Inspiration",
                category: "WEDDING",
                excerpt: "Monsoon weddings in Kolkata have a magical charm — rain-soaked rituals, dramatic skies, and lush greenery. Learn expert tips for stunning monsoon wedding photography and how to embrace the rain beautifully.",
                content: `<h2>Monsoon Wedding Photography in Kolkata: Embrace the Rain</h2><p>Many couples worry about rain on their wedding day, but at Dreamline Production, we've learned that monsoon weddings in Kolkata produce some of the most <strong>dramatic, romantic, and visually stunning</strong> photographs imaginable.</p><h3>Why Monsoon Light is Magical</h3><p>Overcast skies act as a giant softbox, creating perfectly diffused, even lighting with no harsh shadows. This means:</p><ul><li>Flawless skin tones without squinting</li><li>Rich, saturated colors in sarees and lehengas</li><li>Dramatic cloud formations as backdrops</li><li>Beautiful reflections on wet surfaces</li></ul><h3>How We Handle Rain at Dreamline</h3><p>Our equipment is weather-sealed and we carry protective rain covers for all cameras. We also bring waterproof LED panels to ensure ceremony coverage isn't affected. More importantly, our team is trained to <strong>see rain as an opportunity, not an obstacle</strong>.</p><h3>Creative Monsoon Shot Ideas</h3><ul><li>Couple sharing a transparent umbrella during golden hour</li><li>Reflection shots in rain puddles</li><li>Slow-motion rain falling during the Saptapadi</li><li>Dramatic wide shots with lightning in the background</li></ul><p>Don't fear the monsoon — embrace it! <a href="/luxury">See our monsoon wedding portfolio</a>.</p>`,
                seo: { title: "Monsoon Wedding Photography in Kolkata — Tips & Inspiration | Dreamline Production", description: "Expert tips for stunning monsoon wedding photography in Kolkata. Learn how to embrace the rain for dramatic, romantic wedding photos by Dreamline Production.", keywords: "monsoon wedding photography kolkata, rainy wedding photoshoot, kolkata monsoon wedding, wedding photography tips rain, dreamline production monsoon" }
            },
            {
                title: "How Drone Photography is Transforming Indian Weddings",
                category: "TECHNICAL",
                excerpt: "Drone photography has revolutionized wedding coverage in India. From sweeping venue aerials to dramatic baraat processions, discover how aerial cinematography adds a Hollywood dimension to your wedding film.",
                content: `<h2>How Drone Photography is Transforming Indian Weddings</h2><p>Five years ago, drone shots at Indian weddings were a luxury reserved for celebrity celebrations. Today, aerial cinematography has become an essential element of premium wedding coverage — and for good reason.</p><h3>What Drones Capture That Ground Cameras Cannot</h3><ul><li><strong>Venue reveals</strong> — Sweeping shots that showcase the entire wedding setup</li><li><strong>Baraat procession</strong> — Bird's-eye view of the groom's procession</li><li><strong>Group photographs</strong> — Unique overhead angle for large family groups</li><li><strong>Destination settings</strong> — Showcasing scenic locations (beaches, mountains, heritage properties)</li></ul><h3>Our Drone Setup</h3><p>At Dreamline Production, we use the <strong>DJI Inspire 3</strong> — a professional cinema drone capable of shooting 8K RAW footage. This drone provides:</p><ul><li>Obstacle avoidance for safe indoor/outdoor operation</li><li>Smooth, stabilized footage even in wind</li><li>Interchangeable lenses for creative flexibility</li><li>Night shooting capability with enhanced low-light sensor</li></ul><h3>Legal Considerations in India</h3><p>We hold all necessary DGCA drone permissions and operate within the legal framework. Our pilot is certified and we always coordinate with venue management before flying.</p><p>Add the aerial dimension to your wedding. <a href="/contact">Book Dreamline Production with drone coverage</a>.</p>`,
                seo: { title: "How Drone Photography is Transforming Indian Weddings | Dreamline Production", description: "Discover how drone photography is transforming Indian wedding coverage with stunning aerial cinematography. Professional drone wedding videography by Dreamline Production.", keywords: "drone wedding photography india, aerial wedding videography, drone wedding kolkata, DJI wedding cinematography, dreamline production drone" }
            },
            {
                title: "The Art of Same-Day Wedding Film Edits: How We Do It",
                category: "BEHIND THE SCENES",
                excerpt: "Imagine watching a cinematic highlight of your wedding ceremony at your own reception! Learn how Dreamline Production creates stunning same-day edits — a complex logistical feat that wows every audience.",
                content: `<h2>Same-Day Wedding Film Edits: A Dreamline Specialty</h2><p>A same-day edit (SDE) is a professionally edited short film of your wedding ceremony, ready to screen at your own reception just hours after it happened. It's one of the most impactful services we offer at Dreamline Production.</p><h3>How Is This Even Possible?</h3><p>Creating an SDE requires a dedicated editing station on-site. Here's our workflow:</p><ol><li><strong>Morning Ceremony</strong> — Our camera team captures the key moments</li><li><strong>Rolling Ingest</strong> — Memory cards are shuttled to our on-site editor as they fill up</li><li><strong>Parallel Editing</strong> — Our editor begins assembly while the ceremony is still ongoing</li><li><strong>Music Selection</strong> — Pre-approved tracks are synced to emotional peaks</li><li><strong>Color & Sound</strong> — Quick color grade and audio mix</li><li><strong>Screening</strong> — The 4-5 minute film is ready for the reception</li></ol><h3>Why SDEs Are So Emotional</h3><p>When guests see the morning's ceremony re-told as a cinematic narrative just hours later, the emotional impact is extraordinary. We've seen entire reception halls in tears of joy.</p><h3>What You Need to Know</h3><ul><li>An SDE requires a minimum crew of 6 (3 shooters + 1 drone + 1 audio + 1 editor)</li><li>A stable power source and quiet workspace at the venue</li><li>At least 4 hours between the ceremony and screening</li></ul><p>Want an SDE at your wedding? <a href="/contact">Discuss this with our team</a>.</p>`,
                seo: { title: "Same-Day Wedding Film Edits: How Dreamline Production Creates Them", description: "Learn how Dreamline Production creates stunning same-day wedding film edits screened at your own reception. Discover the process, crew & requirements.", keywords: "same day edit wedding, SDE wedding film, same day wedding video, wedding highlight same day, dreamline production same day edit" }
            },
            {
                title: "Why Studio Photography is Making a Comeback for Portraits",
                category: "INSIGHT",
                excerpt: "Studio photography is experiencing a renaissance in 2026. From controlled lighting to creative backdrops, discover why Kolkata's most stylish clients are choosing studio sessions for portraits, headshots, and branding.",
                content: `<h2>Why Studio Photography is Making a Comeback in 2026</h2><p>For years, outdoor location shoots dominated the portrait photography landscape. But in 2026, we're seeing a significant shift back to studio photography — and it's not your grandmother's studio experience.</p><h3>The New Studio Aesthetic</h3><p>Modern studio portraits combine <strong>precise lighting control, creative backdrops, and editorial styling</strong> to create images that rival fashion magazine covers. At Dreamline Production's studio at Tilottama Plaza, we've invested in:</p><ul><li>Profoto B10X studio strobes for precise lighting</li><li>V-Flat and negative fill panels for dramatic shadows</li><li>Seamless paper and hand-painted canvas backdrops</li><li>Fog machines and color gels for creative effects</li></ul><h3>Who Benefits from Studio Photography?</h3><ul><li><strong>Business professionals</strong> — LinkedIn headshots and corporate profiles</li><li><strong>Artists and musicians</strong> — Promotional material and album artwork</li><li><strong>Couples</strong> — Intimate pre-wedding portraits</li><li><strong>Families</strong> — Generational portraits with timeless studio lighting</li><li><strong>Brands</strong> — Product photography with controlled environments</li></ul><h3>The Dreamline Studio Difference</h3><p>We don't just place you in front of a backdrop and click. Every studio session is art-directed with attention to wardrobe, posing, and lighting that matches your personality and purpose.</p><p>Book a studio session at <strong>Dreamline Production</strong>. <a href="/contact">Contact us</a>.</p>`,
                seo: { title: "Why Studio Photography is Making a Comeback in 2026 | Dreamline Production Kolkata", description: "Discover why studio photography is trending in 2026 for portraits, headshots & branding. Professional studio sessions at Dreamline Production, Kolkata.", keywords: "studio photography kolkata, portrait photography kolkata, professional headshots kolkata, studio photoshoot kolkata, dreamline production studio" }
            },
            {
                title: "Audio in Wedding Films: Why Sound Quality is as Important as Visuals",
                category: "TECHNICAL",
                excerpt: "A beautiful wedding film with poor audio is a failed film. Learn why professional audio capture — from vows to mantras to ambient sounds — is essential for creating truly immersive cinematic wedding films.",
                content: `<h2>Audio in Wedding Films: The Overlooked Game-Changer</h2><p>You can have the most beautifully shot wedding footage in the world, but if the audio is muffled, echoey, or missing entirely, the emotional impact drops to zero. At Dreamline Production, we treat audio with the same reverence as our visuals.</p><h3>Why Most Wedding Videos Have Bad Audio</h3><p>The harsh truth: many videographers rely solely on their camera's built-in microphone or a single on-camera shotgun mic. In a noisy wedding environment with live music, chattering guests, and outdoor wind, this approach fails spectacularly.</p><h3>Our Audio Capture Setup</h3><ul><li><strong>Wireless lavalier mics</strong> on the priest, bride, and groom for crystal-clear vows</li><li><strong>Shotgun microphone</strong> on the main camera for ambient ceremony sounds</li><li><strong>Portable audio recorder</strong> (Zoom F6) as a backup and for high-quality audio capture</li><li><strong>Direct audio feed</strong> from the DJ/sound system for reception speeches</li></ul><h3>Sound Design in Post-Production</h3><p>Beyond clean recording, our editors carefully layer:</p><ul><li>Background music (licensed, royalty-free tracks)</li><li>Ambient soundscapes (subtle birdsong for outdoor ceremonies)</li><li>Audio transitions and fades between scenes</li><li>De-noising and equalization for speech clarity</li></ul><p>Great audio is invisible — you don't notice it when it's done right, but you absolutely notice when it's wrong. <a href="/contact">Trust Dreamline Production</a> to get it right.</p>`,
                seo: { title: "Why Audio Quality in Wedding Films Matters as Much as Visuals | Dreamline Production", description: "Learn why professional audio capture is essential for cinematic wedding films. Discover Dreamline Production's audio setup for vows, mantras & ambient sound.", keywords: "wedding film audio, sound quality wedding video, wedding audio recording, wedding videography audio, dreamline production audio" }
            },
            {
                title: "Social Media Video Content Strategy for Kolkata Businesses in 2026",
                category: "INSIGHT",
                excerpt: "Social media video is the #1 marketing tool for businesses in 2026. Learn how to create a winning video content strategy for Instagram Reels, YouTube Shorts, and LinkedIn — with examples from Kolkata brands.",
                content: `<h2>Social Media Video Strategy for Kolkata Businesses</h2><p>In 2026, if your Kolkata business isn't publishing video content regularly, you're invisible to a massive portion of your potential customers. The good news? You don't need a Hollywood budget — you need a strategy.</p><h3>Platform-Specific Video Formats</h3><ul><li><strong>Instagram Reels (15-60 sec)</strong> — Quick product demos, BTS clips, customer testimonials</li><li><strong>YouTube Shorts (15-60 sec)</strong> — Educational tips, before/after reveals, quick tutorials</li><li><strong>LinkedIn (1-3 min)</strong> — Thought leadership, company culture, industry insights</li><li><strong>YouTube Long-form (3-10 min)</strong> — Detailed brand stories, case studies, how-to guides</li></ul><h3>Content Pillars We Recommend</h3><ol><li><strong>Educational</strong> — Teach your audience something valuable related to your industry</li><li><strong>Behind-the-Scenes</strong> — Show the human side of your business</li><li><strong>Testimonials</strong> — Let satisfied customers speak for you</li><li><strong>Product/Service Showcases</strong> — Demonstrate what you offer visually</li><li><strong>Trending & Relatable</strong> — Participate in trends relevant to your niche</li></ol><h3>Why Professional Production Matters</h3><p>While smartphone content works for casual posts, your brand's hero content should be professionally produced. It's the first impression many potential customers will have of your business.</p><p><a href="/commercial">Explore Dreamline Production's commercial services</a> for Kolkata businesses.</p>`,
                seo: { title: "Social Media Video Content Strategy for Kolkata Businesses 2026 | Dreamline Production", description: "Create a winning social media video strategy for your Kolkata business in 2026. Expert tips for Instagram Reels, YouTube Shorts & LinkedIn by Dreamline Production.", keywords: "social media video kolkata, video content strategy, instagram reels business kolkata, youtube shorts business, dreamline production social media" }
            },
            {
                title: "Destination Wedding Videography: Filming Beyond Kolkata",
                category: "WEDDING",
                excerpt: "From Rajasthan palaces to Goa beaches, destination weddings demand a unique approach to filmmaking. Discover how Dreamline Production handles logistics, equipment, and storytelling for destination wedding coverage across India.",
                content: `<h2>Destination Wedding Videography: Beyond Kolkata</h2><p>While Kolkata is our home base, Dreamline Production regularly films destination weddings across India — from the royal palaces of Rajasthan to the sun-kissed beaches of Goa, the backwaters of Kerala to the mountains of Himachal Pradesh.</p><h3>Popular Destination Wedding Locations We've Covered</h3><ul><li><strong>Udaipur</strong> — Lake Palace, Jagmandir, City Palace</li><li><strong>Goa</strong> — Beachside resorts, Portuguese heritage venues</li><li><strong>Jim Corbett</strong> — Jungle-themed luxury weddings</li><li><strong>Jaipur</strong> — Amer Fort, Rambagh Palace</li><li><strong>Rishikesh</strong> — Riverside spiritual ceremonies</li></ul><h3>How We Handle Destination Logistics</h3><p>Destination weddings are logistically complex. Our approach includes:</p><ul><li>Advance venue recce (in-person or via video call)</li><li>Equipment transport in flight-safe hard cases</li><li>Backup gear for every critical piece of equipment</li><li>Local crew coordination when additional hands are needed</li><li>Power management for locations without reliable electricity</li></ul><h3>The Storytelling Advantage</h3><p>Destination weddings offer incredible visual variety — and we leverage every bit of it. From sunrise haldi ceremonies overlooking lakes to midnight sangeet parties under desert stars, the visual palette is limitless.</p><p>Planning a destination wedding? <a href="/contact">Let Dreamline Production handle the cinematography</a>.</p>`,
                seo: { title: "Destination Wedding Videography Across India | Dreamline Production Kolkata", description: "Professional destination wedding videography across India by Dreamline Production. From Udaipur to Goa to Darjeeling — cinematic wedding films beyond Kolkata.", keywords: "destination wedding videography india, destination wedding photographer kolkata, wedding cinematography udaipur goa, destination wedding film, dreamline production destination" }
            },
            {
                title: "How to Prepare for Your Wedding Photoshoot: A Bride's Complete Guide",
                category: "WEDDING",
                excerpt: "Getting the best wedding photos starts with preparation. This comprehensive guide covers everything brides need to know — from makeup timing to outfit selection to communicating with your photographer.",
                content: `<h2>How to Prepare for Your Wedding Photoshoot: Complete Bride's Guide</h2><p>At Dreamline Production, we've photographed hundreds of weddings. The brides who are most happy with their photos are invariably the ones who prepared well. Here's everything you need to know.</p><h3>2 Weeks Before</h3><ul><li><strong>Trial makeup</strong> — Ensure your makeup artist knows what looks good on camera (matte finishes photograph better than dewy)</li><li><strong>Outfit steaming</strong> — Get your lehenga/saree professionally steamed</li><li><strong>Communicate with your photographer</strong> — Share a Pinterest board of shots you love</li><li><strong>Confirm timeline</strong> — Coordinate with your photographer on exact event timings</li></ul><h3>The Day Before</h3><ul><li>Get a good night's sleep (at least 7-8 hours)</li><li>Hydrate well for glowing skin</li><li>Prepare accessories and jewelry in organized pouches</li><li>Confirm venue access timing with your photographer</li></ul><h3>Day of the Wedding</h3><ul><li>Start makeup at least 3 hours before the ceremony</li><li>Allow 30 minutes for a relaxed getting-ready photoshoot</li><li>Keep a touch-up kit accessible (blotting paper, lipstick, setting spray)</li><li>Designate a family member to coordinate with the photo team</li></ul><h3>During the Ceremony</h3><p>The best advice? <strong>Forget the camera exists.</strong> Live in the moment, feel the emotions, and let us handle capturing it all. The most beautiful photographs come from genuine, unscripted moments.</p><p>Ready to book? <a href="/contact">Connect with Dreamline Production</a>.</p>`,
                seo: { title: "How to Prepare for Your Wedding Photoshoot — Bride's Complete Guide | Dreamline Production", description: "Complete guide for brides on how to prepare for wedding photography. Tips on makeup, outfits, timeline & communicating with your photographer by Dreamline Production.", keywords: "wedding photoshoot preparation, bride wedding photography tips, how to prepare for wedding photos, bridal photography guide, dreamline production bride guide" }
            },
            {
                title: "Our Camera Gear for 2026: A Technical Deep Dive",
                category: "TECHNICAL",
                excerpt: "Curious about the cameras and lenses behind our cinematic wedding films? Here's a complete breakdown of Dreamline Production's professional gear inventory for 2026 — from cinema cameras to audio equipment.",
                content: `<h2>Dreamline Production Camera Gear 2026: Technical Breakdown</h2><p>Our clients often ask about the equipment we use. While gear alone doesn't make great films (storytelling does), having the right tools is essential for achieving the cinematic quality our clients expect.</p><h3>Cinema Cameras</h3><ul><li><strong>Sony FX6</strong> (x3) — Our workhorse for weddings. Full-frame sensor, 4K 120fps, incredible low-light performance, dual card slots</li><li><strong>RED Komodo 6K</strong> (x1) — For high-end commercial work and fashion shoots. Global shutter, 6K RAW</li><li><strong>Sony A7S III</strong> (x2) — Compact bodies for handheld and gimbal work. 12MP full-frame, ISO monster</li></ul><h3>Lenses</h3><ul><li>Sony 24-70mm f/2.8 GM II — Versatile zoom for ceremonies</li><li>Sony 70-200mm f/2.8 GM II — Telephoto for candid coverage</li><li>Sony 35mm f/1.4 GM — Wide environmental portraits</li><li>Sony 85mm f/1.4 GM — Portrait king</li><li>Sigma 14mm f/1.8 Art — Astrophotography and venue-wide shots</li></ul><h3>Support & Movement</h3><ul><li>DJI Ronin 4D gimbal for smooth tracking shots</li><li>DJI Inspire 3 drone for aerial cinematography</li><li>Easyrig for prolonged handheld shooting comfort</li><li>Professional tripods and monopods</li></ul><h3>Audio & Lighting</h3><ul><li>Sennheiser EW-D wireless lavalier systems (x4)</li><li>Rode NTG5 shotgun microphones</li><li>Zoom F6 multitrack recorder</li><li>Aputure 600d Pro and 300x LED lights</li></ul><p>Great gear in skilled hands. <a href="/contact">Book Dreamline Production</a> for your next project.</p>`,
                seo: { title: "Camera Gear We Use for Cinematic Wedding Films 2026 | Dreamline Production", description: "Complete technical breakdown of Dreamline Production's camera gear for 2026 — Sony FX6, RED Komodo, cinema lenses, drones, audio & lighting equipment.", keywords: "wedding cinema camera gear, sony fx6 wedding, red komodo wedding, cinema camera equipment 2026, dreamline production camera gear" }
            },
            {
                title: "The Importance of Storytelling in Commercial Advertisements",
                category: "INSIGHT",
                excerpt: "Facts tell, but stories sell. Learn why narrative-driven commercial videos outperform traditional ads and how Dreamline Production creates compelling brand stories that connect with audiences emotionally.",
                content: `<h2>Why Storytelling Wins in Commercial Advertising</h2><p>In an era of ad-blockers and short attention spans, the brands that succeed are the ones that <strong>tell stories, not sell products</strong>. At Dreamline Production, narrative-driven commercials are at the core of our philosophy.</p><h3>The Science Behind Story</h3><p>Neuroscience research shows that stories activate the same brain regions as personal experiences. When a viewer watches a well-crafted brand story, their brain releases oxytocin (the empathy hormone), creating an emotional bond with the brand.</p><h3>Story-Driven vs. Product-Driven Ads</h3><ul><li><strong>Product-driven</strong>: "Our product has X feature, Y benefit, Z price." (Forgettable)</li><li><strong>Story-driven</strong>: "Here's how our product changed someone's life." (Memorable)</li></ul><h3>Our Storytelling Framework</h3><ol><li><strong>The Hook</strong> — A compelling opening that grabs attention in 3 seconds</li><li><strong>The Problem</strong> — A relatable challenge the audience faces</li><li><strong>The Journey</strong> — How the brand/product provides a solution</li><li><strong>The Transformation</strong> — The emotional payoff</li><li><strong>The Call to Action</strong> — A clear next step</li></ol><h3>Kolkata Brand Success Stories</h3><p>We've helped Kolkata-based businesses increase their engagement by 300%+ through story-driven video content. From boutique fashion labels to tech startups, the approach is universally effective.</p><p><a href="/commercial">View our commercial portfolio</a> or <a href="/contact">discuss your brand's story with us</a>.</p>`,
                seo: { title: "The Importance of Storytelling in Commercial Advertisements | Dreamline Production", description: "Learn why narrative-driven commercial videos outperform traditional ads. Discover Dreamline Production's storytelling framework for brand videos in Kolkata.", keywords: "storytelling commercial advertising, brand story video, narrative advertising kolkata, commercial video storytelling, dreamline production commercial storytelling" }
            },
            {
                title: "Bengali Wedding Rituals: A Photographer's Guide to Every Ceremony",
                category: "WEDDING",
                excerpt: "From Ashirbaad to Bou Bhaat — understanding every Bengali wedding ritual is essential for capturing the right moments. This photographer's guide explains each ceremony and the key shots to capture.",
                content: `<h2>Bengali Wedding Rituals: Every Ceremony Explained for Photographers</h2><p>Bengali weddings are rich with tradition, emotion, and visual beauty. As photographers and videographers, understanding each ritual is crucial for knowing <strong>when to shoot, where to position, and what moments to prioritize</strong>.</p><h3>Pre-Wedding Rituals</h3><ul><li><strong>Ashirbaad</strong> — The blessing ceremony where elders bless the couple. Key shot: hands touching feet, elder's expressions</li><li><strong>Gaye Holud</strong> — Turmeric ceremony. Key shot: friends smearing haldi on the couple's faces, laughter</li><li><strong>Dodhi Mangal</strong> — Early morning milk ceremony. Key shot: the bride by candlelight</li></ul><h3>Wedding Day Rituals</h3><ul><li><strong>Bor Jatri</strong> — Groom's procession. Key shot: wide aerial of the procession, groom's arrival</li><li><strong>Baran / Boron</strong> — Bride's welcome. Key shot: bride's mother performing aarti</li><li><strong>Shubho Drishti</strong> — First glance between bride and groom. Key shot: the exact moment their eyes meet</li><li><strong>Saptapadi</strong> — Seven circles around the fire. Key shot: low-angle through flames, couple's feet</li><li><strong>Sindoor Daan</strong> — Applying vermillion. Key shot: close-up of the moment, bride's reaction</li></ul><h3>Post-Wedding</h3><ul><li><strong>Bidaai</strong> — The most emotional moment. Key shot: bride's tears, parents' farewell</li><li><strong>Bou Bhaat</strong> — Bride's first meal hosting. Key shot: couple serving guests together</li></ul><p>At <strong>Dreamline Production</strong>, we're experts in Bengali wedding storytelling. <a href="/luxury">View our wedding portfolio</a>.</p>`,
                seo: { title: "Bengali Wedding Rituals: A Photographer's Complete Guide | Dreamline Production", description: "Complete guide to Bengali wedding rituals for photographers — from Ashirbaad to Bou Bhaat. Learn which moments to capture at every ceremony by Dreamline Production.", keywords: "bengali wedding rituals photography, bengali wedding ceremony guide, kolkata wedding traditions, bengali wedding photographer guide, dreamline production bengali wedding" }
            },
            {
                title: "Music Video Production in Kolkata: From Concept to Release",
                category: "BEHIND THE SCENES",
                excerpt: "Kolkata's independent music scene is thriving, and music videos are essential for artist visibility. Learn about Dreamline Production's end-to-end music video production process — concept, shoot, edit, and release strategy.",
                content: `<h2>Music Video Production in Kolkata: End-to-End Guide</h2><p>Kolkata has always been a cultural capital of India, and its independent music scene is booming. A well-produced music video can launch an artist from obscurity to recognition — and at Dreamline Production, we specialize in making that happen.</p><h3>Our Music Video Process</h3><ol><li><strong>Concept & Mood Board</strong> — We listen to the track multiple times and develop a visual concept that amplifies the song's emotion</li><li><strong>Storyboarding</strong> — Scene-by-scene breakdown with shot descriptions, locations, and wardrobe</li><li><strong>Location Scouting</strong> — Finding the perfect Kolkata locations that match the mood</li><li><strong>Production Day</strong> — Full crew with cinema cameras, lighting, and art direction</li><li><strong>Post-Production</strong> — Edit, color grade, VFX (if needed), and final master</li><li><strong>Release Strategy</strong> — YouTube upload optimization, thumbnail design, social media teasers</li></ol><h3>Budget Considerations</h3><p>Music videos can range from ₹50,000 for a simple performance video to ₹5,00,000+ for a full narrative production with actors, locations, and VFX. We work with artists to find the sweet spot between creative vision and budget reality.</p><h3>Recent Work</h3><p>We've produced music videos across genres — from Bengali folk fusion to Bollywood-style pop, rap, and indie rock. Each project receives the same level of cinematic attention.</p><p>Ready to bring your music to life visually? <a href="/contact">Contact Dreamline Production</a>.</p>`,
                seo: { title: "Music Video Production in Kolkata — Concept to Release | Dreamline Production", description: "Complete guide to music video production in Kolkata. From concept and storyboarding to shooting and release strategy by Dreamline Production.", keywords: "music video production kolkata, music video maker kolkata, mv production bengal, music video cinematography, dreamline production music video" }
            },
            {
                title: "The Evolution of Wedding Films in India: From VHS to 8K Cinematic",
                category: "INSIGHT",
                excerpt: "Indian wedding videography has come a long way — from shaky VHS tapes to 8K cinematic masterpieces. Trace the fascinating evolution of wedding filmmaking in India and see where the industry is heading next.",
                content: `<h2>The Evolution of Wedding Films in India</h2><p>If you're old enough, you remember the single-camera VHS wedding videos of the 90s — hours of unedited footage with poor audio and worse lighting. The transformation since then has been nothing short of revolutionary.</p><h3>The Timeline</h3><ul><li><strong>1990s — VHS Era</strong>: Single camera, no editing, direct-to-tape recording</li><li><strong>Early 2000s — DVD Era</strong>: Basic editing, title cards, Bollywood songs overdubbed</li><li><strong>2008-2012 — DSLR Revolution</strong>: Canon 5D Mark II changed everything. Shallow depth of field became accessible</li><li><strong>2013-2018 — Cinematic Era</strong>: Multi-camera setups, professional editing, color grading enters the scene</li><li><strong>2019-2023 — Drone & Social Media</strong>: Aerial shots, same-day edits, Instagram-optimized content</li><li><strong>2024-2026 — Immersive Cinema</strong>: 8K resolution, spatial audio, AI-assisted editing, VR wedding experiences</li></ul><h3>Where We Are Now</h3><p>Today's premium wedding films rival Hollywood productions in quality. The best wedding filmmakers use cinema cameras, professional audio, drone footage, and spend weeks in post-production crafting a narrative.</p><h3>Where It's Going</h3><p>The next frontier includes AI-powered editing tools, 360° VR wedding experiences, and even more personalized storytelling approaches.</p><p>Since 2010, <strong>Dreamline Production</strong> has evolved with the industry and pushed the boundaries of what's possible. <a href="/luxury">See our evolution in our portfolio</a>.</p>`,
                seo: { title: "Evolution of Wedding Films in India: VHS to 8K Cinematic | Dreamline Production", description: "Trace the fascinating evolution of Indian wedding videography from VHS tapes to 8K cinematic masterpieces. History of wedding filmmaking by Dreamline Production.", keywords: "evolution wedding films india, wedding videography history, cinematic wedding film history, indian wedding video evolution, dreamline production wedding films" }
            },
            {
                title: "Event Coverage for Kolkata Corporates: What We Offer",
                category: "INSIGHT",
                excerpt: "From product launches to annual galas, professional event coverage elevates your brand's image. Discover Dreamline Production's comprehensive corporate event photography and videography services for Kolkata businesses.",
                content: `<h2>Corporate Event Coverage in Kolkata by Dreamline Production</h2><p>Corporate events — whether they're product launches, conferences, award ceremonies, or annual galas — deserve the same level of production quality as any premium wedding. They represent your brand's image and professionalism.</p><h3>Types of Events We Cover</h3><ul><li><strong>Product Launches</strong> — Multi-camera coverage with highlight reels for social media</li><li><strong>Conferences & Seminars</strong> — Speaker coverage, audience reactions, networking moments</li><li><strong>Award Ceremonies</strong> — Stage photography, candid VIP moments, trophy presentations</li><li><strong>Trade Shows & Exhibitions</strong> — Booth documentation, product displays, visitor interviews</li><li><strong>Corporate Parties & Galas</strong> — Atmospheric photography and cinematic event films</li></ul><h3>Our Corporate Deliverables</h3><ul><li>200-400+ professionally edited photographs</li><li>2-3 minute event highlight video</li><li>Social media-ready content (vertical + horizontal)</li><li>Raw footage archive for future use</li><li>24-48 hour turnaround for select images</li></ul><h3>Why Choose Dreamline for Corporate Events?</h3><p>We understand corporate aesthetics — clean compositions, professional lighting, and discreet presence. Our team blends into your event while capturing every important moment.</p><p><a href="/contact">Get a corporate event coverage quote from Dreamline Production</a>.</p>`,
                seo: { title: "Corporate Event Coverage in Kolkata — Photography & Videography | Dreamline Production", description: "Professional corporate event photography and videography in Kolkata. Product launches, conferences, galas & more by Dreamline Production.", keywords: "corporate event photography kolkata, event coverage kolkata, corporate videography kolkata, event photographer kolkata, dreamline production events" }
            },
            {
                title: "Digital Marketing Through Video: ROI Guide for Indian Businesses",
                category: "INSIGHT",
                excerpt: "Is video marketing worth the investment? Absolutely. This ROI-focused guide shows Indian businesses exactly how professional video content drives leads, conversions, and brand growth with measurable results.",
                content: `<h2>Digital Marketing Through Video: ROI Guide for Indian Businesses</h2><p>One of the biggest hesitations businesses have about video marketing is the cost. "Is it worth the investment?" The data says a resounding <strong>YES</strong>.</p><h3>Video Marketing ROI Statistics (2026)</h3><ul><li>Video marketers get <strong>66% more qualified leads</strong> per year</li><li>Companies using video grow revenue <strong>49% faster</strong></li><li>Adding video to a landing page increases conversions by <strong>80%</strong></li><li>Viewers retain <strong>95% of a message</strong> from video vs. 10% from text</li><li>Social media video generates <strong>1200% more shares</strong> than text and images combined</li></ul><h3>How to Calculate Your Video ROI</h3><p>Track these metrics:</p><ol><li><strong>View count</strong> — How many people watched?</li><li><strong>Engagement rate</strong> — Likes, comments, shares</li><li><strong>Click-through rate</strong> — How many clicked your CTA?</li><li><strong>Conversion rate</strong> — How many took the desired action?</li><li><strong>Cost per acquisition</strong> — Total video cost ÷ conversions</li></ol><h3>Where to Invest First</h3><p>For maximum ROI, prioritize:</p><ol><li>Website homepage video (brand overview)</li><li>Social media Reels/Shorts (awareness)</li><li>Customer testimonial videos (trust building)</li><li>Product/service explanation videos (consideration)</li></ol><p>Dreamline Production helps Kolkata businesses create video content that delivers measurable ROI. <a href="/commercial">View our commercial work</a>.</p>`,
                seo: { title: "Video Marketing ROI Guide for Indian Businesses 2026 | Dreamline Production", description: "Complete ROI guide for video marketing in India. Learn how professional video content drives leads, conversions & brand growth. By Dreamline Production, Kolkata.", keywords: "video marketing ROI india, video content ROI, digital marketing video kolkata, business video marketing, dreamline production video marketing" }
            },
            {
                title: "Luxury Lehenga and Bridal Portrait Photography Tips",
                category: "WEDDING",
                excerpt: "Your bridal lehenga is a work of art — and it deserves to be photographed like one. Expert tips on lighting, angles, and posing to capture the full beauty of your wedding outfit in stunning bridal portraits.",
                content: `<h2>Luxury Lehenga & Bridal Portrait Photography Tips</h2><p>Your bridal lehenga or saree is likely one of the most expensive and beautiful garments you'll ever wear. At Dreamline Production, we've developed specific techniques to ensure every detail — from threadwork to jewelry — is captured in its full glory.</p><h3>Lighting for Fabrics</h3><p>Different fabrics photograph differently:</p><ul><li><strong>Silk</strong> — Needs soft, diffused lighting to avoid harsh reflections. Side-lighting brings out the texture</li><li><strong>Velvet</strong> — Absorbs light; requires slightly more exposure and careful shadow management</li><li><strong>Zardozi & Threadwork</strong> — Angled lighting creates shadows that reveal the depth of embroidery</li><li><strong>Sequins & Mirrors</strong> — Controlled backlighting creates a magical sparkle effect</li></ul><h3>Posing Techniques</h3><ul><li><strong>The Twirl</strong> — Classic lehenga shot that shows the full circumference and flow of the outfit</li><li><strong>Back Detail</strong> — Over-the-shoulder shot showcasing blouse design and hairstyle</li><li><strong>Sitting Drape</strong> — Elegant seated pose that displays the lehenga's dupatta arrangement</li><li><strong>Walking Shot</strong> — Candid walking toward camera, capturing natural movement and fabric flow</li></ul><h3>Detail Shots</h3><p>We dedicate time to macro photography of:</p><ul><li>Jewelry close-ups (necklace, bangles, maang tikka)</li><li>Mehendi designs in natural light</li><li>Shoe details and accessories</li><li>Lehenga border and embroidery details</li></ul><p>Every bridal portrait session with <strong>Dreamline Production</strong> is a fashion shoot. <a href="/contact">Book your bridal session</a>.</p>`,
                seo: { title: "Bridal Portrait & Lehenga Photography Tips | Dreamline Production Kolkata", description: "Expert tips for stunning bridal lehenga and portrait photography — lighting, posing & detail shots. Luxury bridal photography by Dreamline Production, Kolkata.", keywords: "bridal portrait photography, lehenga photography tips, bridal photoshoot kolkata, wedding outfit photography, dreamline production bridal portraits" }
            },
            {
                title: "How We Edit a Cinematic Wedding Film: The 6-Week Process",
                category: "BEHIND THE SCENES",
                excerpt: "Great wedding films aren't made on the wedding day — they're crafted in post-production over 4-6 weeks. Here's an exclusive look at Dreamline Production's editing process from rough cut to final delivery.",
                content: `<h2>How We Edit a Cinematic Wedding Film: The 6-Week Process</h2><p>Many people assume a wedding film is "done" after the shooting day. In reality, the real magic begins in post-production — and at Dreamline Production, we spend 4-6 weeks perfecting every film.</p><h3>Week 1-2: Import, Organize, Selects</h3><p>A typical Dreamline wedding generates <strong>2-4 TB of footage</strong> from multiple cameras and audio sources. The first two weeks are spent:</p><ul><li>Importing and backing up all footage to RAID arrays</li><li>Syncing multi-camera footage with audio</li><li>Reviewing all footage and marking selects (our best clips)</li><li>Creating a timeline structure based on the wedding's narrative arc</li></ul><h3>Week 3: Assembly & Rough Cut</h3><p>We assemble the rough cut — a first pass of the complete film. This is where the story takes shape: what to include, what to cut, and how to pace the narrative.</p><h3>Week 4: Fine Cut & Music</h3><p>The fine cut tightens transitions, matches cuts to music beats, and refines the emotional arc. Licensed music tracks are selected and the film's rhythm is locked.</p><h3>Week 5: Color Grading & Sound Design</h3><p>Using DaVinci Resolve, we apply our signature color grade. Sound is mixed — balancing music, dialogue, and ambient audio for a cinematic experience.</p><h3>Week 6: Review & Delivery</h3><p>The final film goes through quality control, is rendered in 4K, and delivered to the couple via a private viewing link and USB drive.</p><p>Patience produces perfection. <a href="/luxury">See our finished films</a>.</p>`,
                seo: { title: "How We Edit a Cinematic Wedding Film — 6-Week Process | Dreamline Production", description: "Exclusive look at Dreamline Production's 6-week wedding film editing process from rough cut to color grading to final delivery in 4K.", keywords: "wedding film editing process, how wedding films are edited, wedding video post production, cinematic wedding editing, dreamline production editing" }
            },
            {
                title: "Product Photography for E-Commerce: A Kolkata Brand's Guide",
                category: "INSIGHT",
                excerpt: "In e-commerce, product photography is your storefront. Learn how Dreamline Production creates scroll-stopping product images for Kolkata brands selling on Amazon, Flipkart, Instagram, and their own websites.",
                content: `<h2>Product Photography for E-Commerce in Kolkata</h2><p>In the world of e-commerce, your product photographs ARE your product. Customers can't touch, feel, or try what you sell — they can only see your images. At Dreamline Production, we create product photography that converts browsers into buyers.</p><h3>Types of Product Photography We Offer</h3><ul><li><strong>White Background</strong> — Clean, Amazon/Flipkart-compliant images</li><li><strong>Lifestyle Shots</strong> — Products in real-world settings that tell a story</li><li><strong>Flat Lay</strong> — Top-down arrangements popular for food, accessories, and cosmetics</li><li><strong>Detail/Macro</strong> — Close-ups showing texture, stitching, material quality</li><li><strong>360° Spin</strong> — Interactive rotating views for websites</li></ul><h3>Our Studio Setup for Products</h3><ul><li>Dedicated product photography table with seamless backgrounds</li><li>Profoto strobes for consistent, professional lighting</li><li>Color-calibrated monitors for accurate color reproduction</li><li>Macro lenses for extreme detail shots</li></ul><h3>E-Commerce Platform Requirements</h3><p>Different platforms have different requirements:</p><ul><li><strong>Amazon</strong> — Pure white background, minimum 1000x1000 pixels, no text overlays</li><li><strong>Flipkart</strong> — Similar to Amazon with specific angle requirements</li><li><strong>Instagram Shop</strong> — Lifestyle-focused, square format preferred</li><li><strong>Own Website</strong> — Complete creative freedom</li></ul><p>Elevate your e-commerce presence. <a href="/contact">Get a product photography quote from Dreamline Production</a>.</p>`,
                seo: { title: "Product Photography for E-Commerce in Kolkata | Dreamline Production", description: "Professional product photography for Kolkata e-commerce brands selling on Amazon, Flipkart & Instagram. Studio and lifestyle shots by Dreamline Production.", keywords: "product photography kolkata, ecommerce photography kolkata, amazon product photos, product photographer kolkata, dreamline production product photography" }
            },
            {
                title: "Night Wedding Photography: Mastering Low-Light Celebrations",
                category: "TECHNICAL",
                excerpt: "Many Bengali wedding ceremonies happen after dark. Learn the professional techniques and equipment Dreamline Production uses to capture stunning photographs in challenging low-light wedding environments.",
                content: `<h2>Night Wedding Photography: Mastering Low-Light Celebrations</h2><p>Some of the most magical moments at Bengali weddings happen after sunset — the Sandhya ceremony, the fire rituals, the starlit reception. Capturing these in challenging low-light conditions requires specialized skills and equipment.</p><h3>The Low-Light Challenge</h3><p>Indoor venues with dim decorative lighting, fire-lit ceremonies, and outdoor nighttime celebrations are the toughest scenarios for any photographer. The wrong approach results in grainy, blurry, or flat images. The right approach produces <strong>atmospheric, moody, and breathtaking photographs</strong>.</p><h3>Our Low-Light Toolkit</h3><ul><li><strong>Sony A7S III</strong> — 12MP sensor designed specifically for low-light. Usable up to ISO 51,200</li><li><strong>Fast prime lenses</strong> — f/1.4 apertures let in 4x more light than kit lenses</li><li><strong>Off-camera flash</strong> — Profoto A2 speedlights bounced off surfaces for natural-looking fill</li><li><strong>LED video lights</strong> — Continuous lighting for video that complements the venue ambiance</li><li><strong>Reflectors</strong> — Bouncing existing light sources for softer illumination</li></ul><h3>Techniques That Work</h3><ul><li>Embrace the darkness — not every shot needs to be bright</li><li>Use silhouettes against fire and fairy lights</li><li>Drag the shutter for creative motion blur with flash</li><li>Position couples near natural light sources (candles, lanterns, string lights)</li></ul><p>Night ceremonies are our favorite canvas. <a href="/luxury">See our night wedding gallery</a>.</p>`,
                seo: { title: "Night Wedding Photography: Low-Light Techniques | Dreamline Production Kolkata", description: "Master low-light wedding photography techniques for night ceremonies. Learn about equipment, settings & creative approaches by Dreamline Production, Kolkata.", keywords: "night wedding photography, low light wedding photos, indoor wedding photography, dark venue photography, dreamline production night photography" }
            },
            {
                title: "Why Your Website Needs Professional Photography, Not Stock Photos",
                category: "INSIGHT",
                excerpt: "Stock photos are killing your brand's authenticity. Learn why investing in professional, original photography for your website and marketing materials builds trust and increases conversions by up to 45%.",
                content: `<h2>Why Your Website Needs Professional Photography, Not Stock Photos</h2><p>We've all seen them — the overly perfect, obviously staged stock photos of people in suits shaking hands or staring at laptops. In 2026, consumers can spot stock photography instantly, and it erodes trust.</p><h3>The Problem with Stock Photos</h3><ul><li>They're used by thousands of other businesses (including your competitors)</li><li>They create a disconnect between your brand's promise and reality</li><li>Visitors subconsciously distrust websites that look "too generic"</li><li>They can't showcase YOUR actual team, office, or products</li></ul><h3>The Impact of Original Photography</h3><p>Studies show that websites with original photography see:</p><ul><li><strong>45% higher conversion rates</strong> compared to stock photo sites</li><li><strong>35% longer page visit duration</strong></li><li><strong>50% more social media engagement</strong> when shared</li></ul><h3>What We Photograph for Businesses</h3><ul><li><strong>Team portraits</strong> — Show the real humans behind your brand</li><li><strong>Office/workspace</strong> — Give customers a sense of your environment</li><li><strong>Products</strong> — Real, high-quality images of what you sell</li><li><strong>Process shots</strong> — Show how you work, create, or manufacture</li><li><strong>Customer interactions</strong> — Real moments of service delivery</li></ul><p>Invest in authenticity. <a href="/contact">Contact Dreamline Production for business photography</a>.</p>`,
                seo: { title: "Why Your Website Needs Professional Photography Instead of Stock Photos | Dreamline Production", description: "Learn why stock photos hurt your brand and how professional original photography increases trust and conversions by up to 45%. By Dreamline Production, Kolkata.", keywords: "professional photography vs stock photos, business photography kolkata, website photography, brand photography kolkata, dreamline production business photography" }
            },
            {
                title: "Planning a Rajbari Wedding in Kolkata: Location and Production Guide",
                category: "WEDDING",
                excerpt: "Rajbari (heritage mansion) weddings are the pinnacle of Bengali wedding luxury. This guide covers venue selection, logistics, and how Dreamline Production captures the grandeur of these royal celebrations.",
                content: `<h2>Planning a Rajbari Wedding in Kolkata: Complete Guide</h2><p>A Rajbari wedding is the ultimate expression of Bengali heritage and luxury. These ancestral mansions — with their ornate pillars, sprawling courtyards, and old-world charm — provide a backdrop that no modern banquet hall can match.</p><h3>Top Rajbari Wedding Venues Near Kolkata</h3><ul><li><strong>Bawali Rajbari</strong> — A restored heritage property in South 24 Parganas with lush gardens</li><li><strong>Itachuna Rajbari</strong> — 200-year-old Zamindar estate in Hooghly</li><li><strong>Rajbari Bawali</strong> — Luxury heritage boutique hotel with stunning architecture</li><li><strong>Belgadia Palace</strong> — Royal palace experience in Odisha (for destination weddings)</li></ul><h3>Photography & Filmmaking Considerations</h3><p>Rajbari venues present unique opportunities and challenges:</p><ul><li><strong>Natural light</strong> — Large windows and courtyards provide beautiful golden hour light</li><li><strong>Architecture</strong> — Arched doorways, columns, and staircases create natural frames</li><li><strong>Low indoor lighting</strong> — Requires professional lighting setup for ceremonies</li><li><strong>Power availability</strong> — Some heritage properties have limited electrical capacity</li></ul><h3>How Dreamline Approaches Rajbari Weddings</h3><p>We conduct advance recce visits to map out every shooting location within the property. We identify the best angles for key rituals and plan our drone flight paths to capture the venue's full grandeur from above.</p><p>Planning a Rajbari wedding? <a href="/contact">Discuss your vision with Dreamline Production</a>.</p>`,
                seo: { title: "Rajbari Wedding in Kolkata — Location & Production Guide | Dreamline Production", description: "Complete guide to planning a Rajbari (heritage mansion) wedding in Kolkata. Venue selection, photography tips & filmmaking considerations by Dreamline Production.", keywords: "rajbari wedding kolkata, heritage wedding venue kolkata, bengali rajbari wedding, luxury wedding venue kolkata, dreamline production rajbari wedding" }
            },
            {
                title: "Instagram Reels for Wedding Vendors: How to Get More Bookings",
                category: "INSIGHT",
                excerpt: "Instagram Reels are the #1 discovery tool for wedding vendors in India. Learn proven strategies for creating viral wedding Reels that attract couples and generate bookings — with examples and templates.",
                content: `<h2>Instagram Reels for Wedding Vendors: Booking Generation Guide</h2><p>If you're a wedding vendor in India — photographer, decorator, caterer, makeup artist — Instagram Reels is your most powerful marketing tool in 2026. At Dreamline Production, Reels account for over 60% of our new client inquiries.</p><h3>Why Reels Work for Wedding Vendors</h3><ul><li>Instagram's algorithm <strong>prioritizes Reels over static posts</strong> (3-5x more reach)</li><li>Couples planning weddings spend an average of <strong>45 minutes daily</strong> on Instagram</li><li>Emotional wedding content naturally encourages <strong>saves and shares</strong> — the two metrics that boost algorithmic reach</li></ul><h3>Reel Ideas That Get Bookings</h3><ol><li><strong>Before/After Edits</strong> — Raw footage vs. color-graded final (shows your skill)</li><li><strong>Cinematic Highlights</strong> — 15-second emotional wedding moments set to trending audio</li><li><strong>BTS Process</strong> — Show your setup, gear, and preparation</li><li><strong>Client Testimonials</strong> — Happy couples sharing their experience</li><li><strong>Trending Audio Transitions</strong> — Creative transitions that showcase your portfolio</li></ol><h3>Optimization Tips</h3><ul><li>Post between 7-9 PM IST for maximum engagement</li><li>Use 5-7 relevant hashtags (not 30 generic ones)</li><li>Include a clear CTA in your caption ("DM for availability")</li><li>Reply to every comment within 2 hours</li></ul><p>Need help creating professional Reels content? <a href="/contact">Dreamline Production offers social media video packages</a>.</p>`,
                seo: { title: "Instagram Reels for Wedding Vendors — How to Get More Bookings | Dreamline Production", description: "Proven Instagram Reels strategies for wedding vendors in India. Learn how to create viral content that attracts couples and generates bookings.", keywords: "instagram reels wedding vendor, wedding photography instagram, social media wedding marketing, wedding vendor marketing, dreamline production instagram reels" }
            },
            {
                title: "The Future of AI in Photography and Video Production",
                category: "TECHNICAL",
                excerpt: "AI is transforming the creative industry at breakneck speed. Explore how artificial intelligence is changing photography and video production — from auto-editing to noise reduction — and what it means for professionals.",
                content: `<h2>The Future of AI in Photography and Video Production</h2><p>Artificial Intelligence is no longer a futuristic concept in our industry — it's here, and it's transforming how we shoot, edit, and deliver visual content. At Dreamline Production, we embrace AI as a tool that enhances (not replaces) human creativity.</p><h3>How We Use AI Today</h3><ul><li><strong>Noise Reduction</strong> — Topaz DeNoise AI recovers detail from high-ISO footage that was previously unusable</li><li><strong>Upscaling</strong> — AI-powered 4K upscaling for archival footage</li><li><strong>Culling</strong> — AI-assisted photo selection speeds up our workflow by 60%</li><li><strong>Transcription</strong> — Auto-transcribing speeches and vows for subtitle creation</li><li><strong>Sky Replacement</strong> — Enhancing overcast skies in outdoor portraits (used sparingly and ethically)</li></ul><h3>What AI Can't Replace</h3><p>Despite rapid advancement, AI cannot replace:</p><ul><li><strong>Emotional intelligence</strong> — Knowing when to press the shutter at a tearful moment</li><li><strong>Creative vision</strong> — Conceiving a unique narrative for each wedding</li><li><strong>Human connection</strong> — Building rapport with couples and families</li><li><strong>Compositional instinct</strong> — Years of trained eye for framing and timing</li></ul><h3>Our Philosophy</h3><p>We use AI to eliminate tedious technical tasks so our artists can focus on what matters most — <strong>telling your story with creativity and empathy</strong>. The camera is a tool, AI is a tool, but the storyteller is irreplaceable.</p><p><a href="/contact">Experience human creativity enhanced by technology at Dreamline Production</a>.</p>`,
                seo: { title: "The Future of AI in Photography & Video Production | Dreamline Production", description: "Explore how AI is transforming photography and video production. From noise reduction to auto-editing — what it means for professionals by Dreamline Production.", keywords: "AI photography, artificial intelligence video production, AI editing, future of photography, dreamline production AI technology" }
            },
            {
                title: "Dreamline Production: Our 15+ Year Journey Since 2010",
                category: "BEHIND THE SCENES",
                excerpt: "From a single camera in 2010 to Kolkata's premier production house — trace Dreamline Production's incredible journey of growth, innovation, and thousands of stories told through cinematic excellence.",
                content: `<h2>Dreamline Production: Our Journey Since 2010</h2><p>Every great story has an origin. Ours began in 2010 with a single camera, a laptop, and an unwavering belief that Kolkata's visual content industry deserved better.</p><h3>The Early Days (2010-2014)</h3><p>We started as a solo operation — one cinematographer, one camera, and a dream of creating cinematic wedding films in a market dominated by traditional, uninspired coverage. Word of mouth from our first few clients built our reputation.</p><h3>Growth Phase (2015-2019)</h3><p>As demand grew, we expanded our team, invested in cinema-grade equipment, and opened our studio at <strong>Tilottama Plaza, Karunamoyee Ghat Road</strong>. We also expanded into commercial video production, serving Kolkata's growing business community.</p><h3>The Pandemic Pivot (2020-2021)</h3><p>COVID-19 challenged the entire events industry. We pivoted to intimate wedding coverage, virtual event streaming, and invested heavily in post-production capabilities. This period forced us to innovate and emerge stronger.</p><h3>The Modern Era (2022-Present)</h3><p>Today, Dreamline Production is a full-service production house with:</p><ul><li>A team of 15+ dedicated professionals</li><li>Cinema-grade equipment worth over ₹50 lakhs</li><li>500+ weddings filmed across India</li><li>100+ commercial projects for leading Kolkata brands</li><li>A fully equipped studio and post-production suite</li></ul><h3>What Drives Us</h3><p>Our mission remains unchanged: to tell every story with cinematic beauty, technical excellence, and genuine emotion. <a href="/about">Learn more about our team and vision</a>.</p>`,
                seo: { title: "Dreamline Production — Our 15+ Year Journey Since 2010 | Kolkata Production House", description: "Trace Dreamline Production's incredible journey from a single camera in 2010 to Kolkata's premier cinematic wedding and commercial production house.", keywords: "dreamline production history, kolkata production house, dreamline production journey, about dreamline production, dreamline production story" }
            }
        ];

        setSaving(true);
        setGenerationProgress(0);
        let successCount = 0;
        let failCount = 0;

        try {
            for (let i = 0; i < posts.length; i++) {
                const scheduleDate = new Date();
                scheduleDate.setDate(scheduleDate.getDate() + i + 1); // Start from tomorrow
                
                const draftPost = {
                    id: posts[i].title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                    title: posts[i].title,
                    date: scheduleDate.toISOString().split('T')[0],
                    category: posts[i].category,
                    image: "",
                    excerpt: posts[i].excerpt,
                    content: posts[i].content,
                    seo: posts[i].seo
                };
                
                try {
                    await axios.post("/api/journals", draftPost);
                    successCount++;
                } catch (postErr) {
                    console.error(`Failed to create post ${i + 1}: ${posts[i].title}`, postErr);
                    failCount++;
                }
                setGenerationProgress(i + 1);
            }
            
            if (failCount === 0) {
                alert(`✅ All 30 SEO-optimized posts successfully scheduled!\n\nPosts cover the next 30 days starting from tomorrow.\nEach post has unique content, SEO title, meta description, and keywords.`);
            } else {
                alert(`⚠️ ${successCount} posts created, ${failCount} failed.\nCheck console for error details.`);
            }
            fetchPosts();
        } catch (err) {
            console.error("30-Day Strategy Error:", err);
            alert(`Error generating strategy: ${err.response?.data?.error || err.message}`);
        } finally {
            setSaving(false);
            setGenerationProgress(0);
        }
    };

    if (loading) return <div className="text-gray-500 uppercase text-[10px] font-bold tracking-widest">Accessing the archive of insights...</div>;

    return (
        <div className="space-y-12 pb-32">
            <header className="flex justify-between items-end">
                <div>
                    <h2 className="text-sm font-black text-[#c5a059] uppercase tracking-[0.4em] mb-2">Narratives</h2>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">The <span className="text-gray-700">Journal.</span></h1>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={generate30DayStrategy}
                        disabled={saving}
                        className="border border-[#c5a059]/30 text-[#c5a059] px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-[#c5a059] hover:text-black transition-all"
                    >
                        {saving ? (generationProgress > 0 ? `Creating ${generationProgress}/30...` : "Preparing...") : "✨ Generate 30-Day Strategy"}
                    </button>
                    <button
                        onClick={startNewPost}
                        className="bg-[#c5a059] text-black px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-lg shadow-[#c5a059]/10"
                    >
                        + Write New Insight
                    </button>
                </div>
            </header>

            {/* List Grid */}
            {!editingPost && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => (
                        <div key={post._id} className="bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden group hover:border-[#c5a059]/30 transition-all flex flex-col">
                            <div className="h-48 relative overflow-hidden bg-black">
                                {post.image ? (
                                    <img src={post.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={post.title} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-700 font-black uppercase">Missing Asset</div>
                                )}
                            </div>
                            <div className="p-8 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">{post.category}</span>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[10px] text-white/50">{new Date(post.date).toLocaleDateString()}</span>
                                        {post.date > new Date().toISOString().split('T')[0] ? (
                                            <span className="text-[8px] bg-[#c5a059]/20 text-[#c5a059] px-2 py-0.5 rounded uppercase font-black tracking-widest">Scheduled</span>
                                        ) : (
                                            <span className="text-[8px] bg-green-500/20 text-green-500 px-2 py-0.5 rounded uppercase font-black tracking-widest">Published</span>
                                        )}
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2 leading-tight uppercase tracking-tight">{post.title}</h3>
                                <p className="text-xs text-gray-400 line-clamp-3 mb-8">{post.excerpt || "No summary available."}</p>

                                <div className="mt-auto flex justify-between items-center pt-6 border-t border-white/5">
                                    <button onClick={() => setEditingPost(post)} className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest hover:text-white transition-colors">Edit Content</button>
                                    <button onClick={() => deletePost(post._id)} className="text-[10px] font-black text-red-500/30 hover:text-red-500 uppercase tracking-widest transition-colors">Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Full Screen Editor */}
            {editingPost && (
                <div className="fixed inset-0 bg-black z-[101] overflow-y-auto p-6 md:p-12">
                    <div className="max-w-5xl mx-auto space-y-12">
                        <div className="flex justify-between items-center border-b border-white/5 pb-8">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Drafting <span className="text-[#c5a059]">Insight.</span></h2>
                            <button onClick={() => setEditingPost(null)} className="text-gray-500 hover:text-white transition-colors uppercase text-[10px] font-black tracking-widest">Discard Draft</button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-12 pb-32">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <div className="space-y-1 lg:col-span-2">
                                    <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Article Headline</label>
                                    <input type="text" value={editingPost.title} onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#c5a059] text-xl font-bold" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Narrative Category</label>
                                    <select value={editingPost.category} onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[#c5a059] outline-none font-black uppercase text-xs">
                                        <option value="INSIGHT">Insight</option>
                                        <option value="WEDDING">Wedding Story</option>
                                        <option value="BEHIND THE SCENES">Behind The Scenes</option>
                                        <option value="TECHNICAL">Technical Breakdown</option>
                                    </select>
                                </div>
                                <div className="space-y-4 lg:col-span-2">
                                    <ImageUploader
                                        currentImage={editingPost.image}
                                        recommendedSize="Featured Keyframe (Recommended: 1600x900)"
                                        onUploadSuccess={(url) => setEditingPost({ ...editingPost, image: url })}
                                    />
                                    {editingPost.image && (
                                        <button type="button" onClick={() => setEditingPost({ ...editingPost, image: "" })} className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase w-full text-right transition-colors">Clear Asset</button>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Publish Date</label>
                                    <input type="date" value={editingPost.date} onChange={(e) => setEditingPost({ ...editingPost, date: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#c5a059]" />
                                    <p className="text-[9px] text-gray-500 pl-2 pt-1">Selecting a future date will keep the post hidden from the live website until that day arrives.</p>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Brief Excerpt (SEO Summary)</label>
                                <textarea value={editingPost.excerpt} onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#c5a059] h-20 text-sm font-light" />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Complete Narrative (HTML Supported)</label>
                                <div className="prose-editor">
                                    {/* In a real scenario we'd use React-Quill here. For now standard textarea with a note */}
                                    <p className="text-[9px] text-[#c5a059] mb-4 font-bold uppercase">Note: Use HTML tags for advanced formatting.</p>
                                    <textarea
                                        value={editingPost.content}
                                        onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                                        className="w-full min-h-[500px] bg-[#050505] border border-white/5 rounded-3xl p-10 text-gray-300 font-mono text-sm leading-relaxed focus:border-[#c5a059]/30 focus:outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-lg z-[102]">
                                <button type="submit" disabled={saving} className="w-full bg-[#c5a059] text-black py-6 rounded-3xl font-black uppercase tracking-widest shadow-2xl hover:bg-white transition-all transform active:scale-95">
                                    {saving ? "Publishing Story..." : "Commit Insight to Archive"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
