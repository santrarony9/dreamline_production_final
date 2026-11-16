import mongoose from 'mongoose';

const GalleryItemSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Gallery item title is required'],
        trim: true 
    },
    caption: { 
        type: String, 
        default: "",
        trim: true 
    },
    altText: { 
        type: String, 
        default: "",
        trim: true 
    },
    category: { 
        type: String, 
        required: [true, 'Category is required'],
        enum: ['weddings', 'pre-wedding', 'rituals', 'commercial', 'drone'],
        default: 'weddings' 
    },
    imageUrl: { 
        type: String, 
        required: [true, 'Image URL is required'],
        trim: true 
    },
    aspectRatio: {
        type: String,
        enum: ['vertical', 'horizontal', 'square'],
        default: 'vertical'
    },
    order: { 
        type: Number, 
        default: 0 
    },
    published: { 
        type: Boolean, 
        default: true 
    },
    weddingId: {
        type: String,
        default: "",
        trim: true
    },
    projectUrl: {
        type: String,
        default: "",
        trim: true
    }
}, { timestamps: true });

// Index for high-performance sorting and category filtering
GalleryItemSchema.index({ published: 1, category: 1, order: 1 });

export default mongoose.models.GalleryItem || mongoose.model('GalleryItem', GalleryItemSchema);
