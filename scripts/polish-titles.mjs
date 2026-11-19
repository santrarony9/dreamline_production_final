import mongoose from 'mongoose';

async function polishVideoTitlesAndCategories() {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    // Title & Category cleanups by YouTube URL
    const titleCleanups = {
        "https://www.youtube.com/watch?v=il4uufxfxKY": {
            title: "Milestone Birthday Celebration in Kolkata",
            category: "Milestone Birthday"
        },
        "https://www.youtube.com/watch?v=KxySjtXaRN0": {
            title: "Adi 1st Birthday Celebration Cinema",
            category: "Kids Birthday"
        },
        "https://www.youtube.com/watch?v=1WrTme9zPQk": {
            title: "Vibrant Birthday Celebration Highlights",
            category: "Birthday Highlights"
        },
        "https://www.youtube.com/watch?v=Zt1v44RWj5Y": {
            title: "Shlok Themed Birthday Party Highlights",
            category: "Theme Birthday"
        },
        "https://www.youtube.com/watch?v=nVbzHQgHnpA": {
            title: "Akshay & Pratyush Double Birthday Celebration",
            category: "Family Celebration"
        },
        "https://www.youtube.com/watch?v=fduCdqVPOfY": {
            title: "Mist & Magic Sacred Pujan Ceremony",
            category: "Devotional Pujan"
        },
        "https://www.youtube.com/watch?v=riR7mZ6s9A4": {
            title: "Samrudh Upanayan | Bengali Sacred Thread Ceremony",
            category: "Sacred Upanayan"
        },
        "https://www.youtube.com/watch?v=oeJkQxnaCEo": {
            title: "Nakhoda Masjid Kolkata | Architectural Heritage Documentary",
            category: "Cultural Heritage"
        },
        "https://www.youtube.com/watch?v=1lfpxRXTMOM": {
            title: "Annaprashan Ceremony of Purno | Cinematic Trailer",
            category: "Rice Ceremony"
        },
        "https://www.youtube.com/watch?v=K18tvma2Jo4": {
            title: "Traditional Bengali Annaprashan Rituals",
            category: "Rice Ceremony"
        },
        "https://www.youtube.com/watch?v=aZWj451Ai8E": {
            title: "Bengali Rice Ceremony Family Documentary",
            category: "Rice Ceremony"
        },
        "https://www.youtube.com/shorts/0TJJMAdWhE8": {
            title: "Annaprashan Ceremony Joyful Moments",
            category: "Rice Ceremony Short"
        },
        "https://www.youtube.com/watch?v=YfBaYS5i5_w": {
            title: "Grand Varmala Ceremony | Ballygunge Stage Celebration",
            category: "Reception Grandeur"
        },
        "https://www.youtube.com/watch?v=5v-TsMV9bzE": {
            title: "Wedding Surprise Dance for Bride from Brother",
            category: "Reception Celebration"
        },
        "https://www.youtube.com/watch?v=MgMWQN7SfDE": {
            title: "Debopriya & Shisendu Grand Reception Highlights",
            category: "Post-Wedding Reception"
        },
        "https://www.youtube.com/watch?v=2fynryvCLB8": {
            title: "Sanando & Jayashree | Romantic Post-Wedding Reception",
            category: "Post-Wedding Reception"
        },
        "https://www.youtube.com/watch?v=Fz0rrTpUyGY": {
            title: "Meditation & Mindfulness | Narrative Short Film",
            category: "Narrative Short"
        },
        "https://www.youtube.com/watch?v=1IVJsfLR3vo": {
            title: "Kormo Khetre Chaplong | Bengali Dramatic Fiction",
            category: "Dramatic Short"
        },
        "https://www.youtube.com/watch?v=QQDqGUvh-1M": {
            title: "Nishwa Short Film | 3D VFX & CGI Breakdown",
            category: "VFX Showreel"
        },
        "https://www.youtube.com/watch?v=mK1ZG5VONHo": {
            title: "Cinematic Film Color Grading Pipeline & Log Conversion",
            category: "Color Grading"
        },
        "https://www.youtube.com/watch?v=6bvjCSepVkc": {
            title: "RELIFT Fitness Brand Commercial Advertisement",
            category: "Commercial TVC"
        },
        "https://www.youtube.com/watch?v=kOR2_canFUg": {
            title: "Urban Company Commercial Campaign Shoot",
            category: "Commercial Ad"
        },
        "https://www.youtube.com/watch?v=kaQ1a36gTHQ": {
            title: "Chhanda Jewellers Luxury Ring & Pendant Ad",
            category: "Jewelry Commercial"
        },
        "https://www.youtube.com/watch?v=VOWrzp2-lOc": {
            title: "Aryan Fashion Lookbook & Model Portfolio",
            category: "Fashion Portfolio"
        },
        "https://www.youtube.com/shorts/tXYjPUIwtXU": {
            title: "Cinematic 4K Drone Aerial Highlights",
            category: "Aerial Cinematography"
        },
        "https://www.youtube.com/watch?v=rZRB0R-Ane4": {
            title: "Atlas Foundries | Industrial Molten Steel Documentary",
            category: "Industrial Film"
        },
        "https://www.youtube.com/watch?v=SgGqmtSYTzw": {
            title: "Chandra Udyog Heavy Engineering Corporate Profile",
            category: "Corporate Film"
        },
        "https://www.youtube.com/watch?v=TWSdtBJW_Ms": {
            title: "Locomotive Shells for Indian Railways | Manufacturing Story",
            category: "Industrial Showcase"
        },
        "https://www.youtube.com/watch?v=HYQ5hzTn-0I": {
            title: "APTI PLUS Institutional Showcase & Academic Profile",
            category: "Brand Promotion"
        },
        "https://www.youtube.com/watch?v=01hIH3JLwG4": {
            title: "Educational Seminar & Leadership Conference",
            category: "Institutional Film"
        },
        "https://www.youtube.com/watch?v=5q6uq-06eNc": {
            title: "Snehashish & Puja | Prinsep Ghat Pre-Wedding Story",
            category: "Pre-Wedding Cinema"
        },
        "https://www.youtube.com/watch?v=Pyo0cqt9vho": {
            title: "Abhishek & Adrita | 2024 Modern Pre-Wedding Film",
            category: "Pre-Wedding Cinema"
        },
        "https://www.youtube.com/watch?v=6S7ZKGVoEGs": {
            title: "Sid & Trina | Stylized Couple Glamour Promo",
            category: "Couple Promo"
        },
        "https://www.youtube.com/watch?v=ny2xu-3n0KM": {
            title: "Traditional Bengali Wedding Invitation & Save the Date",
            category: "Save The Date"
        },
        "https://www.youtube.com/watch?v=L1Hq-tfFonU": {
            title: "Royal Muslim Wedding Invitation & Save the Date",
            category: "Save The Date"
        },
        "https://www.youtube.com/watch?v=QgxewyDSUg8": {
            title: "Bishal & Binita | Traditional Bengali Wedding Cinema",
            category: "Wedding Cinema"
        },
        "https://www.youtube.com/watch?v=CA5wBHYX29g": {
            title: "Walliul & Rehana | Royal Nikah Wedding Cinema",
            category: "Royal Wedding"
        },
        "https://www.youtube.com/watch?v=FDE2CmmUSkE": {
            title: "Dibyendu & Oindrila | Traditional Bengali Wedding Highlights",
            category: "Wedding Highlights"
        },
        "https://www.youtube.com/watch?v=JPntNiHdEcA": {
            title: "Sourav & Pragati | Luxury Varmala & Wedding Highlights",
            category: "Luxury Wedding"
        },
        "https://www.youtube.com/watch?v=opBgIySG-1o": {
            title: "Aditya & Anuradha | Fast-Paced Cinematic Wedding Teaser",
            category: "Wedding Teaser"
        },
        "https://www.youtube.com/watch?v=2w6hzjoZdL8": {
            title: "Sayantan & Ipsita | Joyful Wedding Celebration Highlights",
            category: "Wedding Highlights"
        },
        "https://www.youtube.com/watch?v=V87-In4QKv8": {
            title: "Indra & Abhipri | Mehendi & Sangeet Ritual Highlights",
            category: "Mehendi Rituals"
        }
    };

    const pages = await db.collection('servicepages').find({}).toArray();
    let updatedCount = 0;

    for (const page of pages) {
        if (!page.videos || page.videos.length === 0) continue;

        let pageModified = false;
        const updatedVideos = page.videos.map(video => {
            const cleanup = titleCleanups[video.url];
            if (cleanup) {
                pageModified = true;
                return {
                    ...video,
                    title: cleanup.title,
                    category: cleanup.category || video.category
                };
            }
            return video;
        });

        if (pageModified) {
            await db.collection('servicepages').updateOne(
                { _id: page._id },
                { $set: { videos: updatedVideos } }
            );
            updatedCount++;
            console.log(`Updated video titles & categories for page [${page.slug}]`);
        }
    }

    console.log(`\nSuccessfully updated ${updatedCount} service pages with polished titles & category tags.`);
    await mongoose.disconnect();
}

polishVideoTitlesAndCategories().catch(console.error);
