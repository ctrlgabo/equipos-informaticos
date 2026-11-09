// ===== Funciones estadísticas (no tocan el DOM; usan la variable global `data`) =====
const media = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const valores = (k) => data.map((d) => d[k]).filter(Number.isFinite);
function cuantil(a, p) {
  const s = [...a].sort((x, y) => x - y), h = (s.length - 1) * p, i = Math.floor(h);
  return s[i] + (h - i) * ((s[i + 1] ?? s[i]) - s[i]);
}
function varianza(a) {
  if (a.length < 2) return NaN;
  const m = media(a);
  return a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1);
}
function moda(a) {
  const c = {};
  a.forEach((x) => c[x] = (c[x] || 0) + 1);
  const mx = Math.max(...Object.values(c));
  return mx < 2 ? "sin moda" : Object.keys(c).filter((k) => c[k] === mx).slice(0, 3).join(", ");
}
function ordenar(k, cats) {
  return k === "nivel" ? ["Bajo", "Medio", "Alto"].filter((x) => cats.includes(x)) : [...cats].sort();
}
function resumen(a) {
  if (a.length < 2) return null;
  const m = media(a), v = varianza(a), s = Math.sqrt(v), mn = Math.min(...a), mx = Math.max(...a);
  return { n: a.length, media: m, mediana: cuantil(a, 0.5), moda: moda(a), min: mn, max: mx, rango: mx - mn, varianza: v, desv: s, cv: m !== 0 ? 100 * s / Math.abs(m) : NaN, q1: cuantil(a, 0.25), q3: cuantil(a, 0.75), p10: cuantil(a, 0.1), p90: cuantil(a, 0.9) };
}
// ===== Distribución chi-cuadrado: valor p mediante la gamma incompleta =====
function logGamma(x) {
  const c = [76.18009172947146, -86.50532032941678, 24.01409824083091, -1.231739572450155, 0.001208650973866179, -5395239384953e-18];
  let y = x, t = x + 5.5;
  t -= (x + 0.5) * Math.log(t);
  let s = 1.000000000190015;
  for (const v of c) s += v / ++y;
  return -t + Math.log(2.5066282746310007 * s / x);
}
function gammaQ(a, x) {
  if (x <= 0) return 1;
  if (x < a + 1) {
    let ap = a, suma = 1 / a, del = suma;
    for (let n = 0; n < 300; n++) {
      ap++;
      del *= x / ap;
      suma += del;
      if (Math.abs(del) < Math.abs(suma) * 1e-13) break;
    }
    return Math.max(0, 1 - suma * Math.exp(-x + a * Math.log(x) - logGamma(a)));
  }
  let b = x + 1 - a, c = 1e30, d = 1 / b, h = d;
  for (let i = 1; i < 300; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = b + an / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    const dl = d * c;
    h *= dl;
    if (Math.abs(dl - 1) < 1e-13) break;
  }
  return Math.exp(-x + a * Math.log(x) - logGamma(a)) * h;
}
const formatoP = (p) => p < 1e-4 ? "< 0,0001" : p.toFixed(4).replace(".", ",");
// ===== Prueba chi-cuadrado de independencia =====
function calcContingencia(a, b) {
  if (a === b) return { error: "Elige dos variables distintas." };
  const filas = data.filter((d) => d[a] != null && d[b] != null), n = filas.length;
  const ra = ordenar(a, [...new Set(filas.map((d) => String(d[a])))]), cb = ordenar(b, [...new Set(filas.map((d) => String(d[b])))]);
  if (n < 10 || ra.length < 2 || cb.length < 2) return { error: "Se necesitan al menos 10 registros y 2 categor\xEDas en cada variable." };
  const O = ra.map((x) => cb.map((y) => filas.filter((d) => String(d[a]) === x && String(d[b]) === y).length));
  const tf = O.map((r) => r.reduce((s, v) => s + v, 0)), tc = cb.map((_, j) => O.reduce((s, r) => s + r[j], 0));
  const E = O.map((r, i) => r.map((_, j) => tf[i] * tc[j] / n));
  let chi2 = 0, bajas = 0;
  E.forEach((r, i) => r.forEach((e, j) => {
    if (e < 5) bajas++;
    if (e > 0) chi2 += (O[i][j] - e) ** 2 / e;
  }));
  const gl = (ra.length - 1) * (cb.length - 1), celdas = ra.length * cb.length;
  return { a, b, n, ra, cb, O, E, tf, tc, chi2, gl, celdas, bajas, p: gammaQ(gl / 2, chi2 / 2), minE: Math.min(...E.flat()), V: Math.sqrt(chi2 / (n * Math.min(ra.length - 1, cb.length - 1))) };
}
// ===== Correlación de Pearson y regresión lineal simple (ŷ = a + b·x) =====
function calcPar(kx, ky) {
  if (kx === ky) return { error: "Elige dos variables distintas." };
  const pts = data.filter((d) => Number.isFinite(d[kx]) && Number.isFinite(d[ky])).map((d) => [d[kx], d[ky], d.id]), n = pts.length;
  if (n < 3) return { error: "Se necesitan al menos 3 pares de datos completos." };
  const mx = media(pts.map((p) => p[0])), my = media(pts.map((p) => p[1]));
  let sxx = 0, syy = 0, sxy = 0;
  pts.forEach((p) => {
    sxx += (p[0] - mx) ** 2;
    syy += (p[1] - my) ** 2;
    sxy += (p[0] - mx) * (p[1] - my);
  });
  if (!(sxx > 0 && syy > 0)) return { error: "Una de las variables no tiene variaci\xF3n; no se puede calcular." };
  const r = sxy / Math.sqrt(sxx * syy), b = sxy / sxx, xs = pts.map((p) => p[0]);
  return { kx, ky, pts, n, mx, my, r, r2: r * r, b, a: my - b * mx, xmin: Math.min(...xs), xmax: Math.max(...xs) };
}
