const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  upload: { type: mongoose.Schema.Types.ObjectId, ref: 'VideoUploadSession', required: true, index: true },
  index: { type: Number, required: true }, data: { type: Buffer, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }
}, { timestamps: true });
schema.index({ upload: 1, index: 1 }, { unique: true });
module.exports = mongoose.model('VideoUploadChunk', schema);
