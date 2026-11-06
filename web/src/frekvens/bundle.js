/* @ds-bundle: {"format":4,"namespace":"Frekvens","components":[{"name":"KeyButton"},{"name":"Keypad"},{"name":"HoldButton"},{"name":"SlideToStart"},{"name":"Rocker"},{"name":"Icon"},{"name":"Dial"},{"name":"Gauge"},{"name":"Slider"},{"name":"Switch"},{"name":"Segmented"},{"name":"Stepper"},{"name":"Wheel"},{"name":"VolumeWheel"},{"name":"Checkbox"},{"name":"RadioGroup"},{"name":"Select"},{"name":"Menu"},{"name":"Tabs"},{"name":"TextField"},{"name":"Calendar"},{"name":"Sheet"},{"name":"Toast"},{"name":"Banner"},{"name":"Tooltip"},{"name":"Timer"},{"name":"Stopwatch"},{"name":"Hourglass"},{"name":"Pendulum"},{"name":"MediaPlayer"},{"name":"AudioTrack"},{"name":"Ticker"},{"name":"SplitFlap"},{"name":"DotMatrix"},{"name":"DotGrid"},{"name":"StateMark"},{"name":"Steps"},{"name":"Grille"},{"name":"LED"},{"name":"LevelBars"},{"name":"BarMeter"},{"name":"LineChart"},{"name":"ProgressRing"},{"name":"Readout"},{"name":"Tile"},{"name":"Strip"},{"name":"CardStack"},{"name":"Cabinet"},{"name":"Pager"},{"name":"Deck"},{"name":"ListRow"},{"name":"Chip"},{"name":"Badge"},{"name":"Avatar"},{"name":"TopBar"},{"name":"TabBar"},{"name":"EmptyState"},{"name":"Skeleton"},{"name":"Message"},{"name":"Composer"},{"name":"Suggestions"},{"name":"VoiceOrb"},{"name":"DotLoader"},{"name":"AgentWidget"},{"name":"Render"},{"name":"Reveal"},{"name":"Stack"},{"name":"Grid"},{"name":"Text"},{"name":"ClickWheel"},{"name":"DiscCarousel"},{"name":"NumPad"},{"name":"Viewfinder"},{"name":"CaptureKey"},{"name":"Recorder"},{"name":"NoteEditor"},{"name":"Sidebar"},{"name":"DataTable"},{"name":"CommandBar"},{"name":"Notch"},{"name":"Viewport3D"},{"name":"Heatmap"},{"name":"SplitBar"},{"name":"Sparkline"},{"name":"HourStrip"},{"name":"PaymentCard"},{"name":"Dialog"},{"name":"FileDrop"},{"name":"ChoiceCards"},{"name":"Stat"},{"name":"UsageMeter"},{"name":"Timeline"},{"name":"Checklist"},{"name":"PromptBox"},{"name":"Clock"},{"name":"VUMeter"},{"name":"RotarySelector"},{"name":"Fader"},{"name":"Keycap"},{"name":"Calculator"},{"name":"PadGrid"},{"name":"TapeDeck"},{"name":"Board"},{"name":"Sortable"},{"name":"Blueprint"},{"name":"AreaChart"},{"name":"Scatter"},{"name":"RadarChart"},{"name":"DonutChart"},{"name":"Scope"},{"name":"VoicePosition"},{"name":"Beam"},{"name":"Aura"},{"name":"FlapBoard"}]} */
(function () {
  var R = window.React, h = R.createElement, useState = R.useState, useRef = R.useRef;

  var useIsoLayout = typeof window !== 'undefined' && R.useLayoutEffect ? R.useLayoutEffect : R.useEffect;
  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(' '); }
  function omit(o, keys) { var r = {}; for (var k in o) if (keys.indexOf(k) < 0) r[k] = o[k]; return r; }
  function range(n) { var a = []; for (var i = 0; i < n; i++) a.push(i); return a; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  /* controlled-or-uncontrolled value */
  function useValue(p, fallback) {
    var s = useState(p.defaultValue != null ? p.defaultValue : fallback);
    var v = p.value != null ? p.value : s[0];
    return [v, function (n) { if (p.value == null) s[1](n); if (p.onChange) p.onChange(n); }];
  }

  /* ---------- Icon: 24 grid, 2px stroke, square caps ---------- */
  var F = { fill: 'currentColor', stroke: 'none' };
  var ICONS = {
    play: [['path', Object.assign({ d: 'M7 4.5 19.5 12 7 19.5z' }, F)]],
    pause: [['rect', Object.assign({ x: 6, y: 5, width: 4, height: 14 }, F)], ['rect', Object.assign({ x: 14, y: 5, width: 4, height: 14 }, F)]],
    stop: [['rect', Object.assign({ x: 6, y: 6, width: 12, height: 12 }, F)]],
    rec: [['circle', Object.assign({ cx: 12, cy: 12, r: 7 }, F)]],
    plus: [['path', { d: 'M12 4v16M4 12h16' }]],
    minus: [['path', { d: 'M4 12h16' }]],
    'arrow-right': [['path', { d: 'M4 12h15M13 6l6 6-6 6' }]],
    'arrow-left': [['path', { d: 'M20 12H5M11 6l-6 6 6 6' }]],
    'arrow-up-right': [['path', { d: 'M7 17 17 7M9 7h8v8' }]],
    'chevron-down': [['path', { d: 'M6 9l6 6 6-6' }]],
    close: [['path', { d: 'M6 6l12 12M18 6 6 18' }]],
    check: [['path', { d: 'M4.5 12.5 9.5 17.5 19.5 6.5' }]],
    timer: [['circle', { cx: 12, cy: 13.5, r: 7.5 }], ['path', { d: 'M12 13.5V9M9 2.5h6' }]],
    power: [['path', { d: 'M12 3v8M7.1 6.4a7.5 7.5 0 1 0 9.8 0' }]],
    lock: [['rect', { x: 5, y: 11, width: 14, height: 9 }], ['path', { d: 'M8 11V8a4 4 0 0 1 8 0v3' }]],
    dots: [['circle', Object.assign({ cx: 6, cy: 6, r: 1.6 }, F)], ['circle', Object.assign({ cx: 12, cy: 6, r: 1.6 }, F)], ['circle', Object.assign({ cx: 18, cy: 6, r: 1.6 }, F)],
      ['circle', Object.assign({ cx: 6, cy: 12, r: 1.6 }, F)], ['circle', Object.assign({ cx: 12, cy: 12, r: 1.6 }, F)], ['circle', Object.assign({ cx: 18, cy: 12, r: 1.6 }, F)],
      ['circle', Object.assign({ cx: 6, cy: 18, r: 1.6 }, F)], ['circle', Object.assign({ cx: 12, cy: 18, r: 1.6 }, F)], ['circle', Object.assign({ cx: 18, cy: 18, r: 1.6 }, F)]],
    home: [['path', { d: 'M4 11 12 4l8 7v9H4z' }]],
    drop: [['path', { d: 'M12 3.5s6 6.6 6 10.5a6 6 0 0 1-12 0c0-3.9 6-10.5 6-10.5z' }]],
    flag: [['path', { d: 'M6 21V4h11l-2 4 2 4H6' }]],
    refresh: [['path', { d: 'M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4v4h-4' }]],
    mic: [['rect', { x: 9, y: 3, width: 6, height: 11, rx: 3 }], ['path', { d: 'M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21' }]],
    'arrow-up': [['path', { d: 'M12 20V5M6 11l6-6 6 6' }]],
    copy: [['rect', { x: 8, y: 8, width: 12, height: 12 }], ['path', { d: 'M16 8V4H4v12h4' }]],
    'volume-off': [['path', Object.assign({ d: 'M4 9h4l5-4v14l-5-4H4z' }, F)], ['path', { d: 'M16 9l6 6M22 9l-6 6' }]],
    expand: [['path', { d: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5' }]],
    volume: [['path', Object.assign({ d: 'M4 9h4l5-4v14l-5-4H4z' }, F)], ['path', { d: 'M16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11' }]],
    sun: [['circle', Object.assign({ cx: 12, cy: 12, r: 4.5 }, F)], ['path', { d: 'M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1' }]]
  };
  function Icon(p) {
    var s = p.size || 24, parts = ICONS[p.name] || [];
    return h('svg', {
      className: cx('frk-icon', p.className), width: s, height: s, viewBox: '0 0 24 24', fill: 'none',
      stroke: 'currentColor', strokeWidth: p.strokeWidth || 2, strokeLinecap: 'square', strokeLinejoin: 'miter',
      'aria-hidden': p.title ? undefined : true, role: p.title ? 'img' : undefined, focusable: 'false'
    }, p.title ? h('title', null, p.title) : null, parts.map(function (x, i) { return h(x[0], Object.assign({ key: i }, x[1])); }));
  }
  Icon.names = Object.keys(ICONS);

  /* ---------- KeyButton ---------- */
  function KeyButton(p) {
    var tone = p.tone || 'paper', size = p.size || 'm', shape = p.shape || 'square';
    var isz = size === 'xl' ? 48 : size === 'l' ? 32 : size === 's' ? 20 : 24;
    var rest = omit(p, ['tone', 'size', 'shape', 'label', 'icon', 'active', 'block', 'toggle', 'className', 'children']);
    return h('button', Object.assign({ type: 'button' }, rest, {
      className: cx('frk-key', 'frk-tone--' + tone, 'frk-key--' + size, 'frk-key--' + shape, p.block && 'frk-key--block', p.active && 'is-active', p.className),
      'aria-pressed': p.toggle ? !!p.active : undefined
    }),
      p.label ? h('span', { className: 'frk-key__label' }, p.label) : null,
      h('span', { className: 'frk-key__main' }, p.icon ? h(Icon, { name: p.icon, size: isz }) : null, p.children != null ? h('span', { className: 'frk-key__text' }, p.children) : null));
  }

  /* ---------- Keypad: flush TE-style key strip ---------- */
  function Keypad(p) {
    var cols = p.columns || (p.keys ? p.keys.length : 3);
    return h('div', { className: cx('frk-keypad', p.className), role: 'group', 'aria-label': p.label, style: { gridTemplateColumns: 'repeat(' + cols + ',1fr)', height: p.height } },
      (p.keys || []).map(function (k, i) {
        return h('button', {
          key: i, type: 'button', onClick: k.onClick, 'aria-label': k.ariaLabel, 'aria-pressed': k.active != null ? !!k.active : undefined,
          className: cx('frk-keypad__key', 'frk-tone--' + (k.tone || 'paper'), k.active && 'is-active')
        }, k.icon ? h(Icon, { name: k.icon, size: 28 }) : null, k.label ? h('span', { className: 'frk-keypad__label' }, k.label) : null);
      }));
  }

  /* ---------- Dial: black disc knob ---------- */
  function Dial(p) {
    var min = p.min || 0, max = p.max == null ? 8 : p.max, size = p.size || 160, span = (max - min) || 1;
    var st = useValue(p, min), v = st[0], set = function (n) { n = clamp(Math.round(n), min, max); if (n !== v) st[1](n); };
    var ref = useRef(null);
    var ang = (-135 + (v - min) / span * 270) * Math.PI / 180;
    function fromEvent(e) {
      var r = ref.current.getBoundingClientRect();
      var a = Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180 / Math.PI;
      set(min + (clamp(a, -135, 135) + 135) / 270 * span);
    }
    function key(e) {
      var k = e.key;
      if (k === 'ArrowUp' || k === 'ArrowRight') { set(v + 1); e.preventDefault(); }
      else if (k === 'ArrowDown' || k === 'ArrowLeft') { set(v - 1); e.preventDefault(); }
      else if (k === 'Home') { set(min); e.preventDefault(); } else if (k === 'End') { set(max); e.preventDefault(); }
    }
    var ticks = range(max - min + 1).map(function (i) {
      var a = (-135 + i / span * 270) * Math.PI / 180;
      return h('circle', { key: i, cx: 50 + 47 * Math.sin(a), cy: 50 - 47 * Math.cos(a), r: 1.5, className: cx('frk-dial__tick', i <= v - min && 'is-on') });
    });
    return h('div', { className: cx('frk-dial', 'frk-dial--' + (p.tone || 'ink'), p.className), style: { width: size } },
      h('div', {
        ref: ref, className: 'frk-dial__knob', role: 'slider', tabIndex: 0, 'aria-label': p.label || 'Dial',
        'aria-valuemin': min, 'aria-valuemax': max, 'aria-valuenow': v,
        onPointerDown: function (e) { e.currentTarget.setPointerCapture(e.pointerId); fromEvent(e); },
        onPointerMove: function (e) { if (e.buttons) fromEvent(e); }, onKeyDown: key, style: { width: size, height: size }
      },
        h('svg', { viewBox: '0 0 100 100', width: size, height: size, 'aria-hidden': true }, ticks,
          h('circle', { cx: 50, cy: 50, r: 41, className: 'frk-dial__disc' }),
          h('line', { x1: 50 + 4 * Math.sin(ang + 2.4), y1: 50 - 4 * Math.cos(ang + 2.4), x2: 50 + 14 * Math.sin(ang + 0.5), y2: 50 - 14 * Math.cos(ang + 0.5), className: 'frk-dial__needle' }),
          h('circle', { cx: 50 + 30 * Math.sin(ang), cy: 50 - 30 * Math.cos(ang), r: 4.2, className: 'frk-dial__dot' }))),
      p.label ? h('div', { className: 'frk-dial__label' }, p.label + ':' + v) : null);
  }

  /* ---------- Gauge: arc instrument ---------- */
  function Gauge(p) {
    var v = clamp(p.value == null ? 0 : p.value, 0, 100), w = p.width || 240, sw = p.thickness || 14;
    var r = 100, cxp = 120, cyp = 118, a0 = -62, a1 = 62;
    function pt(a) { var t = a * Math.PI / 180; return [cxp + r * Math.sin(t), cyp - r * Math.cos(t)]; }
    function arc(from, to) { var s = pt(from), e = pt(to); return 'M' + s[0] + ' ' + s[1] + ' A' + r + ' ' + r + ' 0 0 1 ' + e[0] + ' ' + e[1]; }
    var av = a0 + (a1 - a0) * v / 100, dot = pt(av);
    return h('div', { className: cx('frk-gauge', p.className), role: 'meter', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': v, 'aria-label': p.label || 'Nivel', style: { width: w } },
      h('svg', { viewBox: '0 0 240 ' + (cyp - r * Math.cos(a1 * Math.PI / 180) + sw), width: w, 'aria-hidden': true },
        h('path', { d: arc(a0, a1), className: 'frk-gauge__track', strokeWidth: sw }),
        h('path', { d: arc(a0, av), className: 'frk-gauge__fill', strokeWidth: sw }),
        h('circle', { cx: dot[0], cy: dot[1], r: sw * 0.42, className: 'frk-gauge__dot' })),
      p.caption ? h('div', { className: 'frk-gauge__caption' }, p.caption) : null);
  }

  /* ---------- Slider: track + rams dot ---------- */
  function Slider(p) {
    var min = p.min || 0, max = p.max == null ? 100 : p.max, step = p.step || 1, stops = p.stops;
    var st = useValue(p, min), v = st[0], pct = (v - min) / ((max - min) || 1) * 100;
    return h('div', { className: cx('frk-slider', p.className) },
      p.label ? h('div', { className: 'frk-slider__label' }, p.label) : null,
      h('div', { className: 'frk-slider__track' },
        h('span', { className: 'frk-slider__end frk-slider__end--a' }), h('span', { className: 'frk-slider__end frk-slider__end--b' }),
        h('span', { className: 'frk-slider__thumb', style: { left: 'calc(16px + (100% - 32px) * ' + (pct / 100) + ')' } }),
        h('input', { type: 'range', min: min, max: max, step: step, value: v, 'aria-label': p.label || 'Valor', 'aria-valuetext': p.format ? p.format(v) : undefined, onChange: function (e) { st[1](Number(e.target.value)); } })),
      stops ? h('div', { className: 'frk-slider__stops' }, stops.map(function (s, i) { return h('span', { key: i }, s); })) : null);
  }

  /* ---------- Switch ---------- */
  /* ---------- useFollow: muelle que se pega a un rectángulo y conserva el impulso al cambiar de destino
     (de Follow, stageshow/benjitaylor: k 0.25, amortiguación 2·√k·0.95, paso fijo de 60 Hz). Una transición CSS
     vuelve a arrancar desde parado en cada cambio; esto reengancha desde la posición y velocidad actuales. ---------- */
  function useFollow(target, opts) {
    var ref = useRef(null), st = useRef({ c: null, v: { x: 0, y: 0, w: 0, h: 0 }, raf: 0, t: null, prev: 0, rem: 0 }), k = (opts && opts.stiffness) || 0.25, damp = 2 * Math.sqrt(k) * 0.95, keys = ['x', 'y', 'w', 'h'];
    function paint(c) { var el = ref.current; if (!el) return; el.style.transform = 'translate(' + c.x.toFixed(2) + 'px,' + c.y.toFixed(2) + 'px)'; el.style.width = c.w.toFixed(2) + 'px'; if (c.h) el.style.height = c.h.toFixed(2) + 'px'; }
    useIsoLayout(function () {
      var s = st.current; s.t = target; if (!target) return;
      if (!s.c || reduced() || (opts && opts.instant)) { s.c = Object.assign({}, target); s.v = { x: 0, y: 0, w: 0, h: 0 }; paint(s.c); return; }
      if (s.raf) return;
      s.prev = performance.now(); s.rem = 0;
      function step(now) {
        var t = s.t; s.rem += Math.min(100, now - s.prev); s.prev = now;
        while (s.rem >= 16.667) { keys.forEach(function (q) { s.v[q] += ((t[q] || 0) - (s.c[q] || 0)) * k - s.v[q] * damp; s.c[q] = (s.c[q] || 0) + s.v[q]; }); s.rem -= 16.667; }
        paint(s.c);
        var rest = keys.every(function (q) { return Math.abs((t[q] || 0) - (s.c[q] || 0)) < 0.2 && Math.abs(s.v[q]) < 0.05; });
        if (rest) { s.c = Object.assign({}, t); paint(s.c); s.raf = 0; return; }
        s.raf = requestAnimationFrame(step);
      }
      s.raf = requestAnimationFrame(step);
    }, [target && target.x, target && target.y, target && target.w, target && target.h]);
    useEffect(function () { return function () { cancelAnimationFrame(st.current.raf); }; }, []);
    return ref;
  }

  function Switch(p) {
    var st = useState(!!p.defaultChecked), on = p.checked != null ? p.checked : st[0], lid = R.useId ? R.useId() : null;
    function toggle() { if (p.checked == null) st[1](!on); if (p.onChange) p.onChange(!on); if (navigator.vibrate) try { navigator.vibrate(6); } catch (e) {} }
    var sw = h('button', { type: 'button', role: 'switch', 'aria-checked': on, 'aria-label': p.showLabel ? undefined : p.label, 'aria-labelledby': p.showLabel ? lid : undefined, disabled: p.disabled, onClick: toggle, className: cx('frk-switch', on && 'is-on', !p.showLabel && p.className) },
      h('span', { className: 'frk-switch__text frk-switch__text--on', 'aria-hidden': true }, p.onText || 'ON'),
      h('span', { className: 'frk-switch__text frk-switch__text--off', 'aria-hidden': true }, p.offText || 'OFF'),
      h('span', { className: 'frk-switch__dot', 'aria-hidden': true }));
    return p.showLabel ? h('div', { className: cx('frk-switchrow', p.className) }, h('span', { id: lid, className: 'frk-switchrow__label', onClick: p.disabled ? undefined : toggle }, p.label), sw) : sw;
  }

  /* ---------- Segmented: pill toggle con disco que viaja ---------- */
  function Segmented(p) {
    var opts = (p.options || []).map(function (o) { return typeof o === 'string' ? { value: o, label: o } : o; });
    var st = useValue(p, opts[0] && opts[0].value), v = st[0], box = useRef(null), th = useState(null), thumb = th[0], setThumb = th[1], first = useRef(true);
    var fref = useFollow(thumb);
    useIsoLayout(function () {
      var el = box.current; if (!el) return;
      function m() { var on = el.querySelector('[aria-checked="true"]'); if (on) setThumb({ x: on.offsetLeft, w: on.offsetWidth, h: on.offsetHeight, y: on.offsetTop }); }
      m(); var ro = window.ResizeObserver ? new ResizeObserver(m) : null; ro && ro.observe(el); return function () { ro && ro.disconnect(); };
    }, [v, opts.length]);
    function key(e) { var i = 0; opts.forEach(function (o, k) { if (o.value === v) i = k; }); var d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!d) return; e.preventDefault(); var n = (i + d + opts.length) % opts.length; st[1](opts[n].value); var bs = box.current.querySelectorAll('[role=radio]'); bs[n] && bs[n].focus(); }
    return h('div', { ref: box, className: cx('frk-seg', thumb && 'has-thumb', p.className), role: 'radiogroup', 'aria-label': p.label, onKeyDown: key },
      thumb ? h('span', { ref: fref, className: 'frk-seg__thumb', 'aria-hidden': true }) : null,
      opts.map(function (o) {
        var sel = o.value === v;
        return h('button', { key: o.value, type: 'button', role: 'radio', tabIndex: sel ? 0 : -1, 'aria-checked': sel, 'aria-label': o.ariaLabel, className: cx('frk-seg__opt', sel && 'is-on'), onClick: function () { st[1](o.value); } },
          o.icon ? h(Icon, { name: o.icon, size: 18 }) : null, o.label ? h('span', null, o.label) : null);
      }));
  }

  /* ---------- DotMatrix: glyphs & shapes in dots ---------- */
  var GLYPH = {
    '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'], '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
    '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'], '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
    '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'], '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
    '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'], '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
    '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'], '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
    ':': ['0', '0', '1', '0', '1', '0', '0'], '.': ['0', '0', '0', '0', '0', '0', '1'], '°': ['010', '101', '010', '000', '000', '000', '000'],
    '%': ['11001', '11010', '00010', '00100', '01000', '01011', '10011'], '-': ['000', '000', '000', '111', '000', '000', '000'], ' ': ['00', '00', '00', '00', '00', '00', '00']
  };
  function textRows(str) {
    var rows = ['', '', '', '', '', '', ''];
    String(str).split('').forEach(function (ch, i) {
      var g = GLYPH[ch] || GLYPH[' '];
      for (var r = 0; r < 7; r++) rows[r] += (i ? '0' : '') + g[r];
    });
    return rows;
  }
  function shapeRows(name, n) {
    n = n || 15; var rows = [], c = (n - 1) / 2;
    for (var y = 0; y < n; y++) {
      var row = '';
      for (var x = 0; x < n; x++) {
        var dx = x - c, dy = y - c, d = Math.sqrt(dx * dx + dy * dy), on = false;
        if (name === 'sun') {
          on = d <= c * 0.55;
          for (var k = 0; k < 8; k++) { var a = k * Math.PI / 4, rx = c + c * 0.9 * Math.sin(a), ry = c - c * 0.9 * Math.cos(a); if (Math.abs(x - rx) <= 0.75 && Math.abs(y - ry) <= 0.75) on = true; }
        } else if (name === 'cloud') {
          var yy = y - n * 0.22;
          on = (Math.hypot(x - n * 0.33, yy - n * 0.42) <= n * 0.2) || (Math.hypot(x - n * 0.58, yy - n * 0.33) <= n * 0.25) || (Math.hypot(x - n * 0.78, yy - n * 0.47) <= n * 0.16) || (yy >= n * 0.42 && yy <= n * 0.6 && x >= n * 0.16 && x <= n * 0.9);
        } else if (name === 'drop') {
          var cy2 = c + n * 0.15; on = Math.hypot(dx, y - cy2) <= n * 0.33 || (y < cy2 && y >= 1 && Math.abs(dx) <= (y - 1) / (cy2 - 1) * n * 0.33 * 0.95);
        } else if (name === 'ring') {
          on = d <= c + 0.2 && d >= c - 1.6;
        } else if (name === 'disc') {
          on = d <= c + 0.2;
        } else if (name === 'heart') {
          var X = dx / c * 1.25, Y = -dy / c * 1.25 + 0.25; on = Math.pow(X * X + Y * Y - 1, 3) - X * X * Y * Y * Y <= 0;
        }
        row += on ? '1' : '0';
      }
      rows.push(row);
    }
    return rows;
  }
  function DotMatrix(p) {
    var rows = p.rows || (p.text != null ? textRows(p.text) : shapeRows(p.shape || 'sun', p.grid || 15));
    var dot = p.dot || 6, pitch = p.pitch || 10, H = rows.length, W = rows.reduce(function (m, r) { return Math.max(m, r.length); }, 0);
    var ps = useState(null), ptr = ps[0], setPtr = ps[1], reach = pitch * 3.2;
    var dots = [];
    rows.forEach(function (r, y) {
      for (var x = 0; x < W; x++) {
        var on = r[x] === '1' || r[x] === '#';
        var px = x * pitch + pitch / 2, py = y * pitch + pitch / 2, rr = dot / 2;
        if (ptr) { var dd = Math.hypot(px - ptr[0], py - ptr[1]); if (dd < reach) rr = rr * (1 + 0.6 * (1 - dd / reach)); }
        if (on || p.showOff) dots.push(h('circle', { key: x + '-' + y, cx: px, cy: py, r: rr, className: on ? 'frk-dm__on' : 'frk-dm__off' }));
      }
    });
    return h('svg', {
      className: cx('frk-dm', 'frk-dm--' + (p.tone || 'ink'), p.className), width: W * pitch, height: H * pitch, viewBox: '0 0 ' + W * pitch + ' ' + H * pitch,
      role: 'img', 'aria-label': p.label || (p.text != null ? String(p.text) : p.shape),
      onPointerMove: p.reactive ? function (e) { var b = e.currentTarget.getBoundingClientRect(); setPtr([(e.clientX - b.left) * (W * pitch / b.width), (e.clientY - b.top) * (H * pitch / b.height)]); } : undefined,
      onPointerLeave: p.reactive ? function () { setPtr(null); } : undefined
    }, dots);
  }

  /* ---------- DotGrid: n of m discs ---------- */
  function DotGrid(p) {
    var total = p.total || 20, cols = p.columns || 4, mode = p.select, size = p.size || (mode ? 56 : 48), gap = p.gap == null ? (mode ? 10 : 8) : p.gap;
    var sel = useValue(p, mode === 'many' ? [] : null), v = sel[0], hv = useState(-1), hover = hv[0], fc = useState(0), foc = fc[0], refs = useRef([]);
    if (!mode) {
      var filled = clamp(p.filled || 0, 0, total);
      return h('div', { className: cx('frk-dotgrid', 'frk-dotgrid--' + (p.tone || 'rams'), p.className), role: 'img', 'aria-label': p.label || (filled + ' de ' + total), style: { gridTemplateColumns: 'repeat(' + cols + ',' + size + 'px)', gap: gap } },
        range(total).map(function (i) { return h('span', { key: i, className: cx('frk-dotgrid__dot', i < filled && 'is-on'), style: { width: size, height: size } }); }));
    }
    var taken = p.disabled || [], labels = p.labels || [];
    function isOn(i) { return mode === 'many' ? (v || []).indexOf(i) >= 0 : v === i; }
    function toggle(i) { if (taken.indexOf(i) >= 0) return; var n = mode === 'many' ? (isOn(i) ? v.filter(function (x) { return x !== i; }) : (v || []).concat([i]).slice(-(p.max || total))) : (v === i && p.deselect !== false ? null : i); sel[1](n); if (navigator.vibrate) try { navigator.vibrate(8); } catch (e) {} }
    function move(i) { i = clamp(i, 0, total - 1); fc[1](i); var el = refs.current[i]; el && el.focus(); }
    function dist(i) { if (hover < 0) return 9; var a = [i % cols, Math.floor(i / cols)], b = [hover % cols, Math.floor(hover / cols)]; return Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1])); }
    var count = mode === 'many' ? (v || []).length : v == null ? 0 : 1;
    return h('div', { className: cx('frk-dotgrid', 'frk-dotgrid--pick', 'frk-dotgrid--' + (p.tone || 'klein'), p.className) },
      h('div', { role: 'group', 'aria-label': p.label || 'Elige', className: 'frk-dotgrid__grid', style: { gridTemplateColumns: 'repeat(' + cols + ',' + size + 'px)', gap: gap }, onPointerLeave: function () { hv[1](-1); } },
        range(total).map(function (i) {
          var off = taken.indexOf(i) >= 0, on = isOn(i), d = dist(i), l = labels[i];
          return h('button', { key: i, type: 'button', ref: function (el) { refs.current[i] = el; }, tabIndex: i === foc ? 0 : -1, 'aria-pressed': on, 'aria-disabled': off || undefined,
            'aria-label': (l != null ? String(l) : 'Plaza ' + (i + 1)) + (off ? ', ocupada' : ''),
            className: cx('frk-dotgrid__dot', on && 'is-on', off && 'is-taken', d === 0 && !off && 'is-hover', d === 1 && 'is-near'),
            style: { width: size, height: size }, onPointerEnter: function () { hv[1](i); }, onClick: function () { fc[1](i); toggle(i); },
            onKeyDown: function (e) { var k = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }[e.key]; if (k) { e.preventDefault(); move(i + k); } if (e.key === 'Home') { e.preventDefault(); move(0); } if (e.key === 'End') { e.preventDefault(); move(total - 1); } } },
            p.showLabels && l != null ? h('span', { className: 'frk-dotgrid__lbl' }, l) : null);
        })),
      p.caption !== false ? h('div', { className: 'frk-dotgrid__cap', 'aria-live': 'polite' }, p.caption || (count ? count + (count === 1 ? ' elegida' : ' elegidas') : 'Toca para elegir')) : null);
  }

  /* ---------- StateMark: ring · dots · disc ---------- */
  function StateMark(p) {
    var s = p.size || 24, st = p.state || 'empty', inner;
    if (st === 'empty') inner = h('circle', { cx: 12, cy: 12, r: 10, fill: 'none', stroke: 'currentColor', strokeWidth: 2.4 });
    else if (st === 'full') inner = h('circle', { cx: 12, cy: 12, r: 11, fill: 'currentColor' });
    else inner = [[6, 3], [12, 3], [18, 3], [3, 8], [9, 8], [15, 8], [21, 8], [6, 13], [12, 13], [18, 13], [3, 18], [9, 18], [15, 18], [21, 18], [9, 22.5], [15, 22.5]].map(function (q, i) { return h('circle', { key: i, cx: q[0], cy: q[1] - 0.8, r: 1.6, fill: 'currentColor' }); });
    var names = { empty: 'Pendiente', partial: 'En curso', full: 'Hecho' };
    return h('span', { className: cx('frk-state', p.className), title: p.title },
      h('svg', p.label === '' ? { width: s, height: s, viewBox: '0 0 24 24', 'aria-hidden': true } : { width: s, height: s, viewBox: '0 0 24 24', role: 'img', 'aria-label': p.label || names[st] }, inner),
      p.children != null ? h('span', { className: 'frk-state__text' }, p.children) : null);
  }

  /* ---------- LevelBars: battery-style vertical rules ---------- */
  function LevelBars(p) {
    var n = p.count || 20, v = clamp(p.value == null ? 0 : p.value, 0, 100), on = Math.round(n * v / 100);
    return h('div', { className: cx('frk-levels', p.className), role: 'meter', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': v, 'aria-label': p.label || 'Nivel', style: { height: p.height || 64 } },
      range(n).map(function (i) { return h('span', { key: i, className: cx('frk-levels__bar', i < on && 'is-on') }); }));
  }

  /* ---------- BarMeter: pill bars, one active, hatched forecast ---------- */
  function BarMeter(p) {
    var data = p.data || [], mx = Math.max.apply(null, data.map(function (d) { return d.value; }).concat([1])), H = p.height || 160, w = p.barWidth || 40;
    return h('div', { className: cx('frk-bars', p.className), role: 'img', 'aria-label': p.label || data.map(function (d) { return d.label + ' ' + d.value; }).join(', ') },
      data.map(function (d, i) {
        return h('div', { key: i, className: 'frk-bars__col' },
          h('div', { className: 'frk-bars__slot', style: { height: H, width: w } },
            h('span', { className: cx('frk-bars__bar', i === p.active && 'is-on', d.hatched && 'is-hatched'), style: { height: Math.max(w, d.value / mx * H) } })),
          h('span', { className: cx('frk-bars__lbl', i === p.active && 'is-on') }, d.label));
      }));
  }

  /* ---------- Readout: dot numerals + mono label ---------- */
  function Readout(p) {
    return h('div', { className: cx('frk-readout', 'frk-readout--' + (p.size || 'hero'), p.className) },
      p.label ? h('div', { className: 'frk-readout__label' }, p.label) : null,
      h('div', { className: 'frk-readout__value', 'aria-live': p.live ? 'polite' : undefined }, p.value, p.unit ? h('span', { className: 'frk-readout__unit' }, p.unit) : null),
      p.meta ? h('div', { className: 'frk-readout__meta' }, p.meta) : null);
  }

  /* ---------- Tile: widget card ---------- */
  function Tile(p) {
    var Tag = p.onClick ? 'button' : 'div';
    return h(Tag, { type: p.onClick ? 'button' : undefined, onClick: p.onClick, className: cx('frk-tile', 'frk-tone--' + (p.tone || 'surface'), p.className), style: { minHeight: p.height } },
      h('div', { className: 'frk-tile__head' }, h('div', { className: 'frk-tile__title' }, p.title, p.subtitle ? h('span', { className: 'frk-tile__sub' }, p.subtitle) : null),
        p.meta ? h('span', { className: 'frk-tile__meta' }, p.meta) : null),
      p.children ? h('div', { className: 'frk-tile__art' }, p.children) : h('div', { className: 'frk-tile__art' }),
      p.value != null ? h('div', { className: 'frk-tile__value' }, p.value) : null);
  }

  /* ---------- Strip: horizontal instrument row ---------- */
  function Strip(p) {
    return h('div', { className: cx('frk-strip', 'frk-tone--' + (p.tone || 'surface'), p.className) },
      h('div', { className: 'frk-strip__read' }, p.title ? h('div', { className: 'frk-strip__title' }, p.title) : null, h('div', { className: 'frk-strip__value' }, p.value)),
      p.children ? h('div', { className: 'frk-strip__inst' }, p.children) : null);
  }

  /* ---------- ListRow: hairline row, big index ---------- */
  function ListRow(p) {
    var Tag = p.onClick ? 'button' : 'div';
    return h(Tag, { type: p.onClick ? 'button' : undefined, onClick: p.onClick, className: cx('frk-row', p.className) },
      h('span', { className: 'frk-row__lead' }, p.icon ? h(Icon, { name: p.icon, size: 28 }) : p.index),
      h('span', { className: 'frk-row__body' }, h('span', { className: 'frk-row__title' }, p.title), p.detail ? h('span', { className: 'frk-row__detail' }, p.detail) : null),
      p.value != null ? h('span', { className: 'frk-row__value' }, p.value) : null);
  }

  /* ---------- Chip: mono pill ---------- */
  function Chip(p) {
    return h('span', { className: cx('frk-chip', 'frk-tone--' + (p.tone || 'well'), p.square && 'frk-chip--sq', p.className) },
      p.dot ? h('span', { className: 'frk-chip__dot' }) : null, p.children);
  }


  /* ================= overlays, inputs, motion ================= */
  var useEffect = R.useEffect, useId = R.useId || function () { var r = useRef(null); if (!r.current) r.current = 'frk' + Math.random().toString(36).slice(2, 8); return r.current; };
  function norm(opts) { return (opts || []).map(function (o) { return typeof o === 'string' ? { value: o, label: o } : o; }); }
  function reduced() { return typeof window !== 'undefined' && !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }
  /* keep an overlay mounted through its exit animation */
  function usePresence(open, ms) {
    var s = useState(open), mounted = s[0], setMounted = s[1];
    var v = useState(false), shown = v[0], setShown = v[1];
    useEffect(function () {
      if (open) { setMounted(true); var r = requestAnimationFrame(function () { requestAnimationFrame(function () { setShown(true); }); }); return function () { cancelAnimationFrame(r); }; }
      setShown(false); var t = setTimeout(function () { setMounted(false); }, reduced() ? 0 : ms); return function () { clearTimeout(t); };
    }, [open]);
    return [mounted, shown];
  }
  function useOutside(ref, active, cb) {
    useEffect(function () {
      if (!active) return;
      function f(e) { if (ref.current && !ref.current.contains(e.target)) cb(); }
      document.addEventListener('pointerdown', f); return function () { document.removeEventListener('pointerdown', f); };
    }, [active]);
  }

  /* ---------- Select: listbox dropdown, focus stays on the trigger ---------- */
  function Select(p) {
    var opts = norm(p.options), id = useId();
    var st = useValue(p, p.placeholder ? null : (opts[0] && opts[0].value)), v = st[0];
    var o = useState(!!p.defaultOpen), open = o[0], setOpen = o[1];
    var a = useState(0), act = a[0], setAct = a[1];
    var wrap = useRef(null), btn = useRef(null), typed = useRef({ s: '', t: 0 });
    var pres = usePresence(open, 150);
    useOutside(wrap, open, function () { setOpen(false); });
    var cur = -1; opts.forEach(function (x, i) { if (x.value === v) cur = i; });
    function show() { setAct(cur < 0 ? 0 : cur); setOpen(true); }
    function choose(i) { if (opts[i].disabled) return; st[1](opts[i].value); setOpen(false); btn.current && btn.current.focus(); }
    function move(d) { var n = act; for (var k = 0; k < opts.length; k++) { n = (n + d + opts.length) % opts.length; if (!opts[n].disabled) break; } setAct(n); }
    function key(e) {
      var k = e.key;
      if (!open) { if (k === 'ArrowDown' || k === 'ArrowUp' || k === 'Enter' || k === ' ') { e.preventDefault(); show(); } return; }
      if (k === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (k === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (k === 'Home') { e.preventDefault(); setAct(0); } else if (k === 'End') { e.preventDefault(); setAct(opts.length - 1); }
      else if (k === 'Enter' || k === ' ') { e.preventDefault(); choose(act); }
      else if (k === 'Escape') { e.preventDefault(); setOpen(false); }
      else if (k === 'Tab') { setOpen(false); }
      else if (k.length === 1) {
        var now = Date.now(), t = typed.current; t.s = (now - t.t > 600 ? '' : t.s) + k.toLowerCase(); t.t = now;
        for (var i = 0; i < opts.length; i++) if (String(opts[i].label).toLowerCase().indexOf(t.s) === 0) { setAct(i); break; }
      }
    }
    var sel = cur >= 0 ? opts[cur] : null;
    return h('div', { ref: wrap, className: cx('frk-select', p.block && 'frk-select--block', p.className) },
      p.label ? h('span', { className: 'frk-field__label', id: id + '-l' }, p.label) : null,
      h('button', {
        ref: btn, type: 'button', role: 'combobox', className: cx('frk-select__trigger', open && 'is-open'), disabled: p.disabled,
        'aria-haspopup': 'listbox', 'aria-expanded': open, 'aria-controls': id + '-list', 'aria-labelledby': p.label ? id + '-l ' + id + '-v' : undefined,
        'aria-activedescendant': open ? id + '-o' + act : undefined, 'data-open': open ? '' : undefined,
        onClick: function () { open ? setOpen(false) : show(); }, onKeyDown: key
      },
        h('span', { id: id + '-v', className: cx('frk-select__value', !sel && 'is-placeholder') }, sel ? sel.label : (p.placeholder || '')),
        h(Icon, { name: 'chevron-down', size: 20, className: 'frk-select__chev' })),
      pres[0] ? h('ul', { id: id + '-list', role: 'listbox', tabIndex: -1, 'aria-labelledby': p.label ? id + '-l' : undefined, className: cx('frk-pop', 'frk-select__list', pres[1] && open && 'is-in') },
        opts.map(function (x, i) {
          return h('li', {
            key: x.value, id: id + '-o' + i, role: 'option', 'aria-selected': x.value === v, 'aria-disabled': x.disabled || undefined,
            className: cx('frk-select__opt', i === act && 'is-active', x.value === v && 'is-selected'), style: { transitionDelay: (pres[1] ? i * 25 : 0) + 'ms' },
            onPointerEnter: function () { setAct(i); }, onPointerDown: function (e) { e.preventDefault(); }, onClick: function () { choose(i); }
          }, h('span', null, x.label), x.meta ? h('span', { className: 'frk-select__meta' }, x.meta) : null, x.value === v ? h(Icon, { name: 'check', size: 18 }) : null);
        })) : null,
      p.hint ? h('span', { className: 'frk-field__hint' }, p.hint) : null);
  }

  /* ---------- Menu: action popover, roving focus ---------- */
  function Menu(p) {
    var items = p.items || [], id = useId();
    var o = useState(!!p.defaultOpen), open = o[0], setOpen = o[1];
    var wrap = useRef(null), btn = useRef(null), list = useRef(null);
    var pres = usePresence(open, 150);
    useOutside(wrap, open, function () { setOpen(false); });
    useEffect(function () { if (open && pres[0] && list.current) { var f = list.current.querySelector('[role=menuitem]:not([aria-disabled])'); f && f.focus(); } }, [open, pres[0]]);
    function close(back) { setOpen(false); if (back && btn.current) btn.current.focus(); }
    function key(e) {
      var els = Array.prototype.slice.call(list.current.querySelectorAll('[role=menuitem]:not([aria-disabled])')), i = els.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); els[(i + 1) % els.length].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); els[(i - 1 + els.length) % els.length].focus(); }
      else if (e.key === 'Home') { e.preventDefault(); els[0].focus(); } else if (e.key === 'End') { e.preventDefault(); els[els.length - 1].focus(); }
      else if (e.key === 'Escape') { e.preventDefault(); close(true); } else if (e.key === 'Tab') { close(false); }
    }
    return h('div', { ref: wrap, className: cx('frk-menu', 'frk-menu--' + (p.align || 'start'), p.className) },
      h('button', {
        ref: btn, type: 'button', className: cx('frk-key', 'frk-tone--' + (p.tone || 'paper'), 'frk-key--s', 'frk-key--round', 'frk-menu__trigger'),
        'aria-haspopup': 'menu', 'aria-expanded': open, 'aria-controls': id, 'aria-label': p.label || 'Más opciones', 'data-open': open ? '' : undefined,
        onClick: function () { setOpen(!open); }, onKeyDown: function (e) { if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); } }
      }, h('span', { className: 'frk-key__main' }, h(Icon, { name: p.icon || 'dots', size: 20 }))),
      pres[0] ? h('div', { ref: list, id: id, role: 'menu', 'aria-label': p.label, onKeyDown: key, className: cx('frk-pop', 'frk-menu__list', pres[1] && open && 'is-in') },
        items.map(function (it, i) {
          if (it.separator) return h('div', { key: 's' + i, role: 'separator', className: 'frk-menu__sep' });
          return h('button', {
            key: i, type: 'button', role: 'menuitem', tabIndex: -1, 'aria-disabled': it.disabled || undefined,
            className: cx('frk-menu__item', it.danger && 'is-danger'), style: { transitionDelay: (pres[1] ? i * 25 : 0) + 'ms' },
            onClick: function () { if (it.disabled) return; it.onSelect && it.onSelect(); close(true); }
          }, it.icon ? h(Icon, { name: it.icon, size: 20 }) : h('span', { className: 'frk-menu__noicon' }), h('span', null, it.label), it.shortcut ? h('span', { className: 'frk-menu__kbd' }, it.shortcut) : null);
        })) : null);
  }

  /* ---------- Sheet: bottom sheet, modal, drag to dismiss ---------- */
  function Sheet(p) {
    var pres = usePresence(!!p.open, 260), id = useId();
    var panel = useRef(null), back = useRef(null), drag = useRef(null);
    var d = useState(0), dy = d[0], setDy = d[1];
    useEffect(function () {
      if (!p.open) return;
      back.current = document.activeElement;
      var t = setTimeout(function () { var f = panel.current && panel.current.querySelector('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'); (f || panel.current) && (f || panel.current).focus(); }, 30);
      return function () { clearTimeout(t); if (back.current && back.current.focus) back.current.focus(); };
    }, [p.open]);
    if (!pres[0]) return null;
    function close() { p.onClose && p.onClose(); }
    function key(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      if (e.key === 'Tab') {
        var f = panel.current.querySelectorAll('button:not([disabled]),[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'); if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    function down(e) { drag.current = { y: e.clientY }; e.currentTarget.setPointerCapture(e.pointerId); }
    function mv(e) { if (drag.current) setDy(Math.max(0, e.clientY - drag.current.y)); }
    function up() { if (!drag.current) return; drag.current = null; if (dy > 96) { setDy(0); close(); } else setDy(0); }
    var inn = pres[1] && p.open;
    return h('div', { className: cx('frk-sheet', inn && 'is-in', p.inline && 'frk-sheet--inline'), onKeyDown: key },
      h('div', { className: 'frk-sheet__scrim', onClick: close, 'aria-hidden': true }),
      h('div', {
        ref: panel, role: 'dialog', 'aria-modal': true, 'aria-labelledby': p.title ? id : undefined, 'aria-label': p.title ? undefined : p.label, tabIndex: -1,
        className: cx('frk-sheet__panel', drag.current && 'is-dragging', 'frk-tone--' + (p.tone || 'surface')), style: dy ? { transform: 'translateY(' + dy + 'px)' } : undefined
      },
        h('div', { className: 'frk-sheet__grab', onPointerDown: down, onPointerMove: mv, onPointerUp: up, onPointerCancel: up, 'aria-hidden': true }, h('span', null)),
        p.title ? h('div', { className: 'frk-sheet__head' }, h('h2', { id: id, className: 'frk-sheet__title' }, p.title),
          h('button', { type: 'button', className: 'frk-key frk-tone--well frk-key--s frk-key--round', 'aria-label': 'Cerrar', onClick: close }, h('span', { className: 'frk-key__main' }, h(Icon, { name: 'close', size: 20 })))) : null,
        h('div', { className: 'frk-sheet__body' }, p.children)));
  }

  /* ---------- Toast ---------- */
  function Toast(p) {
    var pres = usePresence(!!p.open, 150);
    useEffect(function () { if (!p.open || !p.duration) return; var t = setTimeout(function () { p.onClose && p.onClose(); }, p.duration); return function () { clearTimeout(t); }; }, [p.open, p.duration]);
    if (!pres[0]) return null;
    return h('div', { role: p.tone === 'rec' ? 'alert' : 'status', className: cx('frk-toast', 'frk-tone--' + (p.tone || 'ink'), pres[1] && p.open && 'is-in', p.fixed && 'frk-toast--fixed') },
      p.icon ? h(Icon, { name: p.icon, size: 20 }) : null, h('span', { className: 'frk-toast__text' }, p.children),
      p.action ? h('button', { type: 'button', className: 'frk-toast__action', onClick: p.action.onClick }, p.action.label) : null,
      p.onClose ? h('button', { type: 'button', className: 'frk-toast__close', 'aria-label': 'Cerrar', onClick: p.onClose }, h(Icon, { name: 'close', size: 18 })) : null);
  }

  /* ---------- TextField: pill input, optional submit key ---------- */
  function TextField(p) {
    var id = useId(), err = p.error, rest = omit(p, ['label', 'hint', 'error', 'onSubmit', 'submitLabel', 'className', 'mono', 'block']);
    function submit(e) { e.preventDefault(); p.onSubmit && p.onSubmit(e.currentTarget.elements[0].value); }
    var input = h('input', Object.assign({ id: id, className: cx('frk-input', p.mono && 'frk-input--mono'), 'aria-invalid': err ? true : undefined, 'aria-describedby': err || p.hint ? id + '-d' : undefined }, rest));
    var body = p.onSubmit ? h('form', { className: 'frk-field__row', onSubmit: submit }, input,
      h('button', { type: 'submit', className: 'frk-key frk-tone--klein frk-key--round frk-field__go', 'aria-label': p.submitLabel || 'Enviar' }, h('span', { className: 'frk-key__main' }, h(Icon, { name: 'arrow-right', size: 28 })))) : input;
    return h('div', { className: cx('frk-field', err && 'is-error', p.className) },
      p.label ? h('label', { htmlFor: id, className: 'frk-field__label' }, p.label) : null, body,
      err ? h('span', { id: id + '-d', className: 'frk-field__error' }, h(Icon, { name: 'close', size: 14 }), err) : p.hint ? h('span', { id: id + '-d', className: 'frk-field__hint' }, p.hint) : null);
  }

  /* ---------- Stepper: − value + ---------- */
  function Stepper(p) {
    var min = p.min == null ? 0 : p.min, max = p.max == null ? 99 : p.max, step = p.step || 1;
    var st = useValue(p, min), v = st[0];
    function set(n) { n = clamp(n, min, max); if (n !== v) st[1](n); }
    return h('div', { className: cx('frk-stepper', p.className), role: 'group', 'aria-label': p.label },
      h('button', { type: 'button', className: 'frk-key frk-tone--well frk-key--s frk-key--round', 'aria-label': 'Menos ' + (p.label || ''), disabled: v <= min, onClick: function () { set(v - step); } }, h('span', { className: 'frk-key__main' }, h(Icon, { name: 'minus', size: 22 }))),
      h('div', { className: 'frk-stepper__val' }, h('output', { 'aria-live': 'polite', key: v, className: 'frk-stepper__num' }, v), p.unit ? h('span', { className: 'frk-stepper__unit' }, p.unit) : null),
      h('button', { type: 'button', className: 'frk-key frk-tone--ink frk-key--s frk-key--round', 'aria-label': 'Más ' + (p.label || ''), disabled: v >= max, onClick: function () { set(v + step); } }, h('span', { className: 'frk-key__main' }, h(Icon, { name: 'plus', size: 22 }))));
  }

  /* ---------- ProgressRing ---------- */
  function ProgressRing(p) {
    var v = clamp(p.value || 0, 0, 100), s = p.size || 96, w = p.thickness || 8, r = (s - w) / 2, c = 2 * Math.PI * r;
    return h('div', { className: cx('frk-ring', 'frk-ring--' + (p.tone || 'rams'), p.className), role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': v, 'aria-label': p.label, style: { width: s, height: s } },
      h('svg', { width: s, height: s, viewBox: '0 0 ' + s + ' ' + s, 'aria-hidden': true },
        h('circle', { cx: s / 2, cy: s / 2, r: r, className: 'frk-ring__track', strokeWidth: w }),
        h('circle', { cx: s / 2, cy: s / 2, r: r, className: 'frk-ring__fill', strokeWidth: w, strokeDasharray: c, strokeDashoffset: c * (1 - v / 100), transform: 'rotate(-90 ' + s / 2 + ' ' + s / 2 + ')' })),
      h('span', { className: 'frk-ring__text' }, p.children != null ? p.children : Math.round(v) + '%'));
  }

  /* ---------- SlideToStart: deliberate start, drag or press ---------- */
  function SlideToStart(p) {
    var track = useRef(null), drag = useRef(null);
    var s = useState(0), x = s[0], setX = s[1];
    var d = useState(false), done = d[0], setDone = d[1];
    function max() { return track.current ? track.current.clientWidth - 64 - 8 : 200; }
    function finish() { setX(max()); setDone(true); p.onComplete && p.onComplete(); if (p.resetAfter !== false) setTimeout(function () { setDone(false); setX(0); }, 1200); }
    function down(e) { if (done) return; drag.current = { x: e.clientX - x }; e.currentTarget.setPointerCapture(e.pointerId); }
    function mv(e) { if (drag.current) setX(clamp(e.clientX - drag.current.x, 0, max())); }
    function up() { if (!drag.current) return; drag.current = null; if (x > max() * 0.82) finish(); else setX(0); }
    return h('div', { ref: track, className: cx('frk-slide', 'frk-tone--' + (p.tone || 'surface'), done && 'is-done', p.className) },
      h('span', { className: 'frk-slide__text', style: { opacity: 1 - x / (max() || 1) * 1.4 } }, done ? (p.doneLabel || 'Vamos') : (p.children || 'Desliza para empezar')),
      h('button', {
        type: 'button', className: cx('frk-slide__knob', drag.current && 'is-dragging'), style: { transform: 'translateX(' + x + 'px)' },
        'aria-label': p.label || 'Empezar', onPointerDown: down, onPointerMove: mv, onPointerUp: up, onPointerCancel: up,
        onKeyDown: function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); finish(); } }
      }, h(Icon, { name: done ? 'check' : (p.icon || 'play'), size: 24 })));
  }

  /* ---------- CardStack: overlapping coloured cards ---------- */
  function CardStack(p) {
    var items = p.items || [];
    var st = useValue(p, p.defaultValue != null ? p.defaultValue : 0), v = st[0];
    return h('div', { className: cx('frk-stack', p.className), role: 'list' },
      items.map(function (it, i) {
        var on = i === v;
        return h('div', { key: i, role: 'listitem', className: 'frk-stack__item', style: { zIndex: i + 1 } },
          h('button', { type: 'button', className: cx('frk-stack__card', 'frk-tone--' + (it.tone || 'surface'), on && 'is-open'), 'aria-expanded': on, onClick: function () { st[1](i); } },
            h('span', { className: 'frk-stack__top' }, h('span', { className: 'frk-stack__badge' }, it.badge), it.icon ? h('span', { className: 'frk-stack__badge' }, h(Icon, { name: it.icon, size: 20 })) : null),
            h('span', { className: 'frk-stack__bottom' },
              h('span', { className: 'frk-stack__title' }, it.title, it.subtitle ? h('span', { className: 'frk-stack__sub' }, it.subtitle) : null),
              it.value != null ? h('span', { className: 'frk-stack__value' }, it.value) : null)));
      }));
  }

  /* ---------- LED: indicator light ---------- */
  function LED(p) {
    return h('span', { className: cx('frk-led', 'frk-led--' + (p.tone || 'rec'), p.on !== false && 'is-on', p.blink && 'is-blink', p.className) },
      h('span', { className: 'frk-led__lamp', 'aria-hidden': true }), p.children != null ? h('span', { className: 'frk-led__text' }, p.children) : null,
      h('span', { className: 'frk-sr' }, p.on !== false ? ' (encendido)' : ' (apagado)'));
  }

  /* ---------- Grille: speaker/lamp grille in a disc or dome ---------- */
  function Grille(p) {
    var s = p.size || 160, variant = p.variant || 'slots', dome = p.shape === 'dome', H = dome ? s / 2 : s, id = useId(), parts = [];
    if (variant === 'slots') { for (var y = s * 0.2; y < s * 0.82; y += s * 0.085) parts.push(h('rect', { key: y, x: s * 0.12, y: y, width: s * 0.76, height: s * 0.04, rx: s * 0.02, className: 'frk-grille__hole' })); }
    else { var pt = p.pitch || s / 11; for (var gy = pt / 2; gy < s; gy += pt) for (var gx = pt / 2; gx < s; gx += pt) if (Math.hypot(gx - s / 2, gy - s / 2) < s * 0.38) parts.push(h('circle', { key: gx + '-' + gy, cx: gx, cy: gy, r: pt * 0.28, className: 'frk-grille__hole' })); }
    return h('svg', { className: cx('frk-grille', 'frk-grille--' + (p.tone || 'verde'), p.className), width: s, height: H, viewBox: '0 0 ' + s + ' ' + H, role: p.label ? 'img' : undefined, 'aria-label': p.label, 'aria-hidden': p.label ? undefined : true },
      h('defs', null, h('clipPath', { id: id }, h('circle', { cx: s / 2, cy: s / 2, r: s / 2 }))),
      h('g', { clipPath: 'url(#' + id + ')' }, h('rect', { width: s, height: s, className: 'frk-grille__body' }), parts));
  }


  /* ================= Frekvens 3: tiempo, mecanismos, conversación, generativo ================= */
  function pad(n, w) { n = String(Math.floor(n)); while (n.length < (w || 2)) n = '0' + n; return n; }
  function fmt(ms, cs) { var t = Math.max(0, ms), m = Math.floor(t / 60000), s = Math.floor(t / 1000) % 60, c = Math.floor(t / 10) % 100; return pad(m) + ':' + pad(s) + (cs ? '.' + pad(c) : ''); }
  /* rAF clock: returns elapsed ms while running */
  function useClock(running, base) {
    var s = useState(0), now = s[0], setNow = s[1], start = useRef(null), acc = useRef(0);
    useEffect(function () {
      if (!running) { if (start.current != null) { acc.current += performance.now() - start.current; start.current = null; } return; }
      start.current = performance.now(); var raf;
      function tick() { setNow(acc.current + performance.now() - start.current); raf = requestAnimationFrame(tick); }
      raf = requestAnimationFrame(tick); return function () { cancelAnimationFrame(raf); };
    }, [running]);
    return [running ? now : acc.current, function () { acc.current = 0; start.current = running ? performance.now() : null; setNow(0); }];
  }
  function roundKey(tone, icon, label, onClick, extra) {
    return h('button', Object.assign({ type: 'button', className: 'frk-key frk-tone--' + tone + ' frk-key--m frk-key--round', 'aria-label': label, onClick: onClick }, extra || {}), h('span', { className: 'frk-key__main' }, h(Icon, { name: icon, size: 28 })));
  }

  /* ---------- Stopwatch: cronómetro con vueltas ---------- */
  function Stopwatch(p) {
    var r = useState(!!p.autoStart), run = r[0], setRun = r[1];
    var c = useClock(run), t = c[0];
    var l = useState([]), laps = l[0], setLaps = l[1];
    function lap() { var last = laps.length ? laps[0].at : 0; var n = [{ at: t, split: t - last }].concat(laps); setLaps(n); p.onLap && p.onLap(t); }
    function reset() { c[1](); setLaps([]); }
    var best = laps.length > 1 ? Math.min.apply(null, laps.map(function (x) { return x.split; })) : -1;
    return h('div', { className: cx('frk-watch', p.className) },
      h(Readout, { label: p.label || 'Cronómetro', value: fmt(t, true), size: p.size || 'display' }),
      h('div', { className: 'frk-watch__keys' },
        run ? roundKey('ink', 'flag', 'Vuelta', lap) : roundKey('well', 'refresh', 'Reiniciar', reset, { disabled: t === 0 }),
        run ? roundKey('rams', 'pause', 'Parar', function () { setRun(false); }) : roundKey('rams', 'play', t ? 'Continuar' : 'Empezar', function () { setRun(true); })),
      laps.length ? h('ol', { className: 'frk-watch__laps', 'aria-label': 'Vueltas' }, laps.map(function (x, i) {
        return h('li', { key: laps.length - i, className: cx('frk-watch__lap', x.split === best && 'is-best') }, h('span', null, 'V' + pad(laps.length - i)), h('span', null, fmt(x.split, true)), h('span', null, fmt(x.at, true)));
      })) : null);
  }

  /* ---------- Timer: cuenta atrás en un anillo de puntos ---------- */
  function Timer(p) {
    var dur = (p.duration || 60) * 1000, size = p.size || 260, n = p.dots || 60;
    var r = useState(!!p.autoStart), run = r[0], setRun = r[1];
    var c = useClock(run), left = Math.max(0, dur - c[0]), done = left === 0;
    var fired = useRef(false);
    useEffect(function () { if (done && run) { setRun(false); if (!fired.current) { fired.current = true; p.onComplete && p.onComplete(); } } if (!done) fired.current = false; }, [done, run]);
    var lit = Math.ceil(left / dur * n), secs = Math.ceil(left / 1000), last3 = run && secs <= 3 && secs > 0;
    var dots = range(n).map(function (i) { var a = i / n * 2 * Math.PI, R0 = size / 2 - 10; return h('circle', { key: i, cx: size / 2 + R0 * Math.sin(a), cy: size / 2 - R0 * Math.cos(a), r: i % 5 === 0 ? 4 : 2.6, className: i < lit ? 'is-on' : '' }); });
    return h('div', { className: cx('frk-timer', done && 'is-done', p.className) },
      h('div', { className: 'frk-timer__face', style: { width: size, height: size } },
        h('svg', { width: size, height: size, 'aria-hidden': true }, dots),
        h('div', { className: 'frk-timer__center' },
          p.label ? h('span', { className: 'frk-timer__label' }, p.label) : null,
          h('span', { key: last3 ? secs : 'v', className: cx('frk-timer__value', last3 && 'is-count'), role: 'timer', 'aria-live': last3 || done ? 'assertive' : 'off' }, done ? (p.doneText || 'Hecho') : last3 ? String(secs) : fmt(left)))),
      h('div', { className: 'frk-watch__keys' },
        roundKey('well', 'refresh', 'Reiniciar', function () { c[1](); setRun(false); }, { disabled: left === dur }),
        run ? roundKey('rams', 'pause', 'Pausa', function () { setRun(false); }) : roundKey('rams', 'play', 'Empezar', function () { if (done) c[1](); setRun(true); })));
  }

  /* ---------- Hourglass: reloj de arena de puntos, se gira al tocar ---------- */
  function Hourglass(p) {
    var dur = (p.duration || 30) * 1000, rows = 8, pitch = p.pitch || 12, dot = pitch * 0.55;
    var r = useState(!!p.autoStart), run = r[0], setRun = r[1];
    var f = useState(0), flips = f[0], setFlips = f[1];
    var c = useClock(run), prog = clamp(c[0] / dur, 0, 1);
    useEffect(function () { if (prog >= 1 && run) { setRun(false); p.onComplete && p.onComplete(); } }, [prog >= 1]);
    var top = [], bot = [];
    for (var y = 0; y < rows; y++) { var w = rows - y; for (var x = 0; x < w; x++) { top.push([x - (w - 1) / 2, y]); bot.push([x - (y + 1 - 1) / 2 - 0, rows + 1 + y]); } }
    bot = []; for (var y2 = 0; y2 < rows; y2++) { var w2 = y2 + 1; for (var x2 = 0; x2 < w2; x2++) bot.push([x2 - (w2 - 1) / 2, rows + 1 + y2]); }
    var total = top.length, fallen = Math.round(prog * total);
    var topOrder = top.slice().sort(function (a, b) { return a[1] - b[1] || Math.abs(b[0]) - Math.abs(a[0]); });
    var gone = {}; topOrder.slice(0, fallen).forEach(function (q) { gone[q[0] + ',' + q[1]] = 1; });
    var botOrder = bot.slice().sort(function (a, b) { return b[1] - a[1] || Math.abs(a[0]) - Math.abs(b[0]); });
    var filled = {}; botOrder.slice(0, fallen).forEach(function (q) { filled[q[0] + ',' + q[1]] = 1; });
    var W = rows * pitch + pitch, H = (rows * 2 + 1) * pitch + pitch, cxp = W / 2;
    function circ(q, on, k) { return h('circle', { key: k, cx: cxp + q[0] * pitch, cy: pitch / 2 + q[1] * pitch + pitch / 2, r: dot / 2, className: on ? 'is-on' : '' }); }
    return h('div', { className: cx('frk-hourglass', p.className) },
      h('button', {
        type: 'button', className: 'frk-hourglass__body', style: { transform: 'rotate(' + flips * 180 + 'deg)' },
        'aria-label': (p.label || 'Reloj de arena') + ': ' + Math.ceil((1 - prog) * dur / 1000) + ' s. Toca para girar',
        onClick: function () { c[1](); setFlips(flips + 1); setRun(true); }
      },
        h('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, 'aria-hidden': true },
          top.map(function (q, i) { return circ(q, !gone[q[0] + ',' + q[1]], 't' + i); }),
          run ? h('circle', { className: 'is-on frk-hourglass__grain', cx: cxp, cy: pitch / 2 + rows * pitch + pitch / 2, r: dot / 2 }) : null,
          bot.map(function (q, i) { return circ(q, !!filled[q[0] + ',' + q[1]], 'b' + i); }))),
      h('span', { className: 'frk-hourglass__read' }, Math.ceil((1 - prog) * dur / 1000) + ' s'));
  }

  /* ---------- Pendulum: metrónomo ---------- */
  function Pendulum(p) {
    var st = useValue({ value: p.bpm, defaultValue: p.defaultBpm || 90, onChange: p.onBpmChange }, 90), bpm = st[0];
    var r = useState(p.running != null ? p.running : true), run = p.running != null ? p.running : r[0];
    var b = useState(0), beat = b[0], setBeat = b[1], beats = p.beats || 4;
    useEffect(function () { if (!run) return; var i = 0; setBeat(0); var t = setInterval(function () { i = (i + 1) % beats; setBeat(i); }, 60000 / bpm); return function () { clearInterval(t); }; }, [run, bpm, beats]);
    var period = 120 / bpm;
    return h('div', { className: cx('frk-pendulum', p.className) },
      h('div', { className: 'frk-pendulum__stage', 'aria-hidden': true },
        h('div', { className: cx('frk-pendulum__arm', run && 'is-run'), style: { animationDuration: period + 's' } }, h('span', { className: 'frk-pendulum__bob' })),
        h('span', { className: 'frk-pendulum__pivot' })),
      h('div', { className: 'frk-pendulum__beats', role: 'img', 'aria-label': 'Compás ' + beats + ' tiempos' }, range(beats).map(function (i) { return h('span', { key: i, className: cx(i === beat && run && 'is-on', i === 0 && 'is-first') }); })),
      h('div', { className: 'frk-pendulum__ctrl' },
        h(Stepper, { label: 'BPM', value: bpm, min: 30, max: 220, step: p.step || 5, unit: 'bpm', onChange: function (v) { st[1](v); } }),
        p.running == null ? roundKey(run ? 'ink' : 'rams', run ? 'pause' : 'play', run ? 'Parar' : 'Empezar', function () { r[1](!run); }) : null));
  }

  /* ---------- Cabinet: archivero, cajones que se abren ---------- */
  function Cabinet(p) {
    var items = p.drawers || [], id = useId();
    var st = useValue(p, p.defaultValue != null ? p.defaultValue : -1), v = st[0];
    return h('div', { className: cx('frk-cabinet', p.className) }, items.map(function (d, i) {
      var open = v === i;
      return h('div', { key: i, className: cx('frk-drawer', 'frk-tone--' + (d.tone || 'surface'), open && 'is-open') },
        h('button', { type: 'button', id: id + 'h' + i, className: 'frk-drawer__front', 'aria-expanded': open, 'aria-controls': id + 'p' + i, onClick: function () { st[1](open ? -1 : i); } },
          h('span', { className: 'frk-drawer__label' }, h('span', { className: 'frk-drawer__index' }, d.index != null ? d.index : pad(i + 1)), d.label),
          h('span', { className: 'frk-drawer__handle', 'aria-hidden': true }),
          d.meta ? h('span', { className: 'frk-drawer__meta' }, d.meta) : null),
        h('div', { id: id + 'p' + i, role: 'region', 'aria-labelledby': id + 'h' + i, className: 'frk-drawer__body', 'aria-hidden': !open },
          h('div', { className: 'frk-drawer__inner' }, h('div', { className: 'frk-drawer__pad' }, d.content))));
    }));
  }

  /* ---------- Tabs: pestañas con indicador que viaja ---------- */
  function Tabs(p) {
    var tabs = p.tabs || [], id = useId(), variant = p.variant || 'pill';
    var st = useValue(p, tabs[0] && tabs[0].id), v = st[0];
    var list = useRef(null), ind = useState(null), box = ind[0], setBox = ind[1]; var tref = useFollow(box ? { x: box.x, y: 0, w: box.w, h: 0 } : null);
    useEffect(function () {
      var el = list.current && list.current.querySelector('[aria-selected="true"]'); if (!el) return;
      setBox({ x: el.offsetLeft, w: el.offsetWidth });
    }, [v, tabs.length]);
    function key(e) {
      var i = -1; tabs.forEach(function (t, j) { if (t.id === v) i = j; });
      var n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
      if (n == null) return; e.preventDefault(); n = (n + tabs.length) % tabs.length; st[1](tabs[n].id);
      setTimeout(function () { var el = document.getElementById(id + 't' + tabs[n].id); el && el.focus(); }, 0);
    }
    var cur = tabs.filter(function (t) { return t.id === v; })[0];
    return h('div', { className: cx('frk-tabs', 'frk-tabs--' + variant, p.className) },
      h('div', { ref: list, role: 'tablist', 'aria-label': p.label, className: 'frk-tabs__list', onKeyDown: key },
        variant === 'pill' && box ? h('span', { ref: tref, className: 'frk-tabs__ind', 'aria-hidden': true }) : null,
        tabs.map(function (t) {
          var sel = t.id === v;
          return h('button', { key: t.id, id: id + 't' + t.id, type: 'button', role: 'tab', 'aria-selected': sel, 'aria-controls': cur && cur.content != null ? id + 'p' : undefined, tabIndex: sel ? 0 : -1, className: cx('frk-tabs__tab', sel && 'is-on', t.tone && 'frk-tone--' + t.tone), onClick: function () { st[1](t.id); } },
            t.icon ? h(Icon, { name: t.icon, size: 18 }) : null, h('span', null, t.label), t.count != null ? h('span', { className: 'frk-tabs__count' }, t.count) : null);
        })),
      cur && cur.content != null ? h('div', { id: id + 'p', role: 'tabpanel', 'aria-labelledby': id + 't' + v, tabIndex: 0, key: v, className: cx('frk-tabs__panel', cur.tone && 'frk-tone--' + cur.tone) }, cur.content) : null);
  }

  /* ---------- Pager: carrusel con botones de scroll y puntos ---------- */
  function Pager(p) {
    var kids = R.Children.toArray(p.children), track = useRef(null);
    var s = useState(0), idx = s[0], setIdx = s[1];
    function onScroll() { var el = track.current; if (!el || !el.firstChild) return; var w = el.firstChild.offsetWidth + (p.gap || 8); setIdx(clamp(Math.round(el.scrollLeft / w), 0, kids.length - 1)); }
    function go(i) { var el = track.current; if (!el) return; i = clamp(i, 0, kids.length - 1); var c = el.children[i]; c && el.scrollTo({ left: c.offsetLeft - el.offsetLeft, behavior: reduced() ? 'auto' : 'smooth' }); }
    return h('div', { className: cx('frk-pager', p.className), role: 'region', 'aria-roledescription': 'carrusel', 'aria-label': p.label },
      h('div', { ref: track, className: 'frk-pager__track', style: { gap: p.gap || 8 }, onScroll: onScroll, tabIndex: 0, onKeyDown: function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); go(idx + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx - 1); } } },
        kids.map(function (k, i) { return h('div', { key: i, className: 'frk-pager__slide', style: { flexBasis: p.itemWidth || '85%' }, 'aria-roledescription': 'diapositiva', 'aria-label': (i + 1) + ' de ' + kids.length }, k); })),
      h('div', { className: 'frk-pager__bar' },
        h('div', { className: 'frk-pager__dots', 'aria-hidden': true }, kids.map(function (_, i) { return h('span', { key: i, className: cx(i === idx && 'is-on') }); })),
        h('div', { className: 'frk-pager__btns' },
          h('button', { type: 'button', className: 'frk-key frk-tone--well frk-key--s frk-key--round', 'aria-label': 'Anterior', disabled: idx === 0, onClick: function () { go(idx - 1); } }, h('span', { className: 'frk-key__main' }, h(Icon, { name: 'arrow-left', size: 20 }))),
          h('button', { type: 'button', className: 'frk-key frk-tone--ink frk-key--s frk-key--round', 'aria-label': 'Siguiente', disabled: idx === kids.length - 1, onClick: function () { go(idx + 1); } }, h('span', { className: 'frk-key__main' }, h(Icon, { name: 'arrow-right', size: 20 }))))));
  }

  /* ---------- Wheel: rueda selectora con scroll-snap ---------- */
  function Wheel(p) {
    var items = norm(p.items || range(60).map(function (i) { return pad(i); })), row = p.rowHeight || 48, vis = p.visible || 5;
    var st = useValue(p, items[0] && items[0].value), v = st[0], el = useRef(null), timer = useRef(null), live = useRef(false);
    var idx = 0; items.forEach(function (x, i) { if (x.value === v) idx = i; });
    var sc = useState(idx * row), top = sc[0], setTop = sc[1];
    useEffect(function () { if (el.current && !live.current) { el.current.scrollTop = idx * row; setTop(idx * row); } }, [idx]);
    function onScroll() {
      live.current = true; var t = el.current.scrollTop; setTop(t); clearTimeout(timer.current);
      timer.current = setTimeout(function () { live.current = false; var i = clamp(Math.round(t / row), 0, items.length - 1); if (items[i].value !== v) st[1](items[i].value); }, 90);
    }
    function key(e) {
      var d = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : e.key === 'PageDown' ? 5 : e.key === 'PageUp' ? -5 : 0; if (!d) return;
      e.preventDefault(); var i = clamp(idx + d, 0, items.length - 1); st[1](items[i].value); el.current.scrollTo({ top: i * row, behavior: reduced() ? 'auto' : 'smooth' });
    }
    var padH = (vis - 1) / 2 * row;
    return h('div', { className: cx('frk-wheel', p.className), style: { height: vis * row, width: p.width } },
      h('div', { className: 'frk-wheel__window', style: { top: padH, height: row }, 'aria-hidden': true }),
      h('div', {
        ref: el, className: 'frk-wheel__scroll', onScroll: onScroll, onKeyDown: key, tabIndex: 0, role: 'spinbutton', 'aria-label': p.label,
        'aria-valuenow': idx, 'aria-valuetext': items[idx] && String(items[idx].label), 'aria-valuemin': 0, 'aria-valuemax': items.length - 1, style: { scrollPaddingTop: padH }
      },
        h('div', { style: { height: padH } }),
        items.map(function (x, i) {
          var d = Math.abs(i * row - top) / row, o = clamp(1 - d * 0.28, 0.15, 1), s = clamp(1 - d * 0.12, 0.6, 1);
          return h('div', { key: x.value, className: cx('frk-wheel__item', i === idx && 'is-on'), style: { height: row, opacity: o, transform: 'scale(' + s + ')' }, onClick: function () { el.current.scrollTo({ top: i * row, behavior: 'smooth' }); } }, x.label);
        }),
        h('div', { style: { height: padH } })),
      p.unit ? h('span', { className: 'frk-wheel__unit', style: { top: padH }, 'aria-hidden': true }, p.unit) : null);
  }

  /* ---------- VolumeWheel: rueda lateral estriada (tipo Rabbit) ---------- */
  function VolumeWheel(p) {
    var step = p.step || 5, segs = p.segments || 16, H = p.height || 240;
    var st = useValue(p, 50), v = st[0], drag = useRef(null);
    function set(n) { n = clamp(Math.round(n), 0, 100); if (n !== v) st[1](n); }
    function wheel(e) { e.preventDefault(); set(v + (e.deltaY < 0 ? step : -step)); }
    var ref = useRef(null);
    useEffect(function () { var n = ref.current; if (!n) return; n.addEventListener('wheel', wheel, { passive: false }); return function () { n.removeEventListener('wheel', wheel); }; });
    function down(e) { drag.current = { y: e.clientY, v: v }; e.currentTarget.setPointerCapture(e.pointerId); }
    function mv(e) { if (drag.current) set(drag.current.v + (drag.current.y - e.clientY) / 2); }
    function key(e) { var k = e.key; if (k === 'ArrowUp' || k === 'ArrowRight') { e.preventDefault(); set(v + step); } else if (k === 'ArrowDown' || k === 'ArrowLeft') { e.preventDefault(); set(v - step); } else if (k === 'Home') set(0); else if (k === 'End') set(100); }
    var on = Math.round(v / 100 * segs), shift = (v * 1.6) % 12;
    return h('div', { className: cx('frk-volume', 'frk-volume--' + (p.tone || 'rams'), p.className), style: { height: H } },
      h('div', { className: 'frk-volume__level', 'aria-hidden': true }, range(segs).map(function (i) { return h('span', { key: i, className: cx(segs - 1 - i < on && 'is-on') }); })),
      h('div', {
        ref: ref, className: 'frk-volume__wheel', role: 'slider', tabIndex: 0, 'aria-orientation': 'vertical', 'aria-label': p.label || 'Volumen', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': v, 'aria-valuetext': v + '%',
        onPointerDown: down, onPointerMove: mv, onPointerUp: function () { drag.current = null; }, onPointerCancel: function () { drag.current = null; }, onKeyDown: key
      }, h('div', { className: 'frk-volume__ridges', style: { transform: 'translateY(' + (-shift) + 'px)' } })),
      h('div', { className: 'frk-volume__read' }, h('span', { className: 'frk-volume__num' }, v), h('span', { className: 'frk-volume__unit' }, p.unitLabel || 'VOL')));
  }

  /* ---------- HoldButton: mantener para confirmar ---------- */
  function HoldButton(p) {
    var ms = p.duration || 1200, s = useState(0), prog = s[0], setProg = s[1], raf = useRef(null), t0 = useRef(0), done = useRef(false);
    function start() { if (p.disabled) return; done.current = false; t0.current = performance.now(); cancelAnimationFrame(raf.current);
      (function tick() { var k = clamp((performance.now() - t0.current) / ms, 0, 1); setProg(k); if (k >= 1) { done.current = true; p.onComplete && p.onComplete(); setTimeout(function () { setProg(0); }, 600); return; } raf.current = requestAnimationFrame(tick); })(); }
    function stop() { cancelAnimationFrame(raf.current); if (!done.current) setProg(0); }
    var size = p.size || 120, w = 6, r = (size - w) / 2, C = 2 * Math.PI * r;
    return h('button', {
      type: 'button', className: cx('frk-hold', 'frk-tone--' + (p.tone || 'ink'), prog > 0 && 'is-holding', prog >= 1 && 'is-done', p.className), style: { width: size, height: size }, disabled: p.disabled,
      'aria-label': (p.label || 'Mantén para confirmar'), onPointerDown: start, onPointerUp: stop, onPointerLeave: stop, onPointerCancel: stop,
      onKeyDown: function (e) { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); start(); } }, onKeyUp: function (e) { if (e.key === ' ' || e.key === 'Enter') stop(); }
    },
      h('svg', { width: size, height: size, 'aria-hidden': true }, h('circle', { cx: size / 2, cy: size / 2, r: r, className: 'frk-hold__track', strokeWidth: w }),
        h('circle', { cx: size / 2, cy: size / 2, r: r, className: 'frk-hold__fill', strokeWidth: w, strokeDasharray: C, strokeDashoffset: C * (1 - prog), transform: 'rotate(-90 ' + size / 2 + ' ' + size / 2 + ')' })),
      h('span', { className: 'frk-hold__main' }, h(Icon, { name: prog >= 1 ? 'check' : (p.icon || 'stop'), size: 32 }), h('span', { className: 'frk-hold__text' }, prog >= 1 ? (p.doneLabel || 'Hecho') : (p.children || 'Mantén'))));
  }

  /* ---------- Rocker: interruptores basculantes con piloto ---------- */
  function Rocker(p) {
    var items = p.items || [];
    var s = useState(items.map(function (x) { return !!x.on; })), on = s[0], setOn = s[1];
    return h('div', { className: cx('frk-rockers', p.className), role: 'group', 'aria-label': p.label }, items.map(function (x, i) {
      var v = x.checked != null ? x.checked : on[i];
      return h('div', { key: i, className: 'frk-rocker' },
        h('button', { type: 'button', role: 'switch', 'aria-checked': v, 'aria-label': x.label, className: cx('frk-rocker__key', v && 'is-on'), onClick: function () { var n = on.slice(); n[i] = !v; setOn(n); x.onChange && x.onChange(!v); } },
          h('span', { className: 'frk-rocker__face' }, h(Icon, { name: x.icon || 'power', size: 22 }))),
        h(LED, { tone: x.tone || 'rec', on: v }, x.label));
    }));
  }

  /* ---------- Reveal: transiciones de entrada ---------- */
  function Reveal(p) {
    var ref = useRef(null), s = useState(!!p.immediate && false), inView = s[0], setIn = s[1];
    useEffect(function () {
      var el = ref.current; if (!el) return;
      if (!('IntersectionObserver' in window)) { setIn(true); return; }
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { setIn(true); if (p.once !== false) io.disconnect(); } else if (p.once === false) setIn(false); }); }, { threshold: p.threshold || 0.15 });
      io.observe(el); return function () { io.disconnect(); };
    }, []);
    var kids = R.Children.toArray(p.children), stg = p.stagger == null ? 50 : p.stagger, Tag = p.as || 'div';
    return h(Tag, { ref: ref, className: cx('frk-reveal', 'frk-reveal--' + (p.variant || 'rise'), inView && 'is-in', p.className), style: p.style },
      kids.map(function (k, i) { return h('div', { key: i, className: 'frk-reveal__item', style: { transitionDelay: ((p.delay || 0) + i * stg) + 'ms' } }, k); }));
  }

  /* ---------- Layout primitives (para composición generativa) ---------- */
  function Stack(p) {
    return h('div', { className: cx('frk-stackl', p.className), style: Object.assign({ display: 'flex', flexDirection: p.direction === 'row' ? 'row' : 'column', gap: 'var(--space-' + (p.gap == null ? 3 : p.gap) + ')', alignItems: p.align, justifyContent: p.justify, flexWrap: p.wrap ? 'wrap' : undefined, padding: p.padding != null ? 'var(--space-' + p.padding + ')' : undefined }, p.style) }, p.children);
  }
  function Grid(p) {
    return h('div', { className: cx('frk-grid', p.className), style: Object.assign({ display: 'grid', gridTemplateColumns: 'repeat(' + (p.columns || 2) + ', minmax(0, 1fr))', gap: 'var(--space-' + (p.gap == null ? 2 : p.gap) + ')' }, p.style) }, p.children);
  }
  var TEXT_TAG = { 'display-xl': 'h1', title: 'h2', headline: 'h3', 'numeral-xl': 'div', 'dot-hero': 'div', 'dot-display': 'div', body: 'p', 'body-strong': 'p', caption: 'p', label: 'span', readout: 'span' };
  function Text(p) {
    var v = p.variant || 'body';
    return h(p.as || TEXT_TAG[v] || 'p', { className: cx('frk-text', 'frk-text--' + v, p.muted && 'is-muted', p.className), style: p.style }, p.children, p.sub ? h('span', { className: 'frk-text__sub' }, p.sub) : null);
  }

  /* ---------- DotLoader: pensando ---------- */
  function DotLoader(p) {
    var v = p.variant || 'row', n = v === 'grid' ? 9 : 3;
    return h('span', { className: cx('frk-loader', 'frk-loader--' + v, p.className), role: 'status' }, range(n).map(function (i) { return h('span', { key: i, style: { animationDelay: (v === 'grid' ? ((i % 3) + Math.floor(i / 3)) * 90 : i * 140) + 'ms' } }); }), h('span', { className: 'frk-sr' }, p.label || 'Pensando'));
  }

  /* ---------- VoiceOrb: orbe de puntos para voz ---------- */
  function VoiceOrb(p) {
    var size = p.size || 200, n = p.grid || 15, pitch = size / n, state = p.state || 'idle';
    var s = useState(0), t = s[0], setT = s[1];
    useEffect(function () { if (state === 'idle' || reduced()) return; var raf; var t0 = performance.now(); function tick() { setT((performance.now() - t0) / 1000); raf = requestAnimationFrame(tick); } raf = requestAnimationFrame(tick); return function () { cancelAnimationFrame(raf); }; }, [state]);
    var lvl = p.level != null ? p.level : 0.5, c = (n - 1) / 2, dots = [];
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
      var dx = x - c, dy = y - c, d = Math.sqrt(dx * dx + dy * dy); if (d > c + 0.2) continue;
      var k = 0.35;
      if (state === 'listening') k = 0.35 + lvl * 0.55 * (0.6 + 0.4 * Math.sin(t * 9 + d * 0.9)) * (1 - d / (c + 1));
      else if (state === 'speaking') k = 0.3 + 0.5 * Math.max(0, Math.sin(d * 0.9 - t * 7)) * lvl * 1.4;
      else if (state === 'thinking') { var a = Math.atan2(dy, dx), ph = ((a - t * 3) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI); k = 0.25 + (ph < 1.2 ? 0.45 * (1 - ph / 1.2) : 0) * (d / (c + 0.5)); }
      dots.push(h('circle', { key: x + '-' + y, cx: x * pitch + pitch / 2, cy: y * pitch + pitch / 2, r: clamp(k, 0.15, 0.95) * pitch / 2 }));
    }
    var names = { idle: 'En espera', listening: 'Escuchando', thinking: 'Pensando', speaking: 'Hablando' };
    return h('div', { className: cx('frk-orb', 'frk-orb--' + state, 'frk-orb--' + (p.tone || 'ink'), p.className), style: { width: size } },
      h('svg', { width: size, height: size, viewBox: '0 0 ' + size + ' ' + size, role: 'img', 'aria-label': p.label || names[state] }, dots),
      p.caption !== false ? h('span', { className: 'frk-orb__caption', 'aria-live': 'polite' }, p.caption || names[state]) : null);
  }

  /* ---------- Message: turno de conversación ---------- */
  function Message(p) {
    var role = p.role || 'assistant';
    return h('div', { className: cx('frk-msg', 'frk-msg--' + role, p.className) },
      role === 'assistant' ? h('span', { className: 'frk-msg__avatar', 'aria-hidden': true }, h(StateMark, { state: p.streaming ? 'partial' : 'full', size: 16 })) : null,
      h('div', { className: 'frk-msg__body' },
        p.name ? h('span', { className: 'frk-msg__name' }, p.name) : null,
        p.thinking ? h(DotLoader, { label: 'Pensando' }) : h('div', { className: 'frk-msg__text' }, p.children, p.streaming ? h('span', { className: 'frk-msg__caret', 'aria-hidden': true }) : null),
        p.ui ? h('div', { className: 'frk-msg__ui' }, h(Render, { spec: p.ui, actions: p.actions })) : null,
        p.meta || p.onCopy || p.onRetry ? h('div', { className: 'frk-msg__meta' }, p.meta ? h('span', null, p.meta) : null,
          p.onCopy ? h('button', { type: 'button', className: 'frk-msg__act', 'aria-label': 'Copiar', onClick: p.onCopy }, h(Icon, { name: 'copy', size: 16 })) : null,
          p.onRetry ? h('button', { type: 'button', className: 'frk-msg__act', 'aria-label': 'Reintentar', onClick: p.onRetry }, h(Icon, { name: 'refresh', size: 16 })) : null) : null));
  }

  /* ---------- Suggestions: respuestas sugeridas ---------- */
  function Suggestions(p) {
    return h('div', { className: cx('frk-suggest', p.className), role: 'group', 'aria-label': p.label || 'Sugerencias' }, (p.items || []).map(function (s, i) {
      var o = typeof s === 'string' ? { label: s } : s;
      return h('button', { key: i, type: 'button', className: 'frk-suggest__chip', style: { animationDelay: i * 50 + 'ms' }, onClick: function () { p.onPick && p.onPick(o.value || o.label); } }, o.icon ? h(Icon, { name: o.icon, size: 16 }) : null, o.label);
    }));
  }

  /* ---------- Composer: escribir o hablar ---------- */
  function Composer(p) {
    var st = useValue({ value: p.value, defaultValue: '', onChange: p.onChange }, ''), v = st[0], ta = useRef(null);
    var l = useState(false), listening = p.listening != null ? p.listening : l[0];
    useEffect(function () { var el = ta.current; if (!el) return; el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 160) + 'px'; }, [v]);
    function send() { if (!v.trim() || p.busy) return; p.onSend && p.onSend(v.trim()); st[1](''); }
    return h('div', { className: cx('frk-composer', listening && 'is-listening', p.className) },
      p.suggestions ? h(Suggestions, { items: p.suggestions, onPick: function (s) { p.onSend ? p.onSend(s) : st[1](s); } }) : null,
      h('div', { className: 'frk-composer__bar' },
        listening ? h('div', { className: 'frk-composer__listen' }, h(VoiceOrb, { state: 'listening', size: 40, grid: 7, caption: false, level: p.level }), h('span', null, p.listeningText || 'Te escucho…'))
          : h('textarea', { ref: ta, rows: 1, value: v, placeholder: p.placeholder || 'Escribe o habla', 'aria-label': p.label || 'Mensaje', className: 'frk-composer__input',
            onChange: function (e) { st[1](e.target.value); }, onKeyDown: function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } } }),
        p.voice !== false ? h('button', { type: 'button', className: cx('frk-key', 'frk-key--s', 'frk-key--round', listening ? 'frk-tone--rec' : 'frk-tone--well'), 'aria-label': listening ? 'Dejar de escuchar' : 'Hablar', 'aria-pressed': listening,
          onClick: function () { var n = !listening; l[1](n); p.onListen && p.onListen(n); } }, h('span', { className: 'frk-key__main' }, h(Icon, { name: listening ? 'stop' : 'mic', size: 20 }))) : null,
        listening ? null : h('button', { type: 'button', className: 'frk-key frk-key--s frk-key--round frk-tone--klein', 'aria-label': 'Enviar', disabled: !v.trim() || p.busy, onClick: send }, h('span', { className: 'frk-key__main' }, p.busy ? h(DotLoader, { label: 'Enviando' }) : h(Icon, { name: 'arrow-up', size: 20 })))));
  }

  /* ---------- Render: UI generativa desde JSON ---------- */
  function Render(p) {
    var actions = p.actions || {};
    function bind(props) {
      var out = {};
      for (var k in props) {
        var val = props[k];
        if (typeof val === 'string' && val.indexOf('action:') === 0) { (function (name) { out[k] = function (x) { var f = actions[name]; f ? f(x) : console.warn('[Frekvens.Render] acción sin definir: ' + name); }; })(val.slice(7)); }
        else if (val && typeof val === 'object' && !Array.isArray(val) && val.type && k !== 'style') out[k] = node(val, k);
        else if (Array.isArray(val) && k === 'tabs') out[k] = val.map(function (t) { return Object.assign({}, t, { content: t.content && typeof t.content === 'object' ? node(t.content) : t.content }); });
        else if (Array.isArray(val) && k === 'drawers') out[k] = val.map(function (t) { return Object.assign({}, t, { content: t.content && typeof t.content === 'object' ? node(t.content) : t.content }); });
        else out[k] = val;
      }
      return out;
    }
    function node(n, key) {
      if (n == null || n === false) return null;
      if (typeof n === 'string' || typeof n === 'number') return n;
      if (Array.isArray(n)) return n.map(function (c, i) { return node(c, i); });
      if (n.type === '__Pending') return h('span', { key: key, className: 'frk-pending', 'aria-hidden': true });
      var C = api[n.type];
      if (!C || n.type === 'Render') return h('div', { key: key, className: 'frk-unknown', role: 'note' }, 'Componente desconocido: ' + n.type);
      var kids = n.children == null ? undefined : (Array.isArray(n.children) ? n.children.map(function (c, i) { return node(c, i); }) : node(n.children));
      return h(C, Object.assign({ key: key }, bind(n.props || {})), kids);
    }
    var spec = p.lang != null ? parseLang(p.lang) : p.spec;
    if (typeof spec === 'string') { try { spec = JSON.parse(spec); } catch (e) { return h('div', { className: 'frk-unknown', role: 'alert' }, 'Spec JSON no válido'); } }
    return h('div', { className: cx('frk-render', p.className) }, node(spec, 'root'));
  }


  /* ================= Frekvens 4: medios, tickers, carrusel, agente, formularios, feedback, navegación ================= */
  function useMedia(p, ref) {
    /* real <video>/<audio> when src exists; otherwise a simulated clock so demos and generated UI still behave */
    var sim = !p.src, dur0 = p.duration || 90;
    var s = useState({ t: 0, d: sim ? dur0 : 0, playing: !!p.autoPlay, muted: !!p.muted }), st = s[0], set = s[1];
    var clk = useClock(sim && st.playing);
    var base = useRef(0);
    var t = sim ? Math.min(st.d, base.current + clk[0] / 1000) : st.t;
    useEffect(function () { if (sim && t >= st.d && st.playing) { if (p.loop) { base.current = 0; clk[1](); } else set(Object.assign({}, st, { playing: false })); } });
    useEffect(function () {
      var m = ref.current; if (sim || !m) return;
      function up() { set(function (o) { return Object.assign({}, o, { t: m.currentTime, d: m.duration || o.d, playing: !m.paused, muted: m.muted }); }); }
      ['timeupdate', 'durationchange', 'play', 'pause', 'volumechange', 'loadedmetadata'].forEach(function (e) { m.addEventListener(e, up); });
      return function () { ['timeupdate', 'durationchange', 'play', 'pause', 'volumechange', 'loadedmetadata'].forEach(function (e) { m.removeEventListener(e, up); }); };
    }, [sim]);
    return {
      t: t, d: st.d, playing: st.playing, muted: st.muted,
      toggle: function () { if (sim) { if (t >= st.d) { base.current = 0; clk[1](); } set(Object.assign({}, st, { playing: !st.playing })); } else { var m = ref.current; m.paused ? m.play() : m.pause(); } },
      seek: function (x) { x = clamp(x, 0, st.d || 0); if (sim) { base.current = x; clk[1](); set(Object.assign({}, st)); } else ref.current.currentTime = x; },
      mute: function () { if (sim) set(Object.assign({}, st, { muted: !st.muted })); else ref.current.muted = !ref.current.muted; }
    };
  }
  function fmtS(s) { s = Math.max(0, Math.floor(s || 0)); return pad(Math.floor(s / 60)) + ':' + pad(s % 60); }
  function Scrub(p) {
    var ref = useRef(null), drag = useRef(false);
    function at(e) { var r = ref.current.getBoundingClientRect(); p.onSeek(clamp((e.clientX - r.left) / r.width, 0, 1) * p.d); }
    var pct = p.d ? p.t / p.d * 100 : 0;
    return h('div', {
      ref: ref, className: 'frk-scrub', role: 'slider', tabIndex: 0, 'aria-label': p.label || 'Posición', 'aria-valuemin': 0, 'aria-valuemax': Math.round(p.d || 0), 'aria-valuenow': Math.round(p.t), 'aria-valuetext': fmtS(p.t) + ' de ' + fmtS(p.d),
      onPointerDown: function (e) { drag.current = true; e.currentTarget.setPointerCapture(e.pointerId); at(e); }, onPointerMove: function (e) { if (drag.current) at(e); }, onPointerUp: function () { drag.current = false; },
      onKeyDown: function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); p.onSeek(p.t + 5); } else if (e.key === 'ArrowLeft') { e.preventDefault(); p.onSeek(p.t - 5); } else if (e.key === 'Home') p.onSeek(0); else if (e.key === 'End') p.onSeek(p.d); }
    },
      h('span', { className: 'frk-scrub__rail' }, h('span', { className: 'frk-scrub__fill', style: { width: pct + '%' } }),
        (p.marks || []).map(function (m, i) { return h('span', { key: i, className: 'frk-scrub__mark', style: { left: (m / (p.d || 1) * 100) + '%' } }); })),
      h('span', { className: 'frk-scrub__thumb', style: { left: pct + '%' } }));
  }

  /* ---------- MediaPlayer: vídeo ---------- */
  function MediaPlayer(p) {
    var ref = useRef(null), box = useRef(null), m = useMedia(p, ref);
    var cc = useState(!!p.captionsOn), ccOn = cc[0];
    useEffect(function () { var v = ref.current; if (v && v.textTracks && v.textTracks[0]) v.textTracks[0].mode = ccOn ? 'showing' : 'hidden'; }, [ccOn]);
    function key(e) {
      if (e.target !== box.current) return;
      var k = e.key.toLowerCase();
      if (k === ' ' || k === 'k') { e.preventDefault(); m.toggle(); } else if (k === 'arrowright') { e.preventDefault(); m.seek(m.t + 5); } else if (k === 'arrowleft') { e.preventDefault(); m.seek(m.t - 5); }
      else if (k === 'm') m.mute(); else if (k === 'f') full(); else if (k === 'c') cc[1](!ccOn);
    }
    function full() { var el = box.current; if (!document.fullscreenElement && el.requestFullscreen) el.requestFullscreen(); else if (document.exitFullscreen) document.exitFullscreen(); }
    return h('div', { ref: box, className: cx('frk-media', m.playing && 'is-playing', p.className), tabIndex: 0, role: 'group', 'aria-roledescription': 'reproductor de vídeo', 'aria-label': p.title || 'Vídeo', onKeyDown: key, style: { aspectRatio: p.ratio || '16 / 9' } },
      p.src ? h('video', { ref: ref, src: p.src, poster: p.poster, playsInline: true, loop: p.loop, muted: p.muted, autoPlay: p.autoPlay, className: 'frk-media__video', onClick: m.toggle },
        p.captions ? h('track', { kind: 'captions', src: p.captions, srcLang: p.captionsLang || 'es', label: 'Español', default: !!p.captionsOn }) : null)
        : h('div', { className: 'frk-media__video frk-media__sim', onClick: m.toggle }, p.children || h(DotMatrix, { shape: 'disc', grid: 13, dot: 10, pitch: 16, tone: 'paper', showOff: true, label: 'Vista previa' })),
      h('div', { className: 'frk-media__top' }, p.title ? h('span', { className: 'frk-media__title' }, p.title) : null, p.badge ? h(Chip, { tone: 'sol' }, p.badge) : null),
      !m.playing ? h('button', { type: 'button', className: 'frk-key frk-tone--rams frk-key--l frk-key--round frk-media__big', 'aria-label': 'Reproducir', onClick: m.toggle }, h('span', { className: 'frk-key__main' }, h(Icon, { name: 'play', size: 40 }))) : null,
      h('div', { className: 'frk-media__bar' },
        h('button', { type: 'button', className: 'frk-media__btn', 'aria-label': m.playing ? 'Pausa' : 'Reproducir', onClick: m.toggle }, h(Icon, { name: m.playing ? 'pause' : 'play', size: 22 })),
        h(Scrub, { t: m.t, d: m.d, onSeek: m.seek, marks: p.chapters, label: 'Posición del vídeo' }),
        h('span', { className: 'frk-media__time' }, fmtS(m.t) + ' / ' + fmtS(m.d)),
        h('button', { type: 'button', className: 'frk-media__btn', 'aria-label': m.muted ? 'Activar sonido' : 'Silenciar', 'aria-pressed': m.muted, onClick: m.mute }, h(Icon, { name: m.muted ? 'volume-off' : 'volume', size: 22 })),
        p.captions || !p.src ? h('button', { type: 'button', className: cx('frk-media__btn', 'frk-media__cc', ccOn && 'is-on'), 'aria-label': 'Subtítulos', 'aria-pressed': ccOn, onClick: function () { cc[1](!ccOn); } }, 'CC') : null,
        h('button', { type: 'button', className: 'frk-media__btn', 'aria-label': 'Pantalla completa', onClick: full }, h(Icon, { name: 'expand', size: 22 }))));
  }

  /* ---------- AudioTrack: onda de barras ---------- */
  function seeded(n, seed) { var x = seed || 7, a = []; for (var i = 0; i < n; i++) { x = (x * 9301 + 49297) % 233280; var r = x / 233280; a.push(0.25 + 0.75 * Math.abs(Math.sin(i / 5 + r * 2)) * (0.6 + 0.4 * r)); } return a; }
  function AudioTrack(p) {
    var ref = useRef(null), m = useMedia(p, ref), peaks = p.peaks || seeded(p.bars || 56, p.seed), wave = useRef(null), drag = useRef(false);
    function at(e) { var r = wave.current.getBoundingClientRect(); m.seek(clamp((e.clientX - r.left) / r.width, 0, 1) * m.d); }
    var pr = m.d ? m.t / m.d : 0;
    return h('div', { className: cx('frk-audio', 'frk-tone--' + (p.tone || 'surface'), m.playing && 'is-playing', p.className) },
      p.src ? h('audio', { ref: ref, src: p.src, preload: 'metadata' }) : null,
      h('button', { type: 'button', className: 'frk-key frk-tone--ink frk-key--s frk-key--round', 'aria-label': m.playing ? 'Pausa' : 'Reproducir ' + (p.title || ''), onClick: m.toggle }, h('span', { className: 'frk-key__main' }, h(Icon, { name: m.playing ? 'pause' : 'play', size: 22 }))),
      h('div', { className: 'frk-audio__main' },
        h('div', { className: 'frk-audio__head' }, h('span', { className: 'frk-audio__title' }, p.title), h('span', { className: 'frk-audio__time' }, fmtS(m.t) + ' · ' + fmtS(m.d))),
        h('div', {
          ref: wave, className: 'frk-audio__wave', role: 'slider', tabIndex: 0, 'aria-label': 'Posición de ' + (p.title || 'audio'), 'aria-valuemin': 0, 'aria-valuemax': Math.round(m.d), 'aria-valuenow': Math.round(m.t), 'aria-valuetext': fmtS(m.t),
          onPointerDown: function (e) { drag.current = true; e.currentTarget.setPointerCapture(e.pointerId); at(e); }, onPointerMove: function (e) { if (drag.current) at(e); }, onPointerUp: function () { drag.current = false; },
          onKeyDown: function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); m.seek(m.t + 5); } if (e.key === 'ArrowLeft') { e.preventDefault(); m.seek(m.t - 5); } if (e.key === ' ') { e.preventDefault(); m.toggle(); } }
        }, peaks.map(function (v, i) { return h('span', { key: i, className: cx(i / peaks.length < pr && 'is-on'), style: { height: Math.round(v * 100) + '%' } }); }))),
      p.speed !== false ? h(Chip, { tone: 'well', square: true }, (p.rate || '1') + '×') : null);
  }

  /* ---------- Ticker: cinta que corre (con pausa) ---------- */
  function Ticker(p) {
    var items = p.items || [], s = useState(false), paused = s[0], setPaused = s[1];
    var row = function (hidden) {
      return h('div', { className: 'frk-ticker__row', 'aria-hidden': hidden || undefined }, items.map(function (it, i) {
        var o = typeof it === 'string' ? { label: it } : it, up = o.delta != null && String(o.delta).charAt(0) !== '-';
        return h('span', { key: i, className: 'frk-ticker__item' }, h('span', { className: 'frk-ticker__label' }, o.label),
          o.value != null ? h('span', { className: 'frk-ticker__value' }, o.value) : null,
          o.delta != null ? h('span', { className: cx('frk-ticker__delta', up ? 'is-up' : 'is-down') }, (up ? '▲ ' : '▼ ') + String(o.delta).replace('-', '')) : null,
          h('span', { className: 'frk-ticker__sep', 'aria-hidden': true }, '●'));
      }));
    };
    return h('div', { className: cx('frk-ticker', 'frk-tone--' + (p.tone || 'ink'), paused && 'is-paused', p.className), role: 'region', 'aria-label': p.label || 'Cinta de noticias' },
      h('div', { className: 'frk-ticker__viewport' }, h('div', { className: 'frk-ticker__track', style: { animationDuration: (p.speed || 30) + 's' } }, row(false), row(true))),
      h('button', { type: 'button', className: 'frk-ticker__pause', 'aria-label': paused ? 'Reanudar cinta' : 'Pausar cinta', 'aria-pressed': paused, onClick: function () { setPaused(!paused); } }, h(Icon, { name: paused ? 'play' : 'pause', size: 16 })));
  }

  /* ---------- SplitFlap: panel de paletas ---------- */
  var FLAP = ' ABCDEFGHIJKLMNÑOPQRSTUVWXYZ0123456789:·-';
  function SplitFlap(p) {
    var cy = useState(0), ci = cy[0], ps = useState(false), paused = ps[0];
    useEffect(function () { if (!p.cycle || paused || reduced()) return; var t = setTimeout(function () { cy[1]((ci + 1) % p.cycle.length); }, p.interval || 4000); return function () { clearTimeout(t); }; }, [ci, paused, p.cycle && p.cycle.length]);
    var val = p.cycle ? p.cycle[ci % p.cycle.length] : p.value;
    var len = p.length || (p.cycle ? Math.max.apply(null, p.cycle.map(function (x) { return String(x).length; })) : String(val || '').length), target = String(val || '').toUpperCase().padEnd(len, ' ').slice(0, len);
    var s = useState(target), shown = s[0], setShown = s[1];
    useEffect(function () {
      if (reduced()) { setShown(target); return; }
      var step = 0, cur = shown.split(''), timer = setInterval(function () {
        step++; var done = true;
        cur = cur.map(function (ch, i) {
          if (ch === target[i]) return ch;
          if (step < i * 2) { done = false; return ch; }
          done = false; var k = FLAP.indexOf(ch); return FLAP[(k + 1 + FLAP.length) % FLAP.length] === undefined ? target[i] : FLAP[(k + 1) % FLAP.length];
        });
        setShown(cur.join('')); if (done || step > 80) { clearInterval(timer); setShown(target); }
      }, p.speed || 45);
      return function () { clearInterval(timer); };
    }, [target]);
    return h('div', { className: cx('frk-flap', 'frk-flap--' + (p.size || 'm'), p.tone && 'frk-flap--' + p.tone, p.className), onPointerEnter: p.cycle ? function () { ps[1](true); } : undefined, onPointerLeave: p.cycle ? function () { ps[1](false); } : undefined, onFocus: p.cycle ? function () { ps[1](true); } : undefined, onBlur: p.cycle ? function () { ps[1](false); } : undefined },
      h('span', { className: 'frk-sr', 'aria-live': 'polite' }, target.trim()),
      h('div', { className: 'frk-flap__cells', 'aria-hidden': true }, shown.split('').map(function (ch, i) { return h('span', { key: i, className: cx('frk-flap__cell', ch !== target[i] && 'is-flipping') }, ch === ' ' ? ' ' : ch); })));
  }

  /* ---------- Deck: carrusel de cartas apiladas, se lanza deslizando ---------- */
  function Deck(p) {
    var kids = R.Children.toArray(p.children), n = kids.length;
    var s = useState(0), top = s[0], setTop = s[1], d = useState(0), dx = d[0], setDx = d[1], fly = useState(0), out = fly[0], setOut = fly[1], drag = useRef(null);
    function go(dir) { if (out) return; setOut(dir); setTimeout(function () { setOut(0); setDx(0); setTop((top + (dir > 0 ? 1 : n - 1)) % n); p.onChange && p.onChange((top + (dir > 0 ? 1 : n - 1)) % n); }, reduced() ? 0 : 320); }
    function up() { if (!drag.current) return; drag.current = null; if (Math.abs(dx) > 90) go(dx < 0 ? 1 : -1); else setDx(0); }
    return h('div', { className: cx('frk-deck', p.className), role: 'region', 'aria-roledescription': 'carrusel', 'aria-label': p.label, tabIndex: 0, onKeyDown: function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); go(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); } } },
      h('div', { className: 'frk-deck__stack', style: { height: p.height || 280 } }, range(Math.min(3, n)).reverse().map(function (k) {
        var i = (top + k) % n, isTop = k === 0;
        var tf;
        if (!isTop) tf = 'translateY(' + k * 14 + 'px) scale(' + (1 - k * 0.05) + ')';
        else if (out) tf = 'translateX(' + (out * -130) + '%) rotate(' + (out * -12) + 'deg)';
        else tf = 'translateX(' + dx + 'px) rotate(' + (dx / 20) + 'deg)';
        return h('div', {
          key: i, className: cx('frk-deck__card', isTop && 'is-top', isTop && drag.current && 'is-dragging'), style: { transform: tf, zIndex: 10 - k }, 'aria-hidden': !isTop, 'aria-label': (i + 1) + ' de ' + n,
          onPointerDown: isTop ? function (e) { drag.current = { x: e.clientX }; e.currentTarget.setPointerCapture(e.pointerId); } : undefined,
          onPointerMove: isTop ? function (e) { if (drag.current) setDx(e.clientX - drag.current.x); } : undefined, onPointerUp: isTop ? up : undefined, onPointerCancel: isTop ? up : undefined
        }, kids[i]);
      })),
      h('div', { className: 'frk-pager__bar' },
        h('span', { className: 'frk-deck__count' }, pad(top + 1) + ' / ' + pad(n)),
        h('div', { className: 'frk-pager__btns' },
          h('button', { type: 'button', className: 'frk-key frk-tone--well frk-key--s frk-key--round', 'aria-label': 'Anterior', onClick: function () { go(-1); } }, h('span', { className: 'frk-key__main' }, h(Icon, { name: 'arrow-left', size: 20 }))),
          h('button', { type: 'button', className: 'frk-key frk-tone--ink frk-key--s frk-key--round', 'aria-label': 'Siguiente', onClick: function () { go(1); } }, h('span', { className: 'frk-key__main' }, h(Icon, { name: 'arrow-right', size: 20 }))))),
      h('span', { className: 'frk-sr', 'aria-live': 'polite' }, 'Carta ' + (top + 1) + ' de ' + n));
  }

  /* ---------- AgentWidget: agente embebible (voz + chat) ---------- */
  function AgentWidget(p) {
    var o = useState(!!p.defaultOpen), open = o[0], setOpen = o[1];
    var st = useState(p.defaultState || 'idle'), state = p.state || st[0], setState = st[1];
    var md = useState(p.mode || 'voice'), mode = md[0];
    var ms = useState(p.messages || []), msgs = p.messages || ms[0];
    var pres = usePresence(open, 200), panel = useRef(null), launcher = useRef(null);
    useEffect(function () { if (!p.demo || state === 'idle') return; var next = { listening: 'thinking', thinking: 'speaking', speaking: 'listening' }[state]; var t = setTimeout(function () { setState(next); }, state === 'thinking' ? 1400 : 2600); return function () { clearTimeout(t); }; }, [state, p.demo]);
    var live = state !== 'idle';
    function talk() { var n = live ? 'idle' : 'listening'; setState(n); p.onStart && !live && p.onStart(); p.onEnd && live && p.onEnd(); }
    function close() { setOpen(false); setTimeout(function () { launcher.current && launcher.current.focus(); }, 0); }
    var names = { idle: 'Disponible', listening: 'Escuchando', thinking: 'Pensando', speaking: 'Hablando' };
    return h('div', { className: cx('frk-agent', p.inline && 'frk-agent--inline', p.className), onKeyDown: function (e) { if (e.key === 'Escape' && open) close(); } },
      pres[0] ? h('div', { ref: panel, role: 'dialog', 'aria-label': p.name || 'Asistente', className: cx('frk-agent__panel', pres[1] && open && 'is-in') },
        h('div', { className: 'frk-agent__head' },
          h(Avatar, { name: p.name || 'Asistente', size: 40, status: live ? 'live' : 'online', tone: p.tone || 'rams' }),
          h('div', { className: 'frk-agent__who' }, h('span', { className: 'frk-agent__name' }, p.name || 'Asistente'), h(LED, { tone: live ? 'rec' : 'verde', blink: state === 'listening' }, names[state])),
          h(Segmented, { label: 'Modo', options: [{ value: 'voice', icon: 'mic', ariaLabel: 'Voz' }, { value: 'chat', icon: 'copy', ariaLabel: 'Texto' }], value: mode, onChange: md[1] }),
          h('button', { type: 'button', className: 'frk-key frk-tone--well frk-key--s frk-key--round', 'aria-label': 'Cerrar', onClick: close }, h('span', { className: 'frk-key__main' }, h(Icon, { name: 'close', size: 20 })))),
        mode === 'voice' ? h('div', { className: 'frk-agent__voice' },
          h(VoiceOrb, { state: state, size: 180, tone: p.tone || 'rams', level: p.level != null ? p.level : 0.7 }),
          p.transcript ? h('p', { className: 'frk-agent__transcript' }, p.transcript) : null,
          h('div', { className: 'frk-agent__controls' },
            h('button', { type: 'button', className: cx('frk-key', 'frk-key--l', 'frk-key--round', live ? 'frk-tone--rec' : 'frk-tone--ink'), 'aria-label': live ? 'Terminar conversación' : 'Empezar a hablar', onClick: talk }, h('span', { className: 'frk-key__main' }, h(Icon, { name: live ? 'close' : 'mic', size: 36 }))),
            h('span', { className: 'frk-agent__hint' }, live ? 'Toca para colgar' : 'Toca para hablar')))
          : h('div', { className: 'frk-agent__chat' },
            h('div', { className: 'frk-agent__log', 'aria-live': 'polite' }, msgs.length ? msgs.map(function (x, i) { return h(Message, Object.assign({ key: i }, x), x.text); }) : h(EmptyState, { compact: true, shape: 'ring', title: 'Pregunta lo que quieras', text: 'Reservas, horarios, tu progreso.' })),
            h(Composer, { voice: false, suggestions: p.suggestions, onSend: function (v) { var n = msgs.concat([{ role: 'user', text: v }, { role: 'assistant', thinking: true }]); ms[1](n); p.onSend && p.onSend(v); } }))) : null,
      h('button', {
        ref: launcher, type: 'button', className: cx('frk-agent__launcher', open && 'is-open', live && 'is-live'), 'aria-label': open ? 'Ocultar asistente' : 'Abrir asistente ' + (p.name || ''), 'aria-expanded': open,
        onClick: function () { setOpen(!open); }
      }, open ? h(Icon, { name: 'chevron-down', size: 28 }) : h(VoiceOrb, { state: live ? state : 'thinking', size: 40, grid: 7, tone: 'paper', caption: false, label: '' })));
  }

  /* ---------- Checkbox ---------- */
  function Checkbox(p) {
    var id = useId(), st = useState(!!p.defaultChecked), on = p.checked != null ? p.checked : st[0];
    function toggle() { if (p.disabled) return; var n = p.indeterminate ? true : !on; if (p.checked == null) st[1](n); p.onChange && p.onChange(n); }
    return h('label', { className: cx('frk-check', on && 'is-on', p.indeterminate && 'is-mixed', p.disabled && 'is-disabled', p.className), htmlFor: id },
      h('button', { id: id, type: 'button', role: 'checkbox', 'aria-label': p.ariaLabel, 'aria-checked': p.indeterminate ? 'mixed' : on, disabled: p.disabled, className: 'frk-check__box', onClick: toggle, 'aria-describedby': p.hint ? id + 'h' : undefined },
        h(Icon, { name: p.indeterminate ? 'minus' : 'check', size: 20, strokeWidth: 2.6 })),
      h('span', { className: 'frk-check__text' }, h('span', { className: 'frk-check__label' }, p.label || p.children), p.hint ? h('span', { id: id + 'h', className: 'frk-check__hint' }, p.hint) : null));
  }

  /* ---------- RadioGroup: aro → disco ---------- */
  function RadioGroup(p) {
    var opts = norm(p.options), st = useValue(p, p.defaultValue), v = st[0], refs = useRef([]);
    function key(e, i) {
      var d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0; if (!d) return;
      e.preventDefault(); var n = i; for (var k = 0; k < opts.length; k++) { n = (n + d + opts.length) % opts.length; if (!opts[n].disabled) break; }
      st[1](opts[n].value); refs.current[n] && refs.current[n].focus();
    }
    var sel = -1; opts.forEach(function (o, i) { if (o.value === v) sel = i; });
    return h('div', { role: 'radiogroup', 'aria-label': p.label, className: cx('frk-radio', p.direction === 'row' && 'frk-radio--row', p.className) },
      p.label ? h('span', { className: 'frk-field__label', 'aria-hidden': true }, p.label) : null,
      opts.map(function (o, i) {
        var on = o.value === v;
        return h('button', { key: o.value, ref: function (el) { refs.current[i] = el; }, type: 'button', role: 'radio', 'aria-checked': on, disabled: o.disabled, tabIndex: on || (sel < 0 && i === 0) ? 0 : -1, className: cx('frk-radio__opt', on && 'is-on'), onClick: function () { st[1](o.value); }, onKeyDown: function (e) { key(e, i); } },
          h('span', { className: 'frk-radio__mark', 'aria-hidden': true }), h('span', { className: 'frk-check__text' }, h('span', { className: 'frk-check__label' }, o.label), o.hint ? h('span', { className: 'frk-check__hint' }, o.hint) : null));
      }));
  }

  /* ---------- Calendar: tira de semana o mes ---------- */
  var DOW = ['L', 'M', 'X', 'J', 'V', 'S', 'D'], MES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseISO(s) { var a = String(s).split('-'); return new Date(+a[0], +a[1] - 1, +a[2]); }
  function addD(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function Calendar(p) {
    var today = p.today ? parseISO(p.today) : new Date(); today.setHours(0, 0, 0, 0);
    var st = useValue(p, iso(today)), v = st[0], sel = parseISO(v);
    var vw = useState(p.view || 'week'), view = vw[0];
    var cur = useState(sel), anchor = cur[0], setAnchor = cur[1], grid = useRef(null);
    var marks = {}; (p.marks || []).forEach(function (m) { marks[m] = 1; });
    var days = [];
    if (view === 'week') { var mon = addD(anchor, -((anchor.getDay() + 6) % 7)); for (var i = 0; i < 7; i++) days.push(addD(mon, i)); }
    else { var first = new Date(anchor.getFullYear(), anchor.getMonth(), 1), start = addD(first, -((first.getDay() + 6) % 7)); for (var j = 0; j < 42; j++) days.push(addD(start, j)); }
    function pick(d) { st[1](iso(d)); setAnchor(d); setTimeout(function () { var el = grid.current && grid.current.querySelector('[data-day="' + iso(d) + '"]'); el && el.focus(); }, 0); }
    function key(e) { var m = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 7, ArrowUp: -7 }[e.key]; if (m == null) return; e.preventDefault(); pick(addD(sel, view === 'week' && Math.abs(m) === 7 ? m : m)); }
    function shift(n) { var a = view === 'week' ? addD(anchor, n * 7) : new Date(anchor.getFullYear(), anchor.getMonth() + n, 1); setAnchor(a); }
    var title = MES[anchor.getMonth()] + ' ' + anchor.getFullYear();
    return h('div', { className: cx('frk-cal', 'frk-cal--' + view, p.className) },
      h('div', { className: 'frk-cal__head' },
        h('span', { className: 'frk-cal__title', 'aria-live': 'polite' }, title.charAt(0).toUpperCase() + title.slice(1)),
        h('div', { className: 'frk-pager__btns' },
          p.switchable !== false ? h('button', { type: 'button', className: 'frk-cal__view', onClick: function () { vw[1](view === 'week' ? 'month' : 'week'); }, 'aria-label': view === 'week' ? 'Ver mes' : 'Ver semana' }, view === 'week' ? 'Mes' : 'Semana') : null,
          h('button', { type: 'button', className: 'frk-key frk-tone--well frk-key--s frk-key--round', 'aria-label': view === 'week' ? 'Semana anterior' : 'Mes anterior', onClick: function () { shift(-1); } }, h('span', { className: 'frk-key__main' }, h(Icon, { name: 'arrow-left', size: 20 }))),
          h('button', { type: 'button', className: 'frk-key frk-tone--well frk-key--s frk-key--round', 'aria-label': view === 'week' ? 'Semana siguiente' : 'Mes siguiente', onClick: function () { shift(1); } }, h('span', { className: 'frk-key__main' }, h(Icon, { name: 'arrow-right', size: 20 }))))),
      h('div', { className: 'frk-cal__dow', 'aria-hidden': true }, DOW.map(function (d) { return h('span', { key: d }, d); })),
      h('div', { ref: grid, className: 'frk-cal__grid', role: 'group', 'aria-label': 'Días', onKeyDown: key }, days.map(function (d) {
        var k = iso(d), isSel = k === v, isToday = k === iso(today), out = view === 'month' && d.getMonth() !== anchor.getMonth(), past = d < today;
        return h('button', {
          key: k, type: 'button', 'data-day': k, tabIndex: isSel ? 0 : -1, 'aria-pressed': isSel, 'aria-current': isToday ? 'date' : undefined,
          'aria-label': d.getDate() + ' de ' + MES[d.getMonth()] + (marks[k] ? ', con sesión' : '') + (isToday ? ', hoy' : ''),
          className: cx('frk-cal__day', isSel && 'is-sel', isToday && 'is-today', out && 'is-out', past && !isSel && 'is-past', marks[k] && 'has-mark'), onClick: function () { pick(d); }
        }, h('span', null, d.getDate()));
      })));
  }

  /* ---------- Banner: aviso en línea ---------- */
  var BANNER = { info: ['klein-soft', 'dots'], ok: ['verde', 'check'], warn: ['sol', 'timer'], error: ['rec', 'close'] };
  function Banner(p) {
    var t = BANNER[p.tone || 'info'], s = useState(true);
    if (!s[0]) return null;
    return h('div', { role: p.tone === 'error' ? 'alert' : 'status', className: cx('frk-banner', 'frk-tone--' + t[0], p.className) },
      h('span', { className: 'frk-banner__icon' }, h(Icon, { name: p.icon || t[1], size: 20 })),
      h('div', { className: 'frk-banner__text' }, p.title ? h('strong', null, p.title) : null, p.children ? h('span', null, p.children) : null),
      p.action ? h('button', { type: 'button', className: 'frk-banner__action', onClick: p.action.onClick }, p.action.label) : null,
      p.dismissible ? h('button', { type: 'button', className: 'frk-toast__close', 'aria-label': 'Descartar aviso', onClick: function () { s[1](false); p.onDismiss && p.onDismiss(); } }, h(Icon, { name: 'close', size: 18 })) : null);
  }

  /* ---------- Skeleton: carga de puntos ---------- */
  function Skeleton(p) {
    var shape = p.shape || 'text', lines = p.lines || 3;
    var body = shape === 'text' ? range(lines).map(function (i) { return h('span', { key: i, className: 'frk-skel__line', style: { width: i === lines - 1 ? '60%' : '100%' } }); })
      : h('span', { className: 'frk-skel__' + shape, style: { height: p.height, width: p.width } });
    return h('div', { className: cx('frk-skel', 'frk-skel--' + shape, p.className), 'aria-busy': true, role: 'status' }, body, h('span', { className: 'frk-sr' }, p.label || 'Cargando'));
  }

  /* ---------- EmptyState ---------- */
  function EmptyState(p) {
    return h('div', { className: cx('frk-empty', p.compact && 'frk-empty--compact', p.className) },
      h(DotMatrix, { shape: p.shape || 'ring', grid: p.compact ? 9 : 13, dot: p.compact ? 4 : 6, pitch: p.compact ? 7 : 10, showOff: true, label: '' }),
      h('div', { className: 'frk-empty__title' }, p.title), p.text ? h('p', { className: 'frk-empty__text' }, p.text) : null,
      p.action ? h(KeyButton, { tone: 'ink', shape: 'pill', onClick: p.action.onClick }, p.action.label) : null);
  }

  /* ---------- Badge: contador sobre otro elemento ---------- */
  function Badge(p) {
    var c = p.count, show = p.dot || (c != null && c > 0), txt = c > (p.max || 99) ? (p.max || 99) + '+' : c;
    return h('span', { className: cx('frk-badge-wrap', p.className) }, p.children,
      show ? h('span', { className: cx('frk-badge', 'frk-tone--' + (p.tone || 'rams'), p.dot && 'is-dot'), 'aria-hidden': true }, p.dot ? null : txt) : null,
      show && !p.dot ? h('span', { className: 'frk-sr' }, ' (' + c + ' ' + (p.label || 'nuevos') + ')') : null);
  }

  /* ---------- TabBar: navegación inferior ---------- */
  function TabBar(p) {
    var items = p.items || [], st = useValue(p, items[0] && items[0].id), v = st[0];
    return h('nav', { className: cx('frk-tabbar', p.className), 'aria-label': p.label || 'Principal' }, items.map(function (it) {
      var on = it.id === v;
      return h('button', { key: it.id, type: 'button', className: cx('frk-tabbar__item', on && 'is-on'), 'aria-current': on ? 'page' : undefined, 'aria-label': it.label, onClick: function () { st[1](it.id); } },
        h(Badge, { count: it.badge, dot: it.dot }, h(Icon, { name: it.icon || 'home', size: 22 })), h('span', { className: 'frk-tabbar__label', 'aria-hidden': true }, it.label));
    }));
  }

  /* ---------- TopBar ---------- */
  function TopBar(p) {
    return h(p.as || 'div', { className: cx('frk-topbar', p.large && 'frk-topbar--large', p.className) },
      h('div', { className: 'frk-topbar__row' },
        p.onBack ? h('button', { type: 'button', className: 'frk-key frk-tone--well frk-key--s frk-key--round', 'aria-label': p.backLabel || 'Atrás', onClick: p.onBack }, h('span', { className: 'frk-key__main' }, h(Icon, { name: 'arrow-left', size: 20 }))) : h('span', { className: 'frk-topbar__spacer' }),
        p.large ? h('span', { className: 'frk-topbar__spacer' }) : h('h1', { className: 'frk-topbar__title' }, p.title),
        h('div', { className: 'frk-topbar__actions' }, p.actions)),
      p.large ? h(Text, { variant: 'display-xl', sub: p.subtitle, as: 'h1' }, p.title) : null);
  }

  /* ---------- Steps: progreso por pasos ---------- */
  function Steps(p) {
    var steps = p.steps || [], cur = p.current || 0;
    return h('ol', { className: cx('frk-steps', p.className), 'aria-label': p.label || 'Progreso' }, steps.map(function (s, i) {
      var state = i < cur ? 'full' : i === cur ? 'partial' : 'empty';
      return h('li', { key: i, className: cx('frk-steps__item', 'is-' + state), 'aria-current': i === cur ? 'step' : undefined },
        h(StateMark, { state: state, size: 22, label: '' }), h('span', { className: 'frk-steps__label' }, s), h('span', { className: 'frk-sr' }, state === 'full' ? ' (hecho)' : state === 'partial' ? ' (actual)' : ' (pendiente)'));
    }));
  }

  /* ---------- Tooltip ---------- */
  function Tooltip(p) {
    var id = useId(), s = useState(false), open = s[0], setOpen = s[1], t = useRef(null);
    function show() { clearTimeout(t.current); t.current = setTimeout(function () { setOpen(true); }, p.delay == null ? 400 : p.delay); }
    function hide() { clearTimeout(t.current); setOpen(false); }
    var child = R.Children.only(p.children);
    return h('span', { className: 'frk-tip-wrap', onPointerEnter: show, onPointerLeave: hide, onFocus: show, onBlur: hide, onKeyDown: function (e) { if (e.key === 'Escape') hide(); } },
      R.cloneElement(child, { 'aria-describedby': id }),
      h('span', { id: id, role: 'tooltip', className: cx('frk-tip', 'frk-tip--' + (p.side || 'top'), open && 'is-in') }, p.content));
  }

  /* ---------- Avatar ---------- */
  function Avatar(p) {
    var s = p.size || 48, ini = String(p.name || '?').split(/\s+/).map(function (w) { return w.charAt(0); }).join('').slice(0, 2).toUpperCase();
    return h('span', { className: cx('frk-avatar', 'frk-tone--' + (p.tone || 'ink'), p.status && p.status !== 'offline' && 'frk-aura frk-aura--' + (AURA[p.status] || 'verde') + ' is-on', p.status === 'live' && 'is-fast', p.status === 'offline' && 'is-offline', p.className), style: { width: s, height: s, fontSize: Math.round(s * 0.38) }, role: 'img', 'aria-label': p.name + (p.status ? ' · ' + ({ online: 'disponible', live: 'en directo', away: 'ausente', busy: 'ocupado', offline: 'desconectado' }[p.status] || p.status) : '') },
      p.src ? h('img', { src: p.src, alt: '', className: 'frk-avatar__img' }) : h('span', { 'aria-hidden': true }, ini),
      null);
  }

  /* ---------- LineChart: línea con marcador de "ahora" ---------- */
  function LineChart(p) {
    var data = p.data || [], W = p.width || 360, H = p.height || 140, pd = 12, n = data.length;
    var mn = Math.min.apply(null, data), mx = Math.max.apply(null, data), sp = (mx - mn) || 1;
    var pts = data.map(function (v, i) { return [pd + i / (n - 1) * (W - pd * 2), pd + (1 - (v - mn) / sp) * (H - pd * 2 - 18)]; });
    var d = pts.map(function (q, i) { if (!i) return 'M' + q[0] + ' ' + q[1]; var a = pts[i - 1], c = (q[0] - a[0]) / 2; return 'C' + (a[0] + c) + ' ' + a[1] + ' ' + (q[0] - c) + ' ' + q[1] + ' ' + q[0] + ' ' + q[1]; }).join(' ');
    var now = p.now != null ? p.now : -1, np = pts[now];
    return h('figure', { className: cx('frk-line', 'frk-line--' + (p.tone || 'ink'), p.className), style: { width: '100%', maxWidth: W } },
      h('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%', role: 'img', 'aria-label': (p.label || 'Gráfico') + ': mínimo ' + mn + (p.unit || '') + ', máximo ' + mx + (p.unit || '') + (np ? ', ahora ' + data[now] + (p.unit || '') : '') },
        h('path', { d: d, className: np ? 'frk-line__path is-future' : 'frk-line__path' }),
        np ? h('path', { d: d, className: 'frk-line__path', style: { clipPath: 'inset(0 ' + Math.round((W - np[0]) / W * 100) + '% 0 0)' } }) : null,
        np ? h('g', null, h('line', { x1: np[0], y1: np[1], x2: np[0], y2: H - 18, className: 'frk-line__now' }), h('circle', { cx: np[0], cy: np[1], r: 7, className: 'frk-line__ring' }), h('circle', { cx: np[0], cy: np[1], r: 2.5, className: 'frk-line__dot' })) : null,
        (p.labels || []).map(function (l, i) { var x = pd + i / ((p.labels.length - 1) || 1) * (W - pd * 2); return h('text', { key: i, x: x, y: H - 2, className: cx('frk-line__lbl', i === now && 'is-now'), textAnchor: i === 0 ? 'start' : i === p.labels.length - 1 ? 'end' : 'middle' }, l); })),
      p.caption ? h('figcaption', { className: 'frk-line__cap' }, p.caption) : null);
  }


  /* ================= Frekvens 5: datos densos, música, SaaS, notch, 3D, banca, energía, captura ================= */
  function lvl(v, mx) { return mx ? clamp(v / mx, 0, 1) : 0; }

  /* ---------- Heatmap: semitono de puntos ---------- */
  function Heatmap(p) {
    var data = p.data || [], rows = p.rows || 7, cols = Math.ceil(data.length / rows), size = p.cell || 14, mx = Math.max.apply(null, data.concat([1]));
    var total = data.reduce(function (a, b) { return a + b; }, 0), days = data.filter(function (x) { return x > 0; }).length;
    return h('figure', { className: cx('frk-heat', 'frk-heat--' + (p.tone || 'ink'), p.className) },
      h('svg', { width: cols * size, height: rows * size, style: { maxWidth: '100%', height: 'auto' }, viewBox: '0 0 ' + cols * size + ' ' + rows * size, role: 'img', 'aria-label': (p.label || 'Actividad') + ': ' + days + ' de ' + data.length + ' días con actividad, total ' + total + (p.unit || '') },
        data.map(function (v, i) {
          var c = Math.floor(i / rows), r = i % rows, k = lvl(v, mx);
          return h('circle', { key: i, cx: c * size + size / 2, cy: r * size + size / 2, r: v > 0 ? size * (0.18 + 0.27 * k) : size * 0.12, className: v > 0 ? 'is-on' : '' }, h('title', null, v + (p.unit || '')));
        })),
      p.caption ? h('figcaption', { className: 'frk-line__cap' }, p.caption) : null);
  }

  /* ---------- SplitBar: reparto en píldoras ---------- */
  function SplitBar(p) {
    var seg = p.segments || [], tot = seg.reduce(function (a, s) { return a + s.value; }, 0) || 1, tones = ['ink', 'rams', 'sol', 'klein', 'verde', 'tabaco'];
    if (p.variant === 'columns') {
      return h('div', { className: cx('frk-split', 'frk-split--columns', p.className), role: 'img', 'aria-label': seg.map(function (s) { return s.label + ' ' + Math.round(s.value / tot * 100) + '%'; }).join(', ') },
        seg.map(function (s, i) { var pc = Math.round(s.value / tot * 100); return h('div', { key: i, className: 'frk-split__col', style: { height: p.height || 220 } },
          h('div', { className: cx('frk-split__fill', 'frk-tone--' + (s.tone || 'surface')), style: { height: Math.max(30, pc) + '%' } }, h('span', { className: 'frk-split__pc' }, pc + '%'), h('span', { className: 'frk-split__lbl' }, s.label))); }));
    }
    return h('div', { className: cx('frk-split', p.className) },
      h('div', { className: 'frk-split__bar', role: 'img', 'aria-label': seg.map(function (s) { return s.label + ' ' + Math.round(s.value / tot * 100) + '%'; }).join(', ') },
        seg.map(function (s, i) { return h('span', { key: i, className: 'frk-tone--' + (s.tone || tones[i % tones.length]), style: { flexGrow: s.value } }); })),
      h('ul', { className: 'frk-split__legend' }, seg.map(function (s, i) { return h('li', { key: i }, h('span', { className: cx('frk-split__sw', 'frk-tone--' + (s.tone || tones[i % tones.length])) }), h('span', null, s.label), h('b', null, p.format ? p.format(s.value) : Math.round(s.value / tot * 100) + '%')); })));
  }

  /* ---------- Sparkline ---------- */
  function Sparkline(p) {
    var d = p.data || [], W = p.width || 96, H = p.height || 28, mn = Math.min.apply(null, d), mx = Math.max.apply(null, d), sp = (mx - mn) || 1;
    var pts = d.map(function (v, i) { return [2 + i / ((d.length - 1) || 1) * (W - 6), 3 + (1 - (v - mn) / sp) * (H - 6)]; });
    var last = pts[pts.length - 1] || [0, 0], up = d[d.length - 1] >= d[0];
    return h('svg', { className: cx('frk-spark', 'frk-spark--' + (p.tone || 'ink'), p.className), width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': (p.label || 'Tendencia') + (up ? ' al alza' : ' a la baja') + ', último ' + d[d.length - 1] },
      h('polyline', { points: pts.map(function (q) { return q.join(','); }).join(' ') }), h('circle', { cx: last[0], cy: last[1], r: 3 }));
  }

  /* ---------- ClickWheel: rueda táctil tipo reproductor de bolsillo ---------- */
  function ClickWheel(p) {
    var size = p.size || 220, ref = useRef(null), last = useRef(null), acc = useRef(0);
    var s = useState(0), spin = s[0], setSpin = s[1];
    function ang(e) { var r = ref.current.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI; }
    function step(d) { p.onStep && p.onStep(d); setSpin(function (x) { return x + d * 15; }); if (navigator.vibrate) try { navigator.vibrate(4); } catch (e) {} }
    function down(e) { last.current = ang(e); acc.current = 0; e.currentTarget.setPointerCapture(e.pointerId); }
    function mv(e) { if (last.current == null) return; var a = ang(e), d = a - last.current; if (d > 180) d -= 360; if (d < -180) d += 360; last.current = a; acc.current += d; while (Math.abs(acc.current) >= (p.detent || 24)) { var dir = acc.current > 0 ? 1 : -1; step(dir); acc.current -= dir * (p.detent || 24); } }
    function key(e) { var m = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]; if (m) { e.preventDefault(); step(m); } else if (e.key === 'Enter') { e.preventDefault(); p.onSelect && p.onSelect(); } else if (e.key === ' ') { e.preventDefault(); p.onPlay && p.onPlay(); } else if (e.key === 'm' || e.key === 'M') { p.onMenu && p.onMenu(); } }
    var lb = p.labels || {};
    function btn(pos, label, icon, fn) { return h('button', { type: 'button', className: 'frk-wheelpad__btn frk-wheelpad__btn--' + pos, 'aria-label': label, tabIndex: -1, onClick: fn }, icon ? h(Icon, { name: icon, size: 18 }) : h('span', null, label)); }
    return h('div', { ref: ref, className: cx('frk-wheelpad', 'frk-tone--' + (p.tone || 'surface'), p.className), style: { width: size, height: size } },
      h('div', { className: 'frk-wheelpad__ring', role: 'slider', tabIndex: 0, 'aria-label': (p.label || 'Rueda') + '. Flechas para girar, Enter para elegir, Espacio para reproducir, M para menú', 'aria-valuetext': p.valueText, 'aria-orientation': 'vertical', onPointerDown: down, onPointerMove: mv, onPointerUp: function () { last.current = null; }, onKeyDown: key }),
      h('span', { className: 'frk-wheelpad__ticks', style: { transform: 'rotate(' + spin + 'deg)' }, 'aria-hidden': true }),
      btn('top', lb.top || 'MENÚ', null, p.onMenu), btn('right', 'Siguiente', 'arrow-right', function () { step(1); }), btn('left', 'Anterior', 'arrow-left', function () { step(-1); }), btn('bottom', p.playing ? 'Pausa' : 'Reproducir', p.playing ? 'pause' : 'play', p.onPlay),
      h('button', { type: 'button', className: 'frk-wheelpad__center', 'aria-label': p.centerLabel || 'Elegir', tabIndex: -1, onClick: p.onSelect }));
  }

  /* ---------- DiscCarousel: discos para elegir ---------- */
  function DiscCarousel(p) {
    var items = p.items || [], st = useValue(p, 0), v = st[0], n = items.length, size = p.size || 220;
    function go(i) { st[1]((i + n) % n); }
    return h('div', { className: cx('frk-discs-wrap', p.className) }, h('div', { className: 'frk-discs', role: 'listbox', 'aria-label': p.label || 'Discos', tabIndex: 0, 'aria-activedescendant': 'frk-disc-' + v, style: { height: size + 20 },
      onKeyDown: function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); go(v + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(v - 1); } if (e.key === 'Enter') p.onPlay && p.onPlay(v); } },
      items.map(function (it, i) {
        var d = i - v; if (d > n / 2) d -= n; if (d < -n / 2) d += n;
        var ad = Math.abs(d); if (ad > 2) return null;
        return h('div', { key: i, id: 'frk-disc-' + i, role: 'option', 'aria-selected': d === 0, 'aria-label': it.title + (it.subtitle ? ', ' + it.subtitle : ''), className: cx('frk-disc', d === 0 && 'is-on', d === 0 && p.playing && 'is-spinning'),
          style: { width: size, height: size, transform: 'translateX(' + (d * size * 0.62) + 'px) scale(' + (1 - ad * 0.22) + ')', zIndex: 10 - ad, opacity: ad === 2 ? 0.5 : 1 }, onClick: function () { d === 0 ? (p.onPlay && p.onPlay(i)) : go(i); } },
          h('span', { className: 'frk-disc__vinyl' }, h('span', { className: cx('frk-disc__label', 'frk-tone--' + (it.tone || 'rams')) }, it.src ? h('img', { src: it.src, alt: '' }) : h('span', { className: 'frk-disc__letter' }, it.badge || it.title.charAt(0)))));
      })),
      items[v] ? h('div', { className: 'frk-discs__meta', 'aria-live': 'polite' }, h('span', { className: 'frk-discs__title' }, items[v].title), items[v].subtitle ? h('span', { className: 'frk-discs__sub' }, items[v].subtitle) : null) : null);
  }

  /* ---------- Sidebar: navegación de escritorio/iPad ---------- */
  function Sidebar(p) {
    var st = useValue(p, p.sections && p.sections[0] && p.sections[0].items[0] && p.sections[0].items[0].id), v = st[0];
    var c = useState(!!p.defaultCollapsed), col = p.collapsed != null ? p.collapsed : c[0];
    return h('nav', { className: cx('frk-side', col && 'is-collapsed', 'frk-tone--' + (p.tone || 'surface'), p.className), 'aria-label': p.label || 'Secciones' },
      h('div', { className: 'frk-side__head' }, col ? null : p.header,
        h('button', { type: 'button', className: 'frk-side__toggle', 'aria-label': col ? 'Expandir barra lateral' : 'Contraer barra lateral', 'aria-expanded': !col, onClick: function () { c[1](!col); p.onCollapse && p.onCollapse(!col); } }, h(Icon, { name: col ? 'arrow-right' : 'arrow-left', size: 18 }))),
      (p.sections || []).map(function (sec, si) {
        return h('div', { key: si, className: 'frk-side__sec' }, sec.label && !col ? h('span', { className: 'frk-side__label' }, sec.label) : null,
          h('ul', null, sec.items.map(function (it) {
            var on = it.id === v;
            return h('li', { key: it.id }, h('button', { type: 'button', className: cx('frk-side__item', on && 'is-on'), 'aria-current': on ? 'page' : undefined, 'aria-label': col ? it.label : undefined, title: col ? it.label : undefined, onClick: function () { st[1](it.id); } },
              h(Badge, { dot: col && !!it.count, tone: it.alert ? 'rec' : 'rams' }, h(Icon, { name: it.icon || 'dots', size: 20 })), col ? null : h('span', { className: 'frk-side__text' }, it.label),
              !col && it.count != null ? h('span', { className: cx('frk-side__count', it.alert && 'is-alert') }, it.count) : null));
          })));
      }),
      p.footer && !col ? h('div', { className: 'frk-side__foot' }, p.footer) : null);
  }

  /* ---------- DataTable ---------- */
  function DataTable(p) {
    var cols = p.columns || [], rows = p.rows || [], so = useState(p.defaultSort || null), sort = so[0], setSort = so[1];
    var se = useState({}), sel = se[0], setSel = se[1];
    var data = rows.slice();
    var pg = useState(0), page = pg[0], ps = p.pageSize || 0;
    if (sort) data.sort(function (a, b) { var x = a[sort.key], y = b[sort.key]; var r = typeof x === 'number' ? x - y : String(x).localeCompare(String(y), 'es'); return sort.dir === 'desc' ? -r : r; });
    var allOn = rows.length && rows.every(function (r, i) { return sel[r.id != null ? r.id : i]; });
    function cell(c, r) {
      var v = r[c.key];
      if (c.type === 'status') return h(Chip, { tone: (c.tones && c.tones[v]) || 'well', dot: true }, v);
      if (c.type === 'spark') return h(Sparkline, { data: v, width: 72, height: 22, label: c.label });
      if (c.type === 'bar') return h('span', { className: 'frk-table__bar' }, h('span', { style: { width: clamp(v, 0, 100) + '%' } }));
      if (c.type === 'avatar') return h('span', { className: 'frk-table__who' }, h(Avatar, { name: v, size: 28 }), v);
      return v;
    }
    if (!rows.length) return h(EmptyState, { compact: true, title: p.emptyTitle || 'Sin resultados', text: p.emptyText });
    return h('div', { className: cx('frk-table-wrap', p.className), role: 'region', 'aria-label': p.label, tabIndex: 0 },
      h('table', { className: cx('frk-table', p.dense && 'is-dense') },
        p.caption ? h('caption', { className: 'frk-sr' }, p.caption) : null,
        h('thead', null, h('tr', null,
          p.selectable ? h('th', { className: 'frk-table__check' }, h(Checkbox, { ariaLabel: 'Seleccionar todo', label: h('span', { className: 'frk-sr' }, 'Seleccionar todo'), checked: !!allOn, indeterminate: !allOn && Object.keys(sel).some(function (k) { return sel[k]; }), onChange: function (on) { var n = {}; rows.forEach(function (r, i) { n[r.id != null ? r.id : i] = on; }); setSel(n); } })) : null,
          cols.map(function (c) {
            var on = sort && sort.key === c.key;
            return h('th', { key: c.key, scope: 'col', className: cx(c.align === 'end' && 'is-end'), 'aria-sort': on ? (sort.dir === 'asc' ? 'ascending' : 'descending') : c.sortable ? 'none' : undefined },
              c.sortable ? h('button', { type: 'button', className: cx('frk-table__sort', on && 'is-on'), onClick: function () { setSort({ key: c.key, dir: on && sort.dir === 'asc' ? 'desc' : 'asc' }); } }, c.label, h('span', { className: 'frk-table__arrow', 'aria-hidden': true }, on ? (sort.dir === 'asc' ? '▲' : '▼') : '△')) : c.label);
          }))),
        h('tbody', null, (function () {
          var view = ps ? data.slice(page * ps, page * ps + ps) : data, out = [], lastG;
          view.forEach(function (r, i) {
            if (p.groupBy && r[p.groupBy] !== lastG) { lastG = r[p.groupBy]; out.push(h('tr', { key: 'g' + lastG, className: 'frk-table__group' }, h('th', { scope: 'rowgroup', colSpan: cols.length + (p.selectable ? 1 : 0) }, lastG))); }
            out.push(row(r, i));
          });
          return out;
        })())),
      ps && data.length > ps ? h('div', { className: 'frk-table__pager' }, h('span', null, (page * ps + 1) + '–' + Math.min(data.length, page * ps + ps) + ' de ' + data.length),
        h('div', { className: 'frk-pager__btns' },
          h('button', { type: 'button', className: 'frk-key frk-tone--well frk-key--s frk-key--round', 'aria-label': 'Página anterior', disabled: page === 0, onClick: function () { pg[1](page - 1); } }, h('span', { className: 'frk-key__main' }, h(Icon, { name: 'arrow-left', size: 18 }))),
          h('button', { type: 'button', className: 'frk-key frk-tone--well frk-key--s frk-key--round', 'aria-label': 'Página siguiente', disabled: (page + 1) * ps >= data.length, onClick: function () { pg[1](page + 1); } }, h('span', { className: 'frk-key__main' }, h(Icon, { name: 'arrow-right', size: 18 }))))) : null);
    function row(r, i) {
          var id = r.id != null ? r.id : i;
          return h('tr', { key: id, className: cx(sel[id] && 'is-sel'), onClick: p.onRowClick ? function () { p.onRowClick(r); } : undefined },
            p.selectable ? h('td', { className: 'frk-table__check' }, h(Checkbox, { ariaLabel: 'Seleccionar fila ' + (r[cols[0].key]), label: h('span', { className: 'frk-sr' }, 'Seleccionar fila ' + (r[cols[0].key])), checked: !!sel[id], onChange: function (on) { var n = Object.assign({}, sel); n[id] = on; setSel(n); } })) : null,
            cols.map(function (c) { return h('td', { key: c.key, className: cx(c.align === 'end' && 'is-end', c.mono && 'is-mono') }, cell(c, r)); }));
    }
  }

  /* ---------- CommandBar: paleta ⌘K ---------- */
  function CommandBar(p) {
    var o = useState(!!p.defaultOpen), open = p.open != null ? p.open : o[0];
    function setOpen(v) { if (p.open == null) o[1](v); if (!v && p.onClose) p.onClose(); }
    var q = useState(''), query = q[0], a = useState(0), act = a[0], setAct = a[1], inp = useRef(null), back = useRef(null);
    var pres = usePresence(open, 150);
    useEffect(function () { if (!p.hotkey) return; function f(e) { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen(!open); } } window.addEventListener('keydown', f); return function () { window.removeEventListener('keydown', f); }; }, [open, p.hotkey]);
    useEffect(function () { if (open) { back.current = document.activeElement; q[1](''); setAct(0); setTimeout(function () { inp.current && inp.current.focus(); }, 20); } else if (back.current && back.current.focus) back.current.focus(); }, [open]);
    var list = (p.commands || []).filter(function (c) { return !query || (c.label + ' ' + (c.keywords || '')).toLowerCase().indexOf(query.toLowerCase()) >= 0; });
    function run(c) { if (!c) return; c.onRun && c.onRun(); p.onRun && p.onRun(c.id); setOpen(false); }
    if (!pres[0]) return null;
    var groups = []; list.forEach(function (c) { var g = c.group || ''; if (groups.indexOf(g) < 0) groups.push(g); });
    var id = 'frk-cmd', idx = -1;
    return h('div', { className: cx('frk-cmd', pres[1] && open && 'is-in', p.inline && 'frk-cmd--inline'), onKeyDown: function (e) { if (e.key === 'Escape') { e.preventDefault(); setOpen(false); } } },
      h('div', { className: 'frk-cmd__scrim', onClick: function () { setOpen(false); } }),
      h('div', { className: 'frk-cmd__panel', role: 'dialog', 'aria-modal': true, 'aria-label': p.label || 'Comandos' },
        h('div', { className: 'frk-cmd__search' }, h(Icon, { name: 'arrow-right', size: 20 }),
          h('input', { ref: inp, role: 'combobox', 'aria-expanded': true, 'aria-controls': id, 'aria-activedescendant': list[act] ? id + '-' + act : undefined, 'aria-autocomplete': 'list', placeholder: p.placeholder || 'Busca una acción…', value: query, className: 'frk-cmd__input',
            onChange: function (e) { q[1](e.target.value); setAct(0); },
            onKeyDown: function (e) { if (e.key === 'ArrowDown') { e.preventDefault(); setAct(Math.min(list.length - 1, act + 1)); } else if (e.key === 'ArrowUp') { e.preventDefault(); setAct(Math.max(0, act - 1)); } else if (e.key === 'Enter') { e.preventDefault(); run(list[act]); } } }),
          h('span', { className: 'frk-cmd__kbd' }, 'ESC')),
        h('div', { id: id, role: 'listbox', className: 'frk-cmd__list' }, list.length ? groups.map(function (g) {
          return h('div', { key: g, role: 'group', 'aria-label': g || undefined }, g ? h('div', { className: 'frk-cmd__group' }, g) : null, list.filter(function (c) { return (c.group || '') === g; }).map(function (c) {
            idx = list.indexOf(c); var i = idx;
            return h('div', { key: c.id, id: id + '-' + i, role: 'option', 'aria-selected': i === act, className: cx('frk-cmd__item', i === act && 'is-active'), onPointerEnter: function () { setAct(i); }, onClick: function () { run(c); } },
              h(Icon, { name: c.icon || 'dots', size: 18 }), h('span', null, c.label), c.shortcut ? h('span', { className: 'frk-cmd__kbd' }, c.shortcut) : null);
          }));
        }) : h('div', { className: 'frk-cmd__empty' }, 'Nada con «' + query + '»'))));
  }

  /* ---------- Notch: isla de IA en la parte superior ---------- */
  function Notch(p) {
    var x = useState(!!p.defaultExpanded), pinned = x[0], setPinned = x[1], hv = useState(false), hover = hv[0], setHover = hv[1];
    var state = p.state || 'idle', exp = p.expanded != null ? p.expanded : (pinned || hover), live = state !== 'idle';
    var names = { idle: 'Listo', listening: 'Escuchando', thinking: 'Pensando', speaking: 'Hablando', done: 'Hecho' };
    return h('div', { className: cx('frk-notch', exp && 'is-open', live && 'is-live', p.inline && 'frk-notch--inline', p.className), onPointerEnter: function () { setHover(true); }, onPointerLeave: function () { setHover(false); } },
      h('button', { type: 'button', className: 'frk-notch__pill', 'aria-expanded': exp, 'aria-label': (p.name || 'Asistente') + ': ' + names[state], onClick: function () { setPinned(!pinned); }, onKeyDown: function (e) { if (e.key === 'Escape') setPinned(false); } },
        h(VoiceOrb, { state: state === 'done' ? 'idle' : state, size: 22, grid: 5, tone: p.tone || 'rams', caption: false, label: '' }),
        h('span', { className: 'frk-notch__peek' }, p.peek || names[state]),
        h('span', { className: cx('frk-notch__led', 'is-' + state) })),
      h('div', { className: 'frk-notch__body', 'aria-hidden': !exp },
        h('div', { className: 'frk-notch__row' }, h(VoiceOrb, { state: state === 'done' ? 'idle' : state, size: 64, grid: 9, tone: p.tone || 'rams', caption: false, label: names[state] }),
          h('div', { className: 'frk-notch__text' }, h('span', { className: 'frk-notch__name' }, (p.name || 'Asistente') + ' · ' + names[state]), h('span', { className: 'frk-notch__line', 'aria-live': 'polite' }, p.text))),
        p.progress != null ? h('div', { className: 'frk-notch__prog' }, h('span', { style: { width: clamp(p.progress, 0, 100) + '%' } })) : null,
        p.actions ? h('div', { className: 'frk-notch__actions' }, p.actions.map(function (a, i) { return h('button', { key: i, type: 'button', className: cx('frk-notch__act', i === 0 && 'is-main'), tabIndex: exp ? 0 : -1, onClick: a.onClick }, a.icon ? h(Icon, { name: a.icon, size: 16 }) : null, a.label); })) : null));
  }

  /* ---------- Viewport3D: visor 3D en CSS, órbita con arrastre ---------- */
  function Viewport3D(p) {
    var r = useState({ x: p.pitch != null ? p.pitch : -24, y: p.yaw != null ? p.yaw : 36, z: 1 }), v = r[0], setV = r[1], drag = useRef(null), ref = useRef(null);
    var presets = { iso: { x: -24, y: 36 }, front: { x: 0, y: 0 }, top: { x: -88, y: 0 } };
    useEffect(function () { var el = ref.current; if (!el) return; function w(e) { e.preventDefault(); setV(function (o) { return Object.assign({}, o, { z: clamp(o.z * (e.deltaY > 0 ? 0.92 : 1.08), 0.5, 2) }); }); } el.addEventListener('wheel', w, { passive: false }); return function () { el.removeEventListener('wheel', w); }; }, []);
    var size = p.size || 120, s2 = size / 2, tone = p.tone || 'rams', shape = p.shape || 'cube';
    function face(tf, t, k) { return h('span', { key: k, className: 'frk-3d__face frk-tone--' + t, style: { width: size, height: size, transform: tf + ' translateZ(' + s2 + 'px)' } }); }
    var obj = shape === 'stack' ? range(3).map(function (i) { return h('span', { key: i, className: 'frk-3d__obj', style: { transform: 'translateY(' + (-i * size * 0.36) + 'px) scale3d(1, .3, 1)' } }, face('rotateY(0)', ['rams', 'sol', 'klein'][i], 1), face('rotateY(90deg)', ['rams', 'sol', 'klein'][i], 2), face('rotateY(180deg)', ['rams', 'sol', 'klein'][i], 3), face('rotateY(-90deg)', ['rams', 'sol', 'klein'][i], 4), face('rotateX(90deg)', 'paper', 5)); })
      : [h('span', { key: 'c', className: 'frk-3d__obj' }, face('rotateY(0)', tone, 1), face('rotateY(90deg)', 'ink', 2), face('rotateY(180deg)', tone, 3), face('rotateY(-90deg)', 'ink', 4), face('rotateX(90deg)', 'sol', 5), face('rotateX(-90deg)', 'ink', 6))];
    return h('div', { className: cx('frk-3d', p.className) },
      h('div', { ref: ref, className: 'frk-3d__stage', role: 'img', tabIndex: 0, 'aria-label': (p.label || 'Modelo 3D') + '. Arrastra o usa las flechas para girar; + y − para acercar.', style: { height: p.height || 320 },
        onPointerDown: function (e) { drag.current = { x: e.clientX, y: e.clientY, v: v }; e.currentTarget.setPointerCapture(e.pointerId); },
        onPointerMove: function (e) { if (!drag.current) return; var d = drag.current; setV({ x: clamp(d.v.x - (e.clientY - d.y) * 0.4, -89, 89), y: d.v.y + (e.clientX - d.x) * 0.4, z: d.v.z }); },
        onPointerUp: function () { drag.current = null; },
        onKeyDown: function (e) { var k = e.key, dv = { ArrowLeft: [0, -8], ArrowRight: [0, 8], ArrowUp: [8, 0], ArrowDown: [-8, 0] }[k]; if (dv) { e.preventDefault(); setV(Object.assign({}, v, { x: clamp(v.x + dv[0], -89, 89), y: v.y + dv[1] })); } if (k === '+' || k === '=') setV(Object.assign({}, v, { z: clamp(v.z * 1.1, 0.5, 2) })); if (k === '-') setV(Object.assign({}, v, { z: clamp(v.z / 1.1, 0.5, 2) })); } },
        h('div', { className: 'frk-3d__cam', style: { transform: 'scale(' + v.z + ') rotateX(' + v.x + 'deg) rotateY(' + v.y + 'deg)' } },
          h('span', { className: 'frk-3d__floor' }), obj),
        h('div', { className: 'frk-3d__gizmo', 'aria-hidden': true }, h('span', { style: { transform: 'rotateX(' + v.x + 'deg) rotateY(' + v.y + 'deg)' } }, h('i', { className: 'x' }), h('i', { className: 'y' }), h('i', { className: 'z' })))),
      h('div', { className: 'frk-3d__bar' },
        h(Segmented, { label: 'Vista', options: [{ value: 'iso', label: 'Iso' }, { value: 'front', label: 'Frente' }, { value: 'top', label: 'Arriba' }], value: null, onChange: function (k) { setV(Object.assign({}, presets[k], { z: v.z })); } }),
        h('span', { className: 'frk-3d__read' }, 'X ' + Math.round(v.x) + '° · Y ' + Math.round(((v.y % 360) + 360) % 360) + '° · ' + Math.round(v.z * 100) + '%')));
  }

  /* ---------- NumPad: introducir importes ---------- */
  function NumPad(p) {
    var st = useValue(p, ''), v = st[0], max = p.maxLength || 7;
    function press(k) { var n = v; if (k === 'del') n = v.slice(0, -1); else if (k === ',') { if (v.indexOf(',') < 0) n = (v || '0') + ','; } else { if (v.replace(',', '').length >= max) return; if (v.indexOf(',') >= 0 && v.split(',')[1].length >= 2) return; n = v === '0' ? k : v + k; } st[1](n); }
    useEffect(function () { if (!p.keyboard) return; function f(e) { if (/^[0-9]$/.test(e.key)) press(e.key); else if (e.key === ',' || e.key === '.') press(','); else if (e.key === 'Backspace') press('del'); } window.addEventListener('keydown', f); return function () { window.removeEventListener('keydown', f); }; });
    var keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', 'del'];
    return h('div', { className: cx('frk-numpad', p.className) },
      h('output', { className: cx('frk-numpad__display', !v && 'is-empty'), 'aria-live': 'polite', 'aria-label': (p.label || 'Importe') + ': ' + (v || '0') + ' ' + (p.currency || '€') }, (v || '0'), h('span', { className: 'frk-numpad__cur' }, p.currency || '€')),
      p.hint ? h('span', { className: 'frk-numpad__hint' }, p.hint) : null,
      h('div', { className: 'frk-numpad__keys', role: 'group', 'aria-label': 'Teclado numérico' }, keys.map(function (k) {
        return h('button', { key: k, type: 'button', className: 'frk-numpad__key', 'aria-label': k === 'del' ? 'Borrar' : k === ',' ? 'Coma decimal' : k, onClick: function () { press(k); } }, k === 'del' ? h(Icon, { name: 'arrow-left', size: 24 }) : k);
      })),
      p.onSubmit ? h(KeyButton, { tone: 'klein', shape: 'pill', block: true, disabled: !v || parseFloat(v.replace(',', '.')) === 0, onClick: function () { p.onSubmit(parseFloat(v.replace(',', '.'))); } }, p.submitLabel || 'Continuar') : null);
  }

  /* ---------- HourStrip: precio por horas ---------- */
  function HourStrip(p) {
    var prices = p.prices || [], now = p.now != null ? p.now : -1, mn = Math.min.apply(null, prices), mx = Math.max.apply(null, prices), sp = (mx - mn) || 1;
    function band(v) { var k = (v - mn) / sp; return k < 0.34 ? 'verde' : k < 0.67 ? 'sol' : 'rams'; }
    var cheap = prices.map(function (v, i) { return [v, i]; }).sort(function (a, b) { return a[0] - b[0]; }).slice(0, 3).map(function (x) { return pad(x[1]) + 'h'; }).join(', ');
    return h('figure', { className: cx('frk-hours', p.className) },
      now >= 0 ? h('div', { className: 'frk-hours__now' }, h('span', { className: 'frk-text--label' }, 'Ahora · ' + pad(now) + ':00'), h('span', { className: 'frk-hours__price' }, String(prices[now]).replace('.', ','), h('small', null, ' ' + (p.unit || '€/kWh')))) : null,
      h('div', { className: 'frk-hours__bars', role: 'img', 'aria-label': (p.label || 'Precio por hora') + '. Más barato: ' + cheap + '. Más caro: ' + pad(prices.indexOf(mx)) + 'h.' },
        prices.map(function (v, i) { return h('span', { key: i, className: cx('frk-hours__bar', 'frk-tone--' + band(v), i === now && 'is-now', i < now && 'is-past'), style: { height: (24 + (v - mn) / sp * 76) + '%' }, title: pad(i) + 'h · ' + v }); })),
      h('div', { className: 'frk-hours__axis', 'aria-hidden': true }, ['00', '06', '12', '18', '23'].map(function (t) { return h('span', { key: t }, t); })),
      h('figcaption', { className: 'frk-hours__legend' }, h('span', null, h('i', { className: 'frk-tone--verde' }), 'Barato'), h('span', null, h('i', { className: 'frk-tone--sol' }), 'Medio'), h('span', null, h('i', { className: 'frk-tone--rams' }), 'Caro')));
  }

  /* ---------- PaymentCard ---------- */
  function PaymentCard(p) {
    var frozen = !!p.frozen;
    return h('div', { className: cx('frk-card', 'frk-tone--' + (p.tone || 'klein'), frozen && 'is-frozen', p.className), role: 'img', 'aria-label': 'Tarjeta ' + (p.brand || '') + ' terminada en ' + (p.last4 || '0000') + (frozen ? ', congelada' : '') },
      h('div', { className: 'frk-card__top' }, h('span', { className: 'frk-card__brand' }, p.brand || 'Frekvens'), h('svg', { width: 34, height: 26, viewBox: '0 0 34 26', 'aria-hidden': true, className: 'frk-card__chip' }, range(12).map(function (i) { return h('circle', { key: i, cx: 4 + (i % 4) * 9, cy: 4 + Math.floor(i / 4) * 9, r: 2.6 }); }))),
      h('div', { className: 'frk-card__num' }, '•••• ' + (p.last4 || '0000')),
      h('div', { className: 'frk-card__bottom' }, h('span', null, p.name || ''), h('span', null, p.expiry || '')),
      frozen ? h('div', { className: 'frk-card__frost', 'aria-hidden': true }, h(LED, { tone: 'klein' }, 'Congelada')) : null);
  }

  /* ---------- Recorder: grabadora ---------- */
  function Recorder(p) {
    var s = useState('idle'), state = s[0], setState = s[1], c = useClock(state === 'rec'), lv = useState(0), level = lv[0], setLevel = lv[1];
    var tk = useState(p.takes || []), takes = tk[0], setTakes = tk[1], media = useRef(null);
    useEffect(function () {
      if (state !== 'rec') return; var raf, t0 = performance.now(), an = media.current && media.current.analyser, buf = an ? new Uint8Array(an.fftSize) : null;
      function tick() { if (an) { an.getByteTimeDomainData(buf); var m = 0; for (var i = 0; i < buf.length; i++) m = Math.max(m, Math.abs(buf[i] - 128)); setLevel(Math.min(100, m / 1.28)); } else setLevel(35 + 30 * Math.abs(Math.sin((performance.now() - t0) / 230)) + 15 * Math.random()); raf = requestAnimationFrame(tick); }
      raf = requestAnimationFrame(tick); return function () { cancelAnimationFrame(raf); };
    }, [state]);
    function start() {
      c[1]();
      if (p.real && navigator.mediaDevices && window.MediaRecorder) {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
          var rec = new MediaRecorder(stream), chunks = [], ctx = new (window.AudioContext || window.webkitAudioContext)(), an = ctx.createAnalyser(); ctx.createMediaStreamSource(stream).connect(an);
          rec.ondataavailable = function (e) { chunks.push(e.data); };
          rec.onstop = function () { var url = URL.createObjectURL(new Blob(chunks, { type: rec.mimeType })); stream.getTracks().forEach(function (t) { t.stop(); }); ctx.close(); finish(url); };
          media.current = { rec: rec, analyser: an }; rec.start(); setState('rec');
        }).catch(function () { media.current = null; setState('rec'); });
      } else { media.current = null; setState('rec'); }
    }
    var elapsed = useRef(0); elapsed.current = c[0];
    function finish(url) { var d = Math.round(elapsed.current / 1000), take = { title: 'Nota ' + pad(takes.length + 1), duration: Math.max(1, d), src: url, at: new Date().toTimeString().slice(0, 5) }; setTakes(function (t) { return [take].concat(t); }); p.onSave && p.onSave(take); }
    function stop() { setState('idle'); setLevel(0); if (media.current && media.current.rec) media.current.rec.stop(); else finish(); }
    var rec = state === 'rec';
    return h('div', { className: cx('frk-rec', rec && 'is-rec', p.className) },
      h('div', { className: 'frk-rec__deck' },
        h('div', { className: 'frk-rec__reel', 'aria-hidden': true }, h('span', { className: 'frk-rec__hub' }), h('span', { className: 'frk-rec__line' })),
        h('div', { className: 'frk-rec__side' },
          h('span', { className: 'frk-rec__lcd' }, h(LED, { tone: 'rec', on: rec, blink: rec }, rec ? 'REC' : 'STBY')),
          h('span', { className: 'frk-rec__time', role: 'timer', 'aria-live': 'off' }, fmt(c[0])),
          h(LevelBars, { value: rec ? level : 0, count: 14, height: 36, label: 'Nivel de entrada' }))),
      h(Keypad, { label: 'Grabadora', height: 96, keys: [rec ? { icon: 'stop', ariaLabel: 'Parar y guardar', tone: 'ink', onClick: stop } : { icon: 'rec', ariaLabel: 'Grabar', tone: 'rec', onClick: start }, { label: 'Marca', ariaLabel: 'Añadir marca', onClick: function () { p.onMark && p.onMark(c[0]); } }, { label: p.real ? 'Mic' : 'Demo', ariaLabel: p.real ? 'Micrófono real' : 'Modo demostración' }] }),
      takes.length ? h('div', { className: 'frk-rec__takes' }, takes.map(function (t, i) { return h(AudioTrack, { key: i, title: t.title + ' · ' + t.at, src: t.src, duration: t.duration, seed: i + 3, tone: 'surface' }); })) : null);
  }

  /* ---------- CaptureKey: tecla de captura (toca: foto · mantén: voz) ---------- */
  function CaptureKey(p) {
    var s = useState('idle'), st = s[0], setSt = s[1], t = useRef(null), c = useClock(st === 'voice');
    function down() { t.current = setTimeout(function () { setSt('voice'); p.onVoiceStart && p.onVoiceStart(); }, 350); }
    function up() { clearTimeout(t.current); if (st === 'voice') { setSt('saved'); p.onCapture && p.onCapture({ kind: 'voice', ms: c[0] }); } else if (st === 'idle') { setSt('flash'); p.onCapture && p.onCapture({ kind: 'photo' }); setTimeout(function () { setSt('saved'); }, 260); } setTimeout(function () { setSt('idle'); c[1](); }, 1600); }
    var label = { idle: p.hint || 'Toca: captura · Mantén: voz', flash: 'Capturado', voice: 'Escuchando · ' + fmt(c[0]), saved: 'Guardado en tu espacio' }[st];
    return h('div', { className: cx('frk-capture', 'is-' + st, p.className) },
      h('button', { type: 'button', className: 'frk-capture__key', 'aria-label': p.label || 'Capturar', onPointerDown: down, onPointerUp: up, onPointerLeave: function () { if (st === 'voice') up(); else clearTimeout(t.current); },
        onKeyDown: function (e) { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); down(); } }, onKeyUp: function (e) { if (e.key === ' ' || e.key === 'Enter') up(); } },
        st === 'voice' ? h(VoiceOrb, { state: 'listening', size: 44, grid: 7, tone: 'paper', caption: false, label: '' }) : h('span', { className: 'frk-capture__dot' })),
      h('span', { className: 'frk-capture__label', 'aria-live': 'polite' }, label));
  }

  /* ---------- Viewfinder: cámara / escáner ---------- */
  function Viewfinder(p) {
    var md = useValue({ value: p.mode, defaultValue: p.defaultMode || 'foto', onChange: p.onModeChange }, 'foto'), mode = md[0];
    var vid = useRef(null), f = useState(false), flash = f[0], setFlash = f[1], sh = useState(p.shots || 0), shots = sh[0];
    useEffect(function () { if (!p.live || !navigator.mediaDevices) return; var stream; navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(function (s) { stream = s; if (vid.current) vid.current.srcObject = s; }).catch(function () {}); return function () { stream && stream.getTracks().forEach(function (t) { t.stop(); }); }; }, [p.live]);
    function shoot() { setFlash(true); setTimeout(function () { setFlash(false); }, 180); sh[1](shots + 1); p.onShoot && p.onShoot(mode); }
    return h('div', { className: cx('frk-cam', 'is-' + mode, p.className), style: { aspectRatio: p.ratio || '3 / 4' } },
      h('div', { className: 'frk-cam__view' }, p.live ? h('video', { ref: vid, autoPlay: true, playsInline: true, muted: true, className: 'frk-cam__video' }) : (p.children || h(DotMatrix, { shape: 'sun', grid: 17, dot: 9, pitch: 14, tone: 'paper', showOff: true, label: 'Vista previa de cámara' })),
        h('span', { className: 'frk-cam__grid', 'aria-hidden': true }), mode === 'escanear' ? h('span', { className: 'frk-cam__brackets', 'aria-hidden': true }, h('i'), h('i'), h('i'), h('i')) : null,
        h('span', { className: cx('frk-cam__flash', flash && 'is-on'), 'aria-hidden': true }),
        h('span', { className: 'frk-cam__hud' }, mode === 'vídeo' ? h(LED, { tone: 'rec' }, 'REC 00:00') : mode === 'escanear' ? h(Chip, { tone: 'sol' }, 'Apunta al código') : h(Chip, { tone: 'well', square: true }, '1×'))),
      h('div', { className: 'frk-cam__bar' },
        h('span', { className: 'frk-cam__thumb', 'aria-label': shots + ' capturas', role: 'img' }, shots ? h('b', null, shots) : null),
        h('button', { type: 'button', className: cx('frk-cam__shutter', mode === 'vídeo' && 'is-video'), 'aria-label': mode === 'vídeo' ? 'Grabar vídeo' : mode === 'escanear' ? 'Escanear' : 'Hacer foto', onClick: shoot }),
        h('button', { type: 'button', className: 'frk-key frk-tone--well frk-key--s frk-key--round', 'aria-label': 'Cambiar de cámara' }, h('span', { className: 'frk-key__main' }, h(Icon, { name: 'refresh', size: 20 })))),
      h('div', { className: 'frk-cam__modes' }, h(Segmented, { label: 'Modo', options: ['foto', 'vídeo', 'escanear'].map(function (m) { return { value: m, label: m.charAt(0).toUpperCase() + m.slice(1) }; }), value: mode, onChange: md[1] })));
  }

  /* ---------- NoteEditor: bloques tipo cuaderno ---------- */
  var BLOCKS = [{ type: 'p', label: 'Texto', icon: 'dots' }, { type: 'h', label: 'Título', icon: 'arrow-up' }, { type: 'todo', label: 'Tarea', icon: 'check' }, { type: 'quote', label: 'Cita', icon: 'copy' }, { type: 'voice', label: 'Nota de voz', icon: 'mic' }];
  function NoteEditor(p) {
    var b = useState((p.defaultBlocks || [{ type: 'p', text: '' }]).map(function (x, i) { return Object.assign({ id: 'b' + i }, x); })), blocks = b[0], setBlocks = b[1];
    var sl = useState(null), slash = sl[0], setSlash = sl[1], seq = useRef(blocks.length), refs = useRef({});
    var want = useRef(null);
    useEffect(function () { if (!want.current) return; var w = want.current, el = refs.current[w.id]; if (el) { el.focus(); if (w.end && el.setSelectionRange) el.setSelectionRange(el.value.length, el.value.length); want.current = null; } });
    function upd(n) { setBlocks(n); p.onChange && p.onChange(n); }
    function focus(id, end) { want.current = { id: id, end: end }; var el = refs.current[id]; if (el) { el.focus(); if (end && el.setSelectionRange) el.setSelectionRange(el.value.length, el.value.length); want.current = null; } }
    function set(i, patch) { var n = blocks.slice(); n[i] = Object.assign({}, n[i], patch); upd(n); }
    function key(e, i) {
      var bl = blocks[i];
      if (e.key === 'Enter' && !e.shiftKey && !slash) { e.preventDefault(); var id = 'b' + (seq.current++), n = blocks.slice(); n.splice(i + 1, 0, { id: id, type: bl.type === 'todo' ? 'todo' : 'p', text: '' }); upd(n); focus(id); }
      else if (e.key === 'Backspace' && !bl.text && blocks.length > 1) { e.preventDefault(); var prev = blocks[i - 1]; upd(blocks.filter(function (_, j) { return j !== i; })); prev && focus(prev.id, true); }
      else if (e.key === 'ArrowUp' && blocks[i - 1] && !slash) { focus(blocks[i - 1].id, true); } else if (e.key === 'ArrowDown' && blocks[i + 1] && !slash) { focus(blocks[i + 1].id); }
      else if (slash && slash.i === i) {
        if (e.key === 'ArrowDown') { e.preventDefault(); setSlash({ i: i, a: (slash.a + 1) % BLOCKS.length }); } else if (e.key === 'ArrowUp') { e.preventDefault(); setSlash({ i: i, a: (slash.a - 1 + BLOCKS.length) % BLOCKS.length }); }
        else if (e.key === 'Enter') { e.preventDefault(); set(i, { type: BLOCKS[slash.a].type, text: '' }); setSlash(null); } else if (e.key === 'Escape') setSlash(null);
      }
    }
    return h('div', { className: cx('frk-note', p.className) },
      p.title != null ? h('input', { className: 'frk-note__title', 'aria-label': 'Título de la nota', defaultValue: p.title, placeholder: 'Sin título' }) : null,
      p.meta ? h('div', { className: 'frk-note__meta' }, p.meta) : null,
      blocks.map(function (bl, i) {
        var common = { ref: function (el) { refs.current[bl.id] = el; }, value: bl.text || '', rows: 1, 'aria-label': (BLOCKS.filter(function (x) { return x.type === bl.type; })[0] || BLOCKS[0]).label,
          placeholder: i === blocks.length - 1 && !bl.text ? (p.placeholder || 'Escribe, o / para insertar') : '',
          onChange: function (e) { var t = e.target.value; set(i, { text: t }); setSlash(t === '/' ? { i: i, a: 0 } : null); e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }, onKeyDown: function (e) { key(e, i); }, className: 'frk-note__input frk-note__input--' + bl.type };
        return h('div', { key: bl.id, className: cx('frk-note__block', 'is-' + bl.type, bl.done && 'is-done') },
          bl.type === 'todo' ? h('button', { type: 'button', role: 'checkbox', 'aria-checked': !!bl.done, 'aria-label': 'Hecha', className: 'frk-note__check', onClick: function () { set(i, { done: !bl.done }); } }, h(StateMark, { state: bl.done ? 'full' : 'empty', size: 20, label: '' })) : null,
          bl.type === 'voice' ? h(AudioTrack, { title: bl.text || 'Nota de voz', duration: bl.duration || 24, seed: i + 2, speed: false, tone: 'well' }) : h('textarea', common),
          slash && slash.i === i ? h('div', { className: 'frk-pop frk-note__slash is-in', role: 'listbox', 'aria-label': 'Insertar bloque' }, BLOCKS.map(function (x, k) { return h('div', { key: x.type, role: 'option', 'aria-selected': k === slash.a, className: cx('frk-select__opt', k === slash.a && 'is-active'), onPointerDown: function (e) { e.preventDefault(); set(i, { type: x.type, text: '' }); setSlash(null); } }, h(Icon, { name: x.icon, size: 18 }), h('span', null, x.label)); })) : null);
      }));
  }


  /* ================= Frekvens 6: bloques SaaS + lenguaje generativo ================= */

  /* ---------- Dialog: modal centrado ---------- */
  function Dialog(p) {
    var pres = usePresence(!!p.open, 180), id = useId(), panel = useRef(null), back = useRef(null);
    useEffect(function () {
      if (!p.open) return; back.current = document.activeElement;
      var t = setTimeout(function () { var pc = panel.current; if (!pc) return; var f = pc.querySelector('input,textarea,select') || (p.tone === 'danger' ? pc.querySelector('.frk-dialog__actions [data-close]') : pc.querySelector('.frk-dialog__actions > :last-child')); (f || pc).focus(); }, 30);
      return function () { clearTimeout(t); if (back.current && back.current.focus) back.current.focus(); };
    }, [p.open]);
    if (!pres[0]) return null;
    function close() { p.onClose && p.onClose(); }
    function key(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      if (e.key === 'Tab') { var f = panel.current.querySelectorAll('button:not([disabled]),[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'); if (!f.length) return; var a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
    }
    var tone = p.tone || 'default';
    return h('div', { className: cx('frk-dialog', pres[1] && p.open && 'is-in', p.inline && 'frk-dialog--inline'), onKeyDown: key },
      h('div', { className: 'frk-dialog__scrim', onClick: p.dismissible === false ? undefined : close, 'aria-hidden': true }),
      h('div', { ref: panel, className: cx('frk-dialog__panel', p.size && 'frk-dialog--' + p.size), role: tone === 'danger' ? 'alertdialog' : 'dialog', 'aria-modal': true, 'aria-labelledby': id + 't', 'aria-describedby': p.text ? id + 'd' : undefined, tabIndex: -1 },
        p.icon || tone === 'danger' ? h('span', { className: cx('frk-dialog__icon', tone === 'danger' ? 'frk-tone--rec' : 'frk-tone--well') }, h(Icon, { name: p.icon || 'close', size: 24 })) : null,
        p.steps ? h(Steps, { steps: p.steps, current: p.step || 0 }) : null,
        h('h2', { id: id + 't', className: 'frk-dialog__title' }, p.title),
        p.text ? h('p', { id: id + 'd', className: 'frk-dialog__text' }, p.text) : null,
        p.children ? h('div', { className: 'frk-dialog__body' }, p.children) : null,
        h('div', { className: 'frk-dialog__actions' },
          p.secondary !== false ? h(KeyButton, { tone: 'well', shape: 'pill', 'data-close': '', onClick: p.onSecondary || close }, p.secondary || 'Cancelar') : null,
          h(KeyButton, { tone: tone === 'danger' ? 'rec' : 'klein', shape: 'pill', disabled: p.primaryDisabled, onClick: p.onPrimary }, p.primary || 'Aceptar')),
        p.dismissible === false ? null : h('button', { type: 'button', className: 'frk-dialog__x', 'data-close': '', 'aria-label': 'Cerrar', onClick: close }, h(Icon, { name: 'close', size: 20 }))));
  }

  /* ---------- FileDrop: subir archivos ---------- */
  function fmtSize(b) { return b > 1048576 ? (b / 1048576).toFixed(1).replace('.', ',') + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB'; }
  function FileDrop(p) {
    var s = useState(p.files || []), files = s[0], setFiles = s[1], d = useState(false), over = d[0], setOver = d[1], inp = useRef(null), id = useId();
    useEffect(function () {
      if (!files.some(function (f) { return f.progress < 100; }) || p.simulate === false) return;
      var t = setInterval(function () { setFiles(function (fs) { return fs.map(function (f) { return f.progress < 100 ? Object.assign({}, f, { progress: Math.min(100, f.progress + 7 + Math.random() * 12) }) : f; }); }); }, 260);
      return function () { clearInterval(t); };
    }, [files.some(function (f) { return f.progress < 100; })]);
    function add(list) { var n = Array.prototype.map.call(list, function (f) { return { name: f.name, size: f.size, progress: 0 }; }); setFiles(files.concat(n)); p.onFiles && p.onFiles(list); }
    var up = files.filter(function (f) { return f.progress < 100; }), done = files.filter(function (f) { return f.progress >= 100; });
    function row(f, i) {
      var ok = f.progress >= 100;
      return h('li', { key: f.name + i, className: cx('frk-file', ok && !f.error && 'is-done', f.error && 'is-error') },
        h('span', { className: 'frk-file__icon', 'aria-hidden': true }, h(Icon, { name: f.error ? 'close' : ok ? 'check' : 'copy', size: 18 })),
        h('span', { className: 'frk-file__main' }, h('span', { className: 'frk-file__name' }, f.name),
          h('span', { className: 'frk-file__meta' }, fmtSize(f.size || 0) + ' · ' + (f.error || (ok ? 'Subido' : Math.round(f.progress) + ' %'))),
          !ok && !f.error ? h('span', { className: 'frk-file__bar', role: 'progressbar', 'aria-label': 'Subiendo ' + f.name, 'aria-valuenow': Math.round(f.progress), 'aria-valuemin': 0, 'aria-valuemax': 100 }, h('span', { style: { width: f.progress + '%' } })) : null),
        h('button', { type: 'button', className: 'frk-file__x', 'aria-label': 'Quitar ' + f.name, onClick: function () { setFiles(files.filter(function (x) { return x !== f; })); } }, h(Icon, { name: 'close', size: 16 })));
    }
    return h('div', { className: cx('frk-drop-wrap', p.className) },
      h('label', { htmlFor: id, className: cx('frk-drop', over && 'is-over'), onDragOver: function (e) { e.preventDefault(); setOver(true); }, onDragLeave: function () { setOver(false); }, onDrop: function (e) { e.preventDefault(); setOver(false); add(e.dataTransfer.files); } },
        h(DotMatrix, { shape: over ? 'disc' : 'ring', grid: 9, dot: 5, pitch: 8, showOff: true, label: '' }),
        h('span', { className: 'frk-drop__title' }, over ? 'Suelta para subir' : (p.title || 'Arrastra archivos aquí')),
        h('span', { className: 'frk-drop__hint' }, p.hint || 'o toca para elegir · máx. 50 MB'),
        h('input', { id: id, ref: inp, type: 'file', multiple: p.multiple !== false, accept: p.accept, className: 'frk-sr', onChange: function (e) { add(e.target.files); } })),
      up.length ? h('div', { className: 'frk-file-sec' }, h('span', { className: 'frk-field__label' }, 'Subiendo · ' + up.length), h('ul', null, up.map(row))) : null,
      done.length ? h('div', { className: 'frk-file-sec' }, h('span', { className: 'frk-field__label' }, 'Listos · ' + done.length), h('ul', null, done.map(row))) : null);
  }

  /* ---------- ChoiceCards: planes, paquetes, opciones grandes ---------- */
  function ChoiceCards(p) {
    var opts = p.options || [], st = useValue(p, p.defaultValue), v = st[0], refs = useRef([]);
    function key(e, i) { var d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!d) return; e.preventDefault(); var n = (i + d + opts.length) % opts.length; st[1](opts[n].value); refs.current[n] && refs.current[n].focus(); }
    var sel = -1; opts.forEach(function (o, i) { if (o.value === v) sel = i; });
    return h('div', { role: 'radiogroup', 'aria-label': p.label, className: cx('frk-choices', p.className), style: { gridTemplateColumns: 'repeat(' + (p.columns || opts.length) + ', minmax(0,1fr))' } }, opts.map(function (o, i) {
      var on = o.value === v;
      return h('button', { key: o.value, ref: function (el) { refs.current[i] = el; }, type: 'button', role: 'radio', 'aria-checked': on, tabIndex: on || (sel < 0 && i === 0) ? 0 : -1, className: cx('frk-choice', on && 'is-on', o.tone && 'frk-tone--' + o.tone), onClick: function () { st[1](o.value); }, onKeyDown: function (e) { key(e, i); } },
        h('span', { className: 'frk-choice__top' }, h('span', { className: 'frk-choice__mark', 'aria-hidden': true }), o.badge ? h(Chip, { tone: 'sol' }, o.badge) : null),
        h('span', { className: 'frk-choice__title' }, o.label),
        o.price ? h('span', { className: 'frk-choice__price' }, o.price, o.period ? h('small', null, ' ' + o.period) : null) : null,
        o.hint ? h('span', { className: 'frk-choice__hint' }, o.hint) : null,
        o.features ? h('ul', { className: 'frk-choice__feat' }, o.features.map(function (f, k) { return h('li', { key: k }, h(Icon, { name: 'check', size: 14 }), f); })) : null);
    }));
  }

  /* ---------- Stat: KPI con variación ---------- */
  function Stat(p) {
    var d = p.delta, neg = d != null && String(d).trim().charAt(0) === '-' || String(d).charAt(0) === '−';
    var good = p.inverse ? neg : !neg;
    return h('div', { className: cx('frk-stat', 'frk-tone--' + (p.tone || 'surface'), p.className) },
      h('div', { className: 'frk-stat__head' }, h('span', { className: 'frk-stat__label' }, p.label), p.status ? h(Chip, { tone: { ok: 'verde', warn: 'sol', risk: 'rec' }[p.status] || 'well', dot: true }, p.statusLabel || { ok: 'En objetivo', warn: 'Atención', risk: 'En riesgo' }[p.status]) : null),
      h('div', { className: 'frk-stat__row' }, h('span', { className: 'frk-stat__value' }, p.value, p.unit ? h('small', null, p.unit) : null), p.trend ? h(Sparkline, { data: p.trend, tone: good ? 'ink' : 'rams', label: p.label }) : null),
      h('div', { className: 'frk-stat__foot' },
        d != null ? h('span', { className: cx('frk-stat__delta', good ? 'is-good' : 'is-bad') }, (neg ? '▼ ' : '▲ ') + String(d).replace(/^[-−+]/, '')) : null,
        p.previous ? h('span', { className: 'frk-stat__prev' }, 'antes ' + p.previous) : null,
        p.link ? h('button', { type: 'button', className: 'frk-stat__link', onClick: p.link.onClick }, p.link.label, h(Icon, { name: 'arrow-right', size: 14 })) : null));
  }

  /* ---------- UsageMeter: cuota usada ---------- */
  function UsageMeter(p) {
    var used = p.used || 0, limit = p.limit || 1, pct = clamp(used / limit * 100, 0, 100), level = pct >= 90 ? 'is-high' : pct >= 70 ? 'is-mid' : '';
    var f = p.format || function (n) { return n.toLocaleString('es-ES'); };
    return h('div', { className: cx('frk-usage', level, p.className) },
      h('div', { className: 'frk-usage__head' }, h('span', { className: 'frk-usage__label' }, p.label), h('span', { className: 'frk-usage__num' }, f(used) + ' / ' + f(limit) + (p.unit ? ' ' + p.unit : ''))),
      p.segments ? h(SplitBar, { segments: p.segments }) :
        h('span', { className: 'frk-usage__bar', role: 'meter', 'aria-label': p.label, 'aria-valuemin': 0, 'aria-valuemax': limit, 'aria-valuenow': used, 'aria-valuetext': Math.round(pct) + ' %' }, h('span', { style: { width: pct + '%' } })),
      level === 'is-high' && p.action ? h('button', { type: 'button', className: 'frk-stat__link', onClick: p.action.onClick }, p.action.label, h(Icon, { name: 'arrow-right', size: 14 })) : null);
  }

  /* ---------- Timeline: actividad, despliegues, historia ---------- */
  function Timeline(p) {
    return h('ol', { className: cx('frk-timeline', p.className), 'aria-label': p.label }, (p.items || []).map(function (it, i) {
      var st = it.state || 'done';
      return h('li', { key: i, className: cx('frk-tl', 'is-' + st) },
        h('span', { className: 'frk-tl__mark' }, it.avatar ? h(Avatar, { name: it.avatar, size: 28 }) : h(StateMark, { state: st === 'done' ? 'full' : st === 'running' ? 'partial' : st === 'error' ? 'full' : 'empty', size: 20, label: { done: 'Hecho', running: 'En curso', upcoming: 'Pendiente', error: 'Error' }[st] })),
        h('span', { className: 'frk-tl__body' }, h('span', { className: 'frk-tl__title' }, it.title), it.text ? h('span', { className: 'frk-tl__text' }, it.text) : null),
        it.time ? h('time', { className: 'frk-tl__time' }, it.time) : null);
    }));
  }

  /* ---------- Checklist: puesta en marcha ---------- */
  function Checklist(p) {
    var items = p.items || [], s = useState(items.map(function (x) { return !!x.done; })), done = s[0], setDone = s[1], o = useState(p.defaultOpen != null ? p.defaultOpen : done.indexOf(false)), open = o[0];
    var n = done.filter(Boolean).length;
    return h('div', { className: cx('frk-checklist', p.className) },
      h('div', { className: 'frk-checklist__head' }, h('span', { className: 'frk-checklist__title' }, p.title || 'Primeros pasos'), h('span', { className: 'frk-checklist__count' }, n + ' / ' + items.length)),
      h(DotGrid, { total: items.length, filled: n, columns: items.length, size: 12, gap: 4, tone: 'ink', label: n + ' de ' + items.length + ' completados' }),
      h('ul', null, items.map(function (it, i) {
        var on = done[i], isOpen = open === i;
        return h('li', { key: i, className: cx('frk-ck', on && 'is-done', isOpen && 'is-open') },
          h('button', { type: 'button', className: 'frk-ck__head', 'aria-expanded': isOpen, onClick: function () { o[1](isOpen ? -1 : i); } },
            h(StateMark, { state: on ? 'full' : isOpen ? 'partial' : 'empty', size: 22, label: on ? 'Hecho' : 'Pendiente' }), h('span', { className: 'frk-ck__title' }, it.title), h(Icon, { name: 'chevron-down', size: 18, className: 'frk-ck__chev' })),
          isOpen ? h('div', { className: 'frk-ck__body' }, it.text ? h('p', null, it.text) : null,
            h(KeyButton, { tone: on ? 'well' : 'ink', shape: 'pill', size: 's', onClick: function () { var d = done.slice(); d[i] = !on; setDone(d); if (!on) o[1](d.indexOf(false)); it.onAction && it.onAction(); } }, on ? 'Deshacer' : (it.action || 'Hecho'))) : null);
      })));
  }

  /* ---------- PromptBox: caja de prompt para IA ---------- */
  function PromptBox(p) {
    var st = useValue({ value: p.value, defaultValue: '', onChange: p.onChange }, ''), v = st[0], ta = useRef(null);
    var at = useState(p.attachments || []), att = at[0], setAtt = at[1], fi = useRef(null);
    var md = useState(p.model || (p.models && p.models[0])), model = md[0];
    useEffect(function () { var el = ta.current; if (!el) return; el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 220) + 'px'; }, [v]);
    function send() { if (!v.trim() || p.busy) return; p.onSend && p.onSend({ text: v.trim(), model: model, attachments: att }); st[1](''); setAtt([]); }
    return h('div', { className: cx('frk-prompt', p.className) },
      p.title ? h('div', { className: 'frk-prompt__title' }, p.title) : null,
      h('div', { className: 'frk-prompt__box', onDragOver: function (e) { e.preventDefault(); }, onDrop: function (e) { e.preventDefault(); setAtt(att.concat(Array.prototype.map.call(e.dataTransfer.files, function (f) { return f.name; }))); } },
        att.length ? h('div', { className: 'frk-prompt__att' }, att.map(function (a, i) { return h('span', { key: i, className: 'frk-prompt__file' }, h(Icon, { name: 'copy', size: 14 }), a, h('button', { type: 'button', 'aria-label': 'Quitar ' + a, onClick: function () { setAtt(att.filter(function (_, k) { return k !== i; })); } }, h(Icon, { name: 'close', size: 12 }))); })) : null,
        h('textarea', { ref: ta, rows: 2, value: v, placeholder: p.placeholder || '¿En qué te ayudo?', 'aria-label': p.label || 'Mensaje para la IA', className: 'frk-prompt__input', onChange: function (e) { st[1](e.target.value); }, onKeyDown: function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } } }),
        h('div', { className: 'frk-prompt__bar' },
          h('button', { type: 'button', className: 'frk-prompt__tool', 'aria-label': 'Adjuntar archivo', onClick: function () { fi.current && fi.current.click(); } }, h(Icon, { name: 'plus', size: 18 })),
          h('input', { ref: fi, type: 'file', multiple: true, className: 'frk-sr', tabIndex: -1, 'aria-hidden': true, onChange: function (e) { setAtt(att.concat(Array.prototype.map.call(e.target.files, function (f) { return f.name; }))); } }),
          p.models ? h('select', { className: 'frk-prompt__select', 'aria-label': 'Modelo', value: model, onChange: function (e) { md[1](e.target.value); p.onModel && p.onModel(e.target.value); } }, p.models.map(function (m) { return h('option', { key: m, value: m }, m); })) : null,
          p.efforts ? h('select', { className: 'frk-prompt__select', 'aria-label': 'Esfuerzo', defaultValue: p.effort || p.efforts[0] }, p.efforts.map(function (m) { return h('option', { key: m, value: m }, m); })) : null,
          h('span', { style: { flex: 1 } }),
          p.voice !== false ? h('button', { type: 'button', className: 'frk-prompt__tool', 'aria-label': 'Dictar', onClick: p.onVoice }, h(Icon, { name: 'mic', size: 18 })) : null,
          h('button', { type: 'button', className: 'frk-key frk-tone--klein frk-key--s frk-key--round frk-prompt__send', 'aria-label': 'Enviar', disabled: !v.trim() || p.busy, onClick: send }, h('span', { className: 'frk-key__main' }, p.busy ? h(DotLoader, { label: 'Generando' }) : h(Icon, { name: 'arrow-up', size: 20 }))))),
      p.suggestions ? h(Suggestions, { items: p.suggestions, onPick: function (s) { st[1](s); ta.current && ta.current.focus(); } }) : null,
      p.note ? h('p', { className: 'frk-prompt__note' }, p.note) : null);
  }

  /* ---------- Frekvens Lang: UI generativa en líneas (streaming) ---------- */
  /* id = Tipo({props}, [hijos])   ·   id = Tipo("texto")   ·   las referencias a ids aún no llegados se pintan como hueco */
  function parseLang(src) {
    var defs = {}, order = [];
    String(src || '').split('\n').forEach(function (line) {
      line = line.trim(); if (!line || line.indexOf('//') === 0) return;
      var m = /^([A-Za-z_][\w]*)\s*=\s*([A-Z][A-Za-z0-9]*)\s*\(([\s\S]*)\)\s*;?$/.exec(line); if (!m) return;
      var args = m[3].trim(), props = {}, children = [];
      try {
        var i = 0;
        if (args.charAt(0) === '{') { var depth = 0, j = 0, inS = false; for (; j < args.length; j++) { var c = args.charAt(j); if (c === '"' && args.charAt(j - 1) !== '\\') inS = !inS; if (inS) continue; if (c === '{') depth++; if (c === '}') { depth--; if (!depth) break; } }
          props = JSON.parse(args.slice(0, j + 1).replace(/([{,]\s*)([A-Za-z_][\w-]*)\s*:/g, '$1"$2":')); i = j + 1; args = args.slice(i).replace(/^\s*,\s*/, ''); }
        if (args.charAt(0) === '[') { var inner = args.slice(1, args.lastIndexOf(']')); children = inner.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(function (x) { x = x.trim(); return x.charAt(0) === '"' ? JSON.parse(x) : x ? { ref: x } : null; }).filter(Boolean); }
        else if (args.charAt(0) === '"') children = [JSON.parse(args)];
      } catch (e) { props = { __error: true }; }
      defs[m[1]] = { type: m[2], props: props, children: children }; order.push(m[1]);
    });
    function build(id, seen) {
      var d = defs[id]; if (!d) return { type: '__Pending', props: { name: id } };
      if (seen[id]) return null; seen[id] = 1;
      return { type: d.type, props: d.props, children: d.children.map(function (c) { return c.ref ? build(c.ref, Object.assign({}, seen)) : c; }) };
    }
    var root = defs.root ? 'root' : order[0];
    return root ? build(root, {}) : null;
  }

  /* ================= Frekvens 7: relojes, hi-fi, teclas, pads, cinta, arrastrar, plano, gráficas ================= */
  function useNow(live, ms) { var s = useState(Date.now()), t = s[0], set = s[1]; useEffect(function () { if (!live) return; var i = setInterval(function () { set(Date.now()); }, ms || 1000); return function () { clearInterval(i); }; }, [live]); return t; }
  function polar(cx0, cy0, r, deg) { var a = (deg - 90) * Math.PI / 180; return [cx0 + r * Math.cos(a), cy0 + r * Math.sin(a)]; }

  /* ---------- Clock ---------- */
  function Clock(p) {
    var now = useNow(p.time == null, 1000), d;
    if (p.time != null) { var m = String(p.time).split(':'); d = new Date(); d.setHours(+m[0], +m[1], +(m[2] || 0)); } else d = new Date(now);
    var H = d.getHours(), M = d.getMinutes(), S = d.getSeconds(), size = p.size || 200, v = p.variant || 'disc', c = size / 2;
    var label = 'Son las ' + H + ':' + pad(M);
    if (v === 'dot') return h('div', { className: cx('frk-clock', 'frk-clock--dot', p.className), role: 'img', 'aria-label': label }, h(DotMatrix, { text: pad(H) + ':' + pad(M), dot: size / 42, pitch: size / 30, tone: p.tone || 'ink', showOff: true, label: label }));
    var ha = (H % 12 + M / 60) * 30, ma = (M + S / 60) * 6, sa = S * 6;
    function hand(a, len, w, cls) { var e = polar(c, c, len, a), b = polar(c, c, -len * 0.14, a); return h('line', { x1: b[0], y1: b[1], x2: e[0], y2: e[1], strokeWidth: w, className: cls }); }
    var ticks = v === 'ticks' ? range(60).map(function (i) { var q = polar(c, c, c - 10, i * 6); return h('circle', { key: i, cx: q[0], cy: q[1], r: i % 5 ? 1.4 : 3, className: 'frk-clock__tick' }); }) : null;
    return h('div', { className: cx('frk-clock', 'frk-clock--' + v, p.className) },
      h('svg', { width: size, height: size, viewBox: '0 0 ' + size + ' ' + size, role: 'img', 'aria-label': label },
        h('circle', { cx: c, cy: c, r: c - 1, className: 'frk-clock__face' }), ticks,
        hand(ha, c * 0.5, size / 40, 'frk-clock__hand'), hand(ma, c * 0.78, size / 60, 'frk-clock__hand'),
        p.seconds !== false ? hand(sa, c * 0.84, size / 160 + 0.6, 'frk-clock__sec') : null,
        h('circle', { cx: c, cy: c, r: size / 50 + 2, className: 'frk-clock__pin' })),
      p.caption ? h('span', { className: 'frk-clock__cap' }, p.caption) : null);
  }

  /* ---------- VUMeter: aguja analógica ---------- */
  function VUMeter(p) {
    var size = p.size || 180, c = size / 2, scale = p.scale || ['50', '40', '30', '20', '10', '5', '0', '3'], live = p.level == null && p.live;
    var s = useState(p.value || 0), lv = s[0], set = s[1];
    useEffect(function () { if (!live) return; var t0 = performance.now(), raf; function f() { var t = (performance.now() - t0) / 1000; set(45 + 25 * Math.sin(t * 3.1) + 18 * Math.sin(t * 7.3) * Math.random()); raf = requestAnimationFrame(f); } raf = requestAnimationFrame(f); return function () { cancelAnimationFrame(raf); }; }, [live]);
    var v = clamp(p.value != null ? p.value : p.level != null ? p.level : lv, 0, 100), a0 = -52, a1 = 52, ang = a0 + (a1 - a0) * v / 100, n = scale.length, py = size * 0.64;
    var tip = polar(c, py, size * 0.44, ang), base = polar(c, py, -size * 0.04, ang);
    return h('div', { className: cx('frk-vu', p.className) },
      h('svg', { width: size, height: size, viewBox: '0 0 ' + size + ' ' + size, role: 'meter', 'aria-label': p.label || 'Nivel de pico', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(v) },
        h('circle', { cx: c, cy: c, r: c - 1, className: 'frk-vu__face' }),
        scale.map(function (t, i) { var q = polar(c, py, size * 0.4, a0 + (a1 - a0) * i / (n - 1)); return h('text', { key: i, x: q[0], y: q[1], className: cx('frk-vu__num', i >= n - 2 && 'is-red'), textAnchor: 'middle', dominantBaseline: 'middle', style: { fontSize: Math.round(clamp(size / 15, 9, 13)) + 'px' } }, t); }),
        h('line', { x1: base[0], y1: base[1], x2: tip[0], y2: tip[1], className: 'frk-vu__needle' }),
        range(21).map(function (i) { var aa = a0 + (a1 - a0) * i / 20, o = polar(c, py, size * 0.33, aa), e = polar(c, py, size * (i % 5 ? 0.31 : 0.295), aa); return h('line', { key: 't' + i, x1: o[0], y1: o[1], x2: e[0], y2: e[1], className: cx('frk-vu__tick', i > 16 && 'is-red') }); }),
        h('circle', { cx: c, cy: py, r: 5, className: 'frk-vu__pin' }),
        h('text', { x: c, y: size * 0.78, textAnchor: 'middle', className: 'frk-vu__label' }, p.caption || 'peak power level'),
        h('circle', { cx: c, cy: size * 0.86, r: 3.5, className: cx('frk-vu__peak', v > 88 && 'is-on') })));
  }

  /* ---------- RotarySelector: selector de fuente ---------- */
  function RotarySelector(p) {
    var opts = norm(p.options), n = opts.length, st = useValue(p, opts[0] && opts[0].value), v = st[0], size = p.size || 200, c = size / 2, ref = useRef(null), drag = useRef(false);
    var span = p.span || 300, start = -span / 2, idx = 0; opts.forEach(function (o, i) { if (o.value === v) idx = i; });
    function angOf(i) { return start + span * i / (n - 1 || 1); }
    function pick(i) { i = clamp(i, 0, n - 1); if (opts[i].value !== v) { st[1](opts[i].value); if (navigator.vibrate) try { navigator.vibrate(6); } catch (e) {} } }
    function fromE(e) { var r = ref.current.getBoundingClientRect(), a = Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180 / Math.PI; pick(Math.round((clamp(a, start, start + span) - start) / span * (n - 1))); }
    var kp = polar(c, c, c * 0.24, angOf(idx));
    return h('div', { className: cx('frk-rotary', p.className), style: { width: size, height: size } },
      opts.map(function (o, i) { var q = polar(c, c, c * 0.86, angOf(i)); return h('span', { key: o.value, 'aria-hidden': true, className: cx('frk-rotary__lbl', i === idx && 'is-on'), style: { left: q[0], top: q[1], transform: 'translate(-50%,-50%) rotate(' + angOf(i) + 'deg)' }, onClick: function () { pick(i); } }, o.label); }),
      h('div', {
        ref: ref, className: 'frk-rotary__knob', role: 'slider', tabIndex: 0, 'aria-label': p.label || 'Selector', 'aria-valuemin': 0, 'aria-valuemax': n - 1, 'aria-valuenow': idx, 'aria-valuetext': opts[idx] && String(opts[idx].label),
        onPointerDown: function (e) { drag.current = true; e.currentTarget.setPointerCapture(e.pointerId); fromE(e); }, onPointerMove: function (e) { if (drag.current) fromE(e); }, onPointerUp: function () { drag.current = false; },
        onKeyDown: function (e) { var d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key]; if (d) { e.preventDefault(); pick(idx + d); } if (e.key === 'Home') pick(0); if (e.key === 'End') pick(n - 1); }
      }, h('span', { className: 'frk-rotary__bar', style: { transform: 'rotate(' + angOf(idx) + 'deg)' } })),
      h('span', { className: 'frk-rotary__mark', 'aria-hidden': true }));
  }

  /* ---------- Fader: deslizador vertical ---------- */
  function Fader(p) {
    var min = p.min || 0, max = p.max == null ? 100 : p.max, H = p.height || 200, st = useValue(p, p.defaultValue != null ? p.defaultValue : 50), v = st[0], ref = useRef(null), drag = useRef(false);
    function set(n) { n = clamp(Math.round(n), min, max); if (n !== v) st[1](n); }
    function fromE(e) { var r = ref.current.getBoundingClientRect(); set(min + (1 - (e.clientY - r.top) / r.height) * (max - min)); }
    var pct = (v - min) / ((max - min) || 1);
    return h('div', { className: cx('frk-fader', p.className) },
      h('div', { ref: ref, className: 'frk-fader__track', style: { height: H }, role: 'slider', tabIndex: 0, 'aria-orientation': 'vertical', 'aria-label': p.label || 'Fader', 'aria-valuemin': min, 'aria-valuemax': max, 'aria-valuenow': v,
        onPointerDown: function (e) { drag.current = true; e.currentTarget.setPointerCapture(e.pointerId); fromE(e); }, onPointerMove: function (e) { if (drag.current) fromE(e); }, onPointerUp: function () { drag.current = false; },
        onKeyDown: function (e) { var d = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 10, PageDown: -10 }[e.key]; if (d) { e.preventDefault(); set(v + d * (p.step || 1)); } } },
        h('span', { className: 'frk-fader__slot' }), range(11).map(function (i) { return h('span', { key: i, className: 'frk-fader__tick', style: { bottom: i * 10 + '%' } }); }),
        h('span', { className: cx('frk-fader__cap', 'frk-tone--' + (p.tone || 'ink')), style: { bottom: 'calc(' + pct * 100 + '% - 14px)' } })),
      h('span', { className: 'frk-fader__val' }, (p.format ? p.format(v) : v)), p.label ? h('span', { className: 'frk-fader__lbl' }, p.label) : null);
  }

  /* ---------- Keycap: tecla mecánica esculpida ---------- */
  function Keycap(p) {
    var rest = omit(p, ['tone', 'w', 'h', 'sub', 'className', 'children', 'legend']);
    return h('button', Object.assign({ type: 'button' }, rest, { className: cx('frk-keycap', 'frk-keycap--' + (p.tone || 'paper'), p.className), style: Object.assign({ gridColumn: p.w > 1 ? 'span ' + p.w : undefined, gridRow: p.h > 1 ? 'span ' + p.h : undefined }, p.style) }),
      h('span', { className: 'frk-keycap__top' }, h('span', { className: 'frk-keycap__legend' }, p.children), p.sub ? h('span', { className: 'frk-keycap__sub' }, p.sub) : null));
  }

  /* ---------- Calculator ---------- */
  function Calculator(p) {
    var s = useState({ cur: '0', acc: null, op: null, fresh: true, expr: '' }), st = s[0], set = s[1];
    function num(x) { return parseFloat(String(x).replace(',', '.')); }
    function out(x) { if (!isFinite(x)) return 'Error'; var r = Math.round(x * 1e10) / 1e10; return String(r).replace('.', ','); }
    function calc(a, b, op) { return op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : op === '÷' ? a / b : b; }
    function press(k) {
      set(function (o) {
        var n = Object.assign({}, o);
        if (/^[0-9]$/.test(k)) { n.cur = o.fresh || o.cur === '0' ? k : (o.cur.length < 12 ? o.cur + k : o.cur); n.fresh = false; }
        else if (k === ',') { if (o.fresh) { n.cur = '0,'; n.fresh = false; } else if (o.cur.indexOf(',') < 0) n.cur = o.cur + ','; }
        else if (k === 'C') return { cur: '0', acc: null, op: null, fresh: true, expr: '' };
        else if (k === '⌫') { n.cur = o.cur.length > 1 && !o.fresh ? o.cur.slice(0, -1) : '0'; }
        else if (k === '%') { n.cur = out(num(o.cur) / 100); }
        else if (k === '=') { if (o.op) { n.cur = out(calc(o.acc, num(o.cur), o.op)); n.expr = out(o.acc) + ' ' + o.op + ' ' + o.cur + ' ='; n.acc = null; n.op = null; n.fresh = true; } }
        else { var a = o.op && !o.fresh ? calc(o.acc, num(o.cur), o.op) : o.acc != null && o.fresh ? o.acc : num(o.cur); n.acc = a; n.op = k; n.fresh = true; n.cur = out(a); n.expr = out(a) + ' ' + k; }
        return n;
      });
    }
    useEffect(function () { if (!p.keyboard) return; function f(e) { var m = { '/': '÷', '*': '×', '-': '−', '+': '+', Enter: '=', '=': '=', Escape: 'C', Backspace: '⌫', '.': ',', ',': ',', '%': '%' }; if (/^[0-9]$/.test(e.key)) press(e.key); else if (m[e.key]) { e.preventDefault(); press(m[e.key]); } } window.addEventListener('keydown', f); return function () { window.removeEventListener('keydown', f); }; }, []);
    var round = p.variant === 'round';
    var K = function (k, o) { o = o || {}; return h(Keycap, { key: k, tone: o.tone || (round ? 'paper' : 'paper'), w: o.w, h: o.h, 'aria-label': o.label || k, onClick: function () { press(k); }, className: round ? 'frk-keycap--round' : undefined }, k); };
    return h('div', { className: cx('frk-calc', round && 'frk-calc--round', p.className) },
      h('div', { className: 'frk-calc__display', 'aria-live': 'polite', 'aria-atomic': true },
        h('span', { className: 'frk-calc__expr' }, st.expr || ' '), h('output', { className: 'frk-calc__cur' }, st.cur)),
      h('div', { className: 'frk-calc__keys' },
        K('C', { tone: 'ink', label: 'Borrar todo' }), K('÷', { label: 'Dividir' }), K('×', { label: 'Multiplicar' }), K('−', { label: 'Restar' }),
        K('7'), K('8'), K('9'), K('+', { h: 2, label: 'Sumar' }),
        K('4'), K('5'), K('6'),
        K('1'), K('2'), K('3'), K('=', { h: 2, tone: 'rams', label: 'Igual' }),
        K('0', { w: 2 }), K(',', { label: 'Coma' })));
  }

  /* ---------- PadGrid: pads de percusión ---------- */
  var PADKEYS = ['q', 'w', 'e', 'a', 's', 'd', 'z', 'x', 'c', 'r', 'f', 'v', 't', 'g', 'b', 'y'];
  function PadGrid(p) {
    var n = (p.columns || 3) * (p.rows || 3), s = useState({}), hit = s[0], setHit = s[1], ctx = useRef(null);
    function play(i) {
      setHit(function (o) { var x = Object.assign({}, o); x[i] = Date.now(); return x; }); setTimeout(function () { setHit(function (o) { var x = Object.assign({}, o); delete x[i]; return x; }); }, 140);
      p.onPad && p.onPad(i);
      if (p.sound !== false) try { var c = ctx.current = ctx.current || new (window.AudioContext || window.webkitAudioContext)(); var o = c.createOscillator(), g = c.createGain(); o.type = i % 3 === 0 ? 'sine' : i % 3 === 1 ? 'triangle' : 'square'; o.frequency.setValueAtTime(110 * Math.pow(2, i / 4), c.currentTime); o.frequency.exponentialRampToValueAtTime(55, c.currentTime + 0.25); g.gain.setValueAtTime(0.12, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + 0.3); } catch (e) {}
    }
    useEffect(function () { if (!p.keyboard) return; function f(e) { var i = PADKEYS.indexOf(e.key.toLowerCase()); if (i >= 0 && i < n && !e.repeat) play(i); } window.addEventListener('keydown', f); return function () { window.removeEventListener('keydown', f); }; });
    return h('div', { className: cx('frk-pads', 'frk-pads--' + (p.tone || 'sol'), p.className), role: 'group', 'aria-label': p.label || 'Pads', style: { gridTemplateColumns: 'repeat(' + (p.columns || 3) + ', 1fr)' } },
      range(n).map(function (i) { var l = p.labels && p.labels[i]; return h('button', { key: i, type: 'button', className: cx('frk-padkey', hit[i] && 'is-hit'), 'aria-label': (l || 'Pad ' + (i + 1)) + (p.keyboard ? ' (tecla ' + PADKEYS[i].toUpperCase() + ')' : ''), onPointerDown: function (e) { e.preventDefault(); play(i); }, onKeyDown: function (e) { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); play(i); } } }, l ? h('span', { className: 'frk-padkey__lbl' }, l) : null); }));
  }

  /* ---------- TapeDeck: dos carretes ---------- */
  function TapeDeck(p) {
    var ps = useState(!!p.playing), playing = ps[0], c = useClock(playing), dur = (p.duration || 180) * 1000, pr = clamp(c[0] / dur, 0, 1);
    var W = 320, Hh = 150, r1 = 46 - pr * 18, r2 = 28 + pr * 18;
    function reel(x, r, k) { return h('g', { key: k, className: cx('frk-tape__reel', playing && 'is-spin'), style: { transformOrigin: x + 'px 70px', animationDuration: (0.6 + r / 40) + 's' } },
      h('circle', { cx: x, cy: 70, r: 50, className: 'frk-tape__ring' }), h('circle', { cx: x, cy: 70, r: r, className: 'frk-tape__wound' }), h('circle', { cx: x, cy: 70, r: 9, className: 'frk-tape__hub' }),
      range(3).map(function (i) { var q = polar(x, 70, 16, i * 120); return h('circle', { key: i, cx: q[0], cy: q[1], r: 3, className: 'frk-tape__spoke' }); })); }
    return h('div', { className: cx('frk-tape', p.className) },
      h('div', { className: 'frk-tape__head' }, h('span', { className: 'frk-tape__title' }, p.title || 'tape preview'), h('span', { className: 'frk-tape__count' }, fmt(c[0]))),
      h('svg', { viewBox: '0 0 ' + W + ' ' + Hh, width: '100%', role: 'img', 'aria-label': (p.title || 'Cinta') + (playing ? ', reproduciendo' : ', en pausa') + ', ' + Math.round(pr * 100) + ' %' },
        h('path', { d: 'M' + (90 - r1) + ' 70 L' + (90 - r1) + ' 132 L' + (230 + r2) + ' 132 L' + (230 + r2) + ' 70', className: 'frk-tape__belt' }),
        reel(90, r1, 'a'), reel(230, r2, 'b'),
        h('rect', { x: 150, y: 124, width: 20, height: 14, rx: 3, className: 'frk-tape__headblock' })),
      h('div', { className: 'frk-tape__prog' }, h('span', { style: { width: pr * 100 + '%' } })),
      h(Keypad, { label: 'Transporte', height: 64, keys: [{ icon: 'arrow-left', ariaLabel: 'Rebobinar', onClick: function () { c[1](); } }, { icon: playing ? 'pause' : 'play', ariaLabel: playing ? 'Pausa' : 'Reproducir', tone: 'sol', onClick: function () { ps[1](!playing); } }, { icon: 'stop', ariaLabel: 'Parar', onClick: function () { ps[1](false); c[1](); } }, { icon: 'rec', ariaLabel: 'Grabar', tone: 'rec' }] }));
  }

  /* ---------- Board / Sortable: arrastrar y soltar (puntero + teclado) ---------- */
  function Board(p) {
    var cs = useState(p.columns || []), cols = cs[0], setCols = cs[1];
    var dg = useState(null), drag = dg[0], setDrag = dg[1];          /* {id, from, x, y, ox, oy, w, to:{col, idx}} */
    var kb = useState(null), held = kb[0], setHeld = kb[1];           /* {id} picked with keyboard */
    var msg = useState(''), say = msg[1], root = useRef(null), hid = useId() + '-help';
    function commit(n) { setCols(n); p.onChange && p.onChange(n); }
    function locate(id) { for (var c = 0; c < cols.length; c++) for (var i = 0; i < cols[c].items.length; i++) if (cols[c].items[i].id === id) return [c, i]; return null; }
    function moveTo(id, col, idx) { var loc = locate(id); if (!loc) return; var n = cols.map(function (c) { return Object.assign({}, c, { items: c.items.slice() }); }); var it = n[loc[0]].items.splice(loc[1], 1)[0]; if (loc[0] === col && idx > loc[1]) idx--; n[col].items.splice(clamp(idx, 0, n[col].items.length), 0, it); commit(n); return it; }
    function target(x, y) {
      var el = document.elementFromPoint(x, y), colEl = el && el.closest('[data-col]'); if (!colEl || !root.current.contains(colEl)) return null;
      var c = +colEl.getAttribute('data-col'), cards = colEl.querySelectorAll('[data-card]:not(.is-ghost)'), idx = cards.length;
      for (var i = 0; i < cards.length; i++) { var r = cards[i].getBoundingClientRect(); if (y < r.top + r.height / 2) { idx = i; break; } }
      return { col: c, idx: idx };
    }
    function down(e, id, c) { if (e.button !== 0) return; var r = e.currentTarget.getBoundingClientRect(); var st = { id: id, from: c, sx: e.clientX, sy: e.clientY, x: e.clientX, y: e.clientY, ox: e.clientX - r.left, oy: e.clientY - r.top, w: r.width, moved: false, to: null };
      function mv(ev) { st.x = ev.clientX; st.y = ev.clientY; if (!st.moved && Math.hypot(st.x - st.sx, st.y - st.sy) > 5) st.moved = true; if (st.moved) { st.to = target(st.x, st.y); setDrag(Object.assign({}, st)); } }
      function up() { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); if (st.moved && st.to) { var it = moveTo(st.id, st.to.col, st.to.idx); it && say(it.title + ' movida a ' + cols[st.to.col].title); } setDrag(null); }
      window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); }
    function key(e, id) {
      var loc = locate(id); if (!loc) return;
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (held && held.id === id) { setHeld(null); say('Soltada en ' + cols[loc[0]].title + ', posición ' + (loc[1] + 1)); } else { setHeld({ id: id }); say('Cogida. Flechas para mover, Espacio para soltar, Esc para cancelar.'); } return; }
      if (e.key === 'Escape' && held) { setHeld(null); say('Cancelado'); return; }
      if (!held || held.id !== id) return;
      var d = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.key]; if (!d) return; e.preventDefault();
      var c = clamp(loc[0] + d[0], 0, cols.length - 1), i = d[0] ? Math.min(loc[1], cols[c].items.length) : loc[1] + d[1] + (d[1] > 0 ? 1 : 0);
      moveTo(id, c, i); setTimeout(function () { var el = root.current.querySelector('[data-card="' + id + '"]'); el && el.focus(); }, 0); say(cols[c].title + ', posición ' + (Math.max(0, i - (d[1] > 0 ? 1 : 0)) + 1));
    }
    var single = p.variant === 'list';
    var ghostItem = drag && (function () { var l = locate(drag.id); return l && cols[l[0]].items[l[1]]; })();
    function card(it, c) {
      var isDrag = drag && drag.id === it.id, isHeld = held && held.id === it.id;
      return h('div', { key: it.id, 'data-card': it.id, tabIndex: 0, role: 'button', 'aria-roledescription': 'elemento arrastrable', 'aria-pressed': isHeld, 'aria-describedby': hid,
        className: cx('frk-card-dnd', isDrag && 'is-ghost', isHeld && 'is-held', it.tone && 'frk-tone--' + it.tone), onPointerDown: function (e) { down(e, it.id, c); }, onKeyDown: function (e) { key(e, it.id); } },
        h('span', { className: 'frk-card-dnd__grip', 'aria-hidden': true }, h(Icon, { name: 'dots', size: 16 })),
        h('span', { className: 'frk-card-dnd__body' }, h('span', { className: 'frk-card-dnd__title' }, it.title), it.meta ? h('span', { className: 'frk-card-dnd__meta' }, it.meta) : null),
        it.tag ? h(Chip, { tone: it.tagTone || 'well' }, it.tag) : null, it.avatar ? h(Avatar, { name: it.avatar, size: 28 }) : null);
    }
    return h('div', { ref: root, className: cx('frk-board', single && 'frk-board--list', drag && 'is-dragging', p.className) },
      h('span', { id: hid, className: 'frk-sr' }, 'Espacio para coger o soltar; flechas para mover; Esc para cancelar.'),
      h('span', { className: 'frk-sr', 'aria-live': 'assertive' }, msg[0]),
      cols.map(function (col, c) {
        var showDrop = drag && drag.to && drag.to.col === c;
        var items = col.items.map(function (it) { return card(it, c); });
        if (showDrop) items.splice(drag.to.idx, 0, h('div', { key: '__drop', className: 'frk-dropline', 'aria-hidden': true }));
        return h('section', { key: col.id, 'data-col': c, className: cx('frk-col', showDrop && 'is-over'), 'aria-label': col.title },
          single ? null : h('header', { className: 'frk-col__head' }, h(StateMark, { state: ({ running: 'partial', done: 'full', partial: 'partial', full: 'full' })[col.state] || 'empty', size: 16, label: '' }), h('span', { className: 'frk-col__title' }, col.title), h('span', { className: 'frk-col__count' }, col.items.length)),
          h('div', { className: 'frk-col__list' }, items, !col.items.length && !showDrop ? h('div', { className: 'frk-col__empty' }, 'Suelta aquí') : null));
      }),
      drag && ghostItem ? h('div', { className: 'frk-card-dnd is-floating', 'aria-hidden': true, style: { width: drag.w, transform: 'translate(' + (drag.x - drag.ox) + 'px,' + (drag.y - drag.oy) + 'px) rotate(1.5deg) scale(1.03)' } },
        h('span', { className: 'frk-card-dnd__grip' }, h(Icon, { name: 'dots', size: 16 })), h('span', { className: 'frk-card-dnd__body' }, h('span', { className: 'frk-card-dnd__title' }, ghostItem.title))) : null);
  }
  function Sortable(p) { return h(Board, { variant: 'list', columns: [{ id: 'list', title: p.label || 'Lista', items: p.items || [] }], onChange: function (c) { p.onChange && p.onChange(c[0].items); }, className: p.className }); }

  /* ---------- Blueprint: lienzo de plano con rejilla de puntos ---------- */
  function Blueprint(p) {
    var g = p.grid || 10, major = g * (p.majorEvery || 5);
    var ns = useState(p.nodes || []), nodes = ns[0], setNodes = ns[1];
    var vw = useState({ x: 40, y: 30, z: 1 }), view = vw[0], setView = vw[1];
    var sl = useState(p.nodes && p.nodes[0] ? p.nodes[0].id : null), sel = sl[0], setSel = sl[1];
    var cur = useState(null), cursor = cur[0], setCursor = cur[1];
    var tl = useState('select'), tool = tl[0], setTool = tl[1];
    var box = useRef(null), seq = useRef(100);
    function snap(v) { return p.snap === false ? v : Math.round(v / g) * g; }
    function world(e) { var r = box.current.getBoundingClientRect(); return { x: (e.clientX - r.left - 24 - view.x) / view.z, y: (e.clientY - r.top - 24 - view.y) / view.z }; }
    useEffect(function () { var el = box.current; if (!el) return; function w(e) { e.preventDefault(); var r = el.getBoundingClientRect(), mx = e.clientX - r.left - 24, my = e.clientY - r.top - 24; setView(function (v) { if (e.ctrlKey || e.metaKey || !e.shiftKey && Math.abs(e.deltaY) > Math.abs(e.deltaX) && p.wheelZoom !== false) { var z = clamp(v.z * (e.deltaY > 0 ? 0.9 : 1.1), 0.3, 3); return { x: mx - (mx - v.x) * z / v.z, y: my - (my - v.y) * z / v.z, z: z }; } return { x: v.x - e.deltaX, y: v.y - e.deltaY, z: v.z }; }); } el.addEventListener('wheel', w, { passive: false }); return function () { el.removeEventListener('wheel', w); }; }, []);
    function bgDown(e) {
      if (e.target.closest('.frk-bp__node') || e.target.closest('.frk-bp__ui')) return;
      if (tool === 'note') { var wpt = world(e), id = 'n' + (seq.current++); setNodes(nodes.concat([{ id: id, x: snap(wpt.x - 60), y: snap(wpt.y - 30), w: 120, h: 60, title: 'Nota', tone: 'sol' }])); setSel(id); setTool('select'); return; }
      setSel(null); var s0 = { x: e.clientX, y: e.clientY, v: view }; e.currentTarget.setPointerCapture(e.pointerId);
      function mv(ev) { setView({ x: s0.v.x + ev.clientX - s0.x, y: s0.v.y + ev.clientY - s0.y, z: s0.v.z }); }
      function up() { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); }
      window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
    }
    function nodeDown(e, n) {
      e.stopPropagation(); setSel(n.id); var s0 = { x: e.clientX, y: e.clientY, nx: n.x, ny: n.y };
      function mv(ev) { var dx = (ev.clientX - s0.x) / view.z, dy = (ev.clientY - s0.y) / view.z; setNodes(function (ns2) { return ns2.map(function (m) { return m.id === n.id ? Object.assign({}, m, { x: snap(s0.nx + dx), y: snap(s0.ny + dy) }) : m; }); }); }
      function up() { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); p.onChange && p.onChange(nodes); }
      window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
    }
    function nodeKey(e, n) { var st = e.shiftKey ? major : g, d = { ArrowLeft: [-st, 0], ArrowRight: [st, 0], ArrowUp: [0, -st], ArrowDown: [0, st] }[e.key]; if (d) { e.preventDefault(); setNodes(nodes.map(function (m) { return m.id === n.id ? Object.assign({}, m, { x: m.x + d[0], y: m.y + d[1] }) : m; })); } if (e.key === 'Delete' || e.key === 'Backspace') { setNodes(nodes.filter(function (m) { return m.id !== n.id; })); setSel(null); } }
    function zoom(f) { setView(function (v) { var r = box.current.getBoundingClientRect(), mx = (r.width - 24) / 2, my = (r.height - 24) / 2, z = clamp(f === 0 ? 1 : v.z * f, 0.3, 3); return { x: mx - (mx - v.x) * z / v.z, y: my - (my - v.y) * z / v.z, z: z }; }); }
    var byId = {}; nodes.forEach(function (n) { byId[n.id] = n; });
    var edges = (p.edges || []).filter(function (e) { return byId[e.from] && byId[e.to]; }).map(function (e, i) {
      var a = byId[e.from], b = byId[e.to], x1 = a.x + a.w, y1 = a.y + a.h / 2, x2 = b.x, y2 = b.y + b.h / 2;
      if (x2 < x1) { x1 = a.x + a.w / 2; y1 = a.y + a.h; x2 = b.x + b.w / 2; y2 = b.y; var my = (y1 + y2) / 2; return h('g', { key: i }, h('path', { d: 'M' + x1 + ' ' + y1 + ' V' + my + ' H' + x2 + ' V' + y2, className: 'frk-bp__edge', markerEnd: 'url(#frk-bp-arrow)' }), e.label ? h('text', { x: (x1 + x2) / 2, y: my - 6, className: 'frk-bp__elabel', textAnchor: 'middle' }, e.label) : null); }
      var mx = snap((x1 + x2) / 2); return h('g', { key: i }, h('path', { d: 'M' + x1 + ' ' + y1 + ' H' + mx + ' V' + y2 + ' H' + x2, className: 'frk-bp__edge', markerEnd: 'url(#frk-bp-arrow)' }), e.label ? h('text', { x: mx + 6, y: (y1 + y2) / 2, className: 'frk-bp__elabel' }, e.label) : null);
    });
    var S = byId[sel], u = p.unit || 'mm', k = p.unitPerGrid || 1;
    function U(v) { return Math.round(v / g * k * 10) / 10; }
    /* rulers */
    var Rw = 1600, step = g * view.z * (view.z < 0.6 ? 5 : 1), first = -Math.floor(view.x / step) * step, ticksX = [], ticksY = [];
    for (var tx = view.x % step - step; tx < Rw; tx += step) { var wx = Math.round((tx - view.x) / view.z); ticksX.push(h('g', { key: 'x' + tx }, h('line', { x1: tx, y1: Math.round(wx / g) % 5 === 0 ? 8 : 16, x2: tx, y2: 24 }), Math.round(wx / g) % 5 === 0 ? h('text', { x: tx + 3, y: 10 }, U(wx)) : null)); }
    for (var ty = view.y % step - step; ty < 1200; ty += step) { var wy = Math.round((ty - view.y) / view.z); ticksY.push(h('g', { key: 'y' + ty }, h('line', { y1: ty, x1: Math.round(wy / g) % 5 === 0 ? 8 : 16, y2: ty, x2: 24 }), Math.round(wy / g) % 5 === 0 ? h('text', { y: ty - 3, x: 3, transform: 'rotate(-90 3 ' + (ty - 3) + ')' }, U(wy)) : null)); }
    var gz = g * view.z, mz = major * view.z;
    return h('div', { ref: box, className: cx('frk-bp', 'is-' + tool, p.className), style: { height: p.height || 520 }, role: 'application', 'aria-label': (p.label || 'Plano') + '. Arrastra el fondo para moverte, rueda para acercar; los elementos se mueven con flechas (Mayús = paso grande).',
      onPointerMove: function (e) { var w = world(e); setCursor({ x: w.x, y: w.y }); }, onPointerLeave: function () { setCursor(null); } },
      h('div', { className: 'frk-bp__canvas', onPointerDown: bgDown, style: { backgroundSize: gz + 'px ' + gz + 'px, ' + mz + 'px ' + mz + 'px, ' + mz + 'px ' + mz + 'px', backgroundPosition: view.x + 'px ' + view.y + 'px, ' + view.x + 'px ' + view.y + 'px, ' + view.x + 'px ' + view.y + 'px' } },
        h('div', { className: 'frk-bp__world', style: { transform: 'translate(' + view.x + 'px,' + view.y + 'px) scale(' + view.z + ')' } },
          h('svg', { className: 'frk-bp__edges', width: 1, height: 1, style: { overflow: 'visible' }, 'aria-hidden': true },
            h('defs', null, h('marker', { id: 'frk-bp-arrow', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, h('path', { d: 'M0 0 L10 5 L0 10 z', className: 'frk-bp__arrowhead' }))), edges,
            S ? h('g', { className: 'frk-bp__dims' },
              h('line', { x1: S.x, y1: S.y - 14, x2: S.x + S.w, y2: S.y - 14 }), h('line', { x1: S.x, y1: S.y - 19, x2: S.x, y2: S.y - 9 }), h('line', { x1: S.x + S.w, y1: S.y - 19, x2: S.x + S.w, y2: S.y - 9 }),
              h('text', { x: S.x + S.w / 2, y: S.y - 18, textAnchor: 'middle' }, U(S.w) + ' ' + u),
              h('line', { x1: S.x + S.w + 14, y1: S.y, x2: S.x + S.w + 14, y2: S.y + S.h }), h('line', { x1: S.x + S.w + 9, y1: S.y, x2: S.x + S.w + 19, y2: S.y }), h('line', { x1: S.x + S.w + 9, y1: S.y + S.h, x2: S.x + S.w + 19, y2: S.y + S.h }),
              h('text', { x: S.x + S.w + 22, y: S.y + S.h / 2 + 4 }, U(S.h) + ' ' + u)) : null),
          nodes.map(function (n) {
            return h('div', { key: n.id, tabIndex: 0, role: 'button', 'aria-pressed': sel === n.id, 'aria-label': n.title + ', ' + U(n.w) + ' por ' + U(n.h) + ' ' + u + ', en ' + U(n.x) + ', ' + U(n.y),
              className: cx('frk-bp__node', 'frk-tone--' + (n.tone || 'surface'), n.kind && 'is-' + n.kind, sel === n.id && 'is-sel'), style: { left: n.x, top: n.y, width: n.w, height: n.h },
              onPointerDown: function (e) { nodeDown(e, n); }, onFocus: function () { setSel(n.id); }, onKeyDown: function (e) { nodeKey(e, n); } },
              h('span', { className: 'frk-bp__ntitle' }, n.title), n.text ? h('span', { className: 'frk-bp__ntext' }, n.text) : null,
              sel === n.id ? [0, 1, 2, 3].map(function (q) { return h('span', { key: q, className: 'frk-bp__handle frk-bp__handle--' + q, 'aria-hidden': true }); }) : null);
          }))),
      h('svg', { className: 'frk-bp__ruler frk-bp__ruler--x', 'aria-hidden': true }, ticksX),
      h('svg', { className: 'frk-bp__ruler frk-bp__ruler--y', 'aria-hidden': true }, ticksY),
      h('span', { className: 'frk-bp__corner', 'aria-hidden': true }, u),
      h('div', { className: 'frk-bp__ui frk-bp__tools' }, h(Segmented, { label: 'Herramienta', value: tool, onChange: setTool, options: [{ value: 'select', label: 'Mover' }, { value: 'note', label: '+ Nota' }] })),
      h('div', { className: 'frk-bp__ui frk-bp__zoom' },
        h('button', { type: 'button', 'aria-label': 'Alejar', onClick: function () { zoom(1 / 1.2); } }, h(Icon, { name: 'minus', size: 16 })),
        h('button', { type: 'button', 'aria-label': 'Zoom al 100 %', className: 'frk-bp__pct', onClick: function () { zoom(0); } }, Math.round(view.z * 100) + '%'),
        h('button', { type: 'button', 'aria-label': 'Acercar', onClick: function () { zoom(1.2); } }, h(Icon, { name: 'plus', size: 16 }))),
      h('div', { className: 'frk-bp__ui frk-bp__hud', 'aria-live': 'off' }, cursor ? 'X ' + U(cursor.x) + ' · Y ' + U(cursor.y) + ' ' + u : (S ? S.title + ' · ' + U(S.x) + ', ' + U(S.y) + ' ' + u : nodes.length + ' elementos')));
  }

  /* ---------- AreaChart: área en semitono ---------- */
  function AreaChart(p) {
    var series = p.series || [], W = p.width || 520, H = p.height || 200, pd = 14, n = (series[0] && series[0].data.length) || 0, id = useId();
    var all = [].concat.apply([], series.map(function (s) { return s.data; })), mx = Math.max.apply(null, all.concat([1])), mn = p.zero === false ? Math.min.apply(null, all) : 0;
    function pts(d) { return d.map(function (v, i) { return [pd + i / ((n - 1) || 1) * (W - pd * 2), pd + (1 - (v - mn) / ((mx - mn) || 1)) * (H - pd * 2 - 18)]; }); }
    function curve(q) { return q.map(function (pt, i) { if (!i) return 'M' + pt[0] + ' ' + pt[1]; var a = q[i - 1], c = (pt[0] - a[0]) / 2; return 'C' + (a[0] + c) + ' ' + a[1] + ' ' + (pt[0] - c) + ' ' + pt[1] + ' ' + pt[0] + ' ' + pt[1]; }).join(' '); }
    var tones = ['rams', 'ink', 'klein', 'verde'];
    return h('figure', { className: cx('frk-area', p.className), style: { maxWidth: W } },
      h('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%', role: 'img', 'aria-label': (p.label || 'Gráfico de área') + ': ' + series.map(function (s) { return s.label + ' de ' + s.data[0] + ' a ' + s.data[s.data.length - 1]; }).join('; ') },
        h('defs', null, series.map(function (s, k) { var t = s.tone || tones[k]; return h('pattern', { key: k, id: id + 'p' + k, width: 6, height: 6, patternUnits: 'userSpaceOnUse' }, h('circle', { cx: 3, cy: 3, r: 1.5, className: 'frk-area__dot frk-area--' + t })); })),
        range(4).map(function (i) { var y = pd + i * (H - pd * 2 - 18) / 3; return h('line', { key: i, x1: pd, x2: W - pd, y1: y, y2: y, className: 'frk-area__grid' }); }),
        series.map(function (s, k) { return k; }).sort(function (i, j) { function m(d) { return d.reduce(function (x, y) { return x + y; }, 0) / d.length; } return m(series[j].data) - m(series[i].data); }).map(function (k) { var s = series[k], q = pts(s.data), base = H - 18 - 4; return h('path', { key: 'f' + k, d: curve(q) + ' L' + q[q.length - 1][0] + ' ' + base + ' L' + q[0][0] + ' ' + base + ' Z', fill: 'url(#' + id + 'p' + k + ')', className: 'frk-area__fill' }); }),
        series.map(function (s, k) { return h('path', { key: 'l' + k, d: curve(pts(s.data)), className: 'frk-area__line frk-area--' + (s.tone || tones[k]) }); }),
        (p.labels || []).map(function (l, i) { var x = pd + i / ((p.labels.length - 1) || 1) * (W - pd * 2); return h('text', { key: i, x: x, y: H - 2, className: 'frk-line__lbl', textAnchor: i === 0 ? 'start' : i === p.labels.length - 1 ? 'end' : 'middle' }, l); })),
      series.length > 1 || p.legend ? h('figcaption', { className: 'frk-split__legend' }, series.map(function (s, k) { return h('span', { key: k, style: { display: 'inline-flex', alignItems: 'center', gap: '6px' } }, h('span', { className: 'frk-split__sw frk-tone--' + (s.tone || tones[k]) }), s.label); })) : null);
  }

  /* ---------- Scatter ---------- */
  function Scatter(p) {
    var pts = p.points || [], W = p.width || 420, H = p.height || 260, pd = 28, xs = pts.map(function (q) { return q.x; }), ys = pts.map(function (q) { return q.y; });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys), mx = (x1 - x0) * 0.08 || 1, my = (y1 - y0) * 0.08 || 1; x0 -= mx; x1 += mx; y0 -= my; y1 += my;
    function X(v) { return pd + (v - x0) / ((x1 - x0) || 1) * (W - pd * 2); } function Y(v) { return H - pd - (v - y0) / ((y1 - y0) || 1) * (H - pd * 2); }
    return h('figure', { className: cx('frk-scatter', p.className), style: { maxWidth: W } },
      h('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%', role: 'img', 'aria-label': (p.label || 'Dispersión') + ': ' + pts.length + ' puntos' },
        range(6).map(function (i) { return range(5).map(function (j) { return h('circle', { key: i + '-' + j, cx: pd + i * (W - pd * 2) / 5, cy: pd + j * (H - pd * 2) / 4, r: 1.3, className: 'frk-scatter__grid' }); }); }),
        h('line', { x1: pd, y1: H - pd, x2: W - pd, y2: H - pd, className: 'frk-scatter__axis' }), h('line', { x1: pd, y1: pd, x2: pd, y2: H - pd, className: 'frk-scatter__axis' }),
        pts.map(function (q, i) { return h('circle', { key: i, cx: X(q.x), cy: Y(q.y), r: q.size || 6, className: 'frk-scatter__pt frk-area--' + (q.tone || 'ink') }, h('title', null, (q.label ? q.label + ': ' : '') + q.x + ', ' + q.y)); }),
        h('text', { x: W - pd, y: H - 8, textAnchor: 'end', className: 'frk-line__lbl' }, p.xLabel || 'x'), h('text', { x: 4, y: pd - 10, className: 'frk-line__lbl' }, p.yLabel || 'y')));
  }

  /* ---------- RadarChart ---------- */
  function RadarChart(p) {
    var axes = p.axes || [], series = p.series || [], size = p.size || 260, c = size / 2, R = c - 34, n = axes.length, tones = ['rams', 'klein'];
    function pt(i, v) { return polar(c, c, R * v, i * 360 / n); }
    return h('figure', { className: cx('frk-radar', p.className) },
      h('svg', { viewBox: '0 0 ' + size + ' ' + size, width: size, height: size, role: 'img', 'aria-label': (p.label || 'Radar') + ': ' + series.map(function (s) { return s.label + ' — ' + axes.map(function (a, i) { return a + ' ' + Math.round(s.data[i] * 100) + '%'; }).join(', '); }).join('; ') },
        [0.25, 0.5, 0.75, 1].map(function (r) { return range(n * 6).map(function (i) { var q = polar(c, c, R * r, i * 360 / (n * 6)); return h('circle', { key: r + '-' + i, cx: q[0], cy: q[1], r: 1, className: 'frk-scatter__grid' }); }); }),
        axes.map(function (a, i) { var e = pt(i, 1), l = pt(i, 1.16); return h('g', { key: a }, h('line', { x1: c, y1: c, x2: e[0], y2: e[1], className: 'frk-radar__axis' }), h('text', { x: l[0], y: l[1], textAnchor: 'middle', dominantBaseline: 'middle', className: 'frk-line__lbl' }, a)); }),
        series.map(function (s, k) { var q = s.data.map(function (v, i) { return pt(i, clamp(v, 0, 1)); }); var t = s.tone || tones[k % 2]; return h('g', { key: k }, h('polygon', { points: q.map(function (x) { return x.join(','); }).join(' '), className: 'frk-radar__shape frk-area--' + t }), q.map(function (x, i) { return h('circle', { key: i, cx: x[0], cy: x[1], r: 4, className: 'frk-scatter__pt frk-area--' + t }); })); })),
      series.length > 1 ? h('figcaption', { className: 'frk-split__legend' }, series.map(function (s, k) { return h('span', { key: k, style: { display: 'inline-flex', alignItems: 'center', gap: '6px' } }, h('span', { className: 'frk-split__sw frk-tone--' + (s.tone || tones[k % 2]) }), s.label); })) : null);
  }

  /* ---------- DonutChart ---------- */
  function DonutChart(p) {
    var seg = p.segments || [], size = p.size || 200, c = size / 2, w = p.thickness || 22, r = c - w / 2 - 2, tot = seg.reduce(function (a, s) { return a + s.value; }, 0) || 1, gap = p.gap == null ? 6 : p.gap, a = 0, tones = ['ink', 'rams', 'sol', 'klein', 'verde'];
    function arc(a0, a1) { var s = polar(c, c, r, a0), e = polar(c, c, r, a1); return 'M' + s[0] + ' ' + s[1] + ' A' + r + ' ' + r + ' 0 ' + (a1 - a0 > 180 ? 1 : 0) + ' 1 ' + e[0] + ' ' + e[1]; }
    return h('figure', { className: cx('frk-donut', p.className) },
      h('div', { className: 'frk-donut__wrap', style: { width: size, height: size } },
        h('svg', { viewBox: '0 0 ' + size + ' ' + size, width: size, height: size, role: 'img', 'aria-label': (p.label || 'Reparto') + ': ' + seg.map(function (s) { return s.label + ' ' + Math.round(s.value / tot * 100) + '%'; }).join(', ') },
          seg.map(function (s, i) { var sw = s.value / tot * 360, a0 = a + gap / 2, a1 = a + sw - gap / 2; a += sw; return a1 > a0 ? h('path', { key: i, d: arc(a0, a1), strokeWidth: w, className: 'frk-donut__seg frk-area--' + (s.tone || tones[i % 5]) }) : null; })),
        h('div', { className: 'frk-donut__center' }, h('span', { className: 'frk-donut__value' }, p.value != null ? p.value : tot), p.caption ? h('span', { className: 'frk-donut__cap' }, p.caption) : null)),
      h('figcaption', { className: 'frk-split__legend' }, seg.map(function (s, i) { return h('span', { key: i, style: { display: 'inline-flex', alignItems: 'center', gap: '6px' } }, h('span', { className: 'frk-split__sw frk-tone--' + (s.tone || tones[i % 5]) }), s.label, h('b', null, Math.round(s.value / tot * 100) + '%')); })));
  }

  /* ---------- Scope: osciloscopio ---------- */
  function Scope(p) {
    var W = p.width || 360, H = p.height || 180, s = useState(0), t = s[0], set = s[1], live = p.live !== false && !reduced();
    useEffect(function () { if (!live) return; var raf, t0 = performance.now(); function f() { set((performance.now() - t0) / 1000); raf = requestAnimationFrame(f); } raf = requestAnimationFrame(f); return function () { cancelAnimationFrame(raf); }; }, [live]);
    var fr = p.frequency || 2, amp = p.amplitude || 0.7, pts = [];
    for (var x = 0; x <= W; x += 3) { var ph = x / W * Math.PI * 2 * fr + t * 4, y = H / 2 - (Math.sin(ph) * amp + Math.sin(ph * 3.1) * 0.12 * amp + (p.noise ? (Math.random() - 0.5) * p.noise : 0)) * H * 0.42; pts.push(x + ',' + y.toFixed(1)); }
    return h('figure', { className: cx('frk-scope', p.className), style: { maxWidth: W } },
      h('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%', role: 'img', 'aria-label': (p.label || 'Señal') + ': onda de ' + fr + ' ciclos, amplitud ' + Math.round(amp * 100) + ' %' },
        range(11).map(function (i) { return range(7).map(function (j) { return h('circle', { key: i + '-' + j, cx: i * W / 10, cy: j * H / 6, r: i === 5 || j === 3 ? 1.6 : 1, className: 'frk-scope__grid' }); }); }),
        h('polyline', { points: pts.join(' '), className: 'frk-scope__trace' })),
      p.caption ? h('figcaption', { className: 'frk-scope__cap' }, h('span', null, p.caption), h('span', null, fr + ' Hz · ' + Math.round(amp * 100) + '%')) : null);
  }
  /* ---------- VoicePosition: de dónde viene la voz (idea de libraries.dev/voice-position) ---------- */
  var VSIDES = { left: 'a la izquierda', ahead: 'delante', right: 'a la derecha' };
  var VSTATE = { idle: 'En espera', listening: 'Escuchando', speaking: 'Hablando', processing: 'Pensando' };
  var VDEMO = [
    { ms: 2600, state: 'listening', pan: -0.85, side: 'left', distance: 'near', pr: [0.86, 0.12, 0.02] },
    { ms: 1400, state: 'idle', pan: null, side: null, distance: 'near', pr: [0.34, 0.33, 0.33] },
    { ms: 2600, state: 'listening', pan: 0, side: 'ahead', distance: 'far', pr: [0.08, 0.82, 0.10] },
    { ms: 1800, state: 'processing', pan: 0, side: 'ahead', distance: 'far', pr: [0.08, 0.82, 0.10] },
    { ms: 2600, state: 'speaking', pan: 0.8, side: 'right', distance: 'near', pr: [0.03, 0.15, 0.82] },
    { ms: 1400, state: 'idle', pan: null, side: null, distance: 'near', pr: [0.34, 0.33, 0.33] }
  ];
  function VoicePosition(p) {
    var ds = useState(0), step = ds[0], setStep = ds[1], ts = useState(0), t = ts[0], setT = ts[1], rm = reduced();
    useEffect(function () { if (!p.demo) return; var id = setTimeout(function () { setStep((step + 1) % VDEMO.length); }, VDEMO[step].ms); return function () { clearTimeout(id); }; }, [p.demo, step]);
    var d = p.demo ? VDEMO[step] : { state: p.state || (p.side || p.pan != null ? 'listening' : 'idle'), pan: p.pan, side: p.side, distance: p.distance || 'near', pr: p.probabilities };
    var side = d.side || (d.pan == null ? null : d.pan < -0.33 ? 'left' : d.pan > 0.33 ? 'right' : 'ahead');
    var pan = d.pan != null ? clamp(d.pan, -1, 1) : side === 'left' ? -0.8 : side === 'right' ? 0.8 : 0, state = d.state, far = d.distance === 'far';
    var pr = d.pr || (side === 'left' ? [0.8, 0.15, 0.05] : side === 'right' ? [0.05, 0.15, 0.8] : side === 'ahead' ? [0.1, 0.8, 0.1] : [0.34, 0.33, 0.33]);
    var live = !rm && p.animate !== false;
    useEffect(function () { if (!live) return; var raf, t0 = performance.now(); function f() { setT((performance.now() - t0) / 1000); raf = requestAnimationFrame(f); } raf = requestAnimationFrame(f); return function () { cancelAnimationFrame(raf); }; }, [live]);
    var lvl = p.level != null ? clamp(p.level, 0, 1) : state === 'idle' ? 0.05 : state === 'processing' ? 0.25 : 0.45 + 0.35 * Math.abs(Math.sin(t * 5.3) * Math.sin(t * 2.1));
    var S = p.size || 220, W = Math.round(S * 1.6), c = S / 2 + 6, R = S * 0.3, N = 40, rings = p.rings || 3, hi = Math.floor(t * 18) % N;
    var dots = [];
    for (var k = 0; k < rings; k++) {
      var rr = R * (0.62 + 0.24 * k);
      for (var i = 0; i < N; i++) {
        var th = i / N * Math.PI * 2, wob = Math.sin(th * 3 + t * (state === 'idle' ? 0.6 : 2.4) + k * 1.3);
        var lean = side ? 1 + 0.55 * pan * Math.cos(th) : 1;              /* los puntos del lado de la voz crecen */
        var rad = rr * (1 + lvl * 0.16 * wob * (k + 1) / rings);
        var x = Math.cos(th) * rad, y = Math.sin(th) * rad, sz = Math.max(0.6, (1.5 + lvl * 2.2 * (0.5 + 0.5 * wob)) * lean * (1 - k * 0.12));
        dots.push(h('circle', { key: k + '-' + i, cx: x.toFixed(1), cy: y.toFixed(1), r: sz.toFixed(2), className: cx('frk-vpos__dot', k === rings - 1 && 'is-outer', state === 'processing' && k === rings - 1 && (i === hi || i === (hi + 1) % N || i === (hi + 2) % N) && 'is-hi') }));
      }
    }
    var label = state === 'idle' || !side ? 'Sin voz' : 'Voz ' + VSIDES[side] + ', ' + (far ? 'lejos' : 'cerca');
    var cells = [['left', 'Izq.'], ['ahead', 'Delante'], ['right', 'Der.']];
    return h('div', { className: cx('frk-vpos', 'frk-vpos--' + (p.tone || 'klein'), 'is-' + state, p.className) },
      h('div', { className: 'frk-vpos__stage' },
        h('svg', { viewBox: '0 0 ' + W + ' ' + S, width: '100%', role: 'img', 'aria-label': label + '. ' + VSTATE[state] + '.' },
          h('g', { className: 'frk-vpos__body', style: { transform: 'translate(' + (W / 2 + (state === 'idle' ? 0 : pan * W * 0.26)) + 'px,' + (c - 6) + 'px) scale(' + (far ? 0.66 : 1) + ')' } }, dots,
            h('circle', { cx: 0, cy: 0, r: R * 0.34, className: 'frk-vpos__core' })))),
      h('div', { className: 'frk-vpos__read' },
        cells.map(function (q, i) { var on = side === q[0] && state !== 'idle', f = Math.round(pr[i] * 5);
          return h('div', { key: q[0], className: cx('frk-vpos__cell', on && 'is-on') },
            h('span', { className: 'frk-vpos__bars', 'aria-hidden': true }, range(5).map(function (j) { return h('span', { key: j, className: cx(j < f && 'is-on') }); })),
            h('span', { className: 'frk-vpos__lbl' }, q[1]), h('span', { className: 'frk-vpos__pct' }, Math.round(pr[i] * 100) + '%')); }),
        h('div', { className: cx('frk-vpos__cell', 'frk-vpos__dist', far && 'is-far') },
          h('span', { className: 'frk-vpos__distmark', 'aria-hidden': true }, h('span', null)),
          h('span', { className: 'frk-vpos__lbl' }, 'Distancia'), h('span', { className: 'frk-vpos__pct' }, far ? 'Lejos' : 'Cerca'))),
      h('div', { className: 'frk-vpos__foot' }, h(LED, { tone: state === 'processing' ? 'sol' : 'klein', on: state !== 'idle', blink: state === 'processing' }, VSTATE[state]), p.caption ? h('span', { className: 'frk-vpos__note' }, p.caption) : null),
      h('span', { className: 'frk-sr', 'aria-live': 'polite' }, label));
  }

  /* ---------- Beam: haz de puntos que recorre el borde mientras algo trabaja ---------- */
  function Beam(p) {
    var ref = useRef(null), sz = useState([0, 0]), wh = sz[0], setWh = sz[1], on = p.active !== false, r = p.radius == null ? 24 : p.radius;
    useEffect(function () { var el = ref.current; if (!el || !window.ResizeObserver) return; var ro = new ResizeObserver(function () { setWh([el.offsetWidth, el.offsetHeight]); }); ro.observe(el); return function () { ro.disconnect(); }; }, []);
    var w = wh[0], hh = wh[1], rect = w ? { x: 1.5, y: 1.5, width: Math.max(0, w - 3), height: Math.max(0, hh - 3), rx: Math.min(r, hh / 2) } : null, per = rect ? 2 * (rect.width + rect.height) - (8 - 2 * Math.PI) * rect.rx : 0, dash = { strokeDasharray: '0 8 0 8 0 8 0 8 0 8 0 8 0 ' + Math.max(1, per - 48).toFixed(1), '--per': per.toFixed(1) };
    return h('div', { ref: ref, className: cx('frk-beam', 'frk-beam--' + (p.tone || 'klein'), on && 'is-on', p.className), style: Object.assign({ borderRadius: r }, p.style), 'aria-busy': on || undefined },
      p.children,
      rect ? h('svg', { className: 'frk-beam__svg', width: w, height: hh, 'aria-hidden': true },
        h('rect', Object.assign({ className: 'frk-beam__track' }, rect)),
        on ? h('rect', Object.assign({ className: 'frk-beam__head', style: dash }, rect)) : null,
        on ? h('rect', Object.assign({ className: 'frk-beam__tail', style: dash }, rect)) : null) : null,
      on && p.label ? h('span', { className: 'frk-sr', role: 'status' }, p.label) : null);
  }
  /* ---------- Aura: halo que respira (disponible, en directo, ausente) ---------- */
  var AURA = { online: 'verde', available: 'verde', live: 'rec', away: 'sol', busy: 'rams', ai: 'klein' };
  function Aura(p) {
    var tone = AURA[p.status] || p.tone || 'verde', on = p.active !== false && p.status !== 'offline';
    return h('span', { className: cx('frk-aura', 'frk-aura--' + tone, on && 'is-on', p.status === 'live' && 'is-fast', p.shape === 'rect' && 'frk-aura--rect', p.className), style: p.style }, p.children,
      p.label ? h('span', { className: 'frk-sr' }, ' · ' + p.label) : null);
  }

  /* ---------- FlapBoard: panel de salidas con paletas ---------- */
  function FlapBoard(p) {
    var cols = p.columns || [{ key: 'time', label: 'Hora', length: 5 }, { key: 'text', label: 'Destino', length: 12 }, { key: 'status', label: 'Estado', length: 9 }];
    return h('div', { className: cx('frk-flapboard', p.className), role: 'table', 'aria-label': p.label || 'Panel' },
      p.title ? h('div', { className: 'frk-flapboard__title' }, h('span', null, p.title), p.meta ? h('span', null, p.meta) : null) : null,
      h('div', { className: 'frk-flapboard__grid', style: { gridTemplateColumns: 'repeat(' + cols.length + ', max-content)' } },
        h('div', { role: 'row', className: 'frk-flapboard__head' }, cols.map(function (c) { return h('span', { key: c.key, role: 'columnheader' }, c.label); })),
        (p.rows || []).map(function (r, i) { return h('div', { key: r.id || i, role: 'row', className: 'frk-flapboard__row' }, cols.map(function (c) { return h('div', { key: c.key, role: 'cell' }, h(SplitFlap, { value: r[c.key] == null ? '' : String(r[c.key]), length: c.length, size: p.size || 's', tone: c.key === 'status' && r.tone ? r.tone : undefined })); })); })));
  }
  var api = {KeyButton: KeyButton, Keypad: Keypad, HoldButton: HoldButton, SlideToStart: SlideToStart, Rocker: Rocker, Icon: Icon, Dial: Dial, Gauge: Gauge, Slider: Slider, Switch: Switch, Segmented: Segmented, Stepper: Stepper, Wheel: Wheel, VolumeWheel: VolumeWheel, Checkbox: Checkbox, RadioGroup: RadioGroup, Select: Select, Menu: Menu, Tabs: Tabs, TextField: TextField, Calendar: Calendar, Sheet: Sheet, Toast: Toast, Banner: Banner, Tooltip: Tooltip, Timer: Timer, Stopwatch: Stopwatch, Hourglass: Hourglass, Pendulum: Pendulum, MediaPlayer: MediaPlayer, AudioTrack: AudioTrack, Ticker: Ticker, SplitFlap: SplitFlap, DotMatrix: DotMatrix, DotGrid: DotGrid, StateMark: StateMark, Steps: Steps, Grille: Grille, LED: LED, LevelBars: LevelBars, BarMeter: BarMeter, LineChart: LineChart, ProgressRing: ProgressRing, Readout: Readout, Tile: Tile, Strip: Strip, CardStack: CardStack, Cabinet: Cabinet, Pager: Pager, Deck: Deck, ListRow: ListRow, Chip: Chip, Badge: Badge, Avatar: Avatar, TopBar: TopBar, TabBar: TabBar, EmptyState: EmptyState, Skeleton: Skeleton, Message: Message, Composer: Composer, Suggestions: Suggestions, VoiceOrb: VoiceOrb, DotLoader: DotLoader, AgentWidget: AgentWidget, Render: Render, Reveal: Reveal, Stack: Stack, Grid: Grid, Text: Text, ClickWheel: ClickWheel, DiscCarousel: DiscCarousel, NumPad: NumPad, Viewfinder: Viewfinder, CaptureKey: CaptureKey, Recorder: Recorder, NoteEditor: NoteEditor, Sidebar: Sidebar, DataTable: DataTable, CommandBar: CommandBar, Notch: Notch, Viewport3D: Viewport3D, Heatmap: Heatmap, SplitBar: SplitBar, Sparkline: Sparkline, HourStrip: HourStrip, PaymentCard: PaymentCard, Dialog: Dialog, FileDrop: FileDrop, ChoiceCards: ChoiceCards, Stat: Stat, UsageMeter: UsageMeter, Timeline: Timeline, Checklist: Checklist, PromptBox: PromptBox, Clock: Clock, VUMeter: VUMeter, RotarySelector: RotarySelector, Fader: Fader, Keycap: Keycap, Calculator: Calculator, PadGrid: PadGrid, TapeDeck: TapeDeck, Board: Board, Sortable: Sortable, Blueprint: Blueprint, AreaChart: AreaChart, Scatter: Scatter, RadarChart: RadarChart, DonutChart: DonutChart, Scope: Scope, VoicePosition: VoicePosition, Beam: Beam, Aura: Aura, FlapBoard: FlapBoard};
  api.parseLang = parseLang;
  window.Frekvens = Object.assign(window.Frekvens || {}, api);
})();
