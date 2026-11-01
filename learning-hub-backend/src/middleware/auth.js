const jwt=require('jsonwebtoken'); const User=require('../models/User'); const {jwtSecret}=require('../config/env'); const asyncHandler=require('../utils/asyncHandler');
exports.protect=asyncHandler(async(req,res,next)=>{
 const [scheme,token]=(req.headers.authorization||'').split(' ');
 if(scheme!=='Bearer'||!token) return res.status(401).json({success:false,message:'Please sign in to continue.'});
 let payload; try{payload=jwt.verify(token,jwtSecret);}catch{return res.status(401).json({success:false,message:'Your session is invalid or has expired.'});}
 const user=await User.findById(payload.sub); if(!user||!user.isActive) return res.status(401).json({success:false,message:'This account is unavailable.'});
 req.user=user; next();
});

exports.optionalProtect = asyncHandler(async(req,res,next)=>{
 const [scheme,token]=(req.headers.authorization||'').split(' ');
 if(scheme!=='Bearer'||!token)return next();
 try {
  const payload=jwt.verify(token,jwtSecret);
  const user=await User.findById(payload.sub);
  if(user&&user.isActive)req.user=user;
 } catch { /* Public course details remain available without a valid session. */ }
 next();
});
exports.allowRoles=(...roles)=>(req,res,next)=>req.user&&roles.includes(req.user.role)?next():res.status(403).json({success:false,message:'You do not have permission to perform this action.'});
