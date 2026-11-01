const mongoose=require('mongoose');
const schema=new mongoose.Schema({
 course:{type:mongoose.Schema.Types.ObjectId,ref:'Course',required:true,index:true},
 title:{type:String,required:true,trim:true,maxlength:140},description:{type:String,trim:true,default:'',maxlength:3000},
 order:{type:Number,required:true,min:1},durationMinutes:{type:Number,default:0,min:0},
 videoUrl:{type:String,trim:true,default:''},videoPath:{type:String,default:''},videoFileId:{type:mongoose.Schema.Types.ObjectId,default:null},
 videoMimeType:{type:String,default:''},videoOriginalName:{type:String,default:''},videoSize:{type:Number,default:0},
 isPreview:{type:Boolean,default:false}
},{timestamps:true});
schema.index({course:1,order:1});
module.exports=mongoose.model('Lesson',schema);
