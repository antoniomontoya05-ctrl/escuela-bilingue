const { Router } = require('express');
const {
  obtenerCuotas,
  obtenerCuotaPorId,
  crearCuota,
  actualizarCuota,
  eliminarCuota
} = require('../controllers/cuota.controller');
const { verificarToken, esAdministrador } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/', verificarToken, obtenerCuotas);
router.get('/:id', verificarToken, obtenerCuotaPorId);
router.post('/', [verificarToken, esAdministrador], crearCuota);
router.put('/:id', [verificarToken, esAdministrador], actualizarCuota);
router.delete('/:id', [verificarToken, esAdministrador], eliminarCuota);

module.exports = router;