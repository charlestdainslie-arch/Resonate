/* RESONATE issue #14 — navigation and return-path safety net.
   Loaded LAST; does not modify app.js, reading-stage.js or journal.js.
   1. Phone/browser Back mirrors the on-screen back control instead of leaving the app.
   2. The closed menu is removed from keyboard/screen-reader reach; Escape closes it;
      focus moves into it on open and returns to the menu button on close.
   3. After a view change, focus moves to the new page heading so screen readers announce it. */
(() => {
  const appRoot = document.getElementById('app');
  if (!appRoot || typeof state === 'undefined') return;
  const supportsHistory = typeof history !== 'undefined' && typeof history.pushState === 'function';
  let lastView = state.view;
  let guard = false;        // one extra history entry while away from home
  let handlingPop = false;

  function pushGuard() {
    if (!supportsHistory || guard) return;
    history.pushState({ resonate: true }, '');
    guard = true;
  }

  // The same control a person would tap: detail "Return", or the page's back link.
  function inAppBack() {
    const menu = document.getElementById('menuOverlay');
    if (menu && menu.classList.contains('open')) { closeMenu(); return true; }
    const control = document.getElementById('backBtn') || document.querySelector('[data-back]');
    if (!control) return false;
    control.click();
    return true;
  }

  if (supportsHistory) {
    window.addEventListener('popstate', () => {
      guard = false;
      if (state.view === 'home' && !document.getElementById('menuOverlay')?.classList.contains('open')) {
        history.back();   // already home: let Back leave the app as normal
        return;
      }
      handlingPop = true;
      inAppBack();
      handlingPop = false;
      if (state.view !== 'home' || document.getElementById('menuOverlay')?.classList.contains('open')) pushGuard();
    });
  }

  function focusHeading() {
    const heading = appRoot.querySelector('.page h1');
    if (!heading) return;
    if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }

  function wireMenu() {
    const overlay = document.getElementById('menuOverlay');
    const opener = document.getElementById('menuBtn');
    if (!overlay || overlay.dataset.a11yWired) return;
    overlay.dataset.a11yWired = '1';
    if (opener) { opener.setAttribute('aria-controls', 'menuOverlay'); }
    const sync = () => {
      const open = overlay.classList.contains('open');
      overlay.inert = !open;
      if (opener) opener.setAttribute('aria-expanded', String(open));
      if (open) { overlay.querySelector('nav button')?.focus({ preventScroll: true }); pushGuard(); }
      else if (overlay.contains(document.activeElement) || document.activeElement === document.body) opener?.focus({ preventScroll: true });
    };
    new MutationObserver(sync).observe(overlay, { attributes: true, attributeFilter: ['class'] });
    overlay.inert = !overlay.classList.contains('open');
    if (opener) opener.setAttribute('aria-expanded', String(overlay.classList.contains('open')));
  }

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const overlay = document.getElementById('menuOverlay');
    if (overlay && overlay.classList.contains('open')) { event.preventDefault(); closeMenu(); }
  });

  function afterRender() {
    wireMenu();
    if (state.view !== lastView) {
      const first = lastView === undefined;
      lastView = state.view;
      if (!first) {
        if (state.view !== 'home' && !handlingPop) pushGuard();
        focusHeading();
      }
    }
  }
  new MutationObserver(afterRender).observe(appRoot, { childList: true });
  afterRender();
})();
