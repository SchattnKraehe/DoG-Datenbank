const CAR_DIR='';
const RACE_DIR='';
const carMap={'McLaren':'car_large_mclaren.png','Oracle Red Bull Racing':'car_large_oracle_red_bull_racing.png','Audi':'car_large_audi.png','Mercedes':'car_large_mercedes.png','Williams':'car_large_williams.png','Cadillac':'car_large_cadillac.png','Alpine':'car_large_alpine.png','Aston Martin':'car_large_aston_martin.png','Ferrari':'car_large_ferrari.png','Haas':'car_large_haas.png','Visa Cash':'car_large_visa_cash.png'};
// Fahrer-Übersicht/Profile: große Fahrzeuge. Fahrer-WM + KWM: kleine Fahrzeuge.
const standingsCarMap={'McLaren':'car_mini_mclaren.png','Oracle Red Bull Racing':'car_mini_oracle_red_bull_racing.png','Audi':'car_mini_audi.png','Mercedes':'car_mini_mercedes.png','Williams':'car_mini_williams.png','Cadillac':'car_mini_cadillac.png','Alpine':'car_mini_alpine.png','Aston Martin':'car_mini_aston_martin.png','Ferrari':'car_mini_ferrari.png','Haas':'car_mini_haas.png','Visa Cash':'car_mini_visa_cash.png'};
function driverCar(name){const c=canonicalTeamName(name);return CAR_DIR+(carMap[c]||carMap[teamKey(c)]||'not-available.jpg')}
function standingsCar(name){const c=canonicalTeamName(name);return CAR_DIR+(standingsCarMap[c]||carMap[c]||carMap[teamKey(c)]||'not-available.jpg')}
const teamFactors={'Mercedes':1.2,'Ferrari':1.4,'McLaren':1.6,'Red Bull':1.8,'Alpine':2.6,'Haas':2.8,'Audi':3.0,'Visa Cash':3.2,'Williams':3.3,'Cadillac':4.0,'Aston Martin':4.8};
const DOG_POINTS={1:25,2:21,3:18,4:15,5:13,6:11,7:9,8:8,9:7,10:6,11:5,12:4,13:3,14:2,15:1};
// DoG Fahrernummern: 1–99, aktuelle F1-Nummern sind gesperrt. 89 ist auf Wunsch zusätzlich gesperrt.
const F1_BLOCKED_NUMBERS=[1,3,5,6,10,11,12,14,16,18,23,27,30,31,41,43,44,55,63,77,81,87];
const DOG_DRIVER_NUMBERS=Array.from({length:98},(_,i)=>i+2);
function driverNumber(name){return Number(driverRecord(name)?.number||0)||0}
function driverNumberOwner(number){const n=Number(number)||0;if(!n)return null;return drivers.find(name=>driverNumber(name)===n)||null}
function driverNumberOwners(number){const n=Number(number)||0;return drivers.filter(name=>driverNumber(name)===n)}
function driverNumberState(number,forName='',status='Stammfahrer') {
 const n=Number(number)||0;
 if(!n)return {state:'free',label:'Keine Nummer'};
 if(F1_BLOCKED_NUMBERS.includes(n))return {state:'blocked',label:'Aktuelle F1 / gesperrt'};
 const owners=driverNumberOwners(n).filter(x=>normDriver(x)!==normDriver(forName));
 const stamm=owners.find(x=>getStatus(x)==='Stammfahrer');
 if(stamm)return {state:'taken-stamm',label:`Stammfahrer: ${stamm}`};
 const ersatz=owners.find(x=>getStatus(x)==='Ersatzfahrer');
 if(ersatz && status==='Stammfahrer')return {state:'reserved-stamm',label:`Ersatzfahrer: ${ersatz} · für Stammfahrer frei`};
 if(ersatz)return {state:'taken-ersatz',label:`Ersatzfahrer: ${ersatz}`};
 return {state:'free',label:'frei'};
}
function driverNumberOptions(forName='',status='Stammfahrer',selected=0){
 return `<option value="0">— keine Nummer —</option>`+DOG_DRIVER_NUMBERS.map(n=>{const st=driverNumberState(n,forName,status);const sel=Number(selected)===n?'selected':'';const disabled=st.state==='blocked'||st.state==='taken-stamm'||(st.state==='taken-ersatz'&&status!=='Stammfahrer')?'disabled':'';const suffix=st.label==='frei'?'frei':st.label;return `<option value="${n}" ${sel} ${disabled?'disabled':''}>#${n} · ${esc(suffix)}</option>`}).join('');
}
function normalizeDriverNumbers(){
 const seenStamm=new Set(),seenErsatz=new Set();
 drivers.forEach(name=>{const m=driverMeta[name];if(!m)return;const n=Number(m.number)||0;if(!n||F1_BLOCKED_NUMBERS.includes(n)){m.number=0;return}const st=getStatus(name);const seen=st==='Stammfahrer'?seenStamm:seenErsatz;if(seen.has(n)){m.number=0}else seen.add(n)});
}
const SPONSOR_OPTIONS={
 'Apple':{upfront:3000000,season:4500000,race:300000,seasonGoal:'Fahrer-WM',raceGoals:['Rennsieg','Pole Position']},
 'OnlyFans':{upfront:2700000,season:4000000,race:180000,seasonGoal:'3 Rennsiege',raceGoals:['Fahrer Top 3 im Rennen','Fahrer Top 4 im Qualifying']},
 'QATAR Airways':{upfront:2400000,season:3600000,race:160000,seasonGoal:'7 Podiumsplatzierungen',raceGoals:['Fahrer Top 5 im Rennen','Fahrer Top 7 im Qualifying']},
 'Microsoft':{upfront:2100000,season:3200000,race:140000,seasonGoal:'3 Podiumsplatzierungen',raceGoals:['Fahrer Top 8 im Rennen','keine Strafe']},
 'DISCORD':{upfront:1800000,season:2700000,race:120000,seasonGoal:'Durchschnittsplatzierung P7',raceGoals:['keine Zeitstrafe','Q2']},
 'Logitech':{upfront:1600000,season:2300000,race:100000,seasonGoal:'Durchschnittsplatzierung P10',raceGoals:['Fahrer Top 10 im Rennen','Fahrer nicht Letzter in Q2']},
 'Twitch':{upfront:1300000,season:1900000,race:85000,seasonGoal:'Durchschnittsplatzierung P15',raceGoals:['Punkteplatzierung','Q2']},
 'Tinder':{upfront:1000000,season:1500000,race:65000,seasonGoal:'mindestens 10 F-WM-Punkte',raceGoals:['Fahrer Top 18 im Rennen + Qualifying']},
 'Armani':{upfront:700000,season:1000000,race:45000,seasonGoal:'mindestens 8 F-WM-Punkte',raceGoals:['Fahrer nicht Letzter in Qualifying + Rennen']},
 'Louis Vuitton':{upfront:400000,season:600000,race:30000,seasonGoal:'mindestens 5 F-WM-Punkte',raceGoals:['Fahrer nicht DNF/DSQ']}
};
function sponsorTotal(s){return (s?.upfront||0)+(s?.season||0)+ (s?.race||0)*12}
function sponsorLabel(name){return name&&SPONSOR_OPTIONS[name]?name:'—'}
function sponsorGoalStatus(contract){
 const sp=SPONSOR_OPTIONS[contract?.sponsor]; if(!sp)return {season:'—',races:0,possible:0};
 const rs=seasonRaceList(contract.season||seasonState.current).filter(r=>r.division===contract.division && r.results.some(x=>normDriver(x.name)===normDriver(contract.driver)));
 const rows=rs.map(r=>({r,x:r.results.find(x=>normDriver(x.name)===normDriver(contract.driver))})).filter(o=>o.x);
 const valid=rows.filter(o=>statusOfResult(o.x)==='RESULT');
 const points=rows.reduce((a,o)=>a+pointsForPosition(o.r.results.indexOf(o.x)+1,statusOfResult(o.x)),0);
 const wins=valid.filter(o=>o.r.results.indexOf(o.x)===0).length;
 const podiums=valid.filter(o=>o.r.results.indexOf(o.x)<3).length;
 const avg=valid.length?valid.reduce((a,o)=>a+o.r.results.indexOf(o.x)+1,0)/valid.length:null;
 let seasonPct=null;
 if(sp.seasonGoal==='Fahrer-WM') seasonPct=rows.length?Math.min(1,points>0?1:0):0;
 else if(/(\d+) Rennsiege/.test(sp.seasonGoal)) seasonPct=Math.min(1,wins/Number(sp.seasonGoal.match(/\d+/)[0]));
 else if(/(\d+) Podiums/.test(sp.seasonGoal)) seasonPct=Math.min(1,podiums/Number(sp.seasonGoal.match(/\d+/)[0]));
 else if(/mindestens (\d+) F-WM-Punkte/.test(sp.seasonGoal)) seasonPct=Math.min(1,points/Number(sp.seasonGoal.match(/\d+/)[0]));
 else if(/Durchschnittsplatzierung P(\d+)/.test(sp.seasonGoal)) {const target=Number(sp.seasonGoal.match(/P(\d+)/)[1]);seasonPct=avg==null?0:Math.min(1,target/Math.max(target,avg));}
 return {season:seasonPct==null?'manuell':`${Math.round(seasonPct*100)}%`,races:rows.length,points,wins,podiums,avg,possible:rows.length*sp.race};
}
function renderSponsorCatalog(){
 const el=document.getElementById('sponsor-catalog'); if(!el)return;
 el.innerHTML=Object.entries(SPONSOR_OPTIONS).map(([name,s])=>`<div class="sponsor-card"><div class="sponsor-card-head"><h3>${esc(name)}</h3><b>${money(s.upfront+s.season+s.race)}</b><small>pro Rennziel · Gesamt ohne variable Zielanzahl</small></div><div class="sponsor-money"><span>Sofortzahlung <b>${money(s.upfront)}</b></span><span>Saisonziel <b>${money(s.season)}</b></span><span>Rennziel <b>${money(s.race)}</b></span></div><div class="sponsor-goals"><div><b>Saisonziel</b><p>${esc(s.seasonGoal)}</p></div><div><b>Rennziele</b>${s.raceGoals.map(g=>`<p>• ${esc(g)}</p>`).join('')}</div></div></div>`).join('');
}

let ACTIVE_TRACKS=['Las Vegas','Brasilien','Belgien'];
let TRACK_NUMBERS={'Las Vegas':1,'Brasilien':2,'Belgien':3};
const teams=[
{name:'McLaren',chief:'Salamander2110',car:'McLaren',d1:['MaxT7gerrang','physioalex_ttv'],d2:['Salamander2110','Uchse-Rene']},
{name:'Oracle Red Bull Racing',chief:'F1_Tobi_Vettel21',car:'Oracle Red Bull Racing',d1:[],d2:['Marlon202525','danieliko99']},
{name:'Audi',chief:'Energy18WCL',car:'Audi',d1:['Chiara','Energy18WCL'],d2:[]},
{name:'Mercedes',chief:'SchattnKraehe',car:'Mercedes',d1:['John_Marco'],d2:['SchattnKraehe','EastGermanGhost']},
{name:'Williams',chief:'xb_a_s_t_yx',car:'Williams',d1:['RPFL_Panis'],d2:['Keulebre07']},
{name:'Cadillac',chief:'ohne Teamchef',car:'Cadillac',d1:['BrennusX'],d2:[]},
{name:'Alpine',chief:'Luisa Weinstadl',car:'Alpine',d1:['LeoMessi1511'],d2:['Luisa Weinstadl','thoxstar32']},
{name:'Aston Martin',chief:'Vietsi_47',car:'Aston Martin',d1:['Vietsi_47','Ahorndonut71324'],d2:['SGRLxGottThorx','Jenny TattooGirl']},
{name:'Ferrari',chief:'Taikudo',car:'Ferrari',d1:['Dome0907','F1_Tobi_Vettel21'],d2:['TTV_Gianninho46','xTom-3']},
{name:'Haas',chief:'ohne Teamchef',car:'Haas',d1:['ToXcay','Dr-Geil-Egon'],d2:[]},
{name:'Visa Cash',chief:'GeistesFrank',car:'Visa Cash',d1:['VwGerd','HeaDy2106'],d2:['GeistesFrank','Buythio']}
];
let drivers=['John_Marco','Erion','MaxT7gerrang','physioalex_ttv','Marlon202525','danieliko99','Chiara','Energy18WCL','SchattnKraehe','EastGermanGhost','RPFL_Panis','Keulebre07','Marci_Blend','BrennusX','LeoMessi1511','Luisa Weinstadl','thoxstar32','Vietsi_47','Ahorndonut71324','SGRLxGottThorx','Jenny TattooGirl','Dome0907','F1_Tobi_Vettel21','TTV_Gianninho46','xTom-3','ToXcay','Dr-Geil-Egon','VwGerd','HeaDy2106','GeistesFrank','Buythio','Salamander2110','Uchse-Rene','the_nobody86','TattooGirl_1997','keule_der_kicker','joeyleon2000','mitch8511','xxb_a_s_t_yx07x','PerserKing1805','Dando_Rorris','LuyaXX','Oliver_Panls','ghost_of_peace','Misterhany','Viox_Nyrex2','Paul Pavitschitz','VDR_RaptusSee7'];
const statusOverrides={'Marci_Blend':'Free Agent','Dando_Rorris':'Nicht verfügbar','LuyaXX':'Nicht verfügbar'};
const aliases={'Szalamander2110':'Salamander2110','luisa_LH44':'Luisa Weinstadl','danieliko':'danieliko99','John Marco':'John_Marco','Erion_':'Erion','[VR] John Marco':'John_Marco','vwgerd':'VwGerd','Oliver_Panls':'Olliver_Panls'};
let driverMeta={};
const NATIONALITY_OPTIONS=[
 {code:'DE',name:'Deutschland',flag:'flag-de.png',emoji:'🇩🇪'},
 {code:'CH',name:'Schweiz',flag:'flag-ch.png',emoji:'🇨🇭'},
 {code:'ES',name:'Spanien',flag:'flag-es.png',emoji:'🇪🇸'},
 {code:'AT',name:'Österreich',flag:'flag-at.png',emoji:'🇦🇹'},
 {code:'GB',name:'Großbritannien',flag:'flag-gb.png',emoji:'🇬🇧'},
 {code:'DK',name:'Dänemark',flag:'flag-dk.png',emoji:'🇩🇰'},
 {code:'SE',name:'Schweden',flag:'flag-se.png',emoji:'🇸🇪'},
 {code:'PT',name:'Portugal',flag:'',emoji:'🇵🇹'},
 {code:'NO',name:'Norwegen',flag:'flag-no.png',emoji:'🇳🇴'},
 {code:'PL',name:'Polen',flag:'flag-pl.png',emoji:'🇵🇱'}
];
const NATIONALITY_BY_CODE=Object.fromEntries(NATIONALITY_OPTIONS.map(x=>[x.code,x]));
function driverNationality(name){return driverRecord(name)?.nationality||''}
function nationalityInfo(name){return NATIONALITY_BY_CODE[driverNationality(name)]||null}
function driverFlag(name){return nationalityInfo(name)?.flag||''}
function nationalityLabel(name){const n=nationalityInfo(name);return n?`${n.emoji} ${n.name}`:''}
function nationalityOptions(selected=''){return `<option value="">— keine Nationalität —</option>`+NATIONALITY_OPTIONS.map(n=>`<option value="${n.code}" ${n.code===selected?'selected':''}>${n.emoji} ${esc(n.name)}</option>`).join('')}
let contracts=[];
let transferRecords=[];
let financeBudgets={};
let financeCapUsage={};
let sponsorPayments={};
let financeTransactions=[];
let financeOpeningBalances={};
let financeTxOverrides={};
let driverFinanceOpeningBalances={};
let driverFinanceOpeningDates={};
let loanAgreements=[];
let driverLicenses={};
const TEAM_CHOICES=['','Mercedes','Ferrari','McLaren','Oracle Red Bull Racing','Alpine','Haas','Audi','Visa Cash','Williams','Cadillac','Aston Martin'];
const SEASON_META={
  current:'02/26',
  seasons:{'02/26':{label:'02/26',status:'active',type:'Offiziell · 1. Saison',official:true,rules:'DoG 02/26 · v1'},'03/26':{label:'03/26',status:'planned',type:'Offiziell · nächste Saison',official:true,rules:'DoG 03/26 · v1'}}
};
let seasonState={current:'02/26',lastCalculatedAt:'',schemaVersion:2};
function driverRecord(name){return driverMeta[normDriver(name)]||driverMeta[name]||null}
function driverIsTeamChief(name){return !!driverRecord(name)?.isTeamChief}
function driverRoleLabel(name){return driverIsTeamChief(name)?'Fahrer & Teamchef':'Fahrer'}
function syncTeamChiefRoles(){const chiefs=new Set(teams.map(t=>normDriver(t.chief||'')).filter(n=>n&&n.toLowerCase()!=='ohne teamchef'));Object.keys(driverMeta).forEach(n=>{driverMeta[n].isTeamChief=chiefs.has(normDriver(n));});}
function currentRosterEntry(name){const n=normDriver(name);for(const t of teams){const d1=t.d1||[],d2=t.d2||[];if(d1.some(x=>normDriver(x)===n))return{team:t.name,division:'Div 1',status:'Stammfahrer'};if(d2.some(x=>normDriver(x)===n))return{team:t.name,division:'Div 2',status:'Stammfahrer'}}return null}
function driverTeam(name){const roster=currentRosterEntry(name);if(roster?.team)return roster.team;const m=driverRecord(name);return m?.team||''}

function normDriver(n){return aliases[n]||n}
// Current team roster is the authoritative source for the current status/team.
// Historical race records keep their own team and are never overwritten by this.
function getStatus(n){const roster=currentRosterEntry(n);if(roster)return 'Stammfahrer';if(statusOverrides[n])return statusOverrides[n];const m=driverRecord(n);if(m?.status==='Nicht verfügbar')return 'Nicht verfügbar';if(m?.status==='Stammfahrer')return 'Stammfahrer';if(m?.status==='Ersatzfahrer')return 'Ersatzfahrer';if(m?.status==='Free Agent')return 'Free Agent';return 'Free Agent'}
const TEAM_CANONICAL={
 'Aston Martin Aramco Formula One Team':'Aston Martin',
 'Aston Martin Aramco F1 Team':'Aston Martin',
 'Aston Martin Aramco':'Aston Martin',
 'Mercedes AMG Petronas F1 Team':'Mercedes',
 'Mercedes-AMG Petronas F1 Team':'Mercedes',
 'Mercedes-AMG F1 Team':'Mercedes',
 'Mercedes-AMG':'Mercedes',
 'Scuderia Ferrari HP':'Ferrari',
 'Scuderia Ferrari':'Ferrari',
 'Atlassian Williams F1 Team':'Williams',
 'BWT Alpine F1 Team':'Alpine',
 'Toyota Gazoo Racing Haas F1 Team':'Haas',
 'MoneyGram Haas F1 Team':'Haas',
 'Audi Revolut F1 Team':'Audi',
 'Visa Cash App RB F1 Team':'Visa Cash',
 'Visa Cash App RB':'Visa Cash',
 'Red Bull Racing':'Oracle Red Bull Racing',
 'Red Bull':'Oracle Red Bull Racing'
};
function canonicalTeamName(name){const raw=String(name||'').trim();return TEAM_CANONICAL[raw]||raw}
function teamKey(name){const c=canonicalTeamName(name);return c==='Oracle Red Bull Racing'?'Red Bull':c}
function teamCar(name){const c=canonicalTeamName(name);return CAR_DIR+(carMap[c]||carMap[teamKey(c)]||'not-available.jpg')}
function row(name,team,grid,time,penSec=0,tl=0,status='RESULT',str=0,ban=false,reason=''){return{name,team,grid,time,penSec,tl,status,str:Number(str)||0,ban:!!ban,reason}}
const races={};
function statusOfResult(r){return r.status||'RESULT'}
function pointsForPosition(pos,status){return status==='DNF'||status==='DSQ'?0:(DOG_POINTS[pos]||0)}
function normalizeAllRacePoints(){raceList().forEach(r=>r.results.forEach((x,i)=>x.points=pointsForPosition(i+1,statusOfResult(x))))}
function repairContracts(){
 contracts=(Array.isArray(contracts)?contracts:[]).filter(Boolean).map((c,i)=>{
   const driver=normDriver(String(c.driver||'').trim());
   const season=String(c.season||seasonState.current||'02/26');
   const id=String(c.id||('contract-'+Date.now()+'-'+i));
   return {...c,id,driver,season,team:String(c.team||''),division:c.division||currentDivision(driver)||'Div 1',source:c.source||'contract'};
 });
}

// v2.0 central cloud database: Supabase is the single source of truth.
let cloudClient=null, cloudUser=null, cloudOwnerId=null, cloudOwner=false, cloudReady=false, cloudBusy=false, cloudSaveQueued=false, cloudChannel=null;
function cloudConfigured(){return !!(window.DOG_SUPABASE_URL&&window.DOG_SUPABASE_ANON_KEY&&window.DOG_SUPABASE_URL.indexOf('YOUR_')<0&&window.DOG_SUPABASE_ANON_KEY.indexOf('YOUR_')<0&&window.supabase?.createClient)}
function cloudState(){return {drivers,driverMeta,races,teams,seasonState,contracts,transferRecords,financeBudgets,financeCapUsage,sponsorPayments,financeTransactions,financeOpeningBalances,financeTxOverrides,driverFinanceOpeningBalances,driverFinanceOpeningDates,loanAgreements,driverLicenses,activeTracks:ACTIVE_TRACKS,trackNumbers:TRACK_NUMBERS}}
function applyCloudState(d){if(!d||typeof d!=='object')return; if(Array.isArray(d.drivers))drivers=d.drivers; if(d.driverMeta&&typeof d.driverMeta==='object')driverMeta=d.driverMeta; if(d.races&&typeof d.races==='object')races=d.races; if(Array.isArray(d.teams)&&d.teams.length)teams=d.teams; if(d.seasonState&&typeof d.seasonState==='object')seasonState={...seasonState,...d.seasonState}; if(Array.isArray(d.contracts))contracts=d.contracts; if(Array.isArray(d.transferRecords))transferRecords=d.transferRecords; if(d.financeBudgets&&typeof d.financeBudgets==='object')financeBudgets=d.financeBudgets; if(d.financeCapUsage&&typeof d.financeCapUsage==='object')financeCapUsage=d.financeCapUsage; if(d.sponsorPayments&&typeof d.sponsorPayments==='object')sponsorPayments=d.sponsorPayments; if(Array.isArray(d.financeTransactions))financeTransactions=d.financeTransactions; if(d.financeOpeningBalances&&typeof d.financeOpeningBalances==='object')financeOpeningBalances=d.financeOpeningBalances; if(d.financeTxOverrides&&typeof d.financeTxOverrides==='object')financeTxOverrides=d.financeTxOverrides; if(d.driverFinanceOpeningBalances&&typeof d.driverFinanceOpeningBalances==='object')driverFinanceOpeningBalances=d.driverFinanceOpeningBalances; if(d.driverFinanceOpeningDates&&typeof d.driverFinanceOpeningDates==='object')driverFinanceOpeningDates=d.driverFinanceOpeningDates; if(Array.isArray(d.loanAgreements))loanAgreements=d.loanAgreements; if(d.driverLicenses&&typeof d.driverLicenses==='object')driverLicenses=d.driverLicenses; if(Array.isArray(d.activeTracks))ACTIVE_TRACKS.splice(0,ACTIVE_TRACKS.length,...d.activeTracks); if(d.trackNumbers&&typeof d.trackNumbers==='object')Object.assign(TRACK_NUMBERS,d.trackNumbers); ensureRaceMetadata(); syncTeamChiefRoles();}
function saveLocalCache(){try{localStorage.setItem('dogrh_drivers',JSON.stringify(drivers));localStorage.setItem('dogrh_driver_meta',JSON.stringify(driverMeta));localStorage.setItem('dogrh_races',JSON.stringify(races));localStorage.setItem('dogrh_teams',JSON.stringify(teams));localStorage.setItem('dogrh_season_state',JSON.stringify(seasonState));localStorage.setItem('dogrh_contracts',JSON.stringify(contracts));localStorage.setItem('dogrh_transfers',JSON.stringify(transferRecords));localStorage.setItem('dogrh_finance_budgets',JSON.stringify(financeBudgets));localStorage.setItem('dogrh_finance_cap_usage',JSON.stringify(financeCapUsage));localStorage.setItem('dogrh_sponsor_payments',JSON.stringify(sponsorPayments));localStorage.setItem('dogrh_finance_transactions',JSON.stringify(financeTransactions));localStorage.setItem('dogrh_finance_opening',JSON.stringify(financeOpeningBalances));localStorage.setItem('dogrh_finance_tx_overrides',JSON.stringify(financeTxOverrides));localStorage.setItem('dogrh_driver_finance_opening',JSON.stringify(driverFinanceOpeningBalances));localStorage.setItem('dogrh_driver_finance_opening_dates',JSON.stringify(driverFinanceOpeningDates));localStorage.setItem('dogrh_loan_agreements',JSON.stringify(loanAgreements));localStorage.setItem('dogrh_driver_licenses',JSON.stringify(driverLicenses))}catch(e){}}
async function initCloud(){
 if(!cloudConfigured()){console.warn('DoG RaceHub Cloud: config fehlt.');return false}
 try{
   cloudClient=window.supabase.createClient(window.DOG_SUPABASE_URL,window.DOG_SUPABASE_ANON_KEY,{
     auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}
   });

   // Auth-Status sofort beobachten. Supabase speichert die Session im Browser,
   // dadurch bleibt der Admin auch nach F5 angemeldet.
   cloudClient.auth.onAuthStateChange((_event,session)=>{
     cloudUser=session?.user||null;
     cloudOwner=!!cloudUser&&!!cloudOwnerId&&cloudUser.id===cloudOwnerId;
     editor=cloudOwner;
     updateEditorUI();
   });

   const {data:sessionData,error:sessionError}=await cloudClient.auth.getSession();
   if(sessionError)console.warn('DoG RaceHub Auth:',sessionError);
   cloudUser=sessionData?.session?.user||null;

   const {data:row,error}=await cloudClient.from('app_state').select('owner_id,data').eq('id',1).maybeSingle();
   if(error){
     console.error(error);
     cloudReady=false;
     cloudOwner=false;
     editor=false;
     updateEditorUI();
     toast('Cloud-Datenbank nicht erreichbar. Die Ansicht bleibt verfügbar.');
     return false;
   }

   if(row){
     // Die Cloud ist die zentrale Quelle. Vorhandene lokale Daten werden
     // bei einer vorhandenen Cloud-Zeile niemals automatisch darübergelegt.
     cloudOwnerId=row.owner_id||null;
     cloudReady=true;
     if(row.data&&typeof row.data==='object'){
       applyCloudState(row.data);
       saveLocalCache();
       requestAnimationFrame(()=>renderAll());
     }
   }else if(cloudUser){
     // Nur beim erstmaligen Anlegen darf der angemeldete Admin die zentrale
     // Datenzeile erstellen.
     cloudOwnerId=cloudUser.id;
     cloudReady=true;
     const {error:insertError}=await cloudClient.from('app_state').insert({id:1,owner_id:cloudUser.id,data:cloudState()});
     if(insertError){
       console.error(insertError);
       cloudReady=false;
       cloudOwnerId=null;
       cloudOwner=false;
       editor=false;
       updateEditorUI();
       toast('Cloud-Start konnte nicht angelegt werden.');
       return false;
     }
   }else{
     cloudReady=false;
     cloudOwnerId=null;
   }

   cloudOwner=!!cloudUser&&!!cloudOwnerId&&cloudUser.id===cloudOwnerId;
   editor=cloudOwner;
   updateEditorUI();
   subscribeCloud();
   return true;
 }catch(e){
   console.error('Cloud init',e);
   cloudReady=false;
   cloudOwner=false;
   editor=false;
   updateEditorUI();
   toast('Cloud-Start fehlgeschlagen. Ansicht bleibt verfügbar.');
   return false;
 }
}
async function cloudSave(){
 if(!cloudClient||!cloudReady||!cloudOwner||!cloudUser){
   console.warn('DoG RaceHub Cloud: Speichern nicht bereit.',{cloudReady,cloudOwner,cloudUser:!!cloudUser});
   return false;
 }
 if(cloudBusy){cloudSaveQueued=true;return true}
 cloudBusy=true;cloudSaveQueued=false;
 try{
   const payload={data:cloudState(),updated_at:new Date().toISOString()};
   const {data,error}=await cloudClient.from('app_state')
     .update(payload)
     .eq('id',1)
     .eq('owner_id',cloudUser.id)
     .select('id,owner_id,updated_at')
     .maybeSingle();
   if(error){console.error('DoG RaceHub Cloud Save',error);toast('Cloud-Speicherung fehlgeschlagen.');return false}
   if(!data){console.error('DoG RaceHub Cloud Save: keine Zeile aktualisiert');toast('Cloud-Speicherung abgelehnt: Admin-Berechtigung prüfen.');return false}
   return true;
 }catch(e){
   console.error('DoG RaceHub Cloud Save',e);
   toast('Cloud-Speicherung fehlgeschlagen.');
   return false;
 }finally{
   cloudBusy=false;
   if(cloudSaveQueued)setTimeout(()=>cloudSave(),50);
 }
}
function subscribeCloud(){
 if(!cloudClient||cloudChannel)return;
 cloudChannel=cloudClient.channel('dog-racehub-state').on('postgres_changes',{event:'UPDATE',schema:'public',table:'app_state',filter:'id=eq.1'},payload=>{if(payload?.new?.data){applyCloudState(payload.new.data);saveLocalCache();renderAll();toast('Daten aus der Cloud aktualisiert.')}}).subscribe();
}
function renderAll(){try{updateSeasonChrome();updateStats();renderDashboard();renderWM();renderKWM();renderArchive();initDriverOverview();renderTeams();renderFinance();}catch(e){console.warn('renderAll',e)}}
function updateEditorUI(){document.querySelectorAll('.edit-btn').forEach(b=>{b.textContent=editor?'✏️ Bearbeiten · Admin':'🔐 Admin / Bearbeiten';});}

