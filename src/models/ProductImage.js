import mongoose from 'mongoose';

const ProductImageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Product image title is required'],
        trim: true,
        default: "Product Showcase Image"
    },
    imageUrl: {
        type: String,
        required: [true, 'Image URL is required'],
        trim: true
    },
    thumbnailUrl: {
        type: String,
        default: "",
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
        index: true,
        default: "Other Products"
    },
    altText: {
        type: String,
        default: "",
        trim: true
    },
    isFeatured: {
        type: Boolean,
        default: false,
        index: true
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
    width: { type: Number },
    height: { type: Number },
    aspectRatio: {
        type: String,
        enum: ['1:1', '4:5', '16:9', 'original'],
        default: '1:1'
    },
    tags: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true
});

ProductImageSchema.index({ category: 1, isPublished: 1, order: 1 });
ProductImageSchema.index({ isPublished: 1, order: 1, createdAt: -1 });

export default mongoose.models.ProductImage || mongoose.model('ProductImage', ProductImageSchema);
