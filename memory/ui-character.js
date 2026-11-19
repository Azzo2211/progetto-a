/*
 * Progetto A - Memoria: la scheda Personaggio (agganciata con window.MemoryUIKit).
 *  - il personaggio con la sua forma, il livello, i cristalli e le forme che arriveranno;
 *  - scrigni ed evocazioni, con l'apertura e le probabilita' scritte;
 *  - equipaggiamento (mantello, aura, emblema, compagno, sfondo) e album della collezione;
 *  - statistiche: il profilo vero della memoria (l'esagono);
 *  - nel quadro di Oggi il personaggio in piccolo, e un segno sulla scheda quando c'e' da aprire.
 * Conti in memory/gacha.js e memory/game.js, disegni in memory/art.js.
 */
(function () {
  "use strict";

  const K = window.MemoryUIKit;
  const G = window.MemoryGame;
  const GA = window.MemoryGacha;
  const A = window.MemoryArt;
  if (!K || !G || !G.status || !GA || !A || !A.avatar) return;
  const { esc, plural, lab, save, announce, render, ui } = K;

  const charOf = (l) => (l.game ? l.game.char : null);
  const catLabel = (id) => (GA.CATS.find((c) => c.id === id) || { label: "" }).label;
  const pct = (v) => `${String(Math.round(v * 1000) / 10).replace(".", ",")}%`;
  ui.charCat = ui.charCat || "cloak";
  ui.charItem = null;
  ui.charSlot = null;
  ui.charRename = false;

  /* ------------------------------------------------------------ la scheda */
  function hero(l, ch, st) {
    const lv = st.level;
    const form = GA.formOf(lv.level);
    const next = GA.nextForm(lv.level);
    const name = ui.charRename
      ? `<form class="mem-char-rename" id="memCharName"><label class="mem-sr" for="memCharNameInput">Nome del personaggio</label><input type="text" id="memCharNameInput" maxlength="20" value="${esc(ch.name)}" autocomplete="off" data-autofocus><button type="submit" class="primary-action small">Salva</button></form>`
      : `<h2 data-focus tabindex="-1">${esc(ch.name)}</h2><button type="button" class="mem-linkbtn mem-char-renamebtn" data-m="char-rename">cambia nome</button>`;
    return `<section class="mem-char-hero">
        <div class="mem-char-av">${A.avatar(ch, lv.level, { label: `${ch.name}, forma ${form.name}` })}</div>
        <div class="mem-char-info">
          <span class="mem-kicker">Forma ${form.n} di ${GA.FORMS.length}: ${esc(form.name)}</span>
          <div class="mem-char-name">${name}</div>
          <p class="mem-char-sub">Livello ${lv.level} · ${esc(st.title)}</p>
          <div class="mem-xpbar big" role="img" aria-label="${lv.into} punti su ${lv.need}"><i style="width:${Math.round(lv.pct * 100)}%"></i></div>
          <span class="mem-char-xp">${lv.into}/${lv.need} punti per il livello ${lv.level + 1}</span>
          <p class="mem-char-next">${next ? `Prossima forma al livello ${next.level}: <b>${esc(next.name)}</b>. ${esc(next.line)}` : "Tutte le forme sbloccate."}</p>
          <div class="mem-wallet"><span>${A.crystal(18)}<b>${ch.crystals}</b> cristalli</span><span><i class="mem-dust" aria-hidden="true"></i><b>${ch.dust}</b> polvere di stelle</span></div>
          <ol class="mem-forms" aria-label="Le forme del personaggio">${GA.FORMS.map((f, i) => `<li class="${lv.level >= f.level ? "on" : ""} ${form.n === i + 1 ? "now" : ""}"><span>${A.avatar(ch, f.level, { bust: true, plain: "#191530", form: i + 1, label: `${f.name}, livello ${f.level}` })}</span><b>${esc(f.name)}</b><em>liv. ${f.level}</em></li>`).join("")}</ol>
        </div>
      </section>`;
  }
  function summonCard(ch) {
    const kinds = Object.keys(GA.CHESTS).filter((k) => ch.chests[k] > 0);
    const pe = GA.PITY_E - ch.pity.e;
    const pl = GA.PITY_L - ch.pity.l;
    return `<section class="mem-card mem-summon">
        <div class="mem-summon-head"><h3>Scrigni ed evocazioni</h3><span>${A.crystal(16)} <b>${ch.crystals}</b></span></div>
        ${kinds.length ? `<ul class="mem-chests">${kinds.map((k) => `<li class="${k}">${A.chest(k, 56)}<div><strong>${esc(GA.CHESTS[k].label)}${ch.chests[k] > 1 ? ` ×${ch.chests[k]}` : ""}</strong><span>${esc(GA.CHESTS[k].line)}</span></div><button type="button" class="primary-action small" data-m="chest-open" data-kind="${k}">Apri</button></li>`).join("")}</ul>` : `<p class="mem-small">Nessuno scrigno da aprire. Ne guadagni uno per ogni piano completato, uno d'oro ogni 5 livelli e uno speciale per ogni guardiano battuto.</p>`}
        <div class="mem-summon-btns">
          <button type="button" class="mem-summon-btn" data-m="summon" data-n="1" ${ch.crystals < GA.PULL_COST ? "disabled" : ""}><strong>Evoca</strong><span>${A.crystal(14)} ${GA.PULL_COST}</span></button>
          <button type="button" class="mem-summon-btn ten" data-m="summon" data-n="10" ${ch.crystals < GA.TEN_COST ? "disabled" : ""}><strong>Evoca ×10</strong><span>${A.crystal(14)} ${GA.TEN_COST} · almeno un epico</span></button>
        </div>
        <p class="mem-small">${ch.crystals < GA.PULL_COST ? `Ti mancano ${GA.PULL_COST - ch.crystals} cristalli per un'evocazione. ` : ""}Epico garantito entro ${pe} ${pe === 1 ? "evocazione" : "evocazioni"}, leggendario entro ${pl}.</p>
        <details class="mem-odds"><summary>Probabilità e garanzie</summary>
          <table class="mem-table"><tbody>${GA.RARITIES.map((r) => `<tr><th scope="row"><span class="mem-rar" style="--rc:${r.color}">${r.label}</span></th><td>${pct(r.odds)}</td><td>${GA.POOL.filter((it) => it.r === r.id).length} oggetti</td><td>doppione: +${r.dust} polvere</td></tr>`).join("")}</tbody></table>
          <p class="mem-small">Lo scrigno del piano e le evocazioni hanno queste probabilità; lo scrigno d'oro dà almeno un raro, quello del guardiano almeno un epico. Dieci evocazioni insieme danno sempre almeno un epico. I doppioni diventano polvere di stelle, che serve a forgiare l'oggetto che vuoi. Niente soldi veri: cristalli e scrigni arrivano solo allenandoti.</p>
        </details>
      </section>`;
  }
  function itemCard(it, ch, act, on = false) {
    const own = GA.owns(ch, it.id);
    const fresh = own && !it.start && !ch.seen[it.id];
    const r = GA.RAR[it.r];
    return `<li><button type="button" class="mem-itemcard r${it.r} ${own ? "" : "locked"} ${on ? "on" : ""}" style="--rc:${r.color}" data-m="${act}" data-id="${it.id}" data-slot="${it.cat}" aria-label="${esc(`${it.name}, ${r.label}${own ? "" : ", non ancora trovato"}`)}">
        <span class="mem-itemcard-art">${A.item(it)}${own ? "" : '<i class="mem-lock" aria-hidden="true"></i>'}</span>
        <strong>${esc(it.name)}</strong><span class="mem-rar">${r.label}${own && ch.items[it.id] > 1 ? ` ×${ch.items[it.id]}` : ""}</span>
        ${fresh ? '<em class="mem-new">Nuovo</em>' : ""}
      </button></li>`;
  }
  function equipCard(ch) {
    const open = ui.charSlot;
    return `<section class="mem-card mem-equip"><h3>Equipaggiamento</h3>
        <ul class="mem-slots">${GA.SLOTS.map((s) => {
          const id = ch.equip[s.id];
          const it = id ? GA.itemById(id) : null;
          const n = GA.CATALOG.filter((x) => x.cat === s.id && GA.owns(ch, x.id)).length;
          const count = n === 0 ? "da trovare" : n === 1 ? "1 tuo" : `${n} tuoi`;
          return `<li><button type="button" class="mem-slot ${open === s.id ? "open" : ""}" data-m="char-slot" data-slot="${s.id}" aria-expanded="${open === s.id}">${it ? `<span class="mem-slot-art r${it.r}" style="--rc:${GA.RAR[it.r].color}">${A.item(it)}</span>` : '<span class="mem-slot-art empty">—</span>'}<strong>${esc(s.label)}</strong><span>${it ? esc(it.name) : "nessuno"} · ${count}</span></button></li>`;
        }).join("")}</ul>
        ${open ? slotPicker(ch, open) : ""}
      </section>`;
  }
  function slotPicker(ch, slot) {
    const s = GA.SLOTS.find((x) => x.id === slot);
    const owned = GA.CATALOG.filter((it) => it.cat === slot && GA.owns(ch, it.id));
    return `<div class="mem-picker"><p class="mem-small">${esc(s.label)}: tocca quello da indossare.${owned.length < 2 && !s.none ? " Gli altri si trovano negli scrigni." : ""}</p>
        <ul class="mem-items">${s.none ? `<li><button type="button" class="mem-itemcard none ${ch.equip[slot] === null ? "on" : ""}" data-m="equip" data-slot="${slot}" data-id=""><span class="mem-itemcard-art"><span class="mem-slot-art empty">—</span></span><strong>Nessuno</strong></button></li>` : ""}${owned.map((it) => itemCard(it, ch, "equip", ch.equip[slot] === it.id)).join("")}</ul></div>`;
  }
  function itemDetail(ch, id) {
    const it = GA.itemById(id);
    if (!it) return "";
    const own = GA.owns(ch, id);
    const r = GA.RAR[it.r];
    const cost = GA.craftCost(id);
    const slot = GA.SLOTS.find((s) => s.id === it.cat);
    let acts = "";
    if (own && slot) acts += ch.equip[slot.id] === id ? '<span class="mem-small">Lo stai indossando.</span>' : `<button type="button" class="primary-action small" data-m="equip" data-slot="${slot.id}" data-id="${id}">Indossa</button>`;
    if (!own) acts += `<button type="button" class="ghost-action small" data-m="craft" data-id="${id}" ${ch.dust < cost ? "disabled" : ""}>Forgia con ${cost} polvere</button>`;
    return `<div class="mem-itemdetail r${it.r}" style="--rc:${r.color}">
        <div class="mem-itemdetail-art ${own ? "" : "locked"}">${A.item(it, { label: it.name })}</div>
        <div><span class="mem-rar">${r.label} · ${esc(catLabel(it.cat))}</span><h4>${esc(it.name)}</h4>
          <p>${own ? esc(it.lore) : it.cat === "relic" ? "Una pagina di storia della memoria: la scopri quando trovi la reliquia." : "Ancora da trovare: negli scrigni, nelle evocazioni o alla forgia."}</p>
          ${!own ? `<p class="mem-small">Hai ${ch.dust} polvere di stelle su ${cost}.</p>` : ""}
          <div class="mem-actions">${acts}<button type="button" class="ghost-action small" data-m="char-item" data-id="">Chiudi</button></div>
        </div>
      </div>`;
  }
  function collectionCard(ch) {
    const col = GA.collection(ch);
    const cat = ui.charCat;
    const list = GA.CATALOG.filter((it) => it.cat === cat);
    return `<section class="mem-card mem-collection">
        <div class="mem-coll-head"><h3>Collezione</h3><span><b>${col.owned}</b>/${col.total} trovati</span></div>
        <div class="mem-seg mem-coll-cats" role="group" aria-label="Categorie">${GA.CATS.map((c) => `<button type="button" data-m="char-cat" data-cat="${c.id}" aria-pressed="${c.id === cat}">${esc(c.label)} <small>${col.byCat[c.id].owned}/${col.byCat[c.id].total}</small></button>`).join("")}</div>
        ${ui.charItem && GA.itemById(ui.charItem) && GA.itemById(ui.charItem).cat === cat ? itemDetail(ch, ui.charItem) : ""}
        <ul class="mem-items">${list.map((it) => itemCard(it, ch, "char-item", ui.charItem === it.id)).join("")}</ul>
      </section>`;
  }
  function earnCard() {
    const g = G.GEMS;
    const rows = [
      ["Piano completato", `${g.day} cristalli e uno scrigno`],
      ["Piano preciso", `${g.precise} cristalli`],
      ["Sfida superata", `${g.challenge} cristalli`],
      ["Guardiano battuto", `${g.boss} cristalli e uno scrigno del guardiano (almeno epico)`],
      ["Ogni livello", `${g.level} cristalli; ogni 5 livelli uno scrigno d'oro (almeno raro)`],
      ["Ogni missione", `${g.mission} cristalli; tutte e tre: altri ${g.allMissions}`],
      ["Nuovo record", `${g.record} cristalli`]
    ];
    return `<section class="mem-card"><h3>Come si guadagna</h3><table class="mem-table"><tbody>${rows.map(([a, b]) => `<tr><th scope="row">${a}</th><td>${b}</td></tr>`).join("")}</tbody></table><p class="mem-small">Solo allenandoti: niente cristalli per il tempo passato o per i clic. ${GA.PULL_COST} cristalli fanno un'evocazione.</p></section>`;
  }
  function charView() {
    const l = lab();
    const ch = charOf(l);
    if (!ch) return '<p class="mem-empty">Il personaggio non è disponibile.</p>';
    const st = G.status(l, Date.now(), false);
    return `<div class="mem-char">
        ${hero(l, ch, st)}
        ${summonCard(ch)}
        ${equipCard(ch)}
        ${collectionCard(ch)}
        <section class="mem-card mem-char-stats"><h3>Statistiche: la tua memoria vera</h3><p class="mem-small">Il personaggio non ha punti inventati: le sue statistiche sono il tuo profilo di memoria, che sale solo se migliori nei test, negli esercizi e nei ripassi.</p>${K.profileMini ? K.profileMini(l) : ""}</section>
        ${earnCard()}
      </div>`;
  }
  K.tabs.char = charView;

  /* ------------------------------------------------------------ apertura degli scrigni */
  function startSummon(results, label) {
    if (!results) { announce("Non hai abbastanza cristalli"); render(false, true); return; }
    K.stopTimers();
    const best = results.reduce((m, x) => Math.max(m, GA.RANK[x.r]), 0);
    const sel = results.findIndex((x) => GA.RANK[x.r] === best);
    ui.tab = "char";
    ui.run = { type: "summon", results, phase: "portal", best, label, sel: Math.max(0, sel), source: "char" };
    save();
    render(true);
  }
  function summonView() {
    const r = ui.run;
    const ch = charOf(lab());
    const top = GA.RARITIES[r.best];
    const head = `${K.backBar("← Personaggio")}<div class="mem-run-head"><span class="mem-kicker">${esc(r.label)}</span><span>${r.results.length > 1 ? `${r.results.length} oggetti` : ""}</span></div>`;
    if (r.phase === "portal") {
      return `${head}<article class="mem-card mem-portal-card"><button type="button" class="mem-portal r${top.id}" style="--rc:${top.color}" data-m="summon-open" data-autofocus><span class="mem-portal-ring" aria-hidden="true"></span><span class="mem-portal-orb" aria-hidden="true"></span><strong>Tocca per aprire</strong></button><p class="mem-small">Il colore della luce annuncia la rarità migliore che ti aspetta.</p></article>`;
    }
    const res = r.results;
    const sel = res[r.sel] || res[0];
    const it = GA.itemById(sel.id);
    const rr = GA.RAR[sel.r];
    const slot = GA.SLOTS.find((s) => s.id === it.cat);
    const grid = res.length > 1 ? `<ul class="mem-reveal-grid">${res.map((x, i) => { const xi = GA.itemById(x.id); const xr = GA.RAR[x.r]; return `<li><button type="button" class="mem-reveal-card r${x.r} ${i === r.sel ? "on" : ""}" style="--rc:${xr.color};--d:${i * 120}ms" data-m="summon-sel" data-i="${i}" aria-label="${esc(`${xi.name}, ${xr.label}`)}">${A.item(xi)}<span>${esc(xr.label)}</span>${x.dup ? "" : '<em class="mem-new">Nuovo</em>'}</button></li>`; }).join("")}</ul>` : "";
    const equipBtn = slot && GA.owns(ch, it.id) ? (ch.equip[slot.id] === it.id ? '<span class="mem-small">Indossato.</span>' : `<button type="button" class="primary-action" data-m="equip" data-slot="${slot.id}" data-id="${it.id}">Indossa</button>`) : "";
    return `${head}<article class="mem-card mem-reveal r${sel.r}" style="--rc:${rr.color}">
        ${grid}
        <div class="mem-reveal-main" data-k="${esc(sel.id)}${r.sel}">
          <div class="mem-reveal-art">${A.item(it, { label: it.name })}</div>
          <div class="mem-reveal-text"><span class="mem-rar">${rr.label} · ${esc(catLabel(it.cat))}</span><h2 data-focus tabindex="-1">${esc(it.name)}</h2><p>${esc(it.lore)}</p>
            <p class="mem-small">${sel.dup ? `Ce l'avevi già: +${sel.dust} polvere di stelle.` : "Nuovo nella tua collezione."}</p>
            <div class="mem-actions">${equipBtn}${ch.crystals >= GA.PULL_COST ? `<button type="button" class="ghost-action" data-m="summon" data-n="1">Evoca ancora · ${GA.PULL_COST}</button>` : ""}<button type="button" class="ghost-action" data-m="exit">Torna al personaggio</button></div>
          </div>
        </div>
      </article>`;
  }
  K.views.summon = summonView;
  K.actions.summon = (el) => {
    const l = lab();
    const n = Number(el.dataset.n) === 10 ? 10 : 1;
    startSummon(GA.summon(charOf(l), n, Math.random, Date.now()), n === 10 ? "Dieci evocazioni" : "Evocazione");
  };
  K.actions["chest-open"] = (el) => {
    const l = lab();
    const k = el.dataset.kind;
    startSummon(GA.openChest(charOf(l), k, Math.random, Date.now()), GA.CHESTS[k] ? GA.CHESTS[k].label : "Scrigno");
  };
  K.actions["summon-open"] = () => {
    const r = ui.run;
    if (!r || r.type !== "summon") return;
    r.phase = "reveal";
    GA.markSeen(charOf(lab()), r.results.map((x) => x.id));
    save();
    render(true);
    const top = r.results[r.sel];
    announce(`${GA.RAR[top.r].label}: ${GA.itemById(top.id).name}`);
  };
  K.actions["summon-sel"] = (el) => { if (ui.run) { ui.run.sel = Number(el.dataset.i) || 0; render(false, true); } };
  K.soft.push("summon-sel");

  /* ------------------------------------------------------------ equipaggiamento e collezione */
  K.actions.equip = (el) => {
    const ch = charOf(lab());
    const id = el.dataset.id || null;
    if (GA.equip(ch, el.dataset.slot, id)) {
      save();
      render(false, true);
      announce(id ? `Indossato: ${GA.itemById(id).name}` : "Tolto");
    }
  };
  K.actions["char-slot"] = (el) => { ui.charSlot = ui.charSlot === el.dataset.slot ? null : el.dataset.slot; render(false, true); };
  K.actions["char-cat"] = (el) => { ui.charCat = el.dataset.cat; ui.charItem = null; render(false, true); };
  K.actions["char-item"] = (el) => {
    const id = el.dataset.id || null;
    ui.charItem = ui.charItem === id ? null : id;
    if (id) { GA.markSeen(charOf(lab()), [id]); save(); }
    render(false, true);
  };
  K.actions.craft = (el) => {
    const ch = charOf(lab());
    if (GA.craft(ch, el.dataset.id)) { save(); announce(`Forgiato: ${GA.itemById(el.dataset.id).name}`); render(false, true); }
  };
  K.actions["char-rename"] = () => { ui.charRename = true; render(true); };
  K.soft.push("char-slot", "char-cat", "char-item", "equip");

  /* ------------------------------------------------------------ il personaggio nel quadro di Oggi */
  K.hudChar = (l, st) => {
    const ch = charOf(l);
    if (!ch) return null;
    const lv = st.level;
    const todo = GA.chestsTotal(ch);
    const fresh = GA.unseen(ch).length;
    return `<button type="button" class="mem-hud-stat mem-hud-char" data-m="go-tab" data-tab="char" aria-label="${esc(`${ch.name}, livello ${lv.level}. Apri il personaggio`)}">
        <span class="mem-hud-av">${A.avatar(ch, lv.level, { bust: true, label: ch.name })}</span>
        <span class="mem-hud-char-txt"><span class="mem-kicker">${esc(ch.name)}</span><strong>Liv. ${lv.level}</strong><span class="mem-xpbar"><i style="width:${Math.round(lv.pct * 100)}%"></i></span><span>${A.crystal(12)} ${ch.crystals}${todo ? ` · ${plural(todo, "scrigno", "scrigni")}` : fresh ? " · novità" : ""}</span></span>
      </button>`;
  };
  function badge() {
    const btn = document.querySelector('#memory [data-mem-tab="char"]');
    const l = lab();
    const ch = charOf(l);
    if (!btn || !ch) return;
    const n = GA.chestsTotal(ch) + (ch.crystals >= GA.PULL_COST ? 1 : 0);
    btn.classList.toggle("has-badge", n > 0);
  }
  const prevAfter = K.afterRender;
  K.afterRender = () => { if (prevAfter) prevAfter(); badge(); };
  const prevRunTop = K.runTop;
  K.runTop = () => (ui.run && ui.run.type === "summon" ? "" : prevRunTop ? prevRunTop() : "");

  document.addEventListener("DOMContentLoaded", () => {
    const page = document.getElementById("memory");
    if (!page) return;
    page.addEventListener("submit", (event) => {
      if (!event.target || event.target.id !== "memCharName") return;
      event.preventDefault();
      const inp = document.getElementById("memCharNameInput");
      const ch = charOf(lab());
      const v = inp ? inp.value.trim().slice(0, 20) : "";
      if (ch && v) ch.name = v;
      ui.charRename = false;
      save();
      render(true);
    });
  });
})();
