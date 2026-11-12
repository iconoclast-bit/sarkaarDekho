/* Voter platform: location, elections, Delhi, netas, local, my vote, my notes. Everything a voter saves stays in this browser. */
(function(){
"use strict";
const X=window.PPD_EXT={routes:{}};
const G=()=>window.PPD;
function st(k,v){try{if(v===undefined)return JSON.parse(localStorage.getItem(k));localStorage.setItem(k,JSON.stringify(v))}catch(e){return null}}
let loc=st("pdk_loc");if(!loc||typeof loc!=="object")loc=null;
let ops=st("pdk_ops");if(!ops||typeof ops!=="object")ops={};
let me=st("pdk_me");if(!me||typeof me!=="object")me={};
const AC=n=>ACS.find(a=>a[0]===+n);
const pcOf=n=>PCS.find(p=>p.seg.includes(+n));
const PA={BJP:{c:"pbjp",n:"BJP"},AAP:{c:"paap",n:"AAP"},INC:{c:"pinc",n:"Congress"}};
const pb=pa=>`<span class="pb ${PA[pa].c}">${PA[pa].n}</span>`;
const ds=k=>DS[k]?G().link(DS[k].u,DS[k].t):"";
const srcs=ks=>ks.map(ds).join(" · ");
const isDelhi=()=>!!(loc&&loc.state==="Delhi");
const myneta=n=>`https://www.myneta.info/search_myneta.php?q=${encodeURIComponent(n)}`;
const crumbs=t=>`<p class="crumbs"><a href="#home">Home</a> › ${t}</p>`;

/* ---------- +/- opinions ---------- */
function op(key,label){const v=(ops[key]||{}).v||0;
  return `<span class="op" data-op="${key}" data-opl="${G().esc(label)}" role="group" aria-label="Your view on ${G().esc(label)}"><button data-opv="1" aria-pressed="${v===1}"><b>+</b> Matters to me</button><button data-opv="-1" aria-pressed="${v===-1}"><b>−</b> Not convinced</button></span>`}
X.op=op;X.getLoc=()=>loc;X.setLoc=v=>{loc=v;st("pdk_loc",v)};
X.measureExtra=m=>`${companions(m)}<div class="opline">${op("m:"+m.id,m.n)}</div>`;

/* ---------- read-it-with companions for national measures ---------- */
const COMP={gdp:["gdppc","inf","gfcf"],inf:["gdp"],ur:["flfpr","gfcf","mfg"],gfcf:["gdp","fdi"],mfg:["exp","gfcf"],fd:["rd","debt"],rd:["fd","debt"],debt:["fd","gdp"],hlth:["imr","mmr","le"],imr:["hlth","mmr"],edu:["gdppc"],elec:["sani","net"]};
function cval(id,sd){const g=G(),m=g.MS[id];if(!m)return "";const s=g.sideStat(m,sd);if(!s)return "no data";
  if(m.kind==="flow")return g.fmt(s.avg,m.d);return s.end!=null?`${g.fmt(s.start,m.d)} → ${g.fmt(s.end,m.d)}`:g.fmt(s.start,m.d)}
function companions(m){const g=G(),list=(COMP[m.id]||[]).filter(id=>g.MS[id]);
  let w="";if(m.id==="gdp"){const av=(a,b)=>{let t=0,n=0;for(let y=a;y<=b;y++)if(WGDP[y]!=null){t+=WGDP[y];n++}return t/n};
    const wu=av(2004,2013),wn=av(2014,2023),iu=g.sideStat(m,"upa").avg,inn=g.sideStat(m,"nda").avg;
    w=`<li><b>World economy</b> (calendar years): ${g.fmt(wu,1)}% a year in 2004–13, ${g.fmt(wn,1)}% in 2014–23. India grew <b>${g.fmt(iu-wu,1)}</b> and <b>${g.fmt(inn-wn,1)}</b> points faster than the world. <span class="muted">${ds("wbw")}</span></li>`}
  if(!list.length&&!w)return "";
  return `<div class="comp"><b class="comp-h">Read it with</b><ul>${list.map(id=>{const c=g.MS[id];return `<li><b>${g.esc(c.n)}</b> <span class="muted">(${g.esc(c.u)}${c.kind==="flow"?", average":""})</span>: ${G().SL.upa} ${cval(id,"upa")} · ${G().SL.nda} ${cval(id,"nda")}</li>`}).join("")}${w}</ul></div>`;
}

/* ---------- location ---------- */
function locSheet(){const d=loc&&loc.state==="Delhi";
  return `<div class="sheet-bg" id="locsheet"><div class="sheet card" role="dialog" aria-modal="true" aria-labelledby="loch">
    <button class="sheet-x" data-locclose="1" aria-label="Close">×</button>
    <h2 id="loch">Where do you vote?</h2>
    <p class="muted small">We'll show your elections, your representatives and what has changed where you live. Saved only on this device.</p>
    <button class="btn btn-o" data-locate="1"><span aria-hidden="true">📍</span> Locate me</button>
    <p class="small muted" id="locmsg">Uses your browser's location and BigDataCloud to work out your state. We don't store your location.</p>
    <div class="field"><label for="lstate">State or union territory</label><select id="lstate"><option value="">Choose…</option>${STATES.map(s=>`<option ${loc&&loc.state===s?"selected":""}>${s}</option>`).join("")}</select></div>
    <div class="field" id="lacw" ${d?"":"hidden"}><label for="lac">Your assembly constituency (optional)</label><select id="lac"><option value="">Not sure</option>${ACS.map(a=>`<option value="${a[0]}" ${loc&&+loc.ac===a[0]?"selected":""}>${a[0]}. ${a[1]}</option>`).join("")}</select>
      <span class="small muted">Not sure? Your voter ID or the ${ds("esr")} shows it.</span></div>
    <div class="ctas"><button class="btn btn-p" data-locsave="1">Show my elections</button><button class="btn btn-g" data-locclose="1">Skip for now</button></div>
  </div></div>`}
function openLoc(){closeLoc();document.body.insertAdjacentHTML("beforeend",locSheet());document.body.classList.add("noscroll");const s=document.getElementById("lstate");if(s)s.focus()}
function closeLoc(){const e=document.getElementById("locsheet");if(e)e.remove();document.body.classList.remove("noscroll")}
function locate(){const msg=document.getElementById("locmsg");
  if(!navigator.geolocation){msg.textContent="Your browser can't share location. Please choose from the list.";return}
  msg.textContent="Finding you…";
  navigator.geolocation.getCurrentPosition(p=>{
    fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${p.coords.latitude.toFixed(3)}&longitude=${p.coords.longitude.toFixed(3)}&localityLanguage=en`).then(r=>r.json()).then(j=>{
      const name=(j.principalSubdivision||"").replace(/^National Capital Territory of /,"");
      const hit=STATES.find(s=>s.toLowerCase()===name.toLowerCase());
      if(j.countryCode!=="IN"||!hit){msg.textContent=`You seem to be outside India's states (${j.countryName||"unknown"}). Please choose from the list.`;return}
      const sel=document.getElementById("lstate");sel.value=hit;sel.dispatchEvent(new Event("change",{bubbles:true}));
      msg.textContent=`Found: ${hit}${j.city?" ("+j.city+")":""}. Check it's right, then continue.`;
    }).catch(()=>{msg.textContent="Couldn't look up your state. Please choose from the list."})
  },()=>{msg.textContent="Location permission was refused. Please choose from the list."},{timeout:10000,maximumAge:600000})}

