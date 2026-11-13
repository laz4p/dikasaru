(() => {
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const nav = document.querySelector('[data-nav]');
  const menuButton = document.querySelector('.nav__toggle');
  const mobileMenu = document.querySelector('#mobile-menu');
  const toast = document.querySelector('[data-demo-toast]');
  const toastClose = document.querySelector('[data-toast-close]');
  const motionToggle = document.querySelector('[data-motion-toggle]');
  let scheduled = false;

  requestAnimationFrame(() => document.body.classList.add('is-ready'));

  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    mobileMenu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
  });

  motionToggle?.addEventListener('click', () => {
    const paused = !document.body.classList.contains('animations-paused');
    document.body.classList.toggle('animations-paused', paused);
    motionToggle.setAttribute('aria-pressed', String(paused));
    motionToggle.setAttribute('aria-label', paused ? 'Возобновить декоративные анимации' : 'Приостановить декоративные анимации');
  });

  const visualObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in-view');
      observer.unobserve(entry.target);
    });
  }, { threshold: .28 });
  document.querySelectorAll('.benefit__visual, .manifesto__flow').forEach((visual) => visualObserver.observe(visual));

  document.addEventListener('visibilitychange', () => {
    document.body.classList.toggle('page-hidden', document.hidden);
  });

  mobileMenu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Открыть меню');
      mobileMenu.hidden = true;
      document.body.classList.remove('menu-open');
    });
  });

  const highlighted = document.querySelector('[data-word-highlight]');
  let highlightWords = [];
  if (highlighted) {
    highlightWords = highlighted.textContent.trim().split(/\s+/).map((word, index, words) => {
      const span = document.createElement('span');
      span.textContent = word + (index === words.length - 1 ? '' : ' ');
      highlighted.appendChild(span);
      return span;
    });
    highlighted.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) node.remove();
    });
  }

  function sectionProgress(section) {
    const rect = section.getBoundingClientRect();
    const distance = Math.max(1, section.offsetHeight - window.innerHeight);
    return clamp(-rect.top / distance);
  }

  function updateManifesto() {
    const section = document.querySelector('[data-progress-section]');
    if (!section || !highlightWords.length) return;
    const progress = reducedMotion.matches ? 1 : sectionProgress(section);
    const litCount = Math.round(progress * (highlightWords.length + 4));
    highlightWords.forEach((word, index) => {
      word.classList.toggle('is-lit', index < litCount);
      word.classList.toggle('is-accent', index === highlightWords.length - 1 && index < litCount);
    });
  }

  function updateStories() {
    document.querySelectorAll('[data-story]').forEach((section) => {
      const progress = reducedMotion.matches ? 1 : sectionProgress(section);
      const intro = clamp(progress / .17);
      const blob = clamp((progress - .06) / .2);
      const stageOpacity = clamp((progress - .19) / .11);
      const phone = clamp((progress - .23) / .14);

      section.style.setProperty('--progress', progress.toFixed(4));
      section.style.setProperty('--intro', intro.toFixed(4));
      section.style.setProperty('--blob', blob.toFixed(4));
      section.style.setProperty('--stage-opacity', stageOpacity.toFixed(4));
      section.style.setProperty('--phone', phone.toFixed(4));

      let step = 0;
      if (progress > .57) step = 2;
      else if (progress > .4) step = 1;
      section.querySelectorAll('[data-step]').forEach((note, index) => {
        note.classList.toggle('is-active', reducedMotion.matches || index === step);
      });
    });
  }

  function updateTechnology() {
    const section = document.querySelector('[data-tech-section]');
    const rail = document.querySelector('[data-tech-rail]');
    if (!section || !rail) return;
    const progress = reducedMotion.matches ? 0 : sectionProgress(section);
    const parentWidth = rail.parentElement.clientWidth;
    const maxMove = Math.max(0, rail.scrollWidth - parentWidth);
    rail.style.setProperty('--rail-x', `${(-maxMove * progress).toFixed(1)}px`);
  }

  function updatePage() {
    scheduled = false;
    nav?.classList.toggle('is-scrolled', window.scrollY > 16);
    const darkSurface = [...document.querySelectorAll('.technology, .closing')].some((section) => {
      const rect = section.getBoundingClientRect();
      return rect.top <= 38 && rect.bottom > 38;
    });
    nav?.classList.toggle('on-dark', darkSurface);
    updateManifesto();
    updateStories();
    updateTechnology();
  }

  function scheduleUpdate() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(updatePage);
  }

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  reducedMotion.addEventListener?.('change', scheduleUpdate);
  updatePage();

  function showDemoNotice(form) {
    const status = form.querySelector('.form-status');
    if (status) status.textContent = 'Это демо: заявка не отправлена и почта не сохранена.';
    toast?.setAttribute('aria-hidden', 'false');
    toast?.classList.add('is-visible');
  }

  document.querySelectorAll('[data-demo-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const error = form.querySelector('.field-error');
      const status = form.querySelector('.form-status');
      if (status) status.textContent = '';

      if (!input.value.trim() || !input.validity.valid) {
        input.setAttribute('aria-invalid', 'true');
        if (error) error.textContent = 'Введите адрес почты с символом @.';
        input.focus();
        return;
      }

      input.removeAttribute('aria-invalid');
      if (error) error.textContent = '';
      showDemoNotice(form);
      input.value = '';
    });
  });

  toastClose?.addEventListener('click', () => {
    toast.classList.remove('is-visible');
    toast.setAttribute('aria-hidden', 'true');
  });
})();
