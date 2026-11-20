// CAPA 2 · NEGOCIO — matrículas y búsqueda de alumnos
const Matriculas = {
  matricular(datos) {
    const cfg = Repo.config(datos.grado) || { mat: [], matricula: 1500, pension: 1200 };
    const codigo = Repo.nuevoCodigo();
    const a = {
      ...datos,
      codigo,
      clases: cfg.mat || [],
      cuotas: []
    };

    Repo.registrarMatriculaCompleta(
      {
        ...datos,
        codigo,
        montoMatricula: cfg.matricula,
        montoPension: cfg.pension
      },
      a
    );

    return a;
  },

  buscar(q) {
    const t = (q || "").trim().toLowerCase();
    const lista = Repo.alumnos();
    if (!t) return lista;
    return lista.filter(
      (a) =>
        (a.codigo || "").toLowerCase().includes(t) ||
        `${a.nombres} ${a.apellidos}`.toLowerCase().includes(t) ||
        (a.identidad || "").toLowerCase().includes(t)
    );
  }
};