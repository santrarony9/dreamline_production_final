import mongoose from 'mongoose';

const PodcastVideoSchema = new mongoose.Schema({
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
    description: {
        type: String,
        default: "",
        trim: true
    },
    category: {
        type: String,
        default: "General",
        trim: true,
        index: true
    },
    videoType: {
        type: String,
        enum: ['standard', 'shorts'],
        default: 'standard',
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
    displayOrder: {
        type: Number,
        default: 0,
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

// Helper static to extract YouTube ID
PodcastVideoSchema.statics.extractYouTubeId = function(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

// Helper static to detect video type
PodcastVideoSchema.statics.detectVideoType = function(url) {
    if (!url) return 'standard';
    return url.includes('/shorts/') ? 'shorts' : 'standard';
};

export default mongoose.models.PodcastVideo || mongoose.model('PodcastVideo', PodcastVideoSchema);
