import mongoose from 'mongoose';
import ServiceCategory from '../src/models/ServiceCategory.js';
import ServicePage from '../src/models/ServicePage.js';
import ServiceVideo from '../src/models/ServiceVideo.js';
import ServiceShot from '../src/models/ServiceShot.js';
import NavigationItem from '../src/models/NavigationItem.js';
import { DEFAULT_NAVIGATION_SEED } from '../src/lib/navigation-defaults.js';

await mongoose.connect(process.env.MONGODB_URI);

console.log('=== STARTING 9-SECTOR MIGRATION & REORGANIZATION ===\n');

// 1. Categories to upsert
const CATEGORIES_DATA = [
    {
        name: "WEDDING",
        slug: "wedding",
        description: "Luxury candid wedding photography, cinematic films and rituals in Kolkata",
        order: 1,
        isActive: true,
        isPublished: true,
        showInMegaMenu: true
    },
    {
        name: "CORPORATE",
        slug: "corporate",
        description: "Commercial ad films, brand promotions, documentaries and corporate media",
        order: 2,
        isActive: true,
        isPublished: true,
        showInMegaMenu: true
    },
    {
        name: "DRONE & AERIAL",
        slug: "drone-and-aerial",
        description: "DGCA-certified 4K aerial cinematography, mapping and photogrammetry",
        order: 3,
        isActive: true,
        isPublished: true,
        showInMegaMenu: true
    },
    {
        name: "SOCIAL",
        slug: "social",
        description: "Birthdays, rice ceremonies, family celebrations and cultural events",
        order: 4,
        isActive: true,
        isPublished: true,
        showInMegaMenu: true
    },
    {
        name: "FASHION",
        slug: "fashion",
        description: "Editorial fashion photography, runway videography and designer fashion films",
        order: 5,
        isActive: true,
        isPublished: true,
        showInMegaMenu: true
    },
    {
        name: "PRODUCT",
        slug: "product",
        description: "E-commerce product photography, 360 turntable videography and product commercials",
        order: 6,
        isActive: true,
        isPublished: true,
        showInMegaMenu: true
    },
    {
        name: "POST PRODUCTION",
        slug: "post-production",
        description: "Precision video editing, DaVinci Resolve color grading, VFX and high-end photo retouching",
        order: 7,
        isActive: true,
        isPublished: true,
        showInMegaMenu: true
    },
    {
        name: "TECH",
        slug: "tech",
        description: "Modern responsive web design, multi-camera live streaming and hybrid broadcasts",
        order: 8,
        isActive: true,
        isPublished: true,
        showInMegaMenu: true
    },
    {
        name: "EVENT MANAGEMENT",
        slug: "event-management",
        description: "Full-scale corporate summits, concerts & luxury event planning",
        order: 9,
        isActive: true,
        isPublished: true,
        showInMegaMenu: true,
        badge: "COMING SOON"
    }
];

console.log('1. Upserting 9 Service Categories...');
for (const cat of CATEGORIES_DATA) {
    const updated = await ServiceCategory.findOneAndUpdate(
        { name: cat.name },
        { $set: cat },
        { upsert: true, new: true }
    );
    console.log(`   ✓ Category: ${updated.name} (order: ${updated.order}, slug: ${updated.slug})`);
}

// 2. Reassign Live Stream & Broadcast from Corporate to TECH
console.log('\n2. Moving Live Stream & Broadcast to TECH...');
const liveStreamSvc = await ServicePage.findOneAndUpdate(
    { slug: 'live-stream-broadcast-kolkata' },
    { $set: { category: 'TECH' } },
    { new: true }
);
if (liveStreamSvc) {
    await ServiceVideo.updateMany({ serviceSlug: 'live-stream-broadcast-kolkata' }, { $set: { category: 'TECH' } });
    await ServiceShot.updateMany({ serviceSlug: 'live-stream-broadcast-kolkata' }, { $set: { category: 'TECH' } });
    console.log('   ✓ Live Stream & Broadcast reassigned to TECH in ServicePage, Videos & Shots');
} else {
    console.log('   ! Live Stream & Broadcast not found in ServicePage, will create');
}

