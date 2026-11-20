-- CreateTable
CREATE TABLE `Rol` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `Rol_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(80) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `nombre` VARCHAR(80) NOT NULL,
    `rolId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Usuario_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Grado` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numero` INTEGER NOT NULL,
    `nombre` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `Grado_numero_key`(`numero`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Seccion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `gradoId` INTEGER NOT NULL,
    `nombre` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Docente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NOT NULL,
    `especialidad` VARCHAR(80) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Encargado` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(80) NOT NULL,
    `parentesco` VARCHAR(20) NOT NULL,
    `identidad` VARCHAR(20) NOT NULL,
    `telefono` VARCHAR(8) NOT NULL,
    `correo` VARCHAR(80) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Emergencia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(80) NOT NULL,
    `telefono` VARCHAR(8) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Alumno` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(10) NOT NULL,
    `nombres` VARCHAR(80) NOT NULL,
    `apellidos` VARCHAR(80) NOT NULL,
    `nacimiento` DATE NOT NULL,
    `sexo` CHAR(1) NOT NULL,
    `identidad` VARCHAR(20) NOT NULL,
    `direccion` VARCHAR(120) NOT NULL,
    `salud` VARCHAR(120) NOT NULL,
    `encargadoId` INTEGER NULL,
    `emergenciaId` INTEGER NULL,

    UNIQUE INDEX `Alumno_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Matricula` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `alumnoId` INTEGER NOT NULL,
    `gradoId` INTEGER NOT NULL,
    `anio` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cuota` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `matriculaId` INTEGER NOT NULL,
    `label` VARCHAR(60) NOT NULL,
    `monto` DECIMAL(10, 2) NOT NULL,
    `vence` DATE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pago` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `recibo` INTEGER NOT NULL,
    `cuotaId` INTEGER NOT NULL,
    `monto` DECIMAL(10, 2) NOT NULL,
    `metodo` VARCHAR(20) NOT NULL,
    `fecha` DATE NOT NULL,
    `usuarioId` INTEGER NULL,

    UNIQUE INDEX `Pago_recibo_key`(`recibo`),
    UNIQUE INDEX `Pago_cuotaId_key`(`cuotaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Configuracion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `gradoId` INTEGER NOT NULL,
    `matricula` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `pension` DECIMAL(10, 2) NOT NULL DEFAULT 0,

    UNIQUE INDEX `Configuracion_gradoId_key`(`gradoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_rolId_fkey` FOREIGN KEY (`rolId`) REFERENCES `Rol`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Seccion` ADD CONSTRAINT `Seccion_gradoId_fkey` FOREIGN KEY (`gradoId`) REFERENCES `Grado`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Docente` ADD CONSTRAINT `Docente_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Alumno` ADD CONSTRAINT `Alumno_encargadoId_fkey` FOREIGN KEY (`encargadoId`) REFERENCES `Encargado`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Alumno` ADD CONSTRAINT `Alumno_emergenciaId_fkey` FOREIGN KEY (`emergenciaId`) REFERENCES `Emergencia`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Matricula` ADD CONSTRAINT `Matricula_alumnoId_fkey` FOREIGN KEY (`alumnoId`) REFERENCES `Alumno`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Matricula` ADD CONSTRAINT `Matricula_gradoId_fkey` FOREIGN KEY (`gradoId`) REFERENCES `Grado`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cuota` ADD CONSTRAINT `Cuota_matriculaId_fkey` FOREIGN KEY (`matriculaId`) REFERENCES `Matricula`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pago` ADD CONSTRAINT `Pago_cuotaId_fkey` FOREIGN KEY (`cuotaId`) REFERENCES `Cuota`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pago` ADD CONSTRAINT `Pago_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Configuracion` ADD CONSTRAINT `Configuracion_gradoId_fkey` FOREIGN KEY (`gradoId`) REFERENCES `Grado`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
