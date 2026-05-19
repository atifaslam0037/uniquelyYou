/**
 * ULY Shop Drawer v3
 *
 * The ONLY reliable way to trigger Horizon's header-drawer.js is to
 * programmatically click the hidden <summary> element inside the <details>.
 * header-drawer.js listens for summary clicks via its on:click="/toggle"
 * directive — calling hd.open() directly skips internal state setup.
 */
(function () {
  'use strict';

  /* ─── Selectors ─── */
  function getTrigger() { return document.getElementById('uly-shop-drawer-trigger'); }
  function getDetails() { return document.getElementById('Details-menu-drawer-container'); }
  function getSummary() {
    var d = getDetails();
    return d ? d.querySelector('summary.header__icon--summary') : null;
  }

  /* ─── State ─── */
  function isOpen() {
    var d = getDetails();
    return !!d && (d.classList.contains('menu-open') || d.hasAttribute('open'));
  }

  /* ─── Scroll lock ─── */
  function lockScroll(lock) {
    document.documentElement.toggleAttribute('scroll-lock', lock);
  }

  /* ─── Open / Close via summary click ─── */
  function openDrawer() {
    if (isOpen()) return;
    var s = getSummary();
    if (s) {
      s.click();
    } else {
      /* Last-resort fallback */
      var d = getDetails();
      if (d) {
        d.classList.add('menu-open');
        d.setAttribute('open', '');
      }
    }
    lockScroll(true);
    setTimeout(syncTrigger, 50);
  }

  function closeDrawer() {
    if (!isOpen()) return;
    /* Use header-drawer's own close method if available */
    var hd = document.querySelector('header-drawer.uly-drawer');
    if (hd && typeof hd.close === 'function') {
      hd.close();
    } else {
      var s = getSummary();
      if (s) {
        s.click();
      } else {
        var d = getDetails();
        if (d) {
          d.classList.remove('menu-open');
          d.removeAttribute('open');
        }
      }
    }
    lockScroll(false);
    setTimeout(syncTrigger, 50);
  }

  /* ─── Sync trigger label / arrow ─── */
  function syncTrigger() {
    var t = getTrigger();
    if (!t) return;
    var open = isOpen();
    t.setAttribute('aria-expanded', open ? 'true' : 'false');
    t.classList.toggle('is-open', open);
  }

  /* ─── Click handler ─── */
  function onTriggerClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (isOpen()) {
      closeDrawer();
    } else {
      openDrawer();
    }
  }

  /* ─── Watch details for external close (backdrop click, Escape, etc.) ─── */
  function watchDetails() {
    var d = getDetails();
    if (!d || d._ulyWatched) return;
    d._ulyWatched = true;
    var mo = new MutationObserver(function () {
      syncTrigger();
      if (!isOpen()) lockScroll(false);
    });
    mo.observe(d, { attributes: true, attributeFilter: ['class', 'open'] });
  }

  /* ─── Bind trigger ─── */
  function bindTrigger() {
    var t = getTrigger();
    if (!t || t._ulyBound) return;
    t._ulyBound = true;
    t.addEventListener('click', onTriggerClick);
  }

  /* ─── Init ─── */
  function init() {
    bindTrigger();
    watchDetails();
    syncTrigger();
  }

  function boot() {
    /* Try immediately */
    init();
    /* Also wait for header-drawer to be fully defined and connected */
    if (typeof customElements !== 'undefined' && customElements.whenDefined) {
      customElements.whenDefined('header-drawer').then(function () {
        requestAnimationFrame(init);
      }).catch(function () {});
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* Re-init after editor section reloads */
  document.addEventListener('shopify:section:load', function () {
    var t = getTrigger();
    if (t) t._ulyBound = false;
    var d = getDetails();
    if (d) d._ulyWatched = false;
    setTimeout(boot, 100);
  });

})();
