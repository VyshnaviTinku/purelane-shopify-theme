/**
 * Reviews rail: the marquee itself is pure CSS (animation + hover/focus
 * pause already handled in section-reviews-rail.css). The only job for
 * JS is to stop the animation when the rail is off-screen, so an
 * infinite-loop animation isn't running on the compositor for a
 * section the visitor isn't looking at — the prototype's marquee ran
 * unconditionally for the lifetime of the page.
 */
(function () {
  function setup(root) {
    var track = root.querySelector('[data-reviews-track]');
    if (!track || track.dataset.plInit) return;
    track.dataset.plInit = 'true';

    if (!('IntersectionObserver' in window)) return;

    new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          track.classList.toggle('pl-paused', !entry.isIntersecting);
        });
      },
      { threshold: 0.01 }
    ).observe(root.querySelector('[data-reviews-rail]'));
  }

  function initAll(scope) {
    (scope || document).querySelectorAll('.pl-reviews').forEach(setup);
  }

  document.addEventListener('DOMContentLoaded', function () { initAll(document); });
  document.addEventListener('shopify:section:load', function (e) { initAll(e.target); });
})();
