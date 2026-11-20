// CAPA 2 · NEGOCIO — autenticación contra el backend Express + JWT
const API_URL = "http://localhost:4000/api";

const Auth = {
  pestanas: {
    S: [
      ["mat", "Matricular"],
      ["alu", "Alumnos"],
      ["pag", "Pagos"],
      ["rep", "Reportes"],
      ["cfg", "Configuración"]
    ],
    D: [["doc", "Mi grado"]]
  },

  async login(email, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: (email || "").trim(),
        password: password || ""
      })
    });

    const data = await res.json();
    if (!res.ok || !data.token) {
      return null;
    }

    localStorage.setItem("eb_token", data.token);

    const rolTexto = String(
      data.rol ||
      data.role ||
      data.usuario?.rol?.nombre ||
      data.usuario?.rol ||
      ""
    ).toLowerCase();

    const rolId = Number(data.rolId || data.usuario?.rolId || 0);
    const esDocente = rolTexto.includes("docente") || rolTexto === "d" || rolId === 2;

    const usuario = {
      nombre: data.nombre || data.usuario?.nombre || email,
      email,
      rol: esDocente ? "D" : "S",
      token: data.token
    };

    localStorage.setItem("eb_usuario", JSON.stringify(usuario));
    return usuario;
  },

  token() {
    return localStorage.getItem("eb_token") || "";
  },

  logout() {
    localStorage.removeItem("eb_token");
    localStorage.removeItem("eb_usuario");
  }
};