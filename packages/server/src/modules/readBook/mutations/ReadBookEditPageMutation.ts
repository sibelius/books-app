import { GraphQLNonNull, GraphQLID, GraphQLInt } from 'graphql';
import { fromGlobalId, mutationWithClientMutationId, toGlobalId } from 'graphql-relay';

import ReadBookModel from '../ReadBookModel';

import * as ReadBookLoader from '../ReadBookLoader';
import { ReadBookConnection } from '../ReadBookType';

import errorField from '../../../core/graphql/errorField';
import { LoggedGraphQLContext } from '../../../types';
import { ReadBook } from '../../../models';
import { BookLoader } from '../../../loader';

type ReadBookEditPageArgs = {
  id: string;
  currentPage: number;
};

const mutation = mutationWithClientMutationId({
  name: 'ReadBookEditPage',
  inputFields: {
    id: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The global ReadBook id.',
    },
    currentPage: {
      type: GraphQLInt,
      description: 'The current user page. ex: 2',
    },
  },
  mutateAndGetPayload: async (args: ReadBookEditPageArgs, context: LoggedGraphQLContext) => {
    const { user, t } = context;
    const { id, currentPage } = args;

    const readBook = await ReadBook.findOne({ _id: fromGlobalId(id).id, userId: user._id });

    if (!readBook) {
      return { error: t('book', 'BookNotFound') };
    }

    const book = await BookLoader.load(context, readBook.bookId);

    if (!book) {
      return { error: t('book', 'BookNotFound') };
    }

    if (currentPage > book.pages) {
      return { error: t('book', 'CurrentPageShouldNotBeLargerThan') };
    }

    const updatedReadBook = await ReadBookModel.findOneAndUpdate(
      { _id: fromGlobalId(id).id, userId: user._id },
      { readPages: currentPage || 1 },
    );

    ReadBookLoader.clearAndPrimeCache(context, updatedReadBook!._id, updatedReadBook!);

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
