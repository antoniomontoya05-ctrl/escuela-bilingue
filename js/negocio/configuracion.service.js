// CAPA 2 · NEGOCIO — clases y precios por grado
const Configuracion = {
  obtener: (g) => Repo.config(g),
  guardar(g, clasesTexto, matricula, pension) {
    const mat = clasesTexto.split("\n").map((x) => x.trim()).filter(Boolean);
    if (!mat.length || !(pension > 0)) throw Error("Escribe al menos una clase y una mensualidad mayor que 0.");
    Repo.guardarConfig(g, { mat, matricula: matricula || 0, pension });
  },
};
