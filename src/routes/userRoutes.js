const express = require('express');
const router = express.Router();
const uc = require('../controllers/userController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize')

router.use(auth);
router.get('/', authorize('Admin'), uc.getAllUsers);
router.get('/:id', authorize('Admin'), uc.getUserById);
//lihat profil sendiri
router.get('/me', uc.getProfile);
//crud user admin
router.post('/', authorize('Admin'), uc.createUser);
router.post('/create-staff', authorize('Admin'), uc.createStaff);
router.put('/:id', authorize('Admin'), uc.updateUser);
router.delete('/:id', authorize('Admin'), uc.deleteUser);

module.exports = router;