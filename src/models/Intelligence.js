import mongoose from 'mongoose';

const IntelligenceSchema = new mongoose.Schema({
    date: { type: String, required: true, unique: true }, // YYYY-MM-DD
    summary: { type: String },
    stats: {
        totalViews: Number,
        seoViews: Number,
        conversions: Number,
        growth: Number
    },
    insights: [{
        type: { type: String, enum: ['WIN', 'ISSUE', 'OPPORTUNITY'] },
        message: String,
        priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'] }
    }],
    actionItems: [String],
    status: { type: String, default: 'COMPLETED' }
}, { timestamps: true });

export default mongoose.models.Intelligence || mongoose.model('Intelligence', IntelligenceSchema);
