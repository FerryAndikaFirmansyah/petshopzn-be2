const express = require('express');
const router = express.Router();
const oc = require('../controllers/orderController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize')

router.use(auth);
//customer bisa lihat order
router.get('/my-orders', authorize(['Customer']), oc.getOrdersByUser);
router.get('/my-orders/:id', authorize(['Customer']), oc.getMyOrderDetail);
//customer bisa bikin order sendiri
router.post('/', authorize('Customer'), oc.createOrder);

//staff dan admin bisa lihat pesanan customer
router.get('/', authorize(['Admin', 'Staff']), oc.getAllOrders);
router.get('/:id', authorize(['Admin', 'Staff', 'Customer']), oc.getOrderById);
router.put('/:id', authorize(['Admin', 'Staff']), oc.updateOrder);
router.put('/:id/status', authorize(['Admin', 'Staff']), oc.updateOrderStatus);
router.delete('/:id', authorize('Admin'), oc.deleteOrder);

module.exports = router;