// CAPA 3 · PRESENTACIÓN — pantalla Reportes administrativos y financieros
V.rep = async () => {
  $("#view").innerHTML = `<h2>Reportes generales</h2><div id="rbox"><p class="sub">Generando reportes desde MySQL...</p></div>`;

  try {
    await Repo.sincronizarTodo();
  } catch (err) {
    console.error("Error al sincronizar reportes:", err);
  }

  const alumnos = Repo.alumnos();
  const pagos = Repo.pagos();
  const totalRecaudado = pagos.reduce((s, p) => s + Number(p.monto || 0), 0);
  const totalPendiente = alumnos.reduce((s, a) => s + Pagos.saldo(a), 0);

  // Agrupar por grado
  const porGrado = {};
  alumnos.forEach((a) => {
    const g = a.grado || 1;
    if (!porGrado[g]) porGrado[g] = { alumnos: 0, pendiente: 0 };
    porGrado[g].alumnos++;
    porGrado[g].pendiente += Pagos.saldo(a);
  });

  const filasGrado = Object.keys(porGrado)
    .sort((a, b) => Number(a) - Number(b))
    .map(
      (g) =>
        `<tr><td>${gname(Number(g))}</td><td>${porGrado[g].alumnos}</td><td>${L(porGrado[g].pendiente)}</td></tr>`
    )
    .join("");

  const filasPagos = pagos.length
    ? pagos
        .slice(0, 20)
        .map(
          (p) =>
            `<tr><td>#${p.recibo}</td><td>${p.fecha}</td><td>${esc(p.alumno || p.codigo)}</td><td>${esc(p.concepto)}</td><td>${esc(p.metodo)}</td><td>${L(p.monto)}</td></tr>`
        )
        .join("")
    : '<tr><td colspan="6">Aún no hay pagos registrados.</td></tr>';

  $("#rbox").innerHTML = `
    <div class="card">
      <div class="g">
        <div><strong>Alumnos matriculados:</strong><br><span style="font-size:1.4rem">${alumnos.length}</span></div>
        <div><strong>Total recaudado:</strong><br><span style="font-size:1.4rem">${L(totalRecaudado)}</span></div>
        <div><strong>Saldo por cobrar:</strong><br><span style="font-size:1.4rem">${L(totalPendiente)}</span></div>
      </div>
      <button class="s" style="margin-top:1rem" onclick="print()">Imprimir reporte</button>
    </div>

    <div class="card sc">
      <h3 style="margin-top:0">Resumen por grado</h3>
      <table>
        <tr><th>Grado</th><th>Total alumnos</th><th>Saldo pendiente</th></tr>
        ${filasGrado || '<tr><td colspan="3">Sin datos</td></tr>'}
      </table>
    </div>

    <div class="card sc">
      <h3 style="margin-top:0">Últimos recibos emitidos</h3>
      <table>
        <tr><th>Recibo</th><th>Fecha</th><th>Alumno</th><th>Concepto</th><th>Método</th><th>Monto</th></tr>
        ${filasPagos}
      </table>
    </div>
  `;
};