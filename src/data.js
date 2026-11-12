const TERMS=[
 {id:"upa1",name:"UPA-I",al:"upa",span:"2004–2009",years:[2004,2008],pm:"Manmohan Singh",seats:"145"},
 {id:"upa2",name:"UPA-II",al:"upa",span:"2009–2014",years:[2009,2013],pm:"Manmohan Singh",seats:"206"},
 {id:"nda1",name:"NDA-I",al:"nda",span:"2014–2019",years:[2014,2018],pm:"Narendra Modi",seats:"282"},
 {id:"nda2",name:"NDA-II",al:"nda",span:"2019–2024",years:[2019,2023],pm:"Narendra Modi",seats:"303"},
 {id:"nda3",name:"NDA-III",al:"nda",span:"2024–now",years:[2024,2025],pm:"Narendra Modi",seats:"240",ongoing:true}
];
const T=Object.fromEntries(TERMS.map(t=>[t.id,t]));
const SIDES={
 upa:{id:"upa",name:"Congress-led UPA",lead:"Indian National Congress (INC)",span:"2004–2014",years:[2004,2013],pm:"Manmohan Singh",terms:["upa1","upa2"],seats:[["2004","145"],["2009","206"]],short:"UPA, 2004–14"},
 nda:{id:"nda",name:"BJP-led NDA",lead:"Bharatiya Janata Party (BJP)",span:"2014–now",years:[2014,2023],pm:"Narendra Modi",terms:["nda1","nda2","nda3"],seats:[["2014","282"],["2019","303"],["2024","240"]],short:"NDA, 2014–24"}
};

const S={
 wb:{t:"World Bank, World Development Indicators (data updated July–Sept 2026)",u:"https://data.worldbank.org/country/india"},
 imf:{t:"IMF World Economic Outlook DataMapper",u:"https://www.imf.org/external/datamapper/profile/IND"},
 rbi:{t:"RBI Handbook of Statistics, Table 236: Central Government fiscal indicators (Aug 2025)",u:"https://www.rbi.org.in/Scripts/PublicationsView.aspx?id=23410"},
 plfs:{t:"MoSPI, PLFS Annual Report 2023-24 press note (Sept 2024)",u:"https://mospi.gov.in/sites/default/files/press_release/Press_note_AR_PLFS_2023_24_22092024.pdf"},
 niti:{t:"NITI Aayog multidimensional poverty paper, reported by PTI (Jan 2024)",u:"https://www.theweek.in/wire-updates/business/2024/01/15/del69-biz-ld-niti-poverty.html"},
 wbpov:{t:"World Bank poverty update, reported by PTI in The Tribune (June 2025)",u:"https://www.tribuneindia.com/news/india/extreme-poverty-in-india-down-to-5-3-from-27-1-world-bank"},
 nh04:{t:"The Quint fact-check citing MoRTH and NHAI network data (Jan 2019)",u:"https://thequint.com/news/webqoof/fact-check-length-of-national-highway-constructed-under-upa-modi"},
 nh25:{t:"IANS, MoRTH figures tabled in Parliament (Mar 2026)",u:"https://ianslive.in/indias-highway-network-expands-by-over-60-per-cent-in-last-11-years--20260310150604"},
 nhq:{t:"Lok Sabha Unstarred Q. 3688, NH built by year (Mar 2023)",u:"https://eparlib.nic.in/bitstream/123456789/1929845/1/AU3688.pdf"},
 nh24:{t:"NBM Media, MoRTH construction 2023-24 (Apr 2024)",u:"https://www.nbmcw.com/news/road-transport-ministry-constructs-12-349-km-of-highways-in-2023-24.html"},
 rail:{t:"The Week, railway electrification status (Jan 2026)",u:"https://www.theweek.in/news/sci-tech/2026/01/07/broad-gauge-100-percent-track-electrification-indian-railways.amp.html"},
 seats04:{t:"WION, Lok Sabha results history (June 2024)",u:"https://www.wionews.com/india-news/tracing-indias-electoral-history-who-won-and-who-lost-in-last-17-lok-sabha-elections-728366"},
 seats24:{t:"The Tribune, 2024 final results (June 2024)",u:"https://www.tribuneindia.com/news/india/final-lok-sabha-election-results-nda-wins-291-seats-set-to-form-government-india-bloc-230-627992/amp"},
 ncmp:{t:"UPA National Common Minimum Programme, full text (Outlook, May 2004)",u:"https://www.outlookindia.com/national/consensus-made-possible-news-224023"},
 inc09:{t:"Congress manifesto 2009, full text (SME Times)",u:"https://www.smetimes.in/smetimes/general-elections-2009/news/2009/Apr/14/congress-manifesto-for-general-elections-2009-full-text.html"},
 bjp14:{t:"BJP 2014 manifesto promises (Business Today)",u:"https://www.businesstoday.in/amp/latest/economy-politics/story/what-promises-did-the-bjp-make-in-its-2014-manifesto-183842-2019-04-07"},
 bjp19a:{t:"BJP Sankalp Patra 2019 key takeaways (ETV Bharat)",u:"https://etvbharat.com/english/elections/national/bjps-sankalp-patra-key-takeaways-1-1-1-1-1-1-1/na20190408134625293"},
 bjp19b:{t:"BJP Sankalp Patra 2019 infrastructure promises (India Infra Hub)",u:"https://indiainfrahub.com/roads/bjp-manifestos-major-infra-push-60000-km-of-new-highways-piped-water-in-all-houses-total-railway-electrification/"},
 bjp19c:{t:"BJP 2019 manifesto (BOOM)",u:"https://boomlive.in/bjp-election-manifesto-national-security-ram-mandir-sabarimala-included"},
 bjp19d:{t:"BJP 2019 manifesto analysis (Down To Earth)",u:"https://www.downtoearth.org.in/news/general-elections-2019/no-new-vision-in-bjp-manifesto-63884"},
 bjp24:{t:"BJP 2024 manifesto, 'Modi ki Guarantee' (Business Today)",u:"https://www.businesstoday.in/amp/india/story/lok-sabha-polls-2024-bjp-presents-modi-ki-guarantee-one-nation-one-election-among-key-promises-425440-2024-04-14"},
 bjp24b:{t:"BJP Sankalp Patra 2024, 47 highlights (Swarajya)",u:"https://swarajyamag.com/amp/story/politics/here-are-47-highlights-from-76-pages-of-the-bjp-sankalp-patra"},
 cmp24:{t:"BJP vs Congress 2024 manifestos compared (Outlook Business)",u:"https://www.outlookbusiness.com/news/lok-sabha-elections-2024-how-modis-guarantee-differs-from-congress-nyay-patra"},
 inc24:{t:"Congress Nyay Patra 2024 (The Tribune)",u:"https://www.tribuneindia.com/news/india/congress-manifesto-vows-to-bring-msp-law-raise-quota-cap-scrap-agnipath-607881"},
 inc24w:{t:"Congress Nyay Patra 2024, Women section (official manifesto site)",u:"https://manifesto.inc.in/en/women"},
 inc24y:{t:"Congress Nyay Patra 2024, Youth section (official manifesto site)",u:"https://manifesto.inc.in/en/youth"},
 inc24f:{t:"Congress Nyay Patra 2024, Farmers section (official manifesto site)",u:"https://manifesto.inc.in/en/farmers"},
 inc24h:{t:"Congress Nyay Patra 2024 (ETV Bharat)",u:"https://etvbharat.com/en/!bharat/congress-release-manifesto-for-lok-sabha-polls-calls-it-nyay-patra-enn24040502132"},
 inc24p:{t:"BJP and Congress 2024 personal-finance promises (Outlook Business)",u:"https://www.outlookbusiness.com/personal-finance-news/personal-finance-in-election-manifestos-bjp-promises-ayushman-bharat-for-seniors-congress-promises-increased-pensions"},
 inc24s:{t:"Congress Nyay Patra 2024 (The Statesman)",u:"https://www.thestatesman.com/india/caste-census-legal-status-to-msp-among-key-guarantees-in-congress-manifesto-1503287430.html"},
 caste:{t:"The News Minute, caste enumeration in next census approved (Apr 2025)",u:"https://www.thenewsminute.com/news/union-cabinet-approves-caste-enumeration-in-upcoming-census"},
 adr:{t:"Association for Democratic Reforms (ADR)",u:"https://www.adrindia.org/"},
 eci:{t:"Business Today on the ECI Voters' Service Portal (Aug 2026)",u:"https://www.businesstoday.in/india/story/eci-goes-spider-man-route-urges-citizens-to-register-to-vote-heres-how-to-do-it-online-547326-2026-08-06"}
};

