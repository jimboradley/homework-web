# Locked In – app content

Everything in `www/` ships as-is: the publish workflow zips the folder into a live update, and the
Android shell (in `homework-tracker`) bundles a copy as its offline starting point. **There is no build
step, no bundler and no npm.** Plain HTML, CSS and classic `<script>` files.

## Layout

```
www/
  index.html        markup for every screen + the <link>/<script> tags (load order lives here)
  sw.js             service worker for the browser version; lists every file to cache offline
  css/
    base.css        theme tokens (light + dark), reset, header, [hidden], .vh
    addbar.css      sticky add bar and chips
    list.css        progress card, list rows, badges, page headers, Done section
    tabbar.css      bottom tabs
    timer.css       timer pill, timer controls, full-screen timer
    sheets.css      full-screen sheets, item view
    dialogs.css     edit + settings dialogs
    toast.css       toast
  js/               loaded in this order:
    core.js         $(), read()/write() for localStorage, storage keys
    types.js        TYPES, detectType, isEvent, isBig, titleOf
    dates.js        date helpers, parseDue (typed due dates), fmtMin/fmtClock, n_()
    state.js        items, meta, S (settings), T (timer); load, migrate, save()
    addbar.js       add bar
    pages.js        tabs: page, setPage()
    render.js       render(): the Today / Study / All lists, inToday, sortByDue, li()
    progress.js     Today's progress card
    toast.js        toast(msg, undo)
    items.js        complete / undone / clear, list clicks, snapshot/restore, archivePastEvents
    sheets.js       openSheet/closeSheet, swipe to close, wake lock, dialog backdrop clicks
    itemview.js     one assignment full screen
    edit.js         edit dialog
    timer.js        focus timer (pomodoro)
    reminders.js    local notifications (Android only)
    settings.js     settings dialog
    updates.js      live updates (Android only)
    boot.js         startup + lifecycle (visibility, back button). Must stay last.
```

## How the scripts fit together

- All files share one global scope, like a single script that has been cut into pieces. A top-level
  `const`/`let`/`function` in one file is visible in every other file. No `import`/`export`.
- **Load order matters only for code that runs immediately.** A file can *call* a function from a
  later file inside a function body or event handler (it exists by the time that runs), but code at
  the top level of a file may only use what earlier files define. Startup calls belong in `boot.js`.
- Top-level names must be unique across all files. A duplicate `const`/`let` is a SyntaxError that
  breaks the whole app. Before adding a top-level name, run `grep -rn "name" www/js`.
- `APP_VERSION` is defined inline in `index.html`, not in a JS file. The publish workflow here and both
  workflows in `homework-tracker` find and replace it there.
- Shared state is `items`, `meta`, `S`, `T`, `page`, `viewing`. Code that changes data calls `save()`
  (or `saveSettings()` / `saveTimer()`) and then `render()`.

## Adding a file

1. Create `www/js/<name>.js` (or `www/css/<name>.css`) with a one-line comment saying what it covers.
2. Add its `<script>`/`<link>` tag to `index.html` in the right place.
3. Add its name to the `CSS`/`JS` list in `www/sw.js` and bump `VERSION` there.

## Working in parallel

Each feature mostly lives in one JS file and one CSS file, so agents working on different features
rarely touch the same file. The shared hotspots are `index.html` (markup), `state.js` (new settings
defaults) and `render.js`. Keep edits there small and limited to the feature.

## Testing

No test suite. Serve the folder and open it in Chromium with Playwright:

```
python3 -m http.server 8765 -d www &
```

Check that the page loads without `pageerror`/console errors, then use the feature. Reminders and
live updates only run inside the Android app (`window.Capacitor`); in a browser they switch off
by themselves.
