/* How they see now: one July banner (or the reader's own camera), shown the way each person describes their sight today. */
(function () {
  "use strict";
  var view = document.getElementById("sn-view");
  if (!view || !window.LS || !window.LS.PEOPLE) return;
  var whoBox = document.getElementById("sn-who"), nowEl = document.getElementById("sn-now"),
      tryEl = document.getElementById("sn-try"), over = document.getElementById("sn-over"),
      camBtn = document.getElementById("sn-cam-btn"), camNote = document.getElementById("sn-cam-note");

  // something for the reader to do with their own eyes, and words over the picture where there is no picture
  var EXTRA = {
    pulok: { tryIt: "Close one eye, and keep a hand moving at the edge of the other. In his injured eye, that is about what remains." },
    safwan: { tryIt: "Watch the white clear. For days, it did not." },
    jashim: { tryIt: "Cover one eye and keep reading. For him, an hour of this hurts." },
    ripa: { tryIt: "Hold a finger in front of your face and look past it: you see two. She sees everything that way." },
    aman: { over: "Light, only when it comes very close.", tryIt: "Close your eyes and bring a lamp or your phone’s torch near them: a glow, and nothing else. His parents’ faces are past it." },
    sabbir: { over: "No light.", tryIt: "Close both eyes. His youngest child is six months old." }
  };

  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function bi(en, bn) {   // the page keeps both languages; only English shows for now
    var f = document.createDocumentFragment();
    f.appendChild(el("span", "en", en)); if (bn) { var b = el("span", "bn-t", bn); b.lang = "bn"; f.appendChild(b); }
    return f;
  }

  var buttons = [];
  window.LS.PEOPLE.forEach(function (p) {
    var b = el("button", "sn-face"); b.type = "button"; b.setAttribute("aria-pressed", "false");
    if (p.photo) { var im = el("img"); im.src = "media/" + p.photo + ".jpg"; im.alt = ""; im.loading = "lazy"; b.appendChild(im); }
    else b.appendChild(el("span", "sn-init", p.name.split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2)));
    b.appendChild(el("span", "sn-name", { pulok: "Pulok", safwan: "Safwan", jashim: "Jashim", ripa: "Ripa", aman: "Aman", sabbir: "Sabbir" }[p.id] || p.name));
    b.setAttribute("aria-label", p.name);
    b.addEventListener("click", function () { choose(p, b); });
    whoBox.appendChild(b); buttons.push(b);
  });

  function choose(p, b) {
    buttons.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
    view.dataset.who = "none"; void view.offsetWidth;   // restart the transition, so each choice is seen arriving
    view.dataset.who = p.id;
    var x = EXTRA[p.id] || {};
    over.textContent = x.over || "";
    nowEl.textContent = ""; nowEl.appendChild(el("b", null, p.name + ". ")); nowEl.appendChild(bi(p.now[0], p.now[1]));
    tryEl.textContent = x.tryIt || "";
  }
  choose(window.LS.PEOPLE[3], buttons[3]);   // Ripa first: double vision reads at once on lettering

  // the reader's own room, through the same eyes; the stream never leaves the page
  var stream = null, vids = view.querySelectorAll("video");
  function stopCam() {
    if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
    stream = null; view.classList.remove("cam");
    camBtn.firstChild.textContent = "See your own room this way";
  }
  camBtn.addEventListener("click", function () {
    if (stream) { stopCam(); return; }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { camNote.textContent = "This browser cannot use a camera here."; return; }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false }).then(function (s) {
      stream = s;
      [].forEach.call(vids, function (v) { v.srcObject = s; v.play().catch(function () {}); });
      view.classList.add("cam");
      camBtn.firstChild.textContent = "Stop the camera";
    }).catch(function () { camNote.textContent = "The camera was not allowed, so the banner stays."; });
  });
  // turn the camera off as soon as the reader moves on
  new IntersectionObserver(function (es) { if (!es[0].isIntersecting && stream) stopCam(); }).observe(view);
})();
