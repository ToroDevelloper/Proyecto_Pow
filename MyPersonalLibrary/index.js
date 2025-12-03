const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// --- CONFIGURACIÓN DE LA APP ---
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'src/public')));

// Configuración de Vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// --- BASE DE DATOS (Sequelize) ---
// Conexión directa aquí mismo
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        logging: false,
    }
);

// --- MODELO (Book) ---
// Definición del modelo aquí mismo
const Book = sequelize.define('Book', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false
    },
    genre: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.ENUM('Leído', 'Pendiente', 'Leyendo'),
        defaultValue: 'Pendiente'
    },
    coverUrl: {
        type: DataTypes.STRING,
        defaultValue: 'https://via.placeholder.com/150'
    }
});

// --- RUTAS ---

// 1. Listar todos los libros (Home)
app.get('/', async (req, res) => {
    try {
        const books = await Book.findAll();
        res.render('index', { books });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener los libros');
    }
});

// 2. Mostrar formulario de creación
app.get('/create', (req, res) => {
    res.render('create');
});

// 3. Crear un nuevo libro (POST)
app.post('/create', async (req, res) => {
    try {
        await Book.create(req.body);
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al crear el libro');
    }
});

// 4. Mostrar formulario de edición
app.get('/edit/:id', async (req, res) => {
    try {
        const book = await Book.findByPk(req.params.id);
        if (!book) {
            return res.status(404).send('Libro no encontrado');
        }
        res.render('edit', { book });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener el libro');
    }
});

// 5. Actualizar un libro (PUT)
app.put('/edit/:id', async (req, res) => {
    try {
        await Book.update(req.body, {
            where: { id: req.params.id }
        });
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al actualizar el libro');
    }
});

// 6. Eliminar un libro (DELETE)
app.delete('/delete/:id', async (req, res) => {
    try {
        await Book.destroy({
            where: { id: req.params.id }
        });
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al eliminar el libro');
    }
});

// --- INICIO DEL SERVIDOR ---
sequelize.sync({ force: false })
    .then(() => {
        console.log('Base de datos sincronizada');
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Error al conectar con la base de datos:', err);
    });