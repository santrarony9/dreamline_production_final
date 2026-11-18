import PodcastVideo from "../models/PodcastVideo.js";
import ServicePage from "../models/ServicePage.js";

export const INITIAL_PODCAST_VIDEOS = [
    {
        title: "কেন টেলিভিশন ইন্ডাস্ট্রিকে 'Soulless Job' বললেন অভিনেতা বরুণ চন্দ? | Prompt With Paromita",
        youtubeUrl: "https://youtube.com/shorts/yleEJrCNEf0",
        youtubeId: "yleEJrCNEf0",
        description: "Acclaimed veteran actor Barun Chanda shares insights on the television industry in an exclusive interview on Prompt With Paromita.",
        category: "Interviews & Cinema",
        videoType: "shorts",
        thumbnail: "https://img.youtube.com/vi//hqdefault.jpg",
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
        thumbnail: "https://img.youtube.com/vi//hqdefault.jpg",
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
        thumbnail: "https://img.youtube.com/vi//hqdefault.jpg",
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
        thumbnail: "https://img.youtube.com/vi//hqdefault.jpg",
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
        thumbnail: "https://img.youtube.com/vi//hqdefault.jpg",
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
        thumbnail: "https://img.youtube.com/vi//hqdefault.jpg",
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
        thumbnail: "https://img.youtube.com/vi//hqdefault.jpg",
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
        thumbnail: "https://img.youtube.com/vi//hqdefault.jpg",
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
        thumbnail: "https://img.youtube.com/vi//hqdefault.jpg",
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
        thumbnail: "https://img.youtube.com/vi//hqdefault.jpg",
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
        thumbnail: "https://img.youtube.com/vi//hqdefault.jpg",
        displayOrder: 11,
        status: "published"
    },
    {
        title: "Banglar gan with versatile singer Pousali Banerjee | Prompt With Paromita",
        youtubeUrl: "https://youtu.be/rGCNP3nWC9Y",
        youtubeId: "rGCNP3nWC9Y",
        description: "Full studio interview with versatile folk music artist Pousali Banerjee discussing Bengali traditional music.",
        category: "Music & Culture",
        videoType: "standard",
        thumbnail: "https://img.youtube.com/vi//hqdefault.jpg",
        displayOrder: 12,
        status: "published"
    },
    {
        title: "দীপান্বিতা অমাবস্যার নিয়ম! #shorts | Prompt With Paromita",
        youtubeUrl: "https://youtube.com/shorts/hRnCf_evOZs",
        youtubeId: "hRnCf_evOZs",
        description: "Spiritual insights and Dipanwita Amavasya rituals discussion highlight reel.",
        category: "Spiritual & Traditions",
        videoType: "shorts",
        thumbnail: "https://img.youtube.com/vi//hqdefault.jpg",
        displayOrder: 13,
        status: "published"
    },
    {
        title: "দুর্গাপুজোর বোধন,বিসর্জন,সিঁদুর খেলা—কেন এই রীতি ? | Kholapata ebong Arpita",
        youtubeUrl: "https://youtu.be/t4YqQvedLkE",
        youtubeId: "t4YqQvedLkE",
        description: "Deep dive conversation exploring the history and cultural rituals of Durga Puja in Bengal.",
        category: "Culture & Heritage",
        videoType: "standard",
        thumbnail: "https://img.youtube.com/vi//hqdefault.jpg",
        displayOrder: 14,
        status: "published"
    },
    {
        title: "মাত্র ৪৮ মিনিট! কেন এই সময়টাই এত গুরুত্বপূর্ণ? | Kholapata ebong Arpita",
        youtubeUrl: "https://youtube.com/shorts/qtp9vJ0xzFY",
        youtubeId: "qtp9vJ0xzFY",
        description: "Viral podcast highlight on time significance from Kholapata ebong Arpita.",
        category: "Highlights & Shorts",
        videoType: "shorts",
        thumbnail: "https://img.youtube.com/vi//hqdefault.jpg",
        displayOrder: 15,
        status: "published"
    },
    {
        title: "শান্তিপুরের ঐতিহ্য: বড় গোস্বামী বাড়ি ও আগমেশ্বরী মাতার অজানা ইতিহাস | ANI In Search For Truth",
        youtubeUrl: "https://youtu.be/fLturgnZcMw",
        youtubeId: "fLturgnZcMw",
        description: "Historic journey through the heritage of Shantipur Goswami Bari and Agameshwari Mata.",
        category: "History & Investigation",
        videoType: "standard",
        thumbnail: "https://img.youtube.com/vi//hqdefault.jpg",
        displayOrder: 16,
        status: "published"
    },
    {
        title: "মারণ ক্রিয়া কি ? তন্ত্র দিয়ে কি সত্যিই ক্ষতি করা যায়? | ANI In Search For Truth",
        youtubeUrl: "https://youtube.com/shorts/p-AOOftRg_E",
        youtubeId: "p-AOOftRg_E",
        description: "Investigative short clip discussing occult folklore and traditions.",
        category: "Highlights & Shorts",
        videoType: "shorts",
        thumbnail: "https://img.youtube.com/vi//hqdefault.jpg",
        displayOrder: 17,
        status: "published"
    }
];

// Ensure initial videos are present in the PodcastVideo collection
export async function ensurePodcastVideosSeeded() {
    try {
        const count = await PodcastVideo.countDocuments();
        if (count < INITIAL_PODCAST_VIDEOS.length) {
            for (const v of INITIAL_PODCAST_VIDEOS) {
                await PodcastVideo.findOneAndUpdate(
                    { youtubeId: v.youtubeId },
                    { $setOnInsert: v },
                    { upsert: true }
                );
            }
        }
        
        // Also keep ServicePage.videos synchronized for redundancy
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
    } catch (err) {
        console.error("Error in ensurePodcastVideosSeeded:", err);
    }
}
