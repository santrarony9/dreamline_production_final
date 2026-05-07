const mongoose = require('mongoose');

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
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Wedding || mongoose.model('Wedding', WeddingSchema);
