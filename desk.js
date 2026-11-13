/* Desk: the private editor for wasiulbahar.com.
   It reads and writes content.json in the private source repository through the GitHub API, using an access
   token that stays in this browser. Saving triggers the "Update site" job, which rebuilds and publishes.
   Everything from the data is put on the page with textContent / value, never as HTML. */
(function () {
  "use strict";
  var REPO = "wasiulbahar/wasiul-bahar-site-source", API = "https://api.github.com/repos/" + REPO;
  var MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var savedAt = 0, token = null, content = null, sha = null, saved = "", otdAuto = {}, inbox = [], lastRun = {}, current = "inbox", openItem = null;
  try { token = localStorage.getItem("desk-token"); } catch (e) {}

  // ------------------------------------------------------------ what can be edited
  var F = function (n, l, extra) { return Object.assign({ n: n, l: l }, extra || {}); };
  var SECTIONS = [
    { key: "inbox", label: "Inbox", custom: true },
    { key: "quick", label: "Quick add", custom: true },
    { key: "stories", label: "Stories", top: true, fixedOrder: true, title: function (i) { return i.title || i.url || "(new story)"; }, sub: function (i) { return [i.category, i.date, i.outlet].filter(Boolean).join(" · "); },
      hint: "For a story on another site, paste its link and leave the rest empty: the title, date, summary and cover picture are fetched for you. Nutshell Today stories arrive by themselves every Monday. Stories are shown newest first.",
      fields: [F("url", "Link (empty for Nutshell Today)", { wide: 1 }), F("title", "Title", { wide: 1 }), F("category", "Category", { opts: ["Feature", "Report", "National", "Interview", "Opinion", "Explainer"] }), F("date", "Date, like 4 Nov 2026"), F("outlet", "Outlet"), F("excerpt", "Summary", { area: 1 })] },
    { key: "press", label: "Press", top: true, title: function (i) { return i.outlet || i.url || "(new press)"; }, sub: function (i) { return i.what; },
      hint: "Where your photos ran, newest first. Paste the exact page link; the screenshot and the archive copy are made for you.",
      fields: [F("url", "Link to the page", { wide: 1 }), F("outlet", "Outlet"), F("what", "What ran")] },
    { key: "journey", label: "Journey", top: true, fixedOrder: true, title: function (i) { return i.title; }, sub: function (i) { return [i.year, i.month, i.track].filter(Boolean).join(" · "); },
      hint: "Every line on the Journey page and the home page year tabs. A photo makes the line pop out a polaroid.",
      fields: [F("year", "Year"), F("month", "Month", { opts: MONTHS }), F("track", "Kind", { opts: ["Journalism", "Photography", "Open knowledge", "Event", "Award"] }), F("title", "Title", { wide: 1 }), F("detail", "Detail", { wide: 1 }), F("link", "Link"), F("photo", "Photo", { image: 1 })] },
    { key: "home_awards", label: "Home: Recognition", title: function (i) { return i.title; }, sub: function (i) { return i.year + " · " + i.line; },
      fields: [F("year", "Year"), F("title", "Award"), F("line", "One line", { wide: 1 })] },
    { key: "cv", label: "CV", title: function (i) { return i.role + ", " + i.org; }, sub: function (i) { return [i.group, i.when].filter(Boolean).join(" · "); },
      hint: "Entries appear under their group, in this order. To start a new group, type a new group name.",
      fields: [F("group", "Group", { list: "group" }), F("role", "Role or title"), F("org", "Organisation or place"), F("when", "When"), F("what", "What you did", { area: 1 })] },
    { key: "cv_edu", label: "CV: Education", title: function (i) { return i.role; }, sub: function (i) { return i.org + " · " + i.when; },
      fields: [F("role", "Degree"), F("org", "Institution"), F("when", "When"), F("what", "Note")] },
    { key: "cv_skills", label: "CV: Skills", title: function (i) { return i.text; }, fields: [F("text", "Skill")] },
    { key: "open", label: "Open knowledge", title: function (i) { return i.name; }, sub: function (i) { return i.role; },
      fields: [F("name", "Project"), F("role", "Your role"), F("url", "Link", { wide: 1 }), F("about", "About", { area: 1 })] },
    { key: "hire", label: "What I can do", title: function (i) { return i.title; }, sub: function (i) { return i.about; },
      fields: [F("title", "Service"), F("about", "About", { area: 1 })] },
    { key: "faq", label: "FAQ", title: function (i) { return i.q; },
      hint: "Answers may contain links written as HTML. {files} becomes the live number of your Commons files.",
      fields: [F("q", "Question", { wide: 1 }), F("a", "Answer", { area: 1 })] },
    { key: "facts", label: "Did you know?", title: function (i) { return i.text; }, fields: [F("text", "Fact", { area: 1 })] },
    { key: "gallery", label: "Gallery", title: function (i) { return i.title || i.link || "(new photo)"; }, sub: function (i) { return i.place; },
      hint: "Your best shots, in this order. To add one, paste its Wikimedia Commons file link; the picture is downloaded for you.",
      fields: [F("link", "Commons file link (for a new photo)", { wide: 1 }), F("title", "Title"), F("place", "Place or date")] },
    { key: "otd_manual", label: "On this day", custom: true, title: function (i) { return i.title || i.link || "(new photo)"; }, sub: function (i) { return i.date; },
      fields: [F("date", "Date the photo was taken", { type: "date" }), F("title", "Caption"), F("link", "Commons file link, or any link", { wide: 1 }), F("photo", "Or upload a photo", { image: 1 })] },
    { key: "tools", label: "Tools", title: function (i) { return i.name; }, sub: function (i) { return i.line; },
      hint: "Version lines update by themselves from GitHub releases when the repository is filled in.",
      fields: [F("name", "Name"), F("line", "One line"), F("repo", "GitHub repository, like wasiulbahar/desk-buddy"), F("alt", "Picture description"), F("about", "About", { area: 1 }), F("facts", "Facts, one per line", { lines: 1 }), F("links", "Buttons, one per line: Label | https://link", { pairs: 1 }), F("logo", "Logo file"), F("pic", "Picture file")] },
    { key: "settings", label: "Settings", custom: true }
  ];
  var byKey = function (k) { return SECTIONS.filter(function (s) { return s.key === k; })[0]; };

  // ------------------------------------------------------------ small helpers
  var el = function (tag, props, kids) {
    var e = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      if (k === "on") Object.keys(props.on).forEach(function (ev) { e.addEventListener(ev, props.on[ev]); });
      else if (k === "class") e.className = props[k];
      else if (k in e && k !== "list") e[k] = props[k];
      else e.setAttribute(k, props[k]);
    });
    [].concat(kids || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return e;
  };
  var btn = function (text, fn, cls) { return el("button", { type: "button", class: "btn " + (cls || ""), textContent: text, on: { click: fn } }); };
  var b64 = function (bytes) { var s = ""; for (var i = 0; i < bytes.length; i += 8192) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192)); return btoa(s); };
  var unb64 = function (text) { return new TextDecoder().decode(Uint8Array.from(atob(text.replace(/\s/g, "")), function (c) { return c.charCodeAt(0); })); };
  var api = function (path, opts) {
    opts = opts || {};
    return fetch(path.indexOf("http") === 0 ? path : API + path, {
      method: opts.method || "GET", cache: "no-store",
      headers: { Authorization: "Bearer " + token, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
      body: opts.body ? JSON.stringify(opts.body) : undefined
    }).then(function (r) {
      if (r.status === 404 && opts.optional) return null;
      if (!r.ok) return r.json().catch(function () { return {}; }).then(function (j) { var e = new Error(j.message || ("GitHub said " + r.status)); e.status = r.status; throw e; });
      return r.json();
    });
  };
  var readJson = function (path) { return api("/contents/" + path, { optional: true }).then(function (f) { return f ? JSON.parse(unb64(f.content)) : null; }); };
  var dirty = function () { return content && JSON.stringify(content) !== saved; };
  var touch = function () {
    document.getElementById("savebar").hidden = !dirty(); renderNav();
    document.getElementById("savemsg").textContent = lastRun.pending ? "Unsaved changes. Saving also publishes the automatic updates that are waiting." : "You have unsaved changes.";
  };
  var status = function (text, kind) { var s = document.getElementById("status"); if (s) { s.textContent = text; s.className = "status " + (kind || ""); } };

  // ------------------------------------------------------------ sign in
  function signIn(message) {
    var input = el("input", { type: "password", autocomplete: "off", placeholder: "github_pat_…", "aria-label": "Access token" });
    var err = el("p", { class: "err", textContent: message || "" });
    var go = function () {
      token = input.value.trim();
      if (!token) { err.textContent = "Paste your access token first."; return; }
      err.textContent = "Checking…";
      api("").then(function () { try { localStorage.setItem("desk-token", token); } catch (e) {} start(); })
        .catch(function (e) { token = null; err.textContent = e.status === 401 ? "GitHub did not accept that token." : "That token cannot open the site repository. Check its repository access."; });
    };
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") go(); });
    document.getElementById("app").replaceChildren(el("div", { class: "sign" }, [
      el("h1", { textContent: "Desk" }),
      el("p", { textContent: "Sign in with a GitHub access token. It is kept only in this browser and is sent only to GitHub." }),
      el("ol", {}, [
        el("li", {}, ["Open ", el("a", { href: "https://github.com/settings/personal-access-tokens/new", target: "_blank", rel: "noopener", textContent: "GitHub → Fine-grained tokens → Generate new token" }), "."]),
        el("li", { textContent: "Repository access: Only select repositories → wasiul-bahar-site-source." }),
        el("li", { textContent: "Permissions: Contents → Read and write. Actions → Read-only." }),
        el("li", { textContent: "Generate, copy the token and paste it here." })
      ]),
      input, err, btn("Sign in", go, "go")
    ]));
    input.focus();
  }

  // ------------------------------------------------------------ load and save
  function start() {
    document.getElementById("app").replaceChildren(el("p", { textContent: "Opening your content…" }));
    Promise.all([api("/contents/content.json"), readJson("live/on_this_day.json"), readJson("live/inbox.json"), readJson("live/last_run.json")]).then(function (r) {
      sha = r[0].sha; saved = JSON.stringify(JSON.parse(unb64(r[0].content))); content = JSON.parse(saved);
      otdAuto = r[1] || {}; inbox = r[2] || []; lastRun = r[3] || {};
      ["otd_manual", "otd_hidden", "inbox_done"].forEach(function (k) { content[k] = content[k] || []; });
      content.settings = content.settings || { alert_feeds: [] };
      saved = JSON.stringify(content);
      if (!openInbox().length) current = "stories";
      shell(); watch(false);
    }).catch(function (e) { if (e.status === 401 || e.status === 403 || e.status === 404) { token = null; signIn("Your token no longer works. Sign in again."); } else document.getElementById("app").replaceChildren(el("p", { class: "err", textContent: "Could not load: " + e.message })); });
  }
  function save() {
    var button = document.getElementById("save");
    button.disabled = true; status("Saving…", "busy");
    var bytes = new TextEncoder().encode(JSON.stringify(content, null, 1));
    api("/contents/content.json", { method: "PUT", body: { message: "Desk: update content", content: b64(bytes), sha: sha } }).then(function (r) {
      sha = r.content.sha; saved = JSON.stringify(content); touch(); button.disabled = false;
      savedAt = Date.now(); status("Saved. Publishing…", "busy"); setTimeout(function () { watch(true); }, 8000);
    }).catch(function (e) {
      button.disabled = false;
      status(e.status === 409 ? "The content changed elsewhere. Reload the page, then redo your edit." : "Not saved: " + e.message, "bad");
    });
  }
  // Follows the "Update site" job: the newest run tells us whether the last change is live.
  function watch(keep) {
    api("/actions/runs?per_page=1", { optional: true }).then(function (r) {
      var run = r && r.workflow_runs && r.workflow_runs[0];
      if (!run) { status(lastRun.time ? "Last update: " + new Date(lastRun.time).toLocaleString() : "Ready"); return; }
      var when = new Date(run.updated_at).toLocaleString();
      // just after a save the newest run may still be the previous one: wait for ours to appear (up to 90 seconds)
      if (keep && savedAt && new Date(run.created_at).getTime() < savedAt - 5000 && Date.now() - savedAt < 90000) { setTimeout(function () { watch(true); }, 8000); return; }
      if (run.status !== "completed") { status("Publishing… (about two minutes)", "busy"); if (keep !== null) setTimeout(function () { watch(true); }, 10000); }
      else if (run.conclusion === "success") status("Live. Last update " + when, "ok");
      else status("Last update failed the checks (" + when + "). The site was left as it was.", "bad");
    }).catch(function () { status("Ready"); });
  }
  function upload(file) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        var k = Math.min(1, 1600 / Math.max(img.width, img.height)), c = document.createElement("canvas");
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        c.toBlob(function (blob) {
          blob.arrayBuffer().then(function (buf) {
            var name = file.name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) + "-" + Date.now().toString(36) + ".jpg";
            return api("/contents/uploads/" + name, { method: "PUT", body: { message: "Desk: add photo", content: b64(new Uint8Array(buf)) } }).then(function () { resolve(name); });
          }).catch(reject);
        }, "image/jpeg", 0.88);
      };
      img.onerror = function () { reject(new Error("That file is not a picture.")); };
      img.src = URL.createObjectURL(file);
    });
  }

  // ------------------------------------------------------------ the page
  var openInbox = function () { return inbox.filter(function (i) { return content.inbox_done.indexOf(i.id) < 0; }); };
  function shell() {
    document.getElementById("app").replaceChildren(
      el("header", { class: "top" }, [el("h1", { textContent: "Desk" }), el("span", { class: "status", id: "status", textContent: "Ready", role: "status" }),
        el("a", { class: "btn small", href: "./", target: "_blank", rel: "noopener", textContent: "Open the site" })]),
      lastRun.pending ? el("div", { class: "pending", id: "pending" }, [
        el("b", { textContent: "Automatic updates are ready, and not live yet." }),
        el("ul", {}, (lastRun.notes && lastRun.notes.length ? lastRun.notes : ["Nothing changed except the weekly refresh."]).map(function (n) { return el("li", { textContent: n }); })),
        el("p", { textContent: "New stories are in the Stories list, marked “auto”: edit, hide or remove them first if you like." }),
        btn("Publish now", function () { content.settings.published_at = new Date().toISOString(); lastRun.pending = false; document.getElementById("pending").remove(); save(); }, "go")]) : null,
      el("div", { class: "layout" }, [el("nav", { class: "sections", id: "nav", "aria-label": "Sections" }), el("main", { id: "main" })]));
    renderNav(); render();
  }
  function renderNav() {
    var nav = document.getElementById("nav");
    if (!nav) return;
    nav.replaceChildren.apply(nav, SECTIONS.map(function (s) {
      var n = s.key === "inbox" ? openInbox().length : Array.isArray(content[s.key]) ? content[s.key].length : "";
      return el("button", { type: "button", "aria-current": String(s.key === current), on: { click: function () { current = s.key; openItem = null; renderNav(); render(); } } },
        [s.label, el("span", { class: "n" + (s.key === "inbox" && n ? " alert" : ""), textContent: n === 0 && s.key === "inbox" ? "" : String(n) })]);
    }));
  }
  function render() {
    var s = byKey(current), main = document.getElementById("main");
    var views = { inbox: viewInbox, quick: viewQuick, settings: viewSettings, otd_manual: viewOtd };
    main.replaceChildren.apply(main, (views[current] || viewList)(s));
  }

  function field(item, f, s) {
    var label = el("label", { class: f.wide || f.area || f.lines || f.pairs || f.image ? "wide" : "" }, [f.l]);
    var set = function (v) { if (v === "" || v == null || (Array.isArray(v) && !v.length)) delete item[f.n]; else item[f.n] = v; if (f.n !== "hidden") delete item.auto; touch(); };
    var input;
    if (f.opts) {
      input = el("select", {}, f.opts.concat(f.opts.indexOf(item[f.n] || "") < 0 ? [item[f.n]] : []).map(function (o) { return el("option", { value: o, textContent: o || "(none)" }); }));
      input.value = item[f.n] || ""; if (!item[f.n] && f.opts[0]) item[f.n] = f.opts[0];
      input.addEventListener("change", function () { set(input.value); });
    } else if (f.lines || f.pairs) {
      input = el("textarea", { value: (item[f.n] || []).map(function (v) { return f.pairs ? v.join(" | ") : v; }).join("\n") });
      input.addEventListener("input", function () {
        var rows = input.value.split("\n").map(function (r) { return r.trim(); }).filter(Boolean);
        set(f.pairs ? rows.map(function (r) { var i = r.indexOf("|"); return i < 0 ? [r, ""] : [r.slice(0, i).trim(), r.slice(i + 1).trim()]; }) : rows);
      });
    } else if (f.image) {
      var name = el("span", { textContent: item[f.n] || "No photo yet" }), msg = el("span", { class: "err" });
      input = el("input", { type: "file", accept: "image/*" });
      input.addEventListener("change", function () {
        if (!input.files[0]) return;
        msg.textContent = "Uploading…";
        upload(input.files[0]).then(function (n) { set(n); name.textContent = n; msg.textContent = ""; }).catch(function (e) { msg.textContent = e.message; });
      });
      label.appendChild(name); label.appendChild(input); label.appendChild(msg);
      if (item[f.n]) label.appendChild(btn("Remove photo", function () { set(""); if (s.key === "otd_manual") delete item.thumb; render(); }, "small"));
      return label;
    } else {
      input = el(f.area ? "textarea" : "input", { value: item[f.n] == null ? "" : item[f.n] });
      if (f.type) input.type = f.type;
      if (f.list) {
        var id = "list-" + f.n, seen = {};
        input.setAttribute("list", id);
        label.appendChild(el("datalist", { id: id }, content[s.key].map(function (i) { return i[f.n]; }).filter(function (v) { return v && !seen[v] && (seen[v] = 1); }).map(function (v) { return el("option", { value: v }); })));
      }
      input.addEventListener("input", function () { set(input.value.trim() === "" ? "" : input.value); });
    }
    label.appendChild(input);
    return label;
  }
  function itemCard(s, list, i) {
    var item = list[i], isOpen = openItem === item;
    var move = function (d) { return function () { var j = i + d; if (j < 0 || j >= list.length) return; list.splice(j, 0, list.splice(i, 1)[0]); touch(); render(); }; };
    var title = el("span", { class: "t" }, [s.title(item) || "(empty)", s.sub && s.sub(item) ? el("span", { class: "s", textContent: s.sub(item) }) : null]);
    var row = el("div", { class: "row" }, [title,
      item.auto ? el("span", { class: "tag", textContent: "auto" }) : null, item.hidden ? el("span", { class: "tag", textContent: "hidden" }) : null,
      s.fixedOrder ? null : btn("↑", move(-1), "small"), s.fixedOrder ? null : btn("↓", move(1), "small"),
      btn(isOpen ? "Close" : "Edit", function () { openItem = isOpen ? null : item; render(); }, "small"),
      btn(item.hidden ? "Show" : "Hide", function () { if (item.hidden) delete item.hidden; else item.hidden = true; touch(); render(); }, "small"),
      btn("Remove", function () { if (confirm("Remove “" + (s.title(item) || "this item") + "” from the site?")) {
        // a removed Nutshell story is remembered, so the weekly job does not bring it back
        if (s.key === "stories" && item.slug && !item.url) (content.removed_stories = content.removed_stories || []).push(item.slug);
        list.splice(i, 1); if (isOpen) openItem = null; touch(); render(); } }, "small warn")]);
    var card = el("div", { class: "item" + (item.hidden ? " hidden-item" : "") }, [row]);
    if (isOpen) card.appendChild(el("div", { class: "form" }, s.fields.map(function (f) { return field(item, f, s); })));
    return card;
  }
  function viewList(s) {
    var list = content[s.key];
    var add = btn("Add new", function () { var item = {}; if (s.top) list.unshift(item); else list.push(item); openItem = item; touch(); render(); }, "go");
    return [el("h2", { textContent: s.label }), el("p", { class: "hint", textContent: s.hint || "" }), el("div", { class: "bar" }, [add])]
      .concat(list.map(function (_, i) { return itemCard(s, list, i); }));
  }

  function viewOtd(s) {
    var out = viewList(s);
    out[1].textContent = "Add your own photo to any date: it always shows first on its day. Below, hide any automatic photo you don’t want; it will not come back.";
    var days = Object.keys(otdAuto).sort(), pick = el("select", { "aria-label": "Day" }, days.map(function (d) {
      return el("option", { value: d, textContent: +d.slice(3) + " " + MONTHS[+d.slice(0, 2)] + " (" + [].concat(otdAuto[d]).length + ")" }); }));
    var grid = el("div", { class: "otd-grid" });
    var draw = function () {
      grid.replaceChildren.apply(grid, [].concat(otdAuto[pick.value] || []).map(function (e) {
        var hid = content.otd_hidden.indexOf(e.page) >= 0;
        return el("figure", { class: hid ? "hidden-item" : "" }, [el("img", { src: e.thumb, alt: "", loading: "lazy" }),
          el("figcaption", {}, [e.title + " · " + e.date, btn(hid ? "Show again" : "Hide", function () {
            if (hid) content.otd_hidden.splice(content.otd_hidden.indexOf(e.page), 1); else content.otd_hidden.push(e.page);
            touch(); draw(); }, "small")])]);
      }));
    };
    var now = new Date(), today = ("0" + (now.getMonth() + 1)).slice(-2) + "-" + ("0" + now.getDate()).slice(-2);
    pick.value = days.indexOf(today) >= 0 ? today : days.filter(function (d) { return d >= today; })[0] || days[0];
    pick.addEventListener("change", draw); draw();
    return out.concat([el("h2", { textContent: "Automatic photos", style: "margin-top:24px" }), el("div", { class: "bar" }, [pick]), grid]);
  }

  function viewInbox() {
    var items = openInbox();
    var done = function (i) { content.inbox_done.push(i.id); touch(); render(); };
    var out = [el("h2", { textContent: "Inbox" }), el("p", { class: "hint", textContent: "Things the weekly job found. Nothing here is on the site until you approve it." })];
    if (lastRun.notes && lastRun.notes.length) out.push(el("ul", { class: "notes" }, lastRun.notes.map(function (n) { return el("li", { textContent: n }); })));
    if (lastRun.errors && lastRun.errors.length) out.push(el("ul", { class: "notes" }, lastRun.errors.map(function (n) { return el("li", { class: "err", textContent: n }); })));
    if (!items.length) out.push(el("p", { textContent: "Nothing is waiting for you." }));
    return out.concat(items.map(function (i) {
      var actions = i.kind === "press"
        ? [btn("Add to Press", function () { var p = { url: i.url, outlet: i.outlet, what: i.title }; content.press.unshift(p); done(i); current = "press"; openItem = p; renderNav(); render(); }, "small go"), btn("Skip", function () { done(i); }, "small")]
        : [btn("Go to " + (byKey(i.where) || {}).label, function () { current = i.where; renderNav(); render(); }, "small"), btn("Dismiss", function () { done(i); }, "small")];
      return el("div", { class: "item" }, [el("div", { class: "row" }, [el("span", { class: "t" }, [i.title, el("a", { class: "s", href: i.url, target: "_blank", rel: "noopener", textContent: i.url })])].concat(actions))]);
    }));
  }

  function viewQuick() {
    var d = { kind: "Award", month: MONTHS[new Date().getMonth() + 1], year: String(new Date().getFullYear()) };
    var fields = [F("kind", "What is it?", { opts: ["Award", "Conference"] }), F("title", "Title"), F("org", "Organisation (award) or city and country (conference)"),
      F("month", "Month", { opts: MONTHS }), F("year", "Year"), F("link", "Link", { wide: 1 }), F("line", "One line about it", { wide: 1 }), F("photo", "Photo for the polaroid", { image: 1 })];
    var err = el("p", { class: "err" }), fake = { key: "quick" };
    var add = function () {
      if (!d.title || !d.org || !d.year) { err.textContent = "Fill in the title, the organisation or place, and the year."; return; }
      var award = d.kind === "Award", line = d.line || "";
      content.journey.push({ year: d.year, month: d.month || "", track: award ? "Award" : "Event", title: d.title, detail: d.org + (line ? ". " + line : ""), link: d.link || "", photo: d.photo || "" });
      var group = award ? "Awards and certificates" : "Conferences attended", at = content.cv.map(function (c) { return c.group; }).indexOf(group);
      content.cv.splice(at < 0 ? content.cv.length : at, 0, { group: group, role: d.title, org: d.org, when: (award ? "" : (d.month ? d.month + " " : "")) + d.year, what: line });
      if (award) content.home_awards.unshift({ year: d.year, title: d.title, line: d.org + "." });
      touch(); current = "journey"; renderNav(); render();
    };
    return [el("h2", { textContent: "Quick add" }), el("p", { class: "hint", textContent: "Fill this in once. An award goes to the CV, the home Recognition list and the Journey page; a conference goes to the CV and the Journey page. You can fine-tune each copy afterwards." }),
      el("div", { class: "item" }, [el("div", { class: "form", style: "border-top:0" }, fields.map(function (f) { return field(d, f, fake); }))]), err, btn("Add it", add, "go")];
  }

  function viewSettings() {
    var feeds = el("textarea", { value: (content.settings.alert_feeds || []).join("\n"), "aria-label": "Alert feeds" });
    feeds.addEventListener("input", function () { content.settings.alert_feeds = feeds.value.split("\n").map(function (r) { return r.trim(); }).filter(Boolean); touch(); });
    var review = el("input", { type: "checkbox", checked: !!content.settings.review_first, style: "width:auto" });
    review.addEventListener("change", function () { if (review.checked) content.settings.review_first = true; else delete content.settings.review_first; touch(); });
    return [el("h2", { textContent: "Settings" }),
      el("label", { style: "display:flex;gap:10px;align-items:center;font-weight:600;margin-bottom:6px" }, [review, "Let me review automatic updates before they go live"]),
      el("p", { class: "hint", textContent: "When this is on, the Monday update is prepared but not published. You see what changed at the top of this page and press Publish now. Your own edits here still go live when you save." }),
      el("p", { class: "hint", textContent: "Press suggestions: create a Google Alert for your name with “Deliver to: RSS feed”, then paste the feed address here, one per line. New mentions then appear in the Inbox every Monday." }),
      feeds, el("p", {}, []),
      el("div", { class: "bar" }, [btn("Sign out of this browser", function () { if (dirty() && !confirm("You have unsaved changes. Sign out anyway?")) return; try { localStorage.removeItem("desk-token"); } catch (e) {} location.reload(); }, "warn")])];
  }

  document.getElementById("save").addEventListener("click", save);
  document.getElementById("discard").addEventListener("click", function () { if (confirm("Throw away the changes you have not saved?")) { content = JSON.parse(saved); openItem = null; touch(); render(); } });
  window.addEventListener("beforeunload", function (e) { if (dirty()) { e.preventDefault(); e.returnValue = ""; } });
  if (token) start(); else signIn();
})();
