import mongoose from 'mongoose';

const ServiceVideoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Video title is required'],
        trim: true
    },
    youtubeUrl: {
        type: String,
        default: "",
        trim: true
    },
    youtubeId: {
        type: String,
        default: "",
        trim: true,
        index: true
    },
    videoUrl: {
        type: String,
        default: "",
        trim: true
    },
    platform: {
        type: String,
        enum: ['youtube', 'instagram', 'direct', 'other'],
        default: 'youtube',
        index: true
    },
    instagramUrl: {
        type: String,
        default: "",
        trim: true
    },
    instagramId: {
        type: String,
        default: "",
        trim: true
    },
    thumbnail: {
        type: String,
        default: "",
        trim: true
    },
    customThumbnail: {
        type: String,
        default: "",
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Main category is required'],
        trim: true,
        index: true
    },
    serviceSlug: {
        type: String,
        required: [true, 'Service slug is required'],
        trim: true,
        index: true
    },
    serviceTitle: {
        type: String,
        default: "",
        trim: true
    },
    description: {
        type: String,
        default: "",
        trim: true
    },
    videoType: {
        type: String,
        enum: ['standard', 'shorts'],
        default: 'standard',
        index: true
    },
    tag: {
        type: String,
        default: "4K Cinematic",
        trim: true
    },
    isFeatured: {
        type: Boolean,
        default: false,
        index: true
    },
    order: {
        type: Number,
        default: 0,
        index: true
    },
    isPublished: {
        type: Boolean,
        default: true,
        index: true
    },
    status: {
        type: String,
        enum: ['published', 'draft'],
        default: 'published',
        index: true
    }
}, {
    timestamps: true
});

ServiceVideoSchema.index({ serviceSlug: 1, order: 1 });
ServiceVideoSchema.index({ category: 1, isPublished: 1 });

export default mongoose.models.ServiceVideo || mongoose.model('ServiceVideo', ServiceVideoSchema);
