/* Verification layer: independent findings, "how this was checked" lines, reliability notes. */
(function(){
"use strict";
const X=window.PPD_EXT;if(!X||!X.routes)return;
const WS=new RegExp("["+String.fromCharCode(0)+"-"+String.fromCharCode(32)+"]+","g");
const norm=s=>String(s||"").replace(WS," ").trim();
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const EF={q:["Raises doubts","q"],m:["Mixed picture","m"],d:["Disputed data","d"]};

/* Every finding below was read in the source linked to it. */
const FIND=[
{id:"f-pmjay",sc:"Centre",ti:"Ayushman Bharat (PM-JAY) claims and beneficiary records",au:"CAG performance audit",dt:"Tabled Aug 2023",ef:"q",
 bd:"The CAG found 88,760 patients recorded as dying during treatment, yet 2,14,923 claims for fresh treatment of those patients were shown as paid. In 3,903 of those claims (Rs 6.97 crore, 3,446 patients) the money went to hospitals. 78,396 claims for 48,387 patients showed overlapping hospital stays. About 9.85 lakh beneficiaries were linked to a single mobile number entered as '3'. Some empanelled hospitals lacked enough doctors or equipment, or valid fire-safety certificates. The report was tabled in 2023, so it covers the scheme before its 2024 extension to everyone over 70.",
 rp:"The National Health Authority blamed newborns being moved to other hospitals under the mother's ID and computer clock mismatches; the CAG's data analysis contradicted that explanation. The government said it uses AI and machine learning to detect suspicious claims.",
 u:[["Business Today, 9 Aug 2023","https://www.businesstoday.in/amp/latest/policy/story/ayushman-bharat-patients-shown-as-dead-getting-treatment-985-lakh-ab-pmjay-beneficiaries-linked-to-same-mobile-number-says-cag-report-393403-2023-08-09"]],
 pr:["Ayushman Bharat health cover for everyone over 70","Ayushman Bharat with an extra Rs 5 lakh Delhi top-up"]},
{id:"f-bharatmala",sc:"Centre",ti:"Bharatmala Pariyojana, Phase I (national highways)",au:"CAG performance audit",dt:"Released 10 Aug 2023",ef:"q",
 bd:"The CAG found that 34,972 km (49%) of the 70,050 km Phase I target had already been developed or awarded under earlier highway schemes before Bharatmala was approved. The cost per km rose from Rs 14 crore to Rs 24 crore. In a sample of 50 projects, 35 floated tenders without the required appraisal. By March 2023, 76% of the approved project had been awarded while 158% of the approved funds had been sanctioned. This is a different target from the 60,000 km promise tracked here, but it matters when you read highway totals: some kilometres counted under one banner were started under another.",
 rp:"The ministry said it would streamline project-wise accounting, in reply to the CAG's recommendation on mapping fund releases to schemes. No other response was reported in our source.",
 u:[["PRS Legislative Research summary","https://prsindia.org/policy/report-summaries/implementation-of-phase-1-of-bharatmala-pariyojana"]],
 pr:["Build 60,000 km of national highways"]},
{id:"f-jjm-mh",sc:"Centre",wh:"Maharashtra",ti:"Jal Jeevan Mission: tap connections reported vs delivered",au:"CAG performance audit, Report No. 2",dt:"Published 2026 (audit covered 2019-20 to 2023-24)",ef:"q",
 bd:"In Maharashtra, tap-connection coverage was reported as 85.15% by March 2024, but that included 27.74 lakh private or own-source connections not provided under the mission. Counting only mission connections, achievement was 69% (101.31 lakh) by December 2024. Only 26.5% of villages were certified Har Ghar Jal. There was no way to measure whether the 55 litres per person per day standard was met, and five of six test-checked districts had large water-testing shortfalls.",
 rp:"Not included in the summary we read.",
 u:[["CAG executive summary (cag.gov.in)","https://cag.gov.in/uploads/download_audit_report/2026/6.-Executive-Summary-06a50a878c80396.60451856.pdf"]],
 pr:["Tap water for every household"]},
{id:"f-jjm-tn",sc:"Centre",wh:"Tamil Nadu",ti:"Jal Jeevan Mission: do taps deliver water?",au:"CAG performance audit",dt:"Tabled in Tamil Nadu Assembly, Sept 2026",ef:"q",
 bd:"In the selected districts, half of the targeted households did not get the minimum 55 litres per person per day. The state reported tap connections to about 84% of rural households. Coimbatore reported 100% connections, but only 8.67% of its habitations received 55 litres. About 96% of the surveyed taps (2,59,613 of 2,69,645) were placed in open spaces or streets rather than inside homes.",
 rp:"The government said lack of space and beneficiaries' requests explained taps outside homes; the CAG rejected this reasoning. No response to the supply shortfall was reported.",
 u:[["ThePrint (PTI), Sept 2026","https://theprint.in/india/jal-jeevan-mission-50-pc-households-face-water-shortfall-in-tn-says-cag-report/3037036/"]],
 pr:["Tap water for every household"]},
{id:"f-odf",sc:"Centre",wh:"Gujarat and Uttarakhand",ti:"Swachh Bharat: were states really open-defecation free?",au:"CAG state audit reports",dt:"Tabled Sept 2018",ef:"q",
 bd:"Gujarat was declared open-defecation free in October 2017. In a sample of 8 districts and 120 gram panchayats, the CAG found 15,728 of 54,008 households (about 29%) had no access to a household or public toilet, and concluded the claim that all districts were free of open defecation 'does not appear to be correct'. In Uttarakhand, of 1,143 village latrines reported built, 41 were physically missing and 34 were still under construction.",
 rp:"A Swachh Bharat Mission (Gramin) official in Gandhinagar disputed the findings, saying 2,529 of the 17,423 toilets the CAG listed as defunct in one taluka had been newly built and were in use by March 2018.",
 u:[["The Logical Indian, Sept 2018","https://thelogicalindian.com/gujarat-uttarakhand-not-odf-cag/"]],
 pr:["Make India open-defecation free"]},
{id:"f-uidai",sc:"Centre",ti:"Aadhaar: how UIDAI ran the system",au:"CAG audit of UIDAI",dt:"Reported Apr 2022 (data to 2019-20)",ef:"m",
 bd:"The CAG found about 4.75 lakh duplicate Aadhaar numbers had been cancelled as of November 2019, and residents reported 5,38,815 cases of multiple Aadhaars between 2015-16 and 2019-20. UIDAI had not specified a document to confirm that an applicant is a resident. It relied on companies' self-submitted audit reports for the security of stored Aadhaar numbers, and did not audit those companies itself.",
 rp:"UIDAI said its biometric de-duplication is 99.9% accurate, that poor-quality biometrics can produce multiple IDs, and that it was increasing audit submissions and training entities.",
 u:[["MediaNama summary, Apr 2022","https://www.medianama.com/2022/04/223-summary-aadhaar-uidai-cag-audit-report-2022/"]],
 pr:["A unique ID card for every Indian"]},
{id:"f-kisan",sc:"Centre",wh:"Haryana",ti:"PM-KISAN: payments to ineligible people",au:"CAG state audit report",dt:"Tabled 22 Mar 2023 (audit in 2021)",ef:"q",
 bd:"In 7 randomly chosen districts, 14 blocks and 84 villages, the CAG found 38,109 income-tax payers received Rs 37.34 crore and 3,131 other ineligible farmers received Rs 3.36 crore. Of Rs 40.70 crore released to ineligible and income-tax-paying people, only Rs 4.60 lakh had been recovered when the report was written. It also found 66 deceased beneficiaries and 19 landless people who received payments. This is one state's sample, not a national figure.",
 rp:"In December 2021 the state Agriculture Department said it had recovered Rs 23.94 lakh from 246 ineligible beneficiaries and Rs 138.02 lakh from 1,455 income-tax payers.",
 u:[["The Tribune, Mar 2023","https://www.tribuneindia.com/news/haryana/i-t-payers-pensioners-landless-pocketed-rs-42-crore-cag-report-491072"]],
 pr:["PM-KISAN income support for all farmers","Continue PM-KISAN"]},
{id:"f-pmuy",sc:"Centre",ti:"Ujjwala (PMUY): connections given vs cylinders refilled",au:"CAG performance audit",dt:"Submitted 11 Dec 2019 (May 2016 to Dec 2018)",ef:"m",
 bd:"Average refills per Ujjwala connection were 3.9, 3.4 and 3.0 a year in 2016-17, 2017-18 and 2018-19, against 7.5, 7.3 and 6.7 for other connections. About 14 lakh beneficiaries took between 3 and 41 cylinders in a month, which the CAG said showed a risk of domestic cylinders being diverted to commercial use. It did not confirm diversion. This audit predates the state free-refill schemes tracked here.",
 rp:"No government response was included in the summary we read.",
 u:[["PRS Legislative Research summary","https://prsindia.org/policy/report-summaries/pradhan-mantri-ujjwala-yojana"]],
 pr:["Two free LPG cylinders a year, at Holi and Diwali, for Ujjwala households"]},
{id:"f-dhealth",sc:"Delhi",ti:"Delhi mohalla clinics and health services, 2016 to 2023",au:"CAG audit of the Directorate General of Health Services",dt:"Reported Feb 2025",ef:"q",
 bd:"The target was 1,000 clinics by March 2017, but 523 were operational in March 2023. Of Rs 35.16 crore set aside for construction, Rs 9.78 crore (28%) was spent. In four districts, 41 of 218 clinics were closed for periods from 15 days to nearly two years because of staff shortages. None of the 74 clinics inspected had all 165 essential drugs. 70% of patients got consultations lasting under a minute. Note that the audit measured against a 1,000-clinic target, while the promise tracked here is the later 900-clinic pledge.",
 rp:"No response from the Aam Aadmi Party was included in the source we read.",
 u:[["Business Today, 25 Feb 2025","https://www.businesstoday.in/amp/india/story/cag-report-flags-gaps-in-aaps-mohalla-clinics-70-of-patients-got-consultations-lasting-more-in-delhi-assembly-today-465823-2025-02-25"]],
 pr:["900 mohalla clinics and primary health centres"]},
{id:"f-dtc",sc:"Delhi",ti:"Delhi Transport Corporation: fleet, buses and losses",au:"CAG audit of DTC",dt:"Tabled Mar 2025 (fleet data 2015 to 2023)",ef:"q",
 bd:"DTC's fleet fell from 4,344 buses in 2015-16 to 3,937 in 2022-23. It bought only 300 electric buses across 2021-22 and 2022-23. The share of overage low-floor buses rose from 0.13% in 2015 to 44.96% (1,770 buses) by March 2023. DTC's operating loss was Rs 14,198.86 crore over 2015 to 2022.",
 rp:"Leader of the Opposition Atishi said the report 'should be read properly before being discussed'. No detailed rebuttal was reported.",
 u:[["ETV Bharat, 24 Mar 2025","https://www.etvbharat.com/en/!state/delhi-cm-rekha-gupta-tables-cag-report-on-dtc-in-assembly-enn25032405860"]],
 pr:["Add 5,000 or more buses","More than 11,000 buses","Make Delhi a 100% e-bus city with 13,000 electric buses"]},
{id:"f-gdp",sc:"Data",ti:"Is India's GDP growth for 2011 to 2017 overstated?",au:"Former chief economic adviser vs the PM's Economic Advisory Council",dt:"Jun 2019",ef:"d",
 bd:"Arvind Subramanian, a former chief economic adviser, argued that India's GDP growth was overestimated by nearly 2.5 percentage points over 2011 to 2017, using 17 high-frequency indicators. The Economic Advisory Council to the PM rejected this on 19 June 2019, saying he had cherry-picked data, that the industrial-production index measures output rather than value added, and that he trusted a private agency over the official statistics office.",
 rp:"The Council's rebuttal is summarised above. The dispute has not been settled in our sources.",
 u:[["Business Standard, 19 Jun 2019","https://www.business-standard.com/amp/article/economy-policy/eac-pm-hits-back-at-subramanian-says-he-cherry-picked-data-for-gdp-claim-119061901026_1.html"]],
 pr:["Keep GDP growth at 7"]},
{id:"f-pov",sc:"Data",ti:"How many Indians are poor? The data gap",au:"Reporting on official and outside estimates",dt:"Oct 2022",ef:"d",
 bd:"The government's last official poverty estimate is from 2011-12 (21.9% using the Tendulkar method). The 2017-18 consumption survey was scrapped in 2019, citing quality concerns. Outside estimates for the late 2010s ranged from 10.2% to 25.9% depending on data and method, and an IMF paper that put extreme poverty below 1% in 2020 was widely criticised. This site's poverty measure uses World Bank estimates that include 2022 and 2023 survey years.",
 rp:"The article does not include a government response.",
 u:[["ThePrint, Oct 2022","https://theprint.in/economy/old-data-changing-methodology-why-number-of-indians-under-poverty-line-is-a-mystery/1168170/"]],
 pr:["Bring families below the poverty line into single digits"]},
{id:"f-gsdp",sc:"Data",ti:"State GDP figures vs the national total",au:"Business Standard analysis, with experts quoted",dt:"Mar 2022",ef:"m",
 bd:"For 2020-21, the states' own GDP figures added up to about Rs 210.5 lakh crore against the national statistics office's Rs 198 lakh crore, roughly 6.3% higher. A former chief statistician said states and the national office reconcile their numbers only after a lag, often over two years, and ICRA's chief economist said no financial agency relies on revised state estimates. Our reading: we compare growth within one state's own series, so a gap in the level matters less than a bias in the trend, which these sources do not establish.",
 rp:"The national statistics office was not quoted on the gap in this article.",
 u:[["Business Standard, Mar 2022","https://www.business-standard.com/amp/article/economy-policy/indian-states-and-their-propensity-to-exaggerate-their-gsdp-numbers-122032301130_1.html"]],
 pr:[]},
{id:"f-srs",sc:"Data",ti:"Infant mortality: how reliable is the Sample Registration System?",au:"Data for India explainer",dt:"Undated",ef:"m",
 bd:"The Registrar General's Sample Registration System (SRS) is a large sample survey that counts births and deaths in sampled areas. Earlier evaluations found it missed roughly 3% to 10% of events. A study of 2001 to 2010 found about 4.3% of male and 11.3% of female deaths went uncounted. Its sampling frame is updated only after each census, and its death estimates differ from survey-based ones. Birth figures broadly agree across sources.",
 rp:"Not applicable.",
 u:[["Data for India","https://www.dataforindia.com/crs-srs-accuracy/"]],
 pr:[]},
{id:"f-pmkvy",sc:"Centre",ti:"Skill India (PMKVY): records, payouts and inspections",au:"CAG performance audit of PMKVY 2.0 and 3.0",dt:"Tabled Dec 2025 (data to about Oct 2024)",ef:"q",
 bd:"For 94.53% of participants, the bank-account field was zero, blank or 'N/A'. Over 34 lakh certified candidates had not received their Rs 500 payout by October 2024. One unregistered agency certified 33,493 people across eight states with the same photographic evidence for different batches, and was found not to exist. The same inspector was recorded visiting centres in different states on the same day in 80 instances. Only 41% of certified candidates were reported as placed. The CAG described lapses in records and oversight; the reports we read do not use the word fraud.",
 rp:"The ministry said bank details were mandatory only at first and later payouts used Aadhaar, and that Covid disruption hurt placements. It recovered Rs 12.16 crore in interest that NSDC had retained.",
 u:[["The Wire, 8 Jan 2026","https://m.thewire.in/article/economy/dummy-emails-strange-bank-account-numbers-closed-centres-cag-flags-issues-in-modi-govts-skilling-scheme"],["Careers360","https://news.careers360.com/pmkvy-4-0-cag-audit-pm-kaushal-vikas-yojana-nsdc-skill-india-missing-underage-trainee-34-lakh-no-incentive-enrolment-placement-job"]],
 pr:[]}
];
const FID=Object.fromEntries(FIND.map(f=>[f.id,f]));

const BYP=[];FIND.forEach(f=>(f.pr||[]).forEach(p=>BYP.push([norm(p),f])));
function match(t){t=norm(t);const r=[];BYP.forEach(x=>{if(t.indexOf(x[0])===0&&r.indexOf(x[1])<0)r.push(x[1])});return r}
const route=()=>{let h=(location.hash||"").slice(1);const k=h.indexOf("/");return k<0?h:h.slice(0,k)};
function curArg(){let h=(location.hash||"").slice(1);try{h=decodeURIComponent(h)}catch(e){}const k=h.indexOf("/");return k<0?"":h.slice(k+1)}

function chip(fs){
  const f=fs.find(x=>x.ef==="q")||fs.find(x=>x.ef==="d")||fs[0];const e=EF[f.ef];
  const lab=f.ef==="d"?"Disputed data":"Audit finding";
  return `<a class="vchip ${e[1]}" href="#audits/${f.id}" title="${esc(e[0]+": "+f.ti)}">${esc(lab)}${fs.length>1?" ("+fs.length+")":""}</a>`}

function kind(card){
  const hs=[...card.querySelectorAll("details a")].map(a=>{try{return new URL(a.href).hostname}catch(e){return ""}});
  if(hs.some(h=>h.endsWith(".gov.in")||h.endsWith(".nic.in")))return "gov";
  if(hs.some(h=>h.indexOf("worldbank.org")>=0||h.indexOf("imf.org")>=0))return "intl";
  return "media"}
function howLine(card,fs){
  let t;
  if(fs.length){
    const f=fs[0];
    t=`<b>How this was checked:</b> ${fs.length>1?fs.length+" independent findings are on file. ":"An independent finding is on file. "}<a href="#audits/${f.id}">${esc(f.ti)}</a> (${esc(f.au)}, ${esc(f.dt)}). ${f.ef==="d"?"Credible sources disagree on the underlying data.":"An audit looks at how a scheme was run; it does not decide the verdict by itself."}`
  }else{
    const k=kind(card);
    const base=k==="gov"?"Based on government records or releases.":k==="intl"?"Based on World Bank or IMF figures, which compile what each country's statistics office reports.":"Based on media reports of official or party statements.";
    t=`<b>How this was checked:</b> ${base} No independent audit is linked here yet.`;
    if(card.classList.contains("st-prog"))t+=" It is still in progress, so results cannot be checked yet.";
    if(card.classList.contains("st-con"))t+=" Marked disputed because credible sources disagree."}
  return `<p class="vline">${t}</p>`}

function decorate(){
  if(route()==="audits")return;
  document.querySelectorAll("#app article.prom").forEach(a=>{
    if(a.dataset.vd)return;a.dataset.vd="1";
    const h=a.querySelector("h3");if(!h)return;
    const fs=match(h.textContent);
    if(fs.length)h.insertAdjacentHTML("beforeend"," "+chip(fs));
    const w=a.querySelector(".what");if(w)w.insertAdjacentHTML("afterend",howLine(a,fs))});
  document.querySelectorAll("#app .pcard .t, #app .plist2 .t").forEach(el=>{
    if(el.dataset.vd)return;el.dataset.vd="1";const fs=match(el.textContent);if(fs.length)el.insertAdjacentHTML("beforeend"," "+chip(fs))})}

/* ---------- reliability panel on compare and chart pages ---------- */
const PANEL_ROUTES=["compare","charts","scompare","sgov","dgov","dcompare","gov","issue","sissue","dissue"];
function scopeState(){
  const b=document.querySelector('#scopebar [data-scope][aria-pressed="true"]');let loc=null;
  try{loc=X.getLoc&&X.getLoc()}catch(e){}
  return b&&b.dataset.scope==="state"&&loc&&loc.state?loc.state:null}
const lk=id=>id?`<a href="#audits/${id}">See finding</a>`:"";
const OFF="Official figure; no independent audit linked here.";
function rowsFor(st){
  if(st==="Delhi")return [
    ["Delhi GSDP growth","Delhi government estimates","Official estimate; state and national totals reconcile only with a lag.","f-gsdp"],
    ["Per-person income growth","Delhi government estimates","Official estimate; state and national totals reconcile only with a lag.","f-gsdp"],
    ["Infant mortality","Sample Registration System","Large sample survey; earlier evaluations found it misses some events.","f-srs"],
    ["Air quality (AQI, PM2.5, good and severe days)","Official monitoring data",OFF,""],
    ["DTC bus fleet","DTC and Delhi government","A 2025 CAG audit covers DTC's fleet and finances.","f-dtc"]];
  if(st)return [
    ["Real GSDP growth","RBI Handbook of Statistics on Indian States, from state estimates","Official estimate; state and national totals reconcile only with a lag.","f-gsdp"],
    ["Per-person income growth","RBI Handbook, from state estimates","Official estimate; state and national totals reconcile only with a lag.","f-gsdp"],
    ["Infant mortality","Sample Registration System, via the RBI Handbook","Large sample survey; earlier evaluations found it misses some events.","f-srs"],
    ["Fiscal deficit","State finance figures in the RBI Handbook (actuals to 2022)",OFF,""],
    ["Power per person","RBI Handbook",OFF,""],
    ["Price inflation (CPI)","RBI Handbook",OFF,""]];
  const out=[];
  if(typeof M!=="undefined"&&typeof S!=="undefined"){
    M.forEach(m=>{
      let tag=OFF,id="";
      if(m.id==="gdp"){tag="Disputed: an economist and the PM's advisory council disagree on 2011 to 2017.";id="f-gdp"}
      else if(m.id==="pov"){tag="Data gap: no official estimate since 2011-12; outside estimates differ widely.";id="f-pov"}
      else if(m.id==="imr"||m.id==="mmr"||m.id==="le")tag="UN modelled estimate, not a direct count.";
      else if(m.id==="ge"||m.id==="cc")tag="Built from surveys and expert opinions, so it measures perceptions.";
      out.push([m.n,(S[m.src]&&S[m.src].t)||"",tag,id])})}
  return out}
function panel(){
  if(PANEL_ROUTES.indexOf(route())<0)return;
  const pg=document.querySelector("#app .wrap.page");if(!pg||document.getElementById("vpanel"))return;
  const st=scopeState();const rows=rowsFor(st);if(!rows.length)return;
  pg.insertAdjacentHTML("beforeend",`<details class="card vbox" id="vpanel"><summary>How reliable are these numbers?</summary>
  <p class="small muted">Every figure here comes from an official or international source. We have not re-checked them ourselves. Where an independent audit or a serious dispute exists, it is linked. <a href="#audits">All audit findings</a></p>
  <div class="vtw"><table class="vt"><thead><tr><th>Measure</th><th>Source</th><th>How it is checked</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])} ${lk(r[3])}</td></tr>`).join("")}</tbody></table></div></details>`)}

/* ---------- home strip ---------- */
function strip(){
  if(route()!=="home"||document.getElementById("vstrip"))return;
  const a=document.querySelector("#app .hero")||document.querySelector("#app > section");if(!a)return;
  a.insertAdjacentHTML("afterend",`<section class="wrap" id="vstrip"><div class="card vstrip"><div><b>Official numbers can be wrong.</b> <span class="muted">Where independent auditors or experts have questioned a figure or a scheme's results, we show it next to the claim.</span></div><a class="btn btn-s" href="#audits">See audit findings</a></div></section>`)}

/* ---------- audits page ---------- */
let vf="All";
const FILTERS=[["All","All"],["Centre","Centre schemes"],["Delhi","Delhi"],["Data","Data quality"]];
function card(f){
  const e=EF[f.ef];
  return `<details class="card vf" id="${f.id}"><summary><span class="vchip ${e[1]}">${esc(e[0])}</span><span class="vt1"><b>${esc(f.ti)}</b><span class="muted small">${esc(f.au)} &middot; ${esc(f.dt)}${f.wh?" &middot; "+esc(f.wh):""}</span></span></summary>
  <div class="vbody"><p><b>What was found.</b> ${esc(f.bd)}</p>
  <p><b>Official response.</b> ${esc(f.rp)}</p>
  ${f.pr&&f.pr.length?`<p class="small muted"><b>Related promises:</b> ${f.pr.map(esc).join("; ")}</p>`:""}
  <p class="small"><b>Sources:</b> ${f.u.map(s=>`<a href="${esc(s[1])}" target="_blank" rel="noopener">${esc(s[0])}</a>`).join(" &middot; ")}</p></div></details>`}
const TEMPLATE=["Correction request for SarkarDekho","Page or claim: ","What is wrong: ","Source (link): "].join(String.fromCharCode(10));
function viewAudits(){
  const list=FIND.filter(f=>vf==="All"||f.sc===vf);
  return `<div class="wrap page"><p class="crumbs"><a href="#home">Home</a> &rsaquo; Audit findings</p>
  <div class="phead"><h1 tabindex="-1" id="flowh">Can you trust the numbers?</h1><p class="intro">Governments and parties report their own results, and those reports can be wrong or incomplete. Here are independent checks we found: audits by the Comptroller and Auditor General (CAG) and serious disputes over the data itself.</p></div>
  <div class="card vbox vread"><b>How to read this page</b><ul>
  <li>An audit is about how a scheme was run: records, spending, delivery. It does not by itself decide whether a promise was kept.</li>
  <li>Auditors check samples. Reports can arrive years later, and they are tabled by the government of the day.</li>
  <li>Most promises here have no audit linked yet. That is not a clean bill of health. It only means we found no independent check.</li>
  <li>The same bar applies to every government and party. We show findings under all of them.</li></ul>
  <p class="small"><span class="vchip q">Raises doubts</span> an audit or investigation questions the reported results &nbsp; <span class="vchip m">Mixed picture</span> findings cut both ways or have limits &nbsp; <span class="vchip d">Disputed data</span> credible sources disagree on the figure itself</p></div>
  <div class="pills" role="group" aria-label="Filter findings">${FILTERS.map(x=>`<button data-vf="${x[0]}" aria-pressed="${vf===x[0]}">${x[1]} (${FIND.filter(f=>x[0]==="All"||f.sc===x[0]).length})</button>`).join("")}</div>
  <div class="vlist">${list.map(card).join("")}</div>
  <div class="card vbox"><b>Beware of fake scheme websites</b><p class="small">Official government sites end in .gov.in or .nic.in. Be wary of an email, SMS or call that asks you to pay a fee to register for, activate or 'verify' a scheme, and check the scheme on its official portal first. Report cyber fraud at cybercrime.gov.in or call 1930.</p></div>
  <div class="card vbox"><b>Spot an error?</b><p class="small">Corrections are welcome. Copy this note, fill in the claim and a link to a source, and send it to the person who shared this site with you.</p><button class="btn btn-s" data-vcopy="1">Copy correction note</button></div></div>`}
X.routes.audits={v:viewAudits,t:"Audit findings",nav:"audits"};

const pa=X.after;
X.after=(r,a)=>{if(pa)pa(r,a);
  if(r==="audits"){const id=curArg();if(id){const el=document.getElementById(id);if(el){el.open=true;setTimeout(()=>el.scrollIntoView({block:"start"}),80)}}}};

document.addEventListener("click",e=>{
  const t=e.target;
  const f=t.closest&&t.closest("[data-vf]");
  if(f){vf=f.dataset.vf;window.dispatchEvent(new HashChangeEvent("hashchange"));return}
  const c=t.closest&&t.closest("[data-vcopy]");
  if(c){try{navigator.clipboard.writeText(TEMPLATE).then(()=>{c.textContent="Copied"},()=>{c.textContent="Copy failed"})}catch(err){c.textContent="Copy failed"}}});

/* ---------- navigation links ---------- */
function addNav(){
  const nav=document.querySelector(".mainnav .wrap");
  if(nav&&!nav.querySelector('[data-r="audits"]')){
    const after=nav.querySelector('[data-r="charts"]');
    const a=document.createElement("a");a.href="#audits";a.dataset.r="audits";a.textContent="Audits";
    if(after&&after.nextSibling)nav.insertBefore(a,after.nextSibling);else nav.appendChild(a)}
  document.querySelectorAll(".foot-in div").forEach(d=>{
    const h=d.querySelector("h3");
    if(h&&h.textContent==="Data"&&!d.querySelector('a[href="#audits"]')){const a=document.createElement("a");a.href="#audits";a.textContent="Audit findings";d.appendChild(a)}})}
addNav();

const app=document.getElementById("app");
let queued=false;
function run(){queued=false;try{decorate();panel();strip()}catch(err){}}
if(app)new MutationObserver(()=>{if(!queued){queued=true;requestAnimationFrame(run)}}).observe(app,{childList:true,subtree:true});
run();
})();
