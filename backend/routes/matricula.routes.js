const { Router } = require('express');
const {
  obtenerMatriculas,
  obtenerMatriculaPorId,
  crearMatricula,
  actualizarMatricula,
  eliminarMatricula
} = require('../controllers/matricula.controller');
const { verificarToken, esAdministrador } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/', verificarToken, obtenerMatriculas);
router.get('/:id', verificarToken, obtenerMatriculaPorId);
router.post('/', [verificarToken, esAdministrador], crearMatricula);
router.put('/:id', [verificarToken, esAdministrador], actualizarMatricula);
router.delete('/:id', [verificarToken, esAdministrador], eliminarMatricula);

module.exports = router;