import MockDate from 'mockdate';
import { graphql } from 'graphql';
import { toGlobalId } from 'graphql-relay';

import { sanitizeTestObject } from '@booksapp/test-utils';

import { schema } from '../../../graphql/schema';

import {
  getContext,
  clearDbAndRestartCounters,
  connectMongoose,
  disconnectMongoose,
  createUser,
  createReadBook,
  resetRunningDate,
  createBook,
  gql,
} from '../../../../test/helpers';

beforeAll(connectMongoose);

beforeEach(async () => {
  await clearDbAndRestartCounters();
  MockDate.reset();
  resetRunningDate();
  jest.clearAllMocks();
});

afterAll(disconnectMongoose);

describe('ReadBook queries', () => {
  it('should get read book from node interface', async () => {
    const user = await createUser();
    const readBook = await createReadBook();

    const query = gql`
      query Q($id: ID!) {
        readBook: node(id: $id) {
          ... on ReadBook {
            id
            readPages
            book {
              name
            }
          }
        }
      }
    `;

    const rootValue = {};
    const context = await getContext({ user });
    const variables = {
      id: toGlobalId('ReadBook', readBook._id),
    };

    const result = await graphql(schema, query, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.readBook).not.toBe(null);
    expect(sanitizeTestObject(result.data)).toMatchSnapshot();
  });

  it('should not get read book without user', async () => {
    const readBook = await createReadBook();

    const query = gql`
      query Q($id: ID!) {
        readBook: node(id: $id) {
          ... on ReadBook {
            readPages
            book {
              name
            }
          }
        }
      }
    `;

    const rootValue = {};
    const context = await getContext();
    const variables = {
      id: toGlobalId('ReadBook', readBook._id),
    };

    const result = await graphql(schema, query, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.readBook).toBe(null);
  });

  it('should get null read book if isActive is false', async () => {
    const user = await createUser();
    const event = await createReadBook({ isActive: false });

    const query = gql`
      query Q($id: ID!) {
        readBook: node(id: $id) {
          ... on ReadBook {
            readPages
            book {
              name
            }
          }
        }
      }
    `;

    const rootValue = {};
    const context = await getContext({ user });
    const variables = {
      id: toGlobalId('ReadBook', event._id),
    };

    const result = await graphql(schema, query, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.readBook).toBe(null);
  });

  it('should get null read book if removedAt exists', async () => {
    const user = await createUser();
    const event = await createReadBook({ removedAt: new Date() });

    const query = gql`
      query Q($id: ID!) {
        readBook: node(id: $id) {
          ... on ReadBook {
            readPages
            book {
              name
            }
          }
        }
      }
    `;

    const rootValue = {};
    const context = await getContext({ user });
    const variables = {
      id: toGlobalId('ReadBook', event._id),
    };

    const result = await graphql(schema, query, rootValue, context, variables);
    expect(result.errors).toBeUndefined();
    expect(result.data?.readBook).toBe(null);
  });

  it('should query a connection of read books', async () => {
    const user = await createUser();

    for (let i = 0; i < 6; i++) {
      await createReadBook();
    }

    const query = gql`
      query Q {
        readBooks(first: 5) {
          edges {
            node {
              id
              readPages
              book {
                name
              }
            }
          }
        }
      }
    `;

    const rootValue = {};
    const context = await getContext({ user });
    const variables = {};

    const result = await graphql(schema, query, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.readBooks).not.toBe(null);
    expect(result.data?.readBooks.edges.length).toBe(5);
    expect(sanitizeTestObject(result.data)).toMatchSnapshot();
  });

  it('should query a null connection of read books with there is no user on ctx', async () => {
    for (let i = 0; i < 6; i++) {
      await createReadBook();
    }

    const query = gql`
      query Q {
        readBooks(first: 5) {
          edges {
            node {
              id
              readPages
              book {
                name
              }
            }
          }
        }
      }
    `;

    const rootValue = {};
    const context = await getContext();
    const variables = {};

    const result = await graphql(schema, query, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.readBooks).not.toBe(null);
    expect(result.data?.readBooks.edges.length).toBe(0);
  });

  it('should query a connection of read books with orderBy filter', async () => {
    const user = await createUser();

    const readBook1 = await createReadBook({ readPages: 5 });
    const readBook2 = await createReadBook({ readPages: 3 });
    const readBook3 = await createReadBook({ readPages: 200 });

    const query = gql`
      query Q($filters: ReadBookFilters) {
        readBooks(filters: $filters) {
          edges {
            node {
              id
              readPages
              book {
                name
              }
            }
          }
        }
      }
    `;

    const rootValue = {};
    const context = await getContext({ user });
    const variables = {
      filters: {
        orderBy: { sort: 'CREATED_AT', direction: 'ASC' },
      },
    };

    const result = await graphql(schema, query, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.readBooks).not.toBe(null);
    expect(result.data?.readBooks.edges.length).toBe(3);
    expect(result.data?.readBooks.edges[0].node.readPages).toBe(readBook1.readPages);
    expect(result.data?.readBooks.edges[1].node.readPages).toBe(readBook2.readPages);
    expect(result.data?.readBooks.edges[2].node.readPages).toBe(readBook3.readPages);
    expect(sanitizeTestObject(result.data)).toMatchSnapshot();
  });

  it('should query a connection of finished read books', async () => {
    const user = await createUser();

    for (let i = 1; i < 4; i++) {
      const book = await createBook({ pages: i * 2 });
      await createReadBook({ bookId: book._id, readPages: i });
    }

    for (let i = 1; i < 11; i++) {
      const book = await createBook({ pages: i });
      await createReadBook({ bookId: book._id, readPages: i });
    }

    const query = gql`
      query Q($filters: ReadBookFilters) {
        readBooks(filters: $filters) {
          edges {
            node {
              id
              readPages
              book {
                name
              }
            }
          }
        }
      }
    `;

    const rootValue = {};
    const context = await getContext({ user });
    const variables = {
      filters: {
        finished: true,
      },
    };

    const result = await graphql(schema, query, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.readBooks).not.toBe(null);
    expect(result.data?.readBooks.edges.length).toBe(10);
    expect(sanitizeTestObject(result.data)).toMatchSnapshot();
  });

  it('should query a connection of unfinished read books', async () => {
    const user = await createUser();

    for (let i = 1; i < 7; i++) {
      const book = await createBook({ pages: i * 2 });
      await createReadBook({ bookId: book._id, readPages: i });
    }

    for (let i = 1; i < 3; i++) {
      const book = await createBook({ pages: i });
      await createReadBook({ bookId: book._id, readPages: i });
    }

    const query = gql`
      query Q($filters: ReadBookFilters) {
        readBooks(filters: $filters) {
          edges {
            node {
              id
              readPages
              book {
                name
              }
            }
          }
        }
      }
    `;

    const rootValue = {};
    const context = await getContext({ user });
    const variables = {
      filters: {
        finished: false,
      },
    };

    const result = await graphql(schema, query, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.readBooks).not.toBe(null);
    expect(result.data?.readBooks.edges.length).toBe(6);
    expect(sanitizeTestObject(result.data)).toMatchSnapshot();
  });
});
