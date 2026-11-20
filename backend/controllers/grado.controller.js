const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Listar todos los grados con sus secciones y configuración
const obtenerGrados = async (req, res) => {
  try {
    const grados = await prisma.grado.findMany({
      include: {
        secciones: true,
        configuraciones: true
      },
      orderBy: { numero: 'asc' }
    });
    res.json(grados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los grados.' });
  }
};

// Obtener un grado por ID
const obtenerGradoPorId = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'El ID del grado no es válido.' });
    }

    const grado = await prisma.grado.findUnique({
      where: { id },
      include: {
        secciones: true,
        configuraciones: true
      }
    });

    if (!grado) {
      return res.status(404).json({ error: 'Grado no encontrado.' });
    }

    res.json(grado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al consultar el grado.' });
  }
};

// Crear un nuevo grado
const crearGrado = async (req, res) => {
  try {
    const { numero, nombre } = req.body || {};
    const numeroGrado = Number(numero);
    const nombreLimpio = typeof nombre === 'string' ? nombre.trim() : '';

    if (!Number.isInteger(numeroGrado) || numeroGrado <= 0) {
      return res.status(400).json({ error: 'Debe indicar un número de grado válido.' });
    }
    if (!nombreLimpio) {
      return res.status(400).json({ error: 'Debe indicar el nombre del grado.' });
    }

    const existeNumero = await prisma.grado.findUnique({
      where: { numero: numeroGrado }
    });
    if (existeNumero) {
      return res.status(400).json({ error: 'Ya existe un grado con ese número.' });
    }

    const nuevoGrado = await prisma.grado.create({
      data: {
        numero: numeroGrado,
        nombre: nombreLimpio
      }
    });

    res.status(201).json({
      mensaje: 'Grado creado exitosamente',
      grado: nuevoGrado
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el grado.' });
  }
};

// Actualizar un grado
const actualizarGrado = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'El ID del grado no es válido.' });
    }

    const existe = await prisma.grado.findUnique({ where: { id } });
    if (!existe) {
      return res.status(404).json({ error: 'Grado no encontrado.' });
    }

    const { numero, nombre } = req.body || {};
    const dataActualizada = {};

    if (numero !== undefined) {
      const numeroGrado = Number(numero);
      if (!Number.isInteger(numeroGrado) || numeroGrado <= 0) {
        return res.status(400).json({ error: 'El número de grado indicado no es válido.' });
      }
      dataActualizada.numero = numeroGrado;
    }

    if (nombre !== undefined) {
      const nombreLimpio = String(nombre).trim();
      if (!nombreLimpio) {
        return res.status(400).json({ error: 'El nombre del grado no puede estar vacío.' });
      }
      dataActualizada.nombre = nombreLimpio;
    }

    const gradoActualizado = await prisma.grado.update({
      where: { id },
      data: dataActualizada
    });

    res.json({
      mensaje: 'Grado actualizado exitosamente',
      grado: gradoActualizado
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el grado.' });
  }
};

// Eliminar un grado
const eliminarGrado = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'El ID del grado no es válido.' });
    }

    const existe = await prisma.grado.findUnique({ where: { id } });
    if (!existe) {
      return res.status(404).json({ error: 'Grado no encontrado.' });
    }

    await prisma.grado.delete({ where: { id } });
    res.json({ mensaje: 'Grado eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el grado (verifica si tiene matrículas asociadas).' });
  }
};

module.exports = {
  obtenerGrados,
  obtenerGradoPorId,
  crearGrado,
  actualizarGrado,
  eliminarGrado
};