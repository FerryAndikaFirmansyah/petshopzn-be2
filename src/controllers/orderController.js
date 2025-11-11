const { sequelize, Order, User, OrderItem, Product } = require('../models');

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Product,
                    as: 'products',
                    through: {
                        attributes: ['quantity', 'price', 'subtotal'],
                    },
                },
            ],
            order: [['createdAt', 'DESC']],
        });

        res.json(orders);
    } catch (error) {
        console.error('getAllOrders error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [{ model: OrderItem, as: 'orderItems', include: [{ model: Product, as: 'product' }] },
            { model: User, as: 'user' }]
        });
        if (!order) return res.status(404).json({ message: 'Order tidak ditemukan' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createOrder = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { userId, payment_method, shipping_address, items } = req.body;

        if (!userId || !shipping_address || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'userId dan items wajib diisi.' });
        }

        // Ambil semua produk berdasarkan id yang dibeli
        const productIds = items.map(i => parseInt(i.productId));
        const products = await Product.findAll({ where: { id: productIds }, transaction: t });

        if (products.length === 0) {
            await t.rollback();
            return res.status(400).json({ message: 'Produk tidak ditemukan.' });
        }

        let totalQty = 0;
        let totalPrice = 0;
        const orderItemsData = [];

        // 🔹 Cek stok dan kurangi stok produk
        for (const item of items) {
            const product = products.find(p => Number(p.id) === Number(item.productId));
            if (!product) {
                await t.rollback();
                return res.status(400).json({ message: `Produk ID ${item.productId} tidak ditemukan.` });
            }

            const qty = parseInt(item.quantity);
            if (product.stock < qty) {
                await t.rollback();
                return res.status(400).json({
                    message: `Stok produk "${product.name}" tidak mencukupi. Tersisa ${product.stock}.`
                });
            }

            const price = parseFloat(product.price);
            const subtotal = qty * price;

            // Kurangi stok
            product.stock -= qty;
            await product.save({ transaction: t });

            totalQty += qty;
            totalPrice += subtotal;

            orderItemsData.push({
                productId: product.id,
                quantity: qty,
                price,
                subtotal
            });
        }

        // 🔹 Buat order baru
        const invoice = 'INV-' + Date.now();
        const order = await Order.create({
            invoice,
            payment_method,
            shipping_address,
            total_price: totalPrice,
            total_qty: totalQty,
            userId,
            status: 'Pending'
        }, { transaction: t });

        // 🔹 Simpan detail order item
        const orderItems = orderItemsData.map(i => ({ ...i, orderId: order.id }));
        await OrderItem.bulkCreate(orderItems, { transaction: t });

        await t.commit();

        // 🔹 Ambil data hasil akhir (termasuk relasi)
        const result = await Order.findByPk(order.id, {
            include: [
                { model: OrderItem, as: 'orderItems', include: [{ model: Product, as: 'product' }] },
                { model: User, as: 'user' }
            ]
        });

        res.status(201).json(result);

    } catch (error) {
        await t.rollback();
        console.error("Error createOrder:", error);
        res.status(500).json({ message: error.message || 'Terjadi kesalahan pada server.' });
    }
};

exports.updateOrder = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order tidak ditemukan' });

        // hanya field allowed ini yang diupdate
        const { payment_method } = req.body;
        if (payment_method) order.payment_method = payment_method;

        Object.assign(order, req.body);
        await order.save();
        res.json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order tidak ditemukan' });

        await order.destroy();
        res.json({ message: 'Order berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Ambil pesanan milik user yang sedang login
exports.getOrdersByUser = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { userId: req.user.id },
            include: [
                {
                    model: Product,
                    as: 'products',
                    through: { attributes: ['quantity', 'price', 'subtotal'] }, // ambil data dari pivot (OrderItem)
                },
            ],
            order: [['createdAt', 'DESC']],
        });

        res.json(orders);
    } catch (err) {
        console.error('getOrdersByUser error:', err);
        res.status(500).json({ message: err.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByPk(req.params.id);

        if (!order) return res.status(404).json({ message: 'Order tidak ditemukan' });

        await order.update({ status });
        res.json({ message: `Status order diperbarui menjadi ${status}`, data: order });
    } catch (err) {
        console.error('updateOrderStatus error:', err);
        res.status(400).json({ message: err.message });
    }
};

// Customer ambil detail satu order miliknya sendiri
exports.getMyOrderDetail = async (req, res) => {
    try {
        const order = await Order.findOne({
            where: { id: req.params.id, userId: req.user.id },
            include: [
                { model: OrderItem, as: 'orderItems', include: [{ model: Product, as: 'product' }] },
                { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
            ],
        });

        if (!order) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan untuk pengguna ini.' });
        }

        res.json(order);
    } catch (error) {
        console.error('getMyOrderDetail error:', error);
        res.status(500).json({ message: error.message });
    }
};
