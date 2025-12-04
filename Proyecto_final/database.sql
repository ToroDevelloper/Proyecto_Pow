-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS biblioteca_personal_db;
USE biblioteca_personal_db;

-- Borrar tablas en orden inverso para evitar problemas de claves foráneas
DROP TABLE IF EXISTS Libros;
DROP TABLE IF EXISTS Autores;
DROP TABLE IF EXISTS Generos;

-- Tabla de Autores
CREATE TABLE Autores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    fechaCreacion DATE NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Géneros
CREATE TABLE Generos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Libros
CREATE TABLE Libros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    estado ENUM('Leído', 'Pendiente', 'Leyendo') DEFAULT 'Pendiente',
    urlPortada VARCHAR(255) DEFAULT 'https://via.placeholder.com/150',
    conteoLectura INT DEFAULT 0,
    descripcion VARCHAR(5000) NULL,
    detalle DATE NULL,
    AutorId INT,
    GeneroId INT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (AutorId) REFERENCES Autores(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (GeneroId) REFERENCES Generos(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Inserción de datos de ejemplo

-- Autores
INSERT INTO Autores (nombre, fechaCreacion) VALUES
('Gabriel García Márquez', '1927-03-06'),
('J.K. Rowling', '1965-07-31'),
('George Orwell', '1903-06-25'),
('J.R.R. Tolkien', '1892-01-03'),
('Isaac Asimov', '1920-01-02'),
('Jane Austen', '1775-12-16'),
('Stephen King', '1947-09-21'),
('Haruki Murakami', '1949-01-12'),
('Frank Herbert', '1920-10-08'),
('Mary Shelley', '1797-08-30'),
('Fyodor Dostoevsky', '1821-11-11'),
('Hermann Hesse', '1877-07-02'),
('Ray Bradbury', '1920-08-22');

-- Géneros
INSERT INTO Generos (nombre) VALUES
('Realismo Mágico'),
('Fantasía'),
('Ciencia Ficción Distópica'),
('Ciencia Ficción'),
('Novela Romántica'),
('Terror'),
('Surrealismo'),
('Ciencia Ficción Épica'),
('Gótico'),
('Ficción Filosófica'),
('Novela de Formación');

-- Libros
INSERT INTO Libros (titulo, estado, urlPortada, descripcion, detalle, AutorId, GeneroId) VALUES
(
    'Cien Años de Soledad', 'Leído',
    'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327881361l/320.jpg',
    'La novela narra la historia de la familia Buendía a lo largo de siete generaciones en el pueblo ficticio de Macondo. Es considerada una obra maestra de la literatura hispanoamericana y universal.',
    CURDATE(), (SELECT id FROM Autores WHERE nombre = 'Gabriel García Márquez'), (SELECT id FROM Generos WHERE nombre = 'Realismo Mágico')
),
(
    'Harry Potter y la piedra filosofal', 'Leído',
    'https://images.gr-assets.com/books/1474154022l/3.jpg',
    'La vida de Harry Potter cambia para siempre el día que cumple once años, cuando el gigante de ojos negros y brillantes Rubeus Hagrid le entrega una carta y le revela una noticia sorprendente.',
    CURDATE(), (SELECT id FROM Autores WHERE nombre = 'J.K. Rowling'), (SELECT id FROM Generos WHERE nombre = 'Fantasía')
),
(
    '1984', 'Leyendo',
    'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1532714506l/40961427.jpg',
    'En un futuro sombrío, la sociedad está bajo el control totalitario del Partido y su líder, el Gran Hermano. Winston Smith trabaja para el Ministerio de la Verdad y comienza a cuestionar el sistema.',
    CURDATE(), (SELECT id FROM Autores WHERE nombre = 'George Orwell'), (SELECT id FROM Generos WHERE nombre = 'Ciencia Ficción Distópica')
),
(
    'El Hobbit', 'Pendiente',
    'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546071216l/5907.jpg',
    'Bilbo Bolsón, un hobbit amante de la tranquilidad, se ve arrastrado a una aventura épica con un grupo de enanos para recuperar un tesoro robado por el dragón Smaug.',
    CURDATE(), (SELECT id FROM Autores WHERE nombre = 'J.R.R. Tolkien'), (SELECT id FROM Generos WHERE nombre = 'Fantasía')
),
(
    'Fundación', 'Pendiente',
    'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1417900846l/29579.jpg',
    'En un futuro lejano, el matemático Hari Seldon desarrolla la psicohistoria, una ciencia que le permite predecir la caída del Imperio Galáctico y traza un plan para salvar el conocimiento humano.',
    CURDATE(), (SELECT id FROM Autores WHERE nombre = 'Isaac Asimov'), (SELECT id FROM Generos WHERE nombre = 'Ciencia Ficción')
),
(
    'Orgullo y Prejuicio', 'Leído',
    'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1320399351l/1885.jpg',
    'La historia sigue el desarrollo emocional de Elizabeth Bennet, quien aprende sobre el error de hacer juicios apresurados y llega a apreciar la diferencia entre lo superficial y lo esencial.',
    CURDATE(), (SELECT id FROM Autores WHERE nombre = 'Jane Austen'), (SELECT id FROM Generos WHERE nombre = 'Novela Romántica')
),
(
    'It (Eso)', 'Leyendo',
    'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1334416842l/830502.jpg',
    'Un grupo de siete niños en un pequeño pueblo de Maine son aterrorizados por un ser maligno que explota los miedos de sus víctimas para disfrazarse mientras caza a su presa. Años más tarde, regresan para detenerlo de una vez por todas.',
    CURDATE(), (SELECT id FROM Autores WHERE nombre = 'Stephen King'), (SELECT id FROM Generos WHERE nombre = 'Terror')
),
(
    'Kafka en la orilla', 'Pendiente',
    'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1429638085l/4929.jpg',
    'La novela es una historia de dos personajes distintos pero interrelacionados: el joven Kafka Tamura, que huye de casa, y Satoru Nakata, un anciano que puede hablar con los gatos.',
    CURDATE(), (SELECT id FROM Autores WHERE nombre = 'Haruki Murakami'), (SELECT id FROM Generos WHERE nombre = 'Surrealismo')
),
(
    'Dune', 'Leído',
    'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1555447414l/44767458.jpg',
    'En el lejano futuro, en un planeta desértico, Paul Atreides se une a los Fremen para luchar por el control del recurso más valioso del universo, la especia melange.',
    CURDATE(), (SELECT id FROM Autores WHERE nombre = 'Frank Herbert'), (SELECT id FROM Generos WHERE nombre = 'Ciencia Ficción Épica')
),
(
    'Frankenstein', 'Leído',
    'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1381512375l/18490.jpg',
    'Victor Frankenstein, un joven científico, crea una criatura sapiente en un experimento poco ortodoxo. Horrorizado por su creación, la abandona, desencadenando una tragedia.',
    CURDATE(), (SELECT id FROM Autores WHERE nombre = 'Mary Shelley'), (SELECT id FROM Generos WHERE nombre = 'Gótico')
),
(
    'Crimen y Castigo', 'Leyendo',
    'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1382846449l/7144.jpg',
    'Rodion Raskolnikov, un ex-estudiante empobrecido en San Petersburgo, formula un plan para matar a una usurera sin escrúpulos por su dinero, creyéndose un hombre extraordinario.',
    CURDATE(), (SELECT id FROM Autores WHERE nombre = 'Fyodor Dostoevsky'), (SELECT id FROM Generos WHERE nombre = 'Ficción Filosófica')
),
(
    'Siddhartha', 'Pendiente',
    'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1428715580l/52036.jpg',
    'Un joven indio llamado Siddhartha emprende un viaje espiritual durante la época de Buda. Su búsqueda de la iluminación lo lleva a través de diferentes estilos de vida y experiencias.',
    CURDATE(), (SELECT id FROM Autores WHERE nombre = 'Hermann Hesse'), (SELECT id FROM Generos WHERE nombre = 'Novela de Formación')
),
(
    'Fahrenheit 451', 'Leído',
    'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1383718290l/13079982.jpg',
    'En una sociedad futura donde los libros están prohibidos, Guy Montag, un bombero cuyo trabajo es quemarlos, comienza a cuestionar su rol y la sociedad en la que vive.',
    CURDATE(), (SELECT id FROM Autores WHERE nombre = 'Ray Bradbury'), (SELECT id FROM Generos WHERE nombre = 'Ciencia Ficción Distópica')
);
