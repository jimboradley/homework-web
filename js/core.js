// DOM lookup and localStorage helpers. Loaded first; everything else uses these.
const $=id=>document.getElementById(id);
const KEY='homework.v1', MKEY='homework.meta', SKEY='homework.settings', TKEY='homework.timer';
const read=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch{return d}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
if(navigator.storage&&navigator.storage.persist) navigator.storage.persist().catch(()=>{});
