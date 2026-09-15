(() => {
  'use strict';
  const header = document.getElementById('gaHeader');
  const menu = document.getElementById('gaMobileNav');
  const menuToggle = document.getElementById('gaMenuToggle');
  const mediaDialog = document.getElementById('mediaDialog');
  const searchDialog = document.getElementById('gaSearchDialog');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const config = window.GOSPEL_ADVANCE_MEDIA || {};
  const isHome = !!document.querySelector('.ga-home');
  const iconPath = name => `assets/icons/${name}.svg`;
  let syncHeroPlayback = () => {};
  const syncScrollLock = () => {
    document.body.style.overflow = (menu?.open || mediaDialog?.open || searchDialog?.open || header?.classList.contains('menu-open')) ? 'hidden' : '';
    syncHeroPlayback();
  };
  const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 10);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  let closeMegaMenu = () => {};
  if (header) {
    const triggers = [...header.querySelectorAll('.ga-nav-trigger')];
    const backdrop = document.getElementById('gaMenuBackdrop');
    const currentFile = location.pathname?.split('/').pop() || 'index.html';
    if (!['index.html', 'gospel-advance-website.html'].includes(currentFile)) {
      header.querySelector('[aria-controls="gaResourcesMenu"]')?.classList.add('ga-current');
      document.querySelectorAll('.ga-header a, .ga-mobile-menu a').forEach(link => {
        if (link.getAttribute('href') === `/${currentFile}`) link.setAttribute('aria-current', 'page');
      });
    }
    let active = null;
    let leaveTimer;
    let inputMode = 'pointer';
    const cancelLeave = () => { clearTimeout(leaveTimer); };
    const panelFor = trigger => document.getElementById(trigger.getAttribute('aria-controls'));
    const deactivate = (trigger, switching = false) => {
      const panel = panelFor(trigger);
      panel.classList.toggle('ga-switch-out', switching);
      panel.classList.remove('is-open');
      panel.inert = true;
      panel.setAttribute('aria-hidden', 'true');
      trigger.setAttribute('aria-expanded', 'false');
    };
    triggers.forEach(trigger => {
      const panel = panelFor(trigger);
      panel.hidden = false;
      panel.inert = true;
      panel.setAttribute('aria-hidden', 'true');
    });
    backdrop.hidden = false;
    backdrop.inert = true;
    closeMegaMenu = (restoreFocus = false) => {
      cancelLeave();
      if (!active) return;
      const previous = active;
      deactivate(previous);
      active = null;
      header.classList.remove('menu-open');
      backdrop.classList.remove('is-visible');
      backdrop.inert = true;
      syncScrollLock();
      if (restoreFocus) previous.focus();
    };
    const openMegaMenu = (trigger, mode = 'pointer') => {
      cancelLeave();
      inputMode = mode;
      if (active === trigger) return;
      // Switch content without briefly unlocking the page or flashing the transparent header.
      if (active) {
        if (panelFor(active).contains(document.activeElement)) trigger.focus({ preventScroll: true });
        deactivate(active, true);
      }
      active = trigger;
      trigger.setAttribute('aria-expanded', 'true');
      const panel = panelFor(trigger);
      panel.inert = false;
      panel.setAttribute('aria-hidden', 'false');
      panel.classList.remove('ga-switch-out');
      panel.classList.add('is-open');
      header.classList.add('menu-open');
      backdrop.classList.add('is-visible');
      backdrop.inert = false;
      syncScrollLock();
    };
    triggers.forEach(trigger => {
      trigger.addEventListener('click', event => {
        const keyboard = event.detail === 0;
        if (active === trigger && (keyboard || event.pointerType === 'touch')) closeMegaMenu();
        else openMegaMenu(trigger, keyboard ? 'keyboard' : 'pointer');
      });
      trigger.addEventListener('pointerenter', event => {
        if (event.pointerType === 'mouse') openMegaMenu(trigger);
      });
      trigger.addEventListener('keydown', event => {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          openMegaMenu(trigger, 'keyboard');
          panelFor(trigger).querySelector('a')?.focus();
        }
      });
    });
    header.addEventListener('pointerenter', cancelLeave);
    header.addEventListener('keydown', event => {
      if (['Tab', 'ArrowDown', 'ArrowUp'].includes(event.key)) { inputMode = 'keyboard'; cancelLeave(); }
    });
    header.addEventListener('pointerleave', event => {
      if (event.pointerType !== 'mouse' || inputMode === 'keyboard') return;
      cancelLeave();
      leaveTimer = setTimeout(() => closeMegaMenu(header.contains(document.activeElement)), 140);
    });
    backdrop.addEventListener('click', () => closeMegaMenu(true));
    header.addEventListener('click', event => { if (event.target.closest('a')) closeMegaMenu(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && active) closeMegaMenu(true); });
    document.addEventListener('focusin', event => { if (active && !header.contains(event.target)) closeMegaMenu(); });
    window.matchMedia('(max-width: 1099px)').addEventListener('change', event => {
      if (event.matches && active) { closeMegaMenu(); menuToggle?.focus(); }
    });
  }

  if (searchDialog) {
    const input = document.getElementById('gaSearchInput');
    const results = document.getElementById('gaSearchResults');
    const status = document.getElementById('gaSearchStatus');
    const pages = [
      ['The Mission', '/#mission', 'Ministry', 'campus evangelism students Jesus'],
      ['Campus Conversations', '/#conversations', 'Films', 'interviews videos students'],
      ['Meet Andrew Ramirez', '/#about', 'About', 'evangelist biography'],
      ['Partner With Us', '/#partner', 'Get involved', 'give giving financial prayer support donate'],
      ['Contact Gospel Advance', '/#contact', 'Contact', 'connect campus church invite'],
      ['The Gospel We Share', '/#gospel', 'The gospel', 'Jesus salvation faith believe Bible Scripture'],
      ['Sermons', '/sermons.html', 'Watch', 'messages Bible John preaching'],
      ['Articles', '/articles.html', 'Read', 'writing Bible study'],
      ["The Preacher's Preparation Guide", '/preachers-guide.html', 'Resources', 'sermon preparation outline template'],
      ['Seven Components of the Gospel', '/seven-components.html', 'Article', 'evangelism gospel conversation'],
      ['Discipleship', '/discipleship.html', 'Article', 'following Jesus growth'],
      ['The Problem of Evil', '/problem-of-evil.html', 'Article', 'suffering God apologetics'],
      ["When You Can't Trace His Hand", '/when-you-cant-trace-his-hand.html', 'Article', 'trust faith God suffering'],
    ];
    const renderResults = () => {
      const words = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      const matches = words.length ? pages.filter(page => words.every(word => `${page[0]} ${page[2]} ${page[3]}`.toLowerCase().includes(word))) : pages.slice(0, 6);
      results.replaceChildren();
      for (const [title, href, category] of matches) {
        const item = document.createElement('li');
        const link = document.createElement('a');
        const label = document.createElement('span');
        const tag = document.createElement('small');
        link.href = isHome && href.startsWith('/#') ? href.slice(1) : href;
        label.textContent = title;
        tag.textContent = category;
        link.append(label, tag);
        item.append(link);
        results.append(item);
      }
      status.textContent = !words.length ? 'Explore the ministry' : matches.length ? `${matches.length} result${matches.length === 1 ? '' : 's'}` : 'No results. Try a different word, or contact us below.';
      if (!matches.length) {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = '/#contact';
        link.textContent = 'Contact Gospel Advance';
        item.append(link);
        results.append(item);
      }
    };
    let restoreMobileFocus = false;
    document.querySelectorAll('[data-search-open]').forEach(button => button.addEventListener('click', () => {
      restoreMobileFocus = !!menu?.open;
      menu?.close();
      closeMegaMenu();
      input.value = '';
      renderResults();
      searchDialog.showModal();
      input.focus();
      syncScrollLock();
    }));
    input.addEventListener('input', renderResults);
    document.getElementById('gaSearchForm').addEventListener('submit', event => { event.preventDefault(); results.querySelector('a')?.focus(); });
    document.getElementById('gaSearchClose').addEventListener('click', () => searchDialog.close());
    results.addEventListener('click', event => { if (event.target.closest('a')) searchDialog.close(); });
    searchDialog.addEventListener('click', event => {
      if (event.target !== searchDialog) return;
      const rect = searchDialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) searchDialog.close();
    });
    searchDialog.addEventListener('close', () => {
      syncScrollLock();
      if (restoreMobileFocus) menuToggle?.focus();
      restoreMobileFocus = false;
    });
  }

  if (menu && menuToggle) {
    const root = document.getElementById('gaMobileRoot');
    const panelTriggers = [...menu.querySelectorAll('[data-mobile-panel]')];
    const panels = [...menu.querySelectorAll('.ga-mobile-panel')];
    let mobileActive = null;
    panels.forEach(panel => { panel.hidden = false; panel.inert = true; panel.setAttribute('aria-hidden', 'true'); });
    const backToRoot = (restoreFocus = true) => {
      const previous = mobileActive;
      panels.forEach(panel => {
        panel.classList.remove('is-active');
        panel.inert = true;
        panel.setAttribute('aria-hidden', 'true');
      });
      panelTriggers.forEach(trigger => trigger.setAttribute('aria-expanded', 'false'));
      if (root) { root.inert = false; root.removeAttribute('aria-hidden'); }
      menu.classList.remove('submenu-open');
      mobileActive = null;
      if (restoreFocus) previous?.focus({ preventScroll: true });
    };
    panelTriggers.forEach(trigger => trigger.addEventListener('click', () => {
      mobileActive = trigger;
      const panel = document.getElementById(trigger.dataset.mobilePanel);
      root.inert = true;
      root.setAttribute('aria-hidden', 'true');
      trigger.setAttribute('aria-expanded', 'true');
      panel.inert = false;
      panel.setAttribute('aria-hidden', 'false');
      panel.classList.add('is-active');
      panel.scrollTop = 0;
      menu.classList.add('submenu-open');
      panel.querySelector('[data-mobile-back]').focus({ preventScroll: true });
    }));
    menu.querySelectorAll('[data-mobile-back]').forEach(button => button.addEventListener('click', () => backToRoot()));
    menu.addEventListener('cancel', event => {
      if (mobileActive) { event.preventDefault(); backToRoot(); }
    });
    menuToggle.addEventListener('click', () => {
      closeMegaMenu();
      backToRoot(false);
      menu.showModal();
      menuToggle.setAttribute('aria-expanded', 'true');
      syncScrollLock();
    });
    document.getElementById('gaMenuClose').addEventListener('click', () => menu.close());
    menu.addEventListener('click', event => { if (event.target.closest('a')) menu.close(); });
    menu.addEventListener('close', () => {
      backToRoot(false);
      menuToggle.setAttribute('aria-expanded', 'false');
      syncScrollLock();
    });
    window.matchMedia('(min-width: 1100px)').addEventListener('change', event => {
      if (event.matches && menu.open) menu.close();
    });
  }

  if (isHome && 'IntersectionObserver' in window) {
    const entrance = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!motion.matches) entry.target.classList.add('ga-enter');
        entrance.unobserve(entry.target);
      }
    }), { threshold: .08 });
    document.querySelectorAll('.ga-section > .ga-shell').forEach(section => entrance.observe(section));
  }

  const gospelDetails = document.querySelector('#gospel > details');
  const openGospel = () => { if (gospelDetails && location.hash === '#gospel') gospelDetails.open = true; };
  window.addEventListener('hashchange', openGospel);
  openGospel();

  const featured = document.getElementById('featuredPlayer');
  if (featured) {
    featured.tabIndex = 0;
    featured.setAttribute('role', 'button');
    featured.setAttribute('aria-label', 'Play featured sermon');
    featured.addEventListener('keydown', event => {
      if (event.target === featured && ['Enter', ' '].includes(event.key)) {
        event.preventDefault();
        featured.click();
      }
    });
  }

  const form = document.getElementById('contactForm');
  document.querySelectorAll('[data-interest]').forEach(link => {
    link.addEventListener('click', () => {
      if (!form) {
        try { window.sessionStorage.setItem('ga-interest', link.dataset.interest); } catch { /* Storage is optional. */ }
        return;
      }
      document.getElementById('contactInterest').value = link.dataset.interest;
      const note = document.getElementById('contactInterestNote');
      note.textContent = `Interested in: ${link.dataset.interest}`;
      note.hidden = false;
      requestAnimationFrame(() => document.getElementById('contactName').focus({ preventScroll: true }));
    });
  });
  if (form) {
    try {
      const interest = window.sessionStorage.getItem('ga-interest');
      window.sessionStorage.removeItem('ga-interest');
      if (['Prayer partnership', 'Financial partnership', 'Campus connection', 'Ministry partnership'].includes(interest)) {
        document.getElementById('contactInterest').value = interest;
        document.getElementById('contactInterestNote').textContent = `Interested in: ${interest}`;
        document.getElementById('contactInterestNote').hidden = false;
      }
    } catch { /* Contact works without browser storage. */ }
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const button = document.getElementById('contactBtn');
      if (button.disabled) return;
      const status = document.getElementById('formStatus');
      const note = document.getElementById('contactInterestNote');
      const original = button.innerHTML;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      button.disabled = true;
      button.textContent = 'Sending...';
      form.setAttribute('aria-busy', 'true');
      status.hidden = true;
      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Message was not accepted');
        status.textContent = "Thank you for reaching out. Your message has been sent, and we'll be in touch.";
        status.dataset.state = 'success';
        form.reset();
        note.hidden = true;
      } catch {
        status.textContent = 'Your message could not be sent. Please try again in a moment. Your message is still here.';
        status.dataset.state = 'error';
      } finally {
        clearTimeout(timeout);
        button.disabled = false;
        button.innerHTML = original;
        form.removeAttribute('aria-busy');
        status.hidden = false;
      }
    });
  }

  // Every missing film has an intentional state; no unrelated sermon is used as a stand-in.
  if (!mediaDialog) return;
  const player = document.getElementById('dialogPlayer');
  const empty = document.getElementById('mediaEmpty');
  const emptyCopy = document.getElementById('mediaEmptyCopy');
  const hero = document.getElementById('heroVideo');
  const titles = { trailer: 'The Gospel Advance Mission', conversation1: 'A Campus Conversation About the Gospel', conversation2: 'A Testimony of Freedom in Christ', conversation3: 'Campus Conversation' };
  function mediaSource(value) {
    if (!value || !value.trim()) return null;
    try {
      const url = new URL(value, location.href);
      if (!['http:', 'https:', 'file:'].includes(url.protocol)) return null;
      const hosts = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtube-nocookie.com'];
      if (hosts.includes(url.hostname)) {
        const id = url.hostname === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v') || url.pathname.split('/').filter(Boolean).pop();
        return /^[\w-]{11}$/.test(id || '') ? { type: 'youtube', src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` } : null;
      }
      return { type: 'video', src: url.href };
    } catch { return null; }
  }
  function showUnavailable(text) {
    player.replaceChildren();
    empty.hidden = false;
    emptyCopy.textContent = text;
  }
  document.querySelectorAll('[data-media]').forEach(button => {
    const source = mediaSource(config[button.dataset.media]);
    if (source) {
      const caption = button.querySelector('.ga-interview-caption small');
      if (caption) caption.textContent = 'Watch the conversation';
    }
    button.addEventListener('click', () => {
      const key = button.dataset.media;
      hero?.pause();
      document.getElementById('mediaTitle').textContent = titles[key] || 'Gospel Advance';
      player.replaceChildren();
      empty.hidden = !!source;
      if (source?.type === 'youtube') {
        const iframe = document.createElement('iframe');
        iframe.title = titles[key];
        iframe.src = source.src;
        iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
        iframe.allowFullscreen = true;
        player.append(iframe);
      } else if (source) {
        const video = document.createElement('video');
        video.controls = true;
        video.playsInline = true;
        video.src = source.src;
        video.addEventListener('error', () => showUnavailable('This film is temporarily unavailable. Please try again later.'));
        player.append(video);
        video.play().catch(() => {});
      } else {
        emptyCopy.textContent = key === 'trailer'
          ? 'Our mission trailer is in production. In the meantime, meet the ministry and explore how you can be part of the work.'
          : 'This conversation is not available here yet. Explore more interviews on our YouTube channel.';
      }
      mediaDialog.showModal();
      syncScrollLock();
    });
  });
  document.getElementById('mediaClose').addEventListener('click', () => mediaDialog.close());
  mediaDialog.querySelector('[data-close-media]').addEventListener('click', () => mediaDialog.close());
  mediaDialog.addEventListener('click', event => {
    if (event.target === mediaDialog) {
      const rect = mediaDialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) mediaDialog.close();
    }
  });
  mediaDialog.addEventListener('close', () => {
    player.querySelector('video')?.pause();
    player.replaceChildren();
    syncScrollLock();
  });

  const mobilePreview = window.matchMedia('(max-width: 767px)');
  const preview = mediaSource(mobilePreview.matches && config.heroPreviewMobile ? config.heroPreviewMobile : config.heroPreview);
  if (!hero || !preview || preview.type !== 'video') return;
  const controls = document.getElementById('heroFilmTools');
  const label = document.getElementById('heroFilmLabel');
  const play = document.getElementById('heroPlay');
  const mute = document.getElementById('heroMute');
  const progress = document.getElementById('heroFilmProgress');
  mute.hidden = config.heroHasAudio === false;
  const fullFilm = controls.querySelector('[data-media="trailer"]');
  if (fullFilm) fullFilm.hidden = !config.trailer;
  label.textContent = config.heroLabel || 'Gospel Advance / Mission film';
  let wantsPlayback = !motion.matches;
  let heroVisible = window.scrollY < hero.parentElement.offsetHeight;
  syncHeroPlayback = () => {
    const blocked = document.hidden || menu?.open || searchDialog?.open || mediaDialog.open || header?.classList.contains('menu-open');
    if (wantsPlayback && heroVisible && !blocked) {
      if (!hero.getAttribute('src')) hero.src = preview.src;
      hero.play().catch(() => { updateControls(); });
    }
    else hero.pause();
  };
  const updateControls = () => {
    play.title = hero.paused ? 'Play preview' : 'Pause preview';
    play.setAttribute('aria-label', play.title);
    play.querySelector('img').src = iconPath(hero.paused ? 'play' : 'pause');
    mute.title = hero.muted ? 'Unmute preview' : 'Mute preview';
    mute.setAttribute('aria-label', mute.title);
    mute.querySelector('img').src = iconPath(hero.muted ? 'volume-x' : 'volume-2');
  };
  play.addEventListener('click', () => { wantsPlayback = hero.paused; syncHeroPlayback(); });
  mute.addEventListener('click', () => { hero.muted = !hero.muted; });
  ['play', 'pause', 'volumechange'].forEach(type => hero.addEventListener(type, updateControls));
  hero.addEventListener('timeupdate', () => {
    progress.style.width = Number.isFinite(hero.duration) && hero.duration > 0 ? `${100 * hero.currentTime / hero.duration}%` : '0%';
  });
  hero.addEventListener('loadedmetadata', () => {
    controls.hidden = false;
    label.textContent = config.heroLabel || 'Gospel Advance / Mission film';
    updateControls();
    syncHeroPlayback();
  }, { once: true });
  hero.addEventListener('loadeddata', () => { hero.hidden = false; }, { once: true });
  hero.addEventListener('error', () => {
    wantsPlayback = false;
    hero.pause();
    hero.hidden = true;
    controls.hidden = true;
    label.textContent = 'Gospel Advance / Mission film preview unavailable';
  });
  document.addEventListener('visibilitychange', syncHeroPlayback);
  motion.addEventListener('change', event => { if (event.matches) { wantsPlayback = false; syncHeroPlayback(); } });
  new IntersectionObserver(entries => {
    heroVisible = entries[0].isIntersecting;
    syncHeroPlayback();
  }, { threshold: .1 }).observe(hero.parentElement);
  hero.muted = true;
  hero.preload = 'metadata';
  // Reduced-motion visitors get the poster without downloading the video until Play.
  if (motion.matches) {
    controls.hidden = false;
    updateControls();
  } else hero.src = preview.src;
})();
