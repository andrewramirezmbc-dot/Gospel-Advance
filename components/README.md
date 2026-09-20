# React UI islands

The pages remain static HTML for GitHub Pages. React enhances text headings only;
the original headings remain readable if the bundle cannot load.

- Reusable shadcn-compatible components: `components/ui/`
- Component CSS: `styles/components.css`
- Existing site CSS: `assets/site.css` and page styles
- Class-name helper: `lib/utils.ts`
- Alias: `@/*` resolves from the repository root

The `components/ui` folder is the configured shadcn component destination,
not a requirement imposed by React. Keep reusable UI here so CLI additions
and imports agree with `components.json`.

Run `npm ci`, then `npm run build` after TSX edits. Commit generated
`assets/heading-motion.js` and `assets/components.css` with the source.
GitHub Pages serves these directly; it does not run npm. TypeScript and
Tailwind CLI are installed as development dependencies. Tailwind preflight
is intentionally omitted to avoid resetting the existing site design.
For additional shadcn components, use `npx shadcn@latest add <component>`
with the existing configuration rather than reinitializing the whole site.

TextBlurIn keeps the supplied 0.8 second blur and 0.04 second word stagger.
It supports character mode, duration, delay, and an inline span variant so
the static h1/h2/h3 semantics and nested emphasis remain intact. Ordinary
spaces preserve responsive wrapping. The demo lives in `ui/demo.tsx`.

The heading adapter mounts each text fragment only when its heading reaches
the viewport, leaving later sections untouched. The component also uses
Motion's once-only in-view trigger. Reduced motion renders text immediately.
No provider, application state store, images, or icons are required.
Image-based lettering is excluded because its words are not HTML text.
