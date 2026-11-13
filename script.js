// The artwork and its lettering are the actual approved image.
// Only the invisible click zones and floating warm lights are layered on top.
(() => {
  const dust = document.querySelector('#magic-dust');
  if (!dust || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // Fixed pseudo-random sequence keeps the light placement stable between visits.
  let seed = 1761;
  const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  for (let i = 0; i < 29; i++) {
    const point = document.createElement('i');
    point.className = 'firefly';
    point.setAttribute('aria-hidden', 'true');
    point.style.setProperty('--x', `${2 + random() * 96}%`);
    point.style.setProperty('--y', `${5 + random() * 89}%`);
    point.style.setProperty('--size', `${1.4 + random() * 2.1}px`);
    point.style.setProperty('--drift', `${-18 + random() * 36}px`);
    point.style.setProperty('--time', `${3 + random() * 5}s`);
    point.style.setProperty('--delay', `${-random() * 7}s`);
    dust.appendChild(point);
  }
  const viewport = document.querySelector('#forest-viewport');
  if (viewport && window.matchMedia('(max-width:720px) and (orientation:portrait)').matches) {
    // Start the narrow-view experience at the artwork's romantic title.
    viewport.scrollLeft = 0;
  }
})();