function load(){const ver='2.7';if(localStorage.getItem('dogrh_data_version')!==ver){localStorage.setItem('dogrh_data_version',ver)}try{const d=JSON.parse(localStorage.getItem('dogrh_drivers'));if(Array.isArray(d)&&d.length)drivers=d}catch(e){};try{const m=JSON.parse(localStorage.getItem('dogrh_driver_meta'));if(m&&typeof m==='object')driverMeta=m}catch(e){};try{const c=JSON.parse(localStorage.getItem('dogrh_contracts'));if(Array.isArray(c))contracts=c}catch(e){}; try{const tr=JSON.parse(localStorage.getItem('dogrh_transfers'));if(Array.isArray(tr))transferRecords=tr}catch(e){}; try{const fb=JSON.parse(localStorage.getItem('dogrh_finance_budgets'));if(fb&&typeof fb==='object')financeBudgets=fb}catch(e){};try{const cu=JSON.parse(localStorage.getItem('dogrh_finance_cap_usage'));if(cu&&typeof cu==='object')financeCapUsage=cu}catch(e){};try{const sp=JSON.parse(localStorage.getItem('dogrh_sponsor_payments'));if(sp&&typeof sp==='object')sponsorPayments=sp}catch(e){};try{const ft=JSON.parse(localStorage.getItem('dogrh_finance_transactions'));if(Array.isArray(ft))financeTransactions=ft}catch(e){};try{const ob=JSON.parse(localStorage.getItem('dogrh_finance_opening'));if(ob&&typeof ob==='object')financeOpeningBalances=ob}catch(e){};try{const fo=JSON.parse(localStorage.getItem('dogrh_finance_tx_overrides'));if(fo&&typeof fo==='object')financeTxOverrides=fo}catch(e){};try{const dob=JSON.parse(localStorage.getItem('dogrh_driver_finance_opening'));if(dob&&typeof dob==='object')driverFinanceOpeningBalances=dob}catch(e){};try{const dod=JSON.parse(localStorage.getItem('dogrh_driver_finance_opening_dates'));if(dod&&typeof dod==='object')driverFinanceOpeningDates=dod}catch(e){};try{const la=JSON.parse(localStorage.getItem('dogrh_loan_agreements'));if(Array.isArray(la))loanAgreements=la}catch(e){};try{const dl=JSON.parse(localStorage.getItem('dogrh_driver_licenses'));if(dl&&typeof dl==='object')driverLicenses=dl}catch(e){};try{const savedTeams=JSON.parse(localStorage.getItem('dogrh_teams'));if(Array.isArray(savedTeams)&&savedTeams.length){savedTeams.forEach(st=>{const t=teams.find(x=>x.name===st.name);if(t){t.chief=st.chief??t.chief;t.d1=Array.isArray(st.d1)?st.d1:t.d1;t.d2=Array.isArray(st.d2)?st.d2:t.d2}})}}catch(e){}
try{const m=JSON.parse(localStorage.getItem('dogrh_driver_meta'));if(m&&typeof m==='object')driverMeta=m}catch(e){}try{const r=JSON.parse(localStorage.getItem('dogrh_races'));if(r&&typeof r==='object')Object.assign(races,r)}catch(e){};try{const ss=JSON.parse(localStorage.getItem('dogrh_season_state'));if(ss&&typeof ss==='object')seasonState={...seasonState,...ss}}catch(e){}
Object.values(races).forEach(r=>{if(TRACK_NUMBERS[r.track])r.number=TRACK_NUMBERS[r.track]});
Object.values(races).forEach(r=>{r.results?.forEach(x=>{if(x.reason && !x.penaltyNote)x.penaltyNote=x.reason;delete x.str;delete x.ban;delete x.reason})})
// 02/26 current-roster migration: Ahorndonut is Aston Martin. Historical race rows remain historical, but current roster must win over stale metadata.
const ah=teams.find(t=>t.name==='Aston Martin'), al=teams.find(t=>t.name==='Alpine');
if(ah&&al){al.d1=al.d1.filter(n=>normDriver(n)!=='Ahorndonut71324');al.d2=al.d2.filter(n=>normDriver(n)!=='Ahorndonut71324');if(!ah.d1.some(n=>normDriver(n)==='ahorndonut71324')&&!ah.d2.some(n=>normDriver(n)==='ahorndonut71324'))ah.d1.push('Ahorndonut71324');}
if(driverMeta['Ahorndonut71324']){driverMeta['Ahorndonut71324'].team='Aston Martin';driverMeta['Ahorndonut71324'].division='Div 1';driverMeta['Ahorndonut71324'].status='Stammfahrer';}
localStorage.setItem('dogrh_races',JSON.stringify(races));localStorage.setItem('dogrh_teams',JSON.stringify(teams));
normalizeAllRacePoints()}
function reconcileCurrentRoster(){
 const rosterMap={};
 teams.forEach(t=>['d1','d2'].forEach((d)=>{(t[d]||[]).forEach(n=>{const key=normDriver(n);rosterMap[key]={team:t.name,division:d==='d1'?'Div 1':'Div 2'};if(!drivers.some(x=>normDriver(x)===key))drivers.push(n);});}));
 drivers.forEach(n=>{const key=normDriver(n);const m=driverMeta[n]||{id:(crypto.randomUUID?crypto.randomUUID():'dog-'+Date.now()+'-'+Math.random()),createdAt:new Date().toISOString()};const r=rosterMap[key];if(r){m.team=r.team;m.division=r.division;m.status='Stammfahrer';}else if(m.status!=='Nicht verfügbar' && statusOverrides[n]!=='Nicht verfügbar'){m.team='';m.status='Free Agent';}driverMeta[n]=m;});
}
function save(){syncTeamChiefRoles();reconcileCurrentRoster();normalizeAllRacePoints();saveLocalCache();if(cloudOwner)cloudSave();} ensureRaceMetadata(); load(); syncTeamChiefRoles();
// v2.1: Historische Saisondaten werden nicht mehr automatisch gelöscht.
if(!driverMeta.SchattnKraehe){driverMeta.SchattnKraehe={id:(crypto.randomUUID?crypto.randomUUID():'dog-'+Date.now()),createdAt:new Date().toISOString()};} if(!Number(driverMeta.SchattnKraehe.number)){driverMeta.SchattnKraehe.number=89;} driverMeta.SchattnKraehe.status='Stammfahrer'; driverMeta.SchattnKraehe.division=driverMeta.SchattnKraehe.division||'Div 2'; driverMeta.SchattnKraehe.team='Mercedes'; driverMeta.SchattnKraehe.nationality=driverMeta.SchattnKraehe.nationality||'DE'; repairContracts(); ensureRaceMetadata(); reconcileCurrentRoster(); normalizeDriverNumbers(); calculateLeagueState(); save();
function showView(id){document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));document.getElementById(id).classList.add('active');document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.view===id));document.getElementById('page-title').textContent={dashboard:'Dashboard',drivers:'Fahrer',compare:'Vergleich',teams:'Teams',races:'Rennen',wm:'Fahrer-WM',kwm:'KWM',archive:'Archiv'}[id]||'DoG RaceHub';try{if(id==='drivers')initDriverOverview();if(id==='compare')renderCompare();if(id==='teams')renderTeams();if(id==='races')initRaceSelectors();if(id==='wm')renderWM();if(id==='kwm')renderKWM();if(id==='dashboard')renderDashboard();if(id==='archive')renderArchive();updateStats()}catch(e){console.error('showView',e)}}
document.querySelectorAll('.nav').forEach(n=>n.addEventListener('click',()=>showView(n.dataset.view)));
function updateStats(){document.getElementById('stat-drivers').textContent=drivers.filter(n=>getStatus(n)==='Stammfahrer').length;document.getElementById('stat-races').textContent=new Set(raceList().map(r=>r.track)).size}
function initDriverOverview(){const sel=document.getElementById('driver-select');if(!sel)return;const current=sel.value;sel.innerHTML=drivers.filter(n=>getStatus(n)!=='Nicht verfügbar').sort((a,b)=>a.localeCompare(b,'de')).map(n=>`<option value="${esc(n)}">${driverNumber(n)?'#'+driverNumber(n)+' · ':''}${esc(n)} · ${esc(getStatus(n))}</option>`).join('');if(current&&drivers.includes(current)&&getStatus(current)!=='Nicht verfügbar')sel.value=current;else if(sel.options.length)sel.selectedIndex=0;openDriver(sel.value)}
function openAddDriver(prefill='',teamPrefill='',divPrefill='Div 2'){
 if(!requireEditor())return;
 const teamsOpt=TEAM_CHOICES.map(t=>`<option value="${esc(t)}" ${t===teamPrefill?'selected':''}>${t||'— kein Team / Free Agent —'}</option>`).join('');
 document.getElementById('modal-content').innerHTML=`<div class="modal-head"><div><h2>➕ Fahrer anlegen</h2><p class="race-edit-note">Ein neuer Fahrer bekommt automatisch eine eindeutige interne Fahrer-ID. Unklare Namen werden nicht automatisch zusammengeführt.</p></div><button onclick="closeModal()">×</button></div><div class="new-driver-form"><label>Fahrername<input id="new-driver-name" value="${esc(prefill)}" placeholder="z. B. NeuerFahrer123"></label><label>Nationalität<select id="new-driver-nationality">${nationalityOptions('')}</select></label><label>Division<select id="new-driver-div"><option ${divPrefill==='Div 1'?'selected':''}>Div 1</option><option ${divPrefill==='Div 2'?'selected':''}>Div 2</option></select></label><label>Aktueller Status<select id="new-driver-status" onchange="refreshNewDriverNumberOptions()"><option>Stammfahrer</option><option>Ersatzfahrer</option><option selected>Free Agent</option><option>Nicht verfügbar</option></select></label><label>Fahrernummer<select id="new-driver-number">${driverNumberOptions(prefill, 'Free Agent', 0)}</select></label><label>Team<select id="new-driver-team">${teamsOpt}</select></label></div><div class="race-edit-note new-driver-hint">Bei „Stammfahrer“ wird der Fahrer – sofern ein Slot frei ist – direkt dem gewählten Team zugeordnet. Ist kein Slot frei, bleibt der Fahrer angelegt und wird nicht automatisch in die Teamaufstellung gedrückt.</div><div class="modal-actions"><button class="ghost" onclick="closeModal()">Abbrechen</button><button class="primary" onclick="createDriverFromForm()">Fahrer anlegen</button></div>`;
 openModal();
}
function createDriverFromForm(){
 if(!requireEditor())return;
 const raw=(document.getElementById('new-driver-name')?.value||'').trim(), name=raw;
 const div=document.getElementById('new-driver-div')?.value||'Div 2', status=document.getElementById('new-driver-status')?.value||'Free Agent', team=document.getElementById('new-driver-team')?.value||'', nationality=document.getElementById('new-driver-nationality')?.value||'', number=Number(document.getElementById('new-driver-number')?.value)||0;
 if(!name){toast('Bitte einen Fahrernamen eingeben.');return}
 const canonical=normDriver(name);if(drivers.some(n=>normDriver(n).toLowerCase()===canonical.toLowerCase())){toast('Diesen Fahrer gibt es bereits.');return}
 drivers.push(name);
 driverMeta[name]={id:(crypto.randomUUID?crypto.randomUUID():'dog-'+Date.now()+'-'+Math.random().toString(16).slice(2)),division:div,team:team,status,number:0,nationality,createdAt:new Date().toISOString()};
 if(number){const ns=driverNumberState(number,name,status);if(ns.state==='blocked'||ns.state==='taken-stamm'||(ns.state==='taken-ersatz'&&status!=='Stammfahrer')){toast(`Fahrernummer #${number} ist nicht verfügbar.`);driverMeta[name].number=0;}else{driverMeta[name].number=number;if(status==='Stammfahrer'){drivers.forEach(other=>{if(normDriver(other)!==normDriver(name)&&driverNumber(other)===number&&getStatus(other)==='Ersatzfahrer'){driverMeta[other].number=0}})}}}
 if(status==='Stammfahrer'&&team){const t=teams.find(x=>x.name===team);if(t){const arr=div==='Div 1'?t.d1:t.d2;if(!arr.includes(name)&&arr.length<2)arr.push(name);else if(arr.length>=2){driverMeta[name].status='Free Agent';driverMeta[name].team='';toast('Fahrer angelegt. Team hat bereits 2 Stammfahrer – daher zunächst Free Agent.');}}}
 save();
 const draft=window.__ocrRaceDraft;
 if(draft){const created=drivers.find(n=>ocrNormName(n)===ocrNormName(name))||name;draft.rows[draft.index].name=created;draft.rows[draft.index].match=created;draft.rows[draft.index].raw=created;draft.rows[draft.index].type='known';delete window.__ocrRaceDraft;closeModal();renderOCRRaceReview(draft.rows,draft.raw,draft.raceId);toast(`Fahrer ${created} angelegt und im Renn-OCR ausgewählt.`);return;}
 closeModal();initDriverOverview();renderTeams();updateStats();toast('Fahrer angelegt.');
}
function ensureDriverFromContract(name,team,division){
 const raw=String(name||'').trim();if(!raw)return '';
 const existing=drivers.find(n=>ocrNormName(n)===ocrNormName(raw));
 if(existing){if(!driverMeta[existing])driverMeta[existing]={id:(crypto.randomUUID?crypto.randomUUID():'dog-'+Date.now()),createdAt:new Date().toISOString()};return existing;}
 const finalName=normDriver(raw);drivers.push(finalName);
 driverMeta[finalName]={id:(crypto.randomUUID?crypto.randomUUID():'dog-'+Date.now()+'-'+Math.random().toString(16).slice(2)),division:division||'Div 1',team:team||'',status:'Free Agent',createdAt:new Date().toISOString()};
 if(team){const t=teams.find(x=>x.name===team),arr=division==='Div 1'?t?.d1:t?.d2;if(arr&&!arr.some(n=>normDriver(n)===normDriver(finalName))&&arr.length<2){arr.push(finalName);driverMeta[finalName].status='Stammfahrer';} }
 return finalName;
}
function openDetectedDriver(candidate,team,div){openAddDriver(candidate,team,div)}
function ocrNormName(s){return ocrCleanName(s).toLowerCase().replace(/\b(vr|vr\]|[a-z]\s*\[vr\])\b/g,'').replace(/[^a-z0-9äöüß]/g,'')}
function fuzzySimilarity(a,b){a=ocrNormName(a);b=ocrNormName(b);if(!a||!b)return 0;if(a===b)return 1;const d=levenshtein(a,b),m=Math.max(a.length,b.length);return m?1-d/m:0}
function levenshtein(a,b){const row=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let prev=row[0];row[0]=i;for(let j=1;j<=b.length;j++){const tmp=row[j];row[j]=Math.min(row[j]+1,row[j-1]+1,prev+(a[i-1]===b[j-1]?0:1));prev=tmp}}return row[b.length]}
function ocrCleanName(s){return String(s||'').replace(/\[[^\]]*\]/g,' ').replace(/[|•·©®™★☆▲▼◀▶◆◇]/g,' ').replace(/\s+/g,' ').trim().replace(/^[-–—_=+]+|[-–—_=+]+$/g,'').trim()}
function knownDriverMatch(candidate){const list=drivers.map(n=>({name:n,score:fuzzySimilarity(candidate,normDriver(n))})).sort((a,b)=>b.score-a.score);return list[0]||null}
function ocrTeamPatterns(){return [['Oracle Red Bull Racing',['Oracle Red Bull Racing','Red Bull Racing','Red Bull']],['Aston Martin',['Aston Martin Aramco','Aston Martin']],['Visa Cash',['Visa Cash App RB','Visa Cash','VCARB']],['Mercedes',['Mercedes-AMG F1 Team','Mercedes-AMG','Mercedes']],['McLaren',['McLaren Mercedes','McLaren']],['Ferrari',['Scuderia Ferrari HP','Scuderia Ferrari','Ferrari']],['Williams',['Atlassian Williams F1 Team','Williams']],['Alpine',['BWT Alpine F1 Team','Alpine']],['Haas',['MoneyGram Haas F1 Team','Haas']],['Audi',['Audi Revolut F1 Team','Audi']],['Cadillac',['Cadillac']]]}
function ocrFindTeam(text){const low=String(text||'').toLowerCase();for(const [team,pats] of ocrTeamPatterns()){for(const pat of pats){const idx=low.indexOf(pat.toLowerCase());if(idx>=0)return{team,idx,pat,score:1}}}return null}
function ocrBestTeam(text,driverName=''){const direct=ocrFindTeam(text);if(direct)return direct;const dt=driverName?driverTeam(driverName):'';if(dt)return{team:dt,idx:-1,pat:'',score:.99};let best={team:'',idx:-1,score:0};for(const [team,pats] of ocrTeamPatterns()){for(const pat of pats){const score=fuzzySimilarity(String(text).slice(0,180),pat);if(score>best.score)best={team,idx:-1,pat,score}}}return best.score>=.48?best:null}
function ocrExtractPenalty(line){const m=line.match(/x\s*(\d+)\s*[\[(]?[+]?\s*(\d+)\s*(?:sek\.?|s)\s*[\])]?/i)||line.match(/[\[(]\s*[+]?\s*(\d+)\s*(?:sek\.?|s)\s*[\])]/i);if(!m)return{penSec:0,tl:0,raw:''};const mult=Number(m[1])||1;const sec=Number(m[2]||m[1])||0;let tl=mult>1?mult:({3:1,6:2,9:3,10:3}[sec]||Math.max(1,Math.round(sec/3)));if(sec===19&&mult===4)tl=4;return{penSec:sec,tl,raw:m[0]}}
function ocrExtractTime(line){if(/\bDNF\b/i.test(line))return{time:'DNF',status:'DNF'};if(/\bDSQ\b|DISQUAL/i.test(line))return{time:'DSQ',status:'DSQ'};const abs=line.match(/\b\d{1,2}:\d{2}[,.]\d{3}\b/);if(abs)return{time:abs[0].replace('.',','),status:'RESULT'};const delta=line.match(/[+]\s*(?:\d+:)?\d{1,3}[,.]\d{3}\b/);if(delta)return{time:delta[0].replace('.',','),status:'RESULT'};const lap=line.match(/[+]\s*\d+\s*Runde(?:n)?/i);if(lap)return{time:lap[0].replace(/\s+/g,' '),status:'RESULT'};return{time:'',status:'RESULT'}}
function ocrExtractGrid(afterTeam){
 const clean=String(afterTeam||'').replace(/[|]/g,' ').trim();
 const beforeTime=clean.split(/\b\d{1,2}:\d{2}[,.]\d{3}\b|[+]\s*(?:\d+:)?\d{1,3}[,.]\d{3}\b|[+]\s*\d+\s*Runde(?:n)?/i)[0];
 const nums=[...beforeTime.matchAll(/\b(0|[1-9]|1\d|2[0-2])\b/g)].map(m=>Number(m[1]));
 return nums.length?nums[nums.length-1]:0;
}
function ocrExtractGridFromWords(words){
 const w=(words||[]).filter(x=>Number.isFinite(x.left)&&Number.isFinite(x.width)).sort((a,b)=>a.left-b.left);
 // In the fixed game table the GRID column is between TEAM and STOPS/BESTE.
 // Use relative x positions so screenshots with different resolutions/crops still work.
 const maxX=Math.max(1,...w.map(x=>x.left+x.width));
 const candidates=w.filter(x=>{
   const cx=(x.left+x.width/2)/maxX, t=String(x.text||'').trim();
   return cx>=.52&&cx<.75&&/^(0|[1-9]|1\d|2\d)$/.test(t);
 });
 if(!candidates.length)return 0;
 return Number(candidates[0].text);
}
function ocrStripRowNoise(line){
 return String(line||'')
  .replace(/^\s*\d{1,2}\s*(?:[↑↓–—-])?\s*/,'')
  .replace(/\b\d{1,2}:\d{2}[,.]\d{3}\b/g,' ')
  .replace(/[+]\s*(?:\d+:)?\d{1,3}[,.]\d{3}\b/g,' ')
  .replace(/[+]\s*\d+\s*Runde(?:n)?/gi,' ')
  .replace(/x\s*\d+\s*[[(]?\s*\+?\s*\d+\s*(?:sek\.?|s)\s*[\])]?/gi,' ')
  .replace(/[[(]\s*\+?\s*\d+\s*(?:sek\.?|s)\s*[\])]/gi,' ')
  .replace(/\b(?:POS\.?|FAHRER|TEAM|GRID|STOPPS|BESTE|ZEIT|PKT\.?)\b/gi,' ')
  .replace(/[^A-Za-zÄÖÜäöüß0-9_\- ]/g,' ')
  .replace(/\s+/g,' ').trim();
}
function ocrExtractCandidate(line,teamHit){
 let base=ocrStripRowNoise(line);
 if(teamHit?.pat){
   const idx=base.toLowerCase().indexOf(teamHit.pat.toLowerCase());
   if(idx>=0)base=base.slice(0,idx);
 }
 base=base.replace(/\b(?:Mercedes|Ferrari|McLaren|Red Bull|Alpine|Haas|Audi|Visa Cash|Williams|Cadillac|Aston Martin)\b/gi,' ')
   .replace(/\b(?:0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22)\b/g,' ')
   .replace(/\s+/g,' ').trim();
 const known=drivers.map(n=>({name:n,score:fuzzySimilarity(base,normDriver(n))})).sort((a,b)=>b.score-a.score)[0];
 if(known&&known.score>=.55)return known.name;
 return base;
}
function ocrMatchDriverFromRowText(text){
 const clean=ocrCleanName(text);
 let best={name:'',score:0};
 for(const n of drivers){
   const cn=ocrNormName(n), ct=ocrNormName(clean);
   if(!cn||!ct)continue;
   let score=fuzzySimilarity(clean,normDriver(n));
   // Strong bonus when the normalized driver name occurs inside the OCR row.
   if(ct.includes(cn)||cn.includes(ct))score=Math.max(score,Math.min(1,.94+Math.min(cn.length,20)/1000));
   // Also compare against each token/short window to survive OCR noise around the name.
   const tokens=clean.split(/\s+/).filter(Boolean);
   for(let i=0;i<tokens.length;i++){
     for(let j=i+1;j<=Math.min(tokens.length,i+4);j++)score=Math.max(score,fuzzySimilarity(tokens.slice(i,j).join(' '),normDriver(n)));
   }
   if(score>best.score)best={name:n,score};
 }
 return best;
}
function ocrRowsFromTableData(data,canvas){
 const W=canvas.width,H=canvas.height;
 // Prefer Tesseract's own line segmentation. The game uses one horizontal line per
 // driver, so this is much more stable than trying to reconstruct rows from words.
 let bands=[];
 if(Array.isArray(data?.lines)&&data.lines.length){
   bands=data.lines.map(line=>{
     const ws=(line.words||[]).filter(w=>String(w.text||'').trim()).map(w=>({...w,left:Number(w.bbox?.x0??w.left??0),top:Number(w.bbox?.y0??w.top??0),width:Math.max(1,Number((w.bbox?.x1??w.left??0)-(w.bbox?.x0??w.left??0))),height:Math.max(1,Number((w.bbox?.y1??w.top??0)-(w.bbox?.y0??w.top??0)))}));
     const b=line.bbox||{};const cy=(Number(b.y0??0)+Number(b.y1??0))/2;
     return {cy:cy||ws.reduce((a,w)=>a+w.top+w.height/2,0)/Math.max(1,ws.length),words:ws,text:String(line.text||ws.map(w=>w.text).join(' ')).replace(/\s+/g,' ').trim()};
   }).filter(x=>x.words.length>=2&&x.cy>H*.055&&x.cy<H*.97).sort((a,b)=>a.cy-b.cy);
 }
 // Fallback for older Tesseract builds without data.lines.
 if(!bands.length){
   const words=(data?.words||[]).filter(w=>String(w.text||'').trim());
   const normalized=words.map(w=>({...w,left:Number(w.bbox?.x0??w.left??0),top:Number(w.bbox?.y0??w.top??0),width:Math.max(1,Number((w.bbox?.x1??w.left??0)-(w.bbox?.x0??w.left??0))),height:Math.max(1,Number((w.bbox?.y1??w.top??0)-(w.bbox?.y0??w.top??0)))}));
   const sorted=normalized.filter(w=>w.top>H*.055&&w.top<H*.97).sort((a,b)=>(a.top+a.height/2)-(b.top+b.height/2));
   const tol=Math.max(8,H*.018);
   for(const w of sorted){const cy=w.top+w.height/2;let c=bands[bands.length-1];if(!c||Math.abs(c.cy-cy)>tol){c={cy,words:[]};bands.push(c)}c.words.push(w);c.cy=(c.cy*(c.words.length-1)+cy)/c.words.length;}
   bands=bands.filter(c=>c.words.length>=3);
 }
 if(!bands.length)return [];
 // Locate the first actual result row. Header words such as POS/FAHRER/TEAM are ignored.
 let firstIdx=bands.findIndex(c=>c.words.some(w=>{const cx=(w.left+w.width/2)/W;const t=String(w.text||'').replace(/[.,]/g,'').trim();return cx<.11&&/^(?:[1-9]|[12]\d|30)$/.test(t)}));
 if(firstIdx<0)firstIdx=bands.findIndex(c=>{const text=c.text||c.words.map(w=>w.text).join(' ');return !!ocrFindTeam(text)||!!ocrMatchDriverFromRowText(c.words.filter(w=>(w.left+w.width/2)/W<.40).map(w=>w.text).join(' ')).name});
 if(firstIdx<0)return [];
 const rows=[];
 for(const c of bands.slice(firstIdx)){
   const rw=[...c.words].sort((a,b)=>a.left-b.left);const text=(c.text||rw.map(w=>w.text).join(' ')).replace(/\s+/g,' ').trim();
   if(!text||/^(?:POS|FAHRER|TEAM|GRID|STOPPS|BESTE|ZEIT|PKT)/i.test(text))continue;
   const posWord=rw.find(w=>{const cx=(w.left+w.width/2)/W;const t=String(w.text||'').replace(/[.,]/g,'').trim();return cx<.11&&/^(?:[1-9]|[12]\d|30)$/.test(t)});
   const rawPos=posWord?Number(String(posWord.text).replace(/[.,]/g,'')):0;
   const driverRegion=rw.filter(w=>{const cx=(w.left+w.width/2)/W;return cx>=.075&&cx<.37}).map(w=>w.text).join(' ');
   const match=ocrMatchDriverFromRowText(driverRegion||text);
   const teamHit=ocrFindTeam(text);const team=teamHit?.team||'';
   const time=ocrExtractTime(text),penalty=ocrExtractPenalty(text),grid=ocrExtractGridFromWords(rw);
   if(!match.name&&!team&&!time.time&&!grid)continue;
   rows.push({rawPos,pos:rawPos,raw:text,match:match.name||'',score:match.score||0,team,grid,time:time.time,status:time.status,penSec:penalty.penSec,tl:penalty.tl,penaltyRaw:penalty.raw,type:match.score>=.82?'known':match.score>=.55?'similar':'new',line:text,_y:c.cy});
 }
 const ordered=rows.sort((a,b)=>a._y-b._y);
 if(ordered.length){
   // Never trust OCR's position glyphs over the visual row order. Use the first valid
   // position only as an anchor and then count down the table.
   let first=ordered.find(r=>r.rawPos>=1&&r.rawPos<=30)?.rawPos||1;
   ordered.forEach((r,i)=>{r.pos=first+i;delete r._y;});
 }
 return ordered;
}
function extractOCRRaceRows(text,structured=[]){
 const fromData=structured.flatMap(x=>ocrRowsFromTableData(x.data,x.canvas));
 if(fromData.length)return mergeOCRRaceRows(fromData);
 const lines=String(text||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean),out=[];
 for(const line of lines){
  if(!/^\s*\d{1,2}\b/.test(line))continue;
  const pos=Number((line.match(/^\s*(\d{1,2})/)||[])[1]);
  if(!pos||pos>30)continue;
  const teamHit=ocrFindTeam(line),candidate=ocrExtractCandidate(line,teamHit),match=knownDriverMatch(candidate);
  const team=teamHit?.team||'';const time=ocrExtractTime(line),penalty=ocrExtractPenalty(line);const afterTeam=teamHit?.idx>=0?line.slice(teamHit.idx+teamHit.pat.length):line;const grid=ocrExtractGrid(afterTeam);
  const score=match?.score||0;out.push({pos,raw:match&&score>=.60?match.name:candidate,team,grid,time:time.time,status:time.status,penSec:penalty.penSec,tl:penalty.tl,penaltyRaw:penalty.raw,type:score>=.86?'known':score>=.60?'similar':'new',match:match?.name||'',score,line});
 }
 return mergeOCRRaceRows(out);
}
function mergeOCRRaceRows(rows){
 const merged=[];
 for(const r of rows){
   const keyName=r.match?ocrNormName(r.match):ocrNormName(r.raw);
   let hit=merged.find(x=>x.pos===r.pos||(keyName&&((x.match&&ocrNormName(x.match)===keyName)||fuzzySimilarity(x.raw,r.raw)>=.80)));
   if(!hit){merged.push({...r});continue}
   const prefer=(r.score||0)>(hit.score||0)?r:hit;
   Object.assign(hit,{raw:prefer.raw,match:prefer.match||hit.match,type:prefer.type,score:Math.max(hit.score||0,r.score||0),team:hit.team||r.team,grid:hit.grid||r.grid,time:hit.time||r.time,status:hit.time?r.status:(r.status||hit.status),penSec:hit.penSec||r.penSec,tl:hit.tl||r.tl,penaltyRaw:hit.penaltyRaw||r.penaltyRaw});
 }
 return merged.sort((a,b)=>a.pos-b.pos);
}
function ocrCanvasFromImage(img,mode='full'){
 const c=document.createElement('canvas');const w=img.naturalWidth||img.width,h=img.naturalHeight||img.height;let sx=0,sy=0,sw=w,sh=h;
 if(mode==='table'){sx=Math.round(w*.22);sy=Math.round(h*.12);sw=Math.round(w*.78);sh=Math.round(h*.88)}
 const max=3200,scale=Math.min(max/sw,3.2);c.width=Math.round(sw*scale);c.height=Math.round(sh*scale);const ctx=c.getContext('2d',{willReadFrequently:true});ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(img,sx,sy,sw,sh,0,0,c.width,c.height);
 if(mode==='enhanced'){const d=ctx.getImageData(0,0,c.width,c.height);for(let i=0;i<d.data.length;i+=4){const g=d.data[i]*.299+d.data[i+1]*.587+d.data[i+2]*.114;const v=Math.max(0,Math.min(255,(g-128)*1.8+128));d.data[i]=d.data[i+1]=d.data[i+2]=v;}ctx.putImageData(d,0,0)}
 return c;
}
function ocrPreprocess(file,mode='full'){return new Promise((resolve,reject)=>{const img=new Image();const rd=new FileReader();rd.onload=()=>{img.onload=()=>resolve(ocrCanvasFromImage(img,mode));img.onerror=reject;img.src=rd.result};rd.onerror=reject;rd.readAsDataURL(file)})}
async function startOCR(input){return startRaceOCR(input)}
async function startRaceOCR(input){
 if(!requireEditor()){input.value='';return}const files=[...input.files];if(!files.length)return;if(typeof Tesseract==='undefined'){toast('OCR-Bibliothek konnte nicht geladen werden.');return}
 const raceId=input.dataset.raceId;const race=races[raceId];if(!race){toast('Rennen nicht gefunden.');return}
 document.getElementById('modal-content').innerHTML=`<div class="modal-head"><div><h2>🔎 Rennergebnis per OCR</h2><p class="race-edit-note">${esc(race.division)} · Rennen ${race.number} · ${esc(race.track)}. Die Ergebnistabelle wird zeilenweise und spaltenorientiert analysiert; überlappende Screenshots werden zusammengeführt.</p></div><button onclick="closeModal()">×</button></div><div id="ocr-progress" class="ocr-progress">OCR wird vorbereitet …</div><div id="ocr-results"></div>`;openModal();
 try{
   const worker=await Tesseract.createWorker('eng');await worker.setParameters({tessedit_pageseg_mode:'6',preserve_interword_spaces:'1'});
   let all='',structured=[];
   for(let i=0;i<files.length;i++){
     document.getElementById('ocr-progress').textContent=`Bild ${i+1}/${files.length}: Ergebnistabelle wird zeilenweise gelesen …`;
     const canvas=await ocrPreprocess(files[i],'table');
     // Two segmentation modes: the normal block mode is strongest for the complete
     // table, while sparse mode often recovers the last rows that are close to the
     // lower screen edge. Both passes are merged afterwards.
     for(const psm of ['6','4']){
       await worker.setParameters({tessedit_pageseg_mode:psm,preserve_interword_spaces:'1'});
       const res=await worker.recognize(canvas);
       structured.push({data:res.data||{},canvas,psm});
       all+=`\n--- Tabelle ${i+1} · PSM ${psm} ---\n`+(res.data?.text||'');
     }
   }
   await worker.terminate();const rows=extractOCRRaceRows(all,structured);renderOCRRaceReview(rows,all,raceId);
 }catch(e){document.getElementById('ocr-progress').textContent='OCR konnte nicht abgeschlossen werden.';document.getElementById('ocr-results').innerHTML=`<div class="ocr-error">${esc(e?.message||e)}</div>`}input.value='';
}
function ocrRowPoints(pos,status){return pointsForPosition(Number(pos)||99,status||'RESULT')}
function captureOCRRowsFromDOM(){return [...document.querySelectorAll('.ocr-race-row:not(.head)')].map(row=>({pos:Number(row.querySelector('.ocr-pos')?.value)||99,name:row.querySelector('.ocr-name')?.value.trim()||'',team:row.querySelector('.ocr-team')?.value||'',grid:Number(row.querySelector('.ocr-grid')?.value)||0,time:row.querySelector('.ocr-time')?.value.trim()||'',penSec:Number(row.querySelector('.ocr-pen')?.value)||0,status:/^DNF$/i.test(row.querySelector('.ocr-time')?.value.trim()||'')?'DNF':/^DSQ$/i.test(row.querySelector('.ocr-time')?.value.trim()||'')?'DSQ':'RESULT'}));}
function openOCRNewDriver(index){const draft={raceId:window.__ocrRaceId||'',raw:window.__ocrRaw||'',rows:captureOCRRowsFromDOM(),index};const row=draft.rows[index]||{};window.__ocrRaceDraft=draft;openAddDriver(row.name||'',row.team||'',window.__ocrRaceDivision||'Div 1');}
function updateOCRDriverSelect(el,index){const value=el.value;if(value==='__NEW__'){openOCRNewDriver(index);return;}const row=el.closest('.ocr-race-row');if(!row)return;const input=row.querySelector('.ocr-name');if(input)input.value=value||'';const note=row.querySelector('.ocr-match');if(note)note.textContent=value?`✓ Fahrer ausgewählt: ${normDriver(value)}`:'⚠ Fahrer bitte auswählen oder neu anlegen';updateOCRRow(el);}
function renderOCRRaceReview(rows,raw,raceId){
 window.__ocrRaceId=raceId;window.__ocrRaw=raw;window.__ocrRaceDivision=races[raceId]?.division||'Div 1';
 const known=rows.filter(r=>r.type==='known').length,similar=rows.filter(r=>r.type==='similar').length,fresh=rows.filter(r=>r.type==='new').length;
 const sortedDrivers=drivers.slice().sort((a,b)=>normDriver(a).localeCompare(normDriver(b),'de'));
 const body=rows.length?`<div class="ocr-summary"><span>✓ ${known} sicher</span><span>⚠ ${similar} prüfen</span><span>🆕 ${fresh} neu/unklar</span><span>📸 ${rows.length} Zeilen</span></div><div class="ocr-hint">Bei jedem Fahrer kannst du per <b>Pfeil</b> einen vorhandenen Fahrer auswählen. Wenn er nicht existiert, wähle <b>➕ Neuen Fahrer anlegen …</b>. Das historische Team bleibt separat gespeichert.</div><div class="ocr-race-table"><div class="ocr-race-row head"><span>POS</span><span>FAHRER</span><span>TEAM</span><span>START</span><span>ZEIT</span><span>STRAFE</span><span>PKT.</span><span></span></div>${rows.map((r,i)=>{const selected=drivers.find(n=>ocrNormName(n)===ocrNormName(r.match||r.name||r.raw||''));const opts=`<option value="">— Fahrer auswählen —</option>${sortedDrivers.map(n=>`<option value="${esc(n)}" ${selected&&normDriver(selected)===normDriver(n)?'selected':''}>${esc(n)}</option>`).join('')}<option value="__NEW__">➕ Neuen Fahrer anlegen …</option>`;return `<div class="ocr-race-row ${r.type==='similar'?'needs-review':''} ${r.type==='new'?'new-driver-row':''}"><input class="ocr-pos" type="number" value="${r.pos}" min="1" max="30" oninput="updateOCRRow(this)"><div><select class="ocr-driver-select" onchange="updateOCRDriverSelect(this,${i})">${opts}</select><input class="ocr-name" type="hidden" value="${esc(selected||r.match||r.name||r.raw||'')}"><small class="ocr-match ${r.type}">${selected?`✓ Fahrer ausgewählt: ${esc(normDriver(selected))}`:'⚠ Fahrer bitte auswählen oder neu anlegen'}</small></div><select class="ocr-team" onchange="updateOCRRow(this)"><option value="">— Team auswählen —</option>${TEAM_CHOICES.filter(Boolean).map(t=>`<option value="${esc(t)}" ${canonicalTeamName(t)===canonicalTeamName(r.team||'')?'selected':''}>${esc(t)}</option>`).join('')}</select><input class="ocr-grid" type="number" value="${r.grid||0}" min="0" max="30" oninput="updateOCRRow(this)"><input class="ocr-time" value="${esc(r.time)}" oninput="updateOCRRow(this)"><div><input class="ocr-pen" type="number" value="${r.penSec||0}" min="0" oninput="updateOCRRow(this)"><small>${r.tl?`${r.tl} TL`:''}</small></div><b class="ocr-points">${ocrRowPoints(r.pos,r.status)}</b><button class="ghost" onclick="this.closest('.ocr-race-row').remove();updateOCRSummary()">✕</button></div>`}).join('')}</div><datalist id="ocr-team-list">${TEAM_CHOICES.filter(Boolean).map(t=>`<option value="${esc(t)}"></option>`).join('')}</datalist>`:'<div class="empty-race">Keine verwertbaren Ergebniszeilen gefunden.</div>';
 document.getElementById('ocr-progress').innerHTML=`<b>${rows.length}</b> Ergebniszeilen erkannt · <span class="muted">${esc(raceId)}</span>`;
 document.getElementById('ocr-results').innerHTML=body+`<details class="ocr-raw"><summary>OCR-Rohtext anzeigen</summary><pre>${esc(raw)}</pre></details><div class="modal-actions"><button class="ghost" onclick="closeModal()">Abbrechen</button>${rows.length?`<button class="primary" onclick="applyOCRRace('${raceId}')">✓ Ergebnis übernehmen</button>`:''}</div>`;
}
function updateOCRDriverInput(el){
 const row=el.closest('.ocr-race-row');if(!row)return;
 const selected=el.value.trim();
 const match=drivers.find(n=>ocrNormName(n)===ocrNormName(selected));
 const note=row.querySelector('.ocr-match');
 if(note)note.textContent=match?`✓ Fahrer ausgewählt: ${normDriver(match)}`:(selected?'✏️ Name manuell eingegeben':'⚠ Fahrer bitte auswählen oder Namen eingeben');
 updateOCRRow(el);
}
function updateOCRDriverSelect(el){ updateOCRDriverInput(el); }
function updateOCRRow(el){
 const row=el.closest('.ocr-race-row');if(!row||row.classList.contains('head'))return;
 const pos=Number(row.querySelector('.ocr-pos')?.value)||99;const time=row.querySelector('.ocr-time')?.value.trim()||'';const status=/^DNF$/i.test(time)?'DNF':/^DSQ$/i.test(time)?'DSQ':'RESULT';
 const p=row.querySelector('.ocr-points');if(p)p.textContent=ocrRowPoints(pos,status);
}
function updateOCRSummary(){
 const rows=[...document.querySelectorAll('.ocr-race-row:not(.head)')];const el=document.getElementById('ocr-progress');if(el)el.innerHTML=`<b>${rows.length}</b> Ergebniszeilen vorbereitet · Punkte werden live berechnet.`;
}
function ensureOCRDriver(name,team,division,allowCreate=true){
 const canonical=normDriver(name);let existing=drivers.find(n=>ocrNormName(n)===ocrNormName(canonical));if(existing)return existing;
 if(!allowCreate)return '';
 const finalName=String(name||'').trim();if(!finalName)return '';
 drivers.push(finalName);driverMeta[finalName]={id:(crypto.randomUUID?crypto.randomUUID():'dog-'+Date.now()+'-'+Math.random().toString(16).slice(2)),division,team,status:'Free Agent',createdAt:new Date().toISOString()};
 return finalName;
}
function applyOCRRace(id){
 if(!requireEditor())return;
 const race=races[id];
 const rows=[...document.querySelectorAll('.ocr-race-row:not(.head)')].map(row=>{
   const name=row.querySelector('.ocr-name')?.value.trim()||row.querySelector('.ocr-driver-select')?.value.trim();const team=row.querySelector('.ocr-team')?.value||'';const grid=Number(row.querySelector('.ocr-grid')?.value)||0;const time=row.querySelector('.ocr-time')?.value.trim()||'';const penSec=Number(row.querySelector('.ocr-pen')?.value)||0;const pos=Number(row.querySelector('.ocr-pos')?.value)||99;const status=/^DNF$/i.test(time)?'DNF':/^DSQ$/i.test(time)?'DSQ':'RESULT';const tl=penSec?({3:1,6:2,9:3,10:3,19:4}[penSec]||Math.max(1,Math.round(penSec/3))):0;return{pos,name,team,grid,time,penSec,tl,status};
 }).filter(x=>x.name);
 if(!rows.length){toast('Bitte mindestens einen Fahrer auswählen.');return}
 const unknown=rows.filter(x=>!drivers.some(n=>ocrNormName(n)===ocrNormName(x.name)));
 if(unknown.length){toast('Bitte alle Fahrer per Pfeil auswählen oder neu anlegen.');return}
 const finalRows=rows.map(x=>({...x,name:normDriver(x.name)})).sort((a,b)=>a.pos-b.pos);
 const oldByName={};race.results.forEach(x=>oldByName[ocrNormName(normDriver(x.name))]=x);
 finalRows.forEach(x=>{const old=oldByName[ocrNormName(normDriver(x.name))];if(old){if(!x.penaltyNote&&old.penaltyNote)x.penaltyNote=old.penaltyNote;if(!x.penaltyImage&&old.penaltyImage)x.penaltyImage=old.penaltyImage}});
 race.results=finalRows;race.ocr={capturedAt:new Date().toISOString(),rows:finalRows.length,source:'Tesseract.js · table-row OCR'};saveRaceAndRecalculate(id,'OCR übernommen',`${finalRows.length} Ergebniszeilen aus OCR übernommen`);closeModal();renderSelectedRace();renderWM();renderKWM();renderDashboard();initDriverOverview();renderTeams();toast(`${finalRows.length} Ergebniszeilen übernommen · WM/KWM/Fahrerwerte aktualisiert.`);
}
function renderOCRReview(rows,raw){const body=rows.length?rows.map(r=>`<div class="ocr-row"><div><b>${esc(r.raw)}</b><small>${esc(r.team)} · ${r.type==='known'?'Bekannter Fahrer':r.type==='similar'?'Ähnlicher Name':'Neuer Fahrer'}${r.match?` · Vorschlag: ${esc(r.match)} (${Math.round(r.score*100)}%)`:''}</small></div><div class="ocr-actions">${r.type==='known'?`<span class="ocr-ok">✓ ${esc(normDriver(r.match))}</span>`:`<span class="ocr-review">${r.type==='similar'?'⚠ Prüfung nötig':'🆕 Neuer Fahrer'}</span>`}</div></div>`).join(''):'<div class="empty-race">Keine Ergebniszeile mit eindeutig erkennbarem Fahrer gefunden.</div>';document.getElementById('ocr-progress').innerHTML=`<b>${rows.length}</b> mögliche Fahrer erkannt.`;document.getElementById('ocr-results').innerHTML=body+`<details class="ocr-raw"><summary>OCR-Rohtext anzeigen</summary><pre>${esc(raw)}</pre></details><div class="modal-actions"><button class="ghost" onclick="closeModal()">Schließen</button></div>`}
function renderCompare(){
 const el=document.getElementById('compare-content'); if(!el)return;
 const selectedIds=['compare-driver-1','compare-driver-2','compare-driver-3','compare-driver-4'];
 const selected=selectedIds.map(id=>document.getElementById(id)?.value||'').filter(Boolean);
 const defaults=drivers.slice().sort((a,b)=>normDriver(a).localeCompare(normDriver(b),'de'));
 const picks=selected.length?selected:defaults.slice(0,4);
 const opts=(value)=>`<option value="">— Fahrer wählen —</option>${defaults.map(n=>`<option value="${esc(n)}" ${normDriver(n)===normDriver(value)?'selected':''}>${esc(n)}</option>`).join('')}`;
 const metrics=[['GESAMT / OVA','ova'],['Marktwert','mw'],['REN','ren'],['PER','per'],['TEM','tem'],['AMK','amk'],['ERF','erf']];
 const cards=picks.map((n,i)=>{const c=calcDriver(n),t=driverTeam(n)||'Free Agent',s=driverRaceStats(n);return `<div class="compare-driver-card compare-c${i+1}"><div class="compare-badge">${i+1}</div><div class="compare-driver-name">${esc(n)}</div><div class="compare-team">${esc(t)} · ${esc(currentDivision(n))}</div><div class="compare-total"><span>GESAMT</span><b>${c.ova}</b></div><div class="compare-mini"><span>Rennen <b>${s.races}</b></span><span>Siege <b>${s.wins}</b></span><span>Podien <b>${s.podiums}</b></span></div></div>`}).join('');
 const rows=metrics.map(([label,key])=>`<tr><th>${label}</th>${picks.map(n=>{const c=calcDriver(n);return `<td>${key==='mw'?money(c[key]):c[key]}</td>`}).join('')}${Array.from({length:4-picks.length},()=>'<td>—</td>').join('')}</tr>`).join('');
 el.innerHTML=`<div class="compare-select-panel"><div><h3>Fahrervergleich</h3><p>Bis zu 4 Fahrer direkt gegenüberstellen. Die Werte werden aus den aktuell gespeicherten Renn- und Fahrerdaten berechnet.</p></div><div class="compare-select-grid">${selectedIds.map((id,i)=>`<label>Fahrer ${i+1}<select id="${id}" onchange="renderCompare()">${opts(picks[i]||'')}</select></label>`).join('')}</div></div><div class="compare-driver-grid">${cards||'<div class="empty-race">Noch keine Fahrer vorhanden.</div>'}</div><div class="table-panel compare-table"><table class="standings"><thead><tr><th>Wert</th><th>Fahrer 1</th><th>Fahrer 2</th><th>Fahrer 3</th><th>Fahrer 4</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
function openContractManager(){
 if(!requireEditor())return;
 const current=seasonState.current||'02/26';
 const list=contracts.filter(c=>c.season===current).sort((a,b)=>String(a.driver).localeCompare(String(b.driver),'de'));
 const rows=list.length?list.map(c=>`<div class="contract-row"><span><b>${esc(c.driver)}</b></span><span>${esc(c.team)}</span><span>${esc(c.division)}</span><span>Gesamte Saison</span><span>${c.value?esc(c.value):'—'}</span><button class="mini-link" onclick="openContractEditor('${esc(c.driver)}','${esc(c.id)}')">Bearbeiten</button></div>`).join(''):'<div class="empty-race">Für diese Saison sind noch keine Verträge hinterlegt.</div>';
 document.getElementById('modal-content').innerHTML=`<div class="modal-head"><div><h2>📋 Vertragsverwaltung · ${esc(current)}</h2><p class="race-edit-note">Verträge gelten nur für die gewählte Saison. Änderungen an Verträgen verändern keine historischen Rennergebnisse.</p></div><button onclick="closeModal()">×</button></div><div class="contract-history">${rows}</div><div class="modal-actions"><button class="ghost" onclick="openSeasonTransition()">🔄 Saisonübergang vorbereiten</button><button class="primary" onclick="closeModal()">Fertig</button></div>`;
 openModal();
}
function openSeasonTransition(){
 if(!requireEditor())return;
 const current=seasonState.current||'02/26';
 const next=Object.keys(SEASON_META.seasons).sort().find(x=>x>current) || '';
 const active=contracts.filter(c=>c.season===current && c.status!=='Beendet' && !c.draft);
 const rows=active.length?active.map((c,i)=>`<label class="transition-row"><input type="checkbox" id="carry-${i}" checked><span><b>${esc(c.driver)}</b><small>${esc(c.team)} · ${esc(c.division)} · gesamte Saison</small></span></label>`).join(''):'<div class="empty-race">Keine aktiven oder vorläufigen Verträge in der aktuellen Saison.</div>';
 document.getElementById('modal-content').innerHTML=`<div class="modal-head"><div><h2>🔄 Saisonübergang vorbereiten</h2><p class="race-edit-note">Aktive Verträge werden nur als <b>vorläufige Entwürfe</b> für die nächste Saison übernommen. Es wird nichts automatisch als endgültiger Vertrag gewertet.</p></div><button onclick="openContractManager()">×</button></div><div class="new-driver-form"><label>Zielsaison<select id="transition-season">${Object.values(SEASON_META.seasons).filter(s=>s.label!==current).sort((a,b)=>b.label.localeCompare(a.label,'de')).map(s=>`<option value="${esc(s.label)}" ${s.label===next?'selected':''}>${esc(s.label)}</option>`).join('')}</select></label></div><div class="transition-list">${rows}</div><div class="modal-actions"><button class="ghost" onclick="openContractManager()">Abbrechen</button><button class="primary" onclick="createTransitionDrafts()">Entwürfe erstellen</button></div>`;
 openModal();
}
function createTransitionDrafts(){
 const target=document.getElementById('transition-season')?.value;
 const current=seasonState.current||'02/26'; if(!target){toast('Bitte eine Zielsaison auswählen.');return}
 const active=contracts.filter(c=>c.season===current && c.status!=='Beendet' && !c.draft);
 let made=0;
 active.forEach((c,i)=>{const cb=document.getElementById(`carry-${i}`);if(!cb?.checked)return;const exists=contracts.some(x=>x.season===target&&normDriver(x.driver)===normDriver(c.driver)&&x.team===c.team&&x.division===c.division);if(exists)return;contracts.push({id:crypto.randomUUID?crypto.randomUUID():'contract-'+Date.now()+'-'+i,driver:normDriver(c.driver),season:target,team:c.team,division:c.division,startDate:'',endDate:'',value:c.value||'',source:'season-transition-draft',draft:true,createdAt:new Date().toISOString(),fromContractId:c.id});made++;});
 save();closeModal();toast(`${made} Vertragsentwurf${made===1?'':'e'} für ${target} erstellt.`);
}
function openSeasonManager(selected=''){
 if(!requireEditor())return;
 const seasons=Object.values(SEASON_META.seasons).sort((a,b)=>b.label.localeCompare(a.label,'de'));
 const cards=seasons.map(se=>`<div class="season-manage-row"><div><b>${esc(se.label)}</b><small>${esc(se.type)} · Regeln: ${esc(se.rules)}</small></div><div class="season-manage-actions"><button class="ghost" onclick="setActiveSeason('${esc(se.label)}')">${seasonState.current===se.label?'✓ Aktiv':'Als aktiv setzen'}</button>${se.label!=='02/26'?`<button class="ghost" onclick="archiveSeason('${esc(se.label)}')">${se.status==='archived'?'Wieder aktivieren':'Archivieren'}</button>`:''}<button class="ghost" onclick="editSeason('${esc(se.label)}')">✏️</button></div></div>`).join('');
 document.getElementById('modal-content').innerHTML=`<div class="modal-head"><div><h2>🗂️ Saisonverwaltung</h2><p class="race-edit-note">Saisons bleiben vollständig getrennt. Fahrer und ihre IDs bleiben erhalten; Rennen behalten ihre eigene Regelversion.</p></div><button onclick="closeModal()">×</button></div><div class="season-manage-list">${cards}</div><div class="modal-actions"><button class="ghost" onclick="openContractManager()">📋 Verträge</button><button class="ghost" onclick="openNewSeason()">➕ Neue Saison</button><button class="primary" onclick="closeModal()">Fertig</button></div>`;
 openModal();
}
function openNewSeason(){
 if(!requireEditor())return;
 document.getElementById('modal-content').innerHTML=`<div class="modal-head"><div><h2>➕ Neue Saison</h2><p class="race-edit-note">Beispiel: 03/26. Es werden keine Fahrer oder alten Rennen kopiert.</p></div><button onclick="openSeasonManager()">×</button></div><div class="new-driver-form"><label>Saison<input id="season-new-label" placeholder="03/26"></label><label>Typ<select id="season-new-type"><option>Offiziell</option><option>Test / Übergang</option></select></label><label>Regelversion<input id="season-new-rules" value="DoG 03/26 · v1"></label></div><div class="modal-actions"><button class="ghost" onclick="openSeasonManager()">Abbrechen</button><button class="primary" onclick="createSeason()">Saison anlegen</button></div>`;
}
function createSeason(){
 const label=(document.getElementById('season-new-label')?.value||'').trim();
 const type=document.getElementById('season-new-type')?.value||'Offiziell';
 const rules=(document.getElementById('season-new-rules')?.value||'').trim()||`DoG ${label} · v1`;
 if(!/^\d{2}\/\d{2}$/.test(label)){toast('Bitte Saison im Format 03/26 eingeben.');return}
 if(SEASON_META.seasons[label]){toast('Diese Saison existiert bereits.');return}
 SEASON_META.seasons[label]={label,status:'planned',type,rules,createdAt:new Date().toISOString()};
 seasonState.lastSeasonChangeAt=new Date().toISOString(); save(); renderArchive(); openSeasonManager(label); toast(`Saison ${label} angelegt.`);
}
function setActiveSeason(label){
 if(!SEASON_META.seasons[label])return;
 Object.values(SEASON_META.seasons).forEach(s=>{if(s.status==='active')s.status='archived'});
 SEASON_META.seasons[label].status='active'; seasonState.current=label; seasonState.lastSeasonChangeAt=new Date().toISOString();
 save(); updateSeasonChrome(); renderArchive(); closeModal(); toast(`Saison ${label} ist jetzt aktiv.`);
}
function archiveSeason(label){
 const se=SEASON_META.seasons[label];if(!se)return;
 if(se.status==='active'){toast('Die aktive Saison kann nicht direkt archiviert werden.');return}
 se.status=se.status==='archived'?'planned':'archived'; seasonState.lastSeasonChangeAt=new Date().toISOString(); save(); renderArchive(); openSeasonManager(label);
}
function editSeason(label){
 const se=SEASON_META.seasons[label];if(!se)return;
 document.getElementById('modal-content').innerHTML=`<div class="modal-head"><div><h2>✏️ ${esc(label)} bearbeiten</h2><p class="race-edit-note">Die Regelversion gilt nur für neue Rennen dieser Saison. Bestehende Rennen behalten ihre gespeicherte Version.</p></div><button onclick="openSeasonManager('${esc(label)}')">×</button></div><div class="new-driver-form"><label>Anzeigename<input id="season-edit-label" value="${esc(se.label)}"></label><label>Typ<select id="season-edit-type"><option ${se.type==='Offiziell'?'selected':''}>Offiziell</option><option ${se.type==='Test / Übergang'?'selected':''}>Test / Übergang</option></select></label><label>Regelversion<input id="season-edit-rules" value="${esc(se.rules||'')}"></label></div><div class="modal-actions"><button class="ghost" onclick="openSeasonManager('${esc(label)}')">Abbrechen</button><button class="primary" onclick="saveSeasonEdit('${esc(label)}')">Speichern</button></div>`;
}
function saveSeasonEdit(oldLabel){
 const se=SEASON_META.seasons[oldLabel];if(!se)return;
 const nl=(document.getElementById('season-edit-label')?.value||'').trim();if(!/^\d{2}\/\d{2}$/.test(nl)){toast('Ungültiges Saisonformat.');return}
 if(nl!==oldLabel&&SEASON_META.seasons[nl]){toast('Diese Saison existiert bereits.');return}
 const copy={...se,label:nl,type:document.getElementById('season-edit-type')?.value||se.type,rules:(document.getElementById('season-edit-rules')?.value||se.rules).trim()};
 delete SEASON_META.seasons[oldLabel]; SEASON_META.seasons[nl]=copy;
 Object.values(races).forEach(r=>{if(r.season===oldLabel){r.season=nl;}});
 if(seasonState.current===oldLabel)seasonState.current=nl;
 seasonState.lastSeasonChangeAt=new Date().toISOString(); save(); renderArchive(); openSeasonManager(nl); toast(`Saison ${nl} gespeichert.`);
}
function updateSeasonChrome(){
 const cur=seasonState.current||'02/26';
 document.querySelectorAll('.season-box b').forEach(x=>x.textContent=cur);initSeasonSelectors();
 document.querySelectorAll('.top-actions .pill').forEach(x=>x.textContent=`SAISON ${cur}`);
 document.querySelectorAll('.nav-title b').forEach(x=>x.textContent=cur);
}
function renderArchive(){
 const seasons=Object.values(SEASON_META.seasons).sort((a,b)=>b.label.localeCompare(a.label,'de'));

 const html=seasons.map(se=>{
   const rs=seasonRaces(se.label), rounds=uniqueSeasonRounds(se.label), driversCount=new Set(rs.flatMap(r=>r.results.map(x=>normDriver(x.name)))).size;
   const last=rs.slice().sort((a,b)=>(b.number||0)-(a.number||0))[0];
   const status=se.status==='active'?'aktiv':se.type;
   return `<div class="archive-card ${se.status==='active'?'active-season':'muted'}"><div><b>${esc(se.label)}</b><small>${esc(se.type)}</small></div><span>${rs.length} Rennläufe · ${rounds} Rennwochenenden · ${driversCount} Fahrer</span><span class="archive-last">${last?`Letztes Rennen: ${esc(last.track)} · R${last.number}`:'Noch keine Rennen'}</span><i>${esc(status)}</i><button class="ghost archive-open" onclick="openSeasonManager('${esc(se.label)}')">Verwalten</button></div>`;
 }).join('');
 const checks=[
   ['Rennschema',Object.values(races).every(r=>r.schemaVersion===2),'Jedes Rennen besitzt Saison-, Regel- und Änderungsdaten.'],
   ['Wert-Snapshots',Object.values(races).every(r=>r.state&&r.state.driverValues),'Historische Fahrerwerte werden pro Rennstand gespeichert.'],
   ['Fahrer-IDs',drivers.every(n=>driverMeta[normDriver(n)]?.id),'Jeder Fahrer besitzt eine stabile interne ID.']
 ];
 document.getElementById('archive').innerHTML=`<div class="section-head"><div><h3>Archiv</h3><p>02/26 ist die erste offizielle DoG-Saison. Historische Rennstände verwenden ihre gespeicherte Regelversion.</p></div><button class="primary" onclick="openSeasonManager()">➕ Saison verwalten</button></div><div class="archive-list">${html}</div><div class="archive-integrity"><div class="panel-head"><div><h3>🗄️ Datenstatus</h3><p>Technische Prüfung der historischen Datenstruktur</p></div><span class="pill">Schema v2</span></div>${checks.map(c=>`<div class="integrity-row"><span>${c[1]?'✓':'⚠'} ${esc(c[0])}</span><small>${esc(c[2])}</small><b>${c[1]?'OK':'Prüfen'}</b></div>`).join('')}<div class="archive-meta">Letzte Berechnung: ${seasonState.lastCalculatedAt?new Date(seasonState.lastCalculatedAt).toLocaleString('de-DE'):'—'}</div></div>`;
}
function marketMovers(){
 const rows=[];
 const names=[...new Set(drivers.map(normDriver).filter(Boolean))];
 names.forEach(name=>{
   const c=calcDriver(name), h=getMarketHistory(name,c.mw);
   if(h.length<2)return;
   const prev=h[h.length-2]?.value, current=h[h.length-1]?.value;
   if(!Number.isFinite(prev)||!Number.isFinite(current))return;
   rows.push({name,prev,current,delta:current-prev,label:h[h.length-1].label});
 });
 const rises=[...rows].filter(x=>x.delta>0).sort((a,b)=>b.delta-a.delta);
 const falls=[...rows].filter(x=>x.delta<0).sort((a,b)=>a.delta-b.delta);
 return {rise:rises[0]||null,fall:falls[0]||null};
}
function renderMarketMovers(){
 const el=document.getElementById('market-movement-dashboard'); if(!el)return;
 const m=marketMovers();
 const card=(title,icon,item,positive)=>item?`<div class="panel market-mover-card"><div class="panel-head"><div><h3>${icon} ${title}</h3><p>Seit dem letzten Rennstand · ${esc(item.label)}</p></div><span class="market-mover-delta ${positive?'up':'down'}">${positive?'+':''}${money(item.delta)}</span></div><div class="market-mover-main"><strong>${esc(item.name)}</strong><span>${money(item.prev)} → <b>${money(item.current)}</b></span></div></div>`:`<div class="panel market-mover-card"><div class="panel-head"><div><h3>${icon} ${title}</h3><p>Seit dem letzten Rennstand</p></div></div><div class="empty-race">Noch keine Marktwertveränderung vorhanden.</div></div>`;
 el.innerHTML=card('Höchster Marktwert-Anstieg','⬆️',m.rise,true)+card('Höchster Marktwert-Abstieg','⬇️',m.fall,false);
}
function renderDashboard(){
 const cards=['Div 1','Div 2'].map(div=>{
   const ds=dotdForDivision(div);
   if(!ds)return `<div class="panel dotd-card"><div class="panel-head"><div><h3>⭐ Fahrer des Tages · ${div}</h3><p>Noch kein erfasstes Rennen</p></div></div><div class="empty-race">Für ${div} liegt noch kein Rennergebnis vor.</div></div>`;
   const r=ds.race,row=r.results.find(x=>normDriver(x.name)===normDriver(ds.driver));
   const pos=row?r.results.indexOf(row)+1:0;
   return `<div class="panel dotd-card"><div class="panel-head"><div><h3>⭐ Fahrer des Tages · ${div}</h3><p>${esc(r.track)} · Rennen ${r.number}</p></div><span class="dotd-badge">FdT</span></div><div class="dotd-main"><div><strong>${esc(normDriver(ds.driver))}</strong><span>${esc(row?.team||'')}</span></div><b>${row?pointsForPosition(pos,statusOfResult(row)):0} Pkt.</b></div><div class="dotd-stats"><span>Pos. <b>${pos||'—'}</b></span><span>Grid <b>${row?.grid??'—'}</b></span><span>Delta <b>${row?formatDelta(row.grid,pos):'—'}</b></span><span>Zeit <b>${esc(row?.time||'—')}</b></span></div></div>`;
 }).join('');
 document.getElementById('dotd-dashboard').innerHTML=cards;
 renderMarketMovers();
}
function renderTeams(){
 document.getElementById('team-list').innerHTML=teams.map(t=>`<div class="team-card"><div class="team-head"><img class="team-car-mini" src="${teamCar(t.name)}" onerror="this.style.display='none'"><div><div class="team-name">${esc(t.name)}</div><div class="team-chief">Teamchef: ${esc(t.chief||'ohne Teamchef')}</div></div><div class="team-card-actions"><button class="team-edit-btn" onclick="openTeamContracts('${esc(t.name)}')">📋 Teamzentrale</button><button class="team-edit-btn" onclick="openTeamEditor('${esc(t.name)}')">✏️</button></div></div><div class="division"><div class="division-title">DIVISION 1</div><div class="drivers-two">${slot(t.d1[0])}${slot(t.d1[1])}</div></div><div class="division"><div class="division-title">DIVISION 2</div><div class="drivers-two">${slot(t.d2[0])}${slot(t.d2[1])}</div></div></div>`).join('');
 const free=drivers.filter(n=>getStatus(n)==='Free Agent').sort((a,b)=>normDriver(a).localeCompare(normDriver(b),'de'));const ersatz=drivers.filter(n=>getStatus(n)==='Ersatzfahrer').sort((a,b)=>normDriver(a).localeCompare(normDriver(b),'de'));const unavailable=drivers.filter(n=>getStatus(n)==='Nicht verfügbar').sort((a,b)=>normDriver(a).localeCompare(normDriver(b),'de'));
 const freeNums=DOG_DRIVER_NUMBERS.filter(n=>{const st=driverNumberState(n,'','Stammfahrer');return st.state==='free'}); const blockedNums=F1_BLOCKED_NUMBERS.slice().sort((a,b)=>a-b); document.getElementById('driver-status-list').innerHTML=`<div class="status-card"><div class="status-image-wrap"><img src="free-agent.png" alt="Free Agent"></div><div><h3>Free Agent</h3><p>${free.length?free.map(n=>`${driverNumber(n)?'#'+driverNumber(n)+' · ':''}${esc(normDriver(n))}`).join(' · '):'Keine Fahrer'}</p></div></div><div class="status-card"><div class="status-image-wrap"><img src="dog-logo.png" alt="Ersatzfahrer"></div><div><h3>Ersatzfahrer</h3><p>${ersatz.length?ersatz.map(n=>`${driverNumber(n)?'#'+driverNumber(n)+' · ':''}${esc(normDriver(n))}`).join(' · '):'Keine Fahrer'}</p></div></div><div class="status-card"><div class="status-image-wrap"><img src="not-available.jpg" alt="Not Available"></div><div><h3>Nicht verfügbar</h3><p>${unavailable.length?unavailable.map(n=>esc(normDriver(n))).join(' · '):'Keine Fahrer'}</p></div></div><div class="status-card number-overview-card"><div><h3>🏁 Fahrernummern</h3><p><b>Freie Nummern:</b> ${freeNums.map(n=>`#${n}`).join(' · ')||'Keine'}</p><p class="driver-number-note"><b>F1 gesperrt:</b> ${blockedNums.map(n=>`#${n}`).join(' · ')}</p><p class="driver-number-note">Stammfahrer haben immer Vorrang vor Ersatzfahrern bei der Vergabe.</p></div></div>`;
}

function openTransferManager(){
 if(!requireEditor())return;
 const season=seasonState.current||'02/26';
 const rows=transferRecords.filter(x=>x.season===season).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))).map(x=>`<div class="contract-mini-card"><div><b>${esc(x.driver)}</b><span>${esc(x.division)} · ${esc(x.status)}</span></div><div><span>Von → Nach</span><b>${esc(x.fromTeam||'Free Agent')} → ${esc(x.toTeam)}</b></div><div><span>Leih-/Ablöse</span><b>${money(x.fee||0)}</b></div><div><span>Wirksam</span><b>${esc(x.effectiveDate||('Runde '+(x.effectiveRound||'—')))}</b></div></div>`).join('') || '<div class="empty-race">Für diese Saison sind noch keine Transfers hinterlegt.</div>';
 const driverOpts=drivers.slice().sort((a,b)=>a.localeCompare(b,'de')).map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('');
 const teamOpts=['Free Agent',...TEAM_CHOICES].map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('');
 document.getElementById('modal-content').innerHTML=`<div class="modal-head"><div><h2>🔄 Transfers · ${esc(season)}</h2><p class="race-edit-note">Fahrerwechsel, Teamwechsel und mögliche Ablöse werden saisonbezogen dokumentiert.</p></div><button onclick="closeModal()">×</button></div><div class="transfer-form"><div class="new-driver-form"><label>Fahrer<select id="transfer-driver">${driverOpts}</select></label><label>Division<select id="transfer-div"><option>Div 1</option><option>Div 2</option></select></label><label>Von<select id="transfer-from">${teamOpts}</select></label><label>Nach<select id="transfer-to">${TEAM_CHOICES.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('')}</select></label><label>Wirksam ab Runde<input id="transfer-round" type="number" min="1" value="1"></label><label>Wirksam ab Datum<input id="transfer-date" type="date"></label><label>Ablöse / Transferzahlung<input id="transfer-fee" placeholder="0 €"></label><label>Status<select id="transfer-status"><option>Vorgemerkt</option><option>Vollzogen</option><option>Storniert</option></select></label></div><label class="full-field">Notiz<textarea id="transfer-note" rows="3" placeholder="Optionale Vereinbarung zum Transfer"></textarea></label></div><div class="transfer-history"><h3>TRANSFERHISTORIE</h3>${rows}</div><div class="modal-actions"><button class="ghost" onclick="closeModal()">Abbrechen</button><button class="primary" onclick="saveTransfer()">✓ Transfer speichern</button></div>`;openModal();
}
function saveTransfer(){
 if(!requireEditor())return;
 const driver=document.getElementById('transfer-driver').value, div=document.getElementById('transfer-div').value, from=document.getElementById('transfer-from').value, to=document.getElementById('transfer-to').value, round=Number(document.getElementById('transfer-round').value)||1, date=document.getElementById('transfer-date').value, fee=parseMoneyValue(document.getElementById('transfer-fee').value), status=document.getElementById('transfer-status').value;
 if(!driver||!to||to==='Free Agent'){toast('Bitte ein Zielteam auswählen.');return}
 if(from===to){toast('Start- und Zielteam dürfen nicht identisch sein.');return}
 const target=teams.find(t=>t.name===to);if(!target){toast('Zielteam nicht gefunden.');return}
 const arr=div==='Div 1'?target.d1:target.d2;if(arr.length>=2){toast(`⚠️ ${to} ist in ${div} bereits voll besetzt.`);return}
 if(arr.some(n=>normDriver(n)===normDriver(driver))){toast('Der Fahrer ist bereits im Zielteam.');return}
 // Remove driver from all current team slots.
 teams.forEach(t=>{t.d1=t.d1.filter(n=>normDriver(n)!==normDriver(driver));t.d2=t.d2.filter(n=>normDriver(n)!==normDriver(driver));});
 if(div==='Div 1')target.d1.push(driver);else target.d2.push(driver);
 const meta=driverMeta[driver]||{};meta.team=to;meta.division=div;meta.status='Stammfahrer';driverMeta[driver]=meta;
 if(status==='Vollzogen'){
   contracts.filter(c=>normDriver(c.driver)===normDriver(driver)&&c.season===seasonState.current&&c.status!=='Beendet').forEach(c=>{c.status='Beendet';c.updatedAt=new Date().toISOString();});
 }
 const rec={id:crypto.randomUUID?crypto.randomUUID():'transfer-'+Date.now(),driver:normDriver(driver),season:seasonState.current||'02/26',division,fromTeam:from==='Free Agent'?'':from,toTeam:to,effectiveRound:round,effectiveDate:date,fee,status,note:document.getElementById('transfer-note').value.trim(),createdAt:new Date().toISOString()};
 transferRecords.push(rec);
 if(fee>0&&status==='Vollzogen'){
   financeAddTransaction({season:rec.season,team:to,driver:rec.driver,type:'transfer_fee',description:`Transfer/Ablöse für ${rec.driver}${from&&from!=='Free Agent'?` · von ${from}`:''}`,amount:-fee});
   if(from&&from!=='Free Agent') financeAddTransaction({season:rec.season,team:from,driver:rec.driver,type:'transfer_fee_income',description:`Transfer/Ablöse für ${rec.driver} · zu ${to}`,amount:fee});
 }
 save();closeModal();renderTeams();initDriverOverview();renderFinance();toast(`Transfer ${status==='Vollzogen'?'vollzogen':'vorgemerkt'}.`);
}

function contractStatusClass(status){return status==='Aktiv'?'active':status==='Beendet'?'ended':'draft'}
function contractOverlap(a,b){
 if(normDriver(a.driver)!==normDriver(b.driver)||a.season!==b.season||a.id===b.id)return false;
 // Normaler Fahrervertrag = gesamte Saison. Ein Fahrer kann pro Saison nur einen normalen Vertrag haben.
 return true;
}

function teamSlotState(teamName,season){
 const t=teams.find(x=>x.name===teamName); if(!t)return {d1:0,d2:0,contracts:0};
 const list=contracts.filter(c=>c.team===teamName&&c.season===season&&c.status!=='Beendet');
 return {d1:t.d1.filter(Boolean).length,d2:t.d2.filter(Boolean).length,contracts:list.length};
}
function openTeamContracts(teamName){
 const season=seasonState.current||'02/26', t=teams.find(x=>x.name===teamName), slots=teamSlotState(teamName,season);
 const list=contracts.filter(c=>c.team===teamName&&c.season===season).sort((a,b)=>String(a.division).localeCompare(String(b.division))||String(a.driver).localeCompare(String(b.driver),'de'));
 const cards=list.length?list.map(c=>`<div class="contract-mini-card ${contractStatusClass(c.status)}"><div><b>${esc(c.driver)}</b><span>${esc(c.division||'—')} · gesamte Saison</span></div><div><span>Gehalt</span><b>${esc(c.salary||c.value||'—')}</b></div><div><span>Laufzeit</span><b>Gesamte Saison ${esc(c.season)}</b></div><button class="mini-link" onclick="openContractEditor('${esc(c.driver)}','${esc(c.id)}')">Ansehen</button></div>`).join(''):'<div class="empty-race">Für dieses Team sind in der aktuellen Saison noch keine Verträge hinterlegt.</div>';
 document.getElementById('modal-content').innerHTML=`<div class="modal-head"><div><h2>📋 ${esc(teamName)} · Teamzentrale</h2><p class="race-edit-note">Saison <b>${esc(season)}</b> · Teamchef: <b>${esc(t?.chief||'ohne Teamchef')}</b></p></div><button onclick="closeModal()">×</button></div><div class="team-contract-overview"><div class="team-slot-summary"><span>DIV 1 <b>${slots.d1}/2</b></span><span>DIV 2 <b>${slots.d2}/2</b></span><span>VERTRÄGE <b>${slots.contracts}</b></span></div><div class="team-central-note">Ein Fahrerplatz und ein Vertrag sind getrennte Dinge: RaceHub zeigt deshalb beide Zustände an und verhindert keine gültige Historie durch bloße Slotbelegung.</div></div><div class="contract-team-list">${cards}</div><div class="modal-actions"><button class="ghost" onclick="openContractEditor('','')">➕ Vertrag hinzufügen</button><button class="primary" onclick="closeModal()">Fertig</button></div>`;openModal();
}
function openTeamEditor(teamName){
 if(!requireEditor())return; const t=teams.find(x=>x.name===teamName); if(!t)return;
 const opts=(selected)=>['',...drivers].filter((v,i,a)=>a.indexOf(v)===i).sort((a,b)=>a.localeCompare(b,'de')).map(n=>`<option value="${esc(n)}" ${n===selected?'selected':''}>${n||'— leer —'}</option>`).join('');
 document.getElementById('modal-content').innerHTML=`<div class="modal-head"><div><h2>✏️ ${esc(t.name)}</h2><p class="race-edit-note">Teamchef und Fahreraufstellung bearbeiten. Änderungen wirken sofort auf die aktuelle Saison.</p></div><button onclick="closeModal()">×</button></div><div class="team-edit-form"><label>Teamchef<select id="team-chief-edit"><option value="">— kein Teamchef —</option>${drivers.map(n=>`<option value="${esc(n)}" ${normDriver(t.chief||'')===normDriver(n)?'selected':''}>${esc(n)}</option>`).join('')}</select></label><h3>Division 1</h3><div class="slot-edit"><select id="t-d1-0">${opts(t.d1[0]||'')}</select><select id="t-d1-1">${opts(t.d1[1]||'')}</select></div><h3>Division 2</h3><div class="slot-edit"><select id="t-d2-0">${opts(t.d2[0]||'')}</select><select id="t-d2-1">${opts(t.d2[1]||'')}</select></div><p class="race-edit-note">Ein Fahrer kann nur einmal im selben Team stehen. Freie Slots bleiben leer.</p></div><div class="modal-actions"><button class="ghost" onclick="closeModal()">Abbrechen</button><button class="primary" onclick="saveTeamEditor('${esc(t.name)}')">✓ Team speichern</button></div>`;openModal();
}
function saveTeamEditor(teamName){
 if(!requireEditor())return; const t=teams.find(x=>x.name===teamName);if(!t)return;
 const d1=[document.getElementById('t-d1-0').value,document.getElementById('t-d1-1').value].filter(Boolean);const d2=[document.getElementById('t-d2-0').value,document.getElementById('t-d2-1').value].filter(Boolean);const all=[...d1,...d2];if(new Set(all.map(normDriver)).size!==all.length){toast('Ein Fahrer darf im Team nicht doppelt eingetragen werden.');return}
 // remove this team from all current slots first
 teams.forEach(x=>{x.d1=x.d1.filter(n=>!all.some(a=>normDriver(a)===normDriver(n))||x===t?true:true);x.d2=x.d2.filter(n=>!all.some(a=>normDriver(a)===normDriver(n))||x===t?true:true)});
 // Explicitly remove previous occupants from this team; selected drivers are then assigned below.
 teams.forEach(x=>{if(x!==t){x.d1=x.d1.filter(n=>!all.some(a=>normDriver(a)===normDriver(n)));x.d2=x.d2.filter(n=>!all.some(a=>normDriver(a)===normDriver(n)));}});
 const selectedChief=document.getElementById('team-chief-edit').value.trim();if(selectedChief)teams.forEach(x=>{if(x!==t&&normDriver(x.chief||'')===normDriver(selectedChief))x.chief='';});t.chief=selectedChief||'ohne Teamchef';t.d1=d1;t.d2=d2;syncTeamChiefRoles();
 drivers.forEach(n=>{const m=driverRecord(n);if(!m)driverMeta[n]={id:(crypto.randomUUID?crypto.randomUUID():'dog-'+Date.now()+'-'+Math.random()),division:currentDivision(n)==='—'?'Div 2':currentDivision(n),team:'',status:getStatus(n)};});
 const assigned=new Set([...t.d1,...t.d2].map(normDriver)); drivers.forEach(n=>{const m=driverMeta[n]||{};if(assigned.has(normDriver(n))){m.team=t.name;m.division=t.d1.some(x=>normDriver(x)===normDriver(n))?'Div 1':'Div 2';m.status='Stammfahrer';driverMeta[n]=m;}else if(m.team===t.name){m.team='';m.status='Free Agent';driverMeta[n]=m;}});
 save();closeModal();renderTeams();initDriverOverview();updateStats();toast(`${t.name} gespeichert.`);
}
function openDriverEditor(name){
 if(!requireEditor())return; const m=driverRecord(name)||{};const team=driverTeam(name);const div=currentDivision(name)==='—'?(m.division||'Div 2'):currentDivision(name);const opts=TEAM_CHOICES.map(t=>`<option value="${esc(t)}" ${t===team?'selected':''}>${t||'— kein Team / Free Agent —'}</option>`).join('');
 document.getElementById('modal-content').innerHTML=`<div class="modal-head"><div><h2>✏️ Fahrer bearbeiten</h2><p class="race-edit-note">Die interne Fahrer-ID bleibt erhalten. Name und aktuelle Zuordnung können geändert werden.</p></div><button onclick="closeModal()">×</button></div><div class="new-driver-form"><label>Fahrername<input id="edit-driver-name" value="${esc(normDriver(name))}"></label><label>Nationalität<select id="edit-driver-nationality">${nationalityOptions(m.nationality||'')}</select></label><label>Division<select id="edit-driver-div"><option ${div==='Div 1'?'selected':''}>Div 1</option><option ${div==='Div 2'?'selected':''}>Div 2</option></select></label><label>Status<select id="edit-driver-status" onchange="refreshEditDriverNumberOptions('${esc(name)}')"><option ${getStatus(name)==='Stammfahrer'?'selected':''}>Stammfahrer</option><option ${getStatus(name)==='Ersatzfahrer'?'selected':''}>Ersatzfahrer</option><option ${getStatus(name)==='Free Agent'?'selected':''}>Free Agent</option><option ${getStatus(name)==='Nicht verfügbar'?'selected':''}>Nicht verfügbar</option></select></label><label>Fahrernummer<select id="edit-driver-number">${driverNumberOptions(name,getStatus(name),driverNumber(name))}</select></label><label>Team<select id="edit-driver-team">${opts}</select></label><div class="driver-role-editor"><div class="role-title">Rolle im Team</div><label class="role-check"><input type="checkbox" checked disabled> Fahrer</label><label class="role-check"><input type="checkbox" id="edit-driver-role-chief" ${driverIsTeamChief(name)?'checked':''}> Teamchef</label><div class="role-hint">Ein Fahrer kann gleichzeitig Teamchef sein.</div></div></div><div class="modal-actions"><button class="ghost" onclick="closeModal()">Abbrechen</button><button class="danger" onclick="deleteDriverWithConfirmation('${esc(name)}')">🗑️ Fahrer löschen</button><button class="primary" onclick="saveDriverEditor('${esc(name)}')">✓ Fahrer speichern</button></div>`;openModal();
}

function deleteDriverWithConfirmation(name){
 if(!requireEditor())return;
 const canonical=normDriver(name);
 if(!drivers.some(n=>normDriver(n)===canonical))return;
 const first=confirm(`⚠️ Fahrer löschen?\n\n${canonical} wird vollständig aus der Fahrer-Datenbank entfernt. Zugehörige Verträge, Finanzbuchungen, Lizenzen, Leihen/Transfers und Rennresultate dieses Fahrers werden ebenfalls gelöscht.\n\nDieser Vorgang kann nicht rückgängig gemacht werden.`);
 if(!first)return;
 const second=prompt(`ZWEITE BESTÄTIGUNG\n\nBitte den Fahrernamen exakt eingeben, um die Löschung zu bestätigen:\n${canonical}`);
 if(second===null)return;
 if(normDriver(second)!==canonical){toast('Löschung abgebrochen: Fahrername stimmt nicht exakt überein.');return;}
 const really=confirm(`Letzte Bestätigung: Fahrer „${canonical}“ wirklich endgültig löschen?`);
 if(!really)return;
 const removedContracts=contracts.filter(c=>normDriver(c.driver)===canonical);
 const removedContractIds=new Set(removedContracts.map(c=>String(c.id)));
 drivers=drivers.filter(n=>normDriver(n)!==canonical);
 delete driverMeta[name]; delete driverMeta[canonical];
 Object.keys(driverMeta).forEach(k=>{if(normDriver(k)===canonical)delete driverMeta[k]});
 teams.forEach(t=>{
   t.d1=t.d1.filter(n=>normDriver(n)!==canonical);
   t.d2=t.d2.filter(n=>normDriver(n)!==canonical);
   if(normDriver(t.chief||'')===canonical)t.chief='';
 });
 Object.values(races).forEach(r=>{
   r.results=(r.results||[]).filter(x=>normDriver(x.name)!==canonical);
   Object.keys(r.highlights||{}).forEach(k=>{if(normDriver(r.highlights[k])===canonical)delete r.highlights[k]});
 });
 contracts=contracts.filter(c=>normDriver(c.driver)!==canonical);
 transferRecords=transferRecords.filter(x=>normDriver(x.driver)!==canonical);
 loanAgreements=loanAgreements.filter(x=>normDriver(x.driver)!==canonical);
 financeTransactions=financeTransactions.filter(x=>normDriver(x.driver)!==canonical);
 Object.keys(sponsorPayments).forEach(k=>{const v=sponsorPayments[k];if(normDriver(v?.driver||'')===canonical||removedContractIds.has(String(v?.contractId)))delete sponsorPayments[k]});
 Object.keys(driverFinanceOpeningBalances).forEach(season=>{if(driverFinanceOpeningBalances[season])delete driverFinanceOpeningBalances[season][canonical]});
 Object.keys(driverFinanceOpeningDates).forEach(season=>{if(driverFinanceOpeningDates[season])delete driverFinanceOpeningDates[season][canonical]});
 Object.keys(driverLicenses).forEach(season=>{if(driverLicenses[season])delete driverLicenses[season][canonical]});
 save(); closeModal(); renderTeams(); initDriverOverview(); renderWM(); renderKWM(); renderDashboard(); renderFinance(); updateStats();
 toast(`Fahrer ${canonical} wurde vollständig gelöscht.`);
}

function saveDriverEditor(oldName){
 if(!requireEditor())return;const newName=document.getElementById('edit-driver-name').value.trim();const nationality=document.getElementById('edit-driver-nationality')?.value||'';const div=document.getElementById('edit-driver-div').value;const status=document.getElementById('edit-driver-status').value;const team=document.getElementById('edit-driver-team').value;const number=Number(document.getElementById('edit-driver-number')?.value)||0;if(!newName){toast('Bitte einen Fahrernamen eingeben.');return}if(newName!==oldName&&drivers.some(n=>normDriver(n).toLowerCase()===normDriver(newName).toLowerCase())){toast('Diesen Fahrernamen gibt es bereits.');return}
 const wantsChief=!!document.getElementById('edit-driver-role-chief')?.checked;const idx=drivers.indexOf(oldName);if(idx<0)return;const ns=number?driverNumberState(number,newName,status):{state:'free'};if(number&&(ns.state==='blocked'||ns.state==='taken-stamm'||(ns.state==='taken-ersatz'&&status!=='Stammfahrer'))){toast(`Fahrernummer #${number} ist nicht verfügbar.`);return;}drivers[idx]=newName;teams.forEach(t=>{if(normDriver(t.chief||'')===normDriver(oldName))t.chief=newName;});const meta=driverMeta[oldName]||{id:(crypto.randomUUID?crypto.randomUUID():'dog-'+Date.now()),createdAt:new Date().toISOString()};delete driverMeta[oldName];meta.division=div;meta.status=status;meta.team=team;meta.number=number;meta.nationality=nationality;
 if(number&&status==='Stammfahrer'){drivers.forEach(other=>{if(normDriver(other)!==normDriver(newName)&&driverNumber(other)===number&&getStatus(other)==='Ersatzfahrer'){driverMeta[other].number=0}})}
driverMeta[newName]=meta;
 if(wantsChief){const chiefTeam=teams.find(t=>t.name===team);teams.forEach(t=>{if(t!==chiefTeam&&normDriver(t.chief||'')===normDriver(newName))t.chief='';});if(chiefTeam)chiefTeam.chief=newName;}else teams.forEach(t=>{if(normDriver(t.chief||'')===normDriver(newName))t.chief='';});meta.isTeamChief=wantsChief;syncTeamChiefRoles();
 teams.forEach(t=>{t.d1=t.d1.map(n=>normDriver(n)===normDriver(oldName)?newName:n);t.d2=t.d2.map(n=>normDriver(n)===normDriver(oldName)?newName:n);if(t.name!==team){t.d1=t.d1.filter(n=>normDriver(n)!==normDriver(newName));t.d2=t.d2.filter(n=>normDriver(n)!==normDriver(newName));}});
 if(status==='Stammfahrer'&&team){const t=teams.find(x=>x.name===team);if(t){const arr=div==='Div 1'?t.d1:t.d2;if(!arr.some(n=>normDriver(n)===normDriver(newName))){if(arr.length<2)arr.push(newName);else{meta.status='Free Agent';meta.team='';}}}} else {teams.forEach(t=>{t.d1=t.d1.filter(n=>normDriver(n)!==normDriver(newName));t.d2=t.d2.filter(n=>normDriver(n)!==normDriver(newName));});meta.team='';}
 // update race references to preserve historical driver identity under the renamed display name
 Object.values(races).forEach(r=>r.results.forEach(x=>{if(normDriver(x.name)===normDriver(oldName))x.name=newName}));Object.values(races).forEach(r=>Object.keys(r.highlights||{}).forEach(k=>{if(normDriver(r.highlights[k])===normDriver(oldName))r.highlights[k]=newName}));
 save();closeModal();renderTeams();initDriverOverview();renderWM();renderKWM();renderDashboard();toast('Fahrer gespeichert.');
}

