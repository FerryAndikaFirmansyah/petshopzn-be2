const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const { User, Role } = require('../models');

exports.register = async (req, res) => {
    try {
        const { name, email, phone, password, roleId } = req.body;

        const existing = await User.findOne({ where: { email } });
        if (existing) return res.status(400).json({ message: 'Email sudah terdaftar.' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const roleAdmin = await Role.findOne({ where: { name: 'Admin' } });
        const roleCustomer = await Role.findOne({ where: { name: 'Customer' } });
        const roleStaff = await Role.findOne({ where: { name: 'Staff' } });

        if (!roleAdmin || !roleCustomer || !roleStaff) {
            return res.status(400).json({
                message: 'Role belum lengkap. Pastikan ada Admin, Staff, dan Customer di tabel Role.',
            });
        }

        let finalRoleId = roleCustomer.id; // default = Customer

        // --- Role ADMIN ---
        if (roleId === roleAdmin.id) {
            if (['ferry', 'admin'].includes(name.toLowerCase())) {
                finalRoleId = roleAdmin.id;
            } else {
                return res.status(403).json({
                    message: 'Hanya pengguna bernama Ferry atau Admin yang bisa menjadi Admin.',
                });
            }
        }

        // --- Role STAFF ---
        else if (roleId === roleStaff.id) {
            // misalnya hanya orang yang email-nya pakai domain internal boleh jadi staff
            if (email.endsWith('@staff.com')) {
                finalRoleId = roleStaff.id;
            } else {
                return res.status(403).json({
                    message: 'Hanya email internal (contoh: @staff.com) yang dapat didaftarkan sebagai Staff.',
                });
            }
        }

        // --- Buat User ---
        const user = await User.create({
            name,
            email,
            phone,
            password: hashedPassword,
            roleId: finalRoleId,
        });

        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil.',
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role:
                    finalRoleId === roleAdmin.id
                        ? 'Admin'
                        : finalRoleId === roleStaff.id
                            ? 'Staff'
                            : 'Customer',
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({
            where: { email },
            include: { model: Role, as: 'role' },
        });

        if (!user) return res.status(404).json({ message: 'User tidak ditemukan.' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ message: 'Password salah.' });

        // Buat token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role.name },
            process.env.JWT_SECRET || 'secret123',
            { expiresIn: '30d' }
        );

        res.status(200).json({
            success: true,
            message: 'Login berhasil.',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role.name,
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};