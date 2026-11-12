// Toast messages with an optional Undo.
/* ---------- toast / undo ---------- */
let toastTimer,undoFn;
function toast(msg,undo){
  // An open sheet sits on the browser's top layer, so move the message inside it to stay visible.
  const host=document.querySelector('dialog[open]')||document.body;
  if($('toast').parentNode!==host) host.appendChild($('toast'));
  $('toastMsg').textContent=msg;undoFn=undo;$('toastBtn').hidden=!undo;
  $('toast').classList.add('show');clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>$('toast').classList.remove('show'),4500);
}
$('toastBtn').addEventListener('click',()=>{if(undoFn){undoFn();undoFn=null}$('toast').classList.remove('show')});
