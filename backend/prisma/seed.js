const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando carga de datos iniciales (seed)...');

  // 1. Roles del sistema
  const rolAdmin = await prisma.rol.upsert({
    where: { nombre: 'Admin' },
    update: {},
    create: { nombre: 'Admin' }
  });

  const rolDocente = await prisma.rol.upsert({
    where: { nombre: 'Docente' },
    update: {},
    create: { nombre: 'Docente' }
  });

  // 2. Usuarios por defecto (contraseña: 123456)
  const passwordHash = await bcrypt.hash('123456', 10);

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@escuela.com' },
    update: { password: passwordHash, rolId: rolAdmin.id, nombre: 'Secretaría General' },
    create: {
      nombre: 'Secretaría General',
      email: 'admin@escuela.com',
      password: passwordHash,
      rolId: rolAdmin.id
    }
  });

  const docenteUser = await prisma.usuario.upsert({
    where: { email: 'docente@escuela.com' },
    update: { password: passwordHash, rolId: rolDocente.id, nombre: 'Prof. María López' },
    create: {
      nombre: 'Prof. María López',
      email: 'docente@escuela.com',
      password: passwordHash,
      rolId: rolDocente.id
    }
  });

  // Perfil de Docente
  const docenteExiste = await prisma.docente.findFirst({ where: { usuarioId: docenteUser.id } });
  if (!docenteExiste) {
    await prisma.docente.create({
      data: {
        usuarioId: docenteUser.id,
        especialidad: 'Educación Básica Bilingüe'
      }
    });
  }

  // 3. Grados (1° a 11°), Secciones y Configuración de Aranceles
  const nombresGrados = [
    '1° Grado', '2° Grado', '3° Grado', '4° Grado', '5° Grado', '6° Grado',
    '7° Grado', '8° Grado', '9° Grado', '10° Bachillerato', '11° Bachillerato'
  ];

  const gradosCreados = {};
  for (let i = 1; i <= 11; i++) {
    const grado = await prisma.grado.upsert({
      where: { numero: i },
      update: { nombre: nombresGrados[i - 1] },
      create: { numero: i, nombre: nombresGrados[i - 1] }
    });
    gradosCreados[i] = grado;

    const secExiste = await prisma.seccion.findFirst({
      where: { gradoId: grado.id, nombre: 'A' }
    });
    if (!secExiste) {
      await prisma.seccion.create({
        data: { gradoId: grado.id, nombre: 'A' }
      });
    }

    const matriculaMonto = i <= 6 ? 1800 : 2200;
    const pensionMonto = i <= 6 ? 1400 : 1750;

    await prisma.configuracion.upsert({
      where: { gradoId: grado.id },
      update: { matricula: matriculaMonto, pension: pensionMonto },
      create: {
        gradoId: grado.id,
        matricula: matriculaMonto,
        pension: pensionMonto
      }
    });
  }

  // 4. Alumnos de prueba con Encargado, Emergencia, Matrícula, Cuotas y un Pago
  const anioActual = new Date().getFullYear();
  const meses = [
    'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre'
  ];

  const alumnosDemo = [
    {
      codigo: 'ALU001',
      nombres: 'Carlos Eduardo',
      apellidos: 'Mejía Hernández',
      nacimiento: new Date('2017-05-14T00:00:00.000Z'),
      sexo: 'M',
      identidad: '0801-2017-04512',
      direccion: 'Col. Kennedy, Tegucigalpa',
      salud: 'Ninguna',
      gradoNum: 3,
      encargado: {
        nombre: 'Ana Patricia Hernández',
        parentesco: 'Madre',
        identidad: '0801-1990-11234',
        telefono: '98765432',
        correo: 'ana.hernandez@correo.com'
      },
      emergencia: { nombre: 'Roberto Mejía', telefono: '99887766' },
      pagarMatricula: true
    },
    {
      codigo: 'ALU002',
      nombres: 'Sofía Valentina',
      apellidos: 'Castro Valladares',
      nacimiento: new Date('2018-09-22T00:00:00.000Z'),
      sexo: 'F',
      identidad: '0801-2018-08921',
      direccion: 'Res. Las Uvas, Tegucigalpa',
      salud: 'Alergia leve al polvo',
      gradoNum: 2,
      encargado: {
        nombre: 'Luis Fernando Castro',
        parentesco: 'Padre',
        identidad: '0801-1988-05431',
        telefono: '97654321',
        correo: 'luis.castro@correo.com'
      },
      emergencia: { nombre: 'Marta Valladares', telefono: '96543210' },
      pagarMatricula: false
    }
  ];

  for (const item of alumnosDemo) {
    let alumno = await prisma.alumno.findUnique({ where: { codigo: item.codigo } });
    if (!alumno) {
      const enc = await prisma.encargado.create({ data: item.encargado });
      const emg = await prisma.emergencia.create({ data: item.emergencia });

      alumno = await prisma.alumno.create({
        data: {
          codigo: item.codigo,
          nombres: item.nombres,
          apellidos: item.apellidos,
          nacimiento: item.nacimiento,
          sexo: item.sexo,
          identidad: item.identidad,
          direccion: item.direccion,
          salud: item.salud,
          encargadoId: enc.id,
          emergenciaId: emg.id
        }
      });

      const grado = gradosCreados[item.gradoNum];
      const matMonto = item.gradoNum <= 6 ? 1800 : 2200;
      const penMonto = item.gradoNum <= 6 ? 1400 : 1750;

      const matricula = await prisma.matricula.create({
        data: {
          alumnoId: alumno.id,
          gradoId: grado.id,
          anio: anioActual,
          cuotas: {
            create: [
              {
                label: `Matrícula ${anioActual}`,
                monto: matMonto,
                vence: new Date(`${anioActual}-02-01T00:00:00.000Z`)
              },
              ...meses.map((mes, idx) => ({
                label: `Mensualidad ${mes}`,
                monto: penMonto,
                vence: new Date(Date.UTC(anioActual, idx + 1, 10))
              }))
            ]
          }
        },
        include: { cuotas: { orderBy: { id: 'asc' } } }
      });

      if (item.pagarMatricula && matricula.cuotas.length > 0) {
        const primeraCuota = matricula.cuotas[0];
        await prisma.pago.create({
          data: {
            recibo: 1001,
            cuotaId: primeraCuota.id,
            monto: primeraCuota.monto,
            metodo: 'Efectivo',
            fecha: new Date(),
            usuarioId: admin.id
          }
        });
      }

      // Asistencia y nota inicial de muestra
      const hoyStr = new Date().toISOString().slice(0, 10);
      await prisma.asistencia.upsert({
        where: { alumnoId_fecha: { alumnoId: alumno.id, fecha: hoyStr } },
        update: {},
        create: {
          alumnoId: alumno.id,
          gradoId: grado.id,
          fecha: hoyStr,
          estado: 'Presente'
        }
      });

      await prisma.nota.upsert({
        where: { alumnoId_materia: { alumnoId: alumno.id, materia: 'Matemáticas' } },
        update: {},
        create: {
          alumnoId: alumno.id,
          materia: 'Matemáticas',
          nota: 92
        }
      });
    }
  }

  console.log('Seed completado con éxito.');
}

main()
  .catch((e) => {
    console.error('Error ejecutando seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });