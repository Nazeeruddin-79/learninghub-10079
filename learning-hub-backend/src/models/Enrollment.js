const mongoose=require('mongoose');
const schema=new mongoose.Schema({
 student:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},
 course:{type:mongoose.Schema.Types.ObjectId,ref:'Course',required:true,index:true},
 status:{type:String,enum:['active','completed','cancelled'],default:'active'},enrolledAt:{type:Date,default:Date.now}
},{timestamps:true});
schema.index({student:1,course:1},{unique:true});
module.exports=mongoose.model('Enrollment',schema);
