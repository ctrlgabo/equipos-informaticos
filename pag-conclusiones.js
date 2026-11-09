// ===== Página: Conclusiones (resumen de resultados de la muestra activa) =====
iniciarDatos();
const chi = calcContingencia(ESTADO.c1, ESTADO.c2), par = calcPar(ESTADO.x, ESTADO.y), arr = resumen(valores("arr"));
const fila = (a, b) => `<tr><td class="l">${a}</td><td class="l">${b}</td></tr>`;
const filas = [fila("Tama\xF1o de la muestra", `${data.length} equipos (semilla ${ESTADO.semilla})`)];
if (arr) filas.push(fila("Tiempo de arranque (s)", `media ${nt(arr.media)}, mediana ${nt(arr.mediana)}, desviaci\xF3n est\xE1ndar ${nt(arr.desv)}, CV ${nt(arr.cv)} %`));
filas.push(chi.error ? fila("Chi-cuadrado", chi.error) : fila(`Chi-cuadrado: ${nombre(chi.a)} y ${nombre(chi.b)}`, `\u03C7\xB2 = ${chi.chi2.toFixed(3)}, gl = ${chi.gl}, p = ${formatoP(chi.p)}; con \u03B1 = 0,05 ${chi.p < 0.05 ? "se rechaza H0 (hay asociaci\xF3n)" : "no se rechaza H0 (sin evidencia de asociaci\xF3n)"}`));
filas.push(par.error ? fila("Correlaci\xF3n y regresi\xF3n", par.error) : fila(`Pearson: ${nombre(par.kx)} y ${nombre(par.ky)}`, `r = ${par.r.toFixed(3)} (n = ${par.n})`));
if (!par.error) filas.push(fila("Regresi\xF3n lineal simple", `\u0177 = ${nt(par.a)} ${par.b >= 0 ? "+" : "\u2212"} ${nt(Math.abs(par.b))}\xB7x; R\xB2 = ${par.r2.toFixed(3)}`));
$("#resumen-resultados").innerHTML = `<table><thead><tr><th>Resultado</th><th>Valor en la muestra activa</th></tr></thead><tbody>${filas.join("")}</tbody></table>`;
