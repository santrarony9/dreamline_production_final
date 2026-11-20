import mongoose from 'mongoose';

const ServicePageSchema = new mongoose.Schema({
    slug: { 
        type: String, 
        required: true, 
        unique: true,
        index: true
    },
    aliases: [{ type: String, index: true }],
    title: { type: String, required: true },
    subtitle: { type: String, default: "Services" },
    description: { type: String },
    shortDescription: { type: String, default: "" },
    category: { type: String, default: "", index: true },
    heroImage: { type: String },
    heroImageAlt: { type: String, default: "" },
    heroVideo: { type: String, default: "" },
    gallery: [{
        url: String,
        caption: String,
        alt: { type: String, default: "" }
    }],
    videos: [{
        title: { type: String, default: "" },
        url: { type: String, default: "" }, // YouTube, Instagram or direct link
        thumbnail: { type: String, default: "" },
        description: { type: String, default: "" },
        category: { type: String, default: "" },
        platform: { type: String, default: "youtube" },
        type: { type: String, default: "standard" },
        isFeatured: { type: Boolean, default: false },
        order: { type: Number, default: 0 }
    }],
    videoSectionTitle: { type: String, default: "" },
    videoSectionSubtitle: { type: String, default: "" },
    sections: [{
        title: { type: String, default: "" },
        subtitle: { type: String, default: "" },
        content: { type: String, default: "" },
        image: { type: String, default: "" },
        order: { type: Number, default: 0 }
    }],
    testimonials: [{
        clientName: { type: String, default: "" },
        company: { type: String, default: "" },
        comment: { type: String, default: "" },
        rating: { type: Number, default: 5 },
        avatar: { type: String, default: "" }
    }],
    seoTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    metaKeywords: { type: String, default: "" },
    ctaText: { type: String, default: "" },
    ctaLink: { type: String, default: "" },
    featuredBadge: { type: String, default: "" },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    isPublished: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.ServicePage || mongoose.model('ServicePage', ServicePageSchema);
