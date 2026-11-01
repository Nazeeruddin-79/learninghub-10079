const multer = require('multer');
const allowed = new Set(['video/mp4','video/webm','video/quicktime','video/x-matroska','application/octet-stream']);
exports.videoChunkUpload = multer({
  storage: multer.memoryStorage(), limits: { fileSize: 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => allowed.has(file.mimetype) ? cb(null, true) : cb(new Error('Unsupported video format. Use MP4, WebM, MOV, or MKV.'))
}).single('chunk');
