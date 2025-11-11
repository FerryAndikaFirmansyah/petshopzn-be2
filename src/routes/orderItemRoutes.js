const express = require('express');
const router = express.Router();
const oic = require('../controllers/orderItemController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize')

router.use(auth);
router.get('/', authorize(['Admin', 'Staff']), oic.getAllOrderItem);
router.get('/:id', oic.getOrderItemById);
router.post('/', authorize('Customer'), oic.createOrderItem);
router.put('/:id', authorize(['Admin', 'Staff']), oic.updateOrderItem);
router.delete('/:id', authorize('Admin'), oic.deleteOrderItem);

module.exports = router;