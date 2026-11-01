require('../src/config/env');const mongoose=require('mongoose'),User=require('../src/models/User');
(async()=>{const [name,emailArg,password]=process.argv.slice(2);if(!name||!emailArg||!password||password.length<8){console.error('Usage: npm run create-instructor -- "Instructor Name" instructor@example.com "StrongPassword123!" (password min 8 chars)');process.exitCode=1;return;}
await mongoose.connect(process.env.MONGODB_URI);const email=emailArg.trim().toLowerCase();if(await User.exists({email})){console.error(`Account already exists: ${email}`);process.exitCode=1;await mongoose.disconnect();return;}
const user=await User.create({name,email,password,role:'instructor'});console.log(`Instructor created: ${user.name} (${user.email})`);await mongoose.disconnect();
})().catch(async e=>{console.error('Could not create instructor:',e.message);try{await mongoose.disconnect();}catch{}process.exitCode=1;});
