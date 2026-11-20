const { Router } = require('express');
const {
  obtenerConfiguraciones,
  obtenerConfiguracionPorGrado,
  guardarConfiguracion
} = require('../controllers/configuracion.controller');
const { verificarToken, esAdministrador } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/', verificarToken, obtenerConfiguraciones);
router.get('/grado/:gradoId', verificarToken, obtenerConfiguracionPorGrado);
router.post('/', [verificarToken, esAdministrador], guardarConfiguracion);

module.exports = router;