require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');

console.log("Testing Connection to:", process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("✅ SUCCESS: Connected to MongoDB!");
        process.exit(0);
    })
    .catch(err => {
        console.error("❌ FAILED: Could not connect.");
        console.error(err.message);
        process.exit(1);
    });
