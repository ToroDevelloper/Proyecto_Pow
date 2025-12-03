-- 1. Crear la base de datos
CREATE DATABASE IF NOT EXISTS mypersonallibrary_db;

-- 2. Seleccionar la base de datos
USE mypersonallibrary_db;

-- 3. Crear tabla Authors
CREATE TABLE IF NOT EXISTS Authors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Crear tabla Genres
CREATE TABLE IF NOT EXISTS Genres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Crear la tabla Books con claves foráneas
CREATE TABLE IF NOT EXISTS Books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    status ENUM('Leído', 'Pendiente', 'Leyendo') DEFAULT 'Pendiente',
    coverUrl VARCHAR(255) DEFAULT 'https://via.placeholder.com/150',
    readCount INT DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    AuthorId INT,
    GenreId INT,
    FOREIGN KEY (AuthorId) REFERENCES Authors(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (GenreId) REFERENCES Genres(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- 6. Insertar datos de prueba (Seeders)

-- Insertar Autores
INSERT INTO Authors (name, createdAt, updatedAt) VALUES
('Gabriel García Márquez', NOW(), NOW()),
('Antoine de Saint-Exupéry', NOW(), NOW()),
('George Orwell', NOW(), NOW()),
('James Clear', NOW(), NOW());

-- Insertar Géneros
INSERT INTO Genres (name, createdAt, updatedAt) VALUES
('Realismo Mágico', NOW(), NOW()),
('Fábula', NOW(), NOW()),
('Ciencia Ficción', NOW(), NOW()),
('Autoayuda', NOW(), NOW());

-- Insertar Libros (Asumiendo los IDs generados arriba, ajustar si es necesario)
INSERT INTO Books (title, status, coverUrl, readCount, AuthorId, GenreId, createdAt, updatedAt) VALUES
('Cien años de soledad', 'Leído', 'https://images.cdn3.buscalibre.com/fit-in/360x360/61/8d/618d227e8967274cd9589a549adff52d.jpg', 150, 1, 1, NOW(), NOW()),
('El Principito', 'Leído', 'https://images.cdn1.buscalibre.com/fit-in/360x360/56/04/5604a6c99307aa8616a9f566be602084.jpg', 300, 2, 2, NOW(), NOW()),
('1984', 'Pendiente', 'https://images.cdn2.buscalibre.com/fit-in/360x360/c6/2f/c62f9c6336359531b973081b269a30c3.jpg', 0, 3, 3, NOW(), NOW()),
('Hábitos Atómicos', 'Leyendo', 'https://images.cdn1.buscalibre.com/fit-in/360x360/b8/96/b8965652040a639785d987a991d56321.jpg', 45, 4, 4, NOW(), NOW());