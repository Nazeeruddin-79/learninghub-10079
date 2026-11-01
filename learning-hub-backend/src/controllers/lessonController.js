const mongoose = require('mongoose');
const { Readable } = require('stream');
const { pipeline } = require('stream/promises');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const LessonProgress = require('../models/LessonProgress');
const VideoUploadSession = require('../models/VideoUploadSession');
const VideoUploadChunk = require('../models/VideoUploadChunk');
const { publicLesson } = require('../utils/publicData');
const MAX = 30 * 1024 * 1024, CHUNK = 1024 * 1024;
async function availableOrder(courseId, requested) { const exists = await Lesson.exists({ course: courseId, order: requested }); if (!exists) return requested; const last = await Lesson.findOne({ course: courseId }).sort({ order: -1 }).select('order').lean(); return (last?.order || 0) + 1; }
const bucket = () => new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'videos' });
exports.create = async (req,res) => {
 const course = await Course.findOne({_id:req.params.courseId,instructor:req.user._id});
 if(!course) return res.status(404).json({success:false,message:'Course not found or not owned by you.'});
 const data={course:course._id,title:req.body.title,description:req.body.description||'',order:await availableOrder(course._id,Number(req.body.order)),durationMinutes:Number(req.body.durationMinutes)||0,videoUrl:req.body.videoUrl||'',isPreview:req.body.isPreview==='true'||req.body.isPreview===true};
 const lesson=await Lesson.create(data); res.status(201).json({success:true,lesson:publicLesson(lesson,true)});
};
exports.startUpload = async (req,res) => {
 const course=await Course.findOne({_id:req.params.courseId,instructor:req.user._id}); if(!course)return res.status(404).json({success:false,message:'Course not found or not owned by you.'});
 const {fileName,mimeType,fileSize,title,description='',order,durationMinutes=0,isPreview=false}=req.body;
 if(!fileName||!['video/mp4','video/webm','video/quicktime','video/x-matroska'].includes(mimeType)||!Number.isInteger(fileSize)||fileSize<1||fileSize>MAX)return res.status(400).json({success:false,message:'Choose a supported video no larger than 30 MB.'});
 if(!title||String(title).trim().length<2||!Number.isInteger(Number(order))||Number(order)<1)return res.status(400).json({success:false,message:'Enter a lesson title and valid lesson order.'});
 const session=await VideoUploadSession.create({instructor:req.user._id,course:course._id,fileName,mimeType,fileSize,chunkCount:Math.ceil(fileSize/CHUNK),lessonData:{title:String(title).trim(),description,order:Number(order),durationMinutes:Number(durationMinutes)||0,isPreview:isPreview===true||isPreview==='true'}});
 res.status(201).json({success:true,uploadId:session._id,chunkSize:CHUNK,chunkCount:session.chunkCount});
};
exports.uploadChunk = async (req,res) => {
 const session=await VideoUploadSession.findOne({_id:req.params.uploadId,instructor:req.user._id}); if(!session)return res.status(404).json({success:false,message:'Upload session not found or expired.'});
 const index=Number(req.body.index); if(!req.file||!Number.isInteger(index)||index<0||index>=session.chunkCount)return res.status(400).json({success:false,message:'Invalid video chunk.'});
 const expected=index===session.chunkCount-1?session.fileSize-index*CHUNK:CHUNK; if(req.file.size!==expected)return res.status(400).json({success:false,message:'Video chunk has an unexpected size.'});
 await VideoUploadChunk.findOneAndUpdate({upload:session._id,index},{upload:session._id,index,data:req.file.buffer,expiresAt:session.expiresAt},{upsert:true,new:true});
 res.json({success:true,index});
};
exports.finishUpload = async (req,res) => {
 const session=await VideoUploadSession.findOne({_id:req.params.uploadId,instructor:req.user._id}); if(!session)return res.status(404).json({success:false,message:'Upload session not found or expired.'});
 const chunks=await VideoUploadChunk.find({upload:session._id}).sort({index:1}); if(chunks.length!==session.chunkCount||chunks.some((c,i)=>c.index!==i)||chunks.reduce((n,c)=>n+c.data.length,0)!==session.fileSize)return res.status(400).json({success:false,message:'Some video chunks are missing. Please retry the upload.'});
 session.lessonData.order = await availableOrder(session.course, session.lessonData.order);
 const b=bucket(), stream=b.openUploadStream(session.fileName,{contentType:session.mimeType,metadata:{course:session.course,instructor:session.instructor}});
 try { await pipeline(Readable.from((async function*(){for(const c of chunks)yield c.data;})()),stream); const lesson=await Lesson.create({course:session.course,...session.lessonData,videoFileId:stream.id,videoMimeType:session.mimeType,videoOriginalName:session.fileName,videoSize:session.fileSize}); await Promise.all([VideoUploadChunk.deleteMany({upload:session._id}),session.deleteOne()]); return res.status(201).json({success:true,lesson:publicLesson(lesson,true)}); }
 catch(e){try{await b.delete(stream.id)}catch{} throw e;}
};
exports.cancelUpload=async(req,res)=>{const s=await VideoUploadSession.findOne({_id:req.params.uploadId,instructor:req.user._id});if(s){await VideoUploadChunk.deleteMany({upload:s._id});await s.deleteOne();}res.json({success:true});};
exports.update=async(req,res)=>{const l=await Lesson.findById(req.params.lessonId).populate('course');if(!l||String(l.course.instructor)!==String(req.user._id))return res.status(404).json({success:false,message:'Lesson not found or not owned by you.'});['title','description','videoUrl'].forEach(k=>{if(req.body[k]!==undefined)l[k]=req.body[k]});['order','durationMinutes'].forEach(k=>{if(req.body[k]!==undefined)l[k]=Number(req.body[k])});if(req.body.isPreview!==undefined)l.isPreview=req.body.isPreview==='true'||req.body.isPreview===true;await l.save();res.json({success:true,lesson:publicLesson(l,true)});};
exports.remove=async(req,res)=>{const l=await Lesson.findById(req.params.lessonId).populate('course');if(!l||String(l.course.instructor)!==String(req.user._id))return res.status(404).json({success:false,message:'Lesson not found or not owned by you.'});if(l.videoFileId){const b=bucket();if(await b.find({_id:l.videoFileId}).hasNext())await b.delete(l.videoFileId);}await Promise.all([LessonProgress.deleteMany({lesson:l._id}),l.deleteOne()]);res.json({success:true,message:'Lesson deleted.'});};
exports.get=async(req,res)=>{const l=await Lesson.findById(req.params.lessonId);if(!l)return res.status(404).json({success:false,message:'Lesson not found.'});res.json({success:true,lesson:publicLesson(l,true)});};
exports.stream=async(req,res)=>{const l=await Lesson.findById(req.params.lessonId).populate('course');if(!l)return res.status(404).json({success:false,message:'Lesson not found.'});const owner=req.user.role==='instructor'&&String(l.course.instructor)===String(req.user._id);const enrolled=req.user.role==='student'&&await Enrollment.exists({student:req.user._id,course:l.course._id,status:{$in:['active','completed']}});if(!owner&&!l.isPreview&&!enrolled)return res.status(403).json({success:false,message:'Enroll in this course to watch this lesson.'});if(l.videoFileId){const b=bucket(),files=await b.find({_id:l.videoFileId}).toArray();if(!files.length)return res.status(404).json({success:false,message:'Uploaded video is missing.'});const size=files[0].length,range=req.headers.range;res.set({'Content-Type':l.videoMimeType||'video/mp4','Accept-Ranges':'bytes','Cache-Control':'private, no-store'});if(!range){res.set('Content-Length',size);return b.openDownloadStream(l.videoFileId).pipe(res);}const m=/bytes=(\d*)-(\d*)/.exec(range);if(!m)return res.status(416).set('Content-Range',`bytes */${size}`).end();const start=m[1]?Number(m[1]):0,end=m[2]?Math.min(Number(m[2]),size-1):size-1;if(start>end||start>=size)return res.status(416).set('Content-Range',`bytes */${size}`).end();res.status(206).set({'Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':end-start+1});return b.openDownloadStream(l.videoFileId,{start,end:end+1}).pipe(res);}if(l.videoUrl)return res.redirect(302,l.videoUrl);res.status(404).json({success:false,message:'No video added to this lesson.'});};
exports.complete=async(req,res)=>{const l=await Lesson.findById(req.params.lessonId);if(!l)return res.status(404).json({success:false,message:'Lesson not found.'});const enrolled=await Enrollment.exists({student:req.user._id,course:l.course,status:{$in:['active','completed']}});if(!enrolled)return res.status(403).json({success:false,message:'You are not enrolled in this course.'});const progress=await LessonProgress.findOneAndUpdate({student:req.user._id,lesson:l._id},{$set:{course:l.course,completed:true,completedAt:new Date()},$setOnInsert:{student:req.user._id,lesson:l._id}},{upsert:true,new:true,setDefaultsOnInsert:true});res.json({success:true,message:'Lesson marked complete.',progress});};
