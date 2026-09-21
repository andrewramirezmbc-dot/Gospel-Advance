# Search and Analytics Setup

## Status (2026-09-21)

The Academy menu link was published first in Gospel Advance commit 137c640.
These SEO changes are proposed in separate PRs, not yet merged or published.
No Google accounts, DNS records, authentication rules, or donation/tax language were changed.

Live audit:
- Gospel Advance apex responds 200; www.thegospeladvance.org fails DNS resolution.
- 101bible.org responds 200; www.101bible.org redirects 301 to apex.
- Academy public landing URLs respond 200 without login.
- /bible-101 is a sign-in/sign-up page, so it is intentionally noindex and excluded.
  /bible-101-course is the public course overview included in the sitemap.
- /experts-page redirects to /experts-page/. It is an obsolete board page, not a
  replacement public destination; it is excluded and marked noindex.
- Both course landings, about, founder, beliefs, support, and companion book are included.
- No claim is made about Google index coverage; only Search Console can confirm it.

## Configuration

Each repository has its own public `seo-config.json`:
- `measurementId`: GA4 Measurement ID, not a private API key.
- `searchConsoleVerification`: HTML-tag verification token, empty until provided.
- `hostname`: production apex; analytics does not run on localhost or deploy previews.

Gospel Advance starts with disabled placeholder `G-XXXXXXXX`.
Academy retains existing `G-WBRCN7G76K`, found in its prior deployed HTML.
Confirm that property belongs to the intended Academy account before changing it.
Create/configure properties at https://analytics.google.com/.
No service-account secrets or private API credentials belong in this config.

After pasting a Search Console token, run:
```sh
node scripts/configure-search-console.cjs
```
Commit the config and generated HTML. This emits verification into source HTML;
it does not rely on JavaScript rendering. An empty token emits no verification tag.
Gospel Advance's working homepage is copied to index.html by this command.

The analytics loader runs only on production public pages, skips Do Not Track and
noindex pages, and strips query strings/fragments from page URLs and referrers.
Private Academy lessons, dashboards, auth, admin and thank-you pages do not load GA4.
Legacy inline GA4 snippets were removed to avoid duplicate page views.
Before enabling GA4, review applicable consent/privacy requirements. The loader
is not a consent manager. Disable automatic enhanced-measurement URL/form capture
in GA4 if it could collect sensitive data; no user IDs or form values are sent by
this implementation. Use Realtime/DebugView after merge to verify actual collection.
No traffic or conversion totals have been invented.

## Andrew's Post-Merge Checklist

1. Merge the reviewed PR in each repository; the normal main-branch deployment runs.
2. Add URL-prefix properties in Google Search Console for
   https://thegospeladvance.org and https://101bible.org.
3. Copy each HTML verification token into that site's config, run the command above,
   commit/deploy the updated HTML, and click Verify.
4. Submit https://thegospeladvance.org/sitemap.xml and https://101bible.org/sitemap.xml.
5. Request indexing for each homepage, /resources.html, a top article,
   /bible-101-course and /growing-in-grace using URL Inspection.
6. Set the main site's Measurement ID; confirm the Academy's existing ID.
   Validate a page view in each property's Realtime report after deployment.
7. Optional DNS correction at Network Solutions/domain.com:
   add a CNAME with host/name `www`, target `andrewramirezmbc-dot.github.io`,
   default TTL. Remove a conflicting www record only after checking its purpose.
   Do NOT change apex A/AAAA records or the repository CNAME. Keep thegospeladvance.org
   as the GitHub Pages custom domain and HTTPS canonical. Recheck certificate
   provisioning and the www-to-apex redirect after propagation.

## Sources and Limits

- https://developers.google.com/search/docs/crawling-indexing/block-indexing
  Noindex pages must remain crawlable for Google to read their directives.
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
  GitHub Pages www CNAME setup.
- Metadata and schema describe existing content only; no accreditation, nonprofit
  status, reviews or traffic claims are added. Indexing/rankings are not guaranteed.
