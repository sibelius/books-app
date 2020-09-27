import { graphql } from 'graphql';

import { sanitizeTestObject } from '@booksapp/test-utils';

import { schema } from '../../../../graphql/schema';

import {
  clearDbAndRestartCounters,
  connectMongoose,
  createUser,
  disconnectMongoose,
  getContext,
  gql,
} from '../../../../../test/helpers';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('MeEditMutation', () => {
  it('should edit context user', async () => {
    const user = await createUser();

    const mutation = gql`
      mutation M($input: MeEditInput!) {
        MeEdit(input: $input) {
          me {
            id
            email
            lang
          }
          error
        }
      }
    `;

    const variables = {
      input: {
        name: 'Awesome Name',
        lang: 'pt',
      },
    };
    const rootValue = {};
    const context = await getContext({ user });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.MeEdit.error).toBe(null);
    expect(sanitizeTestObject(result)).toMatchSnapshot();
  });
});
