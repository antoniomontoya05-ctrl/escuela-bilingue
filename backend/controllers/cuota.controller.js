const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Listar todas las cuotas (opcionalmente filtradas por matriculaId)
const obtenerCuotas = async (req, res) => {
  try {
    const { matriculaId } = req.query;
    const where = matriculaId ? { matriculaId: Number(matriculaId) } : {};

    const cuotas = await prisma.cuota.findMany({
      where,
      include: {
        matricula: {
          include: { alumno: true, grado: true }
        },
        pago: true
      },
      orderBy: { id: 'asc' }
    });

    res.json(cuotas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las cuotas.' });
  }
};

// Obtener una cuota por ID
const obtenerCuotaPorId = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'El ID de la cuota no es válido.' });
    }

    const cuota = await prisma.cuota.findUnique({
      where: { id },
      include: {
        matricula: {
          include: { alumno: true, grado: true }
        },
        pago: true
      }
    });

    if (!cuota) {
      return res.status(404).json({ error: 'Cuota no encontrada.' });
    }

    res.json(cuota);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al consultar la cuota.' });
  }
};

// Crear una nueva cuota para una matrícula
const crearCuota = async (req, res) => {
  try {
    const { matriculaId, label, monto, vence } = req.body || {};
    const matriculaNum = Number(matriculaId);
    const montoNum = Number(monto);
    const labelLimpio = typeof label === 'string' ? label.trim() : '';

    if (!Number.isInteger(matriculaNum) || matriculaNum <= 0) {
      return res.status(400).json({ error: 'Debe indicar un matriculaId válido.' });
    }
    if (!labelLimpio) {
      return res.status(400).json({ error: 'Debe indicar la etiqueta (label) de la cuota.' });
    }
    if (!Number.isFinite(montoNum) || montoNum <= 0) {
      return res.status(400).json({ error: 'El monto debe ser mayor a cero.' });
    }

    const fechaVence = new Date(vence);
    if (!vence || Number.isNaN(fechaVence.getTime())) {
      return res.status(400).json({ error: 'Debe indicar una fecha de vencimiento (vence) válida.' });
    }

    const matriculaExiste = await prisma.matricula.findUnique({
      where: { id: matriculaNum }
    });
    if (!matriculaExiste) {
      return res.status(404).json({ error: 'La matrícula indicada no existe.' });
    }

    const nuevaCuota = await prisma.cuota.create({
      data: {
        matriculaId: matriculaNum,
        label: labelLimpio,
        monto: montoNum,
        vence: fechaVence
      },
      include: {
        matricula: true,
        pago: true
      }
    });

    res.status(201).json({
      mensaje: 'Cuota creada exitosamente',
      cuota: nuevaCuota
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la cuota.' });
  }
};

// Actualizar una cuota
const actualizarCuota = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'El ID de la cuota no es válido.' });
    }

    const existe = await prisma.cuota.findUnique({ where: { id } });
    if (!existe) {
      return res.status(404).json({ error: 'Cuota no encontrada.' });
    }

    const { label, monto, vence } = req.body || {};
    const dataActualizada = {};

    if (label !== undefined) {
      if (!String(label).trim()) {
        return res.status(400).json({ error: 'La etiqueta (label) no puede estar vacía.' });
      }
      dataActualizada.label = String(label).trim();
    }

    if (monto !== undefined) {
      const montoNum = Number(monto);
      if (!Number.isFinite(montoNum) || montoNum <= 0) {
        return res.status(400).json({ error: 'El monto debe ser mayor a cero.' });
      }
      dataActualizada.monto = montoNum;
    }

    if (vence !== undefined) {
      const fechaVence = new Date(vence);
      if (Number.isNaN(fechaVence.getTime())) {
        return res.status(400).json({ error: 'La fecha de vencimiento (vence) no es válida.' });
      }
      dataActualizada.vence = fechaVence;
    }

    const cuotaActualizada = await prisma.cuota.update({
      where: { id },
      data: dataActualizada,
      include: { pago: true }
    });

    res.json({
      mensaje: 'Cuota actualizada exitosamente',
      cuota: cuotaActualizada
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la cuota.' });
  }
};

// Eliminar una cuota
const eliminarCuota = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'El ID de la cuota no es válido.' });
    }

    const existe = await prisma.cuota.findUnique({ where: { id } });
    if (!existe) {
      return res.status(404).json({ error: 'Cuota no encontrada.' });
    }

    await prisma.cuota.delete({ where: { id } });
    res.json({ mensaje: 'Cuota eliminada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la cuota.' });
  }
};

module.exports = {
  obtenerCuotas,
  obtenerCuotaPorId,
  crearCuota,
  actualizarCuota,
  eliminarCuota
};