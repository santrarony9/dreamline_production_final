const data = {
    "type": "JOURNAL_POST",
    "action": "AUTOMATED_SYNC",
    "title": "Behind the Scenes: A Day at Tilottama Plaza Studio (Series 2)",
    "summary": "Witness the magic unfold at Tilottama Plaza Studio as our team of professional photographers create stunning visuals. We bring your vision to life with expert lighting, creative direction, and a passion for perfection.",
    "sourceUrl": "https://dreamlinepro.s3.ap-south-2.amazonaws.com/1778664039968-apipu-MKS_2044.JPG",
    "url": "https://dreamlineproduction.com/journals/behind-the-scenes-a-day-at-tilottama-plaza-studio-series-2"
};

fetch('https://hook.eu1.make.com/kqorky35l699m65mla8dzcut3alkczg7', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
}).then(res => res.text()).then(console.log).catch(console.error);
