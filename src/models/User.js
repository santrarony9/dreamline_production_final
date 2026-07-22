import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
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
