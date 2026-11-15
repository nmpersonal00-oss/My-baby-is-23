/* The Secret Love Notes mini-game.
   Everything is self-contained; no assets, fonts, or services are fetched online. */
(() => {
  'use strict';

  // Starter text for the five private letter tabs. Replace only these paragraphs
  // later to personalize the messages; the chase game stays unchanged.
  const notes = {
    baby: {
      name: 'Baby',
      paragraphs: [
        'Baby, even in a forest full of magic, you are still my favorite thing to find.',
        'The smallest moments beside you become the memories I want to keep forever. I love being yours.'
      ]
    },
    habibi: {
      name: 'Habibi',
      paragraphs: [
        'Habibi, my heart knows your name in every language.',
        'If I had a thousand lifetimes and a thousand enchanted worlds to cross, I would still spend every one finding my way back to you.'
      ]
    },
    cutie: {
      name: 'Cutie',
      paragraphs: [
        'Dear Cutie, I was going to write something very serious and romantic...',
        'But then I thought about your face and forgot how to act normal. Please stop being so adorable. Actually, never stop.'
      ]
    },
    love: {
      name: 'Love',
      paragraphs: [
        'My love, through every dark forest and every bright morning, my heart keeps choosing you.',
        'Not just once. Not only when life is easy. Again and again, in every chapter of our story, always.'
      ]
    },
    kawaii: {
      name: 'Kawaii',
      paragraphs: [
        'Kawaii, you make ordinary days feel like a little storybook full of surprises.',
        'You are my sweetest smile, my favorite kind of happiness, and the person who makes my heart feel at home.'
      ]
    }
  };

  const area = document.getElementById('love-flight-area');
  const garden = document.getElementById('love-garden');
  const reader = document.getElementById('love-reader');
  const title = document.getElementById('love-reader-title');
  const copy = document.getElementById('love-letter-words');
  const noteNumber = document.getElementById('love-note-count');
  const status = document.getElementById('love-status');
  const backButton = document.getElementById('love-reader-back');
  const particles = document.getElementById('love-particles');
  if (!area || !garden || !reader || !title || !copy || !noteNumber || !status) return;

  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const initialPositions = [[.07,.12],[.76,.09],[.43,.37],[.13,.79],[.81,.74]];
  const velocities = [[51,29],[-40,38],[37,-27],[44,-34],[-49,-24]];
  const flying = Array.from(area.querySelectorAll('.flying-letter')).map((element, index) => ({
    element,
    slug: element.dataset.note,
    index,
    x: 0, y: 0, maxX: 0, maxY: 0,
    vx: velocities[index][0], vy: velocities[index][1],
    teased: false, boostUntil: 0, placed: false
  }));
  let readerOpen = false;
  let lastStamp = 0;
  let focusOnOpen = false;
  let lastCaught = null;
  let seed = 231123;
  const random = () => ((seed = seed * 16807 % 2147483647) - 1) / 2147483646;

  // Fireflies and rose petals are generated locally, never loaded from a service.
  if (particles && !motionPreference.matches) {
    for (let i = 0; i < 32; i++) {
      const dot = document.createElement('span');
      dot.className = 'love-firefly';
      dot.setAttribute('aria-hidden', 'true');
      dot.style.setProperty('--x', (3 + random() * 94).toFixed(1) + '%');
      dot.style.setProperty('--y', (15 + random() * 79).toFixed(1) + '%');
      dot.style.setProperty('--s', (1.3 + random() * 2.7).toFixed(1) + 'px');
      dot.style.setProperty('--drift', (-20 + random() * 40).toFixed(1) + 'px');
      dot.style.setProperty('--dur', (3.2 + random() * 4.5).toFixed(1) + 's');
      dot.style.setProperty('--delay', (-random() * 9).toFixed(1) + 's');
      particles.appendChild(dot);
    }
    for (let i = 0; i < 12; i++) {
      const petal = document.createElement('span');
      petal.className = 'love-petal';
      petal.setAttribute('aria-hidden', 'true');
      petal.style.setProperty('--x', (random() * 100).toFixed(1) + '%');
      petal.style.setProperty('--s', (5 + random() * 9).toFixed(1) + 'px');
      petal.style.setProperty('--drift', (-150 + random() * 310).toFixed(1) + 'px');
      petal.style.setProperty('--dur', (11 + random() * 15).toFixed(1) + 's');
      petal.style.setProperty('--delay', (-random() * 27).toFixed(1) + 's');
      particles.appendChild(petal);
    }
  }

  function measureFlight() {
    if (motionPreference.matches || readerOpen || area.clientWidth < 20) return;
    flying.forEach(letter => {
      const oldX = letter.maxX;
      const oldY = letter.maxY;
      letter.maxX = Math.max(0, area.clientWidth - letter.element.offsetWidth - 4);
      letter.maxY = Math.max(0, area.clientHeight - letter.element.offsetHeight - 6);
      if (!letter.placed) {
        letter.x = initialPositions[letter.index][0] * letter.maxX;
        letter.y = initialPositions[letter.index][1] * letter.maxY;
        letter.placed = true;
      } else {
        letter.x = Math.max(0, Math.min(letter.maxX, oldX ? letter.x / oldX * letter.maxX : letter.x));
        letter.y = Math.max(0, Math.min(letter.maxY, oldY ? letter.y / oldY * letter.maxY : letter.y));
      }
      letter.element.style.transform = 'translate3d(' + letter.x + 'px,' + letter.y + 'px,0)';
    });
  }

  function updateFlight(now) {
    const dt = lastStamp ? Math.min((now - lastStamp) / 1000, .035) : 0;
    lastStamp = now;
    if (!readerOpen && !motionPreference.matches && !document.hidden) {
      flying.forEach(letter => {
        const speed = now < letter.boostUntil ? 3.35 : 1;
        letter.x += letter.vx * speed * dt;
        letter.y += letter.vy * speed * dt;
        if (letter.x <= 0) { letter.x = 0; letter.vx = Math.abs(letter.vx); }
        if (letter.x >= letter.maxX) { letter.x = letter.maxX; letter.vx = -Math.abs(letter.vx); }
        if (letter.y <= 0) { letter.y = 0; letter.vy = Math.abs(letter.vy); }
        if (letter.y >= letter.maxY) { letter.y = letter.maxY; letter.vy = -Math.abs(letter.vy); }
        const bob = Math.sin(now / 670 + letter.index * 1.8) * 5;
        const tilt = Math.sin(now / 900 + letter.index * 2) * 3.5;
        letter.element.style.transform = 'translate3d(' + letter.x.toFixed(2) + 'px,' + (letter.y + bob).toFixed(2) + 'px,0) rotate(' + tilt.toFixed(2) + 'deg)';
        if (letter.teased && now >= letter.boostUntil && letter.element.classList.contains('is-teased')) {
          // It slows back down so the second catch remains fair.
          letter.element.classList.remove('is-teased');
        }
      });
    }
    window.requestAnimationFrame(updateFlight);
  }

  function catchLetter(event, letter) {
    if (!letter.teased) {
      event.preventDefault();
      letter.teased = true;
      letter.boostUntil = performance.now() + 2300;
      letter.element.classList.add('is-teased');
      letter.element.setAttribute('aria-label', notes[letter.slug].name + '. Catch once more to open the letter.');
      if (!motionPreference.matches) {
        // A quick change of direction makes the first catch a playful escape.
        letter.vx *= -1;
      }
      status.textContent = 'Oh! ' + notes[letter.slug].name + ' got shy and flew away! Catch that same letter one more time.';
      return;
    }
    focusOnOpen = true;
    lastCaught = letter.element;
    // Let the real anchor navigate to its individual, shareable #note tab.
  }

  flying.forEach(letter => {
    letter.element.addEventListener('click', event => catchLetter(event, letter));
  });

  function renderNote(slug) {
    const note = notes[slug];
    const order = Object.keys(notes).indexOf(slug) + 1;
    const words = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'];
    title.textContent = note.name;
    noteNumber.textContent = 'LETTER ' + words[order - 1] + ' OF FIVE';
    copy.replaceChildren();
    note.paragraphs.forEach(line => {
      const p = document.createElement('p');
      p.textContent = line;
      copy.appendChild(p);
    });
    reader.querySelectorAll('[data-note-tab]').forEach(link => {
      const current = link.dataset.noteTab === slug;
      link.classList.toggle('is-current', current);
      if (current) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  function syncRoute() {
    const slug = decodeURIComponent(window.location.hash.slice(1)).toLowerCase();
    const valid = Object.prototype.hasOwnProperty.call(notes, slug);
    readerOpen = valid;
    garden.hidden = valid;
    reader.hidden = !valid;
    document.body.classList.toggle('reading-note', valid);
    if (valid) {
      renderNote(slug);
      reader.scrollTop = 0;
      if (focusOnOpen) title.focus({preventScroll:true});
    } else {
      lastStamp = 0;
      window.requestAnimationFrame(measureFlight);
      if (lastCaught) lastCaught.focus({preventScroll:true});
    }
    focusOnOpen = false;
  }

  function closeReader() {
    if (window.location.hash) {
      window.location.hash = '';
      // Hash navigation normally fires hashchange; sync also handles browsers
      // that normalize the cleared fragment without emitting that event.
      syncRoute();
    }
  }

  backButton.addEventListener('click', closeReader);
  window.addEventListener('hashchange', syncRoute);
  window.addEventListener('resize', measureFlight, {passive:true});
  document.addEventListener('visibilitychange', () => { lastStamp = 0; });
  document.addEventListener('keydown', event => {
    if (!readerOpen) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeReader();
    }
    if (event.key !== 'Tab') return;
    const controls = [...reader.querySelectorAll('button:not([disabled]),a[href]')];
    if (!controls.length) return;
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    } else if (!reader.contains(document.activeElement)) {
      event.preventDefault(); first.focus();
    }
  });

  if (motionPreference.addEventListener) {
    motionPreference.addEventListener('change', () => {
      area.classList.toggle('is-flying', !motionPreference.matches);
      if (motionPreference.matches) {
        flying.forEach(letter => { letter.element.style.transform = ''; });
      } else {
        flying.forEach(letter => { letter.placed = false; });
        measureFlight();
      }
    });
  }
  area.classList.toggle('is-flying', !motionPreference.matches);
  syncRoute();
  measureFlight();
  if (!motionPreference.matches) window.requestAnimationFrame(updateFlight);
})();