function ser(start,arr){const o={};arr.forEach((v,i)=>{if(v!==null)o[start+i]=v});return o}
const D={
 gdp:ser(2004,[7.92,7.92,8.06,7.66,3.09,7.86,8.50,5.24,5.46,6.39,7.41,8.00,8.26,6.80,6.45,3.87,-5.78,9.69,7.61,7.21,7.10,7.57]),
 inf:ser(2004,[3.77,4.25,5.80,6.37,8.35,10.88,11.99,8.91,9.48,10.02,6.67,4.91,4.95,3.33,3.94,3.73,6.62,5.13,6.70,5.65,4.95,2.40]),
 fd:ser(2003,[4.34,3.88,3.96,3.32,2.54,5.99,6.46,4.80,5.91,4.93,4.48,4.10,3.87,3.48,3.46,3.44,4.65,9.16,6.71,6.45,5.49,4.75]),
 rd:ser(2003,[3.46,2.42,2.50,1.87,1.05,4.50,5.23,3.24,4.51,3.66,3.18,2.93,2.49,2.06,2.60,2.40,3.32,7.30,4.37,3.97,2.54,1.84]),
 debt:ser(2003,[85.9,84.9,82.4,77.9,75.4,74.3,72.7,67.7,68.7,68.1,68.0,67.6,69.7,69.7,70.7,71.6,76.5,90.4,85.5,84.4,84.7,84.8]),
 gfcf:ser(2003,[28.33,30.71,32.76,33.58,35.81,34.72,33.95,33.23,34.31,33.44,31.30,30.08,28.73,28.19,28.18,29.46,28.45,27.32,29.58,32.37,31.90,31.64,31.68]),
 mfg:ser(2003,[15.59,15.83,15.97,17.30,16.86,17.10,17.14,17.03,16.14,15.82,15.25,15.07,15.58,15.16,15.02,14.88,13.46,14.12,14.38,13.33,13.31,13.14,13.47]),
 exp:ser(2003,[14.95,17.86,19.61,21.27,20.80,24.10,20.40,22.40,24.54,24.53,25.43,22.97,19.81,19.16,18.79,19.93,18.66,18.68,21.40,24.04,22.35,22.06,22.26]),
 fdiusd:ser(2004,[5.43,7.27,20.03,25.23,43.41,35.58,27.40,36.50,24.00,28.15,34.58,44.01,44.46,39.97,42.12,50.61,64.36,44.73,49.94,28.09,27.14,39.10]),
 ngdp:ser(2004,[709.2,820.4,940.3,1216.7,1198.9,1341.9,1675.6,1823.1,1823.2,1847.8,2024.4,2083.3,2267.1,2613.1,2657.3,2780.9,2616.8,3090.9,3257.3,3511.7,3759.8,3909.0]),
 gdppc:ser(2003,[544,624,710,802,1022,993,1095,1348,1445,1429,1433,1554,1584,1708,1950,1966,2041,1907,2240,2280,2434,2592,2702]),
 res:ser(2003,[103.7,131.6,137.8,178.0,276.6,257.4,284.7,300.5,298.7,300.4,298.1,325.1,353.3,361.7,412.6,399.2,463.5,590.2,638.5,567.3,627.8,643.0,700.1]),
 ur:ser(2017,[6.0,5.8,4.8,4.2,4.1,3.2,3.2]),
 flfpr:ser(2017,[23.3,24.5,30.0,32.5,32.8,37.0,41.7]),
 imr:ser(2003,[60.4,58.5,56.5,54.5,52.5,50.5,48.4,46.3,44.2,42.2,40.1,38.2,36.3,34.6,32.9,31.3,29.8,28.3,27.0,25.7,24.5,23.3]),
 mmr:ser(2003,[313,296,277,258,240,223,205,188,173,160,148,137,129,121,113,107,101,101,155,90,80]),
 le:ser(2003,[64.09,64.48,64.94,65.37,65.80,66.25,66.70,67.16,67.62,68.08,68.50,68.93,69.33,69.71,70.07,70.42,70.75,70.16,67.28,71.70,72.00,72.24]),
 pov:{2004:46.4,2009:34.6,2011:27.1,2022:5.3,2023:2.6},
 edu:ser(2003,[3.61,3.35,3.19,3.14,null,null,3.28,3.38,3.80,3.87,3.84,3.90,4.11,4.25,4.31,4.36,3.90,4.29,4.63,4.10]),
 hlth:ser(2003,[0.76,0.72,0.78,0.75,0.75,0.81,0.91,0.87,0.94,0.93,0.87,0.86,0.92,0.94,0.97,0.98,1.04,1.21,1.35,1.37,1.30]),
 elec:ser(2003,[65.4,64.4,68.8,67.9,72.3,74.1,75.0,76.3,79.5,79.9,83.1,85.1,88.0,89.6,91.8,95.7,95.9,96.5,99.6,99.2,99.5,99.9]),
 sani:ser(2003,[22.7,25.5,28.3,31.1,33.9,36.8,39.6,42.5,45.4,48.3,51.2,54.2,57.1,60.1,63.1,66.1,69.1,72.0,74.9,77.8,80.7,83.4]),
 net:ser(2003,[1.7,2.0,2.4,2.8,4.0,4.4,5.1,7.5,10.1,11.1,12.3,13.5,14.9,16.5,18.2,20.1,29.5,43.4,49.3,55.9,60.3,64.9,70.0]),
 ge:ser(2003,[43.5,48.1,48.7,49.6,51.6,53.6,54.8,54.7,54.5,54.3,54.5,55.5,62.2,62.0,61.0,63.6,63.7,61.6,59.7,61.3,62.8,62.7,62.6]),
 cc:ser(2003,[36.9,40.2,39.8,43.4,41.4,42.1,41.1,40.7,38.2,37.9,38.6,39.7,41.1,42.3,43.5,43.8,43.6,42.9,41.9,41.5,41.3,42.0,42.4])
};
D.fdi={};Object.keys(D.fdiusd).forEach(y=>{if(D.ngdp[y])D.fdi[y]=+(D.fdiusd[y]/D.ngdp[y]*100).toFixed(2)});
D.ngdpT={};Object.keys(D.ngdp).forEach(y=>D.ngdpT[y]=+(D.ngdp[y]/1000).toFixed(2));

