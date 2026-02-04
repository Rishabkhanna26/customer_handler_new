import { initDatabase } from './init.js';
import { insertDummyData } from './dummy-data.js';

console.log('🚀 Initializing database...');
initDatabase().then(async () => {
  console.log('✅ Database initialized! Adding dummy data...');
  await insertDummyData();
  console.log('✅ Setup complete! Starting the app...');
  process.exit(0);
}).catch((err) => {
  console.error('❌ Failed to initialize:', err.message);
  process.exit(1);
});
