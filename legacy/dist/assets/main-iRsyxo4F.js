import"./style-CHWbPICF.js";import"./main-CkTA6UUp.js";const l="demo",c=`https://res.cloudinary.com/${l}/image/upload`;function s(t,o="auto"){return t.startsWith("http")?t:`${c}/f_auto,q_auto,w_${o}/${t}`}document.addEventListener("DOMContentLoaded",async()=>{let t={};try{const e=await fetch("/api/content");if(!e.ok)throw new Error("Failed to fetch content");t=await e.json()}catch(e){console.error(e);return}if(t.hero){r("hero-title-1",t.hero.title?.line1),r("hero-title-2",t.hero.title?.line2),r("hero-subtitle",t.hero.subtitle);const e=document.getElementById("hero-bg-img");e&&t.hero.videoUrl&&(e.src=s(t.hero.videoUrl,1920))}const o=document.getElementById("stats-container");o&&t.stats&&(o.innerHTML=t.stats.map(e=>`
            <div class="border-l border-white/10 pl-8 py-4">
                <div class="text-[#c5a059] font-heading text-5xl font-black mb-2">${e.value}</div>
                <div class="text-[10px] font-black uppercase tracking-widest text-white/40">${e.label}</div>
            </div>
        `).join(""));const n=document.getElementById("marquee-content");n&&t.marquee&&(n.innerHTML=t.marquee.map((e,i)=>`<span class="font-heading font-black text-4xl ${i%2!==0?"text-[#c5a059]":"text-outline"}">${e}</span>`).join(""));const a=document.querySelector(".motion-track");if(a&&t.gallery?.images){const e=[...t.gallery.images,...t.gallery.images];a.innerHTML=e.map(i=>`
            <div class="motion-card"><img src="${s(i,600)}"></div>
        `).join("")}});function r(t,o){const n=document.getElementById(t);n&&(n.textContent=o)}
