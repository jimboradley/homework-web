// Today's progress card.
/* progress: today's work = the dated homework in the Today window (late through today+TODAY_DAYS), plus whatever you finished today */
function workedTodayMs(){
  let ms=meta.work[iso(today0())]||0;
  if(T&&T.phase==='focus'&&!T.paused&&T.segStart) ms+=Date.now()-Math.max(T.segStart,today0().getTime());
  return ms;
}
function renderProgress(){
  const tISO=iso(today0()),endISO=todayEnd();
  const need=items.filter(i=>!i.done&&!isEvent(i)&&i.due&&i.due<=endISO);
  const did=items.filter(i=>i.done&&!isEvent(i)&&i.doneAt&&iso(new Date(i.doneAt))===tISO);
  const total=need.length+did.length;
  const worked=workedTodayMs();
  const w=worked>=6e4?`${fmtMin(worked/6e4)} focused today`:'';
  if(!total){
    $('pTitle').textContent='Nothing due soon 🎉';$('pSub').textContent=w||'Get ahead on something?';$('pBar').style.width='0%';return;
  }
  $('pTitle').textContent=need.length?`Today: ${did.length} of ${total} done`:`All ${total} done today 🎉`;
  $('pSub').textContent=w;
  $('pBar').style.width=`${Math.round(did.length/total*100)}%`;
}
