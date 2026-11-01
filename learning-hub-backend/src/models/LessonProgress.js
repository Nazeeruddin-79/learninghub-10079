const mongoose=require('mongoose');
const schema=new mongoose.Schema({
 student:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},
 course:{type:mongoose.Schema.Types.ObjectId,ref:'Course',required:true,index:true},
 lesson:{type:mongoose.Schema.Types.ObjectId,ref:'Lesson',required:true},
 completed:{type:Boolean,default:false},completedAt:{type:Date,default:null}
},{timestamps:true});
schema.index({student:1,lesson:1},{unique:true});
module.exports=mongoose.model('LessonProgress',schema);
