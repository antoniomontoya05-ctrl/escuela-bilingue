// CAPA 2 · NEGOCIO — cálculo de saldos y cobro de cuotas
const Pagos = {
  cuotasPendientes(alumno) {
    if (!alumno || !Array.isArray(alumno.cuotas)) return [];
    return alumno.cuotas.filter((c) => !c.pagada);
  },

  saldo(alumno) {
    return this.cuotasPendientes(alumno).reduce((acc, c) => acc + Number(c.monto || 0), 0);
  },

  async cobrar(cuotaIds, metodo, fecha) {
    return Repo.registrarPagosBD(cuotaIds, metodo, fecha);
  }
};