// 3. Reassign Fashion Photography from Corporate to FASHION
console.log('\n3. Moving Fashion Photography to FASHION...');
const fashionPhotoSvc = await ServicePage.findOneAndUpdate(
    { slug: 'fashion-photography-kolkata' },
    { $set: { category: 'FASHION' } },
    { new: true }
);
if (fashionPhotoSvc) {
    await ServiceVideo.updateMany({ serviceSlug: 'fashion-photography-kolkata' }, { $set: { category: 'FASHION' } });
    await ServiceShot.updateMany({ serviceSlug: 'fashion-photography-kolkata' }, { $set: { category: 'FASHION' } });
    console.log('   ✓ Fashion Photography reassigned to FASHION in ServicePage, Videos & Shots');
}

// 4. Create ServicePage documents for all new services
console.log('\n4. Creating / Updating ServicePage documents for new services...');
const NEW_SERVICES_DATA = [
    // FASHION
    {
        slug: 'fashion-videography-kolkata',
        title: 'Fashion Videography in Kolkata',
        subtitle: 'Runway & Model Reels',
        category: 'FASHION',
        description: 'Professional runway videography, designer collection coverage, high-speed slow motion, and dynamic Instagram reels in Kolkata.',
        shortDescription: 'Runway videography, fashion week coverage & dynamic stylized model reels',
        seoTitle: 'Fashion Videography in Kolkata | Runway & Model Reels — Dreamline Production',
        metaDescription: 'Top-rated fashion videographers in Kolkata for fashion shows, runway events, model lookbook reels, and designer campaigns.',
        order: 18,
        active: true,
        isPublished: true
    },
    {
        slug: 'fashion-films-kolkata',
        title: 'Fashion Films in Kolkata',
        subtitle: 'Cinematic Haute Couture',
        category: 'FASHION',
        description: 'Story-driven fashion films, cinematic haute couture promos, and artistic brand narratives for luxury fashion labels and designers.',
        shortDescription: 'Narrative brand films, designer campaigns & artistic luxury fashion storytelling',
        seoTitle: 'Fashion Films in Kolkata | Cinematic Haute Couture — Dreamline Production',
        metaDescription: 'Cinematic fashion film production in Kolkata. Narrative luxury fashion films, designer campaign cinema, and commercial lookbooks.',
        order: 19,
        active: true,
        isPublished: true
    },
    // PRODUCT
    {
        slug: 'product-photography-kolkata',
        title: 'Product Photography in Kolkata',
        subtitle: 'E-Commerce & Commercial Stills',
        category: 'PRODUCT',
        description: 'High-resolution e-commerce catalog photography, lifestyle flatlays, macro jewelry shoots, and Amazon/Flipkart white background images.',
        shortDescription: 'E-commerce white-background catalogs, lifestyle flatlays & luxury macro details',
        seoTitle: 'Product Photography in Kolkata | E-Commerce & Commercial Stills — Dreamline Production',
        metaDescription: 'Leading product photographers in Kolkata specializing in white-background e-commerce photography, macro jewelry shoots, and lifestyle imagery.',
        order: 20,
        active: true,
        isPublished: true
    },
    {
        slug: 'product-videography-kolkata',
        title: 'Product Videography in Kolkata',
        subtitle: '360 Turntable & Showcase Reels',
        category: 'PRODUCT',
        description: 'Dynamic 360-degree motorized turntable video captures, macro product details, unboxing visualizers, and interactive social media reels.',
        shortDescription: '360-degree rotating turntable captures, stop-motion & interactive product reels',
        seoTitle: 'Product Videography in Kolkata | 360 Turntable & Reels — Dreamline Production',
        metaDescription: 'Professional product videography in Kolkata. 4K 360-degree turntable videos, macro product cinematics, and interactive social reels.',
        order: 21,
        active: true,
        isPublished: true
    },
    {
        slug: 'product-commercials-kolkata',
        title: 'Product Commercials in Kolkata',
        subtitle: 'Digital Ad Campaigns & TVCs',
        category: 'PRODUCT',
        description: 'Commercial product advertising films, high-conversion social media video ads, TVCs, and promotional product launch videos.',
        shortDescription: 'High-conversion digital ad films, social media campaigns & launch commercials',
        seoTitle: 'Product Commercials in Kolkata | Digital Ad Films — Dreamline Production',
        metaDescription: 'High-impact product commercial production in Kolkata for digital advertising, TVCs, brand launches, and conversion-focused visual campaigns.',
        order: 22,
        active: true,
        isPublished: true
    },
    // POST PRODUCTION
    {
        slug: 'video-editing-kolkata',
        title: 'Professional Video Editing in Kolkata',
        subtitle: 'Multi-Track Precision Editing',
        category: 'POST PRODUCTION',
        description: 'End-to-end post-production editing for commercials, wedding films, documentaries, corporate videos, and YouTube creators.',
        shortDescription: 'Multi-track timeline assembly, rhythmic pacing, dialogue editing & audio mastering',
        seoTitle: 'Professional Video Editing in Kolkata | Post-Production Studio — Dreamline Production',
        metaDescription: 'Kolkata top video editing studio. Multi-camera synchronization, narrative pacing, audio mixing, and commercial post-production.',
        order: 23,
        active: true,
        isPublished: true
    },
    {
        slug: 'cinematic-editing-kolkata',
        title: 'Cinematic Editing in Kolkata',
        subtitle: 'Dramatic Narrative Arc',
        category: 'POST PRODUCTION',
        description: 'Feature-length film editing, emotional arc structuring, dramatic pacing, sound design, and festival cut mastering.',
        shortDescription: 'Dramatic film editing, emotional arc construction & feature-length pacing',
        seoTitle: 'Cinematic Film Editing in Kolkata | Storytelling & Pacing — Dreamline Production',
        metaDescription: 'Cinematic film editing services in Kolkata for feature films, short films, luxury wedding teasers, and festival entries.',
        order: 24,
        active: true,
        isPublished: true
    },
    {
        slug: 'colour-grading-kolkata',
        title: 'Colour Grading in Kolkata',
        subtitle: 'DaVinci Resolve Studio Mastering',
        category: 'POST PRODUCTION',
        description: 'Professional DaVinci Resolve color grading, custom LUT design, film emulation, HDR mastering, and cross-platform color matching.',
        shortDescription: 'DaVinci Resolve colour mastering, custom LUT creation & HDR tone mapping',
        seoTitle: 'Colour Grading Studio in Kolkata | DaVinci Resolve Pro — Dreamline Production',
        metaDescription: 'Industry-standard DaVinci Resolve colour grading in Kolkata. Color correction, cinematic look development, and HDR mastering for films.',
        order: 25,
        active: true,
        isPublished: true
    },
    {
        slug: 'vfx-and-motion-graphics-kolkata',
        title: 'VFX & Motion Graphics in Kolkata',
        subtitle: 'CGI, Compositing & Title Design',
        category: 'POST PRODUCTION',
        description: 'Visual effects compositing, green screen chroma keying, 3D motion graphics, kinetic typography, and animated title sequences.',
        shortDescription: 'Visual effects compositing, 3D title design, logo animations & cleanups',
        seoTitle: 'VFX & Motion Graphics in Kolkata | 3D Animation & CGI — Dreamline Production',
        metaDescription: 'High-end VFX and motion graphics studio in Kolkata. 3D visual effects, logo animations, title sequences, and cinematic compositing.',
        order: 26,
        active: true,
        isPublished: true
    },
    {
        slug: 'photo-retouching-kolkata',
        title: 'High-End Photo Retouching in Kolkata',
        subtitle: 'Editorial Skin & Color Perfection',
        category: 'POST PRODUCTION',
        description: 'High-end frequency separation beauty retouching, color grading, background cleanups, commercial packaging retouching, and album layout design.',
        shortDescription: 'Frequency separation skin retouching, color correction & magazine finishing',
        seoTitle: 'High-End Photo Retouching in Kolkata | Editorial Beauty — Dreamline Production',
        metaDescription: 'Professional photo retouching in Kolkata for fashion lookbooks, commercial products, jewelry, and luxury wedding albums.',
        order: 27,
        active: true,
        isPublished: true
    },
    // Category Landing Hubs
    {
        slug: 'fashion',
        title: 'Fashion Photography & Film Production Kolkata',
        subtitle: 'Editorial, Runway & Luxury Campaigns',
        category: 'FASHION',
        description: 'Premier fashion photography, runway videography, and cinematic fashion films in Kolkata for designers, luxury labels, and models.',
        shortDescription: 'Editorial lookbooks, runway videography & high-fashion film campaigns',
        seoTitle: 'Fashion Photography & Film Production in Kolkata — Dreamline Production',
        metaDescription: 'Kolkata luxury fashion production house. Editorial fashion photography, runway videography, model reels, and designer campaigns.',
        order: 17,
        active: true,
        isPublished: true
    },
    {
        slug: 'product',
        title: 'Commercial Product Photography & Videography Kolkata',
        subtitle: 'E-Commerce, Macro & Commercial Ads',
        category: 'PRODUCT',
        description: 'E-commerce product photography, 360 turntable videography, and high-impact product commercials in Kolkata for brands and retail.',
        shortDescription: 'E-commerce white-background catalogs, 360 turntable reels & commercial video ads',
        seoTitle: 'Product Photography & Videography in Kolkata — Dreamline Production',
        metaDescription: 'Professional product photography and videography studio in Kolkata. 4K e-commerce imagery, 360 turntable reels, and commercial campaigns.',
        order: 20,
        active: true,
        isPublished: true
    },
    {
        slug: 'post-production',
        title: 'Post-Production, Color Grading & VFX Studio Kolkata',
        subtitle: 'Editing, DaVinci Grading & Visual Effects',
        category: 'POST PRODUCTION',
        description: 'Complete cinematic post-production suite in Kolkata: multi-track video editing, DaVinci Resolve color grading, VFX, motion graphics, and high-end photo retouching.',
        shortDescription: 'Video editing, DaVinci Resolve colour grading, 3D VFX & photo retouching',
        seoTitle: 'Post-Production, Color Grading & VFX Studio Kolkata — Dreamline Production',
        metaDescription: 'Comprehensive post-production studio in Kolkata. High-end video editing, DaVinci Resolve color grading, VFX compositing, and retouching.',
        order: 23,
        active: true,
        isPublished: true
    }
];

