// Full-screen sheets (open/close, swipe down to close, keep screen awake) and dialog backdrop clicks.
/* ---------- full-screen views ---------- */
const sheetOpen=id=>$(id).classList.contains('open');
function openSheet(id){$(id).style.transform='';$(id).classList.add('open');if(id==='timerFull') keepAwake(true)}
function closeSheet(id){$(id).classList.remove('open');if(id==='timerFull') keepAwake(false)}
// swipe down anywhere on a full-screen view to close it
function swipeToClose(id){
  const s=$(id);let y0=null,dy=0;
  s.addEventListener('touchstart',e=>{const sc=e.target.closest('.sbody');if(sc&&sc.scrollTop>0) return;y0=e.touches[0].clientY;dy=0},{passive:true});
  s.addEventListener('touchmove',e=>{if(y0==null) return;dy=e.touches[0].clientY-y0;if(dy>0){s.classList.add('dragging');s.style.transform=`translateY(${dy}px)`}},{passive:true});
  const end=()=>{if(y0==null) return;s.classList.remove('dragging');s.style.transform='';if(dy>90) closeSheet(id);y0=null};
  s.addEventListener('touchend',end);s.addEventListener('touchcancel',end);
}
swipeToClose('itemView');swipeToClose('timerFull');
let wake=null;
async function keepAwake(on){   // keep the screen on while the big timer is showing
  try{
    if(on&&!wake&&navigator.wakeLock){wake=await navigator.wakeLock.request('screen');wake.addEventListener('release',()=>{wake=null})}
    else if(!on&&wake){const w=wake;wake=null;await w.release()}
  }catch{}
}

for(const d of ['edit','settings']) $(d).addEventListener('click',e=>{if(e.target===$(d))$(d).close()});
