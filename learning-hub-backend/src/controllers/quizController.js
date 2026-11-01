const Course=require('../models/Course'),Lesson=require('../models/Lesson'),Quiz=require('../models/Quiz'),Enrollment=require('../models/Enrollment'),QuizAttempt=require('../models/QuizAttempt'); const {publicQuiz}=require('../utils/publicData');
exports.create=async(req,res)=>{
 const c=await Course.findOne({_id:req.params.courseId,instructor:req.user._id});if(!c)return res.status(404).json({success:false,message:'Course not found or not owned by you.'});
 if(req.body.lessonId&&!await Lesson.exists({_id:req.body.lessonId,course:c._id}))return res.status(400).json({success:false,message:'Selected lesson does not belong to this course.'});
 const q=await Quiz.create({course:c._id,lesson:req.body.lessonId||null,...req.body});res.status(201).json({success:true,quiz:publicQuiz(q)});
};
exports.mine=async(req,res)=>{
 const cs=await Course.find({instructor:req.user._id}).select('_id'),qs=await Quiz.find({course:{$in:cs.map(c=>c._id)}}).populate('course','title').sort({createdAt:-1});
 res.json({success:true,quizzes:qs.map(q=>({...publicQuiz(q),courseTitle:q.course.title}))});
};
exports.update=async(req,res)=>{
 const q=await Quiz.findById(req.params.quizId).populate('course');if(!q||String(q.course.instructor)!==String(req.user._id))return res.status(404).json({success:false,message:'Quiz not found or not owned by you.'});
 if(req.body.lessonId){const lesson=await Lesson.findOne({_id:req.body.lessonId,course:q.course._id});if(!lesson)return res.status(400).json({success:false,message:'Selected lesson does not belong to this course.'});}
 ['title','description','timeLimitMinutes','passingScore','questions'].forEach(k=>{if(req.body[k]!==undefined)q[k]=req.body[k];});
 if(req.body.lessonId!==undefined)q.lesson=req.body.lessonId||null;await q.save();res.json({success:true,quiz:publicQuiz(q)});
};
exports.remove=async(req,res)=>{
 const q=await Quiz.findById(req.params.quizId).populate('course');if(!q||String(q.course.instructor)!==String(req.user._id))return res.status(404).json({success:false,message:'Quiz not found or not owned by you.'});
 await Promise.all([QuizAttempt.deleteMany({quiz:q._id}),q.deleteOne()]);res.json({success:true,message:'Quiz deleted.'});
};
exports.forCourse=async(req,res)=>{
 const course=await Course.findOne({_id:req.params.courseId,status:'published'});
 if(!course)return res.status(404).json({success:false,message:'Course not found.'});
 const enrolled=await Enrollment.exists({student:req.user._id,course:course._id,status:{$in:['active','completed']}});
 if(!enrolled)return res.status(403).json({success:false,message:'Enroll in this course to view its quizzes.'});
 const quizzes=await Quiz.find({course:course._id}).select('title description timeLimitMinutes passingScore lesson questions createdAt').sort({createdAt:1}).lean();
 res.json({success:true,quizzes:quizzes.map(q=>({id:q._id,title:q.title,description:q.description,timeLimitMinutes:q.timeLimitMinutes,passingScore:q.passingScore,lessonId:q.lesson,questionCount:q.questions.length,createdAt:q.createdAt}))});
};
exports.get=async(req,res)=>{
 const q=await Quiz.findById(req.params.quizId);if(!q)return res.status(404).json({success:false,message:'Quiz not found.'});
 if(!await Enrollment.exists({student:req.user._id,course:q.course,status:{$in:['active','completed']}}))return res.status(403).json({success:false,message:'Enroll in this course to take the quiz.'});
 res.json({success:true,quiz:publicQuiz(q)});
};
exports.submit=async(req,res)=>{
 const q=await Quiz.findById(req.params.quizId);if(!q)return res.status(404).json({success:false,message:'Quiz not found.'});
 if(!await Enrollment.exists({student:req.user._id,course:q.course,status:{$in:['active','completed']}}))return res.status(403).json({success:false,message:'You are not enrolled in this course.'});
 if(!Array.isArray(req.body.answers))return res.status(400).json({success:false,message:'Answers must be an array.'});
 const answerMap=new Map();
 for(const a of req.body.answers){if(!a?.questionId||!Number.isInteger(a.selectedOptionIndex))return res.status(400).json({success:false,message:'Each answer needs questionId and selectedOptionIndex.'});answerMap.set(String(a.questionId),a.selectedOptionIndex);}
 let score=0;const totalPoints=q.questions.reduce((s,x)=>s+x.points,0),saved=[];
 for(const question of q.questions){const selected=answerMap.get(String(question._id));if(selected!==undefined&&(selected<0||selected>=question.options.length))return res.status(400).json({success:false,message:'An answer contains an invalid option.'});if(selected===question.correctOptionIndex)score+=question.points;if(selected!==undefined)saved.push({question:question._id,selectedOptionIndex:selected});}
 const percentage=totalPoints?Math.round(score/totalPoints*100):0,passed=percentage>=q.passingScore;
 const attempt=await QuizAttempt.create({student:req.user._id,course:q.course,quiz:q._id,answers:saved,score,totalPoints,percentage,passed});
 res.status(201).json({success:true,message:'Quiz submitted and scored.',result:{attemptId:attempt._id,score,totalPoints,percentage,passed,passingScore:q.passingScore}});
};
exports.attempts=async(req,res)=>{const attempts=await QuizAttempt.find({student:req.user._id}).populate('quiz','title').populate('course','title').sort({submittedAt:-1});res.json({success:true,attempts});};
