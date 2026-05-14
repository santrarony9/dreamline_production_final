import mongoose from 'mongoose';

const ServicePageSchema = new mongoose.Schema({
    slug: { 
        type: String, 
        required: true, 
        unique: true,
        index: true
    },
    title: { type: String, required: true },
    subtitle: { type: String, default: "Services" },
    description: { type: String },
    heroImage: { type: String },
    gallery: [{
        url: String,
        caption: String
    }],
    videos: [{
        title: String,
        url: String, // YouTube or direct link
        thumbnail: String
    }],
    active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.ServicePage || mongoose.model('ServicePage', ServicePageSchema);