/* ---------- personalised home ---------- */
X.homeTop=()=>{
  if(!loc||!loc.state)return `<section class="wrap you"><div class="card youbar"><span class="yico" aria-hidden="true">📍</span><div><b>See your elections, your representatives and what has changed where you live</b><span class="muted small">Choose where you vote. Saved only on this device.</span></div><button class="btn btn-p btn-s" data-locopen="1">Choose location</button></div></section>`;
  const a=isDelhi()&&loc.ac?AC(loc.ac):null,pc=a?pcOf(a[0]):null;
  const head=`<div class="you-h"><b><span aria-hidden="true">📍</span> ${G().esc(loc.state)}${a?" · "+G().esc(a[1]):""}</b><button class="linkbtn small" data-locopen="1">Change</button></div>`;
  if(!isDelhi()){const sx=SELX.find(x=>x[0]===loc.state);
    return `<section class="wrap you">${head}<div class="you-grid">
      <article class="card yc"><h3>Coming up</h3><ul class="yl">${sx?`<li><b>${sx[0]} Assembly</b><span>${sx[1]} · now governed by ${sx[2]}</span></li>`:""}<li><b>Lok Sabha</b><span>Due by mid-2029</span></li></ul><a class="small" href="#elections">All elections →</a></article>
      <article class="card yc"><h3>Full ${G().esc(loc.state)} coverage is coming</h3><p class="small muted">We cover the Centre and Delhi in full so far. Meanwhile you can check your candidates and your name on the voter list.</p><ul class="yl"><li>${G().link(DS.myneta.u,"Candidates' affidavits on MyNeta")}</li><li>${G().link(DS.esr.u,"Find your name on the voter list")}</li></ul></article>
      <article class="card yc"><h3>Ready to vote?</h3><p class="small muted">Check you're eligible, what to carry and how to fix problems.</p><a class="btn btn-p btn-s" href="#myvote">My vote</a></article>
    </div></section>`}
  const c={ach:0,part:0,not:0,con:0,prog:0};DP.filter(p=>p.t==="bjp25").forEach(p=>c[p.s]++);
  return `<section class="wrap you">${head}<div class="you-grid">
    <article class="card yc"><h3>Coming up for you</h3><ul class="yl">${DELX.map(e=>`<li><b>${G().esc(e.t)}</b><span>${G().esc(e.when)} · <a href="${e.go}">${G().esc(e.cta)}</a></span></li>`).join("")}</ul><a class="small" href="#elections">All elections →</a></article>
    <article class="card yc"><h3>Your representatives</h3>${a?`<ul class="yl"><li><b>${G().esc(a[2])}</b><span>MLA, ${G().esc(a[1])} · ${pb(a[3])}</span></li><li><b>${G().esc(pc.mp)}</b><span>MP, ${G().esc(pc.n)} · ${pb(pc.pa)}</span></li><li><b>Rekha Gupta</b><span>Chief Minister · ${pb("BJP")}</span></li></ul><a class="small" href="#netas">Check their records →</a>`:`<p class="small muted">Pick your assembly constituency to see your MLA and MP.</p><button class="btn btn-o btn-s" data-locopen="1">Pick constituency</button>`}</article>
    <article class="card yc"><h3>Latest in Delhi</h3><ul class="yl">${DNEWS.slice(0,3).map(n=>`<li><b>${G().esc(n.t)}</b><span>${n.d} · ${G().link(DS[n.src].u,"Source")}</span></li>`).join("")}</ul><a class="small" href="#home" data-dto="d-news">All updates →</a></article>
    <article class="card yc"><h3>The current government so far</h3><p class="small muted">BJP, since Feb 2025: its 2025 promises we track</p>${G().statusBar(c)}<a class="small" href="#promises">See each promise →</a></article>
  </div></section>`;
};

