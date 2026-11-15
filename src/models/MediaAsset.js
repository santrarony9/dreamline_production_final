import mongoose from 'mongoose';

const MediaAssetSchema = new mongoose.Schema({
    url: { 
        type: String, 
        required: true, 
        unique: true, 
        index: true,
        trim: true 
    },
    alt: { 
        type: String, 
        default: "",
        trim: true 
    },
    title: { 
        type: String, 
        default: "",
        trim: true 
    },
    caption: { 
        type: String, 
        default: "",
        trim: true 
    },
    category: { 
        type: String, 
        enum: ['wedding', 'commercial', 'drone', 'tech', 'blog', 'service', 'home', 'about', 'luxury', 'general'], 
        default: 'general',
        index: true 
    },
    source: { 
        type: String, 
        default: "" 
    },
    aiSuggestedAlt: { 
        type: String, 
        default: "",
        trim: true 
    },
    isManualApproved: { 
        type: Boolean, 
        default: false,
        index: true 
    },
    width: { type: Number },
    height: { type: Number },
    fileSize: { type: Number },
    mimeType: { type: String },
    usedIn: [{
        model: { type: String }, // 'Journal', 'Wedding', 'ServicePage', 'Content', 'CustomPage', 'TechProject'
        documentId: { type: String },
        field: { type: String },
        contextTitle: { type: String }
    }]
}, { timestamps: true });

// Index for filtering images with missing alt text
MediaAssetSchema.index({ alt: 1, isManualApproved: 1 });

export default mongoose.models.MediaAsset || mongoose.model('MediaAsset', MediaAssetSchema);
