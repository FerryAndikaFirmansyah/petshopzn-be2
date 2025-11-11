const { OrderItem, Product, Order } = require('../models');

exports.getAllOrderItem = async (req, res) => {
    try {
        const items = await OrderItem.findAll({ include: ['product', 'order'] });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getOrderItemById = async (req, res) => {
    try {
        const item = await OrderItem.findByPk(req.params.id, { include: ['product', 'order'] });
        if (!item) return res.status(404).json({ message: 'Order item tidak ditemukan' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createOrderItem = async (req, res) => {
    try {
        const { orderId, productId, quantity } = req.body;
        // basic validation
        if (!orderId || !productId || !quantity) return res.status(400).json({ message: 'orderId, productId, quantity wajib diisi.' });

        const product = await Product.findByPk(productId);
        if (!product) return res.status(404).json({ message: 'Product tidak ditemukan.' });

        const price = parseFloat(product.price);
        const subtotal = +(price * quantity).toFixed(2);

        const item = await OrderItem.create({ orderId, productId, quantity, price, subtotal });
        res.status(201).json(item);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateOrderItem = async (req, res) => {
    try {
        const item = await OrderItem.findByPk(req.params.id);
        if (!item) return res.status(404).json({ message: 'Order item tidak ditemukan' });

        const { quantity } = req.body;
        if (quantity) {
            // recalc subtotal
            item.quantity = quantity;
            item.subtotal = +(parseFloat(item.price) * quantity).toFixed(2);
        }

        Object.assign(item, req.body);
        await item.save();
        res.json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteOrderItem = async (req, res) => {
    try {
        const item = await OrderItem.findByPk(req.params.id);
        if (!item) return res.status(404).json({ message: 'Order item tidak ditemukan' });

        await item.destroy();
        res.json({ message: 'Order item berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