/* ---------- elections ---------- */
function ics(title,date,desc){const d=date.replace(/-/g,""),stamp=new Date().toISOString().replace(/[-:]/g,"").slice(0,15)+"Z";
  const body=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//SarkarDekho//EN","BEGIN:VEVENT","UID:"+d+"-"+Math.random().toString(36).slice(2)+"@sarkardekho","DTSTAMP:"+stamp,"DTSTART;VALUE=DATE:"+d,"SUMMARY:"+title,"DESCRIPTION:"+desc,"BEGIN:VALARM","TRIGGER:-P1D","ACTION:DISPLAY","DESCRIPTION:"+title,"END:VALARM","END:VEVENT","END:VCALENDAR"].join(String.fromCharCode(13,10));
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([body],{type:"text/calendar"}));a.download=title.replace(/[^a-z0-9]+/gi,"-").toLowerCase()+".ics";document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
const remBtn=e=>e.date?`<button class="btn btn-g btn-s" data-ics="${e.k}">Add reminder</button>`:"";
function ecard(e){return `<article class="card ecard"><span class="tag">${G().esc(e.lvl)}</span><b>${G().esc(e.t)}</b><span class="when">${G().esc(e.when)}</span><span class="small muted">${G().esc(e.last)}</span><span class="small">${ds(e.src)}</span><div class="ctas"><a class="btn btn-o btn-s" href="${e.go}">${G().esc(e.cta)}</a>${remBtn(e)}</div></article>`}
function vElections(){
  const d=!loc||isDelhi();
  return `<div class="wrap page">${crumbs("Elections")}
    <div class="phead"><h1 tabindex="-1" id="flowh">When do you vote?</h1><p class="intro">Elections at every level, what happened last time, and how to decide. The Election Commission (Lok Sabha and assembly) or the State Election Commission (municipal) fixes exact dates closer to the time.</p></div>
    ${loc?"":`<div class="note"><span>Showing Delhi and the Centre. <button class="linkbtn" data-locopen="1">Choose your location</button> to personalise.</span></div>`}
    ${d?`<section class="sec"><div class="sh"><h2>Delhi</h2><p>Centre, state and local elections for Delhi voters, plus the voter list revision now under way.</p></div><div class="egrid">${DELX.map(ecard).join("")}</div></section>`:
      `<section class="sec"><div class="sh"><h2>${G().esc(loc.state)}</h2></div><div class="egrid"><article class="card ecard"><span class="tag">Centre</span><b>Lok Sabha</b><span class="when">Due by mid-2029</span><span class="small muted">2024: the BJP-led NDA formed the government.</span><div class="ctas"><a class="btn btn-o btn-s" href="#decide">How to decide</a></div></article>${(SELX.find(x=>x[0]===loc.state)?[SELX.find(x=>x[0]===loc.state)]:[]).map(x=>`<article class="card ecard"><span class="tag">State</span><b>${x[0]} Legislative Assembly</b><span class="when">${x[1]}</span><span class="small muted">Now governed by ${x[2]}.</span><span class="small">${ds("e27")}</span></article>`).join("")}</div><p class="small muted">Full state and local coverage for ${G().esc(loc.state)} is coming.</p></section>`}
    <section class="sec"><div class="sh"><h2>States voting next</h2><p>Assembly elections expected in 2027. ${ds("e27")}</p></div>
      <div class="card tablebox"><table class="st"><thead><tr><th>State</th><th>Expected</th><th>Governed now by</th></tr></thead><tbody>${SELX.map(x=>`<tr><td>${x[0]}</td><td>${x[1]}</td><td>${x[2]}</td></tr>`).join("")}</tbody></table></div></section>
    <section class="sec"><div class="banner"><div><h2>Not sure you can vote?</h2><p>Check you're eligible, find your name, and see what to carry on polling day.</p></div><a class="btn btn-p" href="#myvote">My vote →</a></div></section>
  </div>`}

