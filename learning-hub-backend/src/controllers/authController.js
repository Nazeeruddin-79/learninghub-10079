const {z}=require('zod'); const User=require('../models/User'); const {createAccessToken}=require('../utils/token'); const {publicUser}=require('../utils/publicData');
exports.registerSchema=z.object({name:z.string().trim().min(2).max(80),email:z.string().trim().email().max(160),password:z.string().min(8).max(72)});
exports.loginSchema=z.object({email:z.string().trim().email().max(160),password:z.string().min(1).max(72),role:z.enum(['student','instructor']).optional()});
exports.register=async(req,res)=>{
 const email=req.body.email.toLowerCase();
 if(await User.exists({email})) return res.status(409).json({success:false,message:'An account with this email already exists.'});
 const user=await User.create({...req.body,email,role:'student'});
 res.status(201).json({success:true,message:'Student account created successfully.',token:createAccessToken(user),user:publicUser(user)});
};
exports.login=async(req,res)=>{
 const user=await User.findOne({email:req.body.email.toLowerCase()}).select('+password');
 if(!user||!user.isActive||!(await user.comparePassword(req.body.password))) return res.status(401).json({success:false,message:'Invalid email or password.'});
 if(req.body.role&&user.role!==req.body.role) return res.status(403).json({success:false,message:`This account is not registered as a ${req.body.role}.`});
 res.json({success:true,message:'Signed in successfully.',token:createAccessToken(user),user:publicUser(user)});
};
exports.me=(req,res)=>res.json({success:true,user:publicUser(req.user)});
