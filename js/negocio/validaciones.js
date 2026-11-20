// CAPA 2 · NEGOCIO — reglas de validación de la matrícula
const Validaciones = {
  edad: (nac) => (Date.now() - new Date(nac)) / 31557600000,
  matricula(d) {
    if (!d.nombres || !d.apellidos || !d.nac || !d.identidad || !d.direccion || !d.enc.nombre || !d.enc.identidad || !d.emerg.nombre)
      throw Error("Completa todos los campos obligatorios.");
    if (!/^\d{8}$/.test(d.enc.tel) || !/^\d{8}$/.test(d.emerg.tel)) throw Error("Los teléfonos deben tener 8 dígitos, sin guiones.");
    const e = this.edad(d.nac);
    if (!(e >= 3 && e <= 17)) throw Error("Revisa la fecha de nacimiento: la edad debe estar entre 3 y 17 años.");
    const dup = Repo.porIdentidad(d.identidad);
    if (dup) throw Error(`Este niño ya está registrado con el código ${dup.codigo}.`);
  },
  // Devuelve un aviso (no un error) si la edad no es la usual para el grado
  aviso(d) {
    const e = this.edad(d.nac);
    return Math.abs(e - (d.grado + 5)) > 3 ? `El niño tiene ${Math.floor(e)} años, algo poco común para ${Curriculo.nombreGrado(d.grado)}. ¿Continuar?` : null;
  },
};
