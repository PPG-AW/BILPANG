/* =====================================================================
   EksponenKu — Generator Latihan Soal Sifat-Sifat Bilangan Berpangkat
   Mobile-first, tanpa dependensi eksternal.
   ===================================================================== */

/* ---------------- Util dasar ---------------- */
const R = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = (arr) => arr[R(0, arr.length - 1)];
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const MN = "\u2212"; // minus tipografi −

/* ---------------- Render matematika (HTML) ---------------- */
function pw(b, e) { return `<span class="pw">${b}<sup>${e}</sup></span>`; }
function frac(a, b) {
  return `<span class="frac"><span class="fn">${a}</span><span class="fd">${b}</span></span>`;
}
function npar(n) { return n < 0 ? `(${MN}${-n})` : `${n}`; } // basis negatif pakai kurung
function sgn(n) { return n < 0 ? `${MN}${-n}` : `${n}`; }

/* ---------------- Parser jawaban numerik ----------------
   Mendukung: 12 | -8 | 0.125 | 3/4 | 2^5 | 2^-3 | (1/2)^2 | 1+2, dst. */
function parseMath(str) {
  if (str == null) return null;
  let s = String(str).toLowerCase().replace(/\s+/g, "")
    .replace(/,/g, ".").replace(/\*\*/g, "^")
    .replace(/×/g, "*").replace(/÷|:/g, "/").replace(/−/g, "-");
  if (!s) return null;
  let i = 0;
  const peek = () => s[i];
  function expr() {
    let v = term(); if (v == null) return null;
    while (peek() === "+" || peek() === "-") {
      const op = s[i++]; const r = term(); if (r == null) return null;
      v = op === "+" ? v + r : v - r;
    }
    return v;
  }
  function term() {
    let v = factor(); if (v == null) return null;
    while (peek() === "*" || peek() === "/") {
      const op = s[i++]; const r = factor(); if (r == null) return null;
      v = op === "*" ? v * r : v / r;
    }
    return v;
  }
  function factor() { // ^ asosiatif kanan
    const b = unary(); if (b == null) return null;
    if (peek() === "^") { i++; const e = factor(); if (e == null) return null; return Math.pow(b, e); }
    return b;
  }
  function unary() {
    if (peek() === "-") { i++; const v = unary(); return v == null ? null : -v; }
    if (peek() === "+") { i++; return unary(); }
    if (peek() === "(") { i++; const v = expr(); if (v == null || peek() !== ")") return null; i++; return v; }
    return number();
  }
  function number() {
    const m = /^\d*\.?\d+/.exec(s.slice(i));
    if (!m) return null;
    i += m[0].length;
    return parseFloat(m[0]);
  }
  const v = expr();
  if (v == null || i !== s.length || !isFinite(v)) return null;
  return v;
}

const normStr = (s) => String(s).toLowerCase().replace(/\s+/g, "")
  .replace(/\*\*/g, "^").replace(/−/g, "-");

/* Cek jawaban: {status: 'ok'|'no'|'invalid'|'empty'} */
function cekJawaban(q, input) {
  if (input == null || !String(input).trim()) return { status: "empty" };
  if (q.expected.type === "num") {
    const v = parseMath(input);
    if (v == null) return { status: "invalid" };
    return { status: Math.abs(v - q.expected.value) < 1e-9 ? "ok" : "no" };
  }
  const all = [q.expected.value].concat(q.expected.alts || []).map(normStr);
  return { status: all.includes(normStr(input)) ? "ok" : "no" };
}

/* ---------------- Pembuat objek soal ---------------- */
function mk(html, expected, hint, steps, ringkas, kunciPlain, kunciHtml) {
  return { html, expected, hint, steps, ringkas, kunciPlain, kunciHtml };
}
/* Hasil akhir bentuk pangkat numerik (bisa negatif/nol) */
function hasilPangkat(a, e) {
  if (e >= 0) {
    const v = Math.pow(a, e);
    return { val: v, plain: String(v), html: `${pw(a, e)} = ${v}` };
  }
  const d = Math.pow(a, -e);
  return { val: 1 / d, plain: `1/${d}`, html: `${pw(a, MN + (-e))} = ${frac(1, pw(a, -e))} = ${frac(1, d)}` };
}

/* =====================================================================
   GENERATOR PER MATERI
   ===================================================================== */

/* 1. PERKALIAN  a^m × a^n = a^(m+n) */
function genPerkalian(level) {
  const v = pick(level === 1 ? ["var", "power", "value"] : ["var", "power", "value"]);
  if (v === "var") {
    const m = R(2, 4 + level), n = R(2, 4 + level), e = m + n;
    return mk(
      `Sederhanakan ${pw("x", m)} × ${pw("x", n)}`,
      { type: "str", value: `x^${e}` },
      "Jawab dalam bentuk pangkat, contoh: x^5",
      [
        `Sifat perkalian: ${pw("a", "m")} × ${pw("a", "n")} = ${pw("a", "m + n")}`,
        `${pw("x", m)} × ${pw("x", n)} = ${pw("x", `${m} + ${n}`)}`,
        `= ${pw("x", e)}`,
      ],
      `${pw("x", m)} × ${pw("x", n)} = …`, `x^${e}`, pw("x", e)
    );
  }
  if (v === "power") {
    const a = pick(level === 1 ? [2, 3] : [2, 3, 4, 5]);
    const m = R(1, 2 + level), n = R(1, 2 + level), e = m + n;
    return mk(
      `Nyatakan ${pw(a, m)} × ${pw(a, n)} sebagai satu bilangan berpangkat`,
      { type: "str", value: `${a}^${e}` },
      "Jawab dalam bentuk pangkat, contoh: 2^7",
      [
        `Basisnya sama (${a}), maka pangkatnya dijumlahkan.`,
        `${pw(a, m)} × ${pw(a, n)} = ${pw(a, `${m} + ${n}`)}`,
        `= ${pw(a, e)}`,
      ],
      `${pw(a, m)} × ${pw(a, n)} = …`, `${a}^${e}`, pw(a, e)
    );
  }
  // nilai numerik kecil
  const a = pick(level === 1 ? [2] : [2, 3]);
  const cap = a === 2 ? 6 : 4;
  let m = R(1, 3), n = R(1, 3);
  if (m + n > cap) { m = R(1, cap - 1); n = cap - m; }
  const e = m + n, val = Math.pow(a, e);
  const h = hasilPangkat(a, e);
  return mk(
    `Tentukan hasil dari ${pw(a, m)} × ${pw(a, n)}`,
    { type: "num", value: val },
    "Tulis angkanya saja, contoh: 32",
    [
      `${pw(a, m)} × ${pw(a, n)} = ${pw(a, `${m} + ${n}`)} = ${pw(a, e)}`,
      `${h.html}`,
    ],
    `${pw(a, m)} × ${pw(a, n)} = …`, h.plain, h.html
  );
}