function refreshNewDriverNumberOptions(){const s=document.getElementById('new-driver-status'),el=document.getElementById('new-driver-number');if(s&&el){const current=Number(el.value)||0;el.innerHTML=driverNumberOptions('',s.value,current);if([...el.options].some(o=>Number(o.value)===current&&!o.disabled))el.value=current;else el.value='0';}}
function refreshEditDriverNumberOptions(name){const s=document.getElementById('edit-driver-status'),el=document.getElementById('edit-driver-number');if(s&&el){const current=Number(el.value)||0;el.innerHTML=driverNumberOptions(name,s.value,current);if([...el.options].some(o=>Number(o.value)===current&&!o.disabled))el.value=current;else el.value='0';}}
function slot(n){if(!n)return `<div class="driver-slot">—</div>`;const st=getStatus(n);const cls=st==='Free Agent'?' free':st==='Nicht verfügbar'?' unavailable':'';return `<div class="driver-slot${cls}"><span>${esc(n)}</span></div>`}
function raceList(){return Object.values(races).sort((a,b)=>b.number-a.number||a.division.localeCompare(b.division,'de'))}
function seasonRaceList(season=seasonState.current||'02/26'){return raceList().filter(r=>seasonOfRace(r)===season)}
function seasonOptions(id,selected){const el=document.getElementById(id);if(!el)return;const seasons=Object.values(SEASON_META.seasons).sort((a,b)=>String(b.label).localeCompare(String(a.label),'de'));el.innerHTML=seasons.map(x=>`<option value="${esc(x.label)}" ${x.label===selected?'selected':''}>${esc(x.label)}${x.status==='test'?' · Test':''}</option>`).join('');}
function initSeasonSelectors(){seasonOptions('wm-season',seasonState.current||'02/26');seasonOptions('kwm-season',seasonState.current||'02/26');}
function initRaceSelectors(){
 const seasonEl=document.getElementById('race-season');
 const divEl=document.getElementById('race-div');
 const sel=document.getElementById('race-track');
 if(!seasonEl||!divEl||!sel)return;
 const currentSeason=seasonState.current||'02/26';
 const seasons=Object.values(SEASON_META.seasons).sort((a,b)=>String(b.label).localeCompare(String(a.label),'de'));
 const previous=seasonEl.value||currentSeason;
 seasonEl.innerHTML=seasons.map(x=>`<option value="${esc(x.label)}" ${x.label===previous?'selected':''}>${esc(x.label)}${x.status==='test'?' · Test':''}</option>`).join('');
 if(!seasons.some(x=>x.label===previous))seasonEl.value=currentSeason;
 const season=seasonEl.value||currentSeason;
 const div=divEl.value;
 const tracks=[...new Set([...ACTIVE_TRACKS,...Object.values(races).map(r=>r.track).filter(Boolean)])]
   .filter(t=>Object.values(races).some(r=>seasonOfRace(r)===season&&r.division===div&&r.track===t) || Object.values(races).some(r=>seasonOfRace(r)===season&&r.track===t))
   .sort((a,b)=>(TRACK_NUMBERS[b]||0)-(TRACK_NUMBERS[a]||0)||a.localeCompare(b,'de'));
 sel.innerHTML=tracks.map(x=>`<option value="${esc(x)}">Rennen ${TRACK_NUMBERS[x]||'—'} · ${esc(x)}</option>`).join('');
 const existing=raceList().find(r=>seasonOfRace(r)===season&&r.division===div);
 sel.value=existing?.track||tracks[0]||'';
 renderSelectedRace();
}
function updateRaceSelectors(){initRaceSelectors()}
function renderSelectedRace(){
 const div=document.getElementById('race-div').value,track=document.getElementById('race-track').value,season=document.getElementById('race-season')?.value||seasonState.current||'02/26';
 const r=Object.values(races).find(x=>seasonOfRace(x)===season&&x.division===div&&x.track===track);
 if(r){document.getElementById('race-editor').innerHTML=raceCard(r);return;}
 const other=Object.values(races).find(x=>seasonOfRace(x)===season&&x.track===track);
 document.getElementById('race-editor').innerHTML=`<div class="empty-race"><h3>🏁 ${esc(track||'Strecke')}</h3><p>Für <b>${esc(season)}</b> · <b>${esc(div)}</b> gibt es dieses Rennen noch nicht.</p>${isEditor()?`<button class="primary" onclick="createMissingDivisionRace('${esc(track)}','${esc(div)}','${esc(season)}',${Number(other?.number||TRACK_NUMBERS[track]||1)})">➕ Rennen für ${esc(div)} anlegen</button>`:''}</div>`;
}
function openAddRace(){if(!requireEditor())return;const seasons=Object.keys(SEASON_META.seasons).sort().reverse();const defaultSeason=seasonState.current||'02/26';const maxNo=Math.max(0,...Object.values(races).filter(r=>(r.season||'02/26')===defaultSeason).map(r=>Number(r.number)||0))+1;document.getElementById('modal-content').innerHTML=`<div class="modal-head"><div><h2>🏁 Rennen hinzufügen</h2><p class="race-edit-note">Neues Rennen anlegen. Die Ergebnisse können danach direkt per OCR aus deinen Rennbildern erfasst werden.</p></div><button onclick="closeModal()">×</button></div><div class="new-driver-form"><label>Saison<select id="new-race-season">${seasons.map(x=>`<option value="${esc(x)}" ${x===defaultSeason?'selected':''}>${esc(x)}</option>`).join('')}</select></label><label>Division<select id="new-race-div"><option>Div 1</option><option>Div 2</option></select></label><label>Rennnummer<input id="new-race-number" type="number" min="1" max="99" value="${maxNo}"></label><label>Renn-Datum<input id="new-race-date" type="date"></label><label>Strecke<input id="new-race-track" value="" placeholder="z. B. Imola" autofocus></label></div><div class="modal-actions"><button class="ghost" onclick="closeModal()">Abbrechen</button><button class="primary" onclick="saveNewRace()">✓ Rennen anlegen</button></div>`;openModal()}
function openRaceMetaEditor(id){
 if(!requireEditor())return; const r=races[id]; if(!r)return;
 const seasons=Object.values(SEASON_META.seasons).sort((a,b)=>String(b.label).localeCompare(String(a.label),'de'));
 document.getElementById('modal-content').innerHTML=`<div class="modal-head"><div><h2>⚙️ Rennen bearbeiten</h2><p class="race-edit-note">Saison, Division, Rennnummer und Strecke können geändert werden. Historische Ergebnisdaten bleiben erhalten.</p></div><button onclick="closeModal()">×</button></div><div class="new-driver-form"><label>Saison<select id="edit-race-season">${seasons.map(x=>`<option value="${esc(x.label)}" ${x.label===seasonOfRace(r)?'selected':''}>${esc(x.label)}${x.status==='test'?' · Test':''}</option>`).join('')}</select></label><label>Division<select id="edit-race-div"><option ${r.division==='Div 1'?'selected':''}>Div 1</option><option ${r.division==='Div 2'?'selected':''}>Div 2</option></select></label><label>Rennnummer<input id="edit-race-number" type="number" min=1 max=99 value="${Number(r.number)||1}"></label><label>Strecke<input id="edit-race-track" value="${esc(r.track)}"></label><label>Renn-Datum<input id="edit-race-date" type="date" value="${esc(r.raceDate||'')}"></label></div><div class="modal-actions"><button class="ghost" onclick="closeModal()">Abbrechen</button><button class="primary" onclick="saveRaceMeta('${r.id}')">✓ Rennen speichern</button></div>`;openModal();
}
function saveRaceMeta(id){
 if(!requireEditor())return; const r=races[id];if(!r)return;
 const season=document.getElementById('edit-race-season').value,division=document.getElementById('edit-race-div').value,number=Number(document.getElementById('edit-race-number').value)||0,track=document.getElementById('edit-race-track').value.trim(),raceDate=document.getElementById('edit-race-date')?.value||'';
 if(!track||!number){toast('Bitte Strecke und Rennnummer angeben.');return}
 const duplicate=Object.values(races).some(x=>x.id!==id&&seasonOfRace(x)===season&&x.division===division&&x.track.toLowerCase()===track.toLowerCase());
 if(duplicate){toast('Dieses Rennen existiert für Saison, Division und Strecke bereits.');return}
 const old=`${r.division} · Rennen ${r.number} · ${r.track}`;r.season=season;r.division=division;r.number=number;r.track=track;r.raceDate=raceDate;r.ruleVersion=r.ruleVersion||SEASON_META.seasons[season]?.rules||'DoG RaceHub';TRACK_NUMBERS[track]=number;if(!ACTIVE_TRACKS.includes(track))ACTIVE_TRACKS.push(track);saveRaceAndRecalculate(id,'Rennen bearbeitet',`${old} → ${division} · Rennen ${number} · ${track}`);closeModal();document.getElementById('race-season').value=season;document.getElementById('race-div').value=division;initRaceSelectors();document.getElementById('race-track').value=track;renderSelectedRace();toast('Rennstammdaten gespeichert.');
}
function createMissingDivisionRace(track,division,season,number){
 if(!requireEditor())return;if(!track){toast('Keine Strecke ausgewählt.');return}
 const exists=Object.values(races).find(x=>seasonOfRace(x)===season&&x.division===division&&String(x.track).toLowerCase()===String(track).toLowerCase());
 if(exists){document.getElementById('race-div').value=division;initRaceSelectors();document.getElementById('race-track').value=exists.track;renderSelectedRace();return}
 const other=Object.values(races).find(x=>seasonOfRace(x)===season&&String(x.track).toLowerCase()===String(track).toLowerCase());
 const id='race_'+Date.now();
 races[id]={id,season,division,track,number:Number(number)||1,raceDate:other?.raceDate||'',ruleVersion:SEASON_META.seasons[season]?.rules||'DoG RaceHub',highlights:{},screens:[],results:[],createdAt:new Date().toISOString(),changeLog:[],ocr:null,state:null};
 TRACK_NUMBERS[track]=Number(number)||1;if(!ACTIVE_TRACKS.includes(track))ACTIVE_TRACKS.push(track);
 saveRaceAndRecalculate(id,'Rennen angelegt',`Rennen ${number} · ${track} · ${division}`);document.getElementById('race-div').value=division;initRaceSelectors();document.getElementById('race-track').value=track;renderSelectedRace();toast(`${track} · ${division} angelegt. Jetzt kannst du die Ergebnisse per OCR hinzufügen.`);
}

