const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Listar todos los alumnos (incluyendo encargado y emergencia si existen)
const obtenerAlumnos = async (req, res) => {
  try {
    const alumnos = await prisma.alumno.findMany({
      include: {
        encargado: true,
        emergencia: true,
        matriculas: {
          include: { grado: true }
        }
      },
      orderBy: { id: 'asc' }
    });
    res.json(alumnos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los alumnos.' });
  }
};

// Obtener un alumno por ID
const obtenerAlumnoPorId = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'El ID del alumno no es válido.' });
    }

    const alumno = await prisma.alumno.findUnique({
      where: { id },
      include: {
        encargado: true,
        emergencia: true,
        matriculas: {
          include: { grado: true, cuotas: true }
        }
      }
    });

    if (!alumno) {
      return res.status(404).json({ error: 'Alumno no encontrado.' });
    }

    res.json(alumno);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al consultar el alumno.' });
  }
};

// Registrar un nuevo alumno
const crearAlumno = async (req, res) => {
  try {
    const {
      codigo,
      nombres,
      apellidos,
      nacimiento,
      sexo,
      identidad,
      direccion,
      salud,
      encargadoId,
      emergenciaId
    } = req.body || {};

    if (!codigo || !nombres || !apellidos || !nacimiento) {
      return res.status(400).json({
        error: 'Los campos codigo, nombres, apellidos y nacimiento son obligatorios.'
      });
    }

    const fechaNacimiento = new Date(nacimiento);
    if (Number.isNaN(fechaNacimiento.getTime())) {
      return res.status(400).json({ error: 'La fecha de nacimiento no es válida.' });
    }

    const codigoLimpio = String(codigo).trim();
    const existeCodigo = await prisma.alumno.findUnique({
      where: { codigo: codigoLimpio }
    });
    if (existeCodigo) {
      return res.status(400).json({ error: 'Ese código de alumno ya está registrado.' });
    }

    const nuevoAlumno = await prisma.alumno.create({
      data: {
        codigo: codigoLimpio,
        nombres: String(nombres).trim(),
        apellidos: String(apellidos).trim(),
        nacimiento: fechaNacimiento,
        sexo: sexo ? String(sexo).trim() : null,
        identidad: identidad ? String(identidad).trim() : null,
        direccion: direccion ? String(direccion).trim() : null,
        salud: salud ? String(salud).trim() : null,
        encargadoId: encargadoId ? Number(encargadoId) : null,
        emergenciaId: emergenciaId ? Number(emergenciaId) : null
      }
    });

    res.status(201).json({
      mensaje: 'Alumno registrado exitosamente',
      alumno: nuevoAlumno
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el alumno. Verifica los campos requeridos.' });
  }
};

// Actualizar un alumno
const actualizarAlumno = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'El ID del alumno no es válido.' });
    }

    const existe = await prisma.alumno.findUnique({ where: { id } });
    if (!existe) {
      return res.status(404).json({ error: 'Alumno no encontrado.' });
    }

    const {
      codigo,
      nombres,
      apellidos,
      nacimiento,
      sexo,
      identidad,
      direccion,
      salud,
      encargadoId,
      emergenciaId
    } = req.body || {};

    const dataActualizada = {};
    if (codigo !== undefined) dataActualizada.codigo = String(codigo).trim();
    if (nombres !== undefined) dataActualizada.nombres = String(nombres).trim();
    if (apellidos !== undefined) dataActualizada.apellidos = String(apellidos).trim();
    if (nacimiento !== undefined) {
      const fechaNacimiento = new Date(nacimiento);
      if (Number.isNaN(fechaNacimiento.getTime())) {
        return res.status(400).json({ error: 'La fecha de nacimiento no es válida.' });
      }
      dataActualizada.nacimiento = fechaNacimiento;
    }
    if (sexo !== undefined) dataActualizada.sexo = sexo ? String(sexo).trim() : null;
    if (identidad !== undefined) dataActualizada.identidad = identidad ? String(identidad).trim() : null;
    if (direccion !== undefined) dataActualizada.direccion = direccion ? String(direccion).trim() : null;
    if (salud !== undefined) dataActualizada.salud = salud ? String(salud).trim() : null;
    if (encargadoId !== undefined) dataActualizada.encargadoId = encargadoId ? Number(encargadoId) : null;
    if (emergenciaId !== undefined) dataActualizada.emergenciaId = emergenciaId ? Number(emergenciaId) : null;

    const alumnoActualizado = await prisma.alumno.update({
      where: { id },
      data: dataActualizada
    });

    res.json({
      mensaje: 'Alumno actualizado exitosamente',
      alumno: alumnoActualizado
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el alumno.' });
  }
};

// Eliminar un alumno
const eliminarAlumno = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'El ID del alumno no es válido.' });
    }

    const existe = await prisma.alumno.findUnique({ where: { id } });
    if (!existe) {
      return res.status(404).json({ error: 'Alumno no encontrado.' });
    }

    await prisma.alumno.delete({ where: { id } });
    res.json({ mensaje: 'Alumno eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el alumno.' });
  }
};

module.exports = {
  obtenerAlumnos,
  obtenerAlumnoPorId,
  crearAlumno,
  actualizarAlumno,
  eliminarAlumno
};