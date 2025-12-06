const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const mysql = require('mysql');
require('dotenv').config();

// --- CONFIGURACIÓN DE LA APP ---
const app = express();
const PUERTO = process.env.PORT || 3000;

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'src/public')));

// Configuración de Vistas (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// --- CONEXIÓN A LA BASE DE DATOS ---
const conexion = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    multipleStatements: true
});

conexion.connect(function(error) {
    if (error) {
        throw error;
    } else {
        console.log('Conexión a la base de datos exitosa');
    }
});

// --- RUTAS DE LA APLICACIÓN ---

// 1. RUTA PRINCIPAL: Listar todos los libros
app.get('/', function(req, res) {
    const { categoria, estado } = req.query;

    let consultaLibros = `
        SELECT l.*, a.nombre as nombreAutor, g.nombre as nombreGenero 
        FROM Libros l 
        LEFT JOIN Autores a ON l.AutorId = a.id 
        LEFT JOIN Generos g ON l.GeneroId = g.id
    `;
    const parametros = [];

    if (categoria || estado) {
        consultaLibros += ' WHERE ';
        if (categoria) {
            consultaLibros += 'g.nombre = ?';
            parametros.push(categoria);
        }
        if (estado) {
            if (categoria) consultaLibros += ' AND ';
            consultaLibros += 'l.estado = ?';
            parametros.push(estado);
        }
    }

    conexion.query(consultaLibros, parametros, function(error, libros) {
        if (error) throw error;

        const consultaPendientes = `
            SELECT l.*, a.nombre as nombreAutor, g.nombre as nombreGenero 
            FROM Libros l 
            LEFT JOIN Autores a ON l.AutorId = a.id 
            LEFT JOIN Generos g ON l.GeneroId = g.id 
            WHERE l.estado = 'Pendiente'
        `;
        conexion.query(consultaPendientes, function(error, librosPendientes) {
            if (error) throw error;

            const consultaGeneros = 'SELECT * FROM Generos WHERE id IN (SELECT DISTINCT GeneroId FROM Libros WHERE GeneroId IS NOT NULL)';
            conexion.query(consultaGeneros, function(error, generos) {
                if (error) throw error;

                const consultaTotal = 'SELECT COUNT(*) as total FROM Libros';
                conexion.query(consultaTotal, function(error, resultado) {
                    if (error) throw error;

                    res.render('inicio', {
                        libros: libros.map(l => ({ ...l, Autor: { nombre: l.nombreAutor }, Genero: { nombre: l.nombreGenero } })),
                        librosPendientes: librosPendientes.map(l => ({ ...l, Autor: { nombre: l.nombreAutor }, Genero: { nombre: l.nombreGenero } })),
                        generos,
                        selectedCategoria: categoria,
                        selectedEstado: estado,
                        totalLibrosEnBiblioteca: resultado[0].total
                    });
                });
            });
        });
    });
});

// 2. RUTA: Mostrar formulario para crear un libro
app.get('/crear', function(req, res) {
    res.render('crear', { page: 'crear' });
});

// 3. RUTA: Guardar un nuevo libro en la BD
app.post('/crear', function(req, res) {
    const { titulo, autor, fechaCreacion, descripcion, genero, estado, urlPortada } = req.body;

    const consultaAutor = `INSERT INTO Autores (nombre, fechaCreacion) VALUES (?, ?) ON DUPLICATE KEY UPDATE fechaCreacion=VALUES(fechaCreacion); SELECT id FROM Autores WHERE nombre = ?;`;
    conexion.query(consultaAutor, [autor, fechaCreacion || null, autor], function(error, resultados) {
        if (error) throw error;
        const autorId = resultados[1][0].id;

        if (genero) {
            const consultaGenero = `INSERT INTO Generos (nombre) VALUES (?) ON DUPLICATE KEY UPDATE nombre=VALUES(nombre); SELECT id FROM Generos WHERE nombre = ?;`;
            conexion.query(consultaGenero, [genero, genero], function(error, resultados) {
                if (error) throw error;
                const generoId = resultados[1][0].id;
                crearLibro(titulo, estado, urlPortada, descripcion, autorId, generoId, res);
            });
        } else {
            crearLibro(titulo, estado, urlPortada, descripcion, autorId, null, res);
        }
    });
});

function crearLibro(titulo, estado, urlPortada, descripcion, autorId, generoId, res) {
    const consulta = 'INSERT INTO Libros (titulo, estado, urlPortada, descripcion, AutorId, GeneroId, detalle) VALUES (?, ?, ?, ?, ?, ?, NOW())';
    conexion.query(consulta, [titulo, estado, urlPortada, descripcion, autorId, generoId], function(error) {
        if (error) throw error;
        res.redirect('/?alerta=creado');
    });
}

