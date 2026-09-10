const dialog = document.querySelector('#brief-dialog');
const form = document.querySelector('#brief-form');
document.querySelector('[data-open-brief]').addEventListener('click', () => {
  dialog.showModal();
  form.elements.name.focus();
});
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const box = dialog.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close(); } });
form.addEventListener('submit', event => {
  event.preventDefault();
  const values = new FormData(form);
  const brief = `ESCHANYX — PROJECT BRIEF\n\nName: ${values.get('name')}\nBusiness: ${values.get('business')}\nService: ${values.get('service')}\n\nProject idea\n${values.get('idea')}\n`;
  const url = URL.createObjectURL(new Blob([brief], { type: 'text/plain;charset=utf-8' }));
  const download = document.createElement('a');
  download.href = url; download.download = 'eschanyx-project-brief.txt'; download.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  document.querySelector('#form-status').textContent = 'Your brief is ready to save. Share the file with Eschanyx when you get in touch. Nothing has been sent.';
});
document.querySelector('#year').textContent = new Date().getFullYear();

// Direct manipulation stays local to each illustration; no animation loop is needed.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('.hero-art, .about-visual').forEach((panel, index) => {
  let sculpture = panel.querySelector('.crystal, .sculpture-rings');
  if (!sculpture) return;
  const hero = panel.classList.contains('hero-art');
  if (hero) {
    const structure = panel.querySelector('.structure');
    const assembly = document.createElement('div');
    assembly.className = 'hero-assembly';
    // Keep the cube and every supporting card in the same rotating scene.
    while (structure.firstChild) assembly.append(structure.firstChild);
    structure.append(assembly);
    sculpture = assembly;
  }
  const baseX = 57;
  const baseY = hero ? 0 : -16;
  const baseZ = hero ? -40 : -30;
  let x = 0, y = 0, drag = null;
  panel.classList.add('interactive-art');
  panel.setAttribute('role', 'group');
  panel.setAttribute('tabindex', '0');
  panel.setAttribute('aria-label', hero ? 'Interactive 3D cube and layered business cards' : 'Interactive 3D ring sculpture');
  panel.setAttribute('aria-describedby', `art-help-${index}`);

  const controls = document.createElement('div');
  controls.className = 'art-controls';
  controls.innerHTML = `<span class="art-help" id="art-help-${index}">Drag to rotate <span class="sr-only">or use arrow keys. Press Home to reset.</span></span><button type="button" data-turn="-1" aria-label="Rotate left">←</button><button type="button" data-turn="1" aria-label="Rotate right">→</button><button type="button" data-reset aria-label="Reset sculpture rotation">Reset</button>`;
  panel.append(controls);

  function render(hoverX = 0, hoverY = 0) {
    sculpture.style.transform = `rotateX(${baseX + x + hoverX}deg) rotateY(${baseY + y + hoverY}deg) rotateZ(${baseZ}deg)`;
    if (hero) {
      panel.style.setProperty('--scene-x', `${Math.sin((y + hoverY) * Math.PI / 180) * 12}px`);
      panel.style.setProperty('--scene-y', `${Math.sin((x + hoverX) * Math.PI / 180) * -10}px`);
    }
  }
  function reset() { x = 0; y = 0; render(); }
  controls.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-reset')) reset();
    else { y += Number(button.dataset.turn) * 25; render(); }
  });
  panel.addEventListener('keydown', event => {
    if (event.target !== panel) return;
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home') reset();
    else {
      if (event.key === 'ArrowLeft') y -= 15;
      if (event.key === 'ArrowRight') y += 15;
      if (event.key === 'ArrowUp') x = Math.max(-65, x - 10);
      if (event.key === 'ArrowDown') x = Math.min(65, x + 10);
      render();
    }
  });
  panel.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || event.target.closest('.art-controls')) return;
    drag = { id: event.pointerId, startX: event.clientX, startY: event.clientY, x, y };
    panel.setPointerCapture(event.pointerId);
    panel.classList.add('is-dragging');
    panel.focus({ preventScroll: true });
  });
  panel.addEventListener('pointermove', event => {
    if (drag && drag.id === event.pointerId) {
      y = drag.y + (event.clientX - drag.startX) * .55;
      // Preserve vertical page scrolling on touch screens.
      if (event.pointerType !== 'touch') x = Math.max(-65, Math.min(65, drag.x - (event.clientY - drag.startY) * .35));
      render();
    } else if (!drag && event.pointerType === 'mouse' && !reducedMotion.matches) {
      const bounds = panel.getBoundingClientRect();
      render(-((event.clientY - bounds.top) / bounds.height - .5) * 14, ((event.clientX - bounds.left) / bounds.width - .5) * 20);
    }
  });
  function endDrag(event) {
    if (!drag || event.pointerId !== drag.id) return;
    drag = null;
    panel.classList.remove('is-dragging');
    if (panel.hasPointerCapture(event.pointerId)) panel.releasePointerCapture(event.pointerId);
    render();
  }
  panel.addEventListener('pointerup', endDrag);
  panel.addEventListener('pointercancel', endDrag);
  panel.addEventListener('lostpointercapture', endDrag);
  panel.addEventListener('pointerleave', () => { if (!drag) render(); });
  reducedMotion.addEventListener('change', () => render());
  render();
});
