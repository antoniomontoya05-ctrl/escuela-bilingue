const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const limpiarTel = (tel) => String(tel || '').replace(/\D/g, '').slice(0, 8) || '00000000';

const asegurarGrado = async (tx, gradoNum) => {
  const num = Number(gradoNum) || 1;
  let grado = await tx.grado.findFirst({
    where: { OR: [{ numero: num }, { id: num }] }
  });
  if (!grado) {
    grado = await tx.grado.create({
      data: { numero: num, nombre: `Grado ${num}` }
    });
  }
  return grado;
};

// GET /api/sistema/estado — trae alumnos, matrículas, cuotas, pagos y configuraciones
const obtenerEstado = async (req, res) => {
  try {
    const alumnos = await prisma.alumno.findMany({
      orderBy: { id: 'asc' },
      include: {
        encargado: true,
        emergencia: true,
        matriculas: {
          orderBy: { id: 'desc' },
          include: {
            grado: true,
            cuotas: {
              orderBy: { id: 'asc' },
              include: { pago: true }
            }
          }
        }
      }
    });

    const configuraciones = await prisma.configuracion.findMany({
      include: { grado: true }
    });

    const pagos = await prisma.pago.findMany({
      orderBy: { recibo: 'desc' },
      include: {
        cuota: {
          include: {
            matricula: {
              include: { alumno: true, grado: true }
            }
          }
        }
      }
    });

    res.json({ alumnos, configuraciones, pagos });
  } catch (error) {
    console.error('Error al obtener estado del sistema:', error);
    res.status(500).json({ error: error.message || 'Error al cargar datos desde MySQL.' });
  }
};

// POST /api/sistema/matricular — guarda Encargado, Emergencia, Alumno, Matrícula y Cuotas
const registrarMatriculaCompleta = async (req, res) => {
  try {
    const d = req.body;
    if (!d.nombres || !d.apellidos || !(d.nacimiento || d.nac)) {
      return res.status(400).json({ error: 'Faltan datos obligatorios del alumno.' });
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const grado = await asegurarGrado(tx, d.grado);
      const anio = Number(d.anio) || new Date().getFullYear();

      const cfg = await tx.configuracion.findUnique({ where: { gradoId: grado.id } });
      const montoMatricula = cfg ? Number(cfg.matricula) : Number(d.montoMatricula || 1500);
      const montoPension = cfg ? Number(cfg.pension) : Number(d.montoPension || 1200);

      let encargadoId = null;
      if (d.enc && d.enc.nombre) {
        const enc = await tx.encargado.create({
          data: {
            nombre: String(d.enc.nombre).slice(0, 80),
            parentesco: String(d.enc.parentesco || 'Madre').slice(0, 20),
            identidad: String(d.enc.identidad || '').slice(0, 20),
            telefono: limpiarTel(d.enc.tel),
            correo: d.enc.correo ? String(d.enc.correo).slice(0, 80) : null
          }
        });
        encargadoId = enc.id;
      }

      let emergenciaId = null;
      if (d.emerg && d.emerg.nombre) {
        const emg = await tx.emergencia.create({
          data: {
            nombre: String(d.emerg.nombre).slice(0, 80),
            telefono: limpiarTel(d.emerg.tel)
          }
        });
        emergenciaId = emg.id;
      }

      let codigo = String(d.codigo || '').slice(0, 10);
      if (!codigo || (await tx.alumno.findUnique({ where: { codigo } }))) {
        const total = await tx.alumno.count();
        let seq = total + 1;
        codigo = 'ALU' + String(seq).padStart(3, '0');
        while (await tx.alumno.findUnique({ where: { codigo } })) {
          seq++;
          codigo = 'ALU' + String(seq).padStart(3, '0');
        }
      }

      const fechaNac = new Date(`${String(d.nacimiento || d.nac).slice(0, 10)}T00:00:00.000Z`);

      const alumno = await tx.alumno.create({
        data: {
          codigo,
          nombres: String(d.nombres).slice(0, 80),
          apellidos: String(d.apellidos).slice(0, 80),
          nacimiento: fechaNac,
          sexo: String(d.sexo || 'M').toUpperCase().startsWith('F') ? 'F' : 'M',
          identidad: String(d.identidad || '').slice(0, 20),
          direccion: String(d.direccion || '').slice(0, 120),
          salud: String(d.salud || 'Ninguna').slice(0, 120),
          encargadoId,
          emergenciaId
        }
      });

      const meses = [
        'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre'
      ];

      const cuotasData = [
        {
          label: `Matrícula ${anio}`,
          monto: montoMatricula,
          vence: new Date(`${anio}-02-01T00:00:00.000Z`)
        },
        ...meses.map((mes, idx) => ({
          label: `Mensualidad ${mes}`,
          monto: montoPension,
          vence: new Date(Date.UTC(anio, idx + 1, 10))
        }))
      ];

      await tx.matricula.create({
        data: {
          alumnoId: alumno.id,
          gradoId: grado.id,
          anio,
          cuotas: { create: cuotasData }
        }
      });

      return tx.alumno.findUnique({
        where: { id: alumno.id },
        include: {
          encargado: true,
          emergencia: true,
          matriculas: {
            orderBy: { id: 'desc' },
            include: {
              grado: true,
              cuotas: { orderBy: { id: 'asc' }, include: { pago: true } }
            }
          }
        }
      });
    });

    res.status(201).json({ alumno: resultado });
  } catch (error) {
    console.error('Error en matrícula completa:', error);
    res.status(500).json({ error: error.message || 'No se pudo registrar la matrícula en MySQL.' });
  }
};

