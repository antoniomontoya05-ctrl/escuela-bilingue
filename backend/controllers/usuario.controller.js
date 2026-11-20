const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Obtener todos los usuarios (excluyendo la contraseña)
const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: { rol: true },
      orderBy: { id: 'asc' }
    });

    const usuariosSinPassword = usuarios.map(({ password, ...resto }) => resto);
    res.json(usuariosSinPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los usuarios.' });
  }
};

// Actualizar un usuario
const actualizarUsuario = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'El ID del usuario no es válido.' });
    }

    const existe = await prisma.usuario.findUnique({ where: { id } });
    if (!existe) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const { nombre, email, rolId, password } = req.body || {};
    const datosAActualizar = {};

    if (nombre !== undefined) {
      const nombreLimpio = String(nombre).trim();
      if (!nombreLimpio) {
        return res.status(400).json({ error: 'El nombre no puede estar vacío.' });
      }
      datosAActualizar.nombre = nombreLimpio;
    }

    if (email !== undefined) {
      const emailLimpio = String(email).trim().toLowerCase();
      if (!emailLimpio || !emailLimpio.includes('@')) {
        return res.status(400).json({ error: 'Debe indicar un correo electrónico válido.' });
      }
      const emailEnUso = await prisma.usuario.findFirst({
        where: { email: emailLimpio, NOT: { id } }
      });
      if (emailEnUso) {
        return res.status(400).json({ error: 'Ese correo electrónico ya está registrado.' });
      }
      datosAActualizar.email = emailLimpio;
    }

    if (rolId !== undefined) {
      const rolNum = Number(rolId);
      if (!Number.isInteger(rolNum) || rolNum <= 0) {
        return res.status(400).json({ error: 'El rolId indicado no es válido.' });
      }
      const rolExiste = await prisma.rol.findUnique({ where: { id: rolNum } });
      if (!rolExiste) {
        return res.status(404).json({ error: 'El rol indicado no existe.' });
      }
      datosAActualizar.rolId = rolNum;
    }

    if (password !== undefined && password !== '') {
      if (String(password).length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
      }
      const salt = await bcrypt.genSalt(10);
      datosAActualizar.password = await bcrypt.hash(String(password), salt);
    }

    const usuarioActualizado = await prisma.usuario.update({
      where: { id },
      data: datosAActualizar,
      include: { rol: true }
    });

    const { password: _, ...usuarioSinPassword } = usuarioActualizado;
    res.json({ mensaje: 'Usuario actualizado exitosamente', usuario: usuarioSinPassword });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el usuario.' });
  }
};

// Eliminar un usuario
const eliminarUsuario = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'El ID del usuario no es válido.' });
    }

    const existe = await prisma.usuario.findUnique({ where: { id } });
    if (!existe) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    await prisma.usuario.delete({ where: { id } });
    res.json({ mensaje: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el usuario.' });
  }
};

module.exports = {
  obtenerUsuarios,
  actualizarUsuario,
  eliminarUsuario
};