/* Every other state: when a voter picks a state other than Delhi, home, issues, compare, promises, charts, manifestos and
   Help me decide switch to that state's parties and governments since 2004. Delhi keeps its own fuller pages (state.js). */
(function(){
"use strict";
const X=window.PPD_EXT;if(!X||typeof SDATA==="undefined")return;
const G=()=>window.PPD;
const esc=s=>G().esc(s),fmt=(v,d)=>G().fmt(v,d),pill=k=>G().pill(k),sbar=c=>G().statusBar(c),sh=(a,b,c)=>G().sh(a,b,c);
function st(k,v){try{if(v===undefined)return JSON.parse(localStorage.getItem(k));localStorage.setItem(k,JSON.stringify(v))}catch(e){return null}}
const $=s=>document.querySelector(s);
const DEEP=typeof SDEEP!=="undefined"?SDEEP:{};
const DSRC=typeof SDS!=="undefined"?SDS:{};
const RBIU="https://rbi.org.in/Scripts/AnnualPublications.aspx?head=Handbook+of+Statistics+on+Indian+States";
const SRC={rbi:{u:"https://rbidocs.rbi.org.in/rdocs/Publications/PDFs/0HANDBOOK111225883086B042ED449F9C3DDACAB54415D8.PDF",t:"RBI, Handbook of Statistics on Indian States 2024-25"},
  rbi23:{u:"https://rbidocs.rbi.org.in/rdocs/Publications/PDFs/HANDBOOK09122024426229B8B51C4BDE99607F1ADC64154A.PDF",t:"RBI Handbook 2023-24 (2004-05 base years)"},
  wcm:n=>({u:"https://en.wikipedia.org/wiki/"+encodeURIComponent(("Chief Minister of "+n).replace(/ /g,"_")),t:"Chief Ministers of "+n+" (Wikipedia)"}),
  wel:(y,n)=>({u:"https://en.wikipedia.org/wiki/"+encodeURIComponent((y+" "+n+" Legislative Assembly election").replace(/ /g,"_")),t:y+" "+n+" election results (Wikipedia, from ECI data)"}),
  e27:{u:"https://en.wikipedia.org/wiki/2027_elections_in_India",t:"2027 elections in India (Wikipedia)"},
  art172:{u:"https://www.constitutionofindia.net/articles/article-172-duration-of-state-legislatures/",t:"Constitution of India, Article 172 (five-year term)"},
  myneta:{u:"https://www.myneta.info/",t:"MyNeta (ADR)"},esr:{u:"https://electoralsearch.eci.gov.in/",t:"ECI electoral search"}};
const lk=s=>s?G().link(s.u,s.t):"";
const dsrc=k=>DSRC[k]?G().link(DSRC[k].u,DSRC[k].t):"";
const dsrcs=ks=>(ks||[]).map(dsrc).filter(Boolean).join(" · ");

/* ---------- parties ---------- */
const PI=id=>SPARTY[id]||["Other",id,"#6b6f80"];
const pname=id=>PI(id)[0];
const pfull=id=>PI(id)[1];
const pcol=id=>PI(id)[2];
const pvars=id=>{const c=pcol(id);return `--c:${c};--pc:${c};--soft:color-mix(in srgb,${c} 11%,#fff);--tint:color-mix(in srgb,${c} 12%,transparent)`};
const pabbr=id=>{if(id==="inc")return "INC";const s=pname(id);if(s.length<=5)return s.toUpperCase()===s?s:s.slice(0,4).toUpperCase();return s.split(/[ (]+/).filter(Boolean).map(w=>w[0]).join("").slice(0,4).toUpperCase()};
const pb=id=>`<span class="pb" style="--pc:${pcol(id)}">${esc(pname(id))}</span>`;
const pav=(id,cls)=>`<span class="pav ${cls||""}" style="--pc:${pcol(id)}" aria-hidden="true">${esc(pabbr(id))}</span>`;

/* ---------- scope ---------- */
const getLoc=()=>X.getLoc?X.getLoc():st("pdk_loc");
const cur=()=>{const l=getLoc();return l&&l.state&&l.state!=="Delhi"&&SDATA[l.state]?l.state:null};
const scope=()=>cur()&&st("pdk_scope")!=="centre"?"state":"centre";

/* ---------- measures (RBI Handbook) ---------- */
const MS=[
 {id:"g",n:"Economic growth",q:"How fast did the state's economy grow?",u:"real GSDP growth, % a year",kind:"flow",fy:1,dir:1,d:1,cat:"Economy",iss:"econ",why:"Growth in the value of everything produced in the state, after inflation. Faster growth usually means more jobs and income.",note:"Constant prices. 2005-06 to 2011-12 are on the 2004-05 base; later years on the 2011-12 base, so the series is joined at 2012."},
 {id:"p",n:"Income per person",q:"How fast did income per person grow?",u:"real per-person NSDP growth, % a year",kind:"flow",fy:1,dir:1,d:1,cat:"Economy",iss:"econ",why:"Growth in average income per resident, after inflation. It adjusts growth for population.",note:"Constant prices. Base years joined at 2012, as above."},
 {id:"i",n:"Infant mortality",q:"Did fewer babies die?",u:"deaths per 1,000 live births",kind:"stock",fy:0,dir:-1,d:0,cat:"Health",iss:"health",why:"How many babies die before their first birthday. It reflects hospitals, nutrition, clean water and mothers' health.",note:"Sample Registration System, calendar years. It is easier to cut a high rate than a low one."},
 {id:"f",n:"Borrowing (fiscal deficit)",q:"How much did the government borrow?",u:"gross fiscal deficit, % of GSDP",kind:"flow",fy:1,dir:-1,d:1,cat:"State finances",iss:"money",why:"How much the state borrowed each year to cover the gap between spending and income. The legal limit is usually 3% of GSDP, raised in some years.",note:"Actual accounts. Lower means less new borrowing, but borrowing can pay for useful building too."},
 {id:"e",n:"Power available per person",q:"Did people get more electricity?",u:"kWh per person a year",kind:"stock",fy:1,dir:1,d:0,cat:"Electricity",iss:"power",why:"Electricity made available in the state, divided by its population. It rises with homes, farms and industry getting power.",note:"Central Electricity Authority, from 2011-12 when its method changed."},
 {id:"c",n:"Price rise",q:"How fast did prices rise?",u:"CPI (combined) inflation, % a year",kind:"flow",fy:1,dir:-1,d:1,cat:"Prices",iss:"prices",why:"How fast the cost of living rose. It is driven mostly by national and global prices, so a state government has limited control.",note:"From 2014-15. Read with care: inflation is shaped mostly by the Centre, the RBI and world prices."}];
const MI=Object.fromEntries(MS.map(m=>[m.id,m]));
const yl=(y,m)=>m.fy?`${y}-${String(y+1).slice(2)}`:String(y);

/* ---------- issues ---------- */
const ISS=[
 {id:"econ",n:"Economy and jobs",hi:"अर्थव्यवस्था और रोज़गार",d:"Growth, incomes, jobs and industry.",ic:"economy",ms:["g","p"]},
 {id:"farm",n:"Farmers",hi:"किसान",d:"Crop prices, irrigation, loans and rural income.",ic:"farmers",ms:[]},
 {id:"health",n:"Health",hi:"स्वास्थ्य",d:"Hospitals, health cover and child health.",ic:"health",ms:["i"]},
 {id:"edu",n:"Schools and education",hi:"शिक्षा",d:"Schools, colleges, teachers and students.",ic:"education",ms:[]},
 {id:"women",n:"Women",hi:"महिलाएँ",d:"Cash support, safety and opportunities for women.",ic:"women",ms:[]},
 {id:"welfare",n:"Welfare",hi:"कल्याण",d:"Pensions, rations, housing and help for the poor.",ic:"welfare",ms:[]},
 {id:"power",n:"Electricity and water",hi:"बिजली और पानी",d:"Power supply, bills and drinking water.",ic:"services",ms:["e"]},
 {id:"money",n:"State finances",hi:"राज्य के वित्त",d:"Borrowing, debt and how the budget is managed.",ic:"debt",ms:["f"]},
 {id:"prices",n:"Prices",hi:"महँगाई",d:"Cost of living, fuel and gas cylinders.",ic:"prices",ms:["c"]},
 {id:"law",n:"Law, order and governance",hi:"क़ानून व्यवस्था और शासन",d:"Policing, laws, corruption and public services.",ic:"governance",ms:[]}];
const II=Object.fromEntries(ISS.map(i=>[i.id,i]));
const ico=(k,sz)=>G().ico(k,sz);

/* ---------- model of one state ---------- */
const DAY=864e5,NOW=Date.now();
const MC={};
function model(name){
  if(MC[name])return MC[name];
  const S=SDATA[name],R=SRBI[name]||{},deep=DEEP[name]||null;
  const g=S.gov.map((x,i)=>({i,p:x[0],cm:x[1],a:Date.parse(x[2]),b:x[3]?Date.parse(x[3]):NOW,as:x[2],bs:x[3]}));
  // chief-minister tenures: the same CM and party in a row (a spell of President's rule in between doesn't break it)
  const ten=[];let last=null;
  g.forEach(e=>{if(e.p==="pr")return;if(last&&last.p===e.p&&last.cm===e.cm){last.b=e.b;last.bs=e.bs;last.parts.push(e)}else{last={id:"c"+ten.length,kind:"cm",p:e.p,cm:e.cm,a:e.a,b:e.b,as:e.as,bs:e.bs,parts:[e]};ten.push(last)}});
  const yr=t=>new Date(t).getUTCFullYear();
  ten.forEach(t=>{const a=yr(t.a),b=t.bs?yr(t.b):null;t.span=b==null?`${a}–now`:a===b?String(a):`${a}–${String(b).slice(a.toString().slice(0,2)===b.toString().slice(0,2)?2:0)}`;t.name=t.cm;t.ongoing=!t.bs;t.days=(t.b-t.a)/DAY});
  // who governed each year: the government in office for most of it
  const own={f:{},c:{}};
  const lastY=2025;
  for(let y=S.since;y<=lastY;y++)["f","c"].forEach(k=>{const a=Date.UTC(y,k==="f"?3:0,1),b=Date.UTC(k==="f"?y+1:y+1,k==="f"?3:0,1);
    const days={};g.forEach(e=>{const o=Math.min(b,e.b)-Math.max(a,e.a);if(o>0){const key=e.p==="pr"?"pr":ten.find(t=>t.parts.includes(e)).id;days[key]=(days[key]||0)+o}});
    const best=Object.keys(days).sort((x,z)=>days[z]-days[x])[0];if(best&&best!=="pr"&&days[best]>=(b-a)*0.5)own[k][y]=best});
  // sides: each party's whole time in office, and each chief minister
  const parties=[];ten.forEach(t=>{if(!parties.includes(t.p))parties.push(t.p)});
  const IT={};
  ten.forEach(t=>{IT[t.id]=Object.assign(t,{years:{f:new Set(Object.keys(own.f).filter(y=>own.f[y]===t.id).map(Number)),c:new Set(Object.keys(own.c).filter(y=>own.c[y]===t.id).map(Number))}})});
  parties.forEach(p=>{const ts=ten.filter(t=>t.p===p);const runs=[];ts.forEach(t=>{const r=runs[runs.length-1];const prev=r&&ten.indexOf(r.last)===ten.indexOf(t)-1;if(prev){r.b=t.b;r.bs=t.bs;r.last=t}else runs.push({a:t.a,b:t.b,bs:t.bs,last:t})});
    const span=runs.map(r=>{const a=yr(r.a),b=r.bs?yr(r.b):null;return b==null?`${a}–now`:a===b?String(a):`${a}–${String(b).slice(2)}`}).join(", ");
    IT["p-"+p]={id:"p-"+p,kind:"party",p,name:pname(p),span,cms:[...new Set(ts.map(t=>t.cm))],ongoing:ts.some(t=>t.ongoing),tens:ts.map(t=>t.id),
      years:{f:new Set(ts.flatMap(t=>[...t.years.f])),c:new Set(ts.flatMap(t=>[...t.years.c]))}}});
  const last2=S.el[0];const curT=ten[ten.length-1];
  // options for compare: parties first, then chief ministers who served at least six months
  const ORDER=[...parties.map(p=>"p-"+p),...ten.filter(t=>t.days>=180||t.ongoing).map(t=>t.id)];
  // default match-up: the parties that governed most recently; one-party states compare chief ministers
  const byRecent=[...parties].sort((a,b)=>Math.max(...ten.filter(t=>t.p===b).map(t=>t.b))-Math.max(...ten.filter(t=>t.p===a).map(t=>t.b)));
  const nyrs=p=>IT["p-"+p].years.f.size;
  let DEF=[...byRecent].sort((a,b)=>nyrs(b)-nyrs(a)||byRecent.indexOf(a)-byRecent.indexOf(b)).filter(p=>nyrs(p)>0||p===curT.p).slice(0,3).map(p=>"p-"+p);
  if(DEF.length<2)DEF=ten.filter(t=>t.days>=365||t.ongoing).slice(-3).map(t=>t.id);
  // parties for "who convinced you": anyone who governed or won at least 5% last time, biggest first, max 4
  const vs={};last2[4].forEach(r=>{if(r[0]!=="ind"&&r[0]!=="oth")vs[r[0]]=r[2]||0});
  const choiceP=[...new Set([...Object.keys(vs).filter(p=>vs[p]>=5||parties.includes(p))])].sort((a,b)=>(vs[b]||0)-(vs[a]||0)).filter(p=>vs[p]>=5||parties.slice(-2).includes(p)).slice(0,4);
  // promise and manifesto data
  const prom=deep?deep.prom.map((p,i)=>Object.assign({i,party:deep.won.p},p)):[];
  const mani=deep?deep.mani:[];
  const issues=ISS.filter(i=>i.ms.some(id=>R[id]&&Object.keys(R[id]).length)||prom.some(p=>p.iss.includes(i.id))||mani.some(x=>x.iss.includes(i.id)));
  MC[name]={name,S,R,deep,g,ten,own,IT,parties,ORDER,DEF,cur:curT,last:last2,choiceP,prom,mani,issues,code:S.code};
  return MC[name];
}

/* ---------- stats ---------- */
function stat(M,m,id){
  const s=M.R[m.id];if(!s)return null;const it=M.IT[id];const ys=[...it.years[m.fy?"f":"c"]].sort((a,b)=>a-b);
  const have=Object.keys(s).map(Number);if(!have.length)return null;const lo=Math.min(...have),hi=Math.max(...have);
  const inr=ys.filter(y=>y>=lo&&y<=hi);
  if(m.kind==="flow"){const v=ys.filter(y=>s[y]!=null);if(!v.length)return null;return {avg:v.reduce((t,y)=>t+s[y],0)/v.length,n:v.length,of:Math.max(inr.length,v.length)}}
  // levels: start and end of each continuous stretch in office, plus the average change a year
  const runs=[];ys.forEach(y=>{const r=runs[runs.length-1];if(r&&y===r.b+1)r.b=y;else runs.push({a:y,b:y})});
  const out=[];let dsum=0,dn=0;
  runs.forEach(r=>{const a=s[r.a-1]!=null?r.a-1:(s[r.a]!=null?r.a:null);let b=null;for(let y=r.b;y>=r.a;y--)if(s[y]!=null){b=y;break}
    if(a==null||b==null)return;if(b>a){out.push({a,va:s[a],b,vb:s[b]});dsum+=s[b]-s[a];dn+=b-a}else out.push({a,va:s[a],b:null,vb:null})});
  if(!out.length)return null;return {runs:out,dpy:dn?dsum/dn:null,yrs:dn};
}
function bestOf(M,m,ids){if(m.kind!=="flow")return null;const v=ids.map(id=>{const s=stat(M,m,id);return s&&s.n>=2?[id,s.avg]:null}).filter(Boolean);
  if(v.length<2||new Set(v.map(x=>x[1].toFixed(6))).size<2)return null;const bv=m.dir>0?Math.max(...v.map(x=>x[1])):Math.min(...v.map(x=>x[1]));return v.filter(x=>Math.abs(x[1]-bv)<1e-9).map(x=>x[0])}
const cellStock=(s,m)=>{const r=s.runs.map(r=>r.b==null?`${fmt(r.va,m.d)} (${yl(r.a,m)})`:`${fmt(r.va,m.d)} → ${fmt(r.vb,m.d)}`).join("; ");
  const yrs=s.runs.filter(r=>r.b!=null).map(r=>`${yl(r.a,m)} to ${yl(r.b,m)}`).join("; ");return {v:r,sub:s.dpy!=null?`${s.dpy>0?"Up":"Down"} ${fmt(Math.abs(s.dpy),m.d===0?1:m.d)} a year${yrs?` · ${yrs}`:""}`:"one year only"}};
const sum=o=>Object.values(o).reduce((a,b)=>a+b,0);
const sideIds=(M,id)=>{const it=M.IT[id];return it.kind==="party"?it.tens:[id]};
const promOf=(M,id)=>{if(!M.deep)return [];const it=M.IT[id],t0=Date.UTC(M.deep.won.y,1,1);if(it.p!==M.deep.won.p)return [];
  const ts=it.kind==="party"?it.tens.map(x=>M.IT[x]):[it];return ts.some(t=>t.b>t0)?M.prom:[]};
const tallyOf=(M,id)=>{const c={ach:0,part:0,not:0,con:0,prog:0};promOf(M,id).forEach(p=>c[p.s]++);return c};
const sideLabel=(M,id)=>{const it=M.IT[id];return it.kind==="party"?`${pname(it.p)}, ${it.span}`:`${it.cm}, ${it.span}`};

/* ---------- cards ---------- */
function mcard(M,m,ids){
  ids=ids||M.DEF;const best=bestOf(M,m,ids)||[];let max=1;
  if(m.kind==="flow")max=Math.max(...ids.map(id=>{const s=stat(M,m,id);return s?Math.abs(s.avg):0}),0)||1;
  const cells=ids.map(id=>{const it=M.IT[id],s=stat(M,m,id),k=`<span class="k">${esc(sideLabel(M,id))}</span>`;
    if(!s)return `<div class="side" style="${pvars(it.p)}">${k}<span class="v muted">No data</span><span class="s">${it.ongoing&&!it.years.f.size?"Not published yet":"Not in these years"}</span></div>`;
    if(m.kind==="flow")return `<div class="side" style="${pvars(it.p)}">${k}<span class="v">${fmt(s.avg,m.d)}</span><span class="bar1"><i style="width:${Math.abs(s.avg)/max*100}%"></i></span><span class="s">average a year${s.n<s.of?` · ${s.n} of ${s.of} years have data`:` · ${s.n} year${s.n>1?"s":""}`}</span>${best.includes(id)?'<span class="better">✓ Better</span>':""}</div>`;
    const c=cellStock(s,m);return `<div class="side" style="${pvars(it.p)}">${k}<span class="v" style="font-size:19px">${c.v}</span><span class="s">${c.sub}</span></div>`}).join("");
  const verdict=m.kind==="flow"?(best.length?`<p class="verdict small muted">✓ Better marks the best yearly average on this measure only (${m.dir>0?"higher":"lower"} is better), among sides with at least two years of data.</p>`:`<p class="verdict small muted">Not enough years of data on more than one side to say which was better.</p>`)
    :`<p class="verdict small muted">${m.dir>0?"Higher":"Lower"} is better. Compare how far it moved while each was in office, not where it ended.</p>`;
  const ind=m.id==="i"?`<div class="comp"><b class="comp-h">Read it with</b><ul><li><b>India</b>: ${(()=>{const ks=Object.keys(SRBI_IN).map(Number).filter(y=>y>=M.S.since);return ks.length?`${SRBI_IN[ks[0]]} in ${ks[0]} → ${SRBI_IN[ks[ks.length-1]]} in ${ks[ks.length-1]}`:""})()}. ${M.name}'s latest: ${(()=>{const s=M.R.i||{},ks=Object.keys(s).map(Number);return ks.length?`${s[Math.max(...ks)]} in ${Math.max(...ks)}`:"n/a"})()}.</li></ul></div>`:"";
  return `<article class="card mc"><h3>${esc(m.q)}<span class="u">${esc(m.n)} · ${esc(m.u)}</span></h3>
    <div class="duo duo3">${cells}</div>${verdict}${ind}<div class="opline">${X.op?X.op(`sm:${M.code}:${m.id}`,`${M.name}: ${m.n}`):""}</div>
    <details data-schart="${m.id}"><summary>Year-by-year chart and sources</summary><div class="chartbox" id="sch-${m.id}"></div>
    <p style="margin-top:8px">${esc(m.note)} Source: ${lk(SRC.rbi)}${m.id==="g"||m.id==="p"?" · "+lk(SRC.rbi23):""}.</p></details></article>`;
}

/* ---------- chart with government bands ---------- */
function schart(M,box,m){
  if(!box||!m)return;const s=M.R[m.id]||{},ys=Object.keys(s).map(Number).sort((a,b)=>a-b);if(!ys.length){box.innerHTML='<p class="empty">No data.</p>';return}
  const W=Math.max(280,box.clientWidth||500),H=210,pl=40,pr=12,pt=26,pb2=24;
  const x0=Math.min(ys[0],M.S.since)-0.5,x1=Math.max(ys[ys.length-1],2024)+0.5;
  let lo=Math.min(...ys.map(y=>s[y])),hi=Math.max(...ys.map(y=>s[y]));if(m.kind==="flow"&&lo>0)lo=0;
  const pad=(hi-lo)*0.08||1;lo=lo<0?lo-pad:Math.max(0,lo-pad);hi+=pad;
  const Xs=y=>pl+(y-x0)/(x1-x0)*(W-pl-pr),Y=v=>pt+(1-(v-lo)/(hi-lo))*(H-pt-pb2);
  let g=`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(M.name)}: ${esc(m.n)}, ${yl(ys[0],m)} to ${yl(ys[ys.length-1],m)}">`;
  const own=M.own[m.fy?"f":"c"];const runs=[];
  for(let y=Math.ceil(x0);y<=Math.floor(x1);y++){const t=own[y],p=t?M.IT[t].p:null;const r=runs[runs.length-1];if(r&&r.p===p&&r.b===y-1)r.b=y;else runs.push({p,a:y,b:y})}
  runs.forEach(r=>{if(!r.p)return;const a=Xs(r.a-0.5),b=Xs(r.b+0.5);g+=`<rect x="${a}" y="${pt-18}" width="${b-a}" height="${H-pb2-pt+18}" fill="${pcol(r.p)}" fill-opacity=".13"/>`;
    if(b-a>40)g+=`<text x="${a+4}" y="${pt-7}" class="bl">${esc(pname(r.p))}</text>`});
  [lo,(lo+hi)/2,hi].forEach(v=>{g+=`<line x1="${pl}" x2="${W-pr}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--rule)"/><text x="${pl-6}" y="${Y(v)+4}" text-anchor="end">${fmt(v,Math.abs(hi-lo)<10?1:0)}</text>`});
  if(lo<0)g+=`<line x1="${pl}" x2="${W-pr}" y1="${Y(0)}" y2="${Y(0)}" stroke="var(--muted)"/>`;
  const step=x1-x0>16?4:2;for(let y=Math.ceil(x0);y<=x1;y++)if(y%step===0)g+=`<text x="${Xs(y)}" y="${H-6}" text-anchor="middle">${y}</text>`;
  let path="",prev=null;ys.forEach(y=>{path+=(prev!=null&&y-prev===1?"L":"M")+Xs(y).toFixed(1)+" "+Y(s[y]).toFixed(1)+" ";prev=y});
  g+=`<path d="${path}" fill="none" stroke="var(--line)" stroke-width="2" stroke-linejoin="round"/>`;
  ys.forEach(y=>{if(ys.length<12||y===ys[ys.length-1])g+=`<circle cx="${Xs(y)}" cy="${Y(s[y])}" r="3.5" fill="var(--line)"/>`});
  const ly=ys[ys.length-1];g+=`<text x="${Xs(ly)-4}" y="${Y(s[ly])-8}" text-anchor="end" style="fill:var(--ink);font-weight:600">${fmt(s[ly],m.d)}</text></svg>`;
  box.innerHTML=g+`<p class="small muted">${ys.length} ${m.fy?"financial years":"years"}: ${yl(ys[0],m)} to ${yl(ly,m)}. Bands show the party of the Chief Minister in office for most of each year.</p>`;
}

/* ---------- shared pieces ---------- */
const crumbs=(M,t)=>`<p class="crumbs"><a href="#home">${esc(M.name)}</a> › ${t}</p>`;
const note=M=>`<p class="small muted">Numbers come from one national source, the ${lk(SRC.rbi)}. Each year counts for the government in office for most of it (April–March for financial years). Years under President's rule count for no one. ${M.S.notes.map(esc).join(" ")}</p>`;
const promItem=(M,p)=>`<li><div class="tags">${pill(p.s)}<span class="m">${esc(pname(p.party))} · ${esc((M.deep.ml||{})[p.party]||"Manifesto")} ${M.deep.won.y}</span></div><span class="t">${esc(p.p)}</span><span class="e">${esc(p.e)}</span><details><summary>Sources</summary>${dsrcs(p.src)}</details>${X.op?X.op(`sp:${M.code}:${p.p.slice(0,40)}`,p.p):""}</li>`;
const maniItem=x=>`<li><span class="t">${esc(x.p)}</span><details><summary>Source</summary>${dsrcs(x.src)}</details></li>`;
function maniCol(M,pa,iss){const l=M.mani.filter(x=>x.pa===pa&&(!iss||x.iss.includes(iss)));return l.length?`<ul class="plist2">${l.map(maniItem).join("")}</ul>`:`<p class="empty">Nothing on this in the promises we found.</p>`}
const colHead=(pa,sub)=>`<div class="col-h"><b>${pb(pa)} ${esc(pfull(pa))}</b><span>${sub}</span></div>`;
function partyRows(M,e){const max=Math.max(...e[4].map(r=>r[2]||0))||1;
  return `<div class="card prow-wrap"><ul class="prows">${e[4].map(r=>`<li class="prow" style="${pvars(r[0])}"><span class="pn">${r[0]==="ind"||r[0]==="oth"?`<span class="pb poth">${esc(pname(r[0]))}</span>`:pb(r[0])}<span class="pf">${esc(r[0]==="oth"?"Smaller parties and independents":pfull(r[0]))}</span></span><span class="ptrack"><i style="width:${r[2]?Math.max(r[2]/max*100,0.8):0}%"></i></span><span class="pv"><b>${r[2]!=null?fmt(r[2],r[2]<1?2:1)+"%":"–"}</b><small>${r[1]} seat${r[1]===1?"":"s"}${r[3]?` of ${r[3]} contested`:""}</small></span></li>`).join("")}</ul>
  <p class="small muted">${e[0]} result, ${e[1]}: ${e[2]} seats${e[3]?`, turnout ${fmt(e[3],1)}%`:""}. ${esc(e[5]||"")} Parties with no seat and under 1% of the vote are left out. ${lk(SRC.wel(e[0],M.name))}</p></div>`}
function govTimeline(M){
  return `<div class="card"><ol class="gtl">${M.g.slice().reverse().map(e=>`<li style="${e.p==="pr"?"--c:#6b6f80":pvars(e.p)}"><span class="gtl-d">${esc(e.as.slice(0,4))}${e.bs?"–"+esc(e.bs.slice(0,4)):"–now"}</span><span>${e.p==="pr"?`<b>${esc(e.cm)}</b><small>No elected government</small>`:`<b>${esc(e.cm)}</b><small>${pb(e.p)} ${esc(pfull(e.p))}</small>`}</span></li>`).join("")}</ol>
  <p class="small muted">From the government in office in 2004. ${lk(SRC.wcm(M.name))}</p></div>`}
function vsCard(M,ids){return `<a class="card vs" href="#scompare/${ids.join("~")}"><div class="vs-pair vs-n" style="--k:${ids.length}">${ids.map((id,i)=>{const it=M.IT[id];return `${i?'<span class="vs-mid" aria-hidden="true">VS</span>':""}<div class="vs-side">${pav(it.p,"lgp")}<b>${esc(it.kind==="party"?pname(it.p):it.cm)}</b><span>${esc(it.span)}</span></div>`}).join("")}</div><span class="go">Compare ${ids.map(id=>M.IT[id].kind==="party"?pname(M.IT[id].p):M.IT[id].cm).join(" vs ")}</span></a>`}
function matchups(M){const ps=M.DEF.filter(id=>id.startsWith("p-"));const out=[];if(ps.length>=2)out.push(ps.slice(0,3));if(ps.length>=3)out.push(ps.slice(0,2));
  const lt=M.ten.filter(t=>t.days>=365||t.ongoing);if(lt.length>=2)out.push(lt.slice(-2).map(t=>t.id));if(lt.length>=3)out.push([lt[lt.length-3].id,lt[lt.length-1].id]);
  return out.filter((x,i)=>out.findIndex(y=>y.join()===x.join())===i).slice(0,4)}
const nextCard=M=>`<article class="card ecard"><span class="tag">State</span><b>${esc(M.name)} Legislative Assembly</b><span class="when">${esc(M.S.next[0])}</span><span class="small muted">${esc(M.S.next[1])} ${M.S.seats} seats. Now: ${esc(pname(M.cur.p))}, Chief Minister ${esc(M.cur.cm)}.</span><span class="small">${M.S.next[0].includes("2027")?lk(SRC.e27):lk(SRC.art172)}</span></article>`;

/* ---------- home ---------- */
let h2h=null;
function h2hBox(M){
  const ids=M.DEF;const opts=[...(M.prom.length?["prom"]:[]),...MS.filter(m=>M.R[m.id]).map(m=>m.id)];if(!h2h||!opts.includes(h2h))h2h=opts.includes("g")?"g":opts[0];
  let rows,unit,best=null;
  if(h2h==="prom"){rows=ids.map(id=>{const c=tallyOf(M,id),tot=sum(c);return {id,v:tot?c.ach/tot*100:null,lab:tot?`${Math.round(c.ach/tot*100)}%`:"–",sub:tot?`${c.ach} of ${tot} kept in full${M.IT[id].ongoing?", term still running":""}`:"none tracked"}});
    unit=`Share of tracked ${M.deep.won.y} promises kept in full. Only the party that won in ${M.deep.won.y} has a record to check.`}
  else{const m=MI[h2h];rows=ids.map(id=>{const s=stat(M,m,id);if(!s)return {id,v:null,lab:"No data",sub:"not in these years"};
      if(m.kind==="flow")return {id,v:s.avg,lab:fmt(s.avg,m.d),sub:`average a year, ${s.n} year${s.n>1?"s":""}`};
      const c=cellStock(s,m);return {id,v:s.dpy!=null?Math.abs(s.dpy):0,lab:s.dpy!=null?`${s.dpy>0?"+":"−"}${fmt(Math.abs(s.dpy),m.d===0?1:m.d)}`:"–",sub:`a year · ${c.v}`}});
    unit=`${esc(m.q)} ${esc(m.n)}, ${esc(m.u)} · ${m.dir>0?"higher":"lower"} is better.${m.kind==="stock"?" Shows the average change a year while in office.":""}`;const b=bestOf(M,m,ids);if(b&&b.length===1)best=b[0]}
  const max=Math.max(...rows.map(r=>Math.abs(r.v||0)))||1;
  return `<div class="pills" role="group" aria-label="Measure">${opts.map(k=>`<button data-sh2h="${k}" aria-pressed="${h2h===k}">${k==="prom"?"Promises kept":esc(MI[k].n)}</button>`).join("")}</div>
    <div class="h2h-rows">${rows.map(r=>{const it=M.IT[r.id];return `<div class="h2h-row" style="${pvars(it.p)}"><a class="h2h-who" href="#sgov/${r.id}">${pav(it.p)}<span><b>${esc(it.kind==="party"?pname(it.p):it.cm)}</b><small>${esc(it.span)}${it.kind==="party"?" · CM "+esc(it.cms.slice(-2).join(", ")):" · "+esc(pname(it.p))}</small></span></a>
      <div class="h2h-track"><i data-w="${r.v==null?0:Math.abs(r.v)/max*100}" style="background:var(--c)"></i></div><div class="h2h-v"><b>${r.lab}</b><small>${r.sub}</small>${best===r.id?'<span class="better">✓ Better</span>':""}</div></div>`}).join("")}</div>
    <p class="small muted">${unit}</p>`;
}
let shst="ach";
function homeProm(M){const l=M.prom.filter(p=>p.s===shst);return `<div class="hscroll">${l.map(p=>`<article class="card pcard st-${p.s}">${pill(p.s)}<span class="t">${esc(p.p)}</span><span class="m">${pb(p.party)} ${esc((M.deep.ml||{})[p.party]||"Manifesto")} ${M.deep.won.y}</span><span class="e">${esc(p.e)}</span></article>`).join("")||'<p class="empty">None.</p>'}</div>`}
const tile=(M,i)=>{const np=M.prom.filter(p=>p.iss.includes(i.id)).length,nm=i.ms.filter(id=>M.R[id]).length;const meta=[np?`${np} promise${np===1?"":"s"}`:"",nm?`${nm} measure${nm===1?"":"s"}`:""].filter(Boolean).join(" · ");
  return `<a class="card tile" href="#sissue/${i.id}"><span class="ic">${ico(i.ic)}</span><b>${esc(i.n)}</b><span class="hi" lang="hi">${i.hi}</span><span class="meta">${meta}</span></a>`};
function sHome(){const M=model(cur()),top=X.homeTop?X.homeTop():"";const e=M.last,deep=M.deep;
  const govP=M.parties;
  return `${top}<section class="hero"><div class="wrap hero-in">
    <div class="hero-copy"><p class="eyebrow">${esc(M.name)} Assembly · every government since ${M.S.since}</p><h1>Compare ${esc(M.name)}'s parties before you vote</h1>
      <p class="lede">How ${esc(M.name)} did while each party and Chief Minister was in power, who won last time${deep?`, and what the winners promised in ${deep.won.y} and delivered`:""}. Every number has a source.</p></div>
    <div class="card finder"><h2>Find what matters to you</h2>
      <div class="field"><label for="sfi">Choose an issue</label><select id="sfi">${M.issues.map(i=>`<option value="${i.id}">${esc(i.n)} · ${i.hi}</option>`).join("")}</select></div>
      <button class="btn btn-p" data-sfgo="issue">Compare on this issue</button>
      <div class="field"><label for="sfg">Or choose a government</label><select id="sfg">${M.ORDER.map(id=>`<option value="${id}">${esc(M.IT[id].kind==="party"?pname(M.IT[id].p)+" ("+M.IT[id].span+")":M.IT[id].cm+" ("+pname(M.IT[id].p)+", "+M.IT[id].span+")")}</option>`).join("")}</select></div>
      <button class="btn btn-o" data-sfgo="gov">View details</button>
      <p class="alt">Not sure where to start? <a href="#decide">Let us guide you</a></p></div>
    <div class="hero-extra"><div class="trio">${govP.slice(-3).reverse().map(p=>{const it=M.IT["p-"+p];return `<a class="duel-card" style="${pvars(p)}" href="#sgov/p-${p}">${pav(p,"lgp")}<span class="duel-t"><b>${esc(pname(p))}</b><span>${esc(it.span)}</span><span class="duel-k">CM ${esc(it.cms.slice(-2).join(", "))}</span></span></a>`}).join("")}</div>
      <div class="statrow"><div><b data-n="${e[4].filter(r=>r[0]!=="ind"&&r[0]!=="oth").length}">${e[4].filter(r=>r[0]!=="ind"&&r[0]!=="oth").length}</b><span>parties shown, ${e[0]}</span></div><div><b data-n="${M.ten.length}">${M.ten.length}</b><span>chief ministers' terms</span></div><div><b data-n="${M.prom.length}">${M.prom.length}</b><span>promises tracked</span></div><div><b data-n="${MS.filter(m=>M.R[m.id]).length}">${MS.filter(m=>M.R[m.id]).length}</b><span>yearly measures</span></div></div></div>
  </div></section>
  <section class="wrap sec">${sh("Next election","When "+esc(M.name)+" votes next.",`<a class="all" href="#elections">All elections →</a>`)}<div class="egrid">${nextCard(M)}<article class="card ecard"><span class="tag">Centre</span><b>Lok Sabha</b><span class="when">Due by mid-2029</span><span class="small muted">2024: the BJP-led NDA formed the government.</span><div class="ctas"><button class="btn btn-o btn-s" data-scope="centre">Compare for Lok Sabha</button></div></article></div></section>
  <section class="wrap sec">${sh(`Who won in ${e[0]}`,"Seats and share of the vote at the last assembly election.",deep?`<a class="all" href="#manifesto">Their promises →</a>`:"")}${partyRows(M,e)}</section>
  <section class="wrap sec">${sh("Head to head","Tap a measure to compare each party's time in power.",`<a class="all" href="#compare">Build your own →</a>`)}<div class="card h2h" id="sh2h">${h2hBox(M)}</div>${note(M)}</section>
  <section class="wrap sec">${sh("Compare to decide","Pick a match-up to see key numbers side by side.",`<a class="all" href="#compare">Build your own →</a>`)}<div class="vsgrid">${matchups(M).map(ids=>vsCard(M,ids)).join("")}</div></section>
  <section class="wrap sec">${sh("Browse by issue","Each issue shows how the state did under each party"+(deep?", and what parties promised.":"."),`<a class="all" href="#issues">All issues →</a>`)}<div class="tiles">${M.issues.map(i=>tile(M,i)).join("")}</div></section>
  ${M.prom.length?`<section class="wrap sec">${sh("Promise tracker",`What ${esc(pname(deep.won.p))} promised in ${deep.won.y}, and what happened.`,`<a class="all" href="#promises">View all ${M.prom.length} →</a>`)}
    <div class="pills" role="group" aria-label="Filter by result">${Object.keys(ST).filter(k=>M.prom.some(p=>p.s===k)).map(k=>`<button data-shst="${k}" aria-pressed="${shst===k}">${ST[k].l} (${M.prom.filter(p=>p.s===k).length})</button>`).join("")}</div><div id="shprom">${homeProm(M)}</div></section>`:""}
  <section class="wrap sec">${sh(`${esc(M.name)}'s governments`,"Chief Ministers since 2004.")}${govTimeline(M)}</section>
  <section class="wrap sec"><div class="banner"><div><h2>Still not sure whom to vote for in ${esc(M.name)}?</h2><p>Pick up to 4 issues, look at each party's record one issue at a time, and make your own call. No sign-up.</p></div><a class="btn btn-p" href="#decide">Help me decide →</a></div></section>
  <section class="wrap sec"><div class="banner"><div><h2>Voting in the Lok Sabha election?</h2><p>Compare the Congress-led and BJP-led central governments since 2004.</p></div><button class="btn btn-o" data-scope="centre">Switch to Lok Sabha</button></div></section>`;
}

/* ---------- issues ---------- */
function sIssues(){const M=model(cur());return `<div class="wrap page">${crumbs(M,"Issues")}<div class="phead"><h1 tabindex="-1" id="flowh">${esc(M.name)}: browse by issue</h1><p class="intro">Pick an issue to see how ${esc(M.name)} did under each party${M.deep?", which promises were kept, and what each party promised":""}.</p></div>
  <div class="tiles">${M.issues.map(i=>tile(M,i).replace('<span class="meta">',`<span class="small muted">${esc(i.d)}</span><span class="meta">`)).join("")}</div>
  ${M.deep?"":`<p class="small muted" style="margin-top:14px">Promise tracking covers the seven states voting in 2027 so far. For ${esc(M.name)} we show yearly numbers for each government.</p>`}</div>`}
function issueBody(M,iss){
  const ms=iss.ms.filter(id=>M.R[id]);const deep=M.deep;
  const wonP=deep?deep.won.p:null;const pr=M.prom.filter(p=>p.iss.includes(iss.id));
  const mparties=deep?[...new Set(M.mani.filter(x=>x.iss.includes(iss.id)).map(x=>x.pa))]:[];
  return `${!ms.length&&deep?"":`<section class="blk"><div class="blk-h"><h2>Their record in power</h2><span class="q">What happened in ${esc(M.name)} while each party governed?</span></div>
    <div class="mcards">${ms.map(id=>mcard(M,MI[id])).join("")||'<p class="empty">No year-by-year figures on this from our source.</p>'}</div>${ms.length?note(M):""}</section>`}
  ${deep?`<section class="blk"><div class="blk-h"><h2>Promises made in ${deep.won.y}</h2><span class="q">Did the winners keep their word?</span></div>
    <div class="card col" style="${pvars(wonP)}">${colHead(wonP,`${esc(deep.ml[wonP]||"Manifesto")}: won`)}${!M.prom.length?maniCol(M,wonP,iss.id)+`<p class="small muted">${esc(deep.note)}</p>`:pr.length?`<ul class="plist2">${pr.map(p=>promItem(M,p)).join("")}</ul>`:'<p class="empty">No measurable promise on this was tracked.</p>'}</div></section>
  <section class="blk"><div class="blk-h"><h2>What the others promised in ${deep.won.y}</h2><span class="q">Parties that didn't win can't be tested yet</span></div>
    ${mparties.filter(p=>p!==wonP).length?`<div class="cols ${mparties.filter(p=>p!==wonP).length>2?"cols3":""}">${mparties.filter(p=>p!==wonP).map(pa=>`<div class="card col" style="${pvars(pa)}">${colHead(pa,esc(deep.ml[pa]||"Manifesto"))}${maniCol(M,pa,iss.id)}</div>`).join("")}</div>`:`<p class="empty">No promise on this found in the other main parties' manifestos.</p>`}
    <p class="small muted">Manifestos for ${esc(M.S.next[0].replace(/^[A-Za-z–]+ /,""))} come out closer to the election. ${esc(deep.note||"")}</p></section>`:""}`;
}
function sIssue(id){const M=model(cur());const iss=M.issues.find(i=>i.id===id)||M.issues[0];const idx=M.issues.indexOf(iss),nx=M.issues[(idx+1)%M.issues.length];const D=dec(M);const inDec=D.issues.includes(iss.id);
  return `<div class="wrap narrow flow">${crumbs(M,`<a href="#issues">Issues</a> › ${esc(iss.n)}`)}
    <div style="display:grid;gap:8px"><div class="ptitle"><span class="ic">${ico(iss.ic,28)}</span><h1 tabindex="-1" id="flowh">${esc(iss.n)}<span class="hi2" lang="hi">${iss.hi}</span></h1></div><p class="intro">${esc(iss.d)}</p></div>
    ${issueBody(M,iss)}
    <div class="card choose"><h2>Weigh this up with other issues</h2><p class="muted small">Add it to Help me decide and record who convinced you on each issue.</p>
      <div class="ctas">${inDec?`<a class="btn btn-p" href="#decide">Continue Help me decide →</a>`:`<button class="btn btn-p" data-saddiss="${iss.id}">Add to Help me decide</button>`}<a class="btn btn-g" href="#sissue/${nx.id}">Next issue: ${esc(nx.n)} →</a></div></div></div>`}

/* ---------- government detail ---------- */
function sGov(id){const M=model(cur());const it=M.IT[id]||M.IT[M.DEF[0]];const deep=M.deep;
  const all=promOf(M,it.id),c=tallyOf(M,it.id),tot=sum(c);
  const li=p=>`<li class="st-${p.s}"><i aria-hidden="true">${ST[p.s].i}</i><div>${esc(p.p)}<small>${ST[p.s].l}. ${esc(p.e)}</small></div></li>`;
  const other=M.DEF.find(x=>x!==it.id&&(M.IT[x].p!==it.p||it.kind!=="party"))||M.DEF.find(x=>x!==it.id);
  const yrsF=[...it.years.f].sort((a,b)=>a-b);
  return `<div class="wrap">${crumbs(M,esc(it.kind==="party"?pname(it.p):it.cm))}
    <section class="card dhead" style="${pvars(it.p)}">${pav(it.p,"xlp")}<div><h1 tabindex="-1" id="flowh">${esc(it.kind==="party"?`${pname(it.p)} in ${M.name}, ${it.span}`:`${it.cm}, ${it.span}`)}</h1>
      <p class="who">${esc(pfull(it.p))} · ${it.kind==="party"?"Chief Minister"+(it.cms.length>1?"s":"")+" "+esc(it.cms.join(", ")):"Chief Minister"}</p>
      <div class="chips">${it.ongoing?"<span>In office now</span>":""}<span>${yrsF.length?`Data years ${yl(yrsF[0],{fy:1})} to ${yl(yrsF[yrsF.length-1],{fy:1})}`:"No full data year yet"}</span>${(()=>{const r=M.last[4].find(x=>x[0]===it.p);return r?`<span>${M.last[0]}: ${r[1]} seats, ${r[2]!=null?fmt(r[2],1)+"%":""}</span>`:""})()}</div></div>
      <div class="score"><span class="small muted">Promise record</span>${tot?`<div class="big"><b data-n="${c.ach}">${c.ach}</b><span>of ${tot} tracked ${deep.won.y} promises kept in full</span></div>${sbar(c)}`:`<p class="empty">${deep?"No tracked promises for this government.":"Promise tracking covers the states voting in 2027 so far."}</p>`}
        <div class="ctas">${other?`<a class="btn btn-p btn-s" href="#scompare/${it.id}~${other}">Compare with ${esc(M.IT[other].kind==="party"?pname(M.IT[other].p):M.IT[other].cm)}</a>`:""}<a class="btn btn-g btn-s" href="#charts">All charts</a></div></div></section></div>
  <div class="wrap page">
    <section class="sec">${sh("Key numbers while in office","Yearly rates are averages; slow-moving levels show start and end of each stretch in office.",`<a class="all" href="#charts">All charts →</a>`)}
      <div class="card specgrid">${MS.filter(m=>M.R[m.id]).map(m=>{const s=stat(M,m,it.id);let v,sub;
        if(!s){v=`<span class="muted">No data</span>`;sub=it.ongoing?"Not published yet":"Not in these years"}
        else if(m.kind==="flow"){v=fmt(s.avg,m.d);sub=`average a year, ${s.n} year${s.n>1?"s":""}`}
        else{const c2=cellStock(s,m);v=c2.v;sub=c2.sub}
        return `<div class="spec"><span class="k">${esc(m.n)}</span><span class="v">${v}</span><span class="s">${esc(m.u)} · ${sub}</span></div>`}).join("")}</div>${note(M)}</section>
    ${tot?`<section class="sec">${sh("Promise record")}<div class="pc"><div class="card"><h3><span class="pill st-ach">✓</span> Kept (${c.ach})</h3>${c.ach?`<ul>${all.filter(p=>p.s==="ach").map(li).join("")}</ul>`:'<p class="empty">None.</p>'}</div>
      <div class="card"><h3><span class="pill st-not">✕</span> Missed or partly kept (${c.part+c.not})</h3>${c.part+c.not?`<ul>${all.filter(p=>p.s==="part"||p.s==="not").map(li).join("")}</ul>`:'<p class="empty">None.</p>'}</div></div>
      ${c.prog+c.con?`<div class="pc"><div class="card" style="grid-column:1/-1"><h3><span class="pill st-prog">…</span> In progress or disputed (${c.prog+c.con})</h3><ul>${all.filter(p=>p.s==="prog"||p.s==="con").map(li).join("")}</ul></div></div>`:""}</section>`:""}
    ${it.kind==="party"&&it.tens.length>1?`<section class="sec">${sh("Chief Ministers")}<div class="vsgrid">${it.tens.map(t=>`<a class="card vs" href="#sgov/${t}"><div class="vs-side">${pav(it.p)}<b>${esc(M.IT[t].cm)}</b><span>${esc(M.IT[t].span)}</span></div><span class="go">View details</span></a>`).join("")}</div></section>`:""}
  </div>`}

/* ---------- compare ---------- */
function getCmp(M){let c=st("pdk_scmp_"+M.code);c=(Array.isArray(c)?c:[]).filter(id=>M.IT[id]).slice(0,3);if(c.length<2)c=M.DEF.slice(0,3);return c}
function setCmp(M,c){st("pdk_scmp_"+M.code,c)}
function sCompare(){const M=model(cur());const cmp=getCmp(M);const its=cmp.map(id=>M.IT[id]),n=its.length;
  const lab=it=>it.kind==="party"?`${pname(it.p)}: all years (${it.span})`:`${it.cm} (${pname(it.p)}, ${it.span})`;
  const opts=sel=>`<optgroup label="Parties">${M.ORDER.filter(id=>id.startsWith("p-")).map(id=>`<option value="${id}" ${id===sel?"selected":""}>${esc(lab(M.IT[id]))}</option>`).join("")}</optgroup><optgroup label="Chief Ministers">${M.ORDER.filter(id=>!id.startsWith("p-")).map(id=>`<option value="${id}" ${id===sel?"selected":""}>${esc(lab(M.IT[id]))}</option>`).join("")}</optgroup>`;
  const slots=its.map((it,i)=>`<div class="card slot">${pav(it.p)}<b>${esc(it.kind==="party"?pname(it.p):it.cm)}</b><span style="display:flex;gap:8px;align-items:center;min-width:0"><select data-sslot="${i}" aria-label="Government ${i+1}">${opts(it.id)}</select>${n>2?`<button class="linkbtn small" data-srm="${i}">Remove</button>`:""}</span></div>`).join("")
    +(n<3?`<div class="card slot empty"><span class="plus" aria-hidden="true">+</span><b>Add a third</b><select data-sadd="1" aria-label="Add a government"><option value="">Choose…</option>${M.ORDER.filter(id=>!cmp.includes(id)).map(id=>`<option value="${id}">${esc(lab(M.IT[id]))}</option>`).join("")}</select></div>`:"");
  const row=(k,cells,sub)=>`<tr><th scope="row">${k}${sub?`<small>${sub}</small>`:""}</th>${cells.map(c=>`<td class="v${c.best?" best":""}">${c.h}</td>`).join("")}</tr>`;
  const sect=t=>`<tr class="sect"><td colspan="${n+1}">${t}</td></tr>`;
  let h=`<div class="ctable-wrap"><table class="ct" style="--n:${n}"><thead><tr><th scope="col">Government</th>${its.map(it=>`<th scope="col"><span class="thname">${pav(it.p)}<span>${esc(it.kind==="party"?pname(it.p):it.cm)}<small class="muted" style="display:block;font-family:var(--f-body);font-weight:400;font-size:12.5px">${esc(it.kind==="party"?it.span:pname(it.p)+", "+it.span)}</small></span></span></th>`).join("")}</tr></thead><tbody>`;
  h+=sect("Overview")+row("Chief Minister",its.map(it=>({h:esc(it.kind==="party"?it.cms.join(", "):it.cm)})))+row("Data years",its.map(it=>{const y=[...it.years.f].sort((a,b)=>a-b);return {h:y.length?`${y.length} financial year${y.length>1?"s":""}<small>${yl(y[0],{fy:1})} to ${yl(y[y.length-1],{fy:1})}</small>`:'<span class="muted">None yet</span>'}}),"years counted to each side");
  h+=row(`${M.last[0]} election`,its.map(it=>{const r=M.last[4].find(x=>x[0]===it.p);return {h:r?`<b>${r[1]}</b> seats<small>${r[2]!=null?fmt(r[2],1)+"% of the vote":""}</small>`:'<span class="muted">–</span>'}}),`out of ${M.last[2]}`);
  if(M.prom.length){const tl=its.map(it=>tallyOf(M,it.id));h+=sect(`Promise record (${M.deep.won.y} manifesto)`)+row("Promises tracked",tl.map(c=>({h:`<b>${sum(c)}</b>`})));
    Object.keys(ST).forEach(k=>{if(tl.some(c=>c[k]))h+=row(`<span class="st-${k}" style="color:var(--sc)">${ST[k].i}</span> ${ST[k].l}`,tl.map(c=>({h:`<b>${c[k]}</b>${sum(c)?`<small>${Math.round(c[k]/sum(c)*100)}% of tracked</small>`:""}`})))})}
  let cat="";MS.filter(m=>M.R[m.id]).forEach(m=>{if(m.cat!==cat){cat=m.cat;h+=sect(cat)}const b=bestOf(M,m,cmp)||[];
    h+=row(esc(m.n),its.map(it=>{const s=stat(M,m,it.id);if(!s)return {h:`<span class="muted">No data</span><small>${it.ongoing?"Not published yet":"Not in these years"}</small>`};
      if(m.kind==="flow")return {h:`<b>${fmt(s.avg,m.d)}</b>${b.includes(it.id)?' <span class="better">✓ Better</span>':""}<small>average, ${s.n} year${s.n>1?"s":""}</small>`,best:b.includes(it.id)};
      const c2=cellStock(s,m);return {h:`<b>${c2.v}</b><small>${c2.sub}</small>`}}),`${esc(m.u)} · ${m.kind==="flow"?(m.dir>0?"higher is better":"lower is better"):"start → end"}`)});
  h+=`</tbody></table></div>`;
  return `<div class="wrap page">${crumbs(M,"Compare")}<div class="phead"><h1 tabindex="-1" id="flowh">Compare ${esc(M.name)}'s governments</h1><p class="intro">Pick two or three: a party's whole time in power since ${M.S.since}, or a single Chief Minister. ${esc(M.name)}'s numbers line up side by side.</p></div>
    <div class="slots">${slots}</div>
    <div class="note"><span><b>How to read this:</b> yearly rates show the average over the years each side was in office, and <span class="better">✓ Better</span> marks the best average on that one measure, only among sides with at least two years of data. Slow-moving levels show start → end. No overall winner is given.</span></div>
    ${h}${note(M)}
    <section class="sec" style="padding-top:10px">${sh("Popular comparisons")}<div class="vsgrid">${matchups(M).map(ids=>vsCard(M,ids)).join("")}</div></section></div>`}

/* ---------- promises ---------- */
let spf={s:"all",iss:"all"};
function plist(M){const l=M.prom.filter(p=>(spf.s==="all"||p.s===spf.s)&&(spf.iss==="all"||p.iss.includes(spf.iss)));
  return `<p class="count" aria-live="polite">Showing ${l.length} of ${M.prom.length} promises</p><div class="plist">${l.map(p=>`<article class="card prom st-${p.s}"><div class="icon" aria-hidden="true">${ST[p.s].i}</div>
    <div class="meta">${pb(p.party)}<span>${esc(M.deep.ml[p.party]||"Manifesto")} ${M.deep.won.y}</span>${p.iss.map(i=>`<span>${esc(II[i].n)}</span>`).join("")}</div>
    <h3>${esc(p.p)}</h3><p class="what"><b>${ST[p.s].l}.</b> ${esc(p.e)}</p><details><summary>Sources</summary>${dsrcs(p.src)}</details></article>`).join("")||'<p class="empty">No promises match.</p>'}</div>`}
function sPromises(){const M=model(cur());
  if(!M.deep)return `<div class="wrap page">${crumbs(M,"Promise tracker")}<div class="phead"><h1 tabindex="-1" id="flowh">${esc(M.name)} promise tracker</h1><p class="intro">We track manifesto promises for the seven states voting in 2027 so far (Uttar Pradesh, Punjab, Uttarakhand, Goa, Manipur, Himachal Pradesh and Gujarat). ${esc(M.name)} votes next in ${esc(M.S.next[0])}.</p></div>
    <div class="banner"><div><h2>Compare ${esc(M.name)}'s governments on the numbers</h2><p>Growth, incomes, infant deaths, borrowing and power, for each party and Chief Minister since ${M.S.since}.</p></div><a class="btn btn-p" href="#compare">Compare →</a></div></div>`;
  if(!M.prom.length)return `<div class="wrap page">${crumbs(M,"Promise tracker")}<div class="phead"><h1 tabindex="-1" id="flowh">${esc(M.name)} promise tracker</h1><p class="intro">${esc(M.deep.note)}</p></div>
    <div class="banner"><div><h2>See what each party promised in ${M.deep.won.y}</h2><p>The winner's and the other main parties' promises, issue by issue.</p></div><a class="btn btn-p" href="#manifesto">Manifestos →</a></div></div>`;
  const pills=(k,opts)=>`<div class="pills" role="group">${opts.map(([v,l])=>`<button data-spf="${k}" data-v="${v}" aria-pressed="${spf[k]===v}">${l}</button>`).join("")}</div>`;
  return `<div class="wrap page">${crumbs(M,"Promise tracker")}<div class="phead"><h1 tabindex="-1" id="flowh">${esc(M.name)} promise tracker</h1><p class="intro">${M.prom.length} measurable promises from ${esc(pname(M.deep.won.p))}'s ${M.deep.won.y} manifesto, the party that won, and what happened by ${esc(M.deep.asof)}. Each is judged against its own words and any deadline.</p></div>
    <div class="dfilters">${pills("s",[["all","Any result"],...Object.keys(ST).filter(k=>M.prom.some(p=>p.s===k)).map(k=>[k,ST[k].l])])}
    <div class="field"><label for="spiss" class="small">Issue</label><select id="spiss"><option value="all">All issues</option>${M.issues.filter(i=>M.prom.some(p=>p.iss.includes(i.id))).map(i=>`<option value="${i.id}" ${spf.iss===i.id?"selected":""}>${esc(i.n)}</option>`).join("")}</select></div></div>
    <div id="splist">${plist(M)}</div>
    <p class="small muted">${esc(M.deep.note||"")} Only the party that won can be checked against its promises. Other parties' ${M.deep.won.y} promises are on the <a href="#manifesto">manifestos page</a>.</p></div>`}

/* ---------- charts ---------- */
let scc="all";
function sCharts(){const M=model(cur());const ms=MS.filter(m=>M.R[m.id]);const cats=[...new Set(ms.map(m=>m.cat))],show=scc==="all"||!cats.includes(scc)?cats:[scc];
  return `<div class="wrap page">${crumbs(M,"Charts")}<div class="phead"><h1 tabindex="-1" id="flowh">How did ${esc(M.name)} do?</h1><p class="intro">Each chart runs to the latest data. Shaded bands show the party of the Chief Minister: ${M.parties.map(pb).join(" ")}. Gaps are years with no data or no elected government.</p></div>
    <div class="pills" role="group" aria-label="Category"><button data-scc="all" aria-pressed="${scc==="all"}">All (${ms.length})</button>${cats.map(c=>`<button data-scc="${esc(c)}" aria-pressed="${scc===c}">${esc(c)}</button>`).join("")}</div>
    ${show.map(c=>`<section class="topic"><h2>${esc(c)}</h2><div class="mgrid">${ms.filter(m=>m.cat===c).map(m=>`<article class="card mcard"><div><h3>${esc(m.q)}</h3><div class="unit">${esc(m.n)} · ${esc(m.u)} · ${m.dir>0?"higher is better":"lower is better"}</div></div>
      <div class="chartbox" id="sch-${m.id}" data-sauto="${m.id}"></div><p class="why"><b>Why it matters:</b> ${esc(m.why)}</p><p class="caveat">${esc(m.note)} Source: ${lk(SRC.rbi)}.</p></article>`).join("")}</div></section>`).join("")}
    ${note(M)}</div>`}

/* ---------- manifestos ---------- */
function sManifesto(){const M=model(cur());const deep=M.deep;
  if(!deep)return `<div class="wrap page">${crumbs(M,"Manifestos")}<div class="phead"><h1 tabindex="-1" id="flowh">${esc(M.name)} manifestos</h1><p class="intro">Parties publish manifestos a few weeks before polling. ${esc(M.name)} votes next in ${esc(M.S.next[0])}. So far we cover manifestos for the seven states voting in 2027.</p></div>
    <section class="sec">${sh(`Who won in ${M.last[0]}`)}${partyRows(M,M.last)}</section></div>`;
  const parties=[deep.won.p,...[...new Set(M.mani.map(x=>x.pa))].filter(p=>p!==deep.won.p)];
  const isu=M.issues.filter(i=>M.mani.some(x=>x.iss.includes(i.id))||M.prom.some(p=>p.iss.includes(i.id)));
  const winCol=(iss)=>{const l=M.prom.filter(p=>p.iss.includes(iss));if(!M.prom.length)return maniCol(M,deep.won.p,iss);return l.length?`<ul class="plist2">${l.map(p=>`<li><div class="tags">${pill(p.s)}</div><span class="t">${esc(p.p)}</span><details><summary>Sources</summary>${dsrcs(p.src)}</details></li>`).join("")}</ul>`:`<p class="empty">Nothing on this in the promises we track.</p>`};
  return `<div class="wrap page">${crumbs(M,"Manifestos")}<div class="phead"><h1 tabindex="-1" id="flowh">What the parties promised ${esc(M.name)} in ${deep.won.y}</h1><p class="intro">Key promises from the main parties' manifestos, issue by issue. ${esc(pname(deep.won.p))} won${M.prom.length?", so its promises show what happened":""}; the others can't be tested. New manifestos for ${esc(M.S.next[0])} will come out closer to polling.</p></div>
    <div class="pills" role="group" aria-label="Jump to issue">${isu.map(i=>`<button data-to="sm-${i.id}">${esc(i.n)}</button>`).join("")}</div>
    ${isu.map(i=>`<section class="topic" id="sm-${i.id}"><h2>${esc(i.n)}</h2><div class="cols ${parties.length>2?"cols3":""}">${parties.map(pa=>`<div class="card col" style="${pvars(pa)}">${colHead(pa,esc(deep.ml[pa]||"Manifesto")+(pa===deep.won.p?" · won":""))}${pa===deep.won.p?winCol(i.id):maniCol(M,pa,i.id)}</div>`).join("")}</div></section>`).join("")}
    <div class="note"><b>Reading promises</b><ul style="margin:0;padding-left:18px;display:grid;gap:4px"><li>Check the <a href="#promises">promise tracker</a> to see how the last winner did.</li><li>Look for numbers and dates; those can be checked later.</li><li>Ask what it costs and how it will be paid for.</li></ul></div></div>`}

/* ---------- Help me decide ---------- */
const DECS={};
function dec(M){if(DECS[M.code])return DECS[M.code];let d=st("pdk_sdec_"+M.code);if(!d||!Array.isArray(d.issues))d={issues:[],step:0,ans:{}};d.issues=d.issues.filter(id=>M.issues.some(i=>i.id===id));if(!d.ans)d.ans={};DECS[M.code]=d;return d}
const dsave=M=>st("pdk_sdec_"+M.code,dec(M));
const chs=M=>[...M.choiceP.map(p=>[p,pname(p)]),["other","Another party"],["same","No clear difference"],["unsure","Not sure"]];
function prog(M){const D=dec(M),n=D.issues.length,s=D.step,total=Math.max(n,1)+2,c=s===0?0:(s<=n?s:total-1);
  const label=s===0?"Step 1 · Choose your issues":s<=n?`Issue ${s} of ${n}`:"Your summary";
  return `<div class="prog" aria-label="Progress"><div class="prog-top"><b>${label}</b><span class="muted">${s>0&&s<=n?esc(II[D.issues[s-1]].n):esc(M.name)+" Assembly"}</span></div><div class="prog-track">${Array.from({length:total},(_,i)=>`<i class="${i<c?"done":i===c?"now":""}"></i>`).join("")}</div></div>`}
function sDecide(){const M=model(cur()),D=dec(M);const n=D.issues.length;if(D.step>n+1)D.step=n+1;if(!n)D.step=0;const CH=chs(M),CHN=Object.fromEntries(CH);
  if(D.step===0)return `<div class="wrap narrow flow">${prog(M)}<div style="display:grid;gap:8px"><h1 tabindex="-1" id="flowh" style="font-size:clamp(26px,3.6vw,36px);font-weight:800">What matters most to you in ${esc(M.name)}?</h1><p class="intro">Choose up to 4 issues. You'll look at each one in turn.</p></div>
    <div class="picks" role="group" aria-label="Issues">${M.issues.map(i=>`<button class="pick" data-spick="${i.id}" aria-pressed="${D.issues.includes(i.id)}"><span class="ic">${ico(i.ic,22)}</span><b>${esc(i.n)}</b><span class="h" lang="hi">${i.hi}</span><span class="d">${esc(i.d)}</span></button>`).join("")}</div></div>
    <div class="actionbar"><div class="wrap narrow in"><span class="status" id="sstatus" aria-live="polite">${n?`${n} of 4 chosen`:"Choose at least one issue"}</span><button class="btn btn-p" data-snext="1" ${n?"":"disabled"}>Continue →</button></div></div>`;
  if(D.step<=n){const iss=II[D.issues[D.step-1]],ans=D.ans[iss.id];
    return `<div class="wrap narrow flow">${prog(M)}<div style="display:grid;gap:8px"><div class="ptitle"><span class="ic">${ico(iss.ic,28)}</span><h1 tabindex="-1" id="flowh">${esc(iss.n)}<span class="hi2" lang="hi">${iss.hi}</span></h1></div><p class="intro">${esc(iss.d)}</p></div>
      ${issueBody(M,iss)}
      <section class="card choose"><h2 id="schooseh">On ${esc(iss.n.toLowerCase())}, who convinced you most?</h2><p class="muted small">Think about their record and their promises. There's no right answer.</p>
        <div class="choices choices6" role="group" aria-labelledby="schooseh">${CH.map(([k,l])=>`<button class="choice" ${SPARTY[k]?`style="${pvars(k)}"`:""} data-sans="${k}" aria-pressed="${ans===k}">${SPARTY[k]?pav(k):'<span class="dot" aria-hidden="true"></span>'}${esc(l)}</button>`).join("")}</div></section></div>
      <div class="actionbar"><div class="wrap narrow in"><button class="btn btn-g" data-sback="1">← Back</button><button class="btn btn-p" data-snext="1">${ans?(D.step===n?"See my summary":"Next issue"):"Skip for now"} →</button></div></div>`}
  const c={};D.issues.forEach(id=>{const a=D.ans[id]||"unsure";c[a]=(c[a]||0)+1});
  const lean=[...M.choiceP,"other"].filter(k=>c[k]).sort((a,b)=>c[b]-c[a]);
  const line=lean.length?`On the issues you picked, you leaned towards ${lean.map(k=>`<b>${esc(CHN[k])}</b> on ${c[k]}`).join(", ")}.`:"You didn't lean towards any party on the issues you picked.";
  return `<div class="wrap narrow flow">${prog(M)}<div style="display:grid;gap:8px"><h1 tabindex="-1" id="flowh" style="font-size:clamp(26px,3.6vw,36px);font-weight:800">Your summary</h1><p class="intro">Built only from your own answers. This site doesn't score or rank anyone.</p></div>
    <div class="card tally"><p style="font-size:18px">${line}</p></div>
    <div class="card"><ul class="answers">${D.issues.map((id,i)=>{const a=D.ans[id];return `<li><span class="n">${esc(II[id].n)}</span><span style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><span class="chipc" ${SPARTY[a]?`style="${pvars(a)}"`:""}>${a?esc(CHN[a]||a):"Skipped"}</span><button class="linkbtn" data-sgoto="${i+1}">Change</button></span></li>`}).join("")}</ul></div>
    <section class="blk"><div class="blk-h"><h2>Before you vote</h2></div><div class="note">You vote for a candidate in your constituency. Check who is standing where you live, and their sworn records.</div>
      <div class="links"><a class="card" href="${SRC.myneta.u}" target="_blank" rel="noopener"><b>Your candidates</b><span>Every candidate's affidavit: criminal cases, assets and education, on MyNeta.</span></a><a class="card" href="#myvote"><b>How do I vote?</b><span>Eligibility, the voter list, and what to carry.</span></a></div></section>
    <div class="ctas"><button class="btn btn-g" data-srestart="1">Start over</button><a class="btn btn-g" href="#compare">Compare governments</a><a class="btn btn-g" href="#mynotes">My notes</a></div></div>`}

/* ---------- personalised strip for these states ---------- */
const prevTop=X.homeTop;
X.homeTop=()=>{const name=cur();if(!name){const h=prevTop?prevTop():"";const l=getLoc();return l&&l.state&&l.state!=="Delhi"&&!SDATA[l.state]?(()=>{const i=h.indexOf("<h3>Full "),j=i<0?-1:h.indexOf("</p>",i);return i<0||j<0?h:h.slice(0,i)+`<h3>${esc(l.state)} has no elected assembly</h3><p class="small muted">Voters here elect a Lok Sabha MP and local bodies, not a state government. Check your candidates and your name on the voter list.</p>`+h.slice(j+4)})():h}const M=model(name),l=getLoc();
  return `<section class="wrap you"><div class="you-h"><b><span aria-hidden="true">📍</span> ${esc(l.state)}</b><button class="linkbtn small" data-locopen="1">Change</button></div><div class="you-grid">
    <article class="card yc"><h3>Coming up</h3><ul class="yl"><li><b>${esc(M.name)} Assembly</b><span>${esc(M.S.next[0])} · now ${esc(pname(M.cur.p))}, CM ${esc(M.cur.cm)}</span></li><li><b>Lok Sabha</b><span>Due by mid-2029</span></li></ul><a class="small" href="#elections">All elections →</a></article>
    <article class="card yc"><h3>Compare ${esc(M.name)}'s governments</h3><p class="small muted">${M.parties.map(pname).join(", ")} have led the state since ${M.S.since}. See how it did under each.</p><a class="btn btn-o btn-s" href="#compare">Compare</a></article>
    ${M.prom.length?`<article class="card yc"><h3>The current government's promises</h3><p class="small muted">${esc(pname(M.deep.won.p))}, ${M.deep.won.y} manifesto: what we track</p>${sbar((()=>{const c={ach:0,part:0,not:0,con:0,prog:0};M.prom.forEach(p=>c[p.s]++);return c})())}<a class="small" href="#promises">See each promise →</a></article>`
      :`<article class="card yc"><h3>Check your candidates</h3><p class="small muted">Before you vote, read their sworn records and find your name on the voter list.</p><ul class="yl"><li>${lk(SRC.myneta)}</li><li>${lk(SRC.esr)}</li></ul></article>`}
  </div></section>`};
/* elections page: the next assembly election for every state */
X.stateNext=name=>SDATA[name]?{when:SDATA[name].next[0],why:SDATA[name].next[1],now:pname(model(name).cur.p),cm:model(name).cur.cm,seats:SDATA[name].seats}:null;
X.stateList=()=>Object.keys(SDATA).map(n=>({n,when:SDATA[n].next[0],now:pname(model(n).cur.p),cm:model(n).cur.cm}));

/* elections page: every state's next assembly election (patches the page built in voter.js) */
const MO={Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12};
const wkey=w=>{const y=(w.match(/20[0-9][0-9]/)||["9999"])[0],m=(w.match(/[A-Z][a-z][a-z]/)||["Dec"])[0];return +y*100+(MO[m]||12)};
function upcoming(){const l=getLoc();const rows=Object.keys(SDATA).map(n=>({n,when:SDATA[n].next[0],now:pname(model(n).cur.p),cm:model(n).cur.cm})).concat([{n:"Delhi",when:"Feb 2030",now:"BJP",cm:"Rekha Gupta"}]).sort((a,b)=>wkey(a.when)-wkey(b.when)||a.n.localeCompare(b.n));
  return `<section class="sec"><div class="sh"><h2>Upcoming assembly elections</h2><p>Every state's next election, from when its assembly's five-year term ends. Dates for 2027 are not announced yet. ${lk(SRC.e27)}</p></div>
    <div class="card tablebox"><table class="st"><thead><tr><th>State</th><th>Expected</th><th>Governed now by</th></tr></thead><tbody>${rows.map(x=>`<tr${l&&l.state===x.n?' class="me"':""}><td>${esc(x.n)}</td><td>${esc(x.when)}</td><td>${esc(x.now)} · ${esc(x.cm)}</td></tr>`).join("")}</tbody></table></div></section>`}
function myState(name){const M=name&&SDATA[name]?model(name):null;
  return `<section class="sec"><div class="sh"><h2>${esc(name)}</h2></div><div class="egrid">${M?`<article class="card ecard"><span class="tag">State</span><b>${esc(name)} Legislative Assembly</b><span class="when">${esc(M.S.next[0])}</span><span class="small muted">${esc(M.S.next[1])} ${M.S.seats} seats. Now: ${esc(pname(M.cur.p))}, Chief Minister ${esc(M.cur.cm)}.</span><div class="ctas"><button class="btn btn-o btn-s" data-scope="state" data-sgo="1">Compare ${esc(name)}'s parties</button></div></article>`:""}<article class="card ecard"><span class="tag">Centre</span><b>Lok Sabha</b><span class="when">Due by mid-2029</span><span class="small muted">2024: the BJP-led NDA formed the government.</span><div class="ctas"><button class="btn btn-o btn-s" data-scope="centre" data-sgo="1">Compare for Lok Sabha</button></div></article></div>${M?"":`<p class="small muted">${esc(name)} has no elected legislative assembly.</p>`}</section>`}
if(X.routes.elections){const ev=X.routes.elections.v;X.routes.elections.v=()=>{let h=ev();const l=getLoc();
  const a=h.indexOf('<section class="sec"><div class="sh"><h2>States voting next</h2>');if(a>=0){const b=h.indexOf("</section>",a);if(b>a)h=h.slice(0,a)+upcoming()+h.slice(b+10)}
  if(l&&l.state&&l.state!=="Delhi"){const a2=h.indexOf(`<section class="sec"><div class="sh"><h2>${esc(l.state)}</h2>`);if(a2>=0){const b2=h.indexOf("</section>",a2);if(b2>a2)h=h.slice(0,a2)+myState(l.state)+h.slice(b2+10)}}
  return h}}

/* ---------- routing hooks ---------- */
const OVR={home:[sHome,n=>`${n}: compare before you vote`],issues:[sIssues,n=>`${n}: browse by issue`],compare:[sCompare,n=>`Compare ${n}'s governments`],promises:[sPromises,n=>`${n} promise tracker`],charts:[sCharts,n=>`How did ${n} do?`],manifesto:[sManifesto,n=>`${n} manifestos`],decide:[sDecide,n=>`Help me decide: ${n}`]};
const prevView=X.view;
X.view=(route,arg)=>{const v=prevView?prevView(route,arg):null;if(v)return v;if(scope()==="state"&&OVR[route]){const n=cur();return {v:OVR[route][0],t:OVR[route][1](n)}}return null};
function curArg(){let h=(location.hash||"").slice(1);try{h=decodeURIComponent(h)}catch(e){}const k=h.indexOf("/");return k<0?"":h.slice(k+1)}
const need=f=>()=>cur()?f():`<div class="wrap page"><p class="empty">Choose a state first. <button class="linkbtn" data-locopen="1">Choose location</button></p></div>`;
Object.assign(X.routes,{
  sissue:{v:need(()=>sIssue(curArg())),t:"State issue",nav:"issues"},
  sgov:{v:need(()=>sGov(curArg())),t:"State government",nav:"compare"},
  scompare:{v:need(()=>{const M=model(cur());const ids=curArg().split("~").filter(id=>M.IT[id]);if(ids.length>=2)setCmp(M,[...new Set(ids)].slice(0,3));return sCompare()}),t:"Compare governments",nav:"compare"}
});

/* scope bar, ticker and charts after each render */
const prevAfter=X.after;
X.after=(route,arg)=>{if(prevAfter)prevAfter(route,arg);const name=cur();if(!name)return;const M=model(name),s=scope();
  let el=document.getElementById("scopebar");if(!el){el=document.createElement("div");el.id="scopebar";el.className="scopebar";const t=document.getElementById("ticker");t.parentNode.insertBefore(el,t.nextSibling)}
  el.hidden=false;el.innerHTML=`<div class="wrap sb-in"><span class="sb-l">Comparing for</span><div class="seg3" role="group" aria-label="Which election"><button data-scope="state" aria-pressed="${s==="state"}">${esc(name)} Assembly</button><button data-scope="centre" aria-pressed="${s==="centre"}">Lok Sabha (India)</button></div></div>`;
  if(s==="state"){const t=document.getElementById("ticker");if(t)t.innerHTML=`<div class="wrap"><span class="lbl">${esc(M.code)}</span><span class="txt">${esc(M.name)} Assembly election expected ${esc(M.S.next[0])}. Now: ${esc(pname(M.cur.p))}, CM ${esc(M.cur.cm)}.</span><a class="more" href="#elections">Elections</a></div>`;
    document.querySelectorAll("[data-sauto]").forEach(b=>schart(M,b,MI[b.dataset.sauto]));
    const nl=document.querySelector('.mainnav a[data-r="manifesto"]');if(nl)nl.textContent=M.deep?`${M.deep.won.y} manifestos`:"Manifestos"}};

/* ---------- events ---------- */
const rerender=()=>window.dispatchEvent(new HashChangeEvent("hashchange"));
document.addEventListener("toggle",e=>{const d=e.target;if(d.tagName==="DETAILS"&&d.open&&d.dataset.schart&&cur())schart(model(cur()),document.getElementById("sch-"+d.dataset.schart),MI[d.dataset.schart])},true);
document.addEventListener("click",e=>{
  const t=e.target;
  const sc=t.closest("[data-scope]");if(sc&&sc.dataset.sgo){location.hash="home";return}
  if(sc&&cur()){if(sc.dataset.scope==="centre"&&/^#(sissue|sgov|scompare)/.test(location.hash))location.hash="home";return}
  const name=cur();if(!name)return;const M=model(name);
  const fg=t.closest("[data-sfgo]");if(fg){location.hash=fg.dataset.sfgo==="issue"?"sissue/"+$("#sfi").value:"sgov/"+$("#sfg").value;return}
  const hh=t.closest("[data-sh2h]");if(hh){h2h=hh.dataset.sh2h;const box=$("#sh2h");box.innerHTML=h2hBox(M);if(G().enhance)G().enhance(box);return}
  const hs=t.closest("[data-shst]");if(hs){shst=hs.dataset.shst;document.querySelectorAll("[data-shst]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.shst===shst));$("#shprom").innerHTML=homeProm(M);return}
  const pf=t.closest("[data-spf]");if(pf){spf[pf.dataset.spf]=pf.dataset.v;document.querySelectorAll(`[data-spf="${pf.dataset.spf}"]`).forEach(b=>b.setAttribute("aria-pressed",b.dataset.v===spf[pf.dataset.spf]));$("#splist").innerHTML=plist(M);return}
  const cc=t.closest("[data-scc]");if(cc){scc=cc.dataset.scc;rerender();return}
  const rm=t.closest("[data-srm]");if(rm){const c=getCmp(M);c.splice(+rm.dataset.srm,1);setCmp(M,c);history.replaceState(null,"","#compare");rerender();return}
  const D=dec(M);
  const ai=t.closest("[data-saddiss]");if(ai){const id=ai.dataset.saddiss;if(!D.issues.includes(id)){if(D.issues.length>=4)D.issues.shift();D.issues.push(id)}D.step=0;dsave(M);location.hash="decide";return}
  const pk=t.closest("[data-spick]");if(pk){const id=pk.dataset.spick,i=D.issues.indexOf(id);if(i>=0)D.issues.splice(i,1);else if(D.issues.length>=4){const s=$("#sstatus");s.textContent="Up to 4. Remove one first.";s.classList.add("hint");return}else D.issues.push(id);
    dsave(M);const y=scrollY;rerender();setTimeout(()=>{scrollTo(0,y);const b=document.querySelector(`[data-spick="${id}"]`);if(b)b.focus({preventScroll:true})},0);return}
  const an=t.closest("[data-sans]");if(an){D.ans[D.issues[D.step-1]]=an.dataset.sans;dsave(M);const y=scrollY;rerender();setTimeout(()=>scrollTo(0,y),0);return}
  if(t.closest("[data-snext]")){D.step=Math.min(D.step+1,D.issues.length+1);dsave(M);rerender();return}
  if(t.closest("[data-sback]")){D.step=Math.max(D.step-1,0);dsave(M);rerender();return}
  const gt=t.closest("[data-sgoto]");if(gt){D.step=+gt.dataset.sgoto;dsave(M);rerender();return}
  if(t.closest("[data-srestart]")){DECS[M.code]={issues:[],step:0,ans:{}};dsave(M);rerender();return}
});
document.addEventListener("change",e=>{const t=e.target;const name=cur();if(!name)return;const M=model(name);
  if(t.dataset.sslot!=null){const c=getCmp(M);const i=+t.dataset.sslot,v=t.value,j=c.indexOf(v);if(j>=0&&j!==i)c[j]=c[i];c[i]=v;setCmp(M,c);history.replaceState(null,"","#compare");rerender();return}
  if(t.dataset.sadd&&t.value){const c=getCmp(M);c.push(t.value);setCmp(M,c.slice(0,3));history.replaceState(null,"","#compare");rerender();return}
  if(t.id==="spiss"){spf.iss=t.value;$("#splist").innerHTML=plist(M);return}
});
let rt;window.addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(()=>{const n=cur();if(!n||scope()!=="state")return;const M=model(n);document.querySelectorAll("[data-sauto]").forEach(b=>schart(M,b,MI[b.dataset.sauto]));document.querySelectorAll("details[data-schart][open]").forEach(d=>schart(M,document.getElementById("sch-"+d.dataset.schart),MI[d.dataset.schart]))},150)});
})();
