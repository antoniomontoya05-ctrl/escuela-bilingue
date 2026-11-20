const { Router } = require('express');
const {
  obtenerGrados,
  obtenerGradoPorId,
  crearGrado,
  actualizarGrado,
  eliminarGrado
} = require('../controllers/grado.controller');
const { verificarToken, esAdministrador } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/', verificarToken, obtenerGrados);
router.get('/:id', verificarToken, obtenerGradoPorId);
router.post('/', [verificarToken, esAdministrador], crearGrado);
router.put('/:id', [verificarToken, esAdministrador], actualizarGrado);
router.delete('/:id', [verificarToken, esAdministrador], eliminarGrado);

module.exports = router;