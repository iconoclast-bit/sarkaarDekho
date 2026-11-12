(function(){
"use strict";
/* ---------- helpers ---------- */
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fmt=(v,d)=>v==null||isNaN(v)?"–":v.toLocaleString("en-IN",{minimumFractionDigits:d,maximumFractionDigits:d});
function store(k,v){try{if(v===undefined)return JSON.parse(localStorage.getItem(k));localStorage.setItem(k,JSON.stringify(v))}catch(e){return null}}
const link=(u,t)=>`<a href="${u}" target="_blank" rel="noopener">${esc(t)}</a>`;
const yl=(y,m)=>m.fy?`${y}-${String(y+1).slice(2)}`:String(y);
const SL={upa:"Congress (UPA)",nda:"BJP (NDA)"};
const SY={upa:"2004–14",nda:"2014–24"};
const ISS=Object.fromEntries(ISSUES.map(i=>[i.id,i]));
const MS=Object.fromEntries(M.map(m=>[m.id,m]));
const sum=o=>Object.values(o).reduce((a,b)=>a+b,0);

function stat(m,a,b){
  const s=D[m.id];
  if(m.kind==="flow"){const ys=[];for(let y=a;y<=b;y++)if(s[y]!=null)ys.push(y);
    if(!ys.length)return null;return {avg:ys.reduce((x,y)=>x+s[y],0)/ys.length,n:ys.length,of:b-a+1}}
  const inYs=Object.keys(s).map(Number).filter(y=>y>=a&&y<=b).sort((x,y)=>x-y);
  if(!inYs.length)return null;
  const startY=s[a-1]!=null?a-1:inYs[0],endY=inYs[inYs.length-1];
  return {start:s[startY],startY,end:endY===startY?null:s[endY],endY:endY===startY?null:endY};
}
const sideStat=(m,sd)=>stat(m,SIDES[sd].years[0],SIDES[sd].years[1]);
function tally(ids){const c={ach:0,part:0,not:0,con:0,prog:0};P.filter(p=>ids.includes(p.t)).forEach(p=>c[p.s]++);return c}
function statusBar(c){const keys=Object.keys(c).filter(k=>c[k]);
  if(!keys.length)return `<p class="empty">No promises tracked.</p>`;
  return `<div class="sbar" role="img" aria-label="${keys.map(k=>c[k]+" "+ST[k].l.toLowerCase()).join(", ")}">${keys.map(k=>`<i class="st-${k}" style="flex:${c[k]}"></i>`).join("")}</div>
  <div class="slegend">${keys.map(k=>`<span class="st-${k}"><b style="color:var(--sc)">${ST[k].i}</b> <b>${c[k]}</b> ${ST[k].l.toLowerCase()}</span>`).join("")}</div>`}
const pill=k=>`<span class="pill st-${k}"><span aria-hidden="true">${ST[k].i}</span>${ST[k].l}</span>`;

/* ---------- icons (generic line icons, no party symbols) ---------- */
const IC={
  prices:'<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  jobs:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
  farmers:'<path d="M12 21v-9"/><path d="M12 12C12 7 8 5 4 5c0 4 3 7 8 7z"/><path d="M12 14c0-4 3-6 8-6 0 4-3 6-8 6z"/>',
  health:'<path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 21.5l8.8-8.8a5 5 0 0 0 0-7.1z"/><path d="M7 12h3l1.5-2.5 2 5L15 12h2"/>',
  education:'<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/><path d="M22 9v6"/>',
  women:'<circle cx="12" cy="7" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>',
  welfare:'<path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M8 7c0-1 1-2 1-3M12 7c0-1 1-2 1-3M16 7c0-1 1-2 1-3"/>',
  services:'<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>',
  economy:'<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  debt:'<path d="M3 10l9-6 9 6"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 21h18"/>',
  governance:'<path d="M12 3v18M7 21h10M5 7h14"/><path d="M5 7l-3 6a3 3 0 0 0 6 0zM19 7l-3 6a3 3 0 0 0 6 0z"/>',
  national:'<path d="M5 21V4"/><path d="M5 4h12l-2 4 2 4H5"/>'
};
const ico=(id,sz)=>`<svg class="ico" viewBox="0 0 24 24" width="${sz||24}" height="${sz||24}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[id]||""}</svg>`;

/* ---------- comparable items: two decades + five terms ---------- */
const ITEMS={
  upa:{id:"upa",al:"upa",name:"Congress (UPA)",av:"UPA",span:"2004–2014",years:[2004,2013],pm:"Manmohan Singh",seats:"145 (2004), 206 (2009)",terms:["upa1","upa2"],all:["upa1","upa2"],lead:"INC",kind:"Ten years"},
  nda:{id:"nda",al:"nda",name:"BJP (NDA)",av:"NDA",span:"2014–2024",years:[2014,2023],pm:"Narendra Modi",seats:"282 (2014), 303 (2019)",terms:["nda1","nda2"],all:["nda1","nda2","nda3"],lead:"BJP",kind:"Ten years"}
};
TERMS.forEach(t=>{const r=t.name.split("-")[1];ITEMS[t.id]={id:t.id,al:t.al,name:t.name,av:t.al.toUpperCase()+"<br>"+r,span:t.span,years:t.years,pm:t.pm,seats:t.seats+" ("+(t.al==="upa"?"INC":"BJP")+")",terms:[t.id],all:[t.id],lead:t.al==="upa"?"INC":"BJP",kind:"Five-year term",ongoing:!!t.ongoing}});
const ORDER=["upa","nda","upa1","upa2","nda1","nda2","nda3"];
const PAIR={upa:"nda",nda:"upa",upa1:"nda1",upa2:"nda2",nda1:"upa1",nda2:"upa2",nda3:"nda2"};
/* ---------- images: party election symbols and official PM portraits, from Wikimedia Commons ---------- */
const WM="https://upload.wikimedia.org/wikipedia/commons/thumb/";
const IMG={
  upa:{src:WM+"d/d7/Hand_INC.svg/250px-Hand_INC.svg.png",page:"https://commons.wikimedia.org/wiki/File:Hand_INC.svg",what:"Indian National Congress election symbol (hand)"},
  nda:{src:WM+"2/23/BJP_Election_Symbol.svg/250px-BJP_Election_Symbol.svg.png",page:"https://commons.wikimedia.org/wiki/File:BJP_Election_Symbol.svg",what:"Bharatiya Janata Party election symbol (lotus)"},
  "Manmohan Singh":{src:WM+"a/af/Prime_Minister_Manmohan_Singh_official_portrait.jpg/250px-Prime_Minister_Manmohan_Singh_official_portrait.jpg",page:"https://commons.wikimedia.org/wiki/File:Prime_Minister_Manmohan_Singh_official_portrait.jpg",what:"Official portrait of Prime Minister Manmohan Singh"},
  "Narendra Modi":{src:WM+"1/1a/Official_Photograph_of_Prime_Minister_Narendra_Modi_Portrait_%28crop%29.png/250px-Official_Photograph_of_Prime_Minister_Narendra_Modi_Portrait_%28crop%29.png",page:"https://commons.wikimedia.org/wiki/File:Official_Photograph_of_Prime_Minister_Narendra_Modi_Portrait_(crop).png",what:"Official portrait of Prime Minister Narendra Modi"}
};
const img=(k,cls,alt)=>IMG[k]?`<img class="${cls}" src="${IMG[k].src}" alt="${alt||""}" loading="lazy" decoding="async" onerror="this.remove()">`:"";
const logo=sd=>img(sd,"lg");
const av=(it,cls)=>`<span class="av ${it.al} ${cls||""}" aria-hidden="true"><span class="avt">${it.av}</span>${img(it.al,"avi")}${it.terms.length===1?`<b class="avr">${it.name.split("-")[1]}</b>`:""}</span>`;
const face=(it,cls)=>`<span class="face ${it.al} ${cls||""}"><span class="ph"><span class="pht">${esc(it.pm.split(" ").map(w=>w[0]).join(""))}</span>${img(it.pm,"phi","Prime Minister "+it.pm)}</span>${av(it,"xs")}</span>`;
const fullName=it=>it.terms.length>1||it.id==="upa"||it.id==="nda"?`${it.name}, ${it.span}`:`${it.name} (${SL[it.al]})`;

/* ---------- dated, sourced updates (all from the promise tracker) ---------- */
const findP=s=>P.find(p=>p.p.toLowerCase().includes(s));
const NEWS=[
  {d:"Sept 2026",t:"Government says 3.5 crore women are now 'Lakhpati Didis'",s:"The minister set a new goal of 6 crore. This is the government's own figure; no independent check was found.",p:findP("lakhpati")},
  {d:"Aug 2026",t:"First bullet-train stretch expected in August 2027",s:"The Surat–Vapi section of the Mumbai–Ahmedabad line, first promised in 2014.",p:findP("bullet")},
  {d:"July 2026",t:"One Nation, One Election committee given more time",s:"The parliamentary committee's deadline moved to the 2026 winter session.",p:findP("one nation")},
  {d:"Apr 2026",t:"Bill linking women's reservation to new seat boundaries fails",s:"298 votes for and 230 against in the Lok Sabha, short of the two-thirds needed.",p:findP("put women")},
  {d:"Apr 2026",t:"Gujarat passes its own Uniform Civil Code",s:"After Uttarakhand in 2024. There is still no national law.",p:findP("uniform civil")},
  {d:"Mar 2026",t:"National highways reach 1,46,560 km",s:"Up from 91,287 km in 2014, partly through state roads being renamed national highways.",src:[S.nh25.t,S.nh25.u]},
  {d:"Jan 2026",t:"99.2% of broad-gauge rail now electrified",s:"The 2022 goal of full electrification was missed; it was 99.2% by November 2025.",src:[S.rail.t,S.rail.u]},
  {d:"Dec 2025",t:"19.2 lakh rooftop solar systems installed under PM Surya Ghar",s:"The scheme's goal is 1 crore homes by 2026-27.",p:findP("rooftop")}
].map(n=>{if(n.p)n.src=n.p.src[0];return n});
const WATCH=[
  {w:"Aug 2027",t:"First bullet-train stretch, Surat–Vapi",p:findP("bullet")},
  {w:"2026-27",t:"1 crore homes with rooftop solar",p:findP("rooftop")},
  {w:"Winter session 2026",t:"Committee report on One Nation, One Election",p:findP("one nation")},
  {w:"2028-29",t:"2 crore more rural homes (PMAY-Gramin)",p:findP("3 crore more houses")},
  {w:"2028",t:"Tap water in every rural home",p:findP("tap water")}
];

/* ---------- state ---------- */
let route="home",arg="";
let dec=store("pdk3_dec")||{issues:[],step:0,ans:{}};
if(!dec||!Array.isArray(dec.issues))dec={issues:[],step:0,ans:{}};
dec.issues=dec.issues.filter(id=>ISS[id]);if(!dec.ans||typeof dec.ans!=="object")dec.ans={};
const save=()=>store("pdk3_dec",dec);
const MAXI=4;
const lastStep=()=>dec.issues.length+1;
let ftab="issue",hst="ach",chCat="all";
let cmp=store("pdk4_cmp");cmp=(Array.isArray(cmp)?cmp:[]).filter(id=>ITEMS[id]).slice(0,3);if(cmp.length<2)cmp=["upa","nda"];
let pf={side:"all",terms:[],st:[],iss:"all",q:""};

/* ---------- shared pieces ---------- */
const sh=(h,sub,all)=>`<div class="sh"><h2>${h}</h2>${all||""}${sub?`<p>${sub}</p>`:""}</div>`;
function gcard(id){
  const it=ITEMS[id],c=tally(it.terms),tot=sum(c);
  return `<article class="card gcard ${it.al}"><div class="top">${face(it,"md")}<div><b>${it.name}${it.ongoing?' <span class="badge-live">Ongoing</span>':""}</b><span>${it.span} · ${SL[it.al]}</span></div></div>
    <div class="body"><div class="price"><b data-n="${c.ach}">${c.ach}</b><span class="muted">of ${tot} promises kept in full</span></div>${statusBar(c)}
    <div class="specs"><span>PM ${it.pm}</span><span>${it.seats} seats</span></div></div>
    <div class="foot2"><a class="btn btn-o btn-s" href="#gov-${id}">View details</a><a class="btn btn-g btn-s" href="#compare-${id}-${PAIR[id]}">Compare</a></div></article>`;
}
function vsCard(a,b){
  const A=ITEMS[a],B=ITEMS[b];
  const side=it=>`<div class="vs-side">${face(it,"lgf")}<b>${it.name}</b><span>${it.span}</span></div>`;
  return `<a class="card vs" href="#compare-${a}-${b}"><div class="vs-pair">${side(A)}<span class="vs-mid" aria-hidden="true">VS</span>${side(B)}</div><span class="go">Compare ${A.name} vs ${B.name}</span></a>`;
}
const PRESETS=[["upa","nda"],["upa1","nda1"],["upa2","nda2"],["upa1","upa2"],["nda1","nda2"],["nda2","nda3"]];
function issueMeta(i){const np=P.filter(p=>p.iss.includes(i.id)).length,nm=i.ms.length+(i.extra||[]).length;
  return [np?`${np} promise${np===1?"":"s"}`:"",nm?`${nm} measure${nm===1?"":"s"}`:""].filter(Boolean).join(" · ")}
function tile(i){return `<a class="card tile" href="#issue-${i.id}"><span class="ic">${ico(i.id)}</span><b>${esc(i.n)}</b><span class="hi" lang="hi">${i.hi}</span><span class="meta">${issueMeta(i)}</span></a>`}
function pcard(p){const t=T[p.t];return `<article class="card pcard st-${p.s}">${pill(p.s)}<span class="t">${esc(p.p)}</span><span class="m"><span class="al ${t.al}">${t.name}</span> · ${MANI_LABEL[p.m]}</span><span class="e">${esc(p.e)}</span></article>`}
const banner=()=>`<section class="wrap sec"><div class="banner"><div><h2>Still not sure whom to vote for?</h2><p>Pick up to ${MAXI} issues that matter to you. See both sides one issue at a time, and make your own call on each. About 3 minutes, no sign-up.</p>
  <ol class="steps3"><li>Choose your issues</li><li>Compare record, promises and new promises</li><li>Get a summary of your own answers</li></ol></div>
  <a class="btn btn-p" href="#decide">Help me decide →</a></div></section>`;
const FAQ=[
  ["How are promises judged?",`Each promise is checked against its own target and deadline, using official data, Parliament answers and news reports. Results are Kept, Partly kept, Not kept, Disputed (official claims and independent data disagree) or Still in progress. Only promises with a number, a deadline or a clearly checkable result are tracked. <a href="#about">Full method</a>.`],
  ["Why only Congress and BJP?","They have led every central government since 2004: the Congress-led UPA from 2004 to 2014 and the BJP-led NDA since 2014. Allies and regional parties matter too, but they haven't led a central government in this period."],
  ["Why compare whole decades?","Each side governed for about ten years. You can also compare single five-year terms on the Compare page. Remember that the 2008-09 global financial crisis hit the UPA years and COVID-19 hit the NDA years."],
  ["Does this site tell me whom to vote for?","No. There are no overall scores or winners. “Better” is marked only on a single yearly measure, and the Help me decide summary is built only from your own answers."],
  ["Where does the data come from?",`The World Bank, IMF, RBI, government ministries, NITI Aayog, Parliament answers, and the parties' own manifestos. Every number and promise links to its source. <a href="#about">See all sources</a>.`],
  ["How do I check the candidates in my constituency?",`You vote for a candidate, not directly for a party. <a href="https://www.myneta.info/" target="_blank" rel="noopener">MyNeta</a> (by ADR) shows each candidate's criminal cases, assets and education from their sworn affidavits.`]
];
const faqHtml=()=>`<div class="faq">${FAQ.map(([q,a])=>`<details class="card"><summary>${q}</summary><div>${a}</div></details>`).join("")}</div>`;

/* ---------- home ---------- */
function finder(){
  const tabs=[["issue","Issue"],["gov","Government"],["search","Search"]];
  let body;
  if(ftab==="issue")body=`<div class="field"><label for="fi">Choose an issue</label><select id="fi">${ISSUES.map(i=>`<option value="${i.id}">${esc(i.n)} · ${i.hi}</option>`).join("")}</select></div>
    <button class="btn btn-p" data-fgo="issue">Compare on this issue</button>`;
  else if(ftab==="gov")body=`<div class="field"><label for="fg">Choose a government</label><select id="fg">${ORDER.map(id=>`<option value="${id}">${ITEMS[id].name}, ${ITEMS[id].span}${id.length>3?"":" (all ten years)"}</option>`).join("")}</select></div>
    <button class="btn btn-p" data-fgo="gov">View details</button>`;
  else body=`<form class="field" id="fsearch" role="search"><label for="fq">Search promises, schemes or issues</label><input id="fq" type="search" placeholder="e.g. GST, MGNREGA, highways" autocomplete="off"></form>
    <button class="btn btn-p" type="submit" form="fsearch">Search</button>`;
  return `<div class="card finder" id="finder"><h2>Find what matters to you</h2>
    <div class="ftabs" role="tablist" aria-label="Find by">${tabs.map(([k,l])=>`<button role="tab" aria-selected="${ftab===k}" data-ftab="${k}">${l}</button>`).join("")}</div>
    ${body}<p class="alt">Not sure where to start? <a href="#decide">Let us guide you</a></p></div>`;
}
function homeProm(){const list=P.filter(p=>p.s===hst);
  return `<div class="hscroll">${list.map(pcard).join("")}</div>`}
let h2h="prom";
const H2H=["prom","gdp","inf","fd","gfcf","hlth","edu"];
function h2hBox(){
  let rows,unit,best=null;
  if(h2h==="prom"){rows=["upa","nda"].map(sd=>{const c=tally(ITEMS[sd].terms),t=sum(c);return {sd,v:c.ach/t*100,lab:`${Math.round(c.ach/t*100)}%`,sub:`${c.ach} of ${t} kept in full`}});
    unit="Share of tracked promises kept in full, completed terms only. Promises differ in size, so this is not an overall score."}
  else{const m=MS[h2h];rows=["upa","nda"].map(sd=>{const st=sideStat(m,sd);return {sd,v:st?st.avg:null,lab:st?fmt(st.avg,m.d):"No data",sub:st&&st.n<st.of?`${st.n} of ${st.of} years with data`:"average a year"}});
    unit=`${esc(m.q)} ${esc(m.n)}, ${esc(m.u)} · ${m.dir>0?"higher":"lower"} is better.${m.note?" "+esc(m.note):""}`;
    const [a,b]=rows;if(a.v!=null&&b.v!=null&&a.v!==b.v)best=(m.dir>0?a.v>b.v:a.v<b.v)?"upa":"nda"}
  const max=Math.max(...rows.map(r=>Math.abs(r.v||0)))||1;
  return `<div class="pills" role="group" aria-label="Measure">${H2H.map(k=>`<button data-h2h="${k}" aria-pressed="${h2h===k}">${k==="prom"?"Promises kept":esc(MS[k].n)}</button>`).join("")}</div>
    <div class="h2h-rows">${rows.map(r=>{const it=ITEMS[r.sd];return `<div class="h2h-row ${r.sd}"><a class="h2h-who" href="#gov-${r.sd}">${face(it,"md")}<span><b>${SL[r.sd]}</b><small>${SY[r.sd]} · PM ${it.pm}</small></span></a>
      <div class="h2h-track"><i data-w="${r.v==null?0:Math.abs(r.v)/max*100}"></i></div><div class="h2h-v"><b>${r.lab}</b><small>${r.sub}</small>${best===r.sd?'<span class="better">✓ Better</span>':""}</div></div>`}).join("")}</div>
    <p class="small muted">${unit}</p>`;
}
function vHome(){
  const c=tally(TERMS.filter(t=>!t.ongoing).map(t=>t.id));
  const inProg=dec.issues.length&&dec.step>0;
  return `${XT().homeTop?XT().homeTop():""}<section class="hero"><div class="wrap hero-in">
    <div class="hero-copy">
      <p class="eyebrow">India's governments since 2004, side by side</p>
      <h1>Compare before you vote</h1>
      <p class="lede">See what the Congress-led and BJP-led governments promised, what they delivered, how the country did while they were in power, and what they promise now. Every claim has a source.</p>
    </div>
    ${finder()}
    <div class="hero-extra">
      <div class="duel">${["upa","nda"].map((sd,i)=>{const it=ITEMS[sd],cc=tally(it.terms);return `${i?'<span class="duel-vs" aria-hidden="true">VS</span>':""}<a class="duel-card ${sd}" href="#gov-${sd}">${face(it,"xl")}<span class="duel-t"><b>${SL[sd]}</b><span>${SIDES[sd].span} · PM ${it.pm}</span><span class="duel-k"><b data-n="${cc.ach}">${cc.ach}</b> of ${sum(cc)} promises kept${sd==="nda"?" (2014–24)":""}</span></span></a>`}).join("")}</div>
      <div class="statrow"><div><b data-n="${TERMS.length}">${TERMS.length}</b><span>governments</span></div><div><b data-n="${P.length}">${P.length}</b><span>promises tracked</span></div><div><b data-n="${M.length}">${M.length}</b><span>progress measures</span></div><div><b data-n="${NOW2.length}">${NOW2.length}</b><span>2024 promises</span></div></div>
      ${inProg?`<p class="small">You have a guided comparison in progress. <a class="linkbtn" href="#decide">Continue where you left off</a></p>`:""}
    </div>
  </div></section>
  <section class="wrap sec">${sh("Head to head",`Tap a measure to compare ten years of each side. Bars show the value; <span class="better">✓ Better</span> appears only on yearly rates where the data says which was higher or lower.`)}
    <div class="card h2h" id="h2h">${h2hBox()}</div></section>
  <section class="wrap sec">${sh("Compare to decide","Pick a match-up to see promises kept and key numbers side by side.",`<a class="all" href="#compare">Build your own →</a>`)}
    <div class="vsgrid">${PRESETS.map(([a,b])=>vsCard(a,b)).join("")}</div></section>
  <section class="wrap sec">${sh("Browse by issue","Choose what matters in your life. Each issue page shows both sides' record, past promises and 2024 promises.",`<a class="all" href="#issues">All issues →</a>`)}
    <div class="tiles">${ISSUES.map(tile).join("")}</div></section>
  <section class="wrap sec">${sh("Governments since 2004",`Across the four completed terms, ${c.ach} of ${sum(c)} tracked promises were kept in full.`,`<a class="all" href="#compare">Compare terms →</a>`)}
    <div class="hscroll">${TERMS.map(t=>gcard(t.id)).join("")}</div></section>
  <section class="wrap sec">${sh("Promise tracker","Measurable promises from the winning side's manifesto, and what happened.",`<a class="all" href="#promises" id="hall">View all ${P.length} →</a>`)}
    <div class="pills" role="group" aria-label="Filter by result">${Object.keys(ST).map(k=>`<button data-hst="${k}" aria-pressed="${hst===k}">${ST[k].l} (${P.filter(p=>p.s===k).length})</button>`).join("")}</div>
    <div id="hprom">${homeProm()}</div></section>
  <section class="wrap sec">${sh("Promises to watch","Deadlines coming up for the current government.",`<a class="all" href="#promises/nda3">Current term →</a>`)}
    <div class="hscroll">${WATCH.filter(w=>w.p).map(w=>`<article class="card wcard"><span class="when">Due: ${esc(w.w)}</span><b>${esc(w.t)}</b><span class="tags">${pill(w.p.s)}</span><span class="s">${esc(w.p.e)}</span>${link(w.p.src[0][1],"Source: "+w.p.src[0][0])}</article>`).join("")}</div></section>
  ${banner()}
  <section class="wrap sec">${sh("Latest updates","Recent developments on tracked promises, with sources.")}
    <div class="hscroll">${NEWS.map(n=>`<article class="card ncard"><span class="date">${esc(n.d)}</span><b>${esc(n.t)}</b><span class="s">${esc(n.s)}</span>${link(n.src[1],"Source: "+n.src[0])}</article>`).join("")}</div></section>
  <section class="wrap sec narrow" style="margin-inline:auto">${sh("Frequently asked questions")}${faqHtml()}</section>`;
}

/* ---------- issue content (shared by issue pages and the guided flow) ---------- */
function measureCard(m){
  const a=sideStat(m,"upa"),b=sideStat(m,"nda");
  let duo,verdict="";
  if(m.kind==="flow"){
    const vals=[a,b].filter(Boolean).map(s=>Math.abs(s.avg));const max=Math.max(...vals,0)||1;
    const cell=(s,sd)=>s?`<div class="side ${sd}"><span class="k">${logo(sd)}${SL[sd]}, ${SY[sd]}</span><span class="v">${fmt(s.avg,m.d)}</span><span class="bar1"><i style="width:${Math.abs(s.avg)/max*100}%"></i></span><span class="s">average a year${s.n<s.of?` · ${s.n} of ${s.of} years have data`:""}</span></div>`
      :`<div class="side ${sd}"><span class="k">${logo(sd)}${SL[sd]}, ${SY[sd]}</span><span class="v muted">No data</span><span class="s">Not measured in these years</span></div>`;
    duo=cell(a,"upa")+cell(b,"nda");
    if(a&&b&&a.avg!==b.avg){const bt=(m.dir>0?a.avg>b.avg:a.avg<b.avg)?"upa":"nda";verdict=`<p class="verdict"><span class="better">✓ Better</span> on this measure: <b>${SL[bt]}</b> <span class="muted">(${m.dir>0?"higher":"lower"} is better)</span></p>`}
    else if(!a||!b)verdict=`<p class="verdict muted">Only one side's years have data, so they can't be compared.</p>`;
  }else{
    const cell=(s,sd)=>{if(!s)return `<div class="side ${sd}"><span class="k">${logo(sd)}${SL[sd]}, ${SY[sd]}</span><span class="v muted">No data</span></div>`;
      if(s.end==null)return `<div class="side ${sd}"><span class="k">${logo(sd)}${SL[sd]}, ${SY[sd]}</span><span class="v">${fmt(s.start,m.d)}</span><span class="s">${yl(s.startY,m)} only</span></div>`;
      const dv=s.end-s.start;return `<div class="side ${sd}"><span class="k">${logo(sd)}${SL[sd]}, ${SY[sd]}</span><span class="v">${fmt(s.start,m.d)} → ${fmt(s.end,m.d)}</span><span class="s">${dv>0?"Up":"Down"} ${fmt(Math.abs(dv),m.d)} (${yl(s.startY,m)} to ${yl(s.endY,m)})</span></div>`};
    duo=cell(a,"upa")+cell(b,"nda");
    verdict=`<p class="verdict muted">${m.dir>0?"Higher":"Lower"} is better. This changes slowly over decades, so compare how far it moved in each period, not where it ended.</p>`;
  }
  return `<article class="card mc"><h3>${esc(m.q)}${m.interp?'<span class="warnflag">Estimated</span>':""}<span class="u">${esc(m.n)} · ${esc(m.u)}</span></h3>
    <div class="duo">${duo}</div>${verdict}${XT().measureExtra?XT().measureExtra(m):""}
    <details data-chart="${m.id}"><summary>Year-by-year chart and source</summary><div class="chartbox" id="ch-${m.id}"></div>
    <p style="margin-top:8px">${m.note?esc(m.note)+" ":""}Source: ${link(S[m.src].u,S[m.src].t)}.</p></details></article>`;
}
const EXTRA={
  nh:()=>`<article class="card mc"><h3>How long is the national highway network?<span class="u">km, from the Ministry of Road Transport and Highways</span></h3>
    <div class="duo"><div class="side upa"><span class="k">${SL.upa}, ${SY.upa}</span><span class="v">65,569 → 91,287</span><span class="s">Up 25,718 km (2004 to 2014)</span></div>
    <div class="side nda"><span class="k">${SL.nda}, 2014–25</span><span class="v">91,287 → 1,46,560</span><span class="s">Up 55,273 km (2014 to 2025)</span></div></div>
    <p class="verdict muted">Part of the growth is state roads being renamed national highways.</p>
    <details><summary>Sources</summary><p>${link(S.nh04.u,"2004 figure")} · ${link(S.nh25.u,"2014 and 2025 figures")}</p></details></article>`,
  rail:()=>`<article class="card mc"><h3>How much of the railway runs on electricity?<span class="u">Broad-gauge network</span></h3>
    <p>99.2% electrified by November 2025. 46,900 route km were electrified from 2014 to 2025; the 2004–14 pace was about 1.4 km a day.</p>
    <details><summary>Source</summary><p>${link(S.rail.u,S.rail.t)}</p></details></article>`,
  mpi:()=>`<article class="card mc"><h3>Fewer people poor on health, schooling and living standards?<span class="u">NITI Aayog multidimensional poverty, % of people</span></h3>
    <p><b class="fig">29.17%</b> in 2013-14 → <b class="fig">11.28%</b> in 2022-23. There is no matching figure for the UPA decade on this page. Both figures were estimated from growth between survey years.</p>
    <details><summary>Source</summary><p>${link(S.niti.u,S.niti.t)}</p></details></article>`
};
function promList(sd,iss){
  const list=P.filter(p=>T[p.t].al===sd&&p.iss.includes(iss));
  if(!list.length)return `<p class="empty">No measurable promise on this was tracked for this side.</p>`;
  return `<ul class="plist2">${list.map(p=>`<li><div class="tags">${pill(p.s)}<span class="m">${T[p.t].name} · ${MANI_LABEL[p.m]}</span></div>
    <span class="t">${esc(p.p)}</span><span class="e">${esc(p.e)}</span>
    <details><summary>Sources</summary>Promise: ${link(S[p.m].u,S[p.m].t)}${p.src.map(s=>`<br>What happened: ${link(s[1],s[0])}`).join("")}</details></li>`).join("")}</ul>`;
}
function nowStatus(x){return x.sd==="nda"?(x.st?pill(x.st):`<span class="pill st-na">Not tracked yet</span>`):`<span class="pill st-na">In opposition: can't be tested yet</span>`}
function nowItem(x){
  return `<li><div class="tags">${nowStatus(x)}${x.also?`<span class="tag">${esc(x.also)}</span>`:""}</div><span class="t">${esc(x.p)}</span>
    ${x.ev?`<span class="m">${esc(x.ev)}</span>`:""}${x.shared?`<span class="m"><b>Note:</b> ${esc(x.shared)} ${link(S.caste.u,"Source")}</span>`:""}
    <details><summary>Source</summary>${link(S[x.src].u,S[x.src].t)}</details></li>`;
}
function nowList(sd,iss){
  const list=NOW2.filter(x=>x.sd===sd&&x.iss.includes(iss));
  if(!list.length)return `<p class="empty">No specific promise on this among the 2024 manifesto points we tracked.</p>`;
  return `<ul class="plist2">${list.map(nowItem).join("")}</ul>`;
}
function quick(iss){
  const ms=iss.ms.map(id=>MS[id]).filter(m=>m.kind==="flow");
  const cmpv=ms.map(m=>{const a=sideStat(m,"upa"),b=sideStat(m,"nda");if(!a||!b||a.avg===b.avg)return null;return (m.dir>0?a.avg>b.avg:a.avg<b.avg)?"upa":"nda"}).filter(Boolean);
  const cell=sd=>{
    const pl=P.filter(p=>T[p.t].al===sd&&p.iss.includes(iss.id)),c={ach:0,part:0,not:0,con:0,prog:0};pl.forEach(p=>c[p.s]++);
    const nw=NOW2.filter(x=>x.sd===sd&&x.iss.includes(iss.id)).length;
    const rows=[];
    if(cmpv.length)rows.push(`<li>Better on <b>${cmpv.filter(x=>x===sd).length} of ${cmpv.length}</b> yearly ${cmpv.length>1?"measures":"measure"} here</li>`);
    rows.push(pl.length?`<li>Past promises: ${Object.keys(c).filter(k=>c[k]).map(k=>`<b>${c[k]}</b> ${ST[k].l.toLowerCase()}`).join(", ")}</li>`:`<li>No past promise on this tracked</li>`);
    rows.push(`<li>${nw?`<b>${nw}</b> new ${nw>1?"promises":"promise"} in 2024`:"No 2024 promise on this tracked"}</li>`);
    return `<div class="side ${sd}"><span class="k">${logo(sd)}${SL[sd]}</span><ul class="qt">${rows.join("")}</ul></div>`};
  return `<section class="card glance" aria-label="At a glance"><h3>At a glance</h3><div class="duo">${cell("upa")}${cell("nda")}</div>
    <p class="muted small">Details below. Long-run measures like infant mortality aren't counted here because they improve over decades either way.</p></section>`;
}
function issueBody(iss){
  const ms=iss.ms.map(id=>MS[id]);
  return `${quick(iss)}
    <section class="blk"><div class="blk-h"><h2>Their record in power</h2><span class="q">What happened while each side governed?</span></div>
      ${iss.none?`<div class="note">${esc(iss.none)}</div>`:""}
      ${iss.ctx?`<div class="note">${esc(iss.ctx)}</div>`:""}
      ${ms.length||iss.extra?`<div class="mcards">${ms.map(measureCard).join("")}${(iss.extra||[]).map(k=>EXTRA[k]()).join("")}</div>`:""}
    </section>
    <section class="blk"><div class="blk-h"><h2>Promises they made before</h2><span class="q">Did they keep their word?</span></div>
      <div class="cols"><div class="card col upa"><div class="col-h"><b>${logo("upa")}${SL.upa}</b><span>2004 programme and 2009 manifesto</span></div>${promList("upa",iss.id)}</div>
      <div class="card col nda"><div class="col-h"><b>${logo("nda")}${SL.nda}</b><span>Manifestos of 2014, 2019 and 2024</span></div>${promList("nda",iss.id)}</div></div>
    </section>
    <section class="blk"><div class="blk-h"><h2>What they promise now</h2><span class="q">From the 2024 manifestos</span></div>
      <div class="cols"><div class="card col upa"><div class="col-h"><b>${logo("upa")}${SL.upa}</b><span>Nyay Patra 2024</span></div>${nowList("upa",iss.id)}</div>
      <div class="card col nda"><div class="col-h"><b>${logo("nda")}${SL.nda}</b><span>Sankalp Patra 2024</span></div>${nowList("nda",iss.id)}</div></div>
    </section>`;
}

/* ---------- guided decide flow ---------- */
function progress(){
  const n=dec.issues.length,s=dec.step;
  let label,right;
  if(s===0){label="Step 1 · Choose your issues";right=""}
  else if(s<=n){label=`Issue ${s} of ${n}`;right=esc(ISS[dec.issues[s-1]].n)}
  else{label="Your summary";right=""}
  const total=Math.max(n,1)+2;const cur=s===0?0:(s<=n?s:total-1);
  return `<div class="prog" aria-label="Progress"><div class="prog-top"><b>${label}</b><span class="muted">${right}</span></div>
    <div class="prog-track">${Array.from({length:total},(_,i)=>`<i class="${i<cur?"done":i===cur?"now":""}"></i>`).join("")}</div></div>`;
}
function vPick(){
  const n=dec.issues.length;
  return `<div class="wrap narrow flow">${progress()}
    <div style="display:grid;gap:8px"><h1 tabindex="-1" id="flowh" style="font-size:clamp(26px,3.6vw,36px);font-weight:800">What matters most to you?</h1>
    <p class="intro">Choose up to ${MAXI} issues. You'll look at each one in turn. <span lang="hi">आपके लिए क्या सबसे ज़रूरी है?</span></p></div>
    <div class="picks" role="group" aria-label="Issues">${ISSUES.map(i=>`<button class="pick" data-pick="${i.id}" aria-pressed="${dec.issues.includes(i.id)}"><span class="ic">${ico(i.id,22)}</span><b>${esc(i.n)}</b><span class="h" lang="hi">${i.hi}</span><span class="d">${esc(i.d)}</span></button>`).join("")}</div>
  </div>
  <div class="actionbar"><div class="wrap narrow in"><span class="status" id="status" aria-live="polite">${n?`${n} of ${MAXI} chosen`:"Choose at least one issue"}</span>
    <button class="btn btn-p" data-next="1" ${n?"":"disabled"}>Continue →</button></div></div>`;
}
const CH=[["upa",SL.upa],["nda",SL.nda],["same","About the same"],["unsure","Not sure"]];
function vIssue(){
  const n=dec.issues.length,iss=ISS[dec.issues[dec.step-1]],ans=dec.ans[iss.id];
  return `<div class="wrap narrow flow">${progress()}
    <div style="display:grid;gap:8px"><div class="ptitle"><span class="ic">${ico(iss.id,28)}</span><h1 tabindex="-1" id="flowh">${esc(iss.n)}<span class="hi2" lang="hi">${iss.hi}</span></h1></div><p class="intro">${esc(iss.d)}</p></div>
    ${issueBody(iss)}
    <section class="card choose" aria-labelledby="chooseh"><h2 id="chooseh">On ${esc(iss.n.toLowerCase())}, who convinced you more?</h2>
      <p class="muted small">Think about both their record and their new promises. There's no right answer.</p>
      <div class="choices" role="group" aria-labelledby="chooseh">${CH.map(([k,l])=>`<button class="choice ${k==="upa"||k==="nda"?k:""}" data-ans="${k}" aria-pressed="${ans===k}">${k==="upa"||k==="nda"?`<span class="chl" aria-hidden="true">${logo(k)}</span>`:'<span class="dot" aria-hidden="true"></span>'}${l}</button>`).join("")}</div>
    </section>
  </div>
  <div class="actionbar"><div class="wrap narrow in"><button class="btn btn-g" data-back="1">← Back</button>
    ${ans?"":`<a class="linkbtn small" href="#decide" data-jump="1">Your call ↓</a>`}
    <button class="btn btn-p" data-next="1">${ans?(dec.step===n?"See my summary":"Next issue"):"Skip for now"} →</button></div></div>`;
}
function vResult(){
  const c={upa:0,nda:0,same:0,unsure:0};dec.issues.forEach(id=>{c[dec.ans[id]||"unsure"]++});
  const col={upa:"var(--upa)",nda:"var(--nda)",same:"var(--s-prog)",unsure:"var(--rule2)"};
  const name={upa:SL.upa,nda:SL.nda,same:"About the same",unsure:"Not sure or skipped"};
  let line;
  if(c.upa>c.nda)line=`On the issues you picked, you leaned towards <b>${SL.upa}</b> on ${c.upa} and <b>${SL.nda}</b> on ${c.nda}.`;
  else if(c.nda>c.upa)line=`On the issues you picked, you leaned towards <b>${SL.nda}</b> on ${c.nda} and <b>${SL.upa}</b> on ${c.upa}.`;
  else if(c.upa)line=`You're evenly split: ${c.upa} issue${c.upa>1?"s":""} each.`;
  else line=`You didn't lean towards either side on the issues you picked.`;
  return `<div class="wrap narrow flow">${progress()}
    <div style="display:grid;gap:8px"><h1 tabindex="-1" id="flowh" style="font-size:clamp(26px,3.6vw,36px);font-weight:800">Your summary</h1><p class="intro">Built only from your own answers. This site doesn't score or rank anyone.</p></div>
    <div class="card tally"><p style="font-size:18px">${line}</p>
      <div class="stack" role="img" aria-label="${Object.keys(c).filter(k=>c[k]).map(k=>`${name[k]}: ${c[k]}`).join(", ")}">${Object.keys(c).filter(k=>c[k]).map(k=>`<i style="flex:${c[k]};background:${col[k]}"></i>`).join("")}</div>
      <div class="leg">${Object.keys(c).filter(k=>c[k]).map(k=>`<span><i style="background:${col[k]}"></i>${name[k]}: <b>${c[k]}</b></span>`).join("")}</div></div>
    <div class="card"><ul class="answers">${dec.issues.map((id,i)=>{const a=dec.ans[id];const cls=a==="upa"||a==="nda"?a:"";
      return `<li><span class="n">${esc(ISS[id].n)}</span><span style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><span class="chipc ${cls}">${a?name[a]:"Skipped"}</span><button class="linkbtn" data-goto="${i+1}">Change</button></span></li>`}).join("")}</ul></div>
    <section class="blk"><div class="blk-h"><h2>Before you vote</h2></div>
      <div class="note">You vote for a candidate in your constituency, not directly for a party or Prime Minister. Allies and regional parties, which this guide doesn't cover, can matter too.</div>
      <div class="links">
        <a class="card" href="https://www.myneta.info/" target="_blank" rel="noopener"><b>Check your candidates on MyNeta</b><span>Criminal cases, assets and education from their sworn affidavits (by ADR).</span></a>
        <a class="card" href="https://voters.eci.gov.in/" target="_blank" rel="noopener"><b>Check your name on the voter list</b><span>Election Commission Voters' Service Portal. You can also register here.</span></a>
      </div>
    </section>
    <div class="ctas"><button class="btn btn-p" data-share="1">Share this guide</button><button class="btn btn-g" data-restart="1">Start over</button><a class="btn btn-g" href="#compare">Compare governments</a></div>
    <p class="toast" id="toast" aria-live="polite"></p>
  </div>`;
}
function vDecide(){
  if(dec.step>lastStep())dec.step=lastStep();
  if(dec.step===0||!dec.issues.length){dec.step=0;return vPick()}
  if(dec.step<=dec.issues.length)return vIssue();
  return vResult();
}

/* ---------- issues ---------- */
function vIssues(){
  return `<div class="wrap page"><p class="crumbs"><a href="#home">Home</a> › Issues</p>
    <div class="phead"><h1>Browse by issue</h1><p class="intro">Pick an issue to see what each side did in power, which promises they kept, and what they promise now.</p></div>
    <div class="tiles">${ISSUES.map(i=>`<a class="card tile" href="#issue-${i.id}"><span class="ic">${ico(i.id)}</span><b>${esc(i.n)}</b><span class="hi" lang="hi">${i.hi}</span><span class="small muted">${esc(i.d)}</span><span class="meta">${issueMeta(i)}</span></a>`).join("")}</div></div>
  ${banner()}`;
}
function vIssuePage(){
  const iss=ISS[arg];const inDec=dec.issues.includes(iss.id);
  const idx=ISSUES.indexOf(iss),nx=ISSUES[(idx+1)%ISSUES.length];
  return `<div class="wrap narrow flow"><p class="crumbs"><a href="#home">Home</a> › <a href="#issues">Issues</a> › ${esc(iss.n)}</p>
    <div style="display:grid;gap:8px"><div class="ptitle"><span class="ic">${ico(iss.id,28)}</span><h1 tabindex="-1" id="flowh">${esc(iss.n)}<span class="hi2" lang="hi">${iss.hi}</span></h1></div><p class="intro">${esc(iss.d)}</p></div>
    ${issueBody(iss)}
    <div class="card choose"><h2>Weigh this up with other issues</h2><p class="muted small">Add it to Help me decide, choose a few more, and record who convinced you on each.</p>
      <div class="ctas">${inDec?`<a class="btn btn-p" href="#decide">Continue Help me decide →</a>`:`<button class="btn btn-p" data-addiss="${iss.id}">Add to Help me decide</button>`}<a class="btn btn-g" href="#issue-${nx.id}">Next issue: ${esc(nx.n)} →</a></div></div>
  </div>`;
}

/* ---------- government detail ---------- */
const KEY=["gdp","inf","gfcf","mfg","fd","debt","hlth","edu","imr","elec","net","ur"];
function cellVal(m,it){
  const s=stat(m,it.years[0],it.years[1]);
  if(!s)return {v:`<span class="muted">No data</span>`,s:m.only?"Survey began 2017-18":"Not measured"};
  if(m.kind==="flow")return {v:fmt(s.avg,m.d),s:s.n<s.of?`average, ${s.n} of ${s.of} years with data`:"average a year",avg:s.avg,n:s.n};
  if(s.end==null)return {v:fmt(s.start,m.d),s:`${yl(s.startY,m)} only`};
  const dv=s.end-s.start;return {v:`${fmt(s.start,m.d)} → ${fmt(s.end,m.d)}`,s:`${yl(s.startY,m)} to ${yl(s.endY,m)} · ${dv>0?"up":"down"} ${fmt(Math.abs(dv),m.d)}`};
}
function vGov(){
  const it=ITEMS[arg],side=it.id==="upa"||it.id==="nda";
  const c=tally(it.terms),tot=sum(c);
  const allP=P.filter(p=>it.all.includes(p.t));
  const kept=allP.filter(p=>p.s==="ach"),miss=allP.filter(p=>p.s==="part"||p.s==="not"),open=allP.filter(p=>p.s==="con"||p.s==="prog");
  const li=p=>`<li class="st-${p.s}"><i aria-hidden="true">${ST[p.s].i}</i><div>${esc(p.p)}<small>${T[p.t].name} · ${ST[p.s].l}. ${esc(p.e)}</small></div></li>`;
  const showNow=it.al==="nda"?(side||it.id==="nda3"):side;
  const subs=[["g-nums","Key numbers"],["g-prom","Promise record"]];if(showNow)subs.push(["g-now","2024 manifesto"]);if(side)subs.push(["g-terms","Terms"]);
  const extraNote=it.id==="nda"?`<p class="small muted">Plus ${P.filter(p=>p.t==="nda3").length} promises from 2024 tracked in the current term.</p>`:"";
  return `<div class="wrap"><p class="crumbs"><a href="#home">Home</a> › <a href="#compare">Governments</a> › ${it.name}</p>
    <section class="card dhead ${it.al}">${face(it,"xl")}<div><h1 tabindex="-1" id="flowh">${side?`${SL[it.al]}, ${it.span}`:`${it.name}, ${it.span}`}</h1>
      <p class="who">${side?SIDES[it.al].name+" · ":`${SL[it.al]} · `}Prime Minister ${it.pm}</p>
      <div class="chips"><span>${it.kind}</span><span>${it.seats} seats for ${it.lead}</span>${it.ongoing?"<span>Ongoing</span>":""}${side?`<span>${it.all.length} terms</span>`:""}</div></div>
      <div class="score"><span class="small muted">${side&&it.al==="nda"?"Completed terms, 2014–24":"Promise record"}</span><div class="big"><b data-n="${c.ach}">${c.ach}</b><span>of ${tot} promises kept in full</span></div>${statusBar(c)}${extraNote}
        <div class="ctas"><a class="btn btn-p btn-s" href="#compare-${it.id}-${PAIR[it.id]}">Compare with ${ITEMS[PAIR[it.id]].name}</a><a class="btn btn-g btn-s" href="#promises/${it.id}">All promises</a></div></div>
    </section></div>
  <nav class="subnav" aria-label="On this page"><div class="wrap in">${subs.map(([id,l])=>`<a href="#gov-${it.id}" data-to="${id}">${l}</a>`).join("")}</div></nav>
  <div class="wrap page">
    <section class="sec" id="g-nums">${sh("Key numbers while in office",`Data years ${it.years[0]}–${it.years[1]}${it.ongoing?" so far":""}. Yearly rates are averages; slow-moving levels show where the period started and ended.`,`<a class="all" href="#charts">All charts →</a>`)}
      <div class="card specgrid">${KEY.map(id=>{const m=MS[id],v=cellVal(m,it);return `<div class="spec"><span class="k">${esc(m.n)}</span><span class="v">${v.v}</span><span class="s">${esc(m.u)} · ${v.s}</span></div>`}).join("")}</div>
      <p class="small muted">Numbers alone don't show cause: global events like the 2008-09 financial crisis and COVID-19 affected these years. Use Compare to see them next to another government.</p></section>
    <section class="sec" id="g-prom">${sh("Promise record","Measurable promises from the manifesto, and what happened.",`<a class="all" href="#promises/${it.id}">Filter and search →</a>`)}
      <div class="pc"><div class="card"><h3><span class="pill st-ach">✓</span> Kept (${kept.length})</h3>${kept.length?`<ul>${kept.map(li).join("")}</ul>`:`<p class="empty">None in this period.</p>`}</div>
      <div class="card"><h3><span class="pill st-not">✕</span> Missed or partly kept (${miss.length})</h3>${miss.length?`<ul>${miss.map(li).join("")}</ul>`:`<p class="empty">None in this period.</p>`}</div></div>
      ${open.length?`<div class="pc"><div class="card" style="grid-column:1/-1"><h3><span class="pill st-prog">…</span> Disputed or still in progress (${open.length})</h3><ul>${open.map(li).join("")}</ul></div></div>`:""}
    </section>
    ${showNow?`<section class="sec" id="g-now">${sh(it.al==="upa"?"What Congress promises now (Nyay Patra 2024)":"What BJP promises now (Sankalp Patra 2024)",it.al==="upa"?"The Congress-led alliance is in opposition, so these promises can't be tested yet.":"The BJP-led NDA governs, so these promises can be checked as the term goes on.",`<a class="all" href="#manifesto">Both manifestos →</a>`)}
      <div class="card col ${it.al}"><ul class="plist2">${NOW2.filter(x=>x.sd===it.al).map(nowItem).join("")}</ul></div></section>`:""}
    ${side?`<section class="sec" id="g-terms">${sh("Terms")}<div class="hscroll">${it.all.map(gcard).join("")}</div></section>`:""}
  </div>`;
}

/* ---------- compare ---------- */
function vCompare(){
  const its=cmp.map(id=>ITEMS[id]);
  const opts=sel=>ORDER.map(id=>`<option value="${id}" ${id===sel?"selected":""}>${ITEMS[id].name}, ${ITEMS[id].span}</option>`).join("");
  const slots=its.map((it,i)=>`<div class="card slot">${av(it,"sm")}<b>${it.name}</b><span style="display:flex;gap:8px;align-items:center"><select data-slot="${i}" aria-label="Government ${i+1}">${opts(it.id)}</select>${its.length>2?`<button class="linkbtn small" data-rm="${i}" aria-label="Remove ${it.name}">Remove</button>`:""}</span></div>`).join("")
    +(its.length<3?`<div class="card slot empty"><span class="plus" aria-hidden="true">+</span><b>Add a third</b><select data-add="1" aria-label="Add a government"><option value="">Choose…</option>${ORDER.filter(id=>!cmp.includes(id)).map(id=>`<option value="${id}">${ITEMS[id].name}, ${ITEMS[id].span}</option>`).join("")}</select></div>`:"");
  const n=its.length;
  const row=(k,cells,sub)=>`<tr><th scope="row">${k}${sub?`<small>${sub}</small>`:""}</th>${cells.map(c=>`<td class="v${c.best?" best":""}">${c.h}</td>`).join("")}</tr>`;
  const sect=t=>`<tr class="sect"><td colspan="${n+1}">${t}</td></tr>`;
  let h=`<div class="ctable-wrap"><table class="ct" style="--n:${n}"><thead><tr><th scope="col">Government</th>${its.map(it=>`<th scope="col"><span class="thname">${face(it,"md")}<span>${it.name}<small class="muted" style="display:block;font-family:var(--f-body);font-weight:400;font-size:12.5px">${it.span}</small></span></span></th>`).join("")}</tr></thead><tbody>`;
  h+=sect("Overview");
  h+=row("Prime Minister",its.map(it=>({h:esc(it.pm)})));
  h+=row("Seats won by the lead party",its.map(it=>({h:esc(it.seats)})),"out of 543");
  h+=row("Data years used",its.map(it=>({h:`${it.years[0]}–${it.years[1]}${it.ongoing?" so far":""}`})));
  h+=sect("Promise record");
  const tl=its.map(it=>tally(it.terms));
  h+=row("Promises tracked",tl.map(c=>({h:`<b>${sum(c)}</b>`})));
  Object.keys(ST).forEach(k=>{if(tl.some(c=>c[k]))h+=row(`<span class="st-${k}" style="color:var(--sc)">${ST[k].i}</span> ${ST[k].l}`,tl.map(c=>({h:`<b>${c[k]}</b>${sum(c)?`<small>${Math.round(c[k]/sum(c)*100)}% of tracked</small>`:""}`})))});
  let cat="";
  M.forEach(m=>{
    if(m.cat!==cat){cat=m.cat;h+=sect(cat)}
    const vs=its.map(it=>cellVal(m,it));let best=null;
    if(m.kind==="flow"){const ok=vs.map(v=>v.avg!=null&&(!m.only||v.n>=2)?v.avg:null),v=ok.filter(x=>x!=null);
      if(v.length>1&&new Set(v.map(x=>x.toFixed(6))).size>1){const bv=m.dir>0?Math.max(...v):Math.min(...v);best=ok.map(x=>x!=null&&Math.abs(x-bv)<1e-9)}}
    h+=row(`${esc(m.n)}${m.interp?'<span class="warnflag">Est.</span>':""}`,vs.map((v,i)=>({h:`<b>${v.v}</b>${best&&best[i]?' <span class="better">✓ Better</span>':""}<small>${v.s}</small>`,best:best&&best[i]})),`${esc(m.u)} · ${m.kind==="flow"?(m.dir>0?"higher is better":"lower is better"):"start → end"}`);
  });
  h+=`</tbody></table></div>`;
  return `<div class="wrap page"><p class="crumbs"><a href="#home">Home</a> › Compare</p>
    <div class="phead"><h1 tabindex="-1" id="flowh">Compare governments</h1><p class="intro">Pick two or three: a whole decade or a single five-year term. Promise records and key numbers line up side by side.</p></div>
    <div class="slots">${slots}</div>
    <div class="note"><span><b>How to read this:</b> yearly rates (growth, inflation) show the average over the period, and <span class="better">✓ Better</span> marks the better average on that one measure only. Slow-moving levels (life expectancy, electricity access) show start → end, because they improve over decades whoever governs. No overall winner is given.</span></div>
    ${h}
    <p class="small muted">NDA-III covers only the years with data so far. Comparing a decade with one of its own terms counts the same years twice.</p>
    <section class="sec" style="padding-top:10px">${sh("Popular comparisons")}<div class="vsgrid">${PRESETS.map(([a,b])=>vsCard(a,b)).join("")}</div></section>
  </div>`;
}

/* ---------- promise tracker ---------- */
function vPromises(){
  const chk=(name,v,l,on)=>`<label><input type="checkbox" data-pf="${name}" value="${v}" ${on?"checked":""}>${l}</label>`;
  return `<div class="wrap page"><p class="crumbs"><a href="#home">Home</a> › Promise tracker</p>
    <div class="phead"><h1 tabindex="-1" id="flowh">Promise tracker</h1><p class="intro">${P.length} measurable promises from the manifestos of the side that won each election, and what happened. Each is judged against its own target and deadline.</p></div>
    <div class="lsearch"><input id="pq" type="search" placeholder="Search promises, e.g. GST, highways" value="${esc(pf.q)}" aria-label="Search promises"><button class="btn btn-g btn-s ftoggle" data-ftoggle="1" aria-expanded="false">Filters</button></div>
    <div class="listing">
      <aside class="card filters closed" id="filters" aria-label="Filters"><div style="display:flex;justify-content:space-between;align-items:baseline"><h3>Filters</h3><button class="linkbtn small" data-pfreset="1">Clear all</button></div>
        <div class="fgroup"><span class="fh">Side</span>${[["all","Both"],["upa",SL.upa],["nda",SL.nda]].map(([v,l])=>`<label><input type="radio" name="pside" data-pf="side" value="${v}" ${pf.side===v?"checked":""}>${l}</label>`).join("")}</div>
        <div class="fgroup"><span class="fh">Term</span>${TERMS.map(t=>chk("term",t.id,`<span class="al ${t.al}">${t.name}</span> <span class="muted small">${t.span}</span>`,pf.terms.includes(t.id))).join("")}</div>
        <div class="fgroup"><span class="fh">Result</span>${Object.keys(ST).map(k=>chk("st",k,`<span class="st-${k}" style="color:var(--sc);font-weight:700;width:14px;text-align:center">${ST[k].i}</span>${ST[k].l}`,pf.st.includes(k))).join("")}</div>
        <div class="fgroup field"><label class="fh" for="piss" style="font-size:13px">Issue</label><select id="piss" data-pf="iss"><option value="all">All issues</option>${ISSUES.map(i=>`<option value="${i.id}" ${pf.iss===i.id?"selected":""}>${esc(i.n)}</option>`).join("")}</select></div>
      </aside>
      <div style="display:grid;gap:10px;align-content:start"><p class="count" id="pcount" aria-live="polite"></p><div class="plist" id="plist"></div></div>
    </div></div>`;
}
function readPf(){
  const s=document.querySelector('input[data-pf="side"]:checked');pf.side=s?s.value:"all";
  pf.terms=[...document.querySelectorAll('input[data-pf="term"]:checked')].map(x=>x.value);
  pf.st=[...document.querySelectorAll('input[data-pf="st"]:checked')].map(x=>x.value);
  const is=$("#piss");pf.iss=is?is.value:"all";const q=$("#pq");pf.q=q?q.value:"";
}
function updateList(){
  const q=pf.q.trim().toLowerCase();
  const list=P.filter(p=>(pf.side==="all"||T[p.t].al===pf.side)&&(!pf.terms.length||pf.terms.includes(p.t))&&(!pf.st.length||pf.st.includes(p.s))&&(pf.iss==="all"||p.iss.includes(pf.iss))&&(!q||(p.p+" "+p.e).toLowerCase().includes(q)));
  const nf=(pf.side!=="all")+pf.terms.length+pf.st.length+(pf.iss!=="all");
  const tg=document.querySelector("[data-ftoggle]");if(tg)tg.textContent=nf?`Filters (${nf})`:"Filters";
  $("#pcount").textContent=`Showing ${list.length} of ${P.length} promises`;
  $("#plist").innerHTML=list.map(p=>{const t=T[p.t];return `<article class="card prom st-${p.s}"><div class="icon" aria-hidden="true">${ST[p.s].i}</div>
    <div class="meta"><span class="al ${t.al}">${t.name}</span><span>${MANI_LABEL[p.m]}</span><span>Deadline: ${esc(p.dl)}</span></div>
    <h3>${hl(p.p,q)}</h3><p class="what"><b>${ST[p.s].l}.</b> ${hl(p.e,q)}</p>
    <details><summary>Sources</summary><ul><li>Promise: ${link(S[p.m].u,S[p.m].t)}</li>${p.src.map(s=>`<li>What happened: ${link(s[1],s[0])}</li>`).join("")}</ul></details></article>`}).join("")||`<p class="empty">No promises match. <button class="linkbtn" data-pfreset="1">Clear filters</button></p>`;
}
function hl(text,q){
  if(!q)return esc(text);
  const lo=text.toLowerCase();let out="",i=0,j;
  while((j=lo.indexOf(q,i))>=0){out+=esc(text.slice(i,j))+"<mark>"+esc(text.slice(j,j+q.length))+"</mark>";i=j+q.length}
  return out+esc(text.slice(i));
}

/* ---------- charts ---------- */
let charts=[];
function vCharts(){
  charts=[];const cats=[...new Set(M.map(m=>m.cat))];
  const show=chCat==="all"?cats:[chCat];
  return `<div class="wrap page"><p class="crumbs"><a href="#home">Home</a> › Charts</p>
    <div class="phead"><h1 tabindex="-1" id="flowh">How did India do?</h1><p class="intro">Each chart runs from 2004 to the latest data. Shaded bands show who was in power: <span class="al upa">${SL.upa}</span> and <span class="al nda">${SL.nda}</span>. Dashed lines show each side's average for yearly rates.</p></div>
    <div class="pills" role="group" aria-label="Category"><button data-ccat="all" aria-pressed="${chCat==="all"}">All (${M.length})</button>${cats.map(c=>`<button data-ccat="${esc(c)}" aria-pressed="${chCat===c}">${esc(c)}</button>`).join("")}</div>
    ${show.map(c=>`<section class="topic"><h2>${esc(c)}</h2><div class="mgrid">${M.filter(m=>m.cat===c).map(m=>{
      const a=sideStat(m,"upa"),b=sideStat(m,"nda");charts.push(m);
      const box=(s,sd)=>{if(!s)return `<div class="side ${sd}"><span class="k">${SL[sd]}</span><span class="v muted">No data</span></div>`;
        if(m.kind==="flow")return `<div class="side ${sd}"><span class="k">${SL[sd]} average${s.n<s.of?` (${s.n} yrs of data)`:""}</span><span class="v">${fmt(s.avg,m.d)}</span></div>`;
        return `<div class="side ${sd}"><span class="k">${SL[sd]}</span><span class="v">${fmt(s.start,m.d)}${s.end!=null?` → ${fmt(s.end,m.d)}`:""}</span></div>`};
      return `<article class="card mcard"><div><h3>${esc(m.q)}${m.interp?'<span class="warnflag">Estimated</span>':""}</h3><div class="unit">${esc(m.n)} · ${esc(m.u)} · ${m.dir>0?"higher is better":"lower is better"}</div></div>
        <div class="duo">${box(a,"upa")}${box(b,"nda")}</div><div class="chartbox" id="ch-${m.id}"></div>
        <p class="why"><b>Why it matters:</b> ${esc(m.why)}</p><p class="caveat">${m.note?esc(m.note)+" ":""}Source: ${link(S[m.src].u,S[m.src].t)}.</p></article>`}).join("")}</div></section>`).join("")}
    ${chCat==="all"?`<section class="topic"><h2>Roads, rail and multidimensional poverty</h2><div class="mgrid">${EXTRA.nh()}${EXTRA.rail()}${EXTRA.mpi()}</div></section>`:""}
  </div>`;
}

/* ---------- 2024 manifestos ---------- */
function vManifesto(){
  const topics=[...new Set(NOW2.map(x=>x.topic))];
  const col=(sd,tp)=>{const l=NOW2.filter(x=>x.topic===tp&&x.sd===sd);return l.length?`<ul class="plist2">${l.map(nowItem).join("")}</ul>`:`<p class="empty">Nothing on this topic in the points we tracked.</p>`};
  return `<div class="wrap page"><p class="crumbs"><a href="#home">Home</a> › 2024 manifestos</p>
    <div class="phead"><h1 tabindex="-1" id="flowh">What are they promising now?</h1><p class="intro">Key promises from the two main 2024 manifestos, topic by topic. The BJP-led NDA won and governs, so its promises can be checked. The Congress-led alliance is in opposition, so its promises can't be tested yet.</p></div>
    <div class="pills" role="group" aria-label="Jump to topic">${topics.map((tp,i)=>`<button data-to="mt-${i}">${esc(tp)}</button>`).join("")}</div>
    ${topics.map((tp,i)=>`<section class="topic" id="mt-${i}"><h2>${esc(tp)}</h2><div class="cols">
      <div class="card col upa"><div class="col-h"><b>${logo("upa")}${SL.upa}</b><span>Nyay Patra 2024</span></div>${col("upa",tp)}</div>
      <div class="card col nda"><div class="col-h"><b>${logo("nda")}${SL.nda}</b><span>Sankalp Patra 2024</span></div>${col("nda",tp)}</div>
    </div></section>`).join("")}
    <div class="note"><b>Tips for reading new promises</b><ul style="margin:0;padding-left:18px;display:grid;gap:4px">
      <li>Check the track record: tags like "Also promised in 2014" point to repeats.</li>
      <li>Look for numbers and dates. A promise with a target and a deadline can be checked later.</li>
      <li>Ask what it costs. Neither manifesto prices every promise.</li>
      <li>This covers the two largest parties only.</li></ul></div>
  </div>`;
}

/* ---------- search ---------- */
function vSearch(){
  const q=arg.trim(),lq=q.toLowerCase();
  const has=s=>s.toLowerCase().includes(lq);
  let res="";
  if(q){
    const is=ISSUES.filter(i=>has(i.n+" "+i.hi+" "+i.d));
    const ps=P.filter(p=>has(p.p+" "+p.e));
    const ns=NOW2.filter(x=>has(x.p+" "+(x.ev||"")+" "+x.topic));
    const ms=M.filter(m=>has(m.n+" "+m.q+" "+m.u));
    const grp=(h,items)=>items.length?`<section class="topic"><h2>${h} (${items.length})</h2><div class="sres">${items.join("")}</div></section>`:"";
    const total=is.length+ps.length+ns.length+ms.length;
    res=`<p class="count">${total} result${total===1?"":"s"} for “${esc(q)}”</p>`
      +grp("Issues",is.map(i=>`<a class="card" href="#issue-${i.id}"><b>${hl(i.n,lq)} <span class="muted" lang="hi" style="font-weight:500">${i.hi}</span></b><span>${hl(i.d,lq)}</span></a>`))
      +grp("Past promises",ps.map(p=>`<a class="card" href="#gov-${p.t}"><b>${hl(p.p,lq)}</b><span>${T[p.t].name} · ${ST[p.s].l}. ${hl(p.e,lq)}</span></a>`))
      +grp("2024 promises",ns.map(x=>`<a class="card" href="#manifesto"><b>${hl(x.p,lq)}</b><span>${SL[x.sd]} · ${esc(x.topic)}</span></a>`))
      +grp("Measures",ms.map(m=>`<a class="card" href="#charts"><b>${hl(m.n,lq)}</b><span>${hl(m.q,lq)} · ${esc(m.u)}</span></a>`))
      +(total?"":`<p class="empty">Nothing found. Try a scheme name, an issue or a word like “farmers”.</p>`);
  }
  const sug=["GST","MGNREGA","farmers","women","highways","health","electricity","black money"];
  return `<div class="wrap page narrow" style="margin-inline:auto"><p class="crumbs"><a href="#home">Home</a> › Search</p>
    <div class="phead"><h1 tabindex="-1" id="flowh">Search</h1></div>
    <form class="lsearch" id="ssearch" role="search"><input id="sq" type="search" value="${esc(q)}" placeholder="Search promises, schemes or issues" aria-label="Search"><button class="btn btn-p btn-s" type="submit">Search</button></form>
    <div class="tags"><span class="small muted">Try:</span>${sug.map(s=>`<a class="tag" href="#search/${encodeURIComponent(s)}" style="text-decoration:none;font-size:13.5px;padding:2px 9px">${s}</a>`).join("")}</div>
    ${res}</div>`;
}

/* ---------- about ---------- */
function vAbout(){
  const used=new Map();Object.values(S).forEach(s=>used.set(s.u,s.t));P.forEach(p=>p.src.forEach(([t,u])=>{if(!used.has(u))used.set(u,t)}));
  return `<div class="wrap page"><p class="crumbs"><a href="#home">Home</a> › About</p>
    <div class="phead"><h1 tabindex="-1" id="flowh">Method and sources</h1><p class="intro">How the numbers were put together, where they come from, and where they are weak. This site is not affiliated with any party.</p></div>
    <div class="method">
      <article class="card"><h3>Which years count for which government</h3><p>Governments change in May, so each year goes to whoever held office for most of it. GDP and budget figures are financial years (April–March), shown by the year they start in.</p>
        <table class="maptable"><tr><th>Term</th><th>In office</th><th>Data years</th></tr>${TERMS.map(t=>`<tr><td>${t.name}</td><td>${t.span}</td><td class="fig">${t.years[0]}–${t.years[1]}${t.ongoing?" so far":""}</td></tr>`).join("")}</table>
        <p>"Congress (UPA) years" means 2004–2013 and "BJP (NDA) years" means 2014–2023, ten data years each.</p></article>
      <article class="card"><h3>How promises are judged</h3><ul>
        ${[["ach","The promised result happened, by the deadline if one was set."],["part","Real progress, but short of the target, late, or in a narrower form."],["not","The target was missed with little progress, or nothing happened in the term."],["con","Official claims and independent data disagree, or it depends on the measure."],["prog","The term is still running, or work is under way."]].map(([k,d])=>`<li>${pill(k)} ${d}</li>`).join("")}</ul>
        <p class="muted">Only promises with a number, a deadline or a clearly checkable result are tracked. For 2004, the UPA's Common Minimum Programme is used, the coalition's agenda drawn from the Congress manifesto. Promise wording is paraphrased.</p></article>
      <article class="card"><h3>Images</h3><p>Party election symbols and official portraits of the Prime Ministers are shown from Wikimedia Commons. The symbols belong to their parties and appear only to identify them. This site is not affiliated with any party.</p>
        <ul>${["upa","nda","Manmohan Singh","Narendra Modi"].map(k=>`<li>${link(IMG[k].page,IMG[k].what)}</li>`).join("")}</ul></article>
      <article class="card"><h3>Known weaknesses</h3><ul>
        <li>GDP for 2004–2011 uses the revised 2011-12 base series, which shows lower growth than was reported at the time.</li>
        <li>Infant and maternal mortality are modelled estimates; sanitation is interpolated between surveys.</li>
        <li>No unemployment series covers all five terms; the official survey starts in 2017-18.</li>
        <li>World Bank poverty figures exist only for survey years, and methods changed between 2011-12 and 2022-23.</li>
        <li>Highway length grows partly through reclassification of state roads.</li>
        <li>Governance scores measure perceptions from surveys and experts.</li>
        <li>Some recent figures, such as Lakhpati Didis, are the government's own claims.</li>
        <li>Promises differ in size and difficulty; counting them treats each one equally.</li>
      </ul></article>
    </div>
    <section class="sec" id="faq">${sh("Frequently asked questions")}${faqHtml()}</section>
    <section class="sec">${sh("Sources")}<ol class="srcs">${[...used].map(([u,t])=>`<li>${link(u,t)}</li>`).join("")}</ol></section>
  </div>`;
}

/* ---------- chart ---------- */
function drawChart(box,m){
  if(!box)return;const s=D[m.id],ys=Object.keys(s).map(Number).filter(y=>y>=2004).sort((a,b)=>a-b);
  const W=Math.max(280,box.clientWidth||500),H=200,pl=40,pr=12,pt=24,pb=24,x0=2004,x1=2025;
  let lo=Math.min(...ys.map(y=>s[y])),hi=Math.max(...ys.map(y=>s[y]));
  if(m.kind==="flow"&&lo>0)lo=0;
  const pad=(hi-lo)*0.08||1;lo=lo<0?lo-pad:Math.max(0,lo-pad);hi+=pad;
  const tk=nice(lo,hi,4);lo=tk[0];hi=tk[tk.length-1];
  const X=y=>pl+(y-x0)/(x1-x0)*(W-pl-pr),Y=v=>pt+(1-(v-lo)/(hi-lo))*(H-pt-pb);
  let g=`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(m.n)} from ${ys[0]} to ${ys[ys.length-1]}">`;
  [["upa",2004,2013],["nda",2014,2025]].forEach(([sd,a,b])=>{const xa=X(Math.max(x0,a-0.5)),xb=Math.min(X(b+0.5),W-pr);
    g+=`<rect x="${xa}" y="${pt-16}" width="${xb-xa}" height="${H-pb-pt+16}" fill="var(--${sd}-tint)"/>`;
    g+=`<text x="${xa+6}" y="${pt-5}" style="fill:var(--ink);font-weight:600">${SL[sd]}</text>`});
  tk.forEach(v=>{g+=`<line x1="${pl}" x2="${W-pr}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--rule)"/><text x="${pl-6}" y="${Y(v)+4}" text-anchor="end">${fmt(v,Math.abs(hi-lo)<4?1:0)}</text>`});
  if(lo<0)g+=`<line x1="${pl}" x2="${W-pr}" y1="${Y(0)}" y2="${Y(0)}" stroke="var(--muted)"/>`;
  [2004,2009,2014,2019,2024].forEach(y=>g+=`<text x="${X(y)}" y="${H-6}" text-anchor="middle">${y}</text>`);
  if(m.kind==="flow"){["upa","nda"].forEach(sd=>{const st=sideStat(m,sd);if(!st||m.only&&sd==="upa")return;const [a,b]=SIDES[sd].years;
    g+=`<line x1="${X(a-0.4)}" x2="${X(b+0.4)}" y1="${Y(st.avg)}" y2="${Y(st.avg)}" stroke="var(--${sd})" stroke-width="2" stroke-dasharray="5 4"/>`})}
  let path="",prev=null;ys.forEach(y=>{path+=(prev!=null&&y-prev===1?"L":"M")+X(y).toFixed(1)+" "+Y(s[y]).toFixed(1)+" ";prev=y});
  g+=`<path d="${path}" fill="none" stroke="var(--line)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
  const sparse=m.sparse||ys.length<12;ys.forEach(y=>{if(sparse||y===ys[ys.length-1])g+=`<circle cx="${X(y)}" cy="${Y(s[y])}" r="4" fill="var(--line)" stroke="var(--surface)" stroke-width="1.5"/>`});
  const ly=ys[ys.length-1];g+=`<text x="${X(ly)-4}" y="${Y(s[ly])-9}" text-anchor="end" style="fill:var(--ink);font-weight:500">${fmt(s[ly],m.d)}</text>`;
  g+=`<line class="xh" x1="0" x2="0" y1="${pt-16}" y2="${H-pb}" stroke="var(--muted)" stroke-dasharray="3 3" visibility="hidden"/></svg>`;
  box.innerHTML=g+`<div class="tip" hidden></div>`;
  const svg=box.querySelector("svg"),tip=box.querySelector(".tip"),xh=box.querySelector(".xh");
  const mv=ev=>{const r=svg.getBoundingClientRect(),px=(ev.clientX-r.left)*(W/r.width);let n=ys[0];ys.forEach(y=>{if(Math.abs(X(y)-px)<Math.abs(X(n)-px))n=y});
    const t=TERMS.find(t=>n>=t.years[0]&&n<=t.years[1]);xh.setAttribute("x1",X(n));xh.setAttribute("x2",X(n));xh.setAttribute("visibility","visible");
    tip.hidden=false;tip.innerHTML=`<strong class="fig">${fmt(s[n],m.d)}</strong> <span class="muted">${yl(n,m)}${t?" · "+t.name:""}</span>`;
    tip.style.left=Math.min(Math.max(0,X(n)/W*r.width-60),r.width-150)+"px";tip.style.top=(Y(s[n])/H*r.height-38)+"px"};
  svg.addEventListener("pointermove",mv);svg.addEventListener("pointerdown",mv);svg.addEventListener("pointerleave",()=>{tip.hidden=true;xh.setAttribute("visibility","hidden")});
}
function nice(lo,hi,n){const st0=(hi-lo)/n,mag=Math.pow(10,Math.floor(Math.log10(st0))),r=st0/mag,step=(r<1.5?1:r<3?2:r<7?5:10)*mag;
  const a=Math.floor(lo/step)*step,b=Math.ceil(hi/step)*step,o=[];for(let v=a;v<=b+step/2;v+=step)o.push(+v.toFixed(6));return o}

/* ---------- router & render ---------- */
const ALIAS={"explore":"home","explore-overview":"compare-upa-nda","explore-promises":"promises","explore-progress":"charts","explore-now":"manifesto","explore-terms":"compare","explore-about":"about","party-upa":"gov-upa","party-nda":"gov-nda","about-faq":"about/faq"};
function parse(){
  let h=(location.hash||"").slice(1);try{h=decodeURIComponent(h)}catch(e){}
  if(ALIAS[h]!=null)h=ALIAS[h];
  const k=h.indexOf("/");let r=k<0?h:h.slice(0,k);arg=k<0?"":h.slice(k+1);
  if(r.startsWith("compare-")){const ids=r.slice(8).split("-").filter(id=>ITEMS[id]);if(ids.length>=2){cmp=[...new Set(ids)].slice(0,3);store("pdk4_cmp",cmp)}r="compare"}
  else if(r.startsWith("issue-")){arg=r.slice(6);r=ISS[arg]?"issue":"issues"}
  else if(r.startsWith("gov-")){arg=r.slice(4);r=ITEMS[arg]?"gov":"compare"}
  if(r==="promises"){pf={side:"all",terms:[],st:[],iss:"all",q:""};
    if(ST[arg])pf.st=[arg];else if(arg==="upa"||arg==="nda")pf.side=arg;else if(T[arg])pf.terms=[arg];else if(ISS[arg])pf.iss=arg;}
  const OK=["home","decide","issues","issue","gov","compare","promises","charts","manifesto","about","search"];
  route=OK.includes(r)||XR(r)?r:"home";
}
const VIEWS={home:vHome,decide:vDecide,issues:vIssues,issue:vIssuePage,gov:vGov,compare:vCompare,promises:vPromises,charts:vCharts,manifesto:vManifesto,about:vAbout,search:vSearch};
const NAVOF={home:"home",issues:"issues",issue:"issues",compare:"compare",gov:"compare",promises:"promises",manifesto:"manifesto",charts:"charts",about:"about",decide:"decide"};
const TITLES={home:"SarkarDekho: compare before you vote",decide:"Help me decide",issues:"Browse by issue",compare:"Compare governments",promises:"Promise tracker",charts:"Charts",manifesto:"2024 manifestos",about:"Method and sources",search:"Search"};
const RM=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
const io="IntersectionObserver" in window&&!RM?new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;io.unobserve(e.target);const el=e.target;
  if(el.classList.contains("sbar")){el.classList.add("in");return}
  const n=+el.dataset.n,t0=performance.now(),D=800;el.textContent="0";const step=t=>{const q=Math.min(1,(t-t0)/D);el.textContent=Math.round(n*(1-Math.pow(1-q,3)));if(q<1)requestAnimationFrame(step)};requestAnimationFrame(step)}),{rootMargin:"0px 0px -8% 0px"}):null;
function enhance(root){
  root=root||document;
  root.querySelectorAll(".sbar:not(.in)").forEach(el=>{if(io)io.observe(el);else el.classList.add("in")});
  if(io)root.querySelectorAll("[data-n]:not(.counted)").forEach(el=>{el.classList.add("counted");io.observe(el)});
  const bars=root.querySelectorAll(".h2h-track i[data-w]");if(bars.length)requestAnimationFrame(()=>requestAnimationFrame(()=>bars.forEach(i=>{i.style.width=i.dataset.w+"%"})));
}
function render(focus){
  const app=$("#app");
  const OV=XT().view?XT().view(route,arg):null;
  app.innerHTML=OV?OV.v():(VIEWS[route]||XR(route).v)();
  const nv=NAVOF[route]||(XR(route)||{}).nav;
  document.querySelectorAll("[data-r]").forEach(a=>{if(a.dataset.r===nv)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current")});
  document.body.classList.toggle("flowmode",route==="decide");
  if(!OV&&route==="charts")charts.forEach(m=>drawChart(document.getElementById("ch-"+m.id),m));
  if(!OV&&route==="promises")updateList();
  enhance($("#app"));if(XT().after)XT().after(route,arg);
  const t=OV&&OV.t?OV.t:route==="issue"?ISS[arg].n:route==="gov"?ITEMS[arg].name+", "+ITEMS[arg].span:TITLES[route]||XR(route).t;
  document.title=route==="home"&&!OV?t:t+" · SarkarDekho";
  const hq=$("#hq");if(hq&&route!=="search")hq.value="";
  if(focus){window.scrollTo(0,0);const h=document.getElementById("flowh");if(h&&route!=="home"){if(!h.hasAttribute("tabindex"))h.setAttribute("tabindex","-1");h.focus({preventScroll:true})}
    if(route==="about"&&arg==="faq"){const f=$("#faq");if(f)f.scrollIntoView()}
    if(route==="search"&&!arg){const s=$("#sq");if(s)s.focus()}}
}
function ticker(){const n=NEWS[0];$("#ticker").innerHTML=`<div class="wrap"><span class="lbl">LATEST</span><span class="txt">${esc(n.d)}: ${esc(n.t)}</span><a class="more" href="${n.src[1]}" target="_blank" rel="noopener">Source</a></div>`}
function goStep(s){dec.step=s;save();render(true)}
const XT=()=>window.PPD_EXT||{};
const XR=r=>(XT().routes||{})[r];
const scrollTo=id=>{const el=document.getElementById(id);if(el)el.scrollIntoView({block:"start"})};
window.addEventListener("hashchange",()=>{parse();render(true)});
document.addEventListener("toggle",e=>{const d=e.target;if(d.tagName==="DETAILS"&&d.open&&d.dataset.chart){const m=MS[d.dataset.chart];drawChart(document.getElementById("ch-"+m.id),m)}},true);
document.addEventListener("submit",e=>{
  const f=e.target;let q="";
  if(f.id==="hsearch")q=$("#hq").value;else if(f.id==="fsearch")q=$("#fq").value;else if(f.id==="ssearch")q=$("#sq").value;else return;
  e.preventDefault();q=q.trim();location.hash="search/"+encodeURIComponent(q);
});
document.addEventListener("change",e=>{
  const t=e.target;
  if(t.dataset.pf){readPf();updateList();return}
  if(t.dataset.slot!=null){const i=+t.dataset.slot,v=t.value;const j=cmp.indexOf(v);if(j>=0&&j!==i)cmp[j]=cmp[i];cmp[i]=v;store("pdk4_cmp",cmp);history.replaceState(null,"","#compare-"+cmp.join("-"));render(false);return}
  if(t.dataset.add&&t.value){cmp.push(t.value);cmp=cmp.slice(0,3);store("pdk4_cmp",cmp);history.replaceState(null,"","#compare-"+cmp.join("-"));render(false);return}
});
document.addEventListener("input",e=>{if(e.target.id==="pq"){pf.q=e.target.value;updateList()}});
document.addEventListener("click",e=>{
  const t=e.target;
  const ft=t.closest("[data-ftab]");if(ft){ftab=ft.dataset.ftab;$("#finder").outerHTML=finder();const nb=document.querySelector(`[data-ftab="${ftab}"]`);if(nb)nb.focus();return}
  const fg=t.closest("[data-fgo]");if(fg){location.hash=fg.dataset.fgo==="issue"?"issue-"+$("#fi").value:"gov-"+$("#fg").value;return}
  const hs=t.closest("[data-hst]");if(hs){hst=hs.dataset.hst;document.querySelectorAll("[data-hst]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.hst===hst));$("#hprom").innerHTML=homeProm();enhance($("#hprom"));const a=$("#hall");if(a){a.href="#promises/"+hst;a.textContent=`View all ${ST[hst].l.toLowerCase()} →`}return}
  const hh=t.closest("[data-h2h]");if(hh){h2h=hh.dataset.h2h;const box=$("#h2h");const prev=[...box.querySelectorAll(".h2h-track i")].map(i=>i.style.width);box.innerHTML=h2hBox();box.querySelectorAll(".h2h-track i").forEach((i,j)=>{i.style.width=prev[j]||"0"});enhance(box);const nb=box.querySelector(`[data-h2h="${h2h}"]`);if(nb)nb.focus({preventScroll:true});return}
  const to=t.closest("[data-to]");if(to){e.preventDefault();scrollTo(to.dataset.to);return}
  const cc=t.closest("[data-ccat]");if(cc){chCat=cc.dataset.ccat;render(false);return}
  const rm=t.closest("[data-rm]");if(rm){cmp.splice(+rm.dataset.rm,1);store("pdk4_cmp",cmp);history.replaceState(null,"","#compare-"+cmp.join("-"));render(false);return}
  if(t.closest("[data-ftoggle]")){const f=$("#filters"),b=t.closest("[data-ftoggle]");f.classList.toggle("closed");b.setAttribute("aria-expanded",!f.classList.contains("closed"));return}
  if(t.closest("[data-pfreset]")){pf={side:"all",terms:[],st:[],iss:"all",q:""};const y=window.scrollY;render(false);window.scrollTo(0,y);return}
  const ai=t.closest("[data-addiss]");if(ai){const id=ai.dataset.addiss;if(!dec.issues.includes(id)){if(dec.issues.length>=MAXI)dec.issues.shift();dec.issues.push(id)}dec.step=0;save();location.hash="decide";return}
  const pk=t.closest("[data-pick]");if(pk){const id=pk.dataset.pick,i=dec.issues.indexOf(id);
    if(i>=0)dec.issues.splice(i,1);else if(dec.issues.length>=MAXI){const st=$("#status");st.textContent=`Up to ${MAXI}. Remove one first.`;st.classList.add("hint");return}else dec.issues.push(id);
    save();const y=window.scrollY;render(false);window.scrollTo(0,y);const b=document.querySelector(`[data-pick="${id}"]`);if(b)b.focus({preventScroll:true});return}
  const an=t.closest("[data-ans]");if(an){dec.ans[dec.issues[dec.step-1]]=an.dataset.ans;save();const y=window.scrollY;render(false);window.scrollTo(0,y);
    const nb=document.querySelector("[data-next]");if(nb)nb.focus({preventScroll:true});return}
  if(t.closest("[data-jump]")){e.preventDefault();const c=document.querySelector(".choose");if(c){c.scrollIntoView({block:"center"});const f=c.querySelector(".choice");if(f)f.focus({preventScroll:true})}return}
  if(t.closest("[data-next]")){goStep(Math.min(dec.step+1,lastStep()));return}
  if(t.closest("[data-back]")){goStep(Math.max(dec.step-1,0));return}
  const gt=t.closest("[data-goto]");if(gt){goStep(+gt.dataset.goto);return}
  if(t.closest("[data-restart]")){dec={issues:[],step:0,ans:{}};save();render(true);return}
  if(t.closest("[data-share]")){const url=location.origin+location.pathname;const data={title:"SarkarDekho",text:"Compare what Congress and BJP did in power, the promises they kept, and what they promise now.",url};
    const toast=m=>{const el=$("#toast");if(el)el.textContent=m};
    if(navigator.share){navigator.share(data).catch(()=>{})}
    else if(navigator.clipboard){navigator.clipboard.writeText(url).then(()=>toast("Link copied: "+url),()=>toast("Copy this link: "+url))}
    else toast("Copy this link: "+url);return}
  const nav=t.closest('a[href^="#"]');if(nav&&nav.getAttribute("href")===location.hash&&!nav.dataset.to){parse();render(true)}
});
document.addEventListener("keydown",e=>{const b=e.target.closest&&e.target.closest("[data-ftab]");if(!b||(e.key!=="ArrowRight"&&e.key!=="ArrowLeft"))return;
  e.preventDefault();const ks=["issue","gov","search"],i=ks.indexOf(ftab);ftab=ks[(i+(e.key==="ArrowRight"?1:2))%3];$("#finder").outerHTML=finder();const nb=document.querySelector(`[data-ftab="${ftab}"]`);if(nb)nb.focus()});
let rt;window.addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(()=>{
  if(route==="charts"&&!(XT().view&&XT().view(route,arg)))charts.forEach(m=>drawChart(document.getElementById("ch-"+m.id),m));
  document.querySelectorAll("details[data-chart][open]").forEach(d=>{const m=MS[d.dataset.chart];drawChart(document.getElementById("ch-"+m.id),m)})},150)});
window.PPD={esc,link,pill,fmt,store,statusBar,sh,face,av,logo,ITEMS,IMG,SL,SY,MS,ISS,sideStat,tally,ico,enhance};
function boot(){ticker();parse();render(false);if(XT().boot)XT().boot()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
