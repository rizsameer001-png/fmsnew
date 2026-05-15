// src/scripts/testEnv.js
require('dotenv').config();
console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ EXISTS' : '❌ MISSING');
console.log('MONGO_URI value:', process.env.MONGO_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ EXISTS' : '❌ MISSING');