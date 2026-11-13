const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');

if ('IntersectionObserver' in window && !motionPreference.matches) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      if (motionPreference.matches) continue;
      const visual = entry.target.classList.contains('visual');
      entry.target.animate(
        [
          { opacity: 0.55, transform: visual ? 'translateY(12px) scale(.99)' : 'translateY(20px)' },
          { opacity: 1, transform: 'none' }
        ],
        { duration: visual ? 850 : 630, easing: 'cubic-bezier(.19, 1, .22, 1)' }
      );
    }
  }, { threshold: 0.12 });

  document.querySelectorAll('[data-reveal]').forEach((element) => observer.observe(element));
}

// Flip Card hover effect adapted from React Bits for the static photo panels.
document.querySelectorAll('.visual').forEach((panel) => {
  const image = panel.querySelector('img');
  if (!image) return;

  const rotor = document.createElement('div');
  rotor.className = 'flip-card__rotor';
  const face = document.createElement('div');
  face.className = 'flip-card__face';
  const glare = document.createElement('span');
  glare.className = 'flip-card__glare';
  glare.setAttribute('aria-hidden', 'true');
  face.append(image, glare);
  rotor.append(face);
  panel.append(rotor);
  panel.classList.add('flip-card');

  const reset = () => { rotor.removeAttribute('style'); };
  const normalize = (position, edge, size) => Math.min(1, Math.max(0, (position - edge) / size));
  const tiltMax = 6;
  // Enlarge the tilted face so it covers the clipped panel even at the corners.
  const hoverScale = 1.09;

  panel.addEventListener('pointermove', (event) => {
    if (motionPreference.matches || event.pointerType === 'touch') return;
    const { left, top, width, height } = panel.getBoundingClientRect();
    if (!width || !height) return;

    const x = normalize(event.clientX, left, width);
    const y = normalize(event.clientY, top, height);
    rotor.style.setProperty('--fc-x', `${(0.5 - y) * 2 * tiltMax}deg`);
    rotor.style.setProperty('--fc-y', `${(x - 0.5) * 2 * tiltMax}deg`);
    rotor.style.setProperty('--fc-gx', `${x * 100}%`);
    rotor.style.setProperty('--fc-gy', `${y * 100}%`);
    rotor.style.setProperty('--fc-lift', hoverScale);
    rotor.style.setProperty('--fc-sheen', '1');
  });

  panel.addEventListener('pointerleave', reset);
  panel.addEventListener('pointercancel', reset);
  motionPreference.addEventListener('change', reset);
});
