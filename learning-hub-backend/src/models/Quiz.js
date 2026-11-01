const mongoose=require('mongoose');
const question=new mongoose.Schema({
 prompt:{type:String,required:true,trim:true,maxlength:1000},
 options:{type:[{type:String,trim:true,maxlength:300}],required:true,validate:v=>v.length>=2&&v.length<=6},
 correctOptionIndex:{type:Number,required:true,min:0},points:{type:Number,default:1,min:1,max:100}
});
const schema=new mongoose.Schema({
 course:{type:mongoose.Schema.Types.ObjectId,ref:'Course',required:true,index:true},
 lesson:{type:mongoose.Schema.Types.ObjectId,ref:'Lesson',default:null},
 title:{type:String,required:true,trim:true,maxlength:140},description:{type:String,trim:true,default:'',maxlength:2000},
 timeLimitMinutes:{type:Number,default:0,min:0,max:300},passingScore:{type:Number,default:60,min:0,max:100},
 questions:{type:[question],validate:v=>v.length>0&&v.length<=100}
},{timestamps:true});
module.exports=mongoose.model('Quiz',schema);
