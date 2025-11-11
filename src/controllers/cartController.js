const { Cart, Product, Order, OrderItem, sequelize } = require('../models');

exports.getCart = async (req, res) => {
    try {
        const items = await Cart.findAll({
            where: { userId: req.user.id },
            include: [{ model: Product, as: 'product' }]
        });
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

//Get Cart by ID
exports.getCartById = async (req, res) => {
    try {
        const item = await Cart.findOne({
            where: { id: req.params.id, userId: req.user.id },
            include: [{ model: Product, as: 'product' }]
        });
        if (!item) return res.status(404).json({ message: 'Item tidak ditemukan' });
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

//Tambah ke Cart
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user.id;

        const product = await Product.findByPk(productId);
        if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });

        let item = await Cart.findOne({ where: { userId, productId } });

        if (item) {
            item.quantity += quantity;
            await item.save();
        } else {
            item = await Cart.create({ userId, productId, quantity });
        }

        res.json({ message: 'Produk ditambahkan ke keranjang', data: item });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

//Update jumlah item di Cart
exports.updateCart = async (req, res) => {
    try {
        const { quantity } = req.body;
        const item = await Cart.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!item) return res.status(404).json({ message: 'Item tidak ditemukan' });
        await item.update({ quantity });
        res.json({ message: 'Jumlah diperbarui', data: item });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

//Hapus item dari Cart
exports.deleteCart = async (req, res) => {
    try {
        const deleted = await Cart.destroy({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!deleted) return res.status(404).json({ message: 'Item tidak ditemukan' });
        res.json({ message: 'Item dihapus dari keranjang' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.checkout = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const userId = req.user.id;
        const { payment_method, shipping_address } = req.body;

        if (!payment_method || !shipping_address) {
            throw new Error("Metode pembayaran dan alamat pengiriman wajib diisi");
        }

        // Ambil semua item di cart user
        const cart = await Cart.findAll({
            where: { userId },
            include: [{ model: Product, as: 'product' }],
            transaction: t
        });

        if (!cart.length) throw new Error("Keranjang kosong");

        // Hitung total dan kurangi stok produk
        let totalPrice = 0;
        let totalQty = 0;

        for (const item of cart) {
            const product = item.product;
            const qty = item.quantity;

            if (product.stock < qty) {
                throw new Error(`Stok produk "${product.name}" tidak mencukupi. Tersisa ${product.stock}.`);
            }

            // Kurangi stok produk
            product.stock -= qty;
            await product.save({ transaction: t });

            totalPrice += qty * product.price;
            totalQty += qty;
        }

        // Buat order
        const order = await Order.create({
            invoice: `INV-${Date.now()}`,
            userId,
            payment_method,
            shipping_address,
            total_price: totalPrice,
            total_qty: totalQty,
            status: "Pending",
        }, { transaction: t });

        // Buat order items
        for (const item of cart) {
            await OrderItem.create({
                orderId: order.id,
                productId: item.productId,
                quantity: item.quantity,
                price: item.product.price,
                subtotal: item.quantity * item.product.price
            }, { transaction: t });
        }

        // Hapus semua item dari cart setelah checkout
        await Cart.destroy({ where: { userId }, transaction: t });

        await t.commit();

        // Ambil data order lengkap dengan relasi produk dan user
        const result = await Order.findByPk(order.id, {
            include: [
                { model: OrderItem, as: 'orderItems', include: [{ model: Product, as: 'product' }] }
            ]
        });

        res.status(201).json({ message: "Checkout berhasil", order: result });

    } catch (err) {
        await t.rollback();
        console.error('Checkout error:', err);
        res.status(400).json({ message: err.message });
    }
};