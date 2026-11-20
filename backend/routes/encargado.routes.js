const { Router } = require('express');
const {
  obtenerEncargados,
  obtenerEncargadoPorId,
  crearEncargado,
  actualizarEncargado,
  eliminarEncargado
} = require('../controllers/encargado.controller');
const { verificarToken, esAdministrador } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/', verificarToken, obtenerEncargados);
router.get('/:id', verificarToken, obtenerEncargadoPorId);
router.post('/', [verificarToken, esAdministrador], crearEncargado);
router.put('/:id', [verificarToken, esAdministrador], actualizarEncargado);
router.delete('/:id', [verificarToken, esAdministrador], eliminarEncargado);

module.exports = router;