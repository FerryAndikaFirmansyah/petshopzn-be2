const { Product, Category, Order } = require('../models');

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            include: ['category', 'orders'],
            order: [['createdAt', 'DESC']]
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, { include: ['category', 'orders'] });
        if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { name, price, stock, categoriesId, description } = req.body;
        const image = req.file ? req.file.filename : null; // ambil nama file hasil upload

        const product = await Product.create({
            name,
            price,
            stock,
            description,
            categoriesId,
            image, // simpan nama file di kolom image
        });

        res.status(201).json({ message: 'Produk berhasil dibuat', data: product });
    } catch (error) {
        console.error('Error createProduct:', error);
        res.status(400).json({ message: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });

        const { name, price, stock, description, categoriesId } = req.body;
        let newImage = product.image
        // jika upload gambar baru
        if (req.file) {
            // Hapus gambar lama (jika ada)
            if (product.image) {
                const oldImagePath = path.join(__dirname, '../../uploads', product.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            // Simpan nama file baru dari multer
            newImage = req.file.filename;
        }
        await product.update({ name, price, stock, description, categoriesId, image: newImage });
        await product.save();
        res.json({ message: 'Produk berhasil diperbarui', data: product });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });

        await product.destroy();
        res.json({ message: 'Produk berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
