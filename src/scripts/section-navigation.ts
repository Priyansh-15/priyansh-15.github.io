/**
 * Home-page section transitions.
 *
 * All long sections scroll natively. We only align the viewport after a
 * completed user scroll that has crossed a boundary between major sections.
 * Links and browser anchor/history behavior remain native.
 */
const stageElements = Array.from(document.querySelectorAll<HTMLElement>('[data-scroll-stage]'));
const siteHeader = document.querySelector<HTMLElement>('[data-site-header]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (stageElements.length > 1 && siteHeader) {
  let previousPosition = window.scrollY;
  let direction: -1 | 0 | 1 = 0;
  let adjusting = false;
  let scrollIdle: number | undefined;
  let adjustmentFallback: number | undefined;

  const alignTransition = () => {
    if (adjusting || !siteHeader || document.visibilityState !== 'visible') return;
    if (siteHeader.querySelector('[data-menu-toggle][aria-expanded="true"]')) return;

    const headerBottom = siteHeader.getBoundingClientRect().bottom;
    const viewportBottom = window.innerHeight;

    // No stage transition is possible inside an extremely short viewport.
    if (viewportBottom - headerBottom < 260) return;

    for (const next of stageElements.slice(1)) {
      const boundary = next.getBoundingClientRect().top;

      // Only consider the seam between two sections, not their interiors.
      if (boundary <= headerBottom + 3 || boundary >= viewportBottom - 3) continue;

      // A tiny accidental over-scroll is returned to the current section.
      // Once the visitor scrolls past its natural end, advance to the next.
      const down = direction >= 0;
      const destinationLine = down
        ? boundary > viewportBottom - 48
          ? viewportBottom
          : headerBottom
        : boundary < headerBottom + 48
          ? headerBottom
          : viewportBottom;
      const target = Math.max(0, window.scrollY + boundary - destinationLine);
      if (Math.abs(target - window.scrollY) < 2) return;

      adjusting = true;
      window.scrollTo({
        top: target,
        behavior: reducedMotion.matches ? 'instant' : 'smooth',
      });

      // scrollend fires for smooth scroll on modern browsers. The fallback
      // protects older Safari builds without intercepting any input events.
      window.clearTimeout(adjustmentFallback);
      adjustmentFallback = window.setTimeout(
        () => {
          adjusting = false;
          previousPosition = window.scrollY;
        },
        reducedMotion.matches ? 60 : 750,
      );
      return;
    }
  };

  const completeScroll = () => {
    window.clearTimeout(scrollIdle);
    if (adjusting) {
      adjusting = false;
      previousPosition = window.scrollY;
      return;
    }
    alignTransition();
  };

  window.addEventListener(
    'scroll',
    () => {
      if (adjusting) return;
      const current = window.scrollY;
      if (Math.abs(current - previousPosition) > 1) {
        direction = current > previousPosition ? 1 : -1;
      }
      previousPosition = current;
      // Fallback for browsers that do not support the scrollend event.
      if (!('onscrollend' in window)) {
        window.clearTimeout(scrollIdle);
        scrollIdle = window.setTimeout(completeScroll, 160);
      }
    },
    { passive: true },
  );

  if ('onscrollend' in window) {
    window.addEventListener('scrollend', completeScroll, { passive: true });
  }
}
