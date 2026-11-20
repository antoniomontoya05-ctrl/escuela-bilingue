// CAPA 2 · NEGOCIO — asistencia y notas conectadas a MySQL vía /api/docente
const Docente = {
  BASE: "http://localhost:4000/api/docente",

  headers() {
    const token = localStorage.getItem("eb_token") || "";
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  },

  async cargarDatos() {
    await Repo.sincronizarTodo();
    const res = await fetch(`${this.BASE}/datos`, { headers: this.headers() });
    if (!res.ok) return;

    const { asistencias = [], notas = [] } = await res.json();

    asistencias.forEach((item) => {
      if (item.alumno && item.alumno.codigo) {
        const gNum = item.grado && item.grado.numero ? item.grado.numero : item.gradoId;
        Repo.asistencia(item.fecha + "|" + gNum)[item.alumno.codigo] = item.estado;
      }
    });

    notas.forEach((item) => {
      if (item.alumno && item.alumno.codigo) {
        Repo.notas(item.alumno.codigo)[item.materia] =
          item.nota === null || item.nota === undefined ? "" : Number(item.nota);
      }
    });

    Repo.guardar();
  },

  alumnos: (grado) => Repo.alumnos().filter((a) => Number(a.grado) === Number(grado)),

  clases: (grado) => {
    const cfg = Repo.config(grado);
    return cfg && Array.isArray(cfg.mat) ? cfg.mat : [];
  },

  asistencia: (fecha, grado) => Repo.asistencia(fecha + "|" + grado),

  async marcar(fecha, grado, codigo, estado) {
    const alumno = Repo.porCodigo(codigo);
    const res = await fetch(`${this.BASE}/asistencias`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({
        alumnoId: alumno ? alumno.id : undefined,
        codigo,
        gradoId: Number(grado),
        fecha,
        estado
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Error HTTP ${res.status}`);
    }

    Repo.asistencia(fecha + "|" + grado)[codigo] = estado;
    Repo.guardar();
  },

  nota: (codigo, materia) => Repo.notas(codigo)[materia] ?? "",

  async guardarNota(codigo, materia, valor) {
    const n = valor === "" ? "" : Math.min(100, Math.max(0, Number(valor)));
    const alumno = Repo.porCodigo(codigo);

    const res = await fetch(`${this.BASE}/notas`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({
        alumnoId: alumno ? alumno.id : undefined,
        codigo,
        materia,
        nota: n === "" ? null : n
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Error HTTP ${res.status}`);
    }

    Repo.notas(codigo)[materia] = n;
    Repo.guardar();
    return n;
  }
};