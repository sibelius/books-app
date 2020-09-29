import { GraphQLNonNull, GraphQLID } from 'graphql';
import { fromGlobalId, mutationWithClientMutationId, toGlobalId } from 'graphql-relay';

import ReadBookModel from '../ReadBookModel';

import * as ReadBookLoader from '../ReadBookLoader';
import { ReadBookConnection } from '../ReadBookType';

import errorField from '../../../core/graphql/errorField';
import { LoggedGraphQLContext } from '../../../types';

import { BookLoader } from '../../../loader';

type ReadBookAddArgs = {
  bookId: string;
};

const mutation = mutationWithClientMutationId({
  name: 'ReadBookAdd',
  inputFields: {
    bookId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The book being read global id.',
    },
  },
  mutateAndGetPayload: async (args: ReadBookAddArgs, context: LoggedGraphQLContext) => {
    const { user, t } = context;
    const { bookId } = args;

    const book = await BookLoader.load(context, fromGlobalId(bookId).id);

    if (!book) {
      return { error: t('book', 'TheBookIdIsInvalid') };
    }

    const readBook = await new ReadBookModel({
      userId: user._id,
      bookId: book?._id,
      readPages: 1,
    }).save();

    return {
      id: readBook._id,
      error: null,
    };
  },
  outputFields: {
    readBookEdge: {
      type: ReadBookConnection.edgeType,
      resolve: async ({ id }, args, context) => {
        const readBook = await ReadBookLoader.load(context, id);

        if (!readBook) {
          return null;
        }

        return {
          cursor: toGlobalId('ReadBook', readBook._id),
          node: readBook,
        };
      },
    },
    ...errorField,
  },
});

export default {
  authenticatedOnly: true,
  ...mutation,
};
