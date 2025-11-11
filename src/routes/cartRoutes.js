const express = require('express');
const router = express.Router();
const cart = require('../controllers/cartController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

router.use(auth);
router.use(authorize(['Customer', 'Admin']));

router.get('/', cart.getCart);
router.get('/:id', cart.getCartById);
router.post('/', cart.addToCart);
router.put('/:id', cart.updateCart);
router.delete('/:id', cart.deleteCart);
router.post('/checkout', cart.checkout);

module.exports = router;