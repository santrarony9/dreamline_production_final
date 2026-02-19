const mongoose = require('mongoose');

const WeddingSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    description: { type: String },
    coverImage: { type: String },
    hoverVideo: { type: String },
    videoUrl: { type: String },
    albumUrl: { type: String },
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
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Wedding', WeddingSchema);
