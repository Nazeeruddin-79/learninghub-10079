const Course=require('../models/Course'),Lesson=require('../models/Lesson'),Enrollment=require('../models/Enrollment'),LessonProgress=require('../models/LessonProgress'),QuizAttempt=require('../models/QuizAttempt');const {publicLesson}=require('../utils/publicData');
exports.courses=async(req,res)=>{
 const es=await Enrollment.find({student:req.user._id,status:{$in:['active','completed']}}).populate('course').sort({enrolledAt:-1}),ids=es.map(e=>e.course?._id).filter(Boolean);
 const [lc,pc]=await Promise.all([Lesson.aggregate([{$match:{course:{$in:ids}}},{$group:{_id:'$course',count:{$sum:1}}}]),LessonProgress.aggregate([{$match:{student:req.user._id,completed:true,course:{$in:ids}}},{$group:{_id:'$course',count:{$sum:1}}}])]);
 const lm=new Map(lc.map(x=>[String(x._id),x.count])),pm=new Map(pc.map(x=>[String(x._id),x.count]));
 res.json({success:true,courses:es.filter(e=>e.course).map(e=>{const id=String(e.course._id),total=lm.get(id)||0,done=pm.get(id)||0;return {...e.course.toObject(),id:e.course._id,enrollmentId:e._id,enrolledAt:e.enrolledAt,totalLessons:total,completedLessons:done,progressPercent:total?Math.round(done/total*100):0};})});
};
exports.dashboard=async(req,res)=>{
 const [es,done,count,attempts]=await Promise.all([Enrollment.find({student:req.user._id,status:{$in:['active','completed']}}).populate('course','title category'),LessonProgress.countDocuments({student:req.user._id,completed:true}),QuizAttempt.countDocuments({student:req.user._id}),QuizAttempt.find({student:req.user._id}).populate('quiz','title').sort({submittedAt:-1}).limit(5)]);
 res.json({success:true,dashboard:{enrolledCourses:es.length,completedLessons:done,quizAttempts:count,recentQuizAttempts:attempts,courses:es.filter(e=>e.course).map(e=>({id:e.course._id,title:e.course.title,category:e.course.category,status:e.status}))}});
};
exports.progress=async(req,res)=>{
 const [lessonProgress,quizAttempts]=await Promise.all([LessonProgress.find({student:req.user._id}).populate('lesson','title order').populate('course','title').sort({updatedAt:-1}),QuizAttempt.find({student:req.user._id}).populate('quiz','title').populate('course','title').sort({submittedAt:-1})]);
 res.json({success:true,lessonProgress,quizAttempts});
};
exports.lessons=async(req,res)=>{
 const c=await Course.findOne({_id:req.params.courseId,status:'published'});if(!c)return res.status(404).json({success:false,message:'Course not found.'});
 if(!await Enrollment.exists({student:req.user._id,course:c._id,status:{$in:['active','completed']}}))return res.status(403).json({success:false,message:'You are not enrolled in this course.'});
 const [ls,ps]=await Promise.all([Lesson.find({course:c._id}).sort({order:1}),LessonProgress.find({student:req.user._id,course:c._id})]);const done=new Set(ps.filter(p=>p.completed).map(p=>String(p.lesson)));
 res.json({success:true,lessons:ls.map(l=>({...publicLesson(l,true),completed:done.has(String(l._id))}))});
};
