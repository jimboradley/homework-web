// Tab pages: Study / Today / All.
/* ---------- pages ---------- */
let page='today';
function setPage(p){
  page=p;
  for(const k of ['study','today','all']){$('page_'+k).hidden=k!==p;$('tab_'+k).setAttribute('aria-selected',k===p)}
  scrollTo(0,0);
}
for(const k of ['study','today','all']) $('tab_'+k).onclick=()=>setPage(k);
$('todayMore').addEventListener('click',e=>{if(e.target.closest('button')) setPage('all')});
