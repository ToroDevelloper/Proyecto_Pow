const Book = require('../models/Book');

// Listar todos los libros
exports.getAllBooks = async (req, res) => {
    try {
        const books = await Book.findAll();
        res.render('index', { books });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener los libros');
    }
};

// Mostrar formulario de creación
exports.renderCreateForm = (req, res) => {
    res.render('create');
};

// Crear un nuevo libro
exports.createBook = async (req, res) => {
    try {
        await Book.create(req.body);
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al crear el libro');
    }
};

// Mostrar formulario de edición
exports.renderEditForm = async (req, res) => {
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
};

// Actualizar un libro
exports.updateBook = async (req, res) => {
    try {
        await Book.update(req.body, {
            where: { id: req.params.id }
        });
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al actualizar el libro');
    }
};

// Eliminar un libro
exports.deleteBook = async (req, res) => {
    try {
        await Book.destroy({
            where: { id: req.params.id }
        });
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al eliminar el libro');
    }
};