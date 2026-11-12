// Live updates (Android app only). APP_VERSION is defined inline in index.html.
/* ---------- live updates (Android app only) ---------- */
// The installed app is a shell; new versions of this page are downloaded from GitHub and stored on the phone.
const UPDATE_FEED='https://raw.githubusercontent.com/jimboradley/homework-web/dist/version.json';
const UP=LN?CAP.Plugins.CapacitorUpdater:null;
let pendingUpdate=null;
const shownVersion=()=>APP_VERSION.startsWith('__')?'dev':APP_VERSION;
// Update steps are kept on the phone (last 60 lines) and shown under Settings → Update log.
const ulog=(...a)=>{
  const t=new Date(),line=`${t.toLocaleDateString(undefined,{month:'numeric',day:'numeric'})} ${t.toTimeString().slice(0,8)} [${APP_VERSION}] `+a.map(x=>typeof x==='string'?x:JSON.stringify(x)).join(' ');
  const log=read('homework.updLog',[]);log.push(line);write('homework.updLog',log.slice(-60));
  const el=$('updLogText');if(el) el.textContent=log.slice(-60).join('\n')};
// Only ever move forward: GitHub's file cache can briefly serve an older version.json.
const isNewer=(a,b)=>{if(!/^\d/.test(b)) return /^\d/.test(a);const x=a.split('.').map(Number),y=b.split('.').map(Number);
  for(let i=0;i<Math.max(x.length,y.length);i++){if((x[i]||0)!==(y[i]||0)) return (x[i]||0)>(y[i]||0)}return false};
async function checkForUpdate(manual){
  if(!UP) return;
  const btn=$('checkUpdate');
  const say=(msg,btnText,busy)=>{if(!manual) return;$('verStatus').textContent=`App version ${shownVersion()} · ${msg}`;
    btn.textContent=btnText||'Check for app updates';btn.disabled=!!busy};
  try{
    if(pendingUpdate){say(`version ${pendingUpdate.version} is ready`,'Restart now to update');return}
    say('checking…','Checking…',true);
    const ctl=new AbortController();const to=setTimeout(()=>ctl.abort(),15000);
    const r=await fetch(UPDATE_FEED+'?t='+Date.now(),{cache:'no-store',signal:ctl.signal});clearTimeout(to);
    if(!r.ok) throw new Error('feed '+r.status);
    const v=await r.json();
    if(!v.version||!v.url||!isNewer(v.version,APP_VERSION)){ulog('up to date',v.version);write('homework.lastUpdateCheck',Date.now());say('up to date ✓');return}
    say(`downloading version ${v.version}…`,'Downloading…',true);
    const {bundles}=await UP.list();
    let b=bundles.find(x=>x.version===v.version&&x.status==='success');
    if(!b) b=await UP.download({url:v.url,version:v.version,checksum:v.checksum||''});
    
    await UP.next({id:b.id});
    pendingUpdate=b;write('homework.lastUpdateCheck',Date.now());ulog('downloaded',b.version);
    say(`version ${b.version} is ready`,'Restart now to update');
  }catch(e){ulog('FAILED',e&&(e.message||e.code||String(e)));say('couldn’t update: '+(e&&(e.message||e.code)||e))}
}
function maybeCheckForUpdate(){if(Date.now()-read('homework.lastUpdateCheck',0)>36e5) checkForUpdate(false)}
// A downloaded update is applied by the updater itself the next time the app goes to the background
// (calling set() here as well made it reload twice, and the updater then rolled the new version back).
function initUpdates(){
  $('verStatus').textContent=`App version ${shownVersion()}`;
  if(!UP) return;
  $('checkUpdate').hidden=false;$('updLog').hidden=false;
  $('updLogText').textContent=read('homework.updLog',[]).join('\n');
  for(const ev of ['downloadFailed','updateFailed'])
    try{UP.addListener(ev,d=>ulog(ev,d&&d.bundle?d.bundle.version:d))}catch(e){}
  $('checkUpdate').onclick=()=>{
    if(pendingUpdate){saveTimer();UP.set({id:pendingUpdate.id}).catch(()=>{});return}
    checkForUpdate(true);
  };
}
