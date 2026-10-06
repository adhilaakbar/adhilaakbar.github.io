// Paints a vine in an oil-painting style: it stretches across the top of the
// page, then winds down the left as you scroll, opening leaves, buds and a
// water lily at each marked section.
(function () {
  const main = document.querySelector('main');
  const wrap = document.querySelector('.stem-wrap');
  const stemSvg = wrap.querySelector('svg');
  const svg = document.querySelector('.plant');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const C = {
    stem: '#3f5530', stemHi: '#6f8a4c',
    leaf: ['#263c22', '#45632f', '#6f8d4b', '#a7bd7c'],
    white: '#eef0ea', cream: '#f6efe0', blue: '#a9c0dc', blue2: '#6688b4',
    pink: '#e6b3c1', pink2: '#c47d94', ochre: '#c9975a', yellow: '#e4c04a',
    water: '#2b4d73', water2: '#3f6a96',
  };

  // Brushwork: wobbly edges plus streaky impasto lighting.
  const DEFS = `<defs>
    <filter id="paint" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="3" result="warp"/>
      <feDisplacementMap in="SourceGraphic" in2="warp" scale="5" xChannelSelector="R" yChannelSelector="G" result="shape"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.7 0.07" numOctaves="2" seed="8" result="streaks"/>
      <feDiffuseLighting in="streaks" surfaceScale="2.4" lighting-color="#ffffff" result="light">
        <feDistantLight azimuth="225" elevation="52"/>
      </feDiffuseLighting>
      <feComposite in="light" in2="shape" operator="in" result="lit"/>
      <feBlend in="lit" in2="shape" mode="soft-light" result="painted"/>
      <feComposite in="painted" in2="shape" operator="in"/>
    </filter>
    <filter id="paint-water" x="-5%" y="-25%" width="110%" height="150%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.03 0.06" numOctaves="2" seed="5" result="warp"/>
      <feDisplacementMap in="SourceGraphic" in2="warp" scale="6" xChannelSelector="R" yChannelSelector="G" result="shape"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.05 0.6" numOctaves="2" seed="11" result="streaks"/>
      <feDiffuseLighting in="streaks" surfaceScale="2" lighting-color="#ffffff" result="light">
        <feDistantLight azimuth="250" elevation="58"/>
      </feDiffuseLighting>
      <feComposite in="light" in2="shape" operator="in" result="lit"/>
      <feBlend in="lit" in2="shape" mode="soft-light" result="painted"/>
      <feComposite in="painted" in2="shape" operator="in"/>
    </filter>
  </defs>`;

  const p = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
  const st = (d, color, w, extra = '') =>
    `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;

  // Leaf pointing along +x from its base, layered like dabs of paint.
  const leaf = () =>
    p('M0 0 C 12 -17, 42 -21, 62 -2 C 42 13, 14 13, 0 0Z', C.leaf[0]) +
    p('M3 -2 C 15 -16, 40 -19, 58 -3 C 40 5, 16 5, 3 -2Z', C.leaf[1]) +
    p('M8 -5 C 21 -15, 37 -16, 52 -5 C 37 -8, 21 -7, 8 -5Z', C.leaf[2]) +
    st('M4 -1 C 22 -5, 41 -5, 58 -2', C.leaf[3], 1.6, 'opacity=".75"');

  // A nodding bud in white and blue with an ochre touch.
  const bud = () =>
    p('M0 0 C -15 -8, -15 -31, -2 -42 C 6 -31, 8 -10, 0 0Z', C.blue2) +
    p('M0 0 C -9 -11, -7 -36, 4 -45 C 15 -32, 13 -9, 0 0Z', C.white) +
    p('M0 0 C 2 -13, 9 -29, 17 -36 C 19 -21, 11 -6, 0 0Z', C.blue) +
    st('M-3 -5 C -6 -16, -4 -28, 2 -36', C.ochre, 2.2, 'opacity=".75"') +
    st('M3 -8 C 6 -18, 8 -26, 12 -31', C.cream, 1.4, 'opacity=".8"') +
    p('M0 3 C -8 -1, -13 -8, -15 -15 C -6 -11, -2 -6, 0 3Z', C.leaf[1]) +
    p('M0 3 C 8 -1, 13 -8, 15 -15 C 6 -11, 2 -6, 0 3Z', C.leaf[2]);

  // Water lily resting on a pad, with a few ripples of blue.
  function lily() {
    let out =
      st('M-86 34 C -60 30, -30 36, 0 33', C.water2, 3, 'opacity=".7"') +
      st('M10 40 C 26 37, 40 39, 52 37', C.water, 3.5, 'opacity=".8"') +
      st('M-70 46 C -40 44, -10 48, 18 46', C.water, 2.5, 'opacity=".6"') +
      p('M0 14 L 52 4 C 58 28, 34 42, 0 42 C -40 42, -70 32, -70 14 C -70 -2, -40 -12, 0 -12 C 28 -12, 48 -6, 52 0 Z', C.leaf[1]) +
      p('M0 14 L 44 6 C 46 24, 28 36, 0 36 C -32 36, -60 28, -62 16 Z', C.leaf[2], 'opacity=".7"') +
      st('M0 14 L -50 8 M0 14 L -40 30 M0 14 L 26 34', C.leaf[3], 1.4, 'opacity=".55"');
    return out + lilyFlower();
  }

  // The flower alone: pink outer petals, white inner cup, golden centre.
  function lilyFlower() {
    const petal = 'M0 0 C -8 -10, -7 -30, 0 -40 C 7 -30, 8 -10, 0 0Z';
    let back = '', front = '', inner = '';
    for (let i = 0; i < 8; i++) {
      back += p(petal, i % 2 ? C.pink : C.pink2, `transform="rotate(${i * 45 + 22}) scale(1.08)"`);
      front += p(petal, C.white, `transform="rotate(${i * 45}) scale(.95)"`) +
        st('M0 -4 C -2 -16, -1 -28, 0 -34', C.pink, 1.4, `transform="rotate(${i * 45})" opacity=".55"`);
    }
    for (let i = -2; i <= 2; i++) {
      inner += p('M0 0 C -6 -8, -6 -24, 0 -32 C 6 -24, 6 -8, 0 0Z', i % 2 ? C.cream : C.white,
        `transform="rotate(${i * 16})"`);
    }
    let out = `<g transform="translate(0 6) scale(1 .5)">${back}${front}</g>`;
    out += `<g transform="translate(0 6)">${inner}</g>`;
    out += p('M-7 2 C -6 -6, 6 -6, 7 2 C 4 5, -4 5, -7 2Z', C.yellow);
    out += st('M-4 0 C -2 -4, 2 -4, 4 0', C.ochre, 1.4);
    return out;
  }

  const yOf = (node) => {
    const r = node.getBoundingClientRect(), m = main.getBoundingClientRect();
    return r.top - m.top + r.height / 2;
  };

  // A small curling tendril.
  const tendril = () => st('M0 0 C 10 -4, 20 2, 18 12 C 16 20, 6 19, 6 12 C 6 7, 11 6, 12 10', C.stemHi, 1.6);

  const top = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  top.setAttribute('class', 'top-vine');
  top.setAttribute('aria-hidden', 'true');
  document.body.appendChild(top);

  const pond = document.createElement('div');
  pond.className = 'pond';
  pond.setAttribute('aria-hidden', 'true');
  pond.innerHTML = '<svg class="water"></svg><svg class="floaters"></svg>';
  document.body.appendChild(pond);
  const waterSvg = pond.querySelector('.water'), floatSvg = pond.querySelector('.floaters');

  // Small seeded random so the pond paints the same way every visit.
  const rng = (seed) => () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };

  // A lily pad seen at an angle, with its notch and a few painted veins.
  const pad = (r, tone) =>
    `<g transform="scale(1 .42)">` +
    p(`M0 0 L ${r * .92} ${-r * .3} A ${r} ${r} 0 1 0 ${r * .96} ${r * .18} Z`, C.leaf[tone]) +
    p(`M0 0 L ${r * .8} ${r * .14} A ${r * .85} ${r * .85} 0 0 1 ${-r * .7} ${r * .4} Z`, C.leaf[tone + 1], 'opacity=".75"') +
    st(`M0 0 L ${-r * .7} ${-r * .3} M0 0 L ${-r * .5} ${r * .6} M0 0 L ${r * .3} ${r * .75}`, C.leaf[3], 1.6, 'opacity=".45"') +
    `</g>`;

  let nodes = [], y0 = 0, y1 = 0, pondY = 0;

  function build() {
    const narrow = innerWidth <= 640;
    const x0 = narrow ? 30 : 82, s = narrow ? 0.6 : 1.3;
    const A = narrow ? 11 : 24;
    const H = main.scrollHeight, W = main.offsetWidth;
    const PW = document.documentElement.clientWidth;
    const mRect = main.getBoundingClientRect();
    const mLeft = mRect.left + scrollX, mTop = mRect.top + scrollY;

    // Vertical vine: two overlapping waves so the curve never feels regular.
    const xOf = (y) => {
      const t = y - y0;
      return x0 + A * Math.sin(t / 260 * Math.PI * 2) + A * 0.35 * Math.sin(t / 97 + 1.3);
    };
    // Top vine across the page, in page coordinates.
    const VY = narrow ? 92 : 112, VA = narrow ? 8 : 13;
    const vyOf = (X) => VY + VA * Math.sin(X / 210 * Math.PI * 2) + VA * 0.4 * Math.sin(X / 71 + 1);

    const J = mLeft + x0;
    y0 = vyOf(J) - mTop;
    const marks = [...document.querySelectorAll('[data-node]')];
    const PH = narrow ? 230 : 320;
    document.body.style.paddingBottom = PH + 'px';
    pondY = H;                      // pond begins where main ends
    y1 = H + (narrow ? 50 : 70);    // the vine dips into the water

    // ---- Vertical stem ----
    let d = '';
    for (let y = y0; y <= y1; y += 8) d += (d ? ' L' : 'M') + `${xOf(y).toFixed(1)} ${y.toFixed(1)}`;
    d += ` L${xOf(y1).toFixed(1)} ${y1.toFixed(1)}`;
    stemSvg.setAttribute('width', narrow ? 70 : 160);
    stemSvg.setAttribute('height', y1 + 40);
    stemSvg.innerHTML = DEFS + `<g filter="url(#paint)">` +
      st(d, C.stem, 6 * s + 1) +
      st(d, C.stemHi, 2 * s + .4, `transform="translate(${1.4 * s} 0)" opacity=".85"`) + `</g>`;

    const out = [];
    nodes = [];
    const add = (y, ox, oy, inner) => {
      out.push(`<g class="node" style="transform-origin:${ox.toFixed(1)}px ${oy.toFixed(1)}px"><g filter="url(#paint)">${inner}</g></g>`);
      nodes.push(y);
    };
    const leafAt = (y, side, k, tilt) => {
      const x = xOf(y);
      add(y, x, y, `<g transform="translate(${x} ${y}) scale(${side * s * k} ${s * k})">` +
        st('M0 0 Q 14 -4 22 -16', C.stem, 3) +
        `<g transform="translate(22 -16) rotate(${tilt})">${leaf()}</g></g>`);
    };
    const budAt = (y, side) => {
      const x = xOf(y);
      add(y, x, y, `<g transform="translate(${x} ${y}) scale(${side * s} ${s})">` +
        st('M0 0 C 16 -2, 30 -12, 36 -32', C.stem, 3) +
        `<g transform="translate(36 -32) rotate(18)">${bud()}</g>` +
        `<g transform="translate(14 -4) rotate(-150) scale(-.55 .55)">${leaf()}</g></g>`);
    };
    const curlAt = (y, side) => {
      const x = xOf(y);
      add(y, x, y, `<g transform="translate(${x} ${y}) scale(${side * s} ${s})">${tendril()}</g>`);
    };

    const ys = [];
    let side = 1;
    marks.forEach((m) => {
      const y = yOf(m), type = m.dataset.node;
      ys.push(y);
      if (type === 'flower') {
        const x = xOf(y);
        add(y, x, y, `<g transform="translate(${x} ${y}) scale(${s * 0.85})">${lily()}</g>`);
      } else if (type === 'pair') {
        leafAt(y, 1, 1, -26);
        budAt(y + 14 * s, -1);
      } else if (m.tagName === 'H3') {
        budAt(y, side); side = -side;
      } else {
        leafAt(y, side, 1.05, -28); side = -side;
      }
    });

    // Filler leaves and tendrils so the vine feels alive between sections.
    let k = 0;
    for (let y = y0 + 110; y < pondY - 90; y += 105) {
      if (ys.some((m) => Math.abs(m - y) < 65)) continue;
      // Leaves sit on the outside of each bend; tendrils on the inside.
      const bend = xOf(y) > x0 ? 1 : -1;
      if (k % 4 === 3) curlAt(y, -bend);
      else leafAt(y, bend, 0.55 + (k % 3) * 0.09, -18 - (k % 3) * 8);
      k++;
    }

    svg.setAttribute('width', W);
    svg.setAttribute('height', H);
    svg.innerHTML = out.join(''); // uses the #paint filter defined in the stem SVG
    nodes = [...svg.querySelectorAll('.node')].map((el, j) => ({ el, y: nodes[j] }));

    // ---- Top vine, stretching from the left edge across to the right ----
    const TH = VY + 90;
    const line = (from, to) => {
      let p = '';
      const step = from < to ? 8 : -8;
      for (let X = from; step > 0 ? X <= to : X >= to; X += step) p += (p ? ' L' : 'M') + `${X.toFixed(1)} ${vyOf(X).toFixed(1)}`;
      return p;
    };
    const right = line(J, PW + 10), left = line(J, -10);
    const vineStroke = (p) =>
      st(p, C.stem, 5.5 * s + 1, 'pathLength="1" class="draw"') +
      st(p, C.stemHi, 1.8 * s + .4, `pathLength="1" class="draw" transform="translate(0 ${-1.2 * s})" opacity=".85"`);

    const topOut = [`<g filter="url(#paint)">${vineStroke(right)}${vineStroke(left)}</g>`];
    let n = 0;
    const span = Math.max(J, PW - J);
    for (let X = 40; X < PW - 20; X += narrow ? 46 : 62) {
      if (Math.abs(X - J) < 30) continue;
      const Y = vyOf(X), up = n % 2 ? -1 : 1, k2 = (0.5 + (n % 3) * 0.12) * s;
      const delay = (0.25 + Math.abs(X - J) / span * 1.9).toFixed(2);
      let inner;
      if (n % 7 === 5) {
        inner = `<g transform="translate(${X} ${Y}) scale(${s * 0.8} ${-up * s * 0.8})">` +
          st('M0 0 C 10 2, 18 10, 20 22', C.stem, 3) +
          `<g transform="translate(20 22) rotate(160)">${bud()}</g></g>`;
      } else if (n % 5 === 3) {
        inner = `<g transform="translate(${X} ${Y}) scale(${s} ${up * s})">${tendril()}</g>`;
      } else {
        inner = `<g transform="translate(${X} ${Y}) scale(${k2} ${up * k2}) rotate(${-10 - (n % 4) * 6})">` +
          st('M0 0 Q 14 -4 22 -16', C.stem, 3) +
          `<g transform="translate(22 -16) rotate(-20)">${leaf()}</g></g>`;
      }
      topOut.push(`<g class="node" style="transform-origin:${X.toFixed(1)}px ${Y.toFixed(1)}px;transition-delay:${delay}s"><g filter="url(#paint)">${inner}</g></g>`);
      n++;
    }
    top.setAttribute('width', PW);
    top.setAttribute('height', TH);
    top.innerHTML = topOut.join('');
    requestAnimationFrame(() => top.classList.add('grown'));
    top.querySelectorAll('.node').forEach((el) => nodes.push({ el, y: -Infinity }));

    // ---- The pond ----
    const R = rng(7), ex = mLeft + xOf(y1), ey = y1 - pondY;
    const water = [];
    let shore = `M0 ${PH}`;
    for (let X = 0; X <= PW + 10; X += 10) {
      shore += ` L${X} ${(26 + 10 * Math.sin(X / 140) + 6 * Math.sin(X / 47 + 2)).toFixed(1)}`;
    }
    shore += ` L${PW + 10} ${PH} Z`;
    water.push(p(shore, '#142840'));
    const blues = ['#16304a', '#203f5f', '#2b4d73', '#3f6a96', '#5b86b3', '#8fb0d2'];
    const strokes = Math.round(PW * PH / (narrow ? 650 : 900));
    for (let i = 0; i < strokes; i++) {
      const X = R() * PW, Y = 34 + R() * (PH - 34), len = 14 + R() * 60;
      const depth = Y / PH, c = blues[Math.min(5, Math.floor(R() * 4 + (1 - depth) * 1.6 + (R() < .08 ? 2 : 0)))];
      const bow = (R() - .5) * 6;
      water.push(st(`M${X.toFixed(0)} ${Y.toFixed(0)} q ${len / 2} ${bow.toFixed(1)} ${len.toFixed(0)} 0`, c,
        (2.5 + R() * 4.5).toFixed(1), `opacity="${(.55 + R() * .4).toFixed(2)}"`));
    }
    for (let i = 0; i < PW / 40; i++) {          // pale reflections
      const X = R() * PW, Y = 40 + R() * (PH - 60);
      water.push(st(`M${X.toFixed(0)} ${Y.toFixed(0)} h ${(10 + R() * 26).toFixed(0)}`, '#d9e4ee', 2 + R() * 2, `opacity="${(.35 + R() * .35).toFixed(2)}"`));
    }
    for (let X = 6; X < PW; X += 9 + R() * 14) {  // reeds along the shore
      const Y = 28 + 10 * Math.sin(X / 140) + 6 * Math.sin(X / 47 + 2), h = 8 + R() * 22;
      water.push(st(`M${X.toFixed(0)} ${(Y + 4).toFixed(0)} q ${(R() * 6 - 3).toFixed(1)} ${(-h / 2).toFixed(0)} ${(R() * 8 - 2).toFixed(1)} ${(-h).toFixed(0)}`,
        C.leaf[1 + Math.floor(R() * 3)], 1.6 + R() * 1.4));
    }
    waterSvg.setAttribute('width', PW);
    waterSvg.setAttribute('height', PH);
    waterSvg.innerHTML = `<g filter="url(#paint-water)">${water.join('')}</g>`;

    // Pads, lilies and buds floating across, appearing outward from the vine.
    const floats = [];
    const cols = narrow ? 5 : Math.max(6, Math.round(PW / 150));
    for (let i = 0; i < cols * 2; i++) {
      const row = i % 2, col = Math.floor(i / 2);
      const X = (col + .2 + R() * .6) * PW / cols, Y = 70 + row * (PH - 120) * .55 + R() * (PH - 150) * .45;
      const r = (narrow ? 26 : 38) + R() * (narrow ? 18 : 30);
      const kind = R();
      let inner = pad(r, Math.floor(R() * 2));
      if (kind < .38) inner += `<g transform="translate(${(r * .1).toFixed(0)} ${(-r * .08).toFixed(0)}) scale(${(r / 46).toFixed(2)})">` +
        lilyFlower() + `</g>`;
      else if (kind < .55) inner += `<g transform="translate(${(r * .2).toFixed(0)} -2) scale(${(r / 70).toFixed(2)})">${bud()}</g>`;
      const delay = (.4 + Math.hypot(X - ex, Y - ey) / PW * 2.2).toFixed(2);
      floats.push(`<g class="node" style="transform-origin:${X.toFixed(0)}px ${Y.toFixed(0)}px;transition-delay:${delay}s">` +
        `<g filter="url(#paint)" transform="translate(${X.toFixed(0)} ${Y.toFixed(0)})">${inner}</g></g>`);
    }
    floatSvg.setAttribute('width', PW);
    floatSvg.setAttribute('height', PH);
    floatSvg.innerHTML = floats.join('');
    pond.style.top = (mTop + pondY) + 'px';
    pond.style.height = PH + 'px';
    pond.style.setProperty('--ex', ex.toFixed(0) + 'px');
    pond.style.setProperty('--ey', ey.toFixed(0) + 'px');

    update();
  }

  function update() {
    const mTop = main.getBoundingClientRect().top + scrollY;
    const tip = reduce ? Infinity : scrollY + innerHeight * 0.72 - mTop;
    wrap.style.height = Math.max(0, Math.min(tip, y1 + 20)) + 'px';
    nodes.forEach((n) => n.el.classList.toggle('grown', tip >= n.y));
    pond.classList.toggle('grown', tip >= y1 - 10);
  }

  let raf = 0;
  addEventListener('scroll', () => {
    if (!raf) raf = requestAnimationFrame(() => { raf = 0; update(); });
  }, { passive: true });
  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 150); });
  if (document.fonts) document.fonts.ready.then(build);
  build();
})();
