// ===== Página: Base de datos =====
iniciarDatos();
let colOrden = "id", dirOrden = 1;
$("#num-registros").value = ESTADO.n;
function mostrarTabla() {
  const texto = $("#filtro-texto").value.toLowerCase(), tipo = $("#filtro-tipo").value, plan = $("#filtro-plan").value;
  const filas = data.filter((d) => (!tipo || d.tipo === tipo) && (!plan || d.plan === plan) && (!texto || Object.values(d).join(" ").toLowerCase().includes(texto)));
  filas.sort((a, b) => {
    const x = a[colOrden], y = b[colOrden];
    return (x == null) - (y == null) || (x > y ? 1 : x < y ? -1 : 0) * dirOrden;
  });
  $("#tabla-datos").innerHTML = "<thead><tr>" + VARIABLES.map((v) => `<th onclick="ordenarPor('${v.k}')">${v.n}${colOrden === v.k ? dirOrden > 0 ? " \u25B2" : " \u25BC" : ""}</th>`).join("") + "</tr></thead><tbody>" + filas.map((d) => "<tr>" + VARIABLES.map((v) => `<td>${d[v.k] ?? "\u2014"}</td>`).join("") + "</tr>").join("") + "</tbody>";
  $("#contador").textContent = `Mostrando ${filas.length} de ${data.length} registros.`;
}
function ordenarPor(k) {
  dirOrden = colOrden === k ? -dirOrden : 1;
  colOrden = k;
  mostrarTabla();
}
function descargarCSV() {
  const lineas = [VARIABLES.map((v) => `"${v.n}"`).join(",")].concat(data.map((d) => VARIABLES.map((v) => d[v.k] ?? "").join(",")));
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["\uFEFF" + lineas.join("\n")], { type: "text/csv;charset=utf-8" }));
  a.download = `mantenimiento_equipos_semilla_${ESTADO.semilla}.csv`;
  a.click();
}
function aplicarMuestra() {
  guardarEstado();
  $("#num-registros").value = ESTADO.n;
  generarDatos();
  mostrarTabla();
}
function nuevaMuestra() {
  ESTADO.n = Math.max(40, Math.min(300, Math.round(+$("#num-registros").value) || 60));
  ESTADO.semilla = Math.floor(Math.random() * 1e9) + 1;
  aplicarMuestra();
}
function restaurarMuestra() {
  ESTADO.semilla = MUESTRA_ORIGINAL.semilla;
  ESTADO.n = MUESTRA_ORIGINAL.n;
  aplicarMuestra();
}
["#filtro-texto", "#filtro-tipo", "#filtro-plan"].forEach((s) => $(s).oninput = mostrarTabla);
$("#btn-nueva").onclick = nuevaMuestra;
$("#btn-restaurar").onclick = restaurarMuestra;
$("#btn-csv").onclick = descargarCSV;
$("#btn-imprimir").onclick = () => window.print();
mostrarTabla();
