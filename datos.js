// ===== Definición de variables =====
const VARIABLES = [["id", "ID", "id"], ["tipo", "Tipo de equipo", "cat"], ["antig", "Antig\xFCedad (a\xF1os)", "num"], ["horas", "Horas de uso diarias (h)", "num"], ["plan", "Plan de mantenimiento", "cat"], ["mant", "Mantenimientos preventivos/a\xF1o", "num"], ["fallas", "Fallas/a\xF1o", "num"], ["arr", "Tiempo de arranque (s)", "num"], ["temp", "Temperatura CPU (\xB0C)", "num"], ["ram", "Uso de RAM (%)", "num"], ["sat", "Satisfacci\xF3n (1-5)", "cat"], ["nivel", "Nivel de rendimiento", "cat"]].map(([k, n, t]) => ({ k, n, t }));
const CUALITATIVAS = ["tipo", "plan", "nivel", "sat"];
const CUANTITATIVAS = ["antig", "horas", "mant", "fallas", "arr", "temp", "ram"];
const SIN_CV = ["temp"];
const nombre = (k) => VARIABLES.find((v) => v.k === k).n;
// ===== Cuestionario (pregunta, variable, tipo, codificación) =====
const PREGUNTAS = [["\xBFQu\xE9 tipo de equipo se eval\xFAa?", "tipo", "Cualitativa nominal", "Escritorio / Port\xE1til / Servidor"], ["\xBFCu\xE1ntos a\xF1os tiene el equipo?", "antig", "Cuantitativa continua", "A\xF1os, 1 decimal"], ["\xBFCu\xE1ntas horas al d\xEDa se usa?", "horas", "Cuantitativa continua", "Horas"], ["\xBFCuenta con un plan de mantenimiento preventivo establecido?", "plan", "Cualitativa nominal (dicot\xF3mica)", "Con plan / Sin plan"], ["\xBFCu\xE1ntos mantenimientos preventivos recibi\xF3 en el \xFAltimo a\xF1o?", "mant", "Cuantitativa discreta", "Conteo (0, 1, 2\u2026)"], ["\xBFCu\xE1ntas fallas o aver\xEDas tuvo en el \xFAltimo a\xF1o?", "fallas", "Cuantitativa discreta", "Conteo"], ["\xBFCu\xE1nto tarda en arrancar hasta el escritorio?", "arr", "Cuantitativa continua", "Segundos (cron\xF3metro)"], ["\xBFCu\xE1l es la temperatura promedio del procesador?", "temp", "Cuantitativa continua", "\xB0C"], ["\xBFQu\xE9 porcentaje promedio de RAM usa?", "ram", "Cuantitativa continua", "%; puede quedar vac\xEDo"], ["\xBFQu\xE9 tan satisfecho est\xE1 el usuario con el rendimiento?", "sat", "Cualitativa ordinal", "1 = muy baja \u2026 5 = muy alta"], ["Nivel de rendimiento (variable derivada del tiempo de arranque)", "nivel", "Cualitativa ordinal", "Bajo > 65 s \xB7 Medio 40\u201365 s \xB7 Alto < 40 s"]];
// ===== Generador de la base sintética (semilla reproducible) =====
function rng(s) {
  return () => {
    s |= 0;
    s = s + 1831565813 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function gen(n, semilla) {
  const r = rng(semilla), N = () => Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(6.2832 * r()), acotar = (v, a, b) => Math.min(b, Math.max(a, v)), filas = [];
  for (let i = 1; i <= n; i++) {
    const u = r(), tipo = u < 0.5 ? "Escritorio" : u < 0.8 ? "Port\xE1til" : "Servidor", antig = +(0.5 + r() * 7).toFixed(1), horas = +(tipo === "Servidor" ? 12 + r() * 12 : 2 + r() * 10).toFixed(1), plan = r() < 0.55 ? "Con plan" : "Sin plan", mant = plan === "Con plan" ? 2 + Math.floor(r() * 4) : Math.floor(r() * 3);
    const arr = +Math.max(12, 28 + 5 * antig - 5 * mant + (tipo === "Servidor" ? 20 : tipo === "Port\xE1til" ? 6 : 0) + 8 * N()).toFixed(1);
    const fallas = Math.max(0, Math.round(0.6 + 0.3 * antig - 0.45 * mant + 0.05 * horas + 0.9 * N()));
    const temp = +(40 + 0.9 * horas + 0.8 * antig - 0.5 * mant + 4 * N()).toFixed(1);
    const ram = r() < 0.03 ? null : Math.round(acotar(35 + 1.5 * horas + 0.8 * antig + 10 * N(), 15, 98));
    const sat = acotar(Math.round(4.6 - 0.025 * arr - 0.15 * fallas + 0.7 * N()), 1, 5);
    const nivel = arr < 40 ? "Alto" : arr < 65 ? "Medio" : "Bajo";
    filas.push({ id: i, tipo, antig, horas, plan, mant, fallas, arr, temp, ram, sat, nivel });
  }
  return filas;
}
// ===== Estado compartido entre páginas (se guarda en el navegador) =====
const MUESTRA_ORIGINAL = { semilla: 2080, n: 60 };
const ESTADO = { semilla: 2080, n: 60, x: "mant", y: "arr", c1: "plan", c2: "nivel" };
const CLAVE_ESTADO = "lab-estadistica-estado";
let data = [];
function cargarEstado() {
  try {
    const s = JSON.parse(localStorage.getItem(CLAVE_ESTADO)) || {};
    if (s.semilla > 0 && s.n >= 40 && s.n <= 300) {
      ESTADO.semilla = s.semilla;
      ESTADO.n = s.n;
    }
    [["x", CUANTITATIVAS], ["y", CUANTITATIVAS], ["c1", CUALITATIVAS], ["c2", CUALITATIVAS]].forEach(([c, l]) => {
      if (l.includes(s[c])) ESTADO[c] = s[c];
    });
  } catch (e) {
  }
}
function guardarEstado() {
  try {
    localStorage.setItem(CLAVE_ESTADO, JSON.stringify(ESTADO));
  } catch (e) {
  }
}
function generarDatos() {
  data = gen(ESTADO.n, ESTADO.semilla);
  const e = $("#muestra-activa");
  if (e) e.textContent = `Muestra activa: ${data.length} registros, semilla ${ESTADO.semilla}.`;
}
function iniciarDatos() {
  cargarEstado();
  generarDatos();
}
