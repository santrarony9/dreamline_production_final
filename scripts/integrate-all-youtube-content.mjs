import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("MONGODB_URI not found in environment.");
    process.exit(1);
}

const serviceUpdates = [
    {
        slug: 'pre-wedding-shoot-kolkata',
        title: 'Cinematic Pre-Wedding Shoots',
        subtitle: 'Romantic Storytelling & Heritage Ghats',
        category: 'WEDDING',
        videoSectionTitle: 'Pre-Wedding Cinematography Showcase',
        videoSectionSubtitle: 'Explore our romantic couple storytelling, Prinsep Ghat moments & cinematic teasers.',
        videos: [
            {
                title: 'Pre wedding Story - snehashish & Puja',
                url: 'https://www.youtube.com/watch?v=5q6uq-06eNc',
                thumbnail: 'https://img.youtube.com/vi/5q6uq-06eNc/maxresdefault.jpg',
                category: 'Pre-Wedding Cinema',
                description: 'Romantic couple storytelling shot at Prinsep Ghat and Kolkata heritage riverside locations.'
            },
            {
                title: 'Abhishek & Adrita Pre- weeding 2024',
                url: 'https://www.youtube.com/watch?v=Pyo0cqt9vho',
                thumbnail: 'https://img.youtube.com/vi/Pyo0cqt9vho/maxresdefault.jpg',
                category: 'Pre-Wedding Cinema',
                description: 'Modern couple styling with scenic nature vistas and cinematic drone flyovers.'
            },
            {
                title: 'SID & TRINA Promo',
                url: 'https://www.youtube.com/watch?v=6S7ZKGVoEGs',
                thumbnail: 'https://img.youtube.com/vi/6S7ZKGVoEGs/maxresdefault.jpg',
                category: 'Couple Promo',
                description: 'High-energy couple glamour shoot with dramatic backlighting and stylized aesthetics.'
            },
            {
                title: 'Bengali Wedding Invitation Video II Traditional Style',
                url: 'https://www.youtube.com/watch?v=ny2xu-3n0KM',
                thumbnail: 'https://img.youtube.com/vi/ny2xu-3n0KM/maxresdefault.jpg',
                category: 'Save The Date',
                description: 'Auspicious Bengali motif Save-the-Date video invitation.'
            },
            {
                title: 'Latest Wedding invitation Video 2022 I Best Muslim Wedding Invitation',
                url: 'https://www.youtube.com/watch?v=L1Hq-tfFonU',
                thumbnail: 'https://img.youtube.com/vi/L1Hq-tfFonU/maxresdefault.jpg',
                category: 'Save The Date',
                description: 'Regal royal blue and gold Save-The-Date motion graphics invitation.'
            }
        ],
        gallery: [
            {
                url: 'https://img.youtube.com/vi/5q6uq-06eNc/maxresdefault.jpg',
                caption: 'Prinsep Ghat Heritage Couple Shoot',
                alt: 'Pre-wedding romantic couple shoot at Prinsep Ghat Kolkata'
            },
            {
                url: 'https://img.youtube.com/vi/Pyo0cqt9vho/maxresdefault.jpg',
                caption: 'Scenic Nature & Golden Hour Romance',
                alt: 'Outdoor cinematic pre-wedding photography by Dreamline Production'
            },
            {
                url: 'https://img.youtube.com/vi/6S7ZKGVoEGs/maxresdefault.jpg',
                caption: 'Editorial Couple Portraits & Styling',
                alt: 'Luxury couple photoshoot Kolkata'
            },
            {
                url: 'https://img.youtube.com/vi/ny2xu-3n0KM/maxresdefault.jpg',
                caption: 'Traditional Save-The-Date Calligraphy',
                alt: 'Bengali wedding invitation video design Kolkata'
            }
        ]
    },
    {
        slug: 'wedding-photography-kolkata',
        title: 'Wedding Photography in Kolkata',
        subtitle: 'Luxury Candid & Emotional Rituals',
        category: 'WEDDING',
        videoSectionTitle: 'Wedding Cinematography Showcase',
        videoSectionSubtitle: 'Explore our luxury wedding films, sacred Bengali rituals & emotional family moments.',
        videos: [
            {
                title: 'Traditional Wedding Trailer 2020 II Bishal & Binita',
                url: 'https://www.youtube.com/watch?v=QgxewyDSUg8',
                thumbnail: 'https://img.youtube.com/vi/QgxewyDSUg8/maxresdefault.jpg',
                category: 'Wedding Cinema',
                description: 'Emotional Saat Paak, Shubho Drishti, Sindoor Daan, and ceremonial farewell.'
            },
            {
                title: 'Cinematic Wedding Trailer Of Walliul & Rehana',
                url: 'https://www.youtube.com/watch?v=CA5wBHYX29g',
                thumbnail: 'https://img.youtube.com/vi/CA5wBHYX29g/maxresdefault.jpg',
                category: 'Royal Wedding Trailer',
                description: 'Regal royal banquet Nikah ceremony with grand banquet hall reveals.'
            },
            {
                title: 'Bengali Traditional Wedding Highlights I Dibyendu & Oindrila',
                url: 'https://www.youtube.com/watch?v=FDE2CmmUSkE',
                thumbnail: 'https://img.youtube.com/vi/FDE2CmmUSkE/maxresdefault.jpg',
                category: 'Wedding Highlights',
                description: 'Authentic Bengali rituals, topor & mukut details, and joyful conch blowing.'
            },
            {
                title: 'SOURAV&PRAGATI highlight',
                url: 'https://www.youtube.com/watch?v=JPntNiHdEcA',
                thumbnail: 'https://img.youtube.com/vi/JPntNiHdEcA/maxresdefault.jpg',
                category: 'Wedding Highlights',
                description: 'Grand bride entry under phoolon ki chaadar and sparkler pyro celebration.'
            },
            {
                title: 'Aditya & Anuradha Wedding Teaser',
                url: 'https://www.youtube.com/watch?v=opBgIySG-1o',
                thumbnail: 'https://img.youtube.com/vi/opBgIySG-1o/maxresdefault.jpg',
                category: 'Wedding Teaser',
                description: 'Fast-paced, emotive teaser highlighting morning preparation and mandap rituals.'
            },
            {
                title: 'SAYANTAN & IPSITA HIGHLIGHT',
                url: 'https://www.youtube.com/watch?v=2w6hzjoZdL8',
                thumbnail: 'https://img.youtube.com/vi/2w6hzjoZdL8/maxresdefault.jpg',
                category: 'Wedding Highlights',
                description: 'Playful candid moments, vibrant haldi smiles, and joyful garland exchange.'
            },
            {
                title: 'Mehendi Ceremony of Indra & Abhipri',
                url: 'https://www.youtube.com/watch?v=V87-In4QKv8',
                thumbnail: 'https://img.youtube.com/vi/V87-In4QKv8/maxresdefault.jpg',
                category: 'Mehendi Rituals',
                description: 'Intricate henna designs, floral jewelry, and bride candid laughter with family.'
            }
        ],
        gallery: [
            {
                url: 'https://img.youtube.com/vi/QgxewyDSUg8/maxresdefault.jpg',
                caption: 'Sacred Saat Paak & Sindoor Daan',
                alt: 'Bengali traditional wedding rituals Kolkata'
            },
            {
                url: 'https://img.youtube.com/vi/CA5wBHYX29g/maxresdefault.jpg',
                caption: 'Regal Royal Banquet Nikah Ceremony',
                alt: 'Luxury wedding cinematography Kolkata'
            },
            {
                url: 'https://img.youtube.com/vi/FDE2CmmUSkE/maxresdefault.jpg',
                caption: 'Authentic Bengali Topor & Mukut Moments',
                alt: 'Candid Bengali bride and groom moments'
            },
            {
                url: 'https://img.youtube.com/vi/JPntNiHdEcA/maxresdefault.jpg',
                caption: 'Grand Varmala Exchange & Pyro Stage',
                alt: 'Spectacular wedding varmala exchange stage'
            }
        ]
    },
    {
        slug: 'post-wedding-photography-kolkata',
        title: 'Post-Wedding Photography in Kolkata',
        subtitle: 'Bou Bhat, Receptions & Newlywed Romance',
        category: 'WEDDING',
        videoSectionTitle: 'Post-Wedding & Reception Showcase',
        videoSectionSubtitle: 'Explore our Bou Bhat receptions, intimate newlywed portraits & grand ballroom celebrations.',
        videos: [
            {
                title: 'Best Romantic Bengali Wedding Trailer I SANANDO & JAYASHREE',
                url: 'https://www.youtube.com/watch?v=2fynryvCLB8',
                thumbnail: 'https://img.youtube.com/vi/2fynryvCLB8/maxresdefault.jpg',
                category: 'Reception Cinema',
                description: 'Post-wedding newlywed reception romance, silk sarees, and intimate couple moments.'
            },
            {
                title: 'Bengali Wedding Teaser I DEBOPRIYA & SHISENDU',
                url: 'https://www.youtube.com/watch?v=MgMWQN7SfDE',
                thumbnail: 'https://img.youtube.com/vi/MgMWQN7SfDE/maxresdefault.jpg',
                category: 'Reception Teaser',
                description: 'Grand reception stage celebration and romantic newlywed couple framing.'
            },
            {
                title: 'Wedding Surprise Dance For Bridal From Her Brother',
                url: 'https://www.youtube.com/watch?v=5v-TsMV9bzE',
                thumbnail: 'https://img.youtube.com/vi/5v-TsMV9bzE/maxresdefault.jpg',
                category: 'Reception Entertainment',
                description: 'Celebratory surprise dance performance on banquet stage to celebrate the couple.'
            },
            {
                title: 'varmala ballygaunge mist &magic',
                url: 'https://www.youtube.com/watch?v=YfBaYS5i5_w',
                thumbnail: 'https://img.youtube.com/vi/YfBaYS5i5_w/maxresdefault.jpg',
                category: 'Stage Grandeur',
                description: 'Dazzling reception ballroom stage, cold pyrotechnics, and flower showers.'
            }
        ],
        gallery: [
            {
                url: 'https://img.youtube.com/vi/2fynryvCLB8/maxresdefault.jpg',
                caption: 'Bou Bhat & Newlywed Reception Glamour',
                alt: 'Bengali reception and Bou Bhat photography Kolkata'
            },
            {
                url: 'https://img.youtube.com/vi/MgMWQN7SfDE/maxresdefault.jpg',
                caption: 'Intimate Post-Wedding Couple Candids',
                alt: 'Post-wedding romantic couple portraits'
            },
            {
                url: 'https://img.youtube.com/vi/5v-TsMV9bzE/maxresdefault.jpg',
                caption: 'Banquet Reception Celebration & Dance',
                alt: 'Grand reception party entertainment Kolkata'
            }
        ]
    },
    {
        slug: 'commercial-ad-films-kolkata',
        title: 'Commercial Ad Films in Kolkata',
        subtitle: 'High-Impact Brand Commercials & TVCs',
        category: 'CORPORATE',
        videoSectionTitle: 'Commercial Ad Showcase',
        videoSectionSubtitle: 'High-impact television commercials, digital product ads & dynamic promotional campaigns.',
        videos: [
            {
                title: 'GYM ADVERTISEMENT (NAME- RELIFT)',
                url: 'https://www.youtube.com/watch?v=6bvjCSepVkc',
                thumbnail: 'https://img.youtube.com/vi/6bvjCSepVkc/maxresdefault.jpg',
                category: 'Fitness TVC',
                description: 'High-intensity fitness commercial ad featuring dramatic chiaroscuro lighting and athletic energy.'
            },
            {
                title: 'AD SHOOT [ URBAN CLAP ]',
                url: 'https://www.youtube.com/watch?v=kOR2_canFUg',
                thumbnail: 'https://img.youtube.com/vi/kOR2_canFUg/maxresdefault.jpg',
                category: 'Digital Ad Shoot',
                description: 'Commercial ad shoot for Urban Company / Urban Clap showcasing professional service delivery.'
            },
            {
                title: 'Gorgeous Ring & Pendant - Video II Chhanda Jewellers',
                url: 'https://www.youtube.com/watch?v=kaQ1a36gTHQ',
                thumbnail: 'https://img.youtube.com/vi/kaQ1a36gTHQ/hqdefault.jpg',
                category: 'Luxury Product Ad',
                description: 'Macro luxury jewelry product videography highlighting diamond faceting and velvet elegance.'
            }
        ],
        gallery: [
            {
                url: 'https://img.youtube.com/vi/6bvjCSepVkc/maxresdefault.jpg',
                caption: 'High-Energy Fitness & Commercial Lighting',
                alt: 'Commercial ad film production RELIFT Gym Kolkata'
            },
            {
                url: 'https://img.youtube.com/vi/kOR2_canFUg/maxresdefault.jpg',
                caption: 'National Brand TVC Production (Urban Company)',
                alt: 'Commercial ad shoot Urban Company by Dreamline Production'
            },
            {
                url: 'https://img.youtube.com/vi/kaQ1a36gTHQ/hqdefault.jpg',
                caption: 'Macro Luxury Jewellery Lighting',
                alt: 'Jewelry commercial product cinematography Kolkata'
            }
        ]
    },
    {
        slug: 'brand-promotion-kolkata',
        title: 'Brand Promotion & Commercial Videos',
        subtitle: 'Strategic Brand Storytelling',
        category: 'CORPORATE',
        videoSectionTitle: 'Brand Promotion Showcase',
        videoSectionSubtitle: 'Strategic corporate brand films, industrial capability showcases & institutional profiles.',
        videos: [
            {
                title: 'Chandra Udyog Profile Shoot',
                url: 'https://www.youtube.com/watch?v=SgGqmtSYTzw',
                thumbnail: 'https://img.youtube.com/vi/SgGqmtSYTzw/maxresdefault.jpg',
                category: 'Brand Profile Film',
                description: 'Corporate brand profile documenting manufacturing infrastructure and leadership vision.'
            },
            {
                title: 'The Factory Making Locomotive Shells That Power Indian Railways',
                url: 'https://www.youtube.com/watch?v=TWSdtBJW_Ms',
                thumbnail: 'https://img.youtube.com/vi/TWSdtBJW_Ms/maxresdefault.jpg',
                category: 'Industrial Brand Showcase',
                description: 'Industrial manufacturing excellence powering Indian Railways locomotive construction.'
            },
            {
                title: 'APTI PLUS Brand Showcase',
                url: 'https://www.youtube.com/watch?v=HYQ5hzTn-0I',
                thumbnail: 'https://img.youtube.com/vi/HYQ5hzTn-0I/maxresdefault.jpg',
                category: 'Institutional Campaign',
                description: 'Educational institution promotional campaign and student success storytelling.'
            },
            {
                title: '2nd video Apti',
                url: 'https://www.youtube.com/watch?v=01hIH3JLwG4',
                thumbnail: 'https://img.youtube.com/vi/01hIH3JLwG4/maxresdefault.jpg',
                category: 'Corporate Seminar',
                description: 'Institutional profile and academic facility demonstration.'
            }
        ],
        gallery: [
            {
                url: 'https://img.youtube.com/vi/SgGqmtSYTzw/maxresdefault.jpg',
                caption: 'Heavy Industry Corporate Vision',
                alt: 'Corporate brand promotional video Chandra Udyog'
            },
            {
                url: 'https://img.youtube.com/vi/TWSdtBJW_Ms/maxresdefault.jpg',
                caption: 'Precision Railway Engineering',
                alt: 'Industrial locomotive manufacturing showcase'
            },
            {
                url: 'https://img.youtube.com/vi/HYQ5hzTn-0I/maxresdefault.jpg',
                caption: 'Educational Institutional Branding',
                alt: 'Brand promotional film APTI PLUS Kolkata'
            }
        ]
    },
    {
        slug: 'corporate-photography-kolkata',
        title: 'Corporate Photography & Films',
        subtitle: 'Executive Portfolios & Industrial Documentaries',
        category: 'CORPORATE',
        videoSectionTitle: 'Corporate Film Showcase',
        videoSectionSubtitle: 'Industrial operations, heavy engineering walkthroughs & corporate brand narratives.',
        videos: [
            {
                title: 'Atlas Foundries',
                url: 'https://www.youtube.com/watch?v=rZRB0R-Ane4',
                thumbnail: 'https://img.youtube.com/vi/rZRB0R-Ane4/maxresdefault.jpg',
                category: 'Industrial Corporate Film',
                description: 'Foundry operations, precision metal casting at 1500°C, and industrial engineering.'
            },
            {
                title: 'Chandra Udyog Profile Shoot',
                url: 'https://www.youtube.com/watch?v=SgGqmtSYTzw',
                thumbnail: 'https://img.youtube.com/vi/SgGqmtSYTzw/maxresdefault.jpg',
                category: 'Corporate Profile Film',
                description: 'Factory floor operations, executive boardroom meetings, and testing facilities.'
            },
            {
                title: 'The Factory Making Locomotive Shells That Power Indian Railways',
                url: 'https://www.youtube.com/watch?v=TWSdtBJW_Ms',
                thumbnail: 'https://img.youtube.com/vi/TWSdtBJW_Ms/maxresdefault.jpg',
                category: 'Industrial Documentary',
                description: 'Heavy fabrication, robotic welding, and railway locomotive shell production.'
            }
        ],
        gallery: [
            {
                url: 'https://img.youtube.com/vi/rZRB0R-Ane4/maxresdefault.jpg',
                caption: 'Industrial Molten Casting & Precision Metallics',
                alt: 'Industrial corporate photography Atlas Foundries Kolkata'
            },
            {
                url: 'https://img.youtube.com/vi/SgGqmtSYTzw/maxresdefault.jpg',
                caption: 'Automated Precision CNC Fabrication',
                alt: 'Corporate film production Kolkata Sector V'
            }
        ]
    },
    {
        slug: 'short-film-production-kolkata',
        title: 'Short Film Production in Kolkata',
        subtitle: 'Narrative Fiction & Festival Entries',
        category: 'CORPORATE',
        videoSectionTitle: 'Short Film & Narrative Showcase',
        videoSectionSubtitle: 'Fiction shorts, behind-the-scenes visual effects breakdowns & dramatic productions.',
        videos: [
            {
                title: 'VFX Showreel - Nishwa Short Film VFX by Dreamline Production',
                url: 'https://www.youtube.com/watch?v=QQDqGUvh-1M',
                thumbnail: 'https://img.youtube.com/vi/QQDqGUvh-1M/maxresdefault.jpg',
                category: 'VFX Short Film Showreel',
                description: 'Visual effects, green screen compositing, and atmospheric grading for the short film Nishwa.'
            },
            {
                title: 'MEDITATION VOICE OVER VIDEO FINAL',
                url: 'https://www.youtube.com/watch?v=Fz0rrTpUyGY',
                thumbnail: 'https://img.youtube.com/vi/Fz0rrTpUyGY/maxresdefault.jpg',
                category: 'Narrative Short',
                description: 'Atmospheric cinematography and poetic narrative storytelling with synchronized voiceover.'
            },
            {
                title: 'kormo khetrer chaplong video bengali 1',
                url: 'https://www.youtube.com/watch?v=1IVJsfLR3vo',
                thumbnail: 'https://img.youtube.com/vi/1IVJsfLR3vo/maxresdefault.jpg',
                category: 'Dramatic Fiction',
                description: 'Character dialogue and dramatic workplace tension sequence.'
            }
        ],
        gallery: [
            {
                url: 'https://img.youtube.com/vi/QQDqGUvh-1M/maxresdefault.jpg',
                caption: 'Narrative Short Film VFX & Matte Painting',
                alt: 'Short film visual effects Nishwa by Dreamline Production'
            },
            {
                url: 'https://img.youtube.com/vi/Fz0rrTpUyGY/maxresdefault.jpg',
                caption: 'Atmospheric Dramatic Storytelling',
                alt: 'Cinematic short film production Kolkata'
            }
        ]
    },
    {
        slug: '3d-visualization-kolkata',
        title: '3D Visualization & Architectural CGI in Kolkata',
        subtitle: 'CGI Rendering, VFX & Digital Color Science',
        category: 'CORPORATE',
        videoSectionTitle: '3D Visualization & Post-Production Suite',
        videoSectionSubtitle: '3D spatial compositing, visual effects breakdowns & cinema color grading suite.',
        videos: [
            {
                title: 'VFX Showreel - Nishwa Short Film VFX by Dreamline Production',
                url: 'https://www.youtube.com/watch?v=QQDqGUvh-1M',
                thumbnail: 'https://img.youtube.com/vi/QQDqGUvh-1M/maxresdefault.jpg',
                category: '3D VFX Breakdown',
                description: 'Camera match-moving, 3D element integration, and digital environment replacement.'
            },
            {
                title: 'CINEMATIC Color Grading II Dreamline Production',
                url: 'https://www.youtube.com/watch?v=mK1ZG5VONHo',
                thumbnail: 'https://img.youtube.com/vi/mK1ZG5VONHo/hqdefault.jpg',
                category: 'Digital Color Grading',
                description: 'Cinema Log vs Rec709 color grade breakdown showing highlight rolloff and skin-tone harmony.'
            }
        ],
        gallery: [
            {
                url: 'https://img.youtube.com/vi/QQDqGUvh-1M/maxresdefault.jpg',
                caption: '3D Compositing & Multipass Render',
                alt: '3D visual effects and CGI breakdown'
            },
            {
                url: 'https://img.youtube.com/vi/mK1ZG5VONHo/hqdefault.jpg',
                caption: 'Cinema Log vs Rec709 Grading Suite',
                alt: 'Color grading and visual mastering'
            }
        ]
    },
    {
        slug: 'documentary-film-production-kolkata',
        title: 'Documentary Films in Kolkata',
        subtitle: 'Impactful Non-Fiction & Heritage Storytelling',
        category: 'CORPORATE',
        videoSectionTitle: 'Documentary Film Showcase',
        videoSectionSubtitle: 'Cultural heritage monuments, social causes & deep-dive industrial documentaries.',
        videos: [
            {
                title: 'Nakhoda Masjid Kolkata | Dreamline Production |',
                url: 'https://www.youtube.com/watch?v=oeJkQxnaCEo',
                thumbnail: 'https://img.youtube.com/vi/oeJkQxnaCEo/maxresdefault.jpg',
                category: 'Heritage Documentary',
                description: 'Architectural grandeur of Nakhoda Masjid, Chitpur culture, and serene devotional moments.'
            },
            {
                title: 'Atlas Foundries',
                url: 'https://www.youtube.com/watch?v=rZRB0R-Ane4',
                thumbnail: 'https://img.youtube.com/vi/rZRB0R-Ane4/maxresdefault.jpg',
                category: 'Industrial Documentary',
                description: 'Documenting the human spirit and heritage craftsmanship of Kolkata foundry workers.'
            },
            {
                title: 'The Factory Making Locomotive Shells That Power Indian Railways',
                url: 'https://www.youtube.com/watch?v=TWSdtBJW_Ms',
                thumbnail: 'https://img.youtube.com/vi/TWSdtBJW_Ms/maxresdefault.jpg',
                category: 'Engineering Documentary',
                description: 'Engineering documentary on railway manufacturing and heavy industrial production.'
            }
        ],
        gallery: [
            {
                url: 'https://img.youtube.com/vi/oeJkQxnaCEo/maxresdefault.jpg',
                caption: 'Nakhoda Masjid Heritage & Architectural Splendor',
                alt: 'Documentary filmmaking Nakhoda Masjid Chitpur Kolkata'
            },
            {
                url: 'https://img.youtube.com/vi/rZRB0R-Ane4/maxresdefault.jpg',
                caption: 'Kolkata Industrial Craft Heritage',
                alt: 'Foundry documentary film Kolkata'
            }
        ]
    },
    {
        slug: 'fashion-photography-kolkata',
        title: 'Fashion Photography in Kolkata',
        subtitle: 'Editorial Lookbooks & Commercial Styling',
        category: 'CORPORATE',
        videoSectionTitle: 'Fashion & Model Portfolio Showcase',
        videoSectionSubtitle: 'Luxury jewelry campaigns, model portfolios, lookbooks & commercial studio lighting.',
        videos: [
            {
                title: 'Gorgeous Ring & Pendant - Video II Chhanda Jewellers',
                url: 'https://www.youtube.com/watch?v=kaQ1a36gTHQ',
                thumbnail: 'https://img.youtube.com/vi/kaQ1a36gTHQ/hqdefault.jpg',
                category: 'Jewelry Fashion Ad',
                description: 'Luxury jewelry styling, velvet editorial aesthetics, and high-fashion model lighting.'
            },
            {
                title: 'PROMO ARYAN',
                url: 'https://www.youtube.com/watch?v=VOWrzp2-lOc',
                thumbnail: 'https://img.youtube.com/vi/VOWrzp2-lOc/maxresdefault.jpg',
                category: 'Model Portfolio Reel',
                description: 'Model promo reel with studio strobe setups and urban fashion styling.'
            }
        ],
        gallery: [
            {
                url: 'https://img.youtube.com/vi/kaQ1a36gTHQ/hqdefault.jpg',
                caption: 'High-Fashion Fine Jewelry Styling',
                alt: 'Fashion jewelry photography Kolkata'
            },
            {
                url: 'https://img.youtube.com/vi/VOWrzp2-lOc/maxresdefault.jpg',
                caption: 'Studio Fashion Editorial & Model Lighting',
                alt: 'Fashion model portfolio shoot Kolkata'
            }
        ]
    },
    {
        slug: 'drone-videography-kolkata',
        title: 'Drone Videography in Kolkata',
        subtitle: 'DGCA-Certified 4K Aerial Cinematography',
        category: 'DRONE & AERIAL',
        videoSectionTitle: 'Aerial Cinematography Showcase',
        videoSectionSubtitle: 'DGCA-certified 4K drone cinematography for architecture, industrial campuses & grand events.',
        videos: [
            {
                title: 'Nakhoda Masjid Kolkata - Heritage Aerial & Architecture',
                url: 'https://www.youtube.com/watch?v=oeJkQxnaCEo',
                thumbnail: 'https://img.youtube.com/vi/oeJkQxnaCEo/maxresdefault.jpg',
                category: 'Architectural Aerials',
                description: 'Sweeping high-altitude aerial perspectives over Nakhoda Masjid red sandstone domes.'
            },
            {
                title: 'Best Photography & Videography Service',
                url: 'https://www.youtube.com/shorts/tXYjPUIwtXU',
                thumbnail: 'https://img.youtube.com/vi/tXYjPUIwtXU/maxresdefault.jpg',
                category: 'Aerial Highlights',
                description: 'Dynamic aerial camera flight and rapid highlight edit.'
            },
            {
                title: 'Chandra Udyog Profile Shoot - Industrial Aerial Flyover',
                url: 'https://www.youtube.com/watch?v=SgGqmtSYTzw',
                thumbnail: 'https://img.youtube.com/vi/SgGqmtSYTzw/maxresdefault.jpg',
                category: 'Industrial Plant Aerial',
                description: 'High-altitude flyovers across vast manufacturing plant and logistics yards.'
            },
            {
                title: 'Atlas Foundries - Industrial Campus Establishing Shots',
                url: 'https://www.youtube.com/watch?v=rZRB0R-Ane4',
                thumbnail: 'https://img.youtube.com/vi/rZRB0R-Ane4/maxresdefault.jpg',
                category: 'Commercial Aerial',
                description: 'Establishing drone perspective over historic Kolkata foundry campus.'
            }
        ],
        gallery: [
            {
                url: 'https://img.youtube.com/vi/oeJkQxnaCEo/maxresdefault.jpg',
                caption: '4K Drone Reveal Over Nakhoda Masjid',
                alt: 'Aerial drone cinematography Kolkata'
            },
            {
                url: 'https://img.youtube.com/vi/SgGqmtSYTzw/maxresdefault.jpg',
                caption: 'Expansive Industrial Facility Aerial Overview',
                alt: 'Commercial drone mapping and facility overview'
            }
        ]
    },
    {
        slug: 'drone-photography-kolkata',
        title: 'Drone Photography in Kolkata',
        subtitle: 'Certified High-Resolution Aerial Stills',
        category: 'DRONE & AERIAL',
        videoSectionTitle: 'Drone Photography & Aerial Showcase',
        videoSectionSubtitle: 'Breathtaking 4K aerial photography for architecture, events & corporate infrastructure.',
        videos: [
            {
                title: 'Nakhoda Masjid Kolkata - Heritage Aerial & Architecture',
                url: 'https://www.youtube.com/watch?v=oeJkQxnaCEo',
                thumbnail: 'https://img.youtube.com/vi/oeJkQxnaCEo/maxresdefault.jpg',
                category: 'Architectural Aerials',
                description: 'Sweeping high-altitude aerial perspectives over Nakhoda Masjid red sandstone domes.'
            },
            {
                title: 'Best Photography & Videography Service',
                url: 'https://www.youtube.com/shorts/tXYjPUIwtXU',
                thumbnail: 'https://img.youtube.com/vi/tXYjPUIwtXU/maxresdefault.jpg',
                category: 'Aerial Highlights',
                description: 'Dynamic aerial camera flight and rapid highlight edit.'
            },
            {
                title: 'Chandra Udyog Profile Shoot - Industrial Aerial Flyover',
                url: 'https://www.youtube.com/watch?v=SgGqmtSYTzw',
                thumbnail: 'https://img.youtube.com/vi/SgGqmtSYTzw/maxresdefault.jpg',
                category: 'Industrial Plant Aerial',
                description: 'High-altitude flyovers across vast manufacturing plant and logistics yards.'
            }
        ],
        gallery: [
            {
                url: 'https://img.youtube.com/vi/oeJkQxnaCEo/maxresdefault.jpg',
                caption: '4K Drone Reveal Over Nakhoda Masjid',
                alt: 'Aerial drone cinematography Kolkata'
            },
            {
                url: 'https://img.youtube.com/vi/SgGqmtSYTzw/maxresdefault.jpg',
                caption: 'Expansive Industrial Facility Aerial Overview',
                alt: 'Commercial drone mapping and facility overview'
            }
        ]
    },
    {
        slug: '3d-area-mapping-kolkata',
        title: '3D Area Mapping in Kolkata',
        subtitle: 'Aerial Photogrammetry & Topographical Surveys',
        category: 'DRONE & AERIAL',
        videoSectionTitle: '3D Area Mapping & Photogrammetry Showcase',
        videoSectionSubtitle: 'Topographical drone surveys, large-area site mapping & spatial point clouds.',
        videos: [
            {
                title: 'Chandra Udyog Profile Shoot - Industrial Aerial Mapping',
                url: 'https://www.youtube.com/watch?v=SgGqmtSYTzw',
                thumbnail: 'https://img.youtube.com/vi/SgGqmtSYTzw/maxresdefault.jpg',
                category: 'Site Mapping',
                description: 'Vast industrial property aerial survey, spatial mapping, and structural layout documentation.'
            },
            {
                title: 'VFX Showreel - Nishwa Short Film VFX',
                url: 'https://www.youtube.com/watch?v=QQDqGUvh-1M',
                thumbnail: 'https://img.youtube.com/vi/QQDqGUvh-1M/maxresdefault.jpg',
                category: '3D Camera Tracking',
                description: 'Camera tracking, point cloud reconstruction, and 3D environment spatial mapping.'
            }
        ],
        gallery: [
            {
                url: 'https://img.youtube.com/vi/SgGqmtSYTzw/maxresdefault.jpg',
                caption: 'Industrial Campus Spatial Survey',
                alt: '3D area mapping and drone photogrammetry'
            },
            {
                url: 'https://img.youtube.com/vi/QQDqGUvh-1M/maxresdefault.jpg',
                caption: 'Spatial Tracking Point Cloud',
                alt: '3D camera tracking and environmental mesh'
            }
        ]
    },
    {
        slug: 'birthday-photography-kolkata',
        title: 'Birthday photography',
        subtitle: 'Milestone Celebrations & Candids',
        category: 'SOCIAL',
        videoSectionTitle: 'Birthday Photography Videos',
        videoSectionSubtitle: 'Explore our milestone birthday cinematography, vibrant celebrations & candid moments.',
        videos: [
            // PRESERVE EXISTING 2
            {
                title: 'Best Birthday Photography in Kolkata 2023 II Dreamline Production',
                url: 'https://www.youtube.com/watch?v=il4uufxfxKY',
                thumbnail: 'https://img.youtube.com/vi/il4uufxfxKY/maxresdefault.jpg',
                category: 'Milestone Birthday',
                description: 'Balloon decor arch, baby giggles, cake smash, and joyful grandparent interactions.'
            },
            {
                title: 'ADI BIRTHDAY VIDEO FINAL',
                url: 'https://www.youtube.com/watch?v=KxySjtXaRN0',
                thumbnail: 'https://img.youtube.com/vi/KxySjtXaRN0/maxresdefault.jpg',
                category: 'Kids Birthday',
                description: 'Themed cartoon backdrops, family group candid smiles, and magic show moments.'
            },
            // ADD CHANNEL CONTENT
            {
                title: 'BIRTHDAY VIDEO By @dreamlineproductionindia best photography & videography service.',
                url: 'https://www.youtube.com/watch?v=1WrTme9zPQk',
                thumbnail: 'https://img.youtube.com/vi/1WrTme9zPQk/maxresdefault.jpg',
                category: 'Party Highlights',
                description: 'Vibrant festive birthday decor, lighting, sparklers on cake, and family dancing.'
            },
            {
                title: 'shlok birthday highlight VIDEO',
                url: 'https://www.youtube.com/watch?v=Zt1v44RWj5Y',
                thumbnail: 'https://img.youtube.com/vi/Zt1v44RWj5Y/maxresdefault.jpg',
                category: 'Birthday Highlights',
                description: 'Whimsical kid theme party, playful interactions, and candid child portraits.'
            },
            {
                title: 'Akshay & Pratyush Birthday',
                url: 'https://www.youtube.com/watch?v=nVbzHQgHnpA',
                thumbnail: 'https://img.youtube.com/vi/nVbzHQgHnpA/maxresdefault.jpg',
                category: 'Double Birthday Celebration',
                description: 'Brothers birthday celebration, outdoor play moments, and family cake celebration.'
            }
        ],
        gallery: [
            {
                url: 'https://img.youtube.com/vi/il4uufxfxKY/maxresdefault.jpg',
                caption: 'Milestone Cake Cutting & Sparklers',
                alt: 'Birthday party photography Kolkata'
            },
            {
                url: 'https://img.youtube.com/vi/KxySjtXaRN0/maxresdefault.jpg',
                caption: 'Whimsical Themed Decor & Family Candids',
                alt: 'First birthday celebration photography'
            },
            {
                url: 'https://img.youtube.com/vi/Zt1v44RWj5Y/maxresdefault.jpg',
                caption: 'Candid Baby Smiles & Grandparents Blessings',
                alt: 'Kids birthday celebration candids'
            }
        ]
    },
    {
        slug: 'rice-ceremony-photography-kolkata',
        title: 'Rice Ceremony Photography in Kolkata',
        subtitle: 'Sacred Annaprashan & First Grain Blessings',
        category: 'SOCIAL',
        videoSectionTitle: 'Rice Ceremony (Annaprashan) Showcase',
        videoSectionSubtitle: 'Explore our traditional Bengali Annaprashan ceremonies, first grain rituals & tender family moments.',
        videos: [
            {
                title: 'Annaprashan Ceremony of Purno I Cinematic Trailer I Bengali',
                url: 'https://www.youtube.com/watch?v=1lfpxRXTMOM',
                thumbnail: 'https://img.youtube.com/vi/1lfpxRXTMOM/maxresdefault.jpg',
                category: 'Annaprashan Trailer',
                description: 'Baby boy dressed in dhuti-kurta, maternal uncle feeding the kheer, and traditional blessings.'
            },
            {
                title: 'Best Bengali Rice Ceremony By Dreamline Production',
                url: 'https://www.youtube.com/watch?v=K18tvma2Jo4',
                thumbnail: 'https://img.youtube.com/vi/K18tvma2Jo4/maxresdefault.jpg',
                category: 'Traditional Ceremony',
                description: 'Sacred Vedic havan fire, grandmother applying sandalwood tilak, and baby laughter.'
            },
            {
                title: 'Bengali Rice Ceremony',
                url: 'https://www.youtube.com/watch?v=aZWj451Ai8E',
                thumbnail: 'https://img.youtube.com/vi/aZWj451Ai8E/hqdefault.jpg',
                category: 'Full Ceremony Edit',
                description: 'Elaborate Annaprashan celebration documenting every family ritual and cultural feast.'
            },
            {
                title: 'Annaprashan Shoot by Team @dreamlineproduction4092 #bestphotographyservice',
                url: 'https://www.youtube.com/shorts/0TJJMAdWhE8',
                thumbnail: 'https://img.youtube.com/vi/0TJJMAdWhE8/maxresdefault.jpg',
                category: 'Ceremony Short',
                description: 'Adorable baby moments in traditional Bengali outfit, edited for social reels.'
            }
        ],
        gallery: [
            {
                url: 'https://img.youtube.com/vi/1lfpxRXTMOM/maxresdefault.jpg',
                caption: 'Sacred Annaprashan Kheer Feeding Ritual',
                alt: 'Bengali rice ceremony photography Kolkata'
            },
            {
                url: 'https://img.youtube.com/vi/K18tvma2Jo4/maxresdefault.jpg',
                caption: 'Traditional Vedic Blessings & Gold Ornaments',
                alt: 'Annaprashan ceremony rituals'
            },
            {
                url: 'https://img.youtube.com/vi/0TJJMAdWhE8/maxresdefault.jpg',
                caption: 'Adorable Little One Dhuti & Mukut Portraits',
                alt: 'Cute baby rice ceremony portrait Kolkata'
            }
        ]
    },
    {
        slug: 'other-social-events-kolkata',
        title: 'Social Events & Celebration Photography in Kolkata',
        subtitle: 'Anniversaries, Poite Ceremonies & Cultural Galas',
        category: 'SOCIAL',
        videoSectionTitle: 'Other Social Events Videos',
        videoSectionSubtitle: 'Explore our cultural celebrations, sacred ceremonies, milestone anniversaries & festive gatherings.',
        videos: [
            // PRESERVE EXISTING 1
            {
                title: 'mist &magic PUJAN VIDEO FINAL',
                url: 'https://www.youtube.com/watch?v=fduCdqVPOfY',
                thumbnail: 'https://img.youtube.com/vi/fduCdqVPOfY/maxresdefault.jpg',
                category: 'Sacred Pujan',
                description: 'Auspicious flowers, sacred bell rings, priest chanting, and family devotional prayers.'
            },
            // ADD CHANNEL CONTENT
            {
                title: 'UPANAYAN Bengali Cinematic Trailer II Samrudh II Dreamline Production',
                url: 'https://www.youtube.com/watch?v=riR7mZ6s9A4',
                thumbnail: 'https://img.youtube.com/vi/riR7mZ6s9A4/maxresdefault.jpg',
                category: 'Sacred Thread Upanayan',
                description: 'Complete sacred thread ceremony (Poite/Upanayan) documenting Kshoura, Gayatri mantra, and Bhiksha rites.'
            }
        ],
        gallery: [
            {
                url: 'https://img.youtube.com/vi/fduCdqVPOfY/maxresdefault.jpg',
                caption: 'Devotional Pujan & Sacred Lamp Lighting',
                alt: 'Puja and devotional event photography Kolkata'
            },
            {
                url: 'https://img.youtube.com/vi/riR7mZ6s9A4/maxresdefault.jpg',
                caption: 'Sacred Thread Upanayan Vedic Rites (Poite)',
                alt: 'Upanayan ceremony photography Kolkata'
            }
        ]
    }
];

