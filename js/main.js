document.addEventListener('DOMContentLoaded', () => {
  const isTouchDevice = matchMedia('(hover: none)').matches;
  const debounce = (fn, ms = 15) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

  // --- Scroll-reveal with staggered children ---
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('revealed');
      e.target.querySelectorAll('[data-delay]').forEach(child => {
        child.style.transitionDelay = child.dataset.delay + 'ms';
        child.classList.add('revealed');
      });
      revealObserver.unobserve(e.target);
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // --- Animated stat counters (only for elements with data-target) ---
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      if (!el.dataset.target) { countObserver.unobserve(el); return; }
      const target = +el.dataset.target, duration = 1500;
      let start = null;
      const step = (ts) => {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        el.textContent = Math.floor(progress * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
      };
      requestAnimationFrame(step);
      countObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat-number[data-target]').forEach(el => countObserver.observe(el));

  // --- Typing effect ---
  document.querySelectorAll('.typing-text').forEach(el => {
    const text = el.textContent;
    el.textContent = '';
    el.style.borderRight = '2px solid var(--primary, #2563eb)';
    let i = 0;
    const type = () => {
      if (i < text.length) { el.textContent += text[i++]; setTimeout(type, 60); }
      else { setInterval(() => { el.style.borderRightColor = el.style.borderRightColor === 'transparent' ? '' : 'transparent'; }, 530); }
    };
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { type(); obs.unobserve(el); } }, { threshold: 0.5 });
    obs.observe(el);
  });

  // --- Smooth navbar: scroll class + active link highlighting ---
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const sections = [...navLinks].map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

  const onScroll = () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 100);
    const scrollPos = window.scrollY + 150;
    let current = '';
    sections.forEach(sec => { if (sec.offsetTop <= scrollPos) current = sec.id; });
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --- Parallax on hero particles (mouse move, desktop only) ---
  if (!isTouchDevice) {
    const particles = document.querySelectorAll('.particle');
    if (particles.length) {
      window.addEventListener('mousemove', debounce((e) => {
        const cx = (e.clientX / innerWidth - 0.5) * 2;
        const cy = (e.clientY / innerHeight - 0.5) * 2;
        particles.forEach(p => {
          const speed = +(p.dataset.speed || 20);
          p.style.transform = `translate(${cx * speed}px, ${cy * speed}px)`;
        });
      }, 10), { passive: true });
    }
  }

  // --- 3D card tilt (desktop only) ---
  if (!isTouchDevice) {
    document.querySelectorAll('.tilt-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - 0.5) * 12;
        const y = ((e.clientY - r.top) / r.height - 0.5) * -12;
        card.style.transform = `perspective(800px) rotateY(${x}deg) rotateX(${y}deg) scale(1.02)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateY(0) rotateX(0) scale(1)';
      });
    });
  }

  // --- Timeline progress line fills on scroll ---
  const timelineProgress = document.querySelector('.timeline-progress');
  if (timelineProgress) {
    const timelineSection = timelineProgress.closest('section') || timelineProgress.parentElement;
    const fillTimeline = () => {
      const rect = timelineSection.getBoundingClientRect();
      const total = timelineSection.scrollHeight;
      const visible = Math.min(Math.max(-rect.top + innerHeight * 0.4, 0), total);
      timelineProgress.style.height = (visible / total * 100) + '%';
    };
    window.addEventListener('scroll', fillTimeline, { passive: true });
    fillTimeline();
  }
});
