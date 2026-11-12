// The edit dialog: text, type, due date, move, delete.
/* ---------- edit sheet ---------- */
let editing=null,editType=null;
function buildEditTypes(){
  const c=$('editTypes');c.innerHTML='';
  for(const ty of TYPES){const b=document.createElement('button');b.type='button';b.className='chip';b.textContent=ty.label;
    b.setAttribute('aria-pressed',editType===ty.id);b.onclick=()=>{editType=ty.id;buildEditTypes()};c.appendChild(b)}
}
function openEdit(it){
  editing=it;editType=it.type;$('editText').value=it.text;$('editDue').value=it.due||'';buildEditTypes();
  $('toTop').hidden=$('toBottom').hidden=it.done;
  $('edit').showModal();
}
function applyEdit(){
  editing.text=$('editText').value.trim()||editing.text;editing.due=$('editDue').value||null;editing.type=editType||editing.type;
}
$('clearDue').addEventListener('click',()=>$('editDue').value='');
$('editForm').addEventListener('submit',()=>{applyEdit();save();render()});
function move(top){
  applyEdit();
  const rest=items.filter(i=>i!==editing);
  if(top) items=[editing,...rest]; else {const todo=rest.filter(i=>!i.done);items=[...todo,editing,...rest.filter(i=>i.done)]}
  save();render();$('edit').close();
}
$('toTop').addEventListener('click',()=>move(true));
$('toBottom').addEventListener('click',()=>move(false));
$('del').addEventListener('click',()=>{
  const s=snapshot();items=items.filter(i=>i!==editing);save();render();$('edit').close();toast('Deleted',()=>restore(s));
});