const homepageFeaturedVideos = [
    {
        title: 'Traditional Bengali Wedding Cinema | Bishal & Binita',
        category: 'Luxury Wedding Cinema',
        videoUrl: 'https://www.youtube.com/watch?v=QgxewyDSUg8',
        image: 'https://img.youtube.com/vi/QgxewyDSUg8/maxresdefault.jpg'
    },
    {
        title: 'Heritage Architecture & Aerial | Nakhoda Masjid Kolkata',
        category: 'Documentary & Aerial',
        videoUrl: 'https://www.youtube.com/watch?v=oeJkQxnaCEo',
        image: 'https://img.youtube.com/vi/oeJkQxnaCEo/maxresdefault.jpg'
    },
    {
        title: 'Industrial Corporate Profile | Chandra Udyog',
        category: 'Corporate Film',
        videoUrl: 'https://www.youtube.com/watch?v=SgGqmtSYTzw',
        image: 'https://img.youtube.com/vi/SgGqmtSYTzw/maxresdefault.jpg'
    },
    {
        title: 'Commercial Brand Ad | RELIFT Fitness',
        category: 'Commercial Ad',
        videoUrl: 'https://www.youtube.com/watch?v=6bvjCSepVkc',
        image: 'https://img.youtube.com/vi/6bvjCSepVkc/maxresdefault.jpg'
    },
    {
        title: 'Cinematic Pre-Wedding Story | Snehashish & Puja',
        category: 'Pre-Wedding Cinema',
        videoUrl: 'https://www.youtube.com/watch?v=5q6uq-06eNc',
        image: 'https://img.youtube.com/vi/5q6uq-06eNc/maxresdefault.jpg'
    },
    {
        title: 'Sacred Cultural Traditions | Samrudh Upanayan',
        category: 'Cultural & Social Cinema',
        videoUrl: 'https://www.youtube.com/watch?v=riR7mZ6s9A4',
        image: 'https://img.youtube.com/vi/riR7mZ6s9A4/maxresdefault.jpg'
    }
];

