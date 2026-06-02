/**
 * ULY Shop Sidebar - opens from existing Shop All menu links.
 */
(function () {
  'use strict';

  var OPEN_CLASS = 'uly-shop-sidebar--open';
  var HEADER_OPEN_CLASS = 'uly-shop-sidebar-is-open';
  var TRIGGER_SELECTOR = '[data-uly-shop-drawer-trigger]';

  function getHeader() {
    return document.getElementById('header-component');
  }

  function getSidebar() {
    return document.getElementById('uly-shop-sidebar');
  }

  function getTriggers() {
    return Array.prototype.slice.call(document.querySelectorAll(TRIGGER_SELECTOR));
  }

  function getCloseBtn() {
    return document.getElementById('uly-shop-sidebar-close');
  }

  function getHeaderRow() {
    var header = getHeader();
    return header ? header.querySelector('.header__row--top') : null;
  }

  function getNavigationBar() {
    var header = getHeader();
    return header ? header.querySelector('.header__navigation-bar-row') : null;
  }

  function isOpen() {
    var sidebar = getSidebar();
    return !!sidebar && sidebar.classList.contains(OPEN_CLASS);
  }

  function syncSidebarPosition() {
    var header = getHeader();
    var row = getHeaderRow();
    var nav = getNavigationBar();
    if (!header) return;

    var top = 0;
    [header, row, nav].forEach(function (element) {
      if (!element) return;
      var rect = element.getBoundingClientRect();
      if (rect.height > 0) top = Math.max(top, Math.round(rect.bottom));
    });

    var computedHeaderHeight = Number.parseFloat(getComputedStyle(document.body).getPropertyValue('--header-height')) || 0;
    var computedHeaderGroupHeight = Number.parseFloat(getComputedStyle(document.body).getPropertyValue('--header-group-height')) || 0;
    top = Math.max(top, Math.round(header.offsetHeight || 0), Math.round(computedHeaderHeight), Math.round(computedHeaderGroupHeight));
    if (top < 0) top = 0;
    document.documentElement.style.setProperty('--uly-sidebar-top', top + 'px');
  }

  function syncHeaderState() {
    var header = getHeader();
    if (!header) return;
    header.classList.toggle(HEADER_OPEN_CLASS, isOpen());
  }

  function syncTriggers() {
    var open = isOpen();
    getTriggers().forEach(function (trigger) {
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      trigger.classList.toggle('is-open', open);
    });
  }

  function openSidebar() {
    var sidebar = getSidebar();
    if (!sidebar || isOpen()) return;
    sidebar.classList.add(OPEN_CLASS);
    sidebar.setAttribute('aria-hidden', 'false');
    syncHeaderState();
    syncSidebarPosition();
    syncTriggers();
    getCloseBtn()?.focus();
  }

  function closeSidebar() {
    var sidebar = getSidebar();
    if (!sidebar || !isOpen()) return;
    sidebar.classList.remove(OPEN_CLASS);
    sidebar.setAttribute('aria-hidden', 'true');
    syncHeaderState();
    syncSidebarPosition();
    syncTriggers();
  }

  function onTriggerClick(event) {
    event.preventDefault();
    event.stopPropagation();
    if (isOpen()) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }

  function onCloseClick(event) {
    event.preventDefault();
    event.stopPropagation();
    closeSidebar();
  }

  function syncAccordionToggle(details) {
    var toggle = details ? details.querySelector('.uly-shop-sidebar__chevron') : null;
    if (!toggle) return;
    toggle.setAttribute('aria-expanded', details.open ? 'true' : 'false');
  }

  function onAccordionSummaryClick(event) {
    if (!(event.target instanceof Element)) return;
    if (event.target.closest('.uly-shop-sidebar__summary-link')) return;

    event.preventDefault();
  }

  function onAccordionSummaryKeydown(event) {
    if (!(event.target instanceof Element)) return;
    if (event.target.closest('.uly-shop-sidebar__chevron')) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;

    event.preventDefault();
  }

  function toggleAccordion(event) {
    if (!(event.target instanceof Element)) return;

    var details = event.target.closest('.uly-shop-sidebar__details');
    if (!details) return;

    event.preventDefault();
    event.stopPropagation();
    details.open = !details.open;
    syncAccordionToggle(details);
  }

  function onAccordionToggleKeydown(event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    toggleAccordion(event);
  }

  function bind() {
    getTriggers().forEach(function (trigger) {
      if (trigger._ulyBound) return;
      trigger._ulyBound = true;
      trigger.addEventListener('click', onTriggerClick);
    });

    var closeBtn = getCloseBtn();
    if (closeBtn && !closeBtn._ulyBound) {
      closeBtn._ulyBound = true;
      closeBtn.addEventListener('click', onCloseClick);
    }

    var sidebar = getSidebar();
    if (!sidebar) return;

    sidebar.querySelectorAll('.uly-shop-sidebar__summary').forEach(function (summary) {
      if (summary._ulyBound) return;
      summary._ulyBound = true;
      summary.addEventListener('click', onAccordionSummaryClick);
      summary.addEventListener('keydown', onAccordionSummaryKeydown);
    });

    sidebar.querySelectorAll('.uly-shop-sidebar__chevron').forEach(function (toggle) {
      if (toggle._ulyBound) return;
      toggle._ulyBound = true;
      toggle.addEventListener('click', toggleAccordion);
      toggle.addEventListener('keydown', onAccordionToggleKeydown);
    });

    sidebar.querySelectorAll('.uly-shop-sidebar__details').forEach(function (details) {
      if (details._ulyBound) return;
      details._ulyBound = true;
      syncAccordionToggle(details);
      details.addEventListener('toggle', function () {
        syncAccordionToggle(details);
      });
    });
  }

  function watchLayout() {
    syncSidebarPosition();
  }

  function init() {
    bind();
    syncHeaderState();
    syncSidebarPosition();
    syncTriggers();

    window.addEventListener('resize', watchLayout);
    window.addEventListener('scroll', watchLayout, { passive: true });

    [getHeader(), getHeaderRow(), getNavigationBar()].forEach(function (element) {
      if (!element || typeof ResizeObserver === 'undefined') return;
      if (element._ulyRo) element._ulyRo.disconnect();
      element._ulyRo = new ResizeObserver(watchLayout);
      element._ulyRo.observe(element);
    });
  }

  function resetBindings() {
    getTriggers().forEach(function (trigger) {
      trigger._ulyBound = false;
    });

    var closeBtn = getCloseBtn();
    if (closeBtn) closeBtn._ulyBound = false;

    var sidebar = getSidebar();
    if (!sidebar) return;

    sidebar.querySelectorAll('.uly-shop-sidebar__summary, .uly-shop-sidebar__chevron, .uly-shop-sidebar__details').forEach(function (element) {
      element._ulyBound = false;
    });
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
