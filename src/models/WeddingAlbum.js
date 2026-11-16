import mongoose from 'mongoose';

const PhotoSchema = new mongoose.Schema({
    id: { type: String, required: true },
    albumId: { type: String, required: true },
    url: { type: String, required: true },
    caption: { type: String, default: "" },
    altText: { type: String, default: "" },
    order: { type: Number, default: 0 },
    isCover: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
}, { _id: false });

const WeddingAlbumSchema = new mongoose.Schema({
    albumId: { type: String, required: true, unique: true, index: true },
    weddingId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: "" },
    clientNames: { type: String, default: "" },
    description: { type: String, default: "" },
    location: { type: String, default: "" },
    date: { type: Date },
    coverImage: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
    albumUrl: { type: String, default: "" },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    photos: [PhotoSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

WeddingAlbumSchema.index({ published: 1, order: 1 });

export default mongoose.models.WeddingAlbum || mongoose.model('WeddingAlbum', WeddingAlbumSchema);