async function main() {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;

    console.log("\n1. Updating ServicePages with Categorized YouTube Videos & Galleries...");
    for (const update of serviceUpdates) {
        const { slug, ...fields } = update;
        
        // Find existing to preserve custom fields if any
        const existing = await db.collection('servicepages').findOne({ slug });
        
        const updateDoc = {
            ...fields,
            slug,
            active: true,
            isPublished: true,
            updatedAt: new Date()
        };

        if (existing) {
            // Preserve existing hero image or custom text if present
            if (existing.heroImage && !updateDoc.heroImage) updateDoc.heroImage = existing.heroImage;
            if (existing.description && !updateDoc.description) updateDoc.description = existing.description;
            if (existing.sections && existing.sections.length > 0) updateDoc.sections = existing.sections;
            if (existing.testimonials && existing.testimonials.length > 0) updateDoc.testimonials = existing.testimonials;
        }

        const res = await db.collection('servicepages').updateOne(
            { slug },
            { $set: updateDoc },
            { upsert: true }
        );
        console.log(`  [OK] ${slug}: ${update.videos.length} videos, ${update.gallery.length} gallery images (matched: ${res.matchedCount}, modified: ${res.modifiedCount}, upserted: ${res.upsertedCount})`);
    }

    console.log("\n2. Updating Homepage Video Vault with Dreamline Official Flagship Videos...");
    const contentRes = await db.collection('contents').updateOne(
        {},
        { $set: { videoVault: homepageFeaturedVideos } }
    );
    console.log(`  [OK] Updated content.videoVault with ${homepageFeaturedVideos.length} flagship videos (modified: ${contentRes.modifiedCount})`);

    console.log("\n3. Verification of MongoDB Persistence...");
    const updatedPages = await db.collection('servicepages').find({ "videos.0": { $exists: true } }).toArray();
    console.log(`  Total ServicePages now with videos: ${updatedPages.length}`);
    for (const p of updatedPages) {
        console.log(`  - [${p.slug}] ${p.title} -> ${p.videos.length} videos, ${(p.gallery || []).length} gallery images`);
    }

    const verifyContent = await db.collection('contents').findOne({});
    console.log(`  Homepage VideoVault count: ${(verifyContent?.videoVault || []).length}`);

    await mongoose.disconnect();
    console.log("\nIntegration script successfully completed!");
}

main().catch(err => {
    console.error("Integration failed:", err);
    process.exit(1);
});
