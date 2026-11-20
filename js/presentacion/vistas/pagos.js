// CAPA 3 · PRESENTACIÓN — pantalla Pagos y emisión de recibos
V.pag = async (codigoPre) => {
  $("#view").innerHTML = `<h2>Pagos y cobros</h2><p class="sub">Selecciona un alumno para ver sus cuotas pendientes y registrar pagos en MySQL.</p><div id="pbox"><p class="sub">Cargando datos...</p></div><div id="prec"></div>`;

  const fmtMoneda = (n) => (typeof L === "function" ? L(n) : `L ${Number(n || 0).toFixed(2)}`);
  const fmtGrado = (g) => (typeof gname === "function" ? gname(g) : `Grado ${g}`);
  const fechaHoy = typeof hoy === "function" ? hoy() : new Date().toISOString().slice(0, 10);

  try {
    await Promise.race([
      Repo.sincronizarTodo(),
      new Promise((_, rej) =>
        setTimeout(() => rej(new Error("El servidor tardó demasiado en responder (verifica node server.js).")), 6000)
      )
    ]);

    const alumnos = Repo.alumnos();
    if (!alumnos.length) {
      $("#pbox").innerHTML = '<p class="sub">No hay alumnos matriculados todavía.</p>';
      return;
    }

    const opciones = alumnos
      .map(
        (a) =>
          `<option value="${a.codigo}" ${a.codigo === codigoPre ? "selected" : ""}>${a.codigo} — ${esc(a.nombres + " " + a.apellidos)} (${fmtGrado(a.grado)})</option>`
      )
      .join("");

    const metodosOpt = `
      <option value="Efectivo">Efectivo</option>
      <option value="Transferencia">Transferencia</option>
      <option value="Tarjeta">Tarjeta</option>
    `;

    $("#pbox").innerHTML = `<div class="card">
      <div class="g">
        ${SEL("pa", "Alumno", opciones)}
        ${SEL("pm", "Método de pago", metodosOpt)}
        ${F("pf", "Fecha de pago", "date", `value="${fechaHoy}"`)}
      </div>
      <div id="pcuotas" style="margin-top:1rem"></div>
    </div>`;

    const renderCuotas = () => {
      const cod = $("#pa").value;
      const al = Repo.porCodigo(cod);
      const pendientes = Pagos.cuotasPendientes(al);

      if (!pendientes.length) {
        $("#pcuotas").innerHTML = `<p class="ok">Este alumno está solvente (saldo pendiente: ${fmtMoneda(0)}).</p>`;
        return;
      }

      $("#pcuotas").innerHTML = `
        <p><strong>Saldo pendiente total:</strong> ${fmtMoneda(Pagos.saldo(al))}</p>
        <table>
          <tr><th>Cobrar</th><th>Concepto</th><th>Vence</th><th>Monto</th></tr>
          ${pendientes
            .map(
              (c, i) =>
                `<tr>
                  <td><input type="checkbox" name="cuotaChk" value="${c.id}" data-monto="${c.monto}" ${i === 0 ? "checked" : ""}></td>
                  <td>${esc(c.label)}</td>
                  <td>${c.vence || "-"}</td>
                  <td>${fmtMoneda(c.monto)}</td>
                </tr>`
            )
            .join("")}
        </table>
        <p style="margin-top:.8rem"><strong>Total a cobrar ahora:</strong> <span id="ptot">${fmtMoneda(pendientes[0].monto)}</span></p>
        <button id="btnCobrar">Registrar pago</button> <span id="perr" class="er"></span>
      `;

      const actualizarTotal = () => {
        let suma = 0;
        document.querySelectorAll('input[name="cuotaChk"]:checked').forEach((chk) => {
          suma += Number(chk.dataset.monto || 0);
        });
        $("#ptot").textContent = fmtMoneda(suma);
      };

      document.querySelectorAll('input[name="cuotaChk"]').forEach((chk) => {
        chk.onchange = actualizarTotal;
      });

      $("#btnCobrar").onclick = async () => {
        const seleccionadas = Array.from(document.querySelectorAll('input[name="cuotaChk"]:checked')).map((c) => Number(c.value));
        if (!seleccionadas.length) {
          $("#perr").textContent = "Marca al menos una cuota.";
          return;
        }

        const btn = $("#btnCobrar");
        btn.disabled = true;
        $("#perr").textContent = "Guardando pago...";

        try {
          const pagosHechos = await Pagos.cobrar(seleccionadas, $("#pm").value, $("#pf").value);
          $("#perr").textContent = "";
          const totalCobrado = pagosHechos.reduce((s, p) => s + Number(p.monto || 0), 0);

          $("#prec").innerHTML = `<div class="card">
            <h3 style="margin-top:0">Recibo Oficial de Pago</h3>
            <p><strong>Alumno:</strong> ${esc(al.nombres + " " + al.apellidos)} (${al.codigo})</p>
            <p><strong>Fecha:</strong> ${$("#pf").value} | <strong>Método:</strong> ${esc($("#pm").value)}</p>
            <ul>${pagosHechos.map((p) => `<li>Recibo #${p.recibo} — ${esc(p.cuota ? p.cuota.label : "Cuota")}: <strong>${fmtMoneda(p.monto)}</strong></li>`).join("")}</ul>
            <p><strong>Total pagado:</strong> ${fmtMoneda(totalCobrado)} | <strong>Nuevo saldo:</strong> ${fmtMoneda(Pagos.saldo(Repo.porCodigo(cod)))}</p>
            <button class="s" onclick="print()">Imprimir recibo</button>
          </div>`;

          renderCuotas();
        } catch (err) {
          $("#perr").textContent = err.message || "Error al cobrar.";
        } finally {
          btn.disabled = false;
        }
      };
    };

    $("#pa").onchange = renderCuotas;
    renderCuotas();
  } catch (err) {
    console.error("Error en vista Pagos:", err);
    $("#pbox").innerHTML = `<p class="er">No se pudo cargar Pagos: ${esc(err.message)}</p>`;
  }
};