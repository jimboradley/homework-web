// Assignment types and type-based rules (events = tests/quizzes, which go to Study).
/* ---------- types ---------- */
const TYPES=[
  {id:'homework',label:'Homework',def:30},
  {id:'reading', label:'Reading', def:30},
  {id:'essay',   label:'Essay',   def:60},
  {id:'project', label:'Project', def:90},
  {id:'quiz',    label:'Quiz',    def:30},
  {id:'test',    label:'Test',    def:60},
];
const typeOf=id=>TYPES.find(t=>t.id===id)||TYPES[0];
function detectType(text){
  const t=text.toLowerCase();
  if(/\b(test|exam|midterm|final)s?\b/.test(t)) return 'test';
  if(/\bquiz/.test(t)) return 'quiz';
  if(/\b(project|presentation|poster|slides?)\b/.test(t)) return 'project';
  if(/\b(essay|paper|dbq|write-?up|report|draft)\b/.test(t)) return 'essay';
  if(/\b(read|reading|chapter|ch\.?\s*\d)/.test(t)) return 'reading';
  return 'homework';
}

const isEvent=it=>it.type==='quiz'||it.type==='test';
const isBig=it=>isEvent(it)||it.type==='project';
const titleOf=it=>isEvent(it)&&!it.done?`Study for ${it.text}`:it.text;
