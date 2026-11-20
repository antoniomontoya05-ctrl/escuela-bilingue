const { Router } = require('express');
const {
  obtenerAlumnos,
  obtenerAlumnoPorId,
  crearAlumno,
  actualizarAlumno,
  eliminarAlumno
} = require('../controllers/alumno.controller');
const { verificarToken, esAdministrador } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/', verificarToken, obtenerAlumnos);
router.get('/:id', verificarToken, obtenerAlumnoPorId);
router.post('/', [verificarToken, esAdministrador], crearAlumno);
router.put('/:id', [verificarToken, esAdministrador], actualizarAlumno);
router.delete('/:id', [verificarToken, esAdministrador], eliminarAlumno);

module.exports = router;