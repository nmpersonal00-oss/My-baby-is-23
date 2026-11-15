/* Rayan's Dark Forest — 400-level Islamic Hangman.
 * Each of eight Islamic themes has 50 real puzzles; Random mode plays all 400
 * in a stable shuffled order without repeats. Progress is saved in this browser.
 * The gold Gothic UI and background stay separate from the gameplay/data.
 */
(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const catalog = [
    {id:'random',name:'Random — All Topics'},
    {id:'quran',name:'The Quran'},
    {id:'prophets',name:'The Prophets'},
    {id:'seerah',name:'The Seerah'},
    {id:'worship',name:'Worship'},
    {id:'faith-values',name:'Faith & Values'},
    {id:'history',name:'Islamic History'},
    {id:'places',name:'Sacred Places'},
    {id:'terms',name:'Islamic Terms'}
  ];
  const source = window.HANGMAN_LEVELS || {};
  const MAX_WRONG = 5, MAX_HINTS = 3;
  const SAVE_KEY = 'rayans-dark-forest.islam-hangman.v1';
  const categoryName = $('hangman-category-name');
  const categoryLeft = $('hangman-category-prev');
  const categoryRight = $('hangman-category-next');
  const wordDisplay = $('hangman-word');
  const keyboard = $('hangman-keyboard');
  const wrongTrack = $('hangman-wrong-track');
  const hintButton = $('hangman-hint');
  const restartButton = $('hangman-restart');
  const nextButton = $('hangman-next');
  const levelLabel = $('hangman-level-label');
  const levelTopic = $('hangman-level-topic');
  const status = $('hangman-status');
  if (![categoryName, categoryLeft, categoryRight, wordDisplay, keyboard,
        wrongTrack, hintButton, restartButton, nextButton, levelLabel,
        levelTopic, status].every(Boolean)) return;

  const cleanLetter = value => String(value).normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'').toUpperCase();
  const isLetter = ch => /^\p{L}$/u.test(ch);
  const revealable = ch => isLetter(ch) && /^[A-Z]$/.test(cleanLetter(ch));

  function stableShuffle(input, seed) {
    const copy = input.slice();
    let value = seed >>> 0;
    for (let i = copy.length - 1; i > 0; i--) {
      value = (Math.imul(1664525,value) + 1013904223) >>> 0;
      const index = value % (i+1);
      [copy[i],copy[index]] = [copy[index],copy[i]];
    }
    return copy;
  }
  function validPuzzle(entry) {
    return entry && typeof entry.answer === 'string' &&
      entry.answer.trim().length > 0 &&
      [...entry.answer].some(revealable) &&
      typeof entry.topic === 'string' && entry.topic.trim();
  }
  const decks = {};
  let allPuzzles = [];
  catalog.slice(1).forEach((cat,index) => {
    const entries = Array.isArray(source[cat.id]) ? source[cat.id] : [];
    decks[cat.id] = stableShuffle(entries.filter(validPuzzle).map((entry,n) => ({
      id: cat.id + ':' + n,
      category: cat.id,
      answer: entry.answer.trim(),
      topic: entry.topic.trim()
    })), 20261260 + index);
    allPuzzles = allPuzzles.concat(decks[cat.id]);
  });
  decks.random = stableShuffle(allPuzzles, 20261300);
  const saved = {category:'random', indices:{}, solved:{}};
  try {
    const stored = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
    if (catalog.some(cat=>cat.id===stored.category)) saved.category = stored.category;
    if (stored.indices && typeof stored.indices === 'object' && !Array.isArray(stored.indices))
      Object.assign(saved.indices, stored.indices);
    if (stored.solved && typeof stored.solved === 'object' && !Array.isArray(stored.solved))
      Object.assign(saved.solved, stored.solved);
  } catch {}

  let selectedCategory = Math.max(0,catalog.findIndex(cat=>cat.id===saved.category));
  let current = null, currentIndex = 0, guesses = new Set();
  let wrong = 0, hints = 0, finished = false;

  function save() {
    try {
      saved.category = catalog[selectedCategory].id;
      localStorage.setItem(SAVE_KEY,JSON.stringify(saved));
    } catch {}
  }
  function say(message) { status.textContent = message; }
  function activeId() { return catalog[selectedCategory].id; }
  function activeDeck() { return decks[activeId()]; }
  function renderKeyboard() {
    keyboard.innerHTML = '';
    ['ABCDEFGHIJ','KLMNOPQRST','UVWXYZ'].forEach((letters,index)=>{
      const row = document.createElement('div');
      row.className = 'hangman-key-row';
      row.setAttribute('aria-label','Letters ' + (index+1));
      for (const letter of letters) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'hangman-key';
        button.textContent = letter;
        button.dataset.letter = letter;
        button.setAttribute('aria-label','Guess ' + letter);
        row.appendChild(button);
      }
      keyboard.appendChild(row);
    });
  }
  function createLetter(ch,placeholder=false) {
    const node = document.createElement('span');
    const letter = !placeholder && revealable(ch);
    node.className = 'hangman-letter' +
      (!letter && !placeholder ? ' is-punctuation' : '');
    if (letter) {
      const visible = (finished && wrong >= MAX_WRONG) || guesses.has(cleanLetter(ch));
      node.textContent = visible ? ch.toUpperCase() : '';
      node.setAttribute('aria-label',visible ? ch : 'Hidden letter');
    } else if (placeholder) {
      node.textContent = '';
      node.setAttribute('aria-label','Empty puzzle slot');
    } else {
      node.textContent = ch;
      node.setAttribute('aria-label',ch);
    }
    return node;
  }
  function renderWord() {
    wordDisplay.innerHTML = '';
    wordDisplay.classList.toggle('is-long',Boolean(current && current.answer.replace(/\s/g,'').length>14));
    wordDisplay.classList.toggle('is-very-long',Boolean(current && current.answer.replace(/\s/g,'').length>29));
    if (!current) {
      const group = document.createElement('span');
      group.className = 'hangman-word-unit';
      for (let i=0;i<8;i++) group.appendChild(createLetter('',true));
      wordDisplay.appendChild(group);
      return;
    }
    const words = current.answer.split(/\s+/);
    words.forEach((word,index)=>{
      if (index) {
        const gap = document.createElement('span');
        gap.className = 'hangman-word-gap';
        gap.setAttribute('aria-label','Word break');
        wordDisplay.appendChild(gap);
      }
      const unit = document.createElement('span');
      unit.className = 'hangman-word-unit';
      for (const ch of word) unit.appendChild(createLetter(ch));
      wordDisplay.appendChild(unit);
    });
  }
  function renderWrong() {
    wrongTrack.innerHTML = '';
    for (let index=0;index<MAX_WRONG;index++) {
      const diamond = document.createElement('span');
      diamond.className = 'hangman-diamond' + (index < wrong ? ' is-lost' : '');
      diamond.setAttribute('aria-label',index < wrong ?
        'Incorrect guess ' + (index+1) : 'Remaining chance');
      wrongTrack.appendChild(diamond);
    }
    document.querySelectorAll('[data-hang-stage]').forEach(part=>{
      const number = Number(part.getAttribute('data-hang-stage'));
      part.classList.toggle('is-visible',number<=wrong);
    });
  }
  function render() {
    categoryName.textContent = catalog[selectedCategory].name;
    const deck = activeDeck();
    levelLabel.textContent = deck.length ?
      'Level ' + (currentIndex+1) + ' of ' + deck.length : 'No levels yet';
    levelTopic.textContent = current ? 'Clue: ' + current.topic : 'Islamic knowledge';
    renderWord();
    hintButton.querySelector('.hangman-hint-count').textContent =
      '(' + Math.max(0,MAX_HINTS-hints) + ')';
    keyboard.querySelectorAll('[data-letter]').forEach(button=>{
      const letter = button.dataset.letter;
      const used = guesses.has(letter);
      const correct = Boolean(current) &&
        [...current.answer].some(ch=>revealable(ch) && cleanLetter(ch)===letter);
      button.classList.toggle('is-correct',used && correct);
      button.classList.toggle('is-wrong',used && !correct);
      button.disabled = !current || finished || used;
    });
    hintButton.disabled = !current || finished || hints >= MAX_HINTS;
    nextButton.hidden = !finished;
    if (finished) nextButton.textContent =
      currentIndex+1===deck.length ? 'Replay from Level 1' : 'Next Level';
    renderWrong();
  }
  function startRound() {
    const deck = activeDeck();
    const index = Number(saved.indices[activeId()]);
    currentIndex = Number.isInteger(index) && index>=0 && index<deck.length ? index : 0;
    current = deck[currentIndex] || null;
    guesses = new Set(); wrong = 0; hints = 0; finished = false;
    render();
    if (current) say('Guess the answer using the clue. Five mistakes allowed.');
    else say('No Islamic knowledge puzzles have been added to this topic.');
    save();
  }
  function solvedEverything() {
    return current && [...current.answer].every(ch=>
      !revealable(ch) || guesses.has(cleanLetter(ch)));
  }
  function guess(letter,fromHint=false) {
    letter = cleanLetter(letter);
    if (!current || finished || guesses.has(letter) || !/^[A-Z]$/.test(letter)) return;
    guesses.add(letter);
    const correct = [...current.answer].some(ch=>
      revealable(ch) && cleanLetter(ch)===letter);
    if (!correct && !fromHint) wrong++;
    if (solvedEverything()) {
      finished = true;
      saved.solved[current.id] = true;
      save();
      say('Excellent! Correct answer: ' + current.answer + '. Choose Next Level to continue.');
    } else if (wrong>=MAX_WRONG) {
      finished = true;
      say('The answer was: ' + current.answer + '. Choose Next Level or Restart to try again.');
    } else {
      say(correct ? 'Correct: ' + letter + ' appears in the answer.' :
        'No ' + letter + '. ' + (MAX_WRONG-wrong) + ' chances remaining.');
    }
    render();
  }
  function nextLevel() {
    if (!finished) return;
    const deck = activeDeck();
    saved.indices[activeId()] = (currentIndex+1)%deck.length;
    save();
    startRound();
  }
  function changeCategory(direction) {
    selectedCategory = (selectedCategory+direction+catalog.length)%catalog.length;
    startRound();
  }
  categoryLeft.addEventListener('click',()=>changeCategory(-1));
  categoryRight.addEventListener('click',()=>changeCategory(1));
  restartButton.addEventListener('click',startRound);
  nextButton.addEventListener('click',nextLevel);
  hintButton.addEventListener('click',()=>{
    if (!current || finished || hints>=MAX_HINTS) return;
    const unseen = [...new Set([...current.answer]
      .filter(revealable).map(cleanLetter))]
      .filter(letter=>!guesses.has(letter));
    if (!unseen.length) return;
    hints++;
    guess(unseen[Math.floor(Math.random()*unseen.length)],true);
  });
  keyboard.addEventListener('click',event=>{
    const button = event.target.closest('[data-letter]');
    if (button) guess(button.dataset.letter);
  });
  document.addEventListener('keydown',event=>{
    const target = event.target;
    if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
    const letter = String(event.key).toUpperCase();
    if (/^[A-Z]$/.test(letter)) guess(letter);
  });
  renderKeyboard();
  startRound();
})();