/* 2. PEMBAGIAN  a^m : a^n = a^(m−n) */
function genPembagian(level) {
  const v = pick(level >= 2 ? ["var", "power", "value", "nol"] : ["var", "power", "value"]);
  if (v === "var") {
    const m = R(4, 5 + 2 * level), n = R(1, m - 1), e = m - n;
    return mk(
      `Sederhanakan ${pw("y", m)} : ${pw("y", n)}`,
      { type: "str", value: `y^${e}` },
      "Jawab dalam bentuk pangkat, contoh: y^4",
      [
        `Sifat pembagian: ${pw("a", "m")} : ${pw("a", "n")} = ${pw("a", `m ${MN} n`)}`,
        `${pw("y", m)} : ${pw("y", n)} = ${pw("y", `${m} ${MN} ${n}`)}`,
        `= ${pw("y", e)}`,
      ],
      `${pw("y", m)} : ${pw("y", n)} = …`, `y^${e}`, pw("y", e)
    );
  }
  if (v === "nol") {
    const a = pick([2, 3, 4, 5]);
    const m = R(2, 5);
    return mk(
      `Tentukan hasil dari ${pw(a, m)} : ${pw(a, m)}`,
      { type: "num", value: 1 },
      "Tulis angkanya saja",
      [
        `${pw(a, m)} : ${pw(a, m)} = ${pw(a, `${m} ${MN} ${m}`)} = ${pw(a, 0)}`,
        `Bilangan apa pun (selain 0) yang dipangkatkan 0 hasilnya 1.`,
        `Jadi hasilnya = 1`,
      ],
      `${pw(a, m)} : ${pw(a, m)} = …`, "1", `${pw(a, 0)} = 1`
    );
  }
  if (v === "power") {
    const a = pick(level === 1 ? [2, 3] : [2, 3, 4, 5]);
    const e = R(1, 4), n = R(1, 3), m = n + e;
    return mk(
      `Nyatakan ${pw(a, m)} : ${pw(a, n)} sebagai satu bilangan berpangkat`,
      { type: "str", value: `${a}^${e}` },
      "Jawab dalam bentuk pangkat, contoh: 3^2",
      [
        `Basisnya sama (${a}), maka pangkatnya dikurangkan.`,
        `${pw(a, m)} : ${pw(a, n)} = ${pw(a, `${m} ${MN} ${n}`)}`,
        `= ${pw(a, e)}`,
      ],
      `${pw(a, m)} : ${pw(a, n)} = …`, `${a}^${e}`, pw(a, e)
    );
  }
  const a = pick(level === 1 ? [2] : [2, 3]);
  const e = R(1, a === 2 ? 4 : 3), n = R(1, 3), m = n + e;
  const h = hasilPangkat(a, e);
  return mk(
    `Tentukan hasil dari ${pw(a, m)} : ${pw(a, n)}`,
    { type: "num", value: h.val },
    "Tulis angkanya saja, contoh: 27",
    [
      `${pw(a, m)} : ${pw(a, n)} = ${pw(a, `${m} ${MN} ${n}`)} = ${pw(a, e)}`,
      `${h.html}`,
    ],
    `${pw(a, m)} : ${pw(a, n)} = …`, h.plain, h.html
  );
}

/* 3. PANGKAT DIPANGKATKAN  (a^m)^n = a^(mn) */
function genDipangkat(level) {
  const v = pick(["var", "power", "value"]);
  if (v === "var") {
    const m = R(2, 3 + level), n = R(2, 3 + level), e = m * n;
    return mk(
      `Sederhanakan (${pw("a", m)})<sup>${n}</sup>`,
      { type: "str", value: `a^${e}` },
      "Jawab dalam bentuk pangkat, contoh: a^6",
      [
        `Sifat: (${pw("x", "m")})<sup>n</sup> = ${pw("x", "m × n")}`,
        `(${pw("a", m)})<sup>${n}</sup> = ${pw("a", `${m} × ${n}`)}`,
        `= ${pw("a", e)}`,
      ],
      `(${pw("a", m)})<sup>${n}</sup> = …`, `a^${e}`, pw("a", e)
    );
  }
  if (v === "power") {
    const a = pick([2, 3, 5, 7]);
    let m = R(2, 3), n = R(2, 3);
    while (m * n > 9) { m = R(2, 3); n = R(2, 3); }
    const e = m * n;
    return mk(
      `Nyatakan (${pw(a, m)})<sup>${n}</sup> sebagai satu bilangan berpangkat`,
      { type: "str", value: `${a}^${e}` },
      "Jawab dalam bentuk pangkat, contoh: 2^6",
      [
        `Pangkatnya dikalikan: ${m} × ${n} = ${e}`,
        `(${pw(a, m)})<sup>${n}</sup> = ${pw(a, `${m} × ${n}`)}`,
        `= ${pw(a, e)}`,
      ],
      `(${pw(a, m)})<sup>${n}</sup> = …`, `${a}^${e}`, pw(a, e)
    );
  }
  const pas = pick([[2, 2, 2], [2, 2, 3], [2, 3, 2], [3, 2, 2], [5, 2, 2], [3, 3, 2], [2, 4, 2], [10, 2, 2]]);
  const [a, m, n] = pas, e = m * n, h = hasilPangkat(a, e);
  return mk(
    `Tentukan nilai dari (${pw(a, m)})<sup>${n}</sup>`,
    { type: "num", value: h.val },
    "Tulis angkanya saja, contoh: 64",
    [
      `(${pw(a, m)})<sup>${n}</sup> = ${pw(a, `${m} × ${n}`)} = ${pw(a, e)}`,
      `${h.html}`,
    ],
    `(${pw(a, m)})<sup>${n}</sup> = …`, h.plain, h.html
  );
}

/* 4. PECAHAN DIPANGKATKAN  (a/b)^n = a^n / b^n */
function genPecahan(level) {
  let a = R(1, 3), b = R(a + 1, a + 2 + level);
  const g = gcd(a, b); a /= g; b /= g;
  const n = R(2, level >= 2 ? 3 : 2);
  const negatif = level >= 2 && Math.random() < 0.35;
  const tanda = negatif ? (n % 2 ? -1 : 1) : 1;
  const an = Math.pow(a, n), bn = Math.pow(b, n);
  const val = tanda * an / bn;
  const basis = negatif ? `(${MN}${frac(a, b)})` : frac(a, b);
  const plain = `${tanda < 0 ? "-" : ""}${an}/${bn}`;
  return mk(
    `Tentukan nilai dari ${basis}<sup>${n}</sup>`,
    { type: "num", value: val },
    "Jawab sebagai pecahan, contoh: 4/9",
    [
      `Pangkatkan pembilang dan penyebut: ${basis}<sup>${n}</sup> = ${frac(pw(sgn(negatif ? -a : a), n), pw(b, n))}`,
      `${pw(negatif ? `(${MN}${a})` : a, n)} = ${sgn(tanda * an)} &nbsp;dan&nbsp; ${pw(b, n)} = ${bn}`,
      `Jadi hasilnya = ${frac(sgn(tanda * an), bn)}`,
    ],
    `${basis}<sup>${n}</sup> = …`, plain, frac(sgn(tanda * an), bn)
  );
}

/* 5. BILANGAN NEGATIF DIPANGKATKAN  (-a)^n */
function genNegatif(level) {
  const a = R(1, 3 + level), n = R(2, 3 + level);
  const val = Math.pow(-a, n);
  const kali = Array.from({ length: n }, () => `(${MN}${a})`).join(" × ");
  return mk(
    `Tentukan nilai dari (${MN}${a})<sup>${n}</sup>`,
    { type: "num", value: val },
    "Tulis bilangan bulatnya, contoh: -8",
    [
      `Pangkat ${n} adalah ${n % 2 === 0 ? "genap" : "ganjil"} → hasil ${n % 2 === 0 ? "positif" : "negatif"}.`,
      `(${MN}${a})<sup>${n}</sup> = ${kali}`,
      `= ${sgn(val)}`,
    ],
    `(${MN}${a})<sup>${n}</sup> = …`, String(val), String(val).replace("-", MN)
  );
}

