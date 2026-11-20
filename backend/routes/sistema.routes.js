const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const {
  obtenerEstado,
  registrarMatriculaCompleta,
  registrarPagos,
  guardarConfiguracion
} = require('../controllers/sistema.controller');

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

router.get('/estado', verificarToken, obtenerEstado);
router.post('/matricular', verificarToken, registrarMatriculaCompleta);
router.post('/pagos', verificarToken, registrarPagos);
router.put('/configuracion', verificarToken, guardarConfiguracion);

module.exports = router;