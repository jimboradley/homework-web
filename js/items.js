// Item actions: complete / undo / clear, list clicks, auto-archiving past tests and quizzes.
const snapshot=()=>JSON.parse(JSON.stringify({items,meta}));
const restore=s=>{items=s.items;meta=s.meta;if(viewing) viewing=byId(viewing.id)||null;save();render()};

/* ---------- item actions ---------- */
const byId=id=>items.find(i=>i.id===id);
function complete(it,el){
  const s=snapshot();
  const finish=()=>{it.done=true;it.doneAt=Date.now();save();render();toast('Nice — marked done ✓',()=>restore(s))};
  if(el){el.classList.add('completing');setTimeout(finish,220)} else finish();
}
function undone(it){it.done=false;delete it.doneAt;items=[it,...items.filter(i=>i!==it)];save();render()}
function onListClick(e){
  const el=e.target.closest('.item'); if(!el) return;
  const it=byId(el.dataset.id); if(!it) return;
  if(e.target.closest('.check')){if(it.done) undone(it); else complete(it,el)}
  else if(e.target.closest('.editbtn')) openEdit(it);
  else openItem(it);
}
for(const id of ['todayList','studyList','allList','doneList']) $(id).addEventListener('click',onListClick);
$('clearDone').addEventListener('click',e=>{
  e.preventDefault();const s=snapshot();const n=items.filter(i=>i.done).length;
  items=items.filter(i=>!i.done);save();render();toast(`Cleared ${n} done`,()=>restore(s));
});

// Tests and quizzes are study reminders: once their day has passed, file them away automatically.
function archivePastEvents(){
  const t=iso(today0());let changed=false;
  for(const it of items) if(!it.done&&isEvent(it)&&it.due&&it.due<t){
    it.done=true;const d=fromISO(it.due);d.setHours(23,59,0,0);it.doneAt=d.getTime();changed=true;
  }
  if(changed) save();
}
