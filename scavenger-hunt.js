(() => {
  'use strict';
  const data = window.SCAVENGER_OBJECTS;
  if (!Array.isArray(data) || data.length !== 40 || new Set(data.map(item => item.id)).size !== 40) {
    throw new Error('Scavenger Hunt requires exactly 40 uniquely identified objects.');
  }
  const root = '../assets/scavenger-hunt/';
  const assetUrl = name => (window.SCAVENGER_ASSET_URLS && window.SCAVENGER_ASSET_URLS[name]) || root + name;
  const STORAGE_KEY = 'rayans-dark-forest-scavenger-hunt-v1';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scene = document.getElementById('hunt-scene');
  const targets = document.getElementById('hunt-targets');
  const props = document.getElementById('hunt-props');
  const items = document.getElementById('hunt-items');
  const itemPreview = document.getElementById('hunt-item-preview');
  const previewName = document.getElementById('hunt-preview-name');
  const previewArt = document.getElementById('hunt-preview-art');
  const previewGuide = document.getElementById('hunt-preview-guide');
  const previewClose = document.getElementById('hunt-preview-close');
  let previousPreviewFocus = null;
  const dust = document.getElementById('hunt-dust');
  const progress = document.getElementById('hunt-progress');
  const mobileProgress = document.getElementById('hunt-mobile-count');
  const toast = document.getElementById('hunt-toast');
  const resetButton = document.getElementById('hunt-reset');
  const shuffleButton = document.getElementById('hunt-shuffle');
  const mobileTip = document.getElementById('hunt-mobile-tip');
  const finale = document.getElementById('hunt-finale');
  const sparkles = document.getElementById('hunt-finale-sparkles');
  const envelope = document.getElementById('hunt-envelope');
  const envelopeImg = document.getElementById('hunt-envelope-picture');
  const message = document.getElementById('hunt-chase-message');
  const opened = document.getElementById('hunt-opened');
  const openedImg = document.getElementById('hunt-reveal-picture');
  const secret = document.getElementById('hunt-secret');
  const caption = document.getElementById('hunt-code-caption');
  const heading = opened.querySelector('h2');
  const chaseAgain = document.getElementById('hunt-chase-again');
  const elementsById = new Map();
  const timers = new Set();
  let found = new Set();
  const originalOrder = data.map(item => item.id);
  let inventoryOrder = originalOrder.slice();
  let stage = 'locked', catches = 0, x = 0, y = 0, vx = 275, vy = 205;
  let lastTick = 0, lastTrail = 0, toastTimer = 0, messageTimer = 0;
  let keyboardControl = false;

  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (Array.isArray(stored.order) && stored.order.length === 40 &&
        new Set(stored.order).size === 40 && stored.order.every(id => originalOrder.includes(id))) {
      inventoryOrder = stored.order.slice();
    }
    if (Array.isArray(stored.found)) {
      const valid = new Set(data.map(item => item.id));
      found = new Set(stored.found.filter(id => valid.has(id)));
    }
  } catch (_) { /* Private browsing or storage denial must not block gameplay. */ }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({found: [...found], order: inventoryOrder})); }
    catch (_) { /* In-memory play still works when storage is blocked. */ }
  }
  function later(fn, ms) {
    const timer = window.setTimeout(() => { timers.delete(timer); fn(); }, ms);
    timers.add(timer);
  }
  function clearTimers() { for (const timer of timers) clearTimeout(timer); timers.clear(); }
  function announce(text) {
    clearTimeout(toastTimer);
    toast.textContent = text;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1300);
  }
  function updateProgress() {
    const count = found.size;
    progress.textContent = `${count} / 40`;
    mobileProgress.textContent = `${count} / 40`;
  }
  function markUI(id) {
    const pair = elementsById.get(id);
    if (!pair) return;
    pair.inventory.classList.add('is-found');
    pair.inventory.setAttribute('aria-label', `${pair.item.name}, found`);
    pair.target.disabled = true;
    pair.target.setAttribute('aria-label', `${pair.item.name}, found`);
  }
  function showItemPreview(item, i) {
    if (found.has(item.id)) return;
    previousPreviewFocus = document.activeElement;
    previewName.textContent = item.name;
    previewArt.style.setProperty('--icon-x', `${(i % 10) / 9 * 100}%`);
    previewArt.style.setProperty('--icon-y', `${Math.floor(i / 10) / 3 * 100}%`);
    previewGuide.textContent = `Find ${item.name.toLowerCase()} somewhere in the enchanted room.`;
    itemPreview.hidden = false;
    previewClose.focus();
  }
  function hideItemPreview() {
    if (itemPreview.hidden) return;
    itemPreview.hidden = true;
    if (previousPreviewFocus && previousPreviewFocus.isConnected) previousPreviewFocus.focus();
    previousPreviewFocus = null;
  }
  previewClose.addEventListener('click', hideItemPreview);
  itemPreview.addEventListener('click', event => { if (event.target === itemPreview) hideItemPreview(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') hideItemPreview();
    if (!itemPreview.hidden && event.key === 'Tab') {
      event.preventDefault(); previewClose.focus();
    }
  });
  function makeRing(item) {
    if (reduced.matches) return;
    const ring = document.createElement('span');
    ring.className = 'hunt-found-ring';
    ring.style.setProperty('--x', `${item.x}%`);
    ring.style.setProperty('--y', `${item.y}%`);
    ring.style.setProperty('--w', `${Math.min(item.w * 1.05, 12)}%`);
    ring.style.setProperty('--h', `${Math.min(item.h * 1.1, 23)}%`);
    scene.appendChild(ring);
    ring.addEventListener('animationend', () => ring.remove(), {once: true});
    setTimeout(() => ring.remove(), 1200);
  }
  function findItem(item) {
    if (found.has(item.id)) return;
    found.add(item.id);
    markUI(item.id);
    save(); updateProgress(); makeRing(item);
    if (found.size === 40) {
      announce('40 of 40! The secret envelope has escaped!');
      later(startChase, 1400);
    } else {
      announce(`${item.name} found! ${found.size} of 40`);
    }
  }
  function applyInventoryOrder() {
    // Stable IDs tie every card to its find target. Moving cards never changes artwork mapping.
    for (const id of inventoryOrder) {
      const pair = elementsById.get(id);
      if (pair) items.appendChild(pair.inventory);
    }
  }
  function shuffleInventory() {
    hideItemPreview();
    const before = inventoryOrder.join('|');
    for (let i = inventoryOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [inventoryOrder[i], inventoryOrder[j]] = [inventoryOrder[j], inventoryOrder[i]];
    }
    if (inventoryOrder.join('|') === before) {
      [inventoryOrder[0], inventoryOrder[1]] = [inventoryOrder[1], inventoryOrder[0]];
    }
    applyInventoryOrder();
    save();
    announce('Clues shuffled! Hidden objects remain in the same places.');
  }
  shuffleButton.addEventListener('click', shuffleInventory);
  function buildGame() {
    for (const [i, item] of data.entries()) {
      const target = document.createElement('button');
      target.type = 'button';
      target.className = 'hunt-target';
      target.dataset.item = item.id;
      target.style.left = `${item.x}%`;
      target.style.top = `${item.y}%`;
      target.style.width = `${item.w}%`;
      target.style.height = `${item.h}%`;
      target.style.zIndex = String(Math.round(11000 - item.w * item.h * 10));
      target.setAttribute('aria-label', `Find ${item.name}`);
      target.addEventListener('click', () => findItem(item));
      targets.appendChild(target);
      const inventory = document.createElement('div');
      inventory.className = 'hunt-item';
      inventory.tabIndex = 0;
      inventory.dataset.name = item.name;
      inventory.dataset.item = item.id;
      inventory.title = item.name;
      inventory.setAttribute('role', 'button');
      inventory.setAttribute('aria-label', `${item.name}, not found`);
      const icon = document.createElement('span');
      icon.className = 'hunt-item-icon';
      icon.style.setProperty('--icon-x', `${(i % 10) / 9 * 100}%`);
      icon.style.setProperty('--icon-y', `${Math.floor(i / 10) / 3 * 100}%`);
      icon.setAttribute('aria-hidden', 'true');
      inventory.appendChild(icon);
      const number = document.createElement('span');
      number.className = 'hunt-item-number';
      number.textContent = String(i + 1);
      number.setAttribute('aria-hidden', 'true');
      inventory.appendChild(number);
      inventory.addEventListener('click', () => showItemPreview(item, i));
      inventory.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault(); showItemPreview(item, i);
        }
      });
      items.appendChild(inventory);
      elementsById.set(item.id, {target, inventory, item});
      if (item.prop) {
        const img = document.createElement('img');
        img.className = 'hunt-prop';
        img.src = assetUrl(`prop-${item.prop}.webp`);
        img.alt = '';
        img.draggable = false;
        img.style.left = `${item.x - item.w * .45}%`;
        img.style.top = `${item.y - item.h * .46}%`;
        img.style.width = `${item.w * .9}%`;
        img.style.height = `${item.h * .9}%`;
        props.appendChild(img);
      }
      if (found.has(item.id)) markUI(item.id);
    }
    applyInventoryOrder();
    updateProgress();
    if (!reduced.matches) {
      let seed = 423561;
      const rand = () => ((seed = seed * 16807 % 2147483647) - 1) / 2147483646;
      for (let i = 0; i < 37; i++) {
        const star = document.createElement('i');
        star.className = 'hunt-spark';
        star.style.setProperty('--x', `${(2 + rand() * 96).toFixed(2)}%`);
        star.style.setProperty('--y', `${(2 + rand() * 95).toFixed(2)}%`);
        star.style.setProperty('--s', `${(1 + rand() * 2.5).toFixed(1)}px`);
        star.style.setProperty('--dx', `${((rand() - .5) * 20).toFixed(1)}px`);
        star.style.setProperty('--dur', `${(2.6 + rand() * 5).toFixed(2)}s`);
        star.style.setProperty('--delay', `${(-rand() * 9).toFixed(2)}s`);
        dust.appendChild(star);
      }
    }
    if (found.size === 40) later(startChase, 800);
  }
  function bounds() {
    return {
      maxX: Math.max(8, window.innerWidth - envelope.offsetWidth - 9),
      maxY: Math.max(8, window.innerHeight - envelope.offsetHeight - 9)
    };
  }
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  function place(nx, ny) {
    const b = bounds();
    x = clamp(nx, 8, b.maxX);
    y = clamp(ny, 8, b.maxY);
    envelope.style.transform = `translate3d(${x}px,${y}px,0)`;
  }
  function hideMessage() { message.classList.remove('show'); }
  function showMessage(text) {
    clearTimeout(messageTimer);
    message.textContent = text;
    const width = Math.min(350, window.innerWidth * .85);
    message.style.left = `${clamp(x + envelope.offsetWidth/2 - width/2, 8, Math.max(8,window.innerWidth - width - 8))}px`;
    message.style.top = `${clamp(y - 68, 82, window.innerHeight - 98)}px`;
    message.classList.add('show');
    messageTimer = setTimeout(hideMessage, 2000);
  }
  function startChase() {
    if (found.size !== 40) return;
    clearTimers();
    stage = 'chasing'; catches = 0;
    opened.hidden = true;
    opened.classList.remove('is-visible');
    [secret, caption, heading, chaseAgain].forEach(el => el.classList.remove('is-visible'));
    finale.classList.add('active');
    finale.setAttribute('aria-hidden', 'false');
    envelope.hidden = false;
    envelope.classList.remove('is-faking');
    envelopeImg.src = assetUrl('envelope-closed.webp');
    const b = bounds(); place(b.maxX * .45, b.maxY * .30);
    vx = 275; vy = 205; lastTick = 0;
    if (mobileTip) mobileTip.textContent = 'Catch the glowing envelope four times!';
    envelope.setAttribute('aria-label', 'Catch the enchanted flying envelope, catch 1 of 4');
  }
  function speedUp(targetSpeed) {
    const angle = (Math.random() * Math.PI * 2);
    vx = Math.cos(angle) * targetSpeed;
    vy = Math.sin(angle) * targetSpeed * .79;
    if (Math.abs(vx) < targetSpeed * .4) vx = (vx < 0 ? -1 : 1) * targetSpeed * .4;
    if (Math.abs(vy) < targetSpeed * .29) vy = (vy < 0 ? -1 : 1) * targetSpeed * .29;
    envelopeImg.src = assetUrl('envelope-flight.webp');
    const b = bounds();
    x = clamp(x + (vx > 0 ? 18 : -18), 8, b.maxX);
    y = clamp(y + (vy > 0 ? 10 : -10), 8, b.maxY);
  }
  function catchEnvelope() {
    if (stage !== 'chasing') return;
    catches += 1;
    if (catches === 1) {
      showMessage('Ha ha, try and get me!');
      speedUp(445);
    } else if (catches === 2) {
      showMessage('Nope, you can’t get me!');
      speedUp(625);
    } else if (catches === 3) {
      stage = 'fake';
      envelope.classList.add('is-faking');
      envelopeImg.src = assetUrl('envelope-ajar.webp');
      later(() => showMessage('Sike, you thought!'), 550);
      later(() => {
        envelope.classList.remove('is-faking');
        speedUp(820);
        stage = 'chasing';
        envelope.setAttribute('aria-label', 'Catch the enchanted envelope one final time');
      }, 1600);
    } else if (catches === 4) {
      stage = 'revealing';
      hideMessage();
      envelope.hidden = true;
      showFinale();
    }
    if (stage === 'chasing') envelope.setAttribute('aria-label', `Catch the enchanted envelope, catch ${catches+1} of 4`);
  }
  function showFinale() {
    opened.hidden = false;
    openedImg.src = assetUrl('envelope-closed.webp');
    [secret, caption, heading, chaseAgain].forEach(el => el.classList.remove('is-visible'));
    requestAnimationFrame(() => opened.classList.add('is-visible'));
    later(() => { openedImg.src = assetUrl('envelope-ajar.webp'); }, 760);
    later(() => { openedImg.src = assetUrl('envelope-open.webp'); }, 1620);
    later(() => { secret.classList.add('is-visible'); caption.classList.add('is-visible'); heading.classList.add('is-visible'); }, 2250);
    later(() => { chaseAgain.classList.add('is-visible'); }, 3100);
  }
  function emitTrail(px,py) {
    const dot=document.createElement('i');
    dot.className='hunt-trail';
    dot.style.setProperty('--x', `${px}px`);
    dot.style.setProperty('--y', `${py}px`);
    dot.style.setProperty('--s', `${2+Math.random()*4}px`);
    dot.style.setProperty('--dx', `${(Math.random()-.5)*52}px`);
    dot.style.setProperty('--dy', `${(Math.random()-.5)*47}px`);
    sparkles.appendChild(dot);
    setTimeout(() => dot.remove(), 920);
  }
  function animationFrame(time) {
    const dt = lastTick ? Math.min(.04,(time - lastTick)/1000) : 0;
    lastTick = time;
    // Keep the interactive flying-envelope chase active regardless of the OS
    // decorative-motion preference; the ambient animations remain reduced.
    if (stage==='chasing' && !document.hidden && !(keyboardControl && document.activeElement === envelope)) {
      const b = bounds();
      const factor = clamp(window.innerWidth/1100,.60,1.15);
      x += vx * factor * dt; y += vy * factor * dt;
      if (x < 8) { x = 8; vx=Math.abs(vx); }
      if (x > b.maxX) { x=b.maxX; vx=-Math.abs(vx); }
      if (y < 8) { y = 8; vy=Math.abs(vy); }
      if (y > b.maxY) { y=b.maxY; vy=-Math.abs(vy); }
      const angle = Math.sin(time/480)*6;
      const bob = Math.sin(time/310)*4;
      envelope.style.transform = `translate3d(${x.toFixed(1)}px,${(y+bob).toFixed(1)}px,0) rotate(${angle.toFixed(1)}deg)`;
      if (time - lastTrail > 110) {
        emitTrail(x + envelope.offsetWidth*.5, y + envelope.offsetHeight*.52);
        lastTrail = time;
      }
    }
    requestAnimationFrame(animationFrame);
  }
  resetButton.addEventListener('click', () => {
    if (!window.confirm('Start the scavenger hunt over? This resets the 40 found objects in this browser.')) return;
    clearTimers(); clearTimeout(messageTimer);
    hideItemPreview();
    found = new Set(); inventoryOrder = originalOrder.slice(); applyInventoryOrder(); save();
    for (const pair of elementsById.values()) {
      pair.target.disabled = false;
      pair.target.setAttribute('aria-label', `Find ${pair.item.name}`);
      pair.inventory.classList.remove('is-found');
      pair.inventory.setAttribute('aria-label', `${pair.item.name}, not found`);
    }
    stage = 'locked'; catches=0;
    finale.classList.remove('active'); finale.setAttribute('aria-hidden','true');
    envelope.hidden = true; opened.hidden = true; hideMessage();
    updateProgress();
    mobileTip.textContent='Swipe sideways to explore the room and the treasures below.';
    announce('The hunt has been restarted.');
  });
  envelope.addEventListener('click', catchEnvelope);
  chaseAgain.addEventListener('click', startChase);
  document.addEventListener('keydown', () => {keyboardControl=true;});
  document.addEventListener('pointerdown', () => {keyboardControl=false;}, {passive:true});
  document.addEventListener('visibilitychange', () => {lastTick=0;});
  window.addEventListener('resize', () => place(x,y), {passive:true});
  buildGame();
  requestAnimationFrame(animationFrame);
})();
