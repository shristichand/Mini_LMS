const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure upload directories exist
const ensureDirs = () => {
  const base = path.join(__dirname, '..', 'uploads');
  ['images', 'videos'].forEach(dir => {
    const full = path.join(base, dir);
    if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
  });
};
ensureDirs();

const makeStorage = (subfolder) => multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads', subfolder)),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uuidv4()}${ext}`);
  }
});

// File filters
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed'), false);
};

const videoFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) cb(null, true);
  else cb(new Error('Only video files are allowed'), false);
};

// Limits (tweak via env if you like)
const IMAGE_MAX_BYTES = 5 * 1024 * 1024;    // 5 MB
const VIDEO_MAX_BYTES = 250 * 1024 * 1024;  // 250 MB

const uploadImage = multer({
  storage: makeStorage('images'),
  limits: { fileSize: IMAGE_MAX_BYTES },
  fileFilter: imageFilter
});

const uploadVideo = multer({
  storage: makeStorage('videos'),
  limits: { fileSize: VIDEO_MAX_BYTES },
  fileFilter: videoFilter
});

module.exports = { uploadImage, uploadVideo };
