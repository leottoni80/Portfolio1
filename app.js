/* ============================================================
   LR — app.js
   Navigation, parallax, scroll reveals, count-up, etc.
   ============================================================ */

'use strict';

/* ── Utility ─────────────────────────────────────────────── */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── Nav scroll state ────────────────────────────────────── */
function initNav() {
  const nav = $('.nav');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Active link
  const path = location.pathname.split('/').pop() || 'index.html';
  $$('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // Mobile toggle
  const toggle = $('.nav-toggle');
  const links  = $('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      links.classList.toggle('open');
    });
    $$('.nav-links a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.classList.remove('open');
        links.classList.remove('open');
      });
    });
  }
}

/* ── Scroll reveal (.sr → .in) ───────────────────────────── */
function initReveal() {
  const els = $$('.sr');
  if (!els.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  els.forEach(el => io.observe(el));
}

/* ── Count-up animation for stats ────────────────────────── */
function initCountUp() {
  const nums = $$('.intro-stat-num[data-target]');
  if (!nums.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;

      const el     = e.target;
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      const dur    = 1600;
      const start  = performance.now();

      const tick = now => {
        const pct = Math.min((now - start) / dur, 1);
        const val = Math.round(easeOutExpo(pct) * target);
        el.textContent = val + suffix;
        if (pct < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, { threshold: 0.4 });

  nums.forEach(el => io.observe(el));
}

function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/* ── Hero parallax ───────────────────────────────────────── */
function initParallax() {
  const portrait = $('.hero-portrait');
  const heroBg   = $('.hero-bg');
  if (!portrait) return;

  let ticking = false;

  const update = () => {
    const y = window.scrollY;
    portrait.style.transform = `translateY(${y * 0.22}px)`;
    if (heroBg) heroBg.style.transform = `translateY(${y * 0.06}px)`;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  // Mouse tilt
  const hero = $('.hero');
  if (!hero) return;

  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width/2)) / rect.width;
    const dy = (e.clientY - (rect.top  + rect.height/2)) / rect.height;
    portrait.style.transform =
      `translateY(${window.scrollY * 0.22}px) translate(${dx * 10}px, ${dy * 6}px)`;
  });

  hero.addEventListener('mouseleave', () => {
    portrait.style.transform = `translateY(${window.scrollY * 0.22}px)`;
  });
}

/* ── Video filter tabs ───────────────────────────────────── */
function initVideoFilter() {
  const btns  = $$('.filter-btn');
  const cards = $$('.video-card');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const cat = btn.dataset.filter;
      cards.forEach(card => {
        const match = cat === 'all' || card.dataset.category === cat;
        card.style.opacity       = match ? '1' : '0.25';
        card.style.pointerEvents = match ? 'auto' : 'none';
      });
    });
  });
}

/* ── Contact form ────────────────────────────────────────── */
function initContactForm() {
  const form   = $('.contact-form');
  const status = $('.form-status');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('.btn[type="submit"]');
    if (btn) {
      btn.textContent = 'Sending…';
      btn.disabled    = true;
    }

    setTimeout(() => {
      if (status) {
        status.textContent = "Message received. I'll be in touch shortly.";
        status.classList.add('visible');
      }
      form.reset();
      if (btn) {
        btn.textContent = 'Send Message';
        btn.disabled    = false;
      }
      setTimeout(() => status && status.classList.remove('visible'), 5000);
    }, 1400);
  });
}

/* ── Cursor accent dot ───────────────────────────────────── */
function initCursor() {
  if (!window.matchMedia('(pointer:fine)').matches) return;

  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  Object.assign(dot.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--accent)',
    pointerEvents: 'none',
    zIndex: '10000',
    transition: 'transform 0.1s',
    willChange: 'transform',
    mixBlendMode: 'screen',
  });
  document.body.appendChild(dot);

  document.addEventListener('mousemove', e => {
    dot.style.transform = `translate(${e.clientX - 3}px, ${e.clientY - 3}px)`;
  });

  $$('a, button, .video-card, .fv-item').forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.style.width  = '20px';
      dot.style.height = '20px';
      dot.style.marginLeft = '-7px';
      dot.style.marginTop  = '-7px';
      dot.style.opacity = '0.5';
    });
    el.addEventListener('mouseleave', () => {
      dot.style.width  = '6px';
      dot.style.height = '6px';
      dot.style.marginLeft = '0';
      dot.style.marginTop  = '0';
      dot.style.opacity = '1';
    });
  });
}



/* ── Boot ────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initReveal();
  initParallax();
  initVideoFilter();
  initContactForm();
  initCountUp();
  initCursor();
});
