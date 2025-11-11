const { Pet, User } = require('../models');

exports.getAllPets = async (req, res) => {
    try {
        const pets = await Pet.findAll({ include: ['owner'] });
        res.json(pets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPetById = async (req, res) => {
    try {
        const pet = await Pet.findByPk(req.params.id, { include: ['owner'] });
        if (!pet) return res.status(404).json({ message: 'Pet tidak ditemukan' });
        res.json(pet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createPet = async (req, res) => {
    try {
        const { name, species, age, userId } = req.body;
        const pet = await Pet.create({ name, species, age, userId });
        res.status(201).json(pet);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updatePet = async (req, res) => {
    try {
        const pet = await Pet.findByPk(req.params.id);
        if (!pet) return res.status(404).json({ message: 'Pet tidak ditemukan' });

        Object.assign(pet, req.body);
        await pet.save();
        res.json(pet);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deletePet = async (req, res) => {
    try {
        const pet = await Pet.findByPk(req.params.id);
        if (!pet) return res.status(404).json({ message: 'Pet tidak ditemukan' });

        await pet.destroy();
        res.json({ message: 'Pet berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