function saveNewRace(){if(!requireEditor())return;const season=document.getElementById('new-race-season').value,division=document.getElementById('new-race-div').value,number=Number(document.getElementById('new-race-number').value)||0,track=document.getElementById('new-race-track').value.trim(),raceDate=document.getElementById('new-race-date')?.value||'';if(!track){toast('Bitte eine Strecke eingeben.');return}if(!number){toast('Bitte eine Rennnummer eingeben.');return}const duplicate=Object.values(races).some(r=>(r.season||'02/26')===season&&r.division===division&&r.track.toLowerCase()===track.toLowerCase());if(duplicate){toast('Dieses Rennen existiert für Saison und Division bereits.');return}const id='race_'+Date.now();races[id]={id,season,division,track,number,ruleVersion:SEASON_META.seasons[season]?.rules||'DoG RaceHub',highlights:{},screens:[],results:[],createdAt:new Date().toISOString(),changeLog:[],ocr:null,state:null};TRACK_NUMBERS[track]=number;if(!ACTIVE_TRACKS.includes(track))ACTIVE_TRACKS.push(track);saveRaceAndRecalculate(id,'Rennen angelegt',`Neues Rennen ${number} · ${track} · ${division}`);closeModal();document.getElementById('race-div').value=division;initRaceSelectors();document.getElementById('race-track').value=track;renderSelectedRace();updateStats();toast(`Rennen ${number} · ${track} angelegt.`)}

