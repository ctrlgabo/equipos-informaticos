// ===== Utilidades generales (selectores, redondeo y mensajes) =====
const $ = (s) => document.querySelector(s);
const nt = (v) => +(+v).toFixed(2);
const ADVERTENCIA = (m) => `<p class="aviso"><b>Advertencia:</b> ${m}</p>`;
const INTERPRETA = (t) => `<b>\xBFC\xF3mo se interpreta?</b> ${t}`;
function llenarSelect(sel, claves, valor) {
  const s = $(sel);
  s.innerHTML = claves.map((k) => `<option value="${k}">${nombre(k)}</option>`).join("");
  s.value = valor;
}
