const { execSync } = require('child_process');
const path = require('path');

console.log('\n=================================');
console.log('🚀 RUNNING ALL SEEDERS');
console.log('=================================\n');

const seeders = [
  'admin.seeder.js',
  'roles.seeder.js'
];

for (const seeder of seeders) {
  console.log(`\n📦 Running ${seeder}...`);
  try {
    execSync(`node ${path.join(__dirname, seeder)}`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`❌ Failed to run ${seeder}`);
    process.exit(1);
  }
}

console.log('\n=================================');
console.log('✅ ALL SEEDERS COMPLETED SUCCESSFULLY!');
console.log('=================================\n');