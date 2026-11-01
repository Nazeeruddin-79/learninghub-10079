const mongoose=require('mongoose');
const schema=new mongoose.Schema({
 instructor:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},
 title:{type:String,required:true,trim:true,maxlength:140},
 description:{type:String,required:true,trim:true,maxlength:5000},
 category:{type:String,trim:true,default:'General',maxlength:60},
 level:{type:String,enum:['Beginner','Intermediate','Advanced'],default:'Beginner'},
 thumbnail:{type:String,default:''},status:{type:String,enum:['draft','published'],default:'draft',index:true}
},{timestamps:true});
schema.index({title:'text',description:'text',category:'text'});
module.exports=mongoose.model('Course',schema);
