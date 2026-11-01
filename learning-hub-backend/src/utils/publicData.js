exports.publicUser = (u) => ({id:u._id,name:u.name,email:u.email,role:u.role,avatar:u.avatar || ''});
exports.publicLesson = (l, includeVideo=false) => ({
  id:l._id,courseId:l.course,title:l.title,description:l.description,order:l.order,
  durationMinutes:l.durationMinutes,isPreview:l.isPreview,videoUrl:l.videoUrl || '',
  hasUploadedVideo:Boolean(l.videoFileId || l.videoPath),...(includeVideo && (l.videoFileId || l.videoPath) ? {videoStreamUrl:`/api/lessons/${l._id}/video`} : {})
});
exports.publicQuiz = (q) => ({
  id:q._id,courseId:q.course,lessonId:q.lesson || null,title:q.title,description:q.description,
  timeLimitMinutes:q.timeLimitMinutes,passingScore:q.passingScore,
  questions:q.questions.map(x=>({id:x._id,prompt:x.prompt,options:x.options,points:x.points}))
});
