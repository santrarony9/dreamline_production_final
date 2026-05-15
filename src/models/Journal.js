import mongoose from 'mongoose';

const JournalSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    title: String,
    date: String,
    category: String,
    image: String,
    excerpt: String,
    content: String, // HTML content
    order: { type: Number, default: 0 },
    seo: {
        title: { type: String, default: "" },
        description: { type: String, default: "" },
        keywords: { type: String, default: "" }
    },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.Journal || mongoose.model('Journal', JournalSchema);