/* 6. PANGKAT NEGATIF  a^-n = 1/a^n */
function genPangkatNegatif(level) {
  const v = pick(level === 1 ? ["int", "var"] : ["int", "frac", "var"]);
  if (v === "var") {
    const n = R(2, 3 + level);
    return mk(
      `Nyatakan ${pw("x", MN + n)} dengan pangkat positif`,
      { type: "str", value: `1/x^${n}` },
      "Contoh format: 1/x^3",
      [
        `Sifat: ${pw("a", MN + "n")} = ${frac(1, pw("a", "n"))}`,
        `${pw("x", MN + n)} = ${frac(1, pw("x", n))}`,
      ],
      `${pw("x", MN + n)} = …`, `1/x^${n}`, frac(1, pw("x", n))
    );
  }
  if (v === "frac") {
    let a = R(1, 3), b = R(a + 1, a + 3);
    const g = gcd(a, b); a /= g; b /= g;
    const n = R(1, 2);
    const val = Math.pow(b, n) / Math.pow(a, n);
    const bn = Math.pow(b, n), an = Math.pow(a, n);
    return mk(
      `Tentukan nilai dari ${frac(a, b)}<sup>${MN}${n}</sup>`,
      { type: "num", value: val },
      "Jawab sebagai pecahan, contoh: 9/4",
      [
        `Pangkat negatif membalik pecahan: ${frac(a, b)}<sup>${MN}${n}</sup> = ${frac(b, a)}<sup>${n}</sup>`,
        `= ${frac(pw(b, n), pw(a, n))} = ${frac(bn, an)}`,
      ],
      `${frac(a, b)}<sup>${MN}${n}</sup> = …`, `${bn}/${an}`, frac(bn, an)
    );
  }
  const a = pick(level === 1 ? [2, 3] : [2, 3, 4, 5]);
  const n = R(1, level >= 3 ? 3 : 2);
  const h = hasilPangkat(a, -n);
  return mk(
    `Tentukan nilai dari ${pw(a, MN + n)}`,
    { type: "num", value: h.val },
    `Jawab sebagai pecahan, contoh: 1/${Math.pow(a, n)}`,
    [
      `${pw(a, MN + n)} = ${frac(1, pw(a, n))}`,
      `${h.html}`,
    ],
    `${pw(a, MN + n)} = …`, h.plain, h.html
  );
}

/* 7. PANGKAT NOL  a^0 = 1 (a ≠ 0) */
function genPangkatNol(level) {
  const v = pick(level === 1 ? ["single", "kali"] : ["single", "kali", "sum", "kurung"]);
  if (v === "kali") {
    const c = R(2, 9), a = pick([2, 3, 5, 7]);
    return mk(
      `Tentukan nilai dari ${c} × ${pw(a, 0)}`,
      { type: "num", value: c },
      "Tulis angkanya saja",
      [
        `${pw(a, 0)} = 1`,
        `${c} × 1 = ${c}`,
      ],
      `${c} × ${pw(a, 0)} = …`, String(c), `${c} × 1 = ${c}`
    );
  }
  if (v === "sum") {
    const a = pick([2, 3, 5, 7, 11]), b = pick([2, 3, 4, 5, 6]);
    return mk(
      `Tentukan nilai dari ${pw(a, 0)} + ${pw(b, 0)}`,
      { type: "num", value: 2 },
      "Tulis angkanya saja",
      [`${pw(a, 0)} = 1 &nbsp;dan&nbsp; ${pw(b, 0)} = 1`, `1 + 1 = 2`],
      `${pw(a, 0)} + ${pw(b, 0)} = …`, "2", "1 + 1 = 2"
    );
  }
  if (v === "kurung") {
    const p = R(5, 12); let q = R(1, 9); if (q === p) q = q + 1;
    const d = p - q;
    return mk(
      `Tentukan nilai dari (${p} ${MN} ${q})<sup>0</sup>`,
      { type: "num", value: 1 },
      "Tulis angkanya saja",
      [
        `Hitung dalam kurung dulu: ${p} ${MN} ${q} = ${sgn(d)}`,
        `${npar(d)}<sup>0</sup> = 1, karena ${sgn(d)} ≠ 0`,
      ],
      `(${p} ${MN} ${q})<sup>0</sup> = …`, "1", "1"
    );
  }
  const basis = pick([R(2, 99).toString(), `(${MN}${R(2, 20)})`, frac(R(1, 5), R(6, 9))]);
  return mk(
    `Tentukan nilai dari ${basis}<sup>0</sup>`,
    { type: "num", value: 1 },
    "Tulis angkanya saja",
    [`Setiap bilangan tidak nol yang dipangkatkan 0 hasilnya 1.`, `${basis}<sup>0</sup> = 1`],
    `${basis}<sup>0</sup> = …`, "1", "1"
  );
}

/* 8. PANGKAT PECAHAN  a^(m/n) = ⁿ√(a^m) */
function genPangkatPecahan(level) {
  const n = pick(level === 1 ? [2, 3] : [2, 3, 4, 5]);
  const rMax = n === 2 ? (level >= 2 ? 7 : 5) : n === 3 ? 4 : 3;
  const r = R(2, rMax);
  const base = Math.pow(r, n);
  let m = R(1, level === 1 ? 2 : 3);
  while (Math.pow(r, m) > 343) m--;
  if (m < 1) m = 1;
  const negatif = level >= 3 && Math.random() < 0.35;
  const ans = Math.pow(r, m);
  const expId = `${m}/${n}`;
  const expHtml = frac(m, n);
  const expNeg = MN + " " + frac(m, n);
  const expShown = negatif ? expNeg : expHtml;
  const steps = [
    `Ubah basis menjadi bentuk pangkat: ${base} = ${pw(r, n)}`,
    `${pw(base, expShown)} = ${pw(`(${pw(r, n)})`, expShown)} = ${pw(r, `${n} × ${expId}`)}${negatif ? "" : ` = ${pw(r, m)}`}`,
  ];
  if (negatif) {
    steps.push(`= ${pw(r, MN + m)} = ${frac(1, pw(r, m))} = ${frac(1, ans)}`);
    return mk(
      `Tentukan nilai dari ${pw(base, expNeg)}`,
      { type: "num", value: 1 / ans },
      "Jawab sebagai pecahan, contoh: 1/4",
      steps,
      `${pw(base, expNeg)} = …`, `1/${ans}`, frac(1, ans)
    );
  }
  steps.push(`= ${ans}`);
  return mk(
    `Tentukan nilai dari ${pw(base, expHtml)}`,
    { type: "num", value: ans },
    "Tulis bilangan bulatnya, contoh: 4",
    steps,
    `${pw(base, expHtml)} = …`, String(ans), String(ans)
  );
}

