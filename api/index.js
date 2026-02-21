require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { s3, upload } = require('./s3-config');
const mongoose = require('mongoose');
const path = require('path');
const axios = require('axios');
const sharp = require('sharp');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PutObjectCommand } = require('@aws-sdk/client-s3');

const Wedding = require('./models/Wedding');
const Content = require('./models/Content');
const Journal = require('./models/Journal');
const Booking = require('./models/Booking');
const User = require('./models/User');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'dreamline-secret-key-2026';

app.use(cors());
app.use(bodyParser.json());

// Cached connection variable
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }

    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is missing in environment variables');
    }

    // Connect to MongoDB
    const db = await mongoose.connect(process.env.MONGODB_URI, {
        bufferCommands: false, // Disable Mongoose buffering to avoid hanging
    });

    cachedDb = db;
    console.log("New MongoDB Connection Established");
    return db;
}

// Middleware to ensure DB is connected
app.use(async (req, res, next) => {
    try {
        await connectToDatabase();
        next();
    } catch (error) {
        console.error("Database connection failed:", error);
        res.status(500).json({ error: "Database connection failed", details: error.message });
    }
});

// Health Check Endpoint
app.get('/api', (req, res) => {
    res.json({ status: 'API is running', timestamp: new Date() });
});

// --- AUTH ENDPOINTS ---

// 1. LOGIN
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Auto-create first admin if DB is empty
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            const hashed = await bcrypt.hash('admin123', 10);
            await new User({ username: 'admin', password: hashed }).save();
            console.log('Seed: Initial admin created.');
        }

        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, username: user.username });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. VERIFY TOKEN (Used by frontend)
app.get('/api/auth/verify', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ valid: true, decoded });
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// --- API ENDPOINTS ---

