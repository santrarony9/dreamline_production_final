require('dotenv').config();
const express = require('express');
const path = require('path');

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

// --- UPLOAD ENDPOINT ---
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ url: req.file.location }); // AWS S3 returns the absolute URL in 'location'
});


// Start Server (Only for local dev)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export the app for Vercel
module.exports = app;
