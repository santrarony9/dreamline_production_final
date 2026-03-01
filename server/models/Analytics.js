const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
    path: { type: String, required: true },
    date: { type: String, required: true }, // Format YYYY-MM-DD
    views: { type: Number, default: 0 }
});

module.exports = mongoose.model('Analytics', AnalyticsSchema);
