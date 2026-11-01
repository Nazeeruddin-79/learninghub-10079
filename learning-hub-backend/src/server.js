const app=require('./app'),connectDatabase=require('./config/db'),{port,nodeEnv}=require('./config/env');
async function start(){await connectDatabase();const server=app.listen(port,()=>console.log(`Learning Hub API listening at http://localhost:${port} (${nodeEnv})`));const close=signal=>{console.log(`${signal}: shutting down`);server.close(()=>process.exit(0));};process.on('SIGINT',()=>close('SIGINT'));process.on('SIGTERM',()=>close('SIGTERM'));}
start().catch(error=>{console.error('Unable to start API:',error.message);process.exit(1);});
