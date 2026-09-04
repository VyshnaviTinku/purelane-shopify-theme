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

/* ---------- scene crossfade (scroll driven, deterministic) ---------- */
(function () {
  var scenes = [].slice.call(document.querySelectorAll('.scene'));
  var zones = [].slice.call(document.querySelectorAll('[data-scene]'));
  var stage = document.getElementById('scenes');
  var current = 0;

  function setScene(n) {
    if (n === current) return;
    current = n;
    scenes.forEach(function (s, i) { s.classList.toggle('on', i + 1 === n); });
    if (stage) stage.setAttribute('data-d', String(n));
  }

  function pickScene() {
    var focus = window.scrollY + window.innerHeight * 0.5, n = 1;
    for (var i = 0; i < zones.length; i++) {
      var z = zones[i], top = 0, el = z;
      while (el) { top += el.offsetTop; el = el.offsetParent; }
      if (top <= focus) n = parseInt(z.getAttribute('data-scene'), 10) || n;
    }
    setScene(n);
  }

  window.addEventListener('scroll', pickScene, { passive: true });
  window.addEventListener('resize', pickScene);
  document.addEventListener('DOMContentLoaded', pickScene);
})();