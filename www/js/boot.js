// Startup and app-lifecycle wiring. Loaded last.
/* ---------- boot ---------- */
archivePastEvents();buildChips();initSettings();initUpdates();tickTimer();render();renderTimer();
document.addEventListener('visibilitychange',()=>{if(!document.hidden){if(UP) UP.notifyAppReady().catch(()=>{});if(sheetOpen('timerFull')) keepAwake(true);archivePastEvents();buildChips();tickTimer();render();scheduleSoon();maybeCheckForUpdate()}else saveTimer()});
if(!LN&&'serviceWorker' in navigator&&location.protocol!=='file:') navigator.serviceWorker.register('sw.js').catch(()=>{});
initReminders();
// Android back gesture: close whatever is open, then go back to Today, then leave the app.
if(LN&&CAP.Plugins.App) CAP.Plugins.App.addListener('backButton',()=>{
  const d=document.querySelector('dialog[open]');
  if(d) d.close(); else if(sheetOpen('timerFull')) closeSheet('timerFull'); else if(sheetOpen('itemView')) closeSheet('itemView');
  else if(page!=='today') setPage('today'); else CAP.Plugins.App.minimizeApp();
});
// Tell the updater this version started fine; if a broken update never gets here, it rolls back automatically.
if(UP){ulog('started');UP.notifyAppReady().catch(e=>ulog('appReady FAILED',e&&e.message));
setTimeout(()=>checkForUpdate(false),3000)}
// Let them know when a live update has just been applied.
(()=>{const seen=read('homework.seenVersion',null);
  if(/^\d/.test(APP_VERSION)&&seen&&seen!==APP_VERSION) setTimeout(()=>toast(`Updated to version ${APP_VERSION} ✨`),600);
  write('homework.seenVersion',APP_VERSION)})();
