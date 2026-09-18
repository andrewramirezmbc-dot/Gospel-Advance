# Gospel Advance Website

The September 2026 homepage follows Andrew's approved mockup layout. Its heavy white headline uses Archivo Black with a compact line-height and horizontal shaping; its red accent uses DM Serif Display Italic with a fuller stroke and narrower proportions. The hero is reserved exclusively for the Gospel Advance trailer video. Until it is supplied, a neutral charcoal background remains behind the approved typography; no conversation photo or interview footage is used as a substitute. Text, logo, buttons, and the mission divider remain real HTML/CSS. The two-line logo uses Archivo 900; navigation and body text remain Plus Jakarta Sans. These open-source faces visually adapt the mockup rather than claiming to identify an exact font in an AI-generated image. Earlier font research remains in `assets/brand-studies/FONT-RESEARCH.md`, and logo studies remain in `assets/brand-studies/wordmarks.html`. The site remains static HTML, CSS, and JavaScript with no build step.

## Editing

Edit `gospel-advance-website.html` first, then copy it to `index.html`. Shared presentation and behavior live in `assets/site.css` and `assets/site.js`. Navigation and footer markup are static in all pages; update them together.

All seven inner pages now load `assets/subpages.css` after `assets/site.css`. This replaces the legacy inline cream/bronze CSS with the homepage's Plus Jakarta Sans typography, red accents, charcoal/paper palette, and unframed resource and reading layouts. `assets/subpages.js` handles focus after keyboard activation of the featured sermon player. Keep article text, Scripture, sermon IDs, and download filenames intact. Article and guide content remains visible without JavaScript.

## Navigation And Motion

Desktop mission and resource buttons open full-width panels on mouse hover, with a short fade/slide and blurred backdrop. Moving to another trigger switches panels without resetting the header or scroll lock. Leaving the header closes the panel after a 140ms grace period; re-entering cancels dismissal. A mouse click on a hovered trigger leaves it open, while keyboard and touch activation toggle it. Click outside or press Escape to close. Arrow Down moves into the panel; Tab retains normal document order. Pointer exit does not dismiss a keyboard-opened panel. The header compacts after 10px of scrolling.

Below 1100px, navigation becomes an inset native modal with a persistent brand, partnership action, and close button. Mission and resource links slide into separate submenu screens with a Main Menu button. Inactive screens are inert and hidden from assistive technology. Back restores focus to the originating button; Escape returns from a submenu first, then closes the root menu. Closing resets the menu to its root. Long submenus scroll independently. Search uses a native dialog and a local title/topic index in `assets/site.js`, not an external search service. Update the index when adding pages. Search input is rendered as text, never inserted as HTML. Native dialogs trap focus. Partnership choices survive navigation from resource pages when browser session storage is available.

Section entrance animations and image/button hover transitions are intentionally restrained. Reduced-motion preferences disable animation. Main content remains visible if JavaScript fails.

## Ministry Films

Configure the five entries in `assets/media-config.js`:

- `heroPreview`: A direct MP4 or WebM URL for the muted, looping hero excerpt.
- `trailer`: A direct video or YouTube URL for the full mission trailer.
- `conversation1`, `conversation2`: The supplied campus interview and studio testimony. The third tile links to the YouTube channel; `conversation3` is reserved for a future interview.

Blank values show the coming-soon state. The hero respects reduced-motion preferences and provides playback and sound controls when a source is available. It pauses offscreen, in hidden tabs, and behind menus or dialogs; it resumes only if the visitor has not explicitly paused it. The full trailer starts from the beginning in a modal with playback controls. Supply a captioned final film or YouTube captions when publishing spoken footage.

The mission section is a text-only statement of campus evangelism and connection to existing ministries. Interview tiles and navigation retain real frames from the supplied YouTube videos; see `assets/images/PHOTO-SOURCES.md`. At Andrew's request, the Engage / Share Christ / Connect process images are now generated illustrations that match each step. About uses the untouched original preaching photograph, `andrew-ramirez.jpg`, at its full 3:4 ratio. The section expands naturally to fit the photo without cropping the head, Bible, or lectern. Andrew rejected the AI portrait; do not restore it. Generation prompts and asset paths are documented in `assets/images/GENERATED-IMAGERY.md`. Resources and contact now use a two-column layout with no photo. The trailer-only hero is unchanged. Full-resolution source excerpts and visual checks remain in gitignored `reference-analysis/`. Fonts and Lucide icons are self-hosted.

## Contact And Partnership

The existing Formspree endpoint remains unchanged. Prayer, financial partnership, and campus connection links populate the inquiry's `interest` field. No donation processor, tax-deductibility claim, or payment collection has been added. Automated form tests use a mock fetch and do not send real messages.

## Personal Website Archive

The previous website is preserved outside this deployment directory:

`/Users/Andrew_1/Gospel-Advance-Archive/2026-09-14-andrewpramirez/`

`original-site/` is the original committed website for the future Andrew Ramirez personal site. `current-site/` is the exact working snapshot before this implementation. `repository-history.bundle` contains the full repository history. Read the archive README before deploying either copy to a personal domain.

The original design has now been copied and rebranded into the independent project `/Users/Andrew_1/Andrew-Ramirez/`. Its working homepage is `andrew-ramirez-website.html`, synchronized with its own `index.html`. It retains the original serif/cream/bronze design and untouched preaching photograph. Its temporary OpenAI Sites hosting configuration is separate from this GitHub Pages project. The archive is unchanged, and no CNAME or DNS settings were copied or changed. Both contact forms currently use the existing Formspree inbox with distinct site subjects.

The previous red/condensed-font mockup build is also saved at `/Users/Andrew_1/Gospel-Advance-Archive/2026-09-14-before-interactive-refresh/`.

## Verification

Run `node --test tests/*.test.cjs` and `git diff --check`. Visually check desktop and mobile, the video dialogs, mobile navigation, partnership handoff, and resource pages. The local preview server, when running, is at `http://127.0.0.1:4178` and only serves public site files.

Deployment remains through GitHub Pages. No deployment has been performed as part of the mockup implementation.
