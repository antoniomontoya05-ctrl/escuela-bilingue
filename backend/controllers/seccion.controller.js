const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const obtenerSecciones = async (req, res) => {
  try {
    const { gradoId } = req.query;
    const where = gradoId ? { gradoId: Number(gradoId) } : {};

    const secciones = await prisma.seccion.findMany({
      where,
      include: { grado: true },
      orderBy: { id: 'asc' }
    });
    res.json(secciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las secciones.' });
  }
};

const obtenerSeccionPorId = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'El ID de la sección no es válido.' });
    }

    const seccion = await prisma.seccion.findUnique({
      where: { id },
      include: { grado: true }
    });

    if (!seccion) {
      return res.status(404).json({ error: 'Sección no encontrada.' });
    }

    res.json(seccion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al consultar la sección.' });
  }
};

const crearSeccion = async (req, res) => {
  try {
    const { gradoId, nombre } = req.body || {};
    const gradoNum = Number(gradoId);
    const nombreLimpio = typeof nombre === 'string' ? nombre.trim() : '';

    if (!Number.isInteger(gradoNum) || gradoNum <= 0) {
      return res.status(400).json({ error: 'Debe indicar un gradoId válido.' });
    }
    if (!nombreLimpio) {
      return res.status(400).json({ error: 'Debe indicar el nombre de la sección.' });
    }

    const gradoExiste = await prisma.grado.findUnique({
      where: { id: gradoNum }
    });
    if (!gradoExiste) {
      return res.status(404).json({ error: 'El grado indicado no existe.' });
    }

    const nuevaSeccion = await prisma.seccion.create({
      data: {
        gradoId: gradoNum,
        nombre: nombreLimpio
      },
      include: { grado: true }
    });

    res.status(201).json({
      mensaje: 'Sección creada exitosamente',
      seccion: nuevaSeccion
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la sección.' });
  }
};

const actualizarSeccion = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'El ID de la sección no es válido.' });
    }

    const existe = await prisma.seccion.findUnique({ where: { id } });
    if (!existe) {
      return res.status(404).json({ error: 'Sección no encontrada.' });
    }

    const { gradoId, nombre } = req.body || {};
    const dataActualizada = {};

    if (gradoId !== undefined) {
      const gradoNum = Number(gradoId);
      if (!Number.isInteger(gradoNum) || gradoNum <= 0) {
        return res.status(400).json({ error: 'El gradoId indicado no es válido.' });
      }
      const gradoExiste = await prisma.grado.findUnique({ where: { id: gradoNum } });
      if (!gradoExiste) {
        return res.status(404).json({ error: 'El grado indicado no existe.' });
      }
      dataActualizada.gradoId = gradoNum;
    }

    if (nombre !== undefined) {
      const nombreLimpio = String(nombre).trim();
      if (!nombreLimpio) {
        return res.status(400).json({ error: 'El nombre de la sección no puede estar vacío.' });
      }
      dataActualizada.nombre = nombreLimpio;
    }

    const seccionActualizada = await prisma.seccion.update({
      where: { id },
      data: dataActualizada,
      include: { grado: true }
    });

    res.json({
      mensaje: 'Sección actualizada exitosamente',
      seccion: seccionActualizada
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la sección.' });
  }
};

const eliminarSeccion = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'El ID de la sección no es válido.' });
    }

    const existe = await prisma.seccion.findUnique({ where: { id } });
    if (!existe) {
      return res.status(404).json({ error: 'Sección no encontrada.' });
    }

    await prisma.seccion.delete({ where: { id } });
    res.json({ mensaje: 'Sección eliminada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la sección.' });
  }
};

module.exports = {
  obtenerSecciones,
  obtenerSeccionPorId,
  crearSeccion,
  actualizarSeccion,
  eliminarSeccion
};