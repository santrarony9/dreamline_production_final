import mongoose from 'mongoose';

const NavigationItemSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Menu title is required'], 
        trim: true 
    },
    url: { 
        type: String, 
        required: [true, 'Menu URL is required'], 
        trim: true 
    },
    type: { 
        type: String, 
        enum: ['internal', 'external', 'custom'], 
        default: 'internal' 
    },
    parentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'NavigationItem', 
        default: null,
        index: true 
    },
    order: { 
        type: Number, 
        default: 0,
        index: true 
    },
    openInNewTab: { 
        type: Boolean, 
        default: false 
    },
    isActive: { 
        type: Boolean, 
        default: true,
        index: true 
    },
    displayDesktop: { 
        type: Boolean, 
        default: true 
    },
    displayMobile: { 
        type: Boolean, 
        default: true 
    },
    // Optional mega-menu and presentation fields
    badge: { 
        type: String, 
        default: "",
        trim: true 
    },
    description: { 
        type: String, 
        default: "",
        trim: true 
    },
    group: { 
        type: String, 
        default: "",
        trim: true 
    },
    icon: { 
        type: String, 
        default: "",
        trim: true 
    },
    isDropdown: { 
        type: Boolean, 
        default: false 
    }
}, { 
    timestamps: true 
});

// Pre-save cleanup
NavigationItemSchema.pre('save', function() {
    if (this.url) {
        this.url = this.url.trim();
        // If internal and doesn't start with / or http, prepend /
        if (this.type === 'internal' && !this.url.startsWith('/') && !this.url.startsWith('http')) {
            this.url = '/' + this.url;
        }
    }
});

export default mongoose.models.NavigationItem || mongoose.model('NavigationItem', NavigationItemSchema);
