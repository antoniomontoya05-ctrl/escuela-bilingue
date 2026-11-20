// CAPA 1 · DATOS — catálogo de grados, clases y cuotas iniciales
const Curriculo = (() => {
  const GR = [1, 2, 3, 4, 5, 6, 7, 8];
  const ORD = ["", "Primer", "Segundo", "Tercer", "Cuarto", "Quinto", "Sexto", "Séptimo", "Octavo"];
  const MESES = ["Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre"];
  const BASE = ["Español", "Matemáticas", "Ciencias Naturales", "Estudios Sociales", "English Language Arts", "Educación Artística", "Educación Física"];
  // 7.º y 8.º siguen el plan de tercer ciclo orientado a lo bilingüe (Acuerdo 0441-SE-2025)
  const ALTO = ["Español", "Inglés: oratoria y comprensión", "Inglés: lectura y escritura", "Inglés: gramática", "Matemáticas",
    "Ciencias Biológicas y Físicas", "Ciencias de la Tierra", "Estudios Sociales", "Educación Cívica Morazánica",
    "Educación Artística", "Educación Física", "Tecnología e Inteligencia Artificial"];
  const materias = (g) => (g <= 3 ? [...BASE] : g <= 6 ? [...BASE, "Informática"] : [...ALTO]);
  return {
    GR, MESES, materias,
    nombreGrado: (g) => ORD[g] + " grado",
    configInicial: () => Object.fromEntries(GR.map((g) => [g, { mat: materias(g), matricula: 1500, pension: 1200 }])), // precios de ejemplo
  };
})();
