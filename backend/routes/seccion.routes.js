const { Router } = require('express');
const {
  obtenerSecciones,
  obtenerSeccionPorId,
  crearSeccion,
  actualizarSeccion,
  eliminarSeccion
} = require('../controllers/seccion.controller');
const { verificarToken, esAdministrador } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/', verificarToken, obtenerSecciones);
router.get('/:id', verificarToken, obtenerSeccionPorId);
router.post('/', [verificarToken, esAdministrador], crearSeccion);
router.put('/:id', [verificarToken, esAdministrador], actualizarSeccion);
router.delete('/:id', [verificarToken, esAdministrador], eliminarSeccion);

module.exports = router;