// POST /api/sistema/pagos — registra el pago de una o varias cuotas
const registrarPagos = async (req, res) => {
  try {
    const { cuotaIds, metodo, fecha } = req.body;
    if (!Array.isArray(cuotaIds) || cuotaIds.length === 0) {
      return res.status(400).json({ error: 'Selecciona al menos una cuota para cobrar.' });
    }

    const pagosCreados = await prisma.$transaction(async (tx) => {
      const ultimo = await tx.pago.findFirst({ orderBy: { recibo: 'desc' } });
      let siguienteRecibo = (ultimo ? ultimo.recibo : 0) + 1;
      const fechaPago = fecha ? new Date(`${String(fecha).slice(0, 10)}T00:00:00.000Z`) : new Date();

      const creados = [];
      for (const idRaw of cuotaIds) {
        const cuotaId = Number(idRaw);
        const cuota = await tx.cuota.findUnique({
          where: { id: cuotaId },
          include: { pago: true }
        });
        if (!cuota || cuota.pago) continue;

        const pago = await tx.pago.create({
          data: {
            recibo: siguienteRecibo++,
            cuotaId: cuota.id,
            monto: cuota.monto,
            metodo: String(metodo || 'Efectivo').slice(0, 20),
            fecha: fechaPago,
            usuarioId: req.usuario && req.usuario.id ? Number(req.usuario.id) : null
          },
          include: {
            cuota: {
              include: {
                matricula: { include: { alumno: true, grado: true } }
              }
            }
          }
        });
        creados.push(pago);
      }
      return creados;
    });

    res.status(201).json({ pagos: pagosCreados });
  } catch (error) {
    console.error('Error al registrar pagos:', error);
    res.status(500).json({ error: error.message || 'No se pudo registrar el pago en MySQL.' });
  }
};

// PUT /api/sistema/configuracion — actualiza matrícula y pensión de un grado
const guardarConfiguracion = async (req, res) => {
  try {
    const { grado, matricula, pension } = req.body;
    const gradoReg = await prisma.$transaction((tx) => asegurarGrado(tx, grado));

    const cfg = await prisma.configuracion.upsert({
      where: { gradoId: gradoReg.id },
      update: {
        matricula: Number(matricula) || 0,
        pension: Number(pension) || 0
      },
      create: {
        gradoId: gradoReg.id,
        matricula: Number(matricula) || 0,
        pension: Number(pension) || 0
      },
      include: { grado: true }
    });

    res.json({ configuracion: cfg });
  } catch (error) {
    console.error('Error al guardar configuración:', error);
    res.status(500).json({ error: error.message || 'No se pudo guardar la configuración en MySQL.' });
  }
};

module.exports = {
  obtenerEstado,
  registrarMatriculaCompleta,
  registrarPagos,
  guardarConfiguracion
};