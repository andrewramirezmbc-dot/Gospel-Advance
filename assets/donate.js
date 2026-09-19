(() => {
  const dialog = document.createElement('dialog');
  dialog.className = 'ga-donate-dialog';
  dialog.setAttribute('aria-labelledby', 'donate-title');
  dialog.innerHTML = `<button class="ga-donate-close" aria-label="Close donation window" type="button">Close</button>
    <div class="ga-donate-layout"><div class="ga-donate-story"><img src="assets/video/hero-campus-desktop.jpg" alt="A tree-lined college campus" width="1600" height="900" />
    <div><h2 id="donate-title">Partner with Gospel Advance</h2><p>Your gift supports campus outreach, gospel conversations, travel, and the work of reaching the next generation with Jesus Christ.</p></div></div>
    <form class="ga-donate-form"><h3>Give to the mission</h3>
    <fieldset><legend>Frequency</legend><label><input type="radio" name="frequency" value="once" checked /> Give once</label><label><input type="radio" name="frequency" value="monthly" /> Monthly</label></fieldset>
    <div class="ga-donate-amounts">${[250,150,60,30,15,8].map(n => `<button type="button" data-amount="${n}" aria-pressed="${n === 30}">$${n}</button>`).join('')}</div>
    <label for="donate-amount">Amount (USD)</label><input id="donate-amount" name="amount" type="number" min="1" max="25000" step="1" value="30" required />
    <p class="ga-donate-status" role="status" aria-live="polite"></p><button class="ga-donate-submit" type="submit">Continue to Stripe</button>
    <p class="ga-donate-note">Payment details are entered on Stripe. Bible 101 and Gospel Advance share this giving account.</p></form></div>`;
  document.body.append(dialog);
  const form = dialog.querySelector('form');
  const amount = form.elements.amount;
  const submit = dialog.querySelector('.ga-donate-submit');
  const status = dialog.querySelector('.ga-donate-status');
  const presets = [...dialog.querySelectorAll('[data-amount]')];
  const update = () => presets.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.amount === amount.value)));
  presets.forEach(button => button.addEventListener('click', () => { amount.value = button.dataset.amount; update(); }));
  amount.addEventListener('input', update);
  dialog.querySelector('.ga-donate-close').addEventListener('click', () => dialog.close());
  document.addEventListener('click', event => {
    if (!event.target.closest('[data-interest="Financial partnership"]')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    dialog.showModal();
  }, true);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submit.disabled || !form.reportValidity()) return;
    submit.disabled = true;
    status.textContent = 'Opening checkout...';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch('https://101bible.org/api/create-checkout-session', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
        body: JSON.stringify({ amount: Number(amount.value), frequency: form.elements.frequency.value })
      });
      const data = await response.json();
      if (!response.ok) throw new Error('Checkout is unavailable. Please try again shortly.');
      const url = new URL(data.url);
      if (url.protocol !== 'https:' || url.hostname !== 'checkout.stripe.com') throw new Error('Invalid checkout response.');
      window.location.assign(url.href);
    } catch {
      status.textContent = 'Unable to open checkout. Please try again, or give at 101bible.org/support.';
      submit.disabled = false;
    } finally { clearTimeout(timer); }
  });
})();
