const dialog = document.querySelector('#brief-dialog');
const form = document.querySelector('#brief-form');
function openBrief(service) {
  if (service) form.elements.service.value = service;
  dialog.showModal();
  document.body.classList.add('dialog-open');
  if (!motionDisabled()) dialog.animate([{ opacity: 0, transform: 'translateY(20px) scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: 'cubic-bezier(.22,1,.36,1)' });
  form.elements.name.focus();
}
document.querySelector('[data-open-brief]').addEventListener('click', () => openBrief());
dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const box = dialog.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close(); } });
const statusEl = document.querySelector('#form-status');
form.addEventListener('submit', async event => {
  event.preventDefault();
  const submit = form.querySelector('[type="submit"]');
  submit.disabled = true;
  submit.innerHTML = 'Sending… <span aria-hidden="true">↗</span>';
  statusEl.textContent = 'Sending your brief…';

  const values = new FormData(form);
  const payload = new FormData();
  payload.append('access_key', '7b5f59aa-623e-45de-a746-7edf75647617');
  payload.append('subject', `New project brief from ${values.get('name')} — ${values.get('business')}`);
  payload.append('from_name', 'Eschanyx Website');
  payload.append('name',     values.get('name'));
  payload.append('business', values.get('business'));
  payload.append('service',  values.get('service'));
  payload.append('message',  values.get('idea'));

  try {
    const res  = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: payload });
    const data = await res.json();
    if (data.success) {
      submit.classList.add('is-saved');
      submit.innerHTML = 'Brief sent ✓';
      statusEl.textContent = 'Your brief has been sent to Eschanyx. We\'ll be in touch soon.';
      form.reset();
    } else {
      throw new Error(data.message || 'Submission failed');
    }
  } catch (err) {
    submit.disabled = false;
    submit.innerHTML = 'Save project brief <span aria-hidden="true">↓</span>';
    statusEl.textContent = 'Something went wrong. Please try again or email us directly.';
  }
});
document.querySelector('#year').textContent = new Date().getFullYear();

// One motion preference controls all decorative animation.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let pausedMotion = false;
try { pausedMotion = localStorage.getItem('eschanyx-motion') === 'paused'; } catch {}
function motionDisabled() { return reducedMotion.matches || pausedMotion; }
const motionButton = document.createElement('button');
motionButton.type = 'button';
motionButton.className = 'motion-toggle';
document.querySelector('.header').insertBefore(motionButton, document.querySelector('.nav-cta'));
function syncMotion() {
  document.documentElement.classList.toggle('motion-paused', motionDisabled());
  motionButton.textContent = motionDisabled() ? 'Motion off' : 'Motion on';
  motionButton.setAttribute('aria-label', 'Pause decorative animations');
  motionButton.setAttribute('aria-pressed', String(motionDisabled()));
  motionButton.disabled = reducedMotion.matches;
  motionButton.title = reducedMotion.matches ? 'Reduced motion is enabled in your system settings' : 'Toggle decorative animations';
  if (motionDisabled()) document.getAnimations().forEach(animation => {
    if (animation.effect.getComputedTiming().iterations !== Infinity) animation.finish();
  });
}
motionButton.addEventListener('click', () => {
  pausedMotion = !pausedMotion;
  try { localStorage.setItem('eschanyx-motion', pausedMotion ? 'paused' : 'enabled'); } catch {}
  syncMotion();
});
reducedMotion.addEventListener('change', syncMotion);
syncMotion();
// Keep the cube and its supporting cards in one automatically animated scene.
const structure = document.querySelector('.hero-art .structure');
if (structure) {
  const assembly = document.createElement('div');
  assembly.className = 'hero-assembly';
  while (structure.firstChild) assembly.append(structure.firstChild);
  structure.append(assembly);
}

