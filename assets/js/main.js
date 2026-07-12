/* =========================================================================
   SETROF SEGURIDAD — main.js
   HECHO POR: BENJAMIN FORTES CARRASCO — SETROF

      ___    ____
     | _ |==| () |==[ S E T R O F · VIGILANDO 24/7 ]
     |___|  |____|
========================================================================= */

(function () {
  'use strict';

  const header = document.getElementById('header');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lenis = null; // se asigna más abajo si procede

  const copyYear = document.getElementById('copyYear');
  if (copyYear) copyYear.textContent = new Date().getFullYear();

  const onScroll = () => header.classList.toggle('header--scrolled', window.scrollY > 60);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  navToggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('nav__menu--open');
    navToggle.setAttribute('aria-expanded', open);
    navToggle.querySelector('i').className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
  });
  navMenu.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('nav__menu--open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.querySelector('i').className = 'fa-solid fa-bars';
    });
  });

  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link:not(.nav__link--cta)');
  const setActive = () => {
    let current = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 130) current = s.id; });
    navLinks.forEach(l => l.classList.toggle('nav__link--active', l.getAttribute('href') === `#${current}`));
  };
  setActive();
  window.addEventListener('scroll', setActive, { passive: true });

  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const nombre = document.getElementById('nombre').value.trim();
      const telefono = document.getElementById('telefono').value.trim();
      const servicio = document.getElementById('servicio').value;
      const mensaje = document.getElementById('mensaje').value.trim();
      if (!nombre || !telefono || !servicio) {
        alert('Por favor complete los campos obligatorios (*)');
        return;
      }
      const servicioMap = {
        cctv: 'Sistemas CCTV / Cámaras', cerco: 'Cercos Eléctricos',
        alarma: 'Sistemas de Alarma',
        piscina: 'Construcción de Piscinas',
        porton: 'Portones Automáticos / Accesos', mantenimiento: 'Mantenimiento y Soporte',
        integral: 'Proyecto Integral'
      };
      const texto = `Hola SETROF SEGURIDAD, me comunico desde el sitio web.\n\n*Nombre:* ${nombre}\n*Teléfono:* ${telefono}\n*Servicio:* ${servicioMap[servicio]}\n*Mensaje:* ${mensaje || '(sin mensaje adicional)'}`;
      window.open(`https://wa.me/56974054542?text=${encodeURIComponent(texto)}`, '_blank', 'noopener,noreferrer');
    });
  }

  const poolModal = document.getElementById('poolModal');
  const modalImg = document.getElementById('modalImg');
  const modalText = document.getElementById('modalText');
  const closeModal = document.querySelector('.pool-modal__close');

  if (poolModal && modalImg && modalText && closeModal) {
    document.querySelectorAll('img[data-description]').forEach(img => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => {
        modalImg.src = img.src;
        modalText.textContent = img.getAttribute('data-description');
        poolModal.classList.add('pool-modal--open');
        document.body.style.overflow = 'hidden';
        if (lenis) lenis.stop();
      });
    });

    const closePoolModal = () => {
      poolModal.classList.remove('pool-modal--open');
      document.body.style.overflow = '';
      if (lenis) lenis.start();
    };

    closeModal.addEventListener('click', closePoolModal);
    poolModal.addEventListener('click', (e) => { if (e.target === poolModal) closePoolModal(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && poolModal.classList.contains('pool-modal--open')) closePoolModal();
    });
  }

  const hasGSAP = !!(window.gsap && window.ScrollTrigger);
  if (prefersReduced || !hasGSAP) {
    document.documentElement.classList.remove('anim-ready', 'intro-play'); // todo visible
    document.body.style.overflow = '';
    const introFallback = document.getElementById('intro');
    if (introFallback) introFallback.style.display = 'none';
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
      touchMultiplier: 1.6
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    // Evita conflicto con el smooth nativo de CSS
    document.documentElement.style.scrollBehavior = 'auto';

    // Anclas internas -> scroll suave con offset del header fijo
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      const href = a.getAttribute('href');
      if (!href || href.length < 2) return;
      a.addEventListener('click', (e) => {
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -(header.offsetHeight) });
      });
    });
  }

  const hudEl = document.getElementById('hud');
  const hudTime = document.getElementById('hudTime');
  const hudStatus = document.getElementById('hudStatus');
  const revealHUD = () => { if (hudEl) hudEl.classList.add('is-on'); };
  const hudFocus = (on) => { if (hudEl) hudEl.classList.toggle('hud--focus', on); };

  if (hudTime) {
    const pad = (n) => String(n).padStart(2, '0');
    const tick = () => {
      const d = new Date();
      hudTime.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
    };
    tick();
    setInterval(tick, 1000);
  }

  const hudLabels = {
    inicio: 'SECTOR 01 · INICIO', servicios: 'SECTOR 02 · SERVICIOS'
  };
  sections.forEach((sec) => {
    const setLbl = () => { if (hudStatus && hudLabels[sec.id]) hudStatus.textContent = hudLabels[sec.id]; };
    ScrollTrigger.create({ trigger: sec, start: 'top 55%', end: 'bottom 55%', onEnter: setLbl, onEnterBack: setLbl });
  });

  /* El HUD solo acompaña a las dos primeras secciones (inicio y servicios);
     al llegar a "Nosotros" se apaga y vuelve al subir. */
  if (hudEl && document.getElementById('nosotros')) {
    ScrollTrigger.create({
      trigger: '#nosotros',
      start: 'top 65%',
      end: 'max',
      onToggle: (self) => hudEl.classList.toggle('hud--off', self.isActive)
    });
  }

  /* Typewriter de coordenadas GPS del hero */
  const geoEl = document.getElementById('geoCoords');
  const typeGeo = () => {
    if (!geoEl || geoEl.dataset.typed) return;
    geoEl.dataset.typed = '1';
    const fullHTML = geoEl.innerHTML;
    const plain = geoEl.textContent;
    geoEl.textContent = '';
    let i = 0;
    const step = () => {
      geoEl.textContent = plain.slice(0, i);
      i++;
      if (i <= plain.length) setTimeout(step, 22);
      else geoEl.innerHTML = fullHTML; // restaura el resaltado <b>
    };
    step();
  };

  /* Reloj en vivo del monitor del hero (barra inferior + cada cámara) */
  const heroClock = document.getElementById('heroClock');
  const nvrClocks = document.querySelectorAll('.js-nvr-clock');
  const nvrDate = document.querySelector('.js-nvr-date');
  if (heroClock || nvrClocks.length) {
    const pad = (n) => String(n).padStart(2, '0');
    const tickClock = () => {
      const t = new Date();
      const hhmmss = `${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}`;
      if (heroClock) heroClock.textContent = hhmmss;
      nvrClocks.forEach((el) => { el.textContent = hhmmss; });
      if (nvrDate) nvrDate.textContent = t.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };
    tickClock();
    setInterval(tickClock, 1000);
  }

  /* Alerta de movimiento en CAM 02 cada algunos segundos */
  const motionFeed = document.querySelector('.hero__feed--motion');
  if (motionFeed && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setInterval(() => {
      motionFeed.classList.add('is-motion');
      setTimeout(() => motionFeed.classList.remove('is-motion'), 2600);
    }, 7000);
  }

  /* Carrusel giratorio de servicios del hero (flechas ◀ ▶) */
  const svcImgs = ['camara.webp', 'cerco-sf.webp', 'alarma-sf.webp', 'porton-sf.webp', 'mantenimiento-sf.webp']
    .map((f) => 'assets/img/' + f);
  const slotL = document.querySelector('.hero__svc-slot--left img');
  const slotR = document.querySelector('.hero__svc-slot--right img');
  const ghostL = document.getElementById('svcGhostL');
  const ghostR = document.getElementById('svcGhostR');
  if (slotL && slotR) {
    let svcIdx = 0;
    const n = svcImgs.length;
    const renderSvc = () => {
      slotL.src = svcImgs[svcIdx];
      slotR.src = svcImgs[(svcIdx + 1) % n];
      if (ghostL) ghostL.src = svcImgs[(svcIdx - 1 + n) % n];   // planeta que precede (izq, borroso)
      if (ghostR) ghostR.src = svcImgs[(svcIdx + 2) % n];        // planeta que sigue (der, borroso)
    };
    const orbit = (el, cls) => {
      el.classList.remove('orbit-up', 'orbit-down');
      void el.offsetWidth;             // reinicia la animación
      el.classList.add(cls);
    };
    const spinSvc = (dir) => {
      svcIdx = (svcIdx + dir + n) % n;
      // Giro orbital: sentido horario (next) → izq baja, der sube; y viceversa
      orbit(slotL.closest('.hero__svc-slot'), dir === 1 ? 'orbit-down' : 'orbit-up');
      orbit(slotR.closest('.hero__svc-slot'), dir === 1 ? 'orbit-up' : 'orbit-down');
      setTimeout(renderSvc, 255);      // cambia la imagen a mitad del recorrido
    };
    const prev = document.getElementById('svcPrev');
    const next = document.getElementById('svcNext');
    if (prev) prev.addEventListener('click', () => spinSvc(-1));
    if (next) next.addEventListener('click', () => spinSvc(1));
    renderSvc();
  }

  if (window.matchMedia('(max-width: 768px)').matches) {
    const mMon   = document.querySelector('.hero__monitor');
    const mL     = document.querySelector('.hero__svc-slot--left');
    const mR     = document.querySelector('.hero__svc-slot--right');
    const mTitle = document.querySelector('.hero__title');
    const mSub   = document.querySelector('.hero__subtitle');
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    let rafPending = false;
    const animHeroScroll = () => {
      rafPending = false;
      const p = clamp((window.pageYOffset || document.documentElement.scrollTop || 0) / 460, 0, 1);
      if (mMon)   mMon.style.transform = 'perspective(820px) translateY(' + (p * -24) + 'px) scale(' + (1 - p * 0.05) + ') rotateX(' + (p * 8) + 'deg)';
      if (mL)   { mL.style.transform = 'translate(' + (p * -52) + 'px,' + (p * 26) + 'px) rotate(' + (p * -16) + 'deg)'; mL.style.opacity = String(1 - p * 0.9); }
      if (mR)   { mR.style.transform = 'translate(' + (p * 52) + 'px,' + (p * 26) + 'px) rotate(' + (p * 16) + 'deg)'; mR.style.opacity = String(1 - p * 0.9); }
      if (mTitle) mTitle.style.transform = 'translateY(' + (p * -14) + 'px)';
      if (mSub)   mSub.style.opacity = String(1 - p * 0.5);
    };
    const onHeroScroll = () => {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(animHeroScroll);
    };
    window.addEventListener('scroll', onHeroScroll, { passive: true });
    window.addEventListener('resize', onHeroScroll, { passive: true });
    animHeroScroll();
  }

  const heroTextTl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out', duration: 0.9 } });
  heroTextTl
    .to('.hero__geo',      { opacity: 1, y: 0 })
    .to('.hero__title',    { opacity: 1, y: 0 }, '-=0.62')
    .to('.hero__subtitle', { opacity: 1, y: 0 }, '-=0.64')
    .to('.hero__ctas',     { opacity: 1, y: 0 }, '-=0.66')
    .to('.hero__trust',    { opacity: 1, y: 0 }, '-=0.66');

  const revealHeroVisual = (quick) => gsap.to('.hero__visual', {
    opacity: 1, scale: 1, duration: quick ? 0.6 : 1.1, ease: 'power3.out'
  });

  /* Usamos gsap.matchMedia para limitar efectos por viewport */
  const mm = gsap.matchMedia();

  /* Parallax de scroll en el fondo*/
  mm.add('(min-width: 769px)', () => {
    const stOpts = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
    gsap.to('.hero__blob--1',      { yPercent: 28,  ease: 'none', scrollTrigger: stOpts });
    gsap.to('.hero__blob--2',      { yPercent: -22, ease: 'none', scrollTrigger: stOpts });
    gsap.to('.hero__grid-pattern', { yPercent: 14,  ease: 'none', scrollTrigger: stOpts });
    gsap.to('.hero__text',         { yPercent: -8,  opacity: 0.55, ease: 'none', scrollTrigger: stOpts });
  });

  mm.add('(min-width: 1025px) and (pointer: fine)', () => {
    const visual = document.querySelector('.hero__visual');
    const blob1 = document.querySelector('.hero__blob--1');
    const blob2 = document.querySelector('.hero__blob--2');
    const vx = gsap.quickTo(visual, 'x', { duration: 0.7, ease: 'power3.out' });
    const vy = gsap.quickTo(visual, 'y', { duration: 0.7, ease: 'power3.out' });
    const b1x = gsap.quickTo(blob1, 'xPercent', { duration: 1.0, ease: 'power3.out' });
    const b2x = gsap.quickTo(blob2, 'xPercent', { duration: 1.0, ease: 'power3.out' });

    const onMove = (e) => {
      const cx = (e.clientX / window.innerWidth) - 0.5;
      const cy = (e.clientY / window.innerHeight) - 0.5;
      vx(cx * 30); vy(cy * 22);
      b1x(cx * -6); b2x(cx * 6);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  });

  const groupSelectors = [
    '.quick-services__grid .fade-in',
    '.sectors__grid .fade-in',
    '.services__grid .fade-in',
    '.gallery__grid .fade-in',
    '.pools__features .fade-in'
  ];

  const grouped = new Set();
  groupSelectors.forEach(sel => {
    const items = gsap.utils.toArray(sel);
    items.forEach(el => grouped.add(el));
    ScrollTrigger.batch(items, {
      start: 'top 86%',
      onEnter: (batch) => gsap.to(batch, {
        opacity: 1, y: 0, scale: 1,
        duration: 0.7, ease: 'power3.out', stagger: 0.09, overwrite: 'auto'
      })
    });
  });

  gsap.utils.toArray('.fade-in').forEach(el => {
    if (grouped.has(el)) return;
    if (el.classList.contains('section-header')) {
      gsap.fromTo(el,
        { opacity: 0, y: 50, filter: 'blur(12px)' },
        {
          opacity: 1, y: 0, filter: 'blur(0px)', ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 92%', end: 'top 56%', scrub: true }
        }
      );
    } else {
      gsap.to(el, {
        opacity: 1, y: 0,
        duration: 0.85, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    }
  });

  gsap.utils.toArray('.why__stat-num').forEach(el => {
    const raw = el.textContent.trim();
    const match = raw.match(/^(\D*)(\d+)(\D*)$/);
    if (!match) return;
    const prefix = match[1], end = parseInt(match[2], 10), suffix = match[3];
    const counter = { v: 0 };
    el.textContent = prefix + '0' + suffix; // estado inicial (oculto aún)
    ScrollTrigger.create({
      trigger: '.why__stats',
      start: 'top 80%',
      once: true,
      onEnter: () => gsap.to(counter, {
        v: end, duration: 1.6, ease: 'power2.out',
        onUpdate: () => { el.textContent = prefix + Math.round(counter.v) + suffix; }
      })
    });
  });

  mm.add('(min-width: 769px)', () => {
    gsap.fromTo('.pools__hero',
      { yPercent: 6 },
      {
        yPercent: -6, ease: 'none',
        scrollTrigger: { trigger: '.pools', start: 'top bottom', end: 'top top', scrub: true }
      }
    );
  });

  const poolSteps = gsap.utils.toArray('.pools__step');
  if (poolSteps.length) {
    const poolImgs = poolSteps.map(s => s.querySelector('img'));
    const stepNumEl = document.getElementById('poolStepNum');
    const stepDenomEl = document.getElementById('poolStepDenom');
    const stepTitleEl = document.getElementById('poolStepTitle');
    const stepDescEl = document.getElementById('poolStepDesc');
    const stepTagEl = document.getElementById('poolStepTag');
    const progressItems = gsap.utils.toArray('#poolsProgress .pools__progress-item');
    const N = poolSteps.length;
    let lastIdx = -1;

    const setPoolStep = (idx) => {
      poolSteps.forEach((s, i) => s.classList.toggle('is-active', i === idx));
      progressItems.forEach((p, i) => p.classList.toggle('is-active', i === idx));
      const active = poolSteps[idx];
      if (!active) return;
      const isOther = active.getAttribute('data-variant') === 'otro';
      if (stepNumEl) stepNumEl.textContent = active.getAttribute('data-num');
      if (stepDenomEl) stepDenomEl.textContent = isOther ? ' · OTRO' : ' / 04';
      if (stepTitleEl) stepTitleEl.textContent = active.getAttribute('data-title');
      if (stepTagEl) stepTagEl.textContent = active.getAttribute('data-tag') || 'Proceso · En obra';
      const img = active.querySelector('img');
      if (stepDescEl && img) stepDescEl.textContent = img.getAttribute('data-description');
    };

    mm.add('(min-width: 769px)', () => {
      lastIdx = -1;
      const render = (p) => {
        const pos = p * (N - 1);
        const k = Math.min(N - 2, Math.floor(pos));
        const blend = Math.min(1, Math.max(0, pos - k));
        poolSteps.forEach((s, i) => {
          let o = 0, sc = 1.06;
          if (i === k) { o = 1 - blend; sc = 1 + 0.06 * blend; }
          else if (i === k + 1) { o = blend; sc = 1.08 - 0.08 * blend; }
          gsap.set(s, { opacity: o });
          gsap.set(poolImgs[i], { scale: sc });
        });
        const idx = Math.round(pos);
        if (idx !== lastIdx) {
          lastIdx = idx;
          setPoolStep(idx);
          gsap.fromTo('.pools__readout-fx',
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', overwrite: true });
        }
      };

      const st = ScrollTrigger.create({
        trigger: '#poolsProcess',
        start: 'top top',
        end: '+=' + (N * 80) + '%',
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        refreshPriority: 1, // pin posterior: recalcula después del lente
        onUpdate: (self) => render(self.progress),
        onRefresh: (self) => render(self.progress),
        onEnter: () => hudFocus(true),
        onEnterBack: () => hudFocus(true),
        onLeave: () => hudFocus(false),
        onLeaveBack: () => hudFocus(false)
      });
      render(0);

      return () => {
        st.kill();
        hudFocus(false);
        gsap.set(poolSteps, { clearProps: 'opacity' });
        gsap.set(poolImgs, { clearProps: 'transform' });
        poolSteps.forEach(s => s.classList.remove('is-active'));
      };
    });

    /* --- MÓVIL: pasos apilados, revelado simple --- */
    mm.add('(max-width: 768px)', () => {
      const tweens = poolSteps.map(step => gsap.fromTo(step,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: step, start: 'top 85%' }
        }
      ));
      return () => { tweens.forEach(t => t.scrollTrigger && t.scrollTrigger.kill()); gsap.set(poolSteps, { clearProps: 'opacity,transform' }); };
    });
  }

  const svcEls = gsap.utils.toArray('.svc-lens');
  if (svcEls.length) {
    const svcNameEl = document.getElementById('svcName');
    const lensProgItems = gsap.utils.toArray('#lensProgress .lens__progress-item');
    const lensFocus = document.querySelector('.lens__focus');
    const lensGlint = document.querySelector('.lens__glint');
    const ring1 = document.querySelector('.lens__ring--1');
    const ring2 = document.querySelector('.lens__ring--2');
    const iris = document.querySelector('.lens__iris');
    const NS = svcEls.length;
    let lastS = -1;

    const setSvc = (idx) => {
      svcEls.forEach((el, i) => el.classList.toggle('is-active', i === idx));
      lensProgItems.forEach((p, i) => p.classList.toggle('is-active', i === idx));
      const name = svcEls[idx] ? svcEls[idx].getAttribute('data-name') : '';
      if (svcNameEl) svcNameEl.textContent = 'SERVICIO 0' + (idx + 1) + ' · ' + name.toUpperCase();
      if (hudEl) { hudEl.classList.add('hud--snap'); setTimeout(() => hudEl.classList.remove('hud--snap'), 240); }
    };

    mm.add('(min-width: 769px)', () => {
      lastS = -1;
      const render = (p) => {
        const seg = Math.min(NS - 1, Math.floor(p * NS));
        const t = Math.min(1, Math.max(0, p * NS - seg));
        // Curva de foco: 0 = abierto/borroso, 1 = bloqueado/nítido
        let f;
        if (t < 0.4) f = t / 0.4;
        else if (t < 0.72) f = 1;
        else f = (seg === NS - 1) ? 1 : 1 - (t - 0.72) / 0.28; // el último servicio queda fijado
        f = Math.min(1, Math.max(0, f));

        svcEls.forEach((el, i) => {
          if (i === seg) {
            gsap.set(el, { opacity: f, filter: 'blur(' + ((1 - f) * 14).toFixed(2) + 'px)', y: (1 - f) * 22 });
          } else {
            gsap.set(el, { opacity: 0, filter: 'blur(0px)', y: 0 });
          }
        });

        let fscale = 1 + (1 - f) * 0.42;
        if (t > 0.38 && t < 0.52) fscale *= 1 + 0.05 * Math.sin((t - 0.38) / 0.14 * Math.PI);
        if (lensFocus) gsap.set(lensFocus, { scale: fscale, opacity: 0.3 + f * 0.7 });

        let glintO = 0;
        if (t > 0.34 && t < 0.54) glintO = Math.sin((t - 0.34) / 0.2 * Math.PI) * 0.85;
        if (lensGlint) gsap.set(lensGlint, { opacity: glintO });

        // Rotación de anillos atada al progreso
        if (ring1) gsap.set(ring1, { rotation: p * 540 });
        if (ring2) gsap.set(ring2, { rotation: -p * 320 });
        if (iris) gsap.set(iris, { rotation: p * 300, scale: 0.96 + f * 0.04 });

        if (seg !== lastS) { lastS = seg; setSvc(seg); }
      };

      const st = ScrollTrigger.create({
        trigger: '#lensScene',
        start: 'top top',
        end: '+=' + (NS * 82) + '%',
        pin: true, scrub: 1, anticipatePin: 1,
        refreshPriority: 2, // está más arriba: recalcula antes que el pin de piscinas
        onUpdate: (self) => render(self.progress),
        onRefresh: (self) => render(self.progress),
        onEnter: () => hudFocus(true),
        onEnterBack: () => hudFocus(true),
        onLeave: () => hudFocus(false),
        onLeaveBack: () => hudFocus(false)
      });
      render(0);

      return () => {
        st.kill(); hudFocus(false);
        gsap.set(svcEls, { clearProps: 'opacity,filter,transform' });
        [lensFocus, lensGlint, ring1, ring2, iris].forEach(el => el && gsap.set(el, { clearProps: 'transform,opacity' }));
        svcEls.forEach(e => e.classList.remove('is-active'));
      };
    });

    /* --- MÓVIL tarjetas con enfoque simple --- */
    mm.add('(max-width: 768px)', () => {
      const tws = svcEls.map(el => gsap.fromTo(el,
        { opacity: 0, scale: 0.94, filter: 'blur(10px)' },
        {
          opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 86%' }
        }
      ));
      return () => { tws.forEach(t => t.scrollTrigger && t.scrollTrigger.kill()); gsap.set(svcEls, { clearProps: 'opacity,transform,filter' }); };
    });
  }

  const introEl = document.getElementById('intro');
  const shouldPlayIntro = document.documentElement.classList.contains('intro-play') && !!introEl;

  const startHeroDirect = () => {
    revealHeroVisual(false);
    heroTextTl.play(0);
    revealHUD();
    typeGeo();
  };

  const finishIntro = () => {
    try { sessionStorage.setItem('setrof_intro_played', '1'); } catch (e) {}
    document.documentElement.classList.remove('intro-play');
    document.body.style.overflow = '';
    if (introEl) introEl.style.display = 'none';
    if (lenis) lenis.start();
    ScrollTrigger.refresh();
  };

  const runIntro = () => {
    try {
      window.scrollTo(0, 0);
      if (lenis) lenis.stop();

      const introCam = document.getElementById('introCamera');
      const heroVisual = document.querySelector('.hero__visual');
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      gsap.set(heroVisual, { scale: 1 });

      let done = false;
      const endNow = () => {
        if (done) return; done = true;
        removeSkip();
        finishIntro();
        heroTextTl.play(0);
        typeGeo();
      };

      const tl = gsap.timeline({ onComplete: endNow });

      /* --- Entrada de la escena (compartida) --- */
      tl.fromTo('.intro__ring', { scale: 0.2, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.5, stagger: 0.16, ease: 'power2.out' })
        .fromTo('.intro__glow', { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 1.5, ease: 'power2.out' }, 0.1)
        .fromTo(introCam,       { opacity: 0, scale: 0.8, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 1.4, ease: 'power3.out' }, 0.3)
        .fromTo('.intro__char', { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.05, stagger: 0.085, ease: 'power4.out' }, 0.65)
        .fromTo('.intro__sub',  { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.85 }, '-=0.45')
        .fromTo('.intro__tag',  { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.85 }, '-=0.55')
        .fromTo('.intro__skip', { opacity: 0 }, { opacity: 1, duration: 0.6 }, '-=0.45')
        .to({}, { duration: isMobile ? 1.7 : 2.2 }); // sostener

      tl.addLabel('exit');

      if (isMobile) {
        /* --- Salida MÓVIL: zoom cinematográfico de la cámara + fundido al hero
               (sin morph, robusto en teléfonos) --- */
        tl.to('.intro__skip',  { opacity: 0, duration: 0.3 }, 'exit')
          .to('.intro__brand', { opacity: 0, y: -28, duration: 0.6, ease: 'power2.in' }, 'exit')
          .to('.intro__rings', { scale: 1.9, opacity: 0, duration: 1.0, ease: 'power2.in' }, 'exit')
          .to('.intro__glow',  { scale: 1.7, opacity: 0, duration: 1.0, ease: 'power2.in' }, 'exit')
          .to(introCam,        { scale: 1.8, y: -6, duration: 1.05, ease: 'power2.in' }, 'exit')
          .to(heroVisual,      { opacity: 1, duration: 0.6, ease: 'power2.out' }, 'exit+=0.6')
          .call(revealHUD, null, 'exit+=0.6')
          .to('.intro',        { opacity: 0, duration: 0.65, ease: 'power2.inOut' }, 'exit+=0.72');
      } else {
        /* --- Salida ESCRITORIO: morph de la cámara hacia el hero --- */
        const heroCam = document.querySelector('.hero__camera');
        const ir = introCam.getBoundingClientRect();
        const hr = heroCam.getBoundingClientRect();
        const scaleTarget = (ir.width ? hr.width / ir.width : 1) || 1;
        const dx = (hr.left + hr.width / 2) - (ir.left + ir.width / 2);
        const dy = (hr.top + hr.height / 2) - (ir.top + ir.height / 2);
        tl.to('.intro__brand', { opacity: 0, y: -36, duration: 0.6, ease: 'power2.in' }, 'exit')
          .to('.intro__rings', { opacity: 0, duration: 0.6 }, 'exit')
          .to('.intro__glow',  { opacity: 0, duration: 0.6 }, 'exit')
          .to('.intro__skip',  { opacity: 0, duration: 0.3 }, 'exit')
          .to(introCam,        { x: dx, y: dy, scale: scaleTarget, duration: 1.3, ease: 'power3.inOut' }, 'exit+=0.15')
          .to('.intro__bg',    { opacity: 0, duration: 0.8 }, 'exit+=0.5')
          .to(heroVisual,      { opacity: 1, duration: 0.6, ease: 'power2.out' }, 'exit+=0.95')
          .call(revealHUD, null, 'exit+=0.95')
          .to(introCam,        { opacity: 0, duration: 0.45, ease: 'power2.out' }, 'exit+=1.1')
          .to('.intro',        { opacity: 0, duration: 0.6, ease: 'power2.inOut' }, 'exit+=1.15');
      }

      const skip = () => { if (!done) tl.progress(1); };
      const onKey = (e) => {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); skip(); }
      };
      /* En pantallas táctiles cualquier roce disparaba touchstart y saltaba
         el intro al instante (y quedaba marcado como visto en la sesión).
         En táctil solo el botón "Saltar intro" lo omite. */
      const isTouch = window.matchMedia('(pointer: coarse)').matches;
      const skipBtn = document.getElementById('introSkip');
      function removeSkip() {
        window.removeEventListener('wheel', skip);
        window.removeEventListener('touchstart', skip);
        introEl.removeEventListener('click', skip);
        if (skipBtn) skipBtn.removeEventListener('click', skip);
        window.removeEventListener('keydown', onKey);
      }
      if (!isTouch) {
        window.addEventListener('wheel', skip, { passive: true, once: true });
        window.addEventListener('touchstart', skip, { passive: true, once: true });
        introEl.addEventListener('click', skip);
      } else if (skipBtn) {
        skipBtn.addEventListener('click', skip);
      }
      window.addEventListener('keydown', onKey);

    } catch (err) {
      finishIntro();
      startHeroDirect();
    }
  };

  if (shouldPlayIntro) {
    runIntro();
  } else {
    if (introEl) introEl.style.display = 'none';
    startHeroDirect();
  }

  window.addEventListener('load', () => ScrollTrigger.refresh());

})();