function penaltyCell(x){
  if(!x.penaltyNote && !x.penaltyImage) return '—';
  const text=x.penaltyNote?esc(x.penaltyNote):'';
  const img=x.penaltyImage?`<button class="mini-link" onclick="viewImage('${x.penaltyImage}')">📷 Bild</button>`:'';
  return `${text}${text&&img?' · ':''}${img}`;
}
function raceCard(r){const editable=isEditor();const h=r.highlights||{};return `<div class="race-card"><div class="race-title"><div><div class="eyebrow">${esc(r.division)} · RENNEN ${r.number}${r.raceDate?` · ${esc(new Date(r.raceDate+'T12:00:00').toLocaleDateString('de-DE'))}`:''}</div><h3>${esc(r.track)}</h3><div class="race-edit-note">Regelstand: ${esc(r.ruleVersion)} · DoG-Punkte 25 / 21 / 18 / 15 / 13 / 11 / 9 / 8 / 7 / 6 / 5 / 4 / 3 / 2 / 1</div>${r.state?`<div class="race-dataflow">✓ Gespeichert · ${r.state.resultCount||r.results.length} Ergebnisse · WM/KWM/Fahrerwerte synchronisiert · Regelstand fixiert</div>`:''}</div><div class="race-tools">${editable?`<button class="ghost" onclick="openRaceMetaEditor('${r.id}')">⚙️ Rennen bearbeiten</button><button class="primary" onclick="openRaceEdit('${r.id}')">✏️ Ergebnis bearbeiten</button>`:'<span class="race-edit-note">🔒 Bearbeitung gesperrt</span>'}</div></div><div class="race-table"><div class="race-row head"><span>POS.</span><span>FAHRER</span><span>TEAM</span><span>START</span><span>PUNKTE</span><span>ZEIT</span><span>ZEITSTRAFE</span><span>NACHTRÄGLICHE STRAFE</span></div>${r.results.map((x,i)=>{const st=statusOfResult(x);return `<div class="race-row ${st!=='RESULT'?'special':''}"><span class="pos">${i+1}</span><span>${esc(normDriver(x.name))}</span><span>${esc(x.team)}</span><span>G${x.grid}</span><span><b>${pointsForPosition(i+1,st)}</b></span><span class="${st==='DNF'||st==='DSQ'?'dnf':''}">${esc(x.time)}</span><span class="${x.penSec?'pen':''}">${x.penSec?`+${x.penSec} Sek. · ${x.tl||0} TL`:'—'}</span><span class="${x.penaltyNote||x.penaltyImage?'pen':''}">${penaltyCell(x)}</span></div>`}).join('')}</div><div class="upload"><b>📷 Renn-Screenshots</b><div class="muted">Die Bilder bleiben am Rennen gespeichert und können später als Beleg geöffnet werden.</div>${editable?`<input type="file" accept="image/*" multiple onchange="attachScreens(this,'${r.id}')"><button class="ghost ocr-btn" onclick="document.getElementById('ocr-input-${r.id}').click()">🔎 Rennergebnis per OCR</button><input id="ocr-input-${r.id}" data-race-id="${r.id}" type="file" accept="image/*" multiple hidden onchange="startRaceOCR(this)">`:''}<div class="screens">${(r.screens||[]).map(s=>`<img src="${String(s).startsWith('data:')?s:RACE_DIR+s}" onclick="viewImage(this.src)">`).join('')}</div></div><div class="race-highlights"><span>🏆 Sieger <b>${esc(normDriver(h.winner||''))||'—'}</b></span><span>⚡ Schnellste Runde <b>${esc(normDriver(h.fastest||''))||'—'}</b></span><span>⭐ FdT <b>${esc(normDriver(h.dotd||''))||'—'}</b></span><span>🔄 Überholmanöver <b>${esc(normDriver(h.overtakes||''))||'—'}</b></span><span>🧼 Sauberster <b>${esc(normDriver(h.cleanest||''))||'—'}</b></span></div>${editable?`<div class="highlight-tools"><button class="ghost" onclick="openHighlightEditor('${r.id}')">⭐ Highlights bearbeiten</button><button class="ghost" onclick="document.getElementById('highlight-input-${r.id}').click()">📷 Highlight-Screenshot OCR</button><input id="highlight-input-${r.id}" type="file" accept="image/*" multiple hidden onchange="startHighlightOCR(this,'${r.id}')"></div>`:''}</div>`}
function highlightDriverOptions(selected=''){return [''].concat(drivers.slice().sort((a,b)=>normDriver(a).localeCompare(normDriver(b),'de'))).map(n=>`<option value="${esc(n)}" ${normDriver(n)===normDriver(selected)?'selected':''}>${n?esc(normDriver(n)):'— nicht gesetzt —'}</option>`).join('')}
function openHighlightEditor(id,prefill={}){if(!requireEditor())return;const r=races[id];if(!r)return;const h={...(r.highlights||{}),...prefill};document.getElementById('modal-content').innerHTML=`<div class="modal-head"><div><h2>⭐ Renn-Highlights</h2><p class="race-edit-note">Die fünf Highlight-Werte werden direkt am Rennen gespeichert. Die Auswahl kann jederzeit korrigiert werden.</p></div><button onclick="closeModal()">×</button></div><div class="highlight-edit-grid"><label>🏆 Sieger<select id="hl-winner">${highlightDriverOptions(h.winner)}</select></label><label>⚡ Schnellste Runde<select id="hl-fastest">${highlightDriverOptions(h.fastest)}</select></label><label>⭐ Fahrer des Tages<select id="hl-dotd">${highlightDriverOptions(h.dotd)}</select></label><label>🔄 Meiste Überholmanöver<select id="hl-overtakes">${highlightDriverOptions(h.overtakes)}</select></label><label>🧼 Sauberster Fahrer<select id="hl-cleanest">${highlightDriverOptions(h.cleanest)}</select></label></div><div class="modal-actions"><button class="ghost" onclick="closeModal()">Abbrechen</button><button class="primary" onclick="saveHighlights('${id}')">✓ Highlights speichern</button></div>`;openModal()}
function saveHighlights(id){if(!requireEditor())return;const r=races[id];if(!r)return;r.highlights={winner:document.getElementById('hl-winner').value,fastest:document.getElementById('hl-fastest').value,dotd:document.getElementById('hl-dotd').value,overtakes:document.getElementById('hl-overtakes').value,cleanest:document.getElementById('hl-cleanest').value};saveRaceAndRecalculate(id,'Highlights geändert','Renn-Highlights aktualisiert');closeModal();renderSelectedRace();renderDashboard();initDriverOverview();toast('Highlights gespeichert.');}
function highlightCandidateFromText(text){const t=String(text||'');const names=drivers.map(n=>({name:n,score:fuzzySimilarity(t,normDriver(n))})).sort((a,b)=>b.score-a.score);const lines=t.split(/\\n+/).map(x=>x.trim()).filter(Boolean);let best=null;for(const line of lines){for(const n of drivers){const score=fuzzySimilarity(line,normDriver(n));if(!best||score>best.score)best={name:n,score,line}}}return best&&best.score>=.55?best:null}
async function startHighlightOCR(input,id){if(!requireEditor()){input.value='';return}const files=[...input.files||[]];if(!files.length)return;if(typeof Tesseract==='undefined'){toast('OCR-Bibliothek konnte nicht geladen werden.');input.value='';return}const r=races[id];if(!r){input.value='';return}document.getElementById('modal-content').innerHTML=`<div class="modal-head"><div><h2>🔎 Highlight-Screenshot analysieren</h2><p class="race-edit-note">Der Screenshot wird nach bekannten Fahrern durchsucht. Vorschläge werden vor dem Speichern geprüft.</p></div><button onclick="closeModal()">×</button></div><div id="hl-ocr-progress" class="ocr-progress">OCR wird vorbereitet …</div><div id="hl-ocr-result"></div>`;openModal();try{const worker=await Tesseract.createWorker('eng');await worker.setParameters({tessedit_pageseg_mode:'6',preserve_interword_spaces:'1'});let raw='';for(let i=0;i<files.length;i++){document.getElementById('hl-ocr-progress').textContent=`Bild ${i+1}/${files.length}: Highlights werden gelesen …`;const canvas=await ocrPreprocess(files[i],'full');const res=await worker.recognize(canvas);raw+='\\n'+(res.data?.text||'')}await worker.terminate();const cand=highlightCandidateFromText(raw);const guess=cand?.name||'';document.getElementById('hl-ocr-result').innerHTML=`<div class="highlight-ocr-card"><b>${guess?'🟡 Fahrer erkannt':'⚠ Keine eindeutige Fahrerzuordnung'}</b><p>${guess?`Bester Treffer: <strong>${esc(normDriver(guess))}</strong> (${Math.round(cand.score*100)}%). Bitte ordne ihn unten der richtigen Highlight-Kategorie zu.`:'Bitte ordne die Highlights manuell zu. Der Rohtext kann zur Kontrolle geöffnet werden.'}</p></div><details class="ocr-raw"><summary>OCR-Rohtext anzeigen</summary><pre>${esc(raw)}</pre></details><div class="modal-actions"><button class="ghost" onclick="closeModal()">Abbrechen</button><button class="primary" onclick="closeModal();openHighlightEditor('${id}',${JSON.stringify({}).replace(/</g,'\\u003c')})">Highlights auswählen</button></div>`}catch(e){document.getElementById('hl-ocr-result').innerHTML=`<div class="ocr-error">${esc(e?.message||e)}</div>`}input.value=''}
function attachScreens(input,id){if(!isEditor()){input.value='';return}const files=[...input.files];if(!files.length)return;races[id].screens=races[id].screens||[];files.forEach(f=>{const rd=new FileReader();rd.onload=()=>{races[id].screens.push(rd.result);save();renderSelectedRace()};rd.readAsDataURL(f)});toast('Screenshot hinzugefügt.')}
function viewImage(src){document.getElementById('modal-content').innerHTML=`<div class="modal-head"><h2>Rennbild</h2><button onclick="closeModal()">×</button></div><img class="full-image" src="${src}">`;openModal()}
function openRaceEdit(id){if(!requireEditor())return;const r=races[id];document.getElementById('modal-content').innerHTML=`<div class="modal-head"><div><h2>${esc(r.track)} · Rennen ${r.number}</h2><p class="race-edit-note">Ergebnisdaten und normale Zeitstrafen können korrigiert werden. Nachträgliche Steward-Strafen werden direkt beim jeweiligen Fahrer im Rennergebnis hinterlegt – entweder als Text oder als Bild. Sie sind keine zusätzlichen Rennpunkte.</p></div><button onclick="closeModal()">×</button></div><div id="edit-rows">${r.results.map((x,i)=>editRow(x,i,r.id)).join('')}</div><div class="modal-actions"><button class="ghost" onclick="closeModal()">Abbrechen</button><button class="primary" onclick="saveRaceEdit('${r.id}')">Änderungen speichern</button></div>`;openModal()}
function editRow(x,i,raceId){return `<div class="edit-grid" data-i="${i}"><label>Pos.<input class="e-pos" type="number" min="1" max="99" value="${i+1}"></label><label>Fahrer<select class="e-name">${contractDriverOptions(normDriver(x.name))}</select></label><label>Team<select class="e-team"><option value="">— Team —</option>${TEAM_CHOICES.filter(Boolean).map(t=>`<option value="${esc(t)}" ${canonicalTeamName(t)===canonicalTeamName(x.team||'')?'selected':''}>${esc(t)}</option>`).join('')}</select></label><label>Startposition<input class="e-grid" type="number" min="1" max="99" value="${x.grid}"></label><label>Zeit<input class="e-time" value="${esc(x.time)}"></label><label>Zeitstrafe (Sek.)<input class="e-pen" type="number" min="0" value="${x.penSec||0}"></label><label>TL<input class="e-tl" type="number" min="0" value="${x.tl||0}"></label><label>Nachträgliche Strafe<input class="e-penalty-note" value="${esc(x.penaltyNote||'')}" placeholder="z. B. 5 Sek. Zeitstrafe / Verwarnung"></label><label>Strafenbild<input class="e-penalty-image" type="file" accept="image/*" onchange="attachPenaltyImage(this,'${raceId}',${i})"></label><label>Status<select class="e-status"><option value="RESULT" ${x.status==='RESULT'?'selected':''}>Ergebnis</option><option value="DNF" ${x.status==='DNF'?'selected':''}>DNF</option><option value="DSQ" ${x.status==='DSQ'?'selected':''}>DSQ</option></select></label></div>`}
function saveRaceEdit(id){if(!requireEditor())return;const rows=[...document.querySelectorAll('#edit-rows .edit-grid')];const old=races[id].results;const oldImages={};old.forEach(x=>{if(x.penaltyImage)oldImages[normDriver(x.name)]=x.penaltyImage});const data=rows.map((row,idx)=>{const name=row.querySelector('.e-name').value.trim();return{pos:Number(row.querySelector('.e-pos').value)||99,name,team:row.querySelector('.e-team').value.trim(),grid:Number(row.querySelector('.e-grid').value)||0,time:row.querySelector('.e-time').value.trim(),penSec:Number(row.querySelector('.e-pen').value)||0,tl:Number(row.querySelector('.e-tl').value)||0,penaltyNote:row.querySelector('.e-penalty-note').value.trim(),penaltyImage:oldImages[normDriver(name)]||'',status:row.querySelector('.e-status').value}}).sort((a,b)=>a.pos-b.pos);races[id].results=data;saveRaceAndRecalculate(id,'Ergebnis geändert',`Rennresultat in ${races[id].track} bearbeitet`);closeModal();renderSelectedRace();renderWM();renderKWM();renderDashboard();initDriverOverview();toast('Rennen aktualisiert · WM/KWM/Fahrerwerte neu berechnet.') }
function attachPenaltyImage(input,id,index){if(!isEditor()){input.value='';return}const file=input.files?.[0];if(!file)return;const r=races[id];const driver=r.results[index]?.name;if(!driver)return;const rd=new FileReader();rd.onload=()=>{const target=r.results.find(x=>normDriver(x.name)===normDriver(driver));if(target){target.penaltyImage=rd.result;save();renderSelectedRace();toast('Strafenbild gespeichert.')}};rd.readAsDataURL(file)}
function currentDivision(name){const roster=currentRosterEntry(name);if(roster?.division)return roster.division;const m=driverRecord(name);if(m?.division)return m.division;return'—'}
function averageTeamFactor(name){const team=driverTeam(name);return team?teamFactors[teamKey(team)]||0:0}
function calcDriverFromRaces(name, raceSubset){
 const rs=raceSubset.flatMap(r=>r.results.map((x,i)=>({x,i,r})).filter(o=>normDriver(o.x.name)===normDriver(name)));
 if(!rs.length)return{ova:40,ren:40,per:40,tem:40,amk:40,erf:40,mw:25000000};
 const valid=rs.filter(o=>statusOfResult(o.x)==='RESULT');
 const D=rs.length;
 const teamFactorAvg=rs.reduce((sum,o)=>sum+(teamFactors[teamKey(o.x.team)]||0),0)/D;
 const finishValue=pos=>pos===1?100:pos<=3?92:pos<=6?86:pos<=10?80:pos<=15?72:pos<=19?66:58;
 const renBase=rs.reduce((sum,o)=>sum+finishValue(o.i+1),0)/D;
 const ren=Math.max(40,Math.min(100,Math.round(Math.round(renBase)+teamFactorAvg)));
 const gained=valid.reduce((sum,o)=>sum+Math.max(0,Number(o.x.grid||0)-(o.i+1)),0);
 const lost=valid.reduce((sum,o)=>sum+Math.max(0,(o.i+1)-Number(o.x.grid||0)),0);
 const fdT=raceSubset.filter(r=>normDriver(r.highlights?.dotd||'')===normDriver(name)).length;
 const overtakes=raceSubset.filter(r=>normDriver(r.highlights?.overtakes||'')===normDriver(name)).length;
 let per;
 const posNet=gained-lost;
 // 0 positions gained/lost is a neutral result, not a fixed 70-ish rating.
 // The base remains solid and can still move with Driver-of-the-Day,
 // overtakes and the team's performance factor.
 const neutralBase=80;
 per=Math.max(40,Math.min(100,Math.round(Math.round(
   neutralBase+((gained/D)*11)-((lost/D)*7)+((fdT/D)*5)+((overtakes/D)*4)
 )+teamFactorAvg)));
 if(posNet===0) per=Math.max(40,Math.min(100,Math.round(neutralBase+(fdT/D)*5+(overtakes/D)*4+teamFactorAvg)));
 const qualValue=grid=>grid===1?100:grid<=3?92:grid<=6?86:grid<=10?80:grid<=15?72:grid<=19?66:58;
 const temBase=rs.reduce((sum,o)=>sum+qualValue(Number(o.x.grid||22)),0)/D;
 const tem=Math.max(40,Math.min(100,Math.round(Math.round(temBase)+teamFactorAvg)));
 const dnfs=rs.filter(o=>statusOfResult(o.x)==='DNF').length;
 const dsqs=rs.filter(o=>statusOfResult(o.x)==='DSQ').length;
 const tl=rs.reduce((sum,o)=>sum+(Number(o.x.tl)||0),0);
 const amk=Math.max(40,Math.min(100,Math.round(100-dnfs*20-dsqs*10-tl*4)));
 const totalLeagueRaces=new Set(raceSubset.map(r=>`${r.track||''}|${r.number||r.round||''}`)).size;
 const erf=Math.min(100,Math.round(40+((D/Math.max(1,totalLeagueRaces))*60)));
 const ova=Math.max(40,Math.min(100,Math.round((tem*.2)+(per*.3)+(ren*.3)+(amk*.1)+(erf*.1))));
 const mw=Math.max(25000000,Math.min(120000000,Math.round(((25000000+(((ova*.85)+(erf*.1)+(amk*.05)-40)/60)*95000000)*(currentDivision(name)==='Div 2'?0.5:1))/500000)*500000));
 return{ova,ren,per,tem,amk,erf,mw};
}
function raceRoundKey(r){return `${r.number||r.round||0}|${r.track||''}|${r.division||''}`}
function raceChronological(){return Object.values(races).sort((a,b)=>(a.number||a.round||0)-(b.number||b.round||0)||String(a.division).localeCompare(String(b.division),'de'))}
function rebuildDriverIndex(){
 const found=new Set(drivers.map(n=>normDriver(n)));
 raceChronological().forEach(r=>r.results.forEach(x=>{const n=normDriver(x.name||'').trim();if(!n)return;if(!found.has(n)){drivers.push(n);found.add(n)}if(!driverMeta[n])driverMeta[n]={id:(crypto.randomUUID?crypto.randomUUID():'dog-'+Date.now()+'-'+Math.random().toString(16).slice(2)),division:r.division,team:x.team||'',status:'Free Agent',createdAt:new Date().toISOString()};}));
}
function financeTxKey(t){
 if(!t)return '';
 if(t.contractId&&t.type)return `contract:${t.contractId}:${t.type}`;
 if(t.loanId&&t.type)return `loan:${t.loanId}:${t.type}`;
 if(t.raceId&&t.driver&&t.type)return `race:${t.raceId}:${normDriver(t.driver)}:${t.type}`;
 if(t.id)return String(t.id);
 return '';
}
function financeTxApplyOverride(t){
 if(!t)return null;
 const keys=[financeTxKey(t),t.id?String(t.id):''].filter(Boolean);
 let o=null; for(const k of keys){if(financeTxOverrides[k]){o=financeTxOverrides[k];break;}}
 if(!o)return t;
 if(o.deleted)return null;
 return {...t,...o,id:t.id||o.id};
}
function financeTxStoreOverride(t,patch){
 const keys=[financeTxKey(t),t.id?String(t.id):''].filter(Boolean);
 [...new Set(keys)].forEach(k=>financeTxOverrides[k]={...(financeTxOverrides[k]||{}),...patch});
}
function financeTxClearOverride(t){const keys=[financeTxKey(t),t?.id?String(t.id):''].filter(Boolean);[...new Set(keys)].forEach(k=>delete financeTxOverrides[k]);}
function openFinanceTxEditor(txId,returnType,returnName,season){
 if(!requireEditor())return;
 const tx=financeTransactions.find(x=>String(x.id)===String(txId)); if(!tx){toast('Buchung nicht gefunden.');return;}
 const back=returnType==='driver'?`openDriverFinance('${esc(returnName)}','${esc(season)}')`:`openFinanceLedger('${esc(returnName)}','${esc(season)}')`;
 document.getElementById('modal-content').innerHTML=`<div class="modal-head"><div><h2>✏️ Zahlungsbuchung bearbeiten</h2><p class="race-edit-note">Admin-Bereich · Jede gespeicherte Buchung kann korrigiert oder gelöscht werden.</p></div><button onclick="${back}">×</button></div><div class="new-driver-form"><label>Beschreibung<input id="edit-finance-desc" value="${esc(tx.description||'')}"></label><label>Betrag<input id="edit-finance-amount" inputmode="numeric" value="${Number(tx.amount)||0}"></label><label>Datum<input id="edit-finance-date" type="date" value="${tx.date?new Date(tx.date).toISOString().slice(0,10):''}"></label><label>Typ<input id="edit-finance-type" value="${esc(tx.type||'manual')}"></label><label>Fahrer<input id="edit-finance-driver" value="${esc(tx.driver||'')}"></label><label>Team<input id="edit-finance-team" value="${esc(tx.team||'')}"></label></div><div class="finance-note">Automatisch erzeugte Buchungen werden bei einer späteren Finanzaktualisierung grundsätzlich neu aus Rennen, Verträgen oder Leihen berechnet. Deine Admin-Korrektur bleibt dabei gespeichert.</div><div class="modal-actions"><button class="ghost" onclick="${back}">Abbrechen</button><button class="danger" onclick="deleteFinanceTransaction('${esc(tx.id)}','${esc(returnType)}','${esc(returnName)}','${esc(season)}')">🗑️ Buchung löschen</button><button class="primary" onclick="saveFinanceTransactionEdit('${esc(tx.id)}','${esc(returnType)}','${esc(returnName)}','${esc(season)}')">✓ Änderungen speichern</button></div>`;openModal();
}
function saveFinanceTransactionEdit(txId,returnType,returnName,season){
 if(!requireEditor())return; const tx=financeTransactions.find(x=>String(x.id)===String(txId)); if(!tx)return;
 const desc=document.getElementById('edit-finance-desc')?.value.trim(); const amount=parseMoneyValue(document.getElementById('edit-finance-amount')?.value||0); const date=document.getElementById('edit-finance-date')?.value||''; const type=document.getElementById('edit-finance-type')?.value.trim()||'manual'; const driver=document.getElementById('edit-finance-driver')?.value.trim()||''; const team=document.getElementById('edit-finance-team')?.value.trim()||'';
 if(!desc||!amount){toast('Beschreibung und Betrag erforderlich.');return}
 const patch={description:desc,amount,type,driver,team,date:date?new Date(date+'T12:00:00').toISOString():tx.date};
 financeTxStoreOverride(tx,patch); Object.assign(tx,patch); save(); toast('Zahlungsbuchung geändert.'); returnType==='driver'?openDriverFinance(returnName,season):openFinanceLedger(returnName,season);
}
function deleteFinanceTransaction(txId,returnType,returnName,season){
 if(!requireEditor())return; const tx=financeTransactions.find(x=>String(x.id)===String(txId)); if(!tx)return;
 if(!confirm(`Zahlungsbuchung wirklich löschen?\n\n${tx.description||tx.type} · ${money(tx.amount)}`))return;
 financeTxStoreOverride(tx,{deleted:true}); financeTransactions=financeTransactions.filter(x=>String(x.id)!==String(txId)); save(); toast('Zahlungsbuchung gelöscht.'); returnType==='driver'?openDriverFinance(returnName,season):openFinanceLedger(returnName,season);
}

function syncPointCostTransactions(){
 // Fahrer-Punktkosten werden für ALLE gespeicherten Rennen berechnet.
  // die Finanzlogik vollständig testen können. In 02/26 läuft exakt dieselbe
 // Berechnung weiter – es gibt keinen separaten Test-Sonderweg.
 // Div 1 = 200.000 € pro Punkt; Div 2 = 100.000 € pro Punkt.
 // Wichtig: Die tatsächlich gespeicherte Rennposition wird verwendet (x.pos),
 // nicht nur die aktuelle Array-Reihenfolge. Dadurch funktioniert die Buchung
 // auch nach manuellen Änderungen/OCR-Korrekturen zuverlässig.
 const calculationRaces=Object.values(races);
 const keep=financeTransactions.filter(t=>t.type!=='driver_points_cost');
 const generated=[];
 calculationRaces.forEach(r=>{
   const season=seasonOfRace(r);
   const rate=r.division==='Div 2'?100000:200000;
   (r.results||[]).forEach((x,i)=>{
     const pos=Number(x.pos)||Number(x.position)||i+1;
     const status=statusOfResult(x);
     const pts=pointsForPosition(pos,status);
     const driver=normDriver(String(x.name||'').trim());
     if(!pts||!driver)return;
     generated.push({
       id:`ptc_${r.id}_${driver}_${pos}`,
       season, team:'', driver,
       description:`Fahrerpunktkosten · ${r.track||'Rennen'} R${r.number||r.round||''} · P${pos} · ${pts} Punkte × ${money(rate)}`,
       type:'driver_points_cost', amount:-(pts*rate),
       date:r.raceDate?new Date(r.raceDate+'T12:00:00').toISOString():(r.createdAt||new Date().toISOString()),
       raceId:r.id, position:pos, points:pts, rate
     });
   });
 });
 financeTransactions=keep.concat(generated.map(financeTxApplyOverride).filter(Boolean));
}
function openLoanEditor(existingId=''){
 if(!requireEditor())return;
 const ex=loanAgreements.find(x=>x.id===existingId); const season=seasonState.current||'02/26';
 const driverOpts=drivers.filter(n=>getStatus(n)!=='Nicht verfügbar').sort((a,b)=>a.localeCompare(b,'de')).map(n=>`<option value="${esc(n)}" ${ex&&normDriver(ex.driver)===normDriver(n)?'selected':''}>${esc(n)}</option>`).join('');
 const teamOpts=TEAM_CHOICES.filter(Boolean).map(t=>`<option value="${esc(t)}" ${ex?.borrowerTeam===t?'selected':''}>${esc(t)}</option>`).join('');
 const sourceOpts=`<option value="">— Free Agent / keine Leihgebühr an Team —</option>`+TEAM_CHOICES.filter(Boolean).map(t=>`<option value="${esc(t)}" ${ex?.sourceTeam===t?'selected':''}>${esc(t)}</option>`).join('');
 document.getElementById('modal-content').innerHTML=`<div class="modal-head"><div><h2>🤝 Ersatzfahrer ${ex?'bearbeiten':'leihen'}</h2><p class="race-edit-note">Eine Leihvereinbarung ist eine eigene Finanzbuchung und ersetzt keinen Fahrervertrag.</p></div><button onclick="closeModal()">×</button></div><div class="new-driver-form"><label>Ersatzfahrer<select id="loan-driver">${driverOpts}</select></label><label>Leihendes Team (optional)<select id="loan-source">${sourceOpts}</select></label><label>Ausleihendes Team<select id="loan-borrower">${teamOpts}</select></label><label>Division<select id="loan-div"><option ${ex?.division==='Div 1'?'selected':''}>Div 1</option><option ${ex?.division==='Div 2'||!ex?'selected':''}>Div 2</option></select></label><label>Saison<select id="loan-season">${Object.keys(SEASON_META.seasons).map(x=>`<option ${x===season?'selected':''}>${x}</option>`).join('')}</select></label><label>Leihgebühr<input id="loan-fee" value="${esc(ex?.fee||'')}" placeholder="z. B. 500.000 €"></label><label>Rennrunde Beginn<input id="loan-start" type="number" min="1" value="${ex?.startRound||1}"></label><label>Rennrunde Ende<input id="loan-end" type="number" min="1" value="${ex?.endRound||''}" placeholder="optional"></label><label>Status<select id="loan-status"><option ${ex?.status==='Aktiv'||!ex?'selected':''}>Aktiv</option><option ${ex?.status==='Beendet'?'selected':''}>Beendet</option><option ${ex?.status==='Vorläufig'?'selected':''}>Vorläufig</option></select></label></div><div class="modal-actions"><button class="ghost" onclick="closeModal()">Abbrechen</button><button class="primary" onclick="saveLoanAgreement('${esc(existingId)}')">✓ Leihvereinbarung speichern</button></div>`;openModal();
}
function saveLoanAgreement(existingId=''){
 if(!requireEditor())return;
 const driver=normDriver(document.getElementById('loan-driver')?.value||'');const borrower=document.getElementById('loan-borrower')?.value||'';const source=document.getElementById('loan-source')?.value||'';const season=document.getElementById('loan-season')?.value||seasonState.current;const division=document.getElementById('loan-div')?.value||'Div 2';const fee=parseMoneyValue(document.getElementById('loan-fee')?.value||0);const start=Number(document.getElementById('loan-start')?.value)||1;const end=Number(document.getElementById('loan-end')?.value)||0;const status=document.getElementById('loan-status')?.value||'Aktiv';
 if(!driver||!borrower||fee<=0){toast('Ersatzfahrer, ausleihendes Team und Leihgebühr erforderlich.');return}
 const payload={driver,sourceTeam:source,borrowerTeam:borrower,division,season,fee,startRound:start,endRound:end,status,updatedAt:new Date().toISOString()};
 if(existingId){const i=loanAgreements.findIndex(x=>x.id===existingId);if(i>=0)loanAgreements[i]={...loanAgreements[i],...payload};}
 else loanAgreements.push({id:crypto.randomUUID?crypto.randomUUID():'loan-'+Date.now(),...payload,createdAt:new Date().toISOString()});
 syncLoanTransactions();save();closeModal();renderFinance();renderTeams();toast(existingId?'Leihvereinbarung aktualisiert.':'Ersatzfahrer geliehen · Leihgebühr verbucht.');
}
function syncLoanTransactions(){
 financeTransactions=financeTransactions.filter(t=>t.type!=='replacement_loan'&&t.type!=='replacement_loan_income');
 loanAgreements.filter(l=>l.status!=='Vorläufig'&&Number(l.fee)>0).forEach(l=>{
   const fee=Math.abs(Number(l.fee));
   {const tx=financeTxApplyOverride({id:`loan_${l.id}`,season:l.season,team:l.borrowerTeam,driver:l.driver,description:`Ersatzfahrer-Leihe · ${l.driver}${l.sourceTeam?' von '+l.sourceTeam:''}`,type:'replacement_loan',amount:-fee,date:l.createdAt||new Date().toISOString(),loanId:l.id});if(tx)financeTransactions.push(tx);}
   {const tx=financeTxApplyOverride({id:`loan_income_${l.id}`,season:l.season,team:'',driver:l.driver,description:`Ersatzfahrer-Leihe erhalten · ${l.borrowerTeam}`,type:'replacement_loan_income',amount:fee,date:l.createdAt||new Date().toISOString(),loanId:l.id});if(tx)financeTransactions.push(tx);}
 });
}
function syncDriverContractFinance(c){
 if(!c||!c.id||!c.driver||c.draft)return;
 const season=c.season||seasonState.current||'02/26', driver=normDriver(c.driver);
 const agreementText=String(c.specialAgreement||'');
 const specialConditional=!!c.specialCondition?.enabled || /(beim|bei|wenn|sobald|ab)\s*(dem\s+)?erreichen|erreichen\s+von|bei\s+erreichen/i.test(agreementText);
 const specs=[
  {type:'contract_salary_income',label:'Vertragsgehalt',amount:parseMoneyValue(c.salary||c.value)},
  {type:'contract_special_income',label:'Sonderzahlung Vertrag',amount:specialConditional?0:parseMoneyValue(c.specialPayment)}
 ];
 specs.forEach(spec=>{
  const idx=financeTransactions.findIndex(t=>t.contractId===c.id&&t.driver&&normDriver(t.driver)===driver&&t.season===season&&t.type===spec.type);
  if(spec.amount>0){
   let tx={season,team:'',driver,contractId:c.id,type:spec.type,description:`${spec.label} · ${c.team||''}`.trim(),amount:spec.amount,date:c.startDate?new Date(c.startDate+'T12:00:00').toISOString():new Date().toISOString()};
   if(idx>=0){tx=financeTxApplyOverride({...financeTransactions[idx],...tx})||null;if(tx)financeTransactions[idx]=tx;else financeTransactions.splice(idx,1);} else {tx=financeTxApplyOverride({...tx,id:financeTxId()});if(tx)financeTransactions.push(tx);}
  }else if(idx>=0){financeTransactions.splice(idx,1);}
 });
}
function driverSeasonPoints(driver,season,division){return contractSeasonStats(driver,season,division).points}
function contractSpecialPaymentDue(c){if(!c?.specialCondition?.enabled)return true;return driverSeasonPoints(c.driver,c.season,c.division)>=Number(c.specialCondition.points||1)}
function syncContractSpecialPayments(){
 financeTransactions=financeTransactions.filter(t=>t.type!=='contract_special_income');
 contracts.filter(c=>c&&!c.draft).forEach(c=>{
  const amount=parseMoneyValue(c.specialPayment); if(amount<=0||!contractSpecialPaymentDue(c))return;
  const tx={id:financeTxId(),season:c.season,team:c.team||'',driver:normDriver(c.driver),contractId:c.id,type:'contract_special_income',description:`Sonderzahlung Vertrag · ${c.team||''}`.trim(),amount,date:c.endDate?new Date(c.endDate+'T12:00:00').toISOString():(c.startDate?new Date(c.startDate+'T12:00:00').toISOString():new Date().toISOString())};
  financeTransactions.push(financeTxApplyOverride(tx)||tx);
 });
}
function syncAllDriverContractFinance(){
 // Vertragsbuchungen sind vollständig aus den aktuell gespeicherten Verträgen ableitbar.
 // Dadurch werden auch bereits vorhandene Verträge nach App-Neustart korrekt in die Fahrerfinanzen übernommen.
 financeTransactions=financeTransactions.filter(t=>t.type!=='contract_salary_income'&&t.type!=='contract_special_income');
 contracts.filter(c=>c&&!c.draft).forEach(syncDriverContractFinance);
 syncContractSpecialPayments();
 syncContractExtensions();
}
function removeDriverContractFinance(contractId){
 if(!contractId)return;
 financeTransactions=financeTransactions.filter(t=>!(t.contractId===contractId&&(t.type==='contract_salary_income'||t.type==='contract_special_income')));
}
function financeDriverBalance(driverName,season=seasonState.current||'02/26'){
 const tx=financeTransactions.filter(t=>t.season===season&&normDriver(t.driver)===normDriver(driverName));
 const opening=Number(driverFinanceOpeningBalances[season]?.[normDriver(driverName)]||0);
 return {opening,income:tx.filter(t=>t.amount>0).reduce((a,t)=>a+(Number(t.amount)||0),0),expense:tx.filter(t=>t.amount<0).reduce((a,t)=>a+Math.abs(Number(t.amount)||0),0),balance:opening+tx.reduce((a,t)=>a+(Number(t.amount)||0),0),transactions:tx.sort((a,b)=>String(b.date).localeCompare(String(a.date)))};
}
function licenseCost(division){return division==='Div 1'?5000000:2500000}
function nextSeasonLabel(season=seasonState.current||'02/26'){
 const m=String(season).match(/^(\d+)\/(\d+)$/); if(!m)return '';
 const n=Number(m[1])+1; return `${String(n).padStart(2,'0')}/${m[2]}`;
}
function driverLicenseState(driverName,season=seasonState.current||'02/26'){
 const key=normDriver(driverName); const rec=driverLicenses[season]?.[key]||{};
 const division=currentDivision(driverName)==='—'?(driverRecord(driverName)?.division||'Div 2'):currentDivision(driverName);
 const next=nextSeasonLabel(season); const nrec=driverLicenses[next]?.[key]||{};
 const priority=nrec.nextDivision||nrec.priority||division||'Div 2';
 const bal=financeDriverBalance(driverName,season).balance;
 const cost=licenseCost(priority);
 return {season,rec,division,next,priority,cost,balance:bal,nextOk:bal>=cost,nrec};
}
function saveDriverLicensePriority(driverName,season,division){
 if(!requireEditor())return; const next=nextSeasonLabel(season); if(!next)return;
 if(!driverLicenses[next])driverLicenses[next]={}; const key=normDriver(driverName);
 driverLicenses[next][key]={...(driverLicenses[next][key]||{}),nextDivision:division,updatedAt:new Date().toISOString()};
 save(); openDriver(driverName); toast(`Priorität nächste Saison: ${division} · Lizenzbedarf ${money(licenseCost(division))}.`);
}
function bookDriverLicense(driverName,season){
 if(!requireEditor())return; const st=driverLicenseState(driverName,season); const key=normDriver(driverName);
 if(st.rec.paid){toast('Die Lizenz ist für diese Saison bereits gebucht.');return}
 if(st.balance<licenseCost(st.division)){toast(`Nicht genügend Budget für die ${st.division}-Lizenz (${money(licenseCost(st.division))}).`);return}
 if(!driverLicenses[season])driverLicenses[season]={}; driverLicenses[season][key]={...(driverLicenses[season][key]||{}),paid:true,division:st.division,paidAt:new Date().toISOString()};
 financeAddTransaction({season,team:'',driver:driverName,type:'driver_license',description:`Fahrer-Lizenz · ${st.division}`,amount:-licenseCost(st.division)});
 save(); openDriver(driverName); toast(`Lizenz ${st.division} für ${season} gebucht und ${money(licenseCost(st.division))} abgezogen.`);
}
function openDriverPenalty(driverName,season=seasonState.current||'02/26'){
 if(!requireEditor())return;
 document.getElementById('modal-content').innerHTML=`<div class="modal-head"><div><h2>⚠️ Strafzahlung · ${esc(driverName)}</h2><p class="race-edit-note">Die Strafzahlung wird direkt vom Fahrerbudget abgezogen. Eine Begründung ist Pflicht.</p></div><button onclick="openDriverFinance('${esc(driverName)}','${esc(season)}')">×</button></div><div class="new-driver-form"><label>Betrag<input id="driver-penalty-amount" inputmode="numeric" placeholder="z. B. 500.000 €"></label><label>Begründung<textarea id="driver-penalty-reason" rows="4" placeholder="Warum wurde die Strafzahlung verhängt?"></textarea></label><label>Datum<input id="driver-penalty-date" type="date" value="${new Date().toISOString().slice(0,10)}"></label></div><div class="modal-actions"><button class="ghost" onclick="openDriverFinance('${esc(driverName)}','${esc(season)}')">Abbrechen</button><button class="primary" onclick="saveDriverPenalty('${esc(driverName)}','${esc(season)}')">✓ Strafzahlung buchen</button></div>`;openModal();
}
function saveDriverPenalty(driverName,season){
 if(!requireEditor())return; const amount=Math.abs(parseMoneyValue(document.getElementById('driver-penalty-amount')?.value||0)); const reason=document.getElementById('driver-penalty-reason')?.value.trim(); const date=document.getElementById('driver-penalty-date')?.value||new Date().toISOString().slice(0,10);
 if(!amount||!reason){toast('Betrag und Begründung sind erforderlich.');return}
 financeAddTransaction({season,team:'',driver:driverName,type:'driver_penalty',description:`Strafzahlung · ${reason}`,amount:-amount,date:new Date(date+'T12:00:00').toISOString()}); save(); toast(`Strafzahlung ${money(amount)} gebucht.`); openDriverFinance(driverName,season);
}
function renderDriverLicenseCard(driverName,season=seasonState.current||'02/26'){
 const st=driverLicenseState(driverName,season); const cur=st.rec.paid; const d1ok=st.balance>=5000000,d2ok=st.balance>=2500000;
 return `<div class="profile-section license-section"><div class="section-inline"><h3>🪪 Fahrer-Lizenz</h3>${isEditor()?`<button class="ghost mini-edit" onclick="bookDriverLicense('${esc(driverName)}','${esc(season)}')">${cur?'✓ Lizenz gebucht':'💳 Lizenz am Saisonende buchen'}</button>`:''}</div><div class="license-grid"><div class="license-current"><span>Aktuelle Saison · ${esc(season)}</span><strong>${cur?'✅':'❌'}</strong><small>${cur?`${esc(st.rec.division||st.division)}-Lizenz vorhanden`:'Lizenz noch nicht gebucht'}</small></div><div class="license-next"><div class="license-next-head"><span>Neue Saison · ${esc(st.next)}</span><b>Priorität: ${esc(st.priority)}</b></div><div class="license-choice"><button class="license-div ${st.priority==='Div 1'?'selected':''}" onclick="saveDriverLicensePriority('${esc(driverName)}','${esc(season)}','Div 1')">Div 1 · 5,0 Mio.</button><button class="license-div ${st.priority==='Div 2'?'selected':''}" onclick="saveDriverLicensePriority('${esc(driverName)}','${esc(season)}','Div 2')">Div 2 · 2,5 Mio.</button></div><div class="license-status"><span>Benötigtes Budget</span><b>${money(st.cost)}</b><span>Aktueller Kontostand</span><b>${money(st.balance)}</b><strong>${st.nextOk?'✅ Lizenz finanzierbar':'❌ Budget nicht ausreichend'}</strong></div><small>Div 1 verfügbar: ${d1ok?'✅':'❌'} · Div 2 verfügbar: ${d2ok?'✅':'❌'}</small></div></div></div>`;
}
function openDriverFinance(driverName,season=seasonState.current||'02/26'){
 syncFinancialRules();
 const b=financeDriverBalance(driverName,season);
 const contract=contracts.find(c=>normDriver(c.driver)===normDriver(driverName)&&c.season===season&&!c.draft);
 const openingDate=driverFinanceOpeningDates[season]?.[normDriver(driverName)]||contract?.startDate||'';
 const openingTx=b.opening?{date:openingDate||'',description:'Startkapital',type:'opening',amount:b.opening}:null;
 const allTx=(openingTx?[openingTx]:[]).concat(b.transactions).sort((a,z)=>String(a.date||'9999-12-31').localeCompare(String(z.date||'9999-12-31')));
 const rows=allTx.map(t=>`<div class="finance-tx-row${t.type==='opening'?' finance-opening-row':''}"><span>${t.date?esc(new Date(t.date).toLocaleDateString('de-DE')):'—'}</span><span><b>${esc(t.description)}</b><small>${t.type==='opening'?'Startkapital · '+esc(season):t.type==='driver_points_cost'?'Punktkosten · '+esc(season):t.type==='replacement_loan_income'?'Ersatzfahrer-Leihe · '+esc(season):t.type==='contract_salary_income'?'Vertragsgehalt · '+esc(season):t.type==='driver_license'?'Lizenz · '+esc(season):t.type==='driver_penalty'?'Strafzahlung · '+esc(season):'Sonderzahlung Vertrag · '+esc(season)}</small></span><span class="${t.amount>=0?'tx-in':'tx-out'}">${t.amount>=0?'+':''}${money(t.amount)}</span>${isEditor()&&t.type!=='opening'?`<span class="finance-row-actions"><button class="mini-link" onclick="openFinanceTxEditor('${esc(t.id)}','driver','${esc(driverName)}','${esc(season)}')">✏️</button><button class="mini-link" onclick="deleteFinanceTransaction('${esc(t.id)}','driver','${esc(driverName)}','${esc(season)}')">🗑️</button></span>`:''}</div>`).join('')||'<div class="empty-race">Noch keine Fahrer-Finanzbuchungen.</div>';
 const seasonOptions=Object.values(SEASON_META.seasons).sort((a,b)=>String(b.label).localeCompare(String(a.label),'de')).map(x=>`<option value="${esc(x.label)}" ${x.label===season?'selected':''}>${esc(x.label)}${x.status==='test'?' · Test':''}</option>`).join('');
 document.getElementById('modal-content').innerHTML=`<div class="modal-head"><div><h2>💰 Fahrer-Finanzkonto · ${esc(driverName)}</h2><p class="race-edit-note">Chronologisches Konto: Startkapital, Vertragszahlungen, Rennen/Punktkosten und Ersatzfahrer-Leihen.</p></div><button onclick="closeModal()">×</button></div><div class="new-driver-form single"><label>Saison<select id="driver-finance-season" onchange="openDriverFinance('${esc(driverName)}',this.value)">${seasonOptions}</select></label></div><div class="ledger-summary"><div><span>Startkapital</span><b>${money(b.opening)}</b></div><div><span>Einnahmen</span><b>${money(b.income)}</b></div><div><span>Ausgaben</span><b>${money(b.expense)}</b></div><div><span>Kontostand</span><b>${money(b.balance)}</b></div></div><div class="modal-actions">${isEditor()?`<button class="ghost" onclick="openDriverFinanceOpening('${esc(driverName)}','${esc(season)}')">💰 Startkapital / Datum</button><button class="ghost" onclick="openDriverPenalty('${esc(driverName)}','${esc(season)}')">⚠️ Strafzahlung</button><button class="ghost" onclick="refreshDriverFinance('${esc(driverName)}','${esc(season)}')">🔄 Finanzen aktualisieren</button>`:''}${contract?`<button class="ghost" onclick="${isEditor()?`openContractEditor('${esc(contract.driver)}','${esc(contract.id)}')`:`openContractViewer('${esc(contract.id)}')` }">📄 Vertrag ${isEditor()?'bearbeiten':'ansehen'}</button>`:''}<button class="primary" onclick="closeModal()">Fertig</button></div><div class="finance-ledger"><div class="finance-tx-row finance-tx-head"><span>DATUM</span><span>BUCHUNG / GRUND</span><span>BETRAG</span></div>${rows}</div></div>`;openModal();
}
function refreshDriverFinance(driverName,season){if(!requireEditor())return;syncFinancialRules();save();openDriverFinance(driverName,season);toast('Fahrerfinanzen neu aus Verträgen, Leihen und Rennen berechnet.');}
function openDriverFinanceOpening(driverName,season){if(!requireEditor())return;const key=normDriver(driverName),current=Number(driverFinanceOpeningBalances[season]?.[key]||0),date=driverFinanceOpeningDates[season]?.[key]||'';document.getElementById('modal-content').innerHTML=`<div class="modal-head"><div><h2>💰 Fahrer-Startkapital</h2><p class="race-edit-note">Persönlicher Anfangsbestand von ${esc(driverName)} für ${esc(season)}. Das Datum erscheint als erste Buchung im Finanzkonto.</p></div><button onclick="openDriverFinance('${esc(driverName)}','${esc(season)}')">×</button></div><div class="new-driver-form"><label>Startkapital<input id="driver-finance-opening-value" value="${current||0}" inputmode="numeric" placeholder="0"></label><label>Datum<input id="driver-finance-opening-date" type="date" value="${esc(date)}"></label></div><div class="modal-actions"><button class="ghost" onclick="openDriverFinance('${esc(driverName)}','${esc(season)}')">Abbrechen</button><button class="primary" onclick="saveDriverFinanceOpening('${esc(driverName)}','${esc(season)}')">✓ Speichern</button></div>`;openModal();}
function saveDriverFinanceOpening(driverName,season){if(!requireEditor())return;const key=normDriver(driverName),n=parseMoneyValue(document.getElementById('driver-finance-opening-value')?.value||0),date=document.getElementById('driver-finance-opening-date')?.value||'';if(!driverFinanceOpeningBalances[season])driverFinanceOpeningBalances[season]={};if(!driverFinanceOpeningDates[season])driverFinanceOpeningDates[season]={};driverFinanceOpeningBalances[season][key]=n;driverFinanceOpeningDates[season][key]=date;save();toast('Fahrer-Startkapital gespeichert.');openDriverFinance(driverName,season);}
function openLoanList(teamName=''){
 const season=seasonState.current||'02/26'; const list=loanAgreements.filter(l=>l.season===season&&(!teamName||l.borrowerTeam===teamName||l.sourceTeam===teamName));
 const rows=list.map(l=>`<div class="finance-tx-row"><span>${esc(l.division)}</span><span><b>${esc(l.driver)}</b><small>${esc(l.sourceTeam||'Free Agent')} → ${esc(l.borrowerTeam)} · ${esc(l.status)}</small></span><span>${money(l.fee)}</span>${isEditor()?`<button class="mini-link" onclick="openLoanEditor('${esc(l.id)}')">Bearbeiten</button>`:''}</div>`).join('')||'<div class="empty-race">Keine Ersatzfahrer-Leihen in dieser Saison.</div>';
 document.getElementById('modal-content').innerHTML=`<div class="modal-head"><div><h2>🤝 Ersatzfahrer-Leihen · ${esc(teamName||'Alle Teams')}</h2><p class="race-edit-note">Leihgebühren werden als Ausgabe beim ausleihenden Team verbucht.</p></div><button onclick="closeModal()">×</button></div><div class="modal-actions">${isEditor()?'<button class="primary" onclick="openLoanEditor()">➕ Ersatzfahrer leihen</button>':''}</div><div class="finance-ledger">${rows}</div>`;openModal();
}
function syncFinancialRules(){
  // Rebuild all automatically derived financial entries from authoritative sources.
  // Manual entries are never touched.
  syncPointCostTransactions();
  syncLoanTransactions();
  syncAllDriverContractFinance();
}
function financeRuleAudit(){
  const season=seasonState.current||'02/26';
  syncFinancialRules();
  const official=SEASON_META.seasons[season]?.official!==false;
  const pointCosts=financeTransactions.filter(t=>t.season===season&&t.type==='driver_points_cost').reduce((a,t)=>a+Math.abs(Number(t.amount)||0),0);
  const loanCosts=financeTransactions.filter(t=>t.season===season&&t.type==='replacement_loan').reduce((a,t)=>a+Math.abs(Number(t.amount)||0),0);
  const loanIncome=financeTransactions.filter(t=>t.season===season&&t.type==='replacement_loan_income').reduce((a,t)=>a+Math.abs(Number(t.amount)||0),0);
  return {season,official,pointCosts,loanCosts,loanIncome,manual:financeTransactions.filter(t=>t.season===season&&['driver_points_cost','replacement_loan','replacement_loan_income'].indexOf(t.type)<0).length};
}
function calculateLeagueState(){
 syncFinancialRules();
 rebuildDriverIndex();
 const chronological=raceChronological();
 const allNames=[...new Set(drivers.map(normDriver).filter(Boolean))];
 // Recalculate in complete race-weekend groups so Div 1 and Div 2 of the same
 // track/round receive the exact same historical snapshot point.
 const groups=[]; const seen=new Set();
 chronological.forEach(r=>{
   const key=`${seasonOfRace(r)}|${r.number||r.round||0}|${r.track||''}`;
   if(!seen.has(key)){seen.add(key);groups.push({key,season:seasonOfRace(r),number:r.number||r.round||0,track:r.track,races:chronological.filter(x=>`${seasonOfRace(x)}|${x.number||x.round||0}|${x.track||''}`===key)});
   }
 });
 const before=[];
 groups.forEach(g=>{
   before.push(...g.races);
   const names=[...new Set([...allNames,...g.races.flatMap(r=>r.results.map(x=>normDriver(x.name)).filter(Boolean))])];
   g.races.forEach(r=>{
     r.schemaVersion=3;
     r.season=seasonOfRace(r);
     r.ruleVersion=r.ruleVersion||SEASON_META.seasons[r.season]?.rules||'DoG 02/26 · v1';
     r.createdAt=r.createdAt||r.ocr?.capturedAt||new Date().toISOString();
     r.updatedAt=new Date().toISOString();
     r.results.forEach((x,i)=>x.points=pointsForPosition(i+1,statusOfResult(x)));
   });
   const snapshotAt=new Date().toISOString();
   const byName={};
   names.forEach(n=>{const c=calcDriverFromRaces(n,before);byName[n]={ova:c.ova,ren:c.ren,per:c.per,tem:c.tem,amk:c.amk,erf:c.erf,mw:c.mw};});
   g.races.forEach(r=>{r.state={version:r.ruleVersion,savedAt:snapshotAt,resultCount:r.results.length,weekendKey:g.key,driverValues:byName};});
 });
 // Current state is always derived from all stored races. Nothing is copied into
 // the race results except the official point value and the historical snapshot.
 seasonState.lastCalculatedAt=new Date().toISOString();
 seasonState.schemaVersion=3;
 seasonState.lastResultCount=chronological.reduce((n,r)=>n+r.results.length,0);
 seasonState.lastRaceCount=chronological.length;
 seasonState.lastWeekendCount=groups.length;
}
function recalculateDatabase(){
 if(!requireEditor())return;
 const before=JSON.stringify({races,drivers,driverMeta,teams});
 calculateLeagueState();
 save();
 const after=JSON.stringify({races,drivers,driverMeta,teams});
 const changed=before!==after;
 Object.values(races).forEach(r=>{r.changeLog=r.changeLog||[];r.changeLog.push({at:new Date().toISOString(),kind:'Datenbank neu berechnet',details:`${r.results.length} Ergebniszeilen · Regelversion ${r.ruleVersion}`});if(r.changeLog.length>50)r.changeLog=r.changeLog.slice(-50);});
 save();
 renderDashboard();renderWM();renderKWM();renderArchive();initDriverOverview();renderTeams();
 toast(changed?'Datenbank neu berechnet · WM/KWM/Fahrerwerte aktualisiert.':'Datenbank geprüft · keine Änderungen erforderlich.');
}
function databaseIntegrity(){
 const rs=raceList(); const names=new Set(drivers.map(normDriver));
 let orphan=0, invalid=0, duplicate=0;
 rs.forEach(r=>{const seen=new Set();r.results.forEach(x=>{const n=normDriver(x.name);if(!n||!names.has(n))orphan++;if(seen.has(n))duplicate++;seen.add(n);if(!Number.isFinite(Number(x.points))||Number(x.points)!==pointsForPosition(r.results.indexOf(x)+1,statusOfResult(x)))invalid++;});});
 return {orphan,invalid,duplicate,races:rs.length,results:rs.reduce((n,r)=>n+r.results.length,0),weekends:new Set(rs.map(r=>`${seasonOfRace(r)}|${r.number||r.round||0}|${r.track||''}`)).size};
}

