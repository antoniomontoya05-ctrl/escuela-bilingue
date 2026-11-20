const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Registrar usuario
const registrar = async (req, res) => {
  try {
    const { nombre, email, password, rolId } = req.body;

    // Verificar si el usuario ya existe
    const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
    }

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear el usuario
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre,
        email,
        password: hashedPassword,
        rolId: rolId || 2 // Por defecto rol 2 (Docente u otro)
      },
      include: { rol: true }
    });

    // Ocultar contraseña en la respuesta
    const { password: _, ...usuarioSinPassword } = nuevoUsuario;
    res.status(201).json(usuarioSinPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar el usuario.' });
  }
};

// Iniciar sesión
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario y su rol
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: { rol: true }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Credenciales inválidas (usuario no encontrado).' });
    }

    // Validar contraseña
    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({ error: 'Credenciales inválidas (contraseña incorrecta).' });
    }

    // Generar Token JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol.nombre },
      process.env.JWT_SECRET || 'clave_secreta_por_defecto',
      { expiresIn: '8h' }
    );

    const { password: _, ...usuarioSinPassword } = usuario;
    res.json({
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: usuarioSinPassword
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar sesión.' });
  }
};

module.exports = {
  registrar,
  login
};