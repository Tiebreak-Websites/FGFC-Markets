/* FGFC Markets Global Ltd — interactions (vanilla JS, no dependencies) */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------
   1. Scroll-reveal system
   [data-reveal] fades/rises in; [data-reveal-group] staggers
   its direct [data-reveal] children.
------------------------------------------------------------ */
(() => {
  $$('[data-reveal-group]').forEach((group) => {
    $$(':scope [data-reveal]', group).forEach((el, i) => {
      el.style.setProperty('--d', `${i * 110}ms`);
    });
  });

  const targets = $$('[data-reveal]');
  if (!targets.length) return;

  if (reducedMotion || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
  );

  targets.forEach((el) => io.observe(el));
})();

/* ------------------------------------------------------------
   2. Header state + scrollspy (nav links & index rail)
------------------------------------------------------------ */
(() => {
  const header = $('#site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const sections = $$('main section[id]');
  const navLinks = $$('.main-nav a[href^="#"]');
  const railLinks = $$('.rail a[href^="#"]');
  if (!sections.length) return;

  const setActive = (id) => {
    const match = (a) => a.getAttribute('href') === `#${id}`;
    navLinks.forEach((a) => a.classList.toggle('active', match(a)));
    railLinks.forEach((a) => {
      const on = match(a);
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  };

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: '-38% 0px -52% 0px', threshold: 0 }
  );

  sections.forEach((s) => spy.observe(s));
})();

/* ------------------------------------------------------------
   3. Mobile menu
------------------------------------------------------------ */
(() => {
  const burger = $('.burger');
  const nav = $('#main-nav');
  if (!burger || !nav) return;

  const root = document.documentElement;

  const setOpen = (open) => {
    root.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) {
      const first = nav.querySelector('a');
      if (first) first.focus({ preventScroll: true });
    } else {
      burger.focus({ preventScroll: true });
    }
  };

  burger.addEventListener('click', () =>
    setOpen(!root.classList.contains('menu-open'))
  );

  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.classList.contains('menu-open')) setOpen(false);
  });

  // reset state if the viewport grows past the breakpoint
  window.matchMedia('(min-width: 861px)').addEventListener('change', (e) => {
    if (e.matches && root.classList.contains('menu-open')) setOpen(false);
  });
})();

