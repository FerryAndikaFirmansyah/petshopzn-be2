const multer = require('multer');
const path = require('path');
require('dotenv').config();

//set up storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, process.env.UPLOAD_DIR); //directory save upload files
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + path.extname(file.originalname);
        cb(null, 'product-' + uniqueSuffix)
    }

});

const fileFilter = (req, file, cb) => {
    //accept images only
    const allowed = ['.png', '.jpg', '.jpeg', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
}
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } //5mb file size limit
});

module.exports = upload;