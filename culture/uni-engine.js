/*
 * Progetto A - Cultura: motore della mini università (senza DOM, testato in tests/university.test.js).
 *
 * - Corsi costruiti su materiali veri e gratuiti (MIT OpenCourseWare, Open Yale Courses, Harvard...):
 *   ogni lezione ha la spiegazione in italiano, il link alla lezione originale, il quiz e lo "spiegalo tu".
 * - Lezione: superata con almeno il 60% delle domande giuste. Entra nel ripasso distanziato
 *   (scatole di Leitner, 1-3-7-16-35 giorni) come le schede della biblioteca.
 * - Esame finale del corso: domande da tutte le lezioni, voto in trentesimi (18 con il 60%, 30 e lode
 *   con tutto giusto). Si sblocca finite le lezioni; resta il voto migliore. Libretto con la media.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.UniEngine = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const VERSION = 1;
  const DAY = 24 * 60 * 60 * 1000;
  const INTERVALS = [0, 1, 3, 7, 16, 35];
  const PASS = 0.6;
  const EXAM_SIZE = 12;
  const CFU = 6;

  const FACULTIES = {
    psicologia: { label: "Psicologia", color: "#8a4f9c" },
    neuroscienze: { label: "Neuroscienze", color: "#b5523b" },
    economia: { label: "Economia", color: "#2c7a3f" },
    finanza: { label: "Finanza", color: "#1f6e8c" },
    strategia: { label: "Strategia e teoria dei giochi", color: "#a8741a" },
    filosofia: { label: "Filosofia", color: "#5c5aa8" },
    storia: { label: "Storia", color: "#8c4a2f" },
    informatica: { label: "Informatica", color: "#3b6fb5" },
    matematica: { label: "Matematica", color: "#1f7a6d" },
    fisica: { label: "Fisica", color: "#6b5b2e" }
  };
  const LEVELS = { 1: "Base", 2: "Intermedio", 3: "Avanzato" };

  const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
  const num = (v) => typeof v === "number" && Number.isFinite(v);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  // Mezzanotte locale tra n giorni di calendario (niente scivolamenti con l'ora legale).
  function addDays(time, n) {
    const d = new Date(time);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + n);
    return d.getTime();
  }
  function dayKey(t) {
    const d = new Date(t);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  // Generatore ripetibile (per le domande dell'esame e del ripasso).
  function rng(seed) {
    let a = (seed >>> 0) || 1;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(list, rand) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ------------------------------------------------------------ stato */
  function cleanLesson(x) {
    if (!isObj(x)) return null;
    const out = {
      box: Number.isInteger(x.box) ? clamp(x.box, 0, 5) : 0,
      best: num(x.best) ? clamp(x.best, 0, 100) : null,
      tries: Number.isInteger(x.tries) && x.tries >= 0 ? x.tries : 0,
      done: num(x.done) ? x.done : null,
      due: num(x.due) ? x.due : null,
      last: num(x.last) ? x.last : null,
      reviews: Number.isInteger(x.reviews) && x.reviews >= 0 ? x.reviews : 0
    };
    if (typeof x.note === "string" && x.note.trim()) out.note = x.note.slice(0, 3000);
    // lezione superata ma con dati mancanti: voto minimo e ripasso dal giorno dopo
    if (out.done) {
      if (out.best == null || out.best < PASS * 100) out.best = Math.round(PASS * 100);
      if (out.due == null) out.due = addDays(out.done, 1);
      if (out.box < 1) out.box = 1;
    }
    return out;
  }
  function cleanExam(x) {
    if (!isObj(x)) return null;
    const attempts = Array.isArray(x.attempts) ? x.attempts.filter((a) => isObj(a) && num(a.t) && a.t > 0 && Number.isInteger(a.correct) && Number.isInteger(a.total) && a.total > 0 && a.correct >= 0 && a.correct <= a.total).slice(-20).map((a) => ({ t: a.t, correct: a.correct, total: a.total })) : [];
    if (!attempts.length) return null;
    return { attempts };
  }

  function ensure(raw) {
    const uni = isObj(raw) && raw.version === VERSION ? raw : { version: VERSION };
    const lessons = isObj(uni.lessons) ? uni.lessons : {};
    uni.lessons = {};
    Object.keys(lessons).forEach((id) => { const c = cleanLesson(lessons[id]); if (c && /^[a-z0-9-]+$/.test(id)) uni.lessons[id] = c; });
    const exams = isObj(uni.exams) ? uni.exams : {};
    uni.exams = {};
    Object.keys(exams).forEach((id) => { const c = cleanExam(exams[id]); if (c && /^[a-z0-9-]+$/.test(id)) uni.exams[id] = c; });
    uni.days = Array.isArray(uni.days) ? uni.days.filter((d) => typeof d === "string" && /^\d{4}-\d\d-\d\d$/.test(d)).slice(-400) : [];
    uni.minutes = num(uni.minutes) && uni.minutes >= 0 ? uni.minutes : 0;
    return uni;
  }

  function lessonState(uni, id) { return uni.lessons[id] || { box: 0, best: null, tries: 0, done: null, due: null, last: null, reviews: 0 }; }
  const markDay = (uni, now) => { const k = dayKey(now); if (!uni.days.includes(k)) uni.days.push(k); };

  /* ------------------------------------------------------------ lezioni */
  // Fine di una lezione (verifica fatta): superata dal 60%; la prima volta entra in ripasso.
  function finishLesson(uni, lesson, { correct, total, now = Date.now(), note = null } = {}) {
    if (!lesson || !Number.isInteger(correct) || !Number.isInteger(total) || total <= 0) return null;
    const st = cleanLesson(lessonState(uni, lesson.id)) || {};
    const score = Math.round((clamp(correct, 0, total) / total) * 100);
    const passed = score >= PASS * 100;
    st.tries += 1;
    st.last = now;
    st.best = st.best == null ? score : Math.max(st.best, score);
    if (passed && !st.done) {
      st.done = now;
      st.box = Math.max(st.box, 1);
      st.due = addDays(now, INTERVALS[st.box]);
    }
    if (typeof note === "string") { if (note.trim()) st.note = note.slice(0, 3000); else delete st.note; }
    uni.lessons[lesson.id] = st;
    uni.minutes += num(lesson.minutes) ? lesson.minutes : 0;
    markDay(uni, now);
    return { score, passed, box: st.box, due: st.due, first: passed && st.done === now };
  }

  function isDone(uni, id) { return !!lessonState(uni, id).done; }

  // Quante lezioni sono da ripassare oggi, anche senza i dati dei corsi (per il numerino della scheda).
  function dueCount(uni, now = Date.now()) {
    return Object.values(uni.lessons).filter((st) => st.done && num(st.due) && st.due <= now).length;
  }

  // Lezioni da ripassare oggi (le piu' in ritardo prima).
  function dueLessons(uni, courses, now = Date.now()) {
    const out = [];
    (courses || []).forEach((c) => c.lessons.forEach((l) => {
      const st = uni.lessons[l.id];
      if (st && st.done && num(st.due) && st.due <= now) out.push({ course: c, lesson: l, due: st.due, box: st.box });
    }));
    return out.sort((a, b) => a.due - b.due || a.box - b.box);
  }

  // Ripasso di una lezione: tutto giusto sale di scatola, altrimenti scende (non sotto la 1).
  function reviewLesson(uni, lesson, { correct, total, now = Date.now() } = {}) {
    const st = uni.lessons[lesson.id];
    if (!st || !st.done || !Number.isInteger(correct) || !Number.isInteger(total) || total <= 0) return null;
    const ok = correct === total;
    st.box = ok ? Math.min(5, st.box + 1) : Math.max(1, st.box - 1);
    st.due = addDays(now, INTERVALS[st.box]);
    st.reviews += 1;
    st.last = now;
    markDay(uni, now);
    return { ok, box: st.box, due: st.due };
  }

  // Domande di ripasso: n domande della lezione, scelte con un seme (cambiano a ogni ripasso).
  function reviewQuestions(lesson, n = 2, seed = Date.now()) {
    return shuffle(lesson.quiz.map((q, i) => ({ ...q, li: i })), rng(seed)).slice(0, n);
  }

  /* ------------------------------------------------------------ corsi ed esami */
  function courseProgress(uni, course) {
    const total = course.lessons.length;
    const done = course.lessons.filter((l) => isDone(uni, l.id)).length;
    const next = course.lessons.find((l) => !isDone(uni, l.id)) || null;
    const ex = examResult(uni, course.id);
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0, next, examOpen: done === total && total > 0, exam: ex, started: done > 0 || course.lessons.some((l) => uni.lessons[l.id]) };
  }

  // Esame: EXAM_SIZE domande, almeno una per lezione finche' ce ne sono, il resto a caso; opzioni rimescolate.
  function makeExam(course, seed = Date.now()) {
    const rand = rng(seed);
    const pool = course.lessons.map((l) => shuffle(l.quiz.map((q, i) => ({ ...q, lesson: l.id, lessonTitle: l.title, qi: i })), rand));
    const out = [];
    let round = 0;
    while (out.length < EXAM_SIZE && pool.some((p) => p.length > round)) {
      shuffle(pool, rand).forEach((p) => { if (out.length < EXAM_SIZE && p[round]) out.push(p[round]); });
      round += 1;
    }
    return shuffle(out, rand).map((q) => {
      const order = shuffle([0, 1, 2, 3].slice(0, q.options.length), rand);
      return { ...q, order };
    });
  }

  // Voto in trentesimi: servono almeno il 60% di risposte giuste (8 su 12), che valgono 18;
  // tutto giusto vale 30 e lode, in mezzo si sale in proporzione.
  function minCorrect(total) { return Math.ceil(total * PASS - 1e-9); }
  function grade(correct, total) {
    if (!Number.isInteger(correct) || !Number.isInteger(total) || total <= 0) return null;
    const c = clamp(correct, 0, total);
    const f = c / total;
    const need = minCorrect(total);
    if (c < need) return { passed: false, vote: null, lode: false, pct: Math.round(f * 100) };
    const vote = need >= total ? 30 : clamp(Math.round(18 + ((c - need) / (total - need)) * 12), 18, 30);
    return { passed: true, vote, lode: correct === total, pct: Math.round(f * 100) };
  }
  const voteLabel = (g) => (!g ? "—" : !g.passed ? "Non superato" : g.lode ? "30 e lode" : `${g.vote}/30`);

  function recordExam(uni, course, { correct, total, now = Date.now() } = {}) {
    const g = grade(correct, total);
    if (!g || !course) return null;
    const ex = uni.exams[course.id] || { attempts: [] };
    ex.attempts.push({ t: now, correct, total });
    if (ex.attempts.length > 20) ex.attempts = ex.attempts.slice(-20);
    uni.exams[course.id] = ex;
    markDay(uni, now);
    return { ...g, best: examResult(uni, course.id) };
  }

  // Miglior tentativo d'esame (null se mai fatto).
  function examResult(uni, courseId) {
    const ex = uni.exams[courseId];
    if (!ex || !ex.attempts.length) return null;
    let best = null;
    ex.attempts.forEach((a) => {
      const g = grade(a.correct, a.total);
      const key = g.passed ? g.vote + (g.lode ? 0.5 : 0) : -1 + a.correct / a.total;
      if (!best || key > best.key) best = { ...g, t: a.t, key, attempts: ex.attempts.length };
    });
    delete best.key;
    return best;
  }

  // Libretto: esami superati, crediti, media (in trentesimi, la lode conta 30).
  function libretto(uni, courses) {
    const rows = (courses || []).map((c) => ({ course: c, exam: examResult(uni, c.id) })).filter((r) => r.exam && r.exam.passed).sort((a, b) => a.exam.t - b.exam.t);
    const cfu = rows.length * CFU;
    const avg = rows.length ? Math.round((rows.reduce((n, r) => n + r.exam.vote, 0) / rows.length) * 100) / 100 : null;
    return { rows, cfu, avg, base110: avg == null ? null : Math.round((avg / 30) * 110) };
  }

  function stats(uni, courses, now = Date.now()) {
    const all = (courses || []).flatMap((c) => c.lessons);
    const done = all.filter((l) => isDone(uni, l.id)).length;
    const started = (courses || []).filter((c) => courseProgress(uni, c).started).length;
    const lib = libretto(uni, courses);
    const days = new Set(uni.days);
    let streak = 0;
    for (let i = 0; i < 400; i += 1) {
      const k = dayKey(now - i * DAY);
      if (days.has(k)) streak += 1;
      else if (i === 0) continue;
      else break;
    }
    return { lessons: all.length, done, started, courses: (courses || []).length, exams: lib.rows.length, avg: lib.avg, cfu: lib.cfu, minutes: uni.minutes, due: dueLessons(uni, courses, now).length, streak };
  }

  // Corso consigliato: quello iniziato con la lezione successiva, altrimenti il primo non iniziato.
  function suggest(uni, courses) {
    const list = courses || [];
    const going = list.map((c) => ({ c, p: courseProgress(uni, c) })).filter((x) => x.p.started && x.p.next);
    if (going.length) return going.sort((a, b) => b.p.done - a.p.done)[0];
    const fresh = list.find((c) => !courseProgress(uni, c).started);
    return fresh ? { c: fresh, p: courseProgress(uni, fresh) } : null;
  }

  return {
    VERSION, FACULTIES, LEVELS, INTERVALS, PASS, EXAM_SIZE, CFU,
    ensure, lessonState, finishLesson, isDone, dueLessons, dueCount, minCorrect, reviewLesson, reviewQuestions,
    courseProgress, makeExam, grade, voteLabel, recordExam, examResult, libretto, stats, suggest, dayKey, addDays, rng, shuffle
  };
});
