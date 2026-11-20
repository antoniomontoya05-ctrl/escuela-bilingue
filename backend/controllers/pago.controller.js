const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Listar todos los pagos
const obtenerPagos = async (req, res) => {
  try {
    const pagos = await prisma.pago.findMany({
      include: {
        cuota: {
          include: {
            matricula: {
              include: { alumno: true, grado: true }
            }
          }
        },
        usuario: {
          select: { id: true, nombre: true, email: true }
        }
      },
      orderBy: { id: 'desc' }
    });

    res.json(pagos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los pagos.' });
  }
};

// Obtener un pago por ID
const obtenerPagoPorId = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'El ID de pago no es válido.' });
    }

    const pago = await prisma.pago.findUnique({
      where: { id },
      include: {
        cuota: {
          include: {
            matricula: {
              include: { alumno: true, grado: true }
            }
          }
        },
        usuario: {
          select: { id: true, nombre: true, email: true }
        }
      }
    });

    if (!pago) {
      return res.status(404).json({ error: 'Pago no encontrado.' });
    }

    res.json(pago);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al consultar el pago.' });
  }
};

// Registrar un pago para una cuota
const crearPago = async (req, res) => {
  try {
    const recibo = Number(req.body.recibo);
    const cuotaId = Number(req.body.cuotaId);
    const monto = Number(req.body.monto);
    const metodo = typeof req.body.metodo === 'string' ? req.body.metodo.trim() : '';
    const { fecha } = req.body;

    if (!Number.isInteger(recibo) || recibo <= 0) {
      return res.status(400).json({ error: 'Debe indicar un número de recibo válido.' });
    }

    if (!Number.isInteger(cuotaId) || cuotaId <= 0) {
      return res.status(400).json({ error: 'Debe indicar un cuotaId válido.' });
    }

    if (!Number.isFinite(monto) || monto <= 0) {
      return res.status(400).json({ error: 'El monto debe ser un número mayor a cero.' });
    }

    if (!metodo) {
      return res.status(400).json({ error: 'Debe indicar el método de pago.' });
    }

    const cuotaExiste = await prisma.cuota.findUnique({
      where: { id: cuotaId },
      include: { pago: true }
    });
    if (!cuotaExiste) {
      return res.status(404).json({ error: 'La cuota indicada no existe.' });
    }
    if (cuotaExiste.pago) {
      return res.status(400).json({ error: 'Esta cuota ya tiene un pago registrado.' });
    }

    const montoCuota = Number(cuotaExiste.monto);
    if (monto !== montoCuota) {
      return res.status(400).json({
        error: `El monto del pago (${monto}) debe coincidir con el monto de la cuota (${montoCuota}).`
      });
    }

    const reciboExiste = await prisma.pago.findUnique({
      where: { recibo }
    });
    if (reciboExiste) {
      return res.status(400).json({ error: 'Ese número de recibo ya está registrado.' });
    }

    const usuarioId = req.usuario?.id ? Number(req.usuario.id) : null;

    const nuevoPago = await prisma.pago.create({
      data: {
        recibo,
        cuotaId,
        monto,
        metodo,
        fecha: fecha ? new Date(fecha) : new Date(),
        usuarioId
      },
      include: {
        cuota: true,
        usuario: {
          select: { id: true, nombre: true, email: true }
        }
      }
    });

    res.status(201).json({
      mensaje: 'Pago registrado exitosamente',
      pago: nuevoPago
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar el pago.' });
  }
};

// Eliminar un pago
const eliminarPago = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'El ID de pago no es válido.' });
    }

    const existe = await prisma.pago.findUnique({ where: { id } });
    if (!existe) {
      return res.status(404).json({ error: 'Pago no encontrado.' });
    }

    await prisma.pago.delete({ where: { id } });
    res.json({ mensaje: 'Pago eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el pago.' });
  }
};

module.exports = {
  obtenerPagos,
  obtenerPagoPorId,
  crearPago,
  eliminarPago
};