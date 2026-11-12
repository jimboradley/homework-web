// One assignment, full screen.
let viewing=null;
function openItem(it){viewing=it;renderItemView();openSheet('itemView')}
function renderItemView(){
  const it=viewing; if(!it) return;
  if(!items.includes(it)){viewing=null;closeSheet('itemView');return}
  const ev=isEvent(it),lbl=typeOf(it.type).label;
  $('ivType').className='badge t-'+it.type;$('ivType').textContent=lbl;
  $('ivTitle').textContent=titleOf(it);
  let due='No due date',late=false;
  if(it.done) due='Done ✓';
  else if(it.due){
    const n=diffDays(it.due),long=fromISO(it.due).toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric'});
    if(n<0){due=`Was due ${long}`;late=true}
    else if(n===0) due=ev?`${lbl} is today — good luck!`:'Due today';
    else if(n===1) due=ev?`${lbl} is tomorrow`:'Due tomorrow';
    else due=`${ev?lbl+' on':'Due'} ${long} · in ${n} days`;
  }
  $('ivDue').textContent=due;$('ivDue').className='ivdue'+(late?' late':'');
  $('ivTimer').textContent=T?'Open focus timer':ev?'Start studying':'Start focus timer';
  $('ivDone').hidden=ev&&!it.done;
  $('ivDone').textContent=it.done?'Mark not done':'✓ Done';
}
$('ivClose').onclick=()=>closeSheet('itemView');
$('ivEdit').onclick=()=>{if(viewing) openEdit(viewing)};
$('ivTimer').onclick=()=>{if(!T) startTimer();openSheet('timerFull')};
$('ivDone').onclick=()=>{const it=viewing;if(!it) return;if(it.done){undone(it);return}closeSheet('itemView');complete(it)};
