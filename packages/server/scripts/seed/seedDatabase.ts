/* eslint-disable no-console */

import connectDatabase from '../../src/common/database';

import { IBook } from '../../src/models';

import createUser from './createUser';
import createCategory from './createCategory';
import createBook from './createBook';
import createReview from './createReview';

const categories = [
  'Science and Nature',
  'Comedy',
  'Drama',
  'Sports',
  'Science fiction and fantasy',
  'History',
  'Mystery',
  'For kids',
  'Romance',
  'Horror',
];

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

  const books = 10; // 100 books total
  const users = 100; // 1000 users total
  const reviewsPerUser = 5; // 50000 reviews total

  for (let i = 0; i < categories.length; i++) {
    const name = categories[i];
    const category = await createCategory({ name });

    const bookArr: IBook[] = [];

    for (let i = 0; i < books; i++) {
      const book = await createBook({ categoryId: category._id });
      bookArr.push(book);
    }

    for (let i = 0; i < users; i++) {
      const user = await createUser({});

      for (let j = 0; j < bookArr.length; j++) {
        const book = bookArr[j];

        for (let l = 0; l < reviewsPerUser; l++) {
          await createReview({ bookId: book._id, userId: user._id });
        }
      }
    }
  }

  console.log(`📚 ${categories.length} Categories created\n`);
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