function seasonOfRace(r){return r.season||'02/26'}
function seasonRaces(season='02/26'){return Object.values(races).filter(r=>seasonOfRace(r)===season)}
function uniqueSeasonRounds(season='02/26'){return new Set(seasonRaces(season).map(r=>`${r.number||r.round||0}|${r.track||''}`)).size}
function ensureRaceMetadata(){Object.values(races).forEach(r=>{r.schemaVersion=2;r.season=seasonOfRace(r);r.ruleVersion=r.ruleVersion||SEASON_META.seasons[r.season]?.rules||'DoG 02/26 · v1';r.createdAt=r.createdAt||new Date().toISOString();r.changeLog=r.changeLog||[];r.ocr=r.ocr||null;r.state=r.state||null;});}

function recordRaceChange(id,kind,details){
 const r=races[id];if(!r)return;
 r.changeLog=r.changeLog||[];r.changeLog.push({at:new Date().toISOString(),kind,details:String(details||'')});
 if(r.changeLog.length>50)r.changeLog=r.changeLog.slice(-50);
}
function saveRaceAndRecalculate(id,kind='update',details=''){
 calculateLeagueState();
 syncFinancialRules();
 if(kind)recordRaceChange(id,kind,details);
 save();
}

function calcDriver(name){return calcDriverFromRaces(name,raceList())}

