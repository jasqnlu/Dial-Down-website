/* Dial Down home page */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const STORE = 'https://apps.apple.com/us/app/dial-down-breathe-and-relax/id6818409674';

  /* ---------- Hero intro + dial ticks ---------- */
  const svg = $('#dialSvg');
  let ticks = '';
  for (let i = 0; i < 90; i++) {
    const a = i / 90 * Math.PI * 2, major = i % 9 === 0;
    const r1 = 372, r2 = major ? 344 : 356;
    const op = (0.15 + 0.6 * (1 - i / 90)).toFixed(2);   // fades round the dial, like a volume arc
    ticks += `<line x1="${380 + r1 * Math.sin(a)}" y1="${380 - r1 * Math.cos(a)}" x2="${380 + r2 * Math.sin(a)}" y2="${380 - r2 * Math.cos(a)}" stroke="#C75F0E" stroke-opacity="${op}" stroke-width="${major ? 3 : 1.5}" stroke-linecap="round"/>`;
  }
  svg.innerHTML = ticks;
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('ready')));

  // tension meter: each area starts high, then gets dialed down (and the dial turns with it)
  const AREAS = [['Neck', 'var(--peach)'], ['Lower back', 'var(--mint)'], ['Shoulders', 'var(--blue)'], ['Jaw', 'var(--lav)'], ['Racing mind', 'var(--yellow)']];
  const bars = $('#meterBars'), num = $('#meterNum'), area = $('#meterArea'), mdot = $('#meterDot');
  for (let i = 0; i < 10; i++) { const b = document.createElement('b'); b.style.height = (30 + i * 7) + '%'; bars.appendChild(b); }
  const barEls = [...bars.children];
  const dialEl = $('#dialInner');
  function setLevel(n, calm) {
    barEls.forEach((b, i) => { b.classList.toggle('lit', !calm && i < n); b.classList.toggle('calm', calm && i < n); });
    num.textContent = n; num.classList.toggle('calm', !!calm);
    dialEl.style.setProperty('--turn', (-(9 - n) * 11) + 'deg');
  }
  if (reduce) { setLevel(2, true); }
  else {
    let ai = 0;
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    (async function loop() {
      await sleep(1400);                       // let the intro land first
      for (;;) {
        const [name, col] = AREAS[ai]; area.textContent = name; mdot.style.background = col;
        setLevel(9); await sleep(900);
        for (let n = 8; n >= 2; n--) { setLevel(n, n === 2); await sleep(n > 4 ? 170 : 260); }
        await sleep(1700);
        ai = (ai + 1) % AREAS.length;
      }
    })();
  }

  // phone cycles through the Ask flow
  const heroImgs = $$('#heroScreens img');
  let hi = 0;
  if (!reduce) setInterval(() => {
    heroImgs[hi].classList.remove('on'); hi = (hi + 1) % heroImgs.length; heroImgs[hi].classList.add('on');
  }, 2800);

  /* ---------- Nav active link ---------- */
  const links = $$('.nav-links a');
  const navObs = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.hash === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(a => { const s = $(a.hash); if (s) navObs.observe(s); });

  /* ---------- Reveal + count-up ---------- */
  const rvObs = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in'); rvObs.unobserve(e.target);
    e.target.querySelectorAll('[data-count]').forEach(countUp);
    e.target.querySelectorAll('[data-down]').forEach(countDown);
  }), { threshold: .15 });
  $$('.rrow').forEach((r, i) => r.style.setProperty('--i', i));
  $$('.rv, .stagger').forEach(el => rvObs.observe(el));
  function countUp(el) {
    if (reduce) return;
    const end = +el.dataset.count, t0 = performance.now(), dur = 1400;
    const step = t => { const p = Math.min(1, (t - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
      el.textContent = v; if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  // "0 ads / trackers": dial from 9 down to 0, slowing as it settles
  function countDown(el, k) {
    if (reduce) return;
    let n = +el.dataset.down; const from = n; el.textContent = n;
    const step = () => { el.textContent = --n; if (n > 0) setTimeout(step, 55 + (from - n) * 28); };
    setTimeout(step, 350 + k * 160);
  }

  /* ---------- Section headings: split into words that rise out of a mask ---------- */
  if (!reduce) $$('.h2.rv').forEach(h => {
    let i = 0;
    const walk = node => [...node.childNodes].forEach(c => {
      if (c.nodeType === 1) { if (c.tagName !== 'BR') walk(c); return; }
      if (c.nodeType !== 3) return;
      const frag = document.createDocumentFragment();
      c.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (!part.trim()) return frag.append(part);
        const w = document.createElement('span'), inner = document.createElement('span');
        w.className = 'w'; inner.textContent = part; inner.style.setProperty('--i', i++);
        w.append(inner); frag.append(w);
      });
      c.replaceWith(frag);
    });
    walk(h); h.classList.add('split');
  });

  /* ---------- Statement: split into words ---------- */
  const st = $('#statement');
  st.innerHTML = st.innerHTML.replace(/(<em>.*?<\/em>)|([^\s<]+)/g, (m, em) =>
    em ? em.replace('<em>', '<em class="wd">') : `<span class="wd">${m}</span>`);
  const words = $$('#statement .wd');

  /* ---------- Story (pinned scroll) ---------- */
  const steps = $$('#steps .step');
  const stageScr = $('#stageScreens'), card = $('#stageCard'), rail = $('#rail');
  steps.forEach((s, i) => {
    const img = new Image(); img.src = 'assets/screens/' + s.dataset.img; img.alt = s.dataset.label + ' screen';
    if (i === 0) img.className = 'on';
    stageScr.appendChild(img);
    const b = document.createElement('button');
    b.setAttribute('role', 'tab'); b.setAttribute('aria-label', 'Step ' + (i + 1) + ': ' + s.dataset.label);
    b.addEventListener('click', () => s.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }));
    rail.appendChild(b);
  });
  const stageImgs = [...stageScr.children], dots = [...rail.children];
  let active = -1;
  function setStep(i) {
    if (i === active) return; active = i;
    steps.forEach((s, j) => s.classList.toggle('on', j === i));
    stageImgs.forEach((im, j) => im.classList.toggle('on', j === i));
    dots.forEach((d, j) => { d.classList.toggle('on', j === i); d.setAttribute('aria-selected', j === i); });
    card.style.setProperty('--c', steps[i].dataset.c);
    $('#stageCount').innerHTML = String(i + 1).padStart(2, '0') + ' <span>/ ' + String(steps.length).padStart(2, '0') + '</span>';
    $('#stageLabel').textContent = steps[i].dataset.label;
  }
  setStep(0);

  /* ---------- One scroll loop for every scroll-linked effect ---------- */
  const heroTitle = $('#heroTitle'), heroPhone = $('#heroPhone .phone'), dialInner = $('#dialInner');
  const storyEl = $('#steps'), bar = $('#storyBar'), par = $$('#bmPhones [data-par]');
  const nav = $('.nav'), logo = $('.nav .brand img');
  let ticking = false;
  function onScroll() {
    ticking = false;
    const y = scrollY, vh = innerHeight;
    // nav: lift the pill once scrolled; the logo turns a full dial-down over the page
    nav.classList.toggle('scrolled', y > 40);
    if (!reduce) logo.style.rotate = (-360 * y / Math.max(1, document.documentElement.scrollHeight - vh)).toFixed(1) + 'deg';
    // hero: title drifts up and fades, phone lifts, dial turns down
    if (y < vh * 1.2 && !reduce) {
      heroTitle.style.transform = `translateY(${y * -0.25}px)`;
      heroTitle.style.opacity = Math.max(0, 1 - y / (vh * .7));
      heroPhone.style.translate = `0 ${y * -0.12}px`;
      dialInner.style.setProperty('--rot', (-y * 0.18) + 'deg');
    }
    // statement words
    const r = st.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (vh * .85 - r.top) / (r.height + vh * .35)));
    const n = Math.round(p * words.length);
    words.forEach((w, i) => w.classList.toggle('lit', i < n));
    // story: active step = the one nearest viewport centre
    let best = 0, bd = Infinity;
    steps.forEach((s, i) => { const b = s.getBoundingClientRect(), d = Math.abs(b.top + b.height / 2 - vh / 2); if (d < bd) { bd = d; best = i; } });
    setStep(best);
    const sr = storyEl.getBoundingClientRect();
    bar.style.setProperty('--p', Math.min(1, Math.max(0, (vh / 2 - sr.top) / sr.height)).toFixed(3));
    // body-map phones parallax
    if (!reduce) par.forEach(el => { const b = el.getBoundingClientRect(); el.style.transform = `translateY(${(b.top + b.height / 2 - vh / 2) * +el.dataset.par}px)`; });
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Breathing demo: timings match BreathingModels.swift ---------- */
  const PATTERNS = {
    box:    { phases: [4, 4, 4, 4], desc: 'Equal inhale, hold, exhale, hold. Great for stress relief and focus.' },
    '478':  { phases: [4, 7, 8, 0], desc: 'A calming ratio that activates the parasympathetic nervous system.' },
    belly:  { phases: [4, 1, 6, 0], desc: 'Diaphragmatic breathing to deepen relaxation and release tension.' },
    energy: { phases: [6, 0, 2, 0], desc: 'A short exhale ratio to boost alertness and mental clarity.' },
  };
  const PH = [
    { label: 'In', full: 'Inhale', color: 'var(--blue)', scale: 1.08 },
    { label: 'Hold', full: 'Hold', color: 'var(--lav)', scale: null },
    { label: 'Out', full: 'Exhale', color: 'var(--mint)', scale: .8 },
    { label: 'Hold', full: 'Hold', color: 'var(--lav)', scale: null },
  ];
  const orb = $('#orb'), count = $('#count'), phaseEl = $('#phase'), btn = $('#orbBtn'), desc = $('#patDesc'), timing = $('#timing');
  const pats = $$('.pat');
  let current = 'box', running = false, timer = null;
  function renderTiming(ai) {
    timing.innerHTML = PATTERNS[current].phases.map((s, i) => s ? `<span data-i="${i}" class="${i === ai ? 'on' : ''}"><i style="background:${PH[i].color}"></i>${PH[i].label} ${s}s</span>` : '').join('');
  }
  function stop() {
    running = false; clearTimeout(timer);
    btn.textContent = '▶ Begin'; count.textContent = '—'; phaseEl.textContent = 'Tap to begin';
    orb.style.transition = 'transform 1.2s ease, box-shadow .8s ease'; orb.style.transform = 'scale(.8)';
    orb.style.setProperty('--oc', 'var(--blue)'); renderTiming();
  }
  function runPhase(i) {
    if (!running) return;
    const secs = PATTERNS[current].phases[i];
    if (!secs) return runPhase((i + 1) % 4);
    const ph = PH[i];
    orb.style.setProperty('--oc', ph.color); phaseEl.textContent = ph.full; renderTiming(i);
    if (ph.scale && !reduce) { orb.style.transition = `transform ${secs}s cubic-bezier(.45,0,.55,1), box-shadow .8s ease`; orb.style.transform = `scale(${ph.scale})`; }
    let left = secs; count.textContent = left;
    const tick = () => { if (!running) return; left -= 1; if (left <= 0) return runPhase((i + 1) % 4); count.textContent = left; timer = setTimeout(tick, 1000); };
    timer = setTimeout(tick, 1000);
  }
  btn.addEventListener('click', () => { if (running) return stop(); running = true; btn.textContent = '■ Stop'; runPhase(0); });
  orb.addEventListener('click', () => btn.click());
  pats.forEach(b => b.addEventListener('click', () => {
    current = b.dataset.p; pats.forEach(x => x.setAttribute('aria-pressed', x === b));
    desc.textContent = PATTERNS[current].desc;
    const was = running; stop(); if (was) { running = true; btn.textContent = '■ Stop'; runPhase(0); }
  }));
  desc.textContent = PATTERNS.box.desc; renderTiming();

  /* ---------- Ask demo: the exact exchange from the app screenshots ---------- */
  const TURNS = [
    { say: '3 exercises for my lower back', reply: "Here's a gentle 4-minute routine for your lower back.",
      rows: [['Cat-Cow Flow', '1:30'], ["Child's Pose", '1:30'], ['Double Knee-to-Chest Release', '0:45']],
      tray: '3 exercises · 3:45' },
    { say: '2 for my neck', reply: "Here's a gentle 2-minute routine for your neck.",
      rows: [['Chin Tuck (Forward Head Reset)', '0:45'], ['Chin-to-Shoulder Diagonal Stretch · L + R', '1:00']],
      tray: '5 exercises · 5:30' },
  ];
  const body = $('#chatBody'), field = $('#field'), tray = $('#tray'), trayChips = $('#trayChips'), trayMeta = $('#trayMeta');
  let run = 0, n = 0;
  const wait = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  function add(cls, html) {
    const el = document.createElement('div'); el.className = 'msg ' + cls; el.innerHTML = html; body.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show'))); return el;
  }
  async function play() {
    const id = ++run; body.innerHTML = ''; trayChips.innerHTML = ''; tray.style.opacity = 0; n = 0;
    for (const t of TURNS) {
      field.classList.add('typing-on'); field.innerHTML = '<span></span><i class="caret"></i>';
      const span = field.firstChild;
      for (const ch of t.say) { if (id !== run) return; span.textContent += ch; await wait(45); }
      await wait(350); if (id !== run) return;
      field.classList.remove('typing-on'); field.textContent = 'Type or tap the mic…';
      add('me', t.say);
      const dots = add('bot', '<span class="typing"><i></i><i></i><i></i></span>');
      await wait(1000); if (id !== run) return;
      dots.textContent = t.reply;
      await wait(300); if (id !== run) return;
      add('rcard', t.rows.map(([a, b]) => `<div class="rc-row"><span>${a}</span><small>${b}</small></div>`).join('') + '<div class="rc-note">Stop if anything hurts sharply.</div>');
      tray.style.opacity = 1; trayMeta.textContent = t.tray;
      for (const [a, b] of t.rows) { trayChips.insertAdjacentHTML('beforeend', `<span><b>${++n}</b>${a}<small>${b}</small></span>`); await wait(140); }
      await wait(1400);
    }
  }
  $('#replay').addEventListener('click', play);
  const chatObs = new IntersectionObserver(es => { if (es[0].isIntersecting) { play(); chatObs.disconnect(); } }, { threshold: .4 });
  chatObs.observe($('.chat'));
})();