/* ---------- netas ---------- */
let nf={pa:"all",pc:"all",q:""};
function nrows(){const q=nf.q.trim().toLowerCase();
  return ACS.filter(a=>(nf.pa==="all"||a[3]===nf.pa)&&(nf.pc==="all"||pcOf(a[0]).id===nf.pc)&&(!q||(a[1]+" "+a[2]).toLowerCase().includes(q)))
    .map(a=>`<tr><td>${a[0]}</td><td>${G().esc(a[1])}</td><td><b>${G().esc(a[2])}</b></td><td>${pb(a[3])}</td><td>${pcOf(a[0]).n}</td><td><a href="${myneta(a[2])}" target="_blank" rel="noopener">Records</a></td></tr>`).join("")||`<tr><td colspan="6" class="muted">No match.</td></tr>`}
function vNetas(){
  const a=isDelhi()&&loc.ac?AC(loc.ac):null,pc=a?pcOf(a[0]):null;
  const person=(n,role,pa,extra)=>`<article class="card neta"><span class="pav ${PA[pa].c}" aria-hidden="true">${n.split(" ").map(w=>w[0]).slice(0,2).join("")}</span><div><b>${G().esc(n)}</b><span class="small muted">${role}</span>${pb(pa)}${extra||""}<a class="small" href="${myneta(n)}" target="_blank" rel="noopener">Past elections, cases, assets, education →</a></div></article>`;
  return `<div class="wrap page">${crumbs("Netas")}
    <div class="phead"><h1 tabindex="-1" id="flowh">Check your netas</h1><p class="intro">Who represents you, and their records. Each "records" link opens MyNeta (by ADR), which lists every election the person has contested, with the criminal cases, assets, liabilities and education they declared on oath.</p></div>
    ${a?`<section class="sec"><div class="sh"><h2>Your representatives</h2><p>${G().esc(a[1])} assembly seat, in the ${G().esc(pc.n)} Lok Sabha seat. <button class="linkbtn" data-locopen="1">Change</button></p></div><div class="ngrid">${person(a[2],"Your MLA, "+a[1]+" (2025)",a[3])}${person(pc.mp,"Your MP, "+pc.n+" (2024)",pc.pa)}</div></section>`:
      `<div class="note"><span>${isDelhi()||!loc?`<button class="linkbtn" data-locopen="1">Pick your assembly constituency</button> to see your own MLA and MP.`:`Detailed coverage of ${G().esc(loc.state)} is coming. Below is Delhi. You can search any candidate on ${ds("myneta")}.`}</span></div>`}
    <section class="sec"><div class="sh"><h2>Who holds office in Delhi</h2><p>${srcs(["asm8","wahi"])}</p></div><div class="ngrid">
      ${person("Rekha Gupta","Chief Minister since Feb 2025 · MLA, Shalimar Bagh","BJP")}${person("Atishi Marlena","Leader of the Opposition · MLA, Kalkaji","AAP")}${person("Vijender Gupta","Speaker · MLA, Rohini","BJP")}${person("Pravesh Wahi","Mayor of Delhi since Apr 2026","BJP")}</div>
      <p class="small muted">Other ministers: Parvesh Verma, Ravinder Indraj Singh, Manjinder Singh Sirsa, Ashish Sood, Pankaj Kumar Singh and Kapil Mishra.</p></section>
    <section class="sec"><div class="sh"><h2>The 2025 assembly in numbers</h2><p>From the candidates' own affidavits, analysed by ADR. ${ds("adr")}</p></div>
      <div class="card kvrow"><div><b>31 of 70</b><span>MLAs declared criminal cases (43 in 2020)</span></div><div><b>17</b><span>declared serious cases (37 in 2020)</span></div><div><b>Rs 22 crore</b><span>average assets (Rs 14.3 crore in 2020)</span></div><div><b>64%</b><span>graduates or above</span></div><div><b>5</b><span>women MLAs (8 in 2020)</span></div></div>
      <p class="small muted">By party: 16 of the BJP's 48 MLAs and 15 of AAP's 22 declared criminal cases. A declared case is not a conviction.</p></section>
    <section class="sec"><div class="sh"><h2>All 70 MLAs</h2><p>Elected February 2025. ${ds("wk25")}</p></div>
      <div class="nfilter"><div class="pills" role="group" aria-label="Party">${[["all","All"],["BJP","BJP (48)"],["AAP","AAP (22)"]].map(([v,l])=>`<button data-npa="${v}" aria-pressed="${nf.pa===v}">${l}</button>`).join("")}</div>
        <select id="npc" aria-label="Lok Sabha seat"><option value="all">All Lok Sabha seats</option>${PCS.map(p=>`<option value="${p.id}" ${nf.pc===p.id?"selected":""}>${p.n}</option>`).join("")}</select>
        <input id="nq" type="search" placeholder="Search a name or seat" value="${G().esc(nf.q)}" aria-label="Search MLAs"></div>
      <div class="ctable-wrap"><table class="st nt"><thead><tr><th>#</th><th>Seat</th><th>MLA</th><th>Party</th><th>Lok Sabha seat</th><th></th></tr></thead><tbody id="nrows">${nrows()}</tbody></table></div></section>
    <section class="sec"><div class="sh"><h2>Delhi's 7 MPs</h2><p>Elected June 2024. ${ds("ls24")}</p></div>
      <div class="ngrid">${PCS.map(p=>person(p.mp,"MP, "+p.n,p.pa)).join("")}</div></section>
  </div>`}

