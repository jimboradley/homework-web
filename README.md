# Homework (app content)

The content of the Homework Android app. Push to `main` and every installed copy
updates itself: the publish workflow builds a bundle onto the `dist` branch, and the app
downloads it in the background and switches over the next time it's closed.

Only code lives here. Each kid's list is stored on their own phone and never uploaded.
The Android shell and its signing key are in the private `homework-tracker` repo.

The app is plain HTML, CSS and JS with no build step: `www/index.html` holds the markup, with styles
in `www/css/` and code in `www/js/`. See `CLAUDE.md` for what each file does and how they fit together.
