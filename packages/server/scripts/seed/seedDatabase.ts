/* eslint-disable no-console */

import connectDatabase from '../../src/common/database';

import { createUser } from './createUser';

const runScript = async () => {
  console.log(`⏳ Seeding...\n`);

  try {
    await createUser({
      name: 'Jean',
      surname: 'Leonco',
      password: '123456',
      email: { email: 'jean@booksapp.com', wasVerified: true },
    });
    console.log('👤 Jean User created\n');
  } catch (err) {
    console.log('⚠️ Jean User already created:', err);
  }
};

(async () => {
  try {
    await connectDatabase();
  } catch (error) {
    console.error('\n❌ Could not connect to database');
    process.exit(1);
  }

  try {
    await runScript();
    console.log('\n✔️  Database seed completed');
  } catch (err) {
    console.log('err:', err);
    process.exit(1);
  }
  process.exit(0);
})();
