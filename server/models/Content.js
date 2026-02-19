const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
    hero: {
        title: {
            line1: String,
            line2: String
        },
        subtitle: String,
        videoUrl: String,
        cta: [{
            text: String,
            link: String
        }]
    },
    marquee: [String],
    stats: [{
        value: String,
        label: String
    }],
    gallery: {
        title: String,
        subtitle: String,
        images: [String]
    },
    projects: [{
        id: Number,
        title: String,
        type: String, // 'commercial', 'wedding', 'music'
        img: String
    }],
    services: [{
        id: String,
        title: String,
        price: String,
        link: String
    }]
});

module.exports = mongoose.model('Content', ContentSchema);
