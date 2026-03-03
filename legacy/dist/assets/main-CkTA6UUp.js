import"./style-CHWbPICF.js";function w(){document.readyState==="complete"?p():window.addEventListener("load",p)}function p(){const e=document.getElementById("loader-progress"),t=document.getElementById("loader");e&&t&&(e.style.width="100%",setTimeout(()=>{t.style.transform="translateY(-100%)"},800))}w();const E="/api/content",I="/api/weddings";let o={},y=[];window.addEventListener("DOMContentLoaded",async()=>{console.log("Dreamline Vite Initializing..."),x(),k(),await Promise.all([f(),v()]),o.masterPortfolio=[...(o.projects||[]).map(e=>({...e,category:"commercial"})),...(y||[]).map(e=>({id:e._id,title:e.title,img:e.coverImage,hoverVideo:e.hoverVideo,type:"wedding",category:"wedding",isWedding:!0}))],L(),N()});const f=async()=>{try{const e=await fetch(E);if(!e.ok)throw new Error("Failed to fetch content");o=await e.json()}catch(e){console.error(e)}},k=async()=>{try{const e=window.location.pathname==="/"?"/index.html":window.location.pathname;await fetch("/api/tracking/view",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({path:e}),keepalive:!0})}catch(e){console.warn("Analytics tracking failed:",e)}},v=async()=>{try{const e=await fetch(I);if(!e.ok)throw new Error("Failed to fetch weddings");y=await e.json()}catch(e){console.error(e)}},L=()=>{T(),S(),A(),M(),j(),P(),b(),H(),G(),V(),q(),C(),$(),B()},B=()=>{if(!o.global?.seo)return;const e=o.global.seo;(!document.title||document.title.includes("Vite App")||document.title==="Dreamline Production")&&e.title&&(document.title=e.title);const t=(n,r)=>{if(!r)return;let l=document.querySelector(`meta[name="${n}"]`)||document.querySelector(`meta[property="${n}"]`);l||(l=document.createElement("meta"),n.startsWith("og:")?l.setAttribute("property",n):l.setAttribute("name",n),document.head.appendChild(l)),l.setAttribute("content",r)};t("description",e.description),t("keywords",e.keywords),t("og:title",e.title),t("og:description",e.description),t("og:image",e.ogImage)},T=()=>{if(!o.global)return;const e=document.getElementById("footer-address"),t=document.getElementById("footer-phone"),n=document.getElementById("footer-email");e&&o.global.contact?.address&&(e.textContent=o.global.contact.address),t&&o.global.contact?.phone&&(t.textContent=o.global.contact.phone,t.href=`tel:${o.global.contact.phone.replace(/[^0-9+]/g,"")}`),n&&o.global.contact?.email&&(n.textContent=o.global.contact.email,n.href=`mailto:${o.global.contact.email}`)},C=()=>{if(!o.luxury)return;const e=document.getElementById("luxury-page-title1"),t=document.getElementById("luxury-page-title2"),n=document.getElementById("luxury-page-desc");e&&o.luxury.hero?.titleLine1&&(e.textContent=o.luxury.hero.titleLine1),t&&o.luxury.hero?.titleLine2&&(t.textContent=o.luxury.hero.titleLine2),n&&o.luxury.hero?.description&&(n.textContent=o.luxury.hero.description);const r=document.getElementById("luxury-test-quote-el"),l=document.getElementById("luxury-test-author-el"),i=document.getElementById("luxury-test-role-el"),a=document.getElementById("luxury-test-img-el");r&&o.luxury.testimonial?.quote&&(r.textContent=`"${o.luxury.testimonial.quote}"`),l&&o.luxury.testimonial?.author&&(l.textContent=o.luxury.testimonial.author),i&&o.luxury.testimonial?.role&&(i.textContent=o.luxury.testimonial.role),a&&o.luxury.testimonial?.image&&(a.src=o.luxury.testimonial.image)},$=()=>{if(!o.commercial)return;const e=document.getElementById("comm-page-title1"),t=document.getElementById("comm-page-title2"),n=document.getElementById("comm-page-desc");e&&o.commercial.hero?.titleLine1&&(e.textContent=o.commercial.hero.titleLine1),t&&o.commercial.hero?.titleLine2&&(t.textContent=o.commercial.hero.titleLine2),n&&o.commercial.hero?.description&&(n.textContent=o.commercial.hero.description)},S=()=>{if(!o.hero)return;const{title:e,subtitle:t,videoUrl:n}=o.hero,r=document.getElementById("hero-title-1"),l=document.getElementById("hero-title-2"),i=document.getElementById("hero-subtitle"),a=document.getElementById("hero-bg-img");if(r&&(r.textContent=e?.line1||"Visionary"),l&&(l.textContent=e?.line2||"Cinema."),i&&(i.textContent=t||"Est. 2010"),a&&n)if(n.match(/\.(mp4|webm)$/i)){const c=document.createElement("video");c.src=n,c.autoplay=!0,c.muted=!0,c.loop=!0,c.className="absolute inset-0 w-full h-full object-cover opacity-30 scale-110",a.replaceWith(c)}else a.src=n},A=()=>{const e=document.getElementById("marquee-content");if(!e||!o.marquee)return;const t=o.marquee.length?o.marquee:["LUXURY WEDDINGS","ADVERTISING","MUSIC CINEMA","CORPORATE NARRATIVES"];e.innerHTML=t.map((n,r)=>`
        <span class="font-heading font-black text-4xl ${r%2===0?"text-outline":"text-[#c5a059]"}">${n}</span>
    `).join("")},M=()=>{const e=document.getElementById("stats-container");!e||!o.stats||(e.innerHTML=o.stats.map(t=>`
        <div class="border-l border-white/10 pl-8 py-4">
            <div class="text-[#c5a059] font-heading text-5xl font-black mb-2">${t.value}</div>
            <div class="text-[10px] font-black uppercase tracking-widest text-white/40">${t.label}</div>
        </div>
    `).join(""))},j=()=>{const e=document.getElementById("motion-gallery-track"),t=document.getElementById("gallery-title"),n=document.getElementById("gallery-subtitle");if(t&&o.gallery?.title&&(t.textContent=o.gallery.title),n&&o.gallery?.subtitle&&(n.textContent=o.gallery.subtitle),!e||!o.gallery?.images)return;const r=o.gallery.images,l=[...r,...r];e.innerHTML=l.map(i=>`
        <div class="motion-card"><img src="${i}" loading="lazy"></div>
    `).join("")},V=()=>{const e=document.querySelector(".brand-track");if(!e||!o.partners)return;const t=o.partners.length?o.partners:[{name:"ADIDAS",letter:"A"},{name:"VOGUE",letter:"V"},{name:"RELIANCE",letter:"R"},{name:"NETFLIX",letter:"N"},{name:"TATA MOTORS",letter:"T"}],n=[...t,...t,...t];e.innerHTML=n.map(r=>`
        <div class="flex items-center gap-4 opacity-40 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
            <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black font-black">${r.letter}</div>
            <span class="font-heading text-xl font-bold tracking-tighter">${r.name}</span>
        </div>
    `).join("")},q=()=>{const e=document.getElementById("v-track-1"),t=document.getElementById("v-track-2"),n=document.getElementById("v-track-3");if(!e||!t||!o.splitGallery?.length)return;const r=o.splitGallery;r.length;const l=[[],[],[]];r.forEach((a,c)=>{l[c%3].push(a)});const i=(a,c)=>{if(!a||!c.length)return;const s=[...c,...c,...c];a.innerHTML=s.map(d=>`
            <div class="aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 border border-white/5">
                <img src="${d}" class="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700">
            </div>
        `).join("")};i(e,l[0]),i(t,l[1]),i(n,l[2])},P=()=>{const e=document.getElementById("video-vault-grid");if(!(!e||!o.videoVault)){if(o.videoVault.length===0){e.innerHTML='<p class="text-white/50 col-span-full text-center">No video items yet.</p>';return}e.innerHTML=o.videoVault.map(t=>`
        <div class="motion-card w-full h-[400px] interactive group relative overflow-hidden rounded-xl">
            <img src="${t.image}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
            ${t.videoUrl?`
            <a href="${t.videoUrl}" target="_blank" class="video-overlay absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors">
                <div class="w-20 h-20 border border-white/30 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                    <svg class="w-8 h-8 fill-white ml-1" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
            </a>`:""}
            <div class="absolute bottom-6 left-6 pointer-events-none">
                <p class="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">${t.category}</p>
                <h3 class="font-heading text-xl font-bold uppercase text-white">${t.title}</h3>
            </div>
        </div>
    `).join("")}},b=(e="all")=>{const t=document.getElementById("master-grid");if(!t||!o.masterPortfolio)return;const n=e==="all"?o.masterPortfolio:o.masterPortfolio.filter(i=>i.category===e||i.type===e);if(n.length===0){t.innerHTML='<p class="text-gray-500 col-span-full text-center py-10 uppercase tracking-widest text-[10px] font-bold">No projects found in this category.</p>';return}const r="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=20";t.innerHTML=n.map(i=>{const a=i.isWedding||i.type==="wedding",c=i.type||(a?"wedding":"commercial"),s=i.img||r;return`
            <div class="wedding-card aspect-[4/5] bg-zinc-900 border border-white/5 overflow-hidden relative group block cursor-pointer" 
                 onclick="window.openVideoPlayer('${i.videoUrl||""}', '${i.title}')">
                <img src="${s}" 
                     onerror="this.src='${r}'"
                     class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-60 group-hover:opacity-100">
                
                ${i.hoverVideo?`
                    <video src="${i.hoverVideo}" preload="metadata" muted loop playsinline class="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none hover-video" style="transform: scale(1.05)"></video>
                `:""}

                <!-- Content Overlay -->
                <div class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity p-8 flex flex-col justify-end z-10">
                    <div class="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <p class="text-[#c5a059] text-[9px] font-black uppercase tracking-[0.3em] mb-3">${c}</p>
                        <h3 class="text-white font-heading text-xl font-black uppercase leading-tight tracking-tighter mb-4">${i.title}</h3>
                        
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center bg-gold/5 group-hover:bg-gold group-hover:text-black transition-all">
                                <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                            <span class="text-[9px] text-white/50 uppercase font-black tracking-widest group-hover:text-white transition-colors">
                                ${i.videoUrl?"Watch Film":a?"View Story":"View Project"}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Subtle Border Glow -->
                <div class="absolute inset-0 border border-white/0 group-hover:border-white/10 transition-colors pointer-events-none rounded-sm"></div>
            </div>
        `}).join(""),t.querySelectorAll(".wedding-card").forEach(i=>{const a=i.querySelector(".hover-video");a&&(i.addEventListener("mouseenter",()=>a.play().catch(()=>{})),i.addEventListener("mouseleave",()=>{a.pause(),a.currentTime=0}))})};window.openVideoPlayer=(e,t)=>{if(!e)return;const n=document.getElementById("video-modal"),r=document.getElementById("modal-iframe"),l=document.getElementById("modal-video"),i=document.getElementById("video-loader");if(!n)return;const a=e.includes("youtube.com")||e.includes("youtu.be"),c=e.includes("vimeo.com");if(e.match(/\.(mp4|webm|ogg|mov)$/i),i.style.display="flex",n.classList.remove("pointer-events-none"),n.classList.add("opacity-100"),a||c){let s=e;if(a){const d=/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/,m=e.match(d);m&&m[2].length==11&&(s=`https://www.youtube.com/embed/${m[2]}?autoplay=1`)}else if(c){const d=e.match(/vimeo.com\/(\d+)/);d&&(s=`https://player.vimeo.com/video/${d[1]}?autoplay=1`)}l.classList.add("hidden"),r.classList.remove("hidden"),r.src=s,r.onload=()=>{i.style.display="none",r.style.opacity="1"}}else r.classList.add("hidden"),l.classList.remove("hidden"),l.src=e,l.oncanplay=()=>{i.style.display="none"}};const N=()=>{const e=document.getElementById("video-modal"),t=document.getElementById("close-video"),n=document.getElementById("modal-iframe"),r=document.getElementById("modal-video");if(!e||!t)return;const l=()=>{e.classList.add("pointer-events-none"),e.classList.remove("opacity-100"),n.src="",n.style.opacity="0",r.pause(),r.src=""};t.onclick=l,e.onclick=i=>{i.target===e&&l()},document.addEventListener("keydown",i=>{i.key==="Escape"&&l()})},H=()=>{if(!o.about)return;const{heroTitle:e,heroSubtitle:t,vision:n,mission:r,founderNote:l,founderImage:i}=o.about,a=document.getElementById("about-hero-title"),c=document.getElementById("about-hero-subtitle"),s=document.getElementById("about-vision"),d=document.getElementById("about-mission"),m=document.getElementById("about-founder-note"),h=document.getElementById("about-founder-img");a&&e&&(a.innerHTML=e.replace(/\n/g,"<br>")),c&&t&&(c.textContent=t),s&&n&&(s.textContent=n),d&&r&&(d.textContent=r),m&&l&&(m.textContent=`"${l}"`),h&&i&&(h.src=i)},G=async()=>{const e=document.getElementById("journal-grid");if(e)try{const t=await fetch("/api/journals");if(!t.ok)throw new Error("Failed to fetch journals");const n=await t.json();if(n.length===0){e.innerHTML='<p class="text-gray-500 text-center col-span-full py-10 uppercase tracking-widest text-[10px] font-bold">No insights shared yet.</p>';return}e.innerHTML=n.map(r=>`
            <article class="blog-card rounded-3xl group">
                <div class="h-64 overflow-hidden">
                    <img src="${r.image}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="${r.title}">
                </div>
                <div class="p-8">
                    <div class="flex gap-4 mb-4 text-[10px] uppercase font-bold tracking-widest text-gray-500">
                        <span>${r.date||""}</span>
                        <span class="text-[#c5a059]">${r.category||"INSIGHT"}</span>
                    </div>
                    <h3 class="text-2xl font-bold mb-4 group-hover:text-[#c5a059] transition-colors leading-tight">${r.title}</h3>
                    <p class="text-sm text-gray-400 mb-6 font-light line-clamp-3">${r.excerpt||""}</p>
                    <a href="journal-details.html?id=${r.id}" class="text-xs font-black uppercase tracking-widest border-b-2 border-[#c5a059] pb-1">Read Insight</a>
                </div>
            </article>
        `).join("")}catch(t){console.error(t)}};window.filterGallery=(e,t)=>{document.querySelectorAll(".filter-btn").forEach(n=>n.classList.remove("active")),t&&t.classList.add("active"),b(e)};window.fetchContent=f;window.fetchWeddings=v;const g=document.createElement("button");g.id="back-to-top";g.innerHTML=`
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
</svg>
`;document.addEventListener("DOMContentLoaded",()=>{document.body.appendChild(g);const e=document.getElementById("back-to-top");e&&(window.addEventListener("scroll",()=>{window.scrollY>500?e.classList.add("visible"):e.classList.remove("visible")}),e.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}))),x()});const x=()=>{const e=document.querySelectorAll(".theme-toggle"),t=document.documentElement,n=l=>{l==="light"?(t.setAttribute("data-theme","light"),e.forEach(i=>{i.querySelector(".sun-icon")?.classList.add("hidden"),i.querySelector(".moon-icon")?.classList.remove("hidden")})):(t.removeAttribute("data-theme"),e.forEach(i=>{i.querySelector(".moon-icon")?.classList.add("hidden"),i.querySelector(".sun-icon")?.classList.remove("hidden")}))},r=localStorage.getItem("dreamline_theme")||"dark";n(r),e.forEach(l=>{l.addEventListener("click",()=>{const a=t.getAttribute("data-theme")==="light"?"dark":"light";localStorage.setItem("dreamline_theme",a),n(a)})})},u=document.querySelector(".review-track");u&&Array.from(u.children).forEach(t=>{const n=t.cloneNode(!0);u.appendChild(n)});
