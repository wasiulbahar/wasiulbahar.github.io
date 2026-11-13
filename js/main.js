(function () {
  var root = document.documentElement;
  var still = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Camera cursor: each mouse click closes the shutter for a moment and sends out a flash ring.
  if (matchMedia("(pointer: fine)").matches) {
    var snapTimer = null;
    addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || (e.target.closest && e.target.closest("input:not([type=range]), textarea"))) return;
      root.classList.add("snap");
      clearTimeout(snapTimer);
      snapTimer = setTimeout(function () { root.classList.remove("snap"); }, 160);
      if (still) return;
      var ring = document.createElement("span");
      ring.className = "flash-ring";
      ring.style.left = e.clientX + "px";
      ring.style.top = e.clientY + "px";
      document.body.appendChild(ring);
      setTimeout(function () { ring.remove(); }, 500);
    });
  }

  // Analytics (PostHog, see ph.js): which sections people reach, and a few named clicks.
  var track = function (name, props) { if (window.posthog && posthog.capture) posthog.capture(name, props || {}); };
  if ("IntersectionObserver" in window) {
    var seen = {};
    var sectionSpy = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        var id = e.target.id;
        if (!e.isIntersecting || seen[id]) return;
        seen[id] = true;
        var h = e.target.querySelector("h1, h2");
        track("section_viewed", { section: id, title: h ? h.textContent.trim() : id, page: location.pathname });
      });
    }, { threshold: 0.35 });
    document.querySelectorAll("main section[id], section.contact").forEach(function (s) { sectionSpy.observe(s); });
  }
  document.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest("#dyk-next, #otd-next, .search-btn, .arch, a[href^='mailto:'], .jt");
    if (!el) return;
    var name = el.id === "dyk-next" ? "fact_next" : el.id === "otd-next" ? "photo_next" : el.classList.contains("search-btn") ? "search_open"
      : el.classList.contains("arch") ? "press_archive_open" : el.classList.contains("jt") ? "gallery_photo_open" : "email_click";
    track(name, { page: location.pathname });
  });

  // Theme toggle: remembered per visitor, falls back to the OS setting.
  document.querySelectorAll(".theme-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var dark = root.getAttribute("data-theme")
        ? root.getAttribute("data-theme") === "dark"
        : matchMedia("(prefers-color-scheme: dark)").matches;
      var next = dark ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  });

  // Mobile menu
  var menuBtn = document.querySelector(".menu-btn");
  var links = document.querySelector(".nav-links");
  if (menuBtn && links) {
    menuBtn.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open);
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { links.classList.remove("open"); menuBtn.setAttribute("aria-expanded", false); });
    });
  }

  // Entrances: staggered within each section; anything scrolled past shows at once.
  var els = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  document.querySelectorAll("section, .hero").forEach(function (s) {
    s.querySelectorAll(".reveal").forEach(function (el, i) { el.style.setProperty("--i", Math.min(i, 6)); });
  });
  function onSight(el, fn, margin) {
    if (!("IntersectionObserver" in window)) return fn();
    var io = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { io.disconnect(); fn(); }
    }, { rootMargin: margin || "0px 0px -6% 0px" });
    io.observe(el);
  }
  els.forEach(function (el) { onSight(el, function () { el.classList.add("in"); }); });
  function catchUp() {
    els.forEach(function (el) {
      if (el.classList.contains("in")) return;
      var r = el.getBoundingClientRect();
      if (r.bottom < 0) el.classList.add("in", "now");
      else if (r.top < innerHeight) el.classList.add("in");
    });
  }
  addEventListener("scroll", catchUp, { passive: true });
  addEventListener("load", catchUp);

  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Arriving on a #section link: land on it again once the fonts have settled the layout.
  if (location.hash && document.fonts && !document.querySelector(".gallery")) {
    document.fonts.ready.then(function () {
      var target = document.getElementById(location.hash.slice(1));
      if (target) target.scrollIntoView({ behavior: "instant", block: "start" });
    });
  }

  // The people grid: one figure per 200,000 views, filled in as it scrolls into view, with the count rising alongside.
  document.querySelectorAll("[data-dots]").forEach(function (box) {
    var n = +box.dataset.dots, html = "";
    var fig = box.closest(".dots-card").querySelector(".dots-key svg").outerHTML;
    for (var i = 0; i < n; i++) html += fig;
    box.innerHTML = html;
    var dots = box.children;
    var count = document.querySelector(".count");
    var to = count ? +count.dataset.to : 0;
    if (still) { for (var k = 0; k < n; k++) dots[k].classList.add("on"); return; }
    if (count) count.textContent = "0";
    onSight(box, function () {
      var start = performance.now(), dur = 2200;
      (function frame(now) {
        var p = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - p, 3), lit = Math.round(e * n);
        for (var j = 0; j < lit; j++) dots[j].classList.add("on");
        if (count) count.textContent = Math.round(e * to).toLocaleString("en") + (count.dataset.suffix || "");
        if (p < 1) requestAnimationFrame(frame);
      })(start);
    }, "0px 0px -20% 0px");
  });

  // The CC sticker's hand-drawn "boil": a new noise seed ~8 times a second, like redrawn animation frames.
  var noise = document.getElementById("boil-noise");
  if (noise && !still) {
    var seed = 1, boiling = null;
    var boil = function () { seed = seed % 6 + 1; noise.setAttribute("seed", seed); };
    var watch = function (on) { clearInterval(boiling); boiling = on ? setInterval(boil, 125) : null; };
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { watch(en[0].isIntersecting); }).observe(document.querySelector(".sticker"));
    } else watch(true);
  }

  // Journey: one year at a time. Without script every year stays visible.
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.year-tabs [role="tab"]'));
  function pick(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) tab.focus();
  }
  if (tabs.length) {
    pick(tabs[0]);
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { pick(t); });
      t.addEventListener("keydown", function (e) {
        var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (d) pick(tabs[(i + d + tabs.length) % tabs.length], true);
      });
    });
  }

  // Journey page: one slider drives the dots, the uploads chart and the year's list.
  var range = document.getElementById("jp-range");
  if (range) {
    var bars = Array.prototype.slice.call(document.querySelectorAll(".jp-bar"));
    var setYear = function (y) {
      range.value = y;
      document.getElementById("jp-year").textContent = y;
      document.getElementById("jp-by").textContent = y;
      document.querySelectorAll(".jp-dot").forEach(function (d) {
        d.classList.toggle("past", +d.dataset.y <= y);
        d.classList.toggle("now", +d.dataset.y === y);
      });
      var sum = 0;
      bars.forEach(function (b) { var on = +b.dataset.y <= y; b.classList.toggle("on", on); if (on) sum += +b.dataset.n; });
      document.getElementById("jp-cum").textContent = sum.toLocaleString("en");
      document.querySelectorAll(".jp-y").forEach(function (p) { p.hidden = +p.dataset.y !== y; });
    };
    range.addEventListener("input", function () { setYear(+range.value); });
    document.querySelectorAll(".jp-dot").forEach(function (d) {
      d.addEventListener("click", function () { stop(); setYear(+d.dataset.y); });
    });
    var playBtn = document.getElementById("jp-play"), timer = null;
    var stop = function () { clearInterval(timer); timer = null; playBtn.textContent = "Play"; };
    playBtn.addEventListener("click", function () {
      if (timer) return stop();
      var y = +range.min;
      setYear(y);
      playBtn.textContent = "Pause";
      timer = setInterval(function () { if (++y > +range.max) return stop(); setYear(y); }, still ? 1600 : 1100);
    });
    setYear(+range.value);

    // Show one kind: its lane and its items in each year's list.
    var kinds = document.querySelectorAll(".jp-filters button");
    kinds.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var k = btn.dataset.kind;
        kinds.forEach(function (b) { b.setAttribute("aria-pressed", b === btn); });
        document.querySelectorAll(".jp-lane, .jp-y li").forEach(function (el) {
          el.hidden = k !== "all" && el.dataset.kind !== k;
        });
      });
    });
  }

  // CV page: light up the menu item of the section being read.
  var tocLinks = document.querySelectorAll(".cv-toc a");
  if (tocLinks.length) {
    var blocks = Array.prototype.slice.call(document.querySelectorAll(".cv-block"));
    var spy = function () {
      // the last section whose top has passed a line a third of the way down the screen
      var id = blocks[0].id;
      blocks.forEach(function (b) { if (b.getBoundingClientRect().top < innerHeight / 3) id = b.id; });
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) id = blocks[blocks.length - 1].id;
      tocLinks.forEach(function (a) { a.setAttribute("aria-current", a.getAttribute("href") === "#" + id ? "true" : "false"); });
    };
    addEventListener("scroll", spy, { passive: true });
    addEventListener("resize", spy);
    spy();
  }

  // On this day: a photo from the visitor's own date; if none, one from this month that changes every day;
  // else the nearest date. "Another photo" then walks through this month's photos and on to nearby dates.
  var otd = document.querySelector("[data-otd]");
  if (otd && window.fetch) {
    fetch("data/on-this-day.json").then(function (r) { return r.json(); }).then(function (all) {
      var now = new Date(), asDate = function (k) { return new Date(2024, +k.slice(0, 2) - 1, +k.slice(3)); };
      var pad = function (n) { return ("0" + n).slice(-2); };
      var todayKey = pad(now.getMonth() + 1) + "-" + pad(now.getDate()), month = todayKey.slice(0, 2), t = asDate(todayKey);
      var gap = function (k) { var d = Math.abs(asDate(k) - t) / 864e5; return Math.min(d, 366 - d); }; // dates wrap round the year
      var list = function (k) { return [].concat(all[k]).map(function (e) { return { k: k, e: e }; }); };
      var rotate = function (a, n) { n = n % a.length; return a.slice(n).concat(a.slice(0, n)); };
      var keys = Object.keys(all);
      if (!keys.length) return;
      var head = [], label;
      if (all[todayKey]) { head = list(todayKey); if (!head[0].e.pin) head = rotate(head, now.getFullYear()); label = "On this day"; }
      else {
        keys.filter(function (k) { return k.slice(0, 2) === month; }).sort().forEach(function (k) { head = head.concat(list(k)); });
        if (head.length) { head = rotate(head, now.getDate()); label = "This month in my archive"; }
      }
      var rest = [];
      keys.sort(function (a, b) { return gap(a) - gap(b); }).forEach(function (k) {
        if (k !== todayKey && !(label === "This month in my archive" && k.slice(0, 2) === month)) rest = rest.concat(list(k));
      });
      var order = head.concat(rest);
      var img = otd.querySelector("img"), i = 0;
      var show = function () {
        var k = order[i].k, e = order[i].e, when = new Date(e.date + "T12:00:00");
        otd.querySelector("[data-otd-chip]").textContent = i < head.length ? label : "Around this day";
        otd.querySelector("[data-otd-date]").textContent = when.getDate() + " " + when.toLocaleString("en-GB", { month: "long" }) + " " + when.getFullYear();
        otd.querySelector("[data-otd-title]").textContent = e.title;
        otd.querySelector(".otd-img").href = e.page;
        otd.querySelector("[data-otd-page]").href = e.page;
        img.classList.add("fade");
        var pre = new Image(), want = i;
        pre.onload = pre.onerror = function () { if (want !== i) return; img.src = e.thumb; img.alt = e.title; img.classList.remove("fade"); };
        pre.src = e.thumb;
      };
      show();
      var next = document.getElementById("otd-next");
      next.hidden = order.length < 2;
      next.addEventListener("click", function () { i = (i + 1) % order.length; show(); });
    }).catch(function () {});
  }

  // Did you know? cycles through the facts.
  var dykBtn = document.getElementById("dyk-next");
  if (dykBtn) {
    var facts = Array.prototype.slice.call(document.querySelectorAll(".dyk-list li")), fi = 0;
    dykBtn.addEventListener("click", function () {
      facts[fi].hidden = true;
      fi = (fi + 1) % facts.length;
      facts[fi].hidden = false;
      document.getElementById("dyk-n").textContent = (fi + 1) + " / " + facts.length;
    });
  }

  // Site search: the search icon or Ctrl+K opens it; results as you type.
  var sBox = document.getElementById("search"), sQ = document.getElementById("search-q"), sR = document.getElementById("search-r");
  if (sBox) {
    var index = null, hits = [], sel = 0, sOpener = null;
    var load = function () {
      if (index) return Promise.resolve(index);
      return fetch("data/search.json").then(function (r) { return r.json(); }).then(function (d) { return (index = d); });
    };
    var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
    var draw = function () {
      sR.innerHTML = hits.length ? hits.map(function (h, i) {
        return '<li role="option" aria-selected="' + (i === sel) + '"><a href="' + esc(h.u) + '"><b>' + esc(h.t) + "</b><span>" + esc(h.s) + "</span></a></li>";
      }).join("") : (sQ.value.trim() ? '<li class="none">Nothing found. Try another word.</li>' : "");
    };
    var run = function () {
      var words = sQ.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
      if (!words.length) { hits = []; draw(); return; }
      clearTimeout(run.t); run.t = setTimeout(function () { track("site_search", { query: sQ.value.trim().slice(0, 80) }); }, 1200);
      load().then(function (idx) {
        hits = idx.map(function (it) {
          var t = it.t.toLowerCase(), all = (t + " " + it.s + " " + (it.k || "")).toLowerCase();
          if (!words.every(function (w) { return all.indexOf(w) >= 0; })) return null;
          var score = words.reduce(function (n, w) { return n + (t.indexOf(w) === 0 ? 3 : t.indexOf(w) >= 0 ? 2 : 0); }, 0);
          return { it: it, score: score };
        }).filter(Boolean).sort(function (a, b) { return b.score - a.score; }).slice(0, 8).map(function (x) { return x.it; });
        sel = 0; draw();
      });
    };
    var openSearch = function () {
      sOpener = document.activeElement;
      sBox.hidden = false; document.body.style.overflow = "hidden";
      sQ.focus(); sQ.select(); load();
    };
    var closeSearch = function () {
      sBox.hidden = true; document.body.style.overflow = "";
      if (sOpener) sOpener.focus();
    };
    document.querySelectorAll(".search-btn").forEach(function (b) { b.addEventListener("click", openSearch); });
    sQ.addEventListener("input", run);
    sBox.addEventListener("click", function (e) { if (e.target === sBox) closeSearch(); });
    document.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); sBox.hidden ? openSearch() : closeSearch(); return; }
      if (sBox.hidden) return;
      if (e.key === "Escape") closeSearch();
      else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (hits.length) { sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + hits.length) % hits.length; draw(); }
      } else if (e.key === "Enter" && hits[sel]) { e.preventDefault(); location.href = hits[sel].u; }
    });
  }

  // Writing page: show one kind of story; a year heading hides when none of its stories are left.
  var kindBtns = document.querySelectorAll(".filters button");
  kindBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var k = btn.dataset.filter;
      kindBtns.forEach(function (b) { b.setAttribute("aria-pressed", b === btn); });
      document.querySelectorAll(".story-rows").forEach(function (ul) {
        var shown = 0;
        ul.querySelectorAll("li").forEach(function (li) {
          li.hidden = k !== "all" && li.dataset.kind !== k;
          if (!li.hidden) shown++;
        });
        ul.previousElementSibling.hidden = !shown;
      });
    });
  });

  // Play loops only while on screen.
  document.querySelectorAll("video[data-loop]").forEach(function (v) {
    if (still) { v.removeAttribute("autoplay"); v.pause(); return; }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { en[0].isIntersecting ? v.play().catch(function () {}) : v.pause(); }).observe(v);
    }
  });

  // Gallery: tiles are plain links to the full image; with script they open the full-screen viewer.
  var viewer = document.getElementById("viewer");
  if (!viewer) return;
  var tiles = Array.prototype.slice.call(document.querySelectorAll(".gallery .jt"));
  var vImg = document.getElementById("v-img"), vPage = document.getElementById("v-page");
  var cur = 0, opener = null;

  function show(i) {
    cur = (i + tiles.length) % tiles.length;
    var a = tiles[cur], want = cur, pre = new Image();
    vImg.classList.add("fade");
    pre.onload = pre.onerror = function () {
      if (want !== cur) return; // a later click already moved on
      vImg.src = a.getAttribute("href");
      vImg.width = a.dataset.w; vImg.height = a.dataset.h;
      vImg.alt = a.dataset.title + ", " + a.dataset.place;
      vImg.classList.remove("fade");
    };
    pre.src = a.getAttribute("href");
    document.getElementById("v-title").textContent = a.dataset.title;
    document.getElementById("v-place").textContent = a.dataset.place;
    document.getElementById("v-n").textContent = (cur + 1) + " / " + tiles.length;
    if (a.dataset.page) { vPage.href = a.dataset.page; vPage.hidden = false; } else vPage.hidden = true;
    history.replaceState(null, "", "#" + (cur + 1));
    new Image().src = tiles[(cur + 1) % tiles.length].getAttribute("href");
  }
  function open(i) {
    opener = document.activeElement;
    viewer.hidden = false;
    document.body.style.overflow = "hidden";
    show(i);
    document.getElementById("v-close").focus();
  }
  function close() {
    viewer.hidden = true;
    document.body.style.overflow = "";
    history.replaceState(null, "", location.pathname);
    if (opener) opener.focus();
  }

  tiles.forEach(function (a, i) {
    a.addEventListener("click", function (e) { e.preventDefault(); open(i); });
  });
  document.getElementById("v-prev").addEventListener("click", function () { show(cur - 1); });
  document.getElementById("v-next").addEventListener("click", function () { show(cur + 1); });
  document.getElementById("v-close").addEventListener("click", close);
  viewer.addEventListener("click", function (e) { if (e.target === viewer) close(); });
  document.addEventListener("keydown", function (e) {
    if (viewer.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(cur - 1);
    if (e.key === "ArrowRight") show(cur + 1);
  });
  var x0 = null;
  vImg.addEventListener("pointerdown", function (e) { x0 = e.clientX; });
  vImg.addEventListener("pointerup", function (e) {
    if (x0 === null) return;
    var dx = e.clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1));
  });
  var start = parseInt(location.hash.slice(1), 10);
  if (start >= 1 && start <= tiles.length) open(start - 1);
})();

// Journey award photos: tap (or Enter/Space) a row with a photo to flash it out as a polaroid.
(function () {
  function toggle(li) {
    var on = li.classList.toggle("on");
    li.setAttribute("aria-expanded", on ? "true" : "false");
    if (on && window.posthog && posthog.capture) posthog.capture("award_photo_open", { award: li.querySelector("b").textContent.trim() });
  }
  document.addEventListener("click", function (e) {
    var li = e.target.closest(".has-pic");
    if (li && !e.target.closest("a")) toggle(li);
  });
  document.addEventListener("keydown", function (e) {
    var li = e.target.closest && e.target.closest(".has-pic");
    if (li && e.target === li && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); toggle(li); }
  });
})();

// Back to top: shows after two screens of scrolling.
(function () {
  var b = document.getElementById("to-top");
  if (!b) return;
  var show = function () { b.hidden = window.scrollY < window.innerHeight * 2; };
  window.addEventListener("scroll", show, { passive: true });
  show();
  b.addEventListener("click", function () {
    var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: calm ? "auto" : "smooth" });
  });
})();
