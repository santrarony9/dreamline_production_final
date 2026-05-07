const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
    path: { type: String, required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    views: { type: Number, default: 0 }
}, { timestamps: true });

AnalyticsSchema.index({ path: 1, date: 1 }, { unique: true });

module.exports = mongoose.models.Analytics || mongoose.model('Analytics', AnalyticsSchema);
