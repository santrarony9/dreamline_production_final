import mongoose from 'mongoose';

const AnalyticsSchema = new mongoose.Schema({
    path: { type: String, required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    views: { type: Number, default: 0 }
}, { timestamps: true });

// Compound index for efficient path/date lookups
AnalyticsSchema.index({ path: 1, date: 1 }, { unique: true });

export default mongoose.models.Analytics || mongoose.model('Analytics', AnalyticsSchema);
