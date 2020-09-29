import {
  clearDbAndRestartCounters,
  connectMongoose,
  disconnectMongoose,
  getContext,
  createReadBook,
  createUser,
} from '../../../../test/helpers';

import * as ReadBookLoader from '../ReadBookLoader';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('ReadBookLoader', () => {
  it('should be able to load a read book', async () => {
    const user = await createUser();
    const readBook = await createReadBook();

    const context = await getContext({ user });
    const readBookObj = await ReadBookLoader.load(context, readBook._id);

    expect(readBookObj).not.toBe(null);
    expect(readBookObj!.bookId).toEqual(readBook.bookId);
    expect(readBookObj!.readPages).toEqual(readBook.readPages);
    expect(readBookObj!.bookId).toEqual(readBook.bookId);
    expect(readBookObj!.userId).toMatchObject(readBook.userId);
  });

  it('should not be able to load a read book without context.user', async () => {
    const readBook = await createReadBook();

    const context = await getContext({});
    const readBookObj = await ReadBookLoader.load(context, readBook._id);

    expect(readBookObj).toBe(null);
  });

  it('should not be able to load another user read book', async () => {
    const readBook = await createReadBook();
    const user = await createUser();

    const context = await getContext({ user });
    const readBookObj = await ReadBookLoader.load(context, readBook._id);

    expect(readBookObj).toBe(null);
  });

  it('should be able to load a list of read books', async () => {
    const user = await createUser();

    for (let i = 0; i < 11; i++) {
      await createReadBook();
    }

    const context = await getContext({ user });
    const reviewObj = await ReadBookLoader.loadReadBooks(context, {});

    expect(reviewObj).not.toBe(null);
    expect(reviewObj.count).toBe(11);
  });

  it('should be able to load only me list of read books', async () => {
    const user = await createUser();

    for (let i = 0; i < 6; i++) {
      await createReadBook();
    }

    const user2 = await createUser();
    for (let i = 0; i < 3; i++) {
      await createReadBook({ userId: user2._id });
    }

    const context = await getContext({ user });
    const reviewObj = await ReadBookLoader.loadReadBooks(context, {});

    expect(reviewObj).not.toBe(null);
    expect(reviewObj.count).toBe(6);
  });

  it('should not be able to load a list of read books without context.user', async () => {
    for (let i = 0; i < 11; i++) {
      await createReadBook();
    }

    const context = await getContext();
    const readBookObj = await ReadBookLoader.loadReadBooks(context, {});

    expect(readBookObj).not.toBe(null);
    expect(readBookObj.count).toBe(0);
  });
});
