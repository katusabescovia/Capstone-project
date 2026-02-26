const multer = require('multer');
const path = require('path');

// Where to store uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // make sure this folder exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only images (jpg, jpeg, png, webp) allowed'));
};

// / Base Multer config
const multerConfig = {
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
};

// Export two ready-to-use middlewares
module.exports = {
  singlePhoto: multer(multerConfig).single('photo'),           // for create/update material
  multipleProof: multer(multerConfig).array('proofPhotos', 5)  // for confirm-pickup
};