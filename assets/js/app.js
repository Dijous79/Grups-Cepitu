/* ==========================================================================
   Cepitu · Grups de colònies
   Repartiment de monitors per grups amb arrossegar i deixar anar
   (ratolí i tàctil) i restriccions de parelles que no poden anar juntes.
   ========================================================================== */

(() => {
  "use strict";

  const GROUPS = [
    { id: "PETITS", cap: 6, img: "petits.jpg" },
    { id: "MITJANS", cap: 7, img: "mitjans.jpg" },
    { id: "GRANS", cap: 7, img: "grans.jpg" },
    { id: "K1", cap: 7, img: "k1.jpg" },
    { id: "K2", cap: 7, img: "k2.jpg" },
    { id: "RUTA", cap: 6, img: "ruta.jpg" },
  ];

  const DEFAULT_PEOPLE = [
    "MC", "Chali", "Inyi", "Tondes", "Bru", "Eli", "Riki", "Ro", "Q.", "Geis",
    "Muli", "Paupo", "Ani", "Benet", "Qwerty", "Neus", "Santi", "Quimpu", "Quimta", "Cris",
    "Ivet", "Berta", "Marvi", "Biel", "AinaBo", "Max", "T. Forre", "Judit", "Vicen", "Bellau",
    "Ton", "Erica", "MartinaBo", "AinCo", "Lucas", "Pauri", "MartinaFo", "Anglarill", "Herruzo", "Dani",
  ];

  const STORAGE_KEY = "cepitu-grups-v1";
  const POOL = "pool";

  const AVATARS = [
    ["#e3efe5", "#12301c"],
    ["#fbe9c8", "#7a4b0c"],
    ["#fde3d8", "#c4502a"],
    ["#dde9f4", "#1f4a73"],
    ["#ece3f5", "#5b3a7a"],
    ["#dff0ea", "#1e5a4c"],
  ];

  const $ = (sel, root = document) => root.querySelector(sel);
  const el = (tag, props = {}, ...children) => {
    const node = Object.assign(document.createElement(tag), props);
    for (const c of children) if (c != null) node.append(c);
    return node;
  };
  const ICON_TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>';

  /* ---------- Estat ---------- */

  let state = load() || freshState(DEFAULT_PEOPLE);
  let selected = null;

  function freshState(people, rules = []) {
    const groups = { [POOL]: [...people] };
    for (const g of GROUPS) groups[g.id] = [];
    return { people: [...people], groups, rules };
  }

  // Garanteix que cada monitor és exactament a una llista.
  function normalize(s) {
    const people = [...new Set((s.people || []).filter((n) => typeof n === "string" && n.trim()))];
    const known = new Set(people);
    const seen = new Set();
    const groups = {};
    for (const key of [...GROUPS.map((g) => g.id), POOL]) {
      groups[key] = ((s.groups && s.groups[key]) || []).filter((n) => known.has(n) && !seen.has(n) && seen.add(n));
    }
    for (const n of people) if (!seen.has(n)) groups[POOL].push(n);
    const rules = (s.rules || []).filter((r) => r && known.has(r.a) && known.has(r.b) && r.a !== r.b);
    return { people, groups, rules };
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? normalize(JSON.parse(raw)) : null;
    } catch { return null; }
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* sense emmagatzematge */ }
  }

  function groupOf(name) {
    for (const key in state.groups) if (state.groups[key].includes(name)) return key;
    return POOL;
  }

  function move(name, to, index = Infinity) {
    for (const key in state.groups) {
      const i = state.groups[key].indexOf(name);
      if (i !== -1) state.groups[key].splice(i, 1);
    }
    const list = state.groups[to];
    list.splice(Math.min(index, list.length), 0, name);
  }

  // Retorna { byPerson: Map(nom -> [regles]), byGroup: Map(grup -> [regles]) }
  function conflicts() {
    const byPerson = new Map();
    const byGroup = new Map();
    for (const g of GROUPS) {
      const members = new Set(state.groups[g.id]);
      for (const r of state.rules) {
        if (members.has(r.a) && members.has(r.b)) {
          if (!byGroup.has(g.id)) byGroup.set(g.id, []);
          byGroup.get(g.id).push(r);
          for (const [p, other] of [[r.a, r.b], [r.b, r.a]]) {
            if (!byPerson.has(p)) byPerson.set(p, []);
            byPerson.get(p).push(other);
          }
        }
      }
    }
    return { byPerson, byGroup };
  }

  function wouldConflict(name, groupId) {
    const members = new Set(state.groups[groupId]);
    return state.rules
      .filter((r) => (r.a === name && members.has(r.b)) || (r.b === name && members.has(r.a)))
      .map((r) => (r.a === name ? r.b : r.a));
  }

  function commit() {
    save();
    render();
  }

  /* ---------- Pintat ---------- */

  function hash(str) {
    let h = 0;
    for (const ch of str) h = (h * 31 + ch.codePointAt(0)) >>> 0;
    return h;
  }

  function initials(name) {
    const words = name.split(/[\s.]+/).filter(Boolean);
    if (words.length > 1) return (words[0][0] + words[1][0]).toUpperCase();
    const w = words[0] || name;
    const inner = w.slice(1).search(/[A-ZÀ-Ý]/);
    if (inner !== -1) return (w[0] + w[inner + 1]).toUpperCase();
    return w.length <= 2 ? w.toUpperCase() : w[0].toUpperCase() + w[1].toLowerCase();
  }

  function chip(name, conflictWith) {
    const [bg, ink] = AVATARS[hash(name) % AVATARS.length];
    const node = el("button", { type: "button", className: "chip" });
    node.dataset.name = name;
    node.style.setProperty("--av", bg);
    node.style.setProperty("--av-ink", ink);
    const text = el("span", { className: "chip__text" }, el("span", { textContent: name }));
    if (conflictWith && conflictWith.length) {
      node.classList.add("is-conflict");
      text.append(el("span", { className: "chip__warn", textContent: "✕ " + conflictWith.join(", ") }));
      node.title = `${name} no pot anar amb ${conflictWith.join(", ")}`;
    }
    if (name === selected) node.classList.add("is-selected");
    node.append(el("span", { className: "chip__av", textContent: initials(name), ariaHidden: "true" }), text);
    return node;
  }

  function render() {
    const { byPerson, byGroup } = conflicts();

    // Sense grup
    const pool = $("#pool");
    pool.dataset.empty = "Tots els monitors tenen grup 🎉";
    pool.replaceChildren(...state.groups[POOL].map((n) => chip(n)));
    $("#pool-count").textContent = state.groups[POOL].length;

    // Grups
    const wrap = $("#groups");
    wrap.replaceChildren(...GROUPS.map((g) => {
      const members = state.groups[g.id];
      const bad = byGroup.get(g.id) || [];
      const n = members.length;
      const status = bad.length ? "bad" : n > g.cap ? "over" : n === g.cap ? "full" : "";

      const card = el("section", { className: "group" });
      card.dataset.group = g.id;
      if (bad.length) card.classList.add("group--conflict");
      if (n > g.cap) card.classList.add("group--over");
      if (n === g.cap) card.classList.add("group--full");

      const cap = el("span", { className: "cap" + (status ? " cap--" + status : "") });
      cap.textContent = (bad.length ? "⚠ " : n === g.cap ? "✓ " : "") + `${n}/${g.cap}`;
      if (n > g.cap) cap.title = `Hi ha ${n - g.cap} monitor(s) de més`;

      const head = el("header", { className: "group__head" },
        el("img", { src: "assets/img/colonies/" + g.img, alt: "", loading: "lazy" }),
        el("h3", { textContent: g.id }),
        cap,
      );
      const meter = el("div", { className: "meter" }, el("span"));
      meter.firstChild.style.width = Math.min(100, (n / g.cap) * 100) + "%";

      const zone = el("div", { className: "dropzone" });
      zone.dataset.drop = g.id;
      zone.dataset.empty = selected ? "Toca aquí per posar-hi " + selected : "Arrossega monitors aquí";
      zone.append(...members.map((m) => chip(m, byPerson.get(m))));

      card.append(head, meter, zone);
      if (bad.length) {
        card.append(el("ul", { className: "conflicts" }, ...bad.map((r) =>
          el("li", {}, el("span", {},
            `${r.a} i ${r.b} no poden anar junts`,
            r.note ? el("small", { textContent: " · " + r.note }) : null)))));
      }
      return card;
    }));

    // Estadístiques
    const placed = state.people.length - state.groups[POOL].length;
    const nConf = [...byGroup.values()].reduce((s, l) => s + l.length, 0);
    const over = GROUPS.filter((g) => state.groups[g.id].length > g.cap);
    const stats = [
      `<span class="stat${placed === state.people.length ? " stat--ok" : ""}"><strong>${placed}/${state.people.length}</strong> amb grup</span>`,
      nConf
        ? `<span class="stat stat--bad"><strong>${nConf}</strong> ${nConf === 1 ? "restricció trencada" : "restriccions trencades"}</span>`
        : `<span class="stat stat--ok">✓ Cap restricció trencada</span>`,
    ];
    if (over.length) stats.push(`<span class="stat">Massa gent a <strong>${over.map((g) => g.id).join(", ")}</strong></span>`);
    $("#stats").innerHTML = stats.join("");

    const rulesBtn = $("#btn-rules");
    $("#rules-count").textContent = state.rules.length;
    rulesBtn.classList.toggle("has-conflict", nConf > 0);

    renderMovebar();
    if ($("#dlg-rules").open) renderRules();
    if ($("#dlg-people").open) renderPeople();
  }

  /* ---------- Selecció per toc (alternativa a arrossegar) ---------- */

  function select(name) {
    selected = selected === name ? null : name;
    render();
  }

  function renderMovebar() {
    const bar = $("#movebar");
    document.body.classList.toggle("is-picking", !!selected);
    document.body.classList.toggle("has-movebar", !!selected);
    if (!selected) { bar.hidden = true; return; }
    bar.hidden = false;
    $("#movebar-name").textContent = selected;
    const current = groupOf(selected);
    const targets = GROUPS.map((g) => {
      const n = state.groups[g.id].length;
      const clash = current === g.id ? [] : wouldConflict(selected, g.id);
      const b = el("button", { type: "button" }, g.id, el("small", { textContent: clash.length ? "⚠ " + clash.join(", ") : `${n}/${g.cap}` }));
      b.dataset.to = g.id;
      if (current === g.id) b.classList.add("is-current");
      if (clash.length) { b.classList.add("is-bad"); b.title = `No pot anar amb ${clash.join(", ")}`; }
      return b;
    });
    const out = el("button", { type: "button", className: "ghost" }, "Sense grup");
    out.dataset.to = POOL;
    const cancel = el("button", { type: "button", className: "ghost" }, el("small", { textContent: "Cancel·la" }));
    cancel.dataset.to = "";
    $("#movebar-targets").replaceChildren(...targets, out, cancel);
  }

  function placeSelected(to) {
    const name = selected;
    selected = null;
    if (to && groupOf(name) !== to) {
      move(name, to);
      announceMove(name, to);
      commit();
      flash(name);
    } else render();
  }

  function announceMove(name, to) {
    if (to === POOL) return;
    const clash = wouldConflict(name, to).filter((n) => n !== name);
    const g = GROUPS.find((x) => x.id === to);
    if (clash.length) toast(`⚠ ${name} no pot anar amb ${clash.join(", ")}`, true);
    else if (state.groups[to].length > g.cap) toast(`${to} ja té ${state.groups[to].length} monitors (màxim ${g.cap})`, true);
  }

  function flash(name) {
    const node = document.querySelector(`.chip[data-name="${CSS.escape(name)}"]`);
    if (node) node.classList.add("is-flash");
  }

  $("#movebar-targets").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) placeSelected(b.dataset.to);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && selected && !document.querySelector("dialog[open]")) { selected = null; render(); }
  });

  /* ---------- Arrossegar (Pointer Events: ratolí, llapis i tàctil) ---------- */

  let drag = null;
  let suppressClickUntil = 0;
  const LONG_PRESS = 220;

  document.addEventListener("pointerdown", (e) => {
    const node = e.target.closest(".chip");
    if (!node || e.button !== 0 || node.classList.contains("chip--ghost")) return;
    drag = {
      name: node.dataset.name, node, type: e.pointerType,
      x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY,
      started: false, timer: 0, ghost: null, raf: 0,
    };
    if (e.pointerType !== "mouse") {
      drag.timer = setTimeout(() => drag && startDrag(), LONG_PRESS);
    }
  });

  window.addEventListener("pointermove", (e) => {
    if (!drag) return;
    drag.x = e.clientX;
    drag.y = e.clientY;
    const dist = Math.hypot(drag.x - drag.x0, drag.y - drag.y0);
    if (!drag.started) {
      if (drag.type === "mouse" && dist > 5) startDrag();
      else if (drag.type !== "mouse" && dist > 10) cancelDrag(); // l'usuari està fent scroll
      return;
    }
    e.preventDefault();
    positionGhost();
    hitTest();
  }, { passive: false });

  window.addEventListener("pointerup", () => { if (drag) drag.started ? endDrag() : cancelDrag(); });
  window.addEventListener("pointercancel", () => { if (drag) drag.started ? endDrag(true) : cancelDrag(); });

  // Un cop comença l'arrossegament tàctil, el dit no ha de fer scroll a la pàgina.
  document.addEventListener("touchmove", (e) => { if (drag && drag.started) e.preventDefault(); }, { passive: false });
  document.addEventListener("contextmenu", (e) => { if (e.target.closest(".chip")) e.preventDefault(); });

  function startDrag() {
    clearTimeout(drag.timer);
    drag.started = true;
    selected = null;
    window.getSelection()?.removeAllRanges();
    document.body.classList.remove("is-picking", "has-movebar");
    $("#movebar").hidden = true;
    document.querySelectorAll(".chip.is-selected").forEach((c) => c.classList.remove("is-selected"));

    const r = drag.node.getBoundingClientRect();
    drag.offX = drag.x0 - r.left;
    drag.offY = drag.y0 - r.top;
    const ghost = drag.node.cloneNode(true);
    ghost.classList.add("chip--ghost");
    ghost.classList.remove("is-flash");
    ghost.style.width = r.width + "px";
    document.body.append(ghost);
    drag.ghost = ghost;
    drag.node.classList.add("is-placeholder");
    positionGhost();
    if (drag.type !== "mouse" && navigator.vibrate) navigator.vibrate(12);
    autoScroll();
  }

  function positionGhost() {
    drag.ghost.style.setProperty("--x", drag.x - drag.offX + "px");
    drag.ghost.style.setProperty("--y", drag.y - drag.offY + "px");
  }

  function zoneAt(x, y) {
    const hit = document.elementFromPoint(x, y);
    if (!hit) return null;
    const holder = hit.closest(".group, .pool");
    return holder ? holder.querySelector("[data-drop]") : null;
  }

  function hitTest() {
    const zone = zoneAt(drag.x, drag.y);
    document.querySelectorAll(".dropzone.is-over").forEach((z) => z !== zone && z.classList.remove("is-over"));
    if (!zone) return;
    zone.classList.add("is-over");

    // Busca la targeta davant de la qual s'ha d'inserir (ordre de lectura).
    let ref = null;
    for (const c of zone.querySelectorAll(".chip")) {
      if (c === drag.node) continue;
      const r = c.getBoundingClientRect();
      if (drag.y < r.top || (drag.y <= r.bottom && drag.x < r.left + r.width / 2)) { ref = c; break; }
    }
    if (drag.node.parentElement !== zone || drag.node.nextElementSibling !== ref) {
      zone.insertBefore(drag.node, ref);
    }
  }

  function autoScroll() {
    if (!drag || !drag.started) return;
    const edge = 80;
    const h = window.innerHeight;
    let dy = 0;
    if (drag.y < edge) dy = -Math.ceil((edge - drag.y) / 5);
    else if (drag.y > h - edge) dy = Math.ceil((drag.y - (h - edge)) / 5);
    if (dy) { window.scrollBy(0, dy); hitTest(); }
    drag.raf = requestAnimationFrame(autoScroll);
  }

  function endDrag(cancelled = false) {
    const { name, node, ghost } = drag;
    cancelAnimationFrame(drag.raf);
    ghost.remove();
    document.querySelectorAll(".dropzone.is-over").forEach((z) => z.classList.remove("is-over"));
    suppressClickUntil = Date.now() + 400;
    drag = null;

    const zone = node.parentElement;
    if (cancelled || !zone || !zone.dataset.drop) { render(); return; }
    const to = zone.dataset.drop;
    const index = [...zone.querySelectorAll(".chip")].indexOf(node);
    const from = groupOf(name);
    move(name, to, index);
    if (from !== to) announceMove(name, to);
    commit();
    if (from !== to) flash(name);
  }

  function cancelDrag() {
    clearTimeout(drag.timer);
    drag = null;
  }

  // Toc / clic / teclat: selecciona la targeta o la deixa al grup tocat.
  document.addEventListener("click", (e) => {
    if (Date.now() < suppressClickUntil) return;
    const node = e.target.closest(".chip");
    if (node && !node.classList.contains("chip--ghost")) { select(node.dataset.name); return; }
    if (selected) {
      const holder = e.target.closest(".group, .pool");
      if (holder && !e.target.closest("dialog, .movebar, .toolbar")) {
        placeSelected(holder.querySelector("[data-drop]").dataset.drop);
      }
    }
  });

  /* ---------- Reparteix automàticament ---------- */

  $("#btn-auto").addEventListener("click", () => {
    const pending = [...state.groups[POOL]];
    if (!pending.length) { toast("Tots els monitors ja tenen grup"); return; }
    for (let i = pending.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pending[i], pending[j]] = [pending[j], pending[i]];
    }
    // Primer els que tenen més restriccions, que són els més difícils de col·locar.
    const weight = (n) => state.rules.filter((r) => r.a === n || r.b === n).length;
    pending.sort((a, b) => weight(b) - weight(a));

    const left = [];
    for (const name of pending) {
      const options = GROUPS
        .filter((g) => state.groups[g.id].length < g.cap && !wouldConflict(name, g.id).length)
        .map((g) => ({ g, free: g.cap - state.groups[g.id].length + Math.random() * 0.5 }))
        .sort((a, b) => b.free - a.free);
      if (options.length) move(name, options[0].g.id);
      else left.push(name);
    }
    selected = null;
    commit();
    const placed = pending.length - left.length;
    toast(left.length
      ? `${placed} col·locats · ${left.length} sense lloc (${left.join(", ")})`
      : `${placed} monitors repartits respectant les restriccions`, left.length > 0);
  });

  $("#btn-reset").addEventListener("click", () => {
    if (!confirm("Vols treure tots els monitors dels grups? Les restriccions es mantenen.")) return;
    state = freshState(state.people, state.rules);
    selected = null;
    commit();
    toast("Grups buidats");
  });

  /* ---------- Restriccions ---------- */

  const dlgRules = $("#dlg-rules");

  $("#btn-rules").addEventListener("click", () => {
    renderRules();
    dlgRules.showModal();
  });

  function fillSelect(select, value) {
    const names = [...state.people].sort((a, b) => a.localeCompare(b, "ca"));
    select.replaceChildren(el("option", { value: "", textContent: "Tria monitor…" }),
      ...names.map((n) => el("option", { value: n, textContent: n })));
    select.value = value && names.includes(value) ? value : "";
  }

  function where(name) {
    const g = groupOf(name);
    return g === POOL ? "sense grup" : g;
  }

  function renderRules() {
    fillSelect($("#rule-a"), $("#rule-a").value);
    fillSelect($("#rule-b"), $("#rule-b").value);
    const list = $("#rule-list");
    if (!state.rules.length) {
      list.replaceChildren(el("li", { className: "empty", textContent: "Encara no hi ha cap restricció." }));
      return;
    }
    list.replaceChildren(...state.rules.map((r, i) => {
      const ga = groupOf(r.a);
      const gb = groupOf(r.b);
      const broken = ga !== POOL && ga === gb;
      const meta = broken
        ? `⚠ Ara mateix tots dos són a ${ga}`
        : `${r.a}: ${where(r.a)} · ${r.b}: ${where(r.b)}`;
      const names = el("div", { className: "names" }, r.a, el("span", { textContent: "✕" }), r.b);
      const del = el("button", { type: "button", className: "icon-btn", innerHTML: ICON_TRASH, ariaLabel: `Esborra ${r.a} ✕ ${r.b}` });
      del.dataset.rule = i;
      const li = el("li", {}, el("div", {}, names,
        el("div", { className: "meta", textContent: (r.note ? r.note + " · " : "") + meta })), del);
      if (broken) li.classList.add("is-broken");
      return li;
    }));
  }

  $("#rule-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const a = $("#rule-a").value;
    const b = $("#rule-b").value;
    const note = $("#rule-note").value.trim();
    if (!a || !b) return;
    if (a === b) { toast("Tria dos monitors diferents", true); return; }
    if (state.rules.some((r) => (r.a === a && r.b === b) || (r.a === b && r.b === a))) {
      toast("Aquesta restricció ja existeix", true); return;
    }
    state.rules.push(note ? { a, b, note } : { a, b });
    $("#rule-b").value = "";
    $("#rule-note").value = "";
    commit();
    toast(`${a} i ${b} no aniran junts`);
  });

  $("#rule-list").addEventListener("click", (e) => {
    const b = e.target.closest("[data-rule]");
    if (!b) return;
    state.rules.splice(Number(b.dataset.rule), 1);
    commit();
  });

  /* ---------- Monitors ---------- */

  const dlgPeople = $("#dlg-people");

  $("#btn-people").addEventListener("click", () => {
    renderPeople();
    dlgPeople.showModal();
  });

  function renderPeople() {
    const list = $("#people-list");
    if (!state.people.length) {
      list.replaceChildren(el("li", { className: "empty", textContent: "No hi ha cap monitor." }));
      return;
    }
    list.replaceChildren(...state.people.map((n) => {
      const del = el("button", { type: "button", className: "icon-btn", innerHTML: ICON_TRASH, ariaLabel: "Treu " + n });
      del.dataset.person = n;
      return el("li", {}, el("span", { textContent: n, title: n }), del);
    }));
  }

  $("#add-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("#add-name");
    const name = input.value.trim().replace(/\s+/g, " ");
    if (!name) return;
    if (state.people.some((n) => n.toLowerCase() === name.toLowerCase())) { toast(`${name} ja hi és`, true); return; }
    state.people.push(name);
    state.groups[POOL].push(name);
    input.value = "";
    commit();
    toast(`${name} afegit a «Sense grup»`);
  });

  $("#people-list").addEventListener("click", (e) => {
    const b = e.target.closest("[data-person]");
    if (!b) return;
    const name = b.dataset.person;
    if (!confirm(`Vols treure ${name} de la llista? També se n'esborraran les restriccions.`)) return;
    state.people = state.people.filter((n) => n !== name);
    state.rules = state.rules.filter((r) => r.a !== name && r.b !== name);
    for (const key in state.groups) state.groups[key] = state.groups[key].filter((n) => n !== name);
    if (selected === name) selected = null;
    commit();
  });

  $("#btn-defaults").addEventListener("click", () => {
    if (!confirm("Es tornarà a la llista original de monitors i es buidaran els grups. Les restriccions entre monitors que hi siguin es mantenen. Continuar?")) return;
    state = normalize(freshState(DEFAULT_PEOPLE, state.rules));
    selected = null;
    commit();
  });

  /* ---------- Comparteix ---------- */

  const dlgExport = $("#dlg-export");

  function exportText() {
    const { byGroup } = conflicts();
    const lines = ["*GRUPS DE COLÒNIES · CEPITU*", ""];
    for (const g of GROUPS) {
      const m = state.groups[g.id];
      lines.push(`*${g.id}* (${m.length}/${g.cap})`);
      lines.push(m.length ? m.join(", ") : "—");
      for (const r of byGroup.get(g.id) || []) lines.push(`⚠ ${r.a} i ${r.b} no poden anar junts`);
      lines.push("");
    }
    if (state.groups[POOL].length) lines.push(`*Sense grup:* ${state.groups[POOL].join(", ")}`);
    return lines.join("\n").trim();
  }

  function toBase64Url(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = "";
    for (const b of bytes) bin += String.fromCharCode(b);
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function fromBase64Url(s) {
    const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
    return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
  }

  function shareLink() {
    const idx = new Map(state.people.map((n, i) => [n, i]));
    const data = {
      p: state.people,
      g: Object.fromEntries(GROUPS.map((g) => [g.id, state.groups[g.id].map((n) => idx.get(n))])),
      r: state.rules.map((r) => (r.note ? [idx.get(r.a), idx.get(r.b), r.note] : [idx.get(r.a), idx.get(r.b)])),
    };
    return location.origin + location.pathname + "#d=" + toBase64Url(JSON.stringify(data));
  }

  function readLink() {
    if (!location.hash.startsWith("#d=")) return;
    try {
      const d = JSON.parse(fromBase64Url(location.hash.slice(3)));
      const p = d.p;
      const groups = Object.fromEntries(Object.entries(d.g || {}).map(([k, l]) => [k, l.map((i) => p[i])]));
      const rules = (d.r || []).map(([a, b, note]) => (note ? { a: p[a], b: p[b], note } : { a: p[a], b: p[b] }));
      const incoming = normalize({ people: p, groups, rules });
      const hasLocal = state.people.length !== state.groups[POOL].length || state.rules.length;
      if (!hasLocal || confirm("Has obert un enllaç amb una distribució de grups. Vols carregar-la? Substituirà la que tens ara en aquest dispositiu.")) {
        state = incoming;
        save();
      }
    } catch {
      toast("L'enllaç no és vàlid", true);
    }
    history.replaceState(null, "", location.pathname + location.search);
  }

  async function copy(text, msg) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = el("textarea", { value: text });
      ta.style.cssText = "position:fixed;opacity:0";
      dlgExport.append(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    toast(msg);
  }

  $("#btn-export").addEventListener("click", () => {
    $("#export-text").textContent = exportText();
    $("#btn-share").hidden = !navigator.share;
    dlgExport.showModal();
  });
  $("#btn-copy-text").addEventListener("click", () => copy(exportText(), "Text copiat — enganxa'l al WhatsApp"));
  $("#btn-copy-link").addEventListener("click", () => copy(shareLink(), "Enllaç copiat"));
  $("#btn-share").addEventListener("click", () => {
    navigator.share({ title: "Grups de colònies · Cepitu", text: exportText() + "\n\n" + shareLink() }).catch(() => {});
  });

  // Tanca els diàlegs tocant el fons.
  for (const d of document.querySelectorAll("dialog")) {
    d.addEventListener("click", (e) => { if (e.target === d) d.close(); });
  }

  /* ---------- Avisos ---------- */

  let toastTimer = 0;
  function toast(msg, bad = false) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.toggle("is-bad", bad);
    t.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-on"), bad ? 3600 : 2400);
  }

  readLink();
  render();
})();