/* ---------- local (MCD) ---------- */
const LOCAL=["Garbage collection","Drains and waterlogging","Local roads and potholes","Parks","Street lights","Stray animals","Property tax","Building approvals"];
function vLocal(){
  return `<div class="wrap page">${crumbs('<a href="#delhi">Delhi</a> › Local')}
    <div class="phead"><h1 tabindex="-1" id="flowh">Local: Municipal Corporation of Delhi</h1><p class="intro">Your ward councillor and the MCD handle civic services. The next MCD election is due in December 2027, run by the State Election Commission. ${srcs(["e27","sec"])}</p></div>
    <section class="sec"><div class="sh"><h2>The MCD at a glance</h2><p>${srcs(["mcdw","mcd22"])}</p></div>
      <div class="card kvrow"><div><b>250</b><span>elected wards, plus 10 nominated members</span></div><div><b>12</b><span>zones, each with a ward committee</span></div><div><b>~2 crore</b><span>people served</span></div><div><b>Dec 2027</b><span>next election due</span></div></div>
      <p class="small muted">The New Delhi Municipal Council and the Delhi Cantonment Board run their own areas and are not part of the MCD.</p></section>
    <section class="sec"><div class="sh"><h2>Who has run the MCD</h2></div>
      <div class="tline">
        <article class="card tl">${pb("AAP")}<b>Dec 2022 election</b><span>AAP 134, BJP 104, Congress 9, Independents 3. Vote share: AAP 42.1%, BJP 39.1%, Congress 11.7%.</span><span class="small muted">${ds("mcd22")}</span></article>
        <article class="card tl">${pb("AAP")}<b>2023–2025</b><span>AAP mayors.</span><span class="small muted">In May 2025, 15 AAP councillors left to form the Indraprastha Vikas Party. ${ds("ivp")}</span></article>
        <article class="card tl">${pb("BJP")}<b>Apr 2025–now</b><span>BJP mayors: Raja Iqbal Singh (2025), then Pravesh Wahi (Apr 2026).</span><span class="small muted">${srcs(["mcd22","wahi"])}</span></article>
        <article class="card tl">${pb("BJP")}<b>Dec 2025 bypolls</b><span>12 wards: BJP 7, AAP 3, Congress 1, Forward Bloc 1.</span><span class="small muted">${ds("byp")}</span></article>
      </div>
      <p class="small muted">The House now: BJP 122, AAP 102, Indraprastha Vikas Party 16, Congress 9, Forward Bloc 1. ${ds("mcdw")}</p></section>
    <section class="sec"><div class="sh"><h2>Local problems: what matters to you?</h2><p>Mark the civic issues you'll judge your councillor on. Your marks stay on this device and appear in <a href="#mynotes">My notes</a>.</p></div>
      <div class="card llist">${LOCAL.map(x=>`<div class="lrow"><b>${x}</b>${op("loc:"+x,x)}</div>`).join("")}</div>
      <p class="small muted">We haven't tracked MCD manifesto promises yet. For candidates in your ward, search ${ds("myneta")} when nominations open.</p></section>
    <section class="sec"><div class="sh"><h2>Official links</h2></div><div class="links">
      <a class="card" href="${DS.sec.u}" target="_blank" rel="noopener"><b>State Election Commission, Delhi</b><span>Runs MCD elections: ward lists, notifications and results.</span></a>
      <a class="card" href="${DS.myneta.u}" target="_blank" rel="noopener"><b>MyNeta</b><span>Councillor candidates' affidavits: cases, assets, education.</span></a></div></section>
  </div>`}

