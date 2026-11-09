// ===== Gráficos en SVG nativo =====
const COLOR = { primario: "#4A3F6B", secundario: "#D08C60", recta: "#B5483A", eje: "#6B7280", rejilla: "#E2E5EA", pastel: ["#4A3F6B", "#D08C60", "#8E9AAF", "#C9ADA7", "#6D597A"] };
const L = 55, R = 545, T = 30, B = 275;
function marco(titulo, etqX, etqY, cuerpo) {
  return `<svg viewBox="0 0 560 330" role="img" aria-label="${titulo}"><text x="280" y="18" text-anchor="middle" font-weight="700" fill="${COLOR.primario}" font-size="14">${titulo}</text>${cuerpo}<text x="300" y="324" text-anchor="middle" font-size="11" fill="${COLOR.eje}">${etqX}</text><text transform="translate(13 160) rotate(-90)" text-anchor="middle" font-size="11" fill="${COLOR.eje}">${etqY}</text></svg>`;
}
function ejeY(mx, mn = 0) {
  let s = "";
  for (let i = 0; i <= 5; i++) {
    const v = mn + (mx - mn) * i / 5, y = B - (B - T) * i / 5;
    s += `<line x1="${L}" x2="${R}" y1="${y}" y2="${y}" stroke="${COLOR.rejilla}"/><text x="${L - 6}" y="${y + 4}" text-anchor="end" font-size="10" fill="${COLOR.eje}">${+v.toPrecision(3)}</text>`;
  }
  return s + `<line x1="${L}" x2="${L}" y1="${T}" y2="${B}" stroke="${COLOR.eje}"/><line x1="${L}" x2="${R}" y1="${B}" y2="${B}" stroke="${COLOR.eje}"/>`;
}
function barras(etq, val, titulo, etqX, etqY) {
  const mx = Math.max(...val, 1) * 1.1, w = (R - L) / etq.length;
  let s = ejeY(mx);
  val.forEach((v, i) => {
    const h = (B - T) * v / mx, x = L + i * w + w * 0.15;
    s += `<rect x="${x}" y="${B - h}" width="${w * 0.7}" height="${h}" fill="${COLOR.primario}"/><text x="${x + w * 0.35}" y="${B - h - 4}" text-anchor="middle" font-size="10">${nt(v)}</text><text x="${x + w * 0.35}" y="${B + 14}" text-anchor="middle" font-size="10">${etq[i]}</text>`;
  });
  return marco(titulo, etqX, etqY, s);
}
function histograma(lim, fr, titulo, etqX) {
  const k = fr.length, mx = Math.max(...fr, 1) * 1.1, sx = (v) => L + (R - L) * (v - lim[0]) / (lim[k] - lim[0] || 1), pts = [];
  let s = ejeY(mx);
  fr.forEach((c, i) => {
    const x = sx(lim[i]), w = sx(lim[i + 1]) - x, h = (B - T) * c / mx;
    s += `<rect x="${x}" y="${B - h}" width="${w}" height="${h}" fill="${COLOR.secundario}" stroke="#fff"/>`;
    pts.push([x + w / 2, B - h]);
  });
  const w0 = sx(lim[1]) - sx(lim[0]);
  pts.unshift([sx(lim[0]) - w0 / 2, B]);
  pts.push([sx(lim[k]) + w0 / 2, B]);
  s += `<polyline fill="none" stroke="${COLOR.primario}" stroke-width="2" points="${pts.map((p) => p.join(",")).join(" ")}"/>` + pts.slice(1, -1).map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="3" fill="${COLOR.primario}"/>`).join("");
  lim.forEach((e, i) => {
    if (i % Math.ceil((k + 1) / 7) === 0) s += `<text x="${sx(e)}" y="${B + 14}" text-anchor="middle" font-size="9" fill="${COLOR.eje}">${nt(e)}</text>`;
  });
  return marco(titulo, etqX, "Frecuencia absoluta", s);
}
function circular(etq, val, titulo) {
  const tot = val.reduce((a, b) => a + b, 0) || 1;
  let ang = -Math.PI / 2, s = "";
  val.forEach((v, i) => {
    const fin = ang + 2 * Math.PI * v / tot, c = COLOR.pastel[i % 5], x1 = 190 + 120 * Math.cos(ang), y1 = 175 + 120 * Math.sin(ang), x2 = 190 + 120 * Math.cos(fin), y2 = 175 + 120 * Math.sin(fin);
    s += (v >= tot ? `<circle cx="190" cy="175" r="120" fill="${c}"/>` : `<path d="M190 175L${x1} ${y1}A120 120 0 ${fin - ang > Math.PI ? 1 : 0} 1 ${x2} ${y2}Z" fill="${c}" stroke="#fff" stroke-width="2"/>`) + `<rect x="340" y="${100 + i * 26}" width="14" height="14" fill="${c}"/><text x="360" y="${112 + i * 26}" font-size="12">${etq[i]}: ${(100 * v / tot).toFixed(1)} % (${v})</text>`;
    ang = fin;
  });
  return marco(titulo, "", "", s);
}
function dispersion(pts, titulo, etqX, etqY, recta) {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  let x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const px = (x1 - x0 || 1) * 0.05, py = (y1 - y0 || 1) * 0.08;
  x0 -= px;
  x1 += px;
  y0 -= py;
  y1 += py;
  const sx = (v) => L + (R - L) * (v - x0) / (x1 - x0), sy = (v) => B - (B - T) * (v - y0) / (y1 - y0);
  let s = `<clipPath id="area"><rect x="${L}" y="${T}" width="${R - L}" height="${B - T}"/></clipPath>` + ejeY(y1, y0);
  for (let i = 0; i <= 5; i++) {
    const v = x0 + (x1 - x0) * i / 5;
    s += `<text x="${sx(v)}" y="${B + 14}" text-anchor="middle" font-size="10" fill="${COLOR.eje}">${+v.toPrecision(3)}</text>`;
  }
  pts.forEach((p) => s += `<circle cx="${sx(p[0])}" cy="${sy(p[1])}" r="3.5" fill="${COLOR.primario}" fill-opacity=".6"/>`);
  if (recta) s += `<line clip-path="url(#area)" x1="${sx(x0)}" y1="${sy(recta[0] + recta[1] * x0)}" x2="${sx(x1)}" y2="${sy(recta[0] + recta[1] * x1)}" stroke="${COLOR.recta}" stroke-width="3" stroke-dasharray="8 4"/>`;
  return marco(titulo, etqX, etqY, s);
}
