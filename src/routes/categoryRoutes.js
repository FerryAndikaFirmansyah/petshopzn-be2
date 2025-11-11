const express = require('express');
const router = express.Router();
const cc = require('../controllers/categoryController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

router.use(auth)
router.get('/', cc.getAllCategories);
router.get('/:id', cc.getCategoryById);
//crud admin role
router.post('/', authorize('Admin'), cc.createCategory);
router.put('/:id', authorize('Admin'), cc.updateCategory);
router.delete('/:id', authorize('Admin'), cc.deleteCategory);

module.exports = router;