/* ---------- my vote ---------- */
let mv=st("pdk_mv");if(!mv||typeof mv!=="object")mv={};
function nextQD(){const t=new Date(),y=t.getFullYear();const ds_=[[y,0],[y,3],[y,6],[y,9],[y+1,0]].map(([a,m])=>new Date(a,m,1));return ds_.find(d=>d>t)}
function ageOn(dob,on){let a=on.getFullYear()-dob.getFullYear();const m=on.getMonth()-dob.getMonth();if(m<0||(m===0&&on.getDate()<dob.getDate()))a--;return a}
function verdict(){
  const r=mv;if(!r.cit||!r.dob||!r.res||!r.list)return "";
  const dob=new Date(r.dob),now=new Date(),age=ageOn(dob,now),qd=nextQD(),aq=ageOn(dob,qd);
  const qds=qd.toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"});
  if(r.cit==="no")return `<div class="card verdict2 bad"><h3>Only Indian citizens can vote in Indian elections</h3><p class="small muted">This includes OCI cardholders.</p></div>`;
  if(age<17)return `<div class="card verdict2 bad"><h3>Not yet</h3><p>You can apply in advance once you turn 17, and you'll be added when you turn 18 on one of four dates a year (1 Jan, 1 Apr, 1 Jul, 1 Oct). ${ds("qd")}</p></div>`;
  if(age<18)return `<div class="card verdict2 mid"><h3>${aq>=18?`You'll be 18 by ${qds}`:"You can apply in advance now"}</h3><p>17-year-olds can file Form 6 in advance; your name is added on the qualifying date after you turn 18. ${ds("qd")}</p>${applyBox()}</div>`;
  if(r.res==="abroad")return `<div class="card verdict2 mid"><h3>You can register as an overseas elector</h3><p>Indian citizens living abroad register with Form 6A on the ${ds("vsp")} and vote in person at their constituency in India.</p></div>`;
  if(r.list==="yes")return `<div class="card verdict2 good"><h3>You're eligible. Make sure you're still on the list</h3><p>Delhi's voter list has just been revised: the draft (31 Aug 2026) left out 47.7 lakh of 1.45 crore names. The final list is due on 4 November 2026. ${ds("sird")}</p>
      <div class="ctas"><a class="btn btn-p btn-s" href="${DS.esr.u}" target="_blank" rel="noopener">Check my name</a><button class="btn btn-g btn-s" data-ics="roll">Remind me on 4 Nov</button></div>
      <p class="small muted">Missing from the final list? You can appeal to the District Election Officer within 15 days. ${ds("sirf")}</p>${saveBox()}</div>`;
  return `<div class="card verdict2 mid"><h3>You're eligible. ${r.list==="no"?"Get on the list":"Check, then register if needed"}</h3><p>${r.list==="no"?"":"First "+G().link(DS.esr.u,"search your name")+". "}If you're not on it, apply with Form 6. During Delhi's revision, people left out of the draft list also use Form 6. ${srcs(["sirf","forms"])}</p>${applyBox()}${saveBox()}</div>`;
}
function applyBox(){return `<ul class="steps"><li><b>Form 6</b> New voter, or you moved to a new constituency</li><li><b>Form 8</b> Moved within the same constituency, or correct your name, photo, age or address</li><li><b>Form 7</b> Object to a wrong entry or remove a name</li></ul>
  <div class="ctas"><a class="btn btn-p btn-s" href="${DS.vsp.u}" target="_blank" rel="noopener">Apply on the Voters' Service Portal</a></div><p class="small muted">Or use the ECINET app, or call the voter helpline 1950 to reach your booth-level officer. ${srcs(["ecinet","sirf"])}</p>`}
function saveBox(){return `<details class="savebox" ${me.ps?"open":""}><summary>Save my polling details on this device</summary>
  <div class="field"><label for="mps">Polling station (from the electoral search)</label><input id="mps" value="${G().esc(me.ps||"")}" placeholder="e.g. school name, room number"></div>
  <div class="field"><label for="mpart">Part and serial number (optional)</label><input id="mpart" value="${G().esc(me.part||"")}" placeholder="e.g. Part 12, Serial 345"></div>
  <button class="btn btn-g btn-s" data-mesave="1">Save</button> <span class="small muted" id="mesaved">${me.ps?"Saved on this device.":""}</span></details>`}
