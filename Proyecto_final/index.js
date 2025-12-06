const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const mysql = require('mysql');
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


// --- BASE DE DATOS (MySQL) ---
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    multipleStatements: true
});

connection.connect(err => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err);
        return;
    }
    console.log('Base de datos conectada');
});


// --- RUTAS ---

// 1. Listar todos los libros (Inicio)
app.get('/', (req, res) => {
    const { categoria, estado } = req.query;
    let query = `
        SELECT l.*, a.nombre as autorNombre, g.nombre as generoNombre
        FROM Libros l
        LEFT JOIN Autores a ON l.AutorId = a.id
        LEFT JOIN Generos g ON l.GeneroId = g.id
    `;
    const params = [];

    if (categoria || estado) {
        query += ' WHERE ';
        if (categoria) {
            query += 'g.nombre = ?';
            params.push(categoria);
        }
        if (estado) {
            if (categoria) query += ' AND ';
            query += 'l.estado = ?';
            params.push(estado);
        }
    }

    connection.query(query, params, (err, libros) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error al obtener los libros');
        }

        const queryPendientes = `
            SELECT l.*, a.nombre as autorNombre, g.nombre as generoNombre
            FROM Libros l
            LEFT JOIN Autores a ON l.AutorId = a.id
            LEFT JOIN Generos g ON l.GeneroId = g.id
            WHERE l.estado = 'Pendiente'
        `;
        connection.query(queryPendientes, (err, librosPendientes) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error al obtener los libros pendientes');
            }

            const queryGeneros = 'SELECT * FROM Generos WHERE id IN (SELECT DISTINCT GeneroId FROM Libros WHERE GeneroId IS NOT NULL)';
            connection.query(queryGeneros, (err, generos) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Error al obtener los géneros');
                }

                const queryTotal = 'SELECT COUNT(*) as total FROM Libros';
                connection.query(queryTotal, (err, result) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Error al contar los libros');
                    }

                    res.render('inicio', {
                        libros: libros.map(l => ({ ...l, Autor: { nombre: l.autorNombre }, Genero: { nombre: l.generoNombre } })),
                        librosPendientes: librosPendientes.map(l => ({ ...l, Autor: { nombre: l.autorNombre }, Genero: { nombre: l.generoNombre } })),
                        generos,
                        selectedCategoria: categoria,
                        selectedEstado: estado,
                        totalLibrosEnBiblioteca: result[0].total
                    });
                });
            });
        });
    });
});


// 2. Mostrar formulario de creación
app.get('/crear', (req, res) => {
    res.render('crear', { page: 'crear' });
});

// 3. Crear un nuevo libro (POST)
app.post('/crear', (req, res) => {
    const { titulo, autor, fechaCreacion, descripcion, genero, estado, urlPortada } = req.body;

    const findOrCreateAutor = `INSERT INTO Autores (nombre, fechaCreacion) VALUES (?, ?) ON DUPLICATE KEY UPDATE fechaCreacion=VALUES(fechaCreacion); SELECT id FROM Autores WHERE nombre = ?;`;
    connection.query(findOrCreateAutor, [autor, fechaCreacion || null, autor], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error al crear/buscar el autor');
        }
        const autorId = results[1][0].id;

        if (genero) {
            const findOrCreateGenero = `INSERT INTO Generos (nombre) VALUES (?) ON DUPLICATE KEY UPDATE nombre=VALUES(nombre); SELECT id FROM Generos WHERE nombre = ?;`;
            connection.query(findOrCreateGenero, [genero, genero], (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Error al crear/buscar el género');
                }
                const generoId = results[1][0].id;
                createLibro(titulo, estado, urlPortada, descripcion, autorId, generoId, res);
            });
        } else {
            createLibro(titulo, estado, urlPortada, descripcion, autorId, null, res);
        }
    });
});

function createLibro(titulo, estado, urlPortada, descripcion, autorId, generoId, res) {
    const query = 'INSERT INTO Libros (titulo, estado, urlPortada, descripcion, AutorId, GeneroId, detalle) VALUES (?, ?, ?, ?, ?, ?, NOW())';
    connection.query(query, [titulo, estado, urlPortada, descripcion, autorId, generoId], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error al crear el libro');
        }
        res.redirect('/?alerta=creado');
    });
}


