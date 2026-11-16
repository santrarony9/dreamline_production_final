import mongoose from 'mongoose';

const WeddingSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    description: { type: String },
    location: { type: String },
    date: { type: Date },
    coverImage: { type: String },
    img: { type: String }, // backward compat alias for coverImage
    hoverVideo: { type: String },
    videoUrl: { type: String },
    albumUrl: { type: String },
    images: [String],
    altText: { type: String, default: '' },
    imageAltTexts: [String],
    review: { type: String },
    clientNames: { type: String },
    reviews: [{
        author: String,
        text: String,
        rating: Number
    }],
    storyChapters: [{
        title: String,
        images: [String]
    }],
    vendors: [{
        category: String,
        name: String,
        link: String
    }],
    order: { type: Number, default: 0 },
    seo: {
        title: { type: String, default: "" },
        description: { type: String, default: "" },
        keywords: { type: String, default: "" }
    },
    published: { type: Boolean, default: true },
    photos: [{
        id: { type: String },
        albumId: { type: String },
        url: { type: String, required: true },
        caption: { type: String, default: "" },
        altText: { type: String, default: "" },
        order: { type: Number, default: 0 },
        isCover: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }],
    updatedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Wedding || mongoose.model('Wedding', WeddingSchema);
