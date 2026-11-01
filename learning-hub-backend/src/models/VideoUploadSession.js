const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  fileName: { type: String, required: true }, mimeType: { type: String, required: true },
  fileSize: { type: Number, required: true, min: 1, max: 30 * 1024 * 1024 },
  chunkCount: { type: Number, required: true },
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', default: null },
  lessonData: { type: mongoose.Schema.Types.Mixed, required: true },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24*60*60*1000), index: { expires: 0 } }
}, { timestamps: true });
module.exports = mongoose.model('VideoUploadSession', schema);
