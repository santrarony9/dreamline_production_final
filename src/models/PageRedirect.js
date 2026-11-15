import mongoose from 'mongoose';

const PageRedirectSchema = new mongoose.Schema({
    fromSlug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    toSlug: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    pageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CustomPage',
        index: true
    },
    statusCode: {
        type: Number,
        default: 301
    }
}, { timestamps: true });

export default mongoose.models.PageRedirect || mongoose.model('PageRedirect', PageRedirectSchema);