function vMyVote(){
  const r=mv,q=(k,qt,opts)=>`<div class="mq"><span class="mql">${qt}</span><div class="seg2" role="group" aria-label="${qt}">${opts.map(([v,l])=>`<button data-mv="${k}" data-v="${v}" aria-pressed="${r[k]===v}">${l}</button>`).join("")}</div></div>`;
  return `<div class="wrap page narrow" style="margin-inline:auto">${crumbs("My vote")}
    <div class="phead"><h1 tabindex="-1" id="flowh">How do I vote?</h1><p class="intro">Check you're eligible, get on the voter list, and know what to carry. Answers stay on this device; we don't keep your date of birth.</p></div>
    <section class="card mvq"><h2>Quick eligibility check</h2>
      ${q("cit","Are you an Indian citizen?",[["yes","Yes"],["no","No"]])}
      <div class="mq"><label class="mql" for="mdob">Your date of birth</label><input type="date" id="mdob" value="${r.dob||""}" max="${new Date().toISOString().slice(0,10)}"></div>
      ${q("res","Where do you live?",[["here","In India, at the address I'll vote from"],["abroad","Abroad"]])}
      ${q("list","Are you already on a voter list?",[["yes","Yes"],["no","No"],["unsure","Not sure"]])}
    </section>
    <div id="mvres" aria-live="polite">${verdict()}</div>
    <section class="sec"><div class="sh"><h2>On polling day</h2></div>
      <div class="card mvday"><p><b>Carry your voter ID (EPIC).</b> If you don't have it, any one of these 12 photo IDs works. ${ds("ids")}</p><ul class="cols2">${IDDOCS.map(d=>`<li>${d}</li>`).join("")}</ul>
      <p>Find your polling station on the ${ds("esr")}. Booths can change after a revision, so check again before each election.</p></div></section>
    <section class="sec"><div class="sh"><h2>Something wrong?</h2></div><div class="links">
      <a class="card" href="${DS.vsp.u}" target="_blank" rel="noopener"><b>Fix your entry or apply</b><span>Forms 6, 6A, 7 and 8 on the Voters' Service Portal.</span></a>
      <div class="card"><b>Call 1950</b><span>The national voter helpline. You can also book a call with your booth-level officer. ${ds("sirf")}</span></div>
      <div class="card"><b>Report a problem in the ECINET app</b><span>The Election Commission's app replaces Voter Helpline and cVIGIL: track applications and file complaints, including code-of-conduct violations. ${ds("ecinet")}</span></div></div></section>
    <section class="sec"><div class="banner"><div><h2>Your opinion, in one place</h2><p>Your Help me decide answers and every + or − you've marked.</p></div><a class="btn btn-p" href="#mynotes">My notes →</a></div></section>
  </div>`}

/* ---------- my notes ---------- */
function vMyNotes(){
  const g=G(),dec=st("pdk3_dec")||{issues:[],ans:{}},keys=Object.keys(ops);
  const grp=[["m:","Country-wide measures"],["dp:","Delhi promises"],["dm:","Delhi's numbers"],["loc:","Local problems"]];
  const nm={upa:g.SL.upa,nda:g.SL.nda,same:"About the same",unsure:"Not sure"};
  return `<div class="wrap page narrow" style="margin-inline:auto">${crumbs("My notes")}
    <div class="phead"><h1 tabindex="-1" id="flowh">My notes</h1><p class="intro">Everything you've marked, kept only in this browser. Nobody else can see it.</p></div>
    <section class="sec"><div class="sh"><h2>Help me decide: Lok Sabha</h2></div>${dec.issues&&dec.issues.length?`<div class="card"><ul class="answers">${dec.issues.map(id=>`<li><span class="n">${g.esc((g.ISS[id]||{}).n||id)}</span><span>${nm[dec.ans[id]]||"Not answered"}</span></li>`).join("")}</ul></div>`:`<p class="empty">Not started.</p>`}</section>
    ${(()=>{const dd=st("pdk_ddec")||{issues:[],ans:{}},DN={inc:"Congress",aap:"AAP",bjp:"BJP",other:"Another party",same:"No clear difference",unsure:"Not sure"};return `<section class="sec"><div class="sh"><h2>Help me decide: Delhi</h2></div>${dd.issues&&dd.issues.length?`<div class="card"><ul class="answers">${dd.issues.map(id=>`<li><span class="n">${g.esc((DISSUES.find(i=>i.id===id)||{}).n||id)}</span><span>${DN[(dd.ans||{})[id]]||"Not answered"}</span></li>`).join("")}</ul></div>`:`<p class="empty">Not started.</p>`}</section>`})()}
    ${grp.map(([p,h])=>{const ks=keys.filter(k=>k.startsWith(p));return `<section class="sec"><div class="sh"><h2>${h}</h2></div>${ks.length?`<div class="card llist">${ks.map(k=>`<div class="lrow"><b>${g.esc(ops[k].l)}</b>${op(k,ops[k].l)}</div>`).join("")}</div>`:`<p class="empty">Nothing marked yet.</p>`}</section>`}).join("")}
    <div class="ctas"><button class="btn btn-g" data-notesdl="1">Download my notes</button><button class="btn btn-g" data-notesclr="1">Clear all</button></div>
  </div>`}

