const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Listar todas las matrículas con datos del alumno, grado y cuotas
const obtenerMatriculas = async (req, res) => {
  try {
    const matriculas = await prisma.matricula.findMany({
      include: {
        alumno: true,
        grado: true,
        cuotas: true
      },
      orderBy: { id: 'desc' }
    });
    res.json(matriculas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las matrículas.' });
  }
};

// Obtener una matrícula por ID
const obtenerMatriculaPorId = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'El ID de matrícula no es válido.' });
    }

    const matricula = await prisma.matricula.findUnique({
      where: { id },
      include: {
        alumno: true,
        grado: true,
        cuotas: {
          include: { pago: true }
        }
      }
    });

    if (!matricula) {
      return res.status(404).json({ error: 'Matrícula no encontrada.' });
    }

    res.json(matricula);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al consultar la matrícula.' });
  }
};

// Registrar una nueva matrícula y generar su cuota base de matrícula si hay configuración
const crearMatricula = async (req, res) => {
  try {
    const alumnoId = Number(req.body.alumnoId);
    const gradoId = Number(req.body.gradoId);
    const anio = Number(req.body.anio);

    if (!Number.isInteger(alumnoId) || alumnoId <= 0 || !Number.isInteger(gradoId) || gradoId <= 0) {
      return res.status(400).json({ error: 'Debe indicar alumnoId y gradoId válidos.' });
    }

    if (!Number.isInteger(anio) || anio < 2000 || anio > 2100) {
      return res.status(400).json({ error: 'Debe indicar un año (anio) válido.' });
    }

    const alumnoExiste = await prisma.alumno.findUnique({ where: { id: alumnoId } });
    if (!alumnoExiste) {
      return res.status(404).json({ error: 'El alumno indicado no existe.' });
    }

    const gradoExiste = await prisma.grado.findUnique({ where: { id: gradoId } });
    if (!gradoExiste) {
      return res.status(404).json({ error: 'El grado indicado no existe.' });
    }

    const matriculaDuplicada = await prisma.matricula.findFirst({
      where: { alumnoId, gradoId, anio }
    });
    if (matriculaDuplicada) {
      return res.status(400).json({
        error: 'El alumno ya cuenta con una matrícula registrada para este grado y año.'
      });
    }

    const configGrado = await prisma.configuracion.findUnique({
      where: { gradoId }
    });

    const resultado = await prisma.$transaction(async (tx) => {
      const nuevaMatricula = await tx.matricula.create({
        data: {
          alumnoId,
          gradoId,
          anio
        },
        include: {
          alumno: true,
          grado: true
        }
      });

      let cuotaCreada = null;
      if (configGrado && Number(configGrado.matricula) > 0) {
        cuotaCreada = await tx.cuota.create({
          data: {
            matriculaId: nuevaMatricula.id,
            label: `Matricula ${anio}`,
            monto: configGrado.matricula,
            vence: new Date(`${anio}-02-15T00:00:00.000Z`)
          }
        });
      }

      return { nuevaMatricula, cuotaCreada };
    });

    res.status(201).json({
      mensaje: 'Matrícula registrada exitosamente',
      matricula: resultado.nuevaMatricula,
      cuotaGenerada: resultado.cuotaCreada
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar la matrícula.' });
  }
};

// Actualizar año o grado de una matrícula
const actualizarMatricula = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'El ID de matrícula no es válido.' });
    }

    const existe = await prisma.matricula.findUnique({ where: { id } });
    if (!existe) {
      return res.status(404).json({ error: 'Matrícula no encontrada.' });
    }

    const dataActualizada = {};
    if (req.body.gradoId !== undefined) {
      const gradoId = Number(req.body.gradoId);
      if (!Number.isInteger(gradoId) || gradoId <= 0) {
        return res.status(400).json({ error: 'El gradoId indicado no es válido.' });
      }
      const gradoExiste = await prisma.grado.findUnique({ where: { id: gradoId } });
      if (!gradoExiste) {
        return res.status(404).json({ error: 'El grado indicado no existe.' });
      }
      dataActualizada.gradoId = gradoId;
    }

    if (req.body.anio !== undefined) {
      const anio = Number(req.body.anio);
      if (!Number.isInteger(anio) || anio < 2000 || anio > 2100) {
        return res.status(400).json({ error: 'El año (anio) indicado no es válido.' });
      }
      dataActualizada.anio = anio;
    }

    const matriculaActualizada = await prisma.matricula.update({
      where: { id },
      data: dataActualizada,
      include: {
        alumno: true,
        grado: true
      }
    });

    res.json({
      mensaje: 'Matrícula actualizada exitosamente',
      matricula: matriculaActualizada
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la matrícula.' });
  }
};

// Eliminar una matrícula
const eliminarMatricula = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'El ID de matrícula no es válido.' });
    }

    const existe = await prisma.matricula.findUnique({ where: { id } });
    if (!existe) {
      return res.status(404).json({ error: 'Matrícula no encontrada.' });
    }

    await prisma.matricula.delete({ where: { id } });
    res.json({ mensaje: 'Matrícula eliminada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la matrícula.' });
  }
};

module.exports = {
  obtenerMatriculas,
  obtenerMatriculaPorId,
  crearMatricula,
  actualizarMatricula,
  eliminarMatricula
};