const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const obtenerEncargados = async (req, res) => {
  try {
    const encargados = await prisma.encargado.findMany({
      include: { alumnos: true },
      orderBy: { id: 'desc' }
    });
    res.json(encargados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los encargados.' });
  }
};

const obtenerEncargadoPorId = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'El ID del encargado no es válido.' });
    }

    const encargado = await prisma.encargado.findUnique({
      where: { id },
      include: { alumnos: true }
    });

    if (!encargado) {
      return res.status(404).json({ error: 'Encargado no encontrado.' });
    }

    res.json(encargado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al consultar el encargado.' });
  }
};

const crearEncargado = async (req, res) => {
  try {
    const { nombre, parentesco, identidad, telefono, correo } = req.body || {};
    const nombreLimpio = typeof nombre === 'string' ? nombre.trim() : '';
    const telefonoLimpio = typeof telefono === 'string' ? telefono.trim() : '';

    if (!nombreLimpio || !telefonoLimpio) {
      return res.status(400).json({
        error: 'Los campos nombre y telefono son obligatorios.'
      });
    }

    const nuevoEncargado = await prisma.encargado.create({
      data: {
        nombre: nombreLimpio,
        parentesco: parentesco ? String(parentesco).trim() : null,
        identidad: identidad ? String(identidad).trim() : null,
        telefono: telefonoLimpio,
        correo: correo ? String(correo).trim() : null
      }
    });

    res.status(201).json({
      mensaje: 'Encargado registrado exitosamente',
      encargado: nuevoEncargado
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar el encargado.' });
  }
};

const actualizarEncargado = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'El ID del encargado no es válido.' });
    }

    const existe = await prisma.encargado.findUnique({ where: { id } });
    if (!existe) {
      return res.status(404).json({ error: 'Encargado no encontrado.' });
    }

    const { nombre, parentesco, identidad, telefono, correo } = req.body || {};
    const dataActualizada = {};

    if (nombre !== undefined) {
      if (!String(nombre).trim()) {
        return res.status(400).json({ error: 'El nombre no puede estar vacío.' });
      }
      dataActualizada.nombre = String(nombre).trim();
    }
    if (parentesco !== undefined) dataActualizada.parentesco = parentesco ? String(parentesco).trim() : null;
    if (identidad !== undefined) dataActualizada.identidad = identidad ? String(identidad).trim() : null;
    if (telefono !== undefined) {
      if (!String(telefono).trim()) {
        return res.status(400).json({ error: 'El teléfono no puede estar vacío.' });
      }
      dataActualizada.telefono = String(telefono).trim();
    }
    if (correo !== undefined) dataActualizada.correo = correo ? String(correo).trim() : null;

    const encargadoActualizado = await prisma.encargado.update({
      where: { id },
      data: dataActualizada
    });

    res.json({
      mensaje: 'Encargado actualizado exitosamente',
      encargado: encargadoActualizado
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el encargado.' });
  }
};

const eliminarEncargado = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'El ID del encargado no es válido.' });
    }

    const existe = await prisma.encargado.findUnique({ where: { id } });
    if (!existe) {
      return res.status(404).json({ error: 'Encargado no encontrado.' });
    }

    await prisma.encargado.delete({ where: { id } });
    res.json({ mensaje: 'Encargado eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el encargado.' });
  }
};

module.exports = {
  obtenerEncargados,
  obtenerEncargadoPorId,
  crearEncargado,
  actualizarEncargado,
  eliminarEncargado
};