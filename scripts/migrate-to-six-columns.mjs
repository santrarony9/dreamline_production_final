import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('MONGODB_URI is not set in environment.');
    process.exit(1);
}

const SIX_COLUMNS = [
    {
        name: 'WEDDING',
        items: [
            {
                title: 'Pre Wedding',
                url: '/services/pre-wedding-shoot-kolkata/',
                badge: '',
                description: 'Cinematic romantic storytelling at Prinsep Ghat & heritage sites'
            },
            {
                title: 'Wedding',
                url: '/services/wedding-photography-kolkata/',
                badge: 'Signature',
                description: 'Luxury candid photography & emotional Bengali rituals'
            },
            {
                title: 'Post Wedding',
                url: '/services/post-wedding-photography-kolkata/',
                badge: '',
                description: 'Intimate post-ceremony portraits, reception & newlywed memories'
            }
        ]
    },
    {
        name: 'CORPORATE',
        items: [
            {
                title: 'Commercial Ad',
                url: '/services/commercial-ad-films-kolkata/',
                badge: 'Featured',
                description: 'High-impact brand commercials, TVCs & digital ad campaigns'
            },
            {
                title: 'Brand Promotion',
                url: '/services/brand-promotion-kolkata/',
                badge: '',
                description: 'Strategic promotional video campaigns for corporate brand growth'
            },
            {
                title: 'Corporate Film',
                url: '/services/corporate-photography-kolkata/',
                badge: '',
                description: 'Executive portraits, facility walkthroughs & brand documentaries'
            },
            {
                title: 'Short Film',
                url: '/services/short-film-production-kolkata/',
                badge: '',
                description: 'Narrative fiction, festival entries & branded creative shorts'
            },
            {
                title: '3D Visualization',
                url: '/services/3d-visualization-kolkata/',
                badge: '',
                description: 'CGI rendering, architectural 3D walkthroughs & visual simulations'
            },
            {
                title: 'Live Stream & Broadcast',
                url: '/services/live-stream-broadcast-kolkata/',
                badge: '',
                description: 'Multi-camera live streaming, virtual conferences & hybrid broadcasts'
            },
            {
                title: 'Fashion Photography',
                url: '/services/fashion-photography-kolkata/',
                badge: '',
                description: 'Editorial lookbooks, studio catalogs & model portfolio shoots'
            },
            {
                title: 'Podcast',
                url: '/services/podcast-production-kolkata/',
                badge: '',
                description: 'Multi-camera podcast recording, 4K video switching & crystal audio'
            },
            {
                title: 'Documentary Film',
                url: '/services/documentary-film-production-kolkata/',
                badge: '',
                description: 'Impactful non-fiction storytelling, social causes & heritage films'
            }
        ]
    },
    {
        name: 'DRONE & AERIAL',
        items: [
            {
                title: 'DRONE PHOTOGRAPHY',
                url: '/services/drone-photography-kolkata/',
                badge: 'CERTIFIED',
                icon: '🛸',
                description: 'DGCA-CERTIFIED 4K AERIAL PHOTOGRAPHY FOR ARCHITECTURE & EVENTS'
            },
            {
                title: 'DRONE VIDEOGRAPHY',
                url: '/services/drone-videography-kolkata/',
                badge: 'POPULAR',
                icon: '🛸',
                description: 'CINEMATIC 4K FPV AERIAL CINEMATOGRAPHY & DYNAMIC REELS'
            },
            {
                title: '3D AREA AND MAPPING',
                url: '/services/3d-area-mapping-kolkata/',
                badge: '',
                icon: '🛸',
                description: 'AERIAL PHOTOGRAMMETRY, TOPOGRAPHICAL SURVEYS & 3D MODELS'
            }
        ]
    },
    {
        name: 'SOCIAL',
        items: [
            {
                title: 'Birthday Photography',
                url: '/services/birthday-photography-kolkata/',
                badge: '',
                description: 'Milestone celebrations, theme parties & candid joy'
            },
            {
                title: 'Rice Ceremony',
                url: '/services/rice-ceremony-photography-kolkata/',
                badge: 'Traditional',
                description: 'Sacred Annaprashan rituals, baby portraits & family blessings'
            },
            {
                title: 'Other Social Events',
                url: '/services/other-social-events-kolkata/',
                badge: '',
                description: 'Anniversaries, cultural gatherings & intimate private events'
            }
        ]
    },
    {
        name: 'TECH',
        items: [
            {
                title: 'Website',
                url: '/tech',
                badge: 'Digital',
                description: 'Modern responsive web design, portfolio showcases & custom web applications'
            }
        ]
    },
    {
        name: 'EVENT MANAGEMENT',
        items: [
            {
                title: 'Coming Soon',
                url: '#',
                badge: 'COMING SOON',
                description: 'Full-scale corporate event planning, cultural festival stage production & artist coordination launching soon.'
            }
        ]
    }
];

async function migrate() {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    const navCol = db.collection('navigationitems');

    console.log('[Migration] Connected to MongoDB');

    // 1. Locate or create SERVICES root
    let root = await navCol.findOne({ title: 'SERVICES', parentId: null });
    if (!root) {
        const rootRes = await navCol.insertOne({
            title: 'SERVICES',
            url: '/services/',
            type: 'internal',
            parentId: null,
            order: 3,
            openInNewTab: false,
            isActive: true,
            displayDesktop: true,
            displayMobile: true,
            isDropdown: true,
            badge: '6 Categories',
            createdAt: new Date(),
            updatedAt: new Date()
        });
        root = { _id: rootRes.insertedId };
    } else {
        await navCol.updateOne(
            { _id: root._id },
            { 
                $set: { 
                    badge: '6 Categories',
                    isDropdown: true,
                    isActive: true,
                    displayDesktop: true,
                    displayMobile: true,
                    updatedAt: new Date()
                } 
            }
        );
    }

    // 2. Backup existing children
    const existingChildren = await navCol.find({ parentId: root._id }).toArray();
    const backupName = 'navigationitems_backup_' + Date.now();
    await db.collection(backupName).insertMany(existingChildren);
    console.log('[Migration] Backed up ' + existingChildren.length + ' children to ' + backupName);

    // 3. Clear existing children under SERVICES
    await navCol.deleteMany({ parentId: root._id });
    console.log('[Migration] Cleared existing children under SERVICES');

    // 4. Insert the new 6-column structure
    let currentOrder = 1;
    const toInsert = [];

    for (const col of SIX_COLUMNS) {
        for (const item of col.items) {
            toInsert.push({
                title: item.title,
                url: item.url,
                type: 'internal',
                parentId: root._id,
                order: currentOrder++,
                group: col.name,
                subGroup: '',
                icon: item.icon || '',
                badge: item.badge || '',
                description: item.description || '',
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true,
                isDropdown: false,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }
    }

    const insertRes = await navCol.insertMany(toInsert);
    console.log('[Migration] Successfully inserted ' + insertRes.insertedCount + ' items across 6 columns!');

    // 5. Verify the insertion
    const verified = await navCol.find({ parentId: root._id }).sort({ order: 1 }).toArray();
    console.log('\n[Verification Summary]:');
    const grouped = {};
    verified.forEach(v => {
        grouped[v.group] = grouped[v.group] || [];
        grouped[v.group].push(v.title);
    });
    console.log(JSON.stringify(grouped, null, 2));

    await mongoose.disconnect();
    console.log('\n[Migration Completed Successfully]');
}

migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
