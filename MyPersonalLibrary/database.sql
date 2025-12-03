-- 1. Crear la base de datos
CREATE DATABASE IF NOT EXISTS mypersonallibrary_db;

-- 2. Seleccionar la base de datos
USE mypersonallibrary_db;

-- 3. Crear la tabla Books (Sequelize lo hace automático, pero aquí está el SQL equivalente)
CREATE TABLE IF NOT EXISTS Books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    genre VARCHAR(255),
    status ENUM('Leído', 'Pendiente', 'Leyendo') DEFAULT 'Pendiente',
    coverUrl VARCHAR(255) DEFAULT 'https://via.placeholder.com/150',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Insertar datos de prueba (Seeders)
INSERT INTO Books (title, author, genre, status, coverUrl, createdAt, updatedAt) VALUES 
('Cien años de soledad', 'Gabriel García Márquez', 'Realismo Mágico', 'Leído', 'https://images.cdn3.buscalibre.com/fit-in/360x360/61/8d/618d227e8967274cd9589a549adff52d.jpg', NOW(), NOW()),
('El Principito', 'Antoine de Saint-Exupéry', 'Fábula', 'Leído', 'https://images.cdn1.buscalibre.com/fit-in/360x360/56/04/5604a6c99307aa8616a9f566be602084.jpg', NOW(), NOW()),
('1984', 'George Orwell', 'Ciencia Ficción', 'Pendiente', 'https://images.cdn2.buscalibre.com/fit-in/360x360/c6/2f/c62f9c6336359531b973081b269a30c3.jpg', NOW(), NOW()),
('Hábitos Atómicos', 'James Clear', 'Autoayuda', 'Leyendo', 'https://images.cdn1.buscalibre.com/fit-in/360x360/b8/96/b8965652040a639785d987a991d56321.jpg', NOW(), NOW());