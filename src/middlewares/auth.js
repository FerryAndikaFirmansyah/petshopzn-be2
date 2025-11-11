const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
require('dotenv')

module.exports = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Token tidak ditemukan' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decoded.id, { include: { model: Role, as: 'role' } });
        if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token tidak valid' });
    }
};
