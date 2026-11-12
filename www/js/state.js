// App state (items, meta, settings S, timer T), load/migrate, and saving.
/* ---------- state ---------- */
let items=read(KEY,[]);
let meta=read(MKEY,{samples:{},work:{}});   // samples: minutes per type; work: ms worked per day
for(const it of items) if(!it.type) it.type=detectType(it.text);
const DEFAULTS={session:true,sessionTime:'16:00',days:[0,1,2,3,4],lateEvery:1,
  leadSmall:[2,1],leadBig:[7,3,2,1],eveningTime:'19:00',morning:true,morningTime:'07:00',
  pomo:true,focusMin:25,breakMin:5,cycle:4,longMin:30};
let S={...DEFAULTS,...read(SKEY,{})};
if('late' in S){if(S.late===false)S.lateEvery=0;delete S.late}   // settings from the first version
if('twoDay' in S||'evening' in S){const l=[];if(S.twoDay!==false)l.push(2);if(S.evening!==false)l.push(1);S.leadSmall=l;delete S.twoDay;delete S.evening}
let T=read(TKEY,null);                         // focus timer state
function save(){write(KEY,items);write(MKEY,meta);scheduleSoon()}
const saveSettings=()=>{write(SKEY,S);scheduleSoon()};
const saveTimer=()=>write(TKEY,T);