(function () {
  'use strict';

  var WA_NUM = '56974054542';
  var pad2 = function (n) { return String(n).padStart(2, '0'); };
  var waLink = function (texto) {
    return 'https://wa.me/' + WA_NUM + '?text=' + encodeURIComponent(texto);
  };

  (function () {
    var tk = document.getElementById('heroTicker');
    if (!tk) return;
    var msgs = [
      'Protección integral 24/7',
      'Evento verificado · CAM 02',
      'Sirena activada en 2 s',
      'Cliente notificado en 4 s',
      'Cerco perimetral · OK',
      'Respaldo de video en la nube'
    ];
    var i = 0;
    setInterval(function () {
      i = (i + 1) % msgs.length;
      tk.classList.add('is-fade');
      setTimeout(function () {
        tk.textContent = msgs[i];
        tk.classList.remove('is-fade');
      }, 350);
    }, 3600);
  })();


  /* Teléfono de la sección Nosotros: las alertas del sistema llegan en bucle */
  (function () {
    var phone = document.getElementById('aboutPhone');
    var notifs = document.getElementById('aboutNotifs');
    if (!phone || !notifs) return;

    var ckBig = document.getElementById('phoneClock');
    var ckSm = document.getElementById('phoneClockSm');
    var dateEl = document.getElementById('phoneDate');

    /* Reloj y fecha reales en el teléfono */
    var tickPhone = function () {
      var d = new Date();
      var hm = pad2(d.getHours()) + ':' + pad2(d.getMinutes());
      if (ckBig) ckBig.textContent = hm;
      if (ckSm) ckSm.textContent = hm;
      if (dateEl) dateEl.textContent = d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
    };
    tickPhone();
    setInterval(tickPhone, 15000);

    var buildNotif = function (opts) {
      var n = document.createElement('div');
      n.className = 'pnotif' + (opts.mod ? ' ' + opts.mod : '');
      n.innerHTML =
        '<span class="pnotif__icon"><i class="' + opts.icon + '" aria-hidden="true"></i></span>' +
        '<span class="pnotif__body">' +
          '<span class="pnotif__app">SETROF Seguridad · ahora</span>' +
          '<b class="pnotif__title">' + opts.title + '</b>' +
          '<span class="pnotif__sub">' + opts.sub + '</span>' +
        '</span>' +
        (opts.thumb ? '<img class="pnotif__thumb" src="' + opts.thumb + '" alt="" loading="lazy">' : '');
      return n;
    };

    /* Secuencia de eventos del sistema; se repite en bucle */
    var FEED = [
      { mod: 'pnotif--alert', icon: 'fa-solid fa-triangle-exclamation', title: 'Movimiento detectado', sub: 'CAM 02 · Muro Norte', thumb: 'assets/img/proyecto-3.webp', buzz: true },
      { mod: 'pnotif--rec', icon: 'fa-solid fa-video', title: 'Grabando evento', sub: 'Clip guardado en el sistema' },
      { icon: 'fa-solid fa-shield-halved', title: 'Sistema armado', sub: 'Todos los sensores en línea' },
      { mod: 'pnotif--alert', icon: 'fa-solid fa-bolt', title: 'Cerco perimetral', sub: 'Pulso verificado · Sector Sur', buzz: true },
      { mod: 'pnotif--rec', icon: 'fa-solid fa-circle-check', title: 'Evento verificado', sub: 'Sin novedad · CAM 04' },
      { icon: 'fa-solid fa-warehouse', title: 'Portón cerrado', sub: 'Acceso principal asegurado' }
    ];

    var idx = 0;
    var push = function () {
      var opts = FEED[idx % FEED.length];
      idx++;
      notifs.insertBefore(buildNotif(opts), notifs.firstChild);
      while (notifs.children.length > 3) notifs.removeChild(notifs.lastChild);
      if (opts.buzz) {
        phone.classList.add('is-buzz');
        setTimeout(function () { phone.classList.remove('is-buzz'); }, 600);
      }
    };

    /* Con movimiento reducido: tres notificaciones estáticas, sin bucle */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      push(); push(); push();
      return;
    }

    /* El bucle solo corre mientras el teléfono está en pantalla */
    var timer = null;
    var start = function () { if (!timer) { push(); timer = setInterval(push, 3400); } };
    var stop = function () { if (timer) { clearInterval(timer); timer = null; } };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) start(); else stop(); });
      }, { threshold: 0.25 }).observe(phone);
    } else {
      start();
    }
  })();

  (function () {
    var list = document.getElementById('bTicketList');
    if (!list) return;

    var chips = Array.prototype.slice.call(document.querySelectorAll('#bProp .builder__chip'));
    var camNum = document.getElementById('bCamNum');
    var camHint = document.getElementById('bCamHint');
    var camMinus = document.getElementById('bCamMinus');
    var camPlus = document.getElementById('bCamPlus');
    var cerco = document.getElementById('bCerco');
    var cercoOut = document.getElementById('bCercoOut');
    var toggles = Array.prototype.slice.call(document.querySelectorAll('.builder__switch input'));
    var ticketProp = document.getElementById('bTicketProp');
    var emptyMsg = document.getElementById('bTicketEmpty');
    var waBtn = document.getElementById('bWa');

    var prop = 'Casa';
    var cams = 0;

    var camHints = function (n) {
      if (n === 0) return 'Sin cámaras';
      if (n <= 3) return 'Cobertura básica';
      if (n <= 7) return 'Cobertura completa';
      return 'Proyecto grande';
    };

    var render = function () {
      var items = [];
      if (cams > 0) items.push(cams + (cams === 1 ? ' cámara' : ' cámaras') + ' de seguridad');
      var m = cerco ? parseInt(cerco.value, 10) : 0;
      if (m > 0) items.push('≈ ' + m + ' m de cerco eléctrico');
      toggles.forEach(function (t) {
        if (t.checked) items.push(t.getAttribute('data-item'));
      });

      if (ticketProp) ticketProp.textContent = prop;
      list.innerHTML = items.map(function (i) {
        return '<li><i class="fa-solid fa-check" aria-hidden="true"></i> ' + i + '</li>';
      }).join('');
      if (emptyMsg) emptyMsg.hidden = items.length > 0;

      var ok = items.length > 0;
      if (waBtn) {
        waBtn.classList.toggle('is-disabled', !ok);
        waBtn.setAttribute('aria-disabled', String(!ok));
        if (ok) {
          var msg = '¡Hola SETROF! Armé mi sistema en el sitio web:\n\n' +
            '• Propiedad: ' + prop + '\n' +
            items.map(function (i) { return '• ' + i; }).join('\n') +
            '\n\nQuiero coordinar una *visita técnica gratis* para la pre-cotización (sin compromiso).';
          waBtn.href = waLink(msg);
        } else {
          waBtn.removeAttribute('href');
        }
      }
    };

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('is-on'); });
        chip.classList.add('is-on');
        prop = chip.getAttribute('data-val') || 'Casa';
        render();
      });
    });

    var setCams = function (n) {
      cams = Math.max(0, Math.min(16, n));
      if (camNum) camNum.textContent = pad2(cams);
      if (camHint) camHint.textContent = camHints(cams);
      render();
    };
    if (camMinus) camMinus.addEventListener('click', function () { setCams(cams - 1); });
    if (camPlus) camPlus.addEventListener('click', function () { setCams(cams + 1); });

    if (cerco) cerco.addEventListener('input', function () {
      if (cercoOut) cercoOut.textContent = cerco.value + ' m';
      render();
    });

    toggles.forEach(function (t) { t.addEventListener('change', render); });

    render();
  })();

  /* 4.1 Cuenta regresiva al verano (21 de diciembre) */
  (function () {
    var daysEl = document.getElementById('ppCountDays');
    var wrap = document.getElementById('ppCount');
    if (!daysEl || !wrap) return;
    var now = new Date();
    var target = new Date(now.getFullYear(), 11, 21);
    if (target - now <= 0) target = new Date(now.getFullYear() + 1, 11, 21);
    daysEl.textContent = Math.ceil((target - now) / 86400000);
    wrap.hidden = false;
  })();

  /* 4.2 Timeline de semanas: se llena al entrar en pantalla */
  (function () {
    var wk = document.getElementById('ppWeeks');
    if (!wk) return;
    if (!('IntersectionObserver' in window)) { wk.classList.add('is-in'); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { wk.classList.add('is-in'); io.disconnect(); }
      });
    }, { threshold: 0.35 });
    io.observe(wk);
  })();

  /* 4.3 Ondas de agua al hacer clic/tocar el hero */
  (function () {
    var hero = document.querySelector('.pp-hero');
    if (!hero) return;
    hero.addEventListener('pointerdown', function (e) {
      if (e.target.closest('a, button')) return;
      var r = document.createElement('span');
      r.className = 'pp-ripple';
      var rect = hero.getBoundingClientRect();
      r.style.left = (e.clientX - rect.left) + 'px';
      r.style.top = (e.clientY - rect.top) + 'px';
      hero.appendChild(r);
      setTimeout(function () { r.remove(); }, 1500);
    });
  })();

  /* 4.4 "Arma tu piscina" — pre-cotizador sin precios */
  (function () {
    var list = document.getElementById('pbTicketList');
    if (!list) return;

    var formaChips = Array.prototype.slice.call(document.querySelectorAll('#pbForma .builder__chip'));
    var sizeChips = Array.prototype.slice.call(document.querySelectorAll('#pbSize .builder__chip'));
    var extras = Array.prototype.slice.call(document.querySelectorAll('#pbExtras input'));
    var ticketProp = document.getElementById('pbTicketProp');
    var emptyMsg = document.getElementById('pbTicketEmpty');
    var waBtn = document.getElementById('pbWa');

    var forma = 'Rectangular';
    var size = '3×6 m';

    var render = function () {
      var items = [];
      extras.forEach(function (t) {
        if (t.checked) items.push(t.getAttribute('data-item'));
      });

      if (ticketProp) ticketProp.textContent = forma + ' · ' + size;
      list.innerHTML = items.map(function (i) {
        return '<li><i class="fa-solid fa-check" aria-hidden="true"></i> ' + i + '</li>';
      }).join('');
      if (emptyMsg) emptyMsg.hidden = items.length > 0;

      if (waBtn) {
        var msg = '¡Hola SETROF! Armé mi piscina en el sitio web:\n\n' +
          '• Forma: ' + forma + '\n' +
          '• Tamaño: ' + size +
          (items.length ? '\n' + items.map(function (i) { return '• ' + i; }).join('\n') : '') +
          '\n\nQuiero coordinar una *visita técnica gratis* para la cotización (sin compromiso).';
        waBtn.href = waLink(msg);
      }
    };

    var wireChips = function (chips, setVal) {
      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          chips.forEach(function (c) { c.classList.remove('is-on'); });
          chip.classList.add('is-on');
          setVal(chip.getAttribute('data-val'));
          render();
        });
      });
    };
    wireChips(formaChips, function (v) { forma = v || 'Rectangular'; });
    wireChips(sizeChips, function (v) { size = v || '3×6 m'; });

    extras.forEach(function (t) { t.addEventListener('change', render); });

    render();
  })();

})();
