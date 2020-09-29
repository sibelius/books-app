import { GraphQLNonNull, GraphQLID } from 'graphql';
import { fromGlobalId, mutationWithClientMutationId } from 'graphql-relay';

import ReadBookModel from '../ReadBookModel';

import * as ReadBookLoader from '../ReadBookLoader';

import errorField from '../../../core/graphql/errorField';
import successField from '../../../core/graphql/successField';
import { LoggedGraphQLContext } from '../../../types';

type ReadBookRemoveArgs = {
  id: string;
};

const mutation = mutationWithClientMutationId({
  name: 'ReadBookRemove',
  inputFields: {
    id: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The global ReadBook id.',
    },
  },
  mutateAndGetPayload: async (args: ReadBookRemoveArgs, context: LoggedGraphQLContext) => {
    const { user, t } = context;
    const { id } = args;

    const readBook = await ReadBookModel.findOneAndUpdate(
      { _id: fromGlobalId(id).id, userId: user._id, isActive: true },
      { isActive: false },
    );

    if (!readBook) {
      return { error: t('book', 'BookNotFound') };
    }

    ReadBookLoader.clearAndPrimeCache(context, readBook._id, readBook);

    return {
      success: t('book', 'BookRemovedWithSuccess'),
      error: null,
    };
  },
  outputFields: {
    ...successField,
    ...errorField,
  },
});

export default {
  authenticatedOnly: true,
  ...mutation,
};
