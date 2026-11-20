const { Router } = require('express');
const {
  obtenerEmergencias,
  obtenerEmergenciaPorId,
  crearEmergencia,
  actualizarEmergencia,
  eliminarEmergencia
} = require('../controllers/emergencia.controller');
const { verificarToken, esAdministrador } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/', verificarToken, obtenerEmergencias);
router.get('/:id', verificarToken, obtenerEmergenciaPorId);
router.post('/', [verificarToken, esAdministrador], crearEmergencia);
router.put('/:id', [verificarToken, esAdministrador], actualizarEmergencia);
router.delete('/:id', [verificarToken, esAdministrador], eliminarEmergencia);

module.exports = router;