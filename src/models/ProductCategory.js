import mongoose from 'mongoose';

const ProductCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        required: [true, 'Category slug is required'],
        unique: true,
        trim: true,
        lowercase: true
    },
    order: {
        type: Number,
        default: 0,
        index: true
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    }
}, {
    timestamps: true
});

ProductCategorySchema.index({ order: 1 });

export default mongoose.models.ProductCategory || mongoose.model('ProductCategory', ProductCategorySchema);
