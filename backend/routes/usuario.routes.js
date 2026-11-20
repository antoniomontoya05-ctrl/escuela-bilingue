const { Router } = require('express');
const { obtenerUsuarios, actualizarUsuario, eliminarUsuario } = require('../controllers/usuario.controller');
const { verificarToken, esAdministrador } = require('../middlewares/auth.middleware');

const router = Router();

// Todas estas rutas requerirán estar autenticado y ser Administrador
router.get('/', [verificarToken, esAdministrador], obtenerUsuarios);
router.put('/:id', [verificarToken, esAdministrador], actualizarUsuario);
router.delete('/:id', [verificarToken, esAdministrador], eliminarUsuario);

module.exports = router;