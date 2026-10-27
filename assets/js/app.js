/* ==========================================================================
   Cepitu · Grups de colònies
   Repartiment de monitors per grups amb arrossegar i deixar anar
   (ratolí i tàctil) i restriccions de parelles que no poden anar juntes.
   ========================================================================== */

(() => {
  "use strict";

  // casa = a la casa de colònies; fora = fora casa. `needs` és el mínim de carnets del grup.
  const GROUPS = [
    { id: "PETITS", cap: 6, img: "petits.jpg", zone: "casa", needs: { c: 1 } },
    { id: "MITJANS", cap: 6, img: "mitjans.jpg", zone: "casa", needs: { c: 1 } },
    { id: "GRANS", cap: 7, img: "grans.jpg", zone: "casa", needs: { c: 1 } },
    { id: "K1", cap: 7, img: "k1.jpg", zone: "fora", needs: { c: 3, m: 3, d: 1 } },
    { id: "K2", cap: 7, img: "k2.jpg", zone: "fora", needs: { c: 3, m: 3, d: 1 } },
    { id: "RUTA", cap: 6, img: "ruta.jpg", zone: "fora", needs: { c: 3, m: 3, ruta: 1 } },
  ];
  // A més, entre tots els grups de casa hi ha d'haver almenys un director i un tresorer/a.
  const CASA_ANY = ["d", "tres"];
  const CASA = GROUPS.filter((g) => g.zone === "casa").map((g) => g.id);

  const DEFAULT_PEOPLE = [
    "MC", "Chali", "Inyi", "Tondes", "Bru", "Eli", "Riki", "Ro", "Q. Geis",
    "Muli", "Paupo", "Ani", "Benet", "Qwerty", "Neus", "Santi", "Quimpu", "Quimta", "Cris",
    "Ivet", "Berta", "Marvi", "Biel", "AinaBo", "Max", "T. Forre", "Judit", "Vicen", "Bellau",
    "Ton", "Erica", "Bonet", "AinaCo", "Lucas", "Pauri", "MartinaFo", "Anglarill", "Herruzo", "Dani",
  ];

  // Noms que han canviat respecte de versions antigues de les dades desades.
  // "Geis" s'esborra perquè "Q." i "Geis" eren la mateixa persona: "Q. Geis".
  const RENAMES = { "Q.": "Q. Geis", "AinCo": "AinaCo", "MartinaBo": "Bonet" };
  const DROPPED = ["Geis"];

  // Carnets (c = conduir, m = monitor, d = director) i preferències de cada monitor.
  // Les preferències es mostren quan es toca un monitor; no s'apliquen enlloc.
  const DEFAULT_INFO = {
    "MC": ["c"],
    "Chali": ["mc"],
    "Inyi": ["dcm", "No fora casa, no petits, no Q. Geis"],
    "Tondes": ["mc", "Casa"],
    "Bru": ["c", "Casa"],
    "Eli": ["mc", "Fora casa"],
    "Riki": ["mcd", "K2"],
    "Ro": ["m"],
    "Q. Geis": ["mc", "No Inyi, Ruta o petits, no K1"],
    "Muli": ["md", "K1"],
    "Paupo": ["m", "Fora casa, no Ani"],
    "Ani": ["m", "No petits, no Paupo"],
    "Qwerty": ["mc"],
    "Neus": ["m"],
    "Santi": ["mc", "No K2, casa"],
    "Quimpu": ["c"],
    "Cris": ["mc"],
    "Ivet": ["m", "No grans, no K1"],
    "Berta": ["mc", "K2"],
    "Marvi": ["mc", "Ruta"],
    "Quimta": ["mc", "Fora casa"],
    "Biel": ["c"],
    "AinaBo": ["mc"],
    "Max": ["m", "Fora casa"],
    "T. Forre": ["c", "Fora casa"],
    "Judit": ["mc"],
    "Vicen": ["", "No K2"],
    "Ton": ["c"],
    "Bellau": ["c"],
    "Erica": ["", "Fora casa"],
    "Bonet": ["mc"],
  };

  // Sexe (h = home, d = dona) i any de naixement.
  const DEFAULT_PERSONAL = {
    "MC": ["h", 2002], "Chali": ["h", 2003], "Inyi": ["d", 2003], "Tondes": ["h", 2003],
    "Bru": ["h", 2004], "Eli": ["d", 2003], "Riki": ["h", 2004], "Ro": ["d", 2005],
    "Q. Geis": ["d", 2004], "Muli": ["d", 2004], "Paupo": ["h", 2004], "Ani": ["h", 2004],
    "Benet": ["h", 2005], "Qwerty": ["d", 2005], "Neus": ["d", 2005], "Santi": ["h", 2006],
    "Quimpu": ["h", 2005], "Cris": ["d", 2005], "Ivet": ["d", 2005], "Berta": ["d", 2005],
    "Marvi": ["d", 2005], "Quimta": ["h", 2005], "Biel": ["h", 2006], "AinaBo": ["d", 2006],
    "Max": ["h", 2006], "T. Forre": ["h", 2006], "Judit": ["d", 2006], "Vicen": ["h", 2007],
    "Ton": ["h", 2007], "Bellau": ["h", 2007], "Erica": ["d", 2007], "Bonet": ["d", 2007],
    "Pauri": ["h", 2008], "Lucas": ["h", 2008], "Anglarill": ["d", 2008], "MartinaFo": ["d", 2008],
    "Dani": ["d", 2008], "Herruzo": ["d", 2008], "AinaCo": ["d", 2007],
  };
  const YOUNGEST = 2008; // els d'aquest any es pinten de rosa
  const CARNETS = [
    { key: "c", label: "Conduir" },
    { key: "m", label: "Monitor" },
    { key: "d", label: "Director" },
  ];

  // Informació interna (no es pinta a les targetes, només compta als grups).
  const TRAITS = [
    { key: "ruta", label: "Experiència a ruta", tag: "R" },
    { key: "tres", label: "Tresorer/a", tag: "T" },
  ];
  const DEFAULT_TRAITS = {
    ruta: ["Tondes", "Q. Geis", "Quimpu", "Bru"],
    tres: ["Eli", "Berta"],
  };
  const SKILLS = [...CARNETS, ...TRAITS];

  // Restriccions que hi ha d'entrada: parelles que no poden anar juntes...
  const DEFAULT_RULES = [["Neus", "Quimpu"], ["AinaBo", "Ani"], ["Q. Geis", "Inyi"], ["Ani", "Paupo"], ["Qwerty", "Santi"]];
  // ...i on pot (o no pot) anar cadascú. target: un grup, "casa" o "fora".
  const DEFAULT_PLACE_RULES = [
    { who: "Qwerty", mode: "only", target: "casa" },
    { who: "Biel", mode: "only", target: "casa" },
    { who: "Santi", mode: "not", target: "K2" },
    { who: "Vicen", mode: "not", target: "K2" },
    // Els nuvatus (2008) no poden anar a RUTA.
    ...["Pauri", "Lucas", "Anglarill", "MartinaFo", "Dani", "Herruzo"].map((who) => ({ who, mode: "not", target: "RUTA" })),
  ];

  // Puja-ho quan calgui retocar dades ja desades (vegeu upgrade()).
  const DATA_VERSION = 3;

  const STORAGE_KEY = "cepitu-grups-v1";
  const POOL = "pool";

  const $ = (sel, root = document) => root.querySelector(sel);
  const el = (tag, props = {}, ...children) => {
    const node = Object.assign(document.createElement(tag), props);
    for (const c of children) if (c != null) node.append(c);
    return node;
  };
  const ICON_TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>';

  /* ---------- Estat ---------- */

  let state = load() || normalize(freshState(DEFAULT_PEOPLE,
    DEFAULT_RULES.map(([a, b]) => ({ a, b })), {}, DEFAULT_PLACE_RULES.map((r) => ({ ...r }))));
  let selected = null; // monitor triat amb un toc, pendent de tocar-ne el grup

  function freshState(people, rules = [], info = {}, placeRules = []) {
    const groups = { [POOL]: [...people] };
    for (const g of GROUPS) groups[g.id] = [];
    return { version: DATA_VERSION, people: [...people], groups, rules, placeRules, info };
  }

  // Ordena els carnets sempre igual (c, m, d) i descarta lletres desconegudes.
  function cleanCarnets(str) {
    return CARNETS.map((c) => c.key).filter((k) => String(str || "").includes(k)).join("");
  }

  function defaultInfo(name) {
    const [carnets = "", prefs = ""] = DEFAULT_INFO[name] || [];
    const [sex = "", year = null] = DEFAULT_PERSONAL[name] || [];
    const info = { carnets: cleanCarnets(carnets), prefs, sex, year };
    for (const t of TRAITS) info[t.key] = DEFAULT_TRAITS[t.key].includes(name);
    return info;
  }

  function cleanSex(v) { return v === "h" || v === "d" ? v : ""; }
  function cleanYear(v) {
    const y = parseInt(v, 10);
    return y >= 1950 && y <= 2030 ? y : null;
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
    const rules = (s.rules || [])
      .filter((r) => r && known.has(r.a) && known.has(r.b) && r.a !== r.b)
      .map((r) => ({ a: r.a, b: r.b }));
    const targets = ["casa", "fora", ...GROUPS.map((g) => g.id)];
    const placeRules = (s.placeRules || [])
      .filter((r) => r && known.has(r.who) && (r.mode === "not" || r.mode === "only") && targets.includes(r.target))
      .map((r) => ({ who: r.who, mode: r.mode, target: r.target }));
    const info = {};
    for (const n of people) {
      const saved = s.info && s.info[n];
      const def = defaultInfo(n);
      info[n] = saved
        ? {
          carnets: cleanCarnets(saved.carnets),
          prefs: String(saved.prefs || ""),
          // Si el sexe o l'any desats són buits (dades antigues), es completen amb els per defecte.
          sex: cleanSex(saved.sex) || def.sex,
          year: cleanYear(saved.year) || def.year,
          ...Object.fromEntries(TRAITS.map((t) => [t.key, t.key in saved ? !!saved[t.key] : def[t.key]])),
        }
        : def;
    }
    return { version: s.version || 1, people, groups, rules, placeRules, info };
  }

  // Canvis que s'apliquen un sol cop a les dades desades amb una versió anterior.
  function upgrade(s) {
    if (s.version < 2) {
      for (const [a, b] of DEFAULT_RULES) {
        const exists = s.rules.some((r) => (r.a === a && r.b === b) || (r.a === b && r.b === a));
        if (!exists && s.info[a] && s.info[b]) s.rules.push({ a, b });
      }
      for (const r of DEFAULT_PLACE_RULES) {
        const exists = s.placeRules.some((x) => x.who === r.who && x.mode === r.mode && x.target === r.target);
        if (!exists && s.info[r.who]) s.placeRules.push({ ...r });
      }
      if (s.info.Ro) s.info.Ro.carnets = s.info.Ro.carnets.replace("c", "");
    }
    if (s.version < 3) {
      for (const r of DEFAULT_PLACE_RULES.filter((x) => x.target === "RUTA" && x.mode === "not")) {
        const exists = s.placeRules.some((x) => x.who === r.who && x.mode === r.mode && x.target === r.target);
        if (!exists && s.info[r.who]) s.placeRules.push({ ...r });
      }
    }
    s.version = DATA_VERSION;
    return s;
  }

  // Adapta dades desades de versions antigues (vegeu RENAMES i DROPPED).
  function migrate(s) {
    const people = s.people || [];
    const stale = people.filter((n) => (RENAMES[n] && !people.includes(RENAMES[n])) || (DROPPED.includes(n) && people.includes("Q.")));
    if (!stale.length) return s;
    const fix = (n) => (RENAMES[n] && !people.includes(RENAMES[n]) ? RENAMES[n] : n);
    const keep = (n) => !(DROPPED.includes(n) && people.includes("Q."));
    const info = s.info && Object.fromEntries(Object.entries(s.info).filter(([n]) => keep(n)).map(([n, v]) => [fix(n), v]));
    return {
      ...s,
      placeRules: (s.placeRules || []).filter((r) => keep(r.who)).map((r) => ({ ...r, who: fix(r.who) })),
      people: people.filter(keep).map(fix),
      groups: Object.fromEntries(Object.entries(s.groups || {}).map(([k, l]) => [k, l.filter(keep).map(fix)])),
      rules: (s.rules || []).filter((r) => keep(r.a) && keep(r.b)).map((r) => ({ ...r, a: fix(r.a), b: fix(r.b) })),
      info,
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? upgrade(normalize(migrate(JSON.parse(raw)))) : null;
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

  function zoneOf(groupId) {
    const g = GROUPS.find((x) => x.id === groupId);
    return g ? g.zone : null;
  }

  function targetLabel(target) {
    return target === "casa" ? "un grup de casa" : target === "fora" ? "un grup de fora" : target;
  }

  // Restriccions de lloc que es trenquen si `name` va a `groupId`.
  function placeBreaks(name, groupId) {
    if (groupId === POOL) return [];
    return state.placeRules.filter((r) => {
      if (r.who !== name) return false;
      const match = r.target === groupId || r.target === zoneOf(groupId);
      return r.mode === "not" ? match : !match;
    });
  }

  function placeText(r) {
    return r.mode === "not" ? `no pot anar a ${targetLabel(r.target)}` : `ha d'anar a ${targetLabel(r.target)}`;
  }

  function placeShort(r) {
    return r.mode === "not" ? "✕ " + r.target : "→ " + r.target;
  }

  // Retorna { byPerson: Map(nom -> [{short, long}]), byGroup: Map(grup -> [frases]) }
  function conflicts() {
    const byPerson = new Map();
    const byGroup = new Map();
    const add = (map, key, item) => { if (!map.has(key)) map.set(key, []); map.get(key).push(item); };
    for (const g of GROUPS) {
      const members = new Set(state.groups[g.id]);
      for (const r of state.rules) {
        if (members.has(r.a) && members.has(r.b)) {
          add(byGroup, g.id, `${r.a} i ${r.b} no poden anar junts`);
          for (const [p, other] of [[r.a, r.b], [r.b, r.a]]) {
            add(byPerson, p, { short: "✕ " + other, long: `No pot anar amb ${other}` });
          }
        }
      }
      for (const n of members) {
        for (const r of placeBreaks(n, g.id)) {
          add(byGroup, g.id, `${n} ${placeText(r)}`);
          add(byPerson, n, { short: placeShort(r), long: placeText(r)[0].toUpperCase() + placeText(r).slice(1) });
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

  // Tot el que es trencaria posant `name` a `groupId`, en frases ("no pot anar amb X", "no pot anar a K2").
  function problems(name, groupId) {
    const people = wouldConflict(name, groupId).filter((n) => n !== name);
    return [
      ...(people.length ? [`no pot anar amb ${people.join(", ")}`] : []),
      ...placeBreaks(name, groupId).map(placeText),
    ];
  }

  function commit() {
    save();
    render();
  }

  /* ---------- Carnets mínims per grup ---------- */

  // Carnet (c, m, d) o informació interna (ruta, tres).
  function hasSkill(name, key) {
    const info = state.info[name] || defaultInfo(name);
    return TRAITS.some((t) => t.key === key) ? !!info[key] : info.carnets.includes(key);
  }

  function countSkill(groupId, key) {
    return state.groups[groupId].filter((n) => hasSkill(n, key)).length;
  }

  function casaTotal(key) {
    return CASA.reduce((sum, id) => sum + countSkill(id, key), 0);
  }

  // Quants en falten de cada tipus al grup (0 si ja en té prou).
  function deficit(groupId, key) {
    const g = GROUPS.find((x) => x.id === groupId);
    if (CASA_ANY.includes(key) && g.zone === "casa") return casaTotal(key) ? 0 : 1;
    return Math.max(0, (g.needs[key] || 0) - countSkill(groupId, key));
  }

  // Insígnies per a la capçalera de cada grup + llista del que falta en total.
  function requirements() {
    const byGroup = new Map();
    const missing = [];
    for (const g of GROUPS) {
      const items = [];
      for (const k of SKILLS) {
        const have = countSkill(g.id, k.key);
        const min = g.needs[k.key];
        const isCarnet = !k.tag;
        const casaWide = CASA_ANY.includes(k.key) && g.zone === "casa";
        if (min) {
          const ok = have >= min;
          items.push({ skill: k, text: `${have}/${min}`, ok, title: `${k.label}: ${have} de ${min} mínim` });
          if (!ok) missing.push(`${g.id}: ${min - have} ${k.label.toLowerCase()}`);
        } else if (casaWide && !casaTotal(k.key)) {
          items.push({ skill: k, text: "0/1", ok: false, title: `Cal ${k.label.toLowerCase()} en algun grup de casa` });
        } else if (have && (isCarnet || casaWide)) {
          // Sense mínim: només es compta quan n'hi ha algun.
          items.push({ skill: k, text: String(have), ok: true, title: `${k.label}: ${have}` });
        }
      }
      byGroup.set(g.id, items);
    }
    for (const k of SKILLS) {
      if (CASA_ANY.includes(k.key) && !casaTotal(k.key)) missing.push(`Casa: 1 ${k.label.toLowerCase()}`);
    }
    return { byGroup, missing };
  }

  /* ---------- Ordre dins dels calaixos: homes a l'esquerra, dones a la dreta, per edat ---------- */

  const SEXES = ["h", "d"];

  function sexOf(name) { return (state.info[name] || defaultInfo(name)).sex; }

  function byAge(a, b) {
    const ya = (state.info[a] || {}).year || 9999;
    const yb = (state.info[b] || {}).year || 9999;
    return ya - yb || a.localeCompare(b, "ca");
  }

  // Omple una zona de grup amb dues columnes (homes | dones) i, sota, els que no tenen sexe.
  function fillColumns(zone, members, makeChip) {
    if (!members.length) return;
    for (const sx of SEXES) {
      zone.append(el("div", { className: "col col--" + sx },
        ...members.filter((n) => sexOf(n) === sx).sort(byAge).map(makeChip)));
    }
    const rest = members.filter((n) => !SEXES.includes(sexOf(n))).sort(byAge);
    if (rest.length) zone.append(el("div", { className: "col col--x" }, ...rest.map(makeChip)));
  }

  /* ---------- Pintat ---------- */

  function chip(name, conflictWith) {
    const node = el("button", { type: "button", className: "chip" });
    node.dataset.name = name;
    const info = state.info[name] || defaultInfo(name);
    if (info.year === YOUNGEST) node.classList.add("chip--young");
    const line = el("span", { className: "chip__name", textContent: name });
    const has = CARNETS.filter((c) => info.carnets.includes(c.key));
    if (has.length) {
      line.append(el("span", { className: "dots", ariaLabel: has.map((c) => c.label).join(", ") },
        ...has.map((c) => el("i", { className: "dot dot--" + c.key }))));
    }
    const text = el("span", { className: "chip__text" }, line);
    const tip = [name + (has.length ? " · " + has.map((c) => c.label).join(", ") : "")];
    const traits = TRAITS.filter((t) => info[t.key]);
    if (traits.length) tip.push(traits.map((t) => t.label).join(", "));
    if (info.prefs) tip.push("Preferències: " + info.prefs);
    if (conflictWith && conflictWith.length) {
      node.classList.add("is-conflict");
      text.append(el("span", { className: "chip__warn", textContent: conflictWith.map((c) => c.short).join(" ") }));
      tip.push(...conflictWith.map((c) => c.long));
    }
    node.title = tip.join("\n");
    if (name === selected) node.classList.add("is-selected");
    node.append(text);
    return node;
  }

  function render() {
    // Es refà tota la pàgina: guarda l'scroll perquè alguns navegadors de mòbil, en treure
    // la targeta que tenia el focus, salten a dalt de tot.
    const scrollY = window.scrollY;
    if (document.activeElement && document.activeElement.closest(".chip")) document.activeElement.blur();
    paint();
    if (window.scrollY !== scrollY) window.scrollTo(0, scrollY);
    requestAnimationFrame(() => {
      if (!drag && Math.abs(window.scrollY - scrollY) > 1) window.scrollTo(0, scrollY);
    });
  }

  function paint() {
    const { byPerson, byGroup } = conflicts();
    const { byGroup: reqByGroup } = requirements();
    if (selected && !state.people.includes(selected)) selected = null;
    const from = selected && groupOf(selected);
    document.body.classList.toggle("is-picking", !!selected);

    // Sense grup
    const pool = $("#pool");
    pool.dataset.empty = "Tothom té grup 🎉";
    // Per any de naixement, amb l'any davant de cada tanda per trobar la gent ràpid.
    const poolItems = [];
    let lastYear;
    for (const n of [...state.groups[POOL]].sort(byAge)) {
      const y = (state.info[n] || {}).year || null;
      if (y !== lastYear) {
        if (poolItems.length) poolItems.push(el("span", { className: "year-break" }));
        poolItems.push(el("span", { className: "year-tag", textContent: y || "?" }));
      }
      lastYear = y;
      poolItems.push(chip(n));
    }
    pool.replaceChildren(...poolItems);
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
      const clash = selected && from !== g.id ? problems(selected, g.id) : [];
      if (clash.length) {
        card.classList.add("group--blocked");
        card.title = `${selected} ${clash.join(" i ")}`;
      }

      const cap = el("span", { className: "cap" + (status ? " cap--" + status : "") });
      cap.textContent = (bad.length ? "⚠ " : n === g.cap ? "✓ " : "") + `${n}/${g.cap}`;
      if (n > g.cap) cap.title = `Hi ha ${n - g.cap} monitor(s) de més`;

      const head = el("header", { className: "group__head" },
        el("img", { src: "assets/img/colonies/" + g.img, alt: "", loading: "lazy" }),
        el("h3", { textContent: g.id }),
        el("div", { className: "reqs" }, ...reqByGroup.get(g.id).map((r) =>
          el("span", { className: "req" + (r.ok ? " req--ok" : " req--bad"), title: r.title },
            r.skill.tag
              ? el("i", { className: "tag", textContent: r.skill.tag })
              : el("i", { className: "dot dot--" + r.skill.key }),
            r.text))),
        cap,
      );
      const meter = el("div", { className: "meter" }, el("span"));
      meter.firstChild.style.width = Math.min(100, (n / g.cap) * 100) + "%";

      const zone = el("div", { className: "dropzone" });
      zone.dataset.drop = g.id;
      zone.dataset.empty = selected ? "Toca per posar-hi " + selected : "Buit";
      fillColumns(zone, members, (m) => chip(m, byPerson.get(m)));

      card.append(head, meter, zone);
      if (bad.length) {
        card.append(el("ul", { className: "conflicts" }, ...bad.map((msg) => el("li", {}, el("span", { textContent: msg })))));
      }
      return card;
    }));

    // Estadístiques
    const placed = state.people.length - state.groups[POOL].length;
    const nConf = [...byGroup.values()].reduce((s, l) => s + l.length, 0);
    const over = GROUPS.filter((g) => state.groups[g.id].length > g.cap);
    const stats = [
      `<span class="stat${placed === state.people.length ? " stat--ok" : ""}" title="Monitors amb grup"><strong>${placed}/${state.people.length}</strong></span>`,
      nConf
        ? `<span class="stat stat--bad" title="Restriccions trencades">⚠ <strong>${nConf}</strong></span>`
        : `<span class="stat stat--ok" title="Cap restricció trencada">✓</span>`,
    ];
    if (over.length) stats.push(`<span class="stat stat--over" title="Grups amb massa gent">+ ${over.map((g) => g.id).join(", ")}</span>`);
    $("#stats").innerHTML = stats.join("");

    const rulesBtn = $("#btn-rules");
    $("#rules-count").textContent = state.rules.length + state.placeRules.length;
    rulesBtn.classList.toggle("has-conflict", nConf > 0);

    renderPicked();
    if ($("#dlg-rules").open) renderRules();
    if ($("#dlg-people").open) renderPeople();
  }

  // Fitxa de baix amb els carnets i les preferències del monitor triat.
  function renderPicked() {
    const box = $("#picked");
    box.hidden = !selected;
    if (!selected) return;
    const info = state.info[selected] || defaultInfo(selected);
    const meta = [
      ...CARNETS.filter((c) => info.carnets.includes(c.key)).map((c) => c.label),
      ...TRAITS.filter((t) => info[t.key]).map((t) => t.label),
    ];
    if (info.year) meta.unshift(info.year);
    $("#picked-meta").textContent = meta.join(" · ");
    const prefs = $("#picked-prefs");
    prefs.textContent = info.prefs ? "Preferències: " + info.prefs : "Sense preferències";
    prefs.classList.toggle("muted", !info.prefs);
  }

  function announceMove(name, to) {
    if (to === POOL) return;
    const clash = problems(name, to);
    const g = GROUPS.find((x) => x.id === to);
    if (clash.length) toast(`⚠ ${name} ${clash.join(" i ")}`, true);
    else if (state.groups[to].length > g.cap) toast(`${to} ja té ${state.groups[to].length} monitors (màxim ${g.cap})`, true);
  }

  function flash(name) {
    const node = document.querySelector(`.chip[data-name="${CSS.escape(name)}"]`);
    if (node) node.classList.add("is-flash");
  }

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
    window.getSelection()?.removeAllRanges();
    if (selected) {
      selected = null;
      document.body.classList.remove("is-picking");
      document.querySelectorAll(".chip.is-selected").forEach((c) => c.classList.remove("is-selected"));
      document.querySelectorAll(".group--blocked").forEach((c) => c.classList.remove("group--blocked"));
    }

    const r = drag.node.getBoundingClientRect();
    drag.offX = drag.x0 - r.left;
    drag.offY = drag.y0 - r.top;
    document.querySelectorAll(".chip--ghost").forEach((g) => g.remove());
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

    // L'ordre és automàtic (sexe i edat als grups, edat a «Sense grup»): la previsualització posa la targeta on quedarà.
    const name = drag.name;
    const isPool = zone.dataset.drop === POOL;
    const box = isPool ? zone : zone.querySelector(".col--" + (sexOf(name) || "x")) || zone;
    let ref = null;
    for (const c of box.querySelectorAll(":scope > .chip")) {
      if (c !== drag.node && byAge(name, c.dataset.name) < 0) { ref = c; break; }
    }
    // A «Sense grup», no la posis darrere l'etiqueta de l'any següent.
    if (ref && ref.previousElementSibling?.classList.contains("year-tag")) ref = ref.previousElementSibling;
    if (drag.node.parentElement !== box || drag.node.nextElementSibling !== ref) {
      box.insertBefore(drag.node, ref);
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

    const zone = node.closest("[data-drop]");
    if (cancelled || !zone) { render(); return; }
    const to = zone.dataset.drop;
    const from = groupOf(name);
    move(name, to);
    if (from !== to) announceMove(name, to);
    commit();
    if (from !== to) flash(name);
  }

  function cancelDrag() {
    clearTimeout(drag.timer);
    drag = null;
  }

  /* ---------- Tocar i col·locar: toca un monitor i després el grup on va ---------- */

  function placeSelected(to) {
    const name = selected;
    selected = null;
    if (groupOf(name) === to) { render(); return; }
    move(name, to);
    announceMove(name, to);
    commit();
    flash(name);
  }

  document.addEventListener("click", (e) => {
    if (Date.now() < suppressClickUntil) return;
    if (e.target.closest("dialog, .toolbar, .picked")) return;
    const node = e.target.closest(".chip");
    const holder = e.target.closest(".group, .pool");
    const target = holder && holder.querySelector("[data-drop]").dataset.drop;

    if (node && !node.classList.contains("chip--ghost")) {
      const name = node.dataset.name;
      // Tocar una targeta d'un altre grup quan ja n'hi ha una de triada la porta allà;
      // si és del mateix lloc, canvia la selecció (o la treu si és la mateixa).
      if (selected && name !== selected && target !== groupOf(selected)) placeSelected(target);
      else { selected = selected === name ? null : name; render(); }
      return;
    }
    if (!selected) return;
    if (holder) placeSelected(target);
    else { selected = null; render(); }
  });

  $("#picked-close").addEventListener("click", () => { selected = null; render(); });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && selected && !document.querySelector("dialog[open]")) { selected = null; render(); }
  });

  /* ---------- Random: reparteix automàticament ---------- */

  $("#btn-auto").addEventListener("click", () => {
    const pending = [...state.groups[POOL]];
    if (!pending.length) { toast("Tots els monitors ja tenen grup"); return; }
    for (let i = pending.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pending[i], pending[j]] = [pending[j], pending[i]];
    }
    // Primer el que és més escàs (director, ruta, tresorer/a, conduir, monitor) i els que
    // tenen restriccions; els que no aporten res omplen al final els forats que quedin.
    const WEIGHT = { d: 8, ruta: 6, tres: 6, c: 3, m: 1 };
    const carnetWeight = (n) => SKILLS.reduce((sum, k) => sum + (hasSkill(n, k.key) ? WEIGHT[k.key] : 0), 0);
    const rulesOf = (n) => state.rules.filter((r) => r.a === n || r.b === n).length
      + state.placeRules.filter((r) => r.who === n).length;
    pending.sort((a, b) => carnetWeight(b) + rulesOf(b) * 2 - (carnetWeight(a) + rulesOf(a) * 2));

    // Proporció de nois i noies a tota la llista, per intentar que cada grup s'hi assembli.
    const sexes = state.people.map(sexOf).filter(Boolean);
    const share = (sex) => sexes.filter((x) => x === sex).length / (sexes.length || 1);

    const left = [];
    for (const name of pending) {
      const sex = sexOf(name);
      const options = GROUPS
        .filter((g) => state.groups[g.id].length < g.cap && !problems(name, g.id).length)
        .map((g) => {
          // Quant ajuda aquest monitor a cobrir el que li falta al grup.
          const helps = SKILLS.reduce((sum, k) => sum + (hasSkill(name, k.key) && deficit(g.id, k.key) ? WEIGHT[k.key] : 0), 0);
          // Els grups que encara han d'aconseguir carnets reserven les places per a qui en té.
          const needed = SKILLS.reduce((sum, k) => sum + deficit(g.id, k.key), 0);
          const free = g.cap - state.groups[g.id].length;
          const room = helps ? free : free - needed;
          // Quants nois (o noies) de més hi hauria respecte del repartiment equilibrat.
          const members = state.groups[g.id];
          const excess = sex ? members.filter((m) => sexOf(m) === sex).length + 1 - (members.length + 1) * share(sex) : 0;
          return { g, score: helps * 100 + room - Math.max(0, excess) * 4 + Math.random() * 0.5 };
        })
        .sort((a, b) => b.score - a.score);
      if (options.length) move(name, options[0].g.id);
      else left.push(name);
    }
    commit();
    const placed = pending.length - left.length;
    const { missing } = requirements();
    const bad = left.length > 0 || missing.length > 0;
    toast([
      left.length ? `${placed} col·locats · ${left.length} sense lloc (${left.join(", ")})` : `${placed} monitors repartits`,
      missing.length ? `Falten: ${missing.join(", ")}` : "",
    ].filter(Boolean).join(" · "), bad);
  });

  $("#btn-reset").addEventListener("click", () => {
    if (!confirm("Vols treure tots els monitors dels grups? Les restriccions es mantenen.")) return;
    state = freshState(state.people, state.rules, state.info, state.placeRules);
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

  function fillTargets(select) {
    const value = select.value;
    select.replaceChildren(
      el("option", { value: "casa", textContent: "Casa" }),
      el("option", { value: "fora", textContent: "Fora" }),
      ...GROUPS.map((g) => el("option", { value: g.id, textContent: g.id })));
    if (value) select.value = value;
  }

  function ruleItem(names, meta, broken, ref, label) {
    const del = el("button", { type: "button", className: "icon-btn", innerHTML: ICON_TRASH, ariaLabel: "Esborra " + label });
    del.dataset.rule = ref;
    const li = el("li", {}, el("div", {}, names, el("div", { className: "meta", textContent: meta })), del);
    if (broken) li.classList.add("is-broken");
    return li;
  }

  function renderRules() {
    fillSelect($("#rule-a"), $("#rule-a").value);
    fillSelect($("#rule-b"), $("#rule-b").value);
    fillSelect($("#place-who"), $("#place-who").value);
    fillTargets($("#place-target"));

    const pairs = state.rules.map((r, i) => {
      const ga = groupOf(r.a);
      const broken = ga !== POOL && ga === groupOf(r.b);
      const meta = broken ? `⚠ Ara mateix tots dos són a ${ga}` : `${r.a}: ${where(r.a)} · ${r.b}: ${where(r.b)}`;
      const names = el("div", { className: "names" }, r.a, el("span", { textContent: "✕" }), r.b);
      return ruleItem(names, meta, broken, "p" + i, `${r.a} ✕ ${r.b}`);
    });
    $("#rule-list").replaceChildren(...(pairs.length ? pairs
      : [el("li", { className: "empty", textContent: "Cap parella." })]));

    const places = state.placeRules.map((r, i) => {
      const g = groupOf(r.who);
      const broken = placeBreaks(r.who, g).includes(r);
      const meta = broken ? `⚠ Ara mateix és a ${g}` : `${r.who}: ${where(r.who)}`;
      const names = el("div", { className: "names" }, r.who, " ",
        el("span", { className: "mode", textContent: r.mode === "not" ? "no pot anar a" : "ha d'anar a" }), " ",
        r.target === "casa" ? "casa" : r.target === "fora" ? "fora" : r.target);
      return ruleItem(names, meta, broken, "g" + i, `${r.who} ${placeText(r)}`);
    });
    $("#place-list").replaceChildren(...(places.length ? places
      : [el("li", { className: "empty", textContent: "Cap restricció de grup." })]));
  }

  $("#rule-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const a = $("#rule-a").value;
    const b = $("#rule-b").value;
    if (!a || !b) return;
    if (a === b) { toast("Tria dos monitors diferents", true); return; }
    if (state.rules.some((r) => (r.a === a && r.b === b) || (r.a === b && r.b === a))) {
      toast("Aquesta restricció ja existeix", true); return;
    }
    state.rules.push({ a, b });
    $("#rule-b").value = "";
    commit();
    toast(`${a} i ${b} no aniran junts`);
  });

  $("#place-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const rule = { who: $("#place-who").value, mode: $("#place-mode").value, target: $("#place-target").value };
    if (!rule.who) return;
    if (state.placeRules.some((r) => r.who === rule.who && r.mode === rule.mode && r.target === rule.target)) {
      toast("Aquesta restricció ja existeix", true); return;
    }
    state.placeRules.push(rule);
    $("#place-who").value = "";
    commit();
    toast(`${rule.who} ${placeText(rule)}`);
  });

  dlgRules.addEventListener("click", (e) => {
    const b = e.target.closest("[data-rule]");
    if (!b) return;
    const i = Number(b.dataset.rule.slice(1));
    (b.dataset.rule[0] === "p" ? state.rules : state.placeRules).splice(i, 1);
    commit();
  });

  /* ---------- Monitors ---------- */

  const dlgPeople = $("#dlg-people");

  $("#btn-people").addEventListener("click", () => {
    renderPeople();
    dlgPeople.showModal();
  });
  dlgPeople.addEventListener("close", render);

  function renderPeople() {
    const list = $("#people-list");
    if (!state.people.length) {
      list.replaceChildren(el("li", { className: "empty", textContent: "No hi ha cap monitor." }));
      return;
    }
    list.replaceChildren(...state.people.map((n) => {
      const info = state.info[n];
      const toggles = el("span", { className: "carnet-toggles" }, ...SKILLS.map((k) => {
        const b = el("button", { type: "button", className: "carnet", title: k.label, ariaLabel: `${k.label}: ${n}` },
          ...(k.tag ? [el("i", { className: "tag", textContent: k.tag })] : [el("i", { className: "dot dot--" + k.key }), k.key.toUpperCase()]));
        b.setAttribute("aria-pressed", hasSkill(n, k.key));
        b.dataset.carnet = k.key;
        b.dataset.who = n;
        return b;
      }));
      const sex = el("select", { className: "sex", ariaLabel: "Sexe de " + n },
        el("option", { value: "", textContent: "–" }),
        el("option", { value: "h", textContent: "H" }),
        el("option", { value: "d", textContent: "D" }));
      sex.value = info.sex;
      sex.dataset.who = n;
      const year = el("input", { type: "number", className: "year", min: 1950, max: 2030, value: info.year || "", placeholder: "Any", ariaLabel: "Any de naixement de " + n });
      year.dataset.who = n;
      const prefs = el("input", { type: "text", className: "prefs", value: info.prefs, maxLength: 120, placeholder: "Preferències", ariaLabel: "Preferències de " + n });
      prefs.dataset.who = n;
      const del = el("button", { type: "button", className: "icon-btn", innerHTML: ICON_TRASH, ariaLabel: "Treu " + n });
      del.dataset.person = n;
      return el("li", {}, el("span", { className: "who", textContent: n, title: n }), sex, year, toggles, del, prefs);
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
    state.info[name] = { carnets: "", prefs: "", sex: "", year: null, ruta: false, tres: false };
    input.value = "";
    commit();
    toast(`${name} afegit a «Sense grup»`);
  });

  $("#people-list").addEventListener("click", (e) => {
    const t = e.target.closest("[data-carnet]");
    if (t) {
      const info = state.info[t.dataset.who];
      const k = t.dataset.carnet;
      if (TRAITS.some((x) => x.key === k)) info[k] = !info[k];
      else info.carnets = cleanCarnets(info.carnets.includes(k) ? info.carnets.replace(k, "") : info.carnets + k);
      commit();
      return;
    }
    const b = e.target.closest("[data-person]");
    if (!b) return;
    const name = b.dataset.person;
    if (!confirm(`Vols treure ${name} de la llista? També se n'esborraran les restriccions.`)) return;
    state.people = state.people.filter((n) => n !== name);
    state.rules = state.rules.filter((r) => r.a !== name && r.b !== name);
    state.placeRules = state.placeRules.filter((r) => r.who !== name);
    for (const key in state.groups) state.groups[key] = state.groups[key].filter((n) => n !== name);
    delete state.info[name];
    commit();
  });

  $("#people-list").addEventListener("change", (e) => {
    const field = e.target.closest("select.sex, input.year");
    if (field) {
      const info = state.info[field.dataset.who];
      if (field.matches(".sex")) info.sex = cleanSex(field.value);
      else info.year = cleanYear(field.value);
      save();
      return;
    }
    const input = e.target.closest("input.prefs");
    if (!input) return;
    state.info[input.dataset.who].prefs = input.value.trim();
    // Només es desa: repintar la llista ara trauria el focus del camp que s'està editant.
    save();
  });

  $("#btn-defaults").addEventListener("click", () => {
    if (!confirm("Es tornarà a la llista original de monitors i es buidaran els grups. Les restriccions entre monitors que hi siguin es mantenen. Continuar?")) return;
    state = normalize(freshState(DEFAULT_PEOPLE, state.rules, state.info, state.placeRules));
    commit();
  });

  // Tanca els diàlegs tocant el fons.
  for (const d of document.querySelectorAll("dialog")) {
    d.addEventListener("click", (e) => { if (e.target === d) d.close(); });
  }

  /* ---------- Grups penjats (Supabase) ---------- */

  // Taula i funcions creades amb supabase.sql. La clau publishable es pot publicar:
  // només deixa llegir les propostes i cridar les funcions de penjar i esborrar.
  const SUPABASE_URL = "https://ubwerdsutkeqkdwewzok.supabase.co";
  const SUPABASE_KEY = "sb_publishable_YnPOYps5cNlmG8ALC3caHw_pme6ORcn";
  const SHARED_KEY = "cepitu-penjats"; // nom, paraula clau i tokens per esborrar les pròpies

  const dlgShared = $("#dlg-shared");
  let sharedList = [];

  function sharedPrefs() {
    try { return { name: "", key: "", tokens: {}, ...JSON.parse(localStorage.getItem(SHARED_KEY)) }; } catch { return { name: "", key: "", tokens: {} }; }
  }
  function saveSharedPrefs(p) {
    try { localStorage.setItem(SHARED_KEY, JSON.stringify(p)); } catch { /* sense emmagatzematge */ }
  }

  async function api(path, body) {
    const res = await fetch(SUPABASE_URL + "/rest/v1/" + path, {
      method: body ? "POST" : "GET",
      headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
      body: body && JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error((data && data.message) || "Error " + res.status);
    return data;
  }

  $("#btn-shared").addEventListener("click", () => {
    const prefs = sharedPrefs();
    $("#share-name").value = prefs.name;
    $("#share-key").value = prefs.key;
    dlgShared.showModal();
    loadShared();
  });
  $("#btn-shared-reload").addEventListener("click", loadShared);

  async function loadShared() {
    const list = $("#shared-list");
    list.replaceChildren(el("li", { className: "empty", textContent: "Carregant…" }));
    try {
      sharedList = await api("propostes?select=id,autor,dades,creat&order=creat.desc&limit=100");
      renderShared();
    } catch {
      list.replaceChildren(el("li", { className: "empty", textContent: "No s'han pogut carregar les propostes. Torna-ho a provar." }));
    }
  }

  function renderShared() {
    const list = $("#shared-list");
    if (!sharedList.length) {
      list.replaceChildren(el("li", { className: "empty", textContent: "Encara no hi ha cap proposta penjada." }));
      return;
    }
    const { tokens } = sharedPrefs();
    list.replaceChildren(...sharedList.map((p) => {
      const groups = (p.dades && p.dades.groups) || {};
      const people = (p.dades && p.dades.people) || [];
      const placed = people.length - (groups[POOL] || []).length;
      const when = new Date(p.creat).toLocaleString("ca", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
      const detail = el("ul", { className: "shared-groups" }, ...GROUPS.map((g) => {
        const members = groups[g.id] || [];
        return el("li", {}, el("strong", { textContent: `${g.id} (${members.length}) ` }), members.join(", ") || "—");
      }));
      const load = el("button", { type: "button", className: "btn btn--sm btn--line", textContent: "Carrega-la" });
      load.dataset.load = p.id;
      const actions = el("div", { className: "shared-actions" }, load);
      if (tokens[p.id]) {
        const del = el("button", { type: "button", className: "icon-btn", innerHTML: ICON_TRASH, ariaLabel: "Esborra la proposta" });
        del.dataset.del = p.id;
        actions.append(del);
      }
      return el("li", {},
        el("details", {},
          el("summary", {},
            el("span", { className: "names", textContent: p.autor }),
            el("span", { className: "meta", textContent: ` · ${when} · ${placed}/${people.length} amb grup` })),
          detail, actions));
    }));
  }

  $("#share-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = $("#share-name").value.trim();
    const key = $("#share-key").value;
    if (!name) return;
    const btn = e.submitter || $("#share-form button");
    btn.disabled = true;
    try {
      const [row] = await api("rpc/penja_proposta", { p_autor: name, p_dades: state, p_clau: key });
      const prefs = sharedPrefs();
      prefs.tokens[row.out_id] = row.out_token;
      saveSharedPrefs({ ...prefs, name, key });
      toast("Grups penjats");
      loadShared();
    } catch (err) {
      toast(/clau/i.test(err.message) ? "La paraula clau no és correcta" : "No s'han pogut penjar els grups", true);
    } finally {
      btn.disabled = false;
    }
  });

  $("#shared-list").addEventListener("click", async (e) => {
    const load = e.target.closest("[data-load]");
    if (load) {
      const p = sharedList.find((x) => x.id === load.dataset.load);
      if (!p || !confirm(`Es substituirà la teva distribució (grups, monitors i restriccions) per la de ${p.autor}. Continuar?`)) return;
      state = upgrade(normalize(migrate(structuredClone(p.dades))));
      selected = null;
      commit();
      dlgShared.close();
      toast(`Carregats els grups de ${p.autor}`);
      return;
    }
    const del = e.target.closest("[data-del]");
    if (del) {
      if (!confirm("Vols esborrar aquesta proposta?")) return;
      const prefs = sharedPrefs();
      try {
        await api("rpc/esborra_proposta", { p_id: del.dataset.del, p_token: prefs.tokens[del.dataset.del] });
        delete prefs.tokens[del.dataset.del];
        saveSharedPrefs(prefs);
        loadShared();
      } catch {
        toast("No s'ha pogut esborrar", true);
      }
    }
  });

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

  save(); // deixa desades les dades ja actualitzades (vegeu upgrade())
  render();
})();
