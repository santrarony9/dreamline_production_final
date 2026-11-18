import mongoose from 'mongoose';

const ServiceCategorySchema = new mongoose.Schema({
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
        trim: true 
    },
    description: { 
        type: String, 
        default: "", 
        trim: true 
    },
    image: { 
        type: String, 
        default: "" 
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
    },
    isPublished: { 
        type: Boolean, 
        default: true 
    },
    showInMegaMenu: { 
        type: Boolean, 
        default: true 
    },
    url: { 
        type: String, 
        default: "", 
        trim: true 
    },
    badge: { 
        type: String, 
        default: "", 
        trim: true 
    }
}, { 
    timestamps: true 
});

export default mongoose.models.ServiceCategory || mongoose.model('ServiceCategory', ServiceCategorySchema);
