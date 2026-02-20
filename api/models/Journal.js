const mongoose = require('mongoose');

const JournalSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    title: String,
    date: String,
    category: String,
    image: String,
    excerpt: String,
    content: String // HTML content
}, { timestamps: true });

module.exports = mongoose.model('Journal', JournalSchema);
