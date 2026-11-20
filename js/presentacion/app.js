// CAPA 3 · PRESENTACIÓN — inicio de sesión, persistencia y navegación
let usuarioActual;

function iniciarInterfazUsuario(u) {
  usuarioActual = u;
  $("#login").hidden = true;
  $("#app").hidden = false;
  $("#who").textContent = u.nombre || u.email || "Usuario";

  if (!$("#btnSalir")) {
    const btnSalir = document.createElement("button");
    btnSalir.id = "btnSalir";
    btnSalir.className = "s";
    btnSalir.style.marginLeft = "10px";
    btnSalir.textContent = "Salir";
    btnSalir.onclick = () => {
      Auth.logout();
      usuarioActual = null;
      $("#app").hidden = true;
      $("#login").hidden = false;
      $("#p").value = "";
    };
    $("#who").parentElement.appendChild(btnSalir);
  }

  go(Auth.pestanas[u.rol][0][0]);
}

$("#bt").onclick = async () => {
  $("#err").textContent = "";
  const bt = $("#bt");
  bt.disabled = true;

  try {
    const u = await Auth.login($("#u").value, $("#p").value);
    if (!u || !u.rol || !Auth.pestanas[u.rol]) {
      $("#err").textContent = "Usuario o contraseña incorrectos.";
      return;
    }
    iniciarInterfazUsuario(u);
  } catch (e) {
    console.error("Error en login:", e);
    $("#err").textContent = "No se pudo conectar con el servidor.";
  } finally {
    bt.disabled = false;
  }
};

function go(t, arg) {
  if (!usuarioActual || !Auth.pestanas[usuarioActual.rol]) return;
  $("#tabs").innerHTML = Auth.pestanas[usuarioActual.rol]
    .map((x) => `<button class="${x[0] == t ? "on" : "s"}" onclick="go('${x[0]}')">${x[1]}</button>`)
    .join("");
  if (typeof V !== "undefined" && typeof V[t] === "function") {
    V[t](arg);
  }
  window.scrollTo(0, 0);
}

// Restaurar sesión automáticamente si ya estaba logueado al recargar (F5)
(() => {
  try {
    const guardado = JSON.parse(localStorage.getItem("eb_usuario") || "null");
    const token = localStorage.getItem("eb_token");
    if (guardado && token && Auth.pestanas[guardado.rol]) {
      iniciarInterfazUsuario(guardado);
    }
  } catch (e) {}
})();