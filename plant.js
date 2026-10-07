// Paints the page in an oil-painting style: a sunrise sky, a vine that winds
// down the left from the top as you scroll (opening leaves and buds at each
// marked section), and a water-lily pond at the bottom.
(function () {
  const main = document.querySelector('main');
  const wrap = document.querySelector('.stem-wrap');
  const stemSvg = wrap.querySelector('svg');
  const svg = document.querySelector('.plant');
  const wrapR = wrap.cloneNode(true);
  wrapR.classList.add('stem-right');
  main.insertBefore(wrapR, wrap.nextSibling);
  const stemSvgR = wrapR.querySelector('svg');
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
    // Sky geometry, in page coordinates.
    const hero = document.querySelector('.hero');
    const heroBottom = hero.getBoundingClientRect().bottom + scrollY;
    const SH = Math.round(heroBottom);   // texture stops at the About line
    const horizon = SH * .8, sunX = PW * (narrow ? .9 : .76), sunR = narrow ? 26 : 40;
    y0 = -12;                       // the vine enters from the very top
    const GR = narrow ? 48 : 176;   // right edge of the vine's margin, in main coords
    const marks = [...document.querySelectorAll('[data-node]')];
    const PH = narrow ? 230 : 320;
    document.body.style.paddingBottom = PH + 'px';
    pondY = H;                      // pond begins where main ends
    y1 = H + (narrow ? 50 : 70);    // the vine dips into the water

    // ---- Vertical stem ----
    let d = '';
    for (let y = y0; y <= y1; y += 8) d += (d ? ' L' : 'M') + `${xOf(y).toFixed(1)} ${y.toFixed(1)}`;
    d += ` L${xOf(y1).toFixed(1)} ${y1.toFixed(1)}`;
    stemSvg.setAttribute('width', narrow ? 70 : 190);
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
    // Scale an ornament down so it stays inside the margin and off the text.
    const fitL = (x, side, k, reach) => {
      const room = side > 0 ? GR - x : x + mLeft - 4;
      return Math.max(0.3, Math.min(k, room / (reach * s)));
    };
    const L = { xOf, fit: fitL };
    const leafAt = (y, side, k, tilt, v = L) => {
      const x = v.xOf(y);
      k = v.fit(x, side, k, 90);
      add(y, x, y, `<g transform="translate(${x} ${y}) scale(${side * s * k} ${s * k})">` +
        st('M0 0 Q 14 -4 22 -16', C.stem, 3) +
        `<g transform="translate(22 -16) rotate(${tilt})">${leaf()}</g></g>`);
    };
    const budAt = (y, side, k = 1, v = L) => {
      const x = v.xOf(y);
      k = v.fit(x, side, k, 68);
      add(y, x, y, `<g transform="translate(${x} ${y}) scale(${side * s * k} ${s * k})">` +
        st('M0 0 C 16 -2, 30 -12, 36 -32', C.stem, 3) +
        `<g transform="translate(36 -32) rotate(18)">${bud()}</g>` +
        `<g transform="translate(14 -4) rotate(-150) scale(-.55 .55)">${leaf()}</g></g>`);
    };
    const curlAt = (y, side, v = L) => {
      const x = v.xOf(y);
      add(y, x, y, `<g transform="translate(${x} ${y}) scale(${side * s} ${s})">${tendril()}</g>`);
    };

    // Each ornament opens toward whichever side of the bend has more room.
    const roomy = (y) => (xOf(y) >= (narrow ? 28 : 96) ? -1 : 1);
    const ys = [];
    marks.forEach((m) => {
      const y = yOf(m), type = m.dataset.node, side = roomy(y);
      ys.push(y);
      if (type === 'pair') {
        leafAt(y, side, 1, -26);
        budAt(y + 14 * s, -side);
      } else if (type === 'flower' || m.tagName === 'H3') {
        budAt(y, side);
      } else {
        leafAt(y, side, 1.05, -28);
      }
    });

    // Filler leaves and tendrils so the vine feels alive between sections.
    let k = 0;
    for (let y = y0 + 90; y < pondY - 90; y += 105) {
      if (ys.some((m) => Math.abs(m - y) < 65)) continue;
      // Leaves sit on the outside of each bend; tendrils on the inside.
      const bend = roomy(y);
      if (k % 4 === 3) curlAt(y, -bend);
      else leafAt(y, bend, 0.55 + (k % 3) * 0.09, -18 - (k % 3) * 8);
      k++;
    }

    // ---- A second vine down the right margin (wider screens only) ----
    stemSvgR.innerHTML = '';
    if (!narrow) {
      const RM = 140, cx = W - RM / 2, AR = 18;
      const xOfR = (y) => cx + AR * Math.sin((y - y0) / 300 * Math.PI * 2 + 2.1) + AR * .35 * Math.sin((y - y0) / 83);
      const R = {
        xOf: xOfR,
        fit: (x, side, k, reach) => {
          const room = side > 0 ? PW - mLeft - x - 6 : x - (W - RM + 8);
          return Math.max(0.3, Math.min(k, room / (reach * s)));
        },
      };
      let dr = '';
      for (let y = y0; y <= y1; y += 8) dr += (dr ? ' L' : 'M') + `${xOfR(y).toFixed(1)} ${y.toFixed(1)}`;
      stemSvgR.setAttribute('width', W);
      stemSvgR.setAttribute('height', y1 + 40);
      stemSvgR.innerHTML = `<g filter="url(#paint)">` + st(dr, C.stem, 6 * s + 1) +
        st(dr, C.stemHi, 2 * s + .4, `transform="translate(${1.4 * s} 0)" opacity=".85"`) + `</g>`;
      const roomyR = (y) => (xOfR(y) >= cx ? -1 : 1);
      marks.forEach((m) => {
        const y = yOf(m) + 40;     // offset from the left vine so they don't mirror
        if (m.tagName === 'H2') budAt(y, roomyR(y), 1, R);
      });
      let j = 0;
      for (let y = y0 + 150; y < pondY - 90; y += 115) {
        if (ys.some((m) => Math.abs(m + 40 - y) < 60)) continue;
        const bend = roomyR(y);
        if (j % 4 === 1) curlAt(y, -bend, R);
        else leafAt(y, bend, 0.6 + (j % 3) * 0.1, -20 - (j % 3) * 7, R);
        j++;
      }
    }

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
        `linear-gradient(to bottom, ${stops.map(([c, y]) => `${c} ${Math.round(y)}px`).join(', ')})`;
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
    wrap.style.height = wrapR.style.height = Math.max(0, Math.min(tip, y1 + 20)) + 'px';
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