// 1. GET ALL WEDDINGS
app.get('/api/weddings', async (req, res) => {
    try {
        const weddings = await Wedding.find().sort({ createdAt: -1 });
        res.json(weddings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. GET SINGLE WEDDING
app.get('/api/weddings/:id', async (req, res) => {
    try {
        const wedding = await Wedding.findOne({ id: req.params.id });
        if (!wedding) return res.status(404).json({ error: 'Wedding not found' });
        res.json(wedding);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. CREATE NEW WEDDING
app.post('/api/weddings', async (req, res) => {
    try {
        const newWedding = new Wedding(req.body);
        await newWedding.save();
        res.json(newWedding);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. UPDATE WEDDING
app.put('/api/weddings/:id', async (req, res) => {
    try {
        const updatedWedding = await Wedding.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { new: true }
        );
        res.json(updatedWedding);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. DELETE WEDDING
app.delete('/api/weddings/:id', async (req, res) => {
    try {
        await Wedding.findOneAndDelete({ id: req.params.id });
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- JOURNAL ENDPOINTS ---

// GET ALL JOURNALS
app.get('/api/journals', async (req, res) => {
    try {
        const journals = await Journal.find().sort({ createdAt: -1 });
        res.json(journals);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET SINGLE JOURNAL
app.get('/api/journals/:id', async (req, res) => {
    try {
        const journal = await Journal.findOne({ id: req.params.id });
        if (!journal) return res.status(404).json({ error: 'Journal not found' });
        res.json(journal);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE JOURNAL
app.post('/api/journals', async (req, res) => {
    try {
        const newJournal = new Journal(req.body);
        await newJournal.save();
        res.json(newJournal);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE JOURNAL
app.put('/api/journals/:id', async (req, res) => {
    try {
        const updatedJournal = await Journal.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { new: true }
        );
        res.json(updatedJournal);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE JOURNAL
app.delete('/api/journals/:id', async (req, res) => {
    try {
        await Journal.findOneAndDelete({ id: req.params.id });
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- BOOKING ENDPOINTS ---

// 6. CREATE NEW BOOKING INQUIRY
app.post('/api/bookings', async (req, res) => {
    try {
        const { firstName, lastName, phone, email, eventDate, serviceType, vision } = req.body;

        // Save to Database
        const newBooking = new Booking({
            firstName,
            lastName,
            phone,
            email,
            eventDate,
            serviceType,
            vision
        });
        await newBooking.save();

        // Send WhatsApp Notification to Admin
        const adminPhone = process.env.WHATSAPP_ADMIN_PHONE || '8240054002';
        const message = `New Inquiry from ${firstName} ${lastName}! \nPhone: ${phone} \nEvent: ${eventDate} \nService: ${serviceType}`;

        const waUrl = 'http://bhashsms.com/api/sendmsg.php';
        const waParams = {
            user: process.env.WHATSAPP_USER || 'Rony_BW',
            pass: process.env.WHATSAPP_PASS,
            sender: process.env.WHATSAPP_SENDER || 'BUZWAP',
            phone: adminPhone,
            text: message,
            priority: 'wa',
            stype: 'normal'
        };

        if (process.env.WHATSAPP_PASS) {
            try {
                await axios.get(waUrl, { params: waParams });
            } catch (waErr) {
                console.error('WhatsApp notification failed:', waErr.message);
            }
        }

        res.json({ success: true, booking: newBooking });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 7. GET ALL BOOKINGS
app.get('/api/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 8. DELETE BOOKING
app.delete('/api/bookings/:id', async (req, res) => {
    try {
        await Booking.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- SITE CONTENT ENDPOINTS ---

// 6. GET SITE CONTENT
app.get('/api/content', async (req, res) => {
    try {
        let content = await Content.findOne();
        if (!content) {
            // Create default if not exists
            content = new Content({
                hero: { title: { line1: 'Visionary', line2: 'Cinema.' }, subtitle: 'Est. 2010', cta: [] },
                marquee: [],
                stats: [],
                gallery: { title: 'Motion Archive', images: [] },
                projects: [],
                about: {
                    heroTitle: 'Trusted Production House',
                    heroSubtitle: 'Est. 2010',
                    vision: 'To redefine visual storytelling.',
                    mission: 'Crafting cinematic narratives.',
                    founderNote: 'We archive emotions.',
                    founderImage: '',
                    team: [],
                    reviews: []
                }
            });
            await content.save();
        }
        res.json(content);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 7. UPDATE SITE CONTENT
app.post('/api/content', async (req, res) => {
    try {
        // We assume there's only one content document, so we update the first one found or create it
        let content = await Content.findOne();
        if (content) {
            Object.assign(content, req.body);
            await content.save();
        } else {
            content = new Content(req.body);
            await content.save();
        }
        res.json(content);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- UPLOAD ENDPOINT ---
app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    try {
        const file = req.file;
        const isImage = file.mimetype.startsWith('image/');

        // Generate absolute uniqueness
        const uniqueSuffix = crypto.randomBytes(12).toString('hex');
        const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
        const fileName = `uploads/${Date.now()}-${uniqueSuffix}-${cleanName}`;

        let uploadBuffer = file.buffer;
        if (!uploadBuffer || uploadBuffer.length === 0) {
            throw new Error('Received an empty or corrupted file buffer');
        }
        let contentType = file.mimetype;
        let finalFileName = fileName;

        // 1. Optimize Image if applicable
        if (isImage && !file.mimetype.includes('svg')) {
            console.log('Optimizing image:', file.originalname);
            uploadBuffer = await sharp(file.buffer)
                .resize({ width: 2000, withoutEnlargement: true }) // Limit max width
                .webp({ quality: 80 }) // Convert to WebP for best performance
                .toBuffer();
            contentType = 'image/webp';
            finalFileName = fileName.replace(/\.[^.]+$/, '.webp');
        }

        // 2. Upload to S3
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: finalFileName,
            Body: uploadBuffer,
            ContentType: contentType
        });

        await s3.send(command);

        // 3. Return the URL
        const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${finalFileName}`;

        console.log('Upload successful:', url);
        res.json({ url });

    } catch (err) {
        console.error('Upload Error:', err);
        res.status(500).json({ error: 'Failed to process or upload file: ' + err.message });
    }
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error', details: err });
});

// Export the app for Vercel Serverless
module.exports = app;
