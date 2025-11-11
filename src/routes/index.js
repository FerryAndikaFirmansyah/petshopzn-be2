const express = require('express');
const router = express.Router();

// Import semua routes
const authRoutes = require('./authRoutes')
const roleRoutes = require('./roleRoutes');
const userRoutes = require('./userRoutes');
const petRoutes = require('./petRoutes');
const categoryRoutes = require('./categoryRoutes');
const productRoutes = require('./productRoutes');
const orderRoutes = require('./orderRoutes');
const orderItemRoutes = require('./orderItemRoutes');
const cartRoutes = require('./cartRoutes')

// Daftarkan semua endpoint
router.use('/auth', authRoutes);
router.use('/roles', roleRoutes);
router.use('/users', userRoutes);
router.use('/pets', petRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes)
router.use('/orders', orderRoutes);
router.use('/order-items', orderItemRoutes);

module.exports = router;