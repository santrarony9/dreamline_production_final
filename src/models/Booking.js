import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    phone: String,
    email: String,
    eventDate: String,
    serviceType: String,
    vision: String,
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
