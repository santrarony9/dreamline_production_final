import mongoose from 'mongoose';
import PodcastVideo from '../src/models/PodcastVideo.js';
import ServicePage from '../src/models/ServicePage.js';

const NEW_11_PODCAST_VIDEOS = [
    {
        title: "কেন টেলিভিশন ইন্ডাস্ট্রিকে 'Soulless Job' বললেন অভিনেতা বরুণ চন্দ? | Prompt With Paromita",
        youtubeUrl: "https://youtube.com/shorts/yleEJrCNEf0",
        youtubeId: "yleEJrCNEf0",
        description: "Acclaimed veteran actor Barun Chanda shares insights on the television industry in an exclusive interview on Prompt With Paromita.",
        category: "Interviews & Cinema",
        videoType: "shorts",
        thumbnail: "https://i.ytimg.com/vi/yleEJrCNEf0/maxresdefault.jpg",
        displayOrder: 1,
        status: "published"
    },
    {
        title: "সঙ্গীতে সফলতার টিপস | Prompt With Paromita",
        youtubeUrl: "https://youtube.com/shorts/KSivcLWbdnA",
        youtubeId: "KSivcLWbdnA",
        description: "Crucial tips and lessons for musical success and vocal mastery on Prompt With Paromita.",
        category: "Music & Culture",
        videoType: "shorts",
        thumbnail: "https://i.ytimg.com/vi/KSivcLWbdnA/maxresdefault.jpg",
        displayOrder: 2,
        status: "published"
    },
    {
        title: "সুন্দর বাংলা গান | Prompt With Paromita",
        youtubeUrl: "https://youtube.com/shorts/gV2eKL_RTrc",
        youtubeId: "gV2eKL_RTrc",
        description: "Soulful Bengali musical performance and conversation on Prompt With Paromita.",
        category: "Music & Culture",
        videoType: "shorts",
        thumbnail: "https://i.ytimg.com/vi/gV2eKL_RTrc/maxresdefault.jpg",
        displayOrder: 3,
        status: "published"
    },
    {
        title: "শতরূপে মা দুর্গা | Prompt With Paromita",
        youtubeUrl: "https://youtube.com/shorts/9nrOL-qhBf0",
        youtubeId: "9nrOL-qhBf0",
        description: "Spiritual dialogue and insights celebrating the diverse forms of Goddess Durga on Prompt With Paromita.",
        category: "Culture & Heritage",
        videoType: "shorts",
        thumbnail: "https://i.ytimg.com/vi/9nrOL-qhBf0/maxresdefault.jpg",
        displayOrder: 4,
        status: "published"
    },
    {
        title: "Calcutta's Mini Lucknow | Prompt With Paromita",
        youtubeUrl: "https://youtube.com/shorts/n1-LSS_uzJQ",
        youtubeId: "n1-LSS_uzJQ",
        description: "Exploring the historic culinary and architectural heritage of Metiabruz, Calcutta's mini Lucknow, on Prompt With Paromita.",
        category: "Heritage & History",
        videoType: "shorts",
        thumbnail: "https://i.ytimg.com/vi/n1-LSS_uzJQ/maxresdefault.jpg",
        displayOrder: 5,
        status: "published"
    },
    {
        title: "Get Healed Through Recitation by Sangita Saha | Prompt With Paromita",
        youtubeUrl: "https://youtube.com/shorts/5bINCVdismM",
        youtubeId: "5bINCVdismM",
        description: "Therapeutic poetry recitation and voice healing conversation with Sangita Saha on Prompt With Paromita.",
        category: "Art & Wellness",
        videoType: "shorts",
        thumbnail: "https://i.ytimg.com/vi/5bINCVdismM/maxresdefault.jpg",
        displayOrder: 6,
        status: "published"
    },
    {
        title: "ডায়মন্ড কি শুধুই হাই-সোসাইটির জন্য? | Sbd Lifestyle",
        youtubeUrl: "https://youtube.com/shorts/JV_yYXVIgjo",
        youtubeId: "JV_yYXVIgjo",
        description: "Demystifying diamond jewelry, luxury culture, and modern trends on Sbd Lifestyle podcast.",
        category: "Lifestyle & Luxury",
        videoType: "shorts",
        thumbnail: "https://i.ytimg.com/vi/JV_yYXVIgjo/maxresdefault.jpg",
        displayOrder: 7,
        status: "published"
    },
    {
        title: "ভবানীপুর কী deciding factor? West Bengal Elections Analysis | Kholapata ebong Arpita",
        youtubeUrl: "https://youtu.be/vTQLIoqQPGU",
        youtubeId: "vTQLIoqQPGU",
        description: "Comprehensive political analysis and electoral discussion on the significance of Bhowanipore constituency with senior political journalists on Kholapata ebong Arpita.",
        category: "Politics & Society",
        videoType: "standard",
        thumbnail: "https://i.ytimg.com/vi/vTQLIoqQPGU/maxresdefault.jpg",
        displayOrder: 8,
        status: "published"
    },
    {
        title: "অল্প বয়সেও হতে পারে Prostate Problem! Dr. Avishek Mukherjee | Kholapata ebong Arpita",
        youtubeUrl: "https://youtu.be/TU6KUw_55ic",
        youtubeId: "TU6KUw_55ic",
        description: "In-depth medical discussion with renowned specialist Dr. Avishek Mukherjee addressing early prostate symptoms, diagnosis, and treatment on Kholapata ebong Arpita.",
        category: "Health & Medicine",
        videoType: "standard",
        thumbnail: "https://i.ytimg.com/vi/TU6KUw_55ic/maxresdefault.jpg",
        displayOrder: 9,
        status: "published"
    },
    {
        title: "\"ভারতীয় মেয়েদের বিশ্বজয়, লড়াই শুরু হয়েছিল বহুদিন আগে\" মিঠু মুখোপাধ্যায় | Kholapata ebong Arpita",
        youtubeUrl: "https://youtube.com/shorts/J_s5AIP-hFY",
        youtubeId: "J_s5AIP-hFY",
        description: "Pioneering Indian women cricketer Mithu Mukherjee reflects on the historic struggles and global triumphs of women's sports.",
        category: "Sports & Women Empowerment",
        videoType: "shorts",
        thumbnail: "https://i.ytimg.com/vi/J_s5AIP-hFY/maxresdefault.jpg",
        displayOrder: 10,
        status: "published"
    },
    {
        title: "\"রাজনীতিতে কে থাকবে, আর কে যাবে, predict করা খুব মুশকিল\" জওহর সরকার | Kholapata ebong Arpita",
        youtubeUrl: "https://youtube.com/shorts/f2_paHV562A",
        youtubeId: "f2_paHV562A",
        description: "Former bureaucrat and Member of Parliament Jawhar Sircar shares candid reflections on political unpredictability.",
        category: "Politics & Society",
        videoType: "shorts",
        thumbnail: "https://i.ytimg.com/vi/f2_paHV562A/maxresdefault.jpg",
        displayOrder: 11,
        status: "published"
    }
];

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    for (const video of NEW_11_PODCAST_VIDEOS) {
        await PodcastVideo.findOneAndUpdate(
            { youtubeId: video.youtubeId },
            { $set: video },
            { upsert: true, new: true }
        );
        console.log(`Upserted: [${video.youtubeId}] ${video.title.substring(0, 40)}`);
    }

    // Keep display orders clean for all videos
    const allVideos = await PodcastVideo.find({}).sort({ displayOrder: 1, createdAt: 1 });
    console.log(`Total videos now in DB: ${allVideos.length}`);

    // Sync ServicePage.videos
    const publishedVideos = await PodcastVideo.find({ status: "published" })
        .sort({ displayOrder: 1, createdAt: -1 })
        .lean();

    const serviceVideos = publishedVideos.map(v => ({
        title: v.title,
        url: v.youtubeUrl,
        thumbnail: v.thumbnail
    }));

    await ServicePage.updateOne(
        { slug: "podcast-production-kolkata" },
        { $set: { videos: serviceVideos } }
    );
    console.log(`Synced ${serviceVideos.length} published videos to ServicePage.videos`);

    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
