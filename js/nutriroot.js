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

  const nav = document.getElementById('site-nav');
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('primary-navigation');
  if (!nav || !toggle || !links) return;

  const mq = window.matchMedia('(max-width: 900px)');
  const labelOpen = 'Abrir menú de navegación';
  const labelClose = 'Cerrar menú de navegación';

  const open = () => {
    nav.classList.add('is-open');
    document.body.classList.add('nav-menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', labelClose);
    links.removeAttribute('aria-hidden');
  };

  const close = () => {
    nav.classList.remove('is-open');
    document.body.classList.remove('nav-menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', labelOpen);
    if (mq.matches) {
      links.setAttribute('aria-hidden', 'true');
    } else {
      links.removeAttribute('aria-hidden');
    }
  };

  const syncMq = () => {
    if (!mq.matches) {
      close();
      links.removeAttribute('aria-hidden');
    } else if (!nav.classList.contains('is-open')) {
      links.setAttribute('aria-hidden', 'true');
    }
  };

  syncMq();
  mq.addEventListener('change', syncMq);

  toggle.addEventListener('click', () => {
    if (!mq.matches) return;
    if (nav.classList.contains('is-open')) close();
    else open();
  });

  links.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', () => {
      if (mq.matches) close();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !nav.classList.contains('is-open')) return;
    const pitch = document.getElementById('pitch-modal');
    if (pitch && !pitch.hasAttribute('hidden') && pitch.classList.contains('is-open')) return;
    close();
  });
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
      if (active) {
        slide.removeAttribute('hidden');
        slide.setAttribute('aria-hidden', 'false');
      } else {
        slide.setAttribute('hidden', '');
        slide.setAttribute('aria-hidden', 'true');
      }
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
    const nav = document.getElementById('site-nav');
    if (nav && nav.classList.contains('is-open')) {
      nav.classList.remove('is-open');
      document.body.classList.remove('nav-menu-open');
      const t = document.getElementById('nav-toggle');
      if (t) {
        t.setAttribute('aria-expanded', 'false');
        t.setAttribute('aria-label', 'Abrir menú de navegación');
      }
      const links = document.getElementById('primary-navigation');
      if (links && window.matchMedia('(max-width: 900px)').matches) {
        links.setAttribute('aria-hidden', 'true');
      }
    }
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

  if (btnPrev) btnPrev.addEventListener('click', () => setSlide(current - 1));
  if (btnNext) btnNext.addEventListener('click', () => setSlide(current + 1));

  document.addEventListener('keydown', (e) => {
    if (modal.hasAttribute('hidden') || !modal.classList.contains('is-open')) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
    }
  });

  if (backdrop) {
    backdrop.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        closeModal();
      }
    });
  }
})();