/* kind flow = yearly rate (compare averages); stock = level (compare start→end) */
const M=[
 {cat:"Economy and jobs",id:"gdp",q:"How fast did the economy grow?",n:"GDP growth",u:"% a year, after inflation",kind:"flow",dir:1,d:1,src:"wb",fy:true,why:"Faster growth usually means more jobs, higher incomes and more tax money for public services.",note:"Uses India's revised 2011-12 base series. 2008-09 includes the global financial crisis and 2020-21 the COVID-19 slump."},
 {cat:"Economy and jobs",id:"ur",q:"How many job-seekers couldn't find work?",n:"Unemployment rate (PLFS)",u:"% of labour force aged 15+",kind:"flow",dir:-1,d:1,src:"plfs",fy:true,only:true,why:"The most direct measure of whether people looking for work can find it.",note:"India's official yearly jobs survey only started in 2017-18, so there is no comparable figure for the UPA years."},
 {cat:"Economy and jobs",id:"flfpr",q:"Are more women working or looking for work?",n:"Women in the labour force (PLFS)",u:"% of women aged 15+",kind:"stock",dir:1,d:1,src:"plfs",fy:true,only:true,why:"More women earning lifts household incomes and the economy.",note:"Official survey from 2017-18 only."},
 {cat:"Economy and jobs",id:"gfcf",q:"Did businesses and government invest?",n:"Investment (fixed capital formation)",u:"% of GDP",kind:"flow",dir:1,d:1,src:"wb",fy:true,why:"Money spent on factories, roads and machines drives future growth and jobs."},
 {cat:"Economy and jobs",id:"mfg",q:"Did manufacturing grow?",n:"Manufacturing share of the economy",u:"% of GDP",kind:"flow",dir:1,d:1,src:"wb",fy:true,why:"Factories can employ many people moving out of low-paid farm work."},
 {cat:"Economy and jobs",id:"exp",q:"Did India sell more to the world?",n:"Exports of goods and services",u:"% of GDP",kind:"flow",dir:1,d:1,src:"wb",fy:true,why:"Exports bring in foreign currency and support jobs in competitive industries."},
 {cat:"Economy and jobs",id:"fdi",q:"Did foreign companies invest in India?",n:"Foreign direct investment, net inflows",u:"% of GDP (approx.)",kind:"flow",dir:1,d:2,src:"wb",why:"Foreign investment brings money, technology and jobs.",note:"World Bank net FDI divided by IMF nominal GDP in US$, so a bigger economy doesn't look better just for being bigger."},
 {cat:"Economy and jobs",id:"gdppc",q:"Did average income rise?",n:"GDP per person",u:"US$, current prices",kind:"stock",dir:1,d:0,src:"wb",fy:true,why:"A rough guide to average living standards.",note:"In current dollars, so it includes inflation and exchange-rate moves."},
 {cat:"Prices and government money",id:"inf",q:"Did prices stay under control?",n:"Consumer price inflation",u:"% a year",kind:"flow",dir:-1,d:1,src:"wb",why:"Rising prices eat into wages and savings, and hit poorer families hardest.",note:"Since 2016 the RBI targets 4% inflation, within a 2–6% band."},
 {cat:"Prices and government money",id:"fd",q:"How much did the central government borrow each year?",n:"Fiscal deficit",u:"% of GDP",kind:"flow",dir:-1,d:2,src:"rbi",fy:true,why:"Heavy borrowing raises interest bills that future taxpayers pay, leaving less for services.",note:"2024-25 is a revised estimate. 2020-21 reflects pandemic spending."},
 {cat:"Prices and government money",id:"rd",q:"Was borrowing spent on day-to-day costs?",n:"Revenue deficit",u:"% of GDP",kind:"flow",dir:-1,d:2,src:"rbi",fy:true,why:"Borrowing for salaries and subsidies, rather than for building things, is the costlier kind.",note:"2024-25 is a revised estimate."},
 {cat:"Prices and government money",id:"debt",q:"How much debt is the country carrying?",n:"Government debt (Centre + states)",u:"% of GDP",kind:"stock",dir:-1,d:1,src:"imf",fy:true,why:"High debt limits what governments can spend in a future crisis."},
 {cat:"Prices and government money",id:"res",q:"How big is India's emergency cushion of foreign currency?",n:"Foreign exchange reserves",u:"US$ billion, incl. gold",kind:"stock",dir:1,d:0,src:"wb",why:"Reserves protect the rupee and pay for imports if money flows out suddenly."},
 {cat:"Health, poverty and schooling",id:"imr",q:"Are fewer babies dying?",n:"Infant mortality",u:"deaths per 1,000 live births",kind:"stock",dir:-1,d:1,src:"wb",why:"One of the clearest signs of whether health care reaches ordinary families.",note:"UN modelled estimate, smoothed across years."},
 {cat:"Health, poverty and schooling",id:"mmr",q:"Are fewer mothers dying in childbirth?",n:"Maternal mortality",u:"deaths per 1,00,000 live births",kind:"stock",dir:-1,d:0,src:"wb",why:"Shows whether safe childbirth care is reaching women.",note:"UN modelled estimate. The 2021 spike reflects COVID-19."},
 {cat:"Health, poverty and schooling",id:"le",q:"Are people living longer?",n:"Life expectancy at birth",u:"years",kind:"stock",dir:1,d:1,src:"wb",why:"Sums up health, nutrition and living conditions in one number.",note:"The 2021 dip reflects COVID-19 deaths."},
 {cat:"Health, poverty and schooling",id:"pov",q:"Are fewer people extremely poor?",n:"People living on under $3 a day",u:"% of population (2021 prices)",kind:"stock",dir:-1,d:1,src:"wb",sparse:true,why:"Tracks the poorest households, who depend most on government help.",note:"Estimates exist only for survey years (2004, 2009, 2011, 2022, 2023), and survey methods changed between 2011-12 and 2022-23."},
 {cat:"Health, poverty and schooling",id:"hlth",q:"How much did the government spend on health?",n:"Government health spending",u:"% of GDP",kind:"flow",dir:1,d:2,src:"wb",why:"Low public spending means families pay more for treatment out of their own pockets."},
 {cat:"Health, poverty and schooling",id:"edu",q:"How much did the government spend on education?",n:"Government education spending",u:"% of GDP",kind:"flow",dir:1,d:2,src:"wb",why:"Shapes the quality of government schools and colleges.",note:"No data for 2007 and 2008."},
 {cat:"Basic services",id:"elec",q:"Do people have electricity?",n:"Access to electricity",u:"% of population",kind:"stock",dir:1,d:1,src:"wb",why:"Power at home matters for study, work, health and safety."},
 {cat:"Basic services",id:"sani",q:"Do people have toilets?",n:"At least basic sanitation",u:"% of population",kind:"stock",dir:1,d:1,src:"wb",interp:true,why:"Toilets reduce disease and protect women's safety and dignity.",note:"Estimated by drawing a straight line between surveys, so the pace looks the same in every term and can't tell the governments apart."},
 {cat:"Basic services",id:"net",q:"Are people online?",n:"People using the internet",u:"% of population",kind:"stock",dir:1,d:1,src:"wb",why:"Access to jobs, payments, schooling and government services increasingly runs online.",note:"Cheap mobile data after 2016 drove a jump across the region, not only in India."},
 {cat:"Governance",id:"ge",q:"How effective is the government seen to be?",n:"Government effectiveness score",u:"0–100, World Bank",kind:"stock",dir:1,d:1,src:"wb",why:"Measures the quality of public services and how well policies are carried out.",note:"Built from surveys and expert opinions, so it measures perceptions."},
 {cat:"Governance",id:"cc",q:"How well is corruption controlled?",n:"Control of corruption score",u:"0–100, World Bank",kind:"stock",dir:1,d:1,src:"wb",why:"Corruption wastes public money and makes people pay bribes for services.",note:"Built from surveys and expert opinions, so it measures perceptions."}
];

