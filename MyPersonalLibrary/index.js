const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const sequelize = require('./src/config/database');
const bookRoutes = require('./src/routes/bookRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method')); // Para soportar PUT y DELETE en formularios
app.use(express.static(path.join(__dirname, 'src/public')));

// Configuración de Vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Rutas
app.use('/', bookRoutes);

// Sincronización de Base de Datos y Servidor
sequelize.sync({ force: false }) // force: false evita borrar datos existentes
    .then(() => {
        console.log('Base de datos sincronizada');
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Error al sincronizar la base de datos:', err);
    });