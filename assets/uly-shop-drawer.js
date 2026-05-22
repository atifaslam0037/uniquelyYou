/**
 * ULY Shop Sidebar — positions below Shop All bar, full height to bottom.
 */
(function () {
  'use strict';

  var OPEN_CLASS = 'uly-shop-sidebar--open';
  var HEADER_OPEN_CLASS = 'uly-shop-sidebar-is-open';

  function getHeader() {
    return document.getElementById('header-component');
  }

  function getSidebar() {
    return document.getElementById('uly-shop-sidebar');
  }

  function getTrigger() {
    return document.getElementById('uly-shop-drawer-trigger');
  }

  function getCloseBtn() {
    return document.getElementById('uly-shop-sidebar-close');
  }

  function getBar() {
    var header = getHeader();
    return header ? header.querySelector('.uly-header__bar') : null;
  }

  function getHeaderRow() {
    var header = getHeader();
    return header ? header.querySelector('.uly-header__row') : null;
  }

  function isOpen() {
    var sidebar = getSidebar();
    return !!sidebar && sidebar.classList.contains(OPEN_CLASS);
  }

  /** Pin sidebar below the visible header area. */
  function syncSidebarPosition() {
    var row = getHeaderRow();
    var anchor = isOpen() ? row : getBar();
    if (!anchor) return;

    var top = Math.round(anchor.getBoundingClientRect().bottom);
    if (isOpen() && row) {
      var rowRect = row.getBoundingClientRect();
      var minTop = Math.max(0, Math.round(rowRect.top)) + Math.round(rowRect.height);
      top = Math.max(top, minTop);
    }

    if (top < 0) top = 0;
    document.documentElement.style.setProperty('--uly-sidebar-top', top + 'px');
  }

  function syncHeaderState() {
    var header = getHeader();
    if (!header) return;
    header.classList.toggle(HEADER_OPEN_CLASS, isOpen());
  }

  function syncTrigger() {
    var trigger = getTrigger();
    if (!trigger) return;
    var open = isOpen();
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    trigger.classList.toggle('is-open', open);
  }

  function openSidebar() {
    var sidebar = getSidebar();
    if (!sidebar || isOpen()) return;
    sidebar.classList.add(OPEN_CLASS);
    sidebar.setAttribute('aria-hidden', 'false');
    syncHeaderState();
    syncSidebarPosition();
    syncTrigger();
    getCloseBtn()?.focus();
  }

  function closeSidebar() {
    var sidebar = getSidebar();
    if (!sidebar || !isOpen()) return;
    sidebar.classList.remove(OPEN_CLASS);
    sidebar.setAttribute('aria-hidden', 'true');
    syncHeaderState();
    syncSidebarPosition();
    syncTrigger();
    getTrigger()?.focus();
  }

  function onTriggerClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (isOpen()) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }

  function onCloseClick(e) {
    e.preventDefault();
    e.stopPropagation();
    closeSidebar();
  }

  function bind() {
    var trigger = getTrigger();
    var closeBtn = getCloseBtn();

    if (trigger && !trigger._ulyBound) {
      trigger._ulyBound = true;
      trigger.addEventListener('click', onTriggerClick);
    }

    if (closeBtn && !closeBtn._ulyBound) {
      closeBtn._ulyBound = true;
      closeBtn.addEventListener('click', onCloseClick);
    }
  }

  function watchLayout() {
    syncSidebarPosition();
    if (isOpen()) syncSidebarPosition();
  }

  function init() {
    bind();
    syncHeaderState();
    syncSidebarPosition();
    syncTrigger();

    window.addEventListener('resize', watchLayout);
    window.addEventListener('scroll', watchLayout, { passive: true });

    var bar = getBar();
    if (bar && typeof ResizeObserver !== 'undefined') {
      if (bar._ulyRo) bar._ulyRo.disconnect();
      bar._ulyRo = new ResizeObserver(watchLayout);
      bar._ulyRo.observe(bar);
    }

    var row = getHeaderRow();
    if (row && typeof ResizeObserver !== 'undefined') {
      if (row._ulyRo) row._ulyRo.disconnect();
      row._ulyRo = new ResizeObserver(watchLayout);
      row._ulyRo.observe(row);
    }

    var headerGroup = document.getElementById('header-group');
    if (headerGroup && typeof ResizeObserver !== 'undefined') {
      if (headerGroup._ulyRo) headerGroup._ulyRo.disconnect();
      headerGroup._ulyRo = new ResizeObserver(watchLayout);
      headerGroup._ulyRo.observe(headerGroup);
    }
  }

  function resetBindings() {
    var trigger = getTrigger();
    var closeBtn = getCloseBtn();
    if (trigger) trigger._ulyBound = false;
    if (closeBtn) closeBtn._ulyBound = false;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  document.addEventListener('shopify:section:load', function () {
    resetBindings();
    setTimeout(init, 50);
  });
})();
