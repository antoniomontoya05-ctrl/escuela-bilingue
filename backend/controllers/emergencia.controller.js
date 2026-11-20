const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const obtenerEmergencias = async (req, res) => {
  try {
    const emergencias = await prisma.emergencia.findMany({
      include: { alumnos: true },
      orderBy: { id: 'desc' }
    });
    res.json(emergencias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los contactos de emergencia.' });
  }
};

const obtenerEmergenciaPorId = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'El ID del contacto de emergencia no es válido.' });
    }

    const emergencia = await prisma.emergencia.findUnique({
      where: { id },
      include: { alumnos: true }
    });

    if (!emergencia) {
      return res.status(404).json({ error: 'Contacto de emergencia no encontrado.' });
    }

    res.json(emergencia);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al consultar el contacto de emergencia.' });
  }
};

const crearEmergencia = async (req, res) => {
  try {
    const { nombre, telefono } = req.body || {};
    const nombreLimpio = typeof nombre === 'string' ? nombre.trim() : '';
    const telefonoLimpio = typeof telefono === 'string' ? telefono.trim() : '';

    if (!nombreLimpio || !telefonoLimpio) {
      return res.status(400).json({
        error: 'Los campos nombre y telefono son obligatorios.'
      });
    }

    const nuevaEmergencia = await prisma.emergencia.create({
      data: {
        nombre: nombreLimpio,
        telefono: telefonoLimpio
      }
    });

    res.status(201).json({
      mensaje: 'Contacto de emergencia registrado exitosamente',
      emergencia: nuevaEmergencia
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar el contacto de emergencia.' });
  }
};

const actualizarEmergencia = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'El ID del contacto de emergencia no es válido.' });
    }

    const existe = await prisma.emergencia.findUnique({ where: { id } });
    if (!existe) {
      return res.status(404).json({ error: 'Contacto de emergencia no encontrado.' });
    }

    const { nombre, telefono } = req.body || {};
    const dataActualizada = {};

    if (nombre !== undefined) {
      if (!String(nombre).trim()) {
        return res.status(400).json({ error: 'El nombre no puede estar vacío.' });
      }
      dataActualizada.nombre = String(nombre).trim();
    }
    if (telefono !== undefined) {
      if (!String(telefono).trim()) {
        return res.status(400).json({ error: 'El teléfono no puede estar vacío.' });
      }
      dataActualizada.telefono = String(telefono).trim();
    }

    const emergenciaActualizada = await prisma.emergencia.update({
      where: { id },
      data: dataActualizada
    });

    res.json({
      mensaje: 'Contacto de emergencia actualizado exitosamente',
      emergencia: emergenciaActualizada
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el contacto de emergencia.' });
  }
};

const eliminarEmergencia = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'El ID del contacto de emergencia no es válido.' });
    }

    const existe = await prisma.emergencia.findUnique({ where: { id } });
    if (!existe) {
      return res.status(404).json({ error: 'Contacto de emergencia no encontrado.' });
    }

    await prisma.emergencia.delete({ where: { id } });
    res.json({ mensaje: 'Contacto de emergencia eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el contacto de emergencia.' });
  }
};

module.exports = {
  obtenerEmergencias,
  obtenerEmergenciaPorId,
  crearEmergencia,
  actualizarEmergencia,
  eliminarEmergencia
};