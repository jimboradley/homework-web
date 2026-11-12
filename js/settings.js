// Settings dialog.
/* ---------- settings ---------- */
async function refreshStatus(){
  const st=$('notifStatus');st.classList.remove('warn');$('fixNotif').hidden=true;
  if(!LN){st.textContent='Reminders work in the installed Android app.';$('testNotif').hidden=true;return}
  try{
    const p=await LN.checkPermissions();
    if(p.display!=='granted'){st.textContent='Notifications are off, so reminders won’t show.';st.classList.add('warn');$('fixNotif').hidden=false;return}
    let exact='granted';
    try{exact=(await LN.checkExactNotificationSetting()).exact_alarm}catch{}
    const n=(await LN.getPending()).notifications.length;
    st.textContent=`Notifications on · ${n_(n,'reminder')} scheduled`+(exact==='granted'?'':' · may arrive a few minutes late');
  }catch(e){st.textContent=''}
}
const LEADS=[[7,'1 week'],[5,'5 days'],[3,'3 days'],[2,'2 days'],[1,'Night before']];
function renderCadence(){
  for(const [key,el] of [['leadSmall','sLeadSmall'],['leadBig','sLeadBig']]){
    const c=$(el);c.innerHTML='';
    for(const [k,label] of LEADS){
      const b=document.createElement('button');b.type='button';b.className='chip';b.textContent=label;b.setAttribute('aria-pressed',S[key].includes(k));
      b.onclick=()=>{S[key]=S[key].includes(k)?S[key].filter(x=>x!==k):[...S[key],k].sort((a,b)=>b-a);saveSettings();renderCadence();setTimeout(refreshStatus,600)};
      c.appendChild(b);
    }
  }
  const c=$('sLateEvery');c.innerHTML='';
  for(const [v,label] of [[1,'Every day'],[2,'Every other day'],[0,'Only at homework time']]){
    const b=document.createElement('button');b.type='button';b.className='chip';b.textContent=label;b.setAttribute('aria-pressed',S.lateEvery===v);
    b.onclick=()=>{S.lateEvery=v;saveSettings();renderCadence();setTimeout(refreshStatus,600)};c.appendChild(b);
  }
}
function renderDays(){
  const c=$('sDays');c.innerHTML='';
  ['S','M','T','W','T','F','S'].forEach((l,d)=>{
    const b=document.createElement('button');b.type='button';b.className='chip';b.textContent=l;b.setAttribute('aria-label',WD[d]);
    b.setAttribute('aria-pressed',S.days.includes(d));
    b.onclick=()=>{S.days=S.days.includes(d)?S.days.filter(x=>x!==d):[...S.days,d];saveSettings();renderDays()};
    c.appendChild(b);
  });
}
function initSettings(){
  const bind=(k,el)=>{const x=$(el);
    if(x.type==='checkbox'){x.checked=S[k];x.onchange=()=>{S[k]=x.checked;saveSettings();setTimeout(refreshStatus,600)}}
    else if(x.type==='number'){x.value=S[k];x.onchange=()=>{const v=parseInt(x.value,10);if(v>0){S[k]=Math.min(+x.max,Math.max(+x.min,v));x.value=S[k];saveSettings()}}}
    else{x.value=S[k];x.onchange=()=>{if(x.value){S[k]=x.value;saveSettings();setTimeout(refreshStatus,600)}}}};
  bind('session','sSession');bind('sessionTime','sSessionTime');bind('eveningTime','sEveningTime');
  bind('morning','sMorning');bind('morningTime','sMorningTime');
  bind('pomo','sPomo');bind('focusMin','sFocusMin');bind('breakMin','sBreakMin');bind('cycle','sCycle');bind('longMin','sLongMin');
  $('openSettings').onclick=()=>{renderDays();renderCadence();refreshStatus();$('settings').showModal()};
}
