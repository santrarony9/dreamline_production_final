const axios = require('axios');

const webhookUrl = 'https://hook.eu1.make.com/kqorky35l699m65mla8dzcut3alkczg7';

const testData = {
    type: 'JOURNAL_POST',
    action: 'CREATE',
    post: {
        title: "Test Post: Our New Studio at Tilottama Plaza",
        date: new Date().toISOString().split('T')[0],
        category: "INSIGHT",
        image: "https://dreamlinepro.s3.ap-south-2.amazonaws.com/1778674638931-y7jgz-KOL07914.jpg",
        excerpt: "We are excited to announce our upgraded studio location for premium cinematic production in Kolkata.",
        content: "Detailed content about our new studio at 85 Tilottama Plaza."
    }
};

async function sendTest() {
    try {
        console.log("Sending test signal to Make.com...");
        const response = await axios.post(webhookUrl, testData);
        console.log("Signal sent! Response:", response.status);
    } catch (error) {
        console.error("Error sending signal:", error.message);
    }
}

sendTest();
