// ===== Página: Pruebas estadísticas (chi-cuadrado, Pearson y regresión) =====
iniciarDatos();
const ALFA = 0.05;
let xPred = null, verTodos = false;
llenarSelect("#sel-c1", CUALITATIVAS, ESTADO.c1);
llenarSelect("#sel-c2", CUALITATIVAS, ESTADO.c2);
llenarSelect("#sel-x", CUANTITATIVAS, ESTADO.x);
llenarSelect("#sel-y", CUANTITATIVAS, ESTADO.y);
const fuerza = (r) => {
  const a = Math.abs(r);
  return a < 0.2 ? "muy d\xE9bil" : a < 0.4 ? "d\xE9bil" : a < 0.6 ? "moderada" : a < 0.8 ? "fuerte" : "muy fuerte";
};
// ----- 1. Chi-cuadrado -----
function mostrarChi() {
  ESTADO.c1 = $("#sel-c1").value;
  ESTADO.c2 = $("#sel-c2").value;
  guardarEstado();
  const c = calcContingencia(ESTADO.c1, ESTADO.c2), o = $("#res-chi");
  if (c.error) {
    o.innerHTML = ADVERTENCIA(c.error);
    return;
  }
  const sub = c.chi2.toFixed(3), rechaza = c.p < ALFA, supuesto = c.bajas / c.celdas > 0.2 || c.minE < 1;
  o.innerHTML = `<p><b>H<sub>0</sub>:</b> \xAB${nombre(c.a)}\xBB y \xAB${nombre(c.b)}\xBB son independientes. <b>H<sub>1</sub>:</b> existe asociaci\xF3n entre ambas.</p>
<div class="desplazable"><table><caption>Cada celda muestra la frecuencia observada y, entre par\xE9ntesis, la esperada.</caption><thead><tr><th>${nombre(c.a)} \\ ${nombre(c.b)}</th>${c.cb.map((x) => `<th>${x}</th>`).join("")}<th>Total</th></tr></thead><tbody>${c.ra.map((r, i) => `<tr><td class="l">${r}</td>${c.O[i].map((v, j) => `<td>${v} <span class="esp">(${c.E[i][j].toFixed(2)})</span></td>`).join("")}<td>${c.tf[i]}</td></tr>`).join("")}<tr><th>Total</th>${c.tc.map((v) => `<th>${v}</th>`).join("")}<th>${c.n}</th></tr></tbody></table></div>
<p>Nivel de significancia <b>\u03B1 = 0,05</b> \xB7 estad\xEDstico <b>\u03C7\xB2 = ${sub}</b> \xB7 grados de libertad = ${c.gl} \xB7 <b>valor p = ${formatoP(c.p)}</b> \xB7 V de Cram\xE9r = ${c.V.toFixed(3)}</p>
${supuesto ? ADVERTENCIA(`supuesto no cumplido: ${c.bajas} de ${c.celdas} celdas (${(100 * c.bajas / c.celdas).toFixed(0)} %) tienen frecuencia esperada menor que 5 (m\xEDnima ${c.minE.toFixed(2)}). El resultado puede no ser confiable; conviene agrupar categor\xEDas o ampliar la muestra.`) : `<p class="suave">Revisi\xF3n de supuestos: solo ${c.bajas} de ${c.celdas} celdas tienen frecuencia esperada menor que 5 (m\xEDnima ${c.minE.toFixed(2)}); el supuesto se considera cumplido.</p>`}
<p><b>Decisi\xF3n:</b> como p ${rechaza ? "<" : "\u2265"} \u03B1, ${rechaza ? "se rechaza H<sub>0</sub>" : "no se rechaza H<sub>0</sub>"}.</p>
<div class="interpretacion">${INTERPRETA(`\u03C7\xB2 compara las frecuencias observadas con las que se esperar\xEDan si las variables fueran independientes: a mayor valor, mayor discrepancia. El valor p es la probabilidad de una discrepancia al menos tan grande si H<sub>0</sub> fuera cierta. Con \u03B1 = 0,05, <b>${rechaza ? "hay evidencia de asociaci\xF3n" : "no hay evidencia suficiente de asociaci\xF3n"}</b> entre \xAB${nombre(c.a)}\xBB y \xAB${nombre(c.b)}\xBB. La V de Cram\xE9r (0 a 1) indica una asociaci\xF3n ${c.V < 0.1 ? "muy d\xE9bil" : c.V < 0.3 ? "d\xE9bil a moderada" : c.V < 0.5 ? "moderada a fuerte" : "fuerte"}. Limitaciones: asociaci\xF3n no implica causalidad, el resultado depende del tama\xF1o de la muestra y los datos son simulados.`)}</div>`;
}
// ----- 2. Correlación de Pearson -----
function mostrarPearson() {
  const par = calcPar(ESTADO.x, ESTADO.y), o = $("#res-pearson");
  if (par.error) {
    o.innerHTML = ADVERTENCIA(par.error);
    return;
  }
  o.innerHTML = `<p><b>r de Pearson = ${par.r.toFixed(3)}</b> (n = ${par.n} pares completos) \xB7 r\xB2 = ${par.r2.toFixed(3)}</p>
<div class="interpretacion">${INTERPRETA(`r mide la fuerza y la direcci\xF3n de la relaci\xF3n <i>lineal</i> entre \xAB${nombre(par.kx)}\xBB y \xAB${nombre(par.ky)}\xBB y toma valores de \u22121 a +1. Aqu\xED es ${par.r > 0 ? "positivo: al aumentar una variable, la otra tiende a aumentar" : "negativo: al aumentar una variable, la otra tiende a disminuir"}, con intensidad <b>${fuerza(par.r)}</b>. <b>Advertencia: la correlaci\xF3n no implica causalidad</b>; pueden intervenir otras variables, como la antig\xFCedad del equipo. Adem\xE1s, r es sensible a valores extremos y no detecta relaciones curvas, por lo que conviene confirmarlo con el diagrama de dispersi\xF3n.`)}</div>`;
}
// ----- 3. Regresión lineal simple -----
function mostrarRegresion() {
  const par = calcPar(ESTADO.x, ESTADO.y), o = $("#res-regresion");
  if (par.error) {
    o.innerHTML = "";
    return;
  }
  const { a, b, r2, pts, xmin, xmax, kx, ky } = par;
  if (xPred === null) xPred = nt(par.mx);
  const filas = (verTodos ? pts : pts.slice(0, 10)).map((q) => `<tr><td class="l">${q[2]}</td><td>${q[0]}</td><td>${q[1]}</td><td>${nt(a + b * q[0])}</td><td>${nt(q[1] - a - b * q[0])}</td></tr>`).join("");
  o.innerHTML = `<p>Ecuaci\xF3n estimada: <b>\u0177 = ${nt(a)} ${b >= 0 ? "+" : "\u2212"} ${nt(Math.abs(b))}\xB7x</b> &nbsp;(y = ${nombre(ky)}; x = ${nombre(kx)})</p>
<p>Intercepto (a) = ${a.toFixed(4)} \xB7 Pendiente (b) = ${b.toFixed(4)} \xB7 <b>R\xB2 = ${r2.toFixed(3)}</b></p>
<div class="desplazable tabla-alta"><table><caption>Residuo = observado \u2212 estimado. ${verTodos ? "Se muestran los " + par.n + " pares." : "Se muestran 10 de " + par.n + " pares."}</caption><thead><tr><th>ID</th><th>x observado</th><th>y observado</th><th>y estimado</th><th>Residuo</th></tr></thead><tbody>${filas}</tbody></table></div>
<div class="fila"><button id="btn-todos" class="secundario">${verTodos ? "Mostrar solo 10" : "Mostrar todos los pares"}</button></div>
<div class="fila">Predicci\xF3n para x = <input id="x-pred" type="number" step="any" value="${xPred}" style="width:110px"> <span id="y-pred"></span></div>
<div class="interpretacion">${INTERPRETA(`La pendiente indica que, por cada unidad adicional de \xAB${nombre(kx)}\xBB, \xAB${nombre(ky)}\xBB cambia en promedio ${nt(b)} unidades en esta muestra. El intercepto (${nt(a)}) es el valor estimado cuando x = 0${xmin > 0 ? "; como 0 queda fuera del rango observado, no tiene interpretaci\xF3n pr\xE1ctica" : ""}. R\xB2 = ${(100 * r2).toFixed(1)} % es la proporci\xF3n de la variabilidad de y asociada linealmente a x; el resto queda sin explicar. Las predicciones solo son prudentes dentro del rango observado [${nt(xmin)}, ${nt(xmax)}]. El modelo describe asociaci\xF3n, no causa, y usa datos simulados.`)}</div>`;
  const calcular = () => {
    xPred = $("#x-pred").value;
    const v = parseFloat(xPred);
    $("#y-pred").innerHTML = Number.isFinite(v) ? `\u2192 \u0177 = <b>${nt(a + b * v)}</b> ${v < xmin || v > xmax ? '<span class="aviso"><b>Advertencia:</b> fuera del rango observado, extrapolaci\xF3n poco fiable.</span>' : ""}` : "";
  };
  $("#x-pred").oninput = calcular;
  calcular();
  $("#btn-todos").onclick = () => {
    verTodos = !verTodos;
    mostrarRegresion();
  };
}
function cambioXY() {
  ESTADO.x = $("#sel-x").value;
  ESTADO.y = $("#sel-y").value;
  guardarEstado();
  xPred = null;
  mostrarPearson();
  mostrarRegresion();
}
$("#sel-c1").onchange = mostrarChi;
$("#sel-c2").onchange = mostrarChi;
$("#sel-x").onchange = cambioXY;
$("#sel-y").onchange = cambioXY;
mostrarChi();
mostrarPearson();
mostrarRegresion();
