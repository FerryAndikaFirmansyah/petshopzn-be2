const express = require('express');
const router = express.Router();
const pc = require('../controllers/petController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

router.use(auth)
router.get('/', authorize(['Admin']), pc.getAllPets);
router.get('/:id', authorize(['Admin']), pc.getPetById);
// router.get('/my-pets', authorize('Customer'), pc.getPetsByUser);
router.post('/', authorize('Customer'), pc.createPet);
router.put('/:id', authorize('Customer'), pc.updatePet);
router.delete('/:id', authorize('Customer'), pc.deletePet);

module.exports = router;