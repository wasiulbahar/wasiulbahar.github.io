(function () {
  var root = document.documentElement;

  // Theme toggle: remembered per visitor, falls back to the OS setting.
  try {
    var saved = localStorage.getItem("theme");
    if (saved) root.setAttribute("data-theme", saved);
  } catch (e) {}
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
      a.addEventListener("click", function () { links.classList.remove("open"); });
    });
  }

  // Scroll reveal
  var els = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add("in"); });
  }

  // Year
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Gallery: filters + lightbox
  var gallery = document.querySelector(".masonry");
  if (!gallery) return;
  var figs = Array.prototype.slice.call(gallery.querySelectorAll("figure"));

  document.querySelectorAll(".filters button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.dataset.filter;
      document.querySelectorAll(".filters button").forEach(function (b) { b.setAttribute("aria-pressed", b === btn); });
      figs.forEach(function (fig) {
        fig.classList.toggle("hide", f !== "all" && fig.dataset.tags.split(" ").indexOf(f) < 0);
      });
    });
  });

  var lb = document.querySelector(".lightbox");
  var lbImg = lb.querySelector("img");
  var lbTitle = lb.querySelector(".lb-cap b");
  var lbSub = lb.querySelector(".lb-cap small");
  var current = 0;

  function visible() { return figs.filter(function (f) { return !f.classList.contains("hide"); }); }
  function show(fig) {
    current = visible().indexOf(fig);
    lbImg.src = fig.dataset.full;
    lbImg.alt = fig.querySelector("img").alt;
    lbTitle.textContent = fig.querySelector("figcaption b").textContent;
    lbSub.textContent = fig.querySelector("figcaption small").textContent;
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function step(d) {
    var v = visible();
    show(v[(current + d + v.length) % v.length]);
  }
  function close() { lb.classList.remove("open"); document.body.style.overflow = ""; }

  figs.forEach(function (fig) {
    fig.addEventListener("click", function () { show(fig); });
    fig.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(fig); } });
  });
  lb.querySelector(".lb-close").addEventListener("click", close);
  lb.querySelector(".lb-prev").addEventListener("click", function (e) { e.stopPropagation(); step(-1); });
  lb.querySelector(".lb-next").addEventListener("click", function (e) { e.stopPropagation(); step(1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });
})();
