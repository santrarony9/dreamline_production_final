import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI && process.env.NODE_ENV === 'production') {
    console.warn("MONGODB_URI is not defined. Database operations will fail.");
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!MONGODB_URI) {
        console.warn("MONGODB_URI is missing. Skipping database connection (expected during build/CI).");
        return null;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            return mongoose;
        });
    }
    
    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.error("MongoDB Connection Error:", e);
        return null;
    }
    
    return cached.conn;
}

export default dbConnect;
