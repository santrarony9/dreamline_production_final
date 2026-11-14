import mongoose from 'mongoose';

const ServicePageSchema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true, index: true },
    aliases: [{ type: String, index: true }],
    title: { type: String, required: true },
    subtitle: { type: String, default: "Services" },
    description: { type: String },
    heroImage: { type: String },
    gallery: [{ url: String, caption: String }],
    videos: [{ title: String, url: String, thumbnail: String }],
    active: { type: Boolean, default: true }
}, { timestamps: true });

const ServicePage = mongoose.models.ServicePage || mongoose.model('ServicePage', ServicePageSchema);

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const updates = [
        {
            oldSlug: 'drone-videography',
            newSlug: 'drone-videography-kolkata',
            title: 'Drone Videography in Kolkata',
            aliases: ['drone-videography']
        },
        {
            oldSlug: 'corporate-films',
            newSlug: 'corporate-photography-kolkata',
            title: 'Corporate Photography & Films',
            aliases: ['corporate-films', 'corporate-photography', 'corporate-film-production']
        },
        {
            oldSlug: 'cinematic-film',
            newSlug: 'wedding-photography-kolkata',
            title: 'Wedding Photography in Kolkata',
            aliases: ['cinematic-film', 'wedding-photography', 'luxury-weddings', 'wedding-cinema']
        },
        {
            oldSlug: 'pre-wedding',
            newSlug: 'pre-wedding-shoot-kolkata',
            title: 'Cinematic Pre-Wedding Shoots',
            aliases: ['pre-wedding', 'pre-wedding-cinema', 'pre-wedding-shoot']
        },
        {
            oldSlug: 'podcast',
            newSlug: 'podcast-production-kolkata',
            title: 'Podcast Production in Kolkata',
            aliases: ['podcast', 'podcast-shoots', 'podcast-studio']
        },
        {
            oldSlug: 'documentary',
            newSlug: 'documentary-film-production-kolkata',
            title: 'Documentary Films in Kolkata',
            aliases: ['documentary', 'documentaries']
        },
        {
            oldSlug: 'brand-promotion',
            newSlug: 'brand-promotion-kolkata',
            title: 'Brand Promotion & Commercial Videos',
            aliases: ['brand-promotion', 'brand-promo']
        },
        {
            oldSlug: 'ad-films',
            newSlug: 'commercial-ad-films-kolkata',
            title: 'Commercial Ad Films in Kolkata',
            aliases: ['ad-films', 'ad-film-production', 'brand-films']
        },
        {
            oldSlug: '3d-area-mapping',
            newSlug: '3d-area-mapping-kolkata',
            title: '3D Area Mapping in Kolkata',
            aliases: ['3d-area-mapping', 'area-mapping']
        },
        {
            oldSlug: '2d-animation',
            newSlug: '2d-animation-kolkata',
            title: '2D Animation & Motion Graphics',
            aliases: ['2d-animation', 'animation']
        }
    ];

    for (const item of updates) {
        const existingNew = await ServicePage.findOne({ slug: item.newSlug });
        const existingOld = await ServicePage.findOne({ slug: item.oldSlug });

        if (existingOld && !existingNew) {
            existingOld.slug = item.newSlug;
            existingOld.title = item.title || existingOld.title;
            existingOld.aliases = Array.from(new Set([...(existingOld.aliases || []), ...item.aliases, item.oldSlug]));
            await existingOld.save();
            console.log(`Updated: ${item.oldSlug} -> ${item.newSlug}`);
        } else if (existingNew) {
            existingNew.aliases = Array.from(new Set([...(existingNew.aliases || []), ...item.aliases, item.oldSlug]));
            await existingNew.save();
            console.log(`Updated aliases for: ${item.newSlug}`);
        } else {
            console.log(`Neither found for: ${item.oldSlug}`);
        }
    }

    // Check pre-wedding-shoot legacy duplicate
    const oldPws = await ServicePage.findOne({ slug: 'pre-wedding-shoot' });
    if (oldPws) {
        const target = await ServicePage.findOne({ slug: 'pre-wedding-shoot-kolkata' });
        if (target) {
            target.aliases = Array.from(new Set([...(target.aliases || []), 'pre-wedding-shoot']));
            await target.save();
            await ServicePage.deleteOne({ _id: oldPws._id });
            console.log('Merged duplicate pre-wedding-shoot into pre-wedding-shoot-kolkata');
        }
    }

    // Check brand-films legacy duplicate
    const oldBf = await ServicePage.findOne({ slug: 'brand-films' });
    if (oldBf) {
        const target = await ServicePage.findOne({ slug: 'commercial-ad-films-kolkata' });
        if (target) {
            target.aliases = Array.from(new Set([...(target.aliases || []), 'brand-films']));
            await target.save();
            await ServicePage.deleteOne({ _id: oldBf._id });
            console.log('Merged duplicate brand-films into commercial-ad-films-kolkata');
        }
    }

    // Verify all active service pages
    const all = await ServicePage.find({}, 'slug title aliases').lean();
    console.log('\n--- ALL STANDARDIZED SERVICE PAGES IN DB ---');
    console.log(JSON.stringify(all, null, 2));

    await mongoose.disconnect();
    console.log('Done!');
}

run().catch(console.error);
