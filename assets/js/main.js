/*
  SETROF SEGURIDAD - main.js
  Animaciones (GSAP + ScrollTrigger + Lenis): intro cinematografico,
  HUD del visor, lente de servicios, secuencia de piscinas y reveals.
  Degradacion elegante: sin GSAP o con prefers-reduced-motion, el
  contenido queda visible (ver la clase .anim-ready en el <head>).
*/

(function () {
  'use strict';

  /* =========================================================
     1) LÓGICA BASE — sin dependencia de GSAP
     (funciona aunque el CDN falle o haya reduced-motion)
  ========================================================= */
  const header = document.getElementById('header');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lenis = null; // se asigna más abajo si procede

  /* ---- Header: compactado al hacer scroll ---- */
  const onScroll = () => header.classList.toggle('header--scrolled', window.scrollY > 60);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- Menú mobile ---- */
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

  /* ---- Link activo en nav ---- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link:not(.nav__link--cta)');
  const setActive = () => {
    let current = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 130) current = s.id; });
    navLinks.forEach(l => l.classList.toggle('nav__link--active', l.getAttribute('href') === `#${current}`));
  };
  setActive();
  window.addEventListener('scroll', setActive, { passive: true });

  /* ---- Formulario: abre WhatsApp (lógica intacta) ---- */
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

  /* ---- Lightbox para Piscinas (intacto + pausa de Lenis) ---- */
  const poolModal = document.getElementById('poolModal');
  const modalImg = document.getElementById('modalImg');
  const modalText = document.getElementById('modalText');
  const closeModal = document.querySelector('.pool-modal__close');

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


  /* =========================================================
     2) GUARDA DE ANIMACIONES
     Si no hay GSAP (CDN caído) o el usuario pide menos
     movimiento: revelamos todo y salimos.
  ========================================================= */
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);
  if (prefersReduced || !hasGSAP) {
    document.documentElement.classList.remove('anim-ready', 'intro-play'); // todo visible
    document.body.style.overflow = '';
    const introFallback = document.getElementById('intro');
    if (introFallback) introFallback.style.display = 'none';
    const hudFallback = document.getElementById('hud');
    if (hudFallback) hudFallback.classList.add('is-on'); // visor estático
    return;
  }

  gsap.registerPlugin(ScrollTrigger);


  /* =========================================================
     3) LENIS — smooth scroll (solo desktop con rueda;
     táctil usa scroll nativo para evitar lag en móvil)
  ========================================================= */
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


  /* =========================================================
     3.5) HUD DEL VISOR — timestamp, estado por sección, helpers
  ========================================================= */
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
    inicio: 'SECTOR 01 · INICIO', nosotros: 'SECTOR 02 · NOSOTROS',
    servicios: 'SECTOR 03 · SERVICIOS', sectores: 'SECTOR 04 · SECTORES',
    'por-que': 'SECTOR 05 · CONFIANZA', piscinas: 'SECTOR 06 · PISCINAS',
    galeria: 'SECTOR 07 · GALERÍA', contacto: 'SECTOR 08 · CONTACTO'
  };
  sections.forEach((sec) => {
    const setLbl = () => { if (hudStatus && hudLabels[sec.id]) hudStatus.textContent = hudLabels[sec.id]; };
    ScrollTrigger.create({ trigger: sec, start: 'top 55%', end: 'bottom 55%', onEnter: setLbl, onEnterBack: setLbl });
  });

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


  /* =========================================================
     4) HERO — entrada escalonada (timeline en pausa; se dispara
     tras el intro, o de inmediato si el intro no se reproduce)
  ========================================================= */
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

  /* Usamos gsap.matchMedia para limitar efectos por viewport / puntero */
  const mm = gsap.matchMedia();

  /* Parallax de scroll en el fondo del hero (tablet/desktop) */
  mm.add('(min-width: 769px)', () => {
    const stOpts = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
    gsap.to('.hero__blob--1',      { yPercent: 28,  ease: 'none', scrollTrigger: stOpts });
    gsap.to('.hero__blob--2',      { yPercent: -22, ease: 'none', scrollTrigger: stOpts });
    gsap.to('.hero__grid-pattern', { yPercent: 14,  ease: 'none', scrollTrigger: stOpts });
    gsap.to('.hero__text',         { yPercent: -8,  opacity: 0.55, ease: 'none', scrollTrigger: stOpts });
  });

  /* Parallax de mouse — solo desktop con puntero fino */
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


  /* =========================================================
     5) REVEALS — tarjetas en stagger + elementos sueltos
  ========================================================= */
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

  /* Resto de .fade-in. Los encabezados se "reenfocan" con el scroll
     (blur atado al progreso = sensación de cámara/video). */
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


  /* =========================================================
     6) CONTADORES de estadísticas (+10 / +500 / 100%)
  ========================================================= */
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


  /* =========================================================
     7) PISCINAS — parallax cinematográfico del encabezado
  ========================================================= */
  mm.add('(min-width: 769px)', () => {
    gsap.fromTo('.pools__hero',
      { yPercent: 6 },
      {
        yPercent: -6, ease: 'none',
        scrollTrigger: { trigger: '.pools', start: 'top bottom', end: 'top top', scrub: true }
      }
    );
  });


  /* =========================================================
     7.5) PISCINAS — secuencia "proceso de construcción"
     Desktop: sección anclada (pin) + crossfade scrubbed paso a paso.
     Móvil: pasos en flujo con revelado simple (sin pin, sin lag).
  ========================================================= */
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

    /* --- DESKTOP / TABLET: pinned crossfade --- */
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


  /* =========================================================
     7.6) SERVICIOS — lente de cámara que enfoca (pin + scrub)
     Desktop/tablet: sección anclada; el lente rota y "bloquea
     el foco" 5 veces, revelando un servicio nítido en cada foco.
     Móvil: tarjetas apiladas con un "enfoque" simple al entrar.
  ========================================================= */
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

    /* --- DESKTOP / TABLET --- */
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

        // Anillo de foco: abierto (grande) cuando f bajo; bloquea en 1 con micro-snap
        let fscale = 1 + (1 - f) * 0.42;
        if (t > 0.38 && t < 0.52) fscale *= 1 + 0.05 * Math.sin((t - 0.38) / 0.14 * Math.PI);
        if (lensFocus) gsap.set(lensFocus, { scale: fscale, opacity: 0.3 + f * 0.7 });

        // Destello al bloquear el foco
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

    /* --- MÓVIL: tarjetas con "enfoque" simple --- */
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


  /* =========================================================
     8) INTRO CINEMATOGRÁFICO + arranque del hero
  ========================================================= */
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
      const heroCam = document.querySelector('.hero__camera');

      /* Medir el destino del morph: dónde y a qué escala queda la
         cámara real del hero (medido a escala final = 1). */
      gsap.set(heroVisual, { scale: 1 });
      const ir = introCam.getBoundingClientRect();
      const hr = heroCam.getBoundingClientRect();
      const scaleTarget = (ir.width ? hr.width / ir.width : 1) || 1;
      const dx = (hr.left + hr.width / 2) - (ir.left + ir.width / 2);
      const dy = (hr.top + hr.height / 2) - (ir.top + ir.height / 2);

      let done = false;
      const endNow = () => {
        if (done) return; done = true;
        removeSkip();
        finishIntro();
        heroTextTl.play(0); // el visual ya quedó revelado por el morph
        typeGeo();
      };

      const tl = gsap.timeline({ onComplete: endNow });

      /* --- Entrada de la escena (fromTo: compatible con el pre-ocultado CSS) --- */
      tl.fromTo('.intro__ring', { scale: 0.2, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.5, stagger: 0.16, ease: 'power2.out' })
        .fromTo('.intro__glow', { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 1.5, ease: 'power2.out' }, 0.1)
        .fromTo(introCam,       { opacity: 0, scale: 0.8, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 1.4, ease: 'power3.out' }, 0.3)
        .fromTo('.intro__char', { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.05, stagger: 0.085, ease: 'power4.out' }, 0.65)
        .fromTo('.intro__sub',  { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.85 }, '-=0.45')
        .fromTo('.intro__tag',  { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.85 }, '-=0.55')
        .fromTo('.intro__skip', { opacity: 0 }, { opacity: 1, duration: 0.6 }, '-=0.45')
        .to({}, { duration: 2.2 }); // sostener (escena centrada respira ~2s)

      /* --- Salida: morph de la cámara hacia el hero + apertura --- */
      tl.addLabel('exit')
        .to('.intro__brand', { opacity: 0, y: -36, duration: 0.6, ease: 'power2.in' }, 'exit')
        .to('.intro__rings', { opacity: 0, duration: 0.6 }, 'exit')
        .to('.intro__glow',  { opacity: 0, duration: 0.6 }, 'exit')
        .to('.intro__skip',  { opacity: 0, duration: 0.3 }, 'exit')
        .to(introCam,        { x: dx, y: dy, scale: scaleTarget, duration: 1.3, ease: 'power3.inOut' }, 'exit+=0.15')
        .to('.intro__bg',    { opacity: 0, duration: 0.8 }, 'exit+=0.5')
        .to(heroVisual,      { opacity: 1, duration: 0.6, ease: 'power2.out' }, 'exit+=0.95')
        .call(revealHUD, null, 'exit+=0.95') // brackets del visor aparecen al revelar el hero
        .to(introCam,        { opacity: 0, duration: 0.45, ease: 'power2.out' }, 'exit+=1.1')
        .to('.intro',        { opacity: 0, duration: 0.6, ease: 'power2.inOut' }, 'exit+=1.15');

      /* --- Saltar intro (click / scroll / tecla) --- */
      const skip = () => { if (!done) tl.progress(1); };
      const onKey = (e) => {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); skip(); }
      };
      function removeSkip() {
        window.removeEventListener('wheel', skip);
        window.removeEventListener('touchstart', skip);
        introEl.removeEventListener('click', skip);
        window.removeEventListener('keydown', onKey);
      }
      window.addEventListener('wheel', skip, { passive: true, once: true });
      window.addEventListener('touchstart', skip, { passive: true, once: true });
      introEl.addEventListener('click', skip);
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


  /* Refresca medidas tras cargar imágenes (evita triggers desfasados) */
  window.addEventListener('load', () => ScrollTrigger.refresh());

})();
