/* The Last Sight, sections 3 to 8: the aim question and the X-ray, pellets in flight, the eyes that close,
   the cartridges that pile up, the satellite flyover, and before and after. Every graphic has its words in the page. */
(function () {
  "use strict";
  var LS = window.LS, el = LS.el, both = LS.both, calm = LS.calm;
  var NS = "http://www.w3.org/2000/svg";
  var svg = function (tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  var seeded = function (seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; };
  var onView = function (node, fn, margin) {
    new IntersectionObserver(function (es, o) { es.forEach(function (e) { if (e.isIntersecting) fn(e.target, o); }); }, { rootMargin: margin || "0px" }).observe(node);
  };
  var bn = function () { return LS.lang() === "bn"; };

  // ---------------------------------------------------------------- the body: a real X-ray, with zones over it
  // media/xray-body.jpg is 1091 × 1400, head to mid-thigh. Zones are drawn in the same pixels.
  var XW = 1091, XH = 1400;
  var ZONES = {
    head: ["ellipse", { cx: 536, cy: 150, rx: 112, ry: 142 }],
    neck: ["rect", { x: 486, y: 280, width: 110, height: 100, rx: 20 }],
    chest: ["path", { d: "M290 380 Q536 330 790 380 L770 760 H310 Z" }],
    abdomen: ["path", { d: "M310 760 H770 L760 1060 H320 Z" }],
    arms: ["path", { d: "M180 380 L290 380 L310 760 L300 1260 L190 1260 L150 760 Z M790 380 L900 380 L930 760 L890 1260 L780 1260 L770 760 Z" }],
    thighs: ["path", { d: "M320 1060 H760 L770 1400 H310 Z" }]
  };
  var NAMES = { head: ["head and face", "মাথা ও মুখ"], neck: ["neck", "ঘাড়"], chest: ["chest", "বুক"], abdomen: ["lower abdomen", "তলপেট"], arms: ["arms", "হাত"], thighs: ["thighs", "ঊরু"], below: ["legs below the knee", "হাঁটুর নিচে"] };
  var ALLOWED = ["abdomen", "thighs", "below"];
  function xrayBase(host, cls) {
    host.setAttribute("viewBox", "0 0 " + XW + " " + XH);
    var img = svg("image", { href: "media/xray-body.jpg", x: 0, y: 0, width: XW, height: XH, class: "xr-img" }, host);
    img.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "media/xray-body.jpg");
    var g = svg("g", { class: cls }, host), shapes = {};
    Object.keys(ZONES).forEach(function (z) { shapes[z] = svg(ZONES[z][0], ZONES[z][1], g); shapes[z].setAttribute("class", "zone"); shapes[z].dataset.z = z; });
    svg("text", { x: XW / 2, y: XH - 24, class: "xr-more", "text-anchor": "middle" }, host).textContent = "↓";
    return shapes;
  }

  // 3a. Where would you aim? Tap the X-ray.
  var aim = document.getElementById("aim-svg");
  if (aim) {
    var aimShapes = xrayBase(aim, "aimfig"), answered = false, ans = document.getElementById("aim-answer");
    var zb = document.getElementById("aim-zones");
    var pick = function (z) {
      if (answered) return;
      answered = true;
      Object.keys(aimShapes).forEach(function (k) { aimShapes[k].setAttribute("class", "zone" + (ALLOWED.indexOf(k) >= 0 ? " on ok" : "") + (k === z ? " picked" : "")); });
      var right = ALLOWED.indexOf(z) >= 0;
      ans.textContent = "";
      ans.appendChild(both("span", null,
        (right ? "Right. " : "No. ") + "The rules allow only the lower abdomen and legs, in green. In July 2024, the wounds were in the head, face, neck and chest. Scroll on.",
        (right ? "ঠিক। " : "না। ") + "নিয়ম অনুযায়ী শুধু তলপেট ও পা, সবুজ অংশে। ২০২৪ সালের জুলাইয়ে ক্ষত ছিল মাথা, মুখ, ঘাড় আর বুকে। নিচে নামুন।"));
      zb.querySelectorAll("button").forEach(function (b) { b.disabled = true; b.classList.toggle("picked", b.dataset.z === z); });
    };
    Object.keys(NAMES).forEach(function (z) {
      if (aimShapes[z]) aimShapes[z].addEventListener("click", function () { pick(z); });
      var b = both("button", null, NAMES[z][0], NAMES[z][1]); b.type = "button"; b.dataset.z = z;
      b.addEventListener("click", function () { pick(z); }); zb.appendChild(b);
    });
  }

  // 3b. The X-ray scroll: rules, earlier unrest (a real knee), July 2024 (pellets appear), Pulok's own film, the six
  var xs = document.getElementById("xray-svg");
  if (xs) {
    var defs = svg("defs", {}, xs);
    var glow = svg("filter", { id: "xglow", x: "-80%", y: "-80%", width: "260%", height: "260%" }, defs);
    svg("feGaussianBlur", { stdDeviation: "3", result: "b" }, glow);
    var mg = svg("feMerge", {}, glow); svg("feMergeNode", { in: "b" }, mg); svg("feMergeNode", { in: "SourceGraphic" }, mg);
    var soft = svg("filter", { id: "xsoft", x: "-20%", y: "-20%", width: "140%", height: "140%" }, defs); svg("feGaussianBlur", { stdDeviation: "18" }, soft);
    xs.setAttribute("viewBox", "0 0 " + XW + " " + XH);
    var base = svg("image", { href: "media/xray-body.jpg", x: 0, y: 0, width: XW, height: XH, class: "xr-img" }, xs);
    base.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "media/xray-body.jpg");
    var zg = svg("g", { filter: "url(#xsoft)" }, xs), xz = {};
    Object.keys(ZONES).forEach(function (z) { xz[z] = svg(ZONES[z][0], ZONES[z][1], zg); xz[z].setAttribute("class", "xzone"); });
    var pel = svg("g", {}, xs);
    var label = document.getElementById("xray-label"), countEl = document.getElementById("xray-count");
    var panel = document.getElementById("xray-panel"), panelImg = panel.querySelector("img"), panelCap = panel.querySelector("figcaption");
    var timers = [];
    var lightZones = function (zones, tone) { Object.keys(xz).forEach(function (z) { xz[z].setAttribute("class", "xzone" + (zones.indexOf(z) >= 0 ? " on " + tone : "")); }); };
    var clearPellets = function () { timers.forEach(clearTimeout); timers = []; while (pel.firstChild) pel.removeChild(pel.firstChild); countEl.hidden = true; };
    var showPanel = function (src, en, bnText) {
      if (!src) { panel.classList.remove("on"); return; }
      if (panelImg.getAttribute("src") !== src) panelImg.src = src;
      panelCap.textContent = ""; panelCap.appendChild(both("span", null, en, bnText));
      panel.classList.add("on");
    };
    // pellets as they show on a film: small, hard-edged, very bright
    var addPellets = function (n) {
      var rr = seeded(5);
      countEl.hidden = false;
      for (var i = 0; i < n; i++) (function (i) {
        var y = 30 + rr() * 360, half = y < 290 ? 100 * Math.sqrt(Math.max(0, 1 - Math.pow((y - 150) / 145, 2))) : 52;
        var x = 536 + (rr() * 2 - 1) * half;
        timers.push(setTimeout(function () {
          var c = svg("circle", { cx: x, cy: y, r: 6.5, class: "x-pellet", filter: "url(#xglow)" }, pel);
          if (!calm && c.animate) c.animate([{ opacity: 0, transform: "scale(2.4)" }, { opacity: 1, transform: "scale(1)" }], { duration: 300, easing: "ease-out" });
          countEl.textContent = ""; countEl.appendChild(both("span", null, (i + 1) + " pellets above the collarbone", (i + 1) + "টি ছররা কণ্ঠার হাড়ের ওপরে"));
        }, calm ? 0 : 220 + i * 65));
      })(i);
    };
    var SIX = [
      { n: ["Pulok", "পুলক"], zones: ["head", "chest", "arms"], say: ["Pellets to the eye, the chest and the hand.", "চোখ, বুক আর হাতে ছররা।"] },
      { n: ["Safwan", "সাফওয়ান"], zones: ["head", "arms", "chest", "thighs"], say: ["Most pellets on his right side: hand, body and leg; one in the left eye. He estimates 72–80% landed in his upper body.", "বেশির ভাগ ছররা ডান পাশে: হাত, শরীর আর পা; একটি বাম চোখে। তাঁর হিসাবে ৭২–৮০ শতাংশ লেগেছে শরীরের ওপরের অংশে।"] },
      { n: ["Jashim", "জসিম"], zones: ["head", "neck", "chest", "arms"], say: ["86 pellets. “There were no bullets below my thigh. Everything was above.”", "৮৬টি ছররা। “উরু বা থাই বা রান এর নিচে কোনো গুলি নাই, সব উপরে।”"] },
      { n: ["Aman", "আমান"], zones: ["head", "chest"], say: ["Shot first from behind, then in the face from close range.", "প্রথমে পেছন থেকে, তারপর কাছ থেকে মুখে।"] },
      { n: ["Ripa", "রিপা"], zones: ["head"], say: ["Pellets to the eyes while she was dressing a wound.", "ক্ষত বাঁধার সময় চোখে ছররা।"] },
      { n: ["Sabbir", "সাব্বির"], zones: ["head"], say: ["A bullet beside the jaw that forced out his eye. Not a pellet.", "চোয়ালের পাশে একটি বুলেট, চোখ বেরিয়ে আসে। ছররা নয়।"] }
    ];
    var pickBox = document.getElementById("body-pick"), say = document.getElementById("body-say"), chosen = 0;
    var choose = function (i) {
      chosen = i;
      pickBox.querySelectorAll("button").forEach(function (b, k) { b.setAttribute("aria-pressed", String(k === i)); });
      clearPellets(); showPanel(null); lightZones(SIX[i].zones, "hit");
      label.textContent = bn() ? SIX[i].n[1] : SIX[i].n[0];
      say.textContent = ""; say.appendChild(both("span", null, SIX[i].say[0], SIX[i].say[1]));
    };
    SIX.forEach(function (p, i) { var btn = both("button", null, p.n[0], p.n[1]); btn.type = "button"; btn.addEventListener("click", function () { choose(i); }); pickBox.appendChild(btn); });
    var STATES = {
      rules: function () { clearPellets(); showPanel(null); lightZones(["abdomen", "thighs"], "ok"); label.textContent = bn() ? "জাতিসংঘের নির্দেশনা: শুধু তলপেট ও পা" : "UN guidance: lower abdomen and legs only"; },
      past: function () {
        clearPellets(); lightZones([], "");
        showPanel("media/xray-knee.jpg", "A real X-ray: birdshot in a knee, from a close-range shotgun wound. Photo: DiverDave, CC BY-SA 3.0", "একটি আসল এক্স-রে: কাছ থেকে ছোড়া শটগানের ছররা, হাঁটুতে। ছবি: DiverDave, CC BY-SA 3.0");
        label.textContent = bn() ? "আগের অস্থিরতায়: ক্ষত মূলত হাঁটুর নিচে" : "Earlier unrest: wounds mostly below the knee";
      },
      july: function () { clearPellets(); showPanel(null); lightZones(["head", "neck", "chest"], "hit"); addPellets(58); label.textContent = bn() ? "জুলাই ২০২৪: ক্ষত এখানে" : "July 2024: wounds here"; },
      pulok: function () {
        clearPellets(); lightZones([], "");
        showPanel("media/xray-pulok.jpg", "Mohaimin Pulok’s own X-rays, National Institute of Ophthalmology. The small bright specks are pellets; the large white blocks are dental fillings.", "মোহাইমিন পুলকের নিজের এক্স-রে, জাতীয় চক্ষুবিজ্ঞান ইনস্টিটিউট। ছোট উজ্জ্বল বিন্দুগুলো ছররা; বড় সাদা অংশগুলো দাঁতের ফিলিং।");
        label.textContent = bn() ? "পুলকের এক্স-রে" : "Pulok’s X-ray";
      },
      six: function () { choose(chosen); }
    };
    document.querySelectorAll("[data-body]").forEach(function (step) {
      onView(step, function () {
        document.querySelectorAll("[data-body]").forEach(function (s) { s.classList.toggle("on", s === step); });
        STATES[step.dataset.body]();
      }, "-45% 0px -45% 0px");
    });
    STATES.rules();
  }

  // ---------------------------------------------------------------- 4. pellets in flight
  var cv = document.getElementById("shot");
  if (cv) {
    if (cv.clientWidth && cv.clientWidth < 600) cv.width = 640;   // phones: gun and head closer (it is marked not to scale), so the picture is taller
    var cx = cv.getContext("2d"), W = cv.width, H = cv.height;
    var dist = document.getElementById("dist"), dout = document.getElementById("dist-out"), read = document.getElementById("shot-read");
    var MUZ = { x: 150, y: 230 }, TX = W - 190, TY = 228, FACE = { rx: 62, ry: 80 }, PXCM = 124 / 15;
    var pellets = [], hits = [], t0 = 0, running = false, rnd = Math.random;
    var gauss = function () { var u = 0, v = 0; while (!u) u = rnd(); while (!v) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    var scene = function (flash) {
      cx.fillStyle = "#070404"; cx.fillRect(0, 0, W, H);
      var g = cx.createRadialGradient(TX, TY, 10, TX, TY, 420); g.addColorStop(0, "rgba(90,40,40,.18)"); g.addColorStop(1, "rgba(0,0,0,0)");
      cx.fillStyle = g; cx.fillRect(0, 0, W, H);
      cx.strokeStyle = "rgba(255,255,255,.08)"; cx.setLineDash([6, 10]); cx.beginPath(); cx.moveTo(MUZ.x, 400); cx.lineTo(TX, 400); cx.stroke(); cx.setLineDash([]);
      cx.fillStyle = "rgba(243,238,226,.6)"; cx.font = "600 18px 'Bricolage Grotesque', sans-serif"; cx.textAlign = "center";
      cx.fillText(dist.value + (bn() ? " মিটার · মাপমতো নয়" : " metres · not to scale"), (MUZ.x + TX) / 2, 432);
      cx.fillStyle = "#3b3330";
      cx.beginPath(); cx.moveTo(20, 222); cx.lineTo(150, 222); cx.lineTo(150, 238); cx.lineTo(70, 240); cx.lineTo(54, 262); cx.lineTo(20, 270); cx.closePath(); cx.fill();
      cx.fillStyle = "#4a403b"; cx.fillRect(60, 238, 60, 8);
      var hg = cx.createRadialGradient(TX - 18, TY - 26, 8, TX, TY, 110); hg.addColorStop(0, "#3a2c2a"); hg.addColorStop(1, "#1a1212");
      cx.fillStyle = hg; cx.beginPath(); cx.ellipse(TX, TY, FACE.rx, FACE.ry, 0, 0, Math.PI * 2); cx.fill();
      cx.beginPath(); cx.moveTo(TX - 150, H); cx.quadraticCurveTo(TX - 140, TY + 110, TX, TY + 95); cx.quadraticCurveTo(TX + 140, TY + 110, TX + 150, H); cx.fill();
      cx.fillStyle = "#0b0606"; cx.beginPath(); cx.ellipse(TX - 22, TY - 12, 9, 6, 0, 0, Math.PI * 2); cx.ellipse(TX + 22, TY - 12, 9, 6, 0, 0, Math.PI * 2); cx.fill();
      hits.forEach(function (h) { cx.fillStyle = h.face ? "rgba(255,80,80,.95)" : "rgba(200,190,180,.35)"; cx.beginPath(); cx.arc(h.x, h.y, h.face ? 2.4 : 1.6, 0, Math.PI * 2); cx.fill(); });
      if (flash > 0) {
        var f = cx.createRadialGradient(MUZ.x + 10, MUZ.y, 2, MUZ.x + 10, MUZ.y, 120 * flash);
        f.addColorStop(0, "rgba(255,250,220," + flash + ")"); f.addColorStop(.25, "rgba(255,180,60," + .8 * flash + ")"); f.addColorStop(1, "rgba(255,80,0,0)");
        cx.fillStyle = f; cx.beginPath(); cx.arc(MUZ.x + 10, MUZ.y, 120 * flash, 0, Math.PI * 2); cx.fill();
      }
    };
    var say2 = function () {
      var d = +dist.value, on = hits.filter(function (h) { return h.face; }).length;
      read.textContent = "";
      read.appendChild(both("span", null,
        "At " + d + " m, " + on + " of 200 pellets landed on the face. " + (d <= 7 ? "Within the range where, David Bruce says, these projectiles can be lethal." : "They can still hurt at this range, though rarely seriously."),
        d + " মিটার দূর থেকে ২০০টির মধ্যে " + on + "টি ছররা লেগেছে মুখে। " + (d <= 7 ? "ডেভিড ব্রুসের মতে, এই দূরত্বে এই গুলি প্রাণঘাতী হতে পারে।" : "এই দূরত্বেও আঘাত লাগতে পারে, যদিও সাধারণত গুরুতর নয়।")));
    };
    var step = function (now) {
      var t = Math.min(1, (now - t0) / (calm ? 1 : 1700));
      scene(Math.max(0, 1 - t * 6));
      cx.lineCap = "round";
      pellets.forEach(function (p) {
        var k = Math.max(0, Math.min(1, (t - p.lag) / (1 - p.lag)));
        var nx = MUZ.x + (TX - MUZ.x) * k, ny = MUZ.y + (p.ty - MUZ.y) * k;
        if (k > 0 && k < 1) { cx.strokeStyle = "rgba(255,225,190,.75)"; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(nx - (TX - MUZ.x) * .035, ny - (p.ty - MUZ.y) * .035); cx.lineTo(nx, ny); cx.stroke(); }
        if (k >= 1 && !p.done) { p.done = true; hits.push({ x: TX + p.tz * .9, y: p.ty, face: Math.pow(p.tz / FACE.rx, 2) + Math.pow((p.ty - TY) / FACE.ry, 2) <= 1 }); }
      });
      if (t < 1) requestAnimationFrame(step); else { running = false; scene(0); say2(); }
    };
    var fire = function () {
      var sd = (3 + 2.5 * +dist.value) * PXCM / 4;
      pellets = []; hits = [];
      for (var i = 0; i < 200; i++) pellets.push({ ty: TY + gauss() * sd, tz: gauss() * sd, lag: rnd() * .06, done: false });
      t0 = performance.now(); running = true; requestAnimationFrame(step);
    };
    dist.addEventListener("input", function () { dout.textContent = dist.value + " m"; if (!running) { hits = []; scene(0); read.textContent = ""; } });
    document.getElementById("fire").addEventListener("click", function () { if (!running) fire(); });
    document.addEventListener("ls-lang", function () { if (!running) { scene(0); if (hits.length) say2(); } });
    var marks = [[4, "3–4.5 m", "Where Aman says the second shot came from: 10–15 feet", "যেখান থেকে আমানের ওপর দ্বিতীয় গুলি এসেছিল বলে তিনি জানান: ১০–১৫ ফুট"], [7, "6–7 m", "Up to here, Bruce says, these projectiles can be lethal", "ব্রুসের মতে, এই পর্যন্ত এই গুলি প্রাণঘাতী হতে পারে"], [40, "40 m", "Up to here they can hurt people, though rarely seriously", "এই পর্যন্ত আঘাত লাগতে পারে, যদিও সাধারণত গুরুতর নয়"]];
    var ml = document.getElementById("range-marks");
    marks.forEach(function (m) {
      var li = el("li"), btn = el("button", null, m[1]); btn.type = "button";
      btn.addEventListener("click", function () { dist.value = m[0]; dist.dispatchEvent(new Event("input")); if (!running) fire(); });
      li.appendChild(btn); li.appendChild(both("span", null, m[2], m[3])); ml.appendChild(li);
    });
    scene(0);
    onView(cv, function (n, o) { o.disconnect(); setTimeout(function () { if (!running) fire(); }, 600); }, "-30% 0px -30% 0px");
  }

  // ---------------------------------------------------------------- 5. eyes that close
  var eyes = document.getElementById("ls-eyes");
  if (eyes) {
    var N = 856, ONE = 382, TWO = 19, kinds = [], r3 = seeded(3);
    for (var k = 0; k < N; k++) kinds.push(k < TWO ? "two" : k < TWO + ONE ? "one" : "open");
    for (k = N - 1; k > 0; k--) { var j = Math.floor(r3() * (k + 1)), tmp = kinds[k]; kinds[k] = kinds[j]; kinds[j] = tmp; }
    var frag = document.createDocumentFragment();
    kinds.forEach(function (kd) { var d = el("i"); d.dataset.k = kd; frag.appendChild(d); });
    eyes.appendChild(frag);
    onView(eyes, function (node, o) {
      o.disconnect();
      var closing = [].slice.call(node.children).filter(function (c) { return c.dataset.k !== "open"; });
      if (calm) { closing.forEach(function (c) { c.className = c.dataset.k; }); return; }
      closing.forEach(function (c, n) { setTimeout(function () { c.className = c.dataset.k; }, 600 + n * 11); });
    }, "-25% 0px -25% 0px");
  }

  // ---------------------------------------------------------------- 6. cartridges pile up
  var CART = '<svg viewBox="0 0 20 44" aria-hidden="true"><rect x="2" y="0" width="16" height="33" rx="2" fill="#c2262d"/><rect x="2" y="3" width="16" height="2" fill="#8f1a20"/><rect x="1" y="33" width="18" height="11" rx="1.5" fill="#c9a24a"/><rect x="1" y="35" width="18" height="1.5" fill="#a68232"/></svg>';
  document.querySelectorAll(".ls-pile").forEach(function (pile) {
    var heap = pile.querySelector(".ls-pile-heap"), n = +pile.dataset.n, r = seeded(n);
    for (var i = 0; i < n; i++) { var c = el("span", "cart"); c.innerHTML = CART; c.style.setProperty("--r", ((r() * 2 - 1) * 9).toFixed(1) + "deg"); c.style.setProperty("--d", (i * (calm ? 0 : 45)) + "ms"); heap.appendChild(c); }
  });
  var piles = document.getElementById("ls-piles");
  if (piles) onView(piles, function (n, o) { o.disconnect(); n.classList.add("dropped"); }, "-25% 0px -25% 0px");
  var BUY = [
    ["Kinetic impact projectiles (pellet and rubber cartridges)", "কাইনেটিক ইমপ্যাক্ট প্রজেক্টাইল (ছররা ও রাবারের কার্তুজ)", 3975000, 485000, true],
    ["Live ammunition", "তাজা গুলি", 5532610, 3622500],
    ["Chemical irritants (tear-gas grenades)", "রাসায়নিক উত্তেজক (কাঁদানে গ্যাসের গ্রেনেড)", 1089100, 121335],
    ["Stun grenades", "স্টান গ্রেনেড", 64300, 60000],
    ["Firearms and launchers", "আগ্নেয়াস্ত্র ও লঞ্চার", 37130, 30997],
    ["Rubber bursting grenades", "রাবার বার্স্টিং গ্রেনেড", 0, 15000],
    ["Water cannon", "জলকামান", 3, 0]
  ];
  var bars = document.getElementById("ls-bars");
  if (bars) {
    BUY.forEach(function (row) {
      var max = Math.max(row[2], row[3]) || 1, box = el("div", "ls-bar-row" + (row[4] ? " key" : ""));
      box.appendChild(both("p", "ls-bar-name", row[0], row[1]));
      [["before", row[2]], ["after", row[3]]].forEach(function (b2) {
        var line = el("div", "ls-bar " + b2[0]), fill = el("span", "ls-bar-fill");
        fill.style.setProperty("--w", (b2[1] / max * 100) + "%");
        line.appendChild(fill); line.appendChild(el("span", "ls-bar-n", b2[1].toLocaleString("en-US")));
        box.appendChild(line);
      });
      bars.appendChild(box);
    });
    var det = bars.closest("details");
    det.addEventListener("toggle", function () { if (det.open) setTimeout(function () { bars.classList.add("grown"); }, 50); });
  }

  // ---------------------------------------------------------------- 7. the satellite flyover
  var PLACES = [  // approximate
    { at: [23.7537, 90.4183], z: 17, name: ["Abul Hotel, Rampura", "আবুল হোটেল, রামপুরা"], who: ["Khan Jashim, 18 July. Standing ahead of the crowd when two officers stepped forward and fired.", "খান জসিম, ১৮ জুলাই। ভিড়ের সামনে দাঁড়িয়ে ছিলেন, দুজন পুলিশ সদস্য এগিয়ে এসে গুলি করেন।"], kind: "shot" },
    { at: [23.7625, 90.4068], z: 17, name: ["Near Hatirjheel", "হাতিরঝিলের কাছে"], who: ["Ripa Gomez, dressing a wound by a vegetable stall in the market.", "রিপা গোমেজ, বাজারে সবজির দোকানের পাশে ক্ষত বাঁধছিলেন।"], kind: "shot" },
    { at: [23.7510, 90.3932], z: 17, name: ["Karwan Bazar", "কারওয়ান বাজার"], who: ["Sabbir. A bullet, not pellets.", "সাব্বির। ছররা নয়, বুলেট।"], kind: "shot" },
    { at: [23.7259, 90.3977], z: 17, name: ["Dhaka Medical College Hospital", "ঢাকা মেডিকেল কলেজ হাসপাতাল"], who: ["Jashim felt he had come to “a hospital in Gaza”. A patient every minute.", "জসিমের মনে হয়েছিল “গাজার কোনো হাসপাতাল”। প্রতি মিনিটে একজন রোগী।"], kind: "care" },
    { at: [23.7748, 90.3717], z: 17, name: ["National Institute of Ophthalmology, Agargaon", "জাতীয় চক্ষুবিজ্ঞান ইনস্টিটিউট, আগারগাঁও"], who: ["856 patients with pellet wounds. Safwan’s mother searched for him here.", "ছররায় আহত ৮৫৬ জন রোগী। সাফওয়ানের মা তাঁকে এখানে খুঁজেছেন।"], kind: "care" },
    { at: [22.3569, 91.7832], z: 12, name: ["Chattogram, 250 km away", "চট্টগ্রাম, ২৫০ কিলোমিটার দূরে"], who: ["Amanullah Aman, 5 August. Hasina had already fled.", "আমানউল্লাহ আমান, ৫ আগস্ট। হাসিনা তখন পালিয়ে গেছেন।"], kind: "shot" }
  ];
  var mapEl = document.getElementById("ls-map"), stepsEl = document.getElementById("ls-fly-steps");
  if (mapEl && stepsEl) {
    PLACES.forEach(function (p, i) {
      var s = el("div", "ls-fly-step"); s.dataset.i = i;
      var c = el("div", "ls-fly-card k-" + p.kind);
      c.appendChild(both("h3", null, p.name[0], p.name[1])); c.appendChild(both("p", null, p.who[0], p.who[1]));
      s.appendChild(c); stepsEl.appendChild(s);
    });
    var map = null, marks2 = [];
    onView(mapEl, function (n, o) {
      o.disconnect();
      if (!window.L) { n.appendChild(both("p", "ls-map-fail", "The map could not load. The places are listed alongside.", "মানচিত্র লোড হয়নি। জায়গাগুলোর তালিকা পাশে আছে।")); return; }
      map = L.map(n, { scrollWheelZoom: false, zoomControl: true, attributionControl: true, zoomSnap: .25 }).setView([23.752, 90.398], 13);
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 18, attribution: "Imagery © Esri, Maxar, Earthstar Geographics" }).addTo(map);
      PLACES.forEach(function (p) {
        marks2.push(L.circleMarker(p.at, { radius: 11, weight: 3, color: p.kind === "shot" ? "#ff3b44" : "#ffffff", fillColor: p.kind === "shot" ? "#e0262f" : "#0b0606", fillOpacity: .85 }).addTo(map));
      });
    }, "300px 0px");
    stepsEl.querySelectorAll(".ls-fly-step").forEach(function (s) {
      onView(s, function () {
        stepsEl.querySelectorAll(".ls-fly-step").forEach(function (x) { x.classList.toggle("on", x === s); });
        if (!map) return;
        var p = PLACES[+s.dataset.i];
        if (calm) map.setView(p.at, p.z); else map.flyTo(p.at, p.z, { duration: 2.2 });
        marks2.forEach(function (m, k) { m.setStyle({ radius: k === +s.dataset.i ? 16 : 9 }); });
      }, "-45% 0px -45% 0px");
    });
  }
  var WORLD = [
    ["1999–2022", "Colombia", "কলম্বিয়া", "Anti-riot police caused 169 recorded eye injuries.", "দাঙ্গা দমন পুলিশের হাতে চোখে আঘাতের ১৬৯টি নথিভুক্ত ঘটনা।"],
    ["2010", "Kashmir", "কাশ্মীর", "Indian security forces bring in pellet shotguns for crowd control.", "ভিড় নিয়ন্ত্রণে ভারতীয় নিরাপত্তা বাহিনী ছররা শটগান চালু করে।"],
    ["2011", "Bahrain", "বাহরাইন", "Fadhil al-Matrook, unarmed, is killed by birdshot at close range. The officers are acquitted.", "নিরস্ত্র ফাদিল আল-মাতরুক কাছ থেকে ছোড়া ছররায় নিহত হন। কর্মকর্তারা খালাস পান।"],
    ["2016", "Kashmir", "কাশ্মীর", "More than 6,000 people are reportedly injured by pellets in a single year.", "এক বছরেই ছররায় ৬,০০০-এর বেশি মানুষ আহত হন বলে জানা যায়।"],
    ["2018", "Bangladesh", "বাংলাদেশ", "Pellet shotguns are first used on student protesters, as “minimum force”. Some lose eyes.", "শিক্ষার্থী আন্দোলনকারীদের ওপর প্রথম ছররা শটগান ব্যবহার, “ন্যূনতম শক্তি” হিসেবে। কেউ কেউ চোখ হারান।"],
    ["2019–20", "Chile", "চিলি", "Riot police fire “rubber pellets” into crowds: more than 400 documented eye injuries.", "দাঙ্গা পুলিশ ভিড়ে “রাবার পেলেট” ছোড়ে: চোখে আঘাতের ৪০০-এর বেশি নথিভুক্ত ঘটনা।"],
    ["2022", "Iran", "ইরান", "Pellet and rubber-round injuries are documented during “Woman, Life, Freedom”.", "“নারী, জীবন, স্বাধীনতা” আন্দোলনে ছররা ও রাবার বুলেটের আঘাত নথিভুক্ত হয়।"],
    ["2022–23", "Peru", "পেরু", "Police use lead pellets their own rules ban. At least three deaths.", "নিজেদের নিয়মে নিষিদ্ধ সিসার ছররা ব্যবহার করে পুলিশ। অন্তত তিনজনের মৃত্যু।"],
    ["Oct 2023", "Bangladesh", "বাংলাদেশ", "Police reportedly fire pellets from rooftops at a BNP rally, hitting heads and faces.", "বিএনপির সমাবেশে ছাদ থেকে ছররা ছোড়ে পুলিশ, মাথা ও মুখে লাগে।"],
    ["Jul–Aug 2024", "Bangladesh", "বাংলাদেশ", "More than 1,300 eye injuries in Dhaka’s hospitals.", "ঢাকার হাসপাতালগুলোতে চোখে আঘাতের ১,৩০০-এর বেশি ঘটনা।"]
  ];
  var world = document.getElementById("ls-world");
  if (world) WORLD.forEach(function (w) {
    var li = el("li", w[1] === "Bangladesh" ? "bd" : "");
    li.appendChild(el("span", "ls-w-year", w[0])); li.appendChild(both("b", null, w[1], w[2])); li.appendChild(both("p", null, w[3], w[4]));
    world.appendChild(li);
  });

  // ---------------------------------------------------------------- 8. before and after
  var LIVES = [
    ["Amanullah Aman", "আমানউল্লাহ আমান", "aman", ["Worked at a hotel in the hills. The youngest child, and the one his father relied on.", "পাহাড়ের একটি হোটেলে কাজ করতেন। সবচেয়ে ছোট সন্তান, বাবার ভরসা।"], ["No sight after nine operations. His income stopped. “Give me a respectable life.”", "নয়বার অস্ত্রোপচারের পরও দৃষ্টি নেই। আয় বন্ধ। “আমাকে হচ্ছে সম্মানজনক একটা জীবন দেন।”"]],
    ["Ripa Gomez", "রিপা গোমেজ", "ripa-gomez", ["A nurse. She had pledged her eye to a child.", "একজন নার্স। চোখটা কথা দিয়েছিলেন একটি শিশুকে।"], ["Double vision. Hospitals won’t hire her. She runs a small coaching centre for nurses.", "ডাবল ভিশন। হাসপাতাল তাঁকে চাকরি দেয় না। নার্সদের জন্য ছোট একটি কোচিং সেন্টার চালান।"]],
    ["Khan Jashim", "খান জসিম", null, ["Preparing for the BCS written exam, the hope of his family.", "বিসিএস লিখিত পরীক্ষার প্রস্তুতি নিচ্ছিলেন, পরিবারের আশা।"], ["74 pellets still inside him. He could not sit the exam. Students elected him to DUCSU.", "শরীরে এখনো ৭৪টি ছররা। পরীক্ষা দিতে পারেননি। শিক্ষার্থীরা তাঁকে ডাকসুতে নির্বাচিত করেন।"]],
    ["Sabbir", "সাব্বির", "sabbir", ["A job and a family. He rode a motorcycle and read detective stories.", "চাকরি আর পরিবার। মোটরসাইকেল চালাতেন, গোয়েন্দা গল্প পড়তেন।"], ["Learning Braille. He has never seen his youngest child’s face.", "ব্রেইল শিখছেন। ছোট সন্তানের মুখ কখনো দেখেননি।"]],
    ["Mohaimin Pulok", "মোহাইমিন পুলক", "pulok", ["Went out with his phone to document the protest.", "ফোন হাতে আন্দোলনের ভিডিও করতে বেরিয়েছিলেন।"], ["Sees only a little light at the edge of the eye. He now campaigns against pellet guns.", "চোখের কিনারায় শুধু একটু আলো দেখেন। এখন ছররা বন্দুকের বিরুদ্ধে কাজ করেন।"]],
    ["Safwan", "সাফওয়ান", null, ["A university student.", "বিশ্ববিদ্যালয়ের শিক্ষার্থী।"], ["His sight has largely come back. “I have felt betrayed in many ways, by many kinds of people, by many kinds of leaders.”", "দৃষ্টি অনেকটাই ফিরেছে। “অনেক দিক দিয়েই বিট্রেড ফিল করছি অনেক ধরনের মানুষ থেকে অনেক ধরনের লিডার থেকে।”"]]
  ];
  var lives = document.getElementById("ls-lives");
  if (lives) {
    LIVES.forEach(function (p) {
      var li = el("li", "ls-life"), pic = el("span", "ls-life-pic");
      if (p[2]) { var img = el("img"); img.src = "media/" + p[2] + ".jpg"; img.alt = ""; img.loading = "lazy"; pic.appendChild(img); }
      li.appendChild(pic);
      var tx = el("div"); tx.appendChild(both("b", null, p[0], p[1]));
      var b1 = both("p", "when-before", p[3][0], p[3][1]), a1 = both("p", "when-after", p[4][0], p[4][1]);
      tx.appendChild(b1); tx.appendChild(a1); li.appendChild(tx); lives.appendChild(li);
    });
    var sec = document.getElementById("ls-after");
    var set = function (w) { sec.dataset.when = w; sec.querySelectorAll("[data-when]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.when === w)); }); };
    sec.querySelectorAll("[data-when]").forEach(function (b) { b.addEventListener("click", function () { set(b.dataset.when); }); });
    set("before");
    onView(lives, function (n, o) { o.disconnect(); setTimeout(function () { set("after"); }, calm ? 0 : 1800); }, "-35% 0px -35% 0px");
  }
})();
