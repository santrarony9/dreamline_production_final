import mongoose from 'mongoose';

const ServiceShotSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Shot title is required'],
        trim: true
    },
    imageUrl: {
        type: String,
        required: [true, 'Image URL is required'],
        trim: true
    },
    thumbnailUrl: {
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
    videoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceVideo',
        default: null
    },
    videoTitle: {
        type: String,
        default: "",
        trim: true
    },
    videoUrl: {
        type: String,
        default: "",
        trim: true
    },
    description: {
        type: String,
        default: "",
        trim: true
    },
    shotType: {
        type: String,
        enum: ['candid', 'ritual', 'portrait', 'cinematic-frame', 'aerial', 'detail', 'commercial', 'general'],
        default: 'candid',
        index: true
    },
    aspectRatio: {
        type: String,
        enum: ['16:9', '9:16', '4:5', '1:1', 'horizontal', 'vertical'],
        default: '16:9'
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
    },
    width: { type: Number },
    height: { type: Number },
    fileSize: { type: Number },
    mimeType: { type: String }
}, {
    timestamps: true
});

ServiceShotSchema.index({ serviceSlug: 1, order: 1 });
ServiceShotSchema.index({ category: 1, isPublished: 1 });
ServiceShotSchema.index({ videoId: 1 });

export default mongoose.models.ServiceShot || mongoose.model('ServiceShot', ServiceShotSchema);