// 4. RUTA: Mostrar formulario para editar un libro
app.get('/editar/:id', function(req, res) {
    const consulta = `
        SELECT l.*, a.nombre as nombreAutor, g.nombre as nombreGenero 
        FROM Libros l 
        LEFT JOIN Autores a ON l.AutorId = a.id 
        LEFT JOIN Generos g ON l.GeneroId = g.id 
        WHERE l.id = ?
    `;
    conexion.query(consulta, [req.params.id], function(error, resultado) {
        if (error) throw error;
        const libro = { ...resultado[0], Autor: { nombre: resultado[0].nombreAutor }, Genero: { nombre: resultado[0].nombreGenero } };
        res.render('editar', { libro, page: 'editar' });
    });
});

// 5. RUTA: Actualizar un libro en la BD
app.put('/editar/:id', function(req, res) {
    const { titulo, autor, fechaCreacion, descripcion, genero, estado, urlPortada } = req.body;

    const consultaAutor = `INSERT INTO Autores (nombre, fechaCreacion) VALUES (?, ?) ON DUPLICATE KEY UPDATE fechaCreacion=VALUES(fechaCreacion); SELECT id FROM Autores WHERE nombre = ?;`;
    conexion.query(consultaAutor, [autor, fechaCreacion || null, autor], function(error, resultados) {
        if (error) throw error;
        const autorId = resultados[1][0].id;

        if (genero) {
            const consultaGenero = `INSERT INTO Generos (nombre) VALUES (?) ON DUPLICATE KEY UPDATE nombre=VALUES(nombre); SELECT id FROM Generos WHERE nombre = ?;`;
            conexion.query(consultaGenero, [genero, genero], function(error, resultados) {
                if (error) throw error;
                const generoId = resultados[1][0].id;
                actualizarLibro(req.params.id, titulo, estado, urlPortada, descripcion, autorId, generoId, res);
            });
        } else {
            actualizarLibro(req.params.id, titulo, estado, urlPortada, descripcion, autorId, null, res);
        }
    });
});

function actualizarLibro(id, titulo, estado, urlPortada, descripcion, autorId, generoId, res) {
    const consulta = 'UPDATE Libros SET titulo = ?, estado = ?, urlPortada = ?, descripcion = ?, AutorId = ?, GeneroId = ? WHERE id = ?';
    conexion.query(consulta, [titulo, estado, urlPortada, descripcion, autorId, generoId, id], function(error) {
        if (error) throw error;
        res.redirect('/?alerta=actualizado');
    });
}

// 6. RUTA: Eliminar un libro de la BD
app.delete('/eliminar/:id', function(req, res) {
    const consulta = 'DELETE FROM Libros WHERE id = ?';
    conexion.query(consulta, [req.params.id], function(error) {
        if (error) throw error;
        res.redirect('/?alerta=eliminado');
    });
});

// 7. RUTA: Vista de Estadísticas
app.get('/estadisticas', function(req, res) {
    const { genero, autor } = req.query;
    
    let consultaBase = `FROM Libros l LEFT JOIN Autores a ON l.AutorId = a.id LEFT JOIN Generos g ON l.GeneroId = g.id`;
    const clausulasWhere = [];
    const parametros = [];

    if (autor) { clausulasWhere.push('a.nombre = ?'); parametros.push(autor); }
    if (genero) { clausulasWhere.push('g.nombre = ?'); parametros.push(genero); }
    if (clausulasWhere.length > 0) consultaBase += ' WHERE ' + clausulasWhere.join(' AND ');

    const consultaTotal = `SELECT COUNT(*) as total ${consultaBase}`;
    conexion.query(consultaTotal, parametros, function(error, resultadoTotal) {
        if (error) throw error;
        const totalLibros = resultadoTotal[0].total;

        const consultaConteo = `SELECT l.estado, COUNT(l.estado) as conteo ${consultaBase} GROUP BY l.estado`;
        conexion.query(consultaConteo, parametros, function(error, resultadoConteo) {
            if (error) throw error;

            const estadisticasPorEstado = resultadoConteo.map(item => ({
                ...item,
                porcentaje: totalLibros > 0 ? ((item.conteo / totalLibros) * 100).toFixed(1) : 0
            }));

            const estadisticasFinales = ['Leído', 'Pendiente', 'Leyendo'].map(estado => 
                estadisticasPorEstado.find(s => s.estado === estado) || { estado, conteo: 0, porcentaje: 0 }
            );

            res.render('estadisticas', {
                totalLibros,
                estadisticas: estadisticasFinales,
                filtroAplicado: { genero, autor }
            });
        });
    });
});

// --- INICIO DEL SERVIDOR ---
app.listen(PUERTO, function() {
    console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});