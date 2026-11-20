require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Función segura para montar rutas sin errores si algún archivo cambia de nombre
const rutasMontadas = new Set();
const montarRuta = (prefijo, archivo) => {
  const clave = `${prefijo}->${archivo}`;
  if (rutasMontadas.has(clave)) return;

  const rutaArchivo = path.join(__dirname, 'routes', archivo);
  if (!fs.existsSync(rutaArchivo)) return;

  try {
    const router = require(rutaArchivo);
    if (typeof router === 'function') {
      app.use(prefijo, router);
      rutasMontadas.add(clave);
    } else {
      console.warn(`Aviso: ${archivo} no exporta un Router válido de Express.`);
    }
  } catch (err) {
    console.error(`Error al cargar ${archivo}:`, err.message);
  }
};

// Ruta base de verificación
app.get('/', (req, res) => {
  res.json({
    ok: true,
    mensaje: 'API Escuela Bilingüe funcionando correctamente',
    rutas: Array.from(rutasMontadas)
  });
});

// Rutas principales del sistema
montarRuta('/api/auth', 'auth.routes.js');
montarRuta('/api/sistema', 'sistema.routes.js');
montarRuta('/api/docente', 'docente.routes.js');

// Rutas de los módulos CRUD existentes (soporta nombres en singular o plural)
montarRuta('/api/alumnos', 'alumno.routes.js');
montarRuta('/api/alumnos', 'alumnos.routes.js');
montarRuta('/api/usuarios', 'usuario.routes.js');
montarRuta('/api/usuarios', 'usuarios.routes.js');
montarRuta('/api/roles', 'rol.routes.js');
montarRuta('/api/roles', 'roles.routes.js');
montarRuta('/api/grados', 'grado.routes.js');
montarRuta('/api/grados', 'grados.routes.js');
montarRuta('/api/secciones', 'seccion.routes.js');
montarRuta('/api/secciones', 'secciones.routes.js');
montarRuta('/api/encargados', 'encargado.routes.js');
montarRuta('/api/encargados', 'encargados.routes.js');
montarRuta('/api/emergencias', 'emergencia.routes.js');
montarRuta('/api/emergencias', 'emergencias.routes.js');
montarRuta('/api/matriculas', 'matricula.routes.js');
montarRuta('/api/matriculas', 'matriculas.routes.js');
montarRuta('/api/cuotas', 'cuota.routes.js');
montarRuta('/api/cuotas', 'cuotas.routes.js');
montarRuta('/api/pagos', 'pago.routes.js');
montarRuta('/api/pagos', 'pagos.routes.js');
montarRuta('/api/configuracion', 'configuracion.routes.js');
montarRuta('/api/configuracion', 'configuraciones.routes.js');

// Manejo de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('Error inesperado en el servidor:', err);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log('Rutas activas:', Array.from(rutasMontadas).join(', '));
});