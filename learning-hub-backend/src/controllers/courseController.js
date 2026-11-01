const Course=require('../models/Course'),Lesson=require('../models/Lesson'),Enrollment=require('../models/Enrollment'),LessonProgress=require('../models/LessonProgress'),Quiz=require('../models/Quiz'),QuizAttempt=require('../models/QuizAttempt');
const {publicLesson}=require('../utils/publicData');
exports.list=async(req,res)=>{
 const filter={status:'published'}; if(req.query.category)filter.category=req.query.category; if(req.query.level)filter.level=req.query.level; if(req.query.search)filter.$text={$search:String(req.query.search).slice(0,100)};
 const courses=await Course.find(filter).populate('instructor','name').sort({createdAt:-1}).lean();
 const ids=courses.map(x=>x._id); const counts=await Lesson.aggregate([{$match:{course:{$in:ids}}},{$group:{_id:'$course',count:{$sum:1}}}]); const map=new Map(counts.map(x=>[String(x._id),x.count]));
 res.json({success:true,courses:courses.map(c=>({...c,id:c._id,instructorName:c.instructor?.name||'Instructor',lessonCount:map.get(String(c._id))||0}))});
};
exports.get=async(req,res)=>{
 const c=await Course.findOne({_id:req.params.courseId,status:'published'}).populate('instructor','name');
 if(!c)return res.status(404).json({success:false,message:'Course not found.'});
 const lessons=await Lesson.find({course:c._id}).sort({order:1});
 const enrolled=req.user?.role==='student'&&await Enrollment.exists({student:req.user._id,course:c._id,status:{$in:['active','completed']}});
 const owner=req.user?.role==='instructor'&&String(c.instructor._id)===String(req.user._id);
 res.json({success:true,course:{...c.toObject(),id:c._id,instructorName:c.instructor.name,isEnrolled:Boolean(enrolled)},lessons:lessons.map(l=>({...publicLesson(l),isLocked:!owner&&!enrolled&&!l.isPreview}))});
};
exports.mine=async(req,res)=>{
 const courses=await Course.find({instructor:req.user._id}).sort({updatedAt:-1}).lean(), ids=courses.map(c=>c._id);
 const [lc,ec]=await Promise.all([
  Lesson.aggregate([{$match:{course:{$in:ids}}},{$group:{_id:'$course',count:{$sum:1}}}]),
  Enrollment.aggregate([{$match:{course:{$in:ids},status:{$in:['active','completed']}}},{$group:{_id:'$course',count:{$sum:1}}}])
 ]);
 const lm=new Map(lc.map(x=>[String(x._id),x.count])),em=new Map(ec.map(x=>[String(x._id),x.count]));
 res.json({success:true,courses:courses.map(c=>({...c,id:c._id,lessonCount:lm.get(String(c._id))||0,studentCount:em.get(String(c._id))||0}))});
};
exports.create=async(req,res)=>{
 const c=await Course.create({...req.body,instructor:req.user._id,status:req.body.status==='published'?'published':'draft'});
 res.status(201).json({success:true,course:c});
};
exports.update=async(req,res)=>{
 const fields=['title','description','category','level','thumbnail','status'],updates={}; fields.forEach(k=>{if(req.body[k]!==undefined)updates[k]=req.body[k];});
 const c=await Course.findOneAndUpdate({_id:req.params.courseId,instructor:req.user._id},updates,{new:true,runValidators:true});
 if(!c)return res.status(404).json({success:false,message:'Course not found or not owned by you.'});
 res.json({success:true,course:c});
};
exports.remove=async(req,res)=>{
 const c=await Course.findOne({_id:req.params.courseId,instructor:req.user._id}); if(!c)return res.status(404).json({success:false,message:'Course not found or not owned by you.'});
 const fs=require('fs'),mongoose=require('mongoose'),lessons=await Lesson.find({course:c._id}); lessons.forEach(l=>{if(l.videoPath&&fs.existsSync(l.videoPath))fs.unlinkSync(l.videoPath);}); const bucket=new mongoose.mongo.GridFSBucket(mongoose.connection.db,{bucketName:'videos'}); await Promise.all(lessons.filter(l=>l.videoFileId).map(async l=>{try{await bucket.delete(l.videoFileId)}catch(error){if(error.codeName!=='FileNotFound'&&error.code!==26)throw error}}));
 await Promise.all([Lesson.deleteMany({course:c._id}),Enrollment.deleteMany({course:c._id}),LessonProgress.deleteMany({course:c._id}),QuizAttempt.deleteMany({course:c._id}),Quiz.deleteMany({course:c._id})]); await c.deleteOne();
 res.json({success:true,message:'Course and related learning records deleted.'});
};
exports.enroll=async(req,res)=>{
 const c=await Course.findOne({_id:req.params.courseId,status:'published'}); if(!c)return res.status(404).json({success:false,message:'Published course not found.'});
 const enrollment=await Enrollment.findOneAndUpdate({student:req.user._id,course:c._id},{$setOnInsert:{student:req.user._id,course:c._id,status:'active',enrolledAt:new Date()}},{upsert:true,new:true,setDefaultsOnInsert:true});
 res.json({success:true,message:'You are enrolled in this course.',enrollment});
};
