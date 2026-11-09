// ===== Página: Distribuciones de frecuencia =====
iniciarDatos();
llenarSelect("#sel-cual", CUALITATIVAS, "tipo");
llenarSelect("#sel-cuant", CUANTITATIVAS, "arr");
function tablaCualitativa() {
  const k = $("#sel-cual").value, v = data.map((d) => d[k]).filter((x) => x != null).map(String), n = v.length;
  if (n < 2) {
    $("#tab-cual").innerHTML = ADVERTENCIA("Muestra insuficiente.");
    $("#graf-cual").innerHTML = "";
    $("#interp-cual").innerHTML = "";
    return;
  }
  const cats = ordenar(k, [...new Set(v)]), fi = cats.map((c) => v.filter((x) => x === c).length), mx = Math.max(...fi), modas = cats.filter((_, i) => fi[i] === mx).join(", "), ordinal = k === "nivel" || k === "sat";
  let acum = 0;
  $("#tab-cual").innerHTML = `<div class="desplazable"><table><caption>fi: frecuencia absoluta. hi: relativa. Fi y Hi: acumuladas (solo con orden natural). Moda: ${modas} (fi = ${mx}).</caption><thead><tr><th>Categor\xEDa</th><th>fi</th><th>hi</th><th>%</th><th>Fi</th><th>Hi %</th></tr></thead><tbody>${cats.map((c, i) => {
    acum += fi[i];
    return `<tr><td class="l">${c}</td><td>${fi[i]}</td><td>${(fi[i] / n).toFixed(3)}</td><td>${(100 * fi[i] / n).toFixed(1)} %</td><td>${ordinal ? acum : "\u2014"}</td><td>${ordinal ? (100 * acum / n).toFixed(1) + " %" : "\u2014"}</td></tr>`;
  }).join("")}<tr><th>Total</th><th>${n}</th><th>1,000</th><th>100 %</th><th></th><th></th></tr></tbody></table></div>`;
  $("#graf-cual").innerHTML = barras(cats, fi, "Frecuencia de " + nombre(k), nombre(k), "Frecuencia absoluta") + circular(cats, fi, "Distribuci\xF3n porcentual de " + nombre(k));
  $("#interp-cual").innerHTML = INTERPRETA(`La frecuencia absoluta cuenta los equipos de cada categor\xEDa; la relativa y el porcentaje permiten comparar muestras de distinto tama\xF1o. En esta muestra la moda de \xAB${nombre(k)}\xBB es <b>${modas}</b> (${(100 * mx / n).toFixed(1)} %). La tabla describe solo esta muestra simulada: no se generaliza a todos los equipos ni explica por qu\xE9 se da esa distribuci\xF3n.`);
}
function tablaCuantitativa() {
  const k = $("#sel-cuant").value, a = valores(k), n = a.length, o = $("#tab-cuant");
  if (n < 5) {
    o.innerHTML = ADVERTENCIA("Muestra insuficiente (se requieren al menos 5 datos).");
    $("#graf-cuant").innerHTML = "";
    $("#interp-cuant").innerHTML = "";
    return;
  }
  const min = Math.min(...a), max = Math.max(...a), K = Math.ceil(1 + 3.322 * Math.log10(n)), ancho = Math.ceil((max - min) / K * 10) / 10 || 1, lim = [], fi = Array(K).fill(0);
  for (let i = 0; i <= K; i++) lim.push(+(min + i * ancho).toFixed(2));
  a.forEach((x) => fi[Math.min(K - 1, Math.floor((x - min) / ancho))]++);
  let acum = 0;
  o.innerHTML = `<div class="desplazable"><table><caption>K = ${K} intervalos (regla de Sturges); amplitud = ${nt(ancho)}. Marca de clase = punto medio del intervalo.</caption><thead><tr><th>Intervalo</th><th>Marca de clase</th><th>fi</th><th>hi</th><th>%</th><th>Fi</th><th>Hi %</th></tr></thead><tbody>${fi.map((f, i) => {
    acum += f;
    return `<tr><td class="l">[${lim[i]} \u2013 ${lim[i + 1]}${i === K - 1 ? "]" : ")"}</td><td>${nt((lim[i] + lim[i + 1]) / 2)}</td><td>${f}</td><td>${(f / n).toFixed(3)}</td><td>${(100 * f / n).toFixed(1)} %</td><td>${acum}</td><td>${(100 * acum / n).toFixed(1)} %</td></tr>`;
  }).join("")}<tr><th>Total</th><th></th><th>${n}</th><th>1,000</th><th>100 %</th><th></th><th></th></tr></tbody></table></div>`;
  $("#graf-cuant").innerHTML = histograma(lim, fi, "Histograma y pol\xEDgono de frecuencias: " + nombre(k), nombre(k));
  const m = fi.indexOf(Math.max(...fi));
  $("#interp-cuant").innerHTML = INTERPRETA(`Agrupar en intervalos resume la forma de la distribuci\xF3n. La clase modal de \xAB${nombre(k)}\xBB es [${lim[m]} \u2013 ${lim[m + 1]}) con ${fi[m]} equipos (${(100 * fi[m] / n).toFixed(1)} %). La marca de clase representa a todos los datos del intervalo. Si las barras se alargan hacia un lado hay asimetr\xEDa. La forma depende del n\xFAmero de intervalos elegido, por lo que es una descripci\xF3n aproximada.`);
}
$("#sel-cual").onchange = tablaCualitativa;
$("#sel-cuant").onchange = tablaCuantitativa;
tablaCualitativa();
tablaCuantitativa();
