// Reminders (Android app only): planning and scheduling local notifications.
/* ---------- reminders (Android app only) ---------- */
const CAP=window.Capacitor;
const LN=CAP&&CAP.isNativePlatform&&CAP.isNativePlatform()?CAP.Plugins.LocalNotifications:null;
const CHANNEL='homework', TIMER_IDS=[900,901], TEST_ID=9999;
function atTime(dateISO,hhmm,offsetDays=0){
  const d=fromISO(dateISO);d.setDate(d.getDate()+offsetDays);
  const[h,m]=hhmm.split(':').map(Number);d.setHours(h,m,0,0);return d;
}
const listText=a=>a.length<=3?a.join(', '):`${a.slice(0,3).join(', ')} +${a.length-3} more`;

// Builds every upcoming reminder from the current list. Rebuilt on every change and every app open.
function plannedReminders(now=new Date()){
  const out=[];let id=1;
  const push=(title,body,at,extra)=>{if(at>now) out.push({id:id++,title,body,schedule:{at,allowWhileIdle:true},channelId:CHANNEL,extra})};
  const open=items.filter(i=>!i.done);
  const byDue={};
  for(const it of open) if(it.due)(byDue[it.due]||(byDue[it.due]=[])).push(it);
  const when=k=>k===1?'tomorrow':k===7?'in a week':`in ${k} days`;
  const names=g=>listText(g.map(i=>i.text));
  for(const [due,list] of Object.entries(byDue)){
    // heads-ups: each kind of assignment has its own schedule; tests and quizzes are reminders to study
    const plan=new Map();
    for(const it of list) for(const k of (isBig(it)?S.leadBig:S.leadSmall)){const key=(isEvent(it)?'e':'a')+k;(plan.get(key)||plan.set(key,[]).get(key)).push(it)}
    for(const [key,group] of plan){
      const k=+key.slice(1),n=group.length;
      if(key[0]==='e') push(n===1?`${typeOf(group[0].type).label} ${when(k)} — time to study 📖`:`${n} tests & quizzes ${when(k)} 📖`,'Study for: '+names(group),atTime(due,S.eveningTime,-k));
      else push(n===1?`Due ${when(k)}`:`${n} things due ${when(k)}`,names(group),atTime(due,S.eveningTime,-k));
    }
    if(S.morning){
      const ev=list.filter(isEvent),as=list.filter(i=>!isEvent(i));
      if(as.length) push(as.length===1?'Due today':`${as.length} things due today`,names(as),atTime(due,S.morningTime,0));
      if(ev.length) push(ev.length===1?`${typeOf(ev[0].type).label} today — good luck! 🍀`:`${ev.length} tests & quizzes today 🍀`,names(ev),atTime(due,S.morningTime,0));
    }
  }
  // Daily: homework-time reminder on chosen days, and late-work reminders every day until it's checked off.
  for(let i=0;i<21;i++){
    const day=addDays(today0(),i),dISO=iso(day);
    const late=open.filter(it=>it.due&&it.due<dISO&&!isEvent(it));
    const soon=open.filter(it=>!isEvent(it)&&it.due&&it.due>=dISO&&diffDays(it.due,day)<=1);
    const study=open.filter(it=>isEvent(it)&&it.due&&it.due>=dISO&&diffDays(it.due,day)<=3);
    const sessionDay=S.session&&S.days.includes(day.getDay());
    const lateDay=S.lateEvery>0&&Math.round(day.getTime()/864e5)%S.lateEvery===0;
    if(!sessionDay&&!(lateDay&&late.length)) continue;
    let title,body;
    if(sessionDay){
      title='Homework time 📚';
      const bits=[];
      if(late.length) bits.push(`${late.length} late: ${listText(late.map(i=>i.text))}`);
      if(soon.length) bits.push(`${n_(soon.length,'thing')} due soon`);
      if(study.length) bits.push(`study for ${listText(study.map(i=>i.text))}`);
      body=bits.length?bits.join(' · '):'Add anything new from today, then pick something to start.';
    } else {
      title=late.length===1?'Still not done':`${late.length} assignments still not done`;
      body=listText(late.map(i=>i.text))+' — knock one out?';
    }
    push(title,body,atTime(dISO,S.sessionTime),{kind:'session'});
  }
  return out;
}

let schedTimer;
function scheduleSoon(){if(!LN)return;clearTimeout(schedTimer);schedTimer=setTimeout(reschedule,300)}
async function reschedule(){
  try{
    if((await LN.checkPermissions()).display!=='granted') return;
    const pend=(await LN.getPending()).notifications.filter(n=>!TIMER_IDS.includes(n.id)&&n.id!==TEST_ID);
    if(pend.length) await LN.cancel({notifications:pend.map(n=>({id:n.id}))});
    const list=plannedReminders();
    if(list.length) await LN.schedule({notifications:list});
  }catch(e){console.error('reschedule failed',e)}
}
async function cancelTimerNotifs(){if(!LN)return;try{await LN.cancel({notifications:TIMER_IDS.map(id=>({id}))})}catch{}}
async function timerNotifs(){
  if(!LN||!T||T.paused) return;
  await cancelTimerNotifs();
  const list=[];
  const at=t=>({at:new Date(t),allowWhileIdle:true});
  if(T.phase==='focus'&&T.end){
    const n=(T.count||0)+1,long=isLongBreak(n),brk=breakMinAfter(n);
    list.push({id:900,title:long?`Session ${S.cycle} of ${S.cycle} done — long break!`:'Focus done — take a break',
      body:long?`${brk} min long break. You earned it.`:`${brk} min break. Nice work.`,schedule:at(T.end),channelId:CHANNEL});
    list.push({id:901,title:long?'Long break’s over':'Break’s over',body:'Ready for another round?',schedule:at(T.end+brk*6e4),channelId:CHANNEL});
  } else if(T.phase==='break'&&T.end){
    list.push({id:901,title:T.long?'Long break’s over':'Break’s over',body:'Ready for another round?',schedule:at(T.end),channelId:CHANNEL});
  }
  try{if(list.length) await LN.schedule({notifications:list})}catch(e){console.error(e)}
}

async function initReminders(){
  if(!LN) return;
  try{await LN.createChannel({id:CHANNEL,name:'Homework reminders',importance:4,visibility:1,vibration:true})}catch{}
  $('fixNotif').onclick=async()=>{
    const r=await LN.requestPermissions();
    if(r.display!=='granted') toast('Turn on notifications in Android Settings → Apps → Locked In');
    await reschedule();refreshStatus();
  };
  $('testNotif').onclick=async()=>{
    await LN.schedule({notifications:[{id:TEST_ID,title:'Test reminder',body:'Reminders are working 👍',schedule:{at:new Date(Date.now()+3000),allowWhileIdle:true},channelId:CHANNEL}]});
    toast('Test reminder coming in 3 seconds');
  };
  LN.addListener('localNotificationActionPerformed',a=>{
    const k=a.notification&&a.notification.extra&&a.notification.extra.kind;
    if(k==='session'){setPage('today');setTimeout(()=>$('addInput').focus(),300)}
  });
  try{
    const p=await LN.checkPermissions();
    if(p.display==='prompt'||p.display==='prompt-with-rationale') await LN.requestPermissions();
  }catch{}
  reschedule();
}
