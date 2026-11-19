import mongoose from 'mongoose';

const ServiceVideoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Video title is required'],
        trim: true
    },
    youtubeUrl: {
        type: String,
        required: [true, 'YouTube URL is required'],
        trim: true
    },
    youtubeId: {
        type: String,
        required: [true, 'YouTube Video ID is required'],
        trim: true,
        index: true
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