/* Promise statuses in plain words */
const ST={ach:{l:"Kept",i:"✓"},part:{l:"Partly kept",i:"½"},not:{l:"Not kept",i:"✕"},con:{l:"Disputed",i:"?"},prog:{l:"Still in progress",i:"…"}};
const P=[
 {t:"upa1",m:"ncmp",p:"Keep GDP growth at 7–8% a year or more",dl:"Sustained",s:"part",e:"Growth averaged 6.9% from 2004-05 to 2008-09 in the revised data. Four of five years were above 7.6%; 2008-09 fell to 3.1% in the global financial crisis.",src:[["World Bank GDP growth",S.wb.u]]},
 {t:"upa1",m:"ncmp",p:"A legal guarantee of at least 100 days of paid work a year for rural, urban poor and lower-middle-class households",dl:"None set",s:"part",e:"The rural part became law (NREGA), launched in 2006 and extended to every district in 2008. It covered rural households only, and households got 43–54 days of work a year on average.",src:[["MoSPI Statistical Year Book","https://www.mospi.gov.in/sites/default/files/Statistical_year_book_india_chapters/Rural%26urbandevelopment.pdf"]]},
 {t:"upa1",m:"ncmp",p:"Raise government spending on education to at least 6% of GDP",dl:"Phased",s:"not",e:"It stayed between 3.1% and 3.4% of GDP.",src:[["World Bank education spending",S.wb.u]]},
 {t:"upa1",m:"ncmp",p:"Raise government spending on health to at least 2–3% of GDP",dl:"Within five years",s:"not",e:"It went from 0.72% of GDP in 2004 to 0.91% in 2009.",src:[["World Bank health spending",S.wb.u]]},
 {t:"upa1",m:"ncmp",p:"Reserve one-third of Lok Sabha and assembly seats for women",dl:"None set",s:"not",e:"A bill was introduced in the Rajya Sabha in May 2008 but did not pass in this term.",src:[["Business Today, history of the bill (Sept 2023)","https://businesstoday.in/visualstories/news/all-about-the-womens-reservation-bill-its-history-and-progress-over-the-years-64066-19-09-2023"]]},
 {t:"upa1",m:"ncmp",p:"Wipe out the central government's revenue deficit",dl:"By 2009",s:"not",e:"It fell from 2.42% of GDP in 2004-05 to 1.05% in 2007-08, then jumped to 4.50% in 2008-09 when spending rose during the global crisis.",src:[["RBI Handbook, Table 236",S.rbi.u]]},
 {t:"upa1",m:"ncmp",p:"Double the flow of farm credit",dl:"Within three years",s:"ach",e:"Bank credit to agriculture went from ₹86,981 crore in 2003-04 to ₹1,80,486 crore in 2005-06 and ₹2,29,400 crore in 2006-07.",src:[["Economic Survey 2008-09, chapter 5","https://indiabudget.gov.in/budget_archive/es2008-09/chapt2009/chap54.pdf"]]},
 {t:"upa1",m:"ncmp",p:"Electricity for every household",dl:"Within five years",s:"not",e:"Access rose from 64.4% of people in 2004 to 75.0% in 2009.",src:[["World Bank electricity access",S.wb.u]]},
 {t:"upa1",m:"ncmp",p:"Attract two to three times more foreign direct investment",dl:"None set",s:"ach",e:"Net inflows rose from $5.4 billion in 2004 to $43.4 billion in 2008.",src:[["World Bank FDI",S.wb.u]]},
 {t:"upa2",m:"inc09",p:"A Right to Food law: 25 kg of rice or wheat a month at ₹3 a kg for every BPL family",dl:"None set",s:"part",e:"The Food Security Act, 2013 passed in a different form: 5 kg per person a month at ₹1–3 a kg for up to 75% of rural and 50% of urban people, and 35 kg for the poorest households.",src:[["NFSA salient features (Govt of India)","https://nfsa.gov.in/portal/Salient_Features_NFSA_AA"]]},
 {t:"upa2",m:"inc09",p:"Pass women's reservation in the 15th Lok Sabha",dl:"Within the term",s:"not",e:"The bill passed the Rajya Sabha 186–1 in March 2010 but was never taken up in the Lok Sabha.",src:[["Business Today (Sept 2023)","https://businesstoday.in/visualstories/news/all-about-the-womens-reservation-bill-its-history-and-progress-over-the-years-64066-19-09-2023"]]},
 {t:"upa2",m:"inc09",p:"Bring in GST",dl:"1 April 2010",s:"not",e:"Not done in this term. GST started on 1 July 2017, under the next government.",src:[["LiveLaw (July 2017)","https://www.livelaw.in/amp/goods-service-tax-gst-formally-launched"]]},
 {t:"upa2",m:"inc09",p:"Broadband in every village",dl:"Within three years",s:"not",e:"The fibre network was due by 2013. By March 2015 about 20,000 villages were covered.",src:[["Voice&Data (May 2015)","https://www.voicendata.com/nofn-gets-another-jolt-deadline-to-cover-2-5-lakh-panchayats-extended-by-2-years"]]},
 {t:"upa2",m:"inc09",p:"Health insurance (RSBY) for every BPL family",dl:"Within three years",s:"part",e:"By August 2012, about half of BPL families were enrolled in the ten largest states. 3.85 crore families were covered in 2013-14.",src:[["IndiaSpend (Aug 2012)","https://www.isignal.in/health-insurance-for-poor-fact-or-myth"],["Lok Sabha Q. 2057 (Mar 2015)","https://eparlib.nic.in/bitstream/123456789/657973/1/12700.pdf"]]},
 {t:"upa2",m:"inc09",p:"Add 12,000–15,000 MW of power capacity every year",dl:"Every year",s:"ach",e:"80,704 MW was added in five years, about 16,100 MW a year. One year (2009-10) fell short at 9,585 MW.",src:[["Lok Sabha Q. 413 (May 2012)","https://eparlib.nic.in/bitstream/123456789/620257/1/121517.pdf"],["Ministry of Power, 12th Plan","https://powermin.gov.in/sites/default/files/uploads/overview_of_Capacity_Addition_during_12th_Plan.pdf"]]},
 {t:"upa2",m:"inc09",p:"NREGA work at a real wage of ₹100 a day",dl:"None set",s:"ach",e:"From January 2011, NREGA wages were linked to prices for farm workers, starting from ₹100 a day or the 2009 wage if higher.",src:[["PIB release via India Water Portal","https://admin.indiawaterportal.org/articles/17-30-percent-hike-wages-under-mahatma-gandhi-nrega-pib-release"]]},
 {t:"upa2",m:"inc09",p:"A unique ID card for every Indian",dl:"After 2011",s:"part",e:"64 crore Aadhaar numbers had been issued by July 2014, roughly half the population.",src:[["Business Standard (July 2014)","https://www.business-standard.com/article/current-affairs/73-7-cr-aadhaar-enrolments-done-till-mid-july-inderjit-singh-114072400753_1.html"]]},
 {t:"nda1",m:"bjp14",p:"A pucca house for every family",dl:"2022",s:"part",e:"The 2022 deadline was missed and extended. The urban scheme had finished 62 lakh of 123 lakh sanctioned homes when its deadline moved to 2024. The rural scheme had finished over 2.82 crore of its 2.95 crore target by August 2025.",src:[["Housing.com (Aug 2022)","https://housing.com/news/govt-extends-pmay-urban-deadline-till-december-2024"],["IANS (Sept 2025)","https://ianslive.in/282-crore-houses-completed-so-far-under-pmay-g-scheme-data--20250924103420"]]},
 {t:"nda1",m:"bjp14",p:"Raise government spending on education to 6% of GDP",dl:"None set",s:"not",e:"It stayed between 3.9% and 4.6% of GDP from 2014 to 2022.",src:[["World Bank education spending",S.wb.u]]},
 {t:"nda1",m:"bjp14",p:"Bring in GST",dl:"None set",s:"ach",e:"GST started on 1 July 2017.",src:[["LiveLaw (July 2017)","https://www.livelaw.in/amp/goods-service-tax-gst-formally-launched"]]},
 {t:"nda1",m:"bjp14",p:"One Rank, One Pension for ex-servicemen",dl:"None set",s:"ach",e:"Notified on 7 November 2015.",src:[["LiveLaw","https://livelaw.in/notification-for-implementation-of-orop-issued"]]},
 {t:"nda1",m:"bjp14",p:"A task force to track and bring back black money held abroad",dl:"None set",s:"ach",e:"A Special Investigation Team was set up on 27 May 2014, as the Supreme Court had ordered. The promise set no target for money recovered.",src:[["India Briefing (May 2014)","https://india-briefing.com/news/modi-cabinet-constitutes-special-investigative-team-black-money-8465.html"]]},
 {t:"nda1",m:"bjp14",p:"Make India open-defecation free",dl:"Later set as 2 Oct 2019",s:"con",e:"The government declared India open-defecation free on 2 October 2019. A national survey in late 2018 found 71.3% of rural households had access to a toilet.",src:[["The Week, NSO survey (Nov 2019)","https://www.theweek.in/news/india/2019/11/25/rural-india-not-yet-open-defecation-free-says-nso-survey.amp.html"]]},
 {t:"nda1",m:"bjp14",p:"Build a bullet train",dl:"None set",s:"prog",e:"The Mumbai–Ahmedabad line is being built. The first stretch, Surat–Vapi, is expected to open in August 2027.",src:[["Business Today (Aug 2026)","https://www.businesstoday.in/latest/trends/photo/when-will-indias-first-bullet-train-run-latest-construction-figures-august-2027-target-and-timeline-caveats-549323-2026-08-16"]]},
 {t:"nda2",m:"bjp19a",p:"Remove Article 370 and Article 35A in Jammu and Kashmir",dl:"None set",s:"ach",e:"Done in August 2019. The Supreme Court upheld it in December 2023.",src:[["Business Standard (Dec 2023)","https://www.business-standard.com/politics/sc-upholds-abrogation-of-article-370-pm-hails-abdullah-says-disappointed-123121100479_1.html"]]},
 {t:"nda2",m:"bjp19c",p:"Pass the Citizenship Amendment Bill",dl:"None set",s:"ach",e:"Passed in December 2019. Its rules came into force in March 2024.",src:[["The Tribune (Mar 2024)","https://www.tribuneindia.com/news/india/caa-rules-notified-pakistan-bangladesh-afghanistan-refugees-can-get-citizenship-599527"]]},
 {t:"nda2",m:"bjp19c",p:"PM-KISAN income support for all farmers",dl:"None set",s:"ach",e:"Extended to all eligible farmer families, whatever their land size, at the new government's first Cabinet meeting.",src:[["Scroll (May 2019)","https://scroll.in/latest/925509/centre-approves-extension-of-pm-kisan-yojana-to-all-eligible-farmer-families-irrespective-of-landholdings"]]},
 {t:"nda2",m:"bjp19a",p:"A pension for small farmers at age 60",dl:"None set",s:"ach",e:"PM Kisan Maan-Dhan, a ₹3,000-a-month pension scheme, launched in September 2019.",src:[["The Tribune (Sept 2019)","https://www.tribuneindia.com/news/archive/nation/news-detail-831578"]]},
 {t:"nda2",m:"bjp19c",p:"Double farmers' income",dl:"2022",s:"con",e:"The government told Parliament in 2022 that incomes had more than doubled, without national figures. The latest official survey (2018-19) found ₹10,218 a month, against a 2022 goal of ₹21,146.",src:[["Down To Earth (July 2022)","https://www.downtoearth.org.in/agriculture/govt-says-farmers-incomes-more-than-doubled-but-doesn-t-give-any-number-83814"]]},
 {t:"nda2",m:"bjp19b",p:"Tap water for every household (Nal se Jal)",dl:"2024",s:"part",e:"80% of rural homes had a tap by March 2025, up from 17% in 2019. The deadline moved to 2028.",src:[["The Wire (Mar 2025)","https://m.thewire.in/article/government/80-rural-households-covered-under-jal-jeevan-mission-centre-tells-parliament"]]},
 {t:"nda2",m:"bjp19b",p:"Build 60,000 km of national highways",dl:"Five years",s:"part",e:"56,701 km was built from 2019-20 to 2023-24, about 94% of the target.",src:[["Lok Sabha Q. 3688 (Mar 2023)",S.nhq.u],["NBM Media (Apr 2024)",S.nh24.u]]},
 {t:"nda2",m:"bjp19b",p:"Electrify all railway lines",dl:"2022",s:"part",e:"Missed 2022. 96% was done by the end of 2024, and 99.2% by November 2025.",src:[["The Week (Jan 2026)",S.rail.u]]},
 {t:"nda2",m:"bjp19a",p:"Fibre internet to every gram panchayat",dl:"2022",s:"part",e:"Missed 2022. 2.14 lakh of about 2.5 lakh panchayats were connected by July 2025.",src:[["Lok Sabha Q. 556 (July 2025)","https://eparlib.sansad.in/bitstream/123456789/2997131/1/AU556_SaPBpp.pdf"]]},
 {t:"nda2",m:"bjp19a",p:"A $5 trillion economy",dl:"2025",s:"not",e:"The IMF puts India's 2025 economy at about $3.9 trillion and expects it to pass $5 trillion around 2028.",src:[["IMF DataMapper",S.imf.u]]},
 {t:"nda2",m:"bjp19c",p:"Bring families below the poverty line into single digits",dl:"Five years",s:"con",e:"India has had no official poverty line since 2011-12, so it depends on the measure. The World Bank says 5.3% lived on under $3 a day in 2022-23. NITI Aayog's broader poverty measure was 11.28%.",src:[["The Tribune, World Bank (June 2025)",S.wbpov.u],["The Week, NITI Aayog (Jan 2024)",S.niti.u]]},
 {t:"nda2",m:"bjp19c",p:"Help build the Ram Mandir in Ayodhya within the Constitution",dl:"None set",s:"ach",e:"The Supreme Court ruled on the land dispute in November 2019. The temple was consecrated on 22 January 2024.",src:[["ETV Bharat (Jan 2024)","https://www.etvbharat.com/en/!bharat/ram-lalla-consecration-sc-judges-of-ayodhya-verdict-invited-for-jan-22-ceremony-enn24011900687"]]},
 {t:"nda2",m:"bjp19d",p:"Reserve 33% of Lok Sabha and assembly seats for women",dl:"None set",s:"part",e:"The law passed unanimously in September 2023, but reservation only starts after a new census and delimitation. No seats are reserved yet.",src:[["The Wire (Apr 2026)","https://thewire.in/politics/major-setback-modi-govts-constitution-amendment-bill-delimitation-fails-in-lok-sabha"]]},
 {t:"nda3",m:"bjp24",p:"Ayushman Bharat health cover for everyone over 70",dl:"None set",s:"ach",e:"Launched in October 2024. Over 86.5 lakh cards had been issued by October 2025.",src:[["IBTimes (Nov 2025)","https://www.ibtimes.co.in/govt-says-86-lakh-ayushman-vay-vandana-cards-created-citizens-aged-70-above-891638"]]},
 {t:"nda3",m:"bjp24",p:"Double the Mudra small-business loan limit to ₹20 lakh",dl:"None set",s:"ach",e:"A new ₹20 lakh category started in October 2024.",src:[["Business Standard (Oct 2024)","https://www.business-standard.com/amp/economy/news/centre-doubles-loan-limit-under-pradhan-mantri-mudra-yojana-to-rs-20-lakh-124102501146_1.html"]]},
 {t:"nda3",m:"bjp24",p:"3 crore 'Lakhpati Didis' (women in self-help groups earning ₹1 lakh a year)",dl:"None set",s:"ach",e:"The minister said in September 2026 that about 3.5 crore had been reached, and set a new goal of 6 crore. This is the government's own figure; no independent check was found.",src:[["Devdiscourse / ANI (Sept 2026)","https://www.devdiscourse.com/article/headlines/3971903-35-crore-lakhpati-didis-created-target-is-6-crore-shivraj-chouhan-in-mumbai"]]},
 {t:"nda3",m:"bjp24",p:"3 crore more houses",dl:"None set",s:"prog",e:"2 crore more rural homes were approved for 2024-25 to 2028-29. No completion figures for the new homes were found.",src:[["PM India, Cabinet approval","https://www.pmindia.gov.in/en/news_updates/cabinet-approves-implementation-of-the-pradhan-mantri-awaas-yojana-gramin-pmay-g-during-fy-2024-25-to-2028-29/"]]},
 {t:"nda3",m:"bjp24",p:"One Nation, One Election",dl:"None set",s:"prog",e:"The bill is with a parliamentary committee, whose deadline was pushed to the 2026 winter session.",src:[["Manorama Yearbook (July 2026)","https://www.manoramayearbook.in/current-affairs/india/2026/07/30/jpc-examining-bills-on-one-nation-one-election.html"]]},
 {t:"nda3",m:"bjp24",p:"Put women's reservation into effect",dl:"None set",s:"prog",e:"The 2023 law came into force in April 2026, but the next day a bill linking it to new seat boundaries failed in the Lok Sabha (298 for, 230 against; two-thirds needed).",src:[["The Wire (Apr 2026)","https://thewire.in/politics/major-setback-modi-govts-constitution-amendment-bill-delimitation-fails-in-lok-sabha"]]},
 {t:"nda3",m:"bjp24",p:"A Uniform Civil Code",dl:"None set",s:"prog",e:"No national law yet. Uttarakhand (2024) and Gujarat (2026) passed their own state codes.",src:[["PMF IAS (Apr 2026)","https://www.pmfias.com/gujarat-passes-ucc-bill-2026/"]]},
 {t:"nda3",m:"bjp24",p:"Zero electricity bills through rooftop solar (PM Surya Ghar)",dl:"Scheme goal: 1 crore homes by 2026-27",s:"prog",e:"19.2 lakh rooftop systems were installed by December 2025.",src:[["SolarQuarter (Dec 2025)","https://solarquarter.com/2025/12/09/indias-rooftop-solar-push-gains-momentum-pm-surya-ghar-scheme-reaches-23-96-lakh-installations"]]}
];
const MANI_LABEL={ncmp:"UPA programme, 2004",inc09:"Congress manifesto, 2009",bjp14:"BJP manifesto, 2014",bjp19a:"BJP manifesto, 2019",bjp19b:"BJP manifesto, 2019",bjp19c:"BJP manifesto, 2019",bjp19d:"BJP manifesto, 2019",bjp24:"BJP manifesto, 2024"};

