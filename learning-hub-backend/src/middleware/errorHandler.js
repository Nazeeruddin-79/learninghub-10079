const multer=require('multer');
exports.notFound=(req,res)=>res.status(404).json({success:false,message:`Route not found: ${req.method} ${req.originalUrl}`});
exports.errorHandler=(error,_req,res,_next)=>{
 if(error instanceof multer.MulterError) return res.status(400).json({success:false,message:error.code==='LIMIT_FILE_SIZE'?'Video exceeds the configured upload limit.':error.message});
 if(error.name==='ValidationError') return res.status(400).json({success:false,message:'Validation failed.',errors:Object.values(error.errors).map(x=>x.message)});
 if(error.code===11000) return res.status(409).json({success:false,message:'A record with this information already exists.'});
 if(error.name==='CastError') return res.status(400).json({success:false,message:'The supplied ID is invalid.'});
 if(error.message?.startsWith('Unsupported video format')) return res.status(400).json({success:false,message:error.message});
 if(process.env.NODE_ENV!=='production') console.error(error);
 const status=error.statusCode||500;
 res.status(status).json({success:false,message:status===500?'An unexpected server error occurred.':error.message});
};
