// ===== Página: Gráficos (dispersión, recta y comparaciones) =====
iniciarDatos();
llenarSelect("#sel-x", CUANTITATIVAS, ESTADO.x);
llenarSelect("#sel-y", CUANTITATIVAS, ESTADO.y);
function dibujar() {
  ESTADO.x = $("#sel-x").value;
  ESTADO.y = $("#sel-y").value;
  guardarEstado();
  const par = calcPar(ESTADO.x, ESTADO.y);
  ["#graf-dispersion", "#graf-recta", "#interp-graf"].forEach((s) => $(s).innerHTML = "");
  if (par.error) {
    $("#graf-dispersion").innerHTML = ADVERTENCIA(par.error);
  } else {
    const pts = par.pts.map((p) => [p[0], p[1]]), ex = nombre(par.kx), ey = nombre(par.ky);
    $("#graf-dispersion").innerHTML = dispersion(pts, "Diagrama de dispersi\xF3n", ex, ey);
    $("#graf-recta").innerHTML = dispersion(pts, "Recta de regresi\xF3n estimada", ex, ey, [par.a, par.b]);
    $("#interp-graf").innerHTML = INTERPRETA(`Cada punto es un equipo. La nube ${par.r > 0 ? "asciende" : "desciende"} de izquierda a derecha (r = ${par.r.toFixed(3)}) y la recta discontinua resume esa tendencia: \u0177 = ${nt(par.a)} ${par.b >= 0 ? "+" : "\u2212"} ${nt(Math.abs(par.b))}\xB7x, con R\xB2 = ${par.r2.toFixed(3)}. Los puntos alejados de la recta son equipos que se desv\xEDan del patr\xF3n general.`);
  }
  comparaciones();
}
function comparaciones() {
  const k = ESTADO.y, medias = {};
  let html = "";
  [["plan", "Plan de mantenimiento"], ["tipo", "Tipo de equipo"]].forEach(([c, t]) => {
    const cats = ordenar(c, [...new Set(data.map((d) => d[c]))]), m = cats.map((x) => {
      const a = data.filter((d) => d[c] === x).map((d) => d[k]).filter(Number.isFinite);
      return a.length ? media(a) : 0;
    });
    medias[c] = Object.fromEntries(cats.map((x, i) => [x, m[i]]));
    html += `<div>${barras(cats, m, "Promedio de " + nombre(k) + " seg\xFAn " + t.toLowerCase(), t, nombre(k))}</div>`;
  });
  $("#graf-comparaciones").innerHTML = html;
  const p = medias.plan, hay = p["Con plan"] != null && p["Sin plan"] != null;
  $("#interp-comp").innerHTML = INTERPRETA(`Las barras comparan promedios de \xAB${nombre(k)}\xBB entre grupos de equipos. ${hay ? `Los equipos con plan promedian ${nt(p["Con plan"])} y los que no tienen plan ${nt(p["Sin plan"])} (diferencia: ${nt(p["Con plan"] - p["Sin plan"])}).` : ""} Una diferencia de promedios es solo descriptiva: para afirmar que es real habr\xEDa que aplicar una prueba de comparaci\xF3n de medias y controlar variables como la antig\xFCedad y el tipo de equipo.`);
}
$("#sel-x").onchange = dibujar;
$("#sel-y").onchange = dibujar;
dibujar();
