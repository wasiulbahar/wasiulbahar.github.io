/* The Last Sight: language, sound, read-aloud, the opening, the six chapters and quote cards.
   Clips live in media/clips/<id>.m4a. A missing clip never breaks the page: its words are always on screen. */
(function () {
  "use strict";
  var root = document.documentElement;
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var el = function (tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  // a pair of spans, one per language; CSS shows the right one
  var both = function (tag, cls, en, bn) {
    var e = el(tag, cls);
    var a = el("span", "en", en), b = el("span", "bn-t", bn || en);
    b.lang = "bn"; e.appendChild(a); e.appendChild(b); return e;
  };
  var lang = function () { return root.dataset.lang; };
  window.LS = { el: el, both: both, lang: lang, calm: calm };

  // ---------------------------------------------------------------- the recordings
  var CLIPS = {
    "pulok-melted": { en: "There was blood, and I could see some light. I thought my eye had probably melted.", bn: "রক্ত আর ওই সময় যে কিছু আলো… মনে হইছিল যে আমার চোখটা মনে হয় গলেই গেছে।" },
    "aman-face": { en: "Someone came close, maybe 10 or 15 feet away. As I turned, he fired straight at my face.", bn: "কাছ থেকে আইসা, ১০-১৫ ফুট হবে। কাছ থেকে আমি এরকম ঘোরার সাথে সাথে আরেকটা ফায়ার করছে চেহারা বরাবর।" },
    "aman-blind": { en: "I was a human. Now I’m not a human. Now I’m blind.", bn: "আমি মানুষ ছিলাম, এখন মানুষ না, আমি এখন অন্ধ।" },
    "aman-duty": { en: "Among middle-class people, the biggest thing is responsibility. We live for responsibility.", bn: "আমাদের মিডল ক্লাসদের সবচেয়ে বড় বিষয় হচ্ছে দায়িত্ব। দায়িত্বের জন্যই বেঁচে থাকা আমাদের।" },
    "ripa-donated": { en: "Allah, please don’t destroy my eye. The eye is someone else’s. I donated it. That child would see the world through my eyes.", bn: "আল্লাহ! তুই আমার চোখটা নষ্ট করিস না অন্তত। কারণ চোখটাই তো আরেকজনের, আরেকজনকে দান করে দিয়েছি। ওই বাচ্চাটা আমার চোখ দিয়ে দেখবে পৃথিবী।" },
    "ripa-job": { en: "I’m not getting a job at the hospitals. They won’t hire me. I’m disabled.", bn: "আমি হসপিটালের চাকরি পাচ্ছি না। হসপিটালগুলোতে জব দিচ্ছে না। আমি ডিসেবল।" },
    "jashim-thigh": { en: "There were no bullets below my thigh. Everything was above.", bn: "উরু বা থাই বা রান এর নিচে কোনো গুলি নাই, সব উপরে।" },
    "jashim-gaza": { en: "I felt like I had come to a hospital in Gaza.", bn: "আমার মনে হলো যে আমি গাজার কোনো হাসপাতালে আসছি।" },
    "safwan-white": { en: "Everything in this eye was white. I could only see my own pupil, moving from side to side.", bn: "সব কিছু সাদা এই চোখে পুরা সাদা আর হচ্ছে শুধু চোখের মণি দেখতেসি… নড়তেসে এদিকে ওদিকে।" },
    "safwan-needles": { en: "It felt like 100 to 200 needles had struck my body. I froze for a few seconds. Then I fell.", bn: "আমার বডিতে ১০০-২০০ টার মতো সুই এসে লাগছে এন্ড আমি পুরা ফ্রোজ হয়ে গেছিলাম।" },
    "mother-hospital": { en: "Some had both eyes bandaged. Some had blood coming from both eyes. Rickshaw pullers, madrasa students, university students, old people. Doctors too.", bn: "কারো দুই চোখ বাঁধা, বেঁধে রাখছে, কারো হচ্ছে যে দুই চোখ দিয়াই ব্লাড যাচ্ছে… রিক্সাওয়ালাও আছে, মাদ্রাসার স্টুডেন্টও আছে।" },
    "sabbir-wings": { en: "Man’s eyes are his wings. And if his wings are clipped, what can he possibly take?", bn: "মানুষের চোখ হচ্ছে গিয়ে তার ডানা, আর তার ডানা যদি কেটে দেওয়া হয়, তাহলে সে কি নিতে পারে?" },
    "sabbir-dreams": { en: "In sleep I still dream in colour. The dreams are beautiful. But when I wake up, it hurts.", bn: "ঘুমের ভিতরে তো এখনো স্বপ্ন দেখি, সেই রঙিন স্বপ্নগুলোই দেখি। স্বপ্ন তো দেখলে খুব ভালো লাগে, কিন্তু যখন ঘুম ভাঙে তখন তো কষ্ট হয় অনেক।" }
  };
  window.LS.CLIPS = CLIPS;

  // ---------------------------------------------------------------- the six chapters
  // Each: intro (who they were) → where → the moment (the screen changes the way they describe) → their words → after → now.
  var PEOPLE = [
    { id: "pulok", name: "Mohaimin Pulok", nameBn: "মোহাইমিন পুলক", photo: "pulok", street: "street-pulok", fx: "pulok",
      intro: ["He went out with his phone and his wallet, to record the movement. At the time, he prayed regularly.", "ফোন আর মানিব্যাগ নিয়ে বেরিয়েছিলেন আন্দোলনের ভিডিও করতে। তখন নিয়মিত নামাজ পড়তেন।"],
      where: ["18 July, 6:54 pm. The call to the evening prayer. On a road in his own neighbourhood, he is filming protesters throwing bricks.", "১৮ জুলাই, সন্ধ্যা ৬টা ৫৪। মাগরিবের আজান হচ্ছে। নিজের এলাকার রাস্তায় তিনি ইট ছোড়া আন্দোলনকারীদের ভিডিও করছেন।"],
      moment: ["He is watching the screen. He doesn’t duck.", "তাঁর চোখ ফোনের পর্দায়। তিনি মাথা নিচু করেন না।"],
      clip: "pulok-melted",
      after: ["He smells gunpowder. His first thought: he is being punished for skipping the prayer. His second: “I just came down to the road in my own area, and I got shot in the eye.”", "নাকে বারুদের গন্ধ। প্রথম ভাবনা: নামাজ ফেলে এসেছেন বলে শাস্তি পাচ্ছেন। দ্বিতীয় ভাবনা: নিজের এলাকার রাস্তায় নেমেছিলেন মাত্র, আর গুলি লাগল চোখে।"],
      now: ["Two pellets entered the eye along different paths. Through it he sees only a little light at the edge, enough to see a hand moving. He now campaigns against pellet guns.", "দুটি ছররা দুই দিক দিয়ে চোখে ঢুকেছিল। সেই চোখে এখন শুধু কিনারায় একটু আলো দেখেন, হাত নাড়ানো বোঝার মতো। এখন তিনি ছররা বন্দুকের বিরুদ্ধে কাজ করেন।"] },
    { id: "safwan", name: "Safwan", nameBn: "সাফওয়ান", photo: null, street: "street-safwan", fx: "safwan",
      intro: ["A university student in Dhaka.", "ঢাকার একটি বিশ্ববিদ্যালয়ের শিক্ষার্থী।"],
      where: ["Dhaka. He has turned away from the line, looking for bricks.", "ঢাকা। তিনি সামনের সারি থেকে মুখ ঘুরিয়ে ইট খুঁজছেন।"],
      moment: ["He never sees who fires. He keeps walking. Then he notices the street has gone from his left eye.", "কে গুলি করল, তিনি দেখেননি। হাঁটতে থাকেন। তারপর খেয়াল করেন, বাম চোখ থেকে রাস্তাটা উধাও।"],
      clip: "safwan-white",
      after: ["He stops strangers to ask what has happened to his eye. They pour water on it. Then the pain reaches the rest of his body.", "অচেনা মানুষদের থামিয়ে জিজ্ঞেস করেন, চোখে কী হয়েছে। তাঁরা চোখে পানি ঢালেন। তারপর ব্যথা ছড়িয়ে পড়ে সারা শরীরে।"],
      afterClip: "safwan-needles",
      now: ["Fluid had leaked inside the eye. Once doctors stitched it, the white slowly cleared. His mother went looking for him at the eye hospital. What she saw there has stayed with her.", "চোখের ভেতরে তরল বেরিয়ে গিয়েছিল। চিকিৎসকেরা সেলাই করার পর সাদা ভাবটা ধীরে ধীরে কেটে যায়। তাঁকে খুঁজতে মা গিয়েছিলেন চক্ষু হাসপাতালে। সেখানে যা দেখেছেন, তা আজও তাঁর সঙ্গে আছে।"],
      nowClip: "mother-hospital" },
    { id: "jashim", name: "Khan Jashim", nameBn: "খান জসিম", photo: null, street: "street-jashim", fx: "jashim",
      intro: ["The only one from the villages around his home to reach Dhaka University. His family’s dream was that he would become a BCS cadre.", "আশপাশের কয়েক গ্রামে তিনিই একমাত্র ঢাকা বিশ্ববিদ্যালয়ে পড়েছেন। পরিবারের স্বপ্ন ছিল, তিনি বিসিএস ক্যাডার হবেন।"],
      where: ["18 July. Abul Hotel, Rampura. He is among three or four people standing ahead of the crowd. Two officers step forward from the line.", "১৮ জুলাই। আবুল হোটেল, রামপুরা। ভিড়ের সামনে দাঁড়ানো তিন-চারজনের একজন তিনি। সারি থেকে দুজন পুলিশ সদস্য এগিয়ে আসেন।"],
      moment: ["“I thought it had only hit my eye. A sensitive place.” He puts his hand to it, turns, and falls.", "“আমার মনে হয়েছে শুধু চোখে লাগছে। সেন্সিটিভ জায়গা।” চোখে হাত দিয়ে ঘুরে যান, পড়ে যান।"],
      clip: "jashim-thigh",
      after: ["At Dhaka Medical College Hospital he waves to everyone. “Nothing happened, no problem.” His whole body is bleeding.", "ঢাকা মেডিকেল কলেজ হাসপাতালে সবাইকে হাত নেড়ে বলেন, “কিছু হয় নাই, সমস্যা নাই।” তখন তাঁর সারা শরীর থেকে রক্ত ঝরছে।"],
      afterClip: "jashim-gaza",
      now: ["86 pellets hit him. Doctors removed 12. The other 74 are still inside him. He is blind in one eye; reading for an hour hurts. He could not sit the written exam. Students later elected him to DUCSU.", "তাঁর শরীরে ৮৬টি ছররা লেগেছিল। চিকিৎসকেরা বের করতে পেরেছেন ১২টি। বাকি ৭৪টি এখনো শরীরে রয়ে গেছে। এক চোখে দেখেন না; এক ঘণ্টা পড়লেই ব্যথা। লিখিত পরীক্ষা দিতে পারেননি। পরে শিক্ষার্থীরা তাঁকে ডাকসুতে নির্বাচিত করেন।"] },
    { id: "ripa", name: "Ripa Gomez", nameBn: "রিপা গোমেজ", photo: "ripa-gomez", street: "street-ripa", fx: "ripa",
      intro: ["A nurse. She has no one, she says, so she pledged her organs. Her eye is promised to a child.", "একজন নার্স। তাঁর কেউ নেই, বলেন তিনি, তাই অঙ্গ দান করে দিয়েছেন। চোখটা কথা দেওয়া আছে একটি শিশুকে।"],
      where: ["Near Hatirjheel. She is in her uniform, with her apron, ID card and first-aid bag. She has stopped the bleeding of three or four people.", "হাতিরঝিলের কাছে। পরনে ইউনিফর্ম, অ্যাপ্রন, আইডি কার্ড, হাতে ফার্স্ট এইড ব্যাগ। তিন-চারজনের রক্ত বন্ধ করেছেন।"],
      moment: ["She is dressing one more wound, by a vegetable stall in the market. Something hot. A chicken seller says: you’ve been shot.", "বাজারে সবজির দোকানের পাশে আরেকজনের ক্ষত বাঁধছেন। গরম কিছু একটা। মুরগি বিক্রেতা বলেন: আপনার গুলি লাগছে।"],
      clip: "ripa-donated",
      after: ["Someone pours water. She opens her eye, and she can see. For a moment, she is relieved: she can still give it.", "কেউ পানি ঢালেন। চোখ খোলেন, দেখতে পান। এক মুহূর্তের জন্য স্বস্তি: চোখটা এখনো দেওয়া যাবে।"],
      now: ["Then double vision, and a prosthesis. The eye can no longer be given. For two years she has seen everything twice.", "তারপর ডাবল ভিশন, প্রোটেসিস। চোখটা আর কাউকে দেওয়া যাবে না। দুই বছর ধরে তিনি সবকিছু দুটো করে দেখেন।"],
      nowClip: "ripa-job" },
    { id: "aman", name: "Amanullah Aman", nameBn: "আমানউল্লাহ আমান", photo: "aman", street: "street-aman", fx: "black",
      intro: ["The youngest child. His father, past 70, worked on the waters of Kaptai Lake. Aman carried the family.", "পরিবারের সবচেয়ে ছোট সন্তান। সত্তরোর্ধ্ব বাবা কাজ করতেন কাপ্তাই লেকের পানিতে। সংসারের ভার ছিল আমানের কাঁধে।"],
      where: ["5 August, Chattogram. Hasina has fled. He is telling the students there is no need to fight any more.", "৫ আগস্ট, চট্টগ্রাম। হাসিনা পালিয়েছেন। তিনি শিক্ষার্থীদের বোঝাচ্ছেন, এখন আর মারামারির দরকার নেই।"],
      moment: ["A shot from behind. He turns his head.", "পেছন থেকে একটি গুলি। তিনি মাথা ঘোরান।"],
      clip: "aman-face",
      after: ["In the rickshaw he recites the kalema. He gives strangers his phone password. He breathes as little as he can, “to get a little more time.”", "রিকশায় কালেমা পড়েন। অচেনা মানুষকে ফোনের পাসওয়ার্ড বলে দেন। খুব কম শ্বাস নেওয়ার চেষ্টা করেন, “যাতে আরেকটু সময় বেশি পাই।”"],
      afterClip: "aman-duty",
      now: ["Nine operations. No light. He can no longer see his parents’ faces, or tell from them when something is wrong.", "নয়বার অস্ত্রোপচার। কোনো আলো নেই। বাবা-মায়ের মুখ আর দেখতে পান না, মুখ দেখে বুঝতে পারেন না কিছু হয়েছে কি না।"],
      nowClip: "aman-blind" },
    { id: "sabbir", name: "Sabbir", nameBn: "সাব্বির", photo: "sabbir", street: "street-sabbir", fx: "black",
      intro: ["A job, a wife, a family. He rode a motorcycle and read detective stories.", "চাকরি, স্ত্রী, পরিবার। মোটরসাইকেল চালাতেন, গোয়েন্দা গল্প পড়তেন।"],
      where: ["Karwan Bazar, Dhaka.", "কারওয়ান বাজার, ঢাকা।"],
      moment: ["A bullet, not pellets, beside his right jaw. It forces the eye out.", "ছররা নয়, একটি বুলেট, ডান চোয়ালের পাশে। চোখটা বেরিয়ে আসে।"],
      clip: "sabbir-wings",
      after: ["“They headshot me. Allah kept me alive.”", "“আমাকে হেডশট করছে আরকি, আল্লাহ তালা বাঁচাইয়া রাখছে।”"],
      now: ["He is learning Braille. His youngest child is six months old. He does not know what the baby looks like.", "তিনি ব্রেইল শিখছেন। ছোট সন্তানের বয়স ছয় মাস। বাচ্চাটা দেখতে কেমন, তিনি জানেন না।"] }
  ];
  window.LS.PEOPLE = PEOPLE;

  // ---------------------------------------------------------------- language
  var langBtn = document.getElementById("ls-lang");
  function setLang(l) {
    root.dataset.lang = l; root.lang = l === "bn" ? "bn" : "en";
    try { localStorage.setItem("ls-lang", l); } catch (e) {}
    document.dispatchEvent(new CustomEvent("ls-lang"));
  }
  try { if (localStorage.getItem("ls-lang") === "bn") setLang("bn"); } catch (e) {}
  langBtn.addEventListener("click", function () { setLang(lang() === "bn" ? "en" : "bn"); });

  // ---------------------------------------------------------------- sound
  var M = function (f, a) { if (window.LS.music) window.LS.music[f](a); };
  var audio = document.getElementById("ls-audio"), modeBtn = document.getElementById("ls-mode");
  var listen = false, playingBtn = null;
  function stop() {
    audio.pause();
    if (playingBtn) { playingBtn.classList.remove("playing"); playingBtn = null; }
    M("duck", false);
    document.querySelectorAll(".speaking").forEach(function (v) { v.classList.remove("speaking"); });
  }
  function play(id, btn, holder) {
    if (btn && playingBtn === btn) { stop(); return; }
    stop();
    audio.src = "media/clips/" + id + ".m4a";
    audio.play().then(function () {
      if (btn) { playingBtn = btn; btn.classList.add("playing"); }
      M("duck", true);
      if (holder) holder.classList.add("speaking");
    }).catch(function () { if (btn) btn.classList.add("missing"); });
  }
  audio.addEventListener("ended", stop);
  function setMode(on) {
    listen = on;
    modeBtn.setAttribute("aria-pressed", String(on));
    root.classList.toggle("listening", on);
    if (!on) stop();
    M("enable", on);
    var mb = document.getElementById("ls-music"); if (mb) mb.setAttribute("aria-pressed", String(on));
  }
  modeBtn.addEventListener("click", function () { setMode(!listen); });
  window.LS.play = play; window.LS.listening = function () { return listen; };

  document.querySelectorAll("[data-start]").forEach(function (b) {
    b.addEventListener("click", function () {
      setMode(b.dataset.start === "listen");
      document.getElementById("ls-open").scrollIntoView({ behavior: calm ? "auto" : "smooth" });
    });
  });

  // ---------------------------------------------------------------- the opening: the light fails, then white
  var stage = document.getElementById("ls-stage");
  var voices = [].slice.call(document.querySelectorAll(".ls-open .ls-voice"));
  var seen = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      voices.forEach(function (v) { v.classList.toggle("on", v === e.target); });
      stage.dataset.fx = e.target.dataset.fx;
      M("scene", "open-" + e.target.dataset.fx);
      if (listen) play(e.target.dataset.clip, null, e.target);
    });
  }, { rootMargin: "-45% 0px -45% 0px" });
  voices.forEach(function (v) { seen.observe(v); });
  new IntersectionObserver(function (es) { if (!es[0].isIntersecting) stage.dataset.fx = "0"; }).observe(document.getElementById("ls-open"));

  // ---------------------------------------------------------------- quote cards: save a survivor's words as an image
  function quoteCard(who, en, bn, photo) {
    var c = document.createElement("canvas"), W = 1080, H = 1350, x = c.getContext("2d");
    c.width = W; c.height = H;
    var draw = function (img) {
      x.fillStyle = "#0b0606"; x.fillRect(0, 0, W, H);
      if (img) {
        x.save(); x.filter = "grayscale(1) brightness(.55)";
        var s = Math.max(W / img.width, 620 / img.height);
        x.drawImage(img, (W - img.width * s) / 2, 0, img.width * s, img.height * s); x.restore();
        var g = x.createLinearGradient(0, 300, 0, 640); g.addColorStop(0, "rgba(11,6,6,0)"); g.addColorStop(1, "#0b0606");
        x.fillStyle = g; x.fillRect(0, 300, W, 340);
      }
      x.fillStyle = "#e0262f"; x.fillRect(80, img ? 660 : 200, 90, 10);
      var text = lang() === "bn" ? bn : en;
      x.fillStyle = "#f3eee2"; x.font = (lang() === "bn" ? "600 56px 'Noto Serif Bengali'" : "400 62px Newsreader"), x.textBaseline = "top";
      var words = ("“" + text + "”").split(" "), line = "", y = img ? 720 : 270, lh = lang() === "bn" ? 84 : 76, lines = [];
      words.forEach(function (w) { var t = line ? line + " " + w : w; if (x.measureText(t).width > W - 160) { lines.push(line); line = w; } else line = t; });
      lines.push(line);
      if (lines.length > 6) { x.font = x.font.replace(/\d+px/, function (m) { return Math.round(parseInt(m) * .8) + "px"; }); }
      lines.forEach(function (l, i) { x.fillText(l, 80, y + i * lh); });
      x.font = "800 34px 'Bricolage Grotesque'"; x.fillStyle = "#e0262f"; x.fillText(who.toUpperCase(), 80, H - 190);
      x.font = "600 28px 'Bricolage Grotesque'"; x.fillStyle = "#b9b0a3"; x.fillText("The Last Sight · Wasiul Bahar · Darkroom", 80, H - 130);
      var a = document.createElement("a"); a.download = "the-last-sight-" + who.toLowerCase().replace(/\W+/g, "-") + ".png";
      a.href = c.toDataURL("image/png"); document.body.appendChild(a); a.click(); a.remove();
    };
    document.fonts.ready.then(function () {
      if (!photo) return draw(null);
      var img = new Image(); img.onload = function () { draw(img); }; img.onerror = function () { draw(null); }; img.src = "media/" + photo + ".jpg";
    });
  }
  window.LS.quoteCard = quoteCard;

  // a recording: play button, the words in both languages, and "save as image"
  function clipBlock(id, who, photo, label) {
    var c = CLIPS[id], box = el("figure", "ls-clip");
    if (label) box.appendChild(both("figcaption", "ls-clip-who", label[0], label[1]));
    var q = el("blockquote");
    var en = el("p", "en q-main", "“" + c.en + "”"), bn = el("p", "q-orig", "“" + c.bn + "”");
    bn.lang = "bn"; q.appendChild(en); q.appendChild(bn); box.appendChild(q);
    var bar = el("div", "ls-clip-bar");
    var btn = el("button", "ls-play"); btn.type = "button";
    btn.appendChild(el("span", "ls-play-i"));
    var SHORT = { "Mohaimin Pulok": "Pulok", "Khan Jashim": "Jashim", "Ripa Gomez": "Ripa", "Amanullah Aman": "Aman" };
    btn.appendChild(both("span", "ls-play-t", "Hear " + (SHORT[who] || who.split(" ")[0]), "কণ্ঠে শুনুন"));
    btn.appendChild(both("span", "ls-play-miss", "Recording being prepared", "রেকর্ডিং তৈরি হচ্ছে"));
    btn.addEventListener("click", function () { play(id, btn, box); });
    var save = el("button", "ls-save"); save.type = "button";
    save.appendChild(both("span", null, "Save as image", "ছবি হিসেবে রাখুন"));
    save.addEventListener("click", function () { quoteCard(who, c.en, c.bn, photo); });
    bar.appendChild(btn); bar.appendChild(save); box.appendChild(bar);
    return box;
  }
  window.LS.clipBlock = clipBlock;

  // ---------------------------------------------------------------- build the chapters
  // where each person's face sits in the wide photo, so a wide screen crops around it
  var FOCUS = { aman: "30% 40%", pulok: "52% 30%", "ripa-gomez": "50% 45%", sabbir: "55% 35%" };
  var host = document.getElementById("ls-chapters"), nav = document.getElementById("ls-chnav");
  PEOPLE.forEach(function (p, i) {
    var ch = el("article", "ch"); ch.id = "ch-" + p.id; ch.dataset.fx = p.fx; ch.dataset.state = "intro";
    ch.setAttribute("aria-label", p.name);
    // the stage: portrait, the street they stood in, and what their sight did to it
    var stageEl = el("div", "ch-stage"); stageEl.setAttribute("aria-hidden", "true");
    var portrait = el("div", "ch-portrait" + (p.photo ? "" : " none"));
    if (p.photo) {  // the whole photo on wide screens, the 4:5 crop on tall ones; never zoomed past the face
      var pic = el("picture"), wide = el("source");
      wide.media = "(min-aspect-ratio: 1/1)"; wide.srcset = "media/" + p.photo + "-wide.webp"; wide.type = "image/webp";
      var im = el("img"); im.src = "media/" + p.photo + ".jpg"; im.alt = ""; im.loading = "lazy";
      im.style.objectPosition = FOCUS[p.photo] || "50% 35%";
      pic.appendChild(wide); pic.appendChild(im); portrait.appendChild(pic);
    }
    else portrait.appendChild(el("span", "ch-initials", p.name.split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2)));
    var street = el("div", "ch-street");
    ["base", "ghost"].forEach(function (k) { var s = el("img", k); s.src = "media/" + p.street + ".jpg"; s.alt = ""; s.loading = "lazy"; street.appendChild(s); });
    street.appendChild(el("div", "veil")); street.appendChild(el("div", "pupil")); street.appendChild(el("div", "flash"));
    stageEl.appendChild(street); stageEl.appendChild(portrait);
    ch.appendChild(stageEl);

    // the steps that scroll over it
    var steps = el("div", "ch-steps");
    var step = function (k, node) { var s = el("div", "ch-step"); s.dataset.k = k; s.appendChild(node); steps.appendChild(s); return s; };
    var head = el("div", "ch-card ch-intro");
    head.appendChild(el("p", "ch-n", (i + 1) + " / 6"));
    var h = both("h3", "ch-name", p.name, p.nameBn); head.appendChild(h);
    head.appendChild(both("p", "ch-line", p.intro[0], p.intro[1]));
    step("intro", head);
    var w = el("div", "ch-card"); w.appendChild(both("p", "ch-line", p.where[0], p.where[1])); step("where", w);
    var m = el("div", "ch-card ch-moment"); m.appendChild(both("p", "ch-line big", p.moment[0], p.moment[1])); step("moment", m);
    var q = el("div", "ch-card ch-quote"); q.appendChild(clipBlock(p.clip, p.name, p.photo)); step("quote", q);
    var a = el("div", "ch-card"); a.appendChild(both("p", "ch-line", p.after[0], p.after[1]));
    if (p.afterClip) a.appendChild(clipBlock(p.afterClip, p.name, p.photo));
    step("after", a);
    var n = el("div", "ch-card ch-now"); n.appendChild(both("p", "ch-tag", "Now", "এখন")); n.appendChild(both("p", "ch-line", p.now[0], p.now[1]));
    if (p.nowClip) n.appendChild(clipBlock(p.nowClip, p.nowClip === "mother-hospital" ? "Safwan’s mother" : p.name, p.nowClip === "mother-hospital" ? null : p.photo,
      p.nowClip === "mother-hospital" ? ["Safwan’s mother, at the eye hospital", "চক্ষু হাসপাতালে সাফওয়ানের মা"] : null));
    if (i < PEOPLE.length - 1) {
      var next = el("a", "ch-next"); next.href = "#ch-" + PEOPLE[i + 1].id;
      next.appendChild(both("span", null, "Next: " + PEOPLE[i + 1].name + " ↓", "পরের জন: " + PEOPLE[i + 1].nameBn + " ↓"));
      n.appendChild(next);
    }
    step("now", n);
    ch.appendChild(steps);
    host.appendChild(ch);

    // chapter nav: six faces
    var dot = el("a", "ch-dot"); dot.href = "#ch-" + p.id; dot.setAttribute("aria-label", p.name);
    if (p.photo) { var di = el("img"); di.src = "media/" + p.photo + ".jpg"; di.alt = ""; di.loading = "lazy"; dot.appendChild(di); }
    else dot.appendChild(el("span", null, p.name[0]));
    nav.appendChild(dot);

    // as each step reaches the middle of the screen, the stage changes
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var k = e.target.dataset.k;
        steps.querySelectorAll(".ch-step").forEach(function (s) { s.classList.toggle("on", s === e.target); });
        var was = ch.dataset.state;
        ch.dataset.state = k;
        M("scene", "ch-" + k);
        if (k === "moment" && was !== "moment" && !calm) { ch.classList.remove("impact"); void ch.offsetWidth; ch.classList.add("impact"); }
        if (listen && (k === "quote" || k === "after" || k === "now")) { var b = e.target.querySelector(".ls-play"); if (b) b.click(); }
      });
    }, { rootMargin: "-48% 0px -48% 0px" });
    steps.querySelectorAll(".ch-step").forEach(function (s) { io.observe(s); });
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) nav.querySelectorAll(".ch-dot").forEach(function (d, k) { d.classList.toggle("on", k === i); }); });
    }, { rootMargin: "-50% 0px -50% 0px" }).observe(ch);
  });
  new IntersectionObserver(function (es) { nav.classList.toggle("show", es[0].isIntersecting); }).observe(host);

  // ---------------------------------------------------------------- read aloud
  var readBtn = document.getElementById("ls-read"), reading = false, queue = [], current = null;
  var visible = function (n) { return n.offsetParent !== null && getComputedStyle(n).display !== "none" && n.textContent.trim(); };
  function collect() {
    var nodes = [].slice.call(document.querySelectorAll("main h2, main h3, main p, main figcaption")).filter(function (n) {
      return visible(n) && !n.closest(".ls-note, .ls-method, .ls-clip-bar, .ls-dots-legend, .ls-buy-key, .ls-fig-label, [aria-hidden=true]") &&
        !(lang() === "en" && n.classList.contains("q-orig")) && !(lang() === "bn" && n.classList.contains("q-main"));
    });
    var top = window.scrollY + 80;
    return nodes.filter(function (n) { return n.getBoundingClientRect().top + window.scrollY >= top - 10; });
  }
  function speakNext() {
    if (current) current.classList.remove("reading");
    if (!reading || !queue.length) { stopReading(); return; }
    current = queue.shift();
    current.classList.add("reading");
    current.scrollIntoView({ block: "center", behavior: calm ? "auto" : "smooth" });
    var u = new SpeechSynthesisUtterance(current.textContent.replace(/\s+/g, " ").trim());
    u.lang = lang() === "bn" ? "bn-BD" : "en-GB"; u.rate = .95;
    var v = speechSynthesis.getVoices().filter(function (x) { return x.lang.toLowerCase().indexOf(lang() === "bn" ? "bn" : "en") === 0; })[0];
    if (v) u.voice = v;
    u.onend = speakNext; u.onerror = speakNext;
    speechSynthesis.speak(u);
  }
  function stopReading() {
    reading = false; speechSynthesis.cancel(); queue = []; M("duck", false);
    if (current) current.classList.remove("reading");
    readBtn.setAttribute("aria-pressed", "false");
  }
  if (!("speechSynthesis" in window)) readBtn.hidden = true;
  readBtn.addEventListener("click", function () {
    if (reading) { stopReading(); return; }
    stop(); reading = true; readBtn.setAttribute("aria-pressed", "true"); M("duck", true); queue = collect(); speakNext();
  });
  document.addEventListener("ls-lang", function () { if (reading) stopReading(); });
})();
