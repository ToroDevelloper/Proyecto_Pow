const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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

module.exports = Book;