/* 9. CAMPURAN */
function genCampuran(level) {
  const a = pick(level === 1 ? [2, 3] : [2, 3, 5]);
  const eCap = a === 5 ? 3 : 4;
  const T = pick(level === 1 ? ["t1", "t3"] : ["t1", "t2", "t3", "t4"]);

  if (T === "t1") {
    const m = R(2, 4), n = R(1, 3);
    const k = level >= 2 && Math.random() < 0.4 ? R(m + n, m + n + 2) : R(1, m + n - 1);
    const e = m + n - k;
    const h = hasilPangkat(a, e);
    return mk(
      `Sederhanakan dan tentukan nilai ${pw(a, m)} × ${pw(a, n)} : ${pw(a, k)}`,
      { type: "num", value: h.val },
      e < 0 ? "Jawab bisa berupa pecahan, contoh: 1/8" : "Tulis angkanya saja",
      [
        `Gabungkan pangkat: ${m} + ${n} ${MN} ${k} = ${sgn(e)}`,
        `${pw(a, m)} × ${pw(a, n)} : ${pw(a, k)} = ${pw(a, `${m} + ${n} ${MN} ${k}`)} = ${pw(a, sgn(e))}`,
        `${h.html}`,
      ],
      `${pw(a, m)} × ${pw(a, n)} : ${pw(a, k)} = …`, h.plain, h.html
    );
  }
  if (T === "t2") {
    const mnPas = pick([[2, 2], [2, 3], [3, 2]]);
    const [m, n] = mnPas, mn = m * n;
    const e = Math.min(R(0, eCap), mn - 1);
    const p = mn - e;
    const h = hasilPangkat(a, e);
    return mk(
      `Tentukan nilai (${pw(a, m)})<sup>${n}</sup> : ${pw(a, p)}`,
      { type: "num", value: h.val },
      "Tulis angkanya saja",
      [
        `(${pw(a, m)})<sup>${n}</sup> = ${pw(a, mn)}`,
        `${pw(a, mn)} : ${pw(a, p)} = ${pw(a, `${mn} ${MN} ${p}`)} = ${pw(a, sgn(e))}`,
        `${h.html}`,
      ],
      `(${pw(a, m)})<sup>${n}</sup> : ${pw(a, p)} = …`, h.plain, h.html
    );
  }
  if (T === "t3") {
    const m = R(1, 4), n = R(1, 3), e = m - n;
    const h = hasilPangkat(a, e);
    return mk(
      `Tentukan nilai ${pw(a, m)} × ${pw(a, MN + n)}`,
      { type: "num", value: h.val },
      e < 0 ? "Jawab bisa berupa pecahan, contoh: 1/9" : "Tulis angkanya saja",
      [
        `Gabungkan pangkat: ${m} + (${MN}${n}) = ${sgn(e)}`,
        `${pw(a, m)} × ${pw(a, MN + n)} = ${pw(a, sgn(e))}`,
        `${h.html}`,
      ],
      `${pw(a, m)} × ${pw(a, MN + n)} = …`, h.plain, h.html
    );
  }
  // t4
  let d = R(1, level >= 3 ? 2 : 1);
  if (level >= 3 && Math.random() < 0.3) d = -d;
  const p = d === 2 ? 2 : R(2, Math.min(3, Math.max(2, Math.floor(eCap / Math.abs(d)))));
  const n2 = R(1, 3), m2 = n2 + d;
  const e = d * p;
  const h = hasilPangkat(a, e);
  return mk(
    `Tentukan nilai (${pw(a, m2)} : ${pw(a, n2)})<sup>${p}</sup>`,
    { type: "num", value: h.val },
    e < 0 ? "Jawab bisa berupa pecahan" : "Tulis angkanya saja",
    [
      `Dalam kurung: ${pw(a, m2)} : ${pw(a, n2)} = ${pw(a, sgn(d))}`,
      `(${pw(a, sgn(d))})<sup>${p}</sup> = ${pw(a, `${sgn(d)} × ${p}`)} = ${pw(a, sgn(e))}`,
      `${h.html}`,
    ],
    `(${pw(a, m2)} : ${pw(a, n2)})<sup>${p}</sup> = …`, h.plain, h.html
  );
}

/* =====================================================================
   DAFTAR MATERI + RUMUS + CONTOH SOAL (berpembahasan)
   ===================================================================== */
