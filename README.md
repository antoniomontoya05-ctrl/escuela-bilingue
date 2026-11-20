# Sistema de Gestión Escolar — Escuela Bilingüe

Aplicación web full-stack desarrollada bajo la metodología ágil **Scrum** (4 Sprints) para la administración integral de matrículas, aranceles, cobros, asistencia diaria, calificaciones y reportes académicos.

## Arquitectura en 3 Capas

* **Capa 1 · Datos:** Base de datos relacional **MySQL** gestionada mediante **Prisma ORM** (`backend/prisma/schema.prisma`) y cliente repositorio con sincronización REST (`js/datos/repositorio.js`).
* **Capa 2 · Negocio:** API RESTful construida con **Node.js + Express**, validación de reglas de negocio, encriptación de contraseñas con `bcryptjs` y autenticación basada en **JWT** con control de acceso por roles (`Admin` y `Docente`).
* **Capa 3 · Presentación:** Interfaz web modular en **HTML5, CSS3 y JavaScript Vanilla** dividida por vistas funcionales según el perfil del usuario.

## Stack Tecnológico

* **Frontend:** HTML5, CSS3, JavaScript (ES6+)
* **Backend:** Node.js, Express.js, JSON Web Tokens (JWT), bcryptjs
* **Base de Datos y ORM:** MySQL, Prisma ORM

## Estructura del Proyecto

```text
escuela-bilingue/
├── backend/
│   ├── controllers/        # Lógica de negocio y transacciones Prisma
│   ├── prisma/
│   │   ├── schema.prisma   # Modelo relacional de la base de datos
│   │   └── seed.js         # Script de carga de datos iniciales
│   ├── routes/             # Endpoints REST protegidos por rol
│   ├── .env.example        # Plantilla de variables de entorno
│   ├── package.json
│   └── server.js           # Punto de entrada de la API (puerto 4000)
├── css/                    # Estilos de la interfaz
├── js/
│   ├── datos/              # Repositorio y comunicación con la API
│   ├── negocio/            # Servicios de autenticación, matrículas, pagos y docente
│   └── presentacion/       # Controlador de vistas y pantallas del sistema
├── index.html              # Vista principal de la aplicación
├── .gitignore
└── README.md