const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const obtenerConfiguraciones = async (req, res) => {
  try {
    const configuraciones = await prisma.configuracion.findMany({
      include: { grado: true },
      orderBy: { id: 'asc' }
    });
    res.json(configuraciones);
  } catch (error) {
    console.error('Error en obtenerConfiguraciones:', error);
    res.status(500).json({ error: error.message || 'Error al obtener la configuración.' });
  }
};

const obtenerConfiguracionPorGrado = async (req, res) => {
  try {
    const gradoId = Number(req.params.gradoId);
    if (!Number.isInteger(gradoId) || gradoId <= 0) {
      return res.status(400).json({ error: 'gradoId inválido.' });
    }

    const config = await prisma.configuracion.findUnique({
      where: { gradoId },
      include: { grado: true }
    });

    if (!config) {
      return res.status(404).json({ error: 'Configuración no encontrada para ese grado.' });
    }

    res.json(config);
  } catch (error) {
    console.error('Error en obtenerConfiguracionPorGrado:', error);
    res.status(500).json({ error: error.message || 'Error al consultar la configuración.' });
  }
};

const guardarConfiguracion = async (req, res) => {
  try {
    const gradoId = Number(req.body.gradoId);
    const matricula = req.body.matricula !== undefined ? Number(req.body.matricula) : 0;
    const pension = req.body.pension !== undefined ? Number(req.body.pension) : 0;

    if (!Number.isInteger(gradoId) || gradoId <= 0) {
      return res.status(400).json({ error: 'Debes enviar un gradoId válido.' });
    }
    if (!Number.isFinite(matricula) || !Number.isFinite(pension) || matricula < 0 || pension < 0) {
      return res.status(400).json({ error: 'matricula y pension deben ser valores numéricos mayores o iguales a 0.' });
    }

    const gradoExiste = await prisma.grado.findUnique({
      where: { id: gradoId }
    });
    if (!gradoExiste) {
      return res.status(404).json({ error: 'El grado indicado no existe.' });
    }

    const configGuardada = await prisma.configuracion.upsert({
      where: { gradoId },
      update: { matricula, pension },
      create: { gradoId, matricula, pension },
      include: { grado: true }
    });

    res.status(201).json({
      mensaje: 'Configuración guardada exitosamente',
      configuracion: configGuardada
    });
  } catch (error) {
    console.error('Error en guardarConfiguracion:', error);
    res.status(500).json({ error: error.message || 'Error al guardar la configuración.' });
  }
};

module.exports = {
  obtenerConfiguraciones,
  obtenerConfiguracionPorGrado,
  guardarConfiguracion
};