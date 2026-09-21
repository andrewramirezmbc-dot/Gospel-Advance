# Gospel Advance

Static website. See [SEO setup](SEO-SETUP.md) for analytics configuration,
Search Console verification, the public sitemap, and post-merge checks.

Paste your GA4 Measurement ID into `seo-config.json` after creating a property
at https://analytics.google.com/. Never put private API keys in this file.
Search Console HTML verification tokens use the same config; run
`node scripts/configure-search-console.cjs` and deploy the resulting HTML.
