// Date helpers, due-date parsing from typed text ("bio quiz fri"), and formatting.
/* ---------- dates ---------- */
const pad=n=>String(n).padStart(2,'0');
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const today0=()=>{const d=new Date();d.setHours(0,0,0,0);return d};
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const fromISO=s=>{const[y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const diffDays=(s,from=today0())=>Math.round((fromISO(s)-from)/864e5);
const WD=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const shortDate=s=>{const d=fromISO(s);return `${WD[d.getDay()]} ${d.getMonth()+1}/${d.getDate()}`};
function dueLabel(s){
  const n=diffDays(s);
  if(n<0) return {t:n===-1?'Late · yesterday':`Late · ${shortDate(s)}`,c:'late'};
  if(n===0) return {t:'Today',c:'soon'};
  if(n===1) return {t:'Tomorrow',c:'soon'};
  if(n<7) return {t:WD[fromISO(s).getDay()],c:''};
  return {t:fromISO(s).toLocaleDateString(undefined,{month:'short',day:'numeric'}),c:''};
}
// Understands a due date at the end: "fri", "next fri", "tomorrow", "11/20", "nov 20", "in 2 weeks", "next week".
const WDRE='sun(?:day)?|mon(?:day)?|tue(?:s|sday)?|wed(?:s|nesday)?|thu(?:r|rs|rsday)?|fri(?:day)?|sat(?:urday)?';
const MONTHS=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
const NUMW={a:1,an:1,one:1,two:2,three:3,four:4,five:5,six:6};
function futureDate(mo,day){
  if(mo<0||mo>11||day<1||day>31) return null;
  const t=today0();let d=new Date(t.getFullYear(),mo,day);if(d.getMonth()!==mo) return null;
  if(d<t) d=new Date(t.getFullYear()+1,mo,day);return d;
}
const DUE_RULES=[
  [/^(today|tonight)$/,()=>today0()],
  [/^(tomorrow|tmrw|tmr)$/,()=>addDays(today0(),1)],
  [new RegExp(`^(next\\s+)?(${WDRE})$`),m=>{const i=WD.map(x=>x.toLowerCase()).indexOf(m[2].slice(0,3));
    let k=(i-today0().getDay()+7)%7;if(k===0)k=7;if(m[1])k+=7;return addDays(today0(),k)}],
  [/^next\s+week$/,()=>{const d=today0();return addDays(d,((8-d.getDay())%7)||7)}],
  [/^in\s+(\d+|an?|one|two|three|four|five|six)\s+(day|week)s?$/,m=>{const n=NUMW[m[1]]||+m[1];return n>0&&n<400?addDays(today0(),m[2]==='week'?n*7:n):null}],
  [/^(\d{1,2})\/(\d{1,2})$/,m=>futureDate(+m[1]-1,+m[2])],
  [/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?$/,m=>futureDate(MONTHS.indexOf(m[1]),+m[2])],
];
function parseDue(text){
  const words=text.trim().split(/\s+/);
  for(let n=Math.min(4,words.length-1);n>=1;n--){
    const tail=words.slice(-n).join(' ').toLowerCase().replace(/[.,!]+$/,'');
    for(const [re,fn] of DUE_RULES){
      const m=tail.match(re); if(!m) continue;
      const d=fn(m); if(!d) continue;
      let rest=words.slice(0,-n);
      if(rest.length>1&&/^(due|by|on)$/i.test(rest[rest.length-1])) rest=rest.slice(0,-1);
      return {text:rest.join(' '),due:iso(d)};
    }
  }
  return {text,due:null};
}
const fmtMin=m=>{m=Math.max(1,Math.round(m));return m<60?`${m}m`:`${Math.floor(m/60)}h${m%60?` ${m%60}m`:''}`};
const fmtClock=ms=>{const s=Math.max(0,Math.round(ms/1000));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return h?`${h}:${pad(m)}:${pad(x)}`:`${m}:${pad(x)}`};

const n_=(n,w)=>`${n} ${w}${n===1?'':'s'}`;
