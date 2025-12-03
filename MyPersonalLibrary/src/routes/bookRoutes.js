const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

// Rutas CRUD
router.get('/', bookController.getAllBooks);
router.get('/create', bookController.renderCreateForm);
router.post('/create', bookController.createBook);
router.get('/edit/:id', bookController.renderEditForm);
router.put('/edit/:id', bookController.updateBook);
router.delete('/delete/:id', bookController.deleteBook);

module.exports = router;