/* Experience layer: small illustrations, toasts, search across every scope, privacy controls and page,
   scroll position kept on Back and Forward, back-to-top, and an offline notice. */
(function(){
"use strict";
const X=window.PPD_EXT,P=window.PPD,GD=window.PPD_GUARD||{};
if(!X||!P||!X.routes)return;
const esc=P.esc;
const route=()=>{const h=(location.hash||"").slice(1),k=h.indexOf("/");return k<0?h:h.slice(0,k)};

/* ---------- illustrations (drawn for this site, decorative) ---------- */
const svg=(body,w,h)=>`<svg class="art" viewBox="0 0 ${w||96} ${h||80}" width="${w||96}" height="${h||80}" aria-hidden="true" focusable="false" fill="none" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const ART={
  pin:svg(`<rect x="10" y="22" width="76" height="50" rx="10" fill="var(--cta-soft)"/><path d="M10 50l22-10 20 12 34-16" stroke="var(--rule2)" stroke-width="2"/><path d="M36 22v50M62 22v50" stroke="var(--surface)" stroke-width="2"/><path d="M48 10c-9 0-16 7-16 16 0 12 16 28 16 28s16-16 16-28c0-9-7-16-16-16z" fill="var(--cta)"/><circle cx="48" cy="26" r="6" fill="var(--surface)"/>`),
  compare:svg(`<rect x="8" y="14" width="34" height="56" rx="8" fill="var(--upa-soft)" stroke="var(--upa)" stroke-width="2"/><rect x="54" y="14" width="34" height="56" rx="8" fill="var(--nda-soft)" stroke="var(--nda)" stroke-width="2"/><path d="M16 56h18M16 46h12M16 36h16" stroke="var(--upa)" stroke-width="4"/><path d="M62 56h10M62 46h18M62 36h14" stroke="var(--nda)" stroke-width="4"/><circle cx="48" cy="42" r="10" fill="var(--ink)"/><path d="M44 39l4 7 4-7" stroke="var(--surface)" stroke-width="2"/>`),
  decide:svg(`<path d="M18 40h60v26a6 6 0 0 1-6 6H24a6 6 0 0 1-6-6z" fill="var(--cta-soft)" stroke="var(--cta)" stroke-width="2"/><path d="M12 40h72" stroke="var(--cta)" stroke-width="3"/><rect x="32" y="10" width="32" height="30" rx="4" fill="var(--surface)" stroke="var(--cta)" stroke-width="2"/><path d="M40 25l6 6 10-12" stroke="var(--s-ach)" stroke-width="3.5"/><path d="M40 52h16" stroke="var(--cta)" stroke-width="3"/>`),
  notes:svg(`<rect x="22" y="10" width="52" height="62" rx="8" fill="var(--surface)" stroke="var(--cta)" stroke-width="2"/><path d="M32 26h32M32 38h32M32 50h18" stroke="var(--rule2)" stroke-width="3"/><circle cx="68" cy="60" r="13" fill="var(--cta)"/><path d="M68 54v12M62 60h12" stroke="var(--surface)" stroke-width="3"/>`),
  shield:svg(`<path d="M48 8l28 10v20c0 18-12 30-28 36-16-6-28-18-28-36V18z" fill="var(--cta-soft)" stroke="var(--cta)" stroke-width="2"/><rect x="36" y="36" width="24" height="18" rx="4" fill="var(--cta)"/><path d="M41 36v-5a7 7 0 0 1 14 0v5" stroke="var(--cta)" stroke-width="3"/><circle cx="48" cy="45" r="2.5" fill="var(--surface)"/>`),
  oops:svg(`<rect x="16" y="12" width="64" height="48" rx="8" fill="var(--sunk)" stroke="var(--rule2)" stroke-width="2"/><path d="M16 24h64" stroke="var(--rule2)" stroke-width="2"/><path d="M38 36l8 8M46 36l-8 8M52 36l8 8M60 36l-8 8" stroke="var(--muted)" stroke-width="3"/><path d="M40 52c4-4 12-4 16 0" stroke="var(--muted)" stroke-width="3"/><path d="M34 70h28" stroke="var(--rule2)" stroke-width="4"/>`),
  search:svg(`<circle cx="42" cy="36" r="22" fill="var(--cta-soft)" stroke="var(--cta)" stroke-width="3"/><path d="M58 53l18 18" stroke="var(--cta)" stroke-width="6"/><path d="M33 36h18" stroke="var(--cta)" stroke-width="3"/>`)
};
X.art=(name,cls)=>ART[name]?`<span class="ppd-art${cls?" "+cls:""}" aria-hidden="true">${ART[name]}</span>`:"";

/* ---------- toast ---------- */
let toastTimer=null;
X.toast=msg=>{
  let t=document.getElementById("ppd-toast");
  if(!t){t=document.createElement("div");t.id="ppd-toast";t.className="ppd-toast";t.setAttribute("role","status");t.setAttribute("aria-live","polite");document.body.appendChild(t)}
  t.textContent=String(msg);t.classList.add("on");
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("on"),4200);
};

/* ---------- search: states, the chosen state's promises, Delhi's promises, audit findings ---------- */
const STS=typeof STATES!=="undefined"?STATES:[];
X.search=(q,lq,hl)=>{
  let n=0,html="";
  if(!lq)return {n,html};
  const has=s=>String(s||"").toLowerCase().includes(lq);
  const grp=(h,items)=>{if(!items.length)return;n+=items.length;html+=`<section class="topic"><h2>${h} (${items.length})</h2><div class="sres">${items.join("")}</div></section>`};
  const loc=X.getLoc?X.getLoc():null;
  if(lq.length>=3)grp("States and union territories",STS.filter(s=>s.toLowerCase().includes(lq)).slice(0,6).map(s=>{
    const nx=X.stateNext?X.stateNext(s):null;
    const sub=s==="Delhi"?"Assembly, municipal and Lok Sabha coverage":nx?`Assembly election expected ${esc(nx.when)} &middot; now ${esc(nx.now)}`:"No elected assembly. Lok Sabha coverage";
    return `<button type="button" class="card sres-btn" data-setstate="${esc(s)}"><b>${hl(s,lq)}</b><span>${sub}. ${loc&&loc.state===s?"Your current location.":"Tap to switch to this location."}</span></button>`}));
  if(loc&&loc.state==="Delhi"&&typeof DP!=="undefined")grp("Delhi promises",DP.filter(p=>has(p.p+" "+p.e)).slice(0,20).map(p=>`<a class="card" href="#promises"><b>${hl(p.p,lq)}</b><span>${esc((ST[p.s]||{}).l||"")}. ${hl(p.e||"",lq)}</span></a>`));
  if(loc&&typeof SDEEP!=="undefined"&&Object.prototype.hasOwnProperty.call(SDEEP,loc.state))grp(esc(loc.state)+" promises",(SDEEP[loc.state].prom||[]).filter(p=>has(p.p+" "+p.e)).map(p=>`<a class="card" href="#promises"><b>${hl(p.p,lq)}</b><span>${esc((ST[p.s]||{}).l||"")}. ${hl(p.e||"",lq)}</span></a>`));
  grp("Audit findings",(X.findings||[]).filter(f=>has(f.ti+" "+f.bd)).map(f=>`<a class="card" href="#audits/${esc(f.id)}"><b>${hl(f.ti,lq)}</b><span>${esc(f.au)} &middot; ${esc(f.dt)}</span></a>`));
  return {n,html};
};

/* ---------- privacy ---------- */
const canPrivate=!!(GD.setPrivate&&GD.isPrivate);
X.privacyBox=()=>`<section class="sec" id="ppd-privacy"><div class="sh"><h2>Your privacy on this device</h2></div>
  <div class="card pbox">${X.art("shield")}<div class="pbox-t">
    <ul class="plain"><li>Your marks and answers stay in this browser. They are never sent to us or anyone else.</li>
    <li>Anyone who uses this browser can open this page. On a shared phone or computer, erase when you finish, or turn on the switch below.</li></ul>
    ${canPrivate?`<label class="switch"><input type="checkbox" id="ppd-private" ${GD.isPrivate()?"checked":""}><span>Forget everything when I close this tab</span></label>`:""}
    <div class="ctas"><button type="button" class="btn btn-g btn-s" data-ppd-erase="1">Erase everything saved on this device</button><a class="small" href="#privacy">How your data is handled</a></div>
  </div></div></section>`;
function viewPrivacy(){
  const row=(h,b)=>`<div class="card prow2"><b>${h}</b><span>${b}</span></div>`;
  return `<div class="wrap page narrow" style="margin-inline:auto"><p class="crumbs"><a href="#home">Home</a> &rsaquo; Privacy</p>
  <div class="phead"><h1 tabindex="-1" id="flowh">Privacy and security</h1><p class="intro">Who you lean towards is nobody's business but yours. This site is built so that it stays that way.</p></div>
  <section class="sec"><div class="sh"><h2>What stays on your device</h2></div><div class="plist3">
    ${row("No account, no cookies, no tracking","There is no sign-up and no advertising or analytics code on this site.")}
    ${row("Saved only in this browser","Your location, the issues you pick, your answers in Help me decide, your + and &minus; marks, the governments you compare, your eligibility answers and any polling-station note. None of it is sent anywhere.")}
    ${row("Never saved","Your date of birth is used once to check your age and is not kept. Your position is never stored.")}
  </div></section>
  <section class="sec"><div class="sh"><h2>What your browser fetches</h2></div><div class="plist3">
    ${row("This site's own files","Served by our host, Vercel. Like any web host, it sees your internet address when it sends you a page.")}
    ${row("Fonts, party symbols and portraits","Also served from this site, not from an outside service. The images are copies of Wikimedia Commons files, credited on the About page.")}
    ${row("Your state, only if you tap Use my location","Your browser asks you first. Then a position rounded to about 10 km goes to BigDataCloud to turn it into a state name. Pick your state from the list instead and nothing is sent.")}
    ${row("Links to sources","Open on their own sites in a new tab. Those sites are told only that you came from this one.")}
  </div></section>
  <section class="sec"><div class="sh"><h2>How the site is locked down</h2></div><div class="plist3">
    ${row("Only this site's own code runs","Browsers are told to refuse any script that does not come from this site, and to refuse to show this site inside another one.")}
    ${row("Always encrypted","Pages load over HTTPS only.")}
    ${row("Checked before use","Anything read back from your browser's storage, or from a link you open, is checked before the site uses it.")}
  </div></section>
  ${X.privacyBox()}
  <section class="sec"><div class="banner"><div><h2>Beware of look-alike sites</h2><p>This site never asks for money, a password, an OTP, or your Aadhaar or voter ID number. Official government sites end in .gov.in or .nic.in.</p></div><a class="btn btn-p" href="#audits">Audit findings</a></div></section>
  </div>`}
X.routes.privacy={v:viewPrivacy,t:"Privacy and security",nav:"about"};

/* ---------- first visit: how the site works ---------- */
function how(){
  if(route()!==""&&route()!=="home")return;
  if(document.getElementById("ppd-how"))return;
  const loc=X.getLoc?X.getLoc():null;if(loc)return;
  const hero=document.querySelector("#app .hero");if(!hero)return;
  const step=(a,h,b)=>`<div class="how-step">${X.art(a)}<div><b>${h}</b><span>${b}</span></div></div>`;
  hero.insertAdjacentHTML("afterend",`<section class="wrap how" id="ppd-how" aria-label="How this site works"><div class="how-grid">
    ${step("pin","1. Pick your state","See its parties, every government since 2004 and its next election.")}
    ${step("compare","2. Compare the record","Promises kept and missed, and how things changed, side by side with sources.")}
    ${step("decide","3. Decide for yourself","Choose the issues you care about. This site never names a winner.")}
  </div></section>`);
}
/* Empty states get a picture and a next step. */
function emptyStates(){
  if(route()==="mynotes"){const p=document.querySelector("#app .phead");if(p&&!document.querySelector("#app .op")&&!document.querySelector("#app .answers")&&!document.getElementById("ppd-empty"))
    p.insertAdjacentHTML("afterend",`<div class="card ppd-empty" id="ppd-empty">${X.art("notes")}<div><b>Nothing saved yet</b><span class="muted">Mark what matters to you with + and &minus; as you read, or let the guide walk you through your issues.</span><div class="ctas"><a class="btn btn-p btn-s" href="#decide">Help me decide</a><a class="btn btn-g btn-s" href="#issues">Browse issues</a></div></div></div>`)}
  if(route()==="search"){const e=document.querySelector("#app .empty");if(e&&!e.dataset.art){e.dataset.art="1";e.insertAdjacentHTML("afterbegin",X.art("search","sm"))}}
}
const prevAfter=X.after;
X.after=(r,a)=>{if(prevAfter)prevAfter(r,a);try{how();emptyStates()}catch(e){if(GD.report)GD.report(e,"ux after")}};

/* ---------- events ---------- */
document.addEventListener("click",e=>{
  const t=e.target;if(!t||!t.closest)return;
  const s=t.closest("[data-setstate]");
  if(s){const name=s.dataset.setstate;if(STS.includes(name)&&X.setLoc){X.setLoc({state:name,ac:null});try{localStorage.removeItem("pdk_scope")}catch(err){}
    if(name==="Delhi")location.hash="delhi";else if(location.hash==="#home")window.dispatchEvent(new HashChangeEvent("hashchange"));else location.hash="home";X.toast("Showing "+name+". You can change this any time.")}return}
  if(t.closest("[data-skip]")){e.preventDefault();const h=document.getElementById("flowh")||document.getElementById("app");if(h){if(!h.hasAttribute("tabindex"))h.setAttribute("tabindex","-1");h.focus()}return}
  if(t.closest("#ppd-top")){window.scrollTo({top:0,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});const h=document.getElementById("flowh");if(h)h.focus({preventScroll:true})}
});
document.addEventListener("change",e=>{
  const t=e.target;
  if(t&&t.id==="ppd-private"&&canPrivate){const ok=GD.setPrivate(t.checked);if(!ok){t.checked=false;X.toast("This browser won't let the site change that setting.");return}
    X.toast(t.checked?"On. Everything is forgotten when you close this tab.":"Off. Your choices are kept on this device.")}
});
window.addEventListener("offline",()=>X.toast("You're offline. Pages you've already opened still work."));
window.addEventListener("online",()=>X.toast("Back online."));

/* ---------- back to top ---------- */
const top=document.createElement("button");
top.id="ppd-top";top.type="button";top.className="ppd-top";top.setAttribute("aria-label","Back to top");top.hidden=true;
top.innerHTML=`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>`;
document.body.appendChild(top);

/* ---------- keep the scroll position on Back and Forward ----------
   Every history entry gets a number. Moving to an entry that already has one is a Back or Forward step,
   so the page returns to where the reader left it. New pages start at the top, as before. */
let counter=0,current=0,ticking=false;
const saved=new Map();
function stamp(){
  let s=null;try{s=history.state}catch(e){}
  if(s&&typeof s.ppd==="number"){counter=Math.max(counter,s.ppd);return {i:s.ppd,fresh:false}}
  counter++;try{history.replaceState(Object.assign({},s||{},{ppd:counter}),"")}catch(e){}
  return {i:counter,fresh:true};
}
try{if("scrollRestoration" in history)history.scrollRestoration="manual"}catch(e){}
current=stamp().i;
window.addEventListener("scroll",()=>{
  if(ticking)return;ticking=true;
  requestAnimationFrame(()=>{ticking=false;saved.set(current,window.scrollY);
    top.hidden=window.scrollY<1400||document.body.classList.contains("flowmode")});
},{passive:true});
window.addEventListener("hashchange",()=>{
  const r=stamp(),was=current;current=r.i;
  if(!r.fresh&&r.i!==was&&saved.has(r.i)){const y=saved.get(r.i);requestAnimationFrame(()=>requestAnimationFrame(()=>window.scrollTo(0,y)))}
  if(saved.size>200){const first=saved.keys().next().value;saved.delete(first)}
});

/* The first page was drawn before this file ran, so add its extras now. */
try{how();emptyStates()}catch(e){}
})();
