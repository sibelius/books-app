import { graphql } from 'graphql';
import { toGlobalId } from 'graphql-relay';

import { schema } from '../../../../graphql/schema';

import {
  clearDbAndRestartCounters,
  connectMongoose,
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

describe('ReadBookRemoveMutation', () => {
  it('should remove a readBook', async () => {
    const user = await createUser();
    const readBook = await createReadBook();

    const mutation = gql`
      mutation M($input: ReadBookRemoveInput!) {
        ReadBookRemove(input: $input) {
          success
          error
        }
      }
    `;

    const variables = {
      input: {
        id: toGlobalId('ReadBook', readBook._id),
      },
    };
    const rootValue = {};
    const context = await getContext({ user, appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReadBookRemove.error).toBe(null);
    expect(result.data?.ReadBookRemove.success).toBe('Book removed with success.');
  });

  it('should not remove a readBook without user', async () => {
    const readBook = await createReadBook();

    const mutation = gql`
      mutation M($input: ReadBookRemoveInput!) {
        ReadBookRemove(input: $input) {
          success
          error
        }
      }
    `;

    const variables = {
      input: {
        id: toGlobalId('ReadBook', readBook._id),
      },
    };
    const rootValue = {};
    const context = await getContext({ appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReadBookRemove.error).toBe('Unauthorized');
    expect(result.data?.ReadBookRemove.success).toBe(null);
  });

  it('should not remove a readBook with invalid readBook id', async () => {
    const user = await createUser();

    const mutation = gql`
      mutation M($input: ReadBookRemoveInput!) {
        ReadBookRemove(input: $input) {
          success
          error
        }
      }
    `;

    const variables = {
      input: {
        id: toGlobalId('ReadBook', user._id),
      },
    };
    const rootValue = {};
    const context = await getContext({ user, appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReadBookRemove.error).toBe('Book not found.');
    expect(result.data?.ReadBookRemove.success).toBe(null);
  });

  it('should not remove a readBook that belongs to other user', async () => {
    const readBook = await createReadBook();
    const user = await createUser();

    const mutation = gql`
      mutation M($input: ReadBookRemoveInput!) {
        ReadBookRemove(input: $input) {
          success
          error
        }
      }
    `;

    const variables = {
      input: {
        id: toGlobalId('ReadBook', readBook._id),
      },
    };
    const rootValue = {};
    const context = await getContext({ user, appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReadBookRemove.error).toBe('Book not found.');
    expect(result.data?.ReadBookRemove.success).toBe(null);
  });

  it('should not remove a readBook that is not active', async () => {
    const user = await createUser();
    const readBook = await createReadBook({ isActive: false });

    const mutation = gql`
      mutation M($input: ReadBookRemoveInput!) {
        ReadBookRemove(input: $input) {
          success
          error
        }
      }
    `;

    const variables = {
      input: {
        id: toGlobalId('ReadBook', readBook._id),
      },
    };
    const rootValue = {};
    const context = await getContext({ user, appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReadBookRemove.error).toBe('Book not found.');
    expect(result.data?.ReadBookRemove.success).toBe(null);
  });
});
