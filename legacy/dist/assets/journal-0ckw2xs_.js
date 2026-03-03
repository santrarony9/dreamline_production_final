import"./style-CHWbPICF.js";import"./main-CkTA6UUp.js";async function n(){try{const t=await fetch("/api/journals");if(!t.ok)throw new Error("Failed to fetch journals");const a=await t.json();r(a)}catch(t){console.error(t),document.getElementById("journal-grid").innerHTML='<p class="text-white text-center col-span-full">Loading insights...</p>'}}function r(t){const a=document.getElementById("journal-grid");a&&(t.length===0?a.innerHTML='<p class="text-gray-500 text-center col-span-full py-10">No journal entries found.</p>':a.innerHTML=t.map(e=>`
                            <article class="blog-card rounded-3xl group">
                                <div class="h-64 overflow-hidden">
                                    <img src="${e.image}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="${e.title}">
                                </div>
                                <div class="p-8">
                                    <div class="flex gap-4 mb-4 text-[10px] uppercase font-bold tracking-widest text-gray-500">
                                        <span>${e.date||""}</span>
                                        <span class="text-[#c5a059]">${e.category||""}</span>
                                    </div>
                                    <h3 class="text-2xl font-bold mb-4 group-hover:text-[#c5a059] transition-colors leading-tight">${e.title}</h3>
                                    <p class="text-sm text-gray-400 mb-6 font-light line-clamp-3">${e.excerpt||""}</p>
                                    <a href="journal-details.html?id=${e.id}" class="text-xs font-black uppercase tracking-widest border-b-2 border-[#c5a059] pb-1">Read Insight</a>
                                </div>
                            </article>
                        `).join(""))}window.addEventListener("DOMContentLoaded",n);
