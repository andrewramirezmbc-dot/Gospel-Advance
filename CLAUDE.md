# Gospel Advance — Project Context

This is the Gospel Advance website: a static site hosted on GitHub Pages at [thegospeladvance.org](https://thegospeladvance.org).

## Quick Facts

| Item | Value |
|------|-------|
| Live URL | https://thegospeladvance.org |
| GitHub Pages URL | https://andrewramirezmbc-dot.github.io/Gospel-Advance/ |
| Repo | github.com/andrewramirezmbc-dot/Gospel-Advance |
| Formspree ID | mvzbqgwq |
| YouTube | @AndrewRamirez-Sermons |
| Instagram | @andrewpramirez |
| Contact email | Andrew@thegospeladvance.org (never displayed on site) |
| Domain registrar | domain.com / Network Solutions |

## File Structure

```
/
├── index.html                       # Homepage (what GitHub serves)
├── gospel-advance-website.html      # Working copy — always keep in sync with index.html
├── sermons.html                     # All sermons page
├── articles.html                    # Articles listing page (cards)
├── preachers-guide.html             # Resources hub — the Preacher's Preparation Guide
├── seven-components.html            # Article
├── discipleship.html                # Article
├── problem-of-evil.html             # Article
├── when-you-cant-trace-his-hand.html # Article
├── Preachers_Preparation_Guide.pdf
├── Preachers_Preparation_Guide.docx
├── Sermon_Outline_Template.pdf
├── Sermon_Outline_Template.docx
└── andrew-ramirez.jpg               # Preaching photo (600x800, 3:4)
```

## Critical Workflow Rules

**1. `index.html` and `gospel-advance-website.html` must stay identical.** Always edit `gospel-advance-website.html` first, then copy it to `index.html`:

```bash
cp gospel-advance-website.html index.html
```

Never edit `index.html` directly.

**2. Nav changes must be applied to all four top-level pages.** When the nav or footer changes, update:
- `gospel-advance-website.html` (and copy to `index.html`)
- `sermons.html`
- `articles.html`
- `preachers-guide.html`

Article pages (`seven-components.html`, etc.) also have the same nav — update them if a site-wide nav change is happening.

**3. Deploy with git.** No manual file uploads anymore. The deploy is:

```bash
git add -A
git commit -m "<descriptive message>"
git push
```

GitHub Pages rebuilds automatically in ~60 seconds.

## Brand System

### Colors
- **Charcoal** `#1C1C1C` — backgrounds, headings, primary text
- **Cream** `#F5F0E8` — section backgrounds, card fills, callouts
- **Bronze** `#B8965A` — accents, labels, links, hover states
- **Light Gold** `#D4C4A0` — secondary accents
- **Warm Gray** `#8A8478` — secondary text
- **Text body** `#4A4A4A`

### CSS Variables (used across every file)
```css
--charcoal:#1C1C1C; --cream:#F5F0E8; --bronze:#B8965A; --light-gold:#D4C4A0;
--sage:#E4E8E0; --warm-gray:#8A8478; --white:#FFFFFF; --text-body:#4A4A4A;
--border:rgba(28,28,28,.08); --radius:12px;
--serif:'Playfair Display',Georgia,serif;
--sans:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;
```

### Typography
- **Headings:** Playfair Display (serif), weights 400/700/800
- **Body:** Inter (sans-serif), weights 300–700
- **Section labels:** Inter, 0.72rem, weight 600, letter-spacing 0.2em, uppercase, bronze color

### Voice
Reverent, clear, warm, authoritative. Zero hype. First person where appropriate. Personal and pastoral, never performative.

## Nav Structure (Current)

Desktop nav uses `.nav-pill` — a pill-shaped container with flat links. Current items:

1. Home
2. About (`index.html#about`)
3. Watch (`sermons.html`)
4. **Resources** (dropdown) → Articles, The Preacher's Guide
5. The Gospel (`index.html#gospel`)
6. Contact (`index.html#contact`)
7. Bible 101 (external: https://stirring-babka-630d70.netlify.app/)

**Resources dropdown pattern:** Uses `.has-dropdown` wrapper with `.dropdown-toggle` trigger and `.dropdown-menu` panel. Hover-activated with a 10px invisible bridge so the mouse doesn't lose the menu.

**Mobile nav:** Resources is rendered as a group label with sub-items underneath (hover doesn't work on mobile).

**Active states:**
- On Articles page: Resources active, Articles active in dropdown
- On Preacher's Guide: Resources active, The Preacher's Guide active in dropdown

## Adding a New Article

1. Create the article file using `seven-components.html` as a template (same nav, same footer, same CSS)
2. Update the title, meta description, article tag, h1, meta line, and article body
3. Add a card to `articles.html` in the `.articles-grid`, placing newer articles first
4. Adjust the `.d1`, `.d2`, `.d3` stagger delay classes so the reveal animation flows
5. Optionally add a card to the homepage articles section in `gospel-advance-website.html` and copy to `index.html`

### Article Card Pattern

```html
<a href="FILENAME.html" class="article-card reveal [d1|d2|d3]">
  <span class="article-tag">TAG</span>
  <h3>TITLE</h3>
  <p>DESCRIPTION</p>
  <div class="meta">Andrew Ramirez &middot; MONTH YEAR &middot; N min read</div>
  <span class="read-more">Read Article <svg viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18"/></svg></span>
</a>
```

## Adding a New Sermon

Sermons live in two places:

- **Homepage** (`gospel-advance-website.html` → copy to `index.html`): featured video + 3 sidebar items + 3 message cards
- **Sermons page** (`sermons.html`): featured video + 3 sidebar items + "All Sermons" grid

YouTube thumbnails use the YouTube-provided URLs:
- Featured: `https://img.youtube.com/vi/{videoId}/hqdefault.jpg`
- Sidebar/cards: `https://img.youtube.com/vi/{videoId}/mqdefault.jpg`

Click-to-play pattern: thumbnail `<div>` with SVG play button overlay; JS swaps it for a YouTube iframe on click.

### Current Sermon Video IDs

**Featured:** `-wMeu74tAxQ` (The Fixation & The Invitation — John 4:1-29)

**Sidebar:**
- `OJoDGg7F5_w` — He Must Increase, I Must Decrease (John 3:27-36)
- `inTMY5XX0EI` — Why Did Jesus Have to Die? (John 3:14-21)
- `-a8dLqwTHG0` — How to Get to Heaven According to Jesus (John 3:1-16)

**Message cards:**
- `QVZExXnV7bs` — Jesus vs. Religious Corruption (John 2:13-25)
- `GhcMbaCEuSE` — The Battle For Your Mind
- `UoCg0YrmHUg` — Water into Wine (John 2:1-12)

**Sermons page additional:** `lX41tH1AS54`, `Up3P1fdEmIw`, `TWbLs3TIdko`, `WgtTNPhm0vE`

## Contact Form

Uses Formspree AJAX (ID `mvzbqgwq`). Includes a `_gotcha` honeypot field for spam protection. JavaScript handles submit with loading state and success/error messages. No email address displayed on the site.

## Social Media

Only **YouTube** and **Instagram**. Never add Facebook, Twitter/X, or TikTok — Andrew doesn't have those accounts.

- YouTube: `https://www.youtube.com/@AndrewRamirez-Sermons`
- YouTube subscribe link: `https://www.youtube.com/@AndrewRamirez-Sermons?sub_confirmation=1`
- Instagram: `https://www.instagram.com/andrewpramirez/`

## Cross-Page Linking Pattern

- From homepage → sections: `#about`, `#gospel`, `#contact`
- From sub-pages → homepage sections: `index.html#about`, `index.html#gospel`, `index.html#contact`
- Between sub-pages: direct filenames (`sermons.html`, `articles.html`, `preachers-guide.html`)
- To articles: direct filenames (`seven-components.html`, etc.)

## Commit Message Conventions

Keep commits small and descriptive. Format:
- `Add article: <title>`
- `Update nav: <change>`
- `Fix: <bug>`
- `Content: <what changed>`

## Design Patterns to Preserve

- **Scroll reveal:** IntersectionObserver adds `.visible` to `.reveal` elements. Stagger delays: `.d1` (.1s), `.d2` (.2s), `.d3` (.3s), `.d4` (.4s).
- **Nav scroll effect:** Nav gets `.scrolled` class on scroll — adds white background, blur, shadow, reduced padding.
- **Mobile menu:** `#menuToggle` hamburger shows `.mobile-nav` overlay with full-screen links. `#mobileClose` × button closes it. Body scroll is locked while open.
- **Footer:** 4-column grid (brand | Gospel Advance links | Categories | Connect). Responsive to 1 column at mobile.

## Things NOT to Touch Without Asking

- Formspree form action URL (breaks the contact form)
- YouTube video IDs (unless adding a new sermon)
- The M'Cheyne quote in the About section
- The Gospel section's four steps and John 3:16 verse (doctrinally weighted)
- DNS records or CNAME file
