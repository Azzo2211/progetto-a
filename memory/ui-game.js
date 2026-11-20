/*
 * Progetto A - Memoria: la parte di gioco della pagina («La Torre della Memoria»), agganciata a
 * memory/ui.js e memory/ui-plus.js con window.MemoryUIKit. I conti sono in memory/game.js.
 *  - Oggi: memoria attuale, livello, titolo, serie con gli scudi, minuti; tre missioni; l'allenamento
 *    extra per il tempo che hai scelto.
 *  - Percorso: la mappa dei 42 piani con le stelle, le stelle del piano di oggi, sfide e guardiani.
 *  - Durante gli esercizi: livello, punti della sessione, risposte giuste di fila, sfida in corso.
 *  - Avvisi brevi per stelle, missioni, livelli, guardiani e scudi.
 */
(function () {
  "use strict";

  const K = window.MemoryUIKit;
  const G = window.MemoryGame;
  const CO = window.MemoryCourse;
  if (!K || !G || !G.status || !CO) return;
  const { E, esc, plural, dateShort, lab, save, announce, render, ui } = K;

  const pct1 = (v) => String(Math.round(v * 10) / 10).replace(".", ",");
  const STAR = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.6l2.55 5.3 5.85.75-4.3 4.05 1.1 5.8L10 14.7l-5.2 2.8 1.1-5.8L1.6 7.65l5.85-.75z"/></svg>';
  const CROWN = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M2.5 14.5 1.5 6l4.6 3.4L10 3.5l3.9 5.9L18.5 6l-1 8.5z"/><path d="M2.5 16h15v2h-15z"/></svg>';
  const stars = (f) => `<span class="mem-stars">${["c", "p", "s"].map((k) => `<i class="${f.stars[k] ? "on" : ""}">${STAR}</i>`).join("")}</span>`;

  K.sync = (l) => G.status(l, Date.now(), true).changed;

  /* ------------------------------------------------------------ Oggi: quadro e missioni */
  function streakLine(s) {
    if (s.today) return s.shields ? `giorni di fila · ${plural(s.shields, "scudo", "scudi")}` : "giorni di fila";
    if (s.shieldsNeeded) return `ieri saltato: allenati oggi e ${s.shieldsNeeded === 1 ? "uno scudo salva" : `${s.shieldsNeeded} scudi salvano`} la serie`;
    if (s.atRisk) return "allenati oggi per allungarla";
    return s.shields ? `inizia oggi · ${plural(s.shields, "scudo", "scudi")}` : "inizia oggi";
  }
  K.todayTop = (l) => {
    const st = G.status(l, Date.now(), false);
    const lv = st.level;
    const mem = st.mem;
    const target = Math.round(st.target * 100);
    const doneM = st.missions.filter((m) => m.done).length;
    const timePct = Math.min(100, Math.round((st.minutes / st.budget) * 100));
    return `<section class="mem-hud" aria-label="La tua Torre">
        <div class="mem-hud-main">
          <span class="mem-kicker">Memoria attuale</span>
          <strong>${mem.pct == null ? "—" : `${pct1(mem.pct)}%`}</strong>
          <span>${mem.pct == null ? "Quando impari le prime cose (immagini, schede, carte), qui vedi quanto ne ricorderesti adesso." : `di ${plural(mem.n, "cosa imparata", "cose imparate")} la ricorderesti adesso${mem.low ? ` · ${mem.low} da ripassare presto` : ""}. Obiettivo: ${target}% o più.`}</span>
          ${mem.pct == null ? "" : `<div class="mem-meter" role="img" aria-label="Memoria attuale ${pct1(mem.pct)} per cento, obiettivo ${target}"><i style="width:${Math.max(2, Math.min(100, mem.pct))}%"></i><b style="left:${target}%"></b></div>`}
        </div>
        ${(K.hudChar && K.hudChar(l, st)) || `<div class="mem-hud-stat"><span class="mem-kicker">Livello</span><strong>${lv.level}</strong><div class="mem-xpbar" role="img" aria-label="${lv.into} punti su ${lv.need} per il livello ${lv.level + 1}"><i style="width:${Math.round(lv.pct * 100)}%"></i></div><span>${lv.into}/${lv.need} punti · oggi +${st.todayXp}</span></div>`}
        <div class="mem-hud-stat"><span class="mem-kicker">Titolo</span><strong class="word">${esc(st.title)}</strong><span>${st.seals}/6 sigilli · ${st.stars}/${st.starsMax} stelle</span></div>
        <div class="mem-hud-stat"><span class="mem-kicker">Serie</span><strong>${st.streak.n}</strong><span>${esc(streakLine(st.streak))}</span></div>
        <div class="mem-hud-stat"><span class="mem-kicker">Oggi</span><strong>${st.minutes}<small>/${st.budget} min</small></strong><div class="mem-xpbar time" role="img" aria-label="${st.minutes} minuti di ${st.budget}"><i style="width:${timePct}%"></i></div><span>${st.minutes >= st.budget ? "tempo fatto: il resto è bonus" : "contati mentre ti alleni"}</span></div>
      </section>
      <section class="mem-missions" aria-label="Missioni di oggi">
        <div class="mem-missions-head"><h3>Missioni di oggi</h3><span>${doneM}/${st.missions.length}${st.allMissions ? " · tutte fatte" : " · tutte e tre: +100 punti e un passo verso uno scudo"}</span></div>
        <ul>${st.missions.map((m) => `<li class="${m.done ? "done" : ""}"><span class="mem-mcheck" aria-hidden="true">${m.done ? "✓" : ""}</span><div><strong>${esc(m.label)}</strong>${m.note && !m.done ? `<span>${esc(m.note)}</span>` : m.done ? "<span>fatta</span>" : ""}</div><b>+${G.XP.mission}</b></li>`).join("")}</ul>
      </section>`;
  };

  /* ------------------------------------------------------------ allenamento extra */
  function extraHtml(l, where) {
    const now = Date.now();
    const st = G.status(l, now, false);
    const items = G.extraPlan(l, now);
    const left = Math.max(0, st.budget - st.minutes);
    const shown = [];
    let sum = 0;
    items.forEach((it) => { if (shown.length < 2 || sum < left) { shown.push(it); sum += it.done ? 0 : it.minutes; } });
    const more = items.filter((it) => !shown.includes(it));
    const cs = E.courseStatus(l, now, false);
    const row = (it) => `<li class="${it.done ? "done" : ""} ${it.boss ? "boss" : ""}">
        <span class="mem-step-mark" aria-hidden="true">${it.done ? "✓" : it.boss ? CROWN : ""}</span>
        <div><strong>${esc(it.title)}</strong><span>${esc(it.detail)}</span></div>
        <span class="mem-step-min">${it.minutes} min</span>
        <button type="button" class="${it.done ? "ghost-action" : "primary-action"} small" data-m="x-go" data-go='${esc(JSON.stringify(it.go))}'>${it.done ? "Rifai" : it.boss ? "Affronta" : "Inizia"}<span class="mem-sr">: ${esc(it.title)}</span></button>
      </li>`;
    return `<div class="mem-extra ${where === "course" ? "mem-card" : ""}">
      <div class="mem-extra-head"><h3>Allenamento extra</h3><label class="mem-field mem-inline">Il tuo tempo al giorno <select id="memMinutes">${G.MINUTES.map((m) => `<option value="${m}" ${m === st.budget ? "selected" : ""}>${m} minuti</option>`).join("")}</select></label></div>
      <p class="mem-small">${left ? `Oggi ${st.minutes} di ${st.budget} minuti. Dopo i compiti del piano, ecco cosa ti fa migliorare di più adesso.` : `Hai fatto i tuoi ${st.budget} minuti. Se vuoi continuare, ecco da dove.`}${cs.started && cs.active ? ` Il piano nuovo arriva ${cs.waiting && K.opensLine ? K.opensLine(cs) : "domani"}: tra una tecnica e l'altra serve il sonno, intanto qui alleni quelle che hai.` : ""}</p>
      <ol class="mem-steps mem-extra-list">${shown.map(row).join("")}</ol>
      ${more.length ? `<details class="mem-extra-more"><summary>Altro (${more.length})</summary><ol class="mem-steps mem-extra-list">${more.map(row).join("")}</ol></details>` : ""}
    </div>`;
  }
  K.todayAfter = (l) => extraHtml(l, "today");
  K.extraList = (l, where) => extraHtml(l, where);

  /* ------------------------------------------------------------ la Torre */
  function floorTile(f, sel) {
    const cls = ["mem-floor", f.state, f.boss ? "boss" : "", f.day === sel ? "sel" : "", f.boss && f.stars.s ? "won" : ""].filter(Boolean).join(" ");
    const label = `Piano ${f.day}${f.boss ? `, guardiano ${f.boss.name}` : ""}: ${f.def.title}. ${f.state === "locked" ? "Non ancora aperto." : `${f.count} stelle su 3.`}`;
    return `<li><button type="button" class="${cls}" data-m="floor" data-day="${f.day}" aria-label="${esc(label)}" ${f.day === sel ? 'aria-current="true"' : ""}><b>${f.boss ? `${CROWN}<span class="mem-sr">${f.day}</span>` : f.day}</b>${f.state === "locked" ? "<span class=\"mem-stars\"></span>" : stars(f)}</button></li>`;
  }
  K.towerMap = (l, cs) => {
    const st = G.status(l, Date.now(), false);
    const cur = cs.done ? null : cs.day;
    const sel = ui.floor || cur;
    const zones = CO.WEEKS.slice().reverse().map((w) => {
      const fl = [];
      for (let d = (w.n - 1) * 7 + 1; d <= w.n * 7; d += 1) fl.push(G.floorOf(l, d));
      const z = cs.done || w.n < cs.week.n ? "past" : w.n === cs.week.n ? "now" : "future";
      return `<li class="mem-zone ${z}"><div class="mem-zone-name"><b>${w.n}</b><span>${esc(w.title)}</span></div><ol class="mem-floors">${fl.map((f) => floorTile(f, sel)).join("")}</ol></li>`;
    }).join("");
    return `<div class="mem-tower">
        <div class="mem-tower-head"><span class="mem-kicker">La Torre della Memoria</span><span class="mem-tower-stats">${STAR}<b>${st.stars}</b>/${st.starsMax} stelle · ${CROWN}<b>${st.seals}</b>/6 sigilli · ${esc(st.title)} · livello ${st.level.level}</span></div>
        <ol class="mem-zones" aria-label="I piani della Torre, dal più alto">${zones}</ol>
        <p class="mem-small">Tocca un piano per vederne le stelle e la sfida. Ogni sette piani c'è un guardiano: una prova vera, che ti dà un sigillo e un titolo.</p>
      </div>`;
  };
  function starRows(l, f, current) {
    const q = f.quality;
    const ch = f.challenge;
    const open = G.challengeOpen(l, f.day);
    const qNote = !q || !q.scored ? "In questo piano non ci sono esercizi con punteggio: arriva con i compiti fatti." : `Almeno il 90% in ogni esercizio con punteggio (vale il tuo tentativo migliore)${q.parts.some((p) => p.best != null) ? `: ora il più basso è al ${Math.round(q.min * 100)}%` : ""}.${current || f.stars.p ? "" : " Si prende mentre il piano è aperto."}`;
    const chBtn = !open ? "" : f.boss ? "" : `<button type="button" class="${f.stars.s ? "ghost-action" : "primary-action"} small" data-m="ch-go" data-day="${f.day}">${f.stars.s ? "Rigioca" : "Affronta la sfida"}</button>`;
    return `<ol class="mem-starlist">
        <li class="${f.stars.c ? "on" : ""}"><i>${STAR}</i><div><strong>Completato</strong><span>${current ? "Tutti i compiti del piano." : f.stars.c ? "Compiti del piano fatti." : "Compiti del piano non finiti."}</span></div></li>
        <li class="${f.stars.p ? "on" : ""}"><i>${STAR}</i><div><strong>Preciso</strong><span>${esc(qNote)}</span></div></li>
        <li class="${f.stars.s ? "on" : ""}"><i>${STAR}</i><div><strong>${f.boss ? "Guardiano" : "Sfida"}</strong><span>${f.boss ? (f.stars.s ? "Sconfitto: il sigillo è tuo." : "Batti il guardiano qui sotto.") : `${esc(ch.label)}${f.stars.s ? ` Superata il ${dateShort(l.game.stars[f.day].s)}.` : ""}`}</span></div>${chBtn}</li>
      </ol>`;
  }
  function bossCard(l, f, mini = false) {
    const b = f.boss;
    const won = f.stars.s;
    const hp = b.target;
    const left = won ? 0 : Math.max(0, hp - (f.best || 0));
    const open = G.challengeOpen(l, f.day);
    return `<div class="mem-boss ${won ? "won" : ""} ${mini ? "mini" : ""}">
        <div class="mem-boss-head"><span class="mem-kicker">Guardiano del piano ${f.day}</span><strong>${esc(b.name)}</strong></div>
        <div class="mem-hp" role="img" aria-label="${won ? "Sconfitto" : `Punti vita ${left} su ${hp}`}"><i style="width:${(left / hp) * 100}%"></i></div>
        <p>${esc(b.line)}</p>
        <p class="mem-small">${won ? `Sconfitto il ${dateShort(l.game.seals[f.day] || Date.now())}: sigillo e titolo «${esc(b.title)}».` : f.tries ? `Tentativi: ${f.tries}. Il tuo migliore: ${f.best || 0} (ne servono ${hp}).` : "Ogni punto che fai è un colpo: servono tutti per batterlo. Puoi riprovare quando vuoi."}</p>
        ${open ? `<div class="mem-actions"><button type="button" class="${won ? "ghost-action" : "primary-action"}" data-m="ch-go" data-day="${f.day}">${won ? "Rigioca" : f.tries ? "Riprova" : "Affronta il guardiano"}</button></div>` : `<p class="mem-small">Si apre quando arrivi al piano ${f.day}.</p>`}
      </div>`;
  }
  K.floorCard = (l, cs) => {
    const f = G.floorOf(l, cs.day);
    return `<section class="mem-card mem-floor-card"><h3>Le stelle del piano ${cs.day}</h3>${starRows(l, f, true)}${f.boss ? bossCard(l, f) : ""}</section>`;
  };
  K.floorDetail = (l, cs) => {
    const day = ui.floor;
    const cur = cs.done ? null : cs.day;
    if (!day || day === cur) return "";
    const f = G.floorOf(l, day);
    if (!f) return "";
    const back = cur ? `<button type="button" class="ghost-action small" data-m="floor" data-day="${cur}">Torna al piano di oggi</button>` : "";
    if (f.state === "locked") {
      return `<section class="mem-card mem-floor-detail"><span class="mem-kicker">Piano ${day}${f.boss ? " · guardiano" : ""}</span><h3>${esc(f.def.title)}</h3><p>Si apre quando ci arrivi: un piano al giorno.</p>${f.boss ? `<p class="mem-small">${esc(f.boss.name)}: ${esc(f.boss.line)}</p>` : `<p class="mem-small">Sfida: ${esc(f.challenge.label)}</p>`}<div class="mem-actions">${back}</div></section>`;
    }
    const ls = f.def.lesson ? E.lessonById(f.def.lesson) : null;
    return `<section class="mem-card mem-floor-detail"><span class="mem-kicker">Piano ${day} · settimana ${f.week}</span><h3>${esc(f.def.title)}</h3>
        ${starRows(l, f, false)}${f.boss ? bossCard(l, f) : ""}
        ${ls && K.lessonBody ? `<details class="mem-lesson"><summary><span class="mem-kicker">Lezione</span><strong>${esc(ls.title)}</strong></summary>${K.lessonBody(ls)}</details>` : ""}
        <div class="mem-actions">${back}</div></section>`;
  };

  /* ------------------------------------------------------------ sfide e allenamenti */
  function startPalace(n, per, source, tag) {
    const l = lab();
    let usePer = per;
    let cand = l.palaces.filter((p) => p.loci.length >= Math.ceil(n / per));
    if (!cand.length && per === 1) { usePer = 2; cand = l.palaces.filter((p) => p.loci.length >= Math.ceil(n / 2)); }
    if (!cand.length) {
      const longest = l.palaces.slice().sort((a, b) => b.loci.length - a.loci.length)[0];
      ui.tab = "techniques";
      ui.technique = "loci";
      ui.returnTab = source === "today" ? "today" : "course";
      ui.palaceEdit = { id: longest ? longest.id : null };
      render(true);
      announce(`Per questa prova serve un palazzo con almeno ${Math.ceil(n / 2)} luoghi, due parole per luogo`);
      return;
    }
    cand.sort((a, b) => a.uses - b.uses);
    const r = E.makePalaceRound(l, cand[0].id, n, Date.now(), usePer);
    if (tag) r.challenge = tag;
    K.startRound(r, source);
  }
  function startChallenge(day, source) {
    const l = lab();
    if (!G.challengeOpen(l, day)) { announce("Questa sfida si apre quando arrivi al suo piano"); return; }
    const ch = G.challengeFor(day);
    const tag = { day, target: ch.target };
    if (ch.kind === "palace") { startPalace(ch.n, ch.per, source, tag); return; }
    if (ch.kind === "dis") {
      const r = E.makeRound(ch.key, 0, Date.now(), l, { n: ch.n, mem: ch.mem, list: ch.list || null, life: ch.life || null });
      r.challenge = tag;
      K.startRound(r, source);
      return;
    }
    if (ch.kind === "chess" && K.startChess) { K.startChess(ch.drill, source, { ...tag, maxMs: ch.maxMs || null, secs: ch.secs || null }); return; }
    if (ch.kind === "text" && K.startTextChallenge) K.startTextChallenge(ch.text, tag, source);
  }
  const sourceOf = () => (ui.tab === "today" ? "today" : "course");
  K.actions["ch-go"] = (el) => startChallenge(Number(el.dataset.day), ui.run ? ui.run.source || sourceOf() : sourceOf());
  K.actions["x-go"] = (el) => {
    let go;
    try { go = JSON.parse(el.dataset.go); } catch (e) { return; }
    const src = sourceOf();
    if (go.game === "challenge") { startChallenge(go.day, src); return; }
    if (go.custom) { K.startRound(E.makeRound(go.custom.key, 0, Date.now(), lab(), { n: go.custom.n, mem: go.custom.mem }), src); return; }
    if (go.palace) { startPalace(go.palace.n, go.palace.per, src, null); return; }
    K.go(go);
  };
  K.actions.floor = (el) => {
    const d = Number(el.dataset.day);
    const cs = E.courseStatus(lab(), Date.now(), false);
    ui.floor = !cs.done && d === cs.day ? null : d;
    render(false, true);
    const box = document.querySelector("#memPanel .mem-floor-detail, #memPanel .mem-floor-card");
    if (box && ui.floor) box.scrollIntoView({ block: "nearest", behavior: "smooth" });
  };
  K.soft.push("floor");

  // la sfida nel turno: titolo, presentazione e risultato
  K.challengeTitle = (round) => {
    const c = G.challengeFor(round.challenge.day);
    return c ? (c.boss ? c.name : `Sfida del piano ${c.day}`) : null;
  };
  K.roundIntro = (round) => {
    if (!round.challenge) return "";
    const c = G.challengeFor(round.challenge.day);
    if (!c) return "";
    const perNote = c.kind === "palace" && (round.per || 1) !== c.per ? `<p class="mem-small">Il tuo palazzo più lungo non basta per una parola per luogo: questa volta due per luogo. Allungalo per la prova vera.</p>` : "";
    if (c.boss) return `<div class="mem-boss mini"><div class="mem-boss-head"><span class="mem-kicker">Guardiano del piano ${c.day}</span><strong>${esc(c.name)}</strong></div><div class="mem-hp"><i style="width:100%"></i></div><p>${esc(c.line)}</p></div>${perNote}`;
    return `<p class="mem-tip">${esc(c.label)}. Superala e prendi la terza stella del piano ${c.day}.</p>${perNote}`;
  };
  K.resultExtra = (round, res, score) => {
    if (!round.challenge) return "";
    const c = G.challengeFor(round.challenge.day);
    if (!c) return "";
    const hp = round.challenge.target;
    const won = score >= hp;
    if (c.boss) {
      const sealT = lab().game.seals[c.day];
      const first = won && sealT && Date.now() - sealT < 120000;
      const left = Math.max(0, hp - score);
      return `<div class="mem-boss ${won ? "won" : ""}"><div class="mem-boss-head"><span class="mem-kicker">Guardiano del piano ${c.day}</span><strong>${esc(c.name)}</strong></div><div class="mem-hp"><i style="width:${(left / hp) * 100}%"></i></div><p><b>${won ? (first ? "Sconfitto!" : "Battuto di nuovo.") : `Gli restano ${left} punti vita.`}</b> ${won ? (first ? `Sigillo conquistato: ora il tuo titolo è «${esc(c.title)}», e hai uno scudo in più.` : "Il sigillo è già tuo: così tieni la tecnica allenata.") : `Servivano ${hp}, hai fatto ${score}. Riprova quando vuoi: con calma, prima precisi.`}</p></div>`;
    }
    return `<p class="mem-feedback-line ${won ? "ok" : "ko"}">${won ? `Sfida superata: terza stella al piano ${c.day}.` : `Sfida: ne servivano ${hp}, hai fatto ${score}. Riprova quando vuoi.`}</p>`;
  };

  /* ------------------------------------------------------------ durante gli esercizi */
  K.runTop = () => {
    const r = ui.run;
    const g = lab().game;
    if (!r || !g) return "";
    if (r.xp0 == null) r.xp0 = g.xp;
    const lv = G.levelOf(g.xp);
    const got = g.xp - r.xp0;
    const ch = (r.round && r.round.challenge) || r.challenge || null;
    const c = ch ? G.challengeFor(ch.day) : null;
    return `<div class="mem-runtop" aria-hidden="true">
        <span class="mem-runtop-lv">Livello ${lv.level}</span>
        <span class="mem-xpbar"><i style="width:${Math.round(lv.pct * 100)}%"></i></span>
        <b class="${got > 0 ? "on" : ""}">+${got}</b>
        ${r.combo >= 3 ? `<em>${r.combo} di fila</em>` : ""}
        ${c ? `<span class="mem-runtop-ch ${c.boss ? "boss" : ""}">${c.boss ? `${CROWN} ${esc(c.name)}` : `Sfida del piano ${c.day}`}</span>` : ""}
      </div>`;
  };

  /* ------------------------------------------------------------ avvisi */
  const queue = [];
  let showing = false;
  let box = null;
  function showNext() {
    const e = queue.shift();
    if (!e) { showing = false; return; }
    showing = true;
    if (!box || !box.isConnected) {
      box = document.createElement("div");
      box.className = "mem-toasts";
      box.setAttribute("role", "status");
      box.setAttribute("aria-live", "polite");
      (document.getElementById("memory") || document.body).appendChild(box);
    }
    const el = document.createElement("div");
    el.className = `mem-toast ${e.type || ""}`;
    el.innerHTML = `${e.type === "boss" ? CROWN : e.type === "star" ? STAR : ""}<div><strong>${esc(e.text)}</strong>${e.sub ? `<span>${esc(e.sub)}</span>` : ""}</div>`;
    box.appendChild(el);
    requestAnimationFrame(() => el.classList.add("in"));
    const long = e.type === "boss" || e.type === "level" || e.type === "missions" || e.type === "form";
    setTimeout(() => { el.classList.remove("in"); setTimeout(() => { el.remove(); showNext(); }, 260); }, long ? 3400 : 2300);
  }
  K.afterRender = () => {
    const ev = G.popEvents(lab());
    if (!ev.length) return;
    if (typeof saveState === "function") saveState();
    ev.forEach((e) => queue.push(e));
    // niente avvisi vecchi: un solo livello e una sola forma (gli ultimi), i guardiani sempre, al massimo quattro in fila
    const types = queue.map((e) => e.type);
    const last = { level: types.lastIndexOf("level"), form: types.lastIndexOf("form") };
    const keep = queue.filter((e, i) => !(e.type in last) || i === last[e.type]);
    while (keep.length > 4) { const i = keep.findIndex((e) => e.type !== "boss" && e.type !== "level"); keep.splice(i >= 0 ? i : 0, 1); }
    queue.length = 0;
    keep.forEach((e) => queue.push(e));
    if (!showing) showNext();
  };

  /* ------------------------------------------------------------ progressi */
  const prevProgress = K.progressExtra;
  K.progressExtra = (l) => {
    const st = G.status(l, Date.now(), false);
    const now = Date.now();
    const days = [];
    for (let i = 13; i >= 0; i -= 1) {
      const t = E.addDays(E.startOfDay(now), -i);
      const k = E.dayKey(t);
      days.push({ t, xp: l.game.daily[k] || 0, mem: l.game.memo[k], min: Math.floor((l.game.time[k] || 0) / 60) });
    }
    const maxXp = Math.max(100, ...days.map((d) => d.xp));
    const memDays = days.filter((d) => d.mem != null);
    return `<section class="mem-card mem-game-progress"><h3>La Torre</h3>
        <p>Livello ${st.level.level} (${st.xp} punti in tutto) · ${st.stars}/${st.starsMax} stelle · ${st.seals}/6 sigilli · titolo «${esc(st.title)}» · serie ${st.streak.n} ${st.streak.n === 1 ? "giorno" : "giorni"}.</p>
        <p>${st.mem.pct == null ? "Memoria attuale: ancora niente da misurare." : `Memoria attuale: ${pct1(st.mem.pct)}% di ${plural(st.mem.n, "cosa imparata", "cose imparate")}${memDays.length > 1 ? ` (14 giorni fa: ${pct1(memDays[0].mem)}%)` : ""}.`}</p>
        <div class="mem-xpdays" role="img" aria-label="Punti degli ultimi 14 giorni: ${days.map((d) => d.xp).join(", ")}">${days.map((d) => `<div><i style="height:${Math.round((d.xp / maxXp) * 100)}%"></i><span>${new Date(d.t).getDate()}</span></div>`).join("")}</div>
        <p class="mem-small">Punti degli ultimi 14 giorni. I punti arrivano solo ricordando: risposte giuste, turni riusciti, stelle e missioni.</p>
      </section>${prevProgress ? prevProgress(l) : ""}`;
  };

  /* ------------------------------------------------------------ tempo scelto e tempo vero */
  const prevInput = K.input;
  K.input = (event) => {
    const t = event.target;
    if (t && t.id === "memMinutes") {
      G.setMinutes(lab(), Number(t.value));
      save();
      render(false, true);
      announce(`Tempo al giorno: ${t.value} minuti`);
      return true;
    }
    return prevInput ? prevInput(event) : false;
  };
  document.addEventListener("DOMContentLoaded", () => {
    const page = document.getElementById("memory");
    if (!page) return;
    let last = Date.now();
    let ticks = 0;
    ["pointerdown", "keydown", "input", "wheel", "touchstart"].forEach((type) => document.addEventListener(type, () => { last = Date.now(); }, { passive: true }));
    // conta solo il tempo con la pagina della memoria aperta e in uso (durante un esercizio anche
    // le pause per memorizzare, fino a 8 minuti senza toccare niente)
    setInterval(() => {
      if (!page.classList.contains("active-page") || document.visibilityState !== "visible") return;
      if (Date.now() - last > (ui.run ? 8 : 2) * 60000) return;
      G.addActiveTime(lab(), 15, Date.now());
      ticks += 1;
      if (ticks % 4 === 0 && typeof saveState === "function") saveState();
    }, 15000);
  });
})();
