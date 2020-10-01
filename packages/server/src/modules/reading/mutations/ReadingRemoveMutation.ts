import { GraphQLNonNull, GraphQLID } from 'graphql';
import { fromGlobalId, mutationWithClientMutationId } from 'graphql-relay';

import ReadingModel from '../ReadingModel';

import * as ReadingLoader from '../ReadingLoader';

import errorField from '../../../core/graphql/errorField';
import successField from '../../../core/graphql/successField';
import { LoggedGraphQLContext } from '../../../types';

type ReadingRemoveArgs = {
  id: string;
};

const mutation = mutationWithClientMutationId({
  name: 'ReadingRemove',
  inputFields: {
    id: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The global Reading id.',
    },
  },
  mutateAndGetPayload: async (args: ReadingRemoveArgs, context: LoggedGraphQLContext) => {
    const { user, t } = context;
    const { id } = args;

    const reading = await ReadingModel.findOneAndUpdate(
      { _id: fromGlobalId(id).id, userId: user._id, isActive: true },
      { isActive: false },
    );

    if (!reading) {
      return { error: t('book', 'BookNotFound') };
    }

    ReadingLoader.clearAndPrimeCache(context, reading._id, reading);

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
