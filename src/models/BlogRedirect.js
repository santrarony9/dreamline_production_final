import mongoose from 'mongoose';

const BlogRedirectSchema = new mongoose.Schema({
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
    blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Journal',
        index: true
    },
    statusCode: {
        type: Number,
        default: 301
    }
}, { timestamps: true });

export default mongoose.models.BlogRedirect || mongoose.model('BlogRedirect', BlogRedirectSchema);
