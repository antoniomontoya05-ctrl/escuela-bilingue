const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_super_seguro');
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
};

const esAdministrador = (req, res, next) => {
  const rol = (req.usuario?.rol || '').toLowerCase();
  if (rol !== 'admin' && rol !== 'administrador') {
    return res.status(403).json({ error: 'Acceso denegado: se requiere rol de administrador.' });
  }
  next();
};

module.exports = {
  verificarToken,
  esAdministrador
};