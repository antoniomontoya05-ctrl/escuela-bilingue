// CAPA 3 · PRESENTACIÓN — pantalla Alumnos
V.alu = async () => {
  $("#view").innerHTML = `<h2>Alumnos</h2><div class="card np">${F("q", "Buscar por código, nombre o identidad")}</div><div id="ls"><p class="sub">Cargando alumnos desde la base de datos...</p></div><div id="dt"></div>`;
  $("#q").oninput = listaAlumnos;

  try {
    await Promise.race([
      Repo.sincronizarTodo(),
      new Promise((_, rej) => setTimeout(() => rej(new Error("El servidor tardó demasiado en responder (revisa que node server.js esté activo).")), 6000))
    ]);
    listaAlumnos();
  } catch (err) {
    console.error("Error cargando alumnos:", err);
    $("#ls").innerHTML = `<p class="er">No se pudieron cargar los alumnos: ${esc(err.message)}</p>`;
  }
};

function listaAlumnos() {
  const r = Matriculas.buscar($("#q").value);
  $("#dt").innerHTML = "";
  $("#ls").innerHTML = r.length
    ? `<div class="card sc"><table><tr><th>Código</th><th>Nombre</th><th>Grado</th><th>Saldo</th><th></th></tr>${r.map((a) => `<tr><td>${a.codigo}</td><td>${esc(a.nombres + " " + a.apellidos)}</td><td>${gname(a.grado)}</td><td>${L(Pagos.saldo(a))}</td><td><button class="s" style="margin:0" onclick="$('#dt').innerHTML=ficha(Repo.porCodigo('${a.codigo}'))">Ver ficha</button></td></tr>`).join("")}</table></div>`
    : '<p class="sub">Todavía no hay alumnos matriculados.</p>';
}