// CAPA 2 · NEGOCIO — cifras para la pestaña Reportes
const Reportes = {
  resumen() {
    const A = Repo.alumnos();
    const deuda = (a) => Pagos.vencidas(a).reduce((s, c) => s + c.monto, 0);
    return {
      alumnos: A.length,
      cobrado: Repo.pagos().reduce((s, p) => s + p.monto, 0),
      porCobrar: A.reduce((s, a) => s + Pagos.saldo(a), 0),
      vencido: A.reduce((s, a) => s + deuda(a), 0),
      porGrado: Curriculo.GR.map((g) => ({ grado: g, total: A.filter((a) => a.grado === g).length })),
      morosos: A.filter((a) => Pagos.vencidas(a).length).map((a) => ({ a, cuotas: Pagos.vencidas(a).length, deuda: deuda(a) })),
    };
  },
};
