const mongoose=require('mongoose');
const answer=new mongoose.Schema({question:{type:mongoose.Schema.Types.ObjectId,required:true},selectedOptionIndex:{type:Number,required:true,min:0}},{_id:false});
const schema=new mongoose.Schema({
 student:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},
 course:{type:mongoose.Schema.Types.ObjectId,ref:'Course',required:true,index:true},
 quiz:{type:mongoose.Schema.Types.ObjectId,ref:'Quiz',required:true,index:true},
 answers:[answer],score:{type:Number,required:true,min:0},totalPoints:{type:Number,required:true,min:0},
 percentage:{type:Number,required:true,min:0,max:100},passed:{type:Boolean,required:true},submittedAt:{type:Date,default:Date.now}
},{timestamps:true});
module.exports=mongoose.model('QuizAttempt',schema);
