// CAPA 3 · PRESENTACIÓN — pantalla del docente: asistencia y notas
V.doc = async () => {
  const fechaHoy = typeof hoy === "function" ? hoy() : new Date().toISOString().slice(0, 10);
  const gradosOpt =
    typeof GOPT !== "undefined"
      ? GOPT
      : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
          .map((g) => `<option value="${g}">Grado ${g}</option>`)
          .join("");

  $("#view").innerHTML = `<h2>Mi grado</h2><p class="sub">Pasa asistencia y registra notas de tu grado. <span id="dstatus" class="ok"></span></p><div class="card np"><div class="g">${SEL("dg", "Grado", gradosOpt)}${F("df", "Fecha", "date", `value="${fechaHoy}"`)}${SEL("dm", "Clase para las notas", "")}</div></div><div id="dl"><p class="sub">Cargando alumnos...</p></div>`;

  const avisar = (txt, esError = false) => {
    const el = $("#dstatus");
    if (!el) return;
    el.className = esError ? "er" : "ok";
    el.textContent = txt;
    setTimeout(() => {
      if ($("#dstatus")) $("#dstatus").textContent = "";
    }, 2500);
  };

  const dibujar = () => {
    const g = +$("#dg").value;
    const f = $("#df").value;
    const m = $("#dm").value;
    const A = Docente.alumnos(g);
    const as = Docente.asistencia(f, g);

    $("#dl").innerHTML = A.length
      ? `<div class="card sc"><table><tr><th>Código</th><th>Alumno</th><th>Salud</th><th>Teléfono</th><th>Asistencia</th><th>Nota (0-100)</th></tr>${A.map((a) => `<tr><td>${a.codigo}</td><td>${esc(a.nombres + " " + a.apellidos)}</td><td>${esc(a.salud || "Ninguna")}</td><td>${esc((a.enc && a.enc.tel) || "-")}</td><td><select data-a="${a.codigo}"><option ${as[a.codigo] != "Ausente" ? "selected" : ""}>Presente</option><option ${as[a.codigo] == "Ausente" ? "selected" : ""}>Ausente</option></select></td><td><input type="number" min="0" max="100" data-n="${a.codigo}" value="${Docente.nota(a.codigo, m)}"></td></tr>`).join("")}</table></div>`
      : '<p class="sub">No hay alumnos matriculados en este grado.</p>';

    document.querySelectorAll("[data-a]").forEach((e) => {
      e.onchange = async () => {
        try {
          await Docente.marcar(f, g, e.dataset.a, e.value);
          avisar("Asistencia guardada");
        } catch (err) {
          avisar("Error al guardar asistencia", true);
        }
      };
    });

    document.querySelectorAll("[data-n]").forEach((e) => {
      e.onchange = async () => {
        try {
          e.value = await Docente.guardarNota(e.dataset.n, m, e.value);
          avisar("Nota guardada");
        } catch (err) {
          avisar("Error al guardar nota", true);
        }
      };
    });
  };

  const clases = () => {
    const lista = Docente.clases(+$("#dg").value);
    const materias =
      lista && lista.length
        ? lista
        : ["Matemáticas", "Español", "Inglés", "Ciencias Naturales", "Estudios Sociales"];
    $("#dm").innerHTML = materias.map((x) => `<option value="${esc(x)}">${esc(x)}</option>`).join("");
    dibujar();
  };

  $("#dg").onchange = clases;
  $("#df").onchange = dibujar;
  $("#dm").onchange = dibujar;

  try {
    await Promise.race([
      Docente.cargarDatos(),
      new Promise((_, rej) =>
        setTimeout(() => rej(new Error("El servidor tardó demasiado en responder.")), 6000)
      )
    ]);
    clases();
  } catch (err) {
    console.error("Error al cargar alumnos en docente:", err);
    $("#dl").innerHTML = `<p class="er">No se pudo cargar Mi grado: ${esc(err.message)}</p>`;
  }
};