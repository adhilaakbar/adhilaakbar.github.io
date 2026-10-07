// Paints the page in an oil-painting style: a sunrise sky, a tree canopy, a
// vine that grows down the left as you scroll (leaves and blossoms opening
// along it), and a water-lily pond at the bottom.
(function () {
  const main = document.querySelector('main');
  const wrap = document.querySelector('.stem-wrap');
  const stemSvg = wrap.querySelector('svg');
  const svg = document.querySelector('.plant');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const C = {
    stem: '#3f5530', stemHi: '#6f8a4c',
    bark: ['#33241a', '#56402f', '#7a5c42', '#a2825f'], vine: '#5e5d3a',
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

  const canopy = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  canopy.setAttribute('class', 'canopy');
  canopy.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canopy);

  // A small five-petalled blossom, lilac or gold.
  const blossom = (gold) => {
    const c1 = gold ? '#efc96a' : '#c3a6dc', c2 = gold ? '#f7e2a0' : '#e2d2f0';
    let out = '';
    for (let i = 0; i < 5; i++) {
      out += p('M0 0 C -3 -3, -3 -8, 0 -10 C 3 -8, 3 -3, 0 0Z', i % 2 ? c1 : c2, `transform="rotate(${i * 72})"`);
    }
    return out + `<circle r="1.8" fill="${gold ? '#c98a3a' : '#f4e3a1'}"/>`;
  };

  // A large layered bloom for section headings: outer petals, a paler inner
  // ring, and a stamen-dotted centre.
  const BLOOMS = [
    ['#9c7cc4', '#c3a6dc', '#ece2f6', '#f2d27a'],   // lilac
    ['#d99a3a', '#efc96a', '#fbe9b4', '#a8642a'],   // gold
    ['#6688b4', '#a9c0dc', '#f3f5f8', '#e4c04a'],   // white and blue
    ['#c47d94', '#e6b3c1', '#fbe8ee', '#f2d27a'],   // pink
  ];
  const bigBloom = ([outer, mid, inner, heart]) => {
    let out = '';
    for (let i = 0; i < 6; i++) {
      out += p('M0 0 C -9 -8, -10 -26, 0 -34 C 10 -26, 9 -8, 0 0Z', i % 2 ? outer : mid, `transform="rotate(${i * 60})"`);
    }
    for (let i = 0; i < 6; i++) {
      out += p('M0 0 C -6 -6, -6 -18, 0 -22 C 6 -18, 6 -6, 0 0Z', inner, `transform="rotate(${i * 60 + 30})" opacity=".9"`);
      out += st('M0 -4 L0 -16', mid, 1, `transform="rotate(${i * 60 + 30})" opacity=".6"`);
    }
    out += `<circle r="6" fill="${heart}"/>`;
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2;
      out += `<circle cx="${(Math.cos(a) * 8).toFixed(1)}" cy="${(Math.sin(a) * 8).toFixed(1)}" r="1.3" fill="${heart}" opacity=".9"/>`;
    }
    return out;
  };

  const sky = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  sky.setAttribute('class', 'sky');
  sky.setAttribute('aria-hidden', 'true');
  document.body.prepend(sky);

  // Sky colours from the top of the page down to the horizon glow.
  const SKY = [
    [0, [18, 24, 48]], [.22, [36, 40, 82]], [.42, [78, 56, 108]],
    [.58, [150, 82, 118]], [.7, [212, 120, 104]], [.8, [236, 164, 102]], [.88, [244, 202, 128]],
  ];
  const skyAt = (t) => {
    for (let i = 1; i < SKY.length; i++) {
      if (t <= SKY[i][0]) {
        const [a, ca] = SKY[i - 1], [b, cb] = SKY[i], f = (t - a) / (b - a);
        return ca.map((v, j) => Math.round(v + (cb[j] - v) * f));
      }
    }
    return SKY[SKY.length - 1][1];
  };
  const rgb = (c, k = 1) => `rgb(${c.map((v) => Math.min(255, Math.round(v * k))).join(',')})`;

  let nodes = [], y0 = 0, y1 = 0, pondY = 0;

  function build() {
    const narrow = innerWidth <= 640;
    const x0 = narrow ? 30 : 82, s = narrow ? 0.6 : 1.3;
    const H = main.scrollHeight, W = main.offsetWidth;
    const PW = document.documentElement.clientWidth;
    const mRect = main.getBoundingClientRect();
    const mLeft = mRect.left + scrollX, mTop = mRect.top + scrollY;

    // Vertical vine: two overlapping waves so the curve never feels regular.
    // The stem wanders like real wood: irregular bends at uneven intervals,
    // plus small kinks, joined with a smooth Catmull-Rom curve.
    const wander = (seed, stepMin, stepMax, amp, keep) => {
      const r = rng(seed), ys = [0], xs = [0];
      while (ys[ys.length - 1] < H + 800) {
        ys.push(ys[ys.length - 1] + stepMin + r() * (stepMax - stepMin));
        xs.push(Math.max(-amp, Math.min(amp, xs[xs.length - 1] * keep + (r() - .5) * 2 * amp)));
      }
      return (t) => {
        let i = 1;
        while (i < ys.length - 2 && ys[i] < t) i++;
        const p0 = xs[i - 2] ?? xs[0], p1 = xs[i - 1], p2 = xs[i], p3 = xs[i + 1];
        const u = Math.max(0, Math.min(1, (t - ys[i - 1]) / (ys[i] - ys[i - 1])));
        return .5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);
      };
    };
    const bend = wander(5, 80, 200, narrow ? 5 : 11, .4), kink = wander(9, 18, 40, 1.6, 0);
    const xOf = (y) => x0 + bend(y - y0) + kink(y - y0);
    // Sky geometry, in page coordinates.
    const hero = document.querySelector('.hero');
    const heroBottom = hero.getBoundingClientRect().bottom + scrollY;
    const SH = Math.round(heroBottom);   // texture stops at the About line
    const horizon = SH * .8, sunX = PW * (narrow ? .9 : .76), sunR = narrow ? 26 : 40;
    // A bough reaching in from a tree just off the top-left of the page.
    // Page coordinates. The main vine hangs from it.
    const boughY = (X) => (narrow ? 56 : 66) + (narrow ? 30 : 58) * Math.sin(Math.PI * Math.min(1, Math.max(0, X / PW)) * .9) + 6 * Math.sin(X / 90);
    const boughW = (X) => Math.max(6, (narrow ? 20 : 34) * (1 - .78 * Math.max(0, X) / PW));
    y0 = boughY(mLeft + x0) - mTop;
    const marks = [...document.querySelectorAll('[data-node]')];
    const PH = narrow ? 230 : 320;
    document.body.style.paddingBottom = PH + 'px';
    pondY = H;                      // pond begins where main ends
    y1 = H + (narrow ? 50 : 70);    // the vine dips into the water

    // ---- The long vine: one of the canopy's thin vines, carried down the page ----
    let d = '';
    for (let y = y0; y <= y1; y += 6) d += (d ? ' L' : 'M') + `${xOf(y).toFixed(1)} ${y.toFixed(1)}`;
    d += ` L${xOf(y1).toFixed(1)} ${y1.toFixed(1)}`;
    stemSvg.setAttribute('width', narrow ? 70 : 190);
    stemSvg.setAttribute('height', y1 + 40);
    stemSvg.innerHTML = DEFS + `<g filter="url(#paint)">${st(d, C.vine, 2.8)}</g>`;

    // Leaves and blossoms along it, each opening as you scroll to it.
    const out = [];
    nodes = [];
    const R4 = rng(44);
    const add = (y, ox, oy, inner) => {
      out.push(`<g class="node" style="transform-origin:${ox.toFixed(1)}px ${oy.toFixed(1)}px"><g filter="url(#paint)">${inner}</g></g>`);
      nodes.push(y);
    };
    const leafG = (x, y, ang, k) =>
      `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(0)}) scale(${k.toFixed(2)})">${leaf()}</g>`;
    const flowerG = (x, y, gold, k) =>
      `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${k.toFixed(2)})">${blossom(gold)}</g>`;

    let n = 0;
    for (let y = y0 + 8; y < pondY - 10; y += 7 + R4() * 5) {
      const x = xOf(y), side = n++ % 2 ? 1 : -1;
      let g = leafG(x, y, side > 0 ? 30 + R4() * 45 : 150 - R4() * 45, .3 + R4() * .12);
      if (R4() < .2) g += flowerG(x + side * 7, y + 3, R4() < .4, .75 + R4() * .3);
      add(y, x, y, g);
    }
    // Section headings get one large bloom on the vine; job titles get a
    // small cluster of blossoms with a drooping bud.
    let bi = 0;
    marks.forEach((m, i) => {
      const y = yOf(m), x = xOf(y);
      if (m.tagName === 'H2') {
        // The bloom opens right on the vine, framed by a pair of leaves.
        const g = leafG(x, y + 6, 40, .4) + leafG(x, y + 6, 140, .4) +
          `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${narrow ? .55 : 1.3})">${bigBloom(BLOOMS[bi++ % BLOOMS.length])}</g>`;
        add(y, x, y, g);
        return;
      }
      const gold = i % 2 === 1;
      let g = '';
      for (let q = 0; q < 5; q++) g += flowerG(x + (q - 2) * 6 + (R4() - .5) * 4, y + (q % 2) * 7 - 4, q % 3 === 0 ? !gold : gold, .9 + R4() * .25);
      g += `<g transform="translate(${(x + 12).toFixed(1)} ${(y + 10).toFixed(1)}) rotate(160) scale(.42)">${bud()}</g>`;
      add(y, x, y, g);
    });

    svg.setAttribute('width', W);
    svg.setAttribute('height', H);
    svg.innerHTML = out.join(''); // uses the #paint filter defined in the stem SVG
    nodes = [...svg.querySelectorAll('.node')].map((el, j) => ({ el, y: nodes[j] }));

    // ---- Smooth sunset gradient for the rest of the page ----
    {
      const at = (sel) => document.querySelector(sel).getBoundingClientRect().top + scrollY;
      const about = at('#about'), work = at('#work'), els = at('#elsewhere'), contact = at('#contact');
      const pondTop = mTop + pondY;
      const stops = [
        ['#f3c97f', 0], ['#f2c27a', about], ['#eba06a', work],
        ['#cf7676', els - 50], ['#8a5482', els + 45], ['#4a3a6a', contact],
        ['#1d2340', pondTop], ['#141a30', pondTop + PH],
      ];
      document.documentElement.style.background =
        `#141a30 linear-gradient(to bottom, ${stops.map(([c, y]) => `${c} ${Math.round(y)}px`).join(', ')}) no-repeat top / 100% ${Math.round(pondTop + PH)}px`;
    }

    // ---- Sunrise sky behind the top of the page ----
    {
      const R2 = rng(21);
      const out = [];
      out.push(`<defs>
        <linearGradient id="sky-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fff"/><stop offset=".8" stop-color="#fff"/>
          <stop offset=".92" stop-color="#fff" stop-opacity=".5"/>
          <stop offset="1" stop-color="#fff" stop-opacity="0"/>
        </linearGradient>
        <mask id="sky-mask"><rect width="${PW}" height="${SH}" fill="url(#sky-fade)"/></mask>
        <radialGradient id="sun-glow"><stop offset="0" stop-color="#ffe9b0" stop-opacity="1"/>
          <stop offset=".35" stop-color="#f6b56e" stop-opacity=".45"/><stop offset="1" stop-color="#e07b62" stop-opacity="0"/></radialGradient>
        <linearGradient id="sky-base" x1="0" y1="0" x2="0" y2="1">
          ${SKY.map(([o, c]) => `<stop offset="${o / .88 * .8}" stop-color="${rgb(c)}"/>`).join('')}
        </linearGradient>
        <linearGradient id="sky-shade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#12142a" stop-opacity=".62"/>
          <stop offset="${narrow ? .62 : .42}" stop-color="#12142a" stop-opacity="${narrow ? .5 : .4}"/>
          <stop offset="${narrow ? .95 : .72}" stop-color="#12142a" stop-opacity="0"/>
        </linearGradient>
      </defs>`);
      const paint = [];
      paint.push(`<rect width="${PW}" height="${SH}" fill="url(#sky-base)"/>`);
      // Horizontal brushstrokes; warm colours gather toward the sun.
      const n = Math.round(PW * SH / (narrow ? 700 : 820));
      for (let i = 0; i < n; i++) {
        const X = R2() * PW, Y = R2() * SH, t = Math.min(.95, Math.max(0, Y / horizon * .78 + (R2() - .5) * .06));
        const near = 1 - Math.min(1, Math.abs(X - sunX) / (PW * .7));
        const k = .82 + near * .32 + (R2() - .5) * .14;
        paint.push(st(`M${X.toFixed(0)} ${Y.toFixed(0)} q ${(14 + R2() * 40).toFixed(0)} ${((R2() - .5) * 4).toFixed(1)} ${(30 + R2() * 80).toFixed(0)} 0`,
          rgb(skyAt(t), k), (3 + R2() * 6).toFixed(1), `opacity="${(.5 + R2() * .45).toFixed(2)}"`));
      }
      // Clouds: long low wisps, lit pink and gold from below.
      const clouds = narrow ? 5 : 9;
      for (let c = 0; c < clouds; c++) {
        const cx = R2() * PW, cy = SH * (.2 + R2() * .42), w = (narrow ? 90 : 160) + R2() * 220;
        const t = cy / horizon * .78;
        for (let j = 0; j < 9; j++) {
          const yy = cy + (j - 4) * 3.2 + (R2() - .5) * 3, xx = cx + (R2() - .5) * w * .3, ww = w * (1 - Math.abs(j - 4) / 6) * (.6 + R2() * .4);
          const lit = j > 4 ? skyAt(Math.min(.92, t + .22)) : skyAt(Math.max(0, t - .08));
          paint.push(st(`M${(xx - ww / 2).toFixed(0)} ${yy.toFixed(0)} q ${(ww / 2).toFixed(0)} ${((R2() - .5) * 5).toFixed(1)} ${ww.toFixed(0)} 0`,
            rgb(lit, j > 4 ? 1.12 : .92), (3 + R2() * 4).toFixed(1), `opacity="${(.55 + R2() * .35).toFixed(2)}"`));
        }
      }
      // The sun, low on the horizon, with dabs of light.
      const disc = `<circle cx="${sunX}" cy="${horizon}" r="${sunR * 5}" fill="url(#sun-glow)"/>` +
        `<circle cx="${sunX}" cy="${horizon}" r="${sunR}" fill="#ffdc8c"/>` +
        `<circle cx="${sunX}" cy="${horizon}" r="${sunR * .7}" fill="#fff0c2" opacity=".8"/>`;
      let sun = '', disc2 = '';
      for (let j = 0; j < 26; j++) {
        const a = R2() * Math.PI * 2, rr = R2() * sunR * .85;
        disc2 += st(`M${(sunX + Math.cos(a) * rr - 6).toFixed(0)} ${(horizon + Math.sin(a) * rr).toFixed(0)} h ${(6 + R2() * 12).toFixed(0)}`,
          R2() < .5 ? '#fff6d8' : '#ffd27a', (2 + R2() * 3).toFixed(1), 'opacity=".85"');
      }
      // Sunlight streaked across the horizon.
      for (let j = 0; j < (narrow ? 14 : 26); j++) {
        const yy = horizon + (R2() - .3) * 34, len = 60 + R2() * 240, xx = sunX + (R2() - .5) * PW * .7;
        sun += st(`M${(xx - len / 2).toFixed(0)} ${yy.toFixed(0)} h ${len.toFixed(0)}`, R2() < .5 ? '#f8d08a' : '#f0a271',
          (2 + R2() * 4).toFixed(1), `opacity="${(.35 + R2() * .4).toFixed(2)}"`);
      }
      out.push(`<g mask="url(#sky-mask)"><g filter="url(#paint-water)">${paint.join('')}</g>` +
        `<g filter="url(#paint-water)">${sun}</g><g class="sun">${disc}${disc2}</g>` +
        `<rect width="${PW}" height="${SH}" fill="url(#sky-shade)"/></g>`);
      sky.setAttribute('width', PW);
      sky.setAttribute('height', SH);
      sky.innerHTML = out.join('');
      requestAnimationFrame(() => sky.classList.add('risen'));
    }

    // ---- The tree: a bough with side branches, leaves and hanging vines ----
    {
      const R3 = rng(33), bark = [], leaves = [], vines = [];
      const hero = document.querySelector('.hero');
      // Measure where the words actually sit, not the full width of each block.
      const textRect = (e) => { const r = document.createRange(); r.selectNodeContents(e); return r.getBoundingClientRect(); };
      const tr = [...hero.querySelectorAll('.eyebrow, h1, .lede, .actions .btn')].map(textRect);
      const textL = Math.min(...tr.map((r) => r.left)) + scrollX - 24;
      const textR = Math.max(...tr.map((r) => r.right)) + scrollX + 24;
      const textTop = Math.min(...tr.map((r) => r.top)) + scrollY - 18;
      const maxLen = heroBottom - 60;
      const mainX = mLeft + x0;

      // A tapering limb drawn as a filled shape, with bark light and shadow.
      const limb = (pts, w0, w1) => {
        const L = [], Rt = [], n = pts.length;
        pts.forEach((pt, i) => {
          const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
          let tx = b[0] - a[0], ty = b[1] - a[1]; const m = Math.hypot(tx, ty) || 1; tx /= m; ty /= m;
          const w = (w0 + (w1 - w0) * i / (n - 1)) / 2;
          L.push([pt[0] - ty * w, pt[1] + tx * w]); Rt.push([pt[0] + ty * w, pt[1] - tx * w]);
        });
        const f = (q) => q.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L');
        const mid = 'M' + f(pts);
        bark.push(p(`M${f(L)} L${f(Rt.slice().reverse())} Z`, C.bark[1]));
        bark.push(st('M' + f(L), C.bark[0], Math.max(1.2, w0 * .22), 'opacity=".75"'));
        bark.push(st('M' + f(Rt), C.bark[3], Math.max(.8, w0 * .12), 'opacity=".6"'));
        // Bark streaks along the grain.
        for (let i = 1; i < n - 3; i += 2 + Math.floor(R3() * 3)) {
          const j = Math.min(n - 1, i + 2 + Math.floor(R3() * 3)), off = (R3() - .5) * (w0 + (w1 - w0) * i / n) * .5;
          bark.push(st(`M${pts[i][0].toFixed(1)} ${(pts[i][1] + off).toFixed(1)} L${pts[j][0].toFixed(1)} ${(pts[j][1] + off).toFixed(1)}`,
            R3() < .5 ? C.bark[0] : C.bark[2], .9 + R3(), 'opacity=".7"'));
        }
        return mid;
      };
      const leafy = (x, y, ang, k, delay) => leaves.push(
        `<g class="node" style="transform-origin:${x.toFixed(0)}px ${y.toFixed(0)}px;transition-delay:${delay.toFixed(2)}s">` +
        `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(0)}) scale(${k.toFixed(2)})">${leaf()}</g></g>`);
      const flower = (x, y, gold, k, delay) => leaves.push(
        `<g class="node" style="transform-origin:${x.toFixed(0)}px ${y.toFixed(0)}px;transition-delay:${delay.toFixed(2)}s">` +
        `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${k.toFixed(2)})">${blossom(gold)}</g></g>`);

      // Main bough.
      const end = PW * (narrow ? 1.02 : .96), bough = [];
      for (let X = -60; X <= end; X += 10) bough.push([X, boughY(X)]);
      limb(bough, boughW(-60), 3);
      const anchors = [];            // points vines can hang from
      bough.forEach(([X, Y], i) => { if (i % 3 === 0 && X > 0) anchors.push([X, Y + boughW(X) * .35, boughW(X)]); });

      // Side branches and twigs.
      const forks = narrow ? [.2, .48, .75] : [.14, .3, .47, .63, .8, .92];
      forks.forEach((f, k) => {
        const X0 = PW * f, Y0 = boughY(X0), dir = k % 2 ? -1 : 1;
        const len = (narrow ? 70 : 110) + R3() * (narrow ? 50 : 110);
        const pts = [];
        for (let t = 0; t <= 1.0001; t += .08) {
          pts.push([X0 + len * t, Y0 + dir * len * (.12 + .3 * t * t) * t + 4 * Math.sin(t * 7 + k)]);
        }
        limb(pts, boughW(X0) * .6, 1.4);
        pts.forEach(([x, y], i) => { if (i > 1 && i % 2 === 0) anchors.push([x, y, 3]); });
        // Leaves crowd toward the tip.
        pts.forEach(([x, y], i) => {
          if (i < 3) return;
          for (let q = 0; q < 3; q++) leafy(x, y, (q === 1 ? 30 : q ? 90 : -150) + (R3() - .5) * 80, .28 + R3() * .18, .2 + f * 1.2);
          if (R3() < .2) flower(x, y + 6, R3() < .4, .8, .5 + f * 1.2);
        });
        const [tx, ty] = pts[pts.length - 1];
        for (let q = 0; q < 5; q++) leafy(tx, ty, q * 72 + R3() * 30, .3 + R3() * .15, .3 + f * 1.2);
        // A twig off the side branch.
        const m = pts[Math.floor(pts.length * .5)], tw = [];
        for (let t = 0; t <= 1.0001; t += .2) tw.push([m[0] + 30 * t, m[1] - dir * 22 * t]);
        limb(tw, 2.4, .8);
        for (let q = 0; q < 3; q++) leafy(tw[5][0], tw[5][1], -60 + q * 60 + (R3() - .5) * 30, .26 + R3() * .1, .4 + f * 1.2);
      });
      // Leaves along the bough itself.
      bough.forEach(([X, Y], i) => {
        if (X < 0) return;
        leafy(X, Y + boughW(X) * .3, 40 + R3() * 100, .3 + R3() * .16, .2 + X / PW);
        if (R3() < .5) leafy(X + 4, Y - boughW(X) * .35, -40 - R3() * 100, .26 + R3() * .14, .25 + X / PW);
        if (R3() < .12) flower(X, Y + boughW(X) * .4 + 4, R3() < .4, .8, .6 + X / PW);
      });

      // Vines hanging from uneven points along the branches.
      anchors.sort((a, b2) => a[0] - b2[0]);
      let lastX = -999;
      anchors.forEach(([ax, ay]) => {
        if (ax - lastX < 18 + R3() * 34 || Math.abs(ax - mainX) < 30 || R3() < .12) return;
        lastX = ax;
        const overText = ax > textL && ax < textR;
        const L = overText ? Math.max(24, Math.min(textTop - ay, 40 + R3() * 60))
          : Math.min(maxLen - ay, 70 + R3() * (narrow ? 150 : 320));
        if (L < 20) return;
        const drift = (R3() - .5) * 26, sway = 3 + R3() * 5, ph = R3() * 6;
        const xAt = (t) => ax + drift * (t / L) ** 2 + sway * Math.sin(t / 38 + ph) * (t / L);
        let d = '';
        for (let t = 0; t <= L; t += 5) d += (d ? ' L' : 'M') + `${xAt(t).toFixed(1)} ${(ay + t).toFixed(1)}`;
        const delay = .5 + ax / PW * 1.2;
        vines.push(st(d, C.vine, 2.6, `pathLength="1" class="draw dangle" style="transition-delay:${delay.toFixed(2)}s"`));
        for (let t = 6; t < L - 3; t += 6 + R3() * 5) {
          const x = xAt(t), y = ay + t, side = Math.round(t / 9) % 2 ? 1 : -1, shrink = 1 - .45 * t / L;
          leafy(x, y, side > 0 ? 35 + R3() * 40 : 145 - R3() * 40, (.26 + R3() * .1) * shrink, delay + .3 + t / L * 1.3);
          if (R3() < .22) flower(x + side * 6, y + 3, R3() < .4, .7 + R3() * .3, delay + .6 + t / L * 1.3);
        }
        const ex = xAt(L), ey = ay + L;
        if (R3() < .8) {
          const gold = R3() < .4;
          [0, 1, 2].forEach((i) => flower(ex + (i - 1) * 5, ey + (i % 2) * 5, gold, .75 - i * .08, delay + 1.7));
        } else {
          leafy(ex, ey, 80 + (R3() - .5) * 30, .2, delay + 1.7);
        }
      });

      canopy.setAttribute('width', PW);
      canopy.setAttribute('height', Math.ceil(maxLen + 40));
      canopy.innerHTML = `<g filter="url(#paint)">${vines.join('')}</g>` +
        `<g class="bark" filter="url(#paint)">${bark.join('')}</g><g filter="url(#paint)">${leaves.join('')}</g>`;
      requestAnimationFrame(() => canopy.classList.add('grown'));
    }

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
    // The growing tip sits about 70% down the screen, easing to the very bottom
    // as you near the end so the vine always reaches the pond.
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const f = .72 + .28 * Math.min(1, scrollY / maxScroll) ** 4;
    const tip = reduce ? Infinity : scrollY + innerHeight * f - mTop;
    wrap.style.height = Math.max(0, Math.min(tip, y1 + 20)) + 'px';
    nodes.forEach((n) => n.el.classList.toggle('grown', tip >= n.y));
    // The pond fills in once its shoreline is well into view, which works on
    // any screen height even though little page remains below it.
    const pondTop = mTop + pondY;
    pond.classList.toggle('grown', reduce || scrollY + innerHeight * .85 >= pondTop);
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
