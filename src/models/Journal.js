import mongoose from 'mongoose';

const JournalSchema = new mongoose.Schema({
    id: { type: String, unique: true, sparse: true },
    title: String,
    date: String,
    category: String,
    image: String,
    excerpt: String,
    content: String, // HTML content
    order: { type: Number, default: 0 },
    googleBusinessSync: { type: String, default: "PENDING" }, // PENDING, SYNCED, FAILED
    lastSyncedAt: { type: Date },
    seo: {
        title: { type: String, default: "" },
        description: { type: String, default: "" },
        keywords: { type: String, default: "" }
    },
}, { timestamps: true });

export default mongoose.models.Journal || mongoose.model('Journal', JournalSchema);
