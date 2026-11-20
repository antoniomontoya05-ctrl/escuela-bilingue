const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const {
  obtenerDatosDocente,
  guardarAsistencia,
  guardarNota
} = require('../controllers/docente.controller');

const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Token no proporcionado.' });

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta_por_defecto');
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
};

router.get('/datos', verificarToken, obtenerDatosDocente);
router.post('/asistencias', verificarToken, guardarAsistencia);
router.post('/notas', verificarToken, guardarNota);

module.exports = router;