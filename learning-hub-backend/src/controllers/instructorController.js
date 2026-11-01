const Course=require('../models/Course'),Enrollment=require('../models/Enrollment'),QuizAttempt=require('../models/QuizAttempt');
exports.dashboard=async(req,res)=>{
 const courses=await Course.find({instructor:req.user._id}).select('_id title status'),ids=courses.map(c=>c._id);
 const [students,attempts]=await Promise.all([Enrollment.aggregate([{$match:{course:{$in:ids},status:{$in:['active','completed']}}},{$group:{_id:'$student'}},{$count:'total'}]),QuizAttempt.countDocuments({course:{$in:ids}})]);
 res.json({success:true,dashboard:{courseCount:courses.length,studentCount:students[0]?.total||0,quizAttemptCount:attempts,courses}});
};
exports.students=async(req,res)=>{
 const courses=await Course.find({instructor:req.user._id}).select('_id'),ids=courses.map(c=>c._id);
 const [es,as]=await Promise.all([Enrollment.find({course:{$in:ids},status:{$in:['active','completed']}}).populate('student','name email').populate('course','title').sort({enrolledAt:-1}),QuizAttempt.find({course:{$in:ids}}).populate('student','name email').populate('quiz','title').populate('course','title').sort({submittedAt:-1})]);
 res.json({success:true,students:es.filter(e=>e.student&&e.course).map(e=>({studentId:e.student._id,name:e.student.name,email:e.student.email,courseId:e.course._id,courseTitle:e.course.title,enrolledAt:e.enrolledAt,status:e.status})),quizResults:as.filter(a=>a.student).map(a=>({attemptId:a._id,studentName:a.student.name,studentEmail:a.student.email,courseTitle:a.course?.title||'',quizTitle:a.quiz?.title||'',score:a.score,totalPoints:a.totalPoints,percentage:a.percentage,passed:a.passed,submittedAt:a.submittedAt}))});
};