/* ---------- routes ---------- */
X.routes={
  elections:{v:vElections,t:"Elections",nav:"elections"},
  "delhi-local":{v:vLocal,t:"Local: MCD",nav:"elections"},
  netas:{v:vNetas,t:"Check your netas",nav:"netas"},
  myvote:{v:vMyVote,t:"How do I vote?",nav:"myvote"},
  mynotes:{v:vMyNotes,t:"My notes",nav:"myvote"}
};
let pendingTo=null;
X.after=route=>{if(pendingTo){const id=pendingTo;pendingTo=null;setTimeout(()=>{const el=document.getElementById(id);if(el)el.scrollIntoView({block:"start"})},50)}};
const canStore=(()=>{try{localStorage.setItem("pdk_t","1");localStorage.removeItem("pdk_t");return true}catch(e){return false}})();
X.boot=()=>{if(canStore&&!loc&&!st("pdk_locskip")&&(location.hash===""||location.hash==="#home"))openLoc()};

/* ---------- events ---------- */
function setOp(el,v){const k=el.dataset.op,l=el.dataset.opl;if(ops[k]&&ops[k].v===v)delete ops[k];else ops[k]={v,l,t:Date.now()};st("pdk_ops",ops);
  document.querySelectorAll(`[data-op="${CSS.escape(k)}"] [data-opv]`).forEach(b=>b.setAttribute("aria-pressed",String(ops[k]&&ops[k].v===+b.dataset.opv)))}
document.addEventListener("click",e=>{
  const t=e.target;
  const ov=t.closest("[data-opv]");if(ov){setOp(ov.closest("[data-op]"),+ov.dataset.opv);return}
  if(t.closest("[data-locopen]")){e.preventDefault();openLoc();return}
  if(t.closest("[data-locclose]")||t.id==="locsheet"){closeLoc();if(!loc)st("pdk_locskip",1);return}
  if(t.closest("[data-locate]")){locate();return}
  if(t.closest("[data-locsave]")){const s=document.getElementById("lstate").value;if(!s){document.getElementById("locmsg").textContent="Please choose a state first.";return}
    const ac=s==="Delhi"?document.getElementById("lac").value:"";loc={state:s,ac:ac?+ac:null};st("pdk_loc",loc);closeLoc();window.dispatchEvent(new HashChangeEvent("hashchange"));return}
  const dto=t.closest("[data-dto]");if(dto){const id=dto.dataset.dto;const el=document.getElementById(id);if(el){e.preventDefault();el.scrollIntoView({block:"start"})}else{pendingTo=id}return}
  const ic=t.closest("[data-ics]");if(ic){const k=ic.dataset.ics,x=DELX.find(d=>d.k===k);if(x)ics(k==="roll"?"Check Delhi's final voter list":"Check the MCD election date",x.date,k==="roll"?"Final electoral roll due today. Search your name at electoralsearch.eci.gov.in":"MCD election due around this time. Check sec.delhi.gov.in");return}
  const np=t.closest("[data-npa]");if(np){nf.pa=np.dataset.npa;document.querySelectorAll("[data-npa]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.npa===nf.pa));document.getElementById("nrows").innerHTML=nrows();return}
  const m=t.closest("[data-mv]");if(m){mv[m.dataset.mv]=m.dataset.v;st("pdk_mv",{cit:mv.cit,res:mv.res,list:mv.list});document.querySelectorAll(`[data-mv="${m.dataset.mv}"]`).forEach(b=>b.setAttribute("aria-pressed",b.dataset.v===mv[m.dataset.mv]));document.getElementById("mvres").innerHTML=verdict();return}
  if(t.closest("[data-mesave]")){me={ps:document.getElementById("mps").value.trim(),part:document.getElementById("mpart").value.trim()};st("pdk_me",me);document.getElementById("mesaved").textContent="Saved on this device.";return}
  if(t.closest("[data-notesdl]")){const data={exported:new Date().toISOString(),decide:st("pdk3_dec"),decideDelhi:st("pdk_ddec"),marks:ops,polling:me};const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));a.download="my-voting-notes.json";document.body.appendChild(a);a.click();setTimeout(()=>a.remove(),300);return}
  if(t.closest("[data-notesclr]")){ops={};me={};mv={};st("pdk_ops",ops);st("pdk_me",me);st("pdk_mv",mv);window.dispatchEvent(new HashChangeEvent("hashchange"));return}
});
document.addEventListener("change",e=>{const t=e.target;
  if(t.id==="lstate"){const w=document.getElementById("lacw");if(w)w.hidden=t.value!=="Delhi";return}
  if(t.id==="npc"){nf.pc=t.value;document.getElementById("nrows").innerHTML=nrows();return}
  if(t.id==="mdob"){mv.dob=t.value;document.getElementById("mvres").innerHTML=verdict();return}
});
document.addEventListener("input",e=>{if(e.target.id==="nq"){nf.q=e.target.value;document.getElementById("nrows").innerHTML=nrows()}});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&document.getElementById("locsheet")){closeLoc();if(!loc)st("pdk_locskip",1)}});
})();
