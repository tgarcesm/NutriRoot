(() => {
  'use strict';

  const mainEl = document.getElementById('contenido-principal');
  const skip = document.querySelector('.skip-link');
  if (skip && mainEl) {
    skip.addEventListener('click', () => {
      window.requestAnimationFrame(() => {
        mainEl.focus({ preventScroll: false });
      });
    });
  }

  const fadeEls = document.querySelectorAll('.fade-up');
  const revealAll = () => {
    fadeEls.forEach((el) => {
      el.classList.add('visible');
    });
  };

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    revealAll();
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
    );

    fadeEls.forEach((el) => observer.observe(el));
  }
})();

(() => {
  'use strict';

  const modal = document.getElementById('pitch-modal');
  const fab = document.getElementById('pitch-fab');
  if (!modal || !fab) return;

  const shell = modal.querySelector('.pitch-modal__shell');
  const backdrop = modal.querySelector('.pitch-modal__backdrop');
  const closeEls = modal.querySelectorAll('[data-pitch-close]');
  const btnPrev = document.getElementById('pitch-prev');
  const btnNext = document.getElementById('pitch-next');
  const slides = modal.querySelectorAll('.pitch-slide');
  const slideNumEl = document.getElementById('pitch-slide-num');
  const body = document.body;

  let current = 0;
  let lastFocus = null;
  let closeTimer = null;
  const total = slides.length;
  const closeDurationMs = 380;

  const setSlide = (index) => {
    current = Math.max(0, Math.min(index, total - 1));
    slides.forEach((slide, i) => {
      const active = i === current;
      slide.classList.toggle('is-active', active);
      slide.toggleAttribute('hidden', !active);
      slide.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    if (slideNumEl) {
      slideNumEl.textContent = String(current + 1);
    }
    if (btnPrev) btnPrev.disabled = current === 0;
    if (btnNext) btnNext.disabled = current === total - 1;
  };

  const openModal = () => {
    window.clearTimeout(closeTimer);
    closeTimer = null;
    lastFocus = document.activeElement;
    modal.removeAttribute('hidden');
    modal.setAttribute('aria-hidden', 'false');
    body.classList.add('pitch-modal-open');
    modal.classList.remove('is-open');

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        modal.classList.add('is-open');
      });
    });

    setSlide(0);
    window.setTimeout(() => {
      const closeBtn = modal.querySelector('.pitch-modal__close');
      if (closeBtn && typeof closeBtn.focus === 'function') {
        closeBtn.focus();
      } else if (shell && typeof shell.focus === 'function') {
        shell.focus();
      }
    }, 50);
  };

  const closeModal = () => {
    if (!modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => {
      closeTimer = null;
      modal.setAttribute('hidden', '');
      modal.setAttribute('aria-hidden', 'true');
      body.classList.remove('pitch-modal-open');
      if (lastFocus && typeof lastFocus.focus === 'function') {
        lastFocus.focus();
      }
    }, closeDurationMs);
  };

  fab.addEventListener('click', openModal);

  closeEls.forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });
  });

  btnPrev?.addEventListener('click', () => setSlide(current - 1));
  btnNext?.addEventListener('click', () => setSlide(current + 1));

  document.addEventListener('keydown', (e) => {
    if (modal.hasAttribute('hidden') || !modal.classList.contains('is-open')) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
    }
  });

  backdrop?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      closeModal();
    }
  });
})();
