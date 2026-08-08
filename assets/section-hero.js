(function (window) {
  'use strict';

  function initHero(stageWrap) {
    var stage = stageWrap.querySelector('[data-hero-stage]');
    if (!stage || stage.dataset.bound === '1') return;
    stage.dataset.bound = '1';

    var reduceMotion = (window.Purelane && window.Purelane.reduceMotion) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var slides = [].slice.call(stage.querySelectorAll('.pl-hslide'));
    var dots = [].slice.call(stageWrap.querySelectorAll('.pl-hdots button'));
    var i = 0;
    var timer = null;

    function go(n) {
      if (!slides.length) return;
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, idx) { s.classList.toggle('pl-on', idx === i); });
      dots.forEach(function (d, idx) {
        d.classList.toggle('pl-on', idx === i);
        d.setAttribute('aria-selected', idx === i ? 'true' : 'false');
      });
    }
    function play() {
      if (timer || reduceMotion || slides.length < 2) return;
      timer = setInterval(function () { go(i + 1); }, 3800);
    }
    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    dots.forEach(function (d, idx) {
      d.addEventListener('click', function () { stop(); go(idx); play(); });
    });
    stage.addEventListener('mouseenter', stop);
    stage.addEventListener('mouseleave', play);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { e.isIntersecting ? play() : stop(); });
      }, { threshold: 0.2 }).observe(stage);
    } else {
      play();
    }

    // Subtle ambient drop-shadow breathing on the whole stage. Targets
    // .pl-hero__stage-wrap itself (the element that already carries the
    // static drop-shadow filter in CSS) rather than a data-hero-product
    // hook that nothing in the markup actually has.
    if (!reduceMotion && stageWrap.animate) {
      stageWrap.animate(
        [
          { filter: 'drop-shadow(0 34px 54px rgba(2,20,19,.6))' },
          { filter: 'drop-shadow(0 42px 68px rgba(2,20,19,.68))' },
          { filter: 'drop-shadow(0 34px 54px rgba(2,20,19,.6))' }
        ],
        { duration: 7000, iterations: Infinity, easing: 'ease-in-out' }
      );
    }
  }

  function boot(root) {
    root = root || document;
    root.querySelectorAll('.pl-hero__stage-wrap').forEach(initHero);
  }

  document.addEventListener('DOMContentLoaded', function () { boot(document); });
  document.addEventListener('shopify:section:load', function (e) { boot(e.target); });
})(window);