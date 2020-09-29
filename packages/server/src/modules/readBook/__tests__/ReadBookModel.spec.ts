import { sanitizeTestObject } from '@booksapp/test-utils';

import {
  clearDbAndRestartCounters,
  connectMongoose,
  disconnectMongoose,
  createUser,
  createReadBook,
  createBook,
} from '../../../../test/helpers';

import ReadBookModel, { IReadBook } from '../ReadBookModel';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('ReadBookModel', () => {
  it('should create new read book using ReadBookModel', async () => {
    const user = await createUser();
    const book = await createBook({ pages: 10 });
    const readPages = 5;

    const readBook = await new ReadBookModel({
      userId: user._id,
      bookId: book._id,
      readPages,
    }).save();

    const readBookObj = await ReadBookModel.findOne({ _id: readBook._id }).lean<IReadBook>();

    expect(readBookObj?.userId).toMatchObject(user._id);
    expect(readBookObj?.bookId).toMatchObject(book._id);
    expect(readBookObj?.readPages).toBe(readPages);
    expect(sanitizeTestObject(readBookObj)).toMatchSnapshot();
  });

  it('should create new read book using createRow', async () => {
    const user = await createUser();
    const book = await createBook({ pages: 10 });

    const readBook = await createReadBook();

    const readBookObj = await ReadBookModel.findOne({ _id: readBook._id }).lean<IReadBook>();

    expect(readBookObj?.userId).toMatchObject(user._id);
    expect(readBookObj?.bookId).toMatchObject(book._id);
    expect(readBookObj?.readPages).toBe(1);
  });

  it('should create new read book with custom properties', async () => {
    const user = await createUser();
    const book = await createBook({ pages: 10 });
    const readPages = 5;

    const readBook = await createReadBook({ userId: user._id, bookId: book._id, readPages });

    const readBookObj = await ReadBookModel.findOne({ _id: readBook._id }).lean<IReadBook>();

    expect(readBookObj?.userId).toMatchObject(user._id);
    expect(readBookObj?.bookId).toMatchObject(book._id);
    expect(readBookObj?.readPages).toBe(readPages);
  });
});
