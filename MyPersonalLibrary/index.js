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

// Definición del modelo Book
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
    status: {
        type: DataTypes.ENUM('Leído', 'Pendiente', 'Leyendo'),
        defaultValue: 'Pendiente'
    },
    coverUrl: {
        type: DataTypes.STRING,
        defaultValue: 'https://via.placeholder.com/150'
    },
    readCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
});

// Relaciones
Author.hasMany(Book);
Book.belongsTo(Author);
Genre.hasMany(Book);
Book.belongsTo(Genre);

// --- RUTAS ---

// 1. Listar todos los libros (Home)
app.get('/', async (req, res) => {
    try {
        const books = await Book.findAll({ include: [Author, Genre] });
        const pendingBooks = await Book.findAll({
            where: { status: 'Pendiente' },
            include: [Author, Genre]
        });
        res.render('index', { books, pendingBooks });
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
        const { title, author, genre, status, coverUrl } = req.body;

        const [authorInstance] = await Author.findOrCreate({
            where: { name: author }
        });

        let genreInstance = null;
        if (genre) {
            [genreInstance] = await Genre.findOrCreate({
                where: { name: genre }
            });
        }

        await Book.create({
            title,
            status,
            coverUrl,
            AuthorId: authorInstance.id,
            GenreId: genreInstance ? genreInstance.id : null
        });

        res.redirect('/?alert=created');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al crear el libro');
    }
});

// 4. Mostrar formulario de edición
app.get('/edit/:id', async (req, res) => {
    try {
        const book = await Book.findByPk(req.params.id, { include: [Author, Genre] });
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
        const { title, author, genre, status, coverUrl } = req.body;

        const [authorInstance] = await Author.findOrCreate({
            where: { name: author }
        });

        let genreInstance = null;
        if (genre) {
            [genreInstance] = await Genre.findOrCreate({
                where: { name: genre }
            });
        }

        await Book.update({
            title,
            status,
            coverUrl,
            AuthorId: authorInstance.id,
            GenreId: genreInstance ? genreInstance.id : null
        }, {
            where: { id: req.params.id }
        });
        res.redirect('/?alert=updated');
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
        res.redirect('/?alert=deleted');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al eliminar el libro');
    }
});

// 7. Vista de Estadísticas Avanzadas
app.get('/stats', async (req, res) => {
    try {
        const { genre, author } = req.query;
        
        const include = [];
        if (author && author.trim() !== '') {
            include.push({ model: Author, where: { name: author } });
        }
        if (genre && genre.trim() !== '') {
            include.push({ model: Genre, where: { name: genre } });
        }

        // Obtener total de libros filtrados
        const totalBooks = await Book.count({ include });

        // Obtener conteo por estado
        const statusCounts = await Book.findAll({
            include,
            attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('Book.status')), 'count']],
            group: ['status']
        });

        // Procesar datos para la vista
        const statsByStatus = statusCounts.map(item => {
            const count = item.get('count');
            const percentage = totalBooks > 0 ? ((count / totalBooks) * 100).toFixed(1) : 0;
            return {
                status: item.status,
                count: count,
                percentage: percentage
            };
        });

        // Asegurar que todos los estados estén presentes aunque sean 0
        const allStatuses = ['Leído', 'Pendiente', 'Leyendo'];
        const finalStats = allStatuses.map(status => {
            const found = statsByStatus.find(s => s.status === status);
            return found || { status: status, count: 0, percentage: 0 };
        });

        res.render('stats', {
            totalBooks,
            stats: finalStats,
            filterApplied: { genre, author }
        });

    } catch (error) {
        console.error('Error en el módulo de estadísticas:', error);
        res.status(500).send('Error interno al procesar las estadísticas');
    }
});

// --- INICIO DEL SERVIDOR ---
sequelize.sync({ alter: true })
    .then(() => {
        console.log('Base de datos sincronizada');
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Error al conectar con la base de datos:', err);
    });