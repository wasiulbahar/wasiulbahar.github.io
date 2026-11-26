/* Three things to do with your own hands: try to take Jashim's pellets out, read on with one eye, and read one word in Braille. */
(function () {
  "use strict";
  var LS = window.LS, el = LS.el, both = LS.both;
  var NS = "http://www.w3.org/2000/svg";
  var svg = function (tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  var say = function (node, en, bn) { node.textContent = ""; node.appendChild(both("span", null, en, bn)); };
  var buzz = function (p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {} };

  // ---------------------------------------------------------------- Jashim: 86 pellets, 12 come out
  var host = document.getElementById("jx-svg");
  if (host) {
    var W = 1091, H = 1400, TOTAL = 86, CAN = 12, removed = 0, refused = 0;
    host.setAttribute("viewBox", "0 0 " + W + " " + H);
    var img = svg("image", { href: "media/xray-body.jpg", x: 0, y: 0, width: W, height: H, class: "xr-img" }, host);
    img.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "media/xray-body.jpg");
    // where he says they hit (the same zones as the X-ray above): head, neck, chest, arms; none below the thigh
    var zones = [
      [30, function (x, y) { return Math.pow((x - 536) / 105, 2) + Math.pow((y - 150) / 135, 2) <= 1; }, [430, 640, 20, 290]],
      [8, function () { return true; }, [500, 580, 290, 370]],
      [30, function (x, y) { return y > 395 + Math.abs(x - 540) * .12; }, [320, 760, 390, 740]],
      [18, function () { return true; }, [195, 290, 420, 900]]
    ];
    var seed = 86, rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    var pts = [];
    zones.forEach(function (z, zi) {
      for (var n = 0, guard = 0; n < z[0] && guard < 5000; guard++) {
        var b = z[2], x = b[0] + rnd() * (b[1] - b[0]), y = b[2] + rnd() * (b[3] - b[2]);
        if (zi === 3 && rnd() < .5) x = W - x;   // both arms
        if (z[1](x, y) && pts.every(function (p) { return Math.hypot(p.x - x, p.y - y) > 16; })) { pts.push({ x: x, y: y }); n++; }
      }
    });
    var g = svg("g", { class: "jx-pellets" }, host);
    pts.forEach(function (p) { p.node = svg("circle", { cx: p.x, cy: p.y, r: 7, class: "jx-p" }, g); });
    var count = document.getElementById("jx-count"), msg = document.getElementById("jx-say");
    var show = function () { say(count, "Removed: " + removed + " · Still inside: " + (TOTAL - removed), "বের করা হয়েছে: " + removed + " · এখনো ভেতরে: " + (TOTAL - removed)); };
    show();
    // a tap takes the nearest pellet, so small fingers on small screens still find one
    host.addEventListener("click", function (ev) {
      var r = host.getBoundingClientRect(), sx = W / r.width, x = (ev.clientX - r.left) * sx, y = (ev.clientY - r.top) * (H / r.height);
      var best = null, bd = 90;
      pts.forEach(function (p) { if (!p.out) { var d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = p; } } });
      if (!best) return;
      if (removed < CAN) {
        best.out = true; removed++; best.node.setAttribute("class", "jx-p out"); buzz(15); show();
        if (removed === CAN) say(msg, "That is how many the doctors could remove: 12.", "চিকিৎসকেরা এতগুলোই বের করতে পেরেছিলেন: ১২টি।");
      } else {
        refused++; buzz([40, 60, 40]);
        best.node.setAttribute("class", "jx-p stuck"); setTimeout(function () { best.node.setAttribute("class", "jx-p"); }, 700);
        say(msg, "This one stays. Doctors removed 12; the other 74 are still inside him today.", "এটি থেকে যায়। চিকিৎসকেরা ১২টি বের করেছেন; বাকি ৭৪টি আজও তাঁর শরীরে।");
      }
    });
  }

  // ---------------------------------------------------------------- read on with one eye
  var root = document.documentElement, btn = document.getElementById("oneeye-btn"), pill = document.getElementById("oneeye-pill");
  if (btn && pill) {
    var set = function (on) {
      root.classList.toggle("one-eye", on);
      btn.setAttribute("aria-pressed", String(on)); pill.hidden = !on;
      btn.firstChild.textContent = on ? "Back to both eyes" : "Read on with one eye";
    };
    btn.addEventListener("click", function () { set(!root.classList.contains("one-eye")); });
    pill.addEventListener("click", function () { set(false); });
  }

  // ---------------------------------------------------------------- Sabbir: one word in Braille
  var word = document.getElementById("br-word"), key = document.getElementById("br-key");
  if (word && key) {
    // dots: 1 2 3 down the left, 4 5 6 down the right
    var BR = { a: "1", b: "12", c: "14", d: "145", e: "15", f: "124", g: "1245", h: "125", i: "24", j: "245", k: "13", l: "123", m: "134",
      n: "1345", o: "135", p: "1234", q: "12345", r: "1235", s: "234", t: "2345", u: "136", v: "1236", w: "2456", x: "1346", y: "13456", z: "1356" };
    var WORD = "baby", got = [], active = 0, sayBr = document.getElementById("br-say");
    var cell = function (dots, cls) {
      var c = el("span", "br-cell" + (cls ? " " + cls : ""));
      [1, 4, 2, 5, 3, 6].forEach(function (d) { c.appendChild(el("i", dots.indexOf(String(d)) >= 0 ? "on" : "")); });
      return c;
    };
    var cells = WORD.split("").map(function (ch, i) {
      var b = el("button", "br-slot"); b.type = "button";
      b.appendChild(cell(BR[ch], "big")); b.appendChild(el("span", "br-guess", ""));
      b.setAttribute("aria-label", "Letter " + (i + 1) + ": dots " + BR[ch].split("").join(", "));
      b.addEventListener("click", function () { active = i; draw(); buzz(BR[ch].split("").map(function () { return 30; }).reduce(function (a, v) { return a.concat([v, 70]); }, [])); });
      word.appendChild(b); return b;
    });
    var done = function () {
      word.classList.add("read");
      say(sayBr, "“baby.” His youngest child is six months old. He does not know what the baby looks like.", "“বাচ্চা।” ছোট সন্তানের বয়স ছয় মাস। বাচ্চাটা দেখতে কেমন, তিনি জানেন না।");
    };
    var draw = function () {
      cells.forEach(function (b, i) { b.classList.toggle("on", i === active && !word.classList.contains("read")); b.classList.toggle("ok", got[i] === WORD[i]); b.lastChild.textContent = got[i] || ""; });
    };
    Object.keys(BR).forEach(function (ch) {
      var k = el("button", "br-k"); k.type = "button"; k.appendChild(cell(BR[ch])); k.appendChild(el("b", null, ch));
      k.addEventListener("click", function () {
        if (word.classList.contains("read")) return;
        got[active] = ch;
        if (ch === WORD[active]) { buzz(20); for (var i = 0; i < WORD.length; i++) if (got[i] !== WORD[i]) { active = i; break; } sayBr.textContent = ""; }
        else say(sayBr, "Not that one. Count the raised dots, and where they sit.", "এটা নয়। উঁচু বিন্দুগুলো গুনুন, কোথায় আছে দেখুন।");
        draw();
        if (WORD.split("").every(function (c, i) { return got[i] === c; })) done();
      });
      key.appendChild(k);
    });
    document.getElementById("br-show").addEventListener("click", function () { got = WORD.split(""); draw(); done(); });
    draw();
  }

  // ---------------------------------------------------------------- inside the chapters: things tied to one person and one step
  var hooks = [];
  LS.onStep = function (p, ch, k, was) { hooks.forEach(function (h) { h(p, ch, k, was); }); };
  var listening = function () { return LS.listening && LS.listening(); };

  // Pulok: his phone was recording. 6:54 pm, the evening prayer; then the picture breaks and stops.
  var pulCh = document.getElementById("ch-pulok");
  if (pulCh) {
    var rec = el("div", "rec"); rec.setAttribute("aria-hidden", "true");
    rec.appendChild(el("span", "rec-dot")); rec.appendChild(el("b", null, "REC"));
    var recT = el("span", "rec-t", "00:00"); rec.appendChild(recT); rec.appendChild(el("span", "rec-clock", "18 JUL · 18:54"));
    ["tl", "tr", "bl", "br"].forEach(function (c) { rec.appendChild(el("i", "rec-c " + c)); });
    pulCh.querySelector(".ch-stage").appendChild(rec);
    var secs = 0, tick = null;
    var stopTick = function () { clearInterval(tick); tick = null; };
    hooks.push(function (p, ch, k) {
      if (p.id !== "pulok") return;
      if (k === "intro") { stopTick(); secs = 0; recT.textContent = "00:00"; ch.classList.remove("filming", "cut"); }
      if (k === "where") {
        ch.classList.remove("cut"); ch.classList.add("filming");
        if (!tick) tick = setInterval(function () { secs++; recT.textContent = ("0" + Math.floor(secs / 60)).slice(-2) + ":" + ("0" + secs % 60).slice(-2); }, 1000);
        if (LS.music && LS.music.play) LS.music.play("azan", .32);
      }
      if (k === "moment" || k === "quote" || k === "after" || k === "now") { stopTick(); if (ch.classList.contains("filming")) { ch.classList.add("cut"); ch.classList.remove("filming"); } }
    });
  }

  // days, counted on the day you read this
  var DAYS = {
    pulok: [[2024, 6, 18], "days since the evening Pulok was filming.", "দিন পেরিয়েছে, যে সন্ধ্যায় পুলক ভিডিও করছিলেন।"],
    jashim: [[2024, 6, 18], "days Jashim has carried 74 pellets.", "দিন ধরে জসিম ৭৪টি ছররা বয়ে বেড়াচ্ছেন।"],
    aman: [[2024, 7, 5], "days since Aman last saw his parents’ faces.", "দিন আমান বাবা-মায়ের মুখ দেখেননি।"]
  };
  Object.keys(DAYS).forEach(function (id) {
    var card = document.querySelector("#ch-" + id + " .ch-now");
    if (!card) return;
    var d = DAYS[id][0], t = new Date(), n = Math.round((Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()) - Date.UTC(d[0], d[1], d[2])) / 864e5);   // by the reader's own calendar
    var line = el("p", "ch-days"); line.appendChild(el("b", null, n.toLocaleString("en-US"))); line.appendChild(document.createTextNode(" "));
    line.appendChild(both("span", null, DAYS[id][1], DAYS[id][2]));
    var next = card.querySelector(".ch-next"); card.insertBefore(line, next);
  });

  // Aman: "to get a little more time". The screen stays open only while you hold on.
  var amanAfter = document.querySelector('#ch-aman .ch-step[data-k="after"] .ch-card');
  if (amanAfter) {
    var amanCh = document.getElementById("ch-aman"), hv = el("div", "hold-veil"); hv.setAttribute("aria-hidden", "true");
    amanCh.querySelector(".ch-stage").appendChild(hv);
    var hb = el("button", "ls-btn hold-btn"); hb.type = "button"; hb.appendChild(both("span", null, "Press and hold", "চেপে ধরে রাখুন"));
    var hs = el("p", "hold-say"); hs.setAttribute("aria-live", "polite");
    amanAfter.appendChild(hb); amanAfter.appendChild(hs);
    var beat = null, dropT = null;
    var start = function (e) {
      if (e) e.preventDefault();
      clearTimeout(dropT); amanCh.classList.remove("dropped"); amanCh.classList.add("holding");
      say(hs, "Breathe as little as you can.", "যত কম পারেন শ্বাস নিন।");
      buzz([50, 120, 50]); clearInterval(beat); beat = setInterval(function () { buzz([50, 120, 50]); }, 1300);
    };
    var stop = function () {
      if (!amanCh.classList.contains("holding")) return;
      clearInterval(beat); amanCh.classList.remove("holding"); amanCh.classList.add("dropped");
      say(hs, "It closes the moment you let go.", "ছেড়ে দিলেই সব বন্ধ হয়ে যায়।");
      dropT = setTimeout(function () { amanCh.classList.remove("dropped"); }, 2200);
    };
    hb.addEventListener("pointerdown", start); hb.addEventListener("pointerup", stop); hb.addEventListener("pointerleave", stop); hb.addEventListener("pointercancel", stop);
    hb.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    hb.addEventListener("keydown", function (e) { if ((e.key === " " || e.key === "Enter") && !e.repeat) start(e); });
    hb.addEventListener("keyup", function (e) { if (e.key === " " || e.key === "Enter") stop(); });
    hooks.push(function (p, ch, k) { if (p.id === "aman" && k !== "after") stop(); });
  }

  // Ripa: she pledged her eye to a child. Then it could no longer be given.
  var ripaNow = document.querySelector("#ch-ripa .ch-now");
  if (ripaNow) {
    var card = el("div", "donor"); card.setAttribute("role", "img");
    card.setAttribute("aria-label", "An organ donor pledge card for Ripa Gomez: eyes, promised to a child. Struck out: can no longer be given.");
    card.appendChild(el("p", "donor-h", "Organ donor pledge"));
    card.appendChild(el("p", "donor-name", "Ripa Gomez"));
    var row = el("p", "donor-row"); row.appendChild(el("span", "donor-tick", "✓")); row.appendChild(el("span", null, "Eyes — promised to a child")); card.appendChild(row);
    card.appendChild(el("p", "donor-stamp", "Can no longer be given"));
    var nn = el("p", "donor-note"); nn.appendChild(both("span", null, "An illustration, not her card.", "একটি চিত্র, তাঁর আসল কার্ড নয়।"));
    var nx = ripaNow.querySelector(".ch-next"); ripaNow.insertBefore(card, nx); ripaNow.insertBefore(nn, nx);
    hooks.push(function (p, ch, k) {
      if (p.id !== "ripa") return;
      if (k === "now") setTimeout(function () { card.classList.add("void"); }, 900); else card.classList.remove("void");
    });
  }

  // a heartbeat you can feel during each "after", on phones that allow it, when the reader chose sound
  var hbTimer = null;
  hooks.push(function (p, ch, k) {
    clearInterval(hbTimer); hbTimer = null;
    if (k === "after" && listening()) {
      buzz([60, 140, 60]);
      hbTimer = setInterval(function () {   // stops as soon as this chapter leaves the middle of the screen
        var r = ch.getBoundingClientRect(), mid = innerHeight / 2;
        if (ch.dataset.state !== "after" || r.top > mid || r.bottom < mid) { clearInterval(hbTimer); hbTimer = null; return; }
        buzz([60, 140, 60]);
      }, 1100);
    }
  });
})();
