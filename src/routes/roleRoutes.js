const express = require('express');
const router = express.Router();
const rc = require('../controllers/roleController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize')

router.use(auth);
// //sebelum ada fitur pembatasan akses
// router.get('/', rc.getAllRoles);
// router.get('/:id', rc.getRoleById);
// router.post('/', rc.createRole);
// router.put('/:id', authorize(['Admin']), rc.updateRole);
// router.delete('/:id', authorize(['Admin']), rc.deleteRole);

// setelah ada fitur pembatasan akses
router.get('/', authorize(['Admin']), rc.getAllRoles);
router.get('/:id', authorize(['Admin']), rc.getRoleById);
router.post('/', authorize(['Admin']), rc.createRole);
router.put('/:id', authorize(['Admin']), rc.updateRole);
router.delete('/:id', authorize(['Admin']), rc.deleteRole);

module.exports = router;