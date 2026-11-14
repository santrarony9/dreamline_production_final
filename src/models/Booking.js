import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, default: '' },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    eventDate: { type: String, default: '' },
    serviceType: { type: String, default: 'Wedding' },
    vision: { type: String, default: '' },
    message: { type: String, default: '' },
    notes: { type: String, default: '' },
    status: { 
        type: String, 
        enum: ['pending', 'contacted', 'confirmed', 'completed', 'cancelled'], 
        default: 'pending' 
    },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
