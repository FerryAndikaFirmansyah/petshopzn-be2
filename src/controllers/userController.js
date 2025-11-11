const { User, Role, Pet, Order } = require('../models');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({ include: ['role', 'pets', 'orders'] });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, { include: ['role', 'pets', 'orders'] });
        if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { name, email, phone, password, roleId } = req.body;
        //cek email apakah sudah ada
        const existing = await User.findOne({ where: { email } });
        if (existing) return res.status(400).json({ message: 'Email sudah terdaftar.' });
        //hash password sebelum disimpan
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({ name, email, phone, password: hashedPassword, roleId });
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
        // kalau req.body ada password → hash dulu sebelum menimpa
        if (req.body.password) {
            const bcrypt = require('bcryptjs');
            req.body.password = await bcrypt.hash(req.body.password, 10);
        }
        Object.assign(user, req.body);
        await user.save();
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

        await user.destroy();
        res.json({ message: 'User berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        // Ambil userId dari token JWT (sudah di-set oleh middleware auth)
        const userId = req.user.id;

        const user = await User.findByPk(userId, {
            include: ['role', 'pets', 'orders']
        });

        if (!user) {
            return res.status(404).json({ message: 'Profil tidak ditemukan' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin membuat Staff baru
exports.createStaff = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // Cari role Staff berdasarkan tabel Role
        const staffRole = await Role.findOne({ where: { name: 'Staff' } });
        if (!staffRole) {
            return res.status(400).json({
                success: false,
                message: 'Role Staff belum tersedia di database. Silakan tambahkan dulu di tabel Role.',
            });
        }

        // Cek apakah email sudah digunakan
        const existing = await User.findOne({ where: { email } });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Email sudah terdaftar.',
            });
        }

        // Enkripsi password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Buat user baru dengan roleId otomatis ke Staff
        const staffUser = await User.create({
            name,
            email,
            phone,
            password: hashedPassword,
            roleId: staffRole.id,
        });

        res.status(201).json({
            success: true,
            message: 'Staff baru berhasil dibuat oleh Admin.',
            data: {
                id: staffUser.id,
                name: staffUser.name,
                email: staffUser.email,
                roleId: staffRole.id,
            },
        });
    } catch (error) {
        console.error('❌ Error createStaff:', error);
        res.status(500).json({
            success: false,
            message: `Terjadi kesalahan server: ${error.message}`,
        });
    }
};