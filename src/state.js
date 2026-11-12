/* State scope: when a voter picks Delhi, home, issues, compare, promises, charts, manifestos and Help me decide
   switch to Delhi's parties and governments. A switch at the top flips back to the Lok Sabha comparison. */
(function(){
"use strict";
const X=window.PPD_EXT;if(!X)return;
const G=()=>window.PPD;
const esc=s=>G().esc(s),fmt=(v,d)=>G().fmt(v,d),pill=k=>G().pill(k),sbar=c=>G().statusBar(c),sh=(a,b,c)=>G().sh(a,b,c);
function st(k,v){try{if(v===undefined)return JSON.parse(localStorage.getItem(k));localStorage.setItem(k,JSON.stringify(v))}catch(e){return null}}
const $=s=>document.querySelector(s);
const src=k=>DS[k]?G().link(DS[k].u,DS[k].t):"";
const srcs=ks=>ks.map(src).join(" · ");

/* ---------- lookups ---------- */
const DT=Object.fromEntries(DTERMS.map(t=>[t.id,t]));
const DMS=Object.fromEntries(DM.map(m=>[m.id,m]));
const DI=Object.fromEntries(DISSUES.map(i=>[i.id,i]));
const PTY=Object.fromEntries(DPARTIES.map(p=>[p.id,p]));
const SIDES3=["inc","aap","bjp"];
const PNAME={inc:"Congress",aap:"AAP",bjp:"BJP"};
const PCLS={inc:"pinc",aap:"paap",bjp:"pbjp"};
const pb=id=>`<span class="pb ${PCLS[id]||"poth"}">${esc(PNAME[id]||(PTY[id]||{}).n||id)}</span>`;
const IT={};
Object.values(DSIDES).forEach(s=>{IT[s.id]=Object.assign({},s,{full:`${s.name}, ${s.span}`,party:true})});
DTERMS.forEach(t=>{IT[t.id]={id:t.id,al:t.al,name:t.name,span:t.span,years:t.years,cm:t.cm,terms:[t.id],seats:String(t.seats),kind:"One term",ongoing:!!t.ongoing,full:`${t.name} (${t.span})`}});
const ORDER=["inc","aap","bjp","bjp93","inc1","inc2","inc3","aap1","aap2"];
const pav=(al,cls)=>`<span class="pav p${al} ${cls||""}" aria-hidden="true">${al==="inc"?"INC":al.toUpperCase()}</span>`;
const sideLabel=id=>`${PNAME[IT[id].al]}, ${IT[id].span}`;

/* icons for Delhi-only issues (generic line icons) */
const IC2={air:'<path d="M3 8h11a3 3 0 1 0-3-3"/><path d="M3 12h16a3 3 0 1 1-3 3"/><path d="M3 16h7"/>',
  bus:'<rect x="4" y="3" width="16" height="15" rx="3"/><path d="M4 11h16M8 21v-3M16 21v-3"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/>'};
const ico=(k,sz)=>IC2[k]?`<svg class="ico" viewBox="0 0 24 24" width="${sz||24}" height="${sz||24}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC2[k]}</svg>`:G().ico(k,sz);

/* ---------- scope ---------- */
const getLoc=()=>X.getLoc?X.getLoc():st("pdk_loc");
const hasState=()=>{const l=getLoc();return !!(l&&l.state==="Delhi")};
let pref=st("pdk_scope");
const scope=()=>hasState()&&pref!=="centre"?"state":"centre";
function setScope(v){pref=v;st("pdk_scope",v)}

/* ---------- stats ---------- */
function dstat(m,a,b){
  const s=DD[m.id];b=Math.min(b,2025);
  if(m.kind==="flow"){const ys=[];for(let y=a;y<=b;y++)if(s[y]!=null)ys.push(y);
    if(!ys.length)return null;return {avg:ys.reduce((x,y)=>x+s[y],0)/ys.length,n:ys.length,of:b-a+1,y0:ys[0],y1:ys[ys.length-1]}}
  const inYs=Object.keys(s).map(Number).filter(y=>y>=a&&y<=b).sort((x,y)=>x-y);
  if(!inYs.length)return null;
  const startY=s[a-1]!=null?a-1:inYs[0],endY=inYs[inYs.length-1];
  return {start:s[startY],startY,end:endY===startY?null:s[endY],endY:endY===startY?null:endY};
}
const sstat=(m,id)=>dstat(m,IT[id].years[0],IT[id].years[1]);
const yl=(y,m)=>m.fy?`${y}-${String(y+1).slice(2)}`:String(y);
function tallyT(terms){const c={ach:0,part:0,not:0,con:0,prog:0};DP.filter(p=>terms.includes(p.t)).forEach(p=>c[p.s]++);return c}
const sum=o=>Object.values(o).reduce((a,b)=>a+b,0);
/* best flow average among sides with at least 2 years of data */
function bestOf(m,ids){if(m.kind!=="flow")return null;const v=ids.map(id=>{const s=sstat(m,id);return s&&s.n>=2?[id,s.avg]:null}).filter(Boolean);
  if(v.length<2||new Set(v.map(x=>x[1].toFixed(6))).size<2)return null;const bv=m.dir>0?Math.max(...v.map(x=>x[1])):Math.min(...v.map(x=>x[1]));return v.filter(x=>Math.abs(x[1]-bv)<1e-9).map(x=>x[0])}
function avgOver(series,a,b,need){let t=0,n=0;for(let y=a;y<=b;y++){if(series[y]!=null&&(!need||need[y]!=null)){t+=series[y];n++}}return n?{avg:t/n,n}:null}

/* ---------- read it with ---------- */
function readWith(m){
  const li=[];
  if(m.id==="gsdp"||m.id==="pci"){
    const o=m.id==="gsdp"?DMS.pci:DMS.gsdp;
    li.push(`<li><b>${esc(o.n)}</b> <span class="muted">(${esc(o.u)}, average)</span>: ${SIDES3.map(id=>{const s=sstat(o,id);return `${PNAME[id]} ${s?fmt(s.avg,1):"no data yet"}`}).join(" · ")}</li>`);
    if(m.id==="gsdp"){const ind=(typeof D!=="undefined"&&D.gdp)||{};
      li.push(`<li><b>India's GDP growth in the same years</b>: ${SIDES3.map(id=>{const [a,b]=IT[id].years;const dl=avgOver(DD.gsdp,a,b,ind),il=avgOver(ind,a,b,DD.gsdp);if(!dl||!il)return `${PNAME[id]} no data yet`;const g=dl.avg-il.avg;return `${PNAME[id]} years: India ${fmt(il.avg,1)}%, Delhi ${fmt(Math.abs(g),1)} points ${g>=0?"faster":"slower"}${dl.n<b-a+1?` (${dl.n} years)`:""}`}).join(" · ")}. <span class="muted">India: World Bank, financial years.</span></li>`)}
  }
  if(m.id==="imr"){li.push(`<li><b>India's infant mortality in the same years</b>: ${SIDES3.map(id=>{const [a,b]=IT[id].years;const ks=Object.keys(DIND.imr).map(Number).filter(y=>y>=a-1&&y<=b);if(ks.length<2)return `${PNAME[id]} no data yet`;return `${PNAME[id]} years ${DIND.imr[ks[0]]} → ${DIND.imr[ks[ks.length-1]]}`}).join(" · ")}. Delhi has stayed well below the national rate throughout.</li>`)}
  if(["aqi","pm25","good","sev"].includes(m.id)){const others=["aqi","pm25","good","sev"].filter(x=>x!==m.id).map(x=>DMS[x]);
    li.push(...others.map(o=>`<li><b>${esc(o.n)}</b> <span class="muted">(${esc(o.u)})</span>: ${SIDES3.map(id=>{const s=sstat(o,id);return `${PNAME[id]} ${s?fmt(s.avg,0)+(s.n<2?" (1 year)":""):"no data"}`}).join(" · ")}</li>`))}
  if(m.id==="dtc")li.push(`<li>Counting private cluster buses too, Delhi had 7,135 buses in June 2023. ${src("dtc")}</li>`);
  return li.length?`<div class="comp"><b class="comp-h">Read it with</b><ul>${li.join("")}</ul></div>`:"";
}

/* ---------- cards ---------- */
function mcard(m,ids){
  ids=ids||SIDES3;const ss=ids.map(id=>[id,sstat(m,id)]);let verdict="";
  let cells;
  if(m.kind==="flow"){
    const max=Math.max(...ss.filter(x=>x[1]).map(x=>Math.abs(x[1].avg)),0)||1;
    const best=bestOf(m,ids);
    cells=ss.map(([id,s])=>s?`<div class="side ${IT[id].al}"><span class="k">${sideLabel(id)}</span><span class="v">${fmt(s.avg,m.d)}</span><span class="bar1"><i style="width:${Math.abs(s.avg)/max*100}%"></i></span><span class="s">average a year${s.n<s.of?` · ${s.n} of ${s.of} years have data`:""}</span>${best&&best.includes(id)?'<span class="better">✓ Better</span>':""}</div>`
      :`<div class="side ${IT[id].al}"><span class="k">${sideLabel(id)}</span><span class="v muted">No data</span><span class="s">${IT[id].ongoing?"Not published yet":"Not measured in these years"}</span></div>`).join("");
    verdict=best?`<p class="verdict small muted">✓ Better marks the best yearly average on this measure only (${m.dir>0?"higher":"lower"} is better), among sides with at least two years of data.</p>`:`<p class="verdict small muted">Not enough years of data on more than one side to say which was better.</p>`;
  }else{
    cells=ss.map(([id,s])=>{if(!s)return `<div class="side ${IT[id].al}"><span class="k">${sideLabel(id)}</span><span class="v muted">No data</span><span class="s">${IT[id].ongoing?"Not published yet":"Not measured"}</span></div>`;
      if(s.end==null)return `<div class="side ${IT[id].al}"><span class="k">${sideLabel(id)}</span><span class="v">${fmt(s.start,m.d)}</span><span class="s">${yl(s.startY,m)} only</span></div>`;
      const dv=s.end-s.start;return `<div class="side ${IT[id].al}"><span class="k">${sideLabel(id)}</span><span class="v">${fmt(s.start,m.d)} → ${fmt(s.end,m.d)}</span><span class="s">${dv>0?"Up":"Down"} ${fmt(Math.abs(dv),m.d)} (${yl(s.startY,m)} to ${yl(s.endY,m)})</span></div>`}).join("");
    verdict=`<p class="verdict small muted">${m.dir>0?"Higher":"Lower"} is better. Compare how far it moved in each period, not where it ended.</p>`;
  }
  return `<article class="card mc"><h3>${esc(m.q)}<span class="u">${esc(m.n)} · ${esc(m.u)}</span></h3>
    <div class="duo duo3">${cells}</div>${verdict}${readWith(m)}<div class="opline">${X.op?X.op("dm:"+m.id,m.n):""}</div>
    <details data-dchart="${m.id}"><summary>Year-by-year chart and sources</summary><div class="chartbox" id="dch-${m.id}"></div>
    <p style="margin-top:8px">${esc(m.note)} Sources: ${srcs(m.srcs)}.</p></details></article>`;
}
const EXTRA={
  spend:()=>`<article class="card mc"><h3>How much of the budget goes to schools and health?<span class="u">share of total spending, from PRS Legislative Research</span></h3>
    <div class="tablebox"><table class="st"><thead><tr><th></th><th>2024-25 actual<br><small class="muted">AAP's last budget</small></th><th>2025-26 revised<br><small class="muted">BJP's first</small></th><th>2026-27 budget</th><th>Average of states</th></tr></thead>
    <tbody><tr><td><b>Education</b></td><td>27.8%</td><td>24.1%</td><td>21.1%</td><td>14.5%</td></tr><tr><td><b>Health</b></td><td>13.6%</td><td>12.2%</td><td>14.4%</td><td>6.2%</td></tr></tbody></table></div>
    <p class="small muted">Both parties spend a far bigger share on schools and health than most states. Budgets are plans; only the first column is actual spending. ${src("prs26")}</p></article>`,
  beds:()=>`<article class="card mc"><h3>Hospital beds and clinics<span class="u">Delhi government figures</span></h3>
    <div class="kv"><div><b>12,464 → 15,659</b><span>Government hospital beds, 2020 to Dec 2025</span></div><div><b>540+ → 30</b><span>Mohalla clinics at their peak (AAP years), and still running in Jan 2026 after 137 were ordered shut: 41 had no doctors and 96 were near new Ayushman Arogya Mandirs (319 by then)</span></div></div>
    <p class="small muted">${srcs(["esd","dhn"])}</p></article>`,
  cbse:()=>`<article class="card mc"><h3>Class 12 results<span class="u">CBSE pass rates, 2025</span></h3>
    <div class="kv"><div><b>96.1% and 98.1%</b><span>Government schools, East and West zones</span></div><div><b>93.9% and 92.3%</b><span>Private schools, same zones</span></div></div>
    <p class="small muted">Pass rates don't show how many students reach Class 12 or what they learn. ${src("cbse")}</p></article>`,
  water:()=>`<article class="card mc"><h3>Piped water<span class="u">Economic Survey of Delhi 2025-26</span></h3>
    <div class="kv"><div><b>93.5%</b><span>Households with piped water</span></div><div><b>~1,000 MGD</b><span>Water produced a day in summer, for about 2.5 crore people</span></div></div>
    <p class="small muted">No year-by-year series is available, so this can't be split by government. ${src("esd")}</p></article>`
};

/* ---------- chart with government bands ---------- */
function dchart(box,m){
  if(!box)return;const s=DD[m.id],ys=Object.keys(s).map(Number).sort((a,b)=>a-b);if(!ys.length)return;
  const W=Math.max(280,box.clientWidth||500),H=210,pl=40,pr=12,pt=26,pb=24;
  const x0=Math.min(ys[0],m.id==="imr"?1997:ys[0])-0.5,x1=Math.max(ys[ys.length-1],2025)+0.5;
  let lo=Math.min(...ys.map(y=>s[y])),hi=Math.max(...ys.map(y=>s[y]));if(m.kind==="flow"&&lo>0)lo=0;
  const pad=(hi-lo)*0.08||1;lo=lo<0?lo-pad:Math.max(0,lo-pad);hi+=pad;
  const X=y=>pl+(y-x0)/(x1-x0)*(W-pl-pr),Y=v=>pt+(1-(v-lo)/(hi-lo))*(H-pt-pb);
  let g=`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(m.n)}, ${ys[0]} to ${ys[ys.length-1]}">`;
  DTERMS.forEach(t=>{const a=Math.max(x0,t.years[0]-0.5),b=Math.min(x1,t.years[1]+0.5);if(b<=a)return;
    g+=`<rect x="${X(a)}" y="${pt-18}" width="${X(b)-X(a)}" height="${H-pb-pt+18}" class="band b-${t.al}"/>`;
    if(X(b)-X(a)>44)g+=`<text x="${X(a)+4}" y="${pt-7}" class="bl">${PNAME[t.al]}${t.al==="bjp"&&t.id==="bjp93"?" 93–98":""}</text>`});
  const tk=[lo,(lo+hi)/2,hi];tk.forEach(v=>{g+=`<line x1="${pl}" x2="${W-pr}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--rule)"/><text x="${pl-6}" y="${Y(v)+4}" text-anchor="end">${fmt(v,Math.abs(hi-lo)<10?1:0)}</text>`});
  if(lo<0)g+=`<line x1="${pl}" x2="${W-pr}" y1="${Y(0)}" y2="${Y(0)}" stroke="var(--muted)"/>`;
  const step=x1-x0>20?5:x1-x0>8?2:1;for(let y=Math.ceil(x0);y<=x1;y++)if(y%step===0)g+=`<text x="${X(y)}" y="${H-6}" text-anchor="middle">${y}</text>`;
  let path="",prev=null;ys.forEach(y=>{path+=(prev!=null&&y-prev===1?"L":"M")+X(y).toFixed(1)+" "+Y(s[y]).toFixed(1)+" ";prev=y});
  g+=`<path d="${path}" fill="none" stroke="var(--line)" stroke-width="2" stroke-linejoin="round"/>`;
  ys.forEach(y=>{if(m.sparse||ys.length<12||y===ys[ys.length-1])g+=`<circle cx="${X(y)}" cy="${Y(s[y])}" r="3.5" fill="var(--line)"/>`});
  const ly=ys[ys.length-1];g+=`<text x="${X(ly)-4}" y="${Y(s[ly])-8}" text-anchor="end" style="fill:var(--ink);font-weight:600">${fmt(s[ly],m.d)}</text></svg>`;
  box.innerHTML=g+`<p class="small muted">${ys.length} data points: ${ys.map(y=>yl(y,m)).join(", ")}.</p>`;
}

/* ---------- shared pieces ---------- */
const promItem=p=>`<li><div class="tags">${pill(p.s)}<span class="m">${esc(DT[p.t].name)} · ${esc(DMANI_LABEL[p.m])}</span></div><span class="t">${esc(p.p)}</span><span class="e">${esc(p.e)}</span><details><summary>Sources</summary>${srcs(p.src)}</details>${X.op?X.op("dp:"+p.p.slice(0,40),p.p):""}</li>`;
function promCol(al,iss){const l=DP.filter(p=>DT[p.t].al===al&&(!iss||p.iss.includes(iss)));
  return l.length?`<ul class="plist2">${l.map(promItem).join("")}</ul>`:`<p class="empty">${al==="bjp"&&!iss?"":"No measurable promise on this was tracked for this party."}</p>`}
const nowItem=x=>`<li><span class="t">${esc(x.p)}</span><details><summary>Source</summary>${src(x.src)}</details></li>`;
function nowCol(pa,iss){const l=DNOW.filter(x=>x.pa===pa&&(!iss||x.iss.includes(iss)));
  return l.length?`<ul class="plist2">${l.map(nowItem).join("")}</ul>`:`<p class="empty">Nothing on this in the 2025 manifesto points we found.</p>`}
const colHead=(al,sub)=>`<div class="col-h"><b>${pb(al)} ${esc(PTY[al]?PTY[al].full:"")}</b><span>${sub}</span></div>`;
const tstat=x=>{const c=tallyT(IT[x].terms);return {c,tot:sum(c)}};
function gcard(id){const it=IT[id],{c,tot}=tstat(id);
  return `<article class="card gcard ${it.al}"><div class="top">${pav(it.al)}<div><b>${esc(it.name)}${it.ongoing?' <span class="badge-live">Ongoing</span>':""}</b><span>${it.span} · CM ${esc(it.cm)}</span></div></div>
    <div class="body"><div class="price">${tot?`<b data-n="${c.ach}">${c.ach}</b><span class="muted">of ${tot} tracked promises kept in full</span>`:`<span class="muted">No measurable promises tracked</span>`}</div>${tot?sbar(c):""}
    <div class="specs"><span>${it.seats} of 70 seats</span><span>${it.kind}</span></div></div>
    <div class="foot2"><a class="btn btn-o btn-s" href="#dgov/${id}">View details</a><a class="btn btn-g btn-s" href="#dcompare/${id}-${id.startsWith("aap")?"bjp":"aap"}">Compare</a></div></article>`}
function vsCard(ids){return `<a class="card vs" href="#dcompare/${ids.join("-")}"><div class="vs-pair vs-n" style="--k:${ids.length}">${ids.map((id,i)=>`${i?'<span class="vs-mid" aria-hidden="true">VS</span>':""}<div class="vs-side">${pav(IT[id].al,"lgp")}<b>${esc(IT[id].name)}</b><span>${IT[id].span}</span></div>`).join("")}</div><span class="go">Compare ${ids.map(id=>IT[id].name).join(" vs ")}</span></a>`}
const note=()=>`<p class="small muted">${DGAP} BJP has governed only since February 2025, so most yearly data don't cover it yet. Delhi's police, land and public order are run by the Centre, not the Delhi government.</p>`;
const crumbs=t=>`<p class="crumbs"><a href="#home">Delhi</a> › ${t}</p>`;
const partyRows=()=>{const max=Math.max(...DPARTIES.map(p=>p.vs||0));
  return `<div class="card prow-wrap"><ul class="prows">${DPARTIES.map(p=>`<li class="prow ${PCLS[p.id]?p.id:"oth"}"><span class="pn">${pb(p.id)}<span class="pf">${esc(p.full)}${p.al?` · ${p.al}`:""}</span></span><span class="ptrack"><i style="width:${p.vs?Math.max(p.vs/max*100,0.8):0}%"></i></span><span class="pv"><b>${p.vs!=null?fmt(p.vs,2)+"%":"n/a"}</b><small>${p.cont!=null?`${p.won} of ${p.cont} contested`:`${p.won} seats`}</small></span>${p.role?`<span class="pr">${esc(p.role)}</span>`:""}</li>`).join("")}</ul>
  <p class="small muted">Feb 2025 result. Other parties and independents together got 0.93%; NOTA got 0.57%. Turnout 60.5%. ${srcs(["wk25","dh25"])}</p></div>`};

/* ---------- home ---------- */
let dh2h="prom",dhst="ach";
const DH2H=["prom","gsdp","pci","imr"];
function h2hBox(){
  let rows,unit,best=null;
  if(dh2h==="prom"){rows=SIDES3.map(id=>{const {c,tot}=tstat(id);return {id,v:tot?c.ach/tot*100:null,lab:tot?`${Math.round(c.ach/tot*100)}%`:"–",sub:tot?`${c.ach} of ${tot} kept in full${IT[id].ongoing?", term still running":""}`:"none tracked"}});
    unit="Share of tracked promises kept in full. Few promises are tracked for Congress, and BJP's term is still running, so treat these as rough."}
  else{const m=DMS[dh2h];rows=SIDES3.map(id=>{const s=sstat(m,id);if(!s)return {id,v:null,lab:"No data",sub:IT[id].ongoing?"not published yet":"not measured"};
      if(m.kind==="flow")return {id,v:s.avg,lab:fmt(s.avg,m.d),sub:`average a year${s.n<s.of?`, ${s.n} of ${s.of} years`:""}`};
      return {id,v:s.end!=null?s.end:s.start,lab:s.end!=null?`${fmt(s.start,m.d)} → ${fmt(s.end,m.d)}`:fmt(s.start,m.d),sub:s.end!=null?`${yl(s.startY,m)} to ${yl(s.endY,m)}`:`${yl(s.startY,m)} only`}});
    unit=`${esc(m.q)} ${esc(m.n)}, ${esc(m.u)} · ${m.dir>0?"higher":"lower"} is better.`;const b=bestOf(m,SIDES3);if(b&&b.length===1)best=b[0]}
  const max=Math.max(...rows.map(r=>Math.abs(r.v||0)))||1;
  return `<div class="pills" role="group" aria-label="Measure">${DH2H.map(k=>`<button data-dh2h="${k}" aria-pressed="${dh2h===k}">${k==="prom"?"Promises kept":esc(DMS[k].n)}</button>`).join("")}</div>
    <div class="h2h-rows">${rows.map(r=>`<div class="h2h-row ${r.id}"><a class="h2h-who" href="#dgov/${r.id}">${pav(r.id)}<span><b>${PNAME[r.id]}</b><small>${IT[r.id].span} · CM ${esc(IT[r.id].cm)}</small></span></a>
      <div class="h2h-track"><i data-w="${r.v==null?0:Math.abs(r.v)/max*100}"></i></div><div class="h2h-v"><b>${r.lab}</b><small>${r.sub}</small>${best===r.id?'<span class="better">✓ Better</span>':""}</div></div>`).join("")}</div>
    <p class="small muted">${unit}</p>`;
}
function homeProm(){return `<div class="hscroll">${DP.filter(p=>p.s===dhst).map(p=>`<article class="card pcard st-${p.s}">${pill(p.s)}<span class="t">${esc(p.p)}</span><span class="m">${pb(DT[p.t].al)} ${esc(DT[p.t].name)} · ${esc(DMANI_LABEL[p.m])}</span><span class="e">${esc(p.e)}</span></article>`).join("")||'<p class="empty">None.</p>'}</div>`}
function sHome(){
  const top=X.homeTop?X.homeTop():"";
  return `${top}<section class="hero"><div class="wrap hero-in">
    <div class="hero-copy"><p class="eyebrow">Delhi Assembly · every government since 1993</p><h1>Compare Delhi's parties before you vote</h1>
      <p class="lede">What Congress, AAP and BJP promised Delhi, what they delivered, how Delhi did while each was in power, and what every party promised in 2025. Every claim has a source.</p></div>
    <div class="card finder"><h2>Find what matters to you</h2>
      <div class="field"><label for="dfi">Choose an issue</label><select id="dfi">${DISSUES.map(i=>`<option value="${i.id}">${esc(i.n)} · ${i.hi}</option>`).join("")}</select></div>
      <button class="btn btn-p" data-dfgo="issue">Compare on this issue</button>
      <div class="field"><label for="dfg">Or choose a government</label><select id="dfg">${ORDER.map(id=>`<option value="${id}">${esc(IT[id].full)}</option>`).join("")}</select></div>
      <button class="btn btn-o" data-dfgo="gov">View details</button>
      <p class="alt">Not sure where to start? <a href="#decide">Let us guide you</a></p></div>
    <div class="hero-extra"><div class="trio">${SIDES3.map(id=>{const {c,tot}=tstat(id);return `<a class="duel-card ${id}" href="#dgov/${id}">${pav(id,"lgp")}<span class="duel-t"><b>${PNAME[id]}</b><span>${IT[id].span} · CM ${esc(IT[id].cm)}</span><span class="duel-k"><b data-n="${c.ach}">${c.ach}</b> of ${tot} promises kept${IT[id].ongoing?" so far":""}</span></span></a>`}).join("")}</div>
      <div class="statrow"><div><b data-n="${DPARTIES.length}">${DPARTIES.length}</b><span>parties contested</span></div><div><b data-n="${DTERMS.length}">${DTERMS.length}</b><span>governments</span></div><div><b data-n="${DP.length}">${DP.length}</b><span>promises tracked</span></div><div><b data-n="${DM.length}">${DM.length}</b><span>yearly measures</span></div></div></div>
  </div></section>
  <section class="wrap sec">${sh("Who contested in 2025","Every party on the ballot in February 2025, by share of the vote.",`<a class="all" href="#manifesto">Their promises →</a>`)}${partyRows()}</section>
  <section class="wrap sec">${sh("Head to head","Tap a measure to compare each party's time in power.")}<div class="card h2h" id="dh2h">${h2hBox()}</div>${note()}</section>
  <section class="wrap sec">${sh("Compare to decide","Pick a match-up to see promises kept and key numbers side by side.",`<a class="all" href="#compare">Build your own →</a>`)}
    <div class="vsgrid">${[["inc","aap","bjp"],["aap","bjp"],["inc","aap"],["aap1","aap2"],["inc1","inc3"],["bjp93","bjp"]].map(vsCard).join("")}</div></section>
  <section class="wrap sec">${sh("Browse by issue","Each issue shows each party's record, past promises and 2025 promises.",`<a class="all" href="#issues">All issues →</a>`)}
    <div class="tiles">${DISSUES.map(dtile).join("")}</div></section>
  <section class="wrap sec">${sh("Delhi's governments since 1993",DGAP)}<div class="hscroll">${DTERMS.map(t=>gcard(t.id)).join("")}</div></section>
  <section class="wrap sec">${sh("Promise tracker","Measurable promises from the winning party's manifesto, and what happened.",`<a class="all" href="#promises">View all ${DP.length} →</a>`)}
    <div class="pills" role="group" aria-label="Filter by result">${Object.keys(ST).filter(k=>DP.some(p=>p.s===k)).map(k=>`<button data-dhst="${k}" aria-pressed="${dhst===k}">${ST[k].l} (${DP.filter(p=>p.s===k).length})</button>`).join("")}</div>
    <div id="dhprom">${homeProm()}</div></section>
  <section class="wrap sec" id="d-news">${sh("Latest in Delhi","Recent developments, with sources.")}
    <div class="hscroll">${DNEWS.map(n=>`<article class="card ncard"><span class="date">${n.d}</span><b>${esc(n.t)}</b>${n.s?`<span class="s">${esc(n.s)}</span>`:""}${src(n.src)}</article>`).join("")}</div></section>
  <section class="wrap sec"><div class="banner"><div><h2>Still not sure whom to vote for in Delhi?</h2><p>Pick up to 4 issues, see every party's record and promises one issue at a time, and make your own call. No sign-up.</p></div><a class="btn btn-p" href="#decide">Help me decide →</a></div></section>
  <section class="wrap sec"><div class="banner"><div><h2>Voting in the Lok Sabha election?</h2><p>Compare the Congress-led and BJP-led central governments since 2004.</p></div><button class="btn btn-o" data-scope="centre">Switch to Lok Sabha</button></div></section>`;
}
const imeta=i=>{const np=DP.filter(p=>p.iss.includes(i.id)).length,nm=i.ms.length+(i.extra||[]).length;return [np?`${np} promise${np===1?"":"s"}`:"",nm?`${nm} measure${nm===1?"":"s"}`:""].filter(Boolean).join(" · ")};
const dtile=i=>`<a class="card tile" href="#dissue/${i.id}"><span class="ic">${ico(i.ic)}</span><b>${esc(i.n)}</b><span class="hi" lang="hi">${i.hi}</span><span class="meta">${imeta(i)}</span></a>`;

/* ---------- issues ---------- */
function sIssues(){return `<div class="wrap page">${crumbs("Issues")}<div class="phead"><h1 tabindex="-1" id="flowh">Delhi: browse by issue</h1><p class="intro">Pick an issue to see what each party did in power, which promises they kept, and what every party promised in 2025.</p></div>
  <div class="tiles">${DISSUES.map(i=>`<a class="card tile" href="#dissue/${i.id}"><span class="ic">${ico(i.ic)}</span><b>${esc(i.n)}</b><span class="hi" lang="hi">${i.hi}</span><span class="small muted">${esc(i.d)}</span><span class="meta">${imeta(i)}</span></a>`).join("")}</div></div>`}
function glance(iss){
  const ms=iss.ms.map(id=>DMS[id]).filter(m=>m.kind==="flow");
  const cell=id=>{const rows=[];const cmp=ms.map(m=>bestOf(m,SIDES3)).filter(Boolean);
    if(cmp.length)rows.push(`<li>Better on <b>${cmp.filter(b=>b.includes(id)).length} of ${cmp.length}</b> yearly ${cmp.length>1?"measures":"measure"} here</li>`);
    const c={ach:0,part:0,not:0,con:0,prog:0};DP.filter(p=>DT[p.t].al===id&&p.iss.includes(iss.id)).forEach(p=>c[p.s]++);
    rows.push(sum(c)?`<li>Past promises: ${Object.keys(c).filter(k=>c[k]).map(k=>`<b>${c[k]}</b> ${ST[k].l.toLowerCase()}`).join(", ")}</li>`:`<li>No past promise on this tracked</li>`);
    const nw=DNOW.filter(x=>x.pa===id&&x.iss.includes(iss.id)).length;rows.push(`<li>${nw?`<b>${nw}</b> 2025 ${nw>1?"promises":"promise"}`:"No 2025 promise on this found"}</li>`);
    return `<div class="side ${id}"><span class="k">${pb(id)} ${IT[id].span}</span><ul class="qt">${rows.join("")}</ul></div>`};
  return `<section class="card glance" aria-label="At a glance"><h3>At a glance</h3><div class="duo duo3">${SIDES3.map(cell).join("")}</div></section>`;
}
function issueBody(iss){
  const others=[...new Set(DNOW.filter(x=>!SIDES3.includes(x.pa)&&x.iss.includes(iss.id)).map(x=>x.pa))];
  return `${glance(iss)}
  <section class="blk"><div class="blk-h"><h2>Their record in power</h2><span class="q">What happened in Delhi while each party governed?</span></div>
    <div class="mcards">${iss.ms.map(id=>mcard(DMS[id])).join("")}${(iss.extra||[]).map(k=>EXTRA[k]()).join("")}${!iss.ms.length&&!(iss.extra||[]).length?'<p class="empty">No year-by-year Delhi figures on this in our sources yet.</p>':""}</div>${note()}</section>
  <section class="blk"><div class="blk-h"><h2>Promises they made before</h2><span class="q">Did they keep their word?</span></div>
    <div class="cols cols3">${SIDES3.map(al=>`<div class="card col ${al}">${colHead(al,al==="inc"?"Manifestos of 2003 and 2008":al==="aap"?"Manifestos of 2015 and 2020":"Sankalp Patra 2025")}${promCol(al,iss.id)}</div>`).join("")}</div></section>
  <section class="blk"><div class="blk-h"><h2>What they promised in 2025</h2><span class="q">Every party's 2025 manifesto on this</span></div>
    <div class="cols cols3">${SIDES3.map(al=>`<div class="card col ${al}">${colHead(al,al==="bjp"?"Won: can be tested":"In opposition: can't be tested yet")}${nowCol(al,iss.id)}</div>`).join("")}</div>
    ${others.length?`<div class="cols">${others.map(pa=>`<div class="card col oth">${colHead(pa,`${PTY[pa].cont} seats contested`)}${nowCol(pa,iss.id)}</div>`).join("")}</div>`:""}
    <p class="small muted">Other parties that contested: <a href="#manifesto">see what each one put forward</a>.</p></section>`;
}
function sIssue(id){const iss=DI[id]||DISSUES[0];const idx=DISSUES.indexOf(iss),nx=DISSUES[(idx+1)%DISSUES.length];const inDec=ddec.issues.includes(iss.id);
  return `<div class="wrap narrow flow">${crumbs(`<a href="#issues">Issues</a> › ${esc(iss.n)}`)}
    <div style="display:grid;gap:8px"><div class="ptitle"><span class="ic">${ico(iss.ic,28)}</span><h1 tabindex="-1" id="flowh">${esc(iss.n)}<span class="hi2" lang="hi">${iss.hi}</span></h1></div><p class="intro">${esc(iss.d)}</p></div>
    ${issueBody(iss)}
    <div class="card choose"><h2>Weigh this up with other issues</h2><p class="muted small">Add it to Help me decide and record who convinced you on each issue.</p>
      <div class="ctas">${inDec?`<a class="btn btn-p" href="#decide">Continue Help me decide →</a>`:`<button class="btn btn-p" data-daddiss="${iss.id}">Add to Help me decide</button>`}<a class="btn btn-g" href="#dissue/${nx.id}">Next issue: ${esc(nx.n)} →</a></div></div></div>`}

/* ---------- government detail ---------- */
function sGov(id){
  const it=IT[id]||IT.aap;const {c,tot}=tstat(it.id);const all=DP.filter(p=>it.terms.includes(p.t));
  const li=p=>`<li class="st-${p.s}"><i aria-hidden="true">${ST[p.s].i}</i><div>${esc(p.p)}<small>${esc(DT[p.t].name)} · ${ST[p.s].l}. ${esc(p.e)}</small></div></li>`;
  const kept=all.filter(p=>p.s==="ach"),miss=all.filter(p=>p.s==="part"||p.s==="not"),open=all.filter(p=>p.s==="con"||p.s==="prog");
  const other=it.al==="aap"?"bjp":"aap";
  return `<div class="wrap">${crumbs(esc(it.full))}
    <section class="card dhead ${it.al}">${pav(it.al,"xlp")}<div><h1 tabindex="-1" id="flowh">${esc(it.party?`${PNAME[it.al]} in Delhi, ${it.span}`:it.full)}</h1>
      <p class="who">${esc(PTY[it.al].full)} · Chief Minister ${esc(it.cm)}</p>
      <div class="chips"><span>${it.kind}</span><span>${it.seats} of 70 seats</span>${it.ongoing?"<span>Ongoing</span>":""}<span>2025 vote share ${fmt(PTY[it.al].vs,1)}%</span></div></div>
      <div class="score"><span class="small muted">Promise record</span>${tot?`<div class="big"><b data-n="${c.ach}">${c.ach}</b><span>of ${tot} tracked promises kept in full</span></div>${sbar(c)}`:'<p class="empty">No measurable promises tracked for this government.</p>'}
        <div class="ctas"><a class="btn btn-p btn-s" href="#dcompare/${it.id}-${other}">Compare with ${PNAME[other]}</a><a class="btn btn-g btn-s" href="#promises">All promises</a></div></div></section></div>
  <div class="wrap page">
    <section class="sec">${sh("Key numbers while in office",`Data years ${it.years[0]}${Math.min(it.years[1],2025)>it.years[0]?"–"+Math.min(it.years[1],2025):""}${it.ongoing?" so far":""}. Yearly rates are averages; slow-moving levels show start and end.`,`<a class="all" href="#charts">All charts →</a>`)}
      <div class="card specgrid">${DM.map(m=>{const s=dstat(m,it.years[0],it.years[1]);let v,sub;
        if(!s){v=`<span class="muted">No data</span>`;sub=it.ongoing?"Not published yet":"Not measured"}
        else if(m.kind==="flow"){v=fmt(s.avg,m.d);sub=s.n<s.of?`average, ${s.n} of ${s.of} years with data`:"average a year"}
        else if(s.end==null){v=fmt(s.start,m.d);sub=`${yl(s.startY,m)} only`}
        else{v=`${fmt(s.start,m.d)} → ${fmt(s.end,m.d)}`;sub=`${yl(s.startY,m)} to ${yl(s.endY,m)}`}
        return `<div class="spec"><span class="k">${esc(m.n)}</span><span class="v">${v}</span><span class="s">${esc(m.u)} · ${sub}</span></div>`}).join("")}</div>${note()}</section>
    <section class="sec">${sh("Promise record")}
      ${tot?`<div class="pc"><div class="card"><h3><span class="pill st-ach">✓</span> Kept (${kept.length})</h3>${kept.length?`<ul>${kept.map(li).join("")}</ul>`:'<p class="empty">None.</p>'}</div>
      <div class="card"><h3><span class="pill st-not">✕</span> Missed or partly kept (${miss.length})</h3>${miss.length?`<ul>${miss.map(li).join("")}</ul>`:'<p class="empty">None.</p>'}</div></div>
      ${open.length?`<div class="pc"><div class="card" style="grid-column:1/-1"><h3><span class="pill st-prog">…</span> Still in progress (${open.length})</h3><ul>${open.map(li).join("")}</ul></div></div>`:""}`:`<p class="empty">We haven't found credible, checkable reviews of this government's manifesto promises yet.</p>`}</section>
    <section class="sec">${sh(`What ${PNAME[it.al]} promised in 2025`,it.al==="bjp"?"BJP won, so these can be checked as the term goes on.":"In opposition, so these can't be tested yet.",`<a class="all" href="#manifesto">All parties →</a>`)}<div class="card col ${it.al}">${nowCol(it.al)}</div></section>
    ${it.party&&it.terms.length>1?`<section class="sec">${sh("Terms")}<div class="hscroll">${it.terms.map(gcard).join("")}</div></section>`:""}
  </div>`;
}

/* ---------- compare ---------- */
let dcmp=st("pdk_dcmp");dcmp=(Array.isArray(dcmp)?dcmp:[]).filter(id=>IT[id]).slice(0,3);if(dcmp.length<2)dcmp=["inc","aap","bjp"];
function sCompare(){
  const its=dcmp.map(id=>IT[id]),n=its.length;
  const opts=sel=>ORDER.map(id=>`<option value="${id}" ${id===sel?"selected":""}>${esc(IT[id].full)}</option>`).join("");
  const slots=its.map((it,i)=>`<div class="card slot">${pav(it.al)}<b>${esc(it.name)}</b><span style="display:flex;gap:8px;align-items:center"><select data-dslot="${i}" aria-label="Government ${i+1}">${opts(it.id)}</select>${n>2?`<button class="linkbtn small" data-drm="${i}">Remove</button>`:""}</span></div>`).join("")
    +(n<3?`<div class="card slot empty"><span class="plus" aria-hidden="true">+</span><b>Add a third</b><select data-dadd="1" aria-label="Add a government"><option value="">Choose…</option>${ORDER.filter(id=>!dcmp.includes(id)).map(id=>`<option value="${id}">${esc(IT[id].full)}</option>`).join("")}</select></div>`:"");
  const row=(k,cells,sub)=>`<tr><th scope="row">${k}${sub?`<small>${sub}</small>`:""}</th>${cells.map(c=>`<td class="v${c.best?" best":""}">${c.h}</td>`).join("")}</tr>`;
  const sect=t=>`<tr class="sect"><td colspan="${n+1}">${t}</td></tr>`;
  let h=`<div class="ctable-wrap"><table class="ct" style="--n:${n}"><thead><tr><th scope="col">Government</th>${its.map(it=>`<th scope="col"><span class="thname">${pav(it.al)}<span>${esc(it.name)}<small class="muted" style="display:block;font-family:var(--f-body);font-weight:400;font-size:12.5px">${it.span}</small></span></span></th>`).join("")}</tr></thead><tbody>`;
  h+=sect("Overview")+row("Chief Minister",its.map(it=>({h:esc(it.cm)})))+row("Seats won",its.map(it=>({h:esc(it.seats)})),"out of 70")+row("Data years used",its.map(it=>({h:`${it.years[0]}${Math.min(it.years[1],2025)>it.years[0]?"–"+Math.min(it.years[1],2025):""}${it.ongoing?" so far":""}`})));
  const tl=its.map(it=>tallyT(it.terms));h+=sect("Promise record")+row("Promises tracked",tl.map(c=>({h:`<b>${sum(c)}</b>`})));
  Object.keys(ST).forEach(k=>{if(tl.some(c=>c[k]))h+=row(`<span class="st-${k}" style="color:var(--sc)">${ST[k].i}</span> ${ST[k].l}`,tl.map(c=>({h:`<b>${c[k]}</b>${sum(c)?`<small>${Math.round(c[k]/sum(c)*100)}% of tracked</small>`:""}`})))});
  let cat="";DM.forEach(m=>{if(m.cat!==cat){cat=m.cat;h+=sect(cat)}const b=bestOf(m,dcmp)||[];
    h+=row(esc(m.n),its.map(it=>{const s=dstat(m,it.years[0],it.years[1]);if(!s)return {h:`<span class="muted">No data</span><small>${it.ongoing?"Not published yet":"Not measured"}</small>`};
      if(m.kind==="flow")return {h:`<b>${fmt(s.avg,m.d)}</b>${b.includes(it.id)?' <span class="better">✓ Better</span>':""}<small>${s.n<s.of?`average, ${s.n} of ${s.of} years`:"average a year"}</small>`,best:b.includes(it.id)};
      if(s.end==null)return {h:`<b>${fmt(s.start,m.d)}</b><small>${yl(s.startY,m)} only</small>`};
      return {h:`<b>${fmt(s.start,m.d)} → ${fmt(s.end,m.d)}</b><small>${yl(s.startY,m)} to ${yl(s.endY,m)}</small>`}}),`${esc(m.u)} · ${m.kind==="flow"?(m.dir>0?"higher is better":"lower is better"):"start → end"}`)});
  h+=`</tbody></table></div>`;
  return `<div class="wrap page">${crumbs("Compare")}<div class="phead"><h1 tabindex="-1" id="flowh">Compare Delhi's governments</h1><p class="intro">Pick two or three: a party's whole time in power or a single term. Promise records and Delhi's numbers line up side by side.</p></div>
    <div class="slots">${slots}</div>
    <div class="note"><span><b>How to read this:</b> yearly rates show the average over the period, and <span class="better">✓ Better</span> marks the best average on that one measure, only among governments with at least two years of data. Slow-moving levels show start → end. No overall winner is given.</span></div>
    ${h}${note()}
    <section class="sec" style="padding-top:10px">${sh("Popular comparisons")}<div class="vsgrid">${[["inc","aap","bjp"],["aap","bjp"],["inc","aap"],["aap1","aap2"]].map(vsCard).join("")}</div></section></div>`;
}

/* ---------- promises ---------- */
let dpf={pa:"all",s:"all",iss:"all"};
function plist(){const l=DP.filter(p=>(dpf.pa==="all"||DT[p.t].al===dpf.pa)&&(dpf.s==="all"||p.s===dpf.s)&&(dpf.iss==="all"||p.iss.includes(dpf.iss)));
  return `<p class="count" aria-live="polite">Showing ${l.length} of ${DP.length} promises</p><div class="plist">${l.map(p=>`<article class="card prom st-${p.s}"><div class="icon" aria-hidden="true">${ST[p.s].i}</div>
    <div class="meta">${pb(DT[p.t].al)}<span>${esc(DT[p.t].name)}, ${DT[p.t].span}</span><span>${esc(DMANI_LABEL[p.m])}</span></div>
    <h3>${esc(p.p)}</h3><p class="what"><b>${ST[p.s].l}.</b> ${esc(p.e)}</p><details><summary>Sources</summary>${srcs(p.src)}</details></article>`).join("")||'<p class="empty">No promises match.</p>'}</div>`}
function sPromises(){
  const pills=(k,opts)=>`<div class="pills" role="group">${opts.map(([v,l])=>`<button data-dpf="${k}" data-v="${v}" aria-pressed="${dpf[k]===v}">${l}</button>`).join("")}</div>`;
  return `<div class="wrap page">${crumbs("Promise tracker")}<div class="phead"><h1 tabindex="-1" id="flowh">Delhi promise tracker</h1><p class="intro">${DP.length} measurable promises from the manifestos of the party that won, and what happened. Each is judged against its own target and deadline.</p></div>
    <div class="dfilters">${pills("pa",[["all","All parties"],...SIDES3.map(id=>[id,PNAME[id]])])}${pills("s",[["all","Any result"],...Object.keys(ST).filter(k=>DP.some(p=>p.s===k)).map(k=>[k,ST[k].l])])}
    <div class="field"><label for="dpiss" class="small">Issue</label><select id="dpiss"><option value="all">All issues</option>${DISSUES.map(i=>`<option value="${i.id}" ${dpf.iss===i.id?"selected":""}>${esc(i.n)}</option>`).join("")}</select></div></div>
    <div id="dplist">${plist()}</div>
    <p class="small muted">AAP's 2015 statuses are as reported in September 2019, before that term ended. Congress's promises come from news reports, as its old manifestos aren't online. Smaller parties haven't governed Delhi, so they have no record to check; their 2025 promises are on the <a href="#manifesto">manifestos page</a>.</p></div>`}

/* ---------- charts ---------- */
let dcc="all";
function sCharts(){const cats=[...new Set(DM.map(m=>m.cat))],show=dcc==="all"?cats:[dcc];
  return `<div class="wrap page">${crumbs("Charts")}<div class="phead"><h1 tabindex="-1" id="flowh">How did Delhi do?</h1><p class="intro">Each chart runs to the latest data. Shaded bands show who governed Delhi: <span class="pb pinc">Congress</span> <span class="pb paap">AAP</span> <span class="pb pbjp">BJP</span>. Gaps are years with no data or no elected government.</p></div>
    <div class="pills" role="group" aria-label="Category"><button data-dcc="all" aria-pressed="${dcc==="all"}">All (${DM.length})</button>${cats.map(c=>`<button data-dcc="${esc(c)}" aria-pressed="${dcc===c}">${esc(c)}</button>`).join("")}</div>
    ${show.map(c=>`<section class="topic"><h2>${esc(c)}</h2><div class="mgrid">${DM.filter(m=>m.cat===c).map(m=>`<article class="card mcard"><div><h3>${esc(m.q)}</h3><div class="unit">${esc(m.n)} · ${esc(m.u)} · ${m.dir>0?"higher is better":"lower is better"}</div></div>
      <div class="chartbox" id="dch-${m.id}" data-dauto="${m.id}"></div><p class="why"><b>Why it matters:</b> ${esc(m.why)}</p><p class="caveat">${esc(m.note)} Sources: ${srcs(m.srcs)}.</p></article>`).join("")}</div></section>`).join("")}
    ${note()}</div>`}

/* ---------- manifestos ---------- */
function sManifesto(){
  return `<div class="wrap page">${crumbs("2025 manifestos")}<div class="phead"><h1 tabindex="-1" id="flowh">What every party promised Delhi in 2025</h1><p class="intro">Key promises from the February 2025 election, issue by issue. BJP won, so its promises can be checked; the others can't be tested yet.</p></div>
    <div class="pills" role="group" aria-label="Jump to issue">${DISSUES.map(i=>`<button data-to="dm-${i.id}">${esc(i.n)}</button>`).join("")}</div>
    ${DISSUES.map(i=>{const others=[...new Set(DNOW.filter(x=>!SIDES3.includes(x.pa)&&x.iss.includes(i.id)).map(x=>x.pa))];
      return `<section class="topic" id="dm-${i.id}"><h2>${esc(i.n)}</h2><div class="cols cols3">${SIDES3.map(al=>`<div class="card col ${al}">${colHead(al,al==="bjp"?"Sankalp Patra":al==="aap"?"15 guarantees":"Manifesto")}${nowCol(al,i.id)}</div>`).join("")}</div>
      ${others.length?`<div class="cols">${others.map(pa=>`<div class="card col oth">${colHead(pa,"Manifesto")}${nowCol(pa,i.id)}</div>`).join("")}</div>`:""}</section>`}).join("")}
    <section class="topic"><h2>Parties without a reported manifesto</h2><div class="card llist">${Object.keys(DNOMANI).map(pa=>`<div class="lrow"><span>${pb(pa)} <b>${esc(PTY[pa].full)}</b><br><span class="small muted">${esc(DNOMANI[pa])}${DNOMANI_SRC[pa]?" "+src(DNOMANI_SRC[pa]):""}</span></span><span class="small">${PTY[pa].vs!=null?fmt(PTY[pa].vs,2)+"% of votes":""}</span></div>`).join("")}</div></section>
    <div class="note"><b>Reading new promises</b><ul style="margin:0;padding-left:18px;display:grid;gap:4px"><li>Check the track record on the <a href="#promises">promise tracker</a>: some promises, like statehood and cleaning the Yamuna, keep coming back.</li><li>Look for numbers and dates; those can be checked later.</li><li>Ask what it costs: none of these manifestos prices every promise.</li></ul></div></div>`}

/* ---------- Help me decide ---------- */
let ddec=st("pdk_ddec");if(!ddec||!Array.isArray(ddec.issues))ddec={issues:[],step:0,ans:{}};ddec.issues=ddec.issues.filter(id=>DI[id]);if(!ddec.ans)ddec.ans={};
const dsave=()=>st("pdk_ddec",ddec);
const CH=[["inc","Congress"],["aap","AAP"],["bjp","BJP"],["other","Another party"],["same","No clear difference"],["unsure","Not sure"]];
const CHN=Object.fromEntries(CH);
function prog(){const n=ddec.issues.length,s=ddec.step,total=Math.max(n,1)+2,cur=s===0?0:(s<=n?s:total-1);
  const label=s===0?"Step 1 · Choose your issues":s<=n?`Issue ${s} of ${n}`:"Your summary";
  return `<div class="prog" aria-label="Progress"><div class="prog-top"><b>${label}</b><span class="muted">${s>0&&s<=n?esc(DI[ddec.issues[s-1]].n):"Delhi Assembly"}</span></div><div class="prog-track">${Array.from({length:total},(_,i)=>`<i class="${i<cur?"done":i===cur?"now":""}"></i>`).join("")}</div></div>`}
function sDecide(){
  const n=ddec.issues.length;if(ddec.step>n+1)ddec.step=n+1;if(!n)ddec.step=0;
  if(ddec.step===0)return `<div class="wrap narrow flow">${prog()}<div style="display:grid;gap:8px"><h1 tabindex="-1" id="flowh" style="font-size:clamp(26px,3.6vw,36px);font-weight:800">What matters most to you in Delhi?</h1><p class="intro">Choose up to 4 issues. You'll look at each one in turn.</p></div>
    <div class="picks" role="group" aria-label="Issues">${DISSUES.map(i=>`<button class="pick" data-dpick="${i.id}" aria-pressed="${ddec.issues.includes(i.id)}"><span class="ic">${ico(i.ic,22)}</span><b>${esc(i.n)}</b><span class="h" lang="hi">${i.hi}</span><span class="d">${esc(i.d)}</span></button>`).join("")}</div></div>
    <div class="actionbar"><div class="wrap narrow in"><span class="status" id="dstatus" aria-live="polite">${n?`${n} of 4 chosen`:"Choose at least one issue"}</span><button class="btn btn-p" data-dnext="1" ${n?"":"disabled"}>Continue →</button></div></div>`;
  if(ddec.step<=n){const iss=DI[ddec.issues[ddec.step-1]],ans=ddec.ans[iss.id];
    return `<div class="wrap narrow flow">${prog()}<div style="display:grid;gap:8px"><div class="ptitle"><span class="ic">${ico(iss.ic,28)}</span><h1 tabindex="-1" id="flowh">${esc(iss.n)}<span class="hi2" lang="hi">${iss.hi}</span></h1></div><p class="intro">${esc(iss.d)}</p></div>
      ${issueBody(iss)}
      <section class="card choose"><h2 id="dchooseh">On ${esc(iss.n.toLowerCase())}, who convinced you most?</h2><p class="muted small">Think about both their record and their 2025 promises. There's no right answer.</p>
        <div class="choices choices6" role="group" aria-labelledby="dchooseh">${CH.map(([k,l])=>`<button class="choice ${SIDES3.includes(k)?k:""}" data-dans="${k}" aria-pressed="${ans===k}">${SIDES3.includes(k)?pav(k):'<span class="dot" aria-hidden="true"></span>'}${l}</button>`).join("")}</div></section></div>
      <div class="actionbar"><div class="wrap narrow in"><button class="btn btn-g" data-dback="1">← Back</button><button class="btn btn-p" data-dnext="1">${ans?(ddec.step===n?"See my summary":"Next issue"):"Skip for now"} →</button></div></div>`}
  const c={};ddec.issues.forEach(id=>{const a=ddec.ans[id]||"unsure";c[a]=(c[a]||0)+1});
  const lean=SIDES3.concat(["other"]).filter(k=>c[k]).sort((a,b)=>c[b]-c[a]);
  const line=lean.length?`On the issues you picked, you leaned towards ${lean.map(k=>`<b>${CHN[k]}</b> on ${c[k]}`).join(", ")}.`:"You didn't lean towards any party on the issues you picked.";
  return `<div class="wrap narrow flow">${prog()}<div style="display:grid;gap:8px"><h1 tabindex="-1" id="flowh" style="font-size:clamp(26px,3.6vw,36px);font-weight:800">Your summary</h1><p class="intro">Built only from your own answers. This site doesn't score or rank anyone.</p></div>
    <div class="card tally"><p style="font-size:18px">${line}</p></div>
    <div class="card"><ul class="answers">${ddec.issues.map((id,i)=>{const a=ddec.ans[id];return `<li><span class="n">${esc(DI[id].n)}</span><span style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><span class="chipc ${SIDES3.includes(a)?a:""}">${a?CHN[a]:"Skipped"}</span><button class="linkbtn" data-dgoto="${i+1}">Change</button></span></li>`}).join("")}</ul></div>
    <section class="blk"><div class="blk-h"><h2>Before you vote</h2></div><div class="note">You vote for a candidate in your constituency. Check who is standing where you live, and their records.</div>
      <div class="links"><a class="card" href="#netas"><b>Check your netas</b><span>Your MLA and MP, and every candidate's sworn records on MyNeta.</span></a><a class="card" href="#myvote"><b>How do I vote?</b><span>Eligibility, the voter list, and what to carry.</span></a></div></section>
    <div class="ctas"><button class="btn btn-g" data-drestart="1">Start over</button><a class="btn btn-g" href="#compare">Compare governments</a><a class="btn btn-g" href="#mynotes">My notes</a></div></div>`;
}

/* ---------- routing hooks ---------- */
const OVR={home:[sHome,"Delhi: compare before you vote"],issues:[sIssues,"Delhi: browse by issue"],compare:[sCompare,"Compare Delhi's governments"],promises:[sPromises,"Delhi promise tracker"],charts:[sCharts,"How did Delhi do?"],manifesto:[sManifesto,"Delhi 2025 manifestos"],decide:[sDecide,"Help me decide: Delhi"]};
X.view=(route)=>scope()==="state"&&OVR[route]?{v:OVR[route][0],t:OVR[route][1]}:null;
const go=h=>setTimeout(()=>{if(location.hash!==h)location.replace(h);else window.dispatchEvent(new HashChangeEvent("hashchange"))},0);
Object.assign(X.routes,{
  dissue:{v:()=>sIssue(curArg()),t:"Delhi issue",nav:"issues"},
  dgov:{v:()=>sGov(curArg()),t:"Delhi government",nav:"compare"},
  dcompare:{v:()=>{const ids=curArg().split("-").filter(id=>IT[id]);if(ids.length>=2){dcmp=[...new Set(ids)].slice(0,3);st("pdk_dcmp",dcmp)}return sCompare()},t:"Compare Delhi's governments",nav:"compare"},
  delhi:{v:()=>{if(!hasState()&&X.setLoc)X.setLoc({state:"Delhi",ac:null});setScope("state");go("#home");return ""},t:"Delhi",nav:"home"},
  india:{v:()=>{setScope("centre");go("#home");return ""},t:"India",nav:"home"}
});
function curArg(){let h=(location.hash||"").slice(1);try{h=decodeURIComponent(h)}catch(e){}const k=h.indexOf("/");return k<0?"":h.slice(k+1)}

/* scope bar + ticker + charts after each render */
let origTicker=null;
function scopeBar(){let el=document.getElementById("scopebar");
  if(!el){el=document.createElement("div");el.id="scopebar";el.className="scopebar";const t=document.getElementById("ticker");t.parentNode.insertBefore(el,t.nextSibling)}
  if(!hasState()){el.hidden=true;el.innerHTML="";return}
  const s=scope();el.hidden=false;
  el.innerHTML=`<div class="wrap sb-in"><span class="sb-l">Comparing for</span><div class="seg3" role="group" aria-label="Which election"><button data-scope="state" aria-pressed="${s==="state"}">Delhi Assembly</button><button data-scope="centre" aria-pressed="${s==="centre"}">Lok Sabha (India)</button></div></div>`}
function ticker(){const t=document.getElementById("ticker");if(!t)return;if(origTicker==null)origTicker=t.innerHTML;
  if(scope()==="state"){const n=DNEWS[0];t.innerHTML=`<div class="wrap"><span class="lbl">DELHI</span><span class="txt">${esc(n.d)}: ${esc(n.t)}</span><a class="more" href="${DS[n.src].u}" target="_blank" rel="noopener">Source</a></div>`}
  else t.innerHTML=origTicker}
const prevAfter=X.after;
X.after=(route,arg)=>{if(prevAfter)prevAfter(route,arg);scopeBar();ticker();
  document.querySelectorAll("[data-dauto]").forEach(b=>dchart(b,DMS[b.dataset.dauto]));
  const brand=document.querySelector(".brand");if(brand)brand.setAttribute("href","#home");
  const nl=document.querySelector('.mainnav a[data-r="manifesto"]');if(nl)nl.textContent=scope()==="state"?"2025 manifestos":"2024 manifestos";};

/* ---------- events ---------- */
const rerender=()=>window.dispatchEvent(new HashChangeEvent("hashchange"));
document.addEventListener("toggle",e=>{const d=e.target;if(d.tagName==="DETAILS"&&d.open&&d.dataset.dchart)dchart(document.getElementById("dch-"+d.dataset.dchart),DMS[d.dataset.dchart])},true);
document.addEventListener("click",e=>{
  const t=e.target;
  const sc=t.closest("[data-scope]");if(sc){setScope(sc.dataset.scope);const h=location.hash;if(sc.dataset.scope==="centre"&&/^#(dissue|dgov|dcompare)/.test(h))location.hash="home";else rerender();return}
  const fg=t.closest("[data-dfgo]");if(fg){location.hash=fg.dataset.dfgo==="issue"?"dissue/"+$("#dfi").value:"dgov/"+$("#dfg").value;return}
  const hh=t.closest("[data-dh2h]");if(hh){dh2h=hh.dataset.dh2h;const box=$("#dh2h");box.innerHTML=h2hBox();if(G().enhance)G().enhance(box);return}
  const hs=t.closest("[data-dhst]");if(hs){dhst=hs.dataset.dhst;document.querySelectorAll("[data-dhst]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.dhst===dhst));$("#dhprom").innerHTML=homeProm();return}
  const pf=t.closest("[data-dpf]");if(pf){dpf[pf.dataset.dpf]=pf.dataset.v;document.querySelectorAll(`[data-dpf="${pf.dataset.dpf}"]`).forEach(b=>b.setAttribute("aria-pressed",b.dataset.v===dpf[pf.dataset.dpf]));$("#dplist").innerHTML=plist();return}
  const cc=t.closest("[data-dcc]");if(cc){dcc=cc.dataset.dcc;rerender();return}
  const rm=t.closest("[data-drm]");if(rm){dcmp.splice(+rm.dataset.drm,1);st("pdk_dcmp",dcmp);history.replaceState(null,"","#compare");rerender();return}
  const ai=t.closest("[data-daddiss]");if(ai){const id=ai.dataset.daddiss;if(!ddec.issues.includes(id)){if(ddec.issues.length>=4)ddec.issues.shift();ddec.issues.push(id)}ddec.step=0;dsave();location.hash="decide";return}
  const pk=t.closest("[data-dpick]");if(pk){const id=pk.dataset.dpick,i=ddec.issues.indexOf(id);if(i>=0)ddec.issues.splice(i,1);else if(ddec.issues.length>=4){const s=$("#dstatus");s.textContent="Up to 4. Remove one first.";s.classList.add("hint");return}else ddec.issues.push(id);
    dsave();const y=scrollY;rerender();setTimeout(()=>{scrollTo(0,y);const b=document.querySelector(`[data-dpick="${id}"]`);if(b)b.focus({preventScroll:true})},0);return}
  const an=t.closest("[data-dans]");if(an){ddec.ans[ddec.issues[ddec.step-1]]=an.dataset.dans;dsave();const y=scrollY;rerender();setTimeout(()=>scrollTo(0,y),0);return}
  if(t.closest("[data-dnext]")){ddec.step=Math.min(ddec.step+1,ddec.issues.length+1);dsave();rerender();return}
  if(t.closest("[data-dback]")){ddec.step=Math.max(ddec.step-1,0);dsave();rerender();return}
  const gt=t.closest("[data-dgoto]");if(gt){ddec.step=+gt.dataset.dgoto;dsave();rerender();return}
  if(t.closest("[data-drestart]")){ddec={issues:[],step:0,ans:{}};dsave();rerender();return}
});
document.addEventListener("change",e=>{const t=e.target;
  if(t.dataset.dslot!=null){const i=+t.dataset.dslot,v=t.value,j=dcmp.indexOf(v);if(j>=0&&j!==i)dcmp[j]=dcmp[i];dcmp[i]=v;st("pdk_dcmp",dcmp);history.replaceState(null,"","#compare");rerender();return}
  if(t.dataset.dadd&&t.value){dcmp.push(t.value);dcmp=dcmp.slice(0,3);st("pdk_dcmp",dcmp);history.replaceState(null,"","#compare");rerender();return}
  if(t.id==="dpiss"){dpf.iss=t.value;$("#dplist").innerHTML=plist();return}
});
let rt;window.addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(()=>{document.querySelectorAll("[data-dauto]").forEach(b=>dchart(b,DMS[b.dataset.dauto]));document.querySelectorAll("details[data-dchart][open]").forEach(d=>dchart(document.getElementById("dch-"+d.dataset.dchart),DMS[d.dataset.dchart]))},150)});
})();
