// CAPA 3 · PRESENTACIÓN — utilidades de pantalla (no contienen reglas de negocio)
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const L = (n) => "L " + Number(n).toLocaleString("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const gname = Curriculo.nombreGrado;
const F = (id, l, t = "text", x = "") => `<label>${l}<input id="${id}" type="${t}" ${x}></label>`;
const SEL = (id, l, o) => `<label>${l}<select id="${id}">${o}</select></label>`;
const opt = (a) => a.map((v) => `<option value="${v[0]}">${v[1]}</option>`).join("");
const GOPT = opt(Curriculo.GR.map((g) => [g, gname(g)]));
const V = {}; // vistas registradas por cada archivo de presentacion/vistas

const ficha = (a) => `<div class="card"><div class="code">${a.codigo}</div><h3 style="margin-top:0">${esc(a.nombres + " " + a.apellidos)} · ${gname(a.grado)} · año ${a.anio}</h3>
<p>Nacimiento: ${a.nac} · Identidad: ${esc(a.identidad)} · Salud: ${esc(a.salud)}<br>Encargado: ${esc(a.enc.nombre)} (${esc(a.enc.parentesco)}), tel. ${a.enc.tel}<br>Emergencia: ${esc(a.emerg.nombre)}, tel. ${a.emerg.tel}</p>
<h3>Clases asignadas</h3><div class="chips">${a.materias.map((m) => `<span>${esc(m)}</span>`).join("")}</div>
<h3>Pagos</h3><div class="sc"><table><tr><th>Concepto</th><th>Vence</th><th>Monto</th><th>Estado</th></tr>${a.cuotas.map((c) => `<tr><td>${c.label}</td><td>${c.vence}</td><td>${L(c.monto)}</td><td>${c.pago ? `<span class="ok">Pagada (recibo ${String(c.pago).padStart(6, "0")})</span>` : c.vence < hoy() ? '<span class="er">Vencida</span>' : "Pendiente"}</td></tr>`).join("")}</table></div></div>`;