/* Issues each promise relates to, in the same order as P */
const P_ISS=[
 ["economy"],["jobs","welfare"],["education"],["health"],["women"],["debt"],["farmers"],["services"],["economy"],
 ["welfare"],["women"],["economy"],["services"],["health"],["services"],["welfare","jobs"],["governance"],
 ["services","welfare"],["education"],["economy"],["national"],["governance"],["health","services"],["services"],
 ["national"],["national"],["farmers"],["farmers"],["farmers"],["services"],["services"],["services"],["services"],["economy"],["welfare"],["national"],["women"],
 ["health"],["jobs"],["women"],["services","welfare"],["national","governance"],["women"],["national"],["services"]
];
if(P_ISS.length!==P.length)throw new Error("P_ISS length mismatch");
P.forEach((p,i)=>{p.iss=P_ISS[i]});

/* 2024 manifesto promises, both sides. sd: side, topic: group for the Explore view, iss: issues */
const NOW2=[
 {sd:"nda",topic:"Farmers",iss:["farmers"],p:"Continue PM-KISAN: ₹6,000 a year to farmers",src:"bjp24b"},
 {sd:"upa",topic:"Farmers",iss:["farmers"],p:"A legal guarantee of minimum support prices (MSP), as the Swaminathan Commission recommended",src:"inc24f"},
 {sd:"upa",topic:"Farmers",iss:["farmers"],p:"Settle crop insurance claims within 30 days",src:"inc24f"},
 {sd:"upa",topic:"Farmers",iss:["farmers"],p:"A permanent commission on farm finance to advise on loan relief",src:"inc24f"},
 {sd:"nda",topic:"Jobs and youth",iss:["jobs"],p:"Fill government vacancies on a fixed timetable, and a strict law against exam paper leaks",src:"cmp24"},
 {sd:"nda",topic:"Jobs and youth",iss:["jobs"],p:"Double the Mudra small-business loan limit to ₹20 lakh",src:"bjp24",st:"ach",ev:"A ₹20 lakh category started in October 2024."},
 {sd:"upa",topic:"Jobs and youth",iss:["jobs","education"],p:"A right to a one-year apprenticeship paying ₹1 lakh, for graduates and diploma holders under 25",src:"inc24y"},
 {sd:"upa",topic:"Jobs and youth",iss:["jobs"],p:"Fill nearly 30 lakh vacant central government posts",src:"inc24y"},
 {sd:"upa",topic:"Jobs and youth",iss:["jobs"],p:"Fast-track courts for exam paper leaks, and no application fees for government exams",src:"inc24y"},
 {sd:"upa",topic:"Jobs and youth",iss:["jobs","national"],p:"Scrap the Agnipath scheme and return to regular army recruitment",src:"inc24s"},
 {sd:"nda",topic:"Women",iss:["women"],p:"3 crore more 'Lakhpati Didis' (women in self-help groups earning ₹1 lakh a year)",src:"bjp24",st:"ach",ev:"Government says about 3.5 crore reached by Sept 2026."},
 {sd:"nda",topic:"Women",iss:["women"],p:"Put one-third reservation for women in Parliament and assemblies into effect",src:"bjp24b",st:"prog",ev:"A bill to implement it failed in the Lok Sabha in April 2026.",also:"Also promised in 2019"},
 {sd:"upa",topic:"Women",iss:["women","welfare"],p:"₹1 lakh a year to every poor family, paid to the oldest woman (Mahalakshmi)",src:"inc24w"},
 {sd:"upa",topic:"Women",iss:["women","jobs"],p:"Half of all new central government jobs for women, from 2025",src:"inc24w"},
 {sd:"upa",topic:"Women",iss:["women"],p:"Bring women's reservation into force at once: assemblies from 2025, Lok Sabha from 2029",src:"inc24w",also:"Also promised in 2004 and 2009"},
 {sd:"nda",topic:"Health",iss:["health"],p:"Ayushman Bharat health cover for everyone over 70",src:"bjp24",st:"ach",ev:"Launched October 2024."},
 {sd:"nda",topic:"Health",iss:["health"],p:"Strengthen AIIMS hospitals and low-cost Jan Aushadhi medicine shops",src:"cmp24"},
 {sd:"upa",topic:"Health",iss:["health"],p:"Cashless health insurance up to ₹25 lakh, on Rajasthan's model",src:"inc24h"},
 {sd:"upa",topic:"Health",iss:["health"],p:"Raise the health budget to 4% of total government spending by 2028-29",src:"cmp24"},
 {sd:"nda",topic:"Education",iss:["education"],p:"Expand Ekalavya Model Residential Schools beyond the existing 740",src:"bjp24b"},
 {sd:"upa",topic:"Education",iss:["education"],p:"Review the National Education Policy",src:"inc24"},
 {sd:"nda",topic:"Welfare and housing",iss:["welfare"],p:"Free ration for five more years",src:"bjp24b"},
 {sd:"nda",topic:"Welfare and housing",iss:["welfare","services"],p:"3 crore more houses",src:"bjp24",st:"prog",ev:"2 crore rural homes approved for 2024-29."},
 {sd:"nda",topic:"Welfare and housing",iss:["services"],p:"Zero electricity bills through rooftop solar",src:"bjp24",st:"prog",ev:"19.2 lakh systems installed by Dec 2025."},
 {sd:"upa",topic:"Welfare and housing",iss:["welfare","jobs"],p:"Raise the MGNREGA wage to ₹400 a day",src:"inc24"},
 {sd:"upa",topic:"Welfare and housing",iss:["welfare"],p:"Raise central pensions for the elderly, widows and disabled people to ₹1,000 a month",src:"inc24p"},
 {sd:"nda",topic:"Economy",iss:["economy","jobs"],p:"Make India the world's third-largest economy, and a global manufacturing hub",src:"cmp24"},
 {sd:"nda",topic:"Economy",iss:["economy"],p:"Make India a global electronics manufacturing hub by 2030",src:"bjp24b"},
 {sd:"nda",topic:"Economy",iss:["prices","debt","economy"],p:"Keep inflation low and growth high, with careful management of government finances",src:"cmp24"},
 {sd:"upa",topic:"Economy",iss:["economy"],p:"Double the size of the economy within ten years",src:"cmp24"},
 {sd:"upa",topic:"Economy",iss:["economy"],p:"Replace today's GST with a simpler 'GST 2.0'",src:"inc24s"},
 {sd:"nda",topic:"Governance and society",iss:["national","governance"],p:"One Nation, One Election",src:"bjp24",st:"prog",ev:"Bill with a parliamentary committee."},
 {sd:"nda",topic:"Governance and society",iss:["national"],p:"A Uniform Civil Code",src:"bjp24",st:"prog",ev:"No national law yet.",also:"Also promised in 2014 and 2019"},
 {sd:"upa",topic:"Governance and society",iss:["national"],p:"A nationwide caste census",src:"inc24s",shared:"The NDA government decided in April 2025 to count caste in the next census."},
 {sd:"upa",topic:"Governance and society",iss:["national"],p:"Raise the 50% cap on reservations for SCs, STs and OBCs",src:"inc24"},
 {sd:"upa",topic:"Governance and society",iss:["governance"],p:"Automatic disqualification of MPs and MLAs who switch parties",src:"inc24"}
];

