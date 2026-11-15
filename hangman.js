/* Hangman UI and logic.
   The owner-approved page is a REAL HTML game interface over a clean AI
   background. Puzzles are deliberately empty until the owner adds phrases. */
(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const catalog = [
    {id:'random',name:'Random'},
    {id:'hollow-knight',name:'Hollow Knight'},
    {id:'silksong',name:'Hollow Knight: Silksong'},
    {id:'colossus',name:'Shadow of the Colossus'},
    {id:'lies-of-p',name:'Lies of P'},
    {id:'terraria',name:'Terraria'},
    {id:'dark-souls',name:'Dark Souls'},
    {id:'bloodborne',name:'Bloodborne'},
    {id:'sanrio',name:'Sanrio'}
  ];
  const bank = window.HANGMAN_PHRASES || {};
  const MAX_WRONG = 5, MAX_HINTS = 3;
  const categoryName = $('hangman-category-name');
  const categoryLeft = $('hangman-category-prev');
  const categoryRight = $('hangman-category-next');
  const wordDisplay = $('hangman-word');
  const keyboard = $('hangman-keyboard');
  const wrongTrack = $('hangman-wrong-track');
  const hintButton = $('hangman-hint');
  const restartButton = $('hangman-restart');
  const status = $('hangman-status');
  if (!categoryName || !categoryLeft || !categoryRight || !wordDisplay ||
      !keyboard || !wrongTrack || !hintButton || !restartButton || !status) return;

  let selectedCategory = 0;
  let current = null, categoryChosen = false;
  let guesses = new Set(), wrong = 0, hints = 0, finished = false;
  let lastPhrase = '';

  // Words with accents match their base A-Z keyboard letter, and all
  // punctuation/spaces are displayed automatically.
  const cleanLetter = value => String(value).normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'').toUpperCase();
  const isLetter = char => /^\p{L}$/u.test(char);
  const revealable = char => isLetter(char) && /^[A-Z]$/.test(cleanLetter(char));
  function say(message) { status.textContent = message; }
  function pool() {
    const ids = catalog[selectedCategory].id === 'random'
      ? catalog.slice(1).map(x => x.id)
      : [catalog[selectedCategory].id];
    return ids.flatMap(id => {
      const phrases = Array.isArray(bank[id]) ? bank[id] : [];
      return phrases.filter(value => typeof value === 'string' &&
          [...value.trim()].some(revealable))
        .map(value => value.trim());
    });
  }

  function renderKeyboard() {
    keyboard.innerHTML = '';
    ['ABCDEFGHIJ','KLMNOPQRST','UVWXYZ'].forEach((letters, rowIndex) => {
      const row = document.createElement('div');
      row.className = 'hangman-key-row';
      row.setAttribute('aria-label','Letters ' + (rowIndex + 1));
      for (const letter of letters) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'hangman-key';
        btn.textContent = letter;
        btn.dataset.letter = letter;
        btn.setAttribute('aria-label','Guess ' + letter);
        row.appendChild(btn);
      }
      keyboard.appendChild(row);
    });
  }

  function renderWord() {
    wordDisplay.innerHTML = '';
    const letters = current ? Array.from(current) : Array(8).fill('_');
    letters.forEach(ch => {
      const node = document.createElement('span');
      const isSpace = current && /\s/.test(ch);
      const letter = current && revealable(ch);
      node.className = 'hangman-letter' + (isSpace ? ' is-space' : '') +
        (!letter && current && !isSpace ? ' is-punctuation' : '');
      if (letter) {
        const show = finished && wrong >= MAX_WRONG ||
          guesses.has(cleanLetter(ch));
        node.textContent = show ? ch.toUpperCase() : '';
        node.setAttribute('aria-label',show ? ch : 'Hidden letter');
      } else if (isSpace) {
        node.textContent = ' ';
        node.setAttribute('aria-label','Word break');
      } else if (current) {
        node.textContent = ch;
        node.setAttribute('aria-label',ch);
      } else {
        node.textContent = '';
        node.setAttribute('aria-label','Letter space coming soon');
      }
      wordDisplay.appendChild(node);
    });
  }

  function renderWrong() {
    wrongTrack.innerHTML = '';
    for (let index=0; index<MAX_WRONG; index++) {
      const diamond = document.createElement('span');
      diamond.className = 'hangman-diamond' + (index < wrong ? ' is-lost' : '');
      diamond.setAttribute('aria-label',index < wrong ?
        'Incorrect guess ' + (index+1) : 'Remaining chance');
      wrongTrack.appendChild(diamond);
    }
    document.querySelectorAll('[data-hang-stage]').forEach(part => {
      const number = Number(part.getAttribute('data-hang-stage'));
      part.classList.toggle('is-visible',number <= wrong);
    });
  }

  function renderButtons() {
    hintButton.querySelector('.hangman-hint-count').textContent =
      '(' + Math.max(0,MAX_HINTS-hints) + ')';
    keyboard.querySelectorAll('[data-letter]').forEach(button => {
      const letter = button.dataset.letter;
      const used = guesses.has(letter);
      button.classList.toggle('is-correct',used && Boolean(current) &&
        Array.from(current).some(c => cleanLetter(c) === letter));
      button.classList.toggle('is-wrong',used && Boolean(current) &&
        !Array.from(current).some(c => cleanLetter(c) === letter));
      button.disabled = Boolean(current) && (finished || used);
    });
    hintButton.disabled = Boolean(current) && (finished || hints >= MAX_HINTS);
    renderWrong();
  }

  function render() {
    categoryName.textContent = catalog[selectedCategory].name;
    renderWord();
    renderButtons();
  }

  function startRound(announce=true) {
    guesses = new Set(); wrong = 0; hints = 0; finished = false;
    const choices = pool();
    if (choices.length) {
      const alternatives = choices.length > 1
        ? choices.filter(p => p !== lastPhrase)
        : choices;
      current = alternatives[Math.floor(Math.random()*alternatives.length)];
      lastPhrase = current;
      if (announce) say('New Hangman puzzle. Guess a letter.');
    } else {
      current = null;
      if (announce || categoryChosen) say(
        'The layout is ready. We will add ' +
        (selectedCategory===0 ? 'the words and sentences' :
          catalog[selectedCategory].name + ' phrases') + ' next.');
      else say('Words and sentences will be added next.');
    }
    render();
  }

  function guessedEverything() {
    return Array.from(current).every(ch =>
      !revealable(ch) || guesses.has(cleanLetter(ch)));
  }

  function guess(letter, fromHint=false) {
    if (!current) {
      say('The keyboard is ready. We will add the words and sentences next.');
      return;
    }
    if (finished || guesses.has(letter)) return;
    guesses.add(letter);
    const correct = Array.from(current).some(ch=>cleanLetter(ch)===letter);
    if (!correct && !fromHint) wrong += 1;

    if (guessedEverything()) {
      finished = true;
      say('Beautifully done! You solved the Hangman puzzle. Select Restart to play again.');
    } else if (wrong >= MAX_WRONG) {
      finished = true;
      say('The answer was: ' + current + '. Choose Restart to try again.');
    } else {
      say(correct ? 'The letter ' + letter + ' is in the answer!' :
        'No ' + letter + '. ' + (MAX_WRONG - wrong) + ' chances left.');
    }
    render();
  }

  function changeCategory(direction) {
    selectedCategory = (selectedCategory + direction + catalog.length) % catalog.length;
    categoryChosen = true;
    startRound(true);
  }

  categoryLeft.addEventListener('click',()=>changeCategory(-1));
  categoryRight.addEventListener('click',()=>changeCategory(1));
  restartButton.addEventListener('click',()=>startRound(true));
  hintButton.addEventListener('click',()=>{
    if (!current) {
      say('Hints will be available when we add the phrases.');
      return;
    }
    if (finished || hints >= MAX_HINTS) return;
    const available = [...new Set(Array.from(current)
      .filter(revealable).map(cleanLetter))]
      .filter(letter=>!guesses.has(letter));
    if (!available.length) return;
    hints += 1;
    guess(available[Math.floor(Math.random()*available.length)],true);
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
  startRound(false);
})();
