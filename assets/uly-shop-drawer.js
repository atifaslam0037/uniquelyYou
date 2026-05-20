/**
 * ULY Shop Sidebar — positions below Shop All bar, full height to bottom.
 */
(function () {
  'use strict';

  var OPEN_CLASS = 'uly-shop-sidebar--open';

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

  function isOpen() {
    var sidebar = getSidebar();
    return !!sidebar && sidebar.classList.contains(OPEN_CLASS);
  }

  /** Pin sidebar top to bottom edge of Shop All bar */
  function syncSidebarPosition() {
    var bar = getBar();
    if (!bar) return;
    var top = Math.round(bar.getBoundingClientRect().bottom);
    if (top < 0) top = 0;
    document.documentElement.style.setProperty('--uly-sidebar-top', top + 'px');
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
    syncSidebarPosition();
    sidebar.classList.add(OPEN_CLASS);
    sidebar.setAttribute('aria-hidden', 'false');
    syncTrigger();
    getCloseBtn()?.focus();
  }

  function closeSidebar() {
    var sidebar = getSidebar();
    if (!sidebar || !isOpen()) return;
    sidebar.classList.remove(OPEN_CLASS);
    sidebar.setAttribute('aria-hidden', 'true');
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