const TOPICS = {
  perkalian: {
    label: "Perkalian Berpangkat",
    icon: "✖️", color: "#6366f1",
    desc: "aᵐ × aⁿ = aᵐ⁺ⁿ",
    rumus: `Jika basis sama, pangkat <b>dijumlahkan</b>:<br>${pw("a", "m")} × ${pw("a", "n")} = ${pw("a", "m + n")}`,
    gen: genPerkalian,
    contoh: [
      {
        soal: `${pw(2, 3)} × ${pw(2, 2)}`,
        langkah: [
          `Basisnya sama, yaitu 2 → jumlahkan pangkatnya.`,
          `${pw(2, 3)} × ${pw(2, 2)} = ${pw(2, `3 + 2`)} = ${pw(2, 5)}`,
          `${pw(2, 5)} = 2 × 2 × 2 × 2 × 2 = 32`,
        ],
        jawaban: "32",
      },
      {
        soal: `${pw("x", 4)} × ${pw("x", 6)}`,
        langkah: [
          `Basisnya sama, yaitu x → jumlahkan pangkatnya.`,
          `${pw("x", 4)} × ${pw("x", 6)} = ${pw("x", `4 + 6`)}`,
        ],
        jawaban: pw("x", 10),
      },
    ],
  },
  pembagian: {
    label: "Pembagian Berpangkat",
    icon: "➗", color: "#0ea5e9",
    desc: "aᵐ : aⁿ = aᵐ⁻ⁿ",
    rumus: `Jika basis sama, pangkat <b>dikurangkan</b>:<br>${pw("a", "m")} : ${pw("a", "n")} = ${pw("a", `m ${MN} n`)}, &nbsp;a ≠ 0`,
    gen: genPembagian,
    contoh: [
      {
        soal: `${pw(3, 5)} : ${pw(3, 2)}`,
        langkah: [
          `Basisnya sama, yaitu 3 → kurangkan pangkatnya.`,
          `${pw(3, 5)} : ${pw(3, 2)} = ${pw(3, `5 ${MN} 2`)} = ${pw(3, 3)}`,
          `${pw(3, 3)} = 3 × 3 × 3 = 27`,
        ],
        jawaban: "27",
      },
      {
        soal: `${pw("y", 8)} : ${pw("y", 8)}`,
        langkah: [
          `Kurangkan pangkatnya: ${pw("y", 8)} : ${pw("y", 8)} = ${pw("y", `8 ${MN} 8`)} = ${pw("y", 0)}`,
          `Ingat: bilangan tidak nol dipangkatkan 0 hasilnya 1.`,
        ],
        jawaban: "1",
      },
    ],
  },
  dipangkat: {
    label: "Pangkat Dipangkatkan",
    icon: "🪜", color: "#f59e0b",
    desc: "(aᵐ)ⁿ = aᵐˣⁿ",
    rumus: `Bilangan berpangkat dipangkatkan lagi, pangkatnya <b>dikalikan</b>:<br>(${pw("a", "m")})<sup>n</sup> = ${pw("a", "m × n")}`,
    gen: genDipangkat,
    contoh: [
      {
        soal: `(${pw(2, 2)})<sup>3</sup>`,
        langkah: [
          `Kalikan pangkatnya: 2 × 3 = 6.`,
          `(${pw(2, 2)})<sup>3</sup> = ${pw(2, 6)}`,
          `${pw(2, 6)} = 64`,
        ],
        jawaban: "64",
      },
      {
        soal: `(${pw("x", 3)})<sup>5</sup>`,
        langkah: [`Kalikan pangkatnya: 3 × 5 = 15.`, `(${pw("x", 3)})<sup>5</sup> = ${pw("x", 15)}`],
        jawaban: pw("x", 15),
      },
    ],
  },
  pecahan: {
    label: "Pecahan Dipangkatkan",
    icon: "🍕", color: "#ef4444",
    desc: "(a/b)ⁿ = aⁿ/bⁿ",
    rumus: `Pecahan dipangkatkan = pembilang & penyebut masing-masing dipangkatkan:<br>${frac("a", "b")}<sup>n</sup> = ${frac(pw("a", "n"), pw("b", "n"))}`,
    gen: genPecahan,
    contoh: [
      {
        soal: `${frac(2, 3)}<sup>2</sup>`,
        langkah: [
          `Pangkatkan atas dan bawah: ${frac(pw(2, 2), pw(3, 2))}`,
          `${pw(2, 2)} = 4 &nbsp;dan&nbsp; ${pw(3, 2)} = 9`,
        ],
        jawaban: frac(4, 9),
      },
      {
        soal: `(${MN}${frac(1, 2)})<sup>3</sup>`,
        langkah: [
          `Pangkat 3 (ganjil) → hasil negatif.`,
          `= ${MN}${frac(pw(1, 3), pw(2, 3))} = ${MN}${frac(1, 8)}`,
        ],
        jawaban: frac(MN + "1", 8),
      },
    ],
  },
  negatif: {
    label: "Negatif Dipangkatkan",
    icon: "➖", color: "#8b5cf6",
    desc: "(−a)ⁿ → ± tergantung n",
    rumus: `(${MN}a)<sup>n</sup> = aⁿ jika n <b>genap</b><br>(${MN}a)<sup>n</sup> = ${MN}aⁿ jika n <b>ganjil</b>`,
    gen: genNegatif,
    contoh: [
      {
        soal: `(${MN}3)<sup>2</sup>`,
        langkah: [`Pangkat genap → hasil positif.`, `(${MN}3) × (${MN}3) = 9`],
        jawaban: "9",
      },
      {
        soal: `(${MN}2)<sup>5</sup>`,
        langkah: [`Pangkat ganjil → hasil negatif.`, `2⁵ = 32, maka (${MN}2)<sup>5</sup> = ${MN}32`],
        jawaban: MN + "32",
      },
    ],
  },
  pangkatNegatif: {
    label: "Pangkat Negatif",
    icon: "🔄", color: "#10b981",
    desc: "a⁻ⁿ = 1/aⁿ",
    rumus: `Pangkat negatif menjadi pecahan:<br>${pw("a", Mn1())} = ${frac(1, pw("a", "n"))}, &nbsp;a ≠ 0`,
    gen: genPangkatNegatif,
    contoh: [
      {
        soal: `${pw(2, MN + "3")}`,
        langkah: [
          `${pw(2, MN + "3")} = ${frac(1, pw(2, 3))}`,
          `${pw(2, 3)} = 8`,
        ],
        jawaban: frac(1, 8) + " (atau 0,125)",
      },
      {
        soal: `${frac(3, 4)}<sup>${MN}2</sup>`,
        langkah: [
          `Balik pecahannya: ${frac(3, 4)}<sup>${MN}2</sup> = ${frac(4, 3)}<sup>2</sup>`,
          `= ${frac(pw(4, 2), pw(3, 2))} = ${frac(16, 9)}`,
        ],
        jawaban: frac(16, 9),
      },
    ],
  },
  pangkatNol: {
    label: "Pangkat Nol",
    icon: "0️⃣", color: "#14b8a6",
    desc: "a⁰ = 1 (a ≠ 0)",
    rumus: `Setiap bilangan tidak nol yang dipangkatkan 0 hasilnya <b>selalu 1</b>:<br>a<sup>0</sup> = 1, &nbsp;a ≠ 0`,
    gen: genPangkatNol,
    contoh: [
      {
        soal: `(${MN}9)<sup>0</sup>`,
        langkah: [`Basisnya ${MN}9 ≠ 0, maka hasilnya 1.`],
        jawaban: "1",
      },
      {
        soal: `${pw(2, 0)} × ${pw(3, 2)}`,
        langkah: [`${pw(2, 0)} = 1`, `1 × ${pw(3, 2)} = 1 × 9 = 9`],
        jawaban: "9",
      },
    ],
  },
  pangkatPecahan: {
    label: "Pangkat Pecahan",
    icon: "🌗", color: "#f97316",
    desc: "a^(m/n) = ⁿ√aᵐ",
    rumus: `Pangkat pecahan adalah bentuk akar:<br>${pw("a", frac("m", "n"))} = <b>ⁿ√</b>(aᵐ)`,
    gen: genPangkatPecahan,
    contoh: [
      {
        soal: `${pw(8, frac(2, 3))}`,
        langkah: [
          `Ubah 8 menjadi bentuk pangkat: 8 = ${pw(2, 3)}`,
          `${pw(8, frac(2, 3))} = ${pw(`(${pw(2, 3)})`, frac(2, 3))} = ${pw(2, `3 × ${frac(2, 3)}`)} = ${pw(2, 2)}`,
          `= 4`,
        ],
        jawaban: "4",
      },
      {
        soal: `${pw(16, frac(3, 4))}`,
        langkah: [
          `16 = ${pw(2, 4)}`,
          `${pw(16, frac(3, 4))} = ${pw(`(${pw(2, 4)})`, frac(3, 4))} = ${pw(2, 3)} = 8`,
        ],
        jawaban: "8",
      },
    ],
  },
  campuran: {
    label: "Campuran",
    icon: "🎲", color: "#ec4899",
    desc: "Gabungan semua sifat",
    rumus: `Soal campuran menggabungkan beberapa sifat sekaligus.<br>Kerjakan berurutan: kurung → pangkat → kali/bagi.`,
    gen: genCampuran,
    contoh: [
      {
        soal: `${pw(2, 3)} × ${pw(2, 2)} : ${pw(2, 4)}`,
        langkah: [
          `Gabungkan pangkat: 3 + 2 ${MN} 4 = 1`,
          `${pw(2, 3)} × ${pw(2, 2)} : ${pw(2, 4)} = ${pw(2, 1)} = 2`,
        ],
        jawaban: "2",
      },
      {
        soal: `(${pw(3, 2)} × ${pw(3, MN + "1")})<sup>2</sup>`,
        langkah: [
          `Dalam kurung: ${pw(3, 2)} × ${pw(3, MN + "1")} = ${pw(3, `2 + (${MN}1)`)} = ${pw(3, 1)}`,
          `(${pw(3, 1)})<sup>2</sup> = ${pw(3, 2)} = 9`,
        ],
        jawaban: "9",
      },
    ],
  },
};
function Mn1() { return MN + "n"; }

const TOPIC_KEYS = Object.keys(TOPICS);
function genSoal(key, level) { return TOPICS[key].gen(level); }

const LEVELS = ["Mudah", "Sedang", "Sulit"];

/* =====================================================================
   EKSPOR untuk pengujian (Node) — bagian UI dibungkus penjaga browser
   ===================================================================== */
