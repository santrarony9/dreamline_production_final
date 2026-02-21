require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const upload = require('./s3-config');

// Models
const Wedding = require('./models/Wedding');
const Journal = require('./models/Journal');
const Content = require('./models/Content');
const Booking = require('./models/Booking');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

// --- DATABASE ---
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Error:', err));

// --- MIDDLEWARE ---
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../'))); // Serve static files from root


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
        const adminPhone = process.env.WHATSAPP_ADMIN_PHONE || '8240054002'; // Default to user's number from footer
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
                // We don't fail the whole request if WhatsApp fails
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
            // Merge existing data with update to prevent overwriting nested objects if partial update (though we usually send full object)
            // But Mongoose update logic in 'findOne' context needs careful handling or just use findOneAndUpdate
            // Here simpler:
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

const { PutObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');
const { s3, upload: multerUpload } = require('./s3-config');

const crypto = require('crypto');

// --- UPLOAD ENDPOINT ---
app.post('/api/upload', multerUpload.single('file'), async (req, res) => {
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
        // Construct the URL based on the bucket and region or use a custom domain if configured
        const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${finalFileName}`;

        console.log('Upload successful:', url);
        res.json({ url });

    } catch (err) {
        console.error('Upload Error:', err);
        res.status(500).json({ error: 'Failed to process or upload file: ' + err.message });
    }
});


// Start Server (Only for local dev)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export the app for Vercel
module.exports = app;
