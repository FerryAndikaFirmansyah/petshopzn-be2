const { Role } = require('../models');

exports.getAllRoles = async (req, res) => {
    try {
        const roles = await Role.findAll();
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getRoleById = async (req, res) => {
    try {
        const role = await Role.findByPk(req.params.id);
        if (!role) return res.status(404).json({ message: 'Role tidak ditemukan' });
        res.json(role);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createRole = async (req, res) => {
    try {
        const { name } = req.body;
        const role = await Role.create({ name });
        res.status(201).json(role);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateRole = async (req, res) => {
    try {
        const { name } = req.body;
        const role = await Role.findByPk(req.params.id);
        if (!role) return res.status(404).json({ message: 'Role tidak ditemukan' });
        role.name = name;
        await role.save();
        res.json(role);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteRole = async (req, res) => {
    try {
        const role = await Role.findByPk(req.params.id);
        if (!role) return res.status(404).json({ message: 'Role tidak ditemukan' });
        await role.destroy();
        res.json({ message: 'Role berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
