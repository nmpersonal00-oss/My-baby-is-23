(() => {
  'use strict';

  // Four independent questions: no answer or note is revealed on page load.
  const correctAnswers = Object.freeze({
    animal: 'Duck',
    color: 'Pink',
    drink: 'Dunkin',
    game: 'Doom'
  });
  const stage = document.getElementById('baby-stage');
  const letter = document.getElementById('baby-letter');
  const words = document.getElementById('baby-letter-words');
  const feedback = document.getElementById('baby-feedback');
  const lightField = document.getElementById('baby-magical-lights');
  const celebrations = document.getElementById('baby-celebration');
  if (!stage || !letter || !words || !feedback) return;

  const completed = new Set();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const questions = Array.from(stage.querySelectorAll('[data-question]'));
  let seed = 43712;
  const random = () => ((seed = seed * 16807) % 2147483647) / 2147483647;

  function sparkleAt(element, all = false) {
    if (!celebrations || reducedMotion.matches) return;
    const root = stage.getBoundingClientRect();
    const rect = element.getBoundingClientRect();
    const centerX = ((rect.left + rect.width / 2 - root.left) / root.width * 100);
    const centerY = ((rect.top + rect.height / 2 - root.top) / root.height * 100);
    const count = all ? 56 : 14;
    for (let i = 0; i < count; i++) {
      const star = document.createElement('span');
      star.className = 'baby-celebrate-star';
      star.style.setProperty('--start-x', centerX + '%');
      star.style.setProperty('--start-y', centerY + '%');
      star.style.setProperty('--size', (3 + random() * 4) + 'px');
      const angle = random() * Math.PI * 2;
      const distance = (all ? 50 : 20) + random() * (all ? 200 : 55);
      star.style.setProperty('--dx', Math.cos(angle) * distance + 'px');
      star.style.setProperty('--dy', Math.sin(angle) * distance + 'px');
      star.addEventListener('animationend', () => star.remove(), {once:true});
      celebrations.appendChild(star);
    }
  }

  function revealLetter() {
    if (!words.hidden) return;
    words.hidden = false;
    letter.classList.add('is-revealed');
    letter.setAttribute('aria-label', 'Your secret love letter is now revealed');
    feedback.textContent = 'You got all four right! Your secret letter has appeared.';
    sparkleAt(letter, true);
    // On a narrow screen the note is below the quiz, so bring it into view.
    if (window.matchMedia('(max-width:620px)').matches) {
      window.requestAnimationFrame(() => letter.scrollIntoView({behavior:reducedMotion.matches ? 'instant' : 'smooth',block:'center'}));
    }
  }

  questions.forEach(question => {
    const key = question.dataset.question;
    const answer = correctAnswers[key];
    if (!answer) return;
    const buttons = question.querySelectorAll('[data-answer]');
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        if (completed.has(key)) return;
        const selected = button.dataset.answer;
        if (selected !== answer) {
          button.classList.remove('is-wrong');
          void button.offsetWidth; // restart the friendly wiggle if guessed again
          button.classList.add('is-wrong');
          feedback.textContent = 'Not quite. Try another answer!';
          return;
        }
        completed.add(key);
        question.classList.add('is-complete');
        button.classList.remove('is-wrong');
        button.classList.add('is-correct');
        button.setAttribute('aria-pressed', 'true');
        buttons.forEach(option => { option.disabled = true; });
        sparkleAt(question);
        if (completed.size === questions.length) {
          revealLetter();
        } else {
          feedback.textContent = 'Correct! ' + completed.size + ' of four answers found.';
        }
      });
      button.addEventListener('animationend', () => button.classList.remove('is-wrong'));
    });
  });

  if (lightField && !reducedMotion.matches) {
    for (let i = 0; i < 31; i++) {
      const light = document.createElement('i');
      light.className = 'baby-wisp';
      light.setAttribute('aria-hidden', 'true');
      light.style.setProperty('--x', (2 + random() * 96) + '%');
      light.style.setProperty('--y', (6 + random() * 90) + '%');
      light.style.setProperty('--size', (1.2 + random() * 2.7) + 'px');
      light.style.setProperty('--drift', (-28 + random() * 56) + 'px');
      light.style.setProperty('--duration', (2.7 + random() * 5) + 's');
      light.style.setProperty('--delay', (-random() * 8) + 's');
      lightField.appendChild(light);
    }
  }
})();
