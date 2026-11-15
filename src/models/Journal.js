import mongoose from 'mongoose';

const JournalSchema = new mongoose.Schema({
    id: { type: String, unique: true, sparse: true, index: true },
    slug: { 
        type: String, 
        unique: true, 
        sparse: true, 
        lowercase: true, 
        trim: true, 
        index: true 
    },
    aliases: [{ 
        type: String, 
        lowercase: true, 
        trim: true, 
        index: true 
    }],
    redirectHistory: [{
        fromSlug: String,
        toSlug: String,
        changedAt: { type: Date, default: Date.now }
    }],
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    status: { 
        type: String, 
        enum: ['draft', 'published', 'scheduled'], 
        default: 'published',
        index: true 
    },
    category: { type: String, default: "INSIGHT", index: true },
    tags: [{ type: String, trim: true }],
    image: { type: String, default: "" },
    featuredImageAlt: { type: String, default: "" },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    author: {
        name: { type: String, default: "Dreamline Production" },
        role: { type: String, default: "Editorial Team" },
        avatar: { type: String, default: "/logo.png" },
        bio: { type: String, default: "" }
    },
    order: { type: Number, default: 0 },
    googleBusinessSync: { type: String, default: "PENDING" },
    lastSyncedAt: { type: Date },
    seo: {
        title: { type: String, default: "" },
        description: { type: String, default: "" },
        keywords: { type: String, default: "" },
        canonicalUrl: { type: String, default: "" },
        ogTitle: { type: String, default: "" },
        ogDescription: { type: String, default: "" },
        ogImage: { type: String, default: "" },
        ogImageAlt: { type: String, default: "" },
        noIndex: { type: Boolean, default: false },
        noFollow: { type: Boolean, default: false }
    },
    cta: {
        title: { type: String, default: "" },
        description: { type: String, default: "" },
        buttonText: { type: String, default: "Work with us" },
        buttonUrl: { type: String, default: "/contact" }
    },
    relatedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Journal' }]
}, { timestamps: true });

// Pre-save hook: ensure slug and id are lowercase and synchronized
JournalSchema.pre('save', function() {
    if (this.slug) {
        this.slug = this.slug.toLowerCase().trim();
        if (!this.id) this.id = this.slug;
    } else if (this.id) {
        this.id = this.id.toLowerCase().trim();
        this.slug = this.id;
    }
});

export default mongoose.models.Journal || mongoose.model('Journal', JournalSchema);
