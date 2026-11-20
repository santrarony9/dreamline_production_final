import mongoose from 'mongoose';

const ImageAngleSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
        trim: true
    },
    order: {
        type: Number,
        default: 0
    },
    isCover: {
        type: Boolean,
        default: false
    }
}, { _id: false });

const JewelleryItemSchema = new mongoose.Schema({
    slug: {
        type: String,
        required: [true, 'Slug is required'],
        unique: true,
        trim: true,
        lowercase: true,
        index: true
    },
    title: {
        type: String,
        required: [true, 'Internal title is required'],
        trim: true,
        default: 'Jewellery Design'
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
        default: 'JEWELLERY',
        index: true
    },
    coverImage: {
        type: String,
        required: [true, 'Cover image URL is required'],
        trim: true
    },
    images: {
        type: [ImageAngleSchema],
        default: []
    },
    order: {
        type: Number,
        default: 0,
        index: true
    },
    isPublished: {
        type: Boolean,
        default: true,
        index: true
    },
    isUnclassified: {
        type: Boolean,
        default: false,
        index: true
    },
    videoUrl: {
        type: String,
        default: '',
        trim: true
    },
    notes: {
        type: String,
        default: '',
        trim: true
    }
}, {
    timestamps: true
});

export default mongoose.models.JewelleryItem || mongoose.model('JewelleryItem', JewelleryItemSchema);
