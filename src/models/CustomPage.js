import mongoose from 'mongoose';

const CustomPageSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true,
        trim: true
    },
    slug: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true, 
        trim: true, 
        index: true 
    },
    description: { 
        type: String, 
        default: "" 
    },
    featuredImage: { 
        type: String, 
        default: "" 
    },
    bannerImage: { 
        type: String, 
        default: "" 
    },
    template: { 
        type: String, 
        enum: ['default', 'fullwidth', 'landing', 'minimal', 'sidebar'], 
        default: 'default' 
    },
    status: { 
        type: String, 
        enum: ['draft', 'published', 'scheduled'], 
        default: 'published',
        index: true 
    },
    publishDate: { 
        type: String, 
        default: () => new Date().toISOString().split('T')[0] 
    },
    author: {
        name: { type: String, default: "Dreamline Production" },
        role: { type: String, default: "Studio Production" },
        avatar: { type: String, default: "/logo.png" }
    },
    design: {
        fontFamily: { type: String, default: "Instrument Sans" },
        headingFont: { type: String, default: "Unbounded" },
        backgroundColor: { type: String, default: "#050505" },
        textColor: { type: String, default: "#ffffff" },
        accentColor: { type: String, default: "#c5a059" },
        containerWidth: { type: String, default: "max-w-7xl" },
        customCss: { type: String, default: "" }
    },
    sections: {
        type: [mongoose.Schema.Types.Mixed],
        default: []
    },
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
        noFollow: { type: Boolean, default: false },
        structuredDataType: { type: String, default: "WebPage" }
    },
    navigation: {
        inNavbar: { type: Boolean, default: false },
        navLabel: { type: String, default: "" },
        navOrder: { type: Number, default: 99 },
        inFooter: { type: Boolean, default: false },
        footerLabel: { type: String, default: "" }
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
    order: { 
        type: Number, 
        default: 0 
    }
}, { timestamps: true });

// Pre-save hook: ensure slug is lowercase, trimmed, and formatted
CustomPageSchema.pre('save', function() {
    if (this.slug) {
        this.slug = this.slug.toLowerCase().trim().replace(/^\/+|\/+$/g, '');
    }
});

export default mongoose.models.CustomPage || mongoose.model('CustomPage', CustomPageSchema);
