require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const path = require('path');

const Wedding = require('./models/Wedding');
const Content = require('./models/Content');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public'))); // Serve static files (if any remain)

// --- CONFIGURATION ---
// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'dreamline_uploads',
        allowed_formats: ['jpg', 'png', 'jpeg', 'mp4', 'mov'],
        resource_type: 'auto'
    }
});

const upload = multer({ storage: storage });

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
                projects: []
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
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ url: req.file.path }); // Cloudinary returns the absolute URL in 'path'
});


// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
