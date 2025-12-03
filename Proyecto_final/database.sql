-- 1. Crear la base de datos
CREATE DATABASE IF NOT EXISTS biblioteca_personal_db;

-- 2. Seleccionar la base de datos
USE biblioteca_personal_db;

-- 3. Crear tabla Autores
CREATE TABLE IF NOT EXISTS Autores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Crear tabla Generos
CREATE TABLE IF NOT EXISTS Generos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Crear la tabla Libros con claves foráneas
CREATE TABLE IF NOT EXISTS Libros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    estado ENUM('Leído', 'Pendiente', 'Leyendo') DEFAULT 'Pendiente',
    urlPortada VARCHAR(255) DEFAULT 'https://via.placeholder.com/150',
    conteoLectura INT DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    AutorId INT,
    GeneroId INT,
    FOREIGN KEY (AutorId) REFERENCES Autores(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (GeneroId) REFERENCES Generos(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- 6. Insertar datos de prueba (Seeders)

-- Insertar Autores
INSERT INTO Autores (nombre, createdAt, updatedAt) VALUES
('Gabriel García Márquez', NOW(), NOW()),
('Antoine de Saint-Exupéry', NOW(), NOW()),
('George Orwell', NOW(), NOW()),
('James Clear', NOW(), NOW()),
('Miguel de Cervantes', NOW(), NOW()),
('J.K. Rowling', NOW(), NOW()),
('J.R.R. Tolkien', NOW(), NOW()),
('Isaac Asimov', NOW(), NOW()),
('Agatha Christie', NOW(), NOW()),
('Stephen King', NOW(), NOW());

-- Insertar Géneros
INSERT INTO Generos (nombre, createdAt, updatedAt) VALUES
('Realismo Mágico', NOW(), NOW()),
('Fábula', NOW(), NOW()),
('Ciencia Ficción', NOW(), NOW()),
('Autoayuda', NOW(), NOW()),
('Novela', NOW(), NOW()),
('Fantasía', NOW(), NOW()),
('Misterio', NOW(), NOW()),
('Terror', NOW(), NOW());

-- Insertar Libros (Asumiendo los IDs generados arriba, ajustar si es necesario)
INSERT INTO Libros (titulo, estado, urlPortada, conteoLectura, AutorId, GeneroId, createdAt, updatedAt) VALUES
('Cien años de soledad', 'Leído', 'https://covers.openlibrary.org/b/id/8259449-L.jpg', 150, 1, 1, NOW(), NOW()),
('El Principito', 'Leído', 'https://covers.openlibrary.org/b/id/8588225-L.jpg', 300, 2, 2, NOW(), NOW()),
('1984', 'Pendiente', 'https://covers.openlibrary.org/b/id/7222246-L.jpg', 0, 3, 3, NOW(), NOW()),
('Hábitos Atómicos', 'Leyendo', 'https://covers.openlibrary.org/b/id/10524034-L.jpg', 45, 4, 4, NOW(), NOW()),
('Don Quijote de la Mancha', 'Pendiente', 'https://covers.openlibrary.org/b/id/7966089-L.jpg', 0, 5, 5, NOW(), NOW()),
('Harry Potter y la piedra filosofal', 'Leído', 'https://covers.openlibrary.org/b/id/10522709-L.jpg', 10, 6, 6, NOW(), NOW()),
('El Señor de los Anillos: La Comunidad del Anillo', 'Pendiente', 'https://covers.openlibrary.org/b/id/8392887-L.jpg', 0, 7, 6, NOW(), NOW()),
('Yo, Robot', 'Leído', 'https://covers.openlibrary.org/b/id/7047656-L.jpg', 20, 8, 3, NOW(), NOW()),
('Asesinato en el Orient Express', 'Pendiente', 'https://covers.openlibrary.org/b/id/8259446-L.jpg', 0, 9, 7, NOW(), NOW()),
('It', 'Leyendo', 'https://covers.openlibrary.org/b/id/8303368-L.jpg', 50, 10, 8, NOW(), NOW()),
('Crónica de una muerte anunciada', 'Leído', 'https://covers.openlibrary.org/b/id/12556702-L.jpg', 100, 1, 1, NOW(), NOW()),
('El Hobbit', 'Pendiente', 'https://covers.openlibrary.org/b/id/8406786-L.jpg', 0, 7, 6, NOW(), NOW());