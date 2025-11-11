const express = require('express');
const router = express.Router();
const pc = require('../controllers/productController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const upload = require('../middlewares/upload')

//get product di home
router.get("/public", pc.getAllProducts);

router.use(auth)
//semua role (admin,staff,customer) dapat lihat produk
router.get('/', authorize(['Admin', 'Staff', 'Customer']), pc.getAllProducts);
router.get('/:id', authorize(['Admin', 'Staff', 'Customer']), pc.getProductById);

//hanya admin yang boleh edit produk
router.post("/", authorize('Admin'), upload.single("image"), pc.createProduct);//upload gambar
router.put('/:id', authorize('Admin'), upload.single("image"), pc.updateProduct);
router.delete('/:id', authorize('Admin'), pc.deleteProduct);

module.exports = router;