// 4. Mostrar formulario de edición
app.get('/editar/:id', (req, res) => {
    const query = `
        SELECT l.*, a.nombre as autorNombre, g.nombre as generoNombre
        FROM Libros l
        LEFT JOIN Autores a ON l.AutorId = a.id
        LEFT JOIN Generos g ON l.GeneroId = g.id
        WHERE l.id = ?
    `;
    connection.query(query, [req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error al obtener el libro');
        }
        if (result.length === 0) {
            return res.status(404).send('Libro no encontrado');
        }
        const libro = { ...result[0], Autor: { nombre: result[0].autorNombre }, Genero: { nombre: result[0].generoNombre } };
        res.render('editar', { libro, page: 'editar' });
    });
});


// 5. Actualizar un libro (PUT)
app.put('/editar/:id', (req, res) => {
    const { titulo, autor, fechaCreacion, descripcion, genero, estado, urlPortada } = req.body;

    const findOrCreateAutor = `INSERT INTO Autores (nombre, fechaCreacion) VALUES (?, ?) ON DUPLICATE KEY UPDATE fechaCreacion=VALUES(fechaCreacion); SELECT id FROM Autores WHERE nombre = ?;`;
    connection.query(findOrCreateAutor, [autor, fechaCreacion || null, autor], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error al actualizar/buscar el autor');
        }
        const autorId = results[1][0].id;

        if (genero) {
            const findOrCreateGenero = `INSERT INTO Generos (nombre) VALUES (?) ON DUPLICATE KEY UPDATE nombre=VALUES(nombre); SELECT id FROM Generos WHERE nombre = ?;`;
            connection.query(findOrCreateGenero, [genero, genero], (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Error al actualizar/buscar el género');
                }
                const generoId = results[1][0].id;
                updateLibro(req.params.id, titulo, estado, urlPortada, descripcion, autorId, generoId, res);
            });
        } else {
            updateLibro(req.params.id, titulo, estado, urlPortada, descripcion, autorId, null, res);
        }
    });
});

function updateLibro(id, titulo, estado, urlPortada, descripcion, autorId, generoId, res) {
    const query = 'UPDATE Libros SET titulo = ?, estado = ?, urlPortada = ?, descripcion = ?, AutorId = ?, GeneroId = ? WHERE id = ?';
    connection.query(query, [titulo, estado, urlPortada, descripcion, autorId, generoId, id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error al actualizar el libro');
        }
        res.redirect('/?alerta=actualizado');
    });
}


// 6. Eliminar un libro (DELETE)
app.delete('/eliminar/:id', (req, res) => {
    const query = 'DELETE FROM Libros WHERE id = ?';
    connection.query(query, [req.params.id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error al eliminar el libro');
        }
        res.redirect('/?alerta=eliminado');
    });
});

// 7. Vista de Estadísticas Avanzadas
app.get('/estadisticas', (req, res) => {
    const { genero, autor } = req.query;
    
    let baseQuery = `
        FROM Libros l
        LEFT JOIN Autores a ON l.AutorId = a.id
        LEFT JOIN Generos g ON l.GeneroId = g.id
    `;
    const whereClauses = [];
    const params = [];

    if (autor && autor.trim() !== '') {
        whereClauses.push('a.nombre = ?');
        params.push(autor);
    }
    if (genero && genero.trim() !== '') {
        whereClauses.push('g.nombre = ?');
        params.push(genero);
    }

    if (whereClauses.length > 0) {
        baseQuery += ' WHERE ' + whereClauses.join(' AND ');
    }

    const totalQuery = `SELECT COUNT(*) as total ${baseQuery}`;
    connection.query(totalQuery, params, (err, totalResult) => {
        if (err) {
            console.error('Error en estadísticas (total):', err);
            return res.status(500).send('Error al calcular el total');
        }
        const totalLibros = totalResult[0].total;

        const conteoQuery = `SELECT l.estado, COUNT(l.estado) as conteo ${baseQuery} GROUP BY l.estado`;
        connection.query(conteoQuery, params, (err, conteoResult) => {
            if (err) {
                console.error('Error en estadísticas (conteo):', err);
                return res.status(500).send('Error al calcular el conteo por estado');
            }

            const estadisticasPorEstado = conteoResult.map(item => ({
                estado: item.estado,
                conteo: item.conteo,
                porcentaje: totalLibros > 0 ? ((item.conteo / totalLibros) * 100).toFixed(1) : 0
            }));

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
        });
    });
});


// --- INICIO DEL SERVIDOR ---
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});