if (typeof module !== "undefined" && module.exports) {
  module.exports = { TOPICS, TOPIC_KEYS, LEVELS, genSoal, cekJawaban, parseMath, hasilPangkat };
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  /* =================== PENYIMPANAN LOKAL =================== */
  const store = {
    get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} },
  };

  /* =================== STATE =================== */
  const S = {
    tab: "beranda",
    topic: null, level: 1, count: 10,
    quiz: null, // {key, level, qs, idx, results, start, timerId, answered}
    contohKey: "perkalian",
  };
  const nama = () => store.get("ev_nama", "");
  const kelas = () => store.get("ev_kelas", "");
  const urlApps = () => store.get("ev_url", "");
  const riwayat = () => store.get("ev_riwayat", []);

  /* =================== UTIL UI =================== */
  const $ = (sel) => document.querySelector(sel);
  const view = () => $("#view");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove("show"), 2400);
  }
  const fmtTanggal = (iso) => {
    try {
      return new Date(iso).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    } catch (e) { return iso; }
  };
  const getJam = () => {
    const h = new Date().getHours();
    return h < 11 ? "pagi" : h < 15 ? "siang" : h < 19 ? "sore" : "malam";
  };
  function vibrate(p) { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} }

  /* =================== ROUTER =================== */
  function go(tab) {
    stopTimer();
    S.tab = tab;
    document.querySelectorAll("#bottomnav button").forEach((b) =>
      b.classList.toggle("act", b.dataset.tab === tab));
    render();
  }
  function render() {
    closeSheet();
    if (S.tab === "beranda") return renderHome();
    if (S.tab === "contoh") return renderContoh();
    if (S.tab === "riwayat") return renderRiwayat();
    if (S.tab === "pengaturan") return renderPengaturan();
  }

  /* =================== BERANDA =================== */
  function renderHome() {
    const rw = riwayat();
    const avg = rw.length ? Math.round(rw.reduce((s, x) => s + x.skor, 0) / rw.length) : 0;
    view().innerHTML = `
      <section class="hero">
        <div class="hero-in">
          <p class="hi">Selamat ${getJam()}, ${esc(nama() || "Sobat Eksponen")} 👋</p>
          <h1>Yuk latihan <span>sifat bilangan berpangkat!</span></h1>
          <p class="sub">Pilih materi di bawah, kerjakan soalnya, dan nilaimu tercatat otomatis.</p>
          <div class="chips">
            <span class="chip soft">🏁 ${rw.length} latihan selesai</span>
            <span class="chip soft">⭐ Rata-rata ${avg}</span>
          </div>
        </div>
      </section>
      <h2 class="sect">Pilih Materi Latihan</h2>
      <div class="grid">
        ${TOPIC_KEYS.map((k) => {
          const t = TOPICS[k];
          return `<button class="tcard" data-act="topik" data-k="${k}">
            <span class="tico" style="background:${t.color}1a;color:${t.color}">${t.icon}</span>
            <span class="tlabel">${t.label}</span>
            <span class="tdesc">${t.desc}</span>
          </button>`;
        }).join("")}
      </div>
      <div class="tip">💡 Tips: baca dulu <b>Contoh Soal</b> di tab 📖 supaya makin paham sebelum latihan.</div>`;
  }

  /* =================== SHEET: SETUP LATIHAN =================== */
  function openSheet(html) {
    $("#sheetBody").innerHTML = html;
    $("#scrim").classList.add("open");
  }
  function closeSheet() { $("#scrim").classList.remove("open"); }

  function openTopic(k) {
    const t = TOPICS[k];
    S.topic = k; S.level = 1; S.count = 10;
    openSheet(`
      <div class="sheet-head">
        <span class="tico lg" style="background:${t.color}1a;color:${t.color}">${t.icon}</span>
        <div>
          <h3>${t.label}</h3>
          <p class="muted">Atur dulu latihanmu</p>
        </div>
      </div>
      <div class="rumus">${t.rumus}</div>
      <p class="lbl">Tingkat kesulitan</p>
      <div class="seg" id="segLevel">
        ${LEVELS.map((l, i) => `<button data-act="level" data-v="${i + 1}" class="${i === 0 ? "on" : ""}">${l}</button>`).join("")}
      </div>
      <p class="lbl">Jumlah soal</p>
      <div class="chiprow" id="rowCount">
        ${[5, 10, 15].map((c) => `<button class="chip pick ${c === 10 ? "on" : ""}" data-act="jumlah" data-v="${c}">${c} soal</button>`).join("")}
      </div>
      <button class="btn pri block" data-act="mulai">🚀 Mulai Latihan</button>`);
  }

  /* =================== KUIS =================== */
  function startQuiz() {
    const qs = [];
    let guard = 0;
    while (qs.length < S.count && guard++ < S.count * 30) {
      const q = genSoal(S.topic, S.level);
      // hindari duplikasi persis dalam satu sesi
      if (!qs.some((x) => x.kunciPlain === q.kunciPlain && x.ringkas === q.ringkas)) qs.push(q);
    }
    while (qs.length < S.count) qs.push(genSoal(S.topic, S.level));
    S.quiz = {
      key: S.topic, level: S.level, qs, idx: 0,
      results: [], answered: false, start: Date.now(), timerId: null,
    };
    document.body.classList.add("quizmode");
    closeSheet();
    renderSoal();
    startTimer();
  }
  function stopTimer() {
    if (S.quiz && S.quiz.timerId) { clearInterval(S.quiz.timerId); S.quiz.timerId = null; }
  }
  function startTimer() {
    stopTimer();
    S.quiz.timerId = setInterval(() => {
      const el = $("#timer");
      if (el) el.textContent = "⏱ " + Math.floor((Date.now() - S.quiz.start) / 1000) + " dtk";
    }, 1000);
  }
  function renderSoal() {
    const qz = S.quiz, t = TOPICS[qz.key], q = qz.qs[qz.idx];
    qz.answered = false;
    const pct = Math.round((qz.idx / qz.qs.length) * 100);
    view().innerHTML = `
      <div class="qtop">
        <button class="icobtn" data-act="keluar">✕</button>
        <div class="qmeta">
          <b>${t.icon} ${t.label}</b>
          <span class="muted">${LEVELS[qz.level - 1]} · Soal ${qz.idx + 1}/${qz.qs.length}</span>
        </div>
        <span id="timer" class="chip">⏱ 0 dtk</span>
      </div>
      <div class="pbar"><div class="pfill" style="width:${pct}%"></div></div>
      <div class="qcard">
        <div class="qtext">${q.html}</div>
        <div class="hint">📝 ${q.hint}</div>
        <input id="answer" class="ainput" type="text" inputmode="text" autocomplete="off"
               autocapitalize="none" spellcheck="false" placeholder="Tulis jawabanmu…" />
        <div class="keyrow">
          ${["x", "^", "/", MN, "(", ")", "-"].map((c) => `<button class="kchip" data-act="sisip" data-c="${esc(c)}">${c}</button>`).join("")}
          <button class="kchip del" data-act="hapus">⌫</button>
        </div>
        <button class="btn pri block" id="btnCek" data-act="periksa">Periksa Jawaban</button>
        <div id="fb"></div>
      </div>`;
    const inp = $("#answer");
    inp.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); App.act.periksa(); }
    });
    setTimeout(() => inp.focus({ preventScroll: true }), 250);
  }
  function feedback(q, ok) {
    const fb = $("#fb");
    fb.innerHTML = `
      <div class="fb ${ok ? "ok" : "no"}">
        <div class="fb-head">${ok ? "✅ Benar! Hebat 🎉" : "❌ Belum tepat"}</div>
        ${ok ? "" : `<div class="fb-key">Kunci: <b>${q.kunciHtml}</b></div>`}
        <details class="steps" ${ok ? "" : "open"}>
          <summary>Lihat pembahasan</summary>
          <ol>${q.steps.map((s) => `<li>${s}</li>`).join("")}</ol>
        </details>
        <button class="btn ${ok ? "ok" : "pri"} block" data-act="lanjut">
          ${S.quiz.idx + 1 === S.quiz.qs.length ? "Lihat Hasil 🏁" : "Soal Berikutnya ➜"}
        </button>
      </div>`;
    fb.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  function periksa() {
    const qz = S.quiz; if (!qz || qz.answered) return;
    const q = qz.qs[qz.idx];
    const inp = $("#answer");
    const hasil = cekJawaban(q, inp.value);
    if (hasil.status === "empty") { toast("Tulis jawabanmu dulu ya ✍️"); inp.classList.add("shake"); setTimeout(() => inp.classList.remove("shake"), 400); return; }
    if (hasil.status === "invalid") { toast("Format tidak dikenali. Contoh: 32, 3/4, 2^5"); inp.classList.add("shake"); setTimeout(() => inp.classList.remove("shake"), 400); return; }
    qz.answered = true;
    const ok = hasil.status === "ok";
    qz.results.push({ benar: ok, jawaban: inp.value, kunci: q.kunciPlain, ringkas: q.ringkas, steps: q.steps, kunciHtml: q.kunciHtml });
    inp.disabled = true;
    $("#btnCek").style.display = "none";
    vibrate(ok ? 25 : [70, 40, 70]);
    feedback(q, ok);
  }
  function lanjut() {
    const qz = S.quiz;
    if (qz.idx + 1 < qz.qs.length) { qz.idx++; renderSoal(); }
    else { selesai(); }
  }
  function selesai() {
    stopTimer();
    const qz = S.quiz;
    const durasi = Math.floor((Date.now() - qz.start) / 1000);
    const benar = qz.results.filter((r) => r.benar).length;
    const total = qz.qs.length;
    const skor = Math.round((benar / total) * 100);
    const attempt = {
      id: "a" + Date.now(), waktu: new Date().toISOString(),
      topik: TOPICS[qz.key].label, level: LEVELS[qz.level - 1],
      benar, total, skor, durasi, terkirim: false,
    };
    const rw = riwayat(); rw.unshift(attempt); store.set("ev_riwayat", rw.slice(0, 60));
    const pesan = skor >= 90 ? "Luar biasa! 🏆" : skor >= 75 ? "Hebat! 🎉" : skor >= 60 ? "Bagus, terus berlatih 💪" : "Jangan menyerah, coba lagi! 🔥";
    const C = 2 * Math.PI * 54;
    view().innerHTML = `
      <div class="rcard">
        <h2>Hasil Latihan 🎯</h2>
        <p class="muted">${TOPICS[qz.key].icon} ${TOPICS[qz.key].label} · ${LEVELS[qz.level - 1]}</p>
        <div class="ring">
          <svg viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" class="rbg"/>
            <circle cx="60" cy="60" r="54" class="rfg" style="stroke-dasharray:${(skor / 100) * C} ${C}"/>
          </svg>
          <div class="rval"><b>${skor}</b><span>skor</span></div>
        </div>
        <div class="stats">
          <div><b>${benar}</b><span>Benar</span></div>
          <div><b>${total - benar}</b><span>Salah</span></div>
          <div><b>${durasi}s</b><span>Waktu</span></div>
        </div>
        <p class="pesan">${pesan}</p>
        <div id="kirimStat" class="kirim muted">⏳ Mengirim nilai ke Google Sheets…</div>
        <div class="row2">
          <button class="btn ghost" data-act="ulangi">🔁 Ulangi</button>
          <button class="btn pri" data-act="keBeranda">🏠 Beranda</button>
        </div>
      </div>
      <h3 class="sect">Ulasan Soal</h3>
      ${qz.results.map((r, i) => `
        <details class="rev ${r.benar ? "ok" : "no"}">
          <summary>
            <span class="rno">${i + 1}</span>
            <span class="rq">${r.ringkas}</span>
            <span class="rmark">${r.benar ? "✓" : "✗"}</span>
          </summary>
          <div class="rbody">
            <p>Jawabanmu: <b>${esc(r.jawaban)}</b> ${r.benar ? "" : `· Kunci: <b>${r.kunciHtml}</b>`}</p>
            <ol>${r.steps.map((s) => `<li>${s}</li>`).join("")}</ol>
          </div>
        </details>`).join("")}
      <div style="height:24px"></div>`;
    // kirim otomatis
    cobaKirim(attempt, (ok2, alasan) => {
      const el = $("#kirimStat");
      if (!el) return;
      if (!urlApps()) { el.innerHTML = `⚠️ URL Apps Script belum diatur. Atur di tab ⚙️ Pengaturan, lalu kirim dari Riwayat.`; return; }
      if (ok2) { el.innerHTML = `✅ Nilai terkirim ke Google Sheets guru.`; attempt.terkirim = true; }
      else { el.innerHTML = `⚠️ Gagal mengirim (periksa internet). Nilai tersimpan di Riwayat.`; }
    });
    document.body.classList.remove("quizmode");
  }

  /* =================== KIRIM KE GOOGLE SHEETS =================== */
  function cobaKirim(a, cb) {
    const url = urlApps();
    if (!url) { cb && cb(false, "no-url"); return; }
    const body = new URLSearchParams({
      nama: nama(), kelas: kelas(), topik: a.topik, level: a.level,
      benar: a.benar, total: a.total, skor: a.skor, durasi: a.durasi,
      waktu: a.waktu, detail: `${a.benar} benar dari ${a.total} soal`, perangkat: "web-mobile",
    });
    fetch(url, { method: "POST", mode: "no-cors", body })
      .then(() => { tandaiTerkirim(a.id); cb && cb(true); })
      .catch(() => cb && cb(false));
  }
  function tandaiTerkirim(id) {
    const rw = riwayat();
    const it = rw.find((x) => x.id === id);
    if (it) { it.terkirim = true; store.set("ev_riwayat", rw); }
  }

  /* =================== CONTOH SOAL =================== */
  function renderContoh() {
    const t = TOPICS[S.contohKey];
    view().innerHTML = `
      <h2 class="sect">📖 Contoh Soal & Pembahasan</h2>
      <div class="scroller">
        ${TOPIC_KEYS.map((k) => `<button class="chip pick tpc ${k === S.contohKey ? "on" : ""}" data-act="pilihContoh" data-k="${k}">${TOPICS[k].icon} ${TOPICS[k].label}</button>`).join("")}
      </div>
      <div class="rumus big">${t.rumus}</div>
      ${t.contoh.map((c, i) => `
        <div class="ccard">
          <div class="cno">Contoh ${i + 1}</div>
          <div class="csoal">${c.soal} = ?</div>
          <details class="steps">
            <summary>Lihat pembahasan langkah demi langkah</summary>
            <ol>${c.langkah.map((l) => `<li>${l}</li>`).join("")}</ol>
            <div class="cjawab">Jawaban: <b>${c.jawaban}</b></div>
          </details>
        </div>`).join("")}
      <button class="btn pri block" data-act="latihanTopik" data-k="${S.contohKey}">✍️ Latihan materi ini sekarang</button>`;
  }

  /* =================== RIWAYAT =================== */
  function renderRiwayat() {
    const rw = riwayat();
    if (!rw.length) {
      view().innerHTML = `
        <h2 class="sect">🕘 Riwayat Latihan</h2>
        <div class="empty">
          <div class="eico">📭</div>
          <p><b>Belum ada riwayat.</b></p>
          <p class="muted">Selesaikan latihan pertamamu, hasilnya akan muncul di sini.</p>
          <button class="btn pri" data-act="keBeranda2">Mulai Latihan</button>
        </div>`;
      return;
    }
    view().innerHTML = `
      <h2 class="sect">🕘 Riwayat Latihan</h2>
      ${rw.map((a) => `
        <div class="hcard">
          <div class="hleft">
            <b>${a.topik}</b>
            <span class="muted">${a.level} · ${a.benar}/${a.total} benar · ${a.durasi}s</span>
            <span class="muted small">${fmtTanggal(a.waktu)}</span>
          </div>
          <div class="hright">
            <span class="badge ${a.skor >= 75 ? "g" : a.skor >= 50 ? "y" : "r"}">${a.skor}</span>
            ${a.terkirim
              ? `<span class="sent">✓ Terkirim</span>`
              : `<button class="mini" data-act="kirimUlang" data-id="${a.id}">Kirim ➜</button>`}
          </div>
        </div>`).join("")}
      <div style="height:16px"></div>`;
  }

  /* =================== PENGATURAN =================== */
  function renderPengaturan() {
    view().innerHTML = `
      <h2 class="sect">⚙️ Pengaturan</h2>
      <div class="card">
        <p class="lbl">Nama lengkap</p>
        <input id="inNama" class="ainput sm" value="${esc(nama())}" placeholder="Nama kamu" />
        <p class="lbl">Kelas <span class="muted">(opsional)</span></p>
        <input id="inKelas" class="ainput sm" value="${esc(kelas())}" placeholder="Misal: IX-A" />
      </div>
      <div class="card">
        <p class="lbl">🔗 URL Google Apps Script <span class="muted">(dari guru)</span></p>
        <input id="inUrl" class="ainput sm mono" value="${esc(urlApps())}" placeholder="https://script.google.com/macros/s/…/exec" />
        <div class="row2 mt">
          <button class="btn ghost sm" data-act="tes">Tes Koneksi</button>
          <button class="btn pri sm" data-act="simpan">💾 Simpan</button>
        </div>
        ${urlApps() ? `<p class="muted small mt">Status: <b style="color:#16a34a">terhubung</b> — nilai akan dikirim otomatis.</p>` : ""}
        <details class="steps mt">
          <summary>📋 Cara mendapatkan URL (untuk guru)</summary>
          <ol class="small">
            <li>Buka <b>Google Sheets</b> → buat spreadsheet baru, misal <i>"Rekap Nilai Eksponen"</i>.</li>
            <li>Klik <b>Extensions → Apps Script</b>.</li>
            <li>Hapus kode lama, lalu tempel kode dari file <b>Code.gs</b> yang diberikan.</li>
            <li>Klik <b>Deploy → New deployment → Web app</b>.</li>
            <li>Isi: <i>Execute as</i> = <b>Me</b>, <i>Who has access</i> = <b>Anyone</b>.</li>
            <li>Klik <b>Deploy</b>, salin <b>Web App URL</b>, lalu tempel di kolom di atas.</li>
          </ol>
        </details>
      </div>
      <div class="card">
        <p class="lbl">Data</p>
        <button class="btn danger block" data-act="hapusRiwayat">🗑 Hapus riwayat di perangkat ini</button>
      </div>
      <p class="foot">EksponenKu v1.0 · Belajar pangkat jadi mudah ✨</p>`;
  }

  /* =================== AKSI (delegasi klik) =================== */
  const App = {
    act: {
      topik: (d) => openTopic(d.k),
      level: (d, el) => { S.level = +d.v; el.parentElement.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b === el)); },
      jumlah: (d, el) => { S.count = +d.v; el.parentElement.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b === el)); },
      mulai: () => startQuiz(),
      keluar: () => {
        if (confirm("Keluar dari latihan? Progres sesi ini tidak disimpan.")) {
          document.body.classList.remove("quizmode"); stopTimer(); go("beranda");
        }
      },
      periksa: () => periksa(),
      lanjut: () => lanjut(),
      sisip: (d) => {
        const inp = $("#answer"); if (!inp || inp.disabled) return;
        const s = inp.selectionStart || inp.value.length, e = inp.selectionEnd || s;
        inp.value = inp.value.slice(0, s) + d.c + inp.value.slice(e);
        inp.focus(); inp.setSelectionRange(s + d.c.length, s + d.c.length);
      },
      hapus: () => {
        const inp = $("#answer"); if (!inp || inp.disabled) return;
        const s = inp.selectionStart || inp.value.length, e = inp.selectionEnd || s;
        if (s !== e) inp.value = inp.value.slice(0, s) + inp.value.slice(e);
        else if (s > 0) inp.value = inp.value.slice(0, s - 1) + inp.value.slice(s);
        inp.focus(); inp.setSelectionRange(Math.max(0, s - 1), Math.max(0, s - 1));
      },
      ulangi: () => { S.count = S.quiz.qs.length; startQuiz(); },
      keBeranda: () => go("beranda"),
      keBeranda2: () => go("beranda"),
      pilihContoh: (d) => { S.contohKey = d.k; renderContoh(); window.scrollTo({ top: 0, behavior: "smooth" }); },
      latihanTopik: (d) => openTopic(d.k),
      kirimUlang: (d, el) => {
        const a = riwayat().find((x) => x.id === d.id);
        if (!a) return;
        if (!urlApps()) { toast("Isi dulu URL Apps Script di Pengaturan ⚙️"); return; }
        el.textContent = "Mengirim…"; el.disabled = true;
        cobaKirim(a, (ok) => { toast(ok ? "✅ Terkirim!" : "Gagal, coba lagi"); renderRiwayat(); });
      },
      tes: () => {
        const url = $("#inUrl").value.trim();
        if (!/^https:\/\/script\.google/.test(url)) { toast("URL harus dari script.google.com"); return; }
        toast("⏳ Mengirim ping…");
        fetch(url, { method: "POST", mode: "no-cors", body: new URLSearchParams({ nama: "TES", kelas: "-", topik: "Tes Koneksi", level: "-", benar: 0, total: 0, skor: 0, durasi: 0, waktu: new Date().toISOString(), detail: "", perangkat: "tes" }) })
          .then(() => toast("✅ Terkirim! Cek spreadsheet guru."))
          .catch(() => toast("❌ Gagal. Periksa URL/internet."));
      },
      simpan: () => {
        store.set("ev_nama", $("#inNama").value.trim());
        store.set("ev_kelas", $("#inKelas").value.trim());
        store.set("ev_url", $("#inUrl").value.trim());
        toast("💾 Tersimpan!");
        renderPengaturan();
      },
      hapusRiwayat: () => {
        if (confirm("Hapus semua riwayat di perangkat ini?")) { store.del("ev_riwayat"); toast("Riwayat dihapus"); renderPengaturan(); }
      },
    },
  };
  window.App = App;

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-act]");
    if (t && App.act[t.dataset.act]) { App.act[t.dataset.act](t.dataset, t); return; }
    if (e.target.id === "scrim") closeSheet();
  });
  document.querySelectorAll("#bottomnav button").forEach((b) =>
    b.addEventListener("click", () => go(b.dataset.tab)));

  /* =================== ONBOARDING =================== */
  function cekOnboard() {
    if (nama()) return;
    const ov = $("#onboard");
    ov.innerHTML = `
      <div class="ocard">
        <div class="ologo">⚡</div>
        <h2>Selamat datang di <span>EksponenKu</span></h2>
        <p class="muted">Sebelum mulai, siapa nama kamu?</p>
        <input id="obNama" class="ainput" placeholder="Nama lengkap" />
        <input id="obKelas" class="ainput" placeholder="Kelas (misal: IX-A)" />
        <button class="btn pri block" id="obGo">🚀 Mulai Belajar</button>
      </div>`;
    ov.classList.add("show");
    $("#obGo").addEventListener("click", () => {
      const n = $("#obNama").value.trim();
      if (!n) { toast("Isi namamu dulu ya 😊"); return; }
      store.set("ev_nama", n);
      store.set("ev_kelas", $("#obKelas").value.trim());
      ov.classList.remove("show");
      renderHome();
    });
  }

  /* =================== INIT =================== */
  go("beranda");
  cekOnboard();
}
