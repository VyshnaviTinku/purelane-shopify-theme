/**
 * PURELANE — shared reveal-on-scroll controller.
 * Loaded once globally (theme.liquid) with `defer`.
 *
 * Production fixes vs. the prototype's inline scroll handler:
 *  - Scoped to `.pl-rv` elements only that haven't already fired, so
 *    calling init() again (e.g. after the theme editor injects a new
 *    section) never double-observes.
 *  - Listens for Shopify's `shopify:section:load` so a merchant adding,
 *    duplicating, or reordering a section in the theme editor always
 *    gets working reveal animations on the new markup, not just on
 *    first page load.
 *  - Respects prefers-reduced-motion by skipping the observer entirely
 *    and just marking everything visible immediately.
 */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var io = null;

  function reveal(el) {
    el.classList.add('pl-in');
  }

  function observe(el) {
    if (el.dataset.plObserved) return;
    el.dataset.plObserved = 'true';
    if (reduce || !('IntersectionObserver' in window)) {
      reveal(el);
      return;
    }
    io.observe(el);
  }

  function init(root) {
    root = root || document;
    if (!reduce && 'IntersectionObserver' in window && !io) {
      io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              reveal(entry.target);
              io.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '0px 0px -12% 0px', threshold: 0.12 }
      );
    }
    root.querySelectorAll('.pl-rv').forEach(observe);
  }

  document.documentElement.classList.remove('no-js');
  document.addEventListener('DOMContentLoaded', function () { init(document); });

  // Theme editor: re-scan whenever a section is (re)loaded so newly
  // added/duplicated sections animate correctly without a full reload.
  document.addEventListener('shopify:section:load', function (e) {
    init(e.target);
  });
})();
