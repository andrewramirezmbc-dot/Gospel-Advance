(() => {
  if (window.__siteAnalyticsLoaded) return;
  window.__siteAnalyticsLoaded = true;
  const robots = document.querySelector('meta[name="robots"]')?.content || '';
  if (/noindex/i.test(robots) || navigator.doNotTrack === '1') return;
  fetch('/seo-config.json', { cache: 'no-cache' }).then(response => {
    if (!response.ok) throw new Error('Analytics configuration unavailable');
    return response.json();
  }).then(config => {
    const id = config.measurementId;
    if (location.hostname !== config.hostname || !/^G-[A-Z0-9]+$/.test(id) || id === 'G-XXXXXXXX') return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.append(script);
    // Do not send auth query strings, recovery fragments, or user identifiers.
    let referrer = '';
    try { const url = new URL(document.referrer); referrer = url.origin + url.pathname; } catch {}
    window.gtag('js', new Date());
    window.gtag('config', id, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false });
    window.gtag('event', 'page_view', { page_location: location.origin + location.pathname, page_referrer: referrer, page_title: document.title });
  }).catch(() => {});
})();
