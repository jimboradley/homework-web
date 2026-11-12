// Focus timer (pomodoro): state machine, ticking, rendering, buttons.
/* ---------- focus timer (pomodoro), not tied to any assignment ---------- */
// T = {phase:'focus'|'break'|'ready', start, end|null, paused, remain, segStart, count, long}
// T is null until the user presses Start; the header icon only opens the (idle) full-screen timer.
if(T) delete T.itemId;
function credit(at){
  if(!T||!T.segStart) return;
  const ms=Math.max(0,at-T.segStart);T.segStart=null;
  const day=iso(new Date(at));meta.work[day]=(meta.work[day]||0)+ms;
}
function startTimer(){
  if(T) stopTimer();
  T={phase:'ready',count:0};
  startFocus();
}
function startFocus(){
  const now=Date.now();
  T.phase='focus';T.start=now;T.paused=false;T.segStart=now;
  T.end=S.pomo?now+S.focusMin*6e4:null;
  saveTimer();timerNotifs();renderTimer();renderProgress();renderItemView();
}
// T.count = focus sessions finished since the timer was started (persisted with T).
// Every S.cycle-th break (by default after focus 4, 8, 12...) is a long break of S.longMin minutes.
const ordinal=n=>n+(n%100>10&&n%100<14?'th':['th','st','nd','rd'][n%10]||'th');
const isLongBreak=n=>n>0&&n%S.cycle===0;              // n = focus sessions done when the break starts
const breakMinAfter=n=>isLongBreak(n)?S.longMin:S.breakMin;
function startBreak(at){
  T.count=(T.count||0)+1;
  T.long=isLongBreak(T.count);
  T.phase='break';T.start=at;T.end=at+breakMinAfter(T.count)*6e4;T.paused=false;
}
function stopTimer(){
  if(!T) return;
  if(T.phase==='focus'&&!T.paused) credit(Date.now());
  T=null;saveTimer();cancelTimerNotifs();save();closeSheet('timerFull');renderTimer();renderProgress();renderItemView();
}
function togglePause(){
  const now=Date.now();
  if(!T.paused){
    if(T.phase==='focus') credit(now);
    T.remain=T.end?T.end-now:now-T.start;T.paused=true;cancelTimerNotifs();
  } else {
    if(T.end) T.end=now+T.remain; else T.start=now-T.remain;
    if(T.phase==='focus') T.segStart=now;
    T.paused=false;timerNotifs();
  }
  saveTimer();save();renderTimer();
}
// Called every second; also catches up if the app was closed while a phase ended.
function tickTimer(){
  if(!T) return;
  const now=Date.now();
  if(!T.paused&&T.end&&now>=T.end){
    if(T.phase==='focus'){
      credit(T.end);startBreak(T.end);save();
      if(now>=T.end){T.phase='ready';T.end=null}
      buzz();
    } else if(T.phase==='break'){T.phase='ready';T.end=null;buzz()}
    saveTimer();
  }
  renderTimer();
  if(T&&T.phase==='focus') renderProgress();
}
function buzz(){if(navigator.vibrate&&!document.hidden) navigator.vibrate([150,80,150])}
const ICON={pause:'⏸',play:'▶',stop:'■'};
// Buttons for the full-screen timer. With no timer yet (T null) there is a single big Start button.
function timerButtons(box){
  const key=T?T.phase+T.paused:'idle';
  if(box.dataset.key===key) return;
  box.dataset.key=key;
  const b=(cls,label,txt,fn)=>{const x=document.createElement('button');x.className='tbtn '+cls;x.setAttribute('aria-label',label);x.textContent=txt;
    x.onclick=e=>{e.stopPropagation();fn()};return x};
  const btns=[];
  if(!T){box.replaceChildren(b('go','Start focus timer','▶ Start',()=>startTimer()));return}
  if(T.phase==='focus') btns.push(b('',T.paused?'Resume':'Pause',T.paused?ICON.play:ICON.pause,togglePause));
  if(T.phase==='break') btns.push(b('go','Skip break','Skip',()=>startFocus()));
  if(T.phase==='ready') btns.push(b('go','Start focus','▶ Start focus',()=>startFocus()));
  btns.push(b('','Stop timer',ICON.stop,()=>stopTimer()));
  box.replaceChildren(...btns);
}
function renderTimer(){
  document.body.classList.toggle('timing',!!T);
  const now=Date.now(),pomo=S.pomo,done=T?T.count||0:0;
  const next=`session ${done%S.cycle+1} of ${S.cycle}`;     // the focus session running now / up next
  let frac=0,clock,phase,pill,brk=false,fsub;
  if(!T||T.phase==='ready'){
    clock=fmtClock(pomo?S.focusMin*6e4:0);
    phase=!T?'Ready to focus':T.long?'Long break’s over':'Break’s over';pill='Ready';
    fsub=T?`Ready for ${next}?`:pomo?`${S.focusMin} min focus, ${S.breakMin} min breaks · every ${ordinal(S.cycle)} break is ${S.longMin} min`:'Counts up until you stop it';
  } else {
    if(T.end){const left=T.paused?T.remain:T.end-now;clock=fmtClock(left);frac=1-left/(T.end-T.start)}
    else {const el=T.paused?T.remain:now-T.start;clock=fmtClock(el);frac=(el%(36e5))/36e5}
    if(T.phase==='focus'){
      phase=pill=T.paused?'Paused':'Focus';
      fsub=pomo?next[0].toUpperCase()+next.slice(1)+(done?` · ${done} done`:''):'Stopwatch — counts up';
    } else {
      brk=true;phase=T.long?'Long break':'Short break';pill=T.long?'Long break':'Break';
      fsub=T.long?`${S.longMin} min long break — ${done} sessions done. Nice work!`:`Up next: ${next}`;
    }
  }
  frac=Math.min(1,Math.max(0,frac));
  $('tfTime').textContent=clock;
  $('bigArc').style.strokeDashoffset=String(339.29*(1-frac));$('bigArc').style.stroke=brk?'var(--soon)':'var(--ok)';
  $('tfPhase').className='tfph'+(brk?' brk':'');$('tfPhase').textContent=phase;
  $('tfSub').textContent=fsub;
  for(const p of [$('timer'),$('ivPill')]){   // the header pill and its twin in the item view
    p.hidden=!T;if(!T) continue;
    p.querySelector('.tdot').className='tdot'+(brk?' brk':'')+(T.paused||T.phase==='ready'?' idle':'');
    p.querySelector('.ph').className='ph'+(brk?' brk':'');p.querySelector('.ph').textContent=pill;
    p.querySelector('.tt').textContent=clock;
    p.setAttribute('aria-label',`${phase} ${clock}. Open focus timer`);
  }
  // session dots: sessions finished in this round of 4 (all 4 lit during the long break)
  const lit=T&&T.phase==='break'&&T.long?S.cycle:done%S.cycle;
  $('tfDots').hidden=!pomo;$('tfDots').className='tfdots'+(brk?' brk':'');
  $('tfDots').innerHTML=Array.from({length:S.cycle},(_,i)=>`<i class="${i<lit?'on':''}"></i>`).join('');
  timerButtons($('tfBtns'));
}
// The header icon only opens the timer; nothing runs until Start is pressed.
$('focusBtn').addEventListener('click',()=>{renderTimer();openSheet('timerFull')});
$('timer').addEventListener('click',()=>openSheet('timerFull'));
// While timing, the header is pinned and the add bar sticks just under it. Track the header's real height
// (it changes with font size, screen width and the pill) so there is never a gap or overlap.
if('ResizeObserver' in window) new ResizeObserver(([e])=>document.documentElement.style.setProperty('--hh',e.target.offsetHeight+'px')).observe(document.querySelector('header'));
$('ivPill').addEventListener('click',()=>openSheet('timerFull'));
$('tfClose').onclick=()=>closeSheet('timerFull');
setInterval(tickTimer,1000);
