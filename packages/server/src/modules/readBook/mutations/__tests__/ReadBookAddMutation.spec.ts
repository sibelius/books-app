import { graphql } from 'graphql';
import { toGlobalId } from 'graphql-relay';

import { schema } from '../../../../graphql/schema';

import {
  clearDbAndRestartCounters,
  connectMongoose,
  createBook,
  createUser,
  disconnectMongoose,
  getContext,
  gql,
} from '../../../../../test/helpers';
import { PLATFORM } from '../../../../common/utils';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('ReadBookAddMutation', () => {
  it('should create a readBook', async () => {
    const user = await createUser();
    const book = await createBook();

    const mutation = gql`
      mutation M($input: ReadBookAddInput!) {
        ReadBookAdd(input: $input) {
          readBookEdge {
            node {
              id
              readPages
              book {
                name
              }
            }
          }
          error
        }
      }
    `;

    const variables = {
      input: {
        bookId: toGlobalId('Book', book._id),
      },
    };
    const rootValue = {};
    const context = await getContext({ user, appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReadBookAdd.error).toBe(null);
    expect(result.data?.ReadBookAdd.readBookEdge).not.toBe(null);
    expect(result.data?.ReadBookAdd.readBookEdge.node.readPages).toBe(1);
    expect(result.data?.ReadBookAdd.readBookEdge.node.book.name).toBe(book.name);
  });

  it('should not create a readBook without user', async () => {
    const book = await createBook();

    const mutation = gql`
      mutation M($input: ReadBookAddInput!) {
        ReadBookAdd(input: $input) {
          readBookEdge {
            node {
              id
              readPages
              book {
                name
              }
            }
          }
          error
        }
      }
    `;

    const variables = {
      input: {
        bookId: toGlobalId('Book', book._id),
      },
    };
    const rootValue = {};
    const context = await getContext({ appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReadBookAdd.error).toBe('Unauthorized');
    expect(result.data?.ReadBookAdd.readBookEdge).toBe(null);
  });

  it('should not create a readBook with invalid book id', async () => {
    const user = await createUser();

    const mutation = gql`
      mutation M($input: ReadBookAddInput!) {
        ReadBookAdd(input: $input) {
          readBookEdge {
            node {
              id
              readPages
              book {
                name
              }
            }
          }
          error
        }
      }
    `;

    const variables = {
      input: {
        bookId: toGlobalId('Book', user._id),
      },
    };
    const rootValue = {};
    const context = await getContext({ user, appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReadBookAdd.error).toBe('The book id is invalid.');
    expect(result.data?.ReadBookAdd.readBookEdge).toBe(null);
  });
});