function driverRaceStats(name){const rs=raceList().flatMap(r=>r.results.map((x,i)=>({x,i,r})).filter(o=>normDriver(o.x.name)===normDriver(name)));const valid=rs.filter(o=>statusOfResult(o.x)==='RESULT');const wins=valid.filter(o=>o.i===0).length,podiums=valid.filter(o=>o.i<3).length,dnf=rs.filter(o=>statusOfResult(o.x)==='DNF').length,dsq=rs.filter(o=>statusOfResult(o.x)==='DSQ').length,tl=rs.reduce((a,o)=>a+(Number(o.x.tl)||0),0),postPenalty=rs.filter(o=>o.x.penaltyNote||o.x.penaltyImage).length,gained=valid.reduce((a,o)=>a+Math.max(0,Number(o.x.grid)-(o.i+1)),0),lost=valid.reduce((a,o)=>a+Math.max(0,(o.i+1)-Number(o.x.grid)),0),same=valid.filter(o=>Number(o.x.grid)===o.i+1).length;return{races:rs.length,wins,podiums,dnf,dsq,tl,postPenalty,gained,lost,same,avgPos:valid.length?valid.reduce((a,o)=>a+o.i+1,0)/valid.length:0,avgGrid:rs.length?rs.reduce((a,o)=>a+Number(o.x.grid||0),0)/rs.length:0}}
function driverVehicleHistory(name){const counts={};raceList().forEach(r=>r.results.forEach(x=>{if(normDriver(x.name)===normDriver(name)){const t=x.team||'Unbekannt';counts[t]=(counts[t]||0)+1;}}));return Object.entries(counts).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'de')).map(([team,count])=>({team,count}));}
function contractHistory(name){
 const n=normDriver(name); const out=[];
 // Explicit contracts first; race/team history fills gaps without inventing dates.
 contracts.filter(c=>normDriver(c.driver)===n).forEach(c=>out.push({...c,source:'contract'}));
 const bySeason={}; raceList().forEach(r=>r.results.forEach(x=>{if(normDriver(x.name)!==n)return;const key=seasonOfRace(r);if(!bySeason[key])bySeason[key]={season:key,team:x.team,division:r.division,first:r.number,last:r.number};else{bySeason[key].first=Math.min(bySeason[key].first,r.number);bySeason[key].last=Math.max(bySeason[key].last,r.number);}}));
 Object.values(bySeason).forEach(h=>{if(!out.some(c=>c.season===h.season&&normDriver(c.driver)===n&&c.team===h.team))out.push({driver:n,season:h.season,team:h.team,division:h.division,startRound:h.first,endRound:h.last,status:'aus Renndaten',value:'',source:'race'});});
 return out.sort((a,b)=>String(a.season).localeCompare(String(b.season),'de')||Number(a.startRound||0)-Number(b.startRound||0));
}
function openContractViewer(id){
 if(!id)return; const c=contracts.find(x=>x.id===id); if(!c){toast('Vertrag nicht gefunden.');return;}
 const imgs=(c.contractImages||[]).map((x,i)=>`<img class="contract-view-thumb" src="${esc(x)}" onclick="viewImage(this.src)" alt="Vertragsbild ${i+1}">`).join('');
 document.getElementById('modal-content').innerHTML=`<div class="modal-head"><div><h2>📄 Vertrag · ${esc(c.driver)}</h2><p class="race-edit-note">${esc(c.season||'—')} · ${esc(c.team||'—')} · ${esc(c.division||'—')}</p></div><button onclick="closeModal()">×</button></div><div class="contract-view-grid"><div><b>Teamchef</b><span>${esc(c.teamChief||'—')}</span></div><div><b>Beginn</b><span>${esc(c.startDate||'—')}</span></div><div><b>Ende</b><span>${esc(c.endDate||'—')}</span></div><div><b>Fahrersponsor</b><span>${esc(c.sponsor||'—')}</span></div><div><b>Gehalt</b><span>${esc(c.salary||c.value||'—')}</span></div><div><b>Sonderzahlung</b><span>${esc(c.specialPayment||'—')}</span></div><div><b>Abfindung</b><span>${esc(c.severance||'—')}</span></div><div><b>Ausstiegsklausel</b><span>${esc(c.releaseClause||'—')}</span></div></div><div class="contract-view-agreement"><b>Sondervereinbarungen</b><p>${esc(c.specialAgreement||'—')}</p></div><div class="contract-view-signatures"><div><b>Unterschrift Fahrer</b><span>${esc(c.signatureDriver||'—')}</span></div><div><b>Unterschrift Teamchef</b><span>${esc(c.signatureChief||'—')}</span></div></div>${imgs?`<div class="contract-view-images"><b>Vertragsbilder</b><div>${imgs}</div></div>`:''}<div class="modal-actions"><button class="ghost" onclick="openContractEditor('${esc(c.driver)}','${esc(c.id)}')">✏️ Bearbeiten</button><button class="primary" onclick="closeModal()">Fertig</button></div>`; openModal();
}
function contractDriverOptions(selected=''){
 return `<option value="">— Fahrer auswählen —</option>${drivers.slice().sort((a,b)=>normDriver(a).localeCompare(normDriver(b),'de')).map(x=>`<option value="${esc(x)}" ${normDriver(x)===normDriver(selected)?'selected':''}>${esc(x)}${driverNumber(x)?` · #${driverNumber(x)}`:''}</option>`).join('')}`;
}
function contractTeamOptions(selected=''){
 return `<option value="">— Team auswählen —</option>${TEAM_CHOICES.filter(Boolean).map(x=>`<option value="${esc(x)}" ${x===selected?'selected':''}>${esc(x)}</option>`).join('')}`;
}
function syncContractPartyFields(){
 const d=document.getElementById('contract-driver')?.value||'', t=document.getElementById('contract-team')?.value||'';
 const div=document.getElementById('contract-div'); const chief=document.getElementById('contract-chief');
 const m=driverRecord(d); if(div&&!m?.division){} else if(div&&m?.division)div.value=m.division;
 if(chief&&!chief.value)chief.value=teams.find(x=>x.name===t)?.chief||'';
 const sd=document.getElementById('contract-sign-driver'); const sc=document.getElementById('contract-sign-chief');
 if(sd&&!sd.value)sd.value=d; if(sc&&!sc.value)sc.value=chief?.value||teams.find(x=>x.name===t)?.chief||'';
}
function syncContractChief(){
 const t=document.getElementById('contract-team')?.value||''; const c=teams.find(x=>x.name===t)?.chief||'';
 const el=document.getElementById('contract-chief'); if(el)el.value=c;
 const sc=document.getElementById('contract-sign-chief'); if(sc&&!sc.value)sc.value=c;
 syncContractPartyFields();
}
function openContractEditor(name,id){
 if(!requireEditor())return;
 const existing=id?contracts.find(c=>c.id===id):null; window.__editingContractId=existing?.id||'';
 const selectedDriver=existing?.driver||name||'', selectedTeam=existing?.team||driverTeam(name)||'', currentSeason=existing?.season||seasonState.current||'02/26';
 const chief=existing?.teamChief||teams.find(t=>t.name===selectedTeam)?.chief||'';
 const seasonOpts=Object.keys(SEASON_META.seasons).sort().map(x=>`<option ${x===currentSeason?'selected':''}>${esc(x)}</option>`).join('');
 const duration=existing?.durationSeasons||1, ext=existing?.extension||{};
 document.getElementById('modal-content').innerHTML=`<div class="modal-head"><div><h2>📄 ${existing?'Vertrag bearbeiten':'Fahrervertrag anlegen'}</h2><p class="race-edit-note">Fahrer und Team werden ausschließlich über Auswahllisten zugeordnet. Dadurch bleiben Verträge eindeutig mit der Fahrer-ID verknüpft.</p></div><button onclick="closeModal()">×</button></div><div class="contract-form">
 <div class="contract-form-section"><h3>VERTRAGSPARTEIEN</h3><div class="new-driver-form"><label>Fahrer<select id="contract-driver" onchange="syncContractPartyFields()">${contractDriverOptions(selectedDriver)}</select></label><label>Saison<select id="contract-season">${seasonOpts}</select></label><label>Team<select id="contract-team" onchange="syncContractChief()">${contractTeamOptions(selectedTeam)}</select></label><label>Division<select id="contract-div"><option ${existing?.division==='Div 1'||(!existing&&currentDivision(selectedDriver)==='Div 1')?'selected':''}>Div 1</option><option ${existing?.division==='Div 2'||(!existing&&currentDivision(selectedDriver)!=='Div 1')?'selected':''}>Div 2</option></select></label><label>Teamchef<select id="contract-chief"><option value="">— kein Teamchef —</option>${drivers.filter(d=>driverIsTeamChief(d)||normDriver(d)===normDriver(chief)).sort((a,b)=>a.localeCompare(b,'de')).map(d=>`<option value="${esc(d)}" ${normDriver(d)===normDriver(chief)?'selected':''}>${esc(d)}</option>`).join('')}</select></label></div></div>
 <div class="contract-form-section"><h3>VERTRAGSLAUFZEIT</h3><div class="new-driver-form"><label>Laufzeit<select id="contract-duration"><option value="1" ${duration===1?'selected':''}>1 Saison</option><option value="2" ${duration===2?'selected':''}>2 Saisons</option></select></label><label>Beginn<input id="contract-start-date" type="date" value="${esc(existing?.startDate||'')}"></label><label>Ende<input id="contract-end-date" type="date" value="${esc(existing?.endDate||'')}"></label></div><div class="contract-season-lock"><b>${duration===2?'Vertrag über 2 Saisons':'Vertrag über 1 Saison'}</b><span>Bei 2 Saisons wird die Folgesaison automatisch als Vertragsbindung vorgemerkt.</span></div></div>
 <div class="contract-form-section"><h3>🔄 AUTOMATISCHE VERLÄNGERUNG</h3><div class="new-driver-form"><label class="role-check"><input type="checkbox" id="contract-ext-enabled" ${ext.enabled?'checked':''}> Verlängerung aktiv</label><label>Zusatzlaufzeit<select id="contract-ext-duration"><option value="1" ${Number(ext.duration||1)===1?'selected':''}>+ 1 Saison</option><option value="2" ${Number(ext.duration||1)===2?'selected':''}>+ 2 Saisons</option></select></label></div><div class="extension-grid"><label class="role-check"><input type="checkbox" id="contract-ext-position" ${ext.positionEnabled?'checked':''}> WM-Platz als Bedingung</label><label>Max. Platz<input id="contract-ext-position-value" type="number" min="1" max="250" value="${Number(ext.position||1)}"></label><label class="role-check"><input type="checkbox" id="contract-ext-points" ${ext.pointsEnabled?'checked':''}> Punkte als Bedingung</label><label>Punkte ab<input id="contract-ext-points-value" type="number" min="1" max="250" value="${Number(ext.points||1)}"></label><label class="role-check"><input type="checkbox" id="contract-ext-races" ${ext.racesEnabled?'checked':''}> Rennen als Bedingung</label><label>Rennen ab<input id="contract-ext-races-value" type="number" min="1" max="250" value="${Number(ext.races||1)}"></label></div><div class="race-edit-note">Mehrere Bedingungen können gleichzeitig aktiviert werden. Sind mehrere Haken gesetzt, müssen <b>alle</b> erfüllbar sein. Die Prüfung erfolgt erst zum Saisonende.</div></div>
 <div class="contract-form-section"><h3>FAHRERSPONSOR</h3><div class="new-driver-form"><label>Sponsor<select id="contract-sponsor" onchange="syncSponsorFields()"><option value="">Kein Sponsor</option>${Object.keys(SPONSOR_OPTIONS).map(x=>`<option value="${esc(x)}" ${existing?.sponsor===x?'selected':''}>${esc(x)}</option>`).join('')}</select></label><label>Sponsor-Logo (optional)<input id="contract-sponsor-logo" value="${esc(existing?.sponsorLogo||'')}"></label></div><div id="sponsor-preview" class="sponsor-preview"></div></div>
 <div class="contract-form-section"><h3>ZAHLUNGSVEREINBARUNGEN</h3><div class="new-driver-form"><label>Gehalt<input id="contract-salary" value="${esc(existing?.salary||existing?.value||'')}" placeholder="4.000.000 €"></label><label>Sonderzahlung<input id="contract-special" value="${esc(existing?.specialPayment||'')}" placeholder="6.000.000 €"></label><label>Abfindung<input id="contract-severance" value="${esc(existing?.severance||'')}" placeholder="8.000.000 €"></label><label>Ausstiegsklausel<input id="contract-release" value="${esc(existing?.releaseClause||'')}" placeholder="120.000.000 €"></label></div><div class="new-driver-form"><label class="role-check"><input type="checkbox" id="contract-special-enabled" ${existing?.specialCondition?.enabled?'checked':''}> Sonderzahlung nur bei Bedingung</label><label>Benötigte Punkte<input id="contract-special-points" type="number" min="1" max="250" value="${Number(existing?.specialCondition?.points||1)}"></label></div><div class="race-edit-note">Die Sonderzahlung wird erst automatisch fällig, wenn der Fahrer die eingetragene Punktzahl erreicht. Ohne Haken bleibt sie eine normale Zahlung.</div></div>
 <div class="contract-form-section"><h3>SONDERVEREINBARUNGEN</h3><label class="full-field">Vereinbarung<textarea id="contract-special-agreement" rows="4">${esc(existing?.specialAgreement||'')}</textarea></label></div>
 <div class="contract-form-section"><h3>📷 VERTRAGSBILD / OCR</h3><p class="race-edit-note">Vertragsbild hochladen und optional per OCR auswerten.</p><input id="contract-image-input" type="file" accept="image/*" multiple onchange="attachContractImages(this)"/><div id="contract-image-preview" class="contract-image-preview">${(existing?.contractImages||[]).map(x=>`<img src="${esc(x)}" onclick="viewImage(this.src)">`).join()}</div><button class="ghost" type="button" onclick="document.getElementById('contract-ocr-input').click()">🔎 Vertrag per OCR auswerten</button><input id="contract-ocr-input" type="file" accept="image/*" multiple hidden onchange="startContractOCR(this)"/></div>
 <div class="contract-form-section"><h3>UNTERSCHRIFTEN</h3><div class="new-driver-form"><label>Unterschrift Fahrer<input id="contract-sign-driver" value="${esc(existing?.signatureDriver||selectedDriver)}" placeholder="Name / Signatur"></label><label>Unterschrift Teamchef<input id="contract-sign-chief" value="${esc(existing?.signatureChief||chief)}" placeholder="Name / Signatur"></label></div><div class="race-edit-note">Die Namen aus den Vertragsparteien werden automatisch als Unterschriften vorbelegt.</div></div></div><div class="modal-actions"><button class="ghost" onclick="closeModal()">Abbrechen</button><button class="primary" onclick="saveContract('${esc(existing?.id||'')}")">✓ Vertrag speichern</button></div>`;
 openModal(); syncSponsorFields(); syncContractPartyFields();
}
function attachContractImages(input){if(!isEditor()){input.value='';return}const files=[...input.files||[]];if(!files.length)return;const id=document.getElementById('contract-driver')?.value||'';const existingId=window.__editingContractId||'';let c=existingId?contracts.find(x=>x.id===existingId):null;if(!c){c={id:existingId||('draftimg-'+Date.now()),driver:id,season:document.getElementById('contract-season')?.value||seasonState.current};if(!existingId){contracts.push(c);window.__editingContractId=c.id}}c.contractImages=c.contractImages||[];let left=files.length;files.forEach(f=>{const rd=new FileReader();rd.onload=()=>{c.contractImages.push(rd.result);left--;if(!left){save();const p=document.getElementById('contract-image-preview');if(p)p.innerHTML=c.contractImages.map(x=>`<img src="${esc(x)}" onclick="viewImage(this.src)">`).join('');toast(`${files.length} Vertragsbild${files.length===1?'':'er'} gespeichert.`)}};rd.readAsDataURL(f)})}
function normalizeOCRContractText(text){return String(text||'').replace(/\r/g,'').replace(/[“”„]/g,'"').replace(/[–—]/g,'-').replace(/\u00a0/g,' ').replace(/[ \t]+/g,' ').split('\n').map(x=>x.trim()).filter(Boolean)}
function ocrContractValue(lines, labels){
 const pats=labels.map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|');
 for(const line of lines){
  const m=line.match(new RegExp('(?:'+pats+')\\s*[:\\-]?\\s*(.+)$','i'));
  if(m&&m[1]) return m[1].trim();
 }
 return '';
}
function ocrContractDate(text,label){
 const m=String(text||'').match(new RegExp(label+'\\s*[:\\-]?\\s*(\\d{1,2}[.\\/]\\d{1,2}[.\\/]\\d{2,4})','i'));
 return m?m[1].replace(/\//g,'.'):'';
}
function ocrContractMoney(text,label){
 const v=ocrContractValue(normalizeOCRContractText(text),[label]);
 const m=String(v||'').match(/[0-9][0-9.\\s,]*\\s*€/);
 return m?m[0].trim():(v||'');
}
function ocrBestKnownDriver(value){
 if(!value)return '';
 const exact=drivers.find(n=>ocrNormName(n)===ocrNormName(value)); if(exact)return exact;
 let best='',score=0;
 for(const n of drivers){const sc=fuzzySimilarity(value,n);if(sc>score){score=sc;best=n}}
 return score>=.48?best:'';
}
function ocrBestKnownTeam(value){
 if(!value)return '';
 const direct=ocrFindTeam(value);if(direct)return direct.team;
 let best='',score=0;for(const [team,pats] of ocrTeamPatterns())for(const pat of pats){const sc=fuzzySimilarity(value,pat);if(sc>score){score=sc;best=team}}
 return score>=.48?best:'';
}
function ocrBestSponsor(value){
 if(!value)return '';
 const exact=Object.keys(SPONSOR_OPTIONS).find(x=>ocrNormName(x)===ocrNormName(value));if(exact)return exact;
 let best='',score=0;for(const x of Object.keys(SPONSOR_OPTIONS)){const sc=fuzzySimilarity(value,x);if(sc>score){score=sc;best=x}}
 return score>=.55?best:'';
}
function extractContractOCRFields(text){
 const raw=String(text||''); const lines=normalizeOCRContractText(raw);
 const driverRaw=ocrContractValue(lines,['FAHRER','DRIVER']);
 const teamRaw=ocrContractValue(lines,['TEAM','VEREIN']);
 const chiefRaw=ocrContractValue(lines,['TEAMCHEF','TEAM CHEF']);
 const sponsorRaw=ocrContractValue(lines,['FAHRERSPONSOR','SPONSOR']);
 const seasonRaw=ocrContractValue(lines,['LAUFZEIT','SAISON','SAISON/LAUFZEIT']);
 const specialAgreementLines=[];
 let inSpecial=false;
 for(const line of lines){
   if(/SONDERVEREINBARUNGEN/i.test(line)){inSpecial=true;continue}
   if(inSpecial && /^(UNTERSCHRIFT|ZAHLUNGSVEREINBARUNGEN|FAHRERSPONSOR|VERTRAGSLAUFZEIT|VERTRAGSPARTEIEN)/i.test(line)) inSpecial=false;
   if(inSpecial) specialAgreementLines.push(line.replace(/^[-•·*]\s*/,'').trim());
 }
 const agreement=specialAgreementLines.join(' ');
 const driver=ocrBestKnownDriver(driverRaw)||driverRaw.replace(/^[-•·*]\s*/,'').trim();
 const team=ocrBestKnownTeam(teamRaw)||teamRaw.replace(/^[-•·*]\s*/,'').trim();
 let sponsor=ocrBestSponsor(sponsorRaw); if(!sponsor){ const nr=ocrNormName(raw); sponsor=Object.keys(SPONSOR_OPTIONS).find(x=>nr.includes(ocrNormName(x)))||''; } if(!sponsor) sponsor=sponsorRaw.replace(/^[-•·*]\s*/,'').trim();
 let season=(seasonRaw.match(/\b\d{2}\/\d{2}\b/)||[])[0]||'';
 if(!season) season=(raw.match(/\b\d{2}\/\d{2}\b/)||[])[0]||'';
 return{
  driver, team, teamChief:chiefRaw.replace(/^[-•·*]\s*/,'').trim(),
  startDate:ocrContractDate(raw,'BEGINN'), endDate:ocrContractDate(raw,'ENDE'), season,
  sponsor, salary:ocrContractMoney(raw,'GEHALT')||ocrContractMoney(raw,'SALARY'),
  specialPayment:ocrContractMoney(raw,'SONDERZAHLUNG')||ocrContractMoney(raw,'BONUS'),
  severance:ocrContractMoney(raw,'ABFINDUNG')||ocrContractMoney(raw,'SEVERANCE'),
  releaseClause:ocrContractMoney(raw,'AUSSTIEGSKLAUSEL')||ocrContractMoney(raw,'RELEASE CLAUSE'),
  specialAgreement:agreement,
  raw
 };
}
async function startContractOCR(input){
 if(!requireEditor()){input.value='';return}
 const files=[...input.files||[]];if(!files.length)return;
 const ocrContext={id:window.__editingContractId||'',driver:document.getElementById('contract-driver')?.value||'',season:document.getElementById('contract-season')?.value||seasonState.current||'02/26'}; window.__contractOCRContext=ocrContext;
 if(typeof Tesseract==='undefined'){toast('OCR-Bibliothek konnte nicht geladen werden.');input.value='';return}
 document.getElementById('modal-content').innerHTML=`<div class="modal-head"><div><h2>🔎 Vertrag per OCR auswerten</h2><p class="race-edit-note">Der Vertrag wird mehrfach und bereichsorientiert gelesen. Erkannte Werte sind nur Vorschläge und können vor dem Speichern vollständig geändert werden.</p></div><button onclick="closeModal()">×</button></div><div id="contract-ocr-progress" class="ocr-progress">OCR wird vorbereitet …</div><div id="contract-ocr-result"></div>`;
 openModal();
 try{
   const worker=await Tesseract.createWorker('deu+eng');
   await worker.setParameters({tessedit_pageseg_mode:'6',preserve_interword_spaces:'1'});
   let raw='';
   for(let i=0;i<files.length;i++){
     document.getElementById('contract-ocr-progress').textContent=`Bild ${i+1}/${files.length}: Vertrag wird mehrfach gelesen …`;
     for(const mode of ['full','enhanced']){
       const canvas=await ocrPreprocess(files[i],mode);
       const res=await worker.recognize(canvas);
       raw+='\n'+(res.data?.text||'');
     }
   }
   await worker.terminate();
   const f=extractContractOCRFields(raw);
   const opts=(label,value,id)=>`<label>${label}<input id="${id}" value="${esc(value||'')}"></label>`;
   document.getElementById('contract-ocr-result').innerHTML=`
    <div class="ocr-hint">Die Felder werden automatisch aus den Beschriftungen des Vertrags gesucht. Du kannst <b>jedes einzelne Feld ändern</b>, bevor du die Vorschläge übernimmst.</div>
    <div class="new-driver-form">
      ${opts('Fahrer',f.driver,'ocr-contract-driver')}${opts('Team',f.team,'ocr-contract-team')}${opts('Teamchef',f.teamChief,'ocr-contract-chief')}
      ${opts('Beginn',f.startDate,'ocr-contract-start')}${opts('Ende',f.endDate,'ocr-contract-end')}${opts('Saison',f.season,'ocr-contract-season')}
      ${opts('Fahrersponsor',f.sponsor,'ocr-contract-sponsor')}${opts('Gehalt',f.salary,'ocr-contract-salary')}${opts('Sonderzahlung',f.specialPayment,'ocr-contract-special')}
      ${opts('Abfindung',f.severance,'ocr-contract-severance')}${opts('Ausstiegsklausel',f.releaseClause,'ocr-contract-release')}
    </div>
    <label class="full-field">Sondervereinbarungen<textarea id="ocr-contract-agreement" rows="5">${esc(f.specialAgreement||'')}</textarea></label>
    <div class="new-driver-form"><label>Unterschrift Fahrer (optional)<input id="ocr-contract-sign-driver" value=""></label><label>Unterschrift Teamchef (optional)<input id="ocr-contract-sign-chief" value=""></label></div>
    <details class="ocr-raw"><summary>OCR-Rohtext anzeigen</summary><pre>${esc(raw)}</pre></details>
    <div class="modal-actions"><button class="ghost" onclick="closeModal()">Abbrechen</button><button class="primary" onclick="applyContractOCR()">✓ Vorschläge in Vertrag übernehmen</button></div>`;
 }catch(e){document.getElementById('contract-ocr-result').innerHTML=`<div class="ocr-error">${esc(e?.message||e)}</div>`}
 input.value='';
}
function applyContractOCR(){
 const values={};
 const map=[['driver','ocr-contract-driver'],['team','ocr-contract-team'],['chief','ocr-contract-chief'],['startDate','ocr-contract-start'],['endDate','ocr-contract-end'],['season','ocr-contract-season'],['sponsor','ocr-contract-sponsor'],['salary','ocr-contract-salary'],['specialPayment','ocr-contract-special'],['severance','ocr-contract-severance'],['releaseClause','ocr-contract-release'],['specialAgreement','ocr-contract-agreement'],['signatureDriver','ocr-contract-sign-driver'],['signatureChief','ocr-contract-sign-chief']];
 map.forEach(([key,id])=>{values[key]=document.getElementById(id)?.value||''});
 ['startDate','endDate'].forEach(key=>{const out=values[key];if(/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(out)){const [d,m,y]=out.split('.');values[key]=`${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`}});
 const ctx=window.__contractOCRContext||{}; const driver=values.driver||ctx.driver||''; const id=ctx.id||'';
 closeModal();
 openContractEditor(driver,id);
 setTimeout(()=>{
   const set=(el,v)=>{const e=document.getElementById(el);if(e&&v!==undefined)e.value=v};
   set('contract-driver',values.driver);set('contract-team',values.team);set('contract-chief',values.chief);set('contract-start-date',values.startDate);set('contract-end-date',values.endDate);set('contract-season',values.season);set('contract-sponsor',values.sponsor);set('contract-salary',values.salary);set('contract-special',values.specialPayment);set('contract-severance',values.severance);set('contract-release',values.releaseClause);set('contract-special-agreement',values.specialAgreement);set('contract-sign-driver',values.signatureDriver);set('contract-sign-chief',values.signatureChief);syncSponsorFields();
   toast('OCR-Vorschläge übernommen. Bitte Vertrag prüfen, Unterschriften ergänzen und speichern.');
 },60);
}

function syncSponsorFields(){const n=document.getElementById('contract-sponsor')?.value||'';const s=SPONSOR_OPTIONS[n];const el=document.getElementById('sponsor-preview');if(!el)return;if(!s){el.innerHTML='';return}el.innerHTML=`<b>${esc(n)}</b><span>Sofortzahlung ${money(s.upfront)} · Saisonziel ${money(s.season)} · Rennziel ${money(s.race)}</span><small>Saisonziel: ${esc(s.seasonGoal)} · Rennziele: ${s.raceGoals.map(esc).join(' · ')}</small>`;}
function syncContractChief(){const t=document.getElementById('contract-team')?.value;const c=teams.find(x=>x.name===t)?.chief||'';const el=document.getElementById('contract-chief');if(el&&!el.value)el.value=c;}
function contractSeasonOffset(season,offset){const m=String(season||'').match(/^(\d{2})\/(\d{2})$/);if(!m)return season;return `${String(Number(m[1])+offset).padStart(2,'0')}/${m[2]}`}
function contractSeasonStats(driver,season,division){
 const rows=seasonInfo(season,division).rows||[]; const row=rows.find(x=>normDriver(x.name)===normDriver(driver));
 return {position:row?rows.indexOf(row)+1:0,points:Number(row?.points||0),races:Number(row?.races||0)};
}
function seasonCompleteForContract(season){const meta=SEASON_META.seasons[season];return !!meta&&(meta.status==='archived'||meta.status==='completed'||meta.status==='finished'||uniqueSeasonRounds(season)>=12)}
function evaluateContractExtension(c){
 const ext=c.extension;if(!c||!ext?.enabled||c.extensionTriggered||!seasonCompleteForContract(c.season))return false;
 const st=contractSeasonStats(c.driver,c.season,c.division), checks=[];
 if(ext.positionEnabled)checks.push(st.position>0&&st.position<=Number(ext.position||1));
 if(ext.pointsEnabled)checks.push(st.points>=Number(ext.points||1));
 if(ext.racesEnabled)checks.push(st.races>=Number(ext.races||1));
 if(!checks.length||!checks.every(Boolean))return false;
 const next=contractSeasonOffset(c.season,Number(c.durationSeasons||1));
 const target=contractSeasonOffset(next,Number(ext.duration||1)-1);
 if(contracts.some(x=>!x.draft&&normDriver(x.driver)===normDriver(c.driver)&&x.season===next&&x.autoExtensionOf===c.id))return false;
 const copy={...c,id:crypto.randomUUID?crypto.randomUUID():'contract-'+Date.now(),season:next,durationSeasons:Number(ext.duration||1),autoExtensionOf:c.id,extensionTriggered:false,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),status:'Aktiv'};
 delete copy.draft; contracts.push(copy); c.extensionTriggered=true;c.extensionTriggeredAt=new Date().toISOString();c.extensionResult=st;
 return true;
}
function syncContractExtensions(){let made=0;contracts.filter(c=>c&&!c.draft).forEach(c=>{if(evaluateContractExtension(c))made++});return made}
function saveContract(existingId){
 if(!requireEditor())return;
 const driver=document.getElementById('contract-driver').value,season=document.getElementById('contract-season').value,team=document.getElementById('contract-team').value,division=document.getElementById('contract-div').value;
 const startDate=document.getElementById('contract-start-date').value,endDate=document.getElementById('contract-end-date').value,durationSeasons=Number(document.getElementById('contract-duration').value)||1;
 if(!driver||!team){toast('Fahrer und Team sind erforderlich.');return} if(startDate&&endDate&&endDate<startDate){toast('Vertragsende darf nicht vor Vertragsbeginn liegen.');return}
 const linkedDriver=ensureDriverFromContract(driver,team,division), existing=existingId?contracts.find(c=>c.id===existingId):null;
 const ext={enabled:!!document.getElementById('contract-ext-enabled')?.checked,duration:Number(document.getElementById('contract-ext-duration')?.value)||1,positionEnabled:!!document.getElementById('contract-ext-position')?.checked,position:Math.max(1,Math.min(250,Number(document.getElementById('contract-ext-position-value')?.value)||1)),pointsEnabled:!!document.getElementById('contract-ext-points')?.checked,points:Math.max(1,Math.min(250,Number(document.getElementById('contract-ext-points-value')?.value)||1)),racesEnabled:!!document.getElementById('contract-ext-races')?.checked,races:Math.max(1,Math.min(250,Number(document.getElementById('contract-ext-races-value')?.value)||1))};
 const specialCondition={enabled:!!document.getElementById('contract-special-enabled')?.checked,points:Math.max(1,Math.min(250,Number(document.getElementById('contract-special-points')?.value)||1))};
 const payload={driver:normDriver(linkedDriver||driver),season,team,division,teamChief:document.getElementById('contract-chief').value.trim(),startDate,endDate,durationSeasons,extension:ext,specialCondition,sponsor:document.getElementById('contract-sponsor').value.trim(),sponsorLogo:document.getElementById('contract-sponsor-logo').value.trim(),salary:document.getElementById('contract-salary').value.trim(),specialPayment:document.getElementById('contract-special').value.trim(),severance:document.getElementById('contract-severance').value.trim(),releaseClause:document.getElementById('contract-release').value.trim(),specialAgreement:document.getElementById('contract-special-agreement').value.trim(),signatureDriver:document.getElementById('contract-sign-driver').value.trim()||normDriver(linkedDriver||driver),contractImages:existing?.contractImages||[],signatureChief:document.getElementById('contract-sign-chief').value.trim()||document.getElementById('contract-chief').value.trim(),value:document.getElementById('contract-salary').value.trim(),updatedAt:new Date().toISOString(),status:existing?.status||'Aktiv'};
 payload.id=existingId||''; const conflicts=contracts.filter(c=>c.id!==existingId&&c.status!=='Beendet'&&!c.draft&&contractOverlap(payload,c));if(conflicts.length){const c=conflicts[0];toast(`⚠️ Vertragsüberschneidung: ${c.team} · ${c.season} · ${c.division}`);return}
 const idx=contracts.findIndex(c=>c.id===existingId);if(idx>=0){payload.id=existingId;payload.createdAt=contracts[idx].createdAt;contracts[idx]={...contracts[idx],...payload};}else{payload.id=crypto.randomUUID?crypto.randomUUID():'contract-'+Date.now();payload.createdAt=new Date().toISOString();contracts.push(payload)}
 const assigned=teams.find(t=>t.name===team);
 teams.forEach(t=>{t.d1=t.d1.filter(n=>normDriver(n)!==normDriver(payload.driver));t.d2=t.d2.filter(n=>normDriver(n)!==normDriver(payload.driver));});
 const arr=division==='Div 1'?assigned?.d1:assigned?.d2; if(arr&&arr.length<2)arr.push(payload.driver); const meta=driverMeta[payload.driver]||{};meta.team=team;meta.division=division;meta.status='Stammfahrer';driverMeta[payload.driver]=meta;
 syncDriverContractFinance(payload); repairContracts(); syncContractExtensions(); save(); closeModal(); renderTeams(); initDriverOverview(); renderFinance(); openDriver(payload.driver); toast(existingId?'Vertrag aktualisiert · Fahrer/Team automatisch synchronisiert.':'Vertrag gespeichert · Fahrer als Stammfahrer dem Vertragsteam zugeordnet.');
}
function deleteContract(id){if(!requireEditor())return;if(!confirm('Diesen Vertrag wirklich löschen?'))return;removeDriverContractFinance(id);contracts=contracts.filter(c=>c.id!==id);save();toast('Vertrag gelöscht und verknüpfte Fahrer-Finanzbuchungen entfernt.');}
function parseMoneyValue(v){
 const raw=String(v??'').trim(); if(!raw)return 0;
 const cleaned=raw.replace(/€/g,'').replace(/\s/g,'').replace(/\./g,'').replace(/,/g,'.').replace(/[^0-9.\-]/g,'');
 const n=Number(cleaned); return Number.isFinite(n)?n:0;
}
function sponsorPaymentKey(contractId,type,ref=''){return `${contractId}|${type}|${ref}`}
function sponsorResultForContract(contract,r){
 const x=r.results.find(x=>normDriver(x.name)===normDriver(contract.driver));
 if(!x)return null;
 const pos=r.results.indexOf(x)+1, grid=Number(x.grid||0), status=statusOfResult(x), penalty=Number(x.penSec||0)>0||Number(x.tl||0)>0||!!x.penaltyNote||!!x.penaltyImage;
 return {x,pos,grid,status,penalty};
}
function sponsorRaceGoalMet(goal,o,r){
 if(!o)return false;
 const g=goal.toLowerCase();
 if(g.includes('rennensieg'))return o.status==='RESULT'&&o.pos===1;
 const top=g.match(/top\s*(\d+)/); if(top&&g.includes('rennen'))return o.status==='RESULT'&&o.pos<=Number(top[1]);
 const qtop=g.match(/top\s*(\d+)/); if(qtop&&g.includes('qualifying'))return o.grid>0&&o.grid<=Number(qtop[1]);
 if(g.includes('keine zeitstrafe')||g.includes('keine strafe'))return !o.penalty;
 if(g==='q2'||g.includes(' q2'))return o.grid>0&&o.grid<=15;
 if(g.includes('nicht letzter in q2'))return o.grid>0&&o.grid<=15;
 if(g.includes('punkteplatzierung'))return o.status==='RESULT'&&o.pos<=15;
 if(g.includes('top 18 im rennen + qualifying'))return o.status==='RESULT'&&o.pos<=18&&o.grid>0&&o.grid<=18;
 if(g.includes('nicht letzter in qualifying + rennen'))return o.status==='RESULT'&&o.pos<r.results.length&&o.grid>0&&o.grid<r.results.length;
 if(g.includes('nicht dnf/dsq'))return o.status==='RESULT';
 return null;
}
function sponsorSeasonGoalMet(contract,rows){
 const sp=SPONSOR_OPTIONS[contract?.sponsor]; if(!sp)return false;
 const valid=rows.filter(o=>o.status==='RESULT');
 const points=rows.reduce((a,o)=>a+pointsForPosition(o.pos,o.status),0);
 const wins=valid.filter(o=>o.pos===1).length;
 const podiums=valid.filter(o=>o.pos<=3).length;
 const avg=valid.length?valid.reduce((a,o)=>a+o.pos,0)/valid.length:null;
 const g=sp.seasonGoal.toLowerCase();
 if(g==='fahrer-wm'){
   const all=seasonRaces(contract.season).flatMap(r=>r.results.map((x,i)=>({name:x.name,pos:i+1,status:statusOfResult(x)}))).filter(o=>o.status==='RESULT');
   const totals={};all.forEach(o=>totals[normDriver(o.name)]=(totals[normDriver(o.name)]||0)+pointsForPosition(o.pos,o.status));
   const best=Object.entries(totals).sort((a,b)=>b[1]-a[1])[0];return !!best&&normDriver(best[0])===normDriver(contract.driver);
 }
 let m=g.match(/(\d+) rennsiege/);if(m)return wins>=Number(m[1]);
 m=g.match(/(\d+) podium/);if(m)return podiums>=Number(m[1]);
 m=g.match(/mindestens (\d+) f-wm-punkte/);if(m)return points>=Number(m[1]);
 m=g.match(/durchschnittsplatzierung p(\d+)/);if(m)return avg!==null&&avg<=Number(m[1]);
 return false;
}
function sponsorEvaluation(contract){
 const rs=seasonRaceList(contract.season||seasonState.current).filter(r=>r.division===contract.division);
 const rows=rs.map(r=>{const o=sponsorResultForContract(contract,r);return o?{...o,r}:null}).filter(Boolean);
 const sp=SPONSOR_OPTIONS[contract.sponsor]; if(!sp)return {rows:[],seasonMet:false,raceMet:0,raceTotal:0,seasonPaid:false,upfrontPaid:false};
 const raceStates=rows.map(o=>({race:o.r,met:sp.raceGoals.length?sp.raceGoals.every(g=>sponsorRaceGoalMet(g,o,o.r)):false,goals:sp.raceGoals.map(g=>({goal:g,met:sponsorRaceGoalMet(g,o,o.r)}))}));
 const seasonMet=sponsorSeasonGoalMet(contract,rows);
 const payments=Object.entries(sponsorPayments).filter(([k])=>k.startsWith(`${contract.id}|`)).map(([k,v])=>({key:k,...v}));
 return {rows,raceStates,seasonMet,raceMet:raceStates.filter(x=>x.met).length,raceTotal:raceStates.length,upfrontPaid:payments.some(p=>p.type==='upfront'),seasonPaid:payments.some(p=>p.type==='season'),racePaid:payments.filter(p=>p.type==='race').length};
}
function recordSponsorPayment(contract,type,ref='',amount=0){
 const key=sponsorPaymentKey(contract.id,type,ref);if(sponsorPayments[key])return false;
 sponsorPayments[key]={contractId:contract.id,type,ref,amount:Number(amount)||0,at:new Date().toISOString(),season:contract.season,driver:contract.driver,team:contract.team,sponsor:contract.sponsor};return true;
}
function openSponsorFinance(){
 if(!requireEditor())return;
 const season=seasonState.current||'02/26'; const list=contracts.filter(c=>c.season===season&&c.sponsor&&c.status!=='Beendet');
 const rows=list.map(c=>{const sp=SPONSOR_OPTIONS[c.sponsor],e=sponsorEvaluation(c);const upfront=!e.upfrontPaid,seasonReady=e.seasonMet&&!e.seasonPaid;const raceReady=e.raceStates.filter((x)=>x.met&&!sponsorPayments[sponsorPaymentKey(c.id,'race',String(x.r.number||x.r.round||x.r.id||''))]);return `<div class="sponsor-fin-row"><div><b>${esc(c.driver)}</b><small>${esc(c.team)} · ${esc(c.division)} · ${esc(c.sponsor)}</small></div><span>${upfront?'💶 Sofortzahlung offen':'✓ Sofortzahlung'}</span><span>${seasonReady?'🏆 Saisonziel erreicht':e.seasonPaid?'✓ Saisonbonus ausgezahlt':`Saisonziel ${esc(sp.seasonGoal)} · ${e.seasonMet?'✓':'offen'}`}</span><span>${raceReady.length} Rennzahlungen offen</span><button class="mini-link" onclick="openSponsorContractFinance('${esc(c.id)}')">Details</button></div>`}).join('')||'<div class="empty-race">Keine Fahrersponsoren für diese Saison.</div>';
 document.getElementById('modal-content').innerHTML=`<div class="modal-head"><div><h2>🤝 Sponsoren-Auswertung · ${esc(season)}</h2><p class="race-edit-note">Grid-Position wird gemäß DoG-Regel als Start-/Qualifying-Position verwendet.</p></div><button onclick="closeModal()">×</button></div><div class="sponsor-finance-list">${rows}</div><div class="modal-actions"><button class="ghost" onclick="closeModal()">Fertig</button></div>`;openModal();
}
function openSponsorContractFinance(id){
 const c=contracts.find(x=>x.id===id);if(!c)return;const sp=SPONSOR_OPTIONS[c.sponsor],e=sponsorEvaluation(c);const seasonReady=e.seasonMet&&!e.seasonPaid;const raceRows=e.raceStates.map((x,i)=>{const ref=String(x.r.number||x.r.round||x.r.id||i+1),paid=!!sponsorPayments[sponsorPaymentKey(c.id,'race',ref)];return `<div class="sponsor-pay-row"><span><b>R${esc(ref)}</b> · ${esc(x.r.track)}</span><span>${x.goals.map(g=>`${g.met?'✓':'✕'} ${esc(g.goal)}`).join(' · ')}</span><b>${x.met?'Bereit':'Nicht erfüllt'}</b>${x.met&&!paid&&isEditor()?`<button class="mini-link" onclick="paySponsor('${esc(c.id)}','race','${esc(ref)}')">Auszahlen ${money(sp.race)}</button>`:paid?'<span>✓ ausgezahlt</span>':''}</div>`}).join('');
 document.getElementById('modal-content').innerHTML=`<div class="modal-head"><div><h2>🤝 ${esc(c.sponsor)} · ${esc(c.driver)}</h2><p class="race-edit-note">${esc(c.team)} · ${esc(c.division)} · ${esc(c.season)}</p></div><button onclick="openSponsorFinance()">×</button></div><div class="sponsor-detail"><div class="sponsor-detail-card"><b>Sofortzahlung</b><span>${e.upfrontPaid?'✓ bereits verbucht':isEditor()?`<button class="mini-link" onclick="paySponsor('${esc(c.id)}','upfront','start')">Auszahlen ${money(sp.upfront)}</button>`:'offen'}</span></div><div class="sponsor-detail-card"><b>Saisonziel · ${esc(sp.seasonGoal)}</b><span>${e.seasonMet?'✓ erreicht':'offen'}${e.seasonMet&&e.seasonPaid?' · ✓ ausgezahlt':''}${e.seasonMet&&!e.seasonPaid&&isEditor()?` · <button class="mini-link" onclick="paySponsor('${esc(c.id)}','season','goal')">${money(sp.season)} auszahlen</button>`:''}</span></div></div><h3>Rennziele</h3><div class="sponsor-pay-list">${raceRows||'<div class="empty-race">Noch keine Rennen erfasst.</div>'}</div><div class="modal-actions"><button class="ghost" onclick="openSponsorFinance()">Zurück</button></div>`;
 openModal();
}
function paySponsor(contractId,type,ref){if(!requireEditor())return;const c=contracts.find(x=>x.id===contractId);if(!c||!SPONSOR_OPTIONS[c.sponsor])return;const sp=SPONSOR_OPTIONS[c.sponsor],e=sponsorEvaluation(c);let amount=0;if(type==='upfront'){if(e.upfrontPaid)return;amount=sp.upfront}else if(type==='season'){if(!e.seasonMet||e.seasonPaid)return;amount=sp.season}else if(type==='race'){const state=e.raceStates.find(x=>String(x.r.number||x.r.round||x.r.id||'')===String(ref));if(!state||!state.met||sponsorPayments[sponsorPaymentKey(c.id,'race',String(ref))])return;amount=sp.race}else return;if(recordSponsorPayment(c,type,ref,amount)){financeAddTransaction({season:c.season,team:c.team,driver:c.driver,contractId:c.id,type:'sponsor_'+type,description:`Sponsor ${c.sponsor} · ${type==='upfront'?'Sofortzahlung':type==='season'?'Saisonziel':'Rennziel '+ref}`,amount});save();toast(`${c.sponsor}: ${money(amount)} als Zahlung verbucht.`);openSponsorContractFinance(c.id);renderFinance();}}
function financeTxId(){return 'ftx_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8)}
function financeAddTransaction({season=seasonState.current||'02/26',team,description,type='manual',amount=0,driver='',contractId='',date=new Date().toISOString()}){
 const n=Number(amount)||0;if((!team&&!driver)||!n)return false;
 financeTransactions.push({id:financeTxId(),season,team,description,type,amount:n,driver,contractId,date});return true;
}
function financeTeamBalance(teamName,season=seasonState.current||'02/26'){
 const opening=Number(financeOpeningBalances[season]?.[teamName]||0);
 const tx=financeTransactions.filter(t=>t.season===season&&t.team===teamName);
 return {opening,income:tx.filter(t=>t.amount>0).reduce((a,t)=>a+t.amount,0),expense:tx.filter(t=>t.amount<0).reduce((a,t)=>a+Math.abs(t.amount),0),balance:opening+tx.reduce((a,t)=>a+t.amount,0),transactions:tx.sort((a,b)=>String(b.date).localeCompare(String(a.date)))};
}
function openFinanceLedger(teamName,season=seasonState.current||'02/26'){
 const b=financeTeamBalance(teamName,season), rows=b.transactions.map(t=>`<div class="finance-tx-row"><span>${esc(new Date(t.date).toLocaleDateString('de-DE'))}</span><span><b>${esc(t.description)}</b><small>${esc(t.driver||'')} · ${esc(t.type)}</small></span><span class="${t.amount>=0?'tx-in':'tx-out'}">${t.amount>=0?'+':''}${money(t.amount)}</span>${isEditor()?`<span class="finance-row-actions"><button class="mini-link" onclick="openFinanceTxEditor('${esc(t.id)}','team','${esc(teamName)}','${esc(season)}')">✏️</button><button class="mini-link" onclick="deleteFinanceTransaction('${esc(t.id)}','team','${esc(teamName)}','${esc(season)}')">🗑️</button></span>`:''}</div>`).join('')||'<div class="empty-race">Noch keine Buchungen vorhanden.</div>';
 document.getElementById('modal-content').innerHTML=`<div class="modal-head"><div><h2>📒 Finanzkonto · ${esc(teamName)}</h2><p class="race-edit-note">Saison ${esc(season)} · Tatsächliche Buchungen, getrennt vom Planbudget.</p></div><button onclick="closeModal()">×</button></div><div class="ledger-summary"><div><span>Startguthaben</span><b>${money(b.opening)}</b></div><div><span>Einnahmen</span><b>${money(b.income)}</b></div><div><span>Ausgaben</span><b>${money(b.expense)}</b></div><div><span>Kontostand</span><b>${money(b.balance)}</b></div></div><div class="modal-actions">${isEditor()?`<button class="ghost" onclick="openFinanceOpening('${esc(teamName)}','${esc(season)}')">Startguthaben</button><button class="primary" onclick="openFinanceTransaction('${esc(teamName)}','${esc(season)}')">➕ Buchung</button>`:''}</div><div class="finance-ledger">${rows}</div><div class="modal-actions"><button class="ghost" onclick="closeModal()">Fertig</button></div>`;openModal();
}
function openFinanceOpening(teamName,season){if(!requireEditor())return;const current=Number(financeOpeningBalances[season]?.[teamName]||0);document.getElementById('modal-content').innerHTML=`<div class="modal-head"><div><h2>💰 Startguthaben · ${esc(teamName)}</h2><p class="race-edit-note">Tatsächlicher Anfangsbestand des Finanzkontos für ${esc(season)}.</p></div><button onclick="openFinanceLedger('${esc(teamName)}','${esc(season)}')">×</button></div><div class="new-driver-form single"><label>Startguthaben<input id="finance-opening-value" value="${current||0}" inputmode="numeric" placeholder="0"></label></div><div class="modal-actions"><button class="ghost" onclick="openFinanceLedger('${esc(teamName)}','${esc(season)}')">Abbrechen</button><button class="primary" onclick="saveFinanceOpening('${esc(teamName)}','${esc(season)}')">✓ Speichern</button></div>`;openModal();}
function saveFinanceOpening(teamName,season){if(!requireEditor())return;const n=parseMoneyValue(document.getElementById('finance-opening-value')?.value||0);if(!financeOpeningBalances[season])financeOpeningBalances[season]={};financeOpeningBalances[season][teamName]=n;save();toast('Startguthaben gespeichert.');openFinanceLedger(teamName,season);renderFinance();}
function openFinanceTransaction(teamName,season){if(!requireEditor())return;document.getElementById('modal-content').innerHTML=`<div class="modal-head"><div><h2>➕ Finanzbuchung · ${esc(teamName)}</h2><p class="race-edit-note">Positive Beträge = Einnahme · negative Beträge = Ausgabe.</p></div><button onclick="openFinanceLedger('${esc(teamName)}','${esc(season)}')">×</button></div><div class="new-driver-form"><label>Beschreibung<input id="finance-tx-desc" placeholder="z. B. Startgeld, Strafe, Prämie"></label><label>Betrag<input id="finance-tx-amount" inputmode="numeric" placeholder="1500000 oder -500000"></label><label>Datum<input id="finance-tx-date" type="date" value="${new Date().toISOString().slice(0,10)}"></label><label>Typ<select id="finance-tx-type"><option value="manual">Manuell</option><option value="income">Einnahme</option><option value="expense">Ausgabe</option></select></label></div><div class="modal-actions"><button class="ghost" onclick="openFinanceLedger('${esc(teamName)}','${esc(season)}')">Abbrechen</button><button class="primary" onclick="saveFinanceTransaction('${esc(teamName)}','${esc(season)}')">✓ Buchen</button></div>`;openModal();}
function saveFinanceTransaction(teamName,season){if(!requireEditor())return;const desc=document.getElementById('finance-tx-desc')?.value.trim();let amount=parseMoneyValue(document.getElementById('finance-tx-amount')?.value||0);const type=document.getElementById('finance-tx-type')?.value||'manual';if(!desc||!amount){toast('Beschreibung und Betrag erforderlich.');return}if(type==='expense'&&amount>0)amount=-amount;if(type==='income'&&amount<0)amount=Math.abs(amount);if(financeAddTransaction({season,team:teamName,description:desc,type,amount,date:new Date((document.getElementById('finance-tx-date')?.value||'')+'T12:00:00').toISOString()})){save();toast('Finanzbuchung gespeichert.');openFinanceLedger(teamName,season);renderFinance();}}
function sponsorFinanceSummary(season=seasonState.current||'02/26'){
 const payments=Object.values(sponsorPayments).filter(p=>p.season===season);return {upfront:payments.filter(p=>p.type==='upfront').reduce((a,p)=>a+p.amount,0),race:payments.filter(p=>p.type==='race').reduce((a,p)=>a+p.amount,0),season:payments.filter(p=>p.type==='season').reduce((a,p)=>a+p.amount,0),total:payments.reduce((a,p)=>a+p.amount,0)};
}

function financeContracts(season=seasonState.current||'02/26'){
 return contracts.filter(c=>c.season===season);
}
function financeTeamSummary(teamName,season=seasonState.current||'02/26'){
 const list=financeContracts(season).filter(c=>c.team===teamName);
 const active=list.filter(c=>c.status!=='Beendet');
 const salary=active.reduce((a,c)=>a+parseMoneyValue(c.salary||c.value),0);
 const special=active.reduce((a,c)=>a+parseMoneyValue(c.specialPayment),0);
 const severance=active.reduce((a,c)=>a+parseMoneyValue(c.severance),0);
 const release=active.reduce((a,c)=>a+parseMoneyValue(c.releaseClause),0);
 const committed=salary+special;
 const loanCosts=financeTeamBalance(teamName,season).transactions.filter(t=>t.type==='replacement_loan').reduce((a,t)=>a+Math.abs(Number(t.amount)||0),0);
 return {list,active,salary,special,severance,release,committed,loanCosts,budget:Number(financeBudgets[season]?.[teamName]||0)};
}
function financeMoneyOrDash(n){return n?money(n):'—'}
function openFinanceBudget(teamName,season){
 if(!requireEditor())return; const cap=Number(financeBudgets[season]?.[teamName]||0); const used=Number(financeCapUsage[season]?.[teamName]||0);
 document.getElementById('modal-content').innerHTML=`<div class="modal-head"><div><h2>📊 Budget-Cap · ${esc(teamName)}</h2><p class="race-edit-note">Der Budget-Cap wird getrennt vom normalen Team-Finanzkonto geführt.</p></div><button onclick="closeModal()">×</button></div><div class="new-driver-form"><label>Budget-Cap<input id="finance-budget-value" value="${cap||0}" inputmode="numeric" placeholder="450000000"></label><label>Vom Cap verbraucht<input id="finance-cap-used" value="${used||0}" inputmode="numeric" placeholder="0"></label></div><div class="finance-note">Verfügbarer Cap: <b>${money(Math.max(0,cap-used))}</b>. Was genau auf den Cap angerechnet wird, legen wir separat nach euren DoG-Regeln fest.</div><div class="modal-actions"><button class="ghost" onclick="closeModal()">Abbrechen</button><button class="primary" onclick="saveFinanceBudget('${esc(teamName)}','${esc(season)}')">✓ Cap speichern</button></div>`;openModal();
}
function saveFinanceBudget(teamName,season){
 if(!requireEditor())return; const cap=parseMoneyValue(document.getElementById('finance-budget-value')?.value||0); const used=parseMoneyValue(document.getElementById('finance-cap-used')?.value||0); if(!financeBudgets[season])financeBudgets[season]={};if(!financeCapUsage[season])financeCapUsage[season]={}; financeBudgets[season][teamName]=cap; financeCapUsage[season][teamName]=Math.max(0,used); save(); closeModal(); renderFinance(); toast('Budget-Cap gespeichert.');
}
function renderFinance(){
 const season=seasonState.current||'02/26'; const wrap=document.getElementById('finance-content'); if(!wrap)return;
 const summaries=teams.map(t=>({team:t.name,...financeTeamSummary(t.name,season),ledger:financeTeamBalance(t.name,season)}));
 const totalSalary=summaries.reduce((a,x)=>a+x.salary,0), totalSpecial=summaries.reduce((a,x)=>a+x.special,0), totalCommitted=totalSalary+totalSpecial; const sponsorFin=sponsorFinanceSummary(season);
 const cards=summaries.map(x=>{
   const cap=x.budget; const capUsed=Number(financeCapUsage[season]?.[x.team]||0); const capAvailable=Math.max(0,cap-capUsed);
   const budgetLine=cap?`<span class="finance-budget">Budget-Cap ${money(cap)} · verbraucht ${money(capUsed)} · verfügbar ${money(capAvailable)}</span>`:`<span class="finance-budget">Kein Budget-Cap hinterlegt</span>`;
   const contracts=x.list.length?x.list.map(c=>`<div class="finance-contract-row"><span><b>${esc(c.driver)}</b><small>${esc(c.division||'—')} · gesamte Saison</small></span><span>${financeMoneyOrDash(parseMoneyValue(c.salary||c.value))}</span><span>${financeMoneyOrDash(parseMoneyValue(c.specialPayment))}</span><button class="mini-link" onclick="openContractEditor('${esc(c.driver)}','${esc(c.id)}')">Vertrag</button></div>`).join(''):`<div class="empty-race">Keine Verträge für diese Saison.</div>`;
   return `<div class="finance-team-card"><div class="finance-team-head"><div><h3>${esc(x.team)}</h3><p>${esc(teams.find(t=>t.name===x.team)?.chief||'ohne Teamchef')}</p></div><div class="finance-team-actions">${isEditor()?`<button class="team-edit-btn" onclick="openFinanceBudget('${esc(x.team)}','${esc(season)}')">💰 Budget</button>`:''}<button class="team-edit-btn" onclick="openTeamContracts('${esc(x.team)}')">📋 Verträge</button><button class="team-edit-btn" onclick="openFinanceLedger('${esc(x.team)}','${esc(season)}')">📒 Konto</button><button class="team-edit-btn" onclick="openLoanList('${esc(x.team)}')">🤝 Leihen</button></div></div><div class="finance-metrics"><div><span>Kontostand</span><b>${money(x.ledger.balance)}</b></div><div><span>Einnahmen</span><b>${money(x.ledger.income)}</b></div><div><span>Ausgaben</span><b>${money(x.ledger.expense)}</b></div><div><span>Gehälter</span><b>${financeMoneyOrDash(x.salary)}</b></div><div><span>Sonderzahlungen</span><b>${financeMoneyOrDash(x.special)}</b></div><div><span>Vertragliche Bindung</span><b>${financeMoneyOrDash(x.committed)}</b></div><div><span>Ersatzfahrer-Leihen</span><b>${financeMoneyOrDash(x.loanCosts)}</b></div><div><span>Abfindungen*</span><b>${financeMoneyOrDash(x.severance)}</b></div><div><span>Ausstiegsklauseln*</span><b>${financeMoneyOrDash(x.release)}</b></div></div>${budgetLine}${x.budget?`<div class="finance-bar"><span style="width:${Math.min(100,(capUsed/x.budget)*100)}%"></span></div>`:''}<div class="finance-contracts"><div class="finance-contract-head"><span>FAHRER</span><span>GEHALT</span><span>SONDERZAHLUNG</span><span></span></div>${contracts}</div><small class="finance-foot">* Potenzielle Vertragswerte, keine automatisch fälligen Zahlungen.</small></div>`;
 }).join('');
 wrap.innerHTML=`<div class="section-head finance-section-head"><div><h3>💰 Finanzen · ${esc(season)}</h3><p>Normale Teamfinanzen und Budget-Cap werden getrennt geführt. Fahrer tragen ihre eigenen Punktkosten.</p></div><div class="finance-total"><span>Gehälter</span><b>${financeMoneyOrDash(totalSalary)}</b><small>+ Sonderzahlungen ${financeMoneyOrDash(totalSpecial)}</small></div></div><div class="finance-sponsor-summary"><div><span>Sponsor Sofortzahlungen</span><b>${money(sponsorFin.upfront)}</b></div><div><span>Sponsor Rennziele</span><b>${money(sponsorFin.race)}</b></div><div><span>Sponsor Saisonziel</span><b>${money(sponsorFin.season)}</b></div><div><span>Gesamt Sponsor</span><b>${money(sponsorFin.total)}</b></div>${isEditor()?'<button class="primary" onclick="openSponsorFinance()">🤝 Sponsoren auswerten</button><button class="ghost" onclick="openLoanList()">🤝 Ersatzfahrer-Leihen</button>':''}</div><div class="finance-note">ℹ️ Abfindung und Ausstiegsklausel werden bewusst als <b>potenzielle Verpflichtung</b> angezeigt. Sie werden nicht automatisch vom Budget abgezogen.</div><div class="finance-grid">${cards}</div>`; const cat=document.getElementById('sponsor-catalog'); if(cat)renderSponsorCatalog();
}
function openDriverContracts(driverName){
 const list=contracts.filter(c=>normDriver(c.driver)===normDriver(driverName)).sort((a,b)=>String(b.season).localeCompare(String(a.season),'de'));
 const rows=list.length?list.map(c=>`<div class="contract-row"><span><b>${esc(c.season||'—')}</b> · ${esc(c.team||'—')}</span><span>${esc(c.division||'—')}</span><span>${esc(c.startDate||'—')} → ${esc(c.endDate||'—')}</span><button class="mini-link" onclick="openContractViewer('${esc(c.id)}')">👁️ Ansehen</button>${isEditor()?`<button class="mini-link" onclick="openContractEditor('${esc(c.driver)}','${esc(c.id)}')">✏️ Bearbeiten</button>`:''}</div>`).join(''):'<div class="empty-race">Noch kein Vertrag gespeichert.</div>';
 document.getElementById('modal-content').innerHTML=`<div class="modal-head"><div><h2>📄 Verträge · ${esc(driverName)}</h2><p class="race-edit-note">Gespeicherte Verträge bleiben hier jederzeit einsehbar und bearbeitbar.</p></div><button onclick="closeModal()">×</button></div><div class="contract-history">${rows}</div><div class="modal-actions">${isEditor()?`<button class="primary" onclick="openContractEditor('${esc(driverName)}')">➕ Vertrag hinzufügen</button>`:''}<button class="ghost" onclick="closeModal()">Fertig</button></div>`;openModal();
}
function openDriver(name){if(!name)return;const c=calcDriver(name),s=driverRaceStats(name),history=getMarketHistory(name,c.mw),team=driverTeam(name)||'Free Agent',vehicles=driverVehicleHistory(name),finishRate=s.races?((s.races-s.dnf-s.dsq)/s.races*100):0;document.getElementById('driver-profile').innerHTML=`<div class="profile-card"><div class="profile-headline"><div><div class="eyebrow">FAHRERAKTE · AKTUELLER STAND</div><div class="profile-name">${esc(normDriver(name))} ${driverFlag(name)?`<img class="driver-flag" src="${driverFlag(name)}" alt="${esc(nationalityInfo(name)?.name||'Nationalität')}" title="${esc(nationalityInfo(name)?.name||'Nationalität')}">`:nationalityInfo(name)?`<span class="driver-nationality-fallback" title="${esc(nationalityInfo(name).name)}">${nationalityInfo(name).emoji}</span>`:''} ${driverNumber(name)?`<span class="driver-number-badge">#${driverNumber(name)}</span>`:''}</div><div class="profile-sub">${nationalityLabel(name)?esc(nationalityLabel(name))+' · ':''}${esc(team)} · ${esc(currentDivision(name))} · ${esc(getStatus(name))} · ${driverRoleLabel(name)}</div></div><div class="profile-select"><button class="ghost mini-edit" onclick="openDriverFinance('${esc(name)}')">💰 Finanzen</button><button class="ghost mini-edit" onclick="openDriverContracts('${esc(name)}')">📄 Vertrag</button></div><button class="ghost mini-edit" onclick="openDriverEditor('${esc(name)}')">✏️ Bearbeiten</button></div><div class="profile-hero"><img class="profile-team-car-image" src="${esc(driverCar(team))}" alt="${esc(team)} Fahrzeug"><div class="profile-main"><div class="avatar">♙</div><div><div class="profile-teamline">${esc(team)}</div><div class="profile-car-inline"><img src="${driverCar(team)}" onerror="this.style.display='none'"><span>aktuelles Fahrzeug</span></div></div></div><div class="profile-score-side"><div class="current-rating"><span>OVA · GESAMT</span><b>${c.ova}</b></div><div class="profile-ratings">${[['REN',c.ren],['PER',c.per],['TEM',c.tem],['AMK',c.amk],['ERF',c.erf]].map(x=>`<div class="rating"><span>${x[0]}</span><b>${x[1]}</b></div>`).join('')}</div></div></div><div class="market-wrap"><div><h3>📈 Marktwert-Entwicklung</h3><div class="chart">${marketChart(history)}</div></div><div class="market-current"><span>Aktueller Marktwert</span><strong>${money(c.mw)}</strong><div class="history-list">${history.map(h=>`<div>${esc(h.label)}: ${money(h.value)}</div>`).join('')}</div></div></div>${renderDriverLicenseCard(name)}<div class="profile-sections"><div class="profile-section"><h3>Erfolge</h3>${metric('Siege',s.wins)}${metric('Podien',s.podiums)}${metric('P4–P6',validCount(name,4,6))}${metric('P7–P10',validCount(name,7,10))}${metric('P11–P15',validCount(name,11,15))}</div><div class="profile-section"><h3>Rennleistung</h3>${metric('Positionsgewinne',s.gained)}${metric('Positionsverluste',s.lost)}${metric('Fahrer des Tages',countHighlight(name,'dotd'))}${metric('Meiste Überholmanöver',countHighlight(name,'overtakes'))}${metric('Start / Ziel gleich',s.same)}${metric('Ø Platzierung',s.avgPos?s.avgPos.toFixed(1).replace('.',','):'—')}</div><div class="profile-section"><h3>Zuverlässigkeit</h3>${metric('Rennen',s.races)}${metric('DNF',s.dnf)}${metric('DSQ',s.dsq)}${metric('TL',s.tl)}${metric('Nachträgliche Strafen',s.postPenalty)}${metric('Zielankunftsquote',finishRate.toFixed(2).replace('.',',')+'%')}</div></div><div class="profile-sections"><div class="profile-section"><h3>Qualifying</h3>${metric('Poles','—')}${metric('Top 3 Quali','—')}${metric('Ø Startposition',s.avgGrid?s.avgGrid.toFixed(1).replace('.',','):'—')}</div><div class="profile-section"><h3>Fahrerprofil</h3>${metric('Karrierephase',careerPhase(s.races))}${metric('DNA',driverDNA(c))}${metric('Stärke',strength(c))}</div><div class="profile-section vehicle-section"><h3>Gefahrene Fahrzeuge</h3><div class="vehicle-history">${vehicles.length?vehicles.map(v=>`<div class="vehicle-chip"><img src="${driverCar(v.team)}"><span>${esc(v.team)}</span><b>${v.count}×</b></div>`).join(''):'<span class="muted">Noch keine Renndaten</span>'}</div></div></div><div class="profile-section race-history-section"><div class="section-inline"><h3>🏁 Rennhistorie &amp; Strecken</h3></div>${renderDriverRaceHistory(name)}</div><div class="profile-section contract-section"><div class="section-inline"><h3>📋 Verträge &amp; Teamhistorie</h3>${isEditor()?`<button class="ghost mini-edit" onclick="openContractEditor('${esc(name)}')">➕ Vertrag</button>`:''}</div><div class="contract-history">${contractHistory(name).length?contractHistory(name).map(c=>{const isContract=c.source==='contract';return `<div class="contract-row"><span><b>${esc(c.season||'—')}</b> · ${esc(c.team||'—')}</span><span>${esc(c.division||'—')}</span><span>${isContract?'Vertrag gespeichert':'Rennhistorie'}</span><span>${c.salary||c.value?esc(c.salary||c.value):'—'}</span>${isContract&&isEditor()?`<button class="mini-link" onclick="openContractEditor('${esc(c.driver)}','${esc(c.id)}')">✏️ Ansehen / Bearbeiten</button><button class="mini-link" onclick="deleteContract('${esc(c.id)}')">Löschen</button>`:''}</div>`;}).join(''):'<span class="muted">Noch keine Vertrags-/Teamhistorie vorhanden.</span>'}</div></div></div></div>`}
function metric(label,value){return `<div class="metric-row"><span>${esc(label)}</span><b>${esc(value)}</b></div>`}
function validCount(name,min,max){return raceList().flatMap(r=>r.results.map((x,i)=>normDriver(x.name)===normDriver(name)?i+1:null)).filter(p=>p&&p>=min&&p<=max).length}
function countHighlight(name,key){return raceList().filter(r=>normDriver(r.highlights?.[key]||'')===normDriver(name)).length}
function careerPhase(r){if(r<=10)return'Newcomer';if(r<=20)return'Nachwuchsfahrer';if(r<=30)return'Etablierter Fahrer';if(r<=40)return'Routinierter Fahrer';if(r<=50)return'Elite Fahrer';if(r<=60)return'Veteran';return'Legende'}
function driverRaceHistory(name){
 const n=normDriver(name);
 return raceChronological().filter(r=>(r.results||[]).some(x=>normDriver(x.name)===n)).map(r=>{const x=r.results.find(y=>normDriver(y.name)===n);const pos=x?r.results.indexOf(x)+1:0;return {season:seasonOfRace(r),number:r.number||r.round||0,track:r.track||'—',date:r.raceDate||'',division:r.division||'—',pos,grid:Number(x?.grid||0),points:pointsForPosition(pos,statusOfResult(x||{})),team:x?.team||'—',status:statusOfResult(x||{})}}).sort((a,b)=>String(a.date||a.number).localeCompare(String(b.date||b.number))||Number(a.number)-Number(b.number));
}
function renderDriverRaceHistory(name){
 const rows=driverRaceHistory(name);
 if(!rows.length)return '<div class="muted">Noch keine Rennhistorie vorhanden.</div>';
 return `<div class="driver-race-history"><div class="driver-race-head"><span>DATUM</span><span>RUNDEN</span><span>STRECKE</span><span>DIV.</span><span>POS.</span><span>GRID</span><span>PKT.</span></div>${rows.map(r=>`<div class="driver-race-row"><span>${r.date?esc(new Date(r.date+'T12:00:00').toLocaleDateString('de-DE')):'—'}</span><span>R${esc(r.number)}</span><span><b>${esc(r.track)}</b></span><span>${esc(r.division)}</span><span>${r.pos}</span><span>${r.grid}</span><span>${r.points}</span></div>`).join('')}</div>`;
}

function driverDNA(c){if(c.ren>=c.tem+4)return'Racer';if(c.tem>=c.ren+4)return'Quali-König';if(c.per>=c.ren+4)return'Überholjäger';if(c.amk>=95)return'Konstanz';return'Allrounder'} function strength(c){return[['Rennpace',c.ren],['Performance',c.per],['Tempo',c.tem],['Aufmerksamkeit',c.amk],['Erfahrung',c.erf]].sort((a,b)=>b[1]-a[1])[0][0]}
function getMarketHistory(name,current){
 const chronological=raceChronological();
 const history=[{label:'Start 02/26',value:25000000}];
 const seen=new Set();
 chronological.forEach((r,idx)=>{
   const hasResult=(r.results||[]).some(x=>normDriver(x.name)===normDriver(name));
   if(!hasResult)return;
   const weekend=`${seasonOfRace(r)}|${r.number||r.round||0}|${r.track||''}`;
   if(seen.has(weekend))return;
   seen.add(weekend);
   const snaps=chronological.filter(x=>`${seasonOfRace(x)}|${x.number||x.round||0}|${x.track||''}`===weekend).map(x=>x.state?.driverValues?.[normDriver(name)]).filter(Boolean);
   const snap=snaps[0];
   if(snap) history.push({label:`R${r.number||r.round||idx+1} · ${r.track}`,value:snap.mw});
 });
 if(history.length===1)history[0].value=current;
 return history;
}

function marketChart(data){const vals=data.map(x=>x.value),min=Math.min(...vals)*.9,max=Math.max(...vals)*1.1,w=700,h=220,p=30;const pts=vals.map((v,i)=>`${p+(i*(w-2*p)/Math.max(1,vals.length-1))},${h-p-((v-min)/(max-min||1))*(h-2*p)}`).join(' ');return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><line x1="30" y1="190" x2="670" y2="190" stroke="#24434c"/><polyline points="${pts}" fill="none" stroke="#28d8e9" stroke-width="4"/>${vals.map((v,i)=>{const [x,y]=pts.split(' ')[i].split(',');return `<circle cx="${x}" cy="${y}" r="5" fill="#ffd45a"><title>${esc(data[i].label)}: ${money(v)}</title></circle>`}).join('')}<text x="30" y="210" fill="#78919a" font-size="11">${esc(data[0].label)}</text><text x="670" y="210" fill="#78919a" font-size="11" text-anchor="end">${esc(data[data.length-1].label)}</text></svg>`}
function standings(div,season=seasonState.current||'02/26'){
 const map={};
 seasonRaceList(season).filter(r=>r.division===div).sort((a,b)=>Number(a.number||0)-Number(b.number||0)).forEach(r=>r.results.forEach((x,i)=>{
  const n=normDriver(x.name); if(!map[n])map[n]={name:n,team:x.team,points:0,wins:0,podiums:0,races:0,rounds:[]};
  const st=statusOfResult(x); map[n].points+=pointsForPosition(i+1,st); if(st==='RESULT')map[n].races++; if(i===0&&st==='RESULT')map[n].wins++; if(i<3&&st==='RESULT')map[n].podiums++; map[n].rounds.push(Number(r.number||0));
 }));
 return Object.values(map).sort((a,b)=>b.points-a.points||b.wins-a.wins||b.podiums-a.podiums||a.name.localeCompare(b.name,'de'));
}
function seasonInfo(season,div){
 const rows=standings(div,season), meta=SEASON_META.seasons[season]||{}, races=seasonRaceList(season).filter(r=>r.division===div);
 const rounds=new Set(races.map(r=>r.number||r.round||r.track)).size;
 const completed=meta.status==='archived'||meta.status==='completed'||meta.status==='finished';
 return {rows,rounds,races: races.length,completed,leader:rows[0]||null};
}
function championBadge(info){
 if(!info.leader)return '';
 return info.completed?`<div class="champion-banner"><span>🏆</span><div><small>SAISONMEISTER</small><b>${esc(info.leader.name)}</b><span>${info.leader.points} Punkte · ${info.rounds} Rennwochenenden</span></div></div>`:`<div class="champion-banner provisional"><span>📈</span><div><small>AKTUELL FÜHREND</small><b>${esc(info.leader.name)}</b><span>${info.leader.points} Punkte · Saison läuft</span></div></div>`;
}

function renderWM(){initSeasonSelectors();const season=document.getElementById('wm-season')?.value||seasonState.current||'02/26';const div=document.getElementById('wm-div')?.value||'Div 1';const info=seasonInfo(season,div),rows=info.rows;document.getElementById('wm-table').innerHTML=rows.length?`${championBadge(info)}<div class="wm-block"><div class="wm-block-head"><h3>${div==='Div 1'?'Division 1':'Division 2'} · ${esc(season)}</h3><span>${info.rounds} Rennwochenenden · ${rows.length} Fahrer</span></div><div class="table-panel"><table class="standings"><thead><tr><th>Pos</th><th>Fahrer</th><th>Fahrzeug</th><th>Rennen</th><th>Siege</th><th>Podien</th><th>Marktwert</th><th>Punkte</th></tr></thead><tbody>${rows.map((r,i)=>`<tr><td class="rank ${i<3?'podium-p'+(i+1):''}">${i+1}</td><td><b>${esc(r.name)}</b></td><td><img class="car-mini" src="${standingsCar(r.team)}"></td><td>${r.races}</td><td>${r.wins}</td><td>${r.podiums}</td><td>${money(calcDriver(r.name).mw)}</td><td><b>${r.points}</b></td></tr>`).join('')}</tbody></table></div></div>`:'<div class="empty-race">Für diese Division liegen noch keine Rennergebnisse vor.</div>'}
function kwmRows(mode,season=seasonState.current||'02/26'){const divs=mode==='Overall'?['Div 1','Div 2']:[mode];const map={};seasonRaceList(season).filter(r=>divs.includes(r.division)).forEach(r=>r.results.forEach((x,i)=>{const t=x.team;if(!map[t])map[t]={team:t,points:0,wins:0,podiums:0};const st=statusOfResult(x);map[t].points+=pointsForPosition(i+1,st);if(i===0&&st==='RESULT')map[t].wins++;if(i<3&&st==='RESULT')map[t].podiums++}));return Object.values(map).sort((a,b)=>b.points-a.points||b.wins-a.wins)}
function renderKWM(){
 initSeasonSelectors(); const season=document.getElementById('kwm-season')?.value||seasonState.current||'02/26'; const mode=document.getElementById('kwm-div').value,rows=kwmRows(mode,season);
 let leader=rows[0];
 const kwmRaceRows=seasonRaceList(season).filter(r=>mode==='Overall'||r.division===mode).sort((a,b)=>Number(a.number||0)-Number(b.number||0)||String(a.division).localeCompare(String(b.division),'de'));
 document.getElementById('kwm-table').innerHTML=rows.length?`${leader?`<div class="champion-banner ${SEASON_META.seasons[season]?.status==='archived'?'':'provisional'}"><span>${SEASON_META.seasons[season]?.status==='archived'?'🏆':'📈'}</span><div><small>${SEASON_META.seasons[season]?.status==='archived'?'KONSTRUKTEURS-MEISTER':'AKTUELL FÜHREND'}</small><b>${esc(leader.team)}</b><span>${leader.points} Punkte</span></div></div>`:''}<div class="table-panel"><table class="standings"><thead><tr><th>Pos</th><th>Team</th><th>Fahrzeug</th><th>Siege</th><th>Podien</th><th>Punkte</th></tr></thead><tbody>${rows.map((r,i)=>`<tr><td class="rank ${i<3?'podium-p'+(i+1):''}">${i+1}</td><td><b>${esc(r.team)}</b></td><td><img class="car-mini" src="${standingsCar(r.team)}"></td><td>${r.wins}</td><td>${r.podiums}</td><td><b>${r.points}</b></td></tr>`).join('')}</tbody></table></div><div class="kwm-race-list"><h3>🏁 Rennwochenenden &amp; Strecken</h3>${kwmRaceRows.length?kwmRaceRows.map(r=>`<div class="kwm-race-item"><span><b>R${esc(r.number)}</b> · ${esc(r.track)}</span><span>${esc(r.division)}</span><span>${r.raceDate?esc(new Date(r.raceDate+'T12:00:00').toLocaleDateString('de-DE')):'Datum offen'}</span><span>${r.results.length} Ergebnisse</span></div>`).join(''):'<div class="muted">Noch keine Rennwochenenden.</div>'}</div>`:'<div class="empty-race">Für diese Auswahl liegen noch keine Rennergebnisse vor.</div>';
}

let editor=false;function isEditor(){return editor}
function openAdmin(){
 if(editor){adminPanel();return}
 document.getElementById('modal-content').innerHTML=`<div class="modal-card small"><div class="modal-head"><h2>Bearbeitung freischalten</h2><button onclick="closeModal()">×</button></div><p class="race-edit-note">Alle dürfen die RaceHub-Daten ansehen. Nur dein persönliches Admin-Konto darf Daten ändern.</p><input id="admin-email" type="email" placeholder="E-Mail-Adresse"><input id="admin-password" type="password" placeholder="Passwort"><div class="modal-actions"><button class="ghost" onclick="closeModal()">Abbrechen</button><button class="primary" onclick="loginAdmin()">Anmelden</button></div></div>`;openModal();
}
async function loginAdmin(){
 if(!cloudConfigured()){toast('Cloud-Setup fehlt. config.js einrichten.');return}
 if(!cloudClient){await initCloud()}
 if(!cloudClient){toast('Cloud-Anmeldung ist noch nicht bereit.');return}
 const email=document.getElementById('admin-email')?.value.trim(),password=document.getElementById('admin-password')?.value||'';
 if(!email||password.length<6){toast('E-Mail und mindestens 6 Zeichen Passwort erforderlich.');return}
 const result=await cloudClient.auth.signInWithPassword({email,password});
 if(result.error){toast(result.error.message||'Anmeldung fehlgeschlagen.');return}
 cloudUser=result.data.user||null;

 // Owner-ID nach dem Login noch einmal direkt aus der Cloud lesen.
 const {data:row,error:rowError}=await cloudClient.from('app_state').select('owner_id,data').eq('id',1).maybeSingle();
 if(rowError){console.error(rowError);toast('Cloud-Datenbank konnte nach der Anmeldung nicht gelesen werden.');return}
 if(row){
   cloudOwnerId=row.owner_id||null;
   cloudReady=true;
   if(row.data&&typeof row.data==='object'){
     applyCloudState(row.data);
     saveLocalCache();
     renderAll();
   }
 }else{
   cloudOwnerId=cloudUser.id;
   cloudReady=true;
   const {error:insertError}=await cloudClient.from('app_state').insert({id:1,owner_id:cloudUser.id,data:cloudState()});
   if(insertError){console.error(insertError);toast('Cloud-Start konnte nicht angelegt werden.');return}
 }
 cloudOwner=!!cloudUser&&!!cloudOwnerId&&cloudUser.id===cloudOwnerId;
 editor=cloudOwner;
 updateEditorUI();
 closeModal();
 toast(editor?'Admin-Bearbeitung freigeschaltet.':'Angemeldet, aber dieses Konto hat nur Leserechte.');
}
async function logoutAdmin(){
 if(cloudClient)await cloudClient.auth.signOut({scope:'local'});
 cloudUser=null;
 cloudOwner=false;
 editor=false;
 updateEditorUI();
 closeModal();
 toast('Bearbeitung gesperrt.');
}
function requireEditor(){if(!editor){openAdmin();return false}return true}
function adminPanel(){const q=databaseIntegrity();document.getElementById('modal-content').innerHTML=`<div class="modal-head"><h2>DoG Liga-Verwaltung</h2><button onclick="closeModal()">×</button></div><p class="race-edit-note">Nur das registrierte Admin-Konto darf Daten verändern. Alle anderen Besucher haben Ansichtszugriff.</p><div class="admin-integrity"><b>Datenstatus</b><span>${q.races} Rennen · ${q.weekends} Rennwochenenden · ${q.results} Ergebnisse</span><span>${q.orphan?'⚠ '+q.orphan+' unbekannte Fahrer':'✓ Fahrerzuordnungen OK'}</span><span>${q.duplicate?'⚠ '+q.duplicate+' doppelte Ergebniszeilen':'✓ Keine doppelten Ergebniszeilen'}</span><span>${q.invalid?'⚠ Punkte prüfen':'✓ Punkte konsistent'}</span></div><button class="primary" onclick="recalculateDatabase()">🔄 Gesamte Datenbank neu berechnen</button><button class="ghost" onclick="cloudSave().then(ok=>ok&&toast('Cloud-Daten gespeichert.'))">☁️ Jetzt in Cloud speichern</button><button class="ghost" onclick="logoutAdmin()">🔒 Abmelden / Bearbeitung sperren</button>`;openModal()}
function openModal(){document.getElementById('modal').classList.add('show')} function closeModal(){document.getElementById('modal').classList.remove('show')} function toast(t){const x=document.getElementById('toast');x.textContent=t;x.style.display='block';clearTimeout(window.__toast);window.__toast=setTimeout(()=>x.style.display='none',2600)} function money(n){return new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n)} function esc(s){return String(s??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]))}
try{ensureRaceMetadata();load();syncTeamChiefRoles();}catch(e){console.error('RaceHub startup',e);toast('RaceHub konnte einige Daten nicht laden. Die Navigation bleibt verfügbar.')}
try{updateSeasonChrome();showView('dashboard');updateEditorUI();}catch(e){console.error('RaceHub render',e)}
setTimeout(()=>initCloud(),50);

/* v1.76 reference UI helpers */
function filterDriverSelect(){
  const sel=document.getElementById('driver-select'); if(!sel)return;
  const q=(document.getElementById('driver-search')?.value||'').toLowerCase();
  const team=document.getElementById('driver-team-filter')?.value||'';
  const current=sel.value;
  const all=[...new Set((drivers||[]).map(x=>typeof x==='string'?x:(x.name||x.driver)).filter(Boolean))];
  const rows=all.filter(n=>(!q||n.toLowerCase().includes(q))&&(!team||driverTeam(n)===team));
  sel.innerHTML=rows.map(n=>`<option value="${esc(n)}">${esc(driverNumber(n)?'#'+driverNumber(n)+' · ': '')}${esc(n)} · ${esc(getStatus(n))}</option>`).join('');
  if(rows.includes(current))sel.value=current;
  if(sel.value)openDriver(sel.value);
}
(function(){
  const oldInit=window.initDriverOverview;
  window.initDriverOverview=function(){
    if(oldInit)oldInit();
    const tf=document.getElementById('driver-team-filter');
    if(tf){const names=[...new Set((teams||[]).map(t=>typeof t==='string'?t:(t.name||t.team)).filter(Boolean))]; tf.innerHTML='<option value="">Alle</option>'+names.map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join('');}
    const s=document.getElementById('driver-select'); if(s){s.onchange=function(){openDriver(this.value)};}
  };
})();
(function(){
  const oldOpen=window.openDriver;
  window.openDriver=function(name){
    const r=oldOpen(name);
    requestAnimationFrame(()=>{const p=document.querySelector('#driver-profile .profile-hero'); if(p){const t=driverTeam(name)||'Free Agent'; p.style.setProperty('--profile-car-image',`url("${driverCar(t)}")`);}});
    return r;
  };
})();

/* v1.76 driver reference helpers */
function filterDriverSelect(){const sel=document.getElementById('driver-select');if(!sel)return;const q=(document.getElementById('driver-search')?.value||'').toLowerCase();const team=document.getElementById('driver-team-filter')?.value||'';const current=sel.value;const all=[...new Set((drivers||[]).map(x=>typeof x==='string'?x:(x.name||x.driver)).filter(Boolean))];const rows=all.filter(n=>(!q||n.toLowerCase().includes(q))&&(!team||driverTeam(n)===team));sel.innerHTML=rows.map(n=>`<option value="${esc(n)}">${esc(driverNumber(n)?'#'+driverNumber(n)+' · ':'')}${esc(n)} · ${esc(getStatus(n))}</option>`).join('');if(rows.includes(current))sel.value=current;if(sel.value)openDriver(sel.value)}
(function(){const oldOpen=window.openDriver;window.openDriver=function(name){const r=oldOpen(name);requestAnimationFrame(()=>{const p=document.querySelector('#driver-profile .profile-hero');if(p)p.style.setProperty('--profile-car-image',`url("${driverCar(driverTeam(name)||'Free Agent')}")`)});return r}})();
