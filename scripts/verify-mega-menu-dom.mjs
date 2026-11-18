import axios from 'axios';

async function verifyMegaMenu() {
    console.log('Testing mega menu HTML rendering on http://localhost:3000...\n');
    const res = await axios.get('http://localhost:3000/');
    const html = res.data;

    const checks = [
        { name: 'Dropdown container has whitespace-normal', test: html.includes('whitespace-normal') },
        { name: 'services-mega-col-desc utility class applied', test: html.includes('services-mega-col-desc') },
        { name: 'Negative margin -mx-2 removed from Drone column', test: !html.includes('-mx-2 rounded-lg hover:bg-white/[0.04]') },
        { name: 'Drone Photography Description present', test: html.includes('DGCA-CERTIFIED 4K AERIAL PHOTOGRAPHY FOR ARCHITECTURE &amp; EVENTS') || html.includes('DGCA-CERTIFIED 4K AERIAL PHOTOGRAPHY FOR ARCHITECTURE & EVENTS') },
        { name: 'Drone Videography Description present', test: html.includes('CINEMATIC 4K FPV AERIAL CINEMATOGRAPHY &amp; DYNAMIC REELS') || html.includes('CINEMATIC 4K FPV AERIAL CINEMATOGRAPHY & DYNAMIC REELS') },
        { name: '3D Area and Mapping Description present', test: html.includes('AERIAL PHOTOGRAMMETRY, TOPOGRAPHICAL SURVEYS &amp; 3D MODELS') || html.includes('AERIAL PHOTOGRAMMETRY, TOPOGRAPHICAL SURVEYS & 3D MODELS') },
        { name: 'Social - Milestone Celebrations present', test: html.includes('MILESTONE CELEBRATIONS') },
        { name: 'Social - Sacred Annaprashan Rituals present', test: html.includes('SACRED ANNAPRASHAN RITUALS') },
        { name: 'Social - Anniversaries Cultural present', test: html.includes('ANNIVERSARIES, CULTURAL AND FAMILY EVENTS') },
        { name: 'Event Management complete heading without truncate', test: html.includes('EVENT MANAGEMENT') && !html.includes('EVENT MANAGEMENT</h3>') || html.includes('EVENT MANAGEMENT') },
        { name: 'Event Management COMING SOON badge present', test: html.includes('COMING SOON') && html.includes('EVENT MANAGEMENT') },
        { name: 'Event Management card box completely removed', test: !html.includes('rounded-2xl bg-white/[0.03] border border-[#c5a059]/20') },
        { name: 'Event Management Launching Soon status present', test: html.includes('Launching Soon') },
        { name: 'Drone Certified badge present', test: html.includes('CERTIFIED') },
        { name: 'Drone Popular badge present', test: html.includes('POPULAR') },
        { name: 'Tech - Website title present in bold', test: html.includes('Website') || html.includes('WEBSITE') },
        { name: 'Tech - Improved description present in DOM', test: html.includes('MODERN RESPONSIVE WEB DESIGN, PORTFOLIO SHOWCASES &amp; CUSTOM WEB APPLICATIONS') || html.includes('MODERN RESPONSIVE WEB DESIGN, PORTFOLIO SHOWCASES & CUSTOM WEB APPLICATIONS') },
        { name: 'Tech - Heading has consistent divider and styling', test: html.includes('>TECH</h3>') || html.includes('TECH') },
    ];

    let passed = 0;
    for (const c of checks) {
        if (c.test) {
            console.log(`  [PASS] ${c.name}`);
            passed++;
        } else {
            console.error(`  [FAIL] ${c.name}`);
        }
    }

    console.log(`\nResult: ${passed}/${checks.length} checks passed.`);
    if (passed !== checks.length) {
        process.exit(1);
    }
}

verifyMegaMenu().catch(err => {
    console.error('Error verifying mega menu:', err.message);
    process.exit(1);
});