// Animate measured heights so native details keep their keyboard behavior.
document.querySelectorAll('.service-list details').forEach(details => {
  const summary = details.querySelector('summary');
  const body = details.querySelector('.service-body');
  const shortcut = document.createElement('button');
  shortcut.type = 'button';
  shortcut.className = 'text-link service-cta';
  shortcut.innerHTML = 'Build this with us <span aria-hidden="true">↗</span>';
  shortcut.addEventListener('click', () => openBrief(summary.querySelector('h3').textContent));
  body.append(shortcut);
  let animation;
  let expanded = details.open;
  summary.addEventListener('click', event => {
    event.preventDefault();
    const start = details.getBoundingClientRect().height;
    if (animation) { animation.onfinish = null; animation.cancel(); }
    expanded = !expanded;
    details.open = expanded;
    const end = details.getBoundingClientRect().height;
    if (motionDisabled()) {
      details.style.overflow = '';
      details.classList.remove('is-closing');
      return;
    }
    details.open = true;
    details.classList.toggle('is-closing', !expanded);
    details.style.overflow = 'hidden';
    animation = details.animate([{ height: `${start}px` }, { height: `${end}px` }], { duration: 320, easing: 'cubic-bezier(.22,1,.36,1)' });
    animation.onfinish = () => {
      details.open = expanded;
      details.style.overflow = '';
      details.classList.remove('is-closing');
      animation = null;
    };
  });
});

const processNotes = [
  'Together, we map your current workflow, identify the biggest friction points, and agree on priorities for the project.',
  'You review the proposed direction and working versions as they develop, with clear opportunities to shape the result.',
  'We check the experience, prepare your team for handover, and discuss useful improvements for the next stage.'
];
document.querySelectorAll('.steps article').forEach((article, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'step-toggle';
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', `step-more-${index}`);
  button.innerHTML = 'Explore this step <span aria-hidden="true">+</span>';
  const panel = document.createElement('div');
  panel.id = `step-more-${index}`;
  panel.className = 'step-more';
  panel.hidden = true;
  const paragraph = document.createElement('p');
  paragraph.textContent = processNotes[index];
  panel.append(paragraph);
  article.append(button, panel);
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(expanded));
    button.innerHTML = `${expanded ? 'Close this step' : 'Explore this step'} <span aria-hidden="true">${expanded ? '−' : '+'}</span>`;
    article.classList.toggle('is-expanded', expanded);
    panel.hidden = !expanded;
    if (expanded && !motionDisabled()) panel.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 280 });
  });
});

// Content remains visible when JavaScript or observer support is unavailable.
if ('IntersectionObserver' in window) {
  const reveal = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      reveal.unobserve(entry.target);
      if (!motionDisabled()) entry.target.animate([
        { opacity: 0, transform: 'translateY(24px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 650, delay: Number(entry.target.dataset.revealDelay || 0), easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
    });
  }, { threshold: .12 });
  document.querySelectorAll('.header, .hero-copy > *, .hero-art, .discipline-strip, .section-intro > *, .service-list details, .about-visual, .about-copy > *, .process-head > *, .steps article, .contact > *, .footer-top, .footer-bottom').forEach(element => {
    if (element.matches('.hero-copy > *, .steps article')) element.dataset.revealDelay = String([...element.parentElement.children].indexOf(element) * 65);
    reveal.observe(element);
  });
  const sections = [...document.querySelectorAll('section[id]')];
  const links = [...document.querySelectorAll('.footer-top nav a')];
  const activeSections = new Map();
  const navigation = new IntersectionObserver(entries => {
    entries.forEach(entry => activeSections.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0));
    const active = [...activeSections].sort((a, b) => b[1] - a[1]).find(([, ratio]) => ratio > 0)?.[0];
    links.forEach(link => {
      if (link.hash === `#${active}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { threshold: [0, .2, .5], rootMargin: '-10% 0px -20% 0px' });
  sections.forEach(section => navigation.observe(section));
}

form.querySelectorAll('input, textarea, select').forEach(field => {
  const update = () => field.closest('label').classList.toggle('is-filled', Boolean(field.value.trim()));
  field.addEventListener('input', update);
  field.addEventListener('change', update);
  update();
});
form.addEventListener('input', () => {
  const submit = form.querySelector('[type="submit"]');
  submit.disabled = false;
  submit.classList.remove('is-saved');
  submit.innerHTML = 'Send project brief <span aria-hidden="true">↗</span>';
  statusEl.textContent = 'Your brief will be sent directly to Eschanyx.';
});
