const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOC_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

const ensureDir = (dir) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };

const storage = (subDir) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(process.env.UPLOAD_DIR || 'uploads', subDir);
      ensureDir(dir);
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
  });

const imageFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only image files are allowed'), false);
};

const docFilter = (req, file, cb) => {
  if ([...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES].includes(file.mimetype)) cb(null, true);
  else cb(new Error('File type not allowed'), false);
};

const excelFilter = (req, file, cb) => {
  if (ALLOWED_DOC_TYPES[1] === file.mimetype || file.originalname.endsWith('.xlsx')) cb(null, true);
  else cb(new Error('Only .xlsx files are allowed'), false);
};

const maxSize = () => (parseInt(process.env.UPLOAD_MAX_SIZE_MB) || 5) * 1024 * 1024;

const uploadImage = (subDir = 'images') =>
  multer({ storage: storage(subDir), fileFilter: imageFilter, limits: { fileSize: maxSize() } });

const uploadEvidence = (subDir = 'evidence') =>
  multer({ storage: storage(subDir), fileFilter: docFilter, limits: { fileSize: maxSize() } });

const uploadExcel = () =>
  multer({ storage: multer.memoryStorage(), fileFilter: excelFilter, limits: { fileSize: 10 * 1024 * 1024 } });

module.exports = { uploadImage, uploadEvidence, uploadExcel };
