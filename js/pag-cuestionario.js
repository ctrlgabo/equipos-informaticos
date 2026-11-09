// ===== Página: Cuestionario =====
iniciarDatos();
const escapar = (t) => t.replace(/</g, "&lt;").replace(/>/g, "&gt;");
$("#tabla-cuestionario").innerHTML = PREGUNTAS.map((q, i) => `<tr><td>${i + 1}</td><td class="l">${q[0]}</td><td class="l">${nombre(q[1])}</td><td class="l">${q[2]}</td><td class="l">${escapar(q[3])}</td></tr>`).join("");
