const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // 1. Roles iniciales
  const adminRol = await prisma.rol.upsert({
    where: { nombre: 'Administrador' },
    update: {},
    create: { nombre: 'Administrador' }
  });

  const docenteRol = await prisma.rol.upsert({
    where: { nombre: 'Docente' },
    update: {},
    create: { nombre: 'Docente' }
  });

  // 2. Usuario administrador inicial
  const passwordHash = await bcrypt.hash('123456', 10);
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@escuela.com' },
    update: {},
    create: {
      nombre: 'Administrador',
      email: 'admin@escuela.com',
      password: passwordHash,
      rolId: adminRol.id
    }
  });

  // 3. Grados
  const grado1 = await prisma.grado.upsert({
    where: { numero: 1 },
    update: {},
    create: {
      numero: 1,
      nombre: 'Primer Grado Bilingue'
    }
  });

  const grado2 = await prisma.grado.upsert({
    where: { numero: 2 },
    update: {},
    create: {
      numero: 2,
      nombre: 'Segundo Grado Bilingue'
    }
  });

  // 4. Configuración de matrícula y pensión por grado
  await prisma.configuracion.upsert({
    where: { gradoId: grado1.id },
    update: { matricula: 3000, pension: 2200 },
    create: { gradoId: grado1.id, matricula: 3000, pension: 2200 }
  });

  await prisma.configuracion.upsert({
    where: { gradoId: grado2.id },
    update: { matricula: 3200, pension: 2400 },
    create: { gradoId: grado2.id, matricula: 3200, pension: 2400 }
  });

  // 5. Encargado y contacto de emergencia
  let encargado = await prisma.encargado.findFirst({
    where: { identidad: '0801199001122' }
  });
  if (!encargado) {
    encargado = await prisma.encargado.create({
      data: {
        nombre: 'Marta Castellanos',
        parentesco: 'Madre',
        identidad: '0801199001122',
        telefono: '99887766',
        correo: 'marta.castellanos@ejemplo.com'
      }
    });
  }

  let emergencia = await prisma.emergencia.findFirst({
    where: { telefono: '99112233' }
  });
  if (!emergencia) {
    emergencia = await prisma.emergencia.create({
      data: {
        nombre: 'Roberto Castellanos',
        telefono: '99112233'
      }
    });
  }

  // 6. Alumno base
  const alumno1 = await prisma.alumno.upsert({
    where: { codigo: 'ALU001' },
    update: {},
    create: {
      codigo: 'ALU001',
      nombres: 'Sofia',
      apellidos: 'Castellanos',
      nacimiento: new Date('2016-05-14T00:00:00.000Z'),
      sexo: 'F',
      identidad: '0801201601234',
      direccion: 'Col. Palmira, Tegucigalpa',
      salud: 'Ninguna alergia conocida',
      encargadoId: encargado.id,
      emergenciaId: emergencia.id
    }
  });

  console.log({
    adminRol,
    docenteRol,
    adminId: admin.id,
    grado1Id: grado1.id,
    grado2Id: grado2.id,
    alumno1Id: alumno1.id
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });