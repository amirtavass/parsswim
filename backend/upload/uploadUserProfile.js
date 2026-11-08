const multer = require("multer");
const path = require("path");

const allowedExtensions = /\.(jpe?g|png|gif|webp)$/i;
const allowedMimeTypes = /^image\/(jpeg|jpg|png|gif|webp)$/i;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const extname = allowedExtensions.test(path.extname(file.originalname || ""));
    const mimetype = allowedMimeTypes.test(file.mimetype || "");

    if (extname && mimetype) {
      return cb(null, true);
    }

    cb(new Error("Only image files are allowed (jpg, png, gif, webp)"));
  },
});

module.exports = upload;
