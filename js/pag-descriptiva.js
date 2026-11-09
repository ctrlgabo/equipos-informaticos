// ===== Página: Estadística descriptiva =====
iniciarDatos();
const resumenes = CUANTITATIVAS.map((k) => ({ k, r: resumen(valores(k)) }));
const celdas = (x, campos) => campos.map((c) => `<td>${typeof x[c] === "string" ? x[c] : nt(x[c])}</td>`).join("");
function filaVariable(k, r, campos, extra = "") {
  return `<tr><td class="l">${nombre(k)}</td>${r ? extra + celdas(r, campos) : `<td colspan="${campos.length + 1}">Muestra insuficiente</td>`}</tr>`;
}
function tablaCentral() {
  const cab = ["Variable", "n", "Media", "Mediana", "Moda"];
  $("#tab-central").innerHTML = `<div class="desplazable"><table><thead><tr>${cab.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${resumenes.map(({ k, r }) => filaVariable(k, r, ["media", "mediana", "moda"], r ? `<td>${r.n}</td>` : "")).join("")}</tbody></table></div>`;
}
function tablaDispersion() {
  const cab = ["Variable", "M\xEDnimo", "M\xE1ximo", "Rango", "Varianza", "Desv. est.", "CV (%)", "Q1", "Q3", "P10", "P90"];
  const fila = ({ k, r }) => {
    if (!r) return `<tr><td class="l">${nombre(k)}</td><td colspan="10">Muestra insuficiente</td></tr>`;
    const cv = SIN_CV.includes(k) ? "\u2014" : nt(r.cv);
    return `<tr><td class="l">${nombre(k)}</td>${celdas(r, ["min", "max", "rango", "varianza", "desv"])}<td>${cv}</td>${celdas(r, ["q1", "q3", "p10", "p90"])}</tr>`;
  };
  $("#tab-dispersion").innerHTML = `<div class="desplazable"><table><caption>Varianza y desviaci\xF3n est\xE1ndar muestrales (divisor n \u2212 1). CV = desviaci\xF3n / media \xD7 100; no se calcula para la temperatura en \xB0C porque es una escala de intervalo (su cero no es absoluto).</caption><thead><tr>${cab.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${resumenes.map(fila).join("")}</tbody></table></div>`;
}
function tablaModasCualitativas() {
  const fila = (k) => {
    const v = data.map((d) => d[k]).filter((x) => x != null).map(String), cats = ordenar(k, [...new Set(v)]), fi = cats.map((c) => v.filter((x) => x === c).length), mx = Math.max(...fi);
    return `<tr><td class="l">${nombre(k)}</td><td class="l">${cats.filter((_, i) => fi[i] === mx).join(", ")}</td><td>${mx}</td><td>${(100 * mx / v.length).toFixed(1)} %</td></tr>`;
  };
  $("#tab-modas").innerHTML = `<div class="desplazable"><table><thead><tr><th>Variable</th><th>Moda</th><th>Frecuencia</th><th>Porcentaje</th></tr></thead><tbody>${CUALITATIVAS.map(fila).join("")}</tbody></table></div>`;
}
function interpretacion() {
  const r = resumenes.find((x) => x.k === "arr").r;
  if (!r) {
    $("#interp-desc").innerHTML = "";
    return;
  }
  const nivelCV = r.cv < 15 ? "baja" : r.cv < 30 ? "moderada" : "alta";
  $("#interp-desc").innerHTML = INTERPRETA(`La media resume el centro de los datos, la mediana deja la mitad de los equipos por debajo y la desviaci\xF3n est\xE1ndar indica cu\xE1nto se alejan, en promedio, de la media. Por ejemplo, el tiempo de arranque medio es <b>${nt(r.media)} s</b> (mediana ${nt(r.mediana)} s, desviaci\xF3n ${nt(r.desv)} s). El coeficiente de variaci\xF3n es ${nt(r.cv)} %, una dispersi\xF3n relativa ${nivelCV} (como referencia general: menos de 15 % baja, de 15 % a 30 % moderada y m\xE1s de 30 % alta). ${r.media > r.mediana * 1.03 ? "La media supera a la mediana: algunos equipos muy lentos la elevan (asimetr\xEDa positiva)." : "Media y mediana son parecidas: la distribuci\xF3n es aproximadamente sim\xE9trica."} El 50 % central de los equipos arranca entre ${nt(r.q1)} y ${nt(r.q3)} s. Son medidas descriptivas de esta muestra y no prueban causas.`);
}
tablaCentral();
tablaDispersion();
tablaModasCualitativas();
interpretacion();
