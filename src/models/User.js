import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        sparse: true
    },
    username: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
        lowercase: true,
        minlength: 3
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        enum: ['admin', 'editor'], 
        default: 'admin' 
    },
    twoFactorSecret: {
        type: String,
        default: ""
    }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
