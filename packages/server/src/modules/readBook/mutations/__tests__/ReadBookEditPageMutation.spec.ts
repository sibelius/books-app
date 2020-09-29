import { graphql } from 'graphql';
import { toGlobalId } from 'graphql-relay';

import { schema } from '../../../../graphql/schema';

import {
  clearDbAndRestartCounters,
  connectMongoose,
  createBook,
  createReadBook,
  createUser,
  disconnectMongoose,
  getContext,
  gql,
} from '../../../../../test/helpers';
import { PLATFORM } from '../../../../common/utils';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('ReadBookEditPageMutation', () => {
  it('should edit a readBook', async () => {
    const user = await createUser();
    const book = await createBook({ pages: 10 });
    const readBook = await createReadBook();
    const currentPage = 4;

    const mutation = gql`
      mutation M($input: ReadBookEditPageInput!) {
        ReadBookEditPage(input: $input) {
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
        id: toGlobalId('ReadBook', readBook._id),
        currentPage,
      },
    };
    const rootValue = {};
    const context = await getContext({ user, appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReadBookEditPage.error).toBe(null);
    expect(result.data?.ReadBookEditPage.readBookEdge).not.toBe(null);
    expect(result.data?.ReadBookEditPage.readBookEdge.node.readPages).toBe(currentPage);
    expect(result.data?.ReadBookEditPage.readBookEdge.node.book.name).toBe(book.name);
  });

  it('should not edit a readBook without user', async () => {
    await createBook({ pages: 10 });
    const readBook = await createReadBook();
    const currentPage = 4;

    const mutation = gql`
      mutation M($input: ReadBookEditPageInput!) {
        ReadBookEditPage(input: $input) {
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
        id: toGlobalId('ReadBook', readBook._id),
        currentPage,
      },
    };
    const rootValue = {};
    const context = await getContext({ appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReadBookEditPage.error).toBe('Unauthorized');
    expect(result.data?.ReadBookEditPage.readBookEdge).toBe(null);
  });

  it('should not edit a readBook with invalid readBook id', async () => {
    const user = await createUser();
    const currentPage = 4;

    const mutation = gql`
      mutation M($input: ReadBookEditPageInput!) {
        ReadBookEditPage(input: $input) {
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
        id: toGlobalId('ReadBook', user._id),
        currentPage,
      },
    };
    const rootValue = {};
    const context = await getContext({ user, appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReadBookEditPage.error).toBe('Book not found.');
    expect(result.data?.ReadBookEditPage.readBookEdge).toBe(null);
  });

  it('should not edit a readBook that belongs to other user', async () => {
    await createBook({ pages: 10 });
    const readBook = await createReadBook();
    const user = await createUser();
    const currentPage = 4;

    const mutation = gql`
      mutation M($input: ReadBookEditPageInput!) {
        ReadBookEditPage(input: $input) {
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
        id: toGlobalId('ReadBook', readBook._id),
        currentPage,
      },
    };
    const rootValue = {};
    const context = await getContext({ user, appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReadBookEditPage.error).toBe('Book not found.');
    expect(result.data?.ReadBookEditPage.readBookEdge).toBe(null);
  });

  it('should not edit a readBook if the read pages is bigger than the book size', async () => {
    const user = await createUser();
    await createBook({ pages: 2 });
    const readBook = await createReadBook();
    const currentPage = 4;

    const mutation = gql`
      mutation M($input: ReadBookEditPageInput!) {
        ReadBookEditPage(input: $input) {
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
        id: toGlobalId('ReadBook', readBook._id),
        currentPage,
      },
    };
    const rootValue = {};
    const context = await getContext({ user, appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReadBookEditPage.error).toBe(
      'Current page should not be larger than the number of pages in the book.',
    );
    expect(result.data?.ReadBookEditPage.readBookEdge).toBe(null);
  });
});
