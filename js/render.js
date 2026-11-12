// Rendering the three lists: Today window rules, sorting, list rows and badges.
/* ---------- render ---------- */
const PENCIL='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>';
// Today = anything late, due today, tomorrow or the day after (today+TODAY_DAYS), or with no date;
// plus tests/quizzes due today through today+EVENT_DAYS, to leave room to study (past ones are archived automatically).
const TODAY_DAYS=2,EVENT_DAYS=3;
const todayEnd=()=>iso(addDays(today0(),TODAY_DAYS));
function inToday(it){
  if(it.done) return false;
  if(isEvent(it)) return !!it.due&&diffDays(it.due)>=0&&diffDays(it.due)<=EVENT_DAYS;
  return !it.due||it.due<=todayEnd();
}
// Today and All are sorted by due date (late first, no date last); same date keeps the order they were added in.
const sortByDue=list=>list.map((it,k)=>[it,k]).sort(([a,i],[b,j])=>(a.due||'9999').localeCompare(b.due||'9999')||i-j).map(p=>p[0]);
function badges(it){
  const m=document.createElement('div');m.className='meta';
  if(it.type!=='homework'){const b=document.createElement('span');b.className='badge t-'+it.type;b.textContent=typeOf(it.type).label;m.appendChild(b)}
  if(it.due&&!it.done){const d=dueLabel(it.due);const b=document.createElement('span');b.className='badge '+d.c;
    const n=diffDays(it.due);b.textContent=d.t+(n>=2?` · ${n} days`:'');m.appendChild(b)}
  return m;
}
function li(it){
  const el=document.createElement('li');const ev=isEvent(it)&&!it.done;
  el.className='item'+(it.done?' done':'')+(ev?' event t-'+it.type:'');el.dataset.id=it.id;
  el.innerHTML=(ev?'<div class="studyic" aria-hidden="true">📖</div>':`<button class="check" aria-label="${it.done?'Mark not done':'Mark done'}"></button>`)+
    `<div class="body"><div class="text"></div></div><button class="editbtn" aria-label="Edit">${PENCIL}</button>`;
  el.querySelector('.text').textContent=titleOf(it);
  el.querySelector('.body').appendChild(badges(it));
  return el;
}
function render(){
  const todo=items.filter(i=>!i.done);
  const today=sortByDue(todo.filter(inToday));
  const study=todo.filter(isEvent).sort((a,b)=>(a.due||'9999').localeCompare(b.due||'9999'));
  const done=items.filter(i=>i.done&&!isEvent(i)).sort((a,b)=>(b.doneAt||0)-(a.doneAt||0));
  $('todayList').replaceChildren(...today.map(li));
  const nx=$('todayList').firstElementChild; // highlight the next thing to do
  if(nx){nx.classList.add('first');nx.querySelector('.meta').insertAdjacentHTML('afterbegin','<span class="badge next">Next</span>')}
  $('studyList').replaceChildren(...study.map(li));
  $('allList').replaceChildren(...sortByDue(todo).map(li));
  $('doneList').replaceChildren(...done.map(li));
  $('todayEmpty').hidden=today.length>0;
  const later=todo.length-today.length;
  $('todayMore').innerHTML=later?`${later} more coming up later · <button type="button">See all</button>`:'';
  $('studyEmpty').hidden=study.length>0;
  const week=study.filter(i=>i.due&&diffDays(i.due)>=0&&diffDays(i.due)<7);
  const cnt=k=>week.filter(i=>i.type===k).length,parts=[];
  if(cnt('test')) parts.push(`<b>${n_(cnt('test'),'test')}</b>`);
  if(cnt('quiz')) parts.push(`<b>${cnt('quiz')} ${cnt('quiz')===1?'quiz':'quizzes'}</b>`);
  $('studyHead').innerHTML=study.length?`<span>${parts.length?`Next 7 days: ${parts.join(', ')}`:'Nothing in the next 7 days'}</span>`:'';
  $('allEmpty').hidden=todo.length>0;
  $('allCount').textContent=todo.length?`${todo.length} to do`:'';
  $('doneWrap').hidden=!done.length;
  $('doneLabel').textContent=`Done (${done.length})`;
  renderProgress();renderItemView();
}
