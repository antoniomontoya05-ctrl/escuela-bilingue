// CAPA 3 · PRESENTACIÓN — pantalla Configuración de aranceles por grado
V.cfg = async () => {
  $("#view").innerHTML = `<h2>Configuración de grados y aranceles</h2><p class="sub">Define los montos de matrícula y mensualidad en MySQL.</p><div id="cbox"><p class="sub">Cargando configuración...</p></div>`;

  try {
    await Repo.sincronizarTodo();
  } catch (err) {
    console.error("Error al cargar configuración:", err);
  }

  $("#cbox").innerHTML = `<div class="card">
    <div class="g">
      ${SEL("cg", "Grado", GOPT)}
      ${F("cmat", "Monto de matrícula (L)", "number", 'min="0" step="0.01"')}
      ${F("cpen", "Mensualidad / Pensión (L)", "number", 'min="0" step="0.01"')}
    </div>
    <button id="btnCfg">Guardar precios en BD</button> <span id="cmsg" class="ok"></span>
    <div id="cclases" style="margin-top:1rem"></div>
  </div>`;

  const cargarGrado = () => {
    const g = +$("#cg").value;
    const cfg = Repo.config(g);
    $("#cmat").value = Number(cfg.matricula || 0);
    $("#cpen").value = Number(cfg.pension || 0);
    const materias = Array.isArray(cfg.mat) ? cfg.mat : [];
    $("#cclases").innerHTML = materias.length
      ? `<p><strong>Materias del plan de estudio:</strong> ${materias.map(esc).join(", ")}</p>`
      : "";
  };

  $("#btnCfg").onclick = async () => {
    const btn = $("#btnCfg");
    btn.disabled = true;
    $("#cmsg").textContent = "Guardando...";
    try {
      await Repo.guardarConfiguracionBD(+$("#cg").value, +$("#cmat").value, +$("#cpen").value);
      $("#cmsg").textContent = "Precios guardados en MySQL.";
      setTimeout(() => {
        if ($("#cmsg")) $("#cmsg").textContent = "";
      }, 2500);
    } catch (err) {
      $("#cmsg").textContent = err.message;
    } finally {
      btn.disabled = false;
    }
  };

  $("#cg").onchange = cargarGrado;
  cargarGrado();
};