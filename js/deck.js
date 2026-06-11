(function () {
  const stage = document.querySelector('.stage');
  const slides = Array.from(document.querySelectorAll('.slide'));
  const counterCur = document.querySelector('.hud__counter b');
  const counterTot = document.querySelector('.hud__counter .tot');
  const bar = document.querySelector('.progress__bar');
  const dotsWrap = document.querySelector('.dots');

  let index = 0;
  let lock = false;
  if (location.search.indexOf('still') >= 0) document.body.classList.add('still');

  function fit() {
    const sw = window.innerWidth / 1920;
    const sh = window.innerHeight / 1080;
    stage.style.setProperty('--scale', Math.min(sw, sh).toString());
  }

  function buildDots() {
    slides.forEach((s, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Слайд ' + (i + 1));
      b.addEventListener('click', () => goto(i));
      dotsWrap.appendChild(b);
    });
  }

  function render() {
    slides.forEach((s, i) => {
      s.classList.toggle('is-active', i === index);
      s.classList.toggle('is-past', i < index);
    });
    Array.from(dotsWrap.children).forEach((d, i) => d.classList.toggle('is-on', i === index));
    if (counterCur) counterCur.textContent = String(index + 1).padStart(2, '0');
    if (counterTot) counterTot.textContent = String(slides.length).padStart(2, '0');
    if (bar) bar.style.width = ((index) / (slides.length - 1) * 100) + '%';
    const id = slides[index].id || ('slide-' + (index + 1));
    if (history.replaceState) history.replaceState(null, '', '#' + (index + 1));
    document.dispatchEvent(new CustomEvent('deck:change', { detail: { index, id, total: slides.length } }));
  }

  function goto(n) {
    n = Math.max(0, Math.min(slides.length - 1, n));
    if (n === index) return;
    index = n;
    lock = true;
    setTimeout(() => (lock = false), 520);
    render();
  }
  function next() { goto(index + 1); }
  function prev() { goto(index - 1); }

  window.addEventListener('resize', fit, { passive: true });

  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': case 'PageDown': case ' ':
        e.preventDefault(); next(); break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp': case 'Backspace':
        e.preventDefault(); prev(); break;
      case 'Home': e.preventDefault(); goto(0); break;
      case 'End': e.preventDefault(); goto(slides.length - 1); break;
      case 'f': case 'F':
        if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
        else document.exitFullscreen?.();
        break;
    }
  });

  let wheelAcc = 0, wheelTs = 0;
  window.addEventListener('wheel', (e) => {
    const now = Date.now();
    if (now - wheelTs > 220) wheelAcc = 0;
    wheelTs = now;
    wheelAcc += e.deltaY;
    if (lock) return;
    if (wheelAcc > 90) { wheelAcc = 0; next(); }
    else if (wheelAcc < -90) { wheelAcc = 0; prev(); }
  }, { passive: true });

  let tx = 0, ty = 0;
  window.addEventListener('touchstart', (e) => { tx = e.changedTouches[0].clientX; ty = e.changedTouches[0].clientY; }, { passive: true });
  window.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - tx;
    const dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) { dx < 0 ? next() : prev(); }
    else if (Math.abs(dy) > 55) { dy < 0 ? next() : prev(); }
  }, { passive: true });

  document.addEventListener('click', (e) => {
    if (e.target.closest('a,button,.dots,.no-advance,[data-interactive]')) return;
    const x = e.clientX / window.innerWidth;
    if (x < 0.18) prev(); else next();
  });

  document.querySelector('.js-next')?.addEventListener('click', next);
  document.querySelector('.js-prev')?.addEventListener('click', prev);

  fit();
  buildDots();
  const fromHash = parseInt((location.hash || '').replace('#', ''), 10);
  if (!isNaN(fromHash) && fromHash >= 1 && fromHash <= slides.length) index = fromHash - 1;
  render();

  window.deck = { goto, next, prev, get index() { return index; } };
})();
