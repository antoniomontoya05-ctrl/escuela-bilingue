const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const asegurarGrado = async (gradoNum) => {
  const num = Number(gradoNum) || 1;
  let grado = await prisma.grado.findFirst({
    where: { OR: [{ numero: num }, { id: num }] }
  });
  if (!grado) {
    grado = await prisma.grado.create({
      data: { numero: num, nombre: `Grado ${num}` }
    });
  }
  return grado;
};

// GET /api/docente/datos — obtiene asistencias y notas guardadas en MySQL
const obtenerDatosDocente = async (req, res) => {
  try {
    const asistencias = await prisma.asistencia.findMany({
      include: {
        alumno: { select: { codigo: true } },
        grado: { select: { numero: true } }
      }
    });
    const notas = await prisma.nota.findMany({
      include: { alumno: { select: { codigo: true } } }
    });
    res.json({ asistencias, notas });
  } catch (error) {
    console.error('Error al obtener datos de docente:', error);
    res.status(500).json({ error: error.message || 'Error al obtener asistencias y notas.' });
  }
};

// POST /api/docente/asistencias — guarda o actualiza asistencia en MySQL
const guardarAsistencia = async (req, res) => {
  try {
    const { alumnoId, codigo, gradoId, fecha, estado } = req.body;

    let idAlumno = alumnoId ? Number(alumnoId) : null;
    if (!idAlumno && codigo) {
      const al = await prisma.alumno.findUnique({ where: { codigo: String(codigo) } });
      if (al) idAlumno = al.id;
    }

    if (!idAlumno || !fecha || !estado) {
      return res.status(400).json({ error: 'Faltan datos obligatorios (alumno, fecha o estado).' });
    }

    const gradoReg = await asegurarGrado(gradoId);
    const fechaStr = String(fecha).slice(0, 10);

    const registro = await prisma.asistencia.upsert({
      where: {
        alumnoId_fecha: {
          alumnoId: idAlumno,
          fecha: fechaStr
        }
      },
      update: {
        estado: String(estado),
        gradoId: gradoReg.id
      },
      create: {
        alumnoId: idAlumno,
        gradoId: gradoReg.id,
        fecha: fechaStr,
        estado: String(estado)
      }
    });

    res.json(registro);
  } catch (error) {
    console.error('Error al guardar asistencia:', error);
    res.status(500).json({ error: error.message || 'Error al guardar la asistencia.' });
  }
};

// POST /api/docente/notas — guarda o actualiza nota en MySQL
const guardarNota = async (req, res) => {
  try {
    const { alumnoId, codigo, materia, nota } = req.body;

    let idAlumno = alumnoId ? Number(alumnoId) : null;
    if (!idAlumno && codigo) {
      const al = await prisma.alumno.findUnique({ where: { codigo: String(codigo) } });
      if (al) idAlumno = al.id;
    }

    if (!idAlumno || !materia) {
      return res.status(400).json({ error: 'Faltan datos obligatorios (alumno o materia).' });
    }

    const valorNota = nota === '' || nota === null || nota === undefined ? null : Number(nota);

    const registro = await prisma.nota.upsert({
      where: {
        alumnoId_materia: {
          alumnoId: idAlumno,
          materia: String(materia)
        }
      },
      update: { nota: valorNota },
      create: {
        alumnoId: idAlumno,
        materia: String(materia),
        nota: valorNota
      }
    });

    res.json(registro);
  } catch (error) {
    console.error('Error al guardar nota:', error);
    res.status(500).json({ error: error.message || 'Error al guardar la nota.' });
  }
};

module.exports = {
  obtenerDatosDocente,
  guardarAsistencia,
  guardarNota
};