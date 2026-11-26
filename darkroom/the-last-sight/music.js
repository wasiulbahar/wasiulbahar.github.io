/* The score, mixed live with Web Audio. Silent until the reader asks for sound; always steps aside for a survivor's voice.
   Layers (media/score/): drone, tension, heart and now loop or play under gains; thud and ring are one-shots. */
(function () {
  "use strict";
  var LS = window.LS, AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) { LS.music = { scene: function () {}, duck: function () {}, enable: function () {} }; return; }

  var ctx = null, master, duckG, buffers = {}, layers = {}, loading = null;
  var enabled = false, musicOn = true, current = "silent", nowSource = null;
  var LOOPS = ["drone", "tension", "heart"], ONCE = ["thud", "ring", "now"];
  // each scene: target level for each loop, plus one-shots to fire on entry
  var SCENES = {
    silent: {},
    "open-1": { drone: .3 }, "open-2": { drone: .3, tension: .2 }, "open-3": { drone: .25, tension: .38 },
    "open-4": { fire: [["ring", .22]] },
    calm: { drone: .3 },
    data: { drone: .16 },
    "ch-intro": { drone: .32 },
    "ch-where": { drone: .16, tension: .42 },
    "ch-moment": { fire: [["thud", .9], ["ring", .2]] },
    "ch-quote": {},
    "ch-after": { heart: .5, drone: .08 },
    "ch-now": { drone: .3, fire: [["now", .42]] },
    ending: { drone: .26, fire: [["now", .4]] }
  };

  function init() {
    if (ctx) return loading;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0;
    duckG = ctx.createGain(); duckG.gain.value = 1;
    master.connect(duckG); duckG.connect(ctx.destination);
    loading = Promise.all(LOOPS.concat(ONCE).map(function (name) {
      return fetch("media/score/" + name + ".m4a").then(function (r) { return r.arrayBuffer(); })
        .then(function (b) { return new Promise(function (ok, no) { ctx.decodeAudioData(b, ok, no); }); })
        .then(function (buf) { buffers[name] = buf; }).catch(function () {});
    })).then(function () {
      LOOPS.forEach(function (name) {   // loops run all the time, silent until a scene raises them
        if (!buffers[name]) return;
        var src = ctx.createBufferSource(), g = ctx.createGain();
        src.buffer = buffers[name]; src.loop = true; g.gain.value = 0;
        src.connect(g); g.connect(master); src.start(0, Math.random() * buffers[name].duration);
        layers[name] = g;
      });
      apply(current, true);
    });
    return loading;
  }
  function ramp(param, value, secs) {
    var t = ctx.currentTime;
    param.cancelScheduledValues(t); param.setValueAtTime(param.value, t);
    param.linearRampToValueAtTime(value, t + secs);
  }
  function fire(name, level) {
    if (!buffers[name]) return;
    if (name === "now" && nowSource) { try { nowSource.stop(); } catch (e) {} }
    var src = ctx.createBufferSource(), g = ctx.createGain();
    src.buffer = buffers[name]; g.gain.value = level;
    src.connect(g); g.connect(master); src.start();
    if (name === "now") nowSource = src;
  }
  function apply(name, quiet) {
    if (!ctx || !Object.keys(layers).length) return;
    var s = SCENES[name] || {};
    var sudden = name === "ch-moment" || name === "open-4";   // the moment: everything stops at once
    LOOPS.forEach(function (l) { if (layers[l]) ramp(layers[l].gain, s[l] || 0, sudden ? .12 : 2.5); });
    if (!quiet && s.fire) s.fire.forEach(function (f) { fire(f[0], f[1]); });
    if (name !== "ch-now" && name !== "ending" && nowSource) { try { nowSource.stop(ctx.currentTime + 2); } catch (e) {} nowSource = null; }
  }
  function on() { return enabled && musicOn; }
  function refresh() {
    if (!ctx) return;
    ramp(master.gain, on() ? 1 : 0, 1.2);
    if (on() && ctx.state === "suspended") ctx.resume();
  }

  LS.music = {
    // called with the reader's choice; a click is what allows audio to start
    enable: function (yes) { enabled = yes; if (yes) init().then(refresh); else refresh(); },
    scene: function (name) { if (name === current) return; current = name; if (on()) apply(name); },
    duck: function (down) { if (ctx) ramp(duckG.gain, down ? .15 : 1, down ? .4 : 1.6); },
    state: function () {   // for checking the mix by hand
      if (!ctx) return { started: false };
      var o = { started: true, audio: ctx.state, scene: current, master: +master.gain.value.toFixed(2), duck: +duckG.gain.value.toFixed(2), loaded: Object.keys(buffers) };
      LOOPS.forEach(function (l) { if (layers[l]) o[l] = +layers[l].gain.value.toFixed(2); });
      return o;
    }
  };

  var btn = document.getElementById("ls-music");
  if (btn) btn.addEventListener("click", function () {
    if (!enabled) { musicOn = true; document.getElementById("ls-mode").click(); return; }   // turns sound on, which starts the music
    musicOn = !musicOn; btn.setAttribute("aria-pressed", String(musicOn));
    refresh();
  });

  // the sections outside the chapters each set a scene as they reach the middle of the screen
  var map = [["ls-gate", "silent"], ["story", null], ["ls-six", "calm"], ["ls-body", "data"], ["ls-range", "data"], ["ls-count", "data"],
             ["ls-buy", "data"], ["ls-where", "data"], ["ls-after", "calm"], ["ls-method", "silent"]];
  map.forEach(function (m) {
    var node = document.getElementById(m[0]);
    if (!node || !m[1]) return;
    new IntersectionObserver(function (es) { if (es[0].isIntersecting) LS.music.scene(m[1]); }, { rootMargin: "-45% 0px -45% 0px" }).observe(node);
  });
  var title = document.querySelector(".ls-title");
  if (title) new IntersectionObserver(function (es) { if (es[0].isIntersecting) LS.music.scene("calm"); }, { rootMargin: "-45% 0px -45% 0px" }).observe(title);
  var end = document.querySelector(".ls-end");
  if (end) new IntersectionObserver(function (es) { if (es[0].isIntersecting) LS.music.scene("ending"); }, { rootMargin: "-40% 0px -40% 0px" }).observe(end);
})();
