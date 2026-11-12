// The add bar: chips, live hint, and adding a new assignment.
/* ---------- add bar ---------- */
let chipDue=null, chipType=null;
const shortMD=s=>fromISO(s).toLocaleDateString(undefined,{month:'short',day:'numeric'});
function buildChips(){
  const c=$('chips');c.innerHTML='';const t=today0();
  const opts=[['Today',iso(t)],['Tomorrow',iso(addDays(t,1))]];
  for(let i=2;i<7;i++){const d=addDays(t,i);opts.push([WD[d.getDay()],iso(d)])}
  for(const [label,val] of opts) c.appendChild(chip(label,chipDue===val,()=>{chipDue=chipDue===val?null:val;buildChips();updateHint()}));
  // anything further away: pick it from a calendar
  const far=!!chipDue&&!opts.some(o=>o[1]===chipDue);
  c.appendChild(chip(far?'📅 '+shortMD(chipDue):'📅 Later…',far,()=>{
    if(far){chipDue=null;buildChips();updateHint();return}
    const p=$('pickDate');p.min=iso(t);p.value=iso(addDays(t,7));
    try{p.showPicker()}catch{p.focus();p.click()}
  }));
  const tc=$('typeChips');tc.innerHTML='';
  const shown=currentType();
  for(const ty of TYPES) tc.appendChild(chip(ty.label,shown===ty.id,()=>{chipType=chipType===ty.id?null:ty.id;buildChips();updateHint()}));
}
$('pickDate').addEventListener('change',()=>{const v=$('pickDate').value;if(v){chipDue=v;buildChips();updateHint();$('addInput').focus()}});
function chip(label,on,fn){
  const b=document.createElement('button');b.type='button';b.className='chip';b.textContent=label;b.setAttribute('aria-pressed',on);
  b.addEventListener('pointerdown',e=>e.preventDefault()); // keep the keyboard open
  b.addEventListener('click',fn);return b;
}
function currentType(){const v=$('addInput').value.trim();return chipType||(v?detectType(v):null)}
function updateHint(){
  const v=$('addInput').value.trim();
  const due=chipDue||(v?parseDue(v).due:null);
  const ty=currentType();
  for(const b of $('typeChips').children) b.setAttribute('aria-pressed',typeOf(ty).label===b.textContent&&!!ty);
  const parts=[];
  if(v&&ty) parts.push(isEvent({type:ty})?`${typeOf(ty).label} · goes to Study`:typeOf(ty).label);
  if(due){const n=diffDays(due);parts.push((isEvent({type:ty})?'on ':'due ')+dueLabel(due).t.replace('Late · ','')+(n>=7?` (in ${n} days)`:''))}
  $('hint').textContent=parts.join(' · ');
}
$('addInput').addEventListener('input',updateHint);
$('addForm').addEventListener('submit',e=>{
  e.preventDefault();
  const raw=$('addInput').value.trim(); if(!raw) return;
  let {text,due}=parseDue(raw);
  if(chipDue){text=raw;due=chipDue}
  const type=chipType||detectType(raw);
  const it={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random()),text,type,due,done:false,createdAt:Date.now()};
  items.unshift(it);
  $('addInput').value='';chipDue=null;chipType=null;buildChips();updateHint();
  save();render();
  if(page==='today'&&!inToday(it)) toast(isEvent(it)?'Added to Study 📖':`Added to All${due?` · due ${shortMD(due)}`:''}`);
  else if(page==='study'&&!isEvent(it)) toast('Added to Today & All');
  $('addInput').focus();
});