for (const svc of NEW_SERVICES_DATA) {
    const updated = await ServicePage.findOneAndUpdate(
        { slug: svc.slug },
        { 
            $set: {
                ...svc,
                ctaText: svc.ctaText || "Get a Quote",
                ctaLink: svc.ctaLink || "/contact"
            }
        },
        { upsert: true, new: true }
    );
    console.log(`   ✓ ServicePage: ${updated.title} (${updated.slug}) [${updated.category}]`);
}

// 5. Update NavigationItem hierarchy under SERVICES
console.log('\n5. Updating NavigationItem hierarchy under SERVICES in MongoDB...');
let servicesRoot = await NavigationItem.findOne({ title: 'SERVICES', parentId: null });
if (!servicesRoot) {
    servicesRoot = await NavigationItem.create({
        title: 'SERVICES',
        url: '/services/',
        type: 'internal',
        order: 3,
        isActive: true,
        displayDesktop: true,
        displayMobile: true,
        isDropdown: true,
        badge: ''
    });
}

// Remove old children under SERVICES
await NavigationItem.deleteMany({ parentId: servicesRoot._id });

// Extract services children from updated DEFAULT_NAVIGATION_SEED
const seedServices = DEFAULT_NAVIGATION_SEED.find(item => item.title === 'SERVICES');
if (seedServices && Array.isArray(seedServices.children)) {
    for (const child of seedServices.children) {
        await NavigationItem.create({
            title: child.title,
            url: child.url,
            type: child.type || 'internal',
            parentId: servicesRoot._id,
            order: child.order,
            group: child.group || '',
            badge: child.badge || '',
            description: child.description || '',
            openInNewTab: child.openInNewTab || false,
            isActive: child.isActive !== false,
            displayDesktop: child.displayDesktop !== false,
            displayMobile: child.displayMobile !== false
        });
    }
    console.log(`   ✓ Seeded ${seedServices.children.length} NavigationItem child records under SERVICES`);
}

console.log('\n====================================================');
console.log('MIGRATION COMPLETED SUCCESSFULLY!');
console.log('====================================================');

await mongoose.disconnect();
