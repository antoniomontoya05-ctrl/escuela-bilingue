const { Router } = require('express');
const {
  obtenerPagos,
  obtenerPagoPorId,
  crearPago,
  eliminarPago
} = require('../controllers/pago.controller');
const { verificarToken, esAdministrador } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/', verificarToken, obtenerPagos);
router.get('/:id', verificarToken, obtenerPagoPorId);
router.post('/', [verificarToken, esAdministrador], crearPago);
router.delete('/:id', [verificarToken, esAdministrador], eliminarPago);

module.exports = router;