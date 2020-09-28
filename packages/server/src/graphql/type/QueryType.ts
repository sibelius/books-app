import { GraphQLObjectType, GraphQLNonNull } from 'graphql';
import { globalIdField, connectionArgs } from 'graphql-relay';

import { NodeField, NodesField } from '../../interface/NodeInterface';
import { GraphQLContext } from '../../types';

import { UserLoader, BookLoader, ReviewLoader } from '../../loader';

import UserType from '../../modules/user/UserType';

import { BookConnection } from '../../modules/book/BookType';
import BookFiltersInputType from '../../modules/book/filters/BookFiltersInputType';

import { ReviewConnection } from '../../modules/review/ReviewType';
import ReviewFiltersInputType from '../../modules/review/filters/ReviewFiltersInputType';

import StatusType from './StatusType';

export default new GraphQLObjectType<any, GraphQLContext, any>({
  name: 'Query',
  description: 'The root of all... queries',
  fields: () => ({
    id: globalIdField('Query'),
    node: NodeField,
    nodes: NodesField,
    me: {
      type: UserType,
      description: 'Me is the logged User',
      resolve: (_, __, context: GraphQLContext) => UserLoader.load(context, context.user && context.user.id),
    },
    status: {
      type: StatusType,
      resolve: () => ({}),
    },

    books: {
      type: GraphQLNonNull(BookConnection.connectionType),
      description: 'Connection to all books',
      args: {
        ...connectionArgs,
        filters: {
          type: BookFiltersInputType,
        },
      },
      resolve: (obj, args, context) => BookLoader.loadBooks(context, args),
    },

    reviews: {
      type: GraphQLNonNull(ReviewConnection.connectionType),
      description: 'Connection to all reviews',
      args: {
        ...connectionArgs,
        filters: {
          type: ReviewFiltersInputType,
        },
      },
      resolve: (obj, args, context) => ReviewLoader.loadReviews(context, args),
    },
  }),
});