/* ------------------------------------------------------------
   4. Hero canvas — "market pulse"
   A fine gold line drifting like a slow tape, plus rising motes.
------------------------------------------------------------ */
(() => {
  const canvas = $('#pulse');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let w = 0;
  let h = 0;
  let dpr = 1;
  let running = false;
  let heroVisible = true;
  let raf = 0;
  let t = reducedMotion ? 2.6 : 0;

  const MOTES = 26;
  let motes = [];

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    motes = Array.from({ length: MOTES }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.7 + Math.random() * 1.2,
      s: 0.08 + Math.random() * 0.22,
      a: 0.08 + Math.random() * 0.2,
      p: Math.random() * Math.PI * 2,
    }));
  };

  const wave = (x, tt) =>
    Math.sin(x * 0.8 + tt * 0.9) * 0.46 +
    Math.sin(x * 1.9 - tt * 0.55) * 0.28 +
    Math.sin(x * 0.33 + tt * 0.32) * 0.26;

  const draw = () => {
    ctx.clearRect(0, 0, w, h);

    // motes
    for (const m of motes) {
      m.y -= m.s;
      m.x += Math.sin(m.p + t * 0.4) * 0.12;
      if (m.y < -4) {
        m.y = h + 4;
        m.x = Math.random() * w;
      }
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(216, 179, 106, ${m.a})`;
      ctx.fill();
    }

    // pulse line along the lower third
    const base = h * 0.74;
    const amp = Math.min(h * 0.055, 46);
    ctx.beginPath();
    for (let x = -10; x <= w + 10; x += 12) {
      const y = base + wave(x / 130, t) * amp;
      x === -10 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(216, 179, 106, 0.42)';
    ctx.lineWidth = 1.1;
    ctx.shadowColor = 'rgba(216, 179, 106, 0.55)';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // echo line, quieter and offset
    ctx.beginPath();
    for (let x = -10; x <= w + 10; x += 14) {
      const y = base + 26 + wave(x / 170, t * 0.8 + 3.1) * amp * 0.7;
      x === -10 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(189, 153, 82, 0.16)';
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  const loop = () => {
    if (!running) return;
    t += 0.016;
    draw();
    raf = requestAnimationFrame(loop);
  };

  const setRunning = (on) => {
    if (on === running) return;
    running = on;
    if (on) raf = requestAnimationFrame(loop);
    else cancelAnimationFrame(raf);
  };

  resize();
  window.addEventListener('resize', () => {
    resize();
    draw();
  });

  if (reducedMotion) {
    draw(); // single static frame
    return;
  }

  new IntersectionObserver(
    ([entry]) => {
      heroVisible = entry.isIntersecting;
      setRunning(heroVisible && !document.hidden);
    },
    { threshold: 0.05 }
  ).observe(canvas);

  document.addEventListener('visibilitychange', () =>
    setRunning(heroVisible && !document.hidden)
  );
})();

/* ------------------------------------------------------------
   5. Gentle parallax on [data-plx] media (desktop only)
------------------------------------------------------------ */
(() => {
  if (reducedMotion) return;
  const els = $$('[data-plx]');
  if (!els.length) return;

  const mq = window.matchMedia('(min-width: 1024px)');
  let ticking = false;

  const update = () => {
    ticking = false;
    if (!mq.matches) {
      els.forEach((el) => (el.style.transform = ''));
      return;
    }
    const vh = window.innerHeight;
    els.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < -80 || rect.top > vh + 80) return;
      const mid = rect.top + rect.height / 2 - vh / 2;
      const f = parseFloat(el.dataset.plx || '0.06');
      el.style.transform = `translateY(${(-mid * f).toFixed(1)}px)`;
    });
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();

/* ------------------------------------------------------------
   6. Hero ambient video — load only where it earns its bytes
------------------------------------------------------------ */
(() => {
  const video = $('#hero-video');
  if (!video) return;

  const conn = navigator.connection;
  const ok =
    !reducedMotion &&
    window.matchMedia('(min-width: 900px)').matches &&
    !(conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '')));

  if (!ok) {
    video.remove();
    return;
  }

  $$('source[data-src]', video).forEach((s) => {
    s.src = s.dataset.src;
    s.removeAttribute('data-src');
  });
  video.load();

  const tryPlay = () => {
    const p = video.play();
    if (p) p.catch(() => {});
  };

  video.addEventListener('canplay', () => video.classList.add('on'), { once: true });
  tryPlay();

  // pause the loop while the hero is off-screen
  new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) tryPlay();
      else video.pause();
    },
    { threshold: 0.05 }
  ).observe(video);
})();

/* ------------------------------------------------------------
   7. Contact form — client-side validation + demo submit
   (No backend is wired yet; see README before launch.)
------------------------------------------------------------ */
(() => {
  const card = $('#form-card');
  const form = $('#contact-form');
  if (!card || !form) return;

  const fields = {
    first_name: { test: (v) => v.trim().length >= 2, msg: 'Please enter your first name.' },
    last_name: { test: (v) => v.trim().length >= 2, msg: 'Please enter your last name.' },
    email: {
      test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
      msg: 'Please enter a valid email address.',
    },
    subject: { test: (v) => v.trim().length >= 3, msg: 'Please add a subject.' },
    message: { test: (v) => v.trim().length >= 10, msg: 'Please write a short message (10+ characters).' },
  };

  const validateField = (input) => {
    const rule = fields[input.name];
    if (!rule) return true;
    const ok = rule.test(input.value);
    const wrap = input.closest('.field');
    wrap.classList.toggle('is-error', !ok);
    const err = wrap.querySelector('.err');
    if (err) err.textContent = ok ? '' : rule.msg;
    input.setAttribute('aria-invalid', String(!ok));
    return ok;
  };

  form.addEventListener(
    'blur',
    (e) => {
      if (e.target.matches('input, textarea')) validateField(e.target);
    },
    true
  );

  form.addEventListener('input', (e) => {
    const wrap = e.target.closest('.field');
    if (wrap && wrap.classList.contains('is-error')) validateField(e.target);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // honeypot: silently drop bot submissions
    if (form.company && form.company.value) return;

    const inputs = $$('input[name], textarea[name]', form).filter((i) => fields[i.name]);
    const bad = inputs.filter((i) => !validateField(i));
    if (bad.length) {
      bad[0].focus();
      return;
    }

    const btn = $('button[type="submit"]', form);
    btn.disabled = true;
    btn.querySelector('.btn-label').textContent = 'Recording…';

    // Demo delay — swap for a real endpoint call before launch.
    setTimeout(() => {
      card.classList.add('is-sent');
      const done = $('.form-success', card);
      if (done) done.focus();
    }, 900);
  });
})();