/* Issues a voter can pick. ms: measures shown for the issue */
const ISSUES=[
 {id:"prices",n:"Prices",hi:"महँगाई",d:"How fast the cost of living rose.",ms:["inf"]},
 {id:"jobs",n:"Jobs and youth",hi:"रोज़गार",d:"Work, investment and the factories that create jobs.",ms:["ur","gfcf","mfg"]},
 {id:"farmers",n:"Farmers",hi:"किसान",d:"Farm credit, income support and crop prices.",ms:[],none:"We don't have a farm-income measure that covers both decades, so this issue is judged on promises only."},
 {id:"health",n:"Health",hi:"स्वास्थ्य",d:"Public health spending, insurance and survival.",ms:["hlth","imr","mmr","le"]},
 {id:"education",n:"Education",hi:"शिक्षा",d:"Government spending on schools and colleges.",ms:["edu"]},
 {id:"women",n:"Women",hi:"महिलाएँ",d:"Reservation, jobs and income for women.",ms:["flfpr","mmr"]},
 {id:"welfare",n:"Poverty and welfare",hi:"गरीबी और कल्याण",d:"Food, work guarantees, pensions and cash support.",ms:["pov"],extra:["mpi"]},
 {id:"services",n:"Homes, power, water and roads",hi:"बुनियादी सुविधाएँ",d:"Electricity, toilets, internet, housing and infrastructure.",ms:["elec","sani","net"],extra:["nh","rail"]},
 {id:"economy",n:"Economy and growth",hi:"अर्थव्यवस्था",d:"Growth, incomes, exports and investment from abroad.",ms:["gdp","gdppc","exp","fdi"],ctx:"The 2008-09 global financial crisis fell in the UPA years and COVID-19 (2020-21) in the NDA years. Both pulled growth down."},
 {id:"debt",n:"Government money",hi:"सरकारी कर्ज़",d:"Borrowing, deficits and debt.",ms:["fd","rd","debt"],ctx:"The 2008-09 global financial crisis and COVID-19 (2020-21) both pushed up government borrowing."},
 {id:"governance",n:"Corruption and governance",hi:"भ्रष्टाचार और शासन",d:"How well government works and how clean it is seen to be.",ms:["ge","cc"]},
 {id:"national",n:"Big national decisions",hi:"बड़े राष्ट्रीय फ़ैसले",d:"J&K, CAA, Ram Mandir, Uniform Civil Code, One Nation One Election, Agnipath, caste census.",ms:[],none:"These are mostly about values and priorities rather than numbers. Read what each side promised and did, and decide what you agree with."}
];
