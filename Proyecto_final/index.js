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
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT,
        logging: false,
    }
);

// --- MODELOS ---

const Autor = sequelize.define('Autor', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    fechaCreacion: {
        type: DataTypes.DATEONLY,
        allowNull: true
    }
}, {
    tableName: 'Autores'
});

const Genero = sequelize.define('Genero', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {
    tableName: 'Generos'
});

// Definición del modelo Libro
const Libro = sequelize.define('Libro', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    titulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    estado: {
        type: DataTypes.ENUM('Leído', 'Pendiente', 'Leyendo'),
        defaultValue: 'Pendiente'
    },
    descripcion: {
        type: DataTypes.STRING(716),
        allowNull: true
    },
    detalle: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW
    },
    urlPortada: {
        type: DataTypes.STRING,
        defaultValue: 'https://via.placeholder.com/150'
    },
    conteoLectura: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'Libros'
});

// Relaciones
Autor.hasMany(Libro);
Libro.belongsTo(Autor);
Genero.hasMany(Libro);
Libro.belongsTo(Genero);

// --- RUTAS ---

// 1. Listar todos los libros (Inicio)
app.get('/', async (req, res) => {
    try {
        const { categoria, estado } = req.query;
        const whereClause = {};

        if (categoria) {
            whereClause['$Genero.nombre$'] = categoria;
        }
        if (estado) {
            whereClause.estado = estado;
        }

        const libros = await Libro.findAll({
            include: [Autor, Genero],
            where: whereClause
        });

        const librosPendientes = await Libro.findAll({
            where: { estado: 'Pendiente' },
            include: [Autor, Genero]
        });

        // Paso 1: Obtener los IDs de los géneros que están actualmente en uso en la tabla Libros
        const generosEnUso = await Libro.findAll({
            attributes: [
                [Sequelize.fn('DISTINCT', Sequelize.col('GeneroId')), 'GeneroId']
            ],
            where: {
                GeneroId: {
                    [Sequelize.Op.ne]: null
                }
            }
        });
        const idsDeGenerosEnUso = generosEnUso.map(item => item.GeneroId);

        // Paso 2: Obtener los detalles completos de esos géneros
        const generos = await Genero.findAll({
            where: {
                id: idsDeGenerosEnUso
            }
        });

        const totalLibrosEnBiblioteca = await Libro.count();

        res.render('inicio', {
            libros,
            librosPendientes,
            generos,
            selectedCategoria: categoria,
            selectedEstado: estado,
            totalLibrosEnBiblioteca
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener los libros');
    }
});

// 2. Mostrar formulario de creación
app.get('/crear', (req, res) => {
    res.render('crear', { page: 'crear' });
});

// 3. Crear un nuevo libro (POST)
app.post('/crear', async (req, res) => {
    try {
        const { titulo, autor, fechaCreacion, descripcion, genero, estado, urlPortada } = req.body;

        const [instanciaAutor] = await Autor.findOrCreate({
            where: { nombre: autor },
            defaults: { fechaCreacion: fechaCreacion || null }
        });

        // Si el autor ya existía, actualizamos su fecha de creación si se proporcionó una nueva
        if (!instanciaAutor.isNewRecord && fechaCreacion) {
            instanciaAutor.fechaCreacion = fechaCreacion;
            await instanciaAutor.save();
        }

        let instanciaGenero = null;
        if (genero) {
            [instanciaGenero] = await Genero.findOrCreate({
                where: { nombre: genero }
            });
        }

        await Libro.create({
            titulo,
            estado,
            urlPortada,
            descripcion,
            AutorId: instanciaAutor.id,
            GeneroId: instanciaGenero ? instanciaGenero.id : null
        });

        res.redirect('/?alerta=creado');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al crear el libro');
    }
});

// 4. Mostrar formulario de edición
app.get('/editar/:id', async (req, res) => {
    try {
        const libro = await Libro.findByPk(req.params.id, { include: [Autor, Genero] });
        if (!libro) {
            return res.status(404).send('Libro no encontrado');
        }
        res.render('editar', { libro, page: 'editar' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener el libro');
    }
});

// 5. Actualizar un libro (PUT)
app.put('/editar/:id', async (req, res) => {
    try {
        const { titulo, autor, fechaCreacion, descripcion, genero, estado, urlPortada } = req.body;

        const [instanciaAutor] = await Autor.findOrCreate({
            where: { nombre: autor },
            defaults: { fechaCreacion: fechaCreacion || null }
        });

        // Si el autor ya existía, actualizamos su fecha de creación
        if (fechaCreacion) {
            instanciaAutor.fechaCreacion = fechaCreacion;
            await instanciaAutor.save();
        }

        let instanciaGenero = null;
        if (genero) {
            [instanciaGenero] = await Genero.findOrCreate({
                where: { nombre: genero }
            });
        }

        await Libro.update({
            titulo,
            estado,
            urlPortada,
            descripcion,
            AutorId: instanciaAutor.id,
            GeneroId: instanciaGenero ? instanciaGenero.id : null
        }, {
            where: { id: req.params.id }
        });
        res.redirect('/?alerta=actualizado');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al actualizar el libro');
    }
});

// 6. Eliminar un libro (DELETE)
app.delete('/eliminar/:id', async (req, res) => {
    try {
        await Libro.destroy({
            where: { id: req.params.id }
        });
        res.redirect('/?alerta=eliminado');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al eliminar el libro');
    }
});

// 7. Vista de Estadísticas Avanzadas
app.get('/estadisticas', async (req, res) => {
    try {
        const { genero, autor } = req.query;
        
        const include = [];
        if (autor && autor.trim() !== '') {
            include.push({ model: Autor, where: { nombre: autor } });
        }
        if (genero && genero.trim() !== '') {
            include.push({ model: Genero, where: { nombre: genero } });
        }

        // Obtener total de libros filtrados
        const totalLibros = await Libro.count({ include });

        // Obtener conteo por estado
        const conteoEstados = await Libro.findAll({
            include,
            attributes: ['estado', [Sequelize.fn('COUNT', Sequelize.col('Libro.estado')), 'conteo']],
            group: ['estado']
        });

        // Procesar datos para la vista
        const estadisticasPorEstado = conteoEstados.map(item => {
            const conteo = item.get('conteo');
            const porcentaje = totalLibros > 0 ? ((conteo / totalLibros) * 100).toFixed(1) : 0;
            return {
                estado: item.estado,
                conteo: conteo,
                porcentaje: porcentaje
            };
        });

        // Asegurar que todos los estados estén presentes aunque sean 0
        const todosLosEstados = ['Leído', 'Pendiente', 'Leyendo'];
        const estadisticasFinales = todosLosEstados.map(estado => {
            const encontrado = estadisticasPorEstado.find(s => s.estado === estado);
            return encontrado || { estado: estado, conteo: 0, porcentaje: 0 };
        });

        res.render('estadisticas', {
            totalLibros,
            estadisticas: estadisticasFinales,
            filtroAplicado: { genero